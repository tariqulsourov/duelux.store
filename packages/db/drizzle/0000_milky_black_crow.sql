CREATE TABLE `outlets` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`code` varchar(20) NOT NULL,
	`name` varchar(150) NOT NULL,
	`phone` varchar(30),
	`email` varchar(150),
	`address_line_1` varchar(255),
	`address_line_2` varchar(255),
	`city` varchar(100),
	`state` varchar(100),
	`postal_code` varchar(20),
	`country` varchar(100) DEFAULT 'Bangladesh',
	`is_warehouse` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`receipt_header` text,
	`receipt_footer` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outlets_id` PRIMARY KEY(`id`),
	CONSTRAINT `outlets_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`code` varchar(80) NOT NULL,
	`module` varchar(50) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `pos_cashier_profiles` (
	`user_id` varchar(36) NOT NULL,
	`pin_hash` varchar(255) NOT NULL,
	`can_apply_manual_discount` boolean NOT NULL DEFAULT false,
	`max_discount_percent` decimal(5,2) NOT NULL DEFAULT '10.00',
	`can_void_items` boolean NOT NULL DEFAULT false,
	`can_open_drawer_manual` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pos_cashier_profiles_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(50) NOT NULL,
	`description` varchar(255),
	`is_system` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(150) NOT NULL,
	`email` varchar(150) NOT NULL,
	`phone` varchar(30),
	`password_hash` varchar(255) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`primary_outlet_id` varchar(36),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `barcode_aliases` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`variant_id` varchar(36) NOT NULL,
	`barcode` varchar(100) NOT NULL,
	`barcode_type` varchar(30) NOT NULL DEFAULT 'CODE128',
	`notes` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `barcode_aliases_id` PRIMARY KEY(`id`),
	CONSTRAINT `barcode_aliases_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(150) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`logo_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_name_unique` UNIQUE(`name`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`parent_id` varchar(36),
	`name` varchar(150) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`meta_title` varchar(255),
	`meta_description` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`product_id` varchar(36) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`barcode` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`selling_price` decimal(12,4) NOT NULL,
	`cost_price` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`compare_at_price` decimal(12,4),
	`weight_grams` decimal(10,2) DEFAULT '0.00',
	`attributes_json` json,
	`image_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_variants_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `product_variants_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`brand_id` varchar(36),
	`category_id` varchar(36),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_tax_exempt` boolean NOT NULL DEFAULT false,
	`tax_rate_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
	`meta_title` varchar(255),
	`meta_description` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `inventory_ledger` (
	`100` varchar(100),
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`variant_id` varchar(36) NOT NULL,
	`outlet_id` varchar(36) NOT NULL,
	`change_qty` decimal(12,4) NOT NULL,
	`resulting_on_hand` decimal(12,4) NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`reference_type` varchar(50),
	`notes` text,
	`created_by_user_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_levels` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`variant_id` varchar(36) NOT NULL,
	`outlet_id` varchar(36) NOT NULL,
	`on_hand_qty` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`reserved_qty` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`safety_stock_buffer` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_variant_outlet` UNIQUE(`variant_id`,`outlet_id`)
);
--> statement-breakpoint
CREATE TABLE `customer_addresses` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`customer_id` varchar(36) NOT NULL,
	`label` varchar(50) NOT NULL DEFAULT 'Home',
	`recipient_name` varchar(150) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`address_line_1` varchar(255) NOT NULL,
	`address_line_2` varchar(255),
	`city` varchar(100) NOT NULL,
	`zone` varchar(100),
	`postal_code` varchar(20),
	`is_default` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`100` varchar(100),
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`phone` varchar(30) NOT NULL,
	`email` varchar(150),
	`password_hash` varchar(255),
	`loyalty_points` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`total_spend` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`total_orders_count` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `cash_drawer_events` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`shift_id` varchar(36) NOT NULL,
	`cashier_id` varchar(36) NOT NULL,
	`event_type` varchar(50) NOT NULL,
	`amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`reason` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cash_drawer_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_parked_orders` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`register_id` varchar(36) NOT NULL,
	`outlet_id` varchar(36) NOT NULL,
	`cashier_id` varchar(36) NOT NULL,
	`tag` varchar(100),
	`cart_state_json` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pos_parked_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_register_shifts` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`register_id` varchar(36) NOT NULL,
	`outlet_id` varchar(36) NOT NULL,
	`cashier_id` varchar(36) NOT NULL,
	`opened_at` timestamp NOT NULL DEFAULT (now()),
	`closed_at` timestamp,
	`opening_float` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`cash_sales` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`card_sales` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`mobile_wallet_sales` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`total_discounts` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`cash_in_total` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`cash_out_total` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`expected_cash` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`counted_cash` decimal(12,4),
	`variance` decimal(12,4),
	`status` varchar(20) NOT NULL DEFAULT 'OPEN',
	`notes` text,
	CONSTRAINT `pos_register_shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_registers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`outlet_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(20) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`default_printer_type` varchar(30) NOT NULL DEFAULT 'USB_ESC_POS',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pos_registers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(36) NOT NULL,
	`variant_id` varchar(36) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`product_title` varchar(255) NOT NULL,
	`variant_title` varchar(200) NOT NULL,
	`quantity` decimal(12,4) NOT NULL DEFAULT '1.0000',
	`unit_price` decimal(12,4) NOT NULL,
	`discount_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`tax_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`total_price` decimal(12,4) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_payments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(36) NOT NULL,
	`tender_type` varchar(30) NOT NULL,
	`amount` decimal(12,4) NOT NULL,
	`transaction_ref` varchar(150),
	`tender_details_json` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(36) NOT NULL,
	`from_status` varchar(30),
	`to_status` varchar(30) NOT NULL,
	`comment` varchar(255),
	`changed_by_user_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_number` varchar(50) NOT NULL,
	`channel` varchar(30) NOT NULL,
	`outlet_id` varchar(36) NOT NULL,
	`customer_id` varchar(36),
	`register_shift_id` varchar(36),
	`cashier_id` varchar(36),
	`status` varchar(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
	`payment_status` varchar(30) NOT NULL DEFAULT 'PENDING',
	`subtotal` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`discount_total` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`tax_total` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`shipping_charge` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`grand_total` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`paid_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`change_given` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `courier_consignments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(36) NOT NULL,
	`courier_name` varchar(100) NOT NULL,
	`tracking_number` varchar(150) NOT NULL,
	`consignment_id` varchar(150),
	`status` varchar(50) NOT NULL DEFAULT 'BOOKED',
	`shipping_charge` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`cod_amount_to_collect` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`label_url` varchar(500),
	`status_updated_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courier_consignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_zones` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`city` varchar(100),
	`base_rate` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`per_kg_rate` decimal(12,4) NOT NULL DEFAULT '0.0000',
	`estimated_days` int NOT NULL DEFAULT 2,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36),
	`outlet_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`entity_name` varchar(50) NOT NULL,
	`entity_id` varchar(100),
	`old_state` json,
	`new_state` json,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `pos_cashier_profiles` ADD CONSTRAINT `pos_cashier_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_primary_outlet_id_outlets_id_fk` FOREIGN KEY (`primary_outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `barcode_aliases` ADD CONSTRAINT `barcode_aliases_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_ledger` ADD CONSTRAINT `inventory_ledger_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_ledger` ADD CONSTRAINT `inventory_ledger_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_ledger` ADD CONSTRAINT `inventory_ledger_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_levels` ADD CONSTRAINT `inventory_levels_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_levels` ADD CONSTRAINT `inventory_levels_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cash_drawer_events` ADD CONSTRAINT `cash_drawer_events_shift_id_pos_register_shifts_id_fk` FOREIGN KEY (`shift_id`) REFERENCES `pos_register_shifts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cash_drawer_events` ADD CONSTRAINT `cash_drawer_events_cashier_id_users_id_fk` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_parked_orders` ADD CONSTRAINT `pos_parked_orders_register_id_pos_registers_id_fk` FOREIGN KEY (`register_id`) REFERENCES `pos_registers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_parked_orders` ADD CONSTRAINT `pos_parked_orders_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_parked_orders` ADD CONSTRAINT `pos_parked_orders_cashier_id_users_id_fk` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_register_shifts` ADD CONSTRAINT `pos_register_shifts_register_id_pos_registers_id_fk` FOREIGN KEY (`register_id`) REFERENCES `pos_registers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_register_shifts` ADD CONSTRAINT `pos_register_shifts_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_register_shifts` ADD CONSTRAINT `pos_register_shifts_cashier_id_users_id_fk` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pos_registers` ADD CONSTRAINT `pos_registers_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_payments` ADD CONSTRAINT `order_payments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_changed_by_user_id_users_id_fk` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_register_shift_id_pos_register_shifts_id_fk` FOREIGN KEY (`register_shift_id`) REFERENCES `pos_register_shifts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_cashier_id_users_id_fk` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courier_consignments` ADD CONSTRAINT `courier_consignments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_outlet_id_outlets_id_fk` FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON DELETE no action ON UPDATE no action;