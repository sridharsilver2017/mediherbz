import React from 'react';
import { Package, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { OrdersStats } from '../types';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  stats: OrdersStats;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, stats }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-2 py-2 flex items-center justify-around safe-area-pb">
      <button
        onClick={() => onTabChange('all')}
        className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentTab === 'all' ? 'text-[#18833B] font-black bg-emerald-50/60' : 'text-stone-500 font-medium hover:bg-stone-50'
        }`}
      >
        <Package className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">All ({stats.total_count})</span>
      </button>

      <button
        onClick={() => onTabChange('processing')}
        className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative cursor-pointer active:scale-95 ${
          currentTab === 'processing' ? 'text-amber-600 font-black bg-amber-50/60' : 'text-stone-500 font-medium hover:bg-stone-50'
        }`}
      >
        <div className="relative">
          <Clock className="w-5 h-5 mb-0.5" />
          {stats.processing > 0 && (
            <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
              {stats.processing}
            </span>
          )}
        </div>
        <span className="text-[11px] leading-tight">To Fulfill</span>
      </button>

      <button
        onClick={() => onTabChange('completed')}
        className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentTab === 'completed' ? 'text-[#18833B] font-black bg-emerald-50/60' : 'text-stone-500 font-medium hover:bg-stone-50'
        }`}
      >
        <CheckCircle2 className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">Delivered ({stats.completed})</span>
      </button>

      <button
        onClick={() => onTabChange('stats')}
        className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
          currentTab === 'stats' ? 'text-stone-900 font-black bg-stone-100' : 'text-stone-500 font-medium hover:bg-stone-50'
        }`}
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] leading-tight">₹{(stats.total_rev / 1000).toFixed(1)}k</span>
      </button>
    </nav>
  );
};
