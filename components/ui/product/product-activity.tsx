import React from 'react';
import { ChevronsUpDown, ArrowUpDown } from "lucide-react";
import { cn } from '@/lib/utils';

interface ActivityRow {
  week: string;
  products: number;
  productsChange: string;
  views: string;
  viewsChange: string;
  likes: number;
  likesChange: string;
  likesType: 'up' | 'down';
  comments: number;
  commentsChange: string;
  commentsType: 'up' | 'down';
}

const data: ActivityRow[] = [
  {
    week: '25 Sep - 1 Oct',
    products: 8,
    productsChange: '37.8%',
    views: '24k',
    viewsChange: '37.8%',
    likes: 48,
    likesChange: '37.8%',
    likesType: 'down',
    comments: 16,
    commentsChange: '56%',
    commentsType: 'down',
  },
  {
    week: '18 Sep - 24 Oct',
    products: 8,
    productsChange: '',
    views: '24k',
    viewsChange: '',
    likes: 48,
    likesChange: '',
    likesType: 'up',
    comments: 16,
    commentsChange: '',
    commentsType: 'up',
  },
];

export const ProductActivity: React.FC = () => {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex justify-between items-center mb-6 ">
        <div className="flex items-center gap-3">
          <div className="w-4 h-8 bg-green-200 rounded-full" />
          <h2 className="text-2xl font-bold text-foreground">Product activity</h2>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
          Last 2 weeks
          <ChevronsUpDown className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-muted-foreground">
              <th className="pb-4">Week</th>
              <th className="pb-4 text-center">Products</th>
              <th className="pb-4 text-center">Views</th>
              <th className="pb-4 text-center">Likes</th>
              <th className="pb-4 text-center">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr key={index} className="text-sm">
                <td className="py-6 font-medium text-muted-foreground">{row.week}</td>
                <td className="py-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-lg font-bold">
                      {row.products}
                    </span>
                    {row.productsChange && (
                      <span className="flex items-center text-green-600 font-medium">
                        <ArrowUpDown className="w-3 h-3 mr-0.5" />
                        {row.productsChange}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-12 h-8 flex items-center justify-center bg-purple-100 text-purple-700 rounded-lg font-bold">
                      {row.views}
                    </span>
                    {row.viewsChange && (
                      <span className="flex items-center text-green-600 font-medium">
                        <ArrowUpDown className="w-3 h-3 mr-0.5" />
                        {row.viewsChange}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg font-bold">
                      {row.likes}
                    </span>
                    {row.likesChange && (
                      <span className={cn(
                        "flex items-center font-medium",
                        row.likesType === 'up' ? "text-green-600" : "text-red-600"
                      )}>
                        {row.likesType === 'up' ? <ArrowUpDown className="w-3 h-3 mr-0.5" /> : <ArrowUpDown className="w-3 h-3 mr-0.5" />}
                        {row.likesChange}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-700 rounded-lg font-bold">
                      {row.comments}
                    </span>
                    {row.commentsChange && (
                      <span className={cn(
                        "flex items-center font-medium",
                        row.commentsType === 'up' ? "text-green-600" : "text-red-600"
                      )}>
                        {row.commentsType === 'up' ? <ArrowUpDown className="w-3 h-3 mr-0.5" /> : <ArrowUpDown className="w-3 h-3 mr-0.5" />}
                        {row.commentsChange}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
