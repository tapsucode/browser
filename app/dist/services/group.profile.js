"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupProfileService = void 0;
const Profile_1 = require("../models/Profile");
const ProfileGroup_1 = require("../models/ProfileGroup");
const ProfileGroupMember_1 = require("../models/ProfileGroupMember");
const utils_service_1 = require("../utils/utils.service");
class GroupProfileService {
    static async getAllGroups() {
        const groups = await ProfileGroup_1.ProfileGroupModel.findAll();
        return Promise.all(groups.map(async (group) => ({
            id: group.id.toString(),
            name: group.name,
            description: group.description || "",
            profileCount: await ProfileGroupMember_1.ProfileGroupMemberModel.countByGroupId(group.id),
        })));
    }
    static async getGroupById(groupId) {
        const group = await ProfileGroup_1.ProfileGroupModel.findById(groupId);
        if (!group) {
            return null;
        }
        const profileCount = await ProfileGroupMember_1.ProfileGroupMemberModel.countByGroupId(group.id);
        return {
            id: group.id.toString(),
            name: group.name,
            description: group.description || "",
            profileCount: profileCount,
        };
    }
    static async createGroup(groupData) {
        const newGroup = await ProfileGroup_1.ProfileGroupModel.create(groupData);
        if (!newGroup) {
            return null;
        }
        return {
            id: newGroup.id.toString(),
            name: newGroup.name,
            description: newGroup.description || "",
            profileCount: 0,
        };
    }
    static async updateGroup(groupId, updateData) {
        const existingGroup = await ProfileGroup_1.ProfileGroupModel.findById(groupId);
        if (!existingGroup) {
            return null;
        }
        const updatedGroup = await ProfileGroup_1.ProfileGroupModel.update(groupId, updateData);
        if (!updatedGroup) {
            return null;
        }
        const profileCount = await ProfileGroupMember_1.ProfileGroupMemberModel.countByGroupId(updatedGroup.id);
        return {
            id: updatedGroup.id.toString(),
            name: updatedGroup.name,
            description: updatedGroup.description || "",
            profileCount: profileCount,
        };
    }
    static async addProfilesToGroup(groupId, profileIds, newGroupName) {
        let targetGroupId = groupId;
        if (newGroupName && newGroupName.trim()) {
            const newGroup = await ProfileGroup_1.ProfileGroupModel.create({
                name: newGroupName.trim(),
                description: `Auto-created group for profiles`,
            });
            if (!newGroup) {
                return "Failed to create new group";
            }
            targetGroupId = newGroup.id;
        }
        else {
            if (targetGroupId === undefined || isNaN(targetGroupId)) {
                return "Invalid group ID";
            }
            const existingGroup = await ProfileGroup_1.ProfileGroupModel.findById(targetGroupId);
            if (!existingGroup) {
                return "Group not found";
            }
        }
        if (!Array.isArray(profileIds) || profileIds.length === 0) {
            return "Profile IDs are required";
        }
        const numericProfileIds = profileIds
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));
        if (numericProfileIds.length === 0) {
            return "No valid profile IDs provided";
        }
        // Verify all profiles exist
        for (const profileId of numericProfileIds) {
            const profile = await Profile_1.ProfileModel.findById(profileId);
            if (!profile) {
                return `Profile ${profileId} not found`;
            }
        }
        const addResult = await ProfileGroup_1.ProfileGroupModel.addProfiles(targetGroupId, numericProfileIds);
        if (!addResult) {
            return "Failed to add profiles to group";
        }
        const updatedGroup = await ProfileGroup_1.ProfileGroupModel.findById(targetGroupId);
        const profiles = await ProfileGroup_1.ProfileGroupModel.getProfiles(targetGroupId);
        return {
            id: updatedGroup.id.toString(),
            name: updatedGroup.name,
            description: updatedGroup.description || "",
            profileCount: profiles.length,
        };
    }
    static async removeProfilesFromGroup(groupId, profileIds) {
        if (isNaN(groupId)) {
            return "Invalid group ID";
        }
        const existingGroup = await ProfileGroup_1.ProfileGroupModel.findById(groupId);
        if (!existingGroup) {
            return "Group not found";
        }
        if (!Array.isArray(profileIds) || profileIds.length === 0) {
            return "Profile IDs are required";
        }
        const numericProfileIds = profileIds
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));
        if (numericProfileIds.length === 0) {
            return "No valid profile IDs provided";
        }
        const removeResult = await ProfileGroup_1.ProfileGroupModel.removeProfiles(groupId, numericProfileIds);
        if (!removeResult) {
            return "Failed to remove profiles from group";
        }
        const profiles = await ProfileGroup_1.ProfileGroupModel.getProfiles(groupId);
        return {
            id: existingGroup.id.toString(),
            name: existingGroup.name,
            description: existingGroup.description || "",
            profileCount: profiles.length,
        };
    }
    static async getProfilesInGroup(groupId) {
        if (isNaN(groupId)) {
            return []; // Or throw an error
        }
        const existingGroup = await ProfileGroup_1.ProfileGroupModel.findById(groupId);
        if (!existingGroup) {
            return []; // Or throw an error
        }
        const profiles = await ProfileGroup_1.ProfileGroupModel.getProfiles(groupId);
        return Promise.all(profiles.map(async (profile) => {
            const proxyAddress = profile.proxyId
                ? await utils_service_1.UtilService.getProxyAddress(profile.proxyId)
                : undefined;
            return {
                id: profile.id.toString(),
                name: profile.name,
                osType: profile.osType,
                browserType: profile.browserType,
                browserVersion: profile.browserVersion,
                proxyStatus: proxyAddress ? "connected" : "disconnected",
                proxyAddress: proxyAddress,
                lastUsed: profile.lastUsed?.toISOString() || new Date().toISOString(),
                status: profile.status,
                fingerprint: Profile_1.ProfileModel.parseFingerprintData(profile.fingerprint || "{}"),
            };
        }));
    }
    static async deleteGroup(groupId) {
        if (isNaN(groupId)) {
            return false;
        }
        const existingGroup = await ProfileGroup_1.ProfileGroupModel.findById(groupId);
        if (!existingGroup) {
            return false;
        }
        await ProfileGroupMember_1.ProfileGroupMemberModel.removeAllFromGroup(groupId);
        return await ProfileGroup_1.ProfileGroupModel.delete(groupId);
    }
}
exports.GroupProfileService = GroupProfileService;
