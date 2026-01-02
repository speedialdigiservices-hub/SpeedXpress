
import React from 'react';
import { Product } from '../types';
import { MARKETPLACE_PRODUCTS } from '../constants';
import { ShoppingBag, Star, Flame, Coffee, Pizza } from 'lucide-react';

interface Props {
  onAddToCart: (product: Product) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const Marketplace: React.FC<Props> = ({ onAddToCart, cartCount, onOpenCart }) => {
  const categories = [
    { id: 'grills', label: 'Grills', icon: Flame },
    { id: 'bites', label: 'Bites', icon: Pizza },
    { id: 'drinks', label: 'Drinks', icon: Coffee },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">QUICK <span className="brand-text-orange">BITES</span></h2>
        <button 
          onClick={onOpenCart}
          className="relative p-3 bg-white/5 border border-white/10 rounded-2xl hover:scale-110 transition-transform"
        >
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 brand-gradient-orange rounded-full text-[10px] font-black flex items-center justify-center text-white border-2 border-[#020617]">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all group"
          >
            <cat.icon className="w-4 h-4 text-amber-500 group-hover:animate-bounce" />
            <span className="text-xs font-black italic text-slate-300 uppercase">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MARKETPLACE_PRODUCTS.map(product => (
          <div key={product.id} className="group bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all shadow-xl">
            <div className="h-40 w-full overflow-hidden relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-white italic">4.8</span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-black bg-blue-500 text-white px-3 py-1 rounded-full italic uppercase shadow-lg">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-black text-white italic leading-tight">{product.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sold by {product.jointName}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xl font-black brand-text-orange italic">₦{product.price.toLocaleString()}</span>
                <button 
                  onClick={() => onAddToCart(product)}
                  className="px-6 py-2 brand-gradient-blue text-white rounded-xl font-black italic text-xs hover:scale-105 active:scale-95 transition-all"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
