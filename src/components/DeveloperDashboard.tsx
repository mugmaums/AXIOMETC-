import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DeveloperDashboard: React.FC = () => {
  const [sessionData, setSessionData] = useState<{ time: string; count: number }[]>([]);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const eventSource = new EventSource(`${wsProtocol}//${window.location.host}/api/events`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.activeSessions !== undefined) {
          setSessionData((prev) => {
            const newData = [
              ...prev,
              {
                time: new Date().toLocaleTimeString(),
                count: payload.activeSessions,
              },
            ];
            return newData.slice(-30); // Keep last 30 seconds
          });
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-md shadow-black/25 backdrop-blur-md">
      <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] mb-4 tracking-tight">Active User Sessions</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sessionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
