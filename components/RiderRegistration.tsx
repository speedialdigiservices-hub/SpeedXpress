
import React, { useState } from 'react';
import { Truck, Smartphone, User, MapPin, CheckCircle } from 'lucide-react';

interface Props {
  onRegister: (data: any) => void;
  onClose: () => void;
}

const RiderRegistration: React.FC<Props> = ({ onRegister, onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: 'Motorcycle',
    hub: 'ABUJA'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border border-blue-500/30 text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 brand-gradient-blue rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-bounce">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-white italic">YOU'RE LIVE!</h2>
        <p className="text-slate-400 text-sm font-medium">Your profile is now visible to the Command Matrix. Keep your app open to receive dispatch requests.</p>
        <button 
          onClick={onClose}
          className="w-full py-4 brand-gradient-blue text-white rounded-2xl font-black italic shadow-xl"
        >
          GO TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] p-8 md:p-10 rounded-[2.5rem] border border-white/5 w-full max-w-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white italic tracking-tighter">JOIN THE <span className="brand-text-blue">FLEET</span></h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Become a SpeeDial Rider in Nigeria</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" required placeholder="FULL NAME"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 text-white font-bold italic outline-none focus:border-blue-500"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="relative">
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="tel" required placeholder="PHONE NUMBER (+234)"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 text-white font-bold italic outline-none focus:border-blue-500"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 text-white font-bold italic outline-none focus:border-blue-500 appearance-none"
              value={formData.vehicle}
              onChange={e => setFormData({...formData, vehicle: e.target.value as any})}
            >
              <option value="Motorcycle">MOTORCYCLE</option>
              <option value="Bicycle">BICYCLE</option>
              <option value="Car">SMALL CAR</option>
            </select>
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 text-white font-bold italic outline-none focus:border-blue-500 appearance-none"
              value={formData.hub}
              onChange={e => setFormData({...formData, hub: e.target.value as any})}
            >
              <option value="ABUJA">ABUJA</option>
              <option value="KADUNA">KADUNA</option>
              <option value="KANO">KANO</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button 
            type="button" onClick={onClose}
            className="flex-1 py-4 text-slate-500 font-black italic uppercase text-xs"
          >
            ABORT
          </button>
          <button 
            type="submit"
            className="flex-1 py-4 brand-gradient-blue text-white rounded-xl font-black italic shadow-2xl hover:scale-105 transition-transform"
          >
            SIGN UP NOW
          </button>
        </div>
      </form>
    </div>
  );
};

export default RiderRegistration;
