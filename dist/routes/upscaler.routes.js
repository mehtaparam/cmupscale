"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var upscaler_controller_1 = require("../controllers/upscaler.controller");
var router = (0, express_1.Router)();
router.post('/upscale', upscaler_controller_1.upscaleImage);
exports.default = router;
//# sourceMappingURL=upscaler.routes.js.map