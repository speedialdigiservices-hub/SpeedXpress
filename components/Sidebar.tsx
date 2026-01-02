
import React from 'react';
import { LayoutDashboard, Package, Truck, UserCircle, Settings, HelpCircle, Activity, Zap, Navigation } from 'lucide-react';
import { UserRole } from '../types';
import Logo from './Logo';

interface SidebarProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onJoinFleet?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, setRole, activeTab, setActiveTab, onJoinFleet }) => {
  const menuItems = {
    DISPATCHER: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'orders', label: 'Order Dispatch', icon: Package },
      { id: 'fleet', label: 'Fleet Status', icon: Truck },
      { id: 'analytics', label: 'Logistics AI', icon: Activity },
    ],
    CUSTOMER: [
      { id: 'tracking', label: 'My Deliveries', icon: Package },
      { id: 'new-order', label: 'Request Pickup', icon: Truck },
      { id: 'profile', label: 'Account', icon: UserCircle },
    ],
    RIDER: [
      { id: 'tasks', label: 'Current Mission', icon: Navigation },
      { id: 'history', label: 'Trip History', icon: Activity },
      { id: 'wallet', label: 'Earnings', icon: Zap },
    ]
  }[role];

  return (
    <div className="w-64 bg-slate-950/50 backdrop-blur-xl h-screen border-r border-white/5 flex flex-col sticky top-0 z-50">
      <div className="p-6 pb-2">
        <Logo className="h-10" />
      </div>

      <nav className="flex-1 mt-8 px-4">
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 italic">Control Matrix</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 brand-gradient-blue opacity-20" />
              )}
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 brand-gradient-blue" />
              )}
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:italic ${activeTab === item.id ? 'text-blue-400' : ''}`} />
              <span className={`font-bold text-sm tracking-tight ${activeTab === item.id ? 'italic' : ''}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {role === 'CUSTOMER' && (
          <div className="mb-6">
            <button 
              onClick={onJoinFleet}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl brand-gradient-blue text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="font-black text-sm italic tracking-tight">JOIN THE FLEET</span>
            </button>
          </div>
        )}

        <div className="mt-8">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 italic">Operator</p>
          <button
            onClick={() => {
              const roles: UserRole[] = ['DISPATCHER', 'CUSTOMER', 'RIDER'];
              const nextIndex = (roles.indexOf(role) + 1) % roles.length;
              setRole(roles[nextIndex]);
              setActiveTab(roles[nextIndex] === 'DISPATCHER' ? 'dashboard' : 'tracking');
            }}
            className="w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all bg-white/5 border border-white/10 hover:border-amber-500/50"
          >
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors capitalize">{role.toLowerCase()}</span>
            </div>
            <div className="text-[8px] font-black text-slate-600">SWAP</div>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Support</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
