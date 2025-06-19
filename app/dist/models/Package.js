"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageConverter = exports.PackageModel = void 0;
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
class PackageModel {
    /**
     * Tìm package theo ID
     */
    static async findById(id) {
        try {
            const result = await db_1.db.select().from(schema_1.packages).where((0, drizzle_orm_1.eq)(schema_1.packages.id, id)).limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding package by ID:', error);
            return null;
        }
    }
    /**
     * Tìm package theo tier và type
     */
    static async findByTierAndType(tier, type) {
        try {
            const result = await db_1.db.select().from(schema_1.packages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.packages.tier, tier), (0, drizzle_orm_1.eq)(schema_1.packages.type, type), (0, drizzle_orm_1.eq)(schema_1.packages.active, true)))
                .limit(1);
            return result[0] || null;
        }
        catch (error) {
            console.error('Error finding package by tier and type:', error);
            return null;
        }
    }
    /**
     * Lấy tất cả packages với filters
     */
    static async getPackages(filters) {
        try {
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.packages.active, true)];
            if (filters?.type) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.packages.type, filters.type));
            }
            if (filters?.search) {
                conditions.push((0, drizzle_orm_1.like)(schema_1.packages.name, `%${filters.search}%`));
            }
            if (filters?.minPrice) {
                conditions.push((0, drizzle_orm_1.gte)(schema_1.packages.priceMonthly, filters.minPrice));
            }
            if (filters?.maxPrice) {
                conditions.push((0, drizzle_orm_1.lte)(schema_1.packages.priceMonthly, filters.maxPrice));
            }
            return await db_1.db.select()
                .from(schema_1.packages)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.packages.popular), schema_1.packages.priceMonthly);
        }
        catch (error) {
            console.error('Error getting packages:', error);
            return [];
        }
    }
    /**
     * Tạo package mới
     */
    static async create(packageData) {
        try {
            const newPackage = {
                tier: packageData.tier,
                type: packageData.type,
                name: packageData.name,
                description: packageData.description || null,
                features: JSON.stringify(packageData.features),
                recommendedFor: packageData.recommendedFor || null,
                minMembers: packageData.minMembers,
                maxMembers: packageData.maxMembers,
                priceMonthly: packageData.priceMonthly,
                priceSemiAnnual: packageData.priceSemiAnnual,
                priceAnnual: packageData.priceAnnual,
                popular: packageData.popular || false,
                maxProfiles: packageData.maxProfiles || null,
                maxWorkflows: packageData.maxWorkflows || null,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const result = await db_1.db.insert(schema_1.packages).values(newPackage).returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error creating package:', error);
            return null;
        }
    }
    /**
     * Cập nhật package
     */
    static async update(id, packageData) {
        try {
            const updateData = {
                name: packageData.name,
                description: packageData.description,
                recommendedFor: packageData.recommendedFor,
                minMembers: packageData.minMembers,
                maxMembers: packageData.maxMembers,
                priceMonthly: packageData.priceMonthly,
                priceSemiAnnual: packageData.priceSemiAnnual,
                priceAnnual: packageData.priceAnnual,
                popular: packageData.popular,
                maxProfiles: packageData.maxProfiles,
                maxWorkflows: packageData.maxWorkflows,
                active: packageData.active,
                updatedAt: new Date(),
            };
            if (packageData.features) {
                updateData.features = JSON.stringify(packageData.features);
            }
            const result = await db_1.db.update(schema_1.packages)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.packages.id, id))
                .returning();
            return result[0] || null;
        }
        catch (error) {
            console.error('Error updating package:', error);
            return null;
        }
    }
    /**
     * Parse features JSON
     */
    static parseFeatures(featuresJson) {
        if (!featuresJson)
            return [];
        try {
            return JSON.parse(featuresJson);
        }
        catch (error) {
            console.error('Error parsing features data:', error);
            return [];
        }
    }
    /**
     * Lấy package ID theo tier và type (để tương thích với service)
     */
    static async getPackageById(id) {
        if (id.includes('_')) {
            const [tier, type] = id.split('_');
            return this.findByTierAndType(tier, type);
        }
        return this.findById(parseInt(id));
    }
}
exports.PackageModel = PackageModel;
/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
exports.PackageConverter = {
    /**
     * Convert từ Database format → API Response format
     */
    toAPI(dbPackage) {
        try {
            const features = PackageModel.parseFeatures(dbPackage.features);
            // Tạo pricing options theo API format
            const pricingOptions = [
                {
                    period: 'monthly',
                    monthlyPrice: dbPackage.priceMonthly,
                    totalPrice: dbPackage.priceMonthly,
                    discount: 0
                },
                {
                    period: 'quarterly',
                    monthlyPrice: dbPackage.priceMonthly,
                    totalPrice: dbPackage.priceMonthly * 3 * 0.9, // 10% discount
                    discount: 10
                },
                {
                    period: 'annual',
                    monthlyPrice: dbPackage.priceMonthly,
                    totalPrice: dbPackage.priceAnnual,
                    discount: Math.round((1 - dbPackage.priceAnnual / (dbPackage.priceMonthly * 12)) * 100)
                }
            ];
            // Format features theo API
            const formattedFeatures = features.map((feature) => ({
                name: feature.name || feature,
                description: feature.description || '',
                included: feature.included !== false,
                limit: feature.limit || undefined
            }));
            return {
                id: `${dbPackage.tier}_${dbPackage.type}`, // Tạo composite ID
                tier: dbPackage.tier,
                type: dbPackage.type,
                name: dbPackage.name,
                description: dbPackage.description || '',
                pricingOptions: pricingOptions,
                features: formattedFeatures,
                popular: dbPackage.popular || false,
                maxProfiles: dbPackage.maxProfiles,
                maxWorkflows: dbPackage.maxWorkflows
            };
        }
        catch (error) {
            console.error('Error converting package to API format:', error);
            throw error;
        }
    },
    /**
     * Convert từ API Request → Database format
     */
    fromAPI(apiData) {
        const result = {};
        if (apiData.tier)
            result.tier = apiData.tier;
        if (apiData.type)
            result.type = apiData.type;
        if (apiData.name)
            result.name = apiData.name;
        if (apiData.description)
            result.description = apiData.description;
        if (apiData.features)
            result.features = JSON.stringify(apiData.features);
        if (apiData.popular !== undefined)
            result.popular = apiData.popular;
        if (apiData.maxProfiles)
            result.maxProfiles = apiData.maxProfiles;
        if (apiData.maxWorkflows)
            result.maxWorkflows = apiData.maxWorkflows;
        return result;
    }
};
