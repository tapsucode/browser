import { db } from '../db';
import { profileGroupMembers } from '../schema';
import { eq, and } from 'drizzle-orm';
import { ProfileModel } from './Profile';

export type ProfileGroupMember = typeof profileGroupMembers.$inferSelect;
export type ProfileGroupMemberCreateInput = typeof profileGroupMembers.$inferInsert;

export class ProfileGroupMemberModel {
  /**
   * Add a profile to a group
   */
  static async addProfileToGroup(groupId: number, profileId: number): Promise<ProfileGroupMember | null> {
    try {
      // Check if relationship already exists
      const existing = await db
        .select()
        .from(profileGroupMembers)
        .where(
          and(
            eq(profileGroupMembers.groupId, groupId),
            eq(profileGroupMembers.profileId, profileId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0]; // Already exists
      }

      // Create new relationship
      const result = await db
        .insert(profileGroupMembers)
        .values({
          groupId,
          profileId
        })
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error adding profile to group:', error);
      return null;
    }
  }

  /**
   * Remove a profile from a group
   */
  static async removeProfileFromGroup(groupId: number, profileId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(profileGroupMembers)
        .where(
          and(
            eq(profileGroupMembers.groupId, groupId),
            eq(profileGroupMembers.profileId, profileId)
          )
        );

      return result.changes > 0;
    } catch (error) {
      console.error('Error removing profile from group:', error);
      return false;
    }
  }

  /**
   * Remove all profiles from a group
   */
  static async removeAllFromGroup(groupId: number): Promise<boolean> {
    try {
      await db
        .delete(profileGroupMembers)
        .where(eq(profileGroupMembers.groupId, groupId));

      return true;
    } catch (error) {
      console.error('Error removing all profiles from group:', error);
      return false;
    }
  }

  /**
   * Count profiles in a group
   */
  static async countByGroupId(groupId: number): Promise<number> {
    try {
      const result = await db
        .select()
        .from(profileGroupMembers)
        .where(eq(profileGroupMembers.groupId, groupId));

      return result.length;
    } catch (error) {
      console.error('Error counting profiles in group:', error);
      return 0;
    }
  }

  /**
   * Get all profiles in a group
   */
  static async getProfilesByGroupId(groupId: number): Promise<any[]> {
    try {
      // Get profile IDs in the group
      const members = await db
        .select()
        .from(profileGroupMembers)
        .where(eq(profileGroupMembers.groupId, groupId));

      if (members.length === 0) {
        return [];
      }

      // Get profile details
      const profiles = [];
      for (const member of members) {
        const profile = await ProfileModel.findById(member.profileId);
        if (profile) {
          profiles.push(profile);
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error getting profiles by group ID:', error);
      return [];
    }
  }

  /**
   * Get groups that contain a specific profile
   */
  static async getGroupsByProfileId(profileId: number): Promise<ProfileGroupMember[]> {
    try {
      const result = await db
        .select()
        .from(profileGroupMembers)
        .where(eq(profileGroupMembers.profileId, profileId));

      return result;
    } catch (error) {
      console.error('Error getting groups by profile ID:', error);
      return [];
    }
  }

  /**
   * Check if a profile is in a specific group
   */
  static async isProfileInGroup(groupId: number, profileId: number): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(profileGroupMembers)
        .where(
          and(
            eq(profileGroupMembers.groupId, groupId),
            eq(profileGroupMembers.profileId, profileId)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Error checking if profile is in group:', error);
      return false;
    }
  }

  /**
   * Get all members of a group with profile details
   */
  static async findByGroupId(groupId: number): Promise<ProfileGroupMember[]> {
    try {
      const result = await db
        .select()
        .from(profileGroupMembers)
        .where(eq(profileGroupMembers.groupId, groupId));

      return result;
    } catch (error) {
      console.error('Error finding members by group ID:', error);
      return [];
    }
  }
}