const express = require("express");
const axios = require("axios");
const askGroq = require("../src/AIBot");
const cors = require('cors');
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const {
  PORT,
  VERIFY_TOKEN,
} = process.env;

// PAGE_ACCESS_TOKEN,
// GRAPH_API_VERSION,

app.get("/", (req, res) => res.send("Welcome to Chika Chino"));

app.get("/webhook", (req, res) => {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
});

app.post("/webhook", async (req, res) => {
  const messaging = req.body.entry?.[0]?.messaging?.[0];

  if (messaging && messaging.sender && messaging.message) {
    const question = messaging.message.text;
    const answer = await askGroq(question);

    const senderId = messaging.sender.id;
    const pageId = messaging.recipient.id;

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const payload = {
      recipient: { id: senderId },
      messaging_type: "RESPONSE",
      message: { text: answer },
    };

    try {
      await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Message Sent");
    } catch (error) {
      console.error(
        `Error sending message: ${error.response?.data || error.message}`
      );
    }
  }

  res.status(200).send("OK");
});

app.post("/askChikaChino", async (req, res) => {
  const { question } = req.body;

  if (!question) return res.sendStatus(400);

  const answer = await askGroq(question);
  res.status(200).send(answer);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;