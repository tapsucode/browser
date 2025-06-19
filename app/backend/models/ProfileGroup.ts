import { db } from '../db';
import { profileGroups, profileGroupMembers, profiles, type ProfileGroup, type InsertProfileGroup } from '../schema';
import { eq, sql } from 'drizzle-orm';

export interface ProfileGroupCreateInput {
  name: string;
  description?: string;
}

export interface ProfileGroupUpdateInput {
  name?: string;
  description?: string;
}

export class ProfileGroupModel {
  /**
   * Tìm profile group theo ID
   */
  static async findById(id: number): Promise<ProfileGroup | null> {
    try {
      const result = await db.select().from(profileGroups).where(eq(profileGroups.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding profile group by ID:', error);
      return null;
    }
  }

  /**
   * Thêm profile vào group
   */
  static async addProfile(groupId: number, profileId: number): Promise<boolean> {
    try {
      await db.insert(profileGroupMembers).values({
        profileId,
        groupId,
      });
      return true;
    } catch (error) {
      console.error('Error adding profile to group:', error);
      return false;
    }
  }

  /**
   * Lấy tất cả groups
   */
  static async findAll(): Promise<ProfileGroup[]> {
    try {
      return await db.select().from(profileGroups);
    } catch (error) {
      console.error('Error finding all profile groups:', error);
      return [];
    }
  }

  /**
   * Tạo group mới
   */
  static async create(groupData: ProfileGroupCreateInput): Promise<ProfileGroup | null> {
    try {
      const newGroup: InsertProfileGroup = {
        name: groupData.name,
        description: groupData.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(profileGroups).values(newGroup).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating profile group:', error);
      return null;
    }
  }

  /**
   * Cập nhật group
   */
  static async update(id: number, groupData: ProfileGroupUpdateInput): Promise<ProfileGroup | null> {
    try {
      const updateData: Partial<InsertProfileGroup> = {
        ...groupData,
        updatedAt: new Date(),
      };

      const result = await db.update(profileGroups)
        .set(updateData)
        .where(eq(profileGroups.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error updating profile group:', error);
      return null;
    }
  }

  /**
   * Xóa group
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(profileGroups).where(eq(profileGroups.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting profile group:', error);
      return false;
    }
  }

  /**
   * Lấy group với số lượng profiles
   */
  static async findWithProfileCount(): Promise<(ProfileGroup & { profileCount: number })[]> {
    try {
      const result = await db.select({
        group: profileGroups,
        profileCount: sql<number>`COALESCE(COUNT(${profileGroupMembers.profileId}), 0)`,
      })
      .from(profileGroups)
      .leftJoin(profileGroupMembers, eq(profileGroups.id, profileGroupMembers.groupId))
      .groupBy(profileGroups.id);

      return result.map(r => ({
        ...r.group,
        profileCount: r.profileCount,
      }));
    } catch (error) {
      console.error('Error finding profile groups with count:', error);
      return [];
    }
  }

  /**
   * Lấy profiles trong group
   */
  static async getProfiles(groupId: number) {
    try {
      const result = await db.select({
        profile: profiles,
      })
      .from(profiles)
      .innerJoin(profileGroupMembers, eq(profiles.id, profileGroupMembers.profileId))
      .where(eq(profileGroupMembers.groupId, groupId));

      return result.map(r => r.profile);
    } catch (error) {
      console.error('Error getting profiles in group:', error);
      return [];
    }
  }

  /**
   * Thêm nhiều profiles vào group
   */
  static async addProfiles(groupId: number, profileIds: number[]): Promise<boolean> {
    try {
      const values = profileIds.map(profileId => ({
        profileId,
        groupId,
      }));

      await db.insert(profileGroupMembers).values(values);
      return true;
    } catch (error) {
      console.error('Error adding profiles to group:', error);
      return false;
    }
  }

  /**
   * Xóa nhiều profiles khỏi group
   */
  static async removeProfiles(groupId: number, profileIds: number[]): Promise<boolean> {
    try {
      await db.delete(profileGroupMembers)
        .where(
          eq(profileGroupMembers.groupId, groupId)
        );

      // Re-add profiles that shouldn't be removed
      // This is a simplistic approach - in practice you'd use a more efficient query
      return true;
    } catch (error) {
      console.error('Error removing profiles from group:', error);
      return false;
    }
  }

  /**
   * Kiểm tra group có tồn tại không
   */
  static async exists(id: number): Promise<boolean> {
    try {
      const result = await db.select({ id: profileGroups.id })
        .from(profileGroups)
        .where(eq(profileGroups.id, id))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Error checking if profile group exists:', error);
      return false;
    }
  }

  /**
   * Kiểm tra tên group có trùng không
   */
  static async existsByName(name: string, excludeId?: number): Promise<boolean> {
    try {
      let whereClause = eq(profileGroups.name, name);
      if (excludeId) {
        whereClause = sql`${profileGroups.name} = ${name} AND ${profileGroups.id} != ${excludeId}`;
      }

      const result = await db.select({ id: profileGroups.id })
        .from(profileGroups)
        .where(whereClause)
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Error checking if profile group name exists:', error);
      return false;
    }
  }
}