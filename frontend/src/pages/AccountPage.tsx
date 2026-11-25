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
  Edit2,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  MessageSquare,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  CloudCheck,
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
    syncOrders,
  } = useUserStore();

  const { addItem } = useCartStore();
  const {
    items: wishlistItems,
    removeItem: removeWishlist,
    moveAllToCart: moveAllWishlistToCart,
    isSyncing: wishlistSyncing,
    syncWithCloud,
  } = useWishlistStore();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'completed' | 'cancelled'>('all');
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth screen state (when not logged in)
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'track'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDosha, setRegDosha] = useState<'Vata' | 'Pitta' | 'Kapha' | 'Tridoshic'>('Tridoshic');

  // Single order lookup state
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackEmail, setTrackEmail] = useState('');

  // UI feedback states
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Profile edit state
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDosha, setEditDosha] = useState<'Vata' | 'Pitta' | 'Kapha' | 'Tridoshic'>('Tridoshic');
  const [editGoal, setEditGoal] = useState('');

  // Address modal/form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    city: '',
    state: '',
    postcode: '',
    country: 'India',
    is_default: false,
  });

  // Sync profile values to edit form when profile updates
  useEffect(() => {
    if (profile) {
      setEditFirstName(profile.first_name || '');
      setEditLastName(profile.last_name || '');
      setEditPhone(profile.phone || '');
      setEditDosha((profile.dosha as any) || 'Tridoshic');
      setEditGoal(profile.wellness_goal || '');
    }
  }, [profile]);

  // Sync orders & wishlist dynamically from WordPress whenever email is present
  useEffect(() => {
    if (isLoggedIn && profile?.email) {
      handleSyncOrders();
      syncWithCloud(profile.email);
    }
  }, [isLoggedIn, profile?.email]);

  const handleSyncOrders = async () => {
    if (!profile?.email && !profile?.phone) return;
    setSyncingOrders(true);
    try {
      const liveOrders = await api.getCustomerOrders(profile.email || profile.phone);
      if (Array.isArray(liveOrders)) {
        setOrders(liveOrders);

        // If customer has no saved address, dynamically extract from last order billing
        if (savedAddresses.length === 0 && liveOrders.length > 0) {
          const lastOrder = liveOrders[0];
          if (lastOrder.billing && lastOrder.billing.address_1) {
            addAddress({
              title: 'Home',
              first_name: lastOrder.billing.first_name || profile.first_name,
              last_name: lastOrder.billing.last_name || profile.last_name,
              email: lastOrder.billing.email || profile.email,
              phone: lastOrder.billing.phone || profile.phone,
              address_1: lastOrder.billing.address_1,
              city: lastOrder.billing.city,
              state: lastOrder.billing.state,
              postcode: lastOrder.billing.postcode,
              country: 'India',
              is_default: true,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Account] Could not refresh orders', err);
    } finally {
      setSyncingOrders(false);
    }
  };

  // Handle Customer Sign-In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const email = loginEmail.trim();
    if (!email) {
      setAuthError('Please enter your email address.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.customerLogin(email, isPasswordless ? undefined : loginPassword);
      if (res.success && res.profile) {
        login({
          email: res.profile.email || email,
          first_name: res.profile.first_name || 'Ayurvedic',
          last_name: res.profile.last_name || 'Customer',
          phone: res.profile.phone || '',
          dosha: res.profile.dosha || 'Tridoshic',
          member_since: res.profile.member_since,
          wellness_goal: res.profile.wellness_goal,
        });

        // If billing address returned from backend, save it
        if (res.billing && res.billing.address_1 && savedAddresses.length === 0) {
          addAddress({
            title: 'Home Address',
            first_name: res.billing.first_name || res.profile.first_name,
            last_name: res.billing.last_name || res.profile.last_name,
            email: res.billing.email || email,
            phone: res.billing.phone || res.profile.phone,
            address_1: res.billing.address_1,
            city: res.billing.city || '',
            state: res.billing.state || '',
            postcode: res.billing.postcode || '',
            country: 'India',
            is_default: true,
          });
        }

        // If customer orders returned directly from login, populate immediately (0ms wait)
        if (res.orders && Array.isArray(res.orders) && res.orders.length > 0) {
          setOrders(res.orders);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify your details or use instant email sign-in.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Customer Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const email = regEmail.trim();
    if (!email) {
      setAuthError('Please enter your email address.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.customerRegister({
        email,
        password: regPassword.trim() || undefined,
        first_name: regFirstName.trim() || 'Ayurvedic',
        last_name: regLastName.trim() || 'Customer',
        phone: regPhone.trim(),
        dosha: regDosha,
      });

      if (res.success && res.profile) {
        login({
          email: res.profile.email || email,
          first_name: res.profile.first_name,
          last_name: res.profile.last_name,
          phone: res.profile.phone,
          dosha: res.profile.dosha,
          member_since: res.profile.member_since,
        });
        setAuthSuccess('Welcome to Mediherbz! Your Ayurvedic account is active.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration could not be completed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Quick Order Track
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNumber.trim()) {
      setAuthError('Please enter your Order Number.');
      return;
    }
    navigate(`/track-order?order=${encodeURIComponent(trackOrderNumber.trim())}`);
  };

  // Save new address
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.address_1 || !newAddr.city || !newAddr.postcode) {
      alert('Please fill in street address, city, and postal code.');
      return;
    }

    const saved = addAddress({
      ...newAddr,
      first_name: newAddr.first_name || profile?.first_name || '',
      last_name: newAddr.last_name || profile?.last_name || '',
      email: newAddr.email || profile?.email || '',
      phone: newAddr.phone || profile?.phone || '',
    });

    if (profile?.email) {
      api.saveCustomerAddress({
        email: profile.email,
        first_name: saved.first_name,
        last_name: saved.last_name,
        phone: saved.phone,
        address_1: saved.address_1,
        city: saved.city,
        state: saved.state,
        postcode: saved.postcode,
      });
    }

    setShowAddAddress(false);
    setNewAddr({
      title: 'Home',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_1: '',
      city: '',
      state: '',
      postcode: '',
      country: 'India',
      is_default: false,
    });
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    updateProfile({
      first_name: editFirstName,
      last_name: editLastName,
      phone: editPhone,
      dosha: editDosha,
      wellness_goal: editGoal,
    });

    if (profile?.email) {
      await api.updateCustomerProfile({
        email: profile.email,
        first_name: editFirstName,
        last_name: editLastName,
        phone: editPhone,
        dosha: editDosha,
      });
    }

    setProfileSaving(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  // Re-order items
  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      addItem(
        {
          id: item.product_id || item.id,
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
          rating: 5.0,
          rating_count: 50,
          in_stock: true,
          stock_quantity: 50,
          sku: `MED-${item.product_id || item.id}`,
          type: 'simple',
          herbal_fields: {
            botanical_name: 'Pure Classical Formulation',
            ingredients: ['Pure Herbal Extracts'],
            directions_for_use: 'Use as directed on label.',
          },
          featured: false,
          bestseller: false,
          new_arrival: false,
        },
        undefined,
        item.quantity
      );
    });
    navigate('/cart');
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'processing') return o.status === 'processing' || o.status === 'pending' || o.status === 'on-hold';
    if (orderFilter === 'completed') return o.status === 'completed';
    if (orderFilter === 'cancelled') return o.status === 'cancelled' || o.status === 'refunded' || o.status === 'failed';
    return true;
  });

  // =========================================================================
  // GUEST / AUTHENTICATION SCREEN
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-16">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-md space-y-6">
          {/* Header Icon & Brand Title */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-50 text-[#18833B] border border-emerald-200/60 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold text-[#18833B] uppercase tracking-widest block">
              Ayurvedic Sanctuary
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              Sign in with your email or credentials to access your live orders, delivery addresses, and personal wellness profile.
            </p>
          </div>

          {/* Auth Tab Switcher */}
          <div className="flex bg-stone-100/80 p-1 rounded-2xl gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'signin'
                  ? 'bg-white text-[#18833B] shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-white text-[#18833B] shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('track');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'track'
                  ? 'bg-white text-[#18833B] shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </button>
          </div>

          {/* Error & Success Alerts */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-[#18833B] shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{authSuccess}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 1: SIGN IN FORM                        */}
          {/* ========================================== */}
          {authMode === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Email Address or Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. ananya@example.com or 9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B] bg-stone-50/50"
                  />
                </div>
              </div>

              {!isPasswordless && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsPasswordless(true)}
                      className="text-[11px] text-[#18833B] hover:underline font-bold cursor-pointer"
                    >
                      Instant sign-in without password →
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B] bg-stone-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isPasswordless && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-900 leading-relaxed flex items-center justify-between">
                  <span>Instant sign-in: Enter your email to automatically view your orders.</span>
                  <button
                    type="button"
                    onClick={() => setIsPasswordless(false)}
                    className="text-[#18833B] font-bold underline shrink-0 ml-2 cursor-pointer"
                  >
                    Use Password
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Sanctuary</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================== */}
          {/* TAB 2: CREATE ACCOUNT FORM                */}
          {/* ========================================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Ananya"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Sharma"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Mobile Phone (for delivery SMS &amp; WhatsApp)</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Create Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose a secure password (min 6 characters)"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">Your Primary Ayurvedic Energy (Dosha)</label>
                <select
                  value={regDosha}
                  onChange={(e) => setRegDosha(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="Tridoshic">Tridoshic (Balanced All Three Energies)</option>
                  <option value="Vata">Vata (Air &amp; Ether - Nourishing &amp; Grounding)</option>
                  <option value="Pitta">Pitta (Fire &amp; Water - Cooling &amp; Soothing)</option>
                  <option value="Kapha">Kapha (Earth &amp; Water - Clarifying &amp; Energizing)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#A6C928]" />
                    <span>Create My Ayurvedic Profile</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================== */}
          {/* TAB 3: QUICK ORDER TRACKER                */}
          {/* ========================================== */}
          {authMode === 'track' && (
            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Order Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trackOrderNumber}
                  onChange={(e) => setTrackOrderNumber(e.target.value)}
                  placeholder="e.g. MED-10482 or 58"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Email or Phone Number (optional)
                </label>
                <input
                  type="text"
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  placeholder="The email used during checkout"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-xs sm:text-sm bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track Live Delivery</span>
              </button>
            </form>
          )}

          {/* Privacy & Guarantee Footer */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-[11px] text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#18833B]" /> 256-Bit SSL Encrypted
            </span>
            <span>&bull;</span>
            <span>100% Pure AYUSH Formulations</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED-IN CUSTOMER DASHBOARD
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#122A1E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/30 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Top Profile Banner with Dynamic Data */}
      <div className="bg-gradient-to-r from-[#18833B] to-[#12632F] text-white p-5 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-[#A6C928] flex items-center justify-center text-white shrink-0 font-serif font-black text-2xl shadow-inner">
            {profile?.first_name?.charAt(0) || 'M'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-serif truncate">
                Namaste, {profile?.first_name} {profile?.last_name}
              </h1>
              {profile?.dosha && (
                <span className="bg-[#A6C928] text-[#12632F] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
                  {profile.dosha} Balance
                </span>
              )}
            </div>
            <p className="text-xs text-white/80 mt-1 truncate flex flex-wrap items-center gap-2">
              <span>{profile?.email}</span>
              {profile?.phone && <span className="hidden sm:inline">&bull; +91 {profile.phone}</span>}
              <span className="hidden md:inline">&bull; Member Since {profile?.member_since || '2026'}</span>
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/15 relative z-10">
          <button
            onClick={handleSyncOrders}
            disabled={syncingOrders}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 cursor-pointer disabled:opacity-50"
            title="Sync fresh orders from WooCommerce"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingOrders ? 'animate-spin text-[#A6C928]' : ''}`} />
            <span>{syncingOrders ? 'Syncing...' : 'Sync Orders'}</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-red-500/30 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-1 sm:gap-6 overflow-x-auto scrollbar-none pb-1 text-xs sm:text-sm w-full">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 px-2 sm:px-0 ${
            activeTab === 'orders'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
          <span className="text-[10px] sm:text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-bold">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-1.5 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 px-2 sm:px-0 ${
            activeTab === 'addresses'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
          <span className="text-[10px] sm:text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-bold">
            {savedAddresses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-1.5 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 px-2 sm:px-0 ${
            activeTab === 'wishlist'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist</span>
          <span className="text-[10px] sm:text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-bold">
            {wishlistItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 pb-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 px-2 sm:px-0 ${
            activeTab === 'profile'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Dosha</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DYNAMIC LIVE ORDERS                                            */}
      {/* ===================================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Status Filters */}
          {orders.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { label: 'All Orders', value: 'all', count: orders.length },
                {
                  label: 'To Fulfill',
                  value: 'processing',
                  count: orders.filter((o) => o.status === 'processing' || o.status === 'pending' || o.status === 'on-hold').length,
                },
                {
                  label: 'Delivered',
                  value: 'completed',
                  count: orders.filter((o) => o.status === 'completed').length,
                },
                {
                  label: 'Cancelled',
                  value: 'cancelled',
                  count: orders.filter((o) => o.status === 'cancelled' || o.status === 'refunded' || o.status === 'failed').length,
                },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setOrderFilter(tab.value as any)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    orderFilter === tab.value
                      ? 'bg-[#18833B] text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      orderFilter === tab.value ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Orders List */}
          {syncingOrders && orders.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs animate-pulse space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="space-y-1.5">
                      <div className="h-3 w-20 bg-stone-200 rounded" />
                      <div className="h-5 w-28 bg-emerald-100/70 rounded-md" />
                    </div>
                    <div className="h-6 w-24 bg-stone-200 rounded-full" />
                  </div>
                  <div className="flex items-center gap-4 py-2">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 bg-stone-200 rounded" />
                      <div className="h-3 w-24 bg-stone-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-8 sm:p-14 rounded-3xl border border-stone-200/80 text-center space-y-4">
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-stone-800 font-serif">
                {orders.length === 0 ? 'No orders yet' : 'No orders in this category'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                {orders.length === 0
                  ? 'Your order history will automatically appear here once you place an order. Discover our cold-pressed herbal oils and supplements.'
                  : 'Try selecting "All Orders" above to view your full history.'}
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Browse Herbal Shop</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const isDelivered = o.status === 'completed';
              const isCancelled = o.status === 'cancelled' || o.status === 'refunded' || o.status === 'failed';

              return (
                <div
                  key={o.id || o.order_number}
                  className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4 hover:border-emerald-200/70 transition-all"
                >
                  {/* Top Order Metadata Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-stone-100 gap-2.5">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                          Order Number
                        </span>
                        <span className="font-mono font-black text-xs sm:text-sm text-[#18833B]">
                          {o.order_number}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-100 text-[#18833B]'
                            : isCancelled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isDelivered && <CheckCircle2 className="w-3 h-3 text-[#18833B]" />}
                        {isCancelled && <XCircle className="w-3 h-3 text-red-600" />}
                        {!isDelivered && !isCancelled && <Clock className="w-3 h-3 text-amber-700 animate-pulse" />}
                        <span>{o.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 block sm:hidden">Date</span>
                        <span className="text-stone-600 font-medium text-xs">{o.date_created}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block sm:hidden">Amount</span>
                        <span className="font-black text-sm sm:text-base text-stone-900">₹{o.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Tracking Pill (if available) */}
                  {o.tracking_id && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50/70 border border-emerald-200/70 p-3 rounded-2xl gap-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900">
                        <Truck className="w-4 h-4 text-[#18833B] shrink-0" />
                        <span>
                          Shipped via <strong>{o.shipping_carrier || 'Express Air'}</strong> &bull; Tracking ID:{' '}
                          <strong className="font-mono">{o.tracking_id}</strong>
                        </span>
                      </div>
                      <Link
                        to={`/track-order?order=${encodeURIComponent(o.order_number)}`}
                        className="inline-flex items-center gap-1 font-bold text-[#18833B] hover:underline"
                      >
                        <span>Live Status</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Items Ordered List */}
                  <div className="space-y-3">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl bg-stone-50 border border-stone-200/80 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                              🌿
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-1">
                              {it.name}
                            </p>
                            <p className="text-stone-500 text-[11px] mt-0.5">
                              Qty: <strong>{it.quantity}</strong> &bull; {o.payment_method_title}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-stone-900 shrink-0 text-sm">₹{it.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions: Track, Reorder, WhatsApp Care */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <a
                      href={`https://wa.me/919876543210?text=${encodeURIComponent(
                        `Hi Mediherbz Care, I need assistance regarding my Order #${o.order_number}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-stone-500 hover:text-emerald-700 font-semibold py-2 px-2.5 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Order Help</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/track-order?order=${encodeURIComponent(o.order_number)}`}
                        className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#18833B]" />
                        <span>Track</span>
                      </Link>
                      <button
                        onClick={() => handleReorder(o)}
                        className="py-2.5 px-4 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Re-Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SAVED DELIVERY ADDRESSES                                       */}
      {/* ===================================================================== */}
      {activeTab === 'addresses' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#26352A]">Your Delivery Locations</h3>
              <p className="text-xs text-stone-500">Manage shipping addresses for swift 1-click checkout</p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form
              onSubmit={handleSaveNewAddress}
              className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4 animate-fadeIn"
            >
              <h4 className="font-bold text-sm text-[#26352A]">Add New Shipping Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Address Label</label>
                  <input
                    type="text"
                    value={newAddr.title}
                    onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                    placeholder="e.g. Home, Office"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={newAddr.first_name}
                    onChange={(e) => setNewAddr({ ...newAddr, first_name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newAddr.email}
                    onChange={(e) => setNewAddr({ ...newAddr, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-[11px] font-bold text-stone-600 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.address_1}
                  onChange={(e) => setNewAddr({ ...newAddr, address_1: e.target.value })}
                  placeholder="Flat / House / Street Name / Landmark"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={newAddr.postcode}
                    onChange={(e) => setNewAddr({ ...newAddr, postcode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  Save Delivery Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Saved Addresses Cards */}
          {savedAddresses.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 text-center space-y-3">
              <MapPin className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="font-bold text-stone-800 text-sm">No Saved Addresses</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Add an address to speed up your checkout process next time you order.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white p-5 rounded-3xl border shadow-xs space-y-3 relative transition-all ${
                    addr.is_default ? 'border-[#18833B] ring-1 ring-[#18833B]/20' : 'border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#26352A]">{addr.title || 'Address'}</span>
                      {addr.is_default && (
                        <span className="bg-emerald-100 text-[#18833B] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Default Delivery
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-stone-300 hover:text-red-500 p-1.5 cursor-pointer transition-colors rounded-lg hover:bg-red-50"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
                    <p className="font-bold text-stone-900">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p>{addr.address_1}</p>
                    <p>
                      {addr.city}, {addr.state} - {addr.postcode}
                    </p>
                    {addr.phone && <p className="text-stone-400 text-[11px]">Phone: +91 {addr.phone}</p>}
                  </div>

                  {!addr.is_default && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs font-bold text-[#18833B] hover:underline cursor-pointer pt-1 block"
                    >
                      Set as Default Delivery Address &rarr;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: WISHLIST                                                       */}
      {/* ===================================================================== */}
      {activeTab === 'wishlist' && (
        <div className="space-y-5">
          {/* Wishlist Header & Sync Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#26352A]">Saved Herbal Formulations</h3>
                <span className="bg-emerald-100 text-[#18833B] text-[10px] font-black px-2 py-0.5 rounded-full">
                  {wishlistItems.length}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CloudCheck className="w-3 h-3 text-[#18833B]" /> Cloud Synced
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Automatically synchronized with your WooCommerce customer account across all devices
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const moved = moveAllWishlistToCart();
                    if (moved > 0) {
                      setToastMessage(`Moved ${moved} in-stock item${moved > 1 ? 's' : ''} to your cart!`);
                      setTimeout(() => setToastMessage(null), 3500);
                    }
                  }}
                  className="px-3.5 py-2 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move All In-Stock to Cart</span>
                </button>
              </div>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white p-10 sm:p-14 rounded-3xl border border-stone-200/80 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-stone-800 font-serif">Your Wishlist is Empty</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                Save your favorite botanical extracts and herbal supplements while browsing to view them here later.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Explore Pure Formulations</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.map((prod) => {
                const inStock = prod.in_stock !== false;
                return (
                  <div
                    key={prod.id}
                    className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-200/80 transition-all"
                  >
                    <div className="flex gap-3">
                      <Link to={`/product/${prod.slug}`} className="shrink-0">
                        <img
                          src={prod.images && prod.images.length > 0 ? prod.images[0].src : '/placeholder.jpg'}
                          alt={prod.name}
                          className="w-20 h-20 object-cover rounded-2xl bg-stone-50 border border-stone-100"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${
                            inStock ? 'bg-emerald-100 text-[#18833B]' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <Link to={`/product/${prod.slug}`}>
                          <h4 className="font-bold text-xs sm:text-sm text-[#26352A] hover:text-[#18833B] transition-colors line-clamp-1">
                            {prod.name}
                          </h4>
                        </Link>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-sm font-black text-[#18833B]">₹{prod.price}</span>
                          {prod.regular_price > prod.price && (
                            <span className="text-[10px] text-stone-400 line-through">₹{prod.regular_price}</span>
                          )}
                        </div>
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
                          if (!inStock) return;
                          addItem(prod);
                          removeWishlist(prod.id);
                          setToastMessage(`Added "${prod.name}" to cart.`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        disabled={!inStock}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs ${
                          inStock
                            ? 'bg-[#18833B] hover:bg-[#12632F] text-white cursor-pointer'
                            : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{inStock ? 'Move to Cart' : 'Out of Stock'}</span>
                      </button>
                      <button
                        onClick={() => removeWishlist(prod.id)}
                        className="p-2.5 text-stone-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PROFILE & AYURVEDIC DOSHA                                      */}
      {/* ===================================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-black text-lg text-[#26352A] font-serif">Ayurvedic Profile &amp; Preferences</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Updates your profile across WooCommerce and personalizes formulation suggestions
            </p>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-[#18833B] shrink-0" />
              <span className="font-bold">Your profile and wellness preferences have been updated!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-700 font-bold block mb-1">First Name</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>
              <div>
                <label className="text-stone-700 font-bold block mb-1">Last Name</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-700 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-100 text-stone-500 cursor-not-allowed"
                  title="Email cannot be changed directly"
                />
              </div>
              <div>
                <label className="text-stone-700 font-bold block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <label className="text-stone-700 font-bold block mb-1">Dominant Ayurvedic Energy (Dosha)</label>
              <select
                value={editDosha}
                onChange={(e) => setEditDosha(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-white text-xs sm:text-sm font-medium"
              >
                <option value="Tridoshic">Tridoshic (Balanced All Three Energies)</option>
                <option value="Vata">Vata (Air &amp; Ether - Nourishment &amp; Grounding)</option>
                <option value="Pitta">Pitta (Fire &amp; Water - Cooling &amp; Soothing)</option>
                <option value="Kapha">Kapha (Earth &amp; Water - Clarifying &amp; Energizing)</option>
              </select>
            </div>

            <div>
              <label className="text-stone-700 font-bold block mb-1">Primary Wellness Goal</label>
              <input
                type="text"
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                placeholder="e.g. Hair Regrowth, Radiant Skin, Natural Digestion, Deep Sleep"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl bg-stone-50/50 focus:outline-hidden focus:border-[#18833B]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-98 flex items-center gap-2"
              >
                {profileSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
