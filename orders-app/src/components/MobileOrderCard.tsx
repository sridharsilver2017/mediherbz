import React from 'react';
import {
  Phone,
  MessageCircle,
  Truck,
  ChevronRight,
  Clock,
  CheckCircle2,
  Printer,
  MapPin,
  Package,
} from 'lucide-react';
import { Order } from '../types';

interface MobileOrderCardProps {
  order: Order;
  onSelect: (order: Order) => void;
  onPrint: (order: Order) => void;
}

export const MobileOrderCard: React.FC<MobileOrderCardProps> = ({ order, onSelect, onPrint }) => {
  const getWhatsAppLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rawPhone = (order.customer.phone || '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const text = encodeURIComponent(
      `Hello ${order.customer.first_name || 'Customer'},\n\nRegarding your Mediherbz order *${order.order_number}* (Total: ₹${order.total}):\nStatus: ${order.status.toUpperCase()}\n${
        order.tracking_id ? `🚚 Courier: ${order.shipping_carrier || 'Express Air'}\n📦 Waybill: ${order.tracking_id}\n` : ''
      }Track your shipment here: https://mediherbz.pages.dev/track-order?order=${order.order_number}\n\nThank you for choosing pure Ayurvedic care! 🌿`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500 animate-pulse',
          label: 'To Fulfill',
        };
      case 'completed':
        return {
          bg: 'bg-emerald-100 text-[#18833B] border-emerald-300 font-extrabold',
          dot: 'bg-[#18833B]',
          label: 'Completed',
        };
      case 'on-hold':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          dot: 'bg-purple-500',
          label: 'On Hold',
        };
      case 'cancelled':
      case 'failed':
        return {
          bg: 'bg-red-100 text-red-900 border-red-300',
          dot: 'bg-red-500',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-800 border-stone-200',
          dot: 'bg-stone-400',
          label: status,
        };
    }
  };

  const statusInfo = getStatusBadge(order.status);

  return (
    <div
      onClick={() => onSelect(order)}
      className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md active:scale-[0.99] transition-all cursor-pointer p-4 space-y-3.5 relative overflow-hidden"
    >
      {/* Top Header: Order Number, Date, Payment pill, Status pill */}
      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-stone-900 tracking-tight">
              {order.order_number}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                order.payment_method === 'cod'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                  : 'bg-emerald-50 text-[#18833B] border border-emerald-200/80'
              }`}
            >
              {order.payment_method === 'cod' ? '💵 COD' : '💳 PREPAID'}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium block mt-0.5">
            {order.date_created}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          <span>{statusInfo.label}</span>
        </span>
      </div>

      {/* Customer Info & Direct Action Pills */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-900 text-sm truncate">
            {order.customer.name}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">
              {order.customer.city || 'India'}
              {order.customer.postcode ? ` (${order.customer.postcode})` : ''}
            </span>
          </div>
        </div>

        {/* 1-Tap Touch Targets */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {order.customer.phone && (
            <>
              {/* Call */}
              <a
                href={`tel:${order.customer.phone}`}
                className="w-9 h-9 rounded-full bg-emerald-50 text-[#18833B] border border-emerald-200/80 flex items-center justify-center hover:bg-emerald-100 active:scale-90 transition-transform shadow-2xs"
                title={`Call ${order.customer.name}`}
              >
                <Phone className="w-4 h-4" />
              </a>

              {/* WhatsApp */}
              <a
                href={getWhatsAppLink({ stopPropagation: () => {} } as any)}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#18833B] text-white flex items-center justify-center hover:bg-[#12632F] active:scale-90 transition-transform shadow-xs"
                title="Send WhatsApp dispatch notification"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </>
          )}

          {/* Print Slip */}
          <button
            onClick={() => onPrint(order)}
            className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-90 flex items-center justify-center transition-transform"
            title="Print Thermal Packing Slip"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items Preview Strip */}
      <div className="bg-stone-50/90 rounded-xl p-2.5 flex items-center justify-between gap-3 border border-stone-200/60">
        <div className="flex items-center gap-2.5 min-w-0">
          {order.items[0]?.image ? (
            <img
              src={order.items[0].image}
              alt={order.items[0].name}
              className="w-9 h-9 rounded-lg object-cover bg-white shrink-0 border border-stone-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#18833B] flex items-center justify-center text-xs shrink-0 border border-emerald-100">
              <Package className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-900 truncate">
              {order.items[0]?.name || 'Item'}
            </p>
            <span className="text-[11px] text-stone-500">
              Qty: <strong className="text-stone-800">{order.items[0]?.quantity || 1}</strong>
              {order.items.length > 1 && (
                <span className="ml-1 text-emerald-800 font-bold bg-emerald-100/60 px-1.5 py-0.2 rounded text-[10px]">
                  +{order.items.length - 1} more
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Total Price */}
        <div className="text-right shrink-0">
          <span className="text-[10px] text-stone-400 block font-medium">Order Total</span>
          <span className="text-sm font-black text-stone-900">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Waybill / Tracking Pill (If Dispatched) */}
      {order.tracking_id ? (
        <div className="flex items-center justify-between text-[11px] bg-emerald-50/60 border border-emerald-200/60 rounded-xl px-3 py-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <Truck className="w-3.5 h-3.5 text-[#18833B]" />
            <span className="font-bold">{order.shipping_carrier || 'Express Courier'}</span>
          </div>
          <span className="font-mono font-bold text-emerald-900">{order.tracking_id}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
          <span>Tap to dispatch &amp; assign courier tracking</span>
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </div>
      )}
    </div>
  );
};
