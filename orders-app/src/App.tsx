import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ChevronRight
} from 'lucide-react';
import { Order, OrdersStats } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { MobileOrderCard } from './components/MobileOrderCard';
import { OrderDrawer } from './components/OrderDrawer';
import { PrintSlipModal } from './components/PrintSlipModal';
import { LoginScreen } from './components/LoginScreen';
import { BottomNav } from './components/BottomNav';

export const App: React.FC = () => {
  const [auth, setAuth] = useState(() => api.getAdminAuth());
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrdersStats>({
    total_count: 0,
    processing: 0,
    completed: 0,
    on_hold: 0,
    cancelled: 0,
    total_rev: 0,
    cod_count: 0,
    online_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);

    try {
      const data = await api.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit: 100,
      });
      setOrders(data.orders);
      setStats(data.stats);

      // Keep selected order in sync if currently open without retriggering callback
      setSelectedOrder((prev) => (prev ? data.orders.find((o) => o.id === prev.id) || prev : null));
    } catch (err: any) {
      setError(err?.message || 'Could not load orders from WooCommerce.');
    } finally {
      setLoading(false);
    }
  }, [auth, statusFilter, searchQuery]);

  useEffect(() => {
    if (auth) {
      fetchOrders();
    }
  }, [auth, statusFilter, fetchOrders]);

  const handleLogout = () => {
    api.logout();
    setAuth(null);
  };

  const handleBottomTabChange = (tab: string) => {
    if (tab === 'stats') {
      setShowStatsModal(true);
      return;
    }
    setStatusFilter(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!auth) {
    return <LoginScreen onSuccess={() => setAuth(api.getAdminAuth())} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pb-20 md:pb-8">
      {/* App Header */}
      <Header
        adminUsername={auth.username}
        loading={loading}
        onRefresh={fetchOrders}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
        {/* KPI Metrics: Hidden on small mobile to save vertical real estate, accessible via bottom nav tab */}
        <div className="hidden sm:block">
          <StatsCards stats={stats} />
        </div>

        {/* Mobile Mini KPI Bar */}
        <div className="sm:hidden grid grid-cols-3 gap-2">
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center shadow-xs">
            <span className="text-[10px] text-stone-400 block font-bold uppercase">Orders</span>
            <span className="text-base font-black text-stone-900">{stats.total_count}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center shadow-xs">
            <span className="text-[10px] text-amber-600 block font-bold uppercase">Fulfill</span>
            <span className="text-base font-black text-amber-600">{stats.processing}</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center shadow-xs">
            <span className="text-[10px] text-emerald-600 block font-bold uppercase">Delivered</span>
            <span className="text-base font-black text-[#18833B]">{stats.completed}</span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          {/* Search Input with Clear Button */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              placeholder="Search by Order #, Customer, Phone, or City..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#18833B] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchOrders();
                }}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { label: 'All Orders', value: 'all', count: stats.total_count },
              { label: 'To Fulfill', value: 'processing', count: stats.processing },
              { label: 'Delivered', value: 'completed', count: stats.completed },
              { label: 'On Hold', value: 'on-hold', count: stats.on_hold },
              { label: 'Cancelled', value: 'cancelled', count: stats.cancelled },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.value
                    ? 'bg-[#18833B] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Sync Error: </span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchOrders}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-bold text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton / Empty State */}
        {loading && orders.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <RefreshCw className="w-8 h-8 text-[#18833B] animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Fetching orders from WooCommerce...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 px-4">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No matching orders found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              No orders found for this status or search. Try changing filters or search keywords.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Tactile Order Cards (< md) */}
            <div className="md:hidden space-y-3">
              {orders.map((o) => (
                <MobileOrderCard
                  key={o.id}
                  order={o}
                  onSelect={(ord) => setSelectedOrder(ord)}
                  onPrint={(ord) => setPrintingOrder(ord)}
                />
              ))}
            </div>

            {/* DESKTOP/TABLET VIEW: Structured Table (md+) */}
            <div className="hidden md:block bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm sm:text-base text-stone-900">
                    Orders List
                  </h2>
                  <span className="text-xs text-stone-400">({orders.length} orders)</span>
                </div>
                <span className="text-[11px] text-stone-400">Click any order to dispatch or view full items</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-bold text-[10px] uppercase tracking-wider border-b border-stone-200/60">
                    <tr>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono font-black text-stone-900">
                          <span>{o.order_number}</span>
                          <span className="block text-[10px] text-stone-400 font-sans font-normal">#{o.id}</span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                          {o.date_created}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-900 block">{o.customer.name}</span>
                          <span className="text-[11px] text-stone-400 block">{o.customer.city || 'India'} • {o.customer.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {o.items.slice(0, 2).map((it, idx) => (
                              <span key={idx} className="truncate max-w-[140px] text-stone-700">
                                {it.name} <strong className="text-stone-900">×{it.quantity}</strong>
                                {idx < Math.min(o.items.length - 1, 1) ? ',' : ''}
                              </span>
                            ))}
                            {o.items.length > 2 && (
                              <span className="text-stone-400 text-[10px]">+{o.items.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-stone-900 whitespace-nowrap">
                          ₹{o.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.payment_method === 'cod' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {o.payment_method === 'cod' ? 'COD' : 'Online'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            o.status === 'processing'
                              ? 'bg-amber-100 text-amber-800'
                              : o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                            }}
                            className="px-3 py-1 text-xs font-bold text-[#18833B] bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Dispatch</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <BottomNav
        currentTab={statusFilter}
        onTabChange={handleBottomTabChange}
        stats={stats}
      />

      {/* Slide-over Bottom Sheet / Drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={fetchOrders}
        onPrint={(ord) => setPrintingOrder(ord)}
      />

      {/* Printable Thermal Packing Slip Modal */}
      {printingOrder && (
        <PrintSlipModal order={printingOrder} onClose={() => setPrintingOrder(null)} />
      )}

      {/* Stats Modal for Mobile */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Store Performance</h3>
              <button onClick={() => setShowStatsModal(false)} className="text-stone-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <StatsCards stats={stats} />
          </div>
        </div>
      )}
    </div>
  );
};
