import {
  ProxyModel,
  ProxyConverter,
  type APIProxyConfig,
  type APIProxyResponse,
  type APICreateProxyRequest,
  type APIUpdateProxyRequest,
  type APIProxyTestResponse,
  type APIImportProxiesRequest,
  type APIImportProxiesResponse,
  type APIExportProxiesRequest,
  type APIDeleteResponse,
  type APIFindProxyResponse,
} from "../models/Proxy";
import {
  ProxyGroupModel,
  ProxyGroupConverter,
  type APIProxyGroupResponse,
  type APICreateProxyGroupRequest,
  type APIManageGroupProxiesRequest,
  type APIGroupManageResponse,
} from "../models/ProxyGroup";
import { z } from "zod";

// Validation schemas
export const proxyConfigSchema = z.object({
  enabled: z.boolean().optional(),
  type: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const createProxySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["http", "https", "socks4", "socks5"]),
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1).max(65535),
  location: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  groupId: z.string().optional(),
});

export const updateProxySchema = createProxySchema.partial();

export const importProxiesSchema = z.object({
  proxies: z.array(createProxySchema.omit({ groupId: true })),
});

export const exportProxiesSchema = z.object({
  proxyIds: z.array(z.string()),
});

export const createProxyGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateProxyGroupSchema = createProxyGroupSchema.partial();

export const manageGroupProxiesSchema = z.object({
  proxyIds: z.array(z.string()),
});

export class ProxyService {
  private static proxyConfig = {
    enabled: false,
    type: "http",
    host: "",
    port: 8080,
    username: "",
    password: "",
    status: "offline" as "online" | "offline",
    lastChecked: null as string | null,
  };

  /**
   * Lấy cấu hình proxy hiện tại
   */
  static async getConfig(): Promise<APIProxyConfig> {
    return ProxyConverter.configToAPI(this.proxyConfig);
  }

  /**
   * Cập nhật cấu hình proxy
   */
  static async updateConfig(
    updates: z.infer<typeof proxyConfigSchema>,
  ): Promise<APIProxyConfig> {
    this.proxyConfig = {
      ...this.proxyConfig,
      ...updates,
    };

    if (updates.enabled !== undefined) {
      this.proxyConfig.status = updates.enabled ? "online" : "offline";
      this.proxyConfig.lastChecked = new Date().toISOString();
    }

    return ProxyConverter.configToAPI(this.proxyConfig);
  }

  /**
   * Kiểm tra kết nối proxy hiện tại
   */
  static async testConnection(): Promise<APIProxyTestResponse> {
    try {
      if (!this.proxyConfig.enabled || !this.proxyConfig.host) {
        return ProxyConverter.toTestResponse(
          false,
          undefined,
          "Proxy not configured or disabled",
        );
      }

      // Simulate connection test
      const startTime = Date.now();
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500),
      );
      const ping = Date.now() - startTime;

      const success = Math.random() > 0.1; // 90% success rate

      this.proxyConfig.status = success ? "online" : "offline";
      this.proxyConfig.lastChecked = new Date().toISOString();

      return ProxyConverter.toTestResponse(
        success,
        success ? ping : undefined,
        success ? undefined : "Connection timeout",
      );
    } catch (error) {
      return ProxyConverter.toTestResponse(false, undefined, "Test failed");
    }
  }

  /**
   * Lấy tất cả proxy
   */
  static async getAllProxies(): Promise<APIProxyResponse[]> {
    const proxies = await ProxyModel.findAll();
    return ProxyConverter.toAPIArray(proxies);
  }

  /**
   * Lấy proxy theo ID
   */
  static async getProxyById(id: number): Promise<APIProxyResponse> {
    const proxy = await ProxyModel.findById(id);
    if (!proxy) {
      throw new Error("Proxy not found");
    }
    return ProxyConverter.toAPI(proxy);
  }

  /**
   * Tạo proxy mới
   */
  static async createProxy(
    data: z.infer<typeof createProxySchema>,
  ): Promise<APIProxyResponse> {
    // Kiểm tra IP:Port có trùng không
    const exists = await ProxyModel.existsByAddress(data.host, data.port);
    if (exists) {
      throw new Error("Proxy with this host and port already exists");
    }

    const proxyData = ProxyConverter.fromCreateRequest(
      data as APICreateProxyRequest,
    );
    const proxy = await ProxyModel.create(proxyData);
    if (!proxy) {
      throw new Error("Failed to create proxy");
    }

    // Thêm vào group nếu có
    if (data.groupId) {
      const groupId = parseInt(data.groupId);
      await ProxyGroupModel.addProxies(groupId, [proxy.id]);
    }

    return ProxyConverter.toAPI(proxy);
  }

  /**
   * Cập nhật proxy
   */
  static async updateProxy(
    id: number,
    data: z.infer<typeof updateProxySchema>,
  ): Promise<APIProxyResponse> {
    // Kiểm tra proxy tồn tại
    const existingProxy = await ProxyModel.findById(id);
    if (!existingProxy) {
      throw new Error("Proxy not found");
    }

    // Kiểm tra IP:Port trùng (nếu thay đổi)
    if (data.host || data.port) {
      const host = data.host || existingProxy.ip;
      const port = data.port || existingProxy.port;
      const exists = await ProxyModel.existsByAddress(host, port, id);
      if (exists) {
        throw new Error("Proxy with this host and port already exists");
      }
    }

    const updateData = ProxyConverter.fromUpdateRequest(
      data as APIUpdateProxyRequest,
    );
    const proxy = await ProxyModel.update(id, updateData);
    if (!proxy) {
      throw new Error("Failed to update proxy");
    }

    return ProxyConverter.toAPI(proxy);
  }

  /**
   * Xóa proxy
   */
  static async deleteProxy(id: number): Promise<APIDeleteResponse> {
    const success = await ProxyModel.delete(id);
    if (!success) {
      throw new Error("Failed to delete proxy");
    }
    return ProxyConverter.toDeleteResponse(true);
  }

  /**
   * Kiểm tra proxy cụ thể
   */
  static async testProxyConnection(id: number): Promise<APIProxyTestResponse> {
    const result = await ProxyModel.testConnection(id);
    return ProxyConverter.toTestResponse(
      result.success,
      result.ping,
      result.error,
    );
  }

  /**
   * Nhập nhiều proxy
   */
  static async importProxies(
    data: z.infer<typeof importProxiesSchema>,
  ): Promise<APIImportProxiesResponse> {
    const results = await ProxyModel.importProxies(
      data.proxies.map((p) => ({
        name: p.name,
        ip: p.host,
        port: p.port,
        type: p.type,
        username: p.username,
        password: p.password,
        location: p.location,
      })),
    );

    return ProxyConverter.toImportResponse(
      results.success > 0,
      results.success,
    );
  }

  /**
   * Xuất proxy
   */
  static async exportProxies(
    data: z.infer<typeof exportProxiesSchema>,
  ): Promise<string> {
    const proxyIds = data.proxyIds.map((id) => parseInt(id));
    const proxies: any[] = [];

    for (const id of proxyIds) {
      const proxy = await ProxyModel.findById(id);
      if (proxy) {
        proxies.push(
          `${proxy.type}://${proxy.username ? `${proxy.username}:${proxy.password || ""}@` : ""}${proxy.ip}:${proxy.port}`,
        );
      }
    }

    return proxies.join("\n");
  }

  /**
   * Lấy tất cả nhóm proxy
   */
  static async getAllProxyGroups(): Promise<APIProxyGroupResponse[]> {
    const groups = await ProxyGroupModel.findWithProxyCount();
    return ProxyGroupConverter.toAPIArray(groups);
  }

  /**
   * Tạo nhóm proxy mới
   */
  static async createProxyGroup(
    data: z.infer<typeof createProxyGroupSchema>,
  ): Promise<APIProxyGroupResponse> {
    // Kiểm tra tên trùng
    const exists = await ProxyGroupModel.existsByName(data.name);
    if (exists) {
      throw new Error("Group with this name already exists");
    }

    const groupData = ProxyGroupConverter.fromCreateRequest(
      data as APICreateProxyGroupRequest,
    );
    const group = await ProxyGroupModel.create(groupData);
    if (!group) {
      throw new Error("Failed to create proxy group");
    }

    return ProxyGroupConverter.toAPI({ ...group, proxyCount: 0 });
  }

  /**
   * Xóa nhóm proxy
   */
  static async deleteProxyGroup(id: number): Promise<APIGroupManageResponse> {
    const success = await ProxyGroupModel.delete(id);
    if (!success) {
      throw new Error("Failed to delete proxy group");
    }
    return ProxyGroupConverter.toManageResponse(true);
  }

  /**
   * Thêm proxy vào nhóm
   */
  static async addProxiesToGroup(
    groupId: number,
    data: z.infer<typeof manageGroupProxiesSchema>,
  ): Promise<APIGroupManageResponse> {
    const proxyIds = data.proxyIds.map((id) => parseInt(id));
    const success = await ProxyGroupModel.addProxies(groupId, proxyIds);
    if (!success) {
      throw new Error("Failed to add proxies to group");
    }
    return ProxyGroupConverter.toManageResponse(true);
  }

  /**
   * Xóa proxy khỏi nhóm
   */
  static async removeProxiesFromGroup(
    groupId: number,
    data: z.infer<typeof manageGroupProxiesSchema>,
  ): Promise<APIGroupManageResponse> {
    const proxyIds = data.proxyIds.map((id) => parseInt(id));
    const success = await ProxyGroupModel.removeProxies(groupId, proxyIds);
    return ProxyGroupConverter.toManageResponse(success);
  }

  /**
   * Lấy proxy trong nhóm
   */
  static async getProxiesInGroup(groupId: number): Promise<APIProxyResponse[]> {
    const proxies = await ProxyGroupModel.getProxies(groupId);
    return ProxyConverter.toAPIArray(proxies);
  }

  /**
   * Tìm proxy theo host và port
   */
  static async findProxyByAddress(
    host: string,
    port: number,
  ): Promise<APIFindProxyResponse> {
    const proxy = await ProxyModel.findByAddress(host, port);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    return ProxyConverter.toFindResponse(proxy);
  }
}
