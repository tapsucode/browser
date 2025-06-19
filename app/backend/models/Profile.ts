import { db } from '../db';
import { profiles, proxies, profileGroupMembers, profileGroups, type Profile, type InsertProfile } from '../schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface FingerprintData {
  vendor?: string;
  renderer?: string;
  userAgent?: string;
  timezone?: string;
  language?: string;
  resolution?: string;
  platform?: string;
  doNotTrack?: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  webRtcMode?: 'real' | 'proxy' | 'disable' | 'custom'; // 4 trạng thái WebRTC
  webRtcCustomIp?: string; // IP tùy chỉnh khi mode = 'custom'
  canvas?: number; // API: number [-0.3,0.3], DB: number
  webGL?: number; // API: boolean, DB: integer (0/1)
  audioContext?: number; // API: boolean, DB: integer (0/1)
  fonts?: number;
  clientRects?: number; // Random 1-10000
  plugins?: {name: string, version: string}[];
  [key: string]: any;
}

export interface AccountDetails {
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  cookies?: string;
  localStorageData?: Record<string, any>;
  [key: string]: any;
}

export interface ProfileCreateInput {
  name: string;
  fingerprint: FingerprintData;
  proxyId?: number;
  accountType: string;
  accountDetails?: AccountDetails;
  osType: string;
  browserType: string;
  browserVersion: string;
}

export interface ProfileUpdateInput {
  name?: string;
  fingerprint?: FingerprintData;
  proxyId?: number | null;
  accountType?: string;
  accountDetails?: AccountDetails;
  osType?: string;
  browserType?: string;
  browserVersion?: string;
  status?: 'active' | 'idle';
}

export class ProfileModel {
  /**
   * Chuyển đổi boolean sang integer cho Chrome flags
   * @param boolValue - true/false từ API
   * @param intValue - giá trị integer khi true (5, 10, 100...)
   * @returns integer hoặc null
   */
  private static booleanToInt(boolValue?: boolean, intValue: number = 10): number | null {
    return boolValue === true ? intValue : null;
  }

  /**
   * Chuyển đổi integer sang boolean cho API response
   * @param intValue - integer từ database
   * @returns boolean cho API
   */
  static intToBoolean(intValue?: number | null): boolean {
    return intValue !== null && intValue !== undefined;
  }

  /**
   * Tìm profile theo ID
   */
  static async findById(id: number): Promise<Profile | null> {
    try {
      const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding profile by ID:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả profiles
   */
  static async findAll(): Promise<Profile[]> {
    try {
      return await db.select().from(profiles);
    } catch (error) {
      console.error('Error finding all profiles:', error);
      return [];
    }
  }

  /**
   * Tạo profile mới
   */
  static async create(profileData: ProfileCreateInput): Promise<Profile | null> {
    try {
      const newProfile: InsertProfile = {
        name: profileData.name,
        fingerprint: JSON.stringify(profileData.fingerprint),
        proxyId: profileData.proxyId || null,
        accountType: profileData.accountType,
        accountDetails: profileData.accountDetails ? JSON.stringify(profileData.accountDetails) : null,
        osType: profileData.osType,
        browserType: profileData.browserType,
        browserVersion: profileData.browserVersion,
        status: 'active',
        // Xử lý WebRTC mode và custom IP
        webrtcMode: profileData.fingerprint.webRtcMode || 'real',
        webrtcCustomIp: profileData.fingerprint.webRtcCustomIp || null,
        // Chuyển đổi và xử lý protection flags
        webrtcProtection: typeof profileData.fingerprint.webGL === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.webGL, 10) : (typeof profileData.fingerprint.webGL === 'number' ? profileData.fingerprint.webGL : null),
        canvasProtection: typeof profileData.fingerprint.canvas === 'number' ? profileData.fingerprint.canvas : (typeof profileData.fingerprint.canvas === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.canvas, 15) : null),
        webglProtection: typeof profileData.fingerprint.webGL === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.webGL, 25) : (typeof profileData.fingerprint.webGL === 'number' ? profileData.fingerprint.webGL : null),
        audioContextProtection: typeof profileData.fingerprint.audioContext === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.audioContext, 8) : (typeof profileData.fingerprint.audioContext === 'number' ? profileData.fingerprint.audioContext : null),
        fontsProtection: typeof profileData.fingerprint.fonts === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.fonts, 12) : (typeof profileData.fingerprint.fonts === 'number' ? profileData.fingerprint.fonts : null),
        clientRectsProtection: typeof profileData.fingerprint.clientRects === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.clientRects, 7) : (typeof profileData.fingerprint.clientRects === 'number' ? profileData.fingerprint.clientRects : null),
        timezoneSpoof: typeof profileData.fingerprint.timezone === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.timezone, 5) : null,
        hardwareConcurrency: profileData.fingerprint.hardwareConcurrency || null,
        deviceMemory: profileData.fingerprint.deviceMemory || null,
        doNotTrack: profileData.fingerprint.doNotTrack || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(profiles).values(newProfile).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }

  /**
   * Cập nhật profile
   */
  static async update(id: number, profileData: ProfileUpdateInput): Promise<Profile | null> {
    try {
      const updateData: Partial<InsertProfile> = {
        updatedAt: new Date(),
      };

      // Copy basic fields
      if (profileData.name !== undefined) updateData.name = profileData.name;
      if (profileData.accountType !== undefined) updateData.accountType = profileData.accountType;
      if (profileData.osType !== undefined) updateData.osType = profileData.osType;
      if (profileData.browserType !== undefined) updateData.browserType = profileData.browserType;
      if (profileData.browserVersion !== undefined) updateData.browserVersion = profileData.browserVersion;
      if (profileData.status !== undefined) updateData.status = profileData.status;
      if (profileData.proxyId !== undefined) updateData.proxyId = profileData.proxyId;

      if (profileData.fingerprint) {
        updateData.fingerprint = JSON.stringify(profileData.fingerprint);
        
        // Update fingerprint-related fields
        updateData.webrtcMode = profileData.fingerprint.webRtcMode || 'real';
        updateData.webrtcCustomIp = profileData.fingerprint.webRtcCustomIp || null;
        updateData.webrtcProtection = typeof profileData.fingerprint.webGL === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.webGL, 10) : (typeof profileData.fingerprint.webGL === 'number' ? profileData.fingerprint.webGL : null);
        updateData.canvasProtection = typeof profileData.fingerprint.canvas === 'number' ? profileData.fingerprint.canvas : (typeof profileData.fingerprint.canvas === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.canvas, 15) : null);
        updateData.webglProtection = typeof profileData.fingerprint.webGL === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.webGL, 25) : (typeof profileData.fingerprint.webGL === 'number' ? profileData.fingerprint.webGL : null);
        updateData.audioContextProtection = typeof profileData.fingerprint.audioContext === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.audioContext, 8) : (typeof profileData.fingerprint.audioContext === 'number' ? profileData.fingerprint.audioContext : null);
        updateData.fontsProtection = typeof profileData.fingerprint.fonts === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.fonts, 12) : (typeof profileData.fingerprint.fonts === 'number' ? profileData.fingerprint.fonts : null);
        updateData.clientRectsProtection = typeof profileData.fingerprint.clientRects === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.clientRects, 7) : (typeof profileData.fingerprint.clientRects === 'number' ? profileData.fingerprint.clientRects : null);
        updateData.timezoneSpoof = typeof profileData.fingerprint.timezone === 'boolean' ? ProfileModel.booleanToInt(profileData.fingerprint.timezone, 5) : null;
        updateData.hardwareConcurrency = profileData.fingerprint.hardwareConcurrency || null;
        updateData.deviceMemory = profileData.fingerprint.deviceMemory || null;
        updateData.doNotTrack = profileData.fingerprint.doNotTrack || false;
      }

      if (profileData.accountDetails) {
        updateData.accountDetails = JSON.stringify(profileData.accountDetails);
      }

      const result = await db.update(profiles)
        .set(updateData)
        .where(eq(profiles.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Xóa profile
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db.delete(profiles).where(eq(profiles.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  /**
   * Tìm profiles theo proxy ID
   */
  static async findByProxyId(proxyId: number): Promise<Profile[]> {
    try {
      return await db.select().from(profiles).where(eq(profiles.proxyId, proxyId));
    } catch (error) {
      console.error('Error finding profiles by proxy ID:', error);
      return [];
    }
  }

  /**
   * Lấy profile với thông tin proxy
   */
  static async findWithProxy(id: number): Promise<(Profile & { proxy?: any }) | null> {
    try {
      const result = await db.select({
        profile: profiles,
        proxy: proxies,
      })
      .from(profiles)
      .leftJoin(proxies, eq(profiles.proxyId, proxies.id))
      .where(eq(profiles.id, id))
      .limit(1);

      if (!result[0]) return null;

      return {
        ...result[0].profile,
        proxy: result[0].proxy,
      };
    } catch (error) {
      console.error('Error finding profile with proxy:', error);
      return null;
    }
  }

  /**
   * Lấy profiles trong group
   */
  static async findByGroupId(groupId: number): Promise<Profile[]> {
    try {
      const result = await db.select({
        profile: profiles,
      })
      .from(profiles)
      .innerJoin(profileGroupMembers, eq(profiles.id, profileGroupMembers.profileId))
      .where(eq(profileGroupMembers.groupId, groupId));

      return result.map(r => r.profile);
    } catch (error) {
      console.error('Error finding profiles by group ID:', error);
      return [];
    }
  }

  /**
   * Thêm profile vào group
   */
  static async addToGroup(profileId: number, groupId: number): Promise<boolean> {
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
   * Xóa profile khỏi group
   */
  static async removeFromGroup(profileId: number, groupId: number): Promise<boolean> {
    try {
      await db.delete(profileGroupMembers)
        .where(and(
          eq(profileGroupMembers.profileId, profileId),
          eq(profileGroupMembers.groupId, groupId)
        ));
      return true;
    } catch (error) {
      console.error('Error removing profile from group:', error);
      return false;
    }
  }

  /**
   * Update last used time
   */
  static async updateLastUsed(id: number): Promise<void> {
    try {
      await db.update(profiles)
        .set({ lastUsed: new Date() })
        .where(eq(profiles.id, id));
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  }

  /**
   * Parse fingerprint data
   */
  static parseFingerprintData(fingerprintJson: string): FingerprintData {
    try {
      return JSON.parse(fingerprintJson);
    } catch (error) {
      console.error('Error parsing fingerprint data:', error);
      return {};
    }
  }

  /**
   * Parse account details
   */
  static parseAccountDetails(accountDetailsJson: string | null): AccountDetails {
    if (!accountDetailsJson) return {};
    try {
      return JSON.parse(accountDetailsJson);
    } catch (error) {
      console.error('Error parsing account details:', error);
      return {};
    }
  }
}

/**
 * ProfileConverter - Chuyển đổi giữa Database format và API format
 */
export class ProfileConverter {
  /**
   * Chuyển đổi từ Database format sang API format
   */
  static toAPI(dbProfile: Profile, proxyInfo?: any): any {
    const fingerprint = ProfileModel.parseFingerprintData(dbProfile.fingerprint);
    const accountDetails = ProfileModel.parseAccountDetails(dbProfile.accountDetails);

    // Rebuild fingerprint with both JSON data and DB fields
    const apiFingerprint: FingerprintData = {
      ...fingerprint,
      // Convert back to appropriate types for API
      canvas: dbProfile.canvasProtection || fingerprint.canvas,
      webGL: ProfileModel.intToBoolean(dbProfile.webglProtection) ? (dbProfile.webglProtection ?? undefined) : undefined,
      audioContext: ProfileModel.intToBoolean(dbProfile.audioContextProtection) ? (dbProfile.audioContextProtection ?? undefined) : undefined,
      fonts: ProfileModel.intToBoolean(dbProfile.fontsProtection) ? (dbProfile.fontsProtection ?? undefined) : undefined,
      clientRects: ProfileModel.intToBoolean(dbProfile.clientRectsProtection) ? (dbProfile.clientRectsProtection ?? undefined) : undefined,
      webRtcMode: dbProfile.webrtcMode as any,
      webRtcCustomIp: dbProfile.webrtcCustomIp || undefined,
      hardwareConcurrency: dbProfile.hardwareConcurrency || undefined,
      deviceMemory: dbProfile.deviceMemory || undefined,
      doNotTrack: dbProfile.doNotTrack || undefined,
    };

    // Determine proxy status and address
    let proxyStatus = 'disconnected';
    let proxyAddress: string | undefined;

    if (proxyInfo) {
      proxyStatus = 'connected';
      proxyAddress = `${proxyInfo.ip || proxyInfo.host}:${proxyInfo.port}`;
    } else if (dbProfile.proxyId) {
      proxyStatus = 'disconnected'; // Proxy assigned but not connected
    }

    return {
      id: dbProfile.id.toString(),
      name: dbProfile.name,
      osType: dbProfile.osType,
      browserType: dbProfile.browserType,
      browserVersion: dbProfile.browserVersion,
      proxyStatus,
      proxyAddress,
      lastUsed: dbProfile.lastUsed ? dbProfile.lastUsed.toISOString() : null,
      status: dbProfile.status,
      fingerprint: apiFingerprint,
      group: undefined, // Will be populated if needed
      accountDetails
    };
  }

  /**
   * Chuyển đổi từ API format sang Database input format
   */
  static fromAPI(apiData: any): ProfileCreateInput {
    const fingerprint: FingerprintData = {
      ...apiData.fingerprint,
      // Ensure webRTC fields are properly handled
      webRtcMode: apiData.fingerprint?.webRtcMode || 'real',
      webRtcCustomIp: apiData.fingerprint?.webRtcCustomIp || undefined,
    };

    return {
      name: apiData.name,
      fingerprint,
      proxyId: apiData.proxyId ? parseInt(apiData.proxyId) : undefined,
      accountType: apiData.accountType || 'general',
      accountDetails: apiData.accountDetails || {},
      osType: apiData.osType,
      browserType: apiData.browserType,
      browserVersion: apiData.browserVersion
    };
  }

  /**
   * Chuyển đổi từ API update format sang Database update format
   */
  static fromAPIUpdate(apiData: any): ProfileUpdateInput {
    const result: ProfileUpdateInput = {};

    if (apiData.name !== undefined) result.name = apiData.name;
    if (apiData.accountType !== undefined) result.accountType = apiData.accountType;
    if (apiData.osType !== undefined) result.osType = apiData.osType;
    if (apiData.browserType !== undefined) result.browserType = apiData.browserType;
    if (apiData.browserVersion !== undefined) result.browserVersion = apiData.browserVersion;
    if (apiData.status !== undefined) result.status = apiData.status;
    if (apiData.proxyId !== undefined) result.proxyId = apiData.proxyId ? parseInt(apiData.proxyId) : null;
    if (apiData.accountDetails !== undefined) result.accountDetails = apiData.accountDetails;

    if (apiData.fingerprint !== undefined) {
      result.fingerprint = {
        ...apiData.fingerprint,
        webRtcMode: apiData.fingerprint.webRtcMode || 'real',
        webRtcCustomIp: apiData.fingerprint.webRtcCustomIp || undefined,
      };
    }

    return result;
  }

  /**
   * Format profile list for API response
   */
  static toAPIList(dbProfiles: Profile[], proxyInfoMap?: Map<number, any>): any[] {
    return dbProfiles.map(profile => {
      const proxyInfo = proxyInfoMap?.get(profile.proxyId || 0);
      return ProfileConverter.toAPI(profile, proxyInfo);
    });
  }
}