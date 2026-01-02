
import { Order, OrderStatus, Courier, Product } from './types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SD-ABJ-001',
    customerName: 'Garki Trade Center',
    pickupAddress: 'Block 4, Wuse II, Abuja',
    deliveryAddress: 'Plot 12, Gwarinpa, Abuja',
    pickupCoords: { lat: 9.0765, lng: 7.3986 },
    deliveryCoords: { lat: 9.1176, lng: 7.4042 },
    status: OrderStatus.IN_TRANSIT,
    createdAt: new Date().toISOString(),
    courierId: 'RID-01',
    weight: '2kg',
    priority: 'high',
    eta: '25 mins'
  }
];

export const INITIAL_COURIERS: Courier[] = [
  { id: 'RID-01', name: 'Abubakar Sadiq', location: { lat: 9.08, lng: 7.40 }, status: 'busy', rating: 4.9, vehicleType: 'Motorcycle' },
  { id: 'RID-02', name: 'Musa Ibrahim', location: { lat: 10.52, lng: 7.42 }, status: 'idle', rating: 4.8, vehicleType: 'Motorcycle' },
  { id: 'RID-03', name: 'Zainab Bello', location: { lat: 12.01, lng: 8.60 }, status: 'idle', rating: 5.0, vehicleType: 'Bicycle' }
];

export const MARKETPLACE_PRODUCTS: Product[] = [
  {
    id: 'P-001',
    name: 'Spicy Suya Platter',
    price: 3500,
    category: 'grills',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=300&q=80',
    jointName: 'Arewa Grill Central',
    jointLocation: 'Wuse II, Abuja'
  },
  {
    id: 'P-007',
    name: 'Rufaidahn Creamy Yoghurt',
    price: 2500,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1571290274554-e94419830c62?auto=format&fit=crop&w=400&q=80',
    jointName: 'Rufaidahn Dairy',
    jointLocation: 'Abuja Hub'
  },
  {
    id: 'P-008',
    name: 'Rufaidahn Special Fura',
    price: 1800,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=400&q=80',
    jointName: 'Rufaidahn Dairy',
    jointLocation: 'Kano Hub'
  },
  {
    id: 'P-002',
    name: 'Kilishi Special',
    price: 5000,
    category: 'grills',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',
    jointName: 'Kano Kilishi Hub',
    jointLocation: 'Murtala Mohammed Way, Kano'
  },
  {
    id: 'P-003',
    name: 'Zobo Refreshment (1L)',
    price: 1200,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&w=300&q=80',
    jointName: 'Nature Sip Kaduna',
    jointLocation: 'Independence Way, Kaduna'
  },
  {
    id: 'P-004',
    name: 'Double Cheeseburger',
    price: 4200,
    category: 'bites',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    jointName: 'Maitama Burger Co.',
    jointLocation: 'Garki, Abuja'
  },
  {
    id: 'P-005',
    name: 'Masa & Vegetable Soup',
    price: 2800,
    category: 'bites',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
    jointName: 'Traditional Tastes',
    jointLocation: 'Kaduna Bypass'
  },
  {
    id: 'P-006',
    name: 'Fresh Fura Da Nono',
    price: 1800,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1571290274554-e94419830c62?auto=format&fit=crop&w=300&q=80',
    jointName: 'Dairy King Kano',
    jointLocation: 'Bayero Univ Road, Kano'
  }
];
