-- Create filtered_words table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'filtered_words') THEN
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
    END IF;
END
$$;

-- Insert default filtered words if the table is empty
INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'profanity1', 'profanity', true, true, false, false, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'profanity1');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'spam1', 'spam', true, true, true, false, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'spam1');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'freecoin', 'spam', true, true, false, false, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'freecoin');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'clickhere', 'spam', true, true, true, false, 2, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'clickhere');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'harassment1', 'harassment', true, true, true, true, 2, 4
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'harassment1');

-- Create telegram_users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'telegram_users') THEN
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
    END IF;
END
$$;

-- Create moderation_logs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'moderation_logs') THEN
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
    END IF;
END
$$;

-- Create bot_settings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bot_settings') THEN
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
    END IF;
END
$$;