CREATE TABLE `balances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`last_updated` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `balances_user_id_unique` ON `balances` (`user_id`);--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tier` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`features` text,
	`recommended_for` text,
	`min_members` integer DEFAULT 1 NOT NULL,
	`max_members` integer DEFAULT 1 NOT NULL,
	`price_monthly` real NOT NULL,
	`price_semi_annual` real NOT NULL,
	`price_annual` real NOT NULL,
	`popular` integer DEFAULT false NOT NULL,
	`max_profiles` integer,
	`max_workflows` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile_group_members` (
	`profile_id` integer NOT NULL,
	`group_id` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `group_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `profile_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_groups_name_unique` ON `profile_groups` (`name`);--> statement-breakpoint
CREATE TABLE `profile_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` integer NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`browser_pid` integer,
	`port` integer,
	`debugging_port` integer,
	`started_at` integer,
	`ended_at` integer,
	`last_activity` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`fingerprint` text NOT NULL,
	`proxy_id` integer,
	`account_type` text NOT NULL,
	`account_details` text,
	`os_type` text NOT NULL,
	`browser_type` text NOT NULL,
	`browser_version` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`webrtc_mode` text DEFAULT 'real' NOT NULL,
	`webrtc_custom_ip` text,
	`webrtc_protection` integer,
	`canvas_protection` integer,
	`webgl_protection` integer,
	`audiocontext_protection` integer,
	`fonts_protection` integer,
	`client_rects_protection` integer,
	`timezone_spoof` integer,
	`hardware_concurrency` integer,
	`device_memory` integer,
	`do_not_track` integer,
	`last_used` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`proxy_id`) REFERENCES `proxies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `proxies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`ip` text NOT NULL,
	`port` integer NOT NULL,
	`type` text NOT NULL,
	`username` text,
	`password` text,
	`location` text,
	`status` text DEFAULT 'offline' NOT NULL,
	`last_checked` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proxy_group_members` (
	`proxy_id` integer NOT NULL,
	`group_id` integer NOT NULL,
	PRIMARY KEY(`proxy_id`, `group_id`),
	FOREIGN KEY (`proxy_id`) REFERENCES `proxies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `proxy_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `proxy_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proxy_groups_name_unique` ON `proxy_groups` (`name`);--> statement-breakpoint
CREATE TABLE `store_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_categories_name_unique` ON `store_categories` (`name`);--> statement-breakpoint
CREATE TABLE `store_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`category_id` integer,
	`image_url` text,
	`in_stock` integer DEFAULT true NOT NULL,
	`quantity` integer,
	`tags` text,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `store_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`package_id` integer NOT NULL,
	`period` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`auto_renew` integer DEFAULT true NOT NULL,
	`payment_method` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`key` text NOT NULL,
	`value` text,
	`type` text DEFAULT 'string' NOT NULL,
	`is_global` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text NOT NULL,
	`fee` real DEFAULT 0,
	`description` text,
	`payment_proof` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`price` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`transaction_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`purchased_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `store_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`full_name` text,
	`contact` text,
	`referral_code` text,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`login_attempts` integer DEFAULT 0,
	`lock_until` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_login` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `workflow_executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workflow_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`results` text,
	`progress` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`workflow_content` text,
	`is_active` integer DEFAULT true NOT NULL,
	`owner_id` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
