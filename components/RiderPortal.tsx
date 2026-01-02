
import React, { useMemo } from 'react';
import { Order, OrderStatus, Courier } from '../types';
import { Navigation, Package, CheckCircle2, Phone, ArrowRight, Power } from 'lucide-react';
import MapView from './MapView';
import Logo from './Logo';

interface Props {
  orders: Order[];
  riderId: string;
  rider: Courier;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onToggleAvailability: (courierId: string, isOnline: boolean) => void;
}

const RiderPortal: React.FC<Props> = ({ orders, riderId, rider, onUpdateStatus, onToggleAvailability }) => {
  const isOnline = rider?.status !== 'offline';

  const activeTask = useMemo(() => 
    orders.find(o => o.courierId === riderId && o.status !== OrderStatus.DELIVERED),
    [orders, riderId]
  );

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case OrderStatus.ASSIGNED: return OrderStatus.ARRIVED_PICKUP;
      case OrderStatus.ARRIVED_PICKUP: return OrderStatus.IN_TRANSIT;
      case OrderStatus.IN_TRANSIT: return OrderStatus.ARRIVED_DELIVERY;
      case OrderStatus.ARRIVED_DELIVERY: return OrderStatus.DELIVERED;
      default: return null;
    }
  };

  const statusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ASSIGNED: return "START TO PICKUP";
      case OrderStatus.ARRIVED_PICKUP: return "PICKED UP ITEMS";
      case OrderStatus.IN_TRANSIT: return "ARRIVED AT DESTINATION";
      case OrderStatus.ARRIVED_DELIVERY: return "MARK AS DELIVERED";
      default: return "COMPLETED";
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#020617] flex flex-col no-scrollbar">
      {/* Rider Header */}
      <header className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <Logo className="h-6" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`} />
            <span className="text-[10px] font-black italic text-white">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            <button 
              onClick={() => onToggleAvailability(riderId, !isOnline)}
              className={`ml-1 p-1 rounded-md transition-all ${isOnline ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/5'}`}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-full brand-gradient-blue border-2 border-white/10 flex items-center justify-center text-white font-black italic">
            AS
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 space-y-6">
        {!isOnline ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
             <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center">
              <Power className="w-10 h-10 text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic">YOU ARE OFFLINE</h2>
              <p className="text-slate-500 font-medium text-sm mt-2">Go online to start receiving dispatch missions.</p>
              <button 
                onClick={() => onToggleAvailability(riderId, true)}
                className="mt-6 px-8 py-3 brand-gradient-blue text-white rounded-xl font-black italic shadow-xl"
              >
                GO ONLINE NOW
              </button>
            </div>
          </div>
        ) : !activeTask ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center animate-pulse">
              <Package className="w-10 h-10 text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic">IDLE MODE</h2>
              <p className="text-slate-500 font-medium text-sm mt-2">All set! Waiting for the next task...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mission Card */}
            <div className="brand-gradient-blue p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">Current Mission</span>
                    <h2 className="text-2xl font-black italic mt-1">{activeTask.id}</h2>
                  </div>
                  <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-bold italic mb-6">
                  <div className="flex-1">
                    <p className="text-blue-100 text-[10px] uppercase mb-1">From</p>
                    <p className="truncate">{activeTask.pickupAddress}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-300" />
                  <div className="flex-1">
                    <p className="text-blue-100 text-[10px] uppercase mb-1">To</p>
                    <p className="truncate">{activeTask.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 bg-white/10 p-3 rounded-2xl">
                    <p className="text-[10px] text-blue-200 uppercase font-black">Weight</p>
                    <p className="text-lg font-black italic">{activeTask.weight}</p>
                  </div>
                  <div className="flex-1 bg-white/10 p-3 rounded-2xl">
                    <p className="text-[10px] text-blue-200 uppercase font-black">Priority</p>
                    <p className="text-lg font-black italic uppercase">{activeTask.priority}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Navigation className="w-48 h-48 rotate-45" />
              </div>
            </div>

            {/* Map View Focused on Task */}
            <div className="h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden border border-white/10 shadow-xl relative">
              <MapView couriers={[rider]} orders={[activeTask]} />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Tracking Live GPS</span>
              </div>
            </div>

            {/* Status Action Button */}
            <div className="fixed bottom-20 left-4 right-4 md:static md:p-0">
              <button
                onClick={() => {
                  const next = getNextStatus(activeTask.status);
                  if (next) onUpdateStatus(activeTask.id, next);
                }}
                className="w-full py-5 brand-gradient-orange text-white rounded-2xl font-black italic text-lg shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                {statusLabel(activeTask.status)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderPortal;
