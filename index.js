import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import TelegramBot from "node-telegram-bot-api";

const app = express();
const port = process.env.PORT || 3000;

// Environment variables from Dedalus
const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const RSS_FEED = process.env.RSS_FEED;

// Set up Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const parser = new Parser();

// 📰 Fetch positive news
async function fetchPositiveNews() {
  try {
    const feed = await parser.parseURL(RSS_FEED);
    const items = feed.items.slice(0, 5); // top 5 headlines
    return items.map((item) => `🟢 *${item.title}*\n${item.link}`).join("\n\n");
  } catch (error) {
    console.error("Error fetching news:", error);
    return "Could not fetch news right now.";
  }
}

// 📩 When user types /goodnews
bot.onText(/\/goodnews/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Fetching positive news... 🌞");
  const news = await fetchPositiveNews();
  bot.sendMessage(chatId, news, { parse_mode: "Markdown" });
});

// Basic express route (optional health check)
app.get("/", (req, res) => {
  res.send("Positive News Agent is running ✅");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
