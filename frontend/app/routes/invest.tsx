import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, TrendingUp } from 'lucide-react';
import type { Route } from './+types/invest';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { BalanceCard } from '~/components/balance-card';
import { Separator } from '~/components/ui/separator';
import { InvestOnboarding } from '~/components/invest/onboarding';
import {
  getStocks,
  mockInvestmentBalance,
  mockTotalGain,
  mockTotalGainPercent,
  type Stock,
} from '~/lib/mock-data';
import { hasAcceptedInvestTerms, acceptInvestTerms } from '~/lib/auth';
import { toast } from 'sonner';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Invest' }, { name: 'description', content: 'Investment portfolio' }];
}

export default function Invest() {
  const [hasAccepted, setHasAccepted] = useState(hasAcceptedInvestTerms());
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasAccepted) {
      getStocks().then((data) => {
        setStocks(data);
        setLoading(false);
      });
    }
  }, [hasAccepted]);

  const handleAcceptTerms = () => {
    acceptInvestTerms();
    setHasAccepted(true);
    toast.success('Welcome to investing!');
  };

  const handleBuy = () => {
    toast.info('Buy feature coming soon');
  };

  const handleSell = () => {
    toast.info('Sell feature coming soon');
  };

  const handleDeposit = () => {
    toast.info('Deposit feature coming soon');
  };

  // Show onboarding if terms not accepted
  if (!hasAccepted) {
    return (
      <div className="">
        <InvestOnboarding onAccept={handleAcceptTerms} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Invest</h1>
        <p className="text-muted-foreground mt-1">Manage your investment portfolio</p>
      </div>

      {/* Investment Balance Card */}
      <BalanceCard
        balance={mockInvestmentBalance}
        label="Investment Balance"
        portfolioValue={{
          totalGain: mockTotalGain,
          totalGainPercent: mockTotalGainPercent,
        }}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Button onClick={handleBuy} className="h-auto flex-col gap-2 py-4">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm">Buy</span>
        </Button>
        <Button onClick={handleSell} variant="outline" className="h-auto flex-col gap-2 py-4">
          <TrendingUp className="h-5 w-5 rotate-180" />
          <span className="text-sm">Sell</span>
        </Button>
        <Button
          onClick={handleDeposit}
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">Deposit</span>
        </Button>
      </div>

      {/* Stock Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading portfolio...</div>
          ) : stocks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No holdings yet. Start investing!
            </div>
          ) : (
            <div className="space-y-4">
              {stocks.map((stock, index) => (
                <div key={stock.symbol}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{stock.symbol}</h3>
                        <Badge variant="outline" className="text-xs">
                          {stock.shares} shares
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                          <p className="text-sm font-medium">
                            ${stock.currentPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Value</p>
                          <p className="text-sm font-medium">${stock.value.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {stock.gain >= 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            stock.gain >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {stock.gain >= 0 ? '+' : ''}${stock.gain.toFixed(2)}
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          stock.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stock.gainPercent >= 0 ? '+' : ''}
                        {stock.gainPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  {index < stocks.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
