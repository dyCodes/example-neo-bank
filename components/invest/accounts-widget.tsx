'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-react';
import { WidgetService, type Account } from '@/services/widget.service';

export type { Account };

interface AccountsWidgetProps {
  accounts?: Account[];
  onAddAccount?: () => void;
  onAccountClick?: (accountId: string) => void;
}

export function AccountsWidget({
  accounts,
  onAddAccount,
  onAccountClick,
}: AccountsWidgetProps) {
  // Use WidgetService for demo data if accounts not provided
  const displayAccounts = accounts || WidgetService.getAccounts();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const maskBalance = (value: number) => {
    // Count digits in the integer part
    const integerPart = Math.floor(value).toString();
    const digitCount = integerPart.length;
    // Return masked string with appropriate number of dots
    return '$' + '•'.repeat(Math.max(4, digitCount));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Accounts</CardTitle>
          <div className="flex items-center gap-2">
            {onAddAccount ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onAddAccount}
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
              onClick={() => onAccountClick?.(account.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm"
                  style={{
                    backgroundColor: account.iconBgColor,
                    color: account.iconColor,
                  }}
                >
                  {account.initials}
                </div>

                {/* Account Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{account.name}</p>
                  {account.subDetails && (
                    <p
                      className="text-xs text-gray-600 mt-0.5"
                      style={
                        account.subDetailsColor
                          ? { color: account.subDetailsColor }
                          : undefined
                      }
                    >
                      {account.subDetails}
                    </p>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div className="text-right shrink-0 ml-4">
                {account.balance !== undefined ? (
                  <>
                    <p className="font-semibold text-sm">
                      {account.balanceMasked
                        ? maskBalance(account.balance)
                        : formatCurrency(account.balance)}
                    </p>
                  </>
                ) : account.balanceMasked ? (
                  <p className="font-semibold text-sm">$••••</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
