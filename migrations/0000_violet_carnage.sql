CREATE TABLE "bot_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"default_mute_duration" integer DEFAULT 1440,
	"warning_threshold" integer DEFAULT 3,
	"mute_threshold" integer DEFAULT 5,
	"ban_threshold" integer DEFAULT 8,
	"delete_on_filter" boolean DEFAULT true,
	"warn_on_filter" boolean DEFAULT true,
	"notify_admins" boolean DEFAULT true,
	"custom_welcome_message" text,
	CONSTRAINT "bot_settings_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
CREATE TABLE "filtered_words" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" text NOT NULL,
	"category" text NOT NULL,
	"delete_message" boolean DEFAULT true,
	"warn_user" boolean DEFAULT true,
	"auto_mute" boolean DEFAULT false,
	"auto_ban" boolean DEFAULT false,
	"warnings_before_mute" integer DEFAULT 3,
	"warnings_before_ban" integer DEFAULT 5
);
--> statement-breakpoint
CREATE TABLE "moderation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"telegram_user_id" integer,
	"action_type" text NOT NULL,
	"details" text,
	"performed_by" text NOT NULL,
	"message_content" text,
	"filtered_word_id" integer,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "telegram_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" text NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"warning_count" integer DEFAULT 0,
	"is_muted" boolean DEFAULT false,
	"is_banned" boolean DEFAULT false,
	"mute_expires_at" timestamp,
	CONSTRAINT "telegram_users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
