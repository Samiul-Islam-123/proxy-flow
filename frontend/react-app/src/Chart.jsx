import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import io from "socket.io-client";

const Chart = () => {
  const [data, setData] = useState([]);
  const [timeCounter, setTimeCounter] = useState(0); // Counter for x-axis time

  useEffect(() => {
    const socket = io('http://localhost:3000');

    if (socket) {
      socket.emit('start-monitoring', {
        endpoint: "https://polite-bat-77.telebit.io/data",
        method: 'GET',
      });

      // Listen for the monitoring result
      socket.on('monitoring-result', (result) => {
        console.log(result);

        // Create a new data point based on the result
        const newDataPoint = {
          time: timeCounter + 1, // Increment time based on the counter
          responseTime: result.responseTime, // Use the response time from the result
        };

        setData((prevData) => {
          const updatedData = [...prevData, newDataPoint];
          // Keep only the last 20 data points
          if (updatedData.length > 20) {
            return updatedData.slice(updatedData.length - 20);
          }
          return updatedData;
        });

        setTimeCounter((prev) => prev + 1); // Increment the time counter
      });

      // Handle monitoring error
      socket.on('monitoring-error', (error) => {
        console.log(error);
      });
    }

    // Cleanup function to disconnect the socket
    return () => {
      socket.disconnect();
    };
  }, [timeCounter]); // Add timeCounter as a dependency

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h2>Real-Time Response Time</h2>
      <ResponsiveContainer width={800} height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }} />
          <YAxis label={{ value: "Response Time (ms)", angle: -90, position: "insideLeft" }} domain={[0, 'dataMax + 100']} />
          <Tooltip formatter={(value) => [`Response Time: ${value} ms`, '']} />
          <Legend />
          <Line type="monotone" dataKey="responseTime" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
