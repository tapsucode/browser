"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyConverter = exports.ProxyModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProxyModel {
    /**
     * Tìm proxy theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.proxies).where((0, drizzle_orm_1.eq)(schema_1.proxies.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding proxy by ID:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả proxies
     */
    static async findAll() {
        try {
            return await db_1.db.select().from(schema_1.proxies);
        }
        catch (error) {
            console.error('Error finding all proxies:', error);
            return [];
        }
    }
    /**
     * Tạo proxy mới
     */
    static async create(proxyData) {
        try {
            const newProxy = {
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
            const result = await db_1.db.insert(schema_1.proxies).values(newProxy).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating proxy:', error);
            return null;
        }
    }
    /**
     * Cập nhật proxy
     */
    static async update(id, proxyData) {
        try {
            const updateData = {
                ...proxyData,
                updatedAt: new Date(),
            };
            const result = await db_1.db.update(schema_1.proxies)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.proxies.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating proxy:', error);
            return null;
        }
    }
    /**
     * Xóa proxy
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.proxies).where((0, drizzle_orm_1.eq)(schema_1.proxies.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting proxy:', error);
            return false;
        }
    }
    /**
     * Kiểm tra proxy hoạt động
     */
    static async testConnection(id) {
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
        }
        catch (error) {
            console.error('Error testing proxy connection:', error);
            return { success: false, error: 'Test failed' };
        }
    }
    /**
     * Cập nhật trạng thái proxy
     */
    static async updateStatus(id, status) {
        try {
            await db_1.db.update(schema_1.proxies)
                .set({
                status,
                lastChecked: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.proxies.id, id));
        }
        catch (error) {
            console.error('Error updating proxy status:', error);
        }
    }
    /**
     * Lấy proxies đang online
     */
    static async findOnline() {
        try {
            return await db_1.db.select().from(schema_1.proxies).where((0, drizzle_orm_1.eq)(schema_1.proxies.status, 'online'));
        }
        catch (error) {
            console.error('Error finding online proxies:', error);
            return [];
        }
    }
    /**
     * Lấy proxies theo group
     */
    static async findByGroupId(groupId) {
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
            console.error('Error finding proxies by group ID:', error);
            return [];
        }
    }
    /**
     * Lấy số lượng profiles đang sử dụng proxy
     */
    static async getUsageCount(proxyId) {
        try {
            const result = await db_1.db.select({
                count: (0, drizzle_orm_1.sql) `COUNT(*)`,
            })
                .from(schema_1.profiles)
                .where((0, drizzle_orm_1.eq)(schema_1.profiles.proxyId, proxyId));
            return result[0]?.count || 0;
        }
        catch (error) {
            console.error('Error getting proxy usage count:', error);
            return 0;
        }
    }
    /**
     * Import nhiều proxies
     */
    static async importProxies(proxiesData) {
        let success = 0;
        let failed = 0;
        for (const proxyData of proxiesData) {
            try {
                await this.create(proxyData);
                success++;
            }
            catch (error) {
                console.error('Error importing proxy:', error);
                failed++;
            }
        }
        return { success, failed };
    }
    /**
     * Kiểm tra IP:Port có trùng không
     */
    static async existsByAddress(ip, port, excludeId) {
        try {
            let baseQuery = db_1.db.select({ id: schema_1.proxies.id })
                .from(schema_1.proxies)
                .where((0, drizzle_orm_1.sql) `${schema_1.proxies.ip} = ${ip} AND ${schema_1.proxies.port} = ${port}`);
            if (excludeId) {
                baseQuery = db_1.db.select({ id: schema_1.proxies.id })
                    .from(schema_1.proxies)
                    .where((0, drizzle_orm_1.sql) `${schema_1.proxies.ip} = ${ip} AND ${schema_1.proxies.port} = ${port} AND ${schema_1.proxies.id} != ${excludeId}`);
            }
            const result = await baseQuery.limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if proxy address exists:', error);
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
     * Tìm proxy theo IP và Port
     */
    static async findByAddress(ip, port) {
        try {
            const result = await db_1.db.select().from(schema_1.proxies)
                .where((0, drizzle_orm_1.sql) `${schema_1.proxies.ip} = ${ip} AND ${schema_1.proxies.port} = ${port}`)
                .limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding proxy by address:', error);
            return null;
        }
    }
}
exports.ProxyModel = ProxyModel;
// Converter Functions để transform data giữa các layers
exports.ProxyConverter = {
    /**
     * Convert database Proxy to API response format
     */
    toAPI(dbData, groupName) {
        return {
            id: dbData.id.toString(),
            name: dbData.name,
            type: dbData.type,
            address: `${dbData.ip}:${dbData.port}`,
            location: dbData.location || '',
            status: dbData.status,
            group: groupName,
            username: dbData.username || undefined,
            password: dbData.password || undefined
        };
    },
    /**
     * Convert array of database Proxies to API response format
     */
    toAPIArray(dbData, groupNames) {
        return dbData.map(proxy => this.toAPI(proxy, groupNames?.[proxy.id]));
    },
    /**
     * Convert API create request to database format
     */
    fromCreateRequest(apiData) {
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
    fromUpdateRequest(apiData) {
        const updateData = {};
        if (apiData.name !== undefined)
            updateData.name = apiData.name;
        if (apiData.host !== undefined)
            updateData.ip = apiData.host;
        if (apiData.port !== undefined)
            updateData.port = apiData.port;
        if (apiData.type !== undefined)
            updateData.type = apiData.type;
        if (apiData.username !== undefined)
            updateData.username = apiData.username;
        if (apiData.password !== undefined)
            updateData.password = apiData.password;
        if (apiData.location !== undefined)
            updateData.location = apiData.location;
        return updateData;
    },
    /**
     * Convert proxy config with timestamps to API format
     */
    configToAPI(config) {
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
    toTestResponse(success, ping, error) {
        return {
            success,
            ping,
            error
        };
    },
    /**
     * Create import response
     */
    toImportResponse(success, count) {
        return {
            success,
            count
        };
    },
    /**
     * Create delete response
     */
    toDeleteResponse(success) {
        return {
            success
        };
    },
    /**
     * Create find proxy response
     */
    toFindResponse(proxy, groupName) {
        return {
            proxy: this.toAPI(proxy, groupName)
        };
    }
};
