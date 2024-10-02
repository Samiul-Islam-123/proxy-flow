const io = require('socket.io-client');

// Connect to the Monitoring Service via the API Gateway
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to the Monitoring Service via API Gateway');
});

//sample simulation to monitoring service

socket.emit('start-monitoring', {
    endpoint : "https://polite-bat-77.telebit.io/data",
    method : 'GET',
});

socket.on('monitoring-result', result => {
    console.log(result)
})

socket.on('monitoring-error', error => {
    console.log(error)
})


socket.on('disconnect', () => {
    console.log('Disconnected from the Monitoring Service');
});

console.log("Client started...");
