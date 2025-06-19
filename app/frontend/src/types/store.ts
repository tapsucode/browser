export interface Product {
  id: string;
  name: string;
  image: string;
  rating: number;
  views: number;
  price: string | number;
  provider: string;
  category: string;
  isMobile?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export type StoreTab = 'apps' | 'configs';