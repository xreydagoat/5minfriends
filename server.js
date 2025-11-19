// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

// Serve static files from the "public" folder (index.html lives here)
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Track connected clients and pairings
const clients = new Set();
let waitingClient = null; // one person waiting for a match
const pairings = new Map(); // ws -> partner ws

// Send updated online count to everyone
function broadcastOnlineCount() {
  const msg = JSON.stringify({
    type: "online_count",
    count: clients.size,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// Clean up when a client leaves
function handleDisconnect(ws) {
  clients.delete(ws);

  // If they were the one waiting, clear the queue
  if (waitingClient === ws) {
    waitingClient = null;
  }

  // If they were paired, notify the partner
  const partner = pairings.get(ws);
  if (partner) {
    pairings.delete(ws);
    pairings.delete(partner);

    if (partner.readyState === WebSocket.OPEN) {
      partner.send(
        JSON.stringify({
          type: "partner_left",
        })
      );
    }
  }

  broadcastOnlineCount();
}

// Handle new WebSocket connection
wss.on("connection", (ws) => {
  clients.add(ws);
  broadcastOnlineCount();

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (err) {
      console.error("Invalid message JSON:", raw.toString());
      return;
    }

    switch (data.type) {
      case "join_queue": {
        // If someone is already waiting, pair them
        if (
          waitingClient &&
          waitingClient !== ws &&
          waitingClient.readyState === WebSocket.OPEN
        ) {
          const partner = waitingClient;
          waitingClient = null;

          // Store pairings both ways
          pairings.set(ws, partner);
          pairings.set(partner, ws);

          // Notify both that they're matched
          const payload = JSON.stringify({ type: "matched" });
          ws.send(payload);
          partner.send(payload);
        } else {
          // Otherwise, this client waits
          waitingClient = ws;
        }
        break;
      }

      case "chat_message": {
        const partner = pairings.get(ws);
        if (partner && partner.readyState === WebSocket.OPEN) {
          partner.send(
            JSON.stringify({
              type: "chat_message",
              text: data.text,
            })
          );
        }
        break;
      }

      case "leave": {
        handleDisconnect(ws);
        break;
      }

      default:
        console.log("Unknown message type:", data.type);
    }
  });

  ws.on("close", () => {
    handleDisconnect(ws);
  });
});

// Start HTTP + WebSocket server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`5 Minute Friends server running on http://localhost:${PORT}`);
});
