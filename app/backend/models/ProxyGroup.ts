import { db } from '../db';
import { proxyGroups, proxyGroupMembers, proxies, type ProxyGroup, type InsertProxyGroup } from '../schema';
import { eq, sql } from 'drizzle-orm';

export interface ProxyGroupCreateInput {
  name: string;
  description?: string;
}

export interface ProxyGroupUpdateInput {
  name?: string;
  description?: string;
}

// API Types - theo docs/api/proxy.api.md  
export interface APIProxyGroupResponse {
  id: string;
  name: string;
  description: string;
  proxyCount?: number;
}

export interface APICreateProxyGroupRequest {
  name: string;
  description: string;
}

export interface APIManageGroupProxiesRequest {
  proxyIds: string[];
}

export interface APIGroupManageResponse {
  success: boolean;
}

export class ProxyGroupModel {
  /**
   * Tìm group theo ID
   */
  static async findById(id: number): Promise<ProxyGroup | null> {
    try {
      const result = await db.select().from(proxyGroups).where(eq(proxyGroups.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding proxy group by ID:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả groups
   */
  static async findAll(): Promise<ProxyGroup[]> {
    try {
      return await db.select().from(proxyGroups);
    } catch (error) {
      console.error('Error finding all proxy groups:', error);
      return [];
    }
  }

  /**
   * Tạo group mới
   */
  static async create(groupData: ProxyGroupCreateInput): Promise<ProxyGroup | null> {
    try {
      const newGroup: InsertProxyGroup = {
        name: groupData.name,
        description: groupData.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(proxyGroups).values(newGroup).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating proxy group:', error);
      return null;
    }
  }

  /**
   * Cập nhật group
   */
  static async update(id: number, groupData: ProxyGroupUpdateInput): Promise<ProxyGroup | null> {
    try {
      const updateData: Partial<InsertProxyGroup> = {
        ...groupData,
        updatedAt: new Date(),
      };

      const result = await db.update(proxyGroups)
        .set(updateData)
        .where(eq(proxyGroups.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating proxy group:', error);
      return null;
    }
  }

  /**
   * Xóa group
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(proxyGroups).where(eq(proxyGroups.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting proxy group:', error);
      return false;
    }
  }

  /**
   * Lấy group với số lượng proxies
   */
  static async findWithProxyCount(): Promise<(ProxyGroup & { proxyCount: number })[]> {
    try {
      const result = await db.select({
        group: proxyGroups,
        proxyCount: sql<number>`COALESCE(COUNT(${proxyGroupMembers.proxyId}), 0)`,
      })
      .from(proxyGroups)
      .leftJoin(proxyGroupMembers, eq(proxyGroups.id, proxyGroupMembers.groupId))
      .groupBy(proxyGroups.id);

      return result.map(r => ({
        ...r.group,
        proxyCount: r.proxyCount,
      }));
    } catch (error) {
      console.error('Error finding proxy groups with count:', error);
      return [];
    }
  }

  /**
   * Lấy proxies trong group
   */
  static async getProxies(groupId: number) {
    try {
      const result = await db.select({
        proxy: proxies,
      })
      .from(proxies)
      .innerJoin(proxyGroupMembers, eq(proxies.id, proxyGroupMembers.proxyId))
      .where(eq(proxyGroupMembers.groupId, groupId));

      return result.map(r => r.proxy);
    } catch (error) {
      console.error('Error getting proxies in group:', error);
      return [];
    }
  }

  /**
   * Thêm nhiều proxies vào group
   */
  static async addProxies(groupId: number, proxyIds: number[]): Promise<boolean> {
    try {
      const values = proxyIds.map(proxyId => ({
        proxyId,
        groupId,
      }));

      await db.insert(proxyGroupMembers).values(values);
      return true;
    } catch (error) {
      console.error('Error adding proxies to group:', error);
      return false;
    }
  }

  /**
   * Xóa proxy khỏi group
   */
  static async removeProxy(groupId: number, proxyId: number): Promise<boolean> {
    try {
      await db.delete(proxyGroupMembers)
        .where(sql`${proxyGroupMembers.groupId} = ${groupId} AND ${proxyGroupMembers.proxyId} = ${proxyId}`);
      return true;
    } catch (error) {
      console.error('Error removing proxy from group:', error);
      return false;
    }
  }

  /**
   * Kiểm tra group có tồn tại không
   */
  static async exists(id: number): Promise<boolean> {
    try {
      const result = await db.select({ id: proxyGroups.id })
        .from(proxyGroups)
        .where(eq(proxyGroups.id, id))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if proxy group exists:', error);
      return false;
    }
  }

  /**
   * Kiểm tra tên group có trùng không
   */
  static async existsByName(name: string, excludeId?: number): Promise<boolean> {
    try {
      let baseQuery = db.select({ id: proxyGroups.id })
        .from(proxyGroups)
        .where(eq(proxyGroups.name, name));

      if (excludeId) {
        baseQuery = db.select({ id: proxyGroups.id })
          .from(proxyGroups)
          .where(sql`${proxyGroups.name} = ${name} AND ${proxyGroups.id} != ${excludeId}`);
      }

      const result = await baseQuery.limit(1);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if proxy group name exists:', error);
      return false;
    }
  }

  // Alias methods for API compatibility
  static async getById(id: string): Promise<ProxyGroup | null> {
    return this.findById(parseInt(id));
  }

  static async getAll(): Promise<ProxyGroup[]> {
    return this.findAll();
  }

  /**
   * Xóa nhiều proxy khỏi group
   */
  static async removeProxies(groupId: number, proxyIds: number[]): Promise<boolean> {
    try {
      for (const proxyId of proxyIds) {
        await this.removeProxy(groupId, proxyId);
      }
      return true;
    } catch (error) {
      console.error('Error removing proxies from group:', error);
      return false;
    }
  }
}

// Converter Functions để transform data giữa các layers
export const ProxyGroupConverter = {
  /**
   * Convert database ProxyGroup to API response format
   */
  toAPI(dbData: ProxyGroup & { proxyCount?: number }): APIProxyGroupResponse {
    return {
      id: dbData.id.toString(),
      name: dbData.name,
      description: dbData.description || '',
      proxyCount: dbData.proxyCount
    };
  },

  /**
   * Convert array of database ProxyGroups to API response format
   */
  toAPIArray(dbData: (ProxyGroup & { proxyCount?: number })[]): APIProxyGroupResponse[] {
    return dbData.map(group => this.toAPI(group));
  },

  /**
   * Convert API create request to database format
   */
  fromCreateRequest(apiData: APICreateProxyGroupRequest): ProxyGroupCreateInput {
    return {
      name: apiData.name,
      description: apiData.description
    };
  },

  /**
   * Create manage group response
   */
  toManageResponse(success: boolean): APIGroupManageResponse {
    return {
      success
    };
  }
}