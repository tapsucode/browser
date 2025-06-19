import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  fullName: text("full_name"),
  contact: text("contact"),
  referralCode: text("referral_code"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("active"),
  loginAttempts: integer("login_attempts").default(0),
  lockUntil: integer("lock_until", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastLogin: integer("last_login", { mode: "timestamp" }),
});

// Profiles
export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  fingerprint: text("fingerprint").notNull(),
  proxyId: integer("proxy_id").references(() => proxies.id, { onDelete: "set null" }),
  accountType: text("account_type").notNull(),
  accountDetails: text("account_details"),
  osType: text("os_type").notNull(),
  browserType: text("browser_type").notNull(),
  browserVersion: text("browser_version").notNull(),
  status: text("status").notNull().default("active"),
  webrtcMode: text("webrtc_mode").default("real").notNull(),
  webrtcCustomIp: text("webrtc_custom_ip"),
  webrtcProtection: integer("webrtc_protection"),
  canvasProtection: integer("canvas_protection"),
  webglProtection: integer("webgl_protection"),
  audioContextProtection: integer("audiocontext_protection"),
  fontsProtection: integer("fonts_protection"),
  clientRectsProtection: integer("client_rects_protection"),
  timezoneSpoof: integer("timezone_spoof"),
  hardwareConcurrency: integer("hardware_concurrency"),
  deviceMemory: integer("device_memory"),
  doNotTrack: integer("do_not_track", { mode: "boolean" }),
  lastUsed: integer("last_used", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Profile Groups
export const profileGroups = sqliteTable("profile_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Profile Group Members
export const profileGroupMembers = sqliteTable("profile_group_members", {
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  groupId: integer("group_id").notNull().references(() => profileGroups.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.profileId, table.groupId] }),
}));

// Proxies
export const proxies = sqliteTable("proxies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ip: text("ip").notNull(),
  port: integer("port").notNull(),
  type: text("type").notNull(),
  username: text("username"),
  password: text("password"),
  location: text("location"),
  status: text("status").notNull().default("offline"),
  lastChecked: integer("last_checked", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Proxy Groups Table
export const proxyGroups = sqliteTable("proxy_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Proxy Group Members Table (Many-to-Many)
export const proxyGroupMembers = sqliteTable("proxy_group_members", {
  proxyId: integer("proxy_id").notNull().references(() => proxies.id, { onDelete: "cascade" }),
  groupId: integer("group_id").notNull().references(() => proxyGroups.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.proxyId, table.groupId] }),
}));

// Workflows Table
export const workflows = sqliteTable("workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  workflowContent: text("workflow_content"), // JSON string with workflow definition
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Workflow Executions Table
export const workflowExecutions = sqliteTable("workflow_executions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed, stopped
  startTime: integer("start_time", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  endTime: integer("end_time", { mode: "timestamp" }),
  results: text("results"), // JSON string with execution results
  progress: text("progress"), // JSON string with progress info
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Store Categories Table
export const storeCategories = sqliteTable("store_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Store Products Table
export const storeProducts = sqliteTable("store_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  categoryId: integer("category_id").references(() => storeCategories.id, { onDelete: "set null" }),
  imageUrl: text("image_url"),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  quantity: integer("quantity"),
  tags: text("tags"), // JSON array of tags
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// User Purchases Table
export const userPurchases = sqliteTable("user_purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => storeProducts.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  purchasedAt: integer("purchased_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Transactions Table
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), // UUID
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // deposit, withdrawal, purchase
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  paymentMethod: text("payment_method").notNull(), // bank, paypal, crypto
  fee: real("fee").default(0),
  description: text("description"),
  paymentProof: text("payment_proof"), // URL or path to proof image
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Balances Table
export const balances = sqliteTable("balances", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  amount: real("amount").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// System Settings Table
export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value"), // JSON string for complex values
  type: text("type").notNull().default("string"), // string, number, boolean, json
  isGlobal: integer("is_global", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Profile Sessions
export const profileSessions = sqliteTable("profile_sessions", {
  id: text("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("inactive"),
  browserPid: integer("browser_pid"),
  port: integer("port"),
  debuggingPort: integer("debugging_port"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  lastActivity: integer("last_activity", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Packages Table
export const packages = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tier: text("tier").notNull(),
  type: text("type").notNull(), // cloud, local, custom
  name: text("name").notNull(),
  description: text("description"),
  features: text("features"), // JSON array
  recommendedFor: text("recommended_for"),
  minMembers: integer("min_members").notNull().default(1),
  maxMembers: integer("max_members").notNull().default(1),
  priceMonthly: real("price_monthly").notNull(),
  priceSemiAnnual: real("price_semi_annual").notNull(),
  priceAnnual: real("price_annual").notNull(),
  popular: integer("popular", { mode: "boolean" }).notNull().default(false),
  maxProfiles: integer("max_profiles"),
  maxWorkflows: integer("max_workflows"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Subscriptions Table
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  packageId: integer("package_id").notNull().references(() => packages.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // monthly, quarterly, annual
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("active"), // active, cancelled, expired
  autoRenew: integer("auto_renew", { mode: "boolean" }).notNull().default(true),
  paymentMethod: text("payment_method"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  profiles: many(profiles),
  workflows: many(workflows),
  purchases: many(userPurchases),
  transactions: many(transactions),
  balance: one(balances),
  settings: many(systemSettings),
  subscriptions: many(subscriptions),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  proxy: one(proxies, {
    fields: [profiles.proxyId],
    references: [proxies.id],
  }),
  groupMembers: many(profileGroupMembers),
  sessions: many(profileSessions),
}));

export const profileGroupsRelations = relations(profileGroups, ({ many }) => ({
  members: many(profileGroupMembers),
}));

export const profileGroupMembersRelations = relations(profileGroupMembers, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileGroupMembers.profileId],
    references: [profiles.id],
  }),
  group: one(profileGroups, {
    fields: [profileGroupMembers.groupId],
    references: [profileGroups.id],
  }),
}));

export const proxiesRelations = relations(proxies, ({ many }) => ({
  profiles: many(profiles),
  groupMembers: many(proxyGroupMembers),
}));

export const proxyGroupsRelations = relations(proxyGroups, ({ many }) => ({
  members: many(proxyGroupMembers),
}));

export const proxyGroupMembersRelations = relations(proxyGroupMembers, ({ one }) => ({
  proxy: one(proxies, {
    fields: [proxyGroupMembers.proxyId],
    references: [proxies.id],
  }),
  group: one(proxyGroups, {
    fields: [proxyGroupMembers.groupId],
    references: [proxyGroups.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  owner: one(users, {
    fields: [workflows.ownerId],
    references: [users.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowExecutions.workflowId],
    references: [workflows.id],
  }),
}));

export const storeCategoriesRelations = relations(storeCategories, ({ many }) => ({
  products: many(storeProducts),
}));

export const storeProductsRelations = relations(storeProducts, ({ one, many }) => ({
  category: one(storeCategories, {
    fields: [storeProducts.categoryId],
    references: [storeCategories.id],
  }),
  purchases: many(userPurchases),
}));

export const userPurchasesRelations = relations(userPurchases, ({ one }) => ({
  user: one(users, {
    fields: [userPurchases.userId],
    references: [users.id],
  }),
  product: one(storeProducts, {
    fields: [userPurchases.productId],
    references: [storeProducts.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const balancesRelations = relations(balances, ({ one }) => ({
  user: one(users, {
    fields: [balances.userId],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  user: one(users, {
    fields: [systemSettings.userId],
    references: [users.id],
  }),
}));

export const profileSessionsRelations = relations(profileSessions, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileSessions.profileId],
    references: [profiles.id],
  }),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [subscriptions.packageId],
    references: [packages.id],
  }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export const insertProfileGroupSchema = createInsertSchema(profileGroups);
export const selectProfileGroupSchema = createSelectSchema(profileGroups);

export const insertProxySchema = createInsertSchema(proxies);
export const selectProxySchema = createSelectSchema(proxies);

export const insertProxyGroupSchema = createInsertSchema(proxyGroups);
export const selectProxyGroupSchema = createSelectSchema(proxyGroups);

export const insertWorkflowSchema = createInsertSchema(workflows);
export const selectWorkflowSchema = createSelectSchema(workflows);

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions);
export const selectWorkflowExecutionSchema = createSelectSchema(workflowExecutions);

export const insertStoreProductSchema = createInsertSchema(storeProducts);
export const selectStoreProductSchema = createSelectSchema(storeProducts);

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);

export const insertBalanceSchema = createInsertSchema(balances);
export const selectBalanceSchema = createSelectSchema(balances);

export const insertSystemSettingSchema = createInsertSchema(systemSettings);
export const selectSystemSettingSchema = createSelectSchema(systemSettings);

export const insertProfileSessionSchema = createInsertSchema(profileSessions);
export const selectProfileSessionSchema = createSelectSchema(profileSessions);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type ProfileGroup = typeof profileGroups.$inferSelect;
export type InsertProfileGroup = typeof profileGroups.$inferInsert;

export type Proxy = typeof proxies.$inferSelect;
export type InsertProxy = typeof proxies.$inferInsert;

export type ProxyGroup = typeof proxyGroups.$inferSelect;
export type InsertProxyGroup = typeof proxyGroups.$inferInsert;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type InsertWorkflowExecution = typeof workflowExecutions.$inferInsert;

export type StoreCategory = typeof storeCategories.$inferSelect;
export type InsertStoreCategory = typeof storeCategories.$inferInsert;

export type StoreProduct = typeof storeProducts.$inferSelect;
export type InsertStoreProduct = typeof storeProducts.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = typeof balances.$inferInsert;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

export type ProfileSession = typeof profileSessions.$inferSelect;
export type InsertProfileSession = typeof profileSessions.$inferInsert;

export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;