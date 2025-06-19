"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const Profile_1 = require("../models/Profile");
const Proxy_1 = require("../models/Proxy");
const ProxyGroup_1 = require("../models/ProxyGroup");
const proxy_service_1 = require("./proxy.service");
const fingerprint_service_1 = require("./fingerprint.service");
class ProfileService {
    /**
     * Tạo profile đơn lẻ không sử dụng proxy
     */
    static async createIndividualProfileWithoutProxy(data) {
        // Bước 1: Xác định fingerprint method
        const fingerprintMethod = data.fingerprintMethod || data.fingerprintType || "random";
        let fingerprint;
        if (fingerprintMethod === "custom") {
            // Custom fingerprint từ client data
            fingerprint = fingerprint_service_1.FingerprintService.generateFingerprintFromClientData(data);
        }
        else {
            // Random fingerprint (default)
            fingerprint = fingerprint_service_1.FingerprintService.generateRandomFingerprint();
        }
        // Bước 2: Extract thông tin từ User Agent
        const { osType, browserType, browserVersion } = ProfileService.extractUserAgentInfo(fingerprint.userAgent || "");
        // Bước 3: Tạo profile data (không có proxy)
        const profileData = {
            name: data.name.trim(),
            fingerprint: fingerprint,
            proxyId: undefined, // Không sử dụng proxy
            accountType: data.accountType || "general",
            accountDetails: data.accountDetails || {},
            osType: osType,
            browserType: browserType,
            browserVersion: browserVersion,
        };
        // Bước 4: Lưu profile vào database
        const profile = await Profile_1.ProfileModel.create(profileData);
        if (!profile) {
            throw new Error("Failed to create profile");
        }
        // Bước 5: Format response
        return {
            success: true,
            message: "Individual profile created successfully",
            mode: "individual",
            proxyMethod: "none",
            fingerprintMethod: fingerprintMethod,
            profile: {
                id: profile.id,
                name: profile.name,
                osType: profile.osType,
                browserType: profile.browserType,
                browserVersion: profile.browserVersion,
                proxy: null,
            },
        };
    }
    /**
     * Tạo profile đơn lẻ với import proxy
     */
    static async createIndividualProfileWithProxy(data) {
        // Bước 1: Validate và parse proxy
        const proxyString = data.proxyList || data.proxy || "";
        if (!proxyString.trim()) {
            throw new Error('Proxy information is required when proxy method is "import"');
        }
        // Parse proxy từ string
        const parts = proxyString.trim().split(":");
        if (parts.length < 2) {
            throw new Error("Invalid proxy format");
        }
        const proxyIp = parts[0].trim();
        const proxyPort = parseInt(parts[1].trim());
        const proxyUsername = parts[2]?.trim() || null;
        const proxyPassword = parts[3]?.trim() || null;
        // Validate IP và Port
        if (!proxyIp || isNaN(proxyPort) || proxyPort <= 0 || proxyPort > 65535) {
            throw new Error("Invalid proxy IP or port");
        }
        // Bước 2: Kiểm tra proxy trong database
        let proxyId = null;
        // Kiểm tra proxy đã tồn tại chưa
        const existingProxies = await Proxy_1.ProxyModel.findAll();
        const existingProxy = existingProxies.find((p) => p.ip === proxyIp && p.port === proxyPort);
        if (existingProxy) {
            // Proxy đã tồn tại, sử dụng ID hiện có
            proxyId = existingProxy.id;
        }
        else {
            // Tạo proxy mới
            const newProxy = await proxy_service_1.ProxyService.createProxy({
                name: `Imported-${proxyIp}:${proxyPort}`,
                host: proxyIp,
                port: proxyPort,
                type: "http",
                username: proxyUsername || undefined,
                password: proxyPassword || undefined,
                location: "Unknown",
            });
            if (newProxy) {
                proxyId = parseInt(newProxy.id, 10);
            }
        }
        // Bước 3: Xác định fingerprint method
        const fingerprintMethod = data.fingerprintMethod || data.fingerprintType || "random";
        let fingerprint;
        if (fingerprintMethod === "custom") {
            fingerprint = fingerprint_service_1.FingerprintService.generateFingerprintFromClientData(data);
        }
        else {
            fingerprint = fingerprint_service_1.FingerprintService.generateRandomFingerprint();
        }
        // Bước 4: Extract thông tin từ User Agent
        const { osType, browserType, browserVersion } = ProfileService.extractUserAgentInfo(fingerprint.userAgent || "");
        // Bước 5: Tạo profile data (có proxy)
        const profileData = {
            name: data.name.trim(),
            fingerprint: fingerprint,
            proxyId: proxyId || undefined,
            accountType: data.accountType || "general",
            accountDetails: data.accountDetails || {},
            osType: osType,
            browserType: browserType,
            browserVersion: browserVersion,
        };
        // Bước 6: Lưu profile vào database
        const profile = await Profile_1.ProfileModel.create(profileData);
        if (!profile) {
            throw new Error("Failed to create profile");
        }
        // Bước 7: Format response
        return {
            success: true,
            message: "Individual profile with proxy created successfully",
            mode: "individual",
            proxyMethod: "import",
            fingerprintMethod: fingerprintMethod,
            profile: {
                id: profile.id,
                name: profile.name,
                osType: profile.osType,
                browserType: profile.browserType,
                browserVersion: profile.browserVersion,
                proxy: `${proxyIp}:${proxyPort}`,
            },
        };
    }
    /**
     * Tạo profile hàng loạt
     */
    static async createBulkProfiles(data) {
        // Bước 1 - Validation cơ bản
        const count = parseInt(data.count) || 1;
        const prefix = data.prefix || "Profile";
        if (count <= 0 || count > 100) {
            throw new Error("Count must be between 1 and 100");
        }
        if (!prefix.trim()) {
            throw new Error("Profile name prefix is required");
        }
        // Bước 2 - Xử lý Proxy List Handling với Validation
        const proxyMethod = data.proxySource || data.proxy || data.proxyMethod || "none";
        let proxies = [];
        if (proxyMethod === "none") {
            // Trường hợp 1: Không sử dụng proxy
            proxies = []; // Không có proxy
        }
        else if (proxyMethod === "select" || proxyMethod === "proxy-group") {
            // Trường hợp 2: Chọn từ proxy group
            const groupId = parseInt(data.selectedProxyGroup);
            // VALIDATION: Kiểm tra có chọn group không
            if (!groupId || isNaN(groupId)) {
                throw new Error('Proxy group is required when proxy source is set to "select group"');
            }
            // Kiểm tra group có tồn tại không
            const groupExists = await ProxyGroup_1.ProxyGroupModel.exists(groupId);
            if (!groupExists) {
                throw new Error("Selected proxy group not found");
            }
            const groupProxies = await ProxyGroup_1.ProxyGroupModel.getProxies(groupId);
            proxies = groupProxies || [];
            // VALIDATION: Kiểm tra group có proxy không
            if (proxies.length === 0) {
                throw new Error("Selected proxy group is empty");
            }
        }
        else if (proxyMethod === "import") {
            // Trường hợp 3: Import danh sách proxy
            proxies = await ProfileService.processImportedProxies(data.proxyList);
        }
        // Bước 3 - Tạo nhiều profiles với Sequential Assignment
        const createdProfiles = [];
        const failedProfiles = [];
        for (let i = 1; i <= count; i++) {
            try {
                // Tạo fingerprint ngẫu nhiên
                const fingerprint = fingerprint_service_1.FingerprintService.generateRandomFingerprint();
                // Extract thông tin từ User Agent
                const { osType, browserType, browserVersion } = ProfileService.extractUserAgentInfo(fingerprint.userAgent || "");
                // Xử lý proxy cho profile này - LUÔN LUÔN SEQUENTIAL
                let selectedProxy = null;
                if (proxies.length > 0) {
                    // Sequential proxy assignment với wrap-around
                    const proxyIndex = (i - 1) % proxies.length;
                    selectedProxy = proxies[proxyIndex];
                }
                // Tạo profile data với tên được generate
                const profileData = {
                    name: ProfileService.generateProfileName(prefix, i),
                    fingerprint: fingerprint,
                    proxyId: selectedProxy ? selectedProxy.id : undefined,
                    accountType: data.accountType || "general",
                    accountDetails: data.accountDetails || {},
                    osType: osType,
                    browserType: browserType,
                    browserVersion: browserVersion,
                };
                // Lưu vào database
                const profile = await Profile_1.ProfileModel.create(profileData);
                if (profile) {
                    createdProfiles.push({
                        id: profile.id,
                        name: profile.name,
                        proxy: selectedProxy
                            ? `${selectedProxy.ip}:${selectedProxy.port}`
                            : null,
                        proxyIndex: selectedProxy ? ((i - 1) % proxies.length) + 1 : null,
                    });
                }
                else {
                    failedProfiles.push({
                        name: ProfileService.generateProfileName(prefix, i),
                        error: "Failed to create profile",
                    });
                }
            }
            catch (error) {
                console.error(`Error creating profile ${i}:`, error);
                failedProfiles.push({
                    name: ProfileService.generateProfileName(prefix, i),
                    error: typeof error === "object" && error !== null && "message" in error
                        ? error.message
                        : "Unknown error",
                });
            }
        }
        // Bước 4 - Format response
        return {
            success: createdProfiles.length > 0,
            message: `Created ${createdProfiles.length}/${count} profiles successfully`,
            mode: "bulk",
            proxyMethod: proxyMethod,
            summary: {
                total: count,
                created: createdProfiles.length,
                failed: failedProfiles.length,
                proxiesUsed: proxies.length,
                proxyAssignment: proxies.length > 0 ? "sequential" : "none",
                cyclesCompleted: proxies.length > 0 ? Math.ceil(count / proxies.length) : 0,
            },
            profiles: createdProfiles,
            failures: failedProfiles.length > 0 ? failedProfiles : undefined,
        };
    }
    /**
     * Xử lý danh sách proxy import
     */
    static async processImportedProxies(proxyList) {
        if (!proxyList || !proxyList.trim()) {
            throw new Error('Proxy list is required when proxy source is set to "import"');
        }
        // Parse và validate proxy list
        const lines = proxyList.trim().split("\n");
        const validProxies = [];
        const invalidLines = [];
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim();
            if (!line)
                continue; // Skip empty lines
            const parts = line.split(":");
            if (parts.length >= 2) {
                const ip = parts[0].trim();
                const port = parseInt(parts[1].trim());
                if (ip && !isNaN(port) && port > 0 && port <= 65535) {
                    validProxies.push({
                        ip: ip,
                        port: port,
                        username: parts[2]?.trim() || null,
                        password: parts[3]?.trim() || null,
                        type: "http",
                    });
                }
                else {
                    invalidLines.push(lineIndex + 1);
                }
            }
            else {
                invalidLines.push(lineIndex + 1);
            }
        }
        if (validProxies.length === 0) {
            throw new Error("No valid proxies found in the import list");
        }
        // Kiểm tra và tạo proxy trong database
        const processedProxies = [];
        for (const proxyData of validProxies) {
            try {
                // Kiểm tra IP:Port đã tồn tại chưa bằng ProxyService.findProxyByAddress
                let existingProxy = null;
                try {
                    existingProxy = await proxy_service_1.ProxyService.findProxyByAddress(proxyData.ip, proxyData.port);
                }
                catch (error) {
                    // Nếu không tìm thấy thì error.message === 'Proxy not found'
                    existingProxy = null;
                }
                if (existingProxy) {
                    // Proxy đã tồn tại, sử dụng proxy hiện có
                    processedProxies.push(existingProxy);
                }
                else {
                    // Tạo proxy mới
                    const newProxy = await proxy_service_1.ProxyService.createProxy({
                        name: `Imported-${proxyData.ip}:${proxyData.port}`,
                        host: proxyData.ip,
                        port: proxyData.port,
                        type: ["http", "https", "socks4", "socks5"].includes(proxyData.type)
                            ? proxyData.type
                            : "http",
                        username: proxyData.username || undefined,
                        password: proxyData.password || undefined,
                        location: "Unknown",
                    });
                    if (newProxy) {
                        processedProxies.push(newProxy);
                    }
                }
            }
            catch (error) {
                console.error(`Error processing proxy ${proxyData.ip}:${proxyData.port}:`, error);
            }
        }
        return processedProxies;
    }
    /**
     * Lấy danh sách tất cả profiles
     */
    static async getAllProfiles() {
        return await Profile_1.ProfileModel.findAll();
    }
    /**
     * Lấy profile theo ID
     */
    static async getProfileById(id) {
        const profile = await Profile_1.ProfileModel.findById(id);
        if (!profile) {
            throw new Error("Profile not found");
        }
        return profile;
    }
    /**
     * Cập nhật profile
     */
    static async updateProfile(id, data) {
        const profile = await Profile_1.ProfileModel.update(id, data);
        if (!profile) {
            throw new Error("Profile not found or update failed");
        }
        return profile;
    }
    /**
     * Xóa profile
     */
    static async deleteProfile(id) {
        return await Profile_1.ProfileModel.delete(id);
    }
    /**
     * Xóa nhiều profiles
     */
    static async deleteMultipleProfiles(ids) {
        let deletedCount = 0;
        const failedIds = [];
        for (const id of ids) {
            try {
                const deleted = await Profile_1.ProfileModel.delete(id);
                if (deleted) {
                    deletedCount++;
                }
                else {
                    failedIds.push(id);
                }
            }
            catch (error) {
                console.error(`Error deleting profile ${id}:`, error);
                failedIds.push(id);
            }
        }
        return {
            success: deletedCount > 0,
            deletedCount,
            failedIds,
        };
    }
    /**
     * Import profiles từ file
     */
    static async importProfiles(profiles) {
        const importedProfiles = [];
        const failedProfiles = [];
        for (const profileData of profiles) {
            try {
                const profile = await Profile_1.ProfileModel.create(profileData);
                if (profile) {
                    importedProfiles.push(profile);
                }
                else {
                    failedProfiles.push({
                        name: profileData.name || "Unknown",
                        error: "Failed to create profile",
                    });
                }
            }
            catch (error) {
                failedProfiles.push({
                    name: profileData.name || "Unknown",
                    error: typeof error === "object" && error !== null && "message" in error
                        ? error.message
                        : "Unknown error",
                });
            }
        }
        return {
            success: importedProfiles.length > 0,
            message: `Imported ${importedProfiles.length}/${profiles.length} profiles successfully`,
            imported: importedProfiles,
            failures: failedProfiles.length > 0 ? failedProfiles : undefined,
        };
    }
    /**
     * Export profiles ra file
     */
    static async exportProfiles(ids) {
        if (ids && ids.length > 0) {
            // Export specific profiles
            const profiles = [];
            for (const id of ids) {
                try {
                    const profile = await Profile_1.ProfileModel.findById(id);
                    if (profile) {
                        profiles.push(profile);
                    }
                }
                catch (error) {
                    console.error(`Error getting profile ${id}:`, error);
                }
            }
            return profiles;
        }
        else {
            // Export all profiles
            return await Profile_1.ProfileModel.findAll();
        }
    }
    /**
     * Utility: Extract thông tin từ User Agent
     */
    static extractUserAgentInfo(userAgent) {
        const defaultReturn = {
            osType: "Unknown",
            browserType: "Unknown",
            browserVersion: "Unknown",
        };
        if (!userAgent) {
            return defaultReturn;
        }
        try {
            // Detect OS
            let osType = "Unknown";
            if (userAgent.includes("Windows NT 10.0"))
                osType = "Windows 10";
            else if (userAgent.includes("Windows NT 6.3"))
                osType = "Windows 8.1";
            else if (userAgent.includes("Windows NT 6.2"))
                osType = "Windows 8";
            else if (userAgent.includes("Windows NT 6.1"))
                osType = "Windows 7";
            else if (userAgent.includes("Windows NT"))
                osType = "Windows";
            else if (userAgent.includes("Mac OS X"))
                osType = "macOS";
            else if (userAgent.includes("Linux"))
                osType = "Linux";
            else if (userAgent.includes("Android"))
                osType = "Android";
            else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
                osType = "iOS";
            // Detect Browser
            let browserType = "Unknown";
            let browserVersion = "Unknown";
            if (userAgent.includes("Chrome/") && !userAgent.includes("Edge/")) {
                browserType = "Chrome";
                const chromeMatch = userAgent.match(/Chrome\/(\d+\.?\d*)/);
                if (chromeMatch)
                    browserVersion = chromeMatch[1];
            }
            else if (userAgent.includes("Firefox/")) {
                browserType = "Firefox";
                const firefoxMatch = userAgent.match(/Firefox\/(\d+\.?\d*)/);
                if (firefoxMatch)
                    browserVersion = firefoxMatch[1];
            }
            else if (userAgent.includes("Safari/") &&
                !userAgent.includes("Chrome/")) {
                browserType = "Safari";
                const safariMatch = userAgent.match(/Version\/(\d+\.?\d*)/);
                if (safariMatch)
                    browserVersion = safariMatch[1];
            }
            else if (userAgent.includes("Edge/")) {
                browserType = "Edge";
                const edgeMatch = userAgent.match(/Edge\/(\d+\.?\d*)/);
                if (edgeMatch)
                    browserVersion = edgeMatch[1];
            }
            return {
                osType,
                browserType,
                browserVersion,
            };
        }
        catch (error) {
            console.error("Error extracting user agent info:", error);
            return defaultReturn;
        }
    }
    /**
     * Utility: Generate profile name
     */
    static generateProfileName(prefix, index) {
        return `${prefix} ${index.toString().padStart(3, "0")}`;
    }
}
exports.ProfileService = ProfileService;
