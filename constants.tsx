import React from 'react';
import { Station, FuelType, User, Voucher } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Karim Benali',
  level: 12,
  xp: 1250,
  nextLevelXp: 1600,
  totalPoints: 2450,
  reportsCount: 142,
  verifiedCount: 89,
  savings: 240,
  globalRank: 42,
  vehicle: {
    model: 'Renault Clio 4',
    fuel: 'Diesel',
    odometer: 124500
  },
  role: 'admin'
};

export const MOCK_STATIONS: Station[] = [
  {
    id: 's1',
    name: 'Shell Agdal',
    brand: 'Shell',
    location: { lat: 33.5890, lng: -7.6310, address: 'Ave. Hassan II', city: 'Casablanca' },
    prices: { Diesel: 13.45, 'Sans Plomb': 14.90 },
    lastUpdated: '10 min ago',
    lastUpdatedTimestamp: Date.now() - 600000, // 10 mins ago
    verifiedBy: 'Ahmed',
    verifiedByLevel: 12, // High trust
    distance: '0.5 km',
    amenities: ['Café', 'Shop', 'Air', 'WC'],
    status: 'Open',
    trustScore: 98
  },
  {
    id: 's2',
    name: 'Afriquia Maarif',
    brand: 'Afriquia',
    location: { lat: 33.5800, lng: -7.6350, address: "Bd. Al Massira", city: 'Casablanca' },
    prices: { Diesel: 13.40, 'Sans Plomb': 14.85 },
    lastUpdated: '2h ago',
    lastUpdatedTimestamp: Date.now() - 7200000, // 2 hours ago
    verifiedBy: 'Sami',
    verifiedByLevel: 5,
    distance: '1.2 km',
    amenities: ['Mosque', 'Café', 'ATM'],
    status: 'Open',
    trustScore: 88
  },
  {
    id: 's3',
    name: 'TotalEnergies Ghandi',
    brand: 'TotalEnergies',
    location: { lat: 33.5750, lng: -7.6450, address: 'Bd. Ghandi', city: 'Casablanca' },
    prices: { Diesel: 13.52, 'Sans Plomb': 14.98 },
    lastUpdated: '3 days ago',
    lastUpdatedTimestamp: Date.now() - 259200000, // 3 days ago (Stale)
    verifiedBy: 'Layla',
    verifiedByLevel: 1, // Low trust
    distance: '2.4 km',
    amenities: ['Car Wash', 'Shop', 'EV Charge'],
    status: 'Open',
    trustScore: 45
  }
];

export const MOCK_LOCAL_LEADERBOARD = [
  { id: 'u1', name: 'Karim B. (You)', level: 12, points: 2450, city: 'Maarif', img: 'https://i.pravatar.cc/100?u=me' },
  { id: 'l2', name: 'Youssef M.', level: 10, points: 2100, city: 'Maarif', img: 'https://i.pravatar.cc/100?u=12' },
  { id: 'l3', name: 'Hind S.', level: 8, points: 1850, city: 'Maarif', img: 'https://i.pravatar.cc/100?u=13' },
  { id: 'l4', name: 'Othmane K.', level: 6, points: 1200, city: 'Maarif', img: 'https://i.pravatar.cc/100?u=14' },
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    brand: 'Afriquia',
    value: '20 MAD Off Fuel',
    type: 'Fuel',
    pointsRequired: 500,
    code: 'AFR-8821',
    expiryDate: '12 Oct 2024',
    isUsed: false
  },
  {
    id: 'v2',
    brand: 'Shell',
    value: 'Free Espresso',
    type: 'Food',
    pointsRequired: 200,
    code: 'SHL-COF-99',
    expiryDate: '20 Oct 2024',
    isUsed: false
  }
];

export const BRAND_COLORS = {
  Shell: 'bg-yellow-400',
  Afriquia: 'bg-blue-600',
  TotalEnergies: 'bg-red-500',
  Winxo: 'bg-purple-700',
  'Ola Energy': 'bg-blue-800',
  Petrom: 'bg-orange-600'
};

export const AVATARS = [
  { id: 'avatar_3d_moro_1', path: '/avatars/avatar1.png' },
  { id: 'avatar_3d_moro_2', path: '/avatars/avatar2.png' },
  { id: 'avatar_3d_moro_3', path: '/avatars/avatar3.png' },
  { id: 'avatar_3d_tech_agent', path: '/avatars/avatar4.png' },
  { id: 'avatar_3d_moro_4_business', path: '/avatars/avatar5.png' },
  { id: 'avatar_3d_moro_5_rider', path: '/avatars/avatar6.png' },
  { id: 'avatar_3d_moro_6_sporty', path: '/avatars/avatar7.png' },
  { id: 'avatar_3d_moro_7_classic', path: '/avatars/avatar8.png' },
];
