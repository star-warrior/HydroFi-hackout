import React from 'react';

const StatCard = ({ title, value, icon, change, changeType }) => (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {icon}
    </div>
    <div className="flex items-baseline space-x-2">
        <h3 className="text-4xl font-bold text-white">{value}</h3>
        {change && (
            <span className={`text-sm font-semibold ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {change}
            </span>
        )}
    </div>
  </div>
);

export default StatCard;