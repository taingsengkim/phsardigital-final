import React from 'react';
import Link from 'next/link';
import { ChevronsUpDown, Activity, ShoppingBag, Plus } from "lucide-react";
import { OverviewCard } from './overview-card';
import { ProductActivity } from './product-activity';
import { ProductViews } from './product-views';
import { ProductTable } from './product-table';

export const ProductDashboardUI: React.FC = () => {
  return (
    <div className="min-h-screen space-y-8 bg-background p-6 text-foreground">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-foreground">Products dashboard</h1>
        <Link href="/seller-dashboard/products/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6C4CD8] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d3fc4]">
          <Plus className="size-4" /> Create product
        </Link>
      </div>

      {/* Overview Section */}
      <div className="rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-8 bg-purple-200 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
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
            bgColor="bg-emerald-50 dark:bg-emerald-950/50"
            iconBgColor="bg-slate-900 dark:bg-slate-950"
            chartColor="#34A853"
            chartPath="M 0 30 Q 25 10 50 25 T 100 10"
          />
          <OverviewCard
            title="Customer"
            value="512"
            change="37.8%"
            changeType="down"
            icon={<ShoppingBag className="w-6 h-6" />}
            bgColor="bg-blue-50 dark:bg-blue-950/50"
            iconBgColor="bg-slate-900 dark:bg-slate-950"
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
