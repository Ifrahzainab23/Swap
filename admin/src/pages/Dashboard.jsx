import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    placed: 0,
    packing: 0,
    shipped: 0,
    out_for_delivery: 0,
    delivered: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/summary');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Placed', value: stats.placed },
    { name: 'Packing', value: stats.packing },
    { name: 'Shipped', value: stats.shipped },
    { name: 'Out for Delivery', value: stats.out_for_delivery },
    { name: 'Delivered', value: stats.delivered }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Order Status Dashboard</h1>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <SummaryCard title="Total Orders" value={stats.totalOrders} color="text-indigo-600" />
        <SummaryCard title="Placed" value={stats.placed} color="text-blue-500" />
        <SummaryCard title="Packing" value={stats.packing} color="text-yellow-500" />
        <SummaryCard title="Shipped" value={stats.shipped} color="text-purple-500" />
        <SummaryCard title="Out for Delivery" value={stats.out_for_delivery} color="text-orange-500" />
        <SummaryCard title="Delivered" value={stats.delivered} color="text-green-600" />
      </div>

      {/* 📊 Bar Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Orders by Status (Bar Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🥧 Pie Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Order Distribution (Pie Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Line Chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-center">Orders Trend (Line Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded shadow text-center border">
    <h3 className="text-md font-medium text-gray-600">{title}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default Dashboard;
