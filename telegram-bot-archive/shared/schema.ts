import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

// Telegram user schema
export const telegramUsers = pgTable("telegram_users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  warningCount: integer("warning_count").default(0),
  isMuted: boolean("is_muted").default(false),
  isBanned: boolean("is_banned").default(false),
  muteExpiresAt: timestamp("mute_expires_at"),
});

export const insertTelegramUserSchema = createInsertSchema(telegramUsers)
  .pick({
    telegramId: true,
    username: true,
    firstName: true,
    lastName: true,
  });

export type InsertTelegramUser = z.infer<typeof insertTelegramUserSchema>;
export type TelegramUser = typeof telegramUsers.$inferSelect;

// Filtered words schema
export const filteredWords = pgTable("filtered_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  category: text("category").notNull(), // "profanity", "spam", "harassment", "custom"
  deleteMessage: boolean("delete_message").default(true),
  warnUser: boolean("warn_user").default(true),
  autoMute: boolean("auto_mute").default(false),
  autoBan: boolean("auto_ban").default(false),
  warningsBeforeMute: integer("warnings_before_mute").default(3),
  warningsBeforeBan: integer("warnings_before_ban").default(5),
});

export const insertFilteredWordSchema = createInsertSchema(filteredWords)
  .pick({
    word: true,
    category: true,
    deleteMessage: true,
    warnUser: true,
    autoMute: true,
    autoBan: true,
    warningsBeforeMute: true,
    warningsBeforeBan: true,
  });

export type InsertFilteredWord = z.infer<typeof insertFilteredWordSchema>;
export type FilteredWord = typeof filteredWords.$inferSelect;

// Moderation actions log
export const moderationLogs = pgTable("moderation_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  telegramUserId: integer("telegram_user_id"),
  actionType: text("action_type").notNull(), // "delete", "warn", "mute", "ban"
  details: text("details"),
  performedBy: text("performed_by").notNull(), // "bot" or username of admin who triggered action
  messageContent: text("message_content"),
  filteredWordId: integer("filtered_word_id"),
  metadata: json("metadata").$type<{
    muteDuration?: number;
    reason?: string;
    chatId?: string;
  }>(),
});

export const insertModerationLogSchema = createInsertSchema(moderationLogs)
  .pick({
    telegramUserId: true,
    actionType: true,
    details: true,
    performedBy: true,
    messageContent: true,
    filteredWordId: true,
    metadata: true,
  });

export type InsertModerationLog = z.infer<typeof insertModerationLogSchema>;
export type ModerationLog = typeof moderationLogs.$inferSelect;

// Bot settings schema
export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  chatId: text("chat_id").notNull().unique(),
  defaultMuteDuration: integer("default_mute_duration").default(24 * 60), // in minutes
  warningThreshold: integer("warning_threshold").default(3),
  muteThreshold: integer("mute_threshold").default(5),
  banThreshold: integer("ban_threshold").default(8),
  deleteOnFilter: boolean("delete_on_filter").default(true),
  warnOnFilter: boolean("warn_on_filter").default(true),
  notifyAdmins: boolean("notify_admins").default(true),
  customWelcomeMessage: text("custom_welcome_message"),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings)
  .pick({
    chatId: true,
    defaultMuteDuration: true,
    warningThreshold: true,
    muteThreshold: true,
    banThreshold: true,
    deleteOnFilter: true,
    warnOnFilter: true,
    notifyAdmins: true,
    customWelcomeMessage: true,
  });

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
