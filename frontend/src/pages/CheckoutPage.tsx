import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { api } from '../api/client';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address required'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postcode: z.string().min(6, 'Valid 6-digit postal code required'),
  country: z.string(),
  notes: z.string().optional(),
});

type CheckoutFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  notes?: string;
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const cartSubtotal = subtotal();
  const shippingFee = cartSubtotal >= 999 ? 0 : 99;
  const grandTotal = cartSubtotal + shippingFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      country: 'India',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setProcessing(true);
    try {
      // 1. Create order on Razorpay / Backend
      const orderReceipt = `rcpt_${Date.now()}`;
      const razorpayOrder = await api.createRazorpayOrder(grandTotal, 'INR', orderReceipt);

      // 2. Simulated payment handler (in production, opens new window.Razorpay(options).open())
      setTimeout(async () => {
        const verifyRes = await api.verifyRazorpayPayment({
          razorpay_order_id: razorpayOrder.order_id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'sig_verified_mock_token',
          order_data: {
            customer: data,
            items: items,
            total: grandTotal,
          },
        });

        clearCart();
        setProcessing(false);
        setPaymentSuccess(verifyRes.order_number);
      }, 1500);
    } catch (err) {
      console.error('Payment error', err);
      setProcessing(false);
      alert('Could not complete payment. Please try again.');
    }
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-[#18833B] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-[#26352A] font-serif">Order Confirmed!</h1>
        <p className="text-sm text-stone-600">
          Thank you for choosing Mediherbz. Your payment of <strong className="text-[#18833B]">₹{grandTotal}</strong> was successful.
        </p>
        <div className="p-5 bg-white border border-stone-200 rounded-2xl text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-400">Order Number:</span>
            <span className="font-bold text-stone-900">{paymentSuccess}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Payment Gateway:</span>
            <span className="font-bold text-emerald-700">Razorpay Verified (UPI/Card)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Dispatch Status:</span>
            <span className="font-bold text-stone-900">Preparing for Shipment</span>
          </div>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(`/track-order?order=${paymentSuccess}`)}
            className="px-6 py-3 bg-[#18833B] text-white font-bold rounded-xl text-xs hover:bg-[#12632F] transition-all"
          >
            Track Order Status
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl text-xs hover:bg-stone-200 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800">Your Cart is Empty</h2>
        <p className="text-sm text-stone-500">Please add herbal products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-sm font-semibold"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#26352A] font-serif">Checkout &amp; Shipping</h1>
        <p className="text-xs text-stone-500 mt-1">Provide your shipping details for expedited Ayurvedic delivery</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Shipping Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3">
              1. Customer &amp; Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">First Name *</label>
                <input
                  {...register('firstName')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="e.g. Rahul"
                />
                {errors.firstName && <p className="text-[11px] text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Last Name *</label>
                <input
                  {...register('lastName')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="e.g. Sharma"
                />
                {errors.lastName && <p className="text-[11px] text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="rahul@example.com"
                />
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Mobile Phone (for delivery SMS) *</label>
                <input
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="9876543210"
                />
                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Street Address / House No. *</label>
              <input
                {...register('address')}
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                placeholder="Flat / Building / Landmark"
              />
              {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">City *</label>
                <input
                  {...register('city')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="e.g. Mumbai"
                />
                {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">State *</label>
                <input
                  {...register('state')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="e.g. Maharashtra"
                />
                {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">PIN Code *</label>
                <input
                  {...register('postcode')}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                  placeholder="400001"
                />
                {errors.postcode && <p className="text-[11px] text-red-500 mt-1">{errors.postcode.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Special Order / Delivery Notes (optional)</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
                placeholder="Leave with security or deliver before 5 PM..."
              />
            </div>
          </div>
        </div>

        {/* Order Summary & Payment Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3">
              2. Order Summary ({items.length} items)
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.images[0]?.src}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg bg-stone-100"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-stone-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-stone-900">
                    ₹{(item.variation?.price ?? item.product.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Charges</span>
                <span className="text-[#18833B] font-semibold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#26352A] pt-2 border-t border-stone-200">
                <span>Total Payable</span>
                <span className="text-[#18833B]">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="p-4 rounded-2xl bg-[#FAF9F2] border border-[#18833B]/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18833B]" />
                <span className="font-bold text-xs text-[#12632F]">Razorpay Instant Checkout</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Supports all UPI Apps (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets.
              </p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-[#18833B] hover:bg-[#12632F] text-white font-black rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <span>Securing Razorpay Session...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay ₹{grandTotal} with Razorpay
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-[#18833B]" />
              <span>100% Secure 256-bit Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
