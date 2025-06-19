"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileGroupMemberModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const Profile_1 = require("./Profile");
class ProfileGroupMemberModel {
    /**
     * Add a profile to a group
     */
    static async addProfileToGroup(groupId, profileId) {
        try {
            // Check if relationship already exists
            const existing = await db_1.db
                .select()
                .from(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId), (0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.profileId, profileId)))
                .limit(1);
            if (existing.length > 0) {
                return existing[0]; // Already exists
            }
            // Create new relationship
            const result = await db_1.db
                .insert(schema_1.profileGroupMembers)
                .values({
                groupId,
                profileId
            })
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error adding profile to group:', error);
            return null;
        }
    }
    /**
     * Remove a profile from a group
     */
    static async removeProfileFromGroup(groupId, profileId) {
        try {
            const result = await db_1.db
                .delete(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId), (0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.profileId, profileId)));
            return result.changes > 0;
        }
        catch (error) {
            console.error('Error removing profile from group:', error);
            return false;
        }
    }
    /**
     * Remove all profiles from a group
     */
    static async removeAllFromGroup(groupId) {
        try {
            await db_1.db
                .delete(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId));
            return true;
        }
        catch (error) {
            console.error('Error removing all profiles from group:', error);
            return false;
        }
    }
    /**
     * Count profiles in a group
     */
    static async countByGroupId(groupId) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId));
            return result.length;
        }
        catch (error) {
            console.error('Error counting profiles in group:', error);
            return 0;
        }
    }
    /**
     * Get all profiles in a group
     */
    static async getProfilesByGroupId(groupId) {
        try {
            // Get profile IDs in the group
            const members = await db_1.db
                .select()
                .from(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId));
            if (members.length === 0) {
                return [];
            }
            // Get profile details
            const profiles = [];
            for (const member of members) {
                const profile = await Profile_1.ProfileModel.findById(member.profileId);
                if (profile) {
                    profiles.push(profile);
                }
            }
            return profiles;
        }
        catch (error) {
            console.error('Error getting profiles by group ID:', error);
            return [];
        }
    }
    /**
     * Get groups that contain a specific profile
     */
    static async getGroupsByProfileId(profileId) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.profileId, profileId));
            return result;
        }
        catch (error) {
            console.error('Error getting groups by profile ID:', error);
            return [];
        }
    }
    /**
     * Check if a profile is in a specific group
     */
    static async isProfileInGroup(groupId, profileId) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId), (0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.profileId, profileId)))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking if profile is in group:', error);
            return false;
        }
    }
    /**
     * Get all members of a group with profile details
     */
    static async findByGroupId(groupId) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId));
            return result;
        }
        catch (error) {
            console.error('Error finding members by group ID:', error);
            return [];
        }
    }
}
exports.ProfileGroupMemberModel = ProfileGroupMemberModel;
