import React from 'react';
import { Package, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { OrdersStats } from '../types';

interface StatsCardsProps {
  stats: OrdersStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Orders */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Total Orders</span>
          <span className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5 block">{stats.total_count}</span>
          <span className="text-[10px] text-stone-500">{stats.cod_count} COD • {stats.online_count} Online</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* Pending Fulfillment */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">To Fulfill</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 block">{stats.processing}</span>
          <span className="text-[10px] text-stone-500">Awaiting dispatch</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Completed / Dispatched */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Completed</span>
          <span className="text-xl sm:text-2xl font-black text-[#18833B] mt-0.5 block">{stats.completed}</span>
          <span className="text-[10px] text-stone-500">Delivered orders</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#18833B]">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Gross Value</span>
          <span className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5 block">₹{stats.total_rev.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">Processed via store</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#18833B]">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
