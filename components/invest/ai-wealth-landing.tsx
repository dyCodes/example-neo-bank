'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NetWorthChart } from './net-worth-chart';
import { PersonalizedInsights } from './insights-cards';
import { TrendingStocks } from './trending-stocks';
import { InvestOnboarding } from './onboarding';

interface AIWealthLandingProps {
  onStartOnboarding: () => void;
  showOnboarding?: boolean;
  onAccountCreated?: (accountId?: string) => void;
}

export function AIWealthLanding({
  onStartOnboarding,
  showOnboarding = false,
  onAccountCreated,
}: AIWealthLandingProps) {
  if (showOnboarding && onAccountCreated) {
    return <InvestOnboarding onAccept={onAccountCreated} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-[#edf9cd] dark:bg-emerald-900/30">
            <Sparkles className="h-6 w-6 text-[#083423] dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#083423] dark:text-white">
              AI Personalized Wealth Management
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="border-[#083423] text-[#083423] bg-[#edf9cd] dark:border-emerald-500/50 dark:text-emerald-400 dark:bg-emerald-900/20"
              >
                AI-Powered
              </Badge>
              <p className="text-sm text-muted-foreground">
                Let AI optimize your portfolio for maximum growth
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground max-w-3xl">
          Experience the future of investing with AI-driven portfolio management. Our advanced
          algorithms analyze market trends, your financial goals, and risk tolerance to create a
          personalized investment strategy that adapts to your life events and market conditions.
        </p>

        <Button
          onClick={onStartOnboarding}
          size="lg"
          className="mt-4 bg-[#083423] text-white hover:bg-[#083423]/90 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          Get Started with AI Wealth Management
        </Button>
      </div>

      {/* Net Worth Growth Chart */}
      <NetWorthChart />

      {/* Personalized Insights */}
      <PersonalizedInsights />

      {/* Trending Stocks */}
      <TrendingStocks />
    </div>
  );
}

