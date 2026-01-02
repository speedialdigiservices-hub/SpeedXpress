
import React, { useState, useEffect, useMemo } from 'react';
import { Courier, Order, OrderStatus, Route, TrafficDensity } from '../types';
import { MapPin, Truck as TruckIcon, X, Navigation, Package, Star, Activity, Phone, ShieldCheck, Bike, Car, User, Globe } from 'lucide-react';
import { getTrafficAnalysis } from '../services/geminiService';

interface MapViewProps {
  couriers: Courier[];
  orders: Order[];
}

const MAJOR_ROUTES: Route[] = [
  // Abuja Routes
  {
    id: 'ABJ-R1', name: 'Airport Rd - City Gate', city: 'ABUJA',
    points: [{ lat: 8.99, lng: 7.26 }, { lat: 9.03, lng: 7.35 }, { lat: 9.07, lng: 7.40 }]
  },
  {
    id: 'ABJ-R2', name: 'Wuse - Maitama Express', city: 'ABUJA',
    points: [{ lat: 9.06, lng: 7.45 }, { lat: 9.08, lng: 7.48 }, { lat: 9.10, lng: 7.51 }]
  },
  // Kaduna Routes
  {
    id: 'KAD-R1', name: 'Independence Way', city: 'KADUNA',
    points: [{ lat: 10.50, lng: 7.40 }, { lat: 10.52, lng: 7.42 }, { lat: 10.54, lng: 7.44 }]
  },
  {
    id: 'KAD-R2', name: 'Kaduna-Zaria Rd', city: 'KADUNA',
    points: [{ lat: 10.55, lng: 7.45 }, { lat: 10.65, lng: 7.55 }]
  },
  // Kano Routes
  {
    id: 'KAN-R1', name: 'Zaria Road', city: 'KANO',
    points: [{ lat: 11.95, lng: 8.55 }, { lat: 12.00, lng: 8.59 }, { lat: 12.05, lng: 8.63 }]
  },
  {
    id: 'KAN-R2', name: 'Sabon Gari Market Loop', city: 'KANO',
    points: [{ lat: 12.02, lng: 8.52 }, { lat: 12.04, lng: 8.54 }, { lat: 12.03, lng: 8.56 }]
  }
];

const MapView: React.FC<MapViewProps> = ({ couriers, orders }) => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'order' | 'courier', id: string } | null>(null);
  const [traffic, setTraffic] = useState<Record<string, TrafficDensity>>({ ABUJA: 'moderate', KADUNA: 'light', KANO: 'moderate' });
  const [loadingTraffic, setLoadingTraffic] = useState(false);

  // Bounding box for Abuja, Kaduna, Kano triangle
  const minLat = 8.5, maxLat = 12.5;
  const minLng = 6.5, maxLng = 9.5;

  useEffect(() => {
    const fetchTraffic = async () => {
      setLoadingTraffic(true);
      const data = await getTrafficAnalysis();
      setTraffic(data);
      setLoadingTraffic(false);
    };
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getPos = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { left: `${x}%`, top: `${y}%` };
  };

  const getTrafficColor = (city: 'ABUJA' | 'KADUNA' | 'KANO') => {
    const density = traffic[city];
    switch (density) {
      case 'light': return '#10b981'; // Green
      case 'moderate': return '#f59e0b'; // Yellow/Orange
      case 'heavy': return '#ef4444'; // Red
      default: return '#3b82f6';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Motorcycle': return <Bike className="w-3.5 h-3.5" />;
      case 'Car': return <Car className="w-3.5 h-3.5" />;
      default: return <Bike className="w-3.5 h-3.5" />;
    }
  };

  const selectedData = selectedEntity?.type === 'order' 
    ? orders.find(o => o.id === selectedEntity.id)
    : couriers.find(c => c.id === selectedEntity?.id);

  return (
    <div 
      className="relative w-full h-full bg-[#020617] overflow-hidden group cursor-crosshair"
      onClick={() => setSelectedEntity(null)}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0)', backgroundSize: '30px 30px' }} />
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Traffic Overlays */}
        {MAJOR_ROUTES.map(route => {
          let pathD = "";
          route.points.forEach((pt, i) => {
            const pos = getPos(pt.lat, pt.lng);
            pathD += `${i === 0 ? 'M' : 'L'} ${pos.left} ${pos.top} `;
          });
          const color = getTrafficColor(route.city);
          const density = traffic[route.city];

          return (
            <g key={route.id}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-10 blur-sm"
              />
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40 transition-colors duration-1000"
              />
              {density === 'heavy' && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeDasharray="10 20"
                  className="opacity-30"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="300"
                    to="0"
                    dur="5s"
                    repeatCount="indefinite"
                  />
                </path>
              )}
            </g>
          );
        })}

        {/* Order Paths */}
        {orders.filter(o => o.status === OrderStatus.IN_TRANSIT).map(o => {
          const start = getPos(o.pickupCoords.lat, o.pickupCoords.lng);
          const end = getPos(o.deliveryCoords.lat, o.deliveryCoords.lng);
          return (
            <g key={`path-${o.id}`}>
              <line
                x1={start.left} y1={start.top}
                x2={end.left} y2={end.top}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="10 5"
                className="opacity-20"
              />
              <circle r="4" fill="#3b82f6" className="animate-drift">
                 <animateMotion 
                   path={`M ${start.left} ${start.top} L ${end.left} ${end.top}`} 
                   dur="10s" 
                   repeatCount="indefinite" 
                 />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Traffic Legend Overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/5 p-2 rounded-xl flex flex-col gap-1.5 z-40">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3 h-3 text-blue-400" />
          <span className="text-[7px] font-black text-slate-400 uppercase italic">Traffic Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[7px] font-bold text-slate-500 uppercase">Light Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[7px] font-bold text-slate-500 uppercase">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <span className="text-[7px] font-bold text-slate-500 uppercase">Heavy Congest.</span>
        </div>
      </div>

      {/* Orders Pins */}
      {orders.map(order => (
        <div 
          key={order.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-500 cursor-pointer ${selectedEntity?.id === order.id ? 'scale-150 z-30' : 'hover:scale-125'}`}
          style={getPos(order.pickupCoords.lat, order.pickupCoords.lng)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEntity({ type: 'order', id: order.id });
          }}
        >
          <div className="relative group/pin">
            <div className={`absolute inset-0 ${order.status === OrderStatus.PENDING ? 'bg-amber-500' : 'bg-blue-500'} blur-lg opacity-30 rounded-full animate-pulse`} />
            <MapPin className={`${order.status === OrderStatus.PENDING ? 'text-amber-500' : 'text-blue-500'} w-5 h-5 relative z-10`} />
          </div>
        </div>
      ))}

      {/* Rider Icons */}
      {couriers.filter(c => c.status !== 'offline').map(courier => (
        <div 
          key={courier.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[2000ms] ease-linear z-20 cursor-pointer ${selectedEntity?.id === courier.id ? 'scale-150 z-30' : 'hover:scale-125'}`}
          style={getPos(courier.location.lat, courier.location.lng)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEntity({ type: 'courier', id: courier.id });
          }}
        >
          <div className="relative group/agent">
            {courier.status === 'busy' && (
              <div className="absolute -inset-2 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse" />
            )}
            <div className={`p-1.5 rounded-xl border border-white/20 shadow-2xl relative z-10 ${courier.status === 'busy' ? 'brand-gradient-blue' : 'bg-slate-800'}`}>
              <TruckIcon className="text-white w-3 h-3" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950 shadow-[0_0_5px_#10b981]" />
          </div>
        </div>
      ))}

      {/* Detail Info Card Overlay */}
      {selectedData && (
        <div 
          className="absolute z-50 animate-in fade-in zoom-in duration-300 pointer-events-auto"
          style={{
            ...getPos(
              selectedEntity?.type === 'order' ? (selectedData as Order).pickupCoords.lat : (selectedData as Courier).location.lat,
              selectedEntity?.type === 'order' ? (selectedData as Order).pickupCoords.lng : (selectedData as Courier).location.lng
            ),
            transform: 'translate(-50%, calc(-100% - 20px))'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-72">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedEntity?.type === 'order' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
                <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">
                  {selectedEntity?.type === 'order' ? 'Mission Parameters' : 'Agent Profile'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedEntity(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEntity?.type === 'order' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-black text-white italic tracking-tighter">{(selectedData as Order).id}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{(selectedData as Order).customerName}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                    <Package className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[8px] text-slate-500 font-black uppercase italic">Destination</p>
                      <p className="text-[10px] text-slate-200 font-bold leading-tight">{(selectedData as Order).deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center border-t border-white/5">
                  <span className="text-[10px] font-black text-blue-400 italic">{(selectedData as Order).status.toUpperCase()}</span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-slate-600" />
                    <span className="text-[9px] font-bold text-slate-500 tracking-tighter italic">{(selectedData as Order).priority.toUpperCase()} PRIORITY</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl brand-gradient-blue flex items-center justify-center font-black italic text-white text-xl shadow-lg">
                    {(selectedData as Courier).name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white italic tracking-tighter leading-none">{(selectedData as Courier).name}</h4>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] text-white font-black italic">{(selectedData as Courier).rating} RATING</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-black uppercase italic mb-1">Assigned Hub</p>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Globe className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-black italic">{(selectedData as Courier).hub || 'MAIN HQ'}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-black uppercase italic mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${ (selectedData as Courier).status === 'idle' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className={`text-[10px] font-black italic ${ (selectedData as Courier).status === 'idle' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {(selectedData as Courier).status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-black uppercase italic mb-1">Vehicle</p>
                    <div className="flex items-center gap-2 text-slate-200">
                      {getVehicleIcon((selectedData as Courier).vehicleType)}
                      <span className="text-[10px] font-black italic">{(selectedData as Courier).vehicleType.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-slate-500 font-black uppercase italic mb-1">Score</p>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-black italic">{(selectedData as Courier).rating}</span>
                    </div>
                  </div>
                </div>

                {(selectedData as Courier).phone && (
                  <div className="space-y-1.5">
                    <p className="text-[8px] text-slate-500 font-black uppercase italic ml-1">Contact Details</p>
                    <a 
                      href={`tel:${(selectedData as Courier).phone}`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group no-underline"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:animate-bounce" />
                      <span className="text-[10px] font-black text-slate-300 italic tracking-wider">
                        {(selectedData as Courier).phone}
                      </span>
                    </a>
                  </div>
                )}

                <div className="pt-1 flex items-center gap-2 border-t border-white/5">
                   <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Activity className="w-3 h-3 text-blue-500" />
                   </div>
                   <p className="text-[8px] text-slate-500 font-medium italic leading-tight">Live telemetry active. Routing through regional matrix.</p>
                </div>
              </div>
            )}
            
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0f172a] border-r border-b border-white/10 rotate-45" />
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex flex-col gap-1 text-[8px] font-black italic opacity-60">
        <span className="text-blue-400 uppercase">Live Operations Matrix</span>
        <span className="text-slate-500">ABUJA • KADUNA • KANO</span>
      </div>
    </div>
  );
};

export default MapView;
