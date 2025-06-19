import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/errors";
import { type AuthenticatedUser } from "../middleware/auth.middleware";

export class ProfileController {
  /**
   * Handle requests from main.js routing for /api/profiles/*
   * Parse method and URL to call appropriate method
   */
  static async handleRequest(method: string, url: string, data: any, headers: any = {}, authenticatedUser: AuthenticatedUser | null = null): Promise<any> {
    try {
      // Parse URL path: /api/profiles/123 -> /123
      const urlParts = url.split('/').filter(part => part !== '');
      const path = '/' + urlParts.slice(2).join('/'); // Remove 'api', 'profiles'
      
      switch (method) {
        case 'GET':
          if (path === '/') {
            return await this.handleGetAllProfiles();
          } else if (path === '/fingerprint-data') {
            return await this.handleGetFingerprintData();
          } else if (path.match(/^\/\d+$/)) {
            // /123
            const id = parseInt(path.substring(1));
            return await this.handleGetProfileById(id);
          } else if (path.match(/^\/\d+\/export$/)) {
            // /123/export
            const id = parseInt(path.split('/')[1]);
            return await this.handleExportProfiles([id]);
          } else {
            // Handle export with query params
            if (path.includes('export')) {
              const ids = data?.ids || [];
              return await this.handleExportProfiles(ids);
            }
            throw new Error(`Unknown GET route: ${path}`);
          }
          
        case 'POST':
          if (path === '/') {
            return await this.handleCreateProfile(data);
          } else if (path === '/import') {
            return await this.handleImportProfiles(data);
          } else {
            throw new Error(`Unknown POST route: ${path}`);
          }
          
        case 'PATCH':
          if (path.match(/^\/\d+$/)) {
            // /123
            const id = parseInt(path.substring(1));
            return await this.handleUpdateProfile(id, data);
          } else {
            throw new Error(`Unknown PATCH route: ${path}`);
          }
          
        case 'DELETE':
          if (path.match(/^\/\d+$/)) {
            // /123
            const id = parseInt(path.substring(1));
            return await this.handleDeleteProfile(id);
          } else {
            throw new Error(`Unknown DELETE route: ${path}`);
          }
          
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      console.error('ProfileController.handleRequest error:', error);
      throw error;
    }
  }

  // Embedded handlers that call business logic directly
  private static async handleCreateProfile(data: any): Promise<any> {
    try {
      // Kiểm tra xem có phải là tạo hàng loạt hay không dựa trên dữ liệu
      const isBulkCreation = data.isBulk || (data.count && parseInt(data.count) > 1);

      if (isBulkCreation) {
        // Gọi service để tạo hàng loạt
        const result = await ProfileService.createBulkProfiles(data);
        return result;
      } else {
        // Gọi service để tạo đơn lẻ dựa trên thông tin proxy
        const proxyMethod = data.proxySource || data.proxy || data.proxyMethod || "none";

        let result;
        if (proxyMethod === "none") {
          result = await ProfileService.createIndividualProfileWithoutProxy(data);
        } else if (proxyMethod === "import") {
          result = await ProfileService.createIndividualProfileWithProxy(data);
        } else {
          throw new Error(`Unsupported proxy method for individual profile creation. Supported: none, import. Received: ${proxyMethod}`);
        }
        return result;
      }
    } catch (error) {
      console.error("Error in createProfile:", error);

      // Xử lý AppError với statusCode tùy chỉnh
      if (error instanceof AppError) {
        throw new Error(error.message);
      }

      // Xử lý các lỗi validation thông thường
      if (error instanceof Error) {
        if (
          error.message.includes("required") ||
          error.message.includes("Invalid") ||
          error.message.includes("Count must be between 1 and 100") ||
          error.message.includes("Profile name prefix is required") ||
          error.message.includes("Proxy group is required") ||
          error.message.includes("Selected proxy group not found") ||
          error.message.includes("Selected proxy group is empty") ||
          error.message.includes('Proxy list is required when proxy source is set to "import"') ||
          error.message.includes("No valid proxies found in the import list")
        ) {
          throw new Error(error.message);
        }
      }

      throw new Error("Internal server error");
    }
  }

  private static async handleGetAllProfiles(): Promise<any> {
    try {
      const profiles = await ProfileService.getAllProfiles();
      return profiles;
    } catch (error) {
      console.error("Error getting all profiles:", error);
      throw new Error("Internal server error");
    }
  }

  private static async handleGetProfileById(profileId: number): Promise<any> {
    try {
      if (isNaN(profileId)) {
        throw new Error("Invalid profile ID");
      }
      const profile = await ProfileService.getProfileById(profileId);
      return profile;
    } catch (error) {
      console.error("Error getting profile by ID:", error);

      // Xử lý AppError với statusCode tùy chỉnh
      if (error instanceof AppError) {
        throw new Error(error.message);
      }

      // Xử lý lỗi thông thường
      if (error instanceof Error && error.message === "Profile not found") {
        throw new Error(error.message);
      }

      throw new Error("Internal server error");
    }
  }

  private static async handleUpdateProfile(profileId: number, data: any): Promise<any> {
    try {
      if (isNaN(profileId)) {
        throw new Error("Invalid profile ID");
      }
      const updatedProfile = await ProfileService.updateProfile(profileId, data);
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);

      // Xử lý AppError với statusCode tùy chỉnh
      if (error instanceof AppError) {
        throw new Error(error.message);
      }

      // Xử lý lỗi thông thường
      if (error instanceof Error && error.message === "Profile not found or update failed") {
        throw new Error(error.message);
      }

      throw new Error("Internal server error");
    }
  }

  private static async handleDeleteProfile(profileId: number): Promise<any> {
    try {
      if (isNaN(profileId)) {
        throw new Error("Invalid profile ID");
      }
      const deleted = await ProfileService.deleteProfile(profileId);
      if (!deleted) {
        throw new Error("Profile not found");
      }
      return { success: true };
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw new Error(error instanceof Error ? error.message : "Internal server error");
    }
  }

  private static async handleImportProfiles(profiles: any): Promise<any> {
    try {
      const result = await ProfileService.importProfiles(profiles);
      return result;
    } catch (error) {
      console.error("Error importing profiles:", error);
      throw new Error("Failed to import profiles");
    }
  }

  private static async handleExportProfiles(ids?: number[]): Promise<any> {
    try {
      const profiles = await ProfileService.exportProfiles(ids);
      return profiles;
    } catch (error) {
      console.error("Error exporting profiles:", error);
      throw new Error("Failed to export profiles");
    }
  }

  private static async handleGetFingerprintData(): Promise<any> {
    try {
      const dataPath = path.join(__dirname, '../data/fingerprint-data.json');
      const jsonData = fs.readFileSync(dataPath, 'utf8');
      const fingerprintData = JSON.parse(jsonData);
      return fingerprintData;
    } catch (error) {
      console.error('Error reading fingerprint data:', error);
      throw new Error('Failed to get fingerprint data');
    }
  }


}