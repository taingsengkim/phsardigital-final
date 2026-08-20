import React from 'react';
import { Info, ArrowUpDown } from "lucide-react";
import { cn } from '@/lib/utils';

interface OverviewCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
  chartPath: string;
  chartColor: string;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  bgColor,
  iconBgColor,
  chartPath,
  chartColor,
}) => {
  return (
    <div className={cn("rounded-3xl p-6 flex justify-between items-end relative overflow-hidden h-48", bgColor)}>
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-2">
          <div className={cn("p-3 rounded-full flex items-center justify-center text-white", iconBgColor)}>
            {icon}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-muted-foreground">{title}</span>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div>
          <div className="mb-2 text-4xl font-bold text-foreground">{value}</div>
          <div className={cn(
            "inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium",
            changeType === 'up' ? "bg-green-100/50 text-green-600" : "bg-red-100/50 text-red-600"
          )}>
            {changeType === 'up' ? <ArrowUpDown className="w-4 h-4 mr-1" /> : <ArrowUpDown className="w-4 h-4 mr-1" />}
            {change} this week
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-[120px] mb-4">
        <svg viewBox="0 0 100 40" className="w-full h-auto overflow-visible">
          <path
            d={chartPath}
            fill="none"
            stroke={chartColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
