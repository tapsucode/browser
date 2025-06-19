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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FingerprintService {
    /**
     * Tạo fingerprint từ data client gửi lên
     * @param clientData - Data fingerprint từ client (đã có đầy đủ thông tin)
     * @returns FingerprintData đã được xử lý
     */
    static generateFingerprintFromClientData(clientData) {
        // Bước 1: Xử lý WebRTC validation
        let webRtcMode = clientData.webRtcMode || 'proxy';
        let webRtcCustomIp = null;
        // Validation WebRTC mode
        if (webRtcMode === 'custom') {
            const customIp = clientData.webRtcCustomIp?.trim();
            if (!customIp || !FingerprintService.isValidIP(customIp)) {
                // Nếu custom IP không hợp lệ, fallback về 'proxy'
                webRtcMode = 'proxy';
                webRtcCustomIp = null;
            }
            else {
                webRtcCustomIp = customIp;
            }
        }
        // Bước 2: Xử lý protection values (chỉ boolean → number)
        const processedFingerprint = {
            // Giữ nguyên tất cả data từ client
            userAgent: clientData.userAgent,
            platform: clientData.platform,
            resolution: clientData.resolution,
            timezone: clientData.timezone,
            language: clientData.language,
            vendor: clientData.vendor,
            renderer: clientData.renderer,
            hardwareConcurrency: clientData.hardwareConcurrency,
            deviceMemory: clientData.deviceMemory,
            doNotTrack: clientData.doNotTrack,
            plugins: clientData.plugins,
            // Chỉ xử lý protection values - Boolean → Number conversion
            canvas: FingerprintService.convertBooleanToProtectionValue(clientData.canvas, 'canvas'),
            webGL: FingerprintService.convertBooleanToProtectionValue(clientData.webGL, 'webGL'),
            audioContext: FingerprintService.convertBooleanToProtectionValue(clientData.audioContext, 'audioContext'),
            fonts: FingerprintService.convertBooleanToProtectionValue(clientData.fonts, 'fonts'),
            clientRects: FingerprintService.convertBooleanToProtectionValue(clientData.clientRects, 'clientRects'),
            // WebRTC settings (đã validate ở trên)
            webRtcMode: webRtcMode,
            webRtcCustomIp: webRtcCustomIp || undefined
        };
        return processedFingerprint;
    }
    /**
     * Convert boolean sang protection value cho các giá trị protection
     * @param boolValue - true/false từ client
     * @param type - loại protection để xác định logic
     * @returns number value
     */
    static convertBooleanToProtectionValue(boolValue, type) {
        if (boolValue === false) {
            return 0; // False = disable protection
        }
        if (boolValue === true) {
            // True = enable protection với random value
            switch (type) {
                case 'canvas':
                    // Canvas: random [-0.3, 0.3] với bước 0.01
                    return Math.round((Math.random() * 0.6 - 0.3) * 100) / 100;
                case 'webGL':
                case 'audioContext':
                case 'fonts':
                case 'clientRects':
                    // Các loại khác: random 1-10000
                    return Math.floor(Math.random() * 10000) + 1;
                default:
                    return Math.floor(Math.random() * 10000) + 1;
            }
        }
        // Nếu không phải boolean, trả về giá trị gốc
        if (typeof boolValue === 'number') {
            return boolValue;
        }
        // Default fallback: random value
        return type === 'canvas'
            ? Math.round((Math.random() * 0.6 - 0.3) * 100) / 100
            : Math.floor(Math.random() * 10000) + 1;
    }
    /**
     * Validate IP address format
     */
    static isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }
    /**
     * Generate completely random fingerprint (logic cũ từ controller, không thay đổi gì)
     */
    static generateRandomFingerprint() {
        const dataPath = path.join(__dirname, '../data/fingerprint-data.json');
        const jsonData = fs.readFileSync(dataPath, 'utf8');
        const fingerprintData = JSON.parse(jsonData);
        // Random fingerprint generation (logic cũ từ controller)
        const selectedVendor = fingerprintData.vendors[Math.floor(Math.random() * fingerprintData.vendors.length)];
        const availableRenderers = fingerprintData.renderers[selectedVendor.id] || [];
        const selectedRenderer = availableRenderers[Math.floor(Math.random() * availableRenderers.length)] || availableRenderers[0];
        const randomFingerprint = {
            // Basic fingerprint data
            userAgent: fingerprintData.userAgents[Math.floor(Math.random() * fingerprintData.userAgents.length)].value,
            platform: 'Win32',
            resolution: fingerprintData.resolutions[Math.floor(Math.random() * fingerprintData.resolutions.length)].value,
            timezone: 'Asia/Ho_Chi_Minh',
            language: fingerprintData.browserLanguages[Math.floor(Math.random() * fingerprintData.browserLanguages.length)].value,
            // WebGL data
            vendor: selectedVendor.name,
            renderer: selectedRenderer ? selectedRenderer.name : selectedVendor.name + ' Graphics',
            // Hardware specs
            hardwareConcurrency: parseInt(fingerprintData.hardwareConcurrency[Math.floor(Math.random() * fingerprintData.hardwareConcurrency.length)].value),
            deviceMemory: parseInt(fingerprintData.deviceMemory[Math.floor(Math.random() * fingerprintData.deviceMemory.length)].value),
            // Protection values (random 1-10000 except canvas)
            canvas: Math.round((Math.random() * 0.6 - 0.3) * 100) / 100,
            webGL: Math.floor(Math.random() * 10000) + 1,
            audioContext: Math.floor(Math.random() * 10000) + 1,
            fonts: Math.floor(Math.random() * 10000) + 1,
            clientRects: Math.floor(Math.random() * 10000) + 1,
            // WebRTC settings
            webRtcMode: ['real', 'proxy', 'disable', 'custom'][Math.floor(Math.random() * 4)],
            // Browser settings
            doNotTrack: Math.random() > 0.5,
            // Basic plugins
            plugins: [
                { name: "Chrome PDF Plugin", version: "1.0" },
                { name: "Chromium PDF Plugin", version: "1.0" },
                { name: "Microsoft Edge PDF Plugin", version: "1.0" }
            ]
        };
        return randomFingerprint;
    }
}
exports.FingerprintService = FingerprintService;
