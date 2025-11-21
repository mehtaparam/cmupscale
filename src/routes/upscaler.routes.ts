import { Router } from 'express';
import { upscaleImage } from '../controllers/upscaler.controller';

const router = Router();

router.post('/upscale', upscaleImage);

export default router;
