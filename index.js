const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const ACTIONS = require("./Actions");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

const userSocketMap = {};
const roomData = {}; 

const getAllConnectedClients = (roomId) => {
  return [...wss.clients]
    .filter(client => client.readyState === WebSocket.OPEN && client.roomId === roomId)
    .map(client => ({
      socketId: client.socketId,
      username: client.username,
    }));
};

const sendToClients = (clients, action, data) => {
  clients.forEach(({ socketId }) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.socketId === socketId) {
        client.send(JSON.stringify({ action, data }));
      }
    });
  });
};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { action, data } = parsedMessage;

      if (action === ACTIONS.JOIN) {
        const { roomId, username, category } = data; // Accept category here
        ws.roomId = roomId;
        ws.username = username;
        ws.socketId = ws._socket.remoteAddress + ':' + ws._socket.remotePort;

        userSocketMap[ws.socketId] = username;

        // Initialize room data if it doesn't exist
        if (!roomData[roomId]) {
          roomData[roomId] = {
            notes: [],
            versionHistory: [], 
          };
        }

        const clients = getAllConnectedClients(roomId);
        sendToClients(clients, ACTIONS.JOINED, { clients, username, socketId: ws.socketId });
      }

      if (action === "content-change") {
        const { roomId, content } = data;

   
        if (roomData[roomId]) {
          roomData[roomId].versionHistory.push(content); 
        }

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId && client !== ws) {
            client.send(JSON.stringify({ action: "code-change", data: { code: content } }));
          }
        });
      }

      if (action === ACTIONS.SEND_COMMENT) {
        const { roomId, comment } = data;

    
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
            client.send(JSON.stringify({ action: ACTIONS.RECEIVE_COMMENT, data: { comment, username: ws.username } }));
          }
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
    const roomId = ws.roomId;
    const username = userSocketMap[ws.socketId];
    delete userSocketMap[ws.socketId];

    const clients = getAllConnectedClients(roomId);
    sendToClients(clients, ACTIONS.DISCONNECTED, { socketId: ws.socketId, username });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

/* first submit      */




