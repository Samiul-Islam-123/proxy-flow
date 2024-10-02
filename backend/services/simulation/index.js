const express = require('express');
const app = express();

const PORT = process.env.PORT || 3002;

app.get('/', (req,res) => {
    res.json({
        message : "Simulation Service is running..."
    })
})

app.listen(PORT, () => {
    console.log('Simulation Service is up and running on PORT : '+PORT);
})