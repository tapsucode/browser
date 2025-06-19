"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileConverter = exports.ProfileModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProfileModel {
    /**
     * Chuyển đổi boolean sang integer cho Chrome flags
     * @param boolValue - true/false từ API
     * @param intValue - giá trị integer khi true (5, 10, 100...)
     * @returns integer hoặc null
     */
    static booleanToInt(boolValue, intValue = 10) {
        return boolValue === true ? intValue : null;
    }
    /**
     * Chuyển đổi integer sang boolean cho API response
     * @param intValue - integer từ database
     * @returns boolean cho API
     */
    static intToBoolean(intValue) {
        return intValue !== null && intValue !== undefined;
    }
    /**
     * Tìm profile theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.profiles).where((0, drizzle_orm_1.eq)(schema_1.profiles.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding profile by ID:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả profiles
     */
    static async findAll() {
        try {
            return await db_1.db.select().from(schema_1.profiles);
        }
        catch (error) {
            console.error('Error finding all profiles:', error);
            return [];
        }
    }
    /**
     * Tạo profile mới
     */
    static async create(profileData) {
        try {
            const newProfile = {
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
            const result = await db_1.db.insert(schema_1.profiles).values(newProfile).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating profile:', error);
            return null;
        }
    }
    /**
     * Cập nhật profile
     */
    static async update(id, profileData) {
        try {
            const updateData = {
                updatedAt: new Date(),
            };
            // Copy basic fields
            if (profileData.name !== undefined)
                updateData.name = profileData.name;
            if (profileData.accountType !== undefined)
                updateData.accountType = profileData.accountType;
            if (profileData.osType !== undefined)
                updateData.osType = profileData.osType;
            if (profileData.browserType !== undefined)
                updateData.browserType = profileData.browserType;
            if (profileData.browserVersion !== undefined)
                updateData.browserVersion = profileData.browserVersion;
            if (profileData.status !== undefined)
                updateData.status = profileData.status;
            if (profileData.proxyId !== undefined)
                updateData.proxyId = profileData.proxyId;
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
            const result = await db_1.db.update(schema_1.profiles)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.profiles.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating profile:', error);
            return null;
        }
    }
    /**
     * Xóa profile
     */
    static async delete(id) {
        try {
            await db_1.db.delete(schema_1.profiles).where((0, drizzle_orm_1.eq)(schema_1.profiles.id, id));
            return true;
        }
        catch (error) {
            console.error('Error deleting profile:', error);
            return false;
        }
    }
    /**
     * Tìm profiles theo proxy ID
     */
    static async findByProxyId(proxyId) {
        try {
            return await db_1.db.select().from(schema_1.profiles).where((0, drizzle_orm_1.eq)(schema_1.profiles.proxyId, proxyId));
        }
        catch (error) {
            console.error('Error finding profiles by proxy ID:', error);
            return [];
        }
    }
    /**
     * Lấy profile với thông tin proxy
     */
    static async findWithProxy(id) {
        try {
            const result = await db_1.db.select({
                profile: schema_1.profiles,
                proxy: schema_1.proxies,
            })
                .from(schema_1.profiles)
                .leftJoin(schema_1.proxies, (0, drizzle_orm_1.eq)(schema_1.profiles.proxyId, schema_1.proxies.id))
                .where((0, drizzle_orm_1.eq)(schema_1.profiles.id, id))
                .limit(1);
            if (!result[0])
                return null;
            return {
                ...result[0].profile,
                proxy: result[0].proxy,
            };
        }
        catch (error) {
            console.error('Error finding profile with proxy:', error);
            return null;
        }
    }
    /**
     * Lấy profiles trong group
     */
    static async findByGroupId(groupId) {
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
            console.error('Error finding profiles by group ID:', error);
            return [];
        }
    }
    /**
     * Thêm profile vào group
     */
    static async addToGroup(profileId, groupId) {
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
     * Xóa profile khỏi group
     */
    static async removeFromGroup(profileId, groupId) {
        try {
            await db_1.db.delete(schema_1.profileGroupMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.profileId, profileId), (0, drizzle_orm_1.eq)(schema_1.profileGroupMembers.groupId, groupId)));
            return true;
        }
        catch (error) {
            console.error('Error removing profile from group:', error);
            return false;
        }
    }
    /**
     * Update last used time
     */
    static async updateLastUsed(id) {
        try {
            await db_1.db.update(schema_1.profiles)
                .set({ lastUsed: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.profiles.id, id));
        }
        catch (error) {
            console.error('Error updating last used:', error);
        }
    }
    /**
     * Parse fingerprint data
     */
    static parseFingerprintData(fingerprintJson) {
        try {
            return JSON.parse(fingerprintJson);
        }
        catch (error) {
            console.error('Error parsing fingerprint data:', error);
            return {};
        }
    }
    /**
     * Parse account details
     */
    static parseAccountDetails(accountDetailsJson) {
        if (!accountDetailsJson)
            return {};
        try {
            return JSON.parse(accountDetailsJson);
        }
        catch (error) {
            console.error('Error parsing account details:', error);
            return {};
        }
    }
}
exports.ProfileModel = ProfileModel;
/**
 * ProfileConverter - Chuyển đổi giữa Database format và API format
 */
class ProfileConverter {
    /**
     * Chuyển đổi từ Database format sang API format
     */
    static toAPI(dbProfile, proxyInfo) {
        const fingerprint = ProfileModel.parseFingerprintData(dbProfile.fingerprint);
        const accountDetails = ProfileModel.parseAccountDetails(dbProfile.accountDetails);
        // Rebuild fingerprint with both JSON data and DB fields
        const apiFingerprint = {
            ...fingerprint,
            // Convert back to appropriate types for API
            canvas: dbProfile.canvasProtection || fingerprint.canvas,
            webGL: ProfileModel.intToBoolean(dbProfile.webglProtection) ? (dbProfile.webglProtection ?? undefined) : undefined,
            audioContext: ProfileModel.intToBoolean(dbProfile.audioContextProtection) ? (dbProfile.audioContextProtection ?? undefined) : undefined,
            fonts: ProfileModel.intToBoolean(dbProfile.fontsProtection) ? (dbProfile.fontsProtection ?? undefined) : undefined,
            clientRects: ProfileModel.intToBoolean(dbProfile.clientRectsProtection) ? (dbProfile.clientRectsProtection ?? undefined) : undefined,
            webRtcMode: dbProfile.webrtcMode,
            webRtcCustomIp: dbProfile.webrtcCustomIp || undefined,
            hardwareConcurrency: dbProfile.hardwareConcurrency || undefined,
            deviceMemory: dbProfile.deviceMemory || undefined,
            doNotTrack: dbProfile.doNotTrack || undefined,
        };
        // Determine proxy status and address
        let proxyStatus = 'disconnected';
        let proxyAddress;
        if (proxyInfo) {
            proxyStatus = 'connected';
            proxyAddress = `${proxyInfo.ip || proxyInfo.host}:${proxyInfo.port}`;
        }
        else if (dbProfile.proxyId) {
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
    static fromAPI(apiData) {
        const fingerprint = {
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
    static fromAPIUpdate(apiData) {
        const result = {};
        if (apiData.name !== undefined)
            result.name = apiData.name;
        if (apiData.accountType !== undefined)
            result.accountType = apiData.accountType;
        if (apiData.osType !== undefined)
            result.osType = apiData.osType;
        if (apiData.browserType !== undefined)
            result.browserType = apiData.browserType;
        if (apiData.browserVersion !== undefined)
            result.browserVersion = apiData.browserVersion;
        if (apiData.status !== undefined)
            result.status = apiData.status;
        if (apiData.proxyId !== undefined)
            result.proxyId = apiData.proxyId ? parseInt(apiData.proxyId) : null;
        if (apiData.accountDetails !== undefined)
            result.accountDetails = apiData.accountDetails;
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
    static toAPIList(dbProfiles, proxyInfoMap) {
        return dbProfiles.map(profile => {
            const proxyInfo = proxyInfoMap?.get(profile.proxyId || 0);
            return ProfileConverter.toAPI(profile, proxyInfo);
        });
    }
}
exports.ProfileConverter = ProfileConverter;
