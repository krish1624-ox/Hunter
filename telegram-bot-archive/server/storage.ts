import { 
  users, type User, type InsertUser,
  telegramUsers, type TelegramUser, type InsertTelegramUser,
  filteredWords, type FilteredWord, type InsertFilteredWord,
  moderationLogs, type ModerationLog, type InsertModerationLog,
  botSettings, type BotSettings, type InsertBotSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // TelegramUser methods
  getTelegramUser(id: number): Promise<TelegramUser | undefined>;
  getTelegramUserByTelegramId(telegramId: string): Promise<TelegramUser | undefined>;
  createTelegramUser(user: InsertTelegramUser): Promise<TelegramUser>;
  updateTelegramUser(id: number, updates: Partial<TelegramUser>): Promise<TelegramUser | undefined>;
  incrementWarningCount(telegramId: string): Promise<TelegramUser | undefined>;
  muteUser(telegramId: string, durationMinutes: number): Promise<TelegramUser | undefined>;
  unmuteUser(telegramId: string): Promise<TelegramUser | undefined>;
  banUser(telegramId: string): Promise<TelegramUser | undefined>;
  unbanUser(telegramId: string): Promise<TelegramUser | undefined>;

  // FilteredWord methods
  getFilteredWords(): Promise<FilteredWord[]>;
  getFilteredWord(id: number): Promise<FilteredWord | undefined>;
  createFilteredWord(word: InsertFilteredWord): Promise<FilteredWord>;
  updateFilteredWord(id: number, updates: Partial<FilteredWord>): Promise<FilteredWord | undefined>;
  deleteFilteredWord(id: number): Promise<boolean>;
  containsFilteredWord(message: string): Promise<FilteredWord | undefined>;

  // ModerationLog methods
  getModerationLogs(limit?: number, offset?: number): Promise<ModerationLog[]>;
  getModerationLogsByUser(telegramUserId: number): Promise<ModerationLog[]>;
  createModerationLog(log: InsertModerationLog): Promise<ModerationLog>;

  // BotSettings methods
  getBotSettings(chatId: string): Promise<BotSettings | undefined>;
  getOrCreateBotSettings(chatId: string): Promise<BotSettings>;
  updateBotSettings(chatId: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private telegramUsers: Map<number, TelegramUser>;
  private filteredWords: Map<number, FilteredWord>;
  private moderationLogs: ModerationLog[];
  private botSettings: Map<string, BotSettings>;
  
  private currentUserId: number;
  private currentTelegramUserId: number;
  private currentFilteredWordId: number;
  private currentModerationLogId: number;
  private currentBotSettingsId: number;

  constructor() {
    this.users = new Map();
    this.telegramUsers = new Map();
    this.filteredWords = new Map();
    this.moderationLogs = [];
    this.botSettings = new Map();
    
    this.currentUserId = 1;
    this.currentTelegramUserId = 1;
    this.currentFilteredWordId = 1;
    this.currentModerationLogId = 1;
    this.currentBotSettingsId = 1;

    // Initialize with some default filtered words
    const defaultWords = [
      {
        word: "profanity1",
        category: "profanity",
        deleteMessage: true,
        warnUser: true,
        autoMute: false,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      },
      {
        word: "spam1",
        category: "spam",
        deleteMessage: true,
        warnUser: true,
        autoMute: true,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      },
      {
        word: "freecoin",
        category: "spam",
        deleteMessage: true,
        warnUser: true,
        autoMute: false,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      },
      {
        word: "clickhere",
        category: "spam",
        deleteMessage: true,
        warnUser: true,
        autoMute: true,
        autoBan: false,
        warningsBeforeMute: 2,
        warningsBeforeBan: 5
      },
      {
        word: "harassment1",
        category: "harassment",
        deleteMessage: true,
        warnUser: true,
        autoMute: true,
        autoBan: true,
        warningsBeforeMute: 2,
        warningsBeforeBan: 4
      }
    ];

    defaultWords.forEach(word => {
      this.filteredWords.set(this.currentFilteredWordId, {
        ...word,
        id: this.currentFilteredWordId++
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // TelegramUser methods
  async getTelegramUser(id: number): Promise<TelegramUser | undefined> {
    return this.telegramUsers.get(id);
  }

  async getTelegramUserByTelegramId(telegramId: string): Promise<TelegramUser | undefined> {
    return Array.from(this.telegramUsers.values()).find(
      (user) => user.telegramId === telegramId,
    );
  }

  async createTelegramUser(insertUser: InsertTelegramUser): Promise<TelegramUser> {
    const id = this.currentTelegramUserId++;
    const user: TelegramUser = { 
      ...insertUser, 
      id, 
      warningCount: 0,
      isMuted: false,
      isBanned: false,
      muteExpiresAt: null
    };
    this.telegramUsers.set(id, user);
    return user;
  }

  async updateTelegramUser(id: number, updates: Partial<TelegramUser>): Promise<TelegramUser | undefined> {
    const user = await this.getTelegramUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.telegramUsers.set(id, updatedUser);
    return updatedUser;
  }

  async incrementWarningCount(telegramId: string): Promise<TelegramUser | undefined> {
    const user = await this.getTelegramUserByTelegramId(telegramId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      warningCount: (user.warningCount || 0) + 1 
    };
    
    this.telegramUsers.set(user.id, updatedUser);
    return updatedUser;
  }

  async muteUser(telegramId: string, durationMinutes: number): Promise<TelegramUser | undefined> {
    const user = await this.getTelegramUserByTelegramId(telegramId);
    if (!user) return undefined;
    
    const muteExpiresAt = new Date();
    muteExpiresAt.setMinutes(muteExpiresAt.getMinutes() + durationMinutes);
    
    const updatedUser = { 
      ...user, 
      isMuted: true,
      muteExpiresAt
    };
    
    this.telegramUsers.set(user.id, updatedUser);
    return updatedUser;
  }

  async unmuteUser(telegramId: string): Promise<TelegramUser | undefined> {
    const user = await this.getTelegramUserByTelegramId(telegramId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      isMuted: false,
      muteExpiresAt: null
    };
    
    this.telegramUsers.set(user.id, updatedUser);
    return updatedUser;
  }

  async banUser(telegramId: string): Promise<TelegramUser | undefined> {
    const user = await this.getTelegramUserByTelegramId(telegramId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      isBanned: true,
      isMuted: false,
      muteExpiresAt: null
    };
    
    this.telegramUsers.set(user.id, updatedUser);
    return updatedUser;
  }

  async unbanUser(telegramId: string): Promise<TelegramUser | undefined> {
    const user = await this.getTelegramUserByTelegramId(telegramId);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      isBanned: false
    };
    
    this.telegramUsers.set(user.id, updatedUser);
    return updatedUser;
  }

  // FilteredWord methods
  async getFilteredWords(): Promise<FilteredWord[]> {
    return Array.from(this.filteredWords.values());
  }

  async getFilteredWord(id: number): Promise<FilteredWord | undefined> {
    return this.filteredWords.get(id);
  }

  async createFilteredWord(insertWord: InsertFilteredWord): Promise<FilteredWord> {
    const id = this.currentFilteredWordId++;
    const word: FilteredWord = { ...insertWord, id };
    this.filteredWords.set(id, word);
    return word;
  }

  async updateFilteredWord(id: number, updates: Partial<FilteredWord>): Promise<FilteredWord | undefined> {
    const word = await this.getFilteredWord(id);
    if (!word) return undefined;
    
    const updatedWord = { ...word, ...updates };
    this.filteredWords.set(id, updatedWord);
    return updatedWord;
  }

  async deleteFilteredWord(id: number): Promise<boolean> {
    return this.filteredWords.delete(id);
  }

  async containsFilteredWord(message: string): Promise<FilteredWord | undefined> {
    const words = Array.from(this.filteredWords.values());
    const lowercaseMsg = message.toLowerCase();
    
    return words.find(word => lowercaseMsg.includes(word.word.toLowerCase()));
  }

  // ModerationLog methods
  async getModerationLogs(limit: number = 100, offset: number = 0): Promise<ModerationLog[]> {
    return this.moderationLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }

  async getModerationLogsByUser(telegramUserId: number): Promise<ModerationLog[]> {
    return this.moderationLogs
      .filter(log => log.telegramUserId === telegramUserId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createModerationLog(insertLog: InsertModerationLog): Promise<ModerationLog> {
    const id = this.currentModerationLogId++;
    const log: ModerationLog = { 
      ...insertLog, 
      id,
      timestamp: new Date()
    };
    
    this.moderationLogs.push(log);
    return log;
  }

  // BotSettings methods
  async getBotSettings(chatId: string): Promise<BotSettings | undefined> {
    return Array.from(this.botSettings.values()).find(
      (settings) => settings.chatId === chatId,
    );
  }

  async getOrCreateBotSettings(chatId: string): Promise<BotSettings> {
    const existing = await this.getBotSettings(chatId);
    if (existing) return existing;
    
    const id = this.currentBotSettingsId++;
    const settings: BotSettings = {
      id,
      chatId,
      defaultMuteDuration: 24 * 60, // 24 hours in minutes
      warningThreshold: 3,
      muteThreshold: 5,
      banThreshold: 8,
      deleteOnFilter: true,
      warnOnFilter: true,
      notifyAdmins: true,
      customWelcomeMessage: null
    };
    
    this.botSettings.set(id, settings);
    return settings;
  }

  async updateBotSettings(chatId: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined> {
    const settings = await this.getBotSettings(chatId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...updates };
    this.botSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // TelegramUser methods
  async getTelegramUser(id: number): Promise<TelegramUser | undefined> {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.id, id));
    return user;
  }

  async getTelegramUserByTelegramId(telegramId: string): Promise<TelegramUser | undefined> {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.telegramId, telegramId));
    return user;
  }

  async createTelegramUser(insertUser: InsertTelegramUser): Promise<TelegramUser> {
    const [user] = await db
      .insert(telegramUsers)
      .values({
        ...insertUser,
        warningCount: 0,
        isMuted: false,
        isBanned: false,
        muteExpiresAt: null,
      })
      .returning();
    return user;
  }

  async updateTelegramUser(id: number, updates: Partial<TelegramUser>): Promise<TelegramUser | undefined> {
    const [user] = await db
      .update(telegramUsers)
      .set(updates)
      .where(eq(telegramUsers.id, id))
      .returning();
    return user;
  }

  async incrementWarningCount(telegramId: string): Promise<TelegramUser | undefined> {
    const [user] = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId));
    
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(telegramUsers)
      .set({
        warningCount: (user.warningCount || 0) + 1,
      })
      .where(eq(telegramUsers.id, user.id))
      .returning();
    
    return updatedUser;
  }

  async muteUser(telegramId: string, durationMinutes: number): Promise<TelegramUser | undefined> {
    const [user] = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId));
    
    if (!user) return undefined;
    
    const muteExpiresAt = new Date();
    muteExpiresAt.setMinutes(muteExpiresAt.getMinutes() + durationMinutes);
    
    const [updatedUser] = await db
      .update(telegramUsers)
      .set({
        isMuted: true,
        muteExpiresAt,
      })
      .where(eq(telegramUsers.id, user.id))
      .returning();
    
    return updatedUser;
  }

  async unmuteUser(telegramId: string): Promise<TelegramUser | undefined> {
    const [user] = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId));
    
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(telegramUsers)
      .set({
        isMuted: false,
        muteExpiresAt: null,
      })
      .where(eq(telegramUsers.id, user.id))
      .returning();
    
    return updatedUser;
  }

  async banUser(telegramId: string): Promise<TelegramUser | undefined> {
    const [user] = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId));
    
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(telegramUsers)
      .set({
        isBanned: true,
        isMuted: false,
        muteExpiresAt: null,
      })
      .where(eq(telegramUsers.id, user.id))
      .returning();
    
    return updatedUser;
  }

  async unbanUser(telegramId: string): Promise<TelegramUser | undefined> {
    const [user] = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId));
    
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(telegramUsers)
      .set({
        isBanned: false,
      })
      .where(eq(telegramUsers.id, user.id))
      .returning();
    
    return updatedUser;
  }

  // FilteredWord methods
  async getFilteredWords(): Promise<FilteredWord[]> {
    return await db.select().from(filteredWords);
  }

  async getFilteredWord(id: number): Promise<FilteredWord | undefined> {
    const [word] = await db.select().from(filteredWords).where(eq(filteredWords.id, id));
    return word;
  }

  async createFilteredWord(insertWord: InsertFilteredWord): Promise<FilteredWord> {
    const [word] = await db
      .insert(filteredWords)
      .values(insertWord)
      .returning();
    return word;
  }

  async updateFilteredWord(id: number, updates: Partial<FilteredWord>): Promise<FilteredWord | undefined> {
    const [word] = await db
      .update(filteredWords)
      .set(updates)
      .where(eq(filteredWords.id, id))
      .returning();
    return word;
  }

  async deleteFilteredWord(id: number): Promise<boolean> {
    const result = await db
      .delete(filteredWords)
      .where(eq(filteredWords.id, id));
    return result.rowCount > 0;
  }

  async containsFilteredWord(message: string): Promise<FilteredWord | undefined> {
    const words = await db.select().from(filteredWords);
    const lowercaseMsg = message.toLowerCase();
    
    return words.find(word => lowercaseMsg.includes(word.word.toLowerCase()));
  }

  // ModerationLog methods
  async getModerationLogs(limit: number = 100, offset: number = 0): Promise<ModerationLog[]> {
    return await db
      .select()
      .from(moderationLogs)
      .orderBy(desc(moderationLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getModerationLogsByUser(telegramUserId: number): Promise<ModerationLog[]> {
    return await db
      .select()
      .from(moderationLogs)
      .where(eq(moderationLogs.telegramUserId, telegramUserId))
      .orderBy(desc(moderationLogs.timestamp));
  }

  async createModerationLog(insertLog: InsertModerationLog): Promise<ModerationLog> {
    const [log] = await db
      .insert(moderationLogs)
      .values({
        ...insertLog,
        timestamp: new Date(),
      })
      .returning();
    return log;
  }

  // BotSettings methods
  async getBotSettings(chatId: string): Promise<BotSettings | undefined> {
    const [settings] = await db
      .select()
      .from(botSettings)
      .where(eq(botSettings.chatId, chatId));
    return settings;
  }

  async getOrCreateBotSettings(chatId: string): Promise<BotSettings> {
    const existing = await this.getBotSettings(chatId);
    if (existing) return existing;
    
    const [settings] = await db
      .insert(botSettings)
      .values({
        chatId,
        defaultMuteDuration: 24 * 60, // 24 hours in minutes
        warningThreshold: 3,
        muteThreshold: 5,
        banThreshold: 8,
        deleteOnFilter: true,
        warnOnFilter: true,
        notifyAdmins: true,
        customWelcomeMessage: null,
      })
      .returning();
    
    return settings;
  }

  async updateBotSettings(chatId: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined> {
    const [settings] = await db
      .select()
      .from(botSettings)
      .where(eq(botSettings.chatId, chatId));
    
    if (!settings) return undefined;
    
    const [updatedSettings] = await db
      .update(botSettings)
      .set(updates)
      .where(eq(botSettings.id, settings.id))
      .returning();
    
    return updatedSettings;
  }
}

// Initialize the database with default filtered words if empty
async function initializeDefaultFilteredWords() {
  const words = await db.select().from(filteredWords);
  
  if (words.length === 0) {
    const defaultWords = [
      {
        word: "profanity1",
        category: "profanity",
        deleteMessage: true,
        warnUser: true,
        autoMute: false,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      },
      {
        word: "spam1",
        category: "spam",
        deleteMessage: true,
        warnUser: true,
        autoMute: true,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      },
      {
        word: "freecoin",
        category: "spam",
        deleteMessage: true,
        warnUser: true,
        autoMute: false,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      },
      {
        word: "clickhere",
        category: "spam",
        deleteMessage: true,
        warnUser: true,
        autoMute: true,
        autoBan: false,
        warningsBeforeMute: 2,
        warningsBeforeBan: 5
      },
      {
        word: "harassment1",
        category: "harassment",
        deleteMessage: true,
        warnUser: true,
        autoMute: true,
        autoBan: true,
        warningsBeforeMute: 2,
        warningsBeforeBan: 4
      }
    ];
    
    await db.insert(filteredWords).values(defaultWords);
  }
}

// Initialize the storage
initializeDefaultFilteredWords()
  .then(() => console.log("Default filtered words initialized"))
  .catch(err => console.error("Error initializing default filtered words:", err));

export const storage = new DatabaseStorage();
