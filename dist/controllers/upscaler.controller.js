"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upscaleImage = void 0;
var tf = __importStar(require("@tensorflow/tfjs-node"));
var node_1 = __importDefault(require("upscaler/node"));
var _2x_1 = __importDefault(require("@upscalerjs/esrgan-thick/2x"));
// Initialize upscaler with better model
var upscaler = new node_1.default({
    model: _2x_1.default,
});
// Helper function to extract base64 data from data URI
function extractBase64Data(dataUri) {
    if (dataUri.startsWith('data:')) {
        // Remove image/png;base64, or similar prefix
        return dataUri.split(',')[1];
    }
    return dataUri;
}
// Helper function to decode base64 to tensor
function base64ToTensor(base64String) {
    return __awaiter(this, void 0, void 0, function () {
        var pureBase64, imageBuffer, imageTensor;
        return __generator(this, function (_a) {
            pureBase64 = extractBase64Data(base64String);
            imageBuffer = Buffer.from(pureBase64, 'base64');
            imageTensor = tf.node.decodeImage(imageBuffer, 3);
            return [2 /*return*/, imageTensor];
        });
    });
}
// Helper function to encode tensor to base64
function tensorToBase64(tensor_1) {
    return __awaiter(this, arguments, void 0, function (tensor, format) {
        var imageBuffer, _a, base64String, mimeType;
        if (format === void 0) { format = 'png'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(format === 'png')) return [3 /*break*/, 2];
                    return [4 /*yield*/, tf.node.encodePng(tensor)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, tf.node.encodeJpeg(tensor, undefined, 95)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    imageBuffer = _a;
                    base64String = imageBuffer.toString('base64');
                    mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                    return [2 /*return*/, "data:".concat(mimeType, ";base64,").concat(base64String)];
            }
        });
    });
}
var upscaleImage = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, imageTensor, upscaledTensor, image, _a, originalHeight, originalWidth, upscaledShape, upscaledHeight, upscaledWidth, upscaledBase64, processingTime, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                startTime = Date.now();
                imageTensor = null;
                upscaledTensor = null;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                image = req.body.image;
                // Validate input
                if (!image) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required field: image (base64 string)',
                        })];
                }
                if (typeof image !== 'string') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid image format: must be a base64 string',
                        })];
                }
                console.log('🖼️  Processing image upscale request...');
                return [4 /*yield*/, base64ToTensor(image)];
            case 2:
                // Convert base64 to tensor
                imageTensor = _b.sent();
                _a = imageTensor.shape, originalHeight = _a[0], originalWidth = _a[1];
                console.log("\uD83D\uDCD0 Original size: ".concat(originalWidth, "x").concat(originalHeight));
                return [4 /*yield*/, upscaler.upscale(imageTensor)];
            case 3:
                // Upscale the image
                upscaledTensor = _b.sent();
                upscaledShape = upscaledTensor.shape;
                upscaledHeight = upscaledShape[0];
                upscaledWidth = upscaledShape[1];
                console.log("\uD83D\uDCD0 Upscaled size: ".concat(upscaledWidth, "x").concat(upscaledHeight));
                return [4 /*yield*/, tensorToBase64(upscaledTensor, 'png')];
            case 4:
                upscaledBase64 = _b.sent();
                processingTime = Date.now() - startTime;
                console.log("\u2705 Processing completed in ".concat(processingTime, "ms"));
                // Clean up tensors
                imageTensor.dispose();
                upscaledTensor.dispose();
                // Return response
                res.json({
                    success: true,
                    upscaledImage: upscaledBase64,
                    message: 'Image upscaled successfully',
                    metadata: {
                        originalSize: {
                            width: originalWidth,
                            height: originalHeight,
                        },
                        upscaledSize: {
                            width: upscaledWidth,
                            height: upscaledHeight,
                        },
                        processingTime: processingTime,
                    },
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('❌ Upscale error:', error_1);
                // Clean up tensors on error
                if (imageTensor)
                    imageTensor.dispose();
                if (upscaledTensor)
                    upscaledTensor.dispose();
                res.status(500).json({
                    success: false,
                    error: 'Failed to upscale image',
                    message: error_1 instanceof Error ? error_1.message : 'Unknown error',
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.upscaleImage = upscaleImage;
//# sourceMappingURL=upscaler.controller.js.map