import React from 'react';
import {
  Phone,
  MessageCircle,
  Truck,
  ChevronRight,
  Clock,
  CheckCircle2,
  Printer,
  MapPin
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
      `Hello ${order.customer.first_name || 'Customer'},\n\nRegarding your Mediherbz order *${order.order_number}* (₹${order.total}):\nStatus: ${order.status.toUpperCase()}\n${
        order.tracking_id ? `🚚 ${order.shipping_carrier || 'Courier'}: ${order.tracking_id}\n` : ''
      }Track online: https://mediherbz.pages.dev/track-order?order=${order.order_number}`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'on-hold':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-900 border-red-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(order)}
      className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-4 space-y-3.5 active:scale-[0.99] transition-all cursor-pointer relative"
    >
      {/* Top Bar: Order ID, Date, Payment pill, Status pill */}
      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-stone-900">{order.order_number}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
              order.payment_method === 'cod' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-[#18833B] border border-emerald-200'
            }`}>
              {order.payment_method === 'cod' ? 'COD' : 'PREPAID'}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">{order.date_created}</span>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Customer Info & Quick Contact Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-stone-900 text-sm truncate">{order.customer.name}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{order.customer.city || 'India'} {order.customer.postcode ? `(${order.customer.postcode})` : ''}</span>
          </div>
        </div>

        {/* 1-Tap Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {order.customer.phone && (
            <>
              <a
                href={`tel:${order.customer.phone}`}
                className="w-8 h-8 rounded-full bg-emerald-50 text-[#18833B] border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all"
                title="Call Customer"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>

              <a
                href={getWhatsAppLink({ stopPropagation: () => {} } as any)}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                title="WhatsApp Customer"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </>
          )}

          <button
            onClick={() => onPrint(order)}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 flex items-center justify-center transition-all"
            title="Print Packing Slip"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items Preview */}
      <div className="bg-stone-50/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {order.items[0]?.image ? (
            <img
              src={order.items[0].image}
              alt=""
              className="w-9 h-9 rounded-lg object-cover bg-white border border-stone-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-stone-200 flex items-center justify-center text-xs shrink-0">
              📦
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-900 truncate">
              {order.items[0]?.name || 'Product'}
            </p>
            <p className="text-[10px] text-stone-500">
              Qty: <strong className="text-stone-800">{order.items[0]?.quantity || 1}</strong>
              {order.items.length > 1 && ` • +${order.items.length - 1} more items`}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-stone-400 block font-medium">Total</span>
          <span className="text-sm font-black text-stone-900">₹{order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Bottom Dispatch / Tracking Bar */}
      <div className="flex items-center justify-between pt-1 text-[11px]">
        {order.tracking_id ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <Truck className="w-3.5 h-3.5 text-[#18833B]" />
            <span className="truncate max-w-[170px]">{order.shipping_carrier || 'Courier'}: {order.tracking_id}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Ready for dispatch</span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(order);
          }}
          className="px-3 py-1.5 bg-[#18833B] text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-[#12632F] active:scale-95 transition-all shadow-xs"
        >
          <span>Dispatch</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
