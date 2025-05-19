import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';

// Initialize with a token from environment variable
const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '';
let bot: TelegramBot | null = null;

// Command handlers
const commandHandlers: Record<string, (msg: TelegramBot.Message, match: RegExpExecArray | null) => void> = {
  async addfilter(msg, match) {
    if (!msg.from || !isChatAdmin(msg.chat.id, msg.from.id)) {
      return bot?.sendMessage(msg.chat.id, "You must be an admin to use this command.");
    }

    const word = match?.[1]?.trim();
    if (!word) {
      return bot?.sendMessage(msg.chat.id, "Please specify a word to filter. Example: /addfilter badword");
    }

    try {
      const filteredWord = await storage.createFilteredWord({
        word,
        category: "custom",
        deleteMessage: true,
        warnUser: true,
        autoMute: false,
        autoBan: false,
        warningsBeforeMute: 3,
        warningsBeforeBan: 5
      });

      bot?.sendMessage(
        msg.chat.id, 
        `Added "${word}" to the filter list. Messages containing this word will be deleted and users will be warned.`
      );
    } catch (error) {
      console.error('Error adding filter word:', error);
      bot?.sendMessage(msg.chat.id, "Failed to add filter word. Please try again.");
    }
  },

  async warn(msg, match) {
    if (!msg.from || !isChatAdmin(msg.chat.id, msg.from.id)) {
      return bot?.sendMessage(msg.chat.id, "You must be an admin to use this command.");
    }

    // Extract username and reason
    const text = match?.[1]?.trim();
    if (!text) {
      return bot?.sendMessage(msg.chat.id, "Please specify a username and reason. Example: /warn @username Spamming");
    }

    const username = text.split(' ')[0];
    if (!username.startsWith('@')) {
      return bot?.sendMessage(msg.chat.id, "Please specify a valid username starting with @");
    }

    const reason = text.substring(username.length).trim() || "No reason provided";
    const targetUsername = username.substring(1); // Remove @ symbol

    try {
      // Find or create user
      let user = await storage.getTelegramUserByTelegramId(targetUsername);
      
      if (!user) {
        user = await storage.createTelegramUser({
          telegramId: targetUsername,
          username: targetUsername,
          firstName: null,
          lastName: null
        });
      }

      // Increment warning count
      user = await storage.incrementWarningCount(user.telegramId);

      // Create log
      await storage.createModerationLog({
        telegramUserId: user.id,
        actionType: "warn",
        details: reason,
        performedBy: msg.from.username || `${msg.from.id}`,
        messageContent: null,
        filteredWordId: null,
        metadata: {
          reason,
          chatId: msg.chat.id.toString()
        }
      });

      // Check for automatic mute/ban based on warning count
      const settings = await storage.getOrCreateBotSettings(msg.chat.id.toString());
      
      if (user.warningCount >= settings.banThreshold) {
        // Ban user
        await banUser(msg.chat.id, targetUsername, reason, msg.from.username || `${msg.from.id}`);
        return bot?.sendMessage(
          msg.chat.id, 
          `User @${targetUsername} has been warned (${user.warningCount} warnings) and banned for: ${reason}`
        );
      } else if (user.warningCount >= settings.muteThreshold) {
        // Mute user
        await muteUser(msg.chat.id, targetUsername, settings.defaultMuteDuration, reason, msg.from.username || `${msg.from.id}`);
        return bot?.sendMessage(
          msg.chat.id, 
          `User @${targetUsername} has been warned (${user.warningCount} warnings) and muted for ${settings.defaultMuteDuration / 60} hours for: ${reason}`
        );
      }

      // Just warn
      bot?.sendMessage(
        msg.chat.id, 
        `User @${targetUsername} has been warned (${user.warningCount} warnings) for: ${reason}`
      );
    } catch (error) {
      console.error('Error warning user:', error);
      bot?.sendMessage(msg.chat.id, "Failed to warn user. Please try again.");
    }
  },

  async mute(msg, match) {
    if (!msg.from || !isChatAdmin(msg.chat.id, msg.from.id)) {
      return bot?.sendMessage(msg.chat.id, "You must be an admin to use this command.");
    }

    // Extract username and duration
    const text = match?.[1]?.trim();
    if (!text) {
      return bot?.sendMessage(msg.chat.id, "Please specify a username and duration. Example: /mute @username 24h");
    }

    const username = text.split(' ')[0];
    if (!username.startsWith('@')) {
      return bot?.sendMessage(msg.chat.id, "Please specify a valid username starting with @");
    }

    const durationText = text.substring(username.length).trim();
    const duration = parseDuration(durationText);
    
    if (duration <= 0) {
      return bot?.sendMessage(msg.chat.id, "Please specify a valid duration (e.g., 1h, 30m, 2d)");
    }

    const targetUsername = username.substring(1); // Remove @ symbol
    const reason = "Manual mute by admin";

    await muteUser(msg.chat.id, targetUsername, duration, reason, msg.from.username || `${msg.from.id}`);
    
    bot?.sendMessage(
      msg.chat.id, 
      `User @${targetUsername} has been muted for ${formatDuration(duration)}.`
    );
  },

  async ban(msg, match) {
    if (!msg.from || !isChatAdmin(msg.chat.id, msg.from.id)) {
      return bot?.sendMessage(msg.chat.id, "You must be an admin to use this command.");
    }

    // Extract username and reason
    const text = match?.[1]?.trim();
    if (!text) {
      return bot?.sendMessage(msg.chat.id, "Please specify a username and reason. Example: /ban @username Repeated violations");
    }

    const username = text.split(' ')[0];
    if (!username.startsWith('@')) {
      return bot?.sendMessage(msg.chat.id, "Please specify a valid username starting with @");
    }

    const reason = text.substring(username.length).trim() || "No reason provided";
    const targetUsername = username.substring(1); // Remove @ symbol

    await banUser(msg.chat.id, targetUsername, reason, msg.from.username || `${msg.from.id}`);
    
    bot?.sendMessage(
      msg.chat.id, 
      `User @${targetUsername} has been banned for: ${reason}`
    );
  },

  async help(msg) {
    const helpText = `
*TeleModBot Commands*:

*Admin Commands*:
/addfilter [word] - Add a word to filter list
/warn @username [reason] - Issue a warning to a user
/mute @username [duration] - Mute a user (e.g., 1h, 30m, 2d)
/ban @username [reason] - Ban a user from the group
/unmute @username - Unmute a previously muted user
/unban @username - Unban a previously banned user
/settings - View current bot settings
/stats - View moderation statistics

*User Commands*:
/help - Show this help message
/status - Check your warning status
`;
    
    bot?.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  }
};

// Helper functions
function parseDuration(durationText: string): number {
  const unitMultipliers: Record<string, number> = {
    m: 1,          // minute
    h: 60,         // hour
    d: 60 * 24,    // day
    w: 60 * 24 * 7 // week
  };

  const match = durationText.match(/^(\d+)([mhdw])$/);
  if (!match) {
    // Default to 24 hours if format is invalid
    return 60 * 24;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  return value * unitMultipliers[unit];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else if (minutes < 60 * 24) {
    return `${Math.floor(minutes / 60)} hours`;
  } else if (minutes < 60 * 24 * 7) {
    return `${Math.floor(minutes / (60 * 24))} days`;
  } else {
    return `${Math.floor(minutes / (60 * 24 * 7))} weeks`;
  }
}

async function isChatAdmin(chatId: number, userId: number): Promise<boolean> {
  try {
    if (!bot) return false;
    
    const admins = await bot.getChatAdministrators(chatId);
    return admins.some(admin => admin.user.id === userId);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

async function muteUser(
  chatId: number | string, 
  username: string, 
  durationMinutes: number, 
  reason: string, 
  performedBy: string
): Promise<void> {
  try {
    // Find or create user
    let user = await storage.getTelegramUserByTelegramId(username);
      
    if (!user) {
      user = await storage.createTelegramUser({
        telegramId: username,
        username: username,
        firstName: null,
        lastName: null
      });
    }

    // Mute user in storage
    await storage.muteUser(username, durationMinutes);

    // Create log
    await storage.createModerationLog({
      telegramUserId: user.id,
      actionType: "mute",
      details: reason,
      performedBy: performedBy,
      messageContent: null,
      filteredWordId: null,
      metadata: {
        muteDuration: durationMinutes,
        reason,
        chatId: chatId.toString()
      }
    });

    // Mute user in Telegram
    if (bot) {
      // Calculate until date (Telegram uses seconds)
      const untilDate = Math.floor(Date.now() / 1000) + (durationMinutes * 60);
      
      // Restrict user permissions
      await bot.restrictChatMember(chatId, username, {
        until_date: untilDate,
        permissions: {
          can_send_messages: false,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false
        }
      });
    }
  } catch (error) {
    console.error('Error muting user:', error);
    throw error;
  }
}

async function banUser(
  chatId: number | string, 
  username: string, 
  reason: string, 
  performedBy: string
): Promise<void> {
  try {
    // Find or create user
    let user = await storage.getTelegramUserByTelegramId(username);
      
    if (!user) {
      user = await storage.createTelegramUser({
        telegramId: username,
        username: username,
        firstName: null,
        lastName: null
      });
    }

    // Ban user in storage
    await storage.banUser(username);

    // Create log
    await storage.createModerationLog({
      telegramUserId: user.id,
      actionType: "ban",
      details: reason,
      performedBy: performedBy,
      messageContent: null,
      filteredWordId: null,
      metadata: {
        reason,
        chatId: chatId.toString()
      }
    });

    // Ban user in Telegram
    if (bot) {
      await bot.banChatMember(chatId, username);
    }
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
}

async function handleMessage(msg: TelegramBot.Message): Promise<void> {
  try {
    if (!msg.text || !msg.from || !msg.chat.id) return;
    
    // Check if message contains filtered words
    const filteredWord = await storage.containsFilteredWord(msg.text);
    if (filteredWord) {
      // Get bot settings
      const settings = await storage.getOrCreateBotSettings(msg.chat.id.toString());
      
      // Delete message if configured
      if (settings.deleteOnFilter && bot) {
        await bot.deleteMessage(msg.chat.id, msg.message_id.toString());
      }
      
      if (settings.warnOnFilter) {
        // Find or create user
        let user = await storage.getTelegramUserByTelegramId(msg.from.id.toString());
        
        if (!user) {
          user = await storage.createTelegramUser({
            telegramId: msg.from.id.toString(),
            username: msg.from.username || null,
            firstName: msg.from.first_name || null,
            lastName: msg.from.last_name || null
          });
        }
        
        // Increment warning count
        user = await storage.incrementWarningCount(user.telegramId);
        
        // Create log
        await storage.createModerationLog({
          telegramUserId: user.id,
          actionType: "delete",
          details: `Message contained filtered word: ${filteredWord.word}`,
          performedBy: "bot",
          messageContent: msg.text,
          filteredWordId: filteredWord.id,
          metadata: {
            chatId: msg.chat.id.toString()
          }
        });
        
        // Apply automatic actions based on word settings and warning count
        let actionTaken = false;
        
        // Check for word-specific mute action
        if (filteredWord.autoMute && user.warningCount >= filteredWord.warningsBeforeMute) {
          await muteUser(
            msg.chat.id, 
            user.telegramId, 
            settings.defaultMuteDuration, 
            `Automatic mute after ${user.warningCount} warnings for using filtered word: ${filteredWord.word}`, 
            "bot"
          );
          actionTaken = true;
          
          if (bot) {
            bot.sendMessage(
              msg.chat.id, 
              `@${msg.from.username || msg.from.id} has been muted for ${settings.defaultMuteDuration / 60} hours for using filtered word.`
            );
          }
        }
        
        // Check for word-specific ban action
        if (filteredWord.autoBan && user.warningCount >= filteredWord.warningsBeforeBan) {
          await banUser(
            msg.chat.id, 
            user.telegramId, 
            `Automatic ban after ${user.warningCount} warnings for using filtered word: ${filteredWord.word}`, 
            "bot"
          );
          actionTaken = true;
          
          if (bot) {
            bot.sendMessage(
              msg.chat.id, 
              `@${msg.from.username || msg.from.id} has been banned for using filtered word repeatedly.`
            );
          }
        }
        
        // Check for general threshold-based actions if no action taken yet
        if (!actionTaken) {
          if (user.warningCount >= settings.banThreshold) {
            await banUser(
              msg.chat.id, 
              user.telegramId, 
              `Automatic ban after reaching ${settings.banThreshold} warnings`, 
              "bot"
            );
            
            if (bot) {
              bot.sendMessage(
                msg.chat.id, 
                `@${msg.from.username || msg.from.id} has been banned after reaching ${settings.banThreshold} warnings.`
              );
            }
          } else if (user.warningCount >= settings.muteThreshold) {
            await muteUser(
              msg.chat.id, 
              user.telegramId, 
              settings.defaultMuteDuration, 
              `Automatic mute after reaching ${settings.muteThreshold} warnings`, 
              "bot"
            );
            
            if (bot) {
              bot.sendMessage(
                msg.chat.id, 
                `@${msg.from.username || msg.from.id} has been muted for ${settings.defaultMuteDuration / 60} hours after reaching ${settings.muteThreshold} warnings.`
              );
            }
          } else if (settings.warnOnFilter) {
            // Simple warning
            if (bot) {
              bot.sendMessage(
                msg.chat.id, 
                `@${msg.from.username || msg.from.id} warning #${user.warningCount}: Please don't use filtered words.`
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

export function startBot(): void {
  if (!telegramToken) {
    console.error('TELEGRAM_BOT_TOKEN is not set. Bot cannot start.');
    return;
  }
  
  // Create bot instance with polling enabled
  bot = new TelegramBot(telegramToken, { polling: true });
  
  // Register command handlers
  bot.onText(/\/addfilter (.+)/, commandHandlers.addfilter);
  bot.onText(/\/warn (.+)/, commandHandlers.warn);
  bot.onText(/\/mute (.+)/, commandHandlers.mute);
  bot.onText(/\/ban (.+)/, commandHandlers.ban);
  bot.onText(/\/help/, commandHandlers.help);
  
  // Handle messages for filtering
  bot.on('message', handleMessage);
  
  console.log('Telegram bot started');
}

export function getBot(): TelegramBot | null {
  return bot;
}

export function stopBot(): void {
  if (bot) {
    bot.stopPolling();
    bot = null;
    console.log('Telegram bot stopped');
  }
}
