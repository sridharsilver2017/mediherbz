import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../api';

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
  onUpdated: () => void;
  onPrint: (order: Order) => void;
}

const COMMON_CARRIERS = [
  'Express BlueDart Air',
  'Delhivery Express',
  'DTDC Air Priority',
  'India Post Speed Post',
  'Shiprocket Priority',
  'Shadowfax Logistics',
  'Ekart Express',
];

export const OrderDrawer: React.FC<OrderDrawerProps> = ({ order, onClose, onUpdated, onPrint }) => {
  if (!order) return null;

  const [carrier, setCarrier] = useState(order.shipping_carrier || 'Express BlueDart Air');
  const [trackingId, setTrackingId] = useState(order.tracking_id || '');
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '');
  const [markShipped, setMarkShipped] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTracking(true);
    setMessage(null);

    try {
      await api.updateOrderTracking({
        order_id: order.id,
        shipping_carrier: carrier,
        tracking_id: trackingId.trim(),
        tracking_url: trackingUrl.trim(),
        mark_shipped: markShipped,
      });
      setMessage({ text: 'Tracking details saved to WooCommerce!', type: 'success' });
      onUpdated();
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to update tracking', type: 'error' });
    } finally {
      setSavingTracking(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    setMessage(null);

    try {
      await api.updateOrderStatus(order.id, newStatus, `Status changed to ${newStatus} via Mediherbz Orders App`);
      setMessage({ text: `Order marked as ${newStatus}!`, type: 'success' });
      onUpdated();
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to update order status', type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getWhatsAppLink = () => {
    const rawPhone = (order.customer.phone || '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const text = encodeURIComponent(
      `Hello ${order.customer.first_name || 'Customer'},\n\nYour Mediherbz order *${order.order_number}* (Total: ₹${order.total}) has been prepared!\n${
        trackingId ? `🚚 Carrier: ${carrier}\n📦 Tracking ID: ${trackingId}\n` : ''
      }\nYou can track your live shipment here: https://mediherbz.pages.dev/track-order?order=${order.order_number}\n\nThank you for choosing pure Ayurvedic care! 🌿`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end md:items-stretch md:justify-end"
      onClick={onClose}
    >
      {/* Container: Bottom sheet on mobile, right drawer on desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full md:max-w-xl max-h-[92vh] md:max-h-full h-auto md:h-full rounded-t-3xl md:rounded-none shadow-2xl flex flex-col overflow-hidden animate-slideUp md:animate-none"
      >
        {/* Mobile Pull Handle (Tappable to close) */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 flex items-center justify-center md:hidden cursor-pointer"
          title="Tap to close"
        >
          <div className="w-12 h-1.5 bg-stone-300 hover:bg-stone-400 rounded-full transition-colors" />
        </button>

        {/* Drawer Header */}
        <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-stone-900">{order.order_number}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                order.status === 'processing'
                  ? 'bg-amber-100 text-amber-800'
                  : order.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{order.date_created}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrint(order)}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              title="Print Packing Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 bg-stone-200/80 hover:bg-stone-300 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Close details"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div className={`p-3 text-xs flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' : 'bg-red-50 text-red-800 border-b border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#18833B]" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          
          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {order.customer.phone && (
              <a
                href={`tel:${order.customer.phone}`}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 text-[#18833B]" />
                <span>Call Customer</span>
              </a>
            )}

            <button
              onClick={() => onPrint(order)}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
          </div>

          {/* Shipment & Waybill Form */}
          <div className="p-4 rounded-2xl bg-[#FAF9F2] border border-[#18833B]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#18833B] font-bold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4" />
              <span>Dispatch &amp; Courier Tracking</span>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Carrier Name:</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  list="carrier-options"
                  placeholder="e.g. Express BlueDart Air"
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                />
                <datalist id="carrier-options">
                  {COMMON_CARRIERS.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Waybill / Tracking Number:</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. BD-89210041IN"
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Courier Tracking URL (Optional):</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.bluedart.com/tracking..."
                  className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-medium">
                  <input
                    type="checkbox"
                    checked={markShipped}
                    onChange={(e) => setMarkShipped(e.target.checked)}
                    className="w-4 h-4 text-[#18833B] rounded border-stone-300 focus:ring-0"
                  />
                  <span>Mark as Completed / Shipped</span>
                </label>

                <button
                  type="submit"
                  disabled={savingTracking}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingTracking ? 'Saving...' : 'Save Tracking'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Status Bar */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Status Workflow:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={updatingStatus || order.status === 'processing'}
                onClick={() => handleStatusChange('processing')}
                className={`py-2 px-2 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  order.status === 'processing'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Processing
              </button>
              <button
                disabled={updatingStatus || order.status === 'completed'}
                onClick={() => handleStatusChange('completed')}
                className={`py-2 px-2 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-[#18833B] border border-emerald-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Completed
              </button>
              <button
                disabled={updatingStatus || order.status === 'on-hold'}
                onClick={() => handleStatusChange('on-hold')}
                className={`py-2 px-2 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  order.status === 'on-hold'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                On Hold
              </button>
              <button
                disabled={updatingStatus || order.status === 'cancelled'}
                onClick={() => handleStatusChange('cancelled')}
                className={`py-2 px-2 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  order.status === 'cancelled'
                    ? 'bg-red-100 text-red-900 border border-red-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Customer &amp; Delivery Address:</span>
            <div className="space-y-1">
              <p className="font-extrabold text-stone-900 text-sm">{order.customer.name}</p>
              <p className="text-stone-600 leading-relaxed text-xs">
                {order.customer.address}<br />
                {order.customer.city}, {order.customer.state} - {order.customer.postcode}
              </p>
              <p className="text-stone-700 font-bold pt-1">📞 {order.customer.phone}</p>
              <p className="text-stone-500 text-[11px]">{order.customer.email}</p>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Items Ordered ({order.items.length})
            </span>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                        📦
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Qty: <strong className="text-stone-800">{item.quantity}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 text-sm shrink-0">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Total Amount</span>
                <span className="text-xs font-bold uppercase text-stone-700">
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Prepaid (Online)'}
                </span>
              </div>
              <span className="text-xl font-black text-[#18833B]">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Close Bar */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-end md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs cursor-pointer active:scale-98 transition-all text-center"
          >
            Done / Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
