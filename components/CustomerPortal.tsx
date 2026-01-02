
import React, { useState } from 'react';
import { Order, OrderStatus, Product, Courier } from '../types';
import { Search, PlusCircle, ArrowRight, ShoppingCart, X, Trash2, CheckCircle, Package, Truck, Home, History, Calendar, ExternalLink, Sparkles, Zap, RotateCcw } from 'lucide-react';
import Marketplace from './Marketplace';
import Logo from './Logo';
import { getAIEtaPrediction } from '../services/geminiService';
import { MARKETPLACE_PRODUCTS } from '../constants';

interface Props {
  orders: Order[];
  couriers: Courier[];
  onCreateOrder: (order: Partial<Order>) => void;
  onPlaceFoodOrder: (items: Product[]) => void;
}

const CustomerPortal: React.FC<Props> = ({ orders, couriers, onCreateOrder, onPlaceFoodOrder }) => {
  const [view, setView] = useState<'tracking' | 'marketplace' | 'history'>('tracking');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [aiEtas, setAiEtas] = useState<Record<string, { prediction: string; context: string; loading: boolean }>>({});
  
  const [formData, setFormData] = useState({
    pickup: '',
    delivery: '',
    state: 'ABUJA',
    weight: 'Under 5kg',
    priority: 'medium'
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const getStatusProgress = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 10;
      case OrderStatus.ASSIGNED: return 25;
      case OrderStatus.ARRIVED_PICKUP: return 45;
      case OrderStatus.IN_TRANSIT: return 70;
      case OrderStatus.ARRIVED_DELIVERY: return 90;
      case OrderStatus.DELIVERED: return 100;
      case OrderStatus.CANCELLED: return 0;
      default: return 0;
    }
  };

  const handlePredictEta = async (order: Order) => {
    setAiEtas(prev => ({ ...prev, [order.id]: { prediction: '', context: '', loading: true } }));
    const courier = couriers.find(c => c.id === order.courierId);
    const result = await getAIEtaPrediction(order, courier);
    setAiEtas(prev => ({ ...prev, [order.id]: { ...result, loading: false } }));
  };

  const handleQuickReorder = (order: Order) => {
    if (order.orderType === 'food' && order.items) {
      // Find marketplace products matching the names stored in the order history
      const matchedProducts = MARKETPLACE_PRODUCTS.filter(p => order.items?.includes(p.name));
      if (matchedProducts.length > 0) {
        setCart(prev => [...prev, ...matchedProducts]);
        setIsCartOpen(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateOrder({
      pickupAddress: `${formData.pickup}, ${formData.state}`,
      deliveryAddress: `${formData.delivery}, ${formData.state}`,
      weight: formData.weight,
      priority: formData.priority as any,
    });
    setIsFormOpen(false);
  };

  const handleCheckout = () => {
    onPlaceFoodOrder(cart);
    setCart([]);
    setIsCartOpen(false);
    setView('tracking');
  };

  const activeOrders = orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);
  const pastOrders = orders.filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED);

  return (
    <div className="flex-1 overflow-auto bg-[#020617] p-4 md:p-8 space-y-6 no-scrollbar pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Logo className="h-7 md:h-10" />
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'tracking', label: 'LIVE', icon: Package },
              { id: 'marketplace', label: 'MARKET', icon: ShoppingCart },
              { id: 'history', label: 'HISTORY', icon: History }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black italic transition-all ${
                  view === tab.id 
                    ? 'brand-gradient-blue text-white shadow-lg' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <button onClick={() => setIsFormOpen(true)} className="brand-gradient-orange p-3 rounded-2xl text-white shadow-lg hover:scale-110 active:scale-95 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {view === 'marketplace' ? (
        <Marketplace 
          onAddToCart={(p) => setCart([...cart, p])} 
          cartCount={cart.length} 
          onOpenCart={() => setIsCartOpen(true)} 
        />
      ) : view === 'history' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">MISSION ARCHIVE</h2>
            <span className="text-[10px] font-bold text-slate-600 italic">{pastOrders.length} ORDERS TOTAL</span>
          </div>

          <div className="grid gap-4">
            {pastOrders.map(order => (
              <div key={order.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 hover:bg-white/[0.04] transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${order.status === OrderStatus.DELIVERED ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <CheckCircle className={`w-4 h-4 ${order.status === OrderStatus.DELIVERED ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white italic">{order.id}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full italic uppercase ${
                      order.status === OrderStatus.DELIVERED ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status}
                    </span>
                    {order.orderType === 'food' && (
                       <span className="text-[7px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black italic uppercase">
                        Food Order
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold italic bg-black/20 p-3 rounded-2xl border border-white/5">
                  <div className="truncate flex-1">{order.pickupAddress.split(',')[0]}</div>
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <div className="truncate flex-1">{order.deliveryAddress.split(',')[0]}</div>
                </div>

                <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 italic uppercase flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Details
                  </button>
                  
                  {order.orderType === 'food' && order.items && order.items.length > 0 && (
                    <button 
                      onClick={() => handleQuickReorder(order)}
                      className="brand-gradient-orange text-white px-4 py-2 rounded-xl text-[10px] font-black italic uppercase flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Quick Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
            {pastOrders.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                  <History className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-500 font-black italic text-xs uppercase tracking-widest">No dispatch history yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="TRACK YOUR DISPATCH..." 
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 text-white font-black italic text-sm outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-500 px-1 uppercase tracking-widest italic">MY ACTIVE RIDERS</h2>
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 brand-gradient-blue opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white italic">{order.id}</span>
                      {order.orderType === 'food' && (
                        <span className="ml-2 text-[8px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-black italic uppercase">
                          Fast Food
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black italic uppercase text-blue-400 block">{order.status}</span>
                    <div className="flex items-center justify-end gap-1 group/eta cursor-pointer" onClick={() => handlePredictEta(order)}>
                      {aiEtas[order.id]?.loading ? (
                        <div className="w-8 h-2 bg-slate-800 rounded-full animate-pulse" />
                      ) : aiEtas[order.id] ? (
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] font-black text-cyan-400 italic animate-in slide-in-from-right-2">
                            {aiEtas[order.id].prediction}
                          </span>
                          <span className="text-[7px] font-bold text-slate-500 uppercase leading-none">
                            {aiEtas[order.id].context}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[8px] font-bold text-slate-500 uppercase group-hover/eta:text-blue-400 transition-colors">
                          {order.eta || 'Calculating...'}
                        </span>
                      )}
                      <Sparkles className={`w-2.5 h-2.5 ${aiEtas[order.id] ? 'text-cyan-400' : 'text-slate-600 group-hover/eta:text-blue-400 group-hover/eta:animate-spin'} transition-colors duration-500`} />
                    </div>
                  </div>
                </div>

                <div className="relative pt-2 pb-1">
                  <div className="flex mb-4 items-center justify-between text-[8px] font-black italic text-slate-500 uppercase tracking-tighter">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusProgress(order.status) >= 10 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                      <span>Booked</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusProgress(order.status) >= 45 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                      <span>Pickup</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusProgress(order.status) >= 70 ? 'bg-blue-500' : 'bg-slate-700'}`} />
                      <span>Transit</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusProgress(order.status) >= 100 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      <span>Home</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-slate-800">
                    <div 
                      style={{ width: `${getStatusProgress(order.status)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center brand-gradient-blue transition-all duration-1000 ease-out"
                    >
                      <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-300 italic font-bold relative z-10 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 truncate flex-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                    <span className="truncate">{order.pickupAddress.split(',')[0]}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                  <div className="flex items-center gap-2 truncate flex-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <span className="truncate">{order.deliveryAddress.split(',')[0]}</span>
                  </div>
                </div>

                {aiEtas[order.id] && !aiEtas[order.id].loading && (
                   <div className="flex items-center gap-2 mt-2 px-1 animate-in fade-in duration-1000">
                    <Zap className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                    <span className="text-[8px] font-black italic text-slate-500 uppercase tracking-widest">
                      AI OPTIMIZED: {aiEtas[order.id].context}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {activeOrders.length === 0 && (
              <div className="py-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                <p className="text-slate-500 font-black italic text-[10px] uppercase tracking-widest">No active deliveries</p>
                <button onClick={() => setView('marketplace')} className="mt-4 text-xs font-black text-blue-400 italic uppercase">Order Something?</button>
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 brand-gradient-orange opacity-0 group-hover:opacity-5 transition-opacity" />
            <p className="text-[10px] font-black text-slate-500 italic uppercase mb-2 tracking-[0.2em]">WALLET BALANCE</p>
            <p className="text-4xl font-black brand-text-orange italic">₦12,450.00</p>
            <button className="mt-4 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest italic">Top Up Balance</button>
          </div>
        </div>
      )}

      {/* Shopping Cart Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0f172a] shadow-2xl flex flex-col p-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white italic">MY <span className="brand-text-orange">ORDER</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-auto space-y-4 no-scrollbar">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group">
                  <img src={item.image} className="w-16 h-16 rounded-xl object-cover" alt={item.name} />
                  <div className="flex-1">
                    <h4 className="font-black text-white italic text-sm">{item.name}</h4>
                    <p className="text-[10px] font-bold text-amber-500 italic">₦{item.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-500 italic uppercase">Total (Incl. Dispatch)</span>
                <span className="text-3xl font-black text-white italic">₦{(cartTotal + 500).toLocaleString()}</span>
              </div>
              <button 
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-5 brand-gradient-orange text-white rounded-2xl font-black italic text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                CHECKOUT WITH WALLET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h2 className="text-3xl font-black text-white mb-8 italic">BOOK <span className="brand-text-blue">DISPATCH</span></h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Operation State</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black italic outline-none focus:border-blue-500 transition-colors appearance-none"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option value="ABUJA">ABUJA</option>
                  <option value="KADUNA">KADUNA</option>
                  <option value="KANO">KANO</option>
                </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Pickup Point</label>
                <input 
                  type="text" required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black italic outline-none focus:border-blue-500"
                  placeholder="e.g. Area 11 Mall"
                  value={formData.pickup}
                  onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Delivery Point</label>
                <input 
                  type="text" required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black italic outline-none focus:border-blue-500"
                  placeholder="e.g. Life Camp Extension"
                  value={formData.delivery}
                  onChange={(e) => setFormData({...formData, delivery: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 text-slate-500 font-black italic uppercase text-xs">CANCEL</button>
                <button type="submit" className="flex-1 py-4 brand-gradient-blue text-white rounded-2xl font-black italic shadow-lg hover:scale-[1.02] active:scale-95 transition-all">START DISPATCH</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
