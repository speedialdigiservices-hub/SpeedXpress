
export type UserRole = 'DISPATCHER' | 'CUSTOMER' | 'RIDER';

export enum OrderStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  ARRIVED_PICKUP = 'Arrived at Pickup',
  IN_TRANSIT = 'In Transit',
  ARRIVED_DELIVERY = 'Arrived at Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export type TrafficDensity = 'light' | 'moderate' | 'heavy';

export interface Route {
  id: string;
  name: string;
  city: 'ABUJA' | 'KADUNA' | 'KANO';
  points: Coordinates[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Courier {
  id: string;
  name: string;
  phone?: string;
  vehicleType: 'Motorcycle' | 'Bicycle' | 'Car';
  hub?: 'ABUJA' | 'KADUNA' | 'KANO';
  location: Coordinates;
  status: 'idle' | 'busy' | 'offline';
  rating: number;
}

export interface Order {
  id: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupCoords: Coordinates;
  deliveryCoords: Coordinates;
  status: OrderStatus;
  createdAt: string;
  courierId?: string;
  weight: string;
  priority: 'low' | 'medium' | 'high';
  eta?: string;
  orderType?: 'package' | 'food';
  items?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'grills' | 'drinks' | 'bites';
  image: string;
  jointName: string;
  jointLocation: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}
