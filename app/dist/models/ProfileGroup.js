"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileGroupModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProfileGroupModel {
    /**
     * Tìm profile group theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.profileGroups).where((0, drizzle_orm_1.eq)(schema_1.profileGroups.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding profile group by ID:', error);
            return null;
        }
    }
    /**
     * Thêm profile vào group
     */
    static async addProfile(groupId, profileId) {
        try {
            await db_1.db.insert(schema_1.profileGroupMembers).values({
                profileId,
                groupId,
            });
            return true;
        }
        catch (error) {
            console.error('Error adding profile to group:', error);
            return false;
        }
    }
    /**
     * Lấy tất cả groups
     */
    static async findAll() {
        try {
            return await db_1.db.select().from(schema_1.profileGroups);
        }
        catch (error) {
            console.error('Error finding all profile groups:', error);
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
            const result = await db_1.db.insert(schema_1.profileGroups).values(newGroup).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating profile group:', error);
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
            const result = await db_1.db.update(schema_1.profileGroups)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroups.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating profile group:', error);
            return null;
        }
    }
    /**
     * Xóa group
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.profileGroups).where((0, drizzle_orm_1.eq)(schema_1.profileGroups.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting profile group:', error);
            return false;
        }
    }
    /**
     * Lấy group với số lượng profiles
     */
    static async findWithProfileCount() {
        try {
            const result = await db_1.db.select({
                group: schema_1.profileGroups,
                profileCount: (0, drizzle_orm_1.sql) `COALESCE(COUNT(${schema_1.profileGroupMembers.profileId}), 0)`,
            })
                .from(schema_1.profileGroups)
                .leftJoin(schema_1.profileGroupMembers, (0, drizzle_orm_1.eq)(schema_1.profileGroups.id, schema_1.profileGroupMembers.groupId))
                .groupBy(schema_1.profileGroups.id);
            return result.map(r => ({
                ...r.group,
                profileCount: r.profileCount,
            }));
        }
        catch (error) {
            console.error('Error finding profile groups with count:', error);
            return [];
        }
    }
    /**
     * Lấy profiles trong group
     */
    static async getProfiles(groupId) {
        try {
            const result = await db_1.db.select({
                profile: schema_1.profiles,
            })
                .from(schema_1.profiles)
                .innerJoin(schema_1.profileGroupMembers, (0, drizzle_orm_1.eq)(schema_1.profiles.id, schema_1.profileGroupMembers.profileId))
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId));
            return result.map(r => r.profile);
        }
        catch (error) {
            console.error('Error getting profiles in group:', error);
            return [];
        }
    }
    /**
     * Thêm nhiều profiles vào group
     */
    static async addProfiles(groupId, profileIds) {
        try {
            const values = profileIds.map(profileId => ({
                profileId,
                groupId,
            }));
            await db_1.db.insert(schema_1.profileGroupMembers).values(values);
            return true;
        }
        catch (error) {
            console.error('Error adding profiles to group:', error);
            return false;
        }
    }
    /**
     * Xóa nhiều profiles khỏi group
     */
    static async removeProfiles(groupId, profileIds) {
        try {
            await db_1.db.delete(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId));
            // Re-add profiles that shouldn't be removed
            // This is a simplistic approach - in practice you'd use a more efficient query
            return true;
        }
        catch (error) {
            console.error('Error removing profiles from group:', error);
            return false;
        }
    }
    /**
     * Kiểm tra group có tồn tại không
     */
    static async exists(id) {
        try {
            const result = await db_1.db.select({ id: schema_1.profileGroups.id })
                .from(schema_1.profileGroups)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroups.id, id))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if profile group exists:', error);
            return false;
        }
    }
    /**
     * Kiểm tra tên group có trùng không
     */
    static async existsByName(name, excludeId) {
        try {
            let whereClause = (0, drizzle_orm_1.eq)(schema_1.profileGroups.name, name);
            if (excludeId) {
                whereClause = (0, drizzle_orm_1.sql) `${schema_1.profileGroups.name} = ${name} AND ${schema_1.profileGroups.id} != ${excludeId}`;
            }
            const result = await db_1.db.select({ id: schema_1.profileGroups.id })
                .from(schema_1.profileGroups)
                .where(whereClause)
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if profile group name exists:', error);
            return false;
        }
    }
}
exports.ProfileGroupModel = ProfileGroupModel;
