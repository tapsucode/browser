import { Product, Category } from '../types/store';

export const categories: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'ebay', name: 'Ebay' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'google', name: 'Google' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'etsy', name: 'Etsy' },
  { id: 'discord', name: 'Discord' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'tiktok', name: 'Tiktok shop' },
  { id: 'pixels', name: 'Pixels' },
  { id: 'airdrop', name: 'Airdrop' },
  { id: 'youtube', name: 'Youtube' },
  { id: 'game', name: 'Game tap earn tap' },
  { id: 'cookie', name: 'Build Cookie' },
  { id: 'other', name: 'Other' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Shein Product Interaction',
    image: 'https://images.pexels.com/photos/5872361/pexels-photo-5872361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 5,
    views: 16,
    price: 'Free',
    provider: 'cuongpq',
    category: 'all',
  },
  {
    id: '2',
    name: 'Auto Post and Comment Facebook',
    image: 'https://images.pexels.com/photos/5849592/pexels-photo-5849592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 5,
    views: 69,
    price: 'Free',
    provider: 'cuongpq',
    category: 'facebook',
  },
  {
    id: '3',
    name: 'Build Cookie Chi Tiết Cho EBAY Android',
    image: 'https://images.pexels.com/photos/5849592/pexels-photo-5849592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 5,
    views: 47,
    price: 'Free',
    provider: 'HIDEMIUM BROWSER',
    category: 'ebay',
  },
  {
    id: '4',
    name: 'Shein Product Interaction [ Mobile ]',
    image: 'https://images.pexels.com/photos/5872361/pexels-photo-5872361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 5,
    views: 15,
    price: 'Free',
    provider: 'cuongpq',
    category: 'all',
    isMobile: true,
  },
  {
    id: '5',
    name: '[SUI WALLET] Automation register Sui Wallet',
    image: 'https://images.pexels.com/photos/5980855/pexels-photo-5980855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 4,
    views: 36,
    price: 'Free',
    provider: 'cuongpq',
    category: 'other',
  },
  {
    id: '6',
    name: '[PIXEL] Textile (Dệt may)',
    image: 'https://images.pexels.com/photos/5980855/pexels-photo-5980855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 5,
    views: 58,
    price: 'Free',
    provider: 'HIDEMIUM BROWSER',
    category: 'pixels',
  },
  {
    id: '7',
    name: '[PIXEL] A Su',
    image: 'https://images.pexels.com/photos/5980855/pexels-photo-5980855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 5,
    views: 45,
    price: 'Free',
    provider: 'HIDEMIUM BROWSER',
    category: 'pixels',
  },
  {
    id: '8',
    name: '[PIXEL] Woodwork, cối, dệt',
    image: 'https://images.pexels.com/photos/5980855/pexels-photo-5980855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    rating: 4,
    views: 36,
    price: 'Free',
    provider: 'HIDEMIUM BROWSER',
    category: 'pixels',
  },
];