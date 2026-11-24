import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';

interface PrintSlipModalProps {
  order: Order;
  onClose: () => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#18833B]" />
            <span className="font-bold text-sm text-stone-900">Packing Slip &amp; Shipping Label</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#18833B] hover:bg-[#12632F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Label
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs text-stone-800 space-y-6" id="printable-slip">
          {/* Label Header */}
          <div className="flex items-start justify-between border-b-2 border-stone-900 pb-4">
            <div>
              <h1 className="text-2xl font-black text-[#18833B] tracking-tight uppercase">MEDIHERBZ</h1>
              <p className="text-[11px] text-stone-500 font-medium">AYUSH Certified Botanical Care</p>
              <p className="text-[10px] text-stone-400 mt-1">support@mediherbz.com • +91 98765 43210</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-stone-900 block">{order.order_number}</span>
              <span className="text-[10px] text-stone-500 uppercase block">Order Date: {order.date_created}</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-stone-900 text-white">
                {order.payment_method === 'cod' ? 'CASH ON DELIVERY (COD)' : 'PREPAID ONLINE'}
              </span>
            </div>
          </div>

          {/* Shipping Addresses Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">SHIP TO (CUSTOMER):</span>
              <p className="font-extrabold text-sm text-stone-900">{order.customer.name}</p>
              <p className="text-xs text-stone-700 leading-relaxed mt-1">
                {order.customer.address}<br />
                {order.customer.city}, {order.customer.state} - {order.customer.postcode}<br />
                {order.customer.country || 'India'}
              </p>
              <p className="font-bold text-xs text-stone-900 mt-2">📞 {order.customer.phone}</p>
            </div>

            <div className="border-l border-stone-200 pl-6">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">COURIER DISPATCH:</span>
              <p className="font-bold text-stone-900">{order.shipping_carrier || 'Express Air'}</p>
              {order.tracking_id ? (
                <div className="mt-2">
                  <span className="text-[10px] text-stone-500 block">WAYBILL / TRACKING:</span>
                  <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {order.tracking_id}
                  </span>
                </div>
              ) : (
                <span className="text-stone-400 text-[11px] block mt-1">Awaiting AWB Generation</span>
              )}

              <div className="mt-4 pt-2 border-t border-dashed border-stone-300">
                <span className="text-[10px] font-bold text-stone-500 block">TOTAL COLLECTIBLE:</span>
                <span className="text-base font-black text-stone-900">
                  ₹{order.total} {order.payment_method === 'cod' ? '(COLLECT CASH)' : '(PAID)'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">ORDERED ITEMS ({order.items.length}):</span>
            <table className="w-full text-left border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-100 text-stone-600 font-bold text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">SKU</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-medium text-stone-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-center text-stone-400 font-mono text-[11px]">{item.sku || '-'}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-stone-900">₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 font-bold border-t border-stone-200">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-right text-stone-600">Total Payable:</td>
                  <td className="py-2 px-3 text-right text-stone-900 text-sm">₹{order.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-stone-200 text-center text-[10px] text-stone-400 space-y-1">
            <p>Thank you for choosing 100% pure Ayurvedic wellness by Mediherbz.</p>
            <p>For any transit queries, reach us at support@mediherbz.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
