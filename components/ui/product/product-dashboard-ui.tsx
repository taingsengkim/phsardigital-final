import React from 'react';
import { ChevronsUpDown, Activity, ShoppingBag } from "lucide-react";
import { OverviewCard } from './overview-card';
import { ProductActivity } from './product-activity';
import { ProductViews } from './product-views';
import { ProductTable } from './product-table';

export const ProductDashboardUI: React.FC = () => {
  return (
    <div className="space-y-8 p-6 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Products dashboard</h1>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-8 bg-purple-200 rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            This week
            <ChevronsUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OverviewCard
            title="Earning"
            value="128k"
            change="37.8%"
            changeType="up"
            icon={<Activity className="w-6 h-6" />}
            bgColor="bg-[#E6F4EA]"
            iconBgColor="bg-gray-900"
            chartColor="#34A853"
            chartPath="M 0 30 Q 25 10 50 25 T 100 10"
          />
          <OverviewCard
            title="Customer"
            value="512"
            change="37.8%"
            changeType="down"
            icon={<ShoppingBag className="w-6 h-6" />}
            bgColor="bg-[#E8F0FE]"
            iconBgColor="bg-gray-900"
            chartColor="#4285F4"
            chartPath="M 0 25 Q 25 35 50 20 T 100 15"
          />
        </div>
      </div>

      {/* Activity + Views */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductActivity />
        </div>
        <ProductViews />
      </div>

      {/* Products table */}
      <ProductTable />
    </div>
  );
};
