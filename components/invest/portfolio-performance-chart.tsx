'use client';

import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  ComposedChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'All';

interface PerformanceDataPoint {
  date: string;
  portfolio: number;
  sp500: number;
}

interface PortfolioPerformanceChartProps {
  data?: PerformanceDataPoint[];
  portfolioPerformance?: number; // Percentage gain for selected period
  sp500Performance?: number; // Percentage gain for selected period
}

// Demo data for different time ranges
const generateDemoData = (range: TimeRange): PerformanceDataPoint[] => {
  const now = new Date();
  const data: PerformanceDataPoint[] = [];

  let days = 0;
  let interval = 1; // days between data points

  switch (range) {
    case '1W':
      days = 7;
      interval = 1;
      break;
    case '1M':
      days = 30;
      interval = 1;
      break;
    case '3M':
      days = 90;
      interval = 3;
      break;
    case '1Y':
      days = 365;
      interval = 7;
      break;
    case 'All':
      days = 365;
      interval = 30;
      break;
  }

  // Starting values (normalized to 100)
  let portfolioValue = 100;
  let sp500Value = 100;

  // Portfolio slightly outperforms S&P 500
  const portfolioDailyReturn = range === '1M' ? 0.0028 : 0.0015; // ~8.67% for 1M, ~5% for others
  const sp500DailyReturn = range === '1M' ? 0.0017 : 0.0012; // ~5.23% for 1M, ~4% for others

  for (let i = 0; i <= days; i += interval) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));

    // Add some volatility
    const portfolioVolatility = (Math.random() - 0.5) * 0.01;
    const sp500Volatility = (Math.random() - 0.5) * 0.008;

    portfolioValue *= (1 + portfolioDailyReturn + portfolioVolatility);
    sp500Value *= (1 + sp500DailyReturn + sp500Volatility);

    let dateLabel = '';
    if (range === '1W' || range === '1M') {
      dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (range === '3M') {
      dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    data.push({
      date: dateLabel,
      portfolio: portfolioValue,
      sp500: sp500Value,
    });
  }

  return data;
};

// Calculate performance percentage
const calculatePerformance = (data: PerformanceDataPoint[]): { portfolio: number; sp500: number } => {
  if (data.length === 0) return { portfolio: 0, sp500: 0 };

  const startPortfolio = data[0].portfolio;
  const endPortfolio = data[data.length - 1].portfolio;
  const startSp500 = data[0].sp500;
  const endSp500 = data[data.length - 1].sp500;

  return {
    portfolio: ((endPortfolio - startPortfolio) / startPortfolio) * 100,
    sp500: ((endSp500 - startSp500) / startSp500) * 100,
  };
};

export function PortfolioPerformanceChart({
  data: externalData,
  portfolioPerformance,
  sp500Performance,
}: PortfolioPerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');

  const chartData = useMemo(() => {
    return externalData || generateDemoData(selectedRange);
  }, [externalData, selectedRange]);

  const performance = useMemo(() => {
    if (portfolioPerformance !== undefined && sp500Performance !== undefined) {
      return { portfolio: portfolioPerformance, sp500: sp500Performance };
    }
    return calculatePerformance(chartData);
  }, [chartData, portfolioPerformance, sp500Performance]);

  const timeRanges: TimeRange[] = ['1W', '1M', '3M', '1Y', 'All'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as PerformanceDataPoint;
      const portfolioPercent = ((dataPoint.portfolio - 100) / 100) * 100;
      const sp500Percent = ((dataPoint.sp500 - 100) / 100) * 100;

      return (
        <div className="rounded-lg border border-white/10 bg-[#0E0F1A] p-3 shadow-lg">
          <p className="text-xs font-medium text-white/80 mb-2">{dataPoint.date}</p>
          {payload.map((entry: any, index: number) => {
            const percent = entry.dataKey === 'portfolio' ? portfolioPercent : sp500Percent;
            return (
              <p
                key={index}
                className="text-xs"
                style={{
                  color: entry.dataKey === 'portfolio' ? '#60A5FA' : '#9CA3AF',
                }}
              >
                {entry.dataKey === 'portfolio' ? 'Your Portfolio' : 'S&P 500'}:{' '}
                {percent >= 0 ? '+' : ''}
                {percent.toFixed(2)}%
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#141522] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Portfolio Performance</CardTitle>
              <p className="text-xs text-white/60 mt-1">Compared to S&P 500 benchmark</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-colors ${selectedRange === range
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-white/5 bg-[#0F111B] p-4">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
                tickLine={false}
                axisLine={false}
                height={32}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.45)' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                hide
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#60A5FA"
                strokeWidth={2}
                fill="url(#colorPortfolio)"
                name="Your Portfolio"
              />
              <Line
                type="monotone"
                dataKey="sp500"
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                name="S&P 500"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              <span className="text-xs text-white/70">Your Portfolio</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {performance.portfolio >= 0 ? '+' : ''}
              {performance.portfolio.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
              <span className="text-xs text-white/70">S&P 500</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {performance.sp500 >= 0 ? '+' : ''}
              {performance.sp500.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
