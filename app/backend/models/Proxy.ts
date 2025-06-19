import { db } from '../db';
import { proxies, proxyGroupMembers, profiles, type Proxy, type InsertProxy } from '../schema';
import { eq, sql } from 'drizzle-orm';

export interface ProxyCreateInput {
  name: string;
  ip: string;
  port: number;
  type: string;
  username?: string;
  password?: string;
  location?: string;
}

export interface ProxyUpdateInput {
  name?: string;
  ip?: string;
  port?: number;
  type?: string;
  username?: string;
  password?: string;
  location?: string;
  status?: 'online' | 'offline';
}

// API Types - theo docs/api/proxy.api.md
export interface APIProxyConfig {
  enabled: boolean;
  type: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  status?: 'online' | 'offline';
  lastChecked?: string; // ISO date string
}

export interface APIProxyResponse {
  id: string;
  name: string;
  type: string;
  address: string;
  location: string;
  status: 'online' | 'offline';
  group?: string;
  username?: string;
  password?: string;
}

export interface APICreateProxyRequest {
  name: string;
  type: string;
  host: string;
  port: number;
  location?: string;
  username?: string;
  password?: string;
  groupId?: string;
}

export interface APIUpdateProxyRequest {
  name?: string;
  type?: string;
  host?: string;
  port?: number;
  location?: string;
  username?: string;
  password?: string;
  groupId?: string | null;
}

export interface APIProxyTestResponse {
  success: boolean;
  ping?: number;
  error?: string;
}

export interface APIImportProxiesRequest {
  proxies: Array<{
    name: string;
    type: string;
    host: string;
    port: number;
    username?: string;
    password?: string;
    location?: string;
  }>;
}

export interface APIImportProxiesResponse {
  success: boolean;
  count: number;
}

export interface APIExportProxiesRequest {
  proxyIds: string[];
}

export interface APIDeleteResponse {
  success: boolean;
}

export interface APIFindProxyResponse {
  proxy: APIProxyResponse;
}

export class ProxyModel {
  /**
   * Tìm proxy theo ID
   */
  static async findById(id: number): Promise<Proxy | null> {
    try {
      const result = await db.select().from(proxies).where(eq(proxies.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding proxy by ID:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả proxies
   */
  static async findAll(): Promise<Proxy[]> {
    try {
      return await db.select().from(proxies);
    } catch (error) {
      console.error('Error finding all proxies:', error);
      return [];
    }
  }

  /**
   * Tạo proxy mới
   */
  static async create(proxyData: ProxyCreateInput): Promise<Proxy | null> {
    try {
      const newProxy: InsertProxy = {
        name: proxyData.name,
        ip: proxyData.ip,
        port: proxyData.port,
        type: proxyData.type,
        username: proxyData.username || null,
        password: proxyData.password || null,
        location: proxyData.location || null,
        status: 'offline',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(proxies).values(newProxy).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating proxy:', error);
      return null;
    }
  }

  /**
   * Cập nhật proxy
   */
  static async update(id: number, proxyData: ProxyUpdateInput): Promise<Proxy | null> {
    try {
      const updateData: Partial<InsertProxy> = {
        ...proxyData,
        updatedAt: new Date(),
      };

      const result = await db.update(proxies)
        .set(updateData)
        .where(eq(proxies.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating proxy:', error);
      return null;
    }
  }

  /**
   * Xóa proxy
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(proxies).where(eq(proxies.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting proxy:', error);
      return false;
    }
  }

  /**
   * Kiểm tra proxy hoạt động
   */
  static async testConnection(id: number): Promise<{ success: boolean; ping?: number; error?: string }> {
    try {
      const proxy = await this.findById(id);
      if (!proxy) {
        return { success: false, error: 'Proxy not found' };
      }

      // Simulate proxy test - in real implementation, you'd test actual connection
      const startTime = Date.now();
      
      // Mock test logic here
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      
      const ping = Date.now() - startTime;
      const success = Math.random() > 0.2; // 80% success rate for demo

      // Update status based on test result
      await this.updateStatus(id, success ? 'online' : 'offline');

      return success 
        ? { success: true, ping }
        : { success: false, error: 'Connection timeout' };
    } catch (error) {
      console.error('Error testing proxy connection:', error);
      return { success: false, error: 'Test failed' };
    }
  }

  /**
   * Cập nhật trạng thái proxy
   */
  static async updateStatus(id: number, status: 'online' | 'offline'): Promise<void> {
    try {
      await db.update(proxies)
        .set({ 
          status,
          lastChecked: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(proxies.id, id));
    } catch (error) {
      console.error('Error updating proxy status:', error);
    }
  }

  /**
   * Lấy proxies đang online
   */
  static async findOnline(): Promise<Proxy[]> {
    try {
      return await db.select().from(proxies).where(eq(proxies.status, 'online'));
    } catch (error) {
      console.error('Error finding online proxies:', error);
      return [];
    }
  }

  /**
   * Lấy proxies theo group
   */
  static async findByGroupId(groupId: number): Promise<Proxy[]> {
    try {
      const result = await db.select({
        proxy: proxies,
      })
      .from(proxies)
      .innerJoin(proxyGroupMembers, eq(proxies.id, proxyGroupMembers.proxyId))
      .where(eq(proxyGroupMembers.groupId, groupId));

      return result.map(r => r.proxy);
    } catch (error) {
      console.error('Error finding proxies by group ID:', error);
      return [];
    }
  }

  /**
   * Lấy số lượng profiles đang sử dụng proxy
   */
  static async getUsageCount(proxyId: number): Promise<number> {
    try {
      const result = await db.select({
        count: sql<number>`COUNT(*)`,
      })
      .from(profiles)
      .where(eq(profiles.proxyId, proxyId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting proxy usage count:', error);
      return 0;
    }
  }

  /**
   * Import nhiều proxies
   */
  static async importProxies(proxiesData: ProxyCreateInput[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const proxyData of proxiesData) {
      try {
        await this.create(proxyData);
        success++;
      } catch (error) {
        console.error('Error importing proxy:', error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Kiểm tra IP:Port có trùng không
   */
  static async existsByAddress(ip: string, port: number, excludeId?: number): Promise<boolean> {
    try {
      let baseQuery = db.select({ id: proxies.id })
        .from(proxies)
        .where(sql`${proxies.ip} = ${ip} AND ${proxies.port} = ${port}`);

      if (excludeId) {
        baseQuery = db.select({ id: proxies.id })
          .from(proxies)
          .where(sql`${proxies.ip} = ${ip} AND ${proxies.port} = ${port} AND ${proxies.id} != ${excludeId}`);
      }

      const result = await baseQuery.limit(1);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if proxy address exists:', error);
      return false;
    }
  }

  // Alias methods for API compatibility
  static async getById(id: string): Promise<Proxy | null> {
    return this.findById(parseInt(id));
  }

  static async getAll(): Promise<Proxy[]> {
    return this.findAll();
  }

  /**
   * Tìm proxy theo IP và Port
   */
  static async findByAddress(ip: string, port: number): Promise<Proxy | null> {
    try {
      const result = await db.select().from(proxies)
        .where(sql`${proxies.ip} = ${ip} AND ${proxies.port} = ${port}`)
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding proxy by address:', error);
      return null;
    }
  }
}

// Converter Functions để transform data giữa các layers
export const ProxyConverter = {
  /**
   * Convert database Proxy to API response format
   */
  toAPI(dbData: Proxy, groupName?: string): APIProxyResponse {
    return {
      id: dbData.id.toString(),
      name: dbData.name,
      type: dbData.type,
      address: `${dbData.ip}:${dbData.port}`,
      location: dbData.location || '',
      status: dbData.status as 'online' | 'offline',
      group: groupName,
      username: dbData.username || undefined,
      password: dbData.password || undefined
    };
  },

  /**
   * Convert array of database Proxies to API response format
   */
  toAPIArray(dbData: Proxy[], groupNames?: Record<number, string>): APIProxyResponse[] {
    return dbData.map(proxy => this.toAPI(proxy, groupNames?.[proxy.id]));
  },

  /**
   * Convert API create request to database format
   */
  fromCreateRequest(apiData: APICreateProxyRequest): ProxyCreateInput {
    return {
      name: apiData.name,
      ip: apiData.host,
      port: apiData.port,
      type: apiData.type,
      username: apiData.username,
      password: apiData.password,
      location: apiData.location
    };
  },

  /**
   * Convert API update request to database format
   */
  fromUpdateRequest(apiData: APIUpdateProxyRequest): ProxyUpdateInput {
    const updateData: ProxyUpdateInput = {};
    
    if (apiData.name !== undefined) updateData.name = apiData.name;
    if (apiData.host !== undefined) updateData.ip = apiData.host;
    if (apiData.port !== undefined) updateData.port = apiData.port;
    if (apiData.type !== undefined) updateData.type = apiData.type;
    if (apiData.username !== undefined) updateData.username = apiData.username;
    if (apiData.password !== undefined) updateData.password = apiData.password;
    if (apiData.location !== undefined) updateData.location = apiData.location;

    return updateData;
  },

  /**
   * Convert proxy config with timestamps to API format
   */
  configToAPI(config: any): APIProxyConfig {
    return {
      enabled: config.enabled,
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      status: config.status,
      lastChecked: config.lastChecked ? new Date(config.lastChecked).toISOString() : undefined
    };
  },

  /**
   * Create test response
   */
  toTestResponse(success: boolean, ping?: number, error?: string): APIProxyTestResponse {
    return {
      success,
      ping,
      error
    };
  },

  /**
   * Create import response
   */
  toImportResponse(success: boolean, count: number): APIImportProxiesResponse {
    return {
      success,
      count
    };
  },

  /**
   * Create delete response
   */
  toDeleteResponse(success: boolean): APIDeleteResponse {
    return {
      success
    };
  },

  /**
   * Create find proxy response
   */
  toFindResponse(proxy: Proxy, groupName?: string): APIFindProxyResponse {
    return {
      proxy: this.toAPI(proxy, groupName)
    };
  }
}