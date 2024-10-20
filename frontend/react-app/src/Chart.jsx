import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import io from 'socket.io-client';

const Chart = () => {
  const [data, setData] = useState([]);
  const [timeCounter, setTimeCounter] = useState(0);
  const [avgRespTime, setAvgRespTime] = useState(0);
  const [avgRespData, setAvgRespData] = useState([]); 

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.emit('start-monitoring', {
      endpoint: "https://polite-bat-77.telebit.io/data",
      method: 'GET',
    });

    socket.on('monitoring-result', (result) => {
      const newDataPoint = {
        time: timeCounter,
        responseTime: result.responseTime,
      };

      setData((prevData) => {
        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > 50) {
          return updatedData.slice(updatedData.length - 50);
        }
        return updatedData;
      });

      setTimeCounter((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [timeCounter]);

  useEffect(() => {
    CalculateAvg();
  }, [data]);

  function CalculateAvg() {
    let sum = 0;
    data.forEach(e => {
      sum += e.responseTime;
    });

    const avg = Math.ceil(sum / data.length);
    setAvgRespTime(avg);

    const avgLineData = data.map((point) => ({
      time: point.time,
      avgResponseTime: avg,
    }));

    setAvgRespData(avgLineData);
  }

  // Calculate min and max response times for Y-axis domain
  const minResponseTime = Math.min(...data.map(d => d.responseTime), 0); // Ensure min is at least 0
  const maxResponseTime = Math.max(...data.map(d => d.responseTime), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
      <h2>Real-Time Response Time</h2>
      <h1>
        Average Response time: {avgRespTime}ms
      </h1>
      <ResponsiveContainer width={1000} height={400}>
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            label={{ value: 'Time (s)', position: 'insideBottomRight', offset: 0 }}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
            domain={[minResponseTime, maxResponseTime]} // Set dynamic domain
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="responseTime"
            stroke="#82ca9d"
            dot={false}
            isAnimationActive={true}
            animationDuration={300}
          />
          <Line
            type="monotone"
            data={avgRespData}
            dataKey="avgResponseTime"
            stroke="#8884d8"
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
