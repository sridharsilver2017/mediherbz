import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Order } from '../types';
import { api } from '../api/client';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.trackOrder(orderNumber.trim(), contact.trim());
      setOrder(res);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-black text-[#26352A] font-serif">Track Your Order</h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Enter your Mediherbz Order ID (e.g. MED-829144) and email/mobile number to view real-time delivery status.
        </p>
      </div>

      {/* Tracking Search Input Form */}
      <form onSubmit={handleTrack} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Mediherbz Order ID *</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. MED-829144"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#18833B]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Billing Email or Phone</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. customer@example.com"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#18833B]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" /> {loading ? 'Fetching Dispatch Details...' : 'Track Order'}
        </button>
      </form>

      {/* Results Box */}
      {searched && (
        <div>
          {order ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
                <div>
                  <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Live Status</span>
                  <h2 className="text-xl font-black text-stone-900 mt-0.5">Order #{order.order_number}</h2>
                  <p className="text-xs text-stone-400 mt-1">Placed on {order.date_created}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
                    {order.status}
                  </span>
                  <p className="text-xs font-semibold text-stone-600 mt-1.5">
                    Carrier: {order.shipping_carrier || 'Express Air'}
                  </p>
                </div>
              </div>

              {/* Dynamic Progress Milestones */}
              {(() => {
                const s = (order.status || '').toLowerCase();
                const hasTracking = Boolean(order.tracking_id);
                const step = s === 'completed' ? 4 : (s === 'shipped' || hasTracking ? 3 : (s === 'processing' || s === 'on-hold' ? 2 : 1));

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                    <div className={`p-4 rounded-2xl border space-y-1 transition-all ${
                      step >= 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}>
                      <CheckCircle2 className={`w-6 h-6 mx-auto ${step >= 1 ? 'text-[#18833B]' : 'text-stone-400'}`} />
                      <p className="font-bold text-xs text-stone-900">Order Confirmed</p>
                      <p className="text-[10px] text-stone-500">Verified in store</p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 transition-all ${
                      step >= 2 ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}>
                      <Clock className={`w-6 h-6 mx-auto ${step >= 2 ? 'text-[#18833B]' : 'text-stone-400'}`} />
                      <p className="font-bold text-xs text-stone-900">Batch Packaging</p>
                      <p className="text-[10px] text-stone-500">Fresh herbal packing</p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 transition-all ${
                      step >= 3 ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}>
                      <Truck className={`w-6 h-6 mx-auto ${step >= 3 ? 'text-[#18833B]' : 'text-stone-400'}`} />
                      <p className="font-bold text-xs text-stone-900">In Transit</p>
                      <p className="text-[10px] text-stone-500">
                        {order.shipping_carrier || 'Handed to carrier'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-1 transition-all ${
                      step >= 4 ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}>
                      <Package className={`w-6 h-6 mx-auto ${step >= 4 ? 'text-[#18833B]' : 'text-stone-400'}`} />
                      <p className="font-bold text-xs text-stone-900">Delivered</p>
                      <p className="text-[10px] text-stone-500">At your doorstep</p>
                    </div>
                  </div>
                );
              })()}

              {/* Waybill / Tracking Link */}
              {order.tracking_id && (
                <div className="p-4 rounded-2xl bg-[#FAF9F2] border border-[#18833B]/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 block">Waybill / Tracking Number:</span>
                    <strong className="text-stone-900 text-sm">{order.tracking_id}</strong>
                  </div>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#18833B] text-white font-bold rounded-xl hover:bg-[#12632F] transition-colors"
                    >
                      Carrier Site →
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-stone-900">No active dispatch found for that order number</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Please double check the ID from your confirmation email/SMS or reach out to care@mediherbz.com.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

