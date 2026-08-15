import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ShoppingBag, MapPin, Truck, Store, Plus, Minus, Trash2, CheckCircle, CreditCard, Banknote, ShieldAlert, Search, Layers, RefreshCw, Clock, Building2, AlertCircle, Sparkles } from 'lucide-react';

export default function CustomerOrdering() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [orderType, setOrderType] = useState('DELIVERY'); // 'PICKUP' | 'DELIVERY'
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [newAddr, setNewAddr] = useState({ label: 'Home', houseNumber: '', street: '', areaId: '', isDefault: true });

  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);

    // 1. Fetch Branches independently (Public Endpoint)
    try {
      let branchRes = await axiosClient.get('/branches?onlyActive=true');
      let branchList = branchRes?.data || [];

      // Fallback: If no active branches, load all branches
      if (branchList.length === 0) {
        branchRes = await axiosClient.get('/branches?onlyActive=false');
        branchList = branchRes?.data || [];
      }

      if (branchList.length > 0) {
        setBranches(branchList);
        const initialBranchId = branchList[0].branchId;
        setSelectedBranchId(initialBranchId);
        setSelectedCategory('ALL');
        await loadBranchMenuAndAreas(initialBranchId);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    }

    // 2. Fetch Customer Addresses independently (Authenticated Endpoint)
    try {
      const addrRes = await axiosClient.get('/customer/addresses');
      if (addrRes?.success && addrRes?.data) {
        setAddresses(addrRes.data);
        if (addrRes.data.length > 0) {
          setSelectedAddressId(addrRes.data[0].addressId);
        }
      }
    } catch (err) {
      console.log('Customer addresses not loaded:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branchId) => {
    if (selectedBranchId === branchId) return;

    if (cart.length > 0) {
      const confirmChange = window.confirm('Changing the restaurant branch will clear your current cart. Do you want to proceed?');
      if (!confirmChange) return;
      setCart([]);
    }

    setSelectedBranchId(branchId);
    setSelectedCategory('ALL');
    loadBranchMenuAndAreas(branchId);
  };

  const loadBranchMenuAndAreas = async (branchId) => {
    try {
      const [menuRes, areaRes, catRes] = await Promise.allSettled([
        axiosClient.get(`/branches/${branchId}/menu-items?onlyActive=false`),
        axiosClient.get(`/branches/${branchId}/delivery-areas?onlyActive=true`),
        axiosClient.get(`/branches/${branchId}/categories?onlyActive=true`),
      ]);

      if (menuRes.status === 'fulfilled' && menuRes.value?.data) {
        // Accept all active items from the branch
        const rawItems = menuRes.value.data || [];
        setMenuItems(rawItems);
      }
      if (areaRes.status === 'fulfilled' && areaRes.value?.data) {
        setDeliveryAreas(areaRes.value.data || []);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        setCategories(catRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading branch menu & areas:', err);
    }
  };

  const handleAddToCart = (item, variation = null) => {
    const unitPrice = variation ? Number(item.basePrice) + Number(variation.additionalPrice) : Number(item.basePrice);
    const cartKey = `${item.itemId}-${variation ? variation.variationId : 'none'}`;

    const existingIndex = cart.findIndex((c) => c.cartKey === cartKey);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          cartKey,
          itemId: item.itemId,
          itemName: item.foodName,
          variationId: variation ? variation.variationId : null,
          variationName: variation ? variation.variationName : null,
          unitPrice,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/customer/addresses', newAddr);
      if (res.success) {
        setShowAddressModal(false);
        setNewAddr({ label: 'Home', houseNumber: '', street: '', areaId: '', isDefault: true });
        const addrRes = await axiosClient.get('/customer/addresses');
        if (addrRes?.success && addrRes?.data) {
          setAddresses(addrRes.data);
          setSelectedAddressId(res.data.addressId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Please log in as Customer to save addresses.');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const getSelectedDeliveryFee = () => {
    if (orderType === 'PICKUP') return 0;
    const currentAddr = addresses.find((a) => a.addressId === Number(selectedAddressId));
    return currentAddr ? Number(currentAddr.deliveryFee) : 0;
  };

  const handlePlaceOrder = async () => {
    if (!selectedBranchId) {
      alert('Please select a restaurant branch.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (orderType === 'DELIVERY' && !selectedAddressId) {
      alert('Please select or add a delivery address.');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        branchId: Number(selectedBranchId),
        orderType,
        paymentMethod,
        deliveryAddressId: orderType === 'DELIVERY' ? Number(selectedAddressId) : null,
        items: cart.map((c) => ({
          itemId: c.itemId,
          variationId: c.variationId,
          quantity: c.quantity,
        })),
      };

      const res = await axiosClient.post('/customer/orders', payload);
      if (res.success) {
        alert(`Order Placed Successfully! Reference: ${res.data.orderNumber}`);
        navigate('/my-orders');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order. Please ensure you are signed in as a Customer.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.categoryId === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const selectedBranch = branches.find((b) => b.branchId === selectedBranchId);
  const subtotal = calculateSubtotal();
  const deliveryFee = getSelectedDeliveryFee();
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Order Type Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase mb-1 inline-block">
              Member 3 – Customer Ordering Portal
            </span>
            <h1 className="text-2xl font-black text-stone-900">Browse Menu & Place Order</h1>
            <p className="text-xs text-stone-500">Pick your restaurant branch, choose pickup or delivery, and order your favorite dishes.</p>
          </div>

          {/* Pickup vs Delivery Toggle */}
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setOrderType('DELIVERY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                orderType === 'DELIVERY'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Truck className="w-4 h-4" /> Delivery Order
            </button>
            <button
              onClick={() => setOrderType('PICKUP')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                orderType === 'PICKUP'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Store className="w-4 h-4" /> Self-Pickup
            </button>
          </div>
        </div>

        {/* 🏢 INTERACTIVE BRANCH SELECTOR (Cards) */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-600" />
              Select Restaurant Branch:
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-stone-500">
                {branches.length} Branches Available
              </span>
              <button
                onClick={loadInitialData}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                title="Refresh branches from DB"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clickable Branch Cards */}
          {branches.length === 0 ? (
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-500">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              No branches found in database. Make sure backend is running.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {branches.map((b) => {
                const isSelected = selectedBranchId === b.branchId;
                return (
                  <div
                    key={b.branchId}
                    onClick={() => handleSelectBranch(b.branchId)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/50 shadow-md shadow-orange-600/10 ring-2 ring-orange-500/20'
                        : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">{b.branchName}</h4>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-orange-600 flex-shrink-0" />
                          {b.streetAddress}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="p-1 bg-orange-600 text-white rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" /> {b.openingTime} - {b.closingTime}
                      </span>
                      <span className="font-semibold text-emerald-600">{b.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Address Row (If Delivery Mode) */}
          {orderType === 'DELIVERY' && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  Your Delivery Address:
                </label>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                >
                  + Add New Address
                </button>
              </div>
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {addresses.length === 0 ? (
                  <option value="">No addresses saved. Click "+ Add New Address" above</option>
                ) : (
                  addresses.map((a) => (
                    <option key={a.addressId} value={a.addressId}>
                      {a.label}: {a.houseNumber}, {a.street} ({a.areaName} - Delivery Fee: LKR {Number(a.deliveryFee).toFixed(2)})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => setSelectedCategory(c.categoryId)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === c.categoryId
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c.categoryName}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pizza, burgers, drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Main Content: Food Menu & Cart (8 + 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Menu Items Grid (8 Cols) */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="py-20 text-center text-stone-400">Loading meals from database...</div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              <p className="font-bold text-stone-700 mb-1">No food items found.</p>
              <p className="text-xs text-stone-500">
                {selectedCategory !== 'ALL'
                  ? 'No items found in this category. Click "All Items" to view all available dishes.'
                  : `No menu items registered under ${selectedBranch?.branchName || 'this branch'}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isItemAvailable = item.isAvailable !== false && item.available !== false;
                return (
                  <div
                    key={item.itemId}
                    className={`bg-white border rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      isItemAvailable ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="relative h-40 rounded-2xl overflow-hidden mb-3 bg-stone-100">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                          alt={item.foodName}
                          className={`w-full h-full object-cover ${!isItemAvailable ? 'grayscale' : ''}`}
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                            {item.categoryName}
                          </span>
                        </div>
                        {!isItemAvailable && (
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-bold text-stone-900 text-sm">{item.foodName}</h3>
                        <span className="font-extrabold text-orange-600 text-xs whitespace-nowrap">
                          LKR {Number(item.basePrice).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mb-3">{item.description}</p>
                    </div>

                    {/* Add to Cart Actions (Base or Variations) */}
                    <div className="pt-2 border-t border-stone-100">
                      {!isItemAvailable ? (
                        <button
                          disabled
                          className="w-full py-2 bg-stone-200 text-stone-400 font-bold rounded-xl text-xs cursor-not-allowed"
                        >
                          Temporarily Unavailable
                        </button>
                      ) : item.variations && item.variations.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-stone-500 uppercase block">Choose Portion / Size:</span>
                          <div className="grid grid-cols-1 gap-1">
                            {item.variations.map((v) => (
                              <button
                                key={v.variationId}
                                onClick={() => handleAddToCart(item, v)}
                                className="w-full px-2.5 py-1.5 bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-300 rounded-xl text-left text-[11px] font-bold text-stone-800 flex items-center justify-between transition-all"
                              >
                                <span>{v.variationName}</span>
                                <span className="text-orange-600">
                                  LKR {(Number(item.basePrice) + Number(v.additionalPrice)).toFixed(2)} +
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full py-2 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Cart Sidebar (4 Cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-stone-900 text-base">Your Cart</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800">
                {cart.length} items
              </span>
            </div>

            {cart.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">Your shopping cart is empty.</p>
            ) : (
              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                {cart.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-2xl text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-stone-900 line-clamp-1">{c.itemName}</p>
                      {c.variationName && (
                        <span className="text-[10px] text-stone-500 block">({c.variationName})</span>
                      )}
                      <span className="font-semibold text-orange-600">LKR {(c.unitPrice * c.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs px-1">{c.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-5 h-5 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="mb-4 pt-4 border-t border-stone-100">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-orange-500 bg-orange-50 text-orange-800'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" /> Cash / COD
                </button>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-4 border-t border-stone-100 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-stone-900">
                  {orderType === 'DELIVERY' ? `LKR ${deliveryFee.toFixed(2)}` : 'FREE (Pickup)'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Bill</span>
                <span className="text-orange-600">LKR {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || placingOrder || !selectedBranchId}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-orange-600/20 text-xs transition-all flex items-center justify-center gap-2"
            >
              {placingOrder ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Delivery Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-3">Add Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Label (e.g. Home, Office)</label>
                <input
                  type="text"
                  required
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Delivery Zone</label>
                <select
                  required
                  value={newAddr.areaId}
                  onChange={(e) => setNewAddr({ ...newAddr, areaId: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Choose Zone --</option>
                  {deliveryAreas.map((a) => (
                    <option key={a.areaId} value={a.areaId}>
                      {a.areaName} (LKR {Number(a.deliveryFee).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">House Number / Building</label>
                <input
                  type="text"
                  required
                  value={newAddr.houseNumber}
                  onChange={(e) => setNewAddr({ ...newAddr, houseNumber: e.target.value })}
                  placeholder="No. 42/A"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="Galle Road, Kollupitiya"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
