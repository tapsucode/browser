
import { db } from '../db';
import { packages, type Package, type InsertPackage } from '../schema';
import { eq, and, like, gte, lte, desc } from 'drizzle-orm';

export interface PackageCreateInput {
  tier: string;
  type: string;
  name: string;
  description?: string;
  features: string[];
  recommendedFor?: string;
  minMembers: number;
  maxMembers: number;
  priceMonthly: number;
  priceSemiAnnual: number;
  priceAnnual: number;
  popular?: boolean;
  maxProfiles?: number;
  maxWorkflows?: number;
}

export interface PackageUpdateInput {
  name?: string;
  description?: string;
  features?: string[];
  recommendedFor?: string;
  minMembers?: number;
  maxMembers?: number;
  priceMonthly?: number;
  priceSemiAnnual?: number;
  priceAnnual?: number;
  popular?: boolean;
  maxProfiles?: number;
  maxWorkflows?: number;
  active?: boolean;
}

export interface PackageFilters {
  type?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class PackageModel {
  /**
   * Tìm package theo ID
   */
  static async findById(id: number): Promise<Package | null> {
    try {
      const result = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding package by ID:', error);
      return null;
    }
  }

  /**
   * Tìm package theo tier và type
   */
  static async findByTierAndType(tier: string, type: string): Promise<Package | null> {
    try {
      const result = await db.select().from(packages)
        .where(and(
          eq(packages.tier, tier),
          eq(packages.type, type),
          eq(packages.active, true)
        ))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding package by tier and type:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả packages với filters
   */
  static async getPackages(filters?: PackageFilters): Promise<Package[]> {
    try {
      const conditions = [eq(packages.active, true)];

      if (filters?.type) {
        conditions.push(eq(packages.type, filters.type));
      }

      if (filters?.search) {
        conditions.push(like(packages.name, `%${filters.search}%`));
      }

      if (filters?.minPrice) {
        conditions.push(gte(packages.priceMonthly, filters.minPrice));
      }

      if (filters?.maxPrice) {
        conditions.push(lte(packages.priceMonthly, filters.maxPrice));
      }

      return await db.select()
        .from(packages)
        .where(and(...conditions))
        .orderBy(desc(packages.popular), packages.priceMonthly);
    } catch (error) {
      console.error('Error getting packages:', error);
      return [];
    }
  }

  /**
   * Tạo package mới
   */
  static async create(packageData: PackageCreateInput): Promise<Package | null> {
    try {
      const newPackage: InsertPackage = {
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

      const result = await db.insert(packages).values(newPackage).returning();
      return result[0] || null;
    } catch (error) {
      console.error('Error creating package:', error);
      return null;
    }
  }

  /**
   * Cập nhật package
   */
  static async update(id: number, packageData: PackageUpdateInput): Promise<Package | null> {
    try {
      const updateData: Partial<InsertPackage> = {
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

      const result = await db.update(packages)
        .set(updateData)
        .where(eq(packages.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating package:', error);
      return null;
    }
  }

  /**
   * Parse features JSON
   */
  static parseFeatures(featuresJson: string | null): any[] {
    if (!featuresJson) return [];
    try {
      return JSON.parse(featuresJson);
    } catch (error) {
      console.error('Error parsing features data:', error);
      return [];
    }
  }

  /**
   * Lấy package ID theo tier và type (để tương thích với service)
   */
  static async getPackageById(id: string): Promise<Package | null> {
    if (id.includes('_')) {
      const [tier, type] = id.split('_');
      return this.findByTierAndType(tier, type);
    }
    return this.findById(parseInt(id));
  }
}

/**
 * Converter để transform dữ liệu giữa Database format và API format
 */
export const PackageConverter = {
  /**
   * Convert từ Database format → API Response format
   */
  toAPI(dbPackage: Package): any {
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
      const formattedFeatures = features.map((feature: any) => ({
        name: feature.name || feature,
        description: feature.description || '',
        included: feature.included !== false,
        limit: feature.limit || undefined
      }));

      return {
        id: `${dbPackage.tier}_${dbPackage.type}`,        // Tạo composite ID
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
    } catch (error) {
      console.error('Error converting package to API format:', error);
      throw error;
    }
  },

  /**
   * Convert từ API Request → Database format
   */
  fromAPI(apiData: any): Partial<Package> {
    const result: any = {};
    
    if (apiData.tier) result.tier = apiData.tier;
    if (apiData.type) result.type = apiData.type;
    if (apiData.name) result.name = apiData.name;
    if (apiData.description) result.description = apiData.description;
    if (apiData.features) result.features = JSON.stringify(apiData.features);
    if (apiData.popular !== undefined) result.popular = apiData.popular;
    if (apiData.maxProfiles) result.maxProfiles = apiData.maxProfiles;
    if (apiData.maxWorkflows) result.maxWorkflows = apiData.maxWorkflows;
    
    return result;
  }
};
