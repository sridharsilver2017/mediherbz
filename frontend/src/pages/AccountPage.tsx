import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Check,
  Truck,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  Edit2
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { api } from '../api/client';
import { Order, SavedAddress } from '../types';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    isLoggedIn,
    orders,
    savedAddresses,
    login,
    logout,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    setOrders,
  } = useUserStore();

  const { addItem } = useCartStore();
  const { items: wishlistItems, removeItem: removeWishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');
  const [showAddAddress, setShowAddAddress] = useState(false);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: 'India',
    is_default: savedAddresses.length === 0,
  });

  // Login form state (if guest)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Sync orders dynamically from WordPress if customer email is set
  useEffect(() => {
    if (profile?.email) {
      api.getCustomerOrders(profile.email).then((liveOrders) => {
        if (liveOrders && liveOrders.length > 0) {
          setOrders(liveOrders);
        }
      });
    }
  }, [profile?.email]);

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.address_1 || !newAddr.city || !newAddr.postcode) {
      alert('Please fill in street address, city and postal code.');
      return;
    }
    addAddress(newAddr);
    setShowAddAddress(false);
    setNewAddr({
      title: 'Home',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address_1: '',
      city: '',
      state: '',
      postcode: '',
      country: 'India',
      is_default: false,
    });
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      // Find matching product or add basic representation
      addItem({
        id: item.product_id,
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, '-'),
        price: item.total / item.quantity,
        regular_price: item.total / item.quantity,
        sale_price: item.total / item.quantity,
        on_sale: false,
        short_description: '',
        description: '',
        categories: [],
        images: item.image ? [{ id: 1, src: item.image, alt: item.name }] : [],
        rating: 4.9,
        rating_count: 50,
        in_stock: true,
        stock_quantity: 50,
        sku: `MED-${item.product_id}`,
        type: 'simple',
        herbal_fields: {
          botanical_name: 'Classical Ayurvedic Formulation',
          ingredients: ['Pure Herbal Extracts'],
          directions_for_use: 'Use as directed on label.',
        },
        featured: false,
        bestseller: false,
        new_arrival: false,
      }, undefined, item.quantity);
    });
    navigate('/cart');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      alert('Please enter your email.');
      return;
    }
    login({
      email: loginEmail.trim(),
      first_name: loginName.trim() || 'Ayurvedic',
      last_name: 'Customer',
      phone: loginPhone.trim() || '9876543210',
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-[#FAF9F2] text-[#18833B] rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Ayurvedic Sanctuary</span>
            <h1 className="text-2xl font-black text-[#26352A] font-serif mt-1">Welcome to My Account</h1>
            <p className="text-xs text-stone-500 mt-1">
              Sign in with your email or phone to view your live orders, saved addresses, and wellness preferences.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Your Name</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="e.g. Ananya"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ananya@example.com"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Mobile Phone (optional)</label>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Sign In to My Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Profile Banner */}
      <div className="bg-gradient-to-r from-[#18833B] to-[#12632F] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-[#A6C928] flex items-center justify-center text-white shrink-0 font-serif font-black text-2xl">
            {profile?.first_name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-serif">
                Namaste, {profile?.first_name} {profile?.last_name}
              </h1>
              {profile?.dosha && (
                <span className="bg-[#A6C928] text-[#12632F] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {profile.dosha} Balance
                </span>
              )}
            </div>
            <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
              <span>{profile?.email}</span>
              {profile?.phone && <span>• +91 {profile.phone}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-6 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {savedAddresses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist</span>
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {wishlistItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Ayurvedic Dosha</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200/80 text-center space-y-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">No orders yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                You haven’t placed any botanical orders yet. Explore our cold-pressed herbal oils and organic supplements.
              </p>
              <Link
                to="/shop"
                className="inline-block px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-xs font-bold"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id || o.order_number}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Order Placed</span>
                    <span className="font-bold text-xs text-stone-800">{o.date_created}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Order Number</span>
                    <span className="font-extrabold text-xs text-[#18833B]">{o.order_number}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Total</span>
                    <span className="font-black text-sm text-stone-900">₹{o.total}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Status</span>
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      o.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-12 h-12 object-cover rounded-xl bg-stone-50 border border-stone-100"
                          />
                        )}
                        <div>
                          <p className="font-bold text-stone-800">{it.name}</p>
                          <p className="text-stone-400 text-[11px]">Qty: {it.quantity} • {o.payment_method_title}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-stone-900">₹{it.total}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => navigate(`/track-order?order=${o.order_number}`)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#18833B]" /> Track Package
                  </button>
                  <button
                    onClick={() => handleReorder(o)}
                    className="px-4 py-2 bg-[#18833B] hover:bg-[#12632F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Re-Order All
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#26352A]">Your Delivery Locations</h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2 bg-[#18833B] hover:bg-[#12632F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form onSubmit={handleSaveNewAddress} className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-[#26352A]">Add New Shipping Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Address Label</label>
                  <input
                    type="text"
                    value={newAddr.title}
                    onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                    placeholder="e.g. Home, Office"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={newAddr.first_name}
                    onChange={(e) => setNewAddr({ ...newAddr, first_name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newAddr.email}
                    onChange={(e) => setNewAddr({ ...newAddr, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.address_1}
                  onChange={(e) => setNewAddr({ ...newAddr, address_1: e.target.value })}
                  placeholder="Flat / Building / Street"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={newAddr.postcode}
                    onChange={(e) => setNewAddr({ ...newAddr, postcode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#18833B] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white p-5 rounded-3xl border shadow-xs space-y-3 relative ${
                  addr.is_default ? 'border-[#18833B]' : 'border-stone-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#26352A]">{addr.title || 'Address'}</span>
                    {addr.is_default && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Default Delivery
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-stone-300 hover:text-red-500 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <p className="font-semibold text-stone-800">{addr.first_name} {addr.last_name}</p>
                  <p>{addr.address_1}</p>
                  <p>{addr.city}, {addr.state} - {addr.postcode}</p>
                  <p className="text-stone-400">Phone: +91 {addr.phone}</p>
                </div>

                {!addr.is_default && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-bold text-[#18833B] hover:underline cursor-pointer pt-1 block"
                  >
                    Set as Default Delivery Address
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200/80 text-center space-y-4">
              <Heart className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">Your Wishlist is Empty</h3>
              <p className="text-xs text-stone-500">Save items here while exploring our Ayurvedic range.</p>
              <Link to="/shop" className="inline-block px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-xs font-bold">
                Explore Botanical Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={prod.images[0]?.src}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded-xl bg-stone-50 shrink-0 border border-stone-100"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#26352A] line-clamp-1">{prod.name}</h4>
                      <p className="text-xs font-black text-[#18833B] mt-0.5">₹{prod.price}</p>
                      {prod.herbal_fields?.botanical_name && (
                        <p className="text-[10px] text-stone-400 italic line-clamp-1 mt-0.5">
                          {prod.herbal_fields.botanical_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        addItem(prod);
                        removeWishlist(prod.id);
                      }}
                      className="flex-1 py-2 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                    <button
                      onClick={() => removeWishlist(prod.id)}
                      className="p-2 text-stone-400 hover:text-red-500 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile & Preferences */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-bold text-base text-[#26352A]">Ayurvedic Profile &amp; Preferences</h3>
            <p className="text-xs text-stone-500 mt-0.5">Tailor formulations and herbal recommendations to your dosha</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">First Name</label>
                <input
                  type="text"
                  value={profile?.first_name || ''}
                  onChange={(e) => updateProfile({ first_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Last Name</label>
                <input
                  type="text"
                  value={profile?.last_name || ''}
                  onChange={(e) => updateProfile({ last_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <label className="text-stone-700 font-semibold block mb-1">Dominant Ayurvedic Dosha</label>
              <select
                value={profile?.dosha || 'Tridoshic'}
                onChange={(e) => updateProfile({ dosha: e.target.value as any })}
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-white"
              >
                <option value="Vata">Vata (Air &amp; Ether - Nourishment &amp; Grounding)</option>
                <option value="Pitta">Pitta (Fire &amp; Water - Cooling &amp; Soothing)</option>
                <option value="Kapha">Kapha (Earth &amp; Water - Clarifying &amp; Energizing)</option>
                <option value="Tridoshic">Tridoshic (Balanced All Three Energies)</option>
              </select>
            </div>

            <div>
              <label className="text-stone-700 font-semibold block mb-1">Primary Herbal Goal</label>
              <input
                type="text"
                value={profile?.wellness_goal || ''}
                onChange={(e) => updateProfile({ wellness_goal: e.target.value })}
                placeholder="e.g. Hair Regrowth, Radiant Skin, Daily Energy"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
