"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectWorkflowExecutionSchema = exports.insertWorkflowExecutionSchema = exports.selectWorkflowSchema = exports.insertWorkflowSchema = exports.selectProxyGroupSchema = exports.insertProxyGroupSchema = exports.selectProxySchema = exports.insertProxySchema = exports.selectProfileGroupSchema = exports.insertProfileGroupSchema = exports.selectProfileSchema = exports.insertProfileSchema = exports.selectUserSchema = exports.insertUserSchema = exports.subscriptionsRelations = exports.packagesRelations = exports.profileSessionsRelations = exports.systemSettingsRelations = exports.balancesRelations = exports.transactionsRelations = exports.userPurchasesRelations = exports.storeProductsRelations = exports.storeCategoriesRelations = exports.workflowExecutionsRelations = exports.workflowsRelations = exports.proxyGroupMembersRelations = exports.proxyGroupsRelations = exports.proxiesRelations = exports.profileGroupMembersRelations = exports.profileGroupsRelations = exports.profilesRelations = exports.usersRelations = exports.subscriptions = exports.packages = exports.profileSessions = exports.systemSettings = exports.balances = exports.transactions = exports.userPurchases = exports.storeProducts = exports.storeCategories = exports.workflowExecutions = exports.workflows = exports.proxyGroupMembers = exports.proxyGroups = exports.proxies = exports.profileGroupMembers = exports.profileGroups = exports.profiles = exports.users = void 0;
exports.selectProfileSessionSchema = exports.insertProfileSessionSchema = exports.selectSystemSettingSchema = exports.insertSystemSettingSchema = exports.selectBalanceSchema = exports.insertBalanceSchema = exports.selectTransactionSchema = exports.insertTransactionSchema = exports.selectStoreProductSchema = exports.insertStoreProductSchema = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// Users
exports.users = (0, sqlite_core_1.sqliteTable)("users", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    username: (0, sqlite_core_1.text)("username").notNull().unique(),
    password: (0, sqlite_core_1.text)("password").notNull(),
    email: (0, sqlite_core_1.text)("email").notNull().unique(),
    role: (0, sqlite_core_1.text)("role").notNull().default("user"),
    fullName: (0, sqlite_core_1.text)("full_name"),
    contact: (0, sqlite_core_1.text)("contact"),
    referralCode: (0, sqlite_core_1.text)("referral_code"),
    stripeCustomerId: (0, sqlite_core_1.text)("stripe_customer_id"),
    stripeSubscriptionId: (0, sqlite_core_1.text)("stripe_subscription_id"),
    status: (0, sqlite_core_1.text)("status").notNull().default("active"),
    loginAttempts: (0, sqlite_core_1.integer)("login_attempts").default(0),
    lockUntil: (0, sqlite_core_1.integer)("lock_until", { mode: "timestamp" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    lastLogin: (0, sqlite_core_1.integer)("last_login", { mode: "timestamp" }),
});
// Profiles
exports.profiles = (0, sqlite_core_1.sqliteTable)("profiles", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    fingerprint: (0, sqlite_core_1.text)("fingerprint").notNull(),
    proxyId: (0, sqlite_core_1.integer)("proxy_id").references(() => exports.proxies.id, { onDelete: "set null" }),
    accountType: (0, sqlite_core_1.text)("account_type").notNull(),
    accountDetails: (0, sqlite_core_1.text)("account_details"),
    osType: (0, sqlite_core_1.text)("os_type").notNull(),
    browserType: (0, sqlite_core_1.text)("browser_type").notNull(),
    browserVersion: (0, sqlite_core_1.text)("browser_version").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("active"),
    webrtcMode: (0, sqlite_core_1.text)("webrtc_mode").default("real").notNull(),
    webrtcCustomIp: (0, sqlite_core_1.text)("webrtc_custom_ip"),
    webrtcProtection: (0, sqlite_core_1.integer)("webrtc_protection"),
    canvasProtection: (0, sqlite_core_1.integer)("canvas_protection"),
    webglProtection: (0, sqlite_core_1.integer)("webgl_protection"),
    audioContextProtection: (0, sqlite_core_1.integer)("audiocontext_protection"),
    fontsProtection: (0, sqlite_core_1.integer)("fonts_protection"),
    clientRectsProtection: (0, sqlite_core_1.integer)("client_rects_protection"),
    timezoneSpoof: (0, sqlite_core_1.integer)("timezone_spoof"),
    hardwareConcurrency: (0, sqlite_core_1.integer)("hardware_concurrency"),
    deviceMemory: (0, sqlite_core_1.integer)("device_memory"),
    doNotTrack: (0, sqlite_core_1.integer)("do_not_track", { mode: "boolean" }),
    lastUsed: (0, sqlite_core_1.integer)("last_used", { mode: "timestamp" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Profile Groups
exports.profileGroups = (0, sqlite_core_1.sqliteTable)("profile_groups", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull().unique(),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Profile Group Members
exports.profileGroupMembers = (0, sqlite_core_1.sqliteTable)("profile_group_members", {
    profileId: (0, sqlite_core_1.integer)("profile_id").notNull().references(() => exports.profiles.id, { onDelete: "cascade" }),
    groupId: (0, sqlite_core_1.integer)("group_id").notNull().references(() => exports.profileGroups.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: (0, sqlite_core_1.primaryKey)({ columns: [table.profileId, table.groupId] }),
}));
// Proxies
exports.proxies = (0, sqlite_core_1.sqliteTable)("proxies", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    ip: (0, sqlite_core_1.text)("ip").notNull(),
    port: (0, sqlite_core_1.integer)("port").notNull(),
    type: (0, sqlite_core_1.text)("type").notNull(),
    username: (0, sqlite_core_1.text)("username"),
    password: (0, sqlite_core_1.text)("password"),
    location: (0, sqlite_core_1.text)("location"),
    status: (0, sqlite_core_1.text)("status").notNull().default("offline"),
    lastChecked: (0, sqlite_core_1.integer)("last_checked", { mode: "timestamp" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Proxy Groups Table
exports.proxyGroups = (0, sqlite_core_1.sqliteTable)("proxy_groups", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull().unique(),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Proxy Group Members Table (Many-to-Many)
exports.proxyGroupMembers = (0, sqlite_core_1.sqliteTable)("proxy_group_members", {
    proxyId: (0, sqlite_core_1.integer)("proxy_id").notNull().references(() => exports.proxies.id, { onDelete: "cascade" }),
    groupId: (0, sqlite_core_1.integer)("group_id").notNull().references(() => exports.proxyGroups.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: (0, sqlite_core_1.primaryKey)({ columns: [table.proxyId, table.groupId] }),
}));
// Workflows Table
exports.workflows = (0, sqlite_core_1.sqliteTable)("workflows", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    workflowContent: (0, sqlite_core_1.text)("workflow_content"), // JSON string with workflow definition
    isActive: (0, sqlite_core_1.integer)("is_active", { mode: "boolean" }).notNull().default(true),
    ownerId: (0, sqlite_core_1.integer)("owner_id").references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Workflow Executions Table
exports.workflowExecutions = (0, sqlite_core_1.sqliteTable)("workflow_executions", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    workflowId: (0, sqlite_core_1.integer)("workflow_id").notNull().references(() => exports.workflows.id, { onDelete: "cascade" }),
    status: (0, sqlite_core_1.text)("status").notNull().default("pending"), // pending, running, completed, failed, stopped
    startTime: (0, sqlite_core_1.integer)("start_time", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    endTime: (0, sqlite_core_1.integer)("end_time", { mode: "timestamp" }),
    results: (0, sqlite_core_1.text)("results"), // JSON string with execution results
    progress: (0, sqlite_core_1.text)("progress"), // JSON string with progress info
    errorMessage: (0, sqlite_core_1.text)("error_message"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Store Categories Table
exports.storeCategories = (0, sqlite_core_1.sqliteTable)("store_categories", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull().unique(),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Store Products Table
exports.storeProducts = (0, sqlite_core_1.sqliteTable)("store_products", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    price: (0, sqlite_core_1.real)("price").notNull(),
    currency: (0, sqlite_core_1.text)("currency").notNull().default("USD"),
    categoryId: (0, sqlite_core_1.integer)("category_id").references(() => exports.storeCategories.id, { onDelete: "set null" }),
    imageUrl: (0, sqlite_core_1.text)("image_url"),
    inStock: (0, sqlite_core_1.integer)("in_stock", { mode: "boolean" }).notNull().default(true),
    quantity: (0, sqlite_core_1.integer)("quantity"),
    tags: (0, sqlite_core_1.text)("tags"), // JSON array of tags
    featured: (0, sqlite_core_1.integer)("featured", { mode: "boolean" }).notNull().default(false),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// User Purchases Table
exports.userPurchases = (0, sqlite_core_1.sqliteTable)("user_purchases", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    productId: (0, sqlite_core_1.integer)("product_id").notNull().references(() => exports.storeProducts.id, { onDelete: "cascade" }),
    quantity: (0, sqlite_core_1.integer)("quantity").notNull().default(1),
    price: (0, sqlite_core_1.real)("price").notNull(),
    currency: (0, sqlite_core_1.text)("currency").notNull().default("USD"),
    transactionId: (0, sqlite_core_1.text)("transaction_id"),
    status: (0, sqlite_core_1.text)("status").notNull().default("pending"), // pending, completed, refunded
    purchasedAt: (0, sqlite_core_1.integer)("purchased_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Transactions Table
exports.transactions = (0, sqlite_core_1.sqliteTable)("transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(), // UUID
    userId: (0, sqlite_core_1.integer)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    type: (0, sqlite_core_1.text)("type").notNull(), // deposit, withdrawal, purchase
    amount: (0, sqlite_core_1.real)("amount").notNull(),
    currency: (0, sqlite_core_1.text)("currency").notNull().default("USD"),
    status: (0, sqlite_core_1.text)("status").notNull().default("pending"), // pending, completed, failed
    paymentMethod: (0, sqlite_core_1.text)("payment_method").notNull(), // bank, paypal, crypto
    fee: (0, sqlite_core_1.real)("fee").default(0),
    description: (0, sqlite_core_1.text)("description"),
    paymentProof: (0, sqlite_core_1.text)("payment_proof"), // URL or path to proof image
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Balances Table
exports.balances = (0, sqlite_core_1.sqliteTable)("balances", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }).unique(),
    amount: (0, sqlite_core_1.real)("amount").notNull().default(0),
    currency: (0, sqlite_core_1.text)("currency").notNull().default("USD"),
    lastUpdated: (0, sqlite_core_1.integer)("last_updated", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// System Settings Table
exports.systemSettings = (0, sqlite_core_1.sqliteTable)("system_settings", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)("user_id").references(() => exports.users.id, { onDelete: "cascade" }),
    key: (0, sqlite_core_1.text)("key").notNull(),
    value: (0, sqlite_core_1.text)("value"), // JSON string for complex values
    type: (0, sqlite_core_1.text)("type").notNull().default("string"), // string, number, boolean, json
    isGlobal: (0, sqlite_core_1.integer)("is_global", { mode: "boolean" }).notNull().default(false),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Profile Sessions
exports.profileSessions = (0, sqlite_core_1.sqliteTable)("profile_sessions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    profileId: (0, sqlite_core_1.integer)("profile_id").notNull().references(() => exports.profiles.id, { onDelete: "cascade" }),
    status: (0, sqlite_core_1.text)("status").notNull().default("inactive"),
    browserPid: (0, sqlite_core_1.integer)("browser_pid"),
    port: (0, sqlite_core_1.integer)("port"),
    debuggingPort: (0, sqlite_core_1.integer)("debugging_port"),
    startedAt: (0, sqlite_core_1.integer)("started_at", { mode: "timestamp" }),
    endedAt: (0, sqlite_core_1.integer)("ended_at", { mode: "timestamp" }),
    lastActivity: (0, sqlite_core_1.integer)("last_activity", { mode: "timestamp" }),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Packages Table
exports.packages = (0, sqlite_core_1.sqliteTable)("packages", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    tier: (0, sqlite_core_1.text)("tier").notNull(),
    type: (0, sqlite_core_1.text)("type").notNull(), // cloud, local, custom
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    features: (0, sqlite_core_1.text)("features"), // JSON array
    recommendedFor: (0, sqlite_core_1.text)("recommended_for"),
    minMembers: (0, sqlite_core_1.integer)("min_members").notNull().default(1),
    maxMembers: (0, sqlite_core_1.integer)("max_members").notNull().default(1),
    priceMonthly: (0, sqlite_core_1.real)("price_monthly").notNull(),
    priceSemiAnnual: (0, sqlite_core_1.real)("price_semi_annual").notNull(),
    priceAnnual: (0, sqlite_core_1.real)("price_annual").notNull(),
    popular: (0, sqlite_core_1.integer)("popular", { mode: "boolean" }).notNull().default(false),
    maxProfiles: (0, sqlite_core_1.integer)("max_profiles"),
    maxWorkflows: (0, sqlite_core_1.integer)("max_workflows"),
    active: (0, sqlite_core_1.integer)("active", { mode: "boolean" }).notNull().default(true),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Subscriptions Table
exports.subscriptions = (0, sqlite_core_1.sqliteTable)("subscriptions", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    packageId: (0, sqlite_core_1.integer)("package_id").notNull().references(() => exports.packages.id, { onDelete: "cascade" }),
    period: (0, sqlite_core_1.text)("period").notNull(), // monthly, quarterly, annual
    startDate: (0, sqlite_core_1.integer)("start_date", { mode: "timestamp" }).notNull(),
    endDate: (0, sqlite_core_1.integer)("end_date", { mode: "timestamp" }).notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("active"), // active, cancelled, expired
    autoRenew: (0, sqlite_core_1.integer)("auto_renew", { mode: "boolean" }).notNull().default(true),
    paymentMethod: (0, sqlite_core_1.text)("payment_method"),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    profiles: many(exports.profiles),
    workflows: many(exports.workflows),
    purchases: many(exports.userPurchases),
    transactions: many(exports.transactions),
    balance: one(exports.balances),
    settings: many(exports.systemSettings),
    subscriptions: many(exports.subscriptions),
}));
exports.profilesRelations = (0, drizzle_orm_1.relations)(exports.profiles, ({ one, many }) => ({
    proxy: one(exports.proxies, {
        fields: [exports.profiles.proxyId],
        references: [exports.proxies.id],
    }),
    groupMembers: many(exports.profileGroupMembers),
    sessions: many(exports.profileSessions),
}));
exports.profileGroupsRelations = (0, drizzle_orm_1.relations)(exports.profileGroups, ({ many }) => ({
    members: many(exports.profileGroupMembers),
}));
exports.profileGroupMembersRelations = (0, drizzle_orm_1.relations)(exports.profileGroupMembers, ({ one }) => ({
    profile: one(exports.profiles, {
        fields: [exports.profileGroupMembers.profileId],
        references: [exports.profiles.id],
    }),
    group: one(exports.profileGroups, {
        fields: [exports.profileGroupMembers.groupId],
        references: [exports.profileGroups.id],
    }),
}));
exports.proxiesRelations = (0, drizzle_orm_1.relations)(exports.proxies, ({ many }) => ({
    profiles: many(exports.profiles),
    groupMembers: many(exports.proxyGroupMembers),
}));
exports.proxyGroupsRelations = (0, drizzle_orm_1.relations)(exports.proxyGroups, ({ many }) => ({
    members: many(exports.proxyGroupMembers),
}));
exports.proxyGroupMembersRelations = (0, drizzle_orm_1.relations)(exports.proxyGroupMembers, ({ one }) => ({
    proxy: one(exports.proxies, {
        fields: [exports.proxyGroupMembers.proxyId],
        references: [exports.proxies.id],
    }),
    group: one(exports.proxyGroups, {
        fields: [exports.proxyGroupMembers.groupId],
        references: [exports.proxyGroups.id],
    }),
}));
exports.workflowsRelations = (0, drizzle_orm_1.relations)(exports.workflows, ({ one, many }) => ({
    owner: one(exports.users, {
        fields: [exports.workflows.ownerId],
        references: [exports.users.id],
    }),
    executions: many(exports.workflowExecutions),
}));
exports.workflowExecutionsRelations = (0, drizzle_orm_1.relations)(exports.workflowExecutions, ({ one }) => ({
    workflow: one(exports.workflows, {
        fields: [exports.workflowExecutions.workflowId],
        references: [exports.workflows.id],
    }),
}));
exports.storeCategoriesRelations = (0, drizzle_orm_1.relations)(exports.storeCategories, ({ many }) => ({
    products: many(exports.storeProducts),
}));
exports.storeProductsRelations = (0, drizzle_orm_1.relations)(exports.storeProducts, ({ one, many }) => ({
    category: one(exports.storeCategories, {
        fields: [exports.storeProducts.categoryId],
        references: [exports.storeCategories.id],
    }),
    purchases: many(exports.userPurchases),
}));
exports.userPurchasesRelations = (0, drizzle_orm_1.relations)(exports.userPurchases, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userPurchases.userId],
        references: [exports.users.id],
    }),
    product: one(exports.storeProducts, {
        fields: [exports.userPurchases.productId],
        references: [exports.storeProducts.id],
    }),
}));
exports.transactionsRelations = (0, drizzle_orm_1.relations)(exports.transactions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.transactions.userId],
        references: [exports.users.id],
    }),
}));
exports.balancesRelations = (0, drizzle_orm_1.relations)(exports.balances, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.balances.userId],
        references: [exports.users.id],
    }),
}));
exports.systemSettingsRelations = (0, drizzle_orm_1.relations)(exports.systemSettings, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.systemSettings.userId],
        references: [exports.users.id],
    }),
}));
exports.profileSessionsRelations = (0, drizzle_orm_1.relations)(exports.profileSessions, ({ one }) => ({
    profile: one(exports.profiles, {
        fields: [exports.profileSessions.profileId],
        references: [exports.profiles.id],
    }),
}));
exports.packagesRelations = (0, drizzle_orm_1.relations)(exports.packages, ({ many }) => ({
    subscriptions: many(exports.subscriptions),
}));
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.subscriptions.userId],
        references: [exports.users.id],
    }),
    package: one(exports.packages, {
        fields: [exports.subscriptions.packageId],
        references: [exports.packages.id],
    }),
}));
// Zod Schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.insertProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profiles);
exports.selectProfileSchema = (0, drizzle_zod_1.createSelectSchema)(exports.profiles);
exports.insertProfileGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profileGroups);
exports.selectProfileGroupSchema = (0, drizzle_zod_1.createSelectSchema)(exports.profileGroups);
exports.insertProxySchema = (0, drizzle_zod_1.createInsertSchema)(exports.proxies);
exports.selectProxySchema = (0, drizzle_zod_1.createSelectSchema)(exports.proxies);
exports.insertProxyGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.proxyGroups);
exports.selectProxyGroupSchema = (0, drizzle_zod_1.createSelectSchema)(exports.proxyGroups);
exports.insertWorkflowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflows);
exports.selectWorkflowSchema = (0, drizzle_zod_1.createSelectSchema)(exports.workflows);
exports.insertWorkflowExecutionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workflowExecutions);
exports.selectWorkflowExecutionSchema = (0, drizzle_zod_1.createSelectSchema)(exports.workflowExecutions);
exports.insertStoreProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.storeProducts);
exports.selectStoreProductSchema = (0, drizzle_zod_1.createSelectSchema)(exports.storeProducts);
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions);
exports.selectTransactionSchema = (0, drizzle_zod_1.createSelectSchema)(exports.transactions);
exports.insertBalanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.balances);
exports.selectBalanceSchema = (0, drizzle_zod_1.createSelectSchema)(exports.balances);
exports.insertSystemSettingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.systemSettings);
exports.selectSystemSettingSchema = (0, drizzle_zod_1.createSelectSchema)(exports.systemSettings);
exports.insertProfileSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.profileSessions);
exports.selectProfileSessionSchema = (0, drizzle_zod_1.createSelectSchema)(exports.profileSessions);
