import React from 'react';
import { Package, Clock, CheckCircle2, TrendingUp, IndianRupee, ArrowUpRight } from 'lucide-react';
import { OrdersStats } from '../types';

interface StatsCardsProps {
  stats: OrdersStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const fulfillmentRate =
    stats.total_count > 0 ? Math.round((stats.completed / stats.total_count) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      {/* 1. Total Orders */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {stats.total_count}
              </span>
              <span className="text-[11px] text-stone-400 font-semibold">orders</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-[#18833B]/10 group-hover:text-[#18833B] transition-colors">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
          <span className="text-stone-500 font-medium">Payment split:</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-amber-700">{stats.cod_count} COD</span>
            <span className="text-stone-300">•</span>
            <span className="text-emerald-700">{stats.online_count} Prepaid</span>
          </div>
        </div>
      </div>

      {/* 2. Pending Fulfillment */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                To Dispatch
              </span>
              {stats.processing > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                {stats.processing}
              </span>
              <span className="text-[11px] text-amber-600/70 font-semibold">pending</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-amber-100/60 flex items-center justify-between text-[11px]">
          <span className="text-amber-800/70 font-medium">Requires packing:</span>
          <span className="font-bold text-amber-800">
            {stats.processing === 0 ? 'All cleared 🎉' : `${stats.processing} waiting`}
          </span>
        </div>
      </div>

      {/* 3. Completed / Dispatched */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Fulfilled
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[#18833B] tracking-tight">
                {stats.completed}
              </span>
              <span className="text-[11px] text-[#18833B]/70 font-semibold">delivered</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#18833B] flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
          <span className="text-stone-500 font-medium">Completion rate:</span>
          <span className="font-bold text-[#18833B] flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            {fulfillmentRate}%
          </span>
        </div>
      </div>

      {/* 4. Total Store Revenue */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Gross Value
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                ₹{stats.total_rev.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#18833B]/10 text-[#18833B] flex items-center justify-center group-hover:bg-[#18833B]/20 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
          <span className="text-stone-500 font-medium">Live sync:</span>
          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            WooCommerce Orders
          </span>
        </div>
      </div>
    </div>
  );
};
