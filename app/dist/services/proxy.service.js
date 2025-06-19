"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = exports.manageGroupProxiesSchema = exports.updateProxyGroupSchema = exports.createProxyGroupSchema = exports.exportProxiesSchema = exports.importProxiesSchema = exports.updateProxySchema = exports.createProxySchema = exports.proxyConfigSchema = void 0;
const Proxy_1 = require("../models/Proxy");
const ProxyGroup_1 = require("../models/ProxyGroup");
const zod_1 = require("zod");
// Validation schemas
exports.proxyConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    type: zod_1.z.string().optional(),
    host: zod_1.z.string().optional(),
    port: zod_1.z.number().optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
});
exports.createProxySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    type: zod_1.z.enum(["http", "https", "socks4", "socks5"]),
    host: zod_1.z.string().min(1, "Host is required"),
    port: zod_1.z.number().min(1).max(65535),
    location: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    groupId: zod_1.z.string().optional(),
});
exports.updateProxySchema = exports.createProxySchema.partial();
exports.importProxiesSchema = zod_1.z.object({
    proxies: zod_1.z.array(exports.createProxySchema.omit({ groupId: true })),
});
exports.exportProxiesSchema = zod_1.z.object({
    proxyIds: zod_1.z.array(zod_1.z.string()),
});
exports.createProxyGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
});
exports.updateProxyGroupSchema = exports.createProxyGroupSchema.partial();
exports.manageGroupProxiesSchema = zod_1.z.object({
    proxyIds: zod_1.z.array(zod_1.z.string()),
});
class ProxyService {
    /**
     * Lấy cấu hình proxy hiện tại
     */
    static async getConfig() {
        return Proxy_1.ProxyConverter.configToAPI(this.proxyConfig);
    }
    /**
     * Cập nhật cấu hình proxy
     */
    static async updateConfig(updates) {
        this.proxyConfig = {
            ...this.proxyConfig,
            ...updates,
        };
        if (updates.enabled !== undefined) {
            this.proxyConfig.status = updates.enabled ? "online" : "offline";
            this.proxyConfig.lastChecked = new Date().toISOString();
        }
        return Proxy_1.ProxyConverter.configToAPI(this.proxyConfig);
    }
    /**
     * Kiểm tra kết nối proxy hiện tại
     */
    static async testConnection() {
        try {
            if (!this.proxyConfig.enabled || !this.proxyConfig.host) {
                return Proxy_1.ProxyConverter.toTestResponse(false, undefined, "Proxy not configured or disabled");
            }
            // Simulate connection test
            const startTime = Date.now();
            await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));
            const ping = Date.now() - startTime;
            const success = Math.random() > 0.1; // 90% success rate
            this.proxyConfig.status = success ? "online" : "offline";
            this.proxyConfig.lastChecked = new Date().toISOString();
            return Proxy_1.ProxyConverter.toTestResponse(success, success ? ping : undefined, success ? undefined : "Connection timeout");
        }
        catch (error) {
            return Proxy_1.ProxyConverter.toTestResponse(false, undefined, "Test failed");
        }
    }
    /**
     * Lấy tất cả proxy
     */
    static async getAllProxies() {
        const proxies = await Proxy_1.ProxyModel.findAll();
        return Proxy_1.ProxyConverter.toAPIArray(proxies);
    }
    /**
     * Lấy proxy theo ID
     */
    static async getProxyById(id) {
        const proxy = await Proxy_1.ProxyModel.findById(id);
        if (!proxy) {
            throw new Error("Proxy not found");
        }
        return Proxy_1.ProxyConverter.toAPI(proxy);
    }
    /**
     * Tạo proxy mới
     */
    static async createProxy(data) {
        // Kiểm tra IP:Port có trùng không
        const exists = await Proxy_1.ProxyModel.existsByAddress(data.host, data.port);
        if (exists) {
            throw new Error("Proxy with this host and port already exists");
        }
        const proxyData = Proxy_1.ProxyConverter.fromCreateRequest(data);
        const proxy = await Proxy_1.ProxyModel.create(proxyData);
        if (!proxy) {
            throw new Error("Failed to create proxy");
        }
        // Thêm vào group nếu có
        if (data.groupId) {
            const groupId = parseInt(data.groupId);
            await ProxyGroup_1.ProxyGroupModel.addProxies(groupId, [proxy.id]);
        }
        return Proxy_1.ProxyConverter.toAPI(proxy);
    }
    /**
     * Cập nhật proxy
     */
    static async updateProxy(id, data) {
        // Kiểm tra proxy tồn tại
        const existingProxy = await Proxy_1.ProxyModel.findById(id);
        if (!existingProxy) {
            throw new Error("Proxy not found");
        }
        // Kiểm tra IP:Port trùng (nếu thay đổi)
        if (data.host || data.port) {
            const host = data.host || existingProxy.ip;
            const port = data.port || existingProxy.port;
            const exists = await Proxy_1.ProxyModel.existsByAddress(host, port, id);
            if (exists) {
                throw new Error("Proxy with this host and port already exists");
            }
        }
        const updateData = Proxy_1.ProxyConverter.fromUpdateRequest(data);
        const proxy = await Proxy_1.ProxyModel.update(id, updateData);
        if (!proxy) {
            throw new Error("Failed to update proxy");
        }
        return Proxy_1.ProxyConverter.toAPI(proxy);
    }
    /**
     * Xóa proxy
     */
    static async deleteProxy(id) {
        const success = await Proxy_1.ProxyModel.delete(id);
        if (!success) {
            throw new Error("Failed to delete proxy");
        }
        return Proxy_1.ProxyConverter.toDeleteResponse(true);
    }
    /**
     * Kiểm tra proxy cụ thể
     */
    static async testProxyConnection(id) {
        const result = await Proxy_1.ProxyModel.testConnection(id);
        return Proxy_1.ProxyConverter.toTestResponse(result.success, result.ping, result.error);
    }
    /**
     * Nhập nhiều proxy
     */
    static async importProxies(data) {
        const results = await Proxy_1.ProxyModel.importProxies(data.proxies.map((p) => ({
            name: p.name,
            ip: p.host,
            port: p.port,
            type: p.type,
            username: p.username,
            password: p.password,
            location: p.location,
        })));
        return Proxy_1.ProxyConverter.toImportResponse(results.success > 0, results.success);
    }
    /**
     * Xuất proxy
     */
    static async exportProxies(data) {
        const proxyIds = data.proxyIds.map((id) => parseInt(id));
        const proxies = [];
        for (const id of proxyIds) {
            const proxy = await Proxy_1.ProxyModel.findById(id);
            if (proxy) {
                proxies.push(`${proxy.type}://${proxy.username ? `${proxy.username}:${proxy.password || ""}@` : ""}${proxy.ip}:${proxy.port}`);
            }
        }
        return proxies.join("\n");
    }
    /**
     * Lấy tất cả nhóm proxy
     */
    static async getAllProxyGroups() {
        const groups = await ProxyGroup_1.ProxyGroupModel.findWithProxyCount();
        return ProxyGroup_1.ProxyGroupConverter.toAPIArray(groups);
    }
    /**
     * Tạo nhóm proxy mới
     */
    static async createProxyGroup(data) {
        // Kiểm tra tên trùng
        const exists = await ProxyGroup_1.ProxyGroupModel.existsByName(data.name);
        if (exists) {
            throw new Error("Group with this name already exists");
        }
        const groupData = ProxyGroup_1.ProxyGroupConverter.fromCreateRequest(data);
        const group = await ProxyGroup_1.ProxyGroupModel.create(groupData);
        if (!group) {
            throw new Error("Failed to create proxy group");
        }
        return ProxyGroup_1.ProxyGroupConverter.toAPI({ ...group, proxyCount: 0 });
    }
    /**
     * Xóa nhóm proxy
     */
    static async deleteProxyGroup(id) {
        const success = await ProxyGroup_1.ProxyGroupModel.delete(id);
        if (!success) {
            throw new Error("Failed to delete proxy group");
        }
        return ProxyGroup_1.ProxyGroupConverter.toManageResponse(true);
    }
    /**
     * Thêm proxy vào nhóm
     */
    static async addProxiesToGroup(groupId, data) {
        const proxyIds = data.proxyIds.map((id) => parseInt(id));
        const success = await ProxyGroup_1.ProxyGroupModel.addProxies(groupId, proxyIds);
        if (!success) {
            throw new Error("Failed to add proxies to group");
        }
        return ProxyGroup_1.ProxyGroupConverter.toManageResponse(true);
    }
    /**
     * Xóa proxy khỏi nhóm
     */
    static async removeProxiesFromGroup(groupId, data) {
        const proxyIds = data.proxyIds.map((id) => parseInt(id));
        const success = await ProxyGroup_1.ProxyGroupModel.removeProxies(groupId, proxyIds);
        return ProxyGroup_1.ProxyGroupConverter.toManageResponse(success);
    }
    /**
     * Lấy proxy trong nhóm
     */
    static async getProxiesInGroup(groupId) {
        const proxies = await ProxyGroup_1.ProxyGroupModel.getProxies(groupId);
        return Proxy_1.ProxyConverter.toAPIArray(proxies);
    }
    /**
     * Tìm proxy theo host và port
     */
    static async findProxyByAddress(host, port) {
        const proxy = await Proxy_1.ProxyModel.findByAddress(host, port);
        if (!proxy) {
            throw new Error("Proxy not found");
        }
        return Proxy_1.ProxyConverter.toFindResponse(proxy);
    }
}
exports.ProxyService = ProxyService;
ProxyService.proxyConfig = {
    enabled: false,
    type: "http",
    host: "",
    port: 8080,
    username: "",
    password: "",
    status: "offline",
    lastChecked: null,
};
