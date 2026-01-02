
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DispatcherDashboard from './components/DispatcherDashboard';
import CustomerPortal from './components/CustomerPortal';
import RiderPortal from './components/RiderPortal';
import RiderRegistration from './components/RiderRegistration';
import NotificationToast from './components/NotificationToast';
import { UserRole, Order, Courier, OrderStatus, Notification, Product } from './types';
import { INITIAL_ORDERS, INITIAL_COURIERS } from './constants';
import { LayoutDashboard, Package, UserCircle, Truck, Bell, Navigation } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('DISPATCHER');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [isRegistering, setIsRegistering] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const ACTIVE_RIDER_ID = 'RID-01';

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setCouriers(prevCouriers => prevCouriers.map(courier => {
        if (courier.status === 'offline') return courier;
        const activeOrder = orders.find(o => o.courierId === courier.id && o.status === OrderStatus.IN_TRANSIT);

        if (activeOrder) {
          const step = 0.0005;
          const dLat = activeOrder.deliveryCoords.lat - courier.location.lat;
          const dLng = activeOrder.deliveryCoords.lng - courier.location.lng;
          const distance = Math.sqrt(dLat * dLat + dLng * dLng);

          if (distance < 0.001) return courier;
          return {
            ...courier,
            location: {
              lat: courier.location.lat + (dLat / distance) * step,
              lng: courier.location.lng + (dLng / distance) * step
            }
          };
        } else {
          return {
            ...courier,
            location: {
              lat: courier.location.lat + (Math.random() - 0.5) * 0.0001,
              lng: courier.location.lng + (Math.random() - 0.5) * 0.0001
            }
          };
        }
      }));
    }, 2000);
    return () => clearInterval(simulationInterval);
  }, [orders]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const newNote: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNote, ...prev].slice(0, 5));
  }, []);

  const handleUpdateStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (status === OrderStatus.DELIVERED) {
      addNotification(`Order ${orderId} Delivered! Enjoy your items.`, 'success');
      setCouriers(prev => prev.map(c => 
        c.id === order.courierId ? { ...c, status: 'idle' } : c
      ));
    } else {
      addNotification(`Order ${orderId} updated to ${status}`, 'info');
    }
  }, [orders, addNotification]);

  const handleToggleRiderAvailability = useCallback((courierId: string, isOnline: boolean) => {
    setCouriers(prev => prev.map(c => 
      c.id === courierId ? { ...c, status: isOnline ? 'idle' : 'offline' } : c
    ));
    addNotification(`You are now ${isOnline ? 'ONLINE' : 'OFFLINE'}`, isOnline ? 'success' : 'warning');
  }, [addNotification]);

  const handleAssignOrder = useCallback((orderId: string, courierId: string) => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier || courier.status === 'offline') {
      addNotification("Rider is currently offline.", "warning");
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: OrderStatus.ASSIGNED, courierId, eta: '15-25 mins' } 
        : order
    ));
    setCouriers(prev => prev.map(c => 
      c.id === courierId ? { ...c, status: 'busy' } : c
    ));
    addNotification(`Dispatch Assigned: Order ${orderId} sent to ${courier.name}`, 'info');
  }, [couriers, addNotification]);

  const handleCreateOrder = useCallback((newOrder: Partial<Order>) => {
    const order: Order = {
      id: `SD-${(newOrder.pickupAddress || 'ABJ').substring(0,3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      customerName: 'Customer',
      pickupAddress: newOrder.pickupAddress || '',
      deliveryAddress: newOrder.deliveryAddress || '',
      pickupCoords: { lat: 9.0765, lng: 7.3986 },
      deliveryCoords: { lat: 9.1176, lng: 7.4042 },
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      weight: newOrder.weight || '2kg',
      priority: newOrder.priority || 'medium',
      orderType: 'package'
    };
    setOrders(prev => [order, ...prev]);
    addNotification(`Express Dispatch Booked: ${order.id}`, 'info');
  }, [addNotification]);

  const handlePlaceFoodOrder = useCallback((items: Product[]) => {
    if (items.length === 0) return;
    const joint = items[0].jointName;
    const location = items[0].jointLocation;
    
    const order: Order = {
      id: `SD-FOOD-${Math.floor(Math.random() * 1000)}`,
      customerName: 'Customer',
      pickupAddress: `${joint}, ${location}`,
      deliveryAddress: 'Wuse II, Abuja',
      pickupCoords: { lat: 9.0765, lng: 7.3986 },
      deliveryCoords: { lat: 9.0815, lng: 7.4200 },
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      weight: '1kg',
      priority: 'high',
      orderType: 'food',
      items: items.map(i => i.name)
    };
    setOrders(prev => [order, ...prev]);
    addNotification(`Food Order Placed! Dispatching rider to ${joint}`, 'success');
  }, [addNotification]);

  const handleRegisterRider = useCallback((data: any) => {
    const hubCoords = { ABUJA: { lat: 9.0765, lng: 7.3986 }, KADUNA: { lat: 10.5105, lng: 7.4165 }, KANO: { lat: 12.0022, lng: 8.5920 } };
    const selectedHub = (data.hub as keyof typeof hubCoords) || 'ABUJA';
    const newRider: Courier = {
      id: `RID-${Math.floor(Math.random() * 10000)}`,
      name: data.name,
      phone: data.phone,
      vehicleType: data.vehicle,
      hub: selectedHub,
      location: hubCoords[selectedHub],
      status: 'idle',
      rating: 5.0
    };
    setCouriers(prev => [...prev, newRider]);
    addNotification(`Registration Complete! Welcome ${data.name}.`, 'success');
  }, [addNotification]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} onJoinFleet={() => setIsRegistering(true)} />
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
        {role === 'DISPATCHER' && (
          <DispatcherDashboard orders={orders} couriers={couriers} onAssignOrder={handleAssignOrder} />
        )}
        {role === 'CUSTOMER' && (
          <CustomerPortal 
            orders={orders} 
            couriers={couriers}
            onCreateOrder={handleCreateOrder} 
            onPlaceFoodOrder={handlePlaceFoodOrder}
          />
        )}
        {role === 'RIDER' && (
          <RiderPortal orders={orders} riderId={ACTIVE_RIDER_ID} rider={couriers.find(c => c.id === ACTIVE_RIDER_ID)!} onUpdateStatus={handleUpdateStatus} onToggleAvailability={handleToggleRiderAvailability} />
        )}
      </main>

      <NotificationToast notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />

      {isRegistering && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <RiderRegistration onRegister={handleRegisterRider} onClose={() => setIsRegistering(false)} />
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 h-16 flex items-center justify-around px-4 z-[100]">
        {[
          { id: 'dashboard', label: 'Matrix', icon: LayoutDashboard },
          { id: 'orders', label: 'Fleet', icon: Truck },
          { id: 'profile', label: 'Role', icon: UserCircle, action: () => {
            const roles: UserRole[] = ['DISPATCHER', 'CUSTOMER', 'RIDER'];
            setRole(roles[(roles.indexOf(role) + 1) % roles.length]);
          }}
        ].map(tab => (
          <button key={tab.id} onClick={tab.action || (() => setActiveTab(tab.id))} className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'}`}>
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-black italic uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
