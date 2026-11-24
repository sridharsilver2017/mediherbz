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
  AlertCircle,
  Copy,
  Package,
  Sparkles,
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
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [markShipped, setMarkShipped] = useState(true);
  const [savingTracking, setSavingTracking] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    setCurrentStatus(order.status);
    setCarrier(order.shipping_carrier || 'Express BlueDart Air');
    setTrackingId(order.tracking_id || '');
    setTrackingUrl(order.tracking_url || '');
  }, [order.id, order.status, order.shipping_carrier, order.tracking_id, order.tracking_url]);

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
      if (markShipped) {
        setCurrentStatus('completed');
      }
      setMessage({ text: 'Courier & tracking details saved to WooCommerce!', type: 'success' });
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
    setCurrentStatus(newStatus);

    try {
      await api.updateOrderStatus(order.id, newStatus, `Status changed to ${newStatus} via Mediherbz Orders App`);
      setMessage({ text: `Order status updated to ${newStatus.toUpperCase()}!`, type: 'success' });
      onUpdated();
    } catch (err: any) {
      setCurrentStatus(order.status);
      setMessage({ text: err?.message || 'Failed to update order status', type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopyAddress = () => {
    const fullText = `${order.customer.name}\n${order.customer.address}\n${order.customer.city}, ${order.customer.state} - ${order.customer.postcode}\nPhone: ${order.customer.phone}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const getWhatsAppLink = () => {
    const rawPhone = (order.customer.phone || '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const text = encodeURIComponent(
      `Hello ${order.customer.first_name || 'Customer'},\n\nYour Mediherbz Ayurvedic order *${order.order_number}* (Total: ₹${order.total}) has been prepared!\n${
        trackingId ? `🚚 Carrier: ${carrier}\n📦 Tracking ID: ${trackingId}\n` : ''
      }\nYou can track your live shipment here: https://mediherbz.pages.dev/track-order?order=${order.order_number}\n\nThank you for choosing pure Ayurvedic wellness! 🌿`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Stepper calculations
  const isDelivered = currentStatus === 'completed';
  const hasTracking = Boolean(trackingId.trim());

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end md:items-stretch md:justify-end animate-fadeIn"
      onClick={onClose}
    >
      {/* Container: Bottom sheet on mobile, right sliding drawer on desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF9F2] w-full md:max-w-xl max-h-[92vh] md:max-h-full h-auto md:h-full rounded-t-lg md:rounded-none shadow-2xl flex flex-col overflow-hidden animate-slideUp md:animate-none font-sans"
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
        <div className="px-5 py-4 border-b border-stone-200/90 flex items-center justify-between bg-white shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {order.order_number}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentStatus === 'processing'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : currentStatus === 'completed'
                    ? 'bg-emerald-100 text-[#18833B] border border-emerald-300'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
              Booked on {order.date_created}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrint(order)}
              className="p-2.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer border border-stone-200"
              title="Print Packing Slip"
            >
              <Printer className="w-4 h-4 text-[#18833B]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all cursor-pointer shadow-2xs"
              aria-label="Close details"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {message && (
          <div
            className={`p-3 text-xs flex items-center gap-2 animate-fadeIn ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200 font-bold'
                : 'bg-red-50 text-red-900 border-b border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#18833B]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Quick Action Contact Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3.5 bg-[#18833B] hover:bg-[#12632F] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {order.customer.phone && (
              <a
                href={`tel:${order.customer.phone}`}
                className="py-2.5 px-3.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-2xs"
              >
                <Phone className="w-4 h-4 text-[#18833B]" />
                <span>Call Customer</span>
              </a>
            )}

            <button
              onClick={() => onPrint(order)}
              className="col-span-2 sm:col-span-1 py-2.5 px-3.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Print Slip</span>
            </button>
          </div>

          {/* Dispatch Stepper Tracker */}
          <div className="bg-white p-4 rounded-lg border border-stone-200/90 shadow-xs space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
              Fulfillment Journey
            </span>
            <div className="grid grid-cols-4 gap-1 text-center">
              {/* Step 1: Confirmed */}
              <div className="space-y-1">
                <div className="w-7 h-7 mx-auto rounded-full bg-[#18833B] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  ✓
                </div>
                <span className="text-[10px] font-bold text-stone-800 block">Placed</span>
              </div>

              {/* Step 2: Packaging */}
              <div className="space-y-1">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black ${
                    currentStatus !== 'cancelled'
                      ? 'bg-[#18833B] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {currentStatus === 'cancelled' ? '✕' : '✓'}
                </div>
                <span className="text-[10px] font-bold text-stone-800 block">Packaged</span>
              </div>

              {/* Step 3: In Transit */}
              <div className="space-y-1">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black ${
                    hasTracking || isDelivered
                      ? 'bg-[#18833B] text-white shadow-xs'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {hasTracking || isDelivered ? '✓' : '3'}
                </div>
                <span className="text-[10px] font-bold text-stone-800 block">In Transit</span>
              </div>

              {/* Step 4: Delivered */}
              <div className="space-y-1">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-black ${
                    isDelivered ? 'bg-[#18833B] text-white shadow-xs' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isDelivered ? '✓' : '4'}
                </div>
                <span className="text-[10px] font-bold text-stone-800 block">Delivered</span>
              </div>
            </div>
          </div>

          {/* Courier Dispatch & Waybill Card */}
          <div className="p-4 sm:p-5 rounded-lg bg-white border border-[#18833B]/25 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#18833B] font-black text-xs uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Courier &amp; Waybill Tracking</span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium">Auto-syncs with store</span>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  list="carrier-options-drawer"
                  placeholder="e.g. Express BlueDart Air"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                />
                <datalist id="carrier-options-drawer">
                  {COMMON_CARRIERS.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. BD-89210041IN"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Courier Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://www.bluedart.com/tracking..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-hidden focus:border-[#18833B] focus:bg-white font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800 font-bold select-none">
                  <input
                    type="checkbox"
                    checked={markShipped}
                    onChange={(e) => setMarkShipped(e.target.checked)}
                    className="w-4 h-4 text-[#18833B] rounded border-stone-300 focus:ring-0"
                  />
                  <span>Mark Order as Completed / Shipped</span>
                </label>

                <button
                  type="submit"
                  disabled={savingTracking}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white font-black rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingTracking ? 'Saving...' : 'Save & Update Tracking'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Status Workflow Segmented Buttons */}
          <div className="p-4 rounded-lg bg-white border border-stone-200/90 shadow-xs space-y-2.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Quick Status Changer
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={updatingStatus || currentStatus === 'processing'}
                onClick={() => handleStatusChange('processing')}
                className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  currentStatus === 'processing'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70'
                }`}
              >
                Processing
              </button>
              <button
                disabled={updatingStatus || currentStatus === 'completed'}
                onClick={() => handleStatusChange('completed')}
                className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  currentStatus === 'completed'
                    ? 'bg-emerald-100 text-[#18833B] border border-emerald-300 font-black shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70'
                }`}
              >
                Completed
              </button>
              <button
                disabled={updatingStatus || currentStatus === 'on-hold'}
                onClick={() => handleStatusChange('on-hold')}
                className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  currentStatus === 'on-hold'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 font-black shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70'
                }`}
              >
                On Hold
              </button>
              <button
                disabled={updatingStatus || currentStatus === 'cancelled'}
                onClick={() => handleStatusChange('cancelled')}
                className={`py-2 px-2 rounded-lg font-bold text-xs cursor-pointer transition-all active:scale-95 text-center ${
                  currentStatus === 'cancelled'
                    ? 'bg-red-100 text-red-900 border border-red-300 font-black shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Customer & Shipping Address */}
          <div className="p-4 sm:p-5 rounded-lg bg-white border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Customer &amp; Delivery Address
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#18833B] hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="font-black text-stone-900 text-sm">{order.customer.name}</p>
              <p className="text-stone-700 leading-relaxed text-xs">
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.state} - {order.customer.postcode}
              </p>
              <p className="text-stone-900 font-bold pt-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#18833B]" />
                <span>{order.customer.phone}</span>
              </p>
              <p className="text-stone-500 text-[11px]">{order.customer.email}</p>
            </div>
          </div>

          {/* Ordered Products Breakdown */}
          <div className="p-4 sm:p-5 rounded-lg bg-white border border-stone-200/90 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Cart Items ({order.items.length})
            </span>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#18833B] flex items-center justify-center shrink-0 border border-emerald-100">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Qty: <strong className="text-stone-800">{item.quantity}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-stone-900 text-sm shrink-0">
                    ₹{item.total.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Total Amount</span>
                <span className="text-xs font-bold uppercase text-stone-800">
                  {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Prepaid Online'}
                </span>
              </div>
              <span className="text-2xl font-black text-[#18833B]">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

        </div>

        {/* Mobile Sticky Bottom Close Bar */}
        <div className="p-3 border-t border-stone-200 bg-white flex items-center justify-end md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-bold text-xs cursor-pointer active:scale-98 transition-all text-center"
          >
            Done / Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
