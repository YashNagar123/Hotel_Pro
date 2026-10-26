import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'active' | 'maintenance' | 'inactive';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          classes: 'text-emerald-700 font-medium',
        };
      case 'checked_in':
        return {
          label: 'Checked In',
          classes: 'text-blue-700 font-semibold',
        };
      case 'completed':
        return {
          label: 'Completed Stay',
          classes: 'text-stone-600',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          classes: 'text-rose-600',
        };
      case 'pending':
        return {
          label: 'Pending',
          classes: 'text-amber-700',
        };
      case 'active':
        return {
          label: 'Active & Available',
          classes: 'text-emerald-700 font-medium',
        };
      case 'maintenance':
        return {
          label: 'Under Maintenance',
          classes: 'text-amber-700 font-medium',
        };
      case 'inactive':
        return {
          label: 'Deactivated',
          classes: 'text-stone-500',
        };
      default:
        return {
          label: status,
          classes: 'text-stone-700',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center text-xs tracking-tight ${config.classes} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  );
};
