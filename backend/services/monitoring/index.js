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


const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

app.get('/', (req,res) => {
    res.json({
        message : "Monitoring Service is running..."
    })
})

//performance monitoring
app.post('/test-api', async (req, res) => {
    try {
        const requestBody = req.body;
        const method = requestBody.method;
        
        const startTime = new Date().getTime();
        const response = await axios({
            method: method,
            url: requestBody.targetURL
        });
        const endTime = new Date().getTime();
        const timeElapsed = endTime - startTime;

        // Extracting additional details
        const responseType = response.headers['content-type'];
        const responseSize = JSON.stringify(response.data).length;  // size in bytes

        res.json({
            response_status: response.status,
            response_time: timeElapsed,
            response_type: responseType,
            response_size: responseSize,
            response_headers: response.headers,
            response_data: response.data  // consider limiting or omitting this for large responses
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Monitoring Server error",
            error: error.message
        });
    }
});

app.get('/realtime', async(req,res) => {
    console.log("Got something")
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection message
    res.write(`data: Connected to SSE\n\n`);

    // Simulate sending updates to the client every 5 seconds
    const intervalId = setInterval(() => {
        const data = { message: "Real-time update", timestamp: new Date() };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }, 5000);

    // Close connection when the client disconnects
    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
    
})

io.on('connection', (socket) => {
    console.log("new socket connected to Monitoring Server...");

    socket.on('start-monitoring',async data => {
        setInterval(async () => {
            try{
                const endpoint = data.endpoint;
                const method = data.method;
    
                const start_time = new Date().getTime();
                const response = await axios({
                    url : endpoint,
                    method : method
                })
                const end_time = new Date().getTime();
    
                const monitoringResult = {
                    responseStatus : response.status,
                    // responseData : response.data,
                    responseTime : end_time - start_time,
                    responseType : response.headers['content-type'],
                    responseSize : JSON.stringify(response.data).length,
                }
    
                socket.emit("monitoring-data", monitoringResult);
            }
            catch(error){
                //console.error(error);
                socket.emit("monitoring-error", error.message)
            }
        },2000)
    })

    socket.on('disconnect', () => {
        console.log("User disconnected...")
    })
})

server.listen(PORT, () => {
    console.log('Monitoring Service is up and running on PORT : '+PORT);
})