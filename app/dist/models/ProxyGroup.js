"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyGroupConverter = exports.ProxyGroupModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProxyGroupModel {
    /**
     * Tìm group theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.proxyGroups).where((0, drizzle_orm_1.eq)(schema_1.proxyGroups.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding proxy group by ID:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả groups
     */
    static async findAll() {
        try {
            return await db_1.db.select().from(schema_1.proxyGroups);
        }
        catch (error) {
            console.error('Error finding all proxy groups:', error);
            return [];
        }
    }
    /**
     * Tạo group mới
     */
    static async create(groupData) {
        try {
            const newGroup = {
                name: groupData.name,
                description: groupData.description || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = await db_1.db.insert(schema_1.proxyGroups).values(newGroup).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating proxy group:', error);
            return null;
        }
    }
    /**
     * Cập nhật group
     */
    static async update(id, groupData) {
        try {
            const updateData = {
                ...groupData,
                updatedAt: new Date(),
            };
            const result = await db_1.db.update(schema_1.proxyGroups)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.proxyGroups.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating proxy group:', error);
            return null;
        }
    }
    /**
     * Xóa group
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.proxyGroups).where((0, drizzle_orm_1.eq)(schema_1.proxyGroups.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting proxy group:', error);
            return false;
        }
    }
    /**
     * Lấy group với số lượng proxies
     */
    static async findWithProxyCount() {
        try {
            const result = await db_1.db.select({
                group: schema_1.proxyGroups,
                proxyCount: (0, drizzle_orm_1.sql) `COALESCE(COUNT(${schema_1.proxyGroupMembers.proxyId}), 0)`,
            })
                .from(schema_1.proxyGroups)
                .leftJoin(schema_1.proxyGroupMembers, (0, drizzle_orm_1.eq)(schema_1.proxyGroups.id, schema_1.proxyGroupMembers.groupId))
                .groupBy(schema_1.proxyGroups.id);
            return result.map(r => ({
                ...r.group,
                proxyCount: r.proxyCount,
            }));
        }
        catch (error) {
            console.error('Error finding proxy groups with count:', error);
            return [];
        }
    }
    /**
     * Lấy proxies trong group
     */
    static async getProxies(groupId) {
        try {
            const result = await db_1.db.select({
                proxy: schema_1.proxies,
            })
                .from(schema_1.proxies)
                .innerJoin(schema_1.proxyGroupMembers, (0, drizzle_orm_1.eq)(schema_1.proxies.id, schema_1.proxyGroupMembers.proxyId))
                .where((0, drizzle_orm_1.eq)(schema_1.proxyGroupMembers.groupId, groupId));
            return result.map(r => r.proxy);
        }
        catch (error) {
            console.error('Error getting proxies in group:', error);
            return [];
        }
    }
    /**
     * Thêm nhiều proxies vào group
     */
    static async addProxies(groupId, proxyIds) {
        try {
            const values = proxyIds.map(proxyId => ({
                proxyId,
                groupId,
            }));
            await db_1.db.insert(schema_1.proxyGroupMembers).values(values);
            return true;
        }
        catch (error) {
            console.error('Error adding proxies to group:', error);
            return false;
        }
    }
    /**
     * Xóa proxy khỏi group
     */
    static async removeProxy(groupId, proxyId) {
        try {
            await db_1.db.delete(schema_1.proxyGroupMembers)
                .where((0, drizzle_orm_1.sql) `${schema_1.proxyGroupMembers.groupId} = ${groupId} AND ${schema_1.proxyGroupMembers.proxyId} = ${proxyId}`);
            return true;
        }
        catch (error) {
            console.error('Error removing proxy from group:', error);
            return false;
        }
    }
    /**
     * Kiểm tra group có tồn tại không
     */
    static async exists(id) {
        try {
            const result = await db_1.db.select({ id: schema_1.proxyGroups.id })
                .from(schema_1.proxyGroups)
                .where((0, drizzle_orm_1.eq)(schema_1.proxyGroups.id, id))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if proxy group exists:', error);
            return false;
        }
    }
    /**
     * Kiểm tra tên group có trùng không
     */
    static async existsByName(name, excludeId) {
        try {
            let baseQuery = db_1.db.select({ id: schema_1.proxyGroups.id })
                .from(schema_1.proxyGroups)
                .where((0, drizzle_orm_1.eq)(schema_1.proxyGroups.name, name));
            if (excludeId) {
                baseQuery = db_1.db.select({ id: schema_1.proxyGroups.id })
                    .from(schema_1.proxyGroups)
                    .where((0, drizzle_orm_1.sql) `${schema_1.proxyGroups.name} = ${name} AND ${schema_1.proxyGroups.id} != ${excludeId}`);
            }
            const result = await baseQuery.limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if proxy group name exists:', error);
            return false;
        }
    }
    // Alias methods for API compatibility
    static async getById(id) {
        return this.findById(parseInt(id));
    }
    static async getAll() {
        return this.findAll();
    }
    /**
     * Xóa nhiều proxy khỏi group
     */
    static async removeProxies(groupId, proxyIds) {
        try {
            for (const proxyId of proxyIds) {
                await this.removeProxy(groupId, proxyId);
            }
            return true;
        }
        catch (error) {
            console.error('Error removing proxies from group:', error);
            return false;
        }
    }
}
exports.ProxyGroupModel = ProxyGroupModel;
// Converter Functions để transform data giữa các layers
exports.ProxyGroupConverter = {
    /**
     * Convert database ProxyGroup to API response format
     */
    toAPI(dbData) {
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
    toAPIArray(dbData) {
        return dbData.map(group => this.toAPI(group));
    },
    /**
     * Convert API create request to database format
     */
    fromCreateRequest(apiData) {
        return {
            name: apiData.name,
            description: apiData.description
        };
    },
    /**
     * Create manage group response
     */
    toManageResponse(success) {
        return {
            success
        };
    }
};
