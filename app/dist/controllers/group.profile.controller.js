"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupProfileController = void 0;
const group_profile_1 = require("../services/group.profile");
class GroupProfileController {
    /**
     * Handle requests from main.js routing for /api/profiles/group/*
     * Parse method and URL to call appropriate method
     */
    static async handleRequest(method, url, data, headers = {}, authenticatedUser = null) {
        try {
            // Parse URL path: /api/profiles/group/123 -> /123
            const urlParts = url.split('/').filter(part => part !== '');
            const path = '/' + urlParts.slice(3).join('/'); // Remove 'api', 'profiles', 'group'
            switch (method) {
                case 'GET':
                    if (path === '/') {
                        return await this.handleGetAllGroups();
                    }
                    else if (path.match(/^\/\d+$/)) {
                        // /123
                        const id = parseInt(path.substring(1));
                        return await this.handleGetGroupById(id);
                    }
                    else if (path.match(/^\/\d+\/profiles$/)) {
                        // /123/profiles
                        const id = parseInt(path.split('/')[1]);
                        return await this.handleGetProfilesInGroup(id);
                    }
                    else {
                        throw new Error(`Unknown GET route: ${path}`);
                    }
                case 'POST':
                    if (path === '/') {
                        return await this.handleCreateGroup(data);
                    }
                    else if (path.match(/^\/\d+\/profiles$/)) {
                        // /123/profiles
                        const id = parseInt(path.split('/')[1]);
                        return await this.handleAddProfilesToGroup(id, data);
                    }
                    else if (path.match(/^\/\d+\/remove-profiles$/)) {
                        // /123/remove-profiles
                        const id = parseInt(path.split('/')[1]);
                        return await this.handleRemoveProfilesFromGroup(id, data);
                    }
                    else {
                        throw new Error(`Unknown POST route: ${path}`);
                    }
                case 'PATCH':
                    if (path.match(/^\/\d+$/)) {
                        // /123
                        const id = parseInt(path.substring(1));
                        return await this.handleUpdateGroup(id, data);
                    }
                    else {
                        throw new Error(`Unknown PATCH route: ${path}`);
                    }
                case 'DELETE':
                    if (path.match(/^\/\d+$/)) {
                        // /123
                        const id = parseInt(path.substring(1));
                        return await this.handleDeleteGroup(id);
                    }
                    else {
                        throw new Error(`Unknown DELETE route: ${path}`);
                    }
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        }
        catch (error) {
            console.error('GroupProfileController.handleRequest error:', error);
            throw error;
        }
    }
    // Embedded handlers that call business logic directly
    static async handleGetAllGroups() {
        try {
            const formattedGroups = await group_profile_1.GroupProfileService.getAllGroups();
            return formattedGroups;
        }
        catch (error) {
            console.error("Error getting all groups:", error);
            throw new Error("Internal server error");
        }
    }
    static async handleGetGroupById(groupId) {
        try {
            if (isNaN(groupId)) {
                throw new Error("Invalid group ID");
            }
            const formattedGroup = await group_profile_1.GroupProfileService.getGroupById(groupId);
            if (!formattedGroup) {
                throw new Error("Group not found");
            }
            return formattedGroup;
        }
        catch (error) {
            console.error("Error getting group by ID:", error);
            throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
    }
    static async handleCreateGroup(data) {
        try {
            const { name, description, type } = data;
            if (!name || name.trim() === "") {
                throw new Error("Group name is required");
            }
            const formattedGroup = await group_profile_1.GroupProfileService.createGroup({
                name: name.trim(),
                description: description?.trim() || "",
                type: type || "profile",
            });
            if (!formattedGroup) {
                throw new Error("Failed to create group");
            }
            return formattedGroup;
        }
        catch (error) {
            console.error("Error creating group:", error);
            throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
    }
    static async handleUpdateGroup(groupId, data) {
        try {
            if (isNaN(groupId)) {
                throw new Error("Invalid group ID");
            }
            const { name, description } = data;
            const updatedGroup = await group_profile_1.GroupProfileService.updateGroup(groupId, {
                name: name?.trim(),
                description: description?.trim(),
            });
            if (!updatedGroup) {
                throw new Error("Group not found or failed to update");
            }
            return updatedGroup;
        }
        catch (error) {
            console.error("Error updating group:", error);
            throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
    }
    static async handleDeleteGroup(groupId) {
        try {
            if (isNaN(groupId)) {
                throw new Error("Invalid group ID");
            }
            const deleted = await group_profile_1.GroupProfileService.deleteGroup(groupId);
            if (!deleted) {
                throw new Error("Failed to delete group");
            }
            return { success: true };
        }
        catch (error) {
            console.error("Error deleting group:", error);
            throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
    }
    static async handleAddProfilesToGroup(groupId, data) {
        try {
            const { profileIds, newGroupName } = data;
            const result = await group_profile_1.GroupProfileService.addProfilesToGroup(groupId, profileIds, newGroupName);
            if (!result) {
                throw new Error("Failed to add profiles to group");
            }
            if (typeof result === "string") {
                throw new Error(result);
            }
            return result;
        }
        catch (error) {
            console.error("Error adding profiles to group:", error);
            throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
    }
    static async handleRemoveProfilesFromGroup(groupId, data) {
        try {
            if (isNaN(groupId)) {
                throw new Error("Invalid group ID");
            }
            const { profileIds } = data;
            const result = await group_profile_1.GroupProfileService.removeProfilesFromGroup(groupId, profileIds);
            if (!result) {
                throw new Error("Failed to remove profiles from group");
            }
            if (typeof result === "string") {
                throw new Error(result);
            }
            return result;
        }
        catch (error) {
            console.error("Error removing profiles from group:", error);
            throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
    }
    static async handleGetProfilesInGroup(groupId) {
        try {
            if (isNaN(groupId)) {
                throw new Error("Invalid group ID");
            }
            const profiles = await group_profile_1.GroupProfileService.getProfilesInGroup(groupId);
            return profiles;
        }
        catch (error) {
            console.error("Error getting profiles in group:", error);
            throw new Error("Internal server error");
        }
    }
}
exports.GroupProfileController = GroupProfileController;
