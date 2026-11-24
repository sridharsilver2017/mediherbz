import React, { useState } from 'react';
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
      setMessage({ text: 'Tracking details saved to WooCommerce successfully!', type: 'success' });
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
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-stone-900">{order.order_number}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                order.status === 'processing'
                  ? 'bg-amber-100 text-amber-800'
                  : order.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Placed on {order.date_created}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(order)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              title="Print Packing Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
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
            <span>{message.text}</span>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Customer
            </a>

            <button
              onClick={() => onPrint(order)}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Label
            </button>

            <a
              href={`https://mediherbz.pages.dev/track-order?order=${order.order_number}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Customer View
            </a>
          </div>

          {/* Shipment & Waybill Updater Card */}
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
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                />
                <datalist id="carrier-options">
                  {COMMON_CARRIERS.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Tracking ID / Waybill Number:</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. BD-89210041IN"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Carrier Tracking URL (Optional):</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.bluedart.com/tracking..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
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
                  className="px-4 py-2 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {savingTracking ? 'Saving...' : 'Save Tracking'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Status Bar */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Change Order Status:</span>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={updatingStatus || order.status === 'processing'}
                onClick={() => handleStatusChange('processing')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  order.status === 'processing'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Processing
              </button>
              <button
                disabled={updatingStatus || order.status === 'completed'}
                onClick={() => handleStatusChange('completed')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-[#18833B]'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Completed
              </button>
              <button
                disabled={updatingStatus || order.status === 'on-hold'}
                onClick={() => handleStatusChange('on-hold')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  order.status === 'on-hold'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                On Hold
              </button>
              <button
                disabled={updatingStatus || order.status === 'cancelled'}
                onClick={() => handleStatusChange('cancelled')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                  order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Customer &amp; Delivery Address:</span>
            <div className="space-y-1.5">
              <p className="font-extrabold text-stone-900 text-sm">{order.customer.name}</p>
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <a href={`tel:${order.customer.phone}`} className="hover:underline font-medium text-stone-900">{order.customer.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <a href={`mailto:${order.customer.email}`} className="hover:underline text-stone-900">{order.customer.email}</a>
              </div>
              <div className="flex items-start gap-2 text-stone-600 pt-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.postcode}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Products Breakdown */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Items Ordered ({order.items.length})
            </span>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                        📦
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-stone-900 leading-snug">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Qty: <strong className="text-stone-800">{item.quantity}</strong> {item.sku && `• SKU: ${item.sku}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 text-sm">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-stone-200 space-y-1 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal || order.total}</span>
              </div>
              {order.shipping_total > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Shipping Fee:</span>
                  <span>₹{order.shipping_total}</span>
                </div>
              )}
              {order.discount_total > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{order.discount_total}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1 border-t border-stone-100">
                <span>Total Amount:</span>
                <span className="text-[#18833B]">₹{order.total}</span>
              </div>
              <div className="pt-1 text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Prepaid (Razorpay)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
