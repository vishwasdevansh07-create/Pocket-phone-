import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Flame, 
  Heart, 
  AlertTriangle, 
  Sun, 
  CloudRain, 
  Wind 
} from 'lucide-react';

export interface AlertData {
  title: string;
  subtitle: string;
  icon: string;
}

interface DiscoveryNotificationProps {
  alert: AlertData | null;
  onDismiss: () => void;
}

export const DiscoveryNotification: React.FC<DiscoveryNotificationProps> = ({ alert, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  if (!alert) return null;

  const renderIcon = () => {
    switch (alert.icon) {
      case 'map-pin':
        return <MapPin className="w-5 h-5 text-amber-400" />;
      case 'globe':
        return <Compass className="w-5 h-5 text-red-400 animate-spin-slow" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />;
      case 'cloud-rain':
        return <CloudRain className="w-5 h-5 text-cyan-400" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-teal-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div
      className={`fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-none ${
        visible ? 'opacity-100 -translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div className="bg-slate-950/90 border-2 border-amber-500/70 text-slate-100 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3.5 max-w-sm sm:max-w-md box-glow-rune">
        <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-cinzel font-bold text-xs sm:text-sm text-amber-200 truncate">
            {alert.title}
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
            {alert.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
