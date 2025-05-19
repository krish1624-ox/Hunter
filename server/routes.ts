import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startBot, stopBot, getBot } from "./telegram-bot";
import { z } from "zod";
import { insertFilteredWordSchema, insertBotSettingsSchema } from "@shared/schema";
import { setupAuth, requireAuth, requireAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the Telegram bot
  startBot();

  // Prefix all API routes with /api
  
  // Get stats for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const logs = await storage.getModerationLogs();
      
      // Count actions by type in the past 7 days and today
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgoDate = new Date(now);
      weekAgoDate.setDate(now.getDate() - 7);
      
      const stats = {
        messagesFiltered: {
          today: 0,
          week: 0,
          total: 0
        },
        warningsIssued: {
          today: 0,
          week: 0,
          total: 0
        },
        usersMuted: {
          today: 0,
          week: 0,
          total: 0
        },
        usersBanned: {
          today: 0,
          week: 0,
          total: 0
        }
      };
      
      logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const isToday = logDate >= todayStart;
        const isThisWeek = logDate >= weekAgoDate;
        
        switch (log.actionType) {
          case "delete":
            stats.messagesFiltered.total++;
            if (isThisWeek) stats.messagesFiltered.week++;
            if (isToday) stats.messagesFiltered.today++;
            break;
          case "warn":
            stats.warningsIssued.total++;
            if (isThisWeek) stats.warningsIssued.week++;
            if (isToday) stats.warningsIssued.today++;
            break;
          case "mute":
            stats.usersMuted.total++;
            if (isThisWeek) stats.usersMuted.week++;
            if (isToday) stats.usersMuted.today++;
            break;
          case "ban":
            stats.usersBanned.total++;
            if (isThisWeek) stats.usersBanned.week++;
            if (isToday) stats.usersBanned.today++;
            break;
        }
      });
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get filtered words
  app.get("/api/filtered-words", async (req, res) => {
    try {
      const words = await storage.getFilteredWords();
      res.json(words);
    } catch (error) {
      console.error("Error fetching filtered words:", error);
      res.status(500).json({ message: "Failed to fetch filtered words" });
    }
  });

  // Add filtered word
  app.post("/api/filtered-words", async (req, res) => {
    try {
      const result = insertFilteredWordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.format() });
      }
      
      const word = await storage.createFilteredWord(result.data);
      res.status(201).json(word);
    } catch (error) {
      console.error("Error adding filtered word:", error);
      res.status(500).json({ message: "Failed to add filtered word" });
    }
  });

  // Update filtered word
  app.patch("/api/filtered-words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const existingWord = await storage.getFilteredWord(id);
      
      if (!existingWord) {
        return res.status(404).json({ message: "Filtered word not found" });
      }
      
      const updateSchema = insertFilteredWordSchema.partial();
      const result = updateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.format() });
      }
      
      const updatedWord = await storage.updateFilteredWord(id, result.data);
      res.json(updatedWord);
    } catch (error) {
      console.error("Error updating filtered word:", error);
      res.status(500).json({ message: "Failed to update filtered word" });
    }
  });

  // Delete filtered word
  app.delete("/api/filtered-words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteFilteredWord(id);
      
      if (!success) {
        return res.status(404).json({ message: "Filtered word not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting filtered word:", error);
      res.status(500).json({ message: "Failed to delete filtered word" });
    }
  });

  // Get moderation logs
  app.get("/api/moderation-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      
      const logs = await storage.getModerationLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching moderation logs:", error);
      res.status(500).json({ message: "Failed to fetch moderation logs" });
    }
  });

  // Get bot settings
  app.get("/api/settings/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      
      if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
      }
      
      const settings = await storage.getOrCreateBotSettings(chatId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching bot settings:", error);
      res.status(500).json({ message: "Failed to fetch bot settings" });
    }
  });

  // Update bot settings
  app.patch("/api/settings/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      
      if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" });
      }
      
      const updateSchema = insertBotSettingsSchema.omit({ chatId: true }).partial();
      const result = updateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.format() });
      }
      
      const updatedSettings = await storage.updateBotSettings(chatId, result.data);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating bot settings:", error);
      res.status(500).json({ message: "Failed to update bot settings" });
    }
  });

  // Get bot status
  app.get("/api/bot/status", (req, res) => {
    const bot = getBot();
    res.json({ active: bot !== null });
  });

  // Send test command
  app.post("/api/bot/test-command", async (req, res) => {
    try {
      const schema = z.object({
        chatId: z.string(),
        command: z.string()
      });
      
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.format() });
      }
      
      const { chatId, command } = result.data;
      const bot = getBot();
      
      if (!bot) {
        return res.status(503).json({ message: "Bot is not active" });
      }
      
      await bot.sendMessage(chatId, command);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending test command:", error);
      res.status(500).json({ message: "Failed to send test command" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Clean up on server shutdown
  process.on('SIGINT', () => {
    stopBot();
    process.exit();
  });

  return httpServer;
}
