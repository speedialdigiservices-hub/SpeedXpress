
import React, { useEffect } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<Props> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none">
      {notifications.map((note) => (
        <ToastItem key={note.id} note={note} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ note: Notification; onDismiss: (id: string) => void }> = ({ note, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(note.id), 5000);
    return () => clearTimeout(timer);
  }, [note.id, onDismiss]);

  const config = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  }[note.type];

  const Icon = config.icon;

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl backdrop-blur-xl border ${config.bg} ${config.border} shadow-2xl animate-in slide-in-from-right fade-in duration-300`}>
      <div className={`p-2 rounded-xl ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-xs font-black text-white italic leading-tight">{note.message}</p>
        <p className="text-[8px] font-bold text-slate-500 mt-1">JUST NOW</p>
      </div>
      <button 
        onClick={() => onDismiss(note.id)}
        className="text-slate-600 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;
