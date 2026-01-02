
import React, { useState, useEffect } from 'react';
import { Order, Courier, OrderStatus } from '../types';
import { getLogisticsInsights } from '../services/geminiService';
import { Clock, Zap, Sparkles, UserCheck, Shield, MapPin, Signal, AlertCircle, TrendingUp, ChevronDown, Filter } from 'lucide-react';
import MapView from './MapView';
import Logo from './Logo';

interface Props {
  orders: Order[];
  couriers: Courier[];
  onAssignOrder: (orderId: string, courierId: string) => void;
}

const DispatcherDashboard: React.FC<Props> = ({ orders, couriers, onAssignOrder }) => {
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeHub, setActiveHub] = useState<'ALL' | 'ABUJA' | 'KADUNA' | 'KANO'>('ALL');
  const [fleetFilter, setFleetFilter] = useState<'ALL' | 'idle' | 'busy' | 'offline'>('ALL');
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);

  const fetchInsights = async () => {
    setLoadingAI(true);
    const result = await getLogisticsInsights(orders, couriers);
    setAiInsights(result);
    setLoadingAI(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const stats = [
    { label: 'Live Orders', value: orders.filter(o => o.status !== OrderStatus.DELIVERED).length, icon: Clock, color: 'text-blue-400' },
    { label: 'Available Now', value: couriers.filter(c => c.status === 'idle').length, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Active Fleet', value: couriers.filter(c => c.status !== 'offline').length, icon: Signal, color: 'text-cyan-400' },
  ];

  // Global hub filtering logic for both orders and couriers
  const hubFilteredOrders = orders.filter(o => 
    activeHub === 'ALL' ? true : o.id.includes(activeHub.substring(0, 3))
  );

  const hubFilteredCouriers = couriers.filter(c => 
    activeHub === 'ALL' ? true : c.hub === activeHub
  );

  // Apply secondary status filter for the sidebar list
  const finalCouriers = hubFilteredCouriers.filter(c => 
    fleetFilter === 'ALL' ? true : c.status === fleetFilter
  );

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-[#020617] no-scrollbar pb-20 md:pb-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative">
        <div className="flex items-center justify-between">
          <Logo className="h-6 md:h-8" />
          <button 
            onClick={fetchInsights} 
            disabled={loadingAI}
            className={`p-2 rounded-xl transition-all ml-4 ${loadingAI ? 'animate-spin text-slate-600' : 'text-blue-500 hover:bg-blue-500/10'}`}
          >
            <Sparkles className="w-5 h-5"/>
          </button>
        </div>
        
        {/* Hub Selection Dropdown */}
        <div className="relative z-[60]">
          <button 
            onClick={() => setIsHubDropdownOpen(!isHubDropdownOpen)}
            className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl text-[10px] font-black italic text-white transition-all hover:bg-slate-800"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="uppercase tracking-widest">{activeHub === 'ALL' ? 'ALL REGIONS' : `${activeHub} HUB`}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isHubDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isHubDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {['ALL', 'ABUJA', 'KADUNA', 'KANO'].map((hub) => (
                <button
                  key={hub}
                  onClick={() => {
                    setActiveHub(hub as any);
                    setIsHubDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black italic transition-colors flex items-center justify-between ${
                    activeHub === hub ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {hub === 'ALL' ? 'ALL REGIONS' : `${hub} HUB`}
                  {activeHub === hub && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* AI Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">AI STRATEGY INSIGHTS</h2>
          {loadingAI && <div className="h-1 w-12 brand-gradient-blue rounded-full animate-pulse" />}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingAI ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse flex flex-col p-4 space-y-3">
                <div className="h-4 w-2/3 bg-slate-800 rounded-lg" />
                <div className="h-3 w-full bg-slate-800 rounded-lg" />
                <div className="h-3 w-4/5 bg-slate-800 rounded-lg" />
              </div>
            ))
          ) : (
            aiInsights?.insights?.map((insight: any, index: number) => (
              <div 
                key={index} 
                className={`relative group bg-white/[0.03] border border-white/5 p-5 rounded-2xl overflow-hidden transition-all hover:border-blue-500/30 hover:bg-white/[0.05] ${index === 0 ? 'md:ring-1 md:ring-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]' : ''}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 brand-gradient-blue opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl" />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full italic uppercase ${
                    insight.impact === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    insight.impact === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700/20 text-slate-400'
                  }`}>
                    {insight.impact} impact
                  </span>
                  <Zap className={`w-3 h-3 ${insight.impact === 'high' ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} />
                </div>
                
                <h3 className="text-xs font-black text-white italic mb-2 relative z-10 group-hover:text-blue-400 transition-colors uppercase">
                  {insight.title}
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic relative z-10">
                  {insight.description}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Stats row */}
      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 overflow-x-auto no-scrollbar">
        {stats.map((stat, i) => (
          <div key={i} className="flex-shrink-0 w-32 md:w-auto bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center md:items-start gap-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-500 font-black italic uppercase">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-white italic">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[350px] md:h-[500px] relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Pass only couriers belonging to the active hub to MapView */}
            <MapView couriers={hubFilteredCouriers} orders={hubFilteredOrders} />
            <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black text-white italic uppercase tracking-tighter">Live GPS Feed</span>
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">MISSION <span className="brand-text-orange">QUEUE</span></h2>
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-slate-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase italic">Hub: {activeHub}</span>
              </div>
            </div>
            <div className="grid gap-3">
              {hubFilteredOrders.filter(o => o.status === OrderStatus.PENDING).map(order => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl brand-gradient-blue flex items-center justify-center font-black italic text-white text-lg">
                      {order.id.split('-')[1][0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white italic">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{order.pickupAddress.split(',')[0]} → {order.deliveryAddress.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      onChange={(e) => onAssignOrder(order.id, e.target.value)}
                      className="bg-slate-900 text-blue-400 text-[10px] font-black italic rounded-lg px-4 py-2 outline-none border border-white/10 focus:border-blue-500"
                    >
                      <option value="">DISPATCH RIDER</option>
                      {couriers.filter(c => c.status === 'idle' && (activeHub === 'ALL' || c.hub === activeHub)).map(c => (
                        <option key={c.id} value={c.id}>{c.name.toUpperCase()} ({c.vehicleType})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {hubFilteredOrders.filter(o => o.status === OrderStatus.PENDING).length === 0 && (
                <div className="text-center py-8 text-slate-600 font-black italic text-xs uppercase">No pending orders in this hub</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-500 italic uppercase">ACTIVE FLEET</h3>
              <div className="flex gap-1">
                {['ALL', 'idle', 'busy', 'offline'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFleetFilter(f as any)}
                    className={`px-2 py-0.5 rounded-md text-[7px] font-black italic transition-all border ${
                      fleetFilter === f 
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' 
                        : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {finalCouriers.map(rider => (
                <div key={rider.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${rider.status === 'offline' ? 'bg-slate-700' : 'bg-emerald-500 shadow-[0_0_5px_#10b981]'}`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white italic">{rider.name}</span>
                      <span className="text-[7px] text-slate-500 font-black uppercase italic tracking-tighter">{rider.hub || 'HQ'} Hub • {rider.vehicleType}</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                    rider.status === 'idle' ? 'bg-blue-500/20 text-blue-400' : 
                    rider.status === 'busy' ? 'bg-amber-500/20 text-amber-400' : 
                    'bg-slate-800 text-slate-500'
                  }`}>{rider.status.toUpperCase()}</span>
                </div>
              ))}
              {finalCouriers.length === 0 && (
                <div className="text-center py-4 text-slate-600 font-black italic text-[10px] uppercase">
                  No riders matching filter
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 border-dashed">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-4 h-4 text-blue-500" />
              <h4 className="text-[10px] font-black text-white italic uppercase">Security Monitor</h4>
            </div>
            <p className="text-[9px] text-slate-500 font-medium italic leading-tight">All communications encrypted via Northern Shield. Hub protocol active.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
