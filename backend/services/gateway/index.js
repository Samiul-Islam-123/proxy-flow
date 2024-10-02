const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors : {
    origin : "*"
  }
});

const IO = require("socket.io-client");

app.use(
  "/monitoring",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/monitoring": "",
    },
  })
);

app.use(
  "/simulation",
  createProxyMiddleware({
    target: "http://localhost:3002", // Simulation service URL
    changeOrigin: true,
    pathRewrite: {
      "^/simulation": "", // Remove `/simulation` prefix when forwarding
    },
  })
);

app.use((req, res) => {
  res.status(404).json({
    error: "Service not found :(",
  });
});

io.on("connection", (socket) => {
  console.log("New User connected...");

  let MonitorSocket;

  socket.on("start-monitoring", (data) => {
    if (!MonitorSocket) {
      MonitorSocket = IO("http://localhost:3001"); // Create connection if it doesn't exist

      MonitorSocket.on("connect", () => {
        console.log("Connected to Monitoring API");
      });

      MonitorSocket.emit('start-monitoring', data);

      MonitorSocket.on('monitoring-data', data=>{
        socket.emit("monitoring-result", data);//sending to client
      })

      // Optionally handle events from the monitor API
      MonitorSocket.on("monitoring-error", (data) => {
        socket.emit("monitoring-error", data); // Forward data to the original client
      });

      MonitorSocket.on("disconnect", () => {
        console.log("Disconnected from Monitoring API");
      });

      MonitorSocket.on("error", (err) => {
        console.log("Monitoring socket error:", err);
      });
    } else {
      console.log("Already connected to Monitoring API");
    }
  });

  socket.on("end-monitor", () => {
    if (MonitorSocket) {
      MonitorSocket.disconnect(); // Properly close the socket connection
      MonitorSocket = null; // Set to null to allow future re-connections
      console.log("Monitoring API connection closed");
    } else {
      console.log("No Monitoring API connection to close");
    }
  });

  socket.on("disconnect", () => {
    console.log("User Diconnected");
    if(MonitorSocket) 
    MonitorSocket.disconnect(); // Properly close the socket connection
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Main Server is up and running on PORT : " + PORT);
});
