import { 
  users, type User, type InsertUser,
  telegramUsers, type TelegramUser, type InsertTelegramUser,
  filteredWords, type FilteredWord, type InsertFilteredWord,
  moderationLogs, type ModerationLog, type InsertModerationLog,
  botSettings, type BotSettings, type InsertBotSettings
} from "@shared/schema";

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

export const storage = new MemStorage();
