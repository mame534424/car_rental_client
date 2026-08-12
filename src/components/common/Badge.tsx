import React from 'react';
import { BookingStatus, PaymentStatus } from '@/types/booking';
import { CarStatus } from '@/types/car';
import { cn } from '@/lib/utils';

type BadgeType = BookingStatus | CarStatus | PaymentStatus | string;

interface BadgeProps {
  status: BadgeType;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'MAINTENANCE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'UNAVAILABLE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';

      case 'PENDING_PAYMENT':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'PENDING_VERIFICATION':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'CONFIRMED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'PAID':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';

      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  const getLabel = (val: string) => {
    switch (val) {
      case 'PENDING_PAYMENT':
        return 'Pending Payment';
      case 'PENDING_VERIFICATION':
        return 'Pending Admin Approval';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REJECTED':
        return 'Rejected';
      case 'AVAILABLE':
        return 'Available Now';
      case 'MAINTENANCE':
        return 'In Maintenance';
      case 'UNAVAILABLE':
        return 'Unavailable';
      default:
        return val.replace(/_/g, ' ');
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all',
        getBadgeStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {getLabel(status)}
    </span>
  );
}
