CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`client_key` text NOT NULL,
	`notification` text DEFAULT 'disabled' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_rate_idx` ON `contact_messages` (`client_key`,`created_at`);