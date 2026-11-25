import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  RefreshCw,
  Package,
  TrendingUp,
  AlertCircle,
  X,
  Printer,
  ChevronRight,
  ExternalLink,
  Phone,
  MessageCircle,
  Truck,
  Sparkles,
  BellRing,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrdersStats } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { MobileOrderCard } from './components/MobileOrderCard';
import { OrderDrawer } from './components/OrderDrawer';
import { PrintSlipModal } from './components/PrintSlipModal';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showOrderPushNotification,
  playOrderChime,
} from './utils/notifications';

export const App: React.FC = () => {
  const [auth, setAuth] = useState(() => api.getAdminAuth());

  // Instant Cache: Load cached orders immediately so UI renders in 0 milliseconds
  const cachedData = useRef(api.getCachedOrders()).current;

  const [orders, setOrders] = useState<Order[]>(() => cachedData?.orders || []);
  const [stats, setStats] = useState<OrdersStats>(() => cachedData?.stats || {
    total_count: 0,
    processing: 0,
    completed: 0,
    on_hold: 0,
    cancelled: 0,
    total_rev: 0,
    cod_count: 0,
    online_count: 0,
  });
  const [loading, setLoading] = useState(() => !cachedData || cachedData.orders.length === 0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'prepaid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Push notifications & chime states
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => getNotificationPermission()
  );
  const [newOrderToast, setNewOrderToast] = useState<Order | null>(null);

  // References to track known orders to prevent false alarms on initial page load
  const knownOrderIds = useRef<Set<number>>(
    new Set(cachedData?.orders ? cachedData.orders.map((o) => o.id) : [])
  );
  const isInitialLoaded = useRef(Boolean(cachedData && cachedData.orders.length > 0));

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!auth) return;
      if (!silent) setLoading(true);
      setError(null);

      try {
        const data = await api.getOrders({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
          limit: 40,
        });

        // Detect new orders arriving after initial load
        if (isInitialLoaded.current && data.orders.length > 0) {
          const freshOrders = data.orders.filter((o) => !knownOrderIds.current.has(o.id));
          if (freshOrders.length > 0) {
            const newest = freshOrders[0];
            // Play sound chime & fire browser/native push alert
            showOrderPushNotification(newest, (ord) => setSelectedOrder(ord));
            setNewOrderToast(newest);
          }
        }

        // Register all received IDs
        data.orders.forEach((o) => knownOrderIds.current.add(o.id));
        isInitialLoaded.current = true;

        setOrders(data.orders);
        setStats((prev) => {
          const remoteStats = data.stats;
          if (remoteStats && remoteStats.total_count > 0) {
            return remoteStats;
          }
          // Safeguard: If remote total_count is 0 but we have orders or previous stats, preserve count
          const fallbackTotal = data.orders.length;
          const fallbackProcessing = data.orders.filter((o) => o.status === 'processing').length;
          const fallbackCompleted = data.orders.filter((o) => o.status === 'completed').length;
          const fallbackOnHold = data.orders.filter((o) => o.status === 'on-hold').length;
          const fallbackCancelled = data.orders.filter((o) => o.status === 'cancelled').length;

          return {
            total_count: Math.max(prev.total_count, fallbackTotal, remoteStats?.total_count || 0),
            processing: remoteStats?.processing || fallbackProcessing || prev.processing,
            completed: remoteStats?.completed || fallbackCompleted || prev.completed,
            on_hold: remoteStats?.on_hold || fallbackOnHold || prev.on_hold,
            cancelled: remoteStats?.cancelled || fallbackCancelled || prev.cancelled,
            total_rev: remoteStats?.total_rev || prev.total_rev || data.orders.reduce((acc, o) => acc + (o.total || 0), 0),
            cod_count: remoteStats?.cod_count || prev.cod_count,
            online_count: remoteStats?.online_count || prev.online_count,
          };
        });

        // Keep selected order in sync if currently open
        setSelectedOrder((prev) => (prev ? data.orders.find((o) => o.id === prev.id) || prev : null));
      } catch (err: any) {
        if (!silent) {
          setError(err?.message || 'Could not load orders from WooCommerce.');
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [auth, statusFilter, searchQuery]
  );

  // Initial load: silent background fetch if cached, otherwise show loading state
  useEffect(() => {
    if (auth) {
      const hasCached = Boolean(cachedData && cachedData.orders.length > 0);
      fetchOrders(hasCached);
    }
  }, [auth, statusFilter, fetchOrders]);

  // Background Auto-polling for new bookings (runs every 15 seconds)
  useEffect(() => {
    if (!auth) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [auth, fetchOrders]);

  const handleTestChime = () => {
    playOrderChime();
    const sampleOrder: Order = orders[0] || ({
      id: 99999,
      order_number: 'TEST-101',
      status: 'processing',
      total: 1499,
      subtotal: 1499,
      shipping_total: 0,
      discount_total: 0,
      currency: 'INR',
      date_created: new Date().toISOString(),
      customer: {
        name: 'Priya Sharma (Sample)',
        first_name: 'Priya',
        last_name: 'Sharma',
        email: 'priya@example.com',
        phone: '+91 98765 43210',
        address: 'MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postcode: '560001',
        country: 'IN',
      },
      items: [],
      item_count: 1,
      shipping_carrier: '',
      tracking_id: '',
      tracking_url: '',
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      is_paid: false,
    } as Order);
    showOrderPushNotification(sampleOrder, (ord) => setSelectedOrder(ord));
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // If already enabled, fire a test notification and chime immediately
      handleTestChime();
      return;
    }
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      handleTestChime();
    }
  };

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

  // Filter orders by payment method client-side if needed
  const filteredOrders = orders.filter((o) => {
    if (paymentFilter === 'cod') return o.payment_method === 'cod';
    if (paymentFilter === 'prepaid') return o.payment_method !== 'cod';
    return true;
  });

  if (!auth) {
    return <LoginScreen onSuccess={() => setAuth(api.getAdminAuth())} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F6EE] flex flex-col pb-24 md:pb-12 font-sans selection:bg-[#18833B] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* App Header */}
      <Header
        adminUsername={auth.username}
        loading={loading}
        onRefresh={() => fetchOrders(false)}
        onLogout={handleLogout}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        onTestChime={handleTestChime}
      />

      {/* Floating Incoming Order Notification Toast */}
      {newOrderToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-[#12632F] text-white p-4 rounded-xl shadow-2xl border border-[#A6C928]/40 animate-slideDown flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18833B] text-white flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm">{newOrderToast.order_number}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#A6C928] text-emerald-950">
                  New Order
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {newOrderToast.customer.name} &bull; ₹{newOrderToast.total.toLocaleString('en-IN')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(newOrderToast);
                  setNewOrderToast(null);
                }}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-white underline hover:text-[#A6C928] cursor-pointer"
              >
                <span>View &amp; Dispatch Order</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNewOrderToast(null)}
            className="text-white/70 hover:text-white hover:bg-white/10 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl cursor-pointer transition-all active:scale-95"
            aria-label="Dismiss new order notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
        {/* KPI Metrics on Desktop & Tablet */}
        <div className="hidden sm:block">
          <StatsCards stats={stats} />
        </div>

        {/* Mobile Mini KPI Bar with High Ergonomic Tap Zones */}
        <div className="sm:hidden grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`min-h-[66px] p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col justify-between ${
              statusFilter === 'all'
                ? 'bg-[#18833B] text-white border-[#18833B] shadow-md shadow-emerald-900/10'
                : 'bg-white text-stone-900 border-stone-200/90 shadow-2xs hover:bg-stone-50'
            }`}
          >
            <span
              className={`text-[10px] block font-black uppercase tracking-wider ${
                statusFilter === 'all' ? 'text-emerald-100' : 'text-stone-400'
              }`}
            >
              All Orders
            </span>
            <span className="text-xl font-black tracking-tight">{stats.total_count}</span>
          </button>

          <button
            onClick={() => setStatusFilter('processing')}
            className={`min-h-[66px] p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col justify-between ${
              statusFilter === 'processing'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-900/10'
                : 'bg-white text-amber-700 border-stone-200/90 shadow-2xs hover:bg-stone-50'
            }`}
          >
            <span
              className={`text-[10px] block font-black uppercase tracking-wider ${
                statusFilter === 'processing' ? 'text-amber-100' : 'text-amber-600'
              }`}
            >
              To Fulfill
            </span>
            <span className="text-xl font-black tracking-tight">{stats.processing}</span>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`min-h-[66px] p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col justify-between ${
              statusFilter === 'completed'
                ? 'bg-[#18833B] text-white border-[#18833B] shadow-md shadow-emerald-900/10'
                : 'bg-white text-[#18833B] border-stone-200/90 shadow-2xs hover:bg-stone-50'
            }`}
          >
            <span
              className={`text-[10px] block font-black uppercase tracking-wider ${
                statusFilter === 'completed' ? 'text-emerald-100' : 'text-emerald-600'
              }`}
            >
              Delivered
            </span>
            <span className="text-xl font-black tracking-tight">{stats.completed}</span>
          </button>
        </div>

        {/* Search, Status Tabs & Payment Filter Bar */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-stone-200/90 shadow-xs space-y-3.5">
          {/* Search Input with Instant Clear (min-h-[46px]) */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders(false)}
              placeholder="Search by Order #, Customer, Phone, or City..."
              className="w-full pl-11 pr-11 py-3 bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#18833B] focus:ring-2 focus:ring-[#18833B]/10 transition-all min-h-[46px]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchOrders(false);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl cursor-pointer active:scale-90 transition-all hover:bg-stone-100"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Status Tabs Carousel with Ergonomic Touch Targets */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-2xs ${
                    statusFilter === tab.value
                      ? 'bg-[#18833B] text-white font-black shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      statusFilter === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-200/90 text-stone-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Payment Method Quick Filter Pills with 44px touch zone */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <span className="text-[11px] text-stone-400 font-bold uppercase hidden lg:inline mr-1">
                Payment:
              </span>
              <button
                onClick={() => setPaymentFilter('all')}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  paymentFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPaymentFilter('cod')}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  paymentFilter === 'cod'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-amber-800 hover:bg-stone-200'
                }`}
              >
                <span>💵 COD</span>
              </button>
              <button
                onClick={() => setPaymentFilter('prepaid')}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  paymentFilter === 'prepaid'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-stone-100 text-[#18833B] hover:bg-stone-200'
                }`}
              >
                <span>💳 Online</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync Error Banner */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <span className="font-bold">Database Sync Alert: </span>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => fetchOrders(false)}
              className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-95"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Orders Listing State */}
        {loading && orders.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-white rounded-lg border border-stone-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-[#18833B] flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-stone-900">Synchronizing with WooCommerce</h3>
              <p className="text-xs text-stone-400">Pulling real-time customer bookings from Pantheon...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-lg border border-stone-200/90 px-4 shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-stone-900">No orders found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {searchQuery
                ? `No orders match "${searchQuery}". Clear your search query to view all orders.`
                : 'No bookings found under the selected status filter.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  fetchOrders(false);
                }}
                className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold cursor-pointer active:scale-95"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Tactile Order Cards (< md) */}
            <div className="md:hidden space-y-3">
              {filteredOrders.map((o) => (
                <MobileOrderCard
                  key={o.id}
                  order={o}
                  onSelect={(ord) => setSelectedOrder(ord)}
                  onPrint={(ord) => setPrintingOrder(ord)}
                />
              ))}
            </div>

            {/* DESKTOP/TABLET VIEW: Structured Luxury Table (md+) */}
            <div className="hidden md:block bg-white rounded-lg border border-stone-200/90 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif font-black text-base text-stone-900">Live Bookings</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18833B] animate-pulse" />
                  <span>Auto-syncs every 15 seconds</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-stone-50/80 text-stone-500 font-bold text-[10px] uppercase tracking-wider border-b border-stone-200/60">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items Summary</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                      >
                        {/* Order ID */}
                        <td className="py-4 px-4 font-mono font-black text-stone-900">
                          <span className="text-sm group-hover:text-[#18833B] transition-colors">
                            {o.order_number}
                          </span>
                          <span className="block text-[10px] text-stone-400 font-sans font-normal">
                            #{o.id}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-stone-600 whitespace-nowrap font-medium">
                          {o.date_created}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-[#18833B]/10 group-hover:text-[#18833B] transition-colors">
                              {(o.customer.name || 'C').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-stone-900 block truncate">
                                {o.customer.name}
                              </span>
                              <span className="text-[11px] text-stone-400 block truncate">
                                {o.customer.city || 'India'} &bull; {o.customer.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            {o.items.slice(0, 2).map((it, idx) => (
                              <span key={idx} className="truncate max-w-[140px] text-stone-700">
                                {it.name} <strong className="text-stone-900">×{it.quantity}</strong>
                                {idx < Math.min(o.items.length - 1, 1) ? ',' : ''}
                              </span>
                            ))}
                            {o.items.length > 2 && (
                              <span className="text-emerald-800 bg-emerald-50 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                +{o.items.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-4 font-black text-stone-900 whitespace-nowrap text-sm">
                          ₹{o.total.toLocaleString('en-IN')}
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              o.payment_method === 'cod'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-[#18833B] border border-emerald-200'
                            }`}
                          >
                            {o.payment_method === 'cod' ? '💵 COD' : '💳 Online'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              o.status === 'processing'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : o.status === 'completed'
                                ? 'bg-emerald-100 text-[#18833B] border border-emerald-300 font-extrabold'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                o.status === 'processing'
                                  ? 'bg-amber-500 animate-pulse'
                                  : o.status === 'completed'
                                  ? 'bg-[#18833B]'
                                  : 'bg-stone-400'
                              }`}
                            />
                            <span>{o.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                            }}
                            className="px-3.5 py-1.5 text-xs font-bold text-[#18833B] bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Dispatch</span>
                            <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Mobile Sticky Bottom Navigation (< md) */}
      <BottomNav currentTab={statusFilter} onTabChange={handleBottomTabChange} stats={stats} />

      {/* Slide-over / Bottom Sheet Order Detail Drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={() => fetchOrders(false)}
        onPrint={(ord) => setPrintingOrder(ord)}
      />

      {/* Printable Slip Modal */}
      {printingOrder && (
        <PrintSlipModal order={printingOrder} onClose={() => setPrintingOrder(null)} />
      )}

      {/* Mobile Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-black text-stone-900 text-base">
                Performance Overview
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl cursor-pointer transition-all active:scale-95"
                aria-label="Close stats modal"
              >
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
