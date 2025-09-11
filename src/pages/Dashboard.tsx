import React from 'react';
import StatsCard from '../components/StatsCard';
import RecentMovements from '../components/RecentMovements';
import { StockAlerts } from '../components/StockAlerts';
import { TopArticles } from '../components/TopArticles';
import InventoryProgress from '../components/InventoryProgress';
import DonutChart from '../components/DonutChart';
import { Package, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const inventoryData = [
    {
      name: 'Electronics',
      value: 450,
      color: '#8B5CF6',
      description: 'Electronic devices and components'
    },
    {
      name: 'Clothing',
      value: 320,
      color: '#06B6D4',
      description: 'Apparel and fashion items'
    },
    {
      name: 'Food & Beverages',
      value: 280,
      color: '#10B981',
      description: 'Food products and drinks'
    },
    {
      name: 'Books',
      value: 184,
      color: '#F59E0B',
      description: 'Books and educational materials'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Articles"
          value="1,234"
          change="+12%"
          changeType="positive"
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Total Value"
          value="$45,678"
          change="+8%"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value="23"
          change="-5%"
          changeType="negative"
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Active Users"
          value="12"
          change="+2"
          changeType="positive"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart
          title="Inventory Distribution"
          subtitle="Distribution of items by category"
          data={inventoryData}
          centerText="Total Items"
          centerValue="1,234"
        />
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Capacity</h3>
          <InventoryProgress />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <div className="lg:col-span-2">
          <RecentMovements />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <StockAlerts />
          <TopArticles />
        </div>
      </div>
    </div>
  );
}