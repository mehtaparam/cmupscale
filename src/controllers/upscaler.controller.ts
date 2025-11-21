import { Request, Response } from 'express';
import * as tf from '@tensorflow/tfjs-node';

// Use require for modules with tricky type resolutions
const Upscaler = require('upscaler/node');

// Import all available models
const x2Model = require('@upscalerjs/esrgan-thick/2x');
const x3Model = require('@upscalerjs/esrgan-thick/3x');
const x4Model = require('@upscalerjs/esrgan-thick/4x');
const x8Model = require('@upscalerjs/esrgan-thick/8x');

// Model map for easy selection
const MODEL_MAP = {
  2: x2Model,
  3: x3Model,
  4: x4Model,
  8: x8Model,
};

// Type for valid model scales
type ModelScale = 2 | 3 | 4 | 8;

// Request interface
interface UpscaleRequest {
  image: string; // base64 string (with or without  prefix)
  model?: ModelScale; // optional: 2, 3, 4, or 8 (default: 4)
}

// Response interface
interface UpscaleResponse {
  success: boolean;
  upscaledImage?: string; // base64 string
  message?: string;
  error?: string;
  metadata?: {
    originalSize: { width: number; height: number };
    upscaledSize: { width: number; height: number };
    modelUsed: ModelScale;
    processingTime: number; // in milliseconds
    memoryUsed?: string; // in MB
  };
}

// Helper function to extract base64 data from data URI
function extractBase64Data(dataUri: string): string {
  if (dataUri.startsWith('')) {
    // Remove image/png;base64, or similar prefix
    return dataUri.split(',')[1];
  }
  return dataUri;
}

// Helper function to decode base64 to tensor
async function base64ToTensor(base64String: string): Promise<tf.Tensor3D> {
  const pureBase64 = extractBase64Data(base64String);
  const imageBuffer = Buffer.from(pureBase64, 'base64');
  const imageTensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;
  return imageTensor;
}

// Helper function to encode tensor to base64
async function tensorToBase64(
  tensor: tf.Tensor3D,
  format: 'png' | 'jpeg' = 'png'
): Promise<string> {
  const imageUint8Array =
    format === 'png'
      ? await tf.node.encodePng(tensor)
      : await tf.node.encodeJpeg(tensor, 'rgb', 95);

  // Convert Uint8Array to Buffer before encoding to base64
  const base64String = Buffer.from(imageUint8Array).toString('base64');
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  return `${mimeType};base64,${base64String}`;
}

// Helper function to get upscaler instance for specific model
function getUpscaler(modelScale: ModelScale) {
  const model = MODEL_MAP[modelScale];
  if (!model) {
    throw new Error(`Invalid model scale: ${modelScale}`);
  }
  return new Upscaler({ model });
}

// Validate model scale
function isValidModelScale(scale: any): scale is ModelScale {
  return [2, 3, 4, 8].includes(scale);
}

export const upscaleImage = async (req: Request, res: Response) => {
  const startTime = Date.now();
  let imageTensor: tf.Tensor3D | null = null;
  let upscaledTensor: tf.Tensor | null = null;

  try {
    const { image, model = 4 }: UpscaleRequest = req.body;

    // Validate image
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing image field: must be a base64 string',
      } as UpscaleResponse);
    }

    // Validate model scale
    if (!isValidModelScale(model)) {
      return res.status(400).json({
        success: false,
        error: `Invalid model scale: ${model}. Must be 2, 3, 4, or 8`,
      } as UpscaleResponse);
    }

    console.log(`🖼️  Processing image upscale request with ${model}x model...`);

    // Memory before processing
    const memBefore = process.memoryUsage();
    console.log(
      `💾 Memory before: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)} MB`
    );

    // Decode base64 to tensor
    imageTensor = await base64ToTensor(image);
    const [originalHeight, originalWidth] = imageTensor.shape;
    console.log(`📐 Original size: ${originalWidth}x${originalHeight}`);

    // Optional: Add size validation for large models
    const MAX_DIMENSION_BY_MODEL: Record<ModelScale, number> = {
      2: 2048,
      3: 1536,
      4: 1024,
      8: 512,
    };

    const maxDimension = MAX_DIMENSION_BY_MODEL[model];
    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      if (imageTensor) imageTensor.dispose();
      return res.status(400).json({
        success: false,
        error: `Image too large for ${model}x model`,
        message: `Maximum dimension: ${maxDimension}px. Current: ${originalWidth}x${originalHeight}`,
      } as UpscaleResponse);
    }

    // Get upscaler with selected model
    const upscaler = getUpscaler(model);

    // Upscale the image
    upscaledTensor = await upscaler.upscale(imageTensor);
    const upscaledShape = upscaledTensor!.shape;
    const [upscaledHeight, upscaledWidth] = upscaledShape;
    console.log(`📐 Upscaled size: ${upscaledWidth}x${upscaledHeight}`);

    // Convert to base64
    const upscaledBase64 = await tensorToBase64(
      upscaledTensor as tf.Tensor3D,
      'png'
    );

    // Memory after processing
    const memAfter = process.memoryUsage();
    const memoryUsed = ((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2);
    console.log(`💾 Memory after: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Memory used: ${memoryUsed} MB`);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Processing completed in ${processingTime}ms`);

    res.json({
      success: true,
      upscaledImage: upscaledBase64,
      message: 'Image upscaled successfully',
      meta: {
        originalSize: { width: originalWidth, height: originalHeight },
        upscaledSize: { width: upscaledWidth, height: upscaledHeight },
        modelUsed: model,
        processingTime,
        memoryUsed: `${memoryUsed} MB`,
      },
    } as UpscaleResponse);
  } catch (error) {
    console.error('❌ Upscale error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upscale image',
      message: errorMessage,
    } as UpscaleResponse);
  } finally {
    // Ensure tensors are always disposed
    if (imageTensor) {
      imageTensor.dispose();
      console.log('🧹 Original tensor disposed');
    }
    if (upscaledTensor) {
      upscaledTensor.dispose();
      console.log('🧹 Upscaled tensor disposed');
    }
  }
};
