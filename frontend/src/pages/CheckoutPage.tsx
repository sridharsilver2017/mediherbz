import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, CreditCard, Banknote, MapPin, Sparkles, Truck, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { api } from '../api/client';
import { Order } from '../types';

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
  saveAddress: z.boolean().optional(),
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
  saveAddress?: boolean;
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    clearCart,
    appliedCoupon,
    getDiscountAmount,
    getShippingFee,
    getGrandTotal,
  } = useCartStore();

  const { profile, getDefaultAddress, addAddress, addOrder, savedAddresses } = useUserStore();

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [processing, setProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const cartSubtotal = subtotal();
  const discountAmount = getDiscountAmount();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();

  // Pre-fill with default address or profile
  const defaultAddr = getDefaultAddress();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      firstName: defaultAddr?.first_name || profile?.first_name || '',
      lastName: defaultAddr?.last_name || profile?.last_name || '',
      email: defaultAddr?.email || profile?.email || '',
      phone: defaultAddr?.phone || profile?.phone || '',
      address: defaultAddr?.address_1 || '',
      city: defaultAddr?.city || '',
      state: defaultAddr?.state || '',
      postcode: defaultAddr?.postcode || '',
      country: 'India',
      saveAddress: true,
    },
  });

  const selectSavedAddress = (addr: any) => {
    reset({
      firstName: addr.first_name,
      lastName: addr.last_name,
      email: addr.email,
      phone: addr.phone,
      address: addr.address_1,
      city: addr.city,
      state: addr.state,
      postcode: addr.postcode,
      country: addr.country || 'India',
      saveAddress: false,
    });
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return;
    setProcessing(true);

    try {
      // 1. If Razorpay selected, simulate or initialize Razorpay transaction
      let paymentId = '';
      if (paymentMethod === 'razorpay') {
        const orderReceipt = `rcpt_${Date.now()}`;
        const razorpayOrder = await api.createRazorpayOrder(grandTotal, 'INR', orderReceipt);
        paymentId = `pay_${Date.now()}`;
      }

      // 2. Submit order to live WooCommerce API
      const orderPayload = {
        customer: data,
        items: items.map((it) => ({
          product: { id: it.product.id, name: it.product.name, price: it.variation?.price ?? it.product.price },
          quantity: it.quantity,
          variation: it.variation,
        })),
        payment_method: paymentMethod,
        payment_id: paymentId,
        coupon: appliedCoupon?.code,
        discount_total: discountAmount,
        shipping_total: shippingFee,
        total: grandTotal,
      };

      const result = await api.createOrder(orderPayload);

      // 3. Save address if requested
      if (data.saveAddress) {
        addAddress({
          title: `${data.city} Address`,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address_1: data.address,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
          is_default: savedAddresses.length === 0,
        });
      }

      // 4. Construct confirmed order object and save to customer's account store
      const orderRecord: Order = {
        id: result.order_id || Date.now(),
        order_number: result.order_number,
        status: 'processing',
        currency: 'INR',
        total: grandTotal,
        subtotal: cartSubtotal,
        shipping_total: shippingFee,
        discount_total: discountAmount,
        tax_total: 0,
        date_created: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        billing: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address_1: data.address,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
        },
        shipping: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address_1: data.address,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
        },
        items: items.map((it, idx) => ({
          id: idx + 1,
          product_id: it.product.id,
          name: it.product.name,
          quantity: it.quantity,
          subtotal: (it.variation?.price ?? it.product.price) * it.quantity,
          total: (it.variation?.price ?? it.product.price) * it.quantity,
          image: it.product.images[0]?.src,
        })),
        shipping_carrier: 'Express BlueDart Air',
        tracking_id: `BD-${Math.floor(100000000 + Math.random() * 900000000)}IN`,
        payment_method: paymentMethod,
        payment_method_title: paymentMethod === 'razorpay' ? 'Razorpay (Online Payment)' : 'Cash on Delivery (COD)',
        is_paid: paymentMethod === 'razorpay',
      };

      addOrder(orderRecord);
      clearCart();
      setProcessing(false);
      setConfirmedOrder(orderRecord);
    } catch (err) {
      console.error('Order creation error', err);
      setProcessing(false);
      alert('Could not complete order. Please try again.');
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-[#18833B] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Order Successful</span>
          <h1 className="text-3xl font-black text-[#26352A] font-serif">Order Confirmed!</h1>
          <p className="text-sm text-stone-600">
            Thank you for choosing Mediherbz. Your Ayurvedic formulations are being prepared.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-6 bg-white border border-stone-200/80 rounded-3xl text-left space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-stone-400 block text-[11px]">Order Number</span>
              <span className="font-extrabold text-stone-900 text-sm">{confirmedOrder.order_number}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-400 block text-[11px]">Total Paid/Payable</span>
              <span className="font-black text-[#18833B] text-base">₹{confirmedOrder.total}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Payment Method</span>
              <span className="font-bold text-stone-800">{confirmedOrder.payment_method_title}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Estimated Delivery</span>
              <span className="font-bold text-stone-800">3 - 5 Business Days</span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <span className="text-stone-400 block text-[11px] mb-2">Items Ordered:</span>
            <div className="space-y-2">
              {confirmedOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {it.image && (
                      <img src={it.image} alt={it.name} className="w-8 h-8 rounded-lg object-cover bg-stone-50" />
                    )}
                    <span className="text-stone-800 font-medium">{it.name} <span className="text-stone-400">× {it.quantity}</span></span>
                  </div>
                  <span className="font-bold text-stone-900">₹{it.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(`/track-order?order=${confirmedOrder.order_number}`)}
            className="px-6 py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" /> Track Order Status
          </button>
          <button
            onClick={() => navigate('/account')}
            className="px-6 py-3.5 bg-stone-800 hover:bg-black text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" /> View in My Account
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
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
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-sm font-semibold"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Fast &amp; Secure</span>
        <h1 className="text-3xl font-black text-[#26352A] font-serif mt-0.5">Checkout &amp; Shipping</h1>
        <p className="text-xs text-stone-500 mt-1">Complete your delivery address for expedited Ayurvedic dispatch</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Shipping Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Saved Address Quick Selector */}
          {savedAddresses.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-[#26352A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#18833B]" /> Deliver to Saved Address:
              </span>
              <div className="flex flex-wrap gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className="text-xs text-left p-2.5 rounded-xl border border-stone-200 hover:border-[#18833B] hover:bg-[#FAF9F2] transition-all cursor-pointer"
                  >
                    <span className="font-bold text-[#26352A] block">{addr.title || addr.first_name}</span>
                    <span className="text-[11px] text-stone-500 block truncate max-w-xs">{addr.address_1}, {addr.city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3 flex items-center gap-2">
              <span>1. Customer &amp; Shipping Address</span>
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
                placeholder="Leave with security or deliver after 2 PM..."
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveAddress"
                {...register('saveAddress')}
                className="w-4 h-4 text-[#18833B] rounded-sm border-stone-300 focus:ring-[#18833B]"
              />
              <label htmlFor="saveAddress" className="text-xs text-stone-600 cursor-pointer">
                Save this address in My Account for quick 1-click reorders
              </label>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3">
              2. Select Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#18833B] bg-emerald-50/40'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-4 h-4 text-[#18833B]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#26352A] block flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#18833B]" /> Razorpay Instant Checkout (Recommended)
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Google Pay, PhonePe, Paytm UPI, Cards, NetBanking
                    </span>
                  </div>
                </div>
                <span className="text-[11px] bg-[#A6C928]/30 text-[#12632F] font-bold px-2 py-0.5 rounded-md">
                  Instant
                </span>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#18833B] bg-emerald-50/40'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-[#18833B]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#26352A] block flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-stone-700" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Pay cash or scan UPI QR upon arrival at your doorstep
                    </span>
                  </div>
                </div>
                <span className="text-[11px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-md">
                  Doorstep Pay
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5 sticky top-28">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3">
              3. Order Summary ({items.length} items)
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const itemPrice = item.variation?.price ?? item.product.price;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.images[0]?.src}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg bg-stone-50 border border-stone-100"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-stone-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹{itemPrice * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Shipping Delivery</span>
                <span className="text-[#18833B] font-semibold">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-[#26352A] pt-3 border-t border-stone-200">
                <span>Total Payable</span>
                <span className="text-[#18833B]">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-[#18833B] hover:bg-[#12632F] text-white font-black rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <span>Confirming Order...</span>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Lock className="w-4 h-4" /> Pay ₹{grandTotal} via Razorpay
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Place Cash on Delivery Order (₹{grandTotal})
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-[#18833B]" />
              <span>100% Genuine Ayurvedic Herbs • Verified Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
