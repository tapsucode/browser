import { ProfileModel } from "../models/Profile";
import { ProfileGroupModel } from "../models/ProfileGroup";
import { ProfileGroupMemberModel } from "../models/ProfileGroupMember";
import { UtilService } from "../utils/utils.service";

interface CreateGroupData {
  name: string;
  description: string;
  type: string;
}

interface UpdateGroupData {
  name?: string;
  description?: string;
}

export class GroupProfileService {
  static async getAllGroups() {
    const groups = await ProfileGroupModel.findAll();
    return Promise.all(
      groups.map(async (group) => ({
        id: group.id.toString(),
        name: group.name,
        description: group.description || "",
        profileCount: await ProfileGroupMemberModel.countByGroupId(group.id),
      })),
    );
  }

  static async getGroupById(groupId: number) {
    const group = await ProfileGroupModel.findById(groupId);
    if (!group) {
      return null;
    }
    const profileCount = await ProfileGroupMemberModel.countByGroupId(group.id);
    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description || "",
      profileCount: profileCount,
    };
  }

  static async createGroup(groupData: CreateGroupData) {
    const newGroup = await ProfileGroupModel.create(groupData);
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

  static async updateGroup(groupId: number, updateData: UpdateGroupData) {
    const existingGroup = await ProfileGroupModel.findById(groupId);
    if (!existingGroup) {
      return null;
    }
    const updatedGroup = await ProfileGroupModel.update(groupId, updateData);
    if (!updatedGroup) {
      return null;
    }
    const profileCount = await ProfileGroupMemberModel.countByGroupId(
      updatedGroup.id,
    );
    return {
      id: updatedGroup.id.toString(),
      name: updatedGroup.name,
      description: updatedGroup.description || "",
      profileCount: profileCount,
    };
  }

  static async addProfilesToGroup(
    groupId: number | undefined,
    profileIds: string[],
    newGroupName?: string,
  ) {
    let targetGroupId = groupId;

    if (newGroupName && newGroupName.trim()) {
      const newGroup = await ProfileGroupModel.create({
        name: newGroupName.trim(),
        description: `Auto-created group for profiles`,
      });
      if (!newGroup) {
        return "Failed to create new group";
      }
      targetGroupId = newGroup.id;
    } else {
      if (targetGroupId === undefined || isNaN(targetGroupId)) {
        return "Invalid group ID";
      }
      const existingGroup = await ProfileGroupModel.findById(targetGroupId);
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
      const profile = await ProfileModel.findById(profileId);
      if (!profile) {
        return `Profile ${profileId} not found`;
      }
    }

    const addResult = await ProfileGroupModel.addProfiles(
      targetGroupId!,
      numericProfileIds,
    );
    if (!addResult) {
      return "Failed to add profiles to group";
    }

    const updatedGroup = await ProfileGroupModel.findById(targetGroupId!);
    const profiles = await ProfileGroupModel.getProfiles(targetGroupId!);

    return {
      id: updatedGroup!.id.toString(),
      name: updatedGroup!.name,
      description: updatedGroup!.description || "",
      profileCount: profiles.length,
    };
  }

  static async removeProfilesFromGroup(groupId: number, profileIds: string[]) {
    if (isNaN(groupId)) {
      return "Invalid group ID";
    }

    const existingGroup = await ProfileGroupModel.findById(groupId);
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

    const removeResult = await ProfileGroupModel.removeProfiles(
      groupId,
      numericProfileIds,
    );
    if (!removeResult) {
      return "Failed to remove profiles from group";
    }

    const profiles = await ProfileGroupModel.getProfiles(groupId);

    return {
      id: existingGroup.id.toString(),
      name: existingGroup.name,
      description: existingGroup.description || "",
      profileCount: profiles.length,
    };
  }

  static async getProfilesInGroup(groupId: number) {
    if (isNaN(groupId)) {
      return []; // Or throw an error
    }
    const existingGroup = await ProfileGroupModel.findById(groupId);
    if (!existingGroup) {
      return []; // Or throw an error
    }
    const profiles = await ProfileGroupModel.getProfiles(groupId);
    return Promise.all(
      profiles.map(async (profile) => {
        const proxyAddress = profile.proxyId
          ? await UtilService.getProxyAddress(profile.proxyId)
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
          fingerprint: ProfileModel.parseFingerprintData(
            profile.fingerprint || "{}",
          ),
        };
      }),
    );
  }

  static async deleteGroup(groupId: number) {
    if (isNaN(groupId)) {
      return false;
    }
    const existingGroup = await ProfileGroupModel.findById(groupId);
    if (!existingGroup) {
      return false;
    }
    await ProfileGroupMemberModel.removeAllFromGroup(groupId);
    return await ProfileGroupModel.delete(groupId);
  }
}
