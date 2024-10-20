const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : "*"
    }
});


const PORT = process.env.PORT || 3003;
app.use(express.json());
app.use(cors());

app.get('/', (req,res) => {
    res.json({
        message : "Testing Service is running..."
    })
})

io.on('connection', (socket) => {
    console.log("new socket connected to Testing Server...");

    socket.on('load-testing', async (data) => {
        const { url, numberOfRequests, concurrency } = data;
      
        // Function to perform a single HTTP request
        const performRequest = async () => {
          try {
            const response = await axios.get(url);
            console.log(`Status: ${response.status}`);
          } catch (error) {
            console.error(`Error: ${error.message}`);
          }
        };
      
        // Function to run load testing with concurrency
        const runLoadTest = async () => {
          const promises = [];
          for (let i = 0; i < numberOfRequests; i++) {
            // Add a new request to the promises array
            promises.push(performRequest());
      
            // Limit concurrency by waiting for a batch to complete before starting new requests
            if (promises.length >= concurrency) {
              await Promise.all(promises); // Wait for all requests in the batch to finish
              promises.length = 0; // Reset the array for the next batch
            }
          }
      
          // Await any remaining requests if there are less than the concurrency limit
          await Promise.all(promises);
          console.log('Load testing complete.');
        };
      
        // Start load testing
        await runLoadTest();
      });

    socket.on('disconnect', () => {
        console.log("User disconnected...")
    })
})

server.listen(PORT, () => {
    console.log('Testing Service is up and running on PORT : '+PORT);
})