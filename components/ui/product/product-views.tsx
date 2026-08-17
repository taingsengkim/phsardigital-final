import React from 'react';

const viewData = [
  { day: 'Mo', value: 30, color: 'bg-green-200' },
  { day: 'Tu', value: 60, color: 'bg-green-200' },
  { day: 'We', value: 45, color: 'bg-green-200' },
  { day: 'Th', value: 20, color: 'bg-orange-200' },
  { day: 'Fr', value: 35, color: 'bg-green-200' },
  { day: 'Sa', value: 85, color: 'bg-blue-500', highlighted: true, tooltip: '550k' },
  { day: 'Su', value: 25, color: 'bg-green-200' },
];

export const ProductViews: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-4 h-8 bg-blue-200 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-900">Product views</h2>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
        {viewData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 gap-4 group relative">
            {item.highlighted && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg shadow-lg z-10 whitespace-nowrap">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="opacity-70">Saturday</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="font-bold">{item.tooltip}</span>
                  </div>
                </div>
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
              </div>
            )}
            <div 
              className={`w-full rounded-md ${item.color} transition-all duration-300`} 
              style={{ height: `${item.value}%` }} 
            />
            <span className="text-gray-400 text-sm font-medium">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
