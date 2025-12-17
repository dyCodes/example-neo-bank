import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { cn } from '~/lib/utils';

interface BalanceCardProps {
  balance: number;
  accountNumber?: string;
  label?: string;
  className?: string;
}

export function BalanceCard({
  balance,
  accountNumber,
  label = 'Account Balance',
  className,
}: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card className={cn('bg-gradient-to-br from-primary to-primary/80', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between text-primary-foreground">
          <div className="flex flex-col gap-1">
            <p className="text-sm opacity-90">{label}</p>
            {accountNumber && (
              <p className="text-xs opacity-75">Account: {accountNumber}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-primary-foreground">
            {isVisible ? `₦${balance.toLocaleString()}` : '••••••'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

