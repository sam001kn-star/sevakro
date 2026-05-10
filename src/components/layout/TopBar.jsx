import { MapPin, ChevronDown, Gift, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar({ address, onLocationClick }) {
  return (
    <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
      <button
        onClick={onLocationClick}
        className="flex items-center gap-1.5 flex-1 min-w-0"
      >
        <MapPin className="w-4 h-4 shrink-0" />
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate max-w-[200px]">
              {address?.locality || 'Select Location'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          </div>
          {address?.full_address && (
            <span className="text-[10px] opacity-80 truncate max-w-[240px]">
              {address.full_address}
            </span>
          )}
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/wallet"
          className="flex items-center gap-1 bg-primary-foreground/15 rounded-full px-2.5 py-1.5"
        >
          <Gift className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold">₹100</span>
        </Link>
        <Link
          to="/profile"
          className="w-8 h-8 rounded-full bg-primary-foreground/15 flex items-center justify-center"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}