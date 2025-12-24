'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestmentService } from '@/services/investment.service';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  class: string;
  status: string;
  tradable: boolean;
  marginable?: boolean;
  shortable?: boolean;
  current_price?: number;
  price?: number;
  change?: number;
  changePercent?: number;
  previousClose?: number;
  bidPrice?: number;
  askPrice?: number;
}

interface ChartBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  symbol: string;
  bars: ChartBar[];
}

type Timeframe = '1Day' | '1Week' | '1Month';

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string)?.toUpperCase();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Month');
  const [error, setError] = useState<string | null>(null);

  // Load asset details
  useEffect(() => {
    const loadAsset = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        setError(null);

        const assetData = await InvestmentService.getAssetBySymbol(symbol);
        setAsset({
          id: assetData.id || symbol,
          symbol: assetData.symbol || symbol,
          name: assetData.name || assetData.display_name || symbol,
          class: assetData.class || assetData.asset_class || '',
          status: assetData.status || 'active',
          tradable: assetData.tradable !== false,
          marginable: assetData.marginable,
          shortable: assetData.shortable,
          current_price: assetData.current_price || assetData.price,
          price: assetData.price || assetData.current_price,
          change: assetData.change,
          changePercent: assetData.changePercent,
          previousClose: assetData.previousClose,
          bidPrice: assetData.bidPrice,
          askPrice: assetData.askPrice,
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load asset';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [symbol]);

  // Load chart data
  useEffect(() => {
    const loadChart = async () => {
      if (!symbol) return;

      try {
        setChartLoading(true);

        // Calculate limit based on timeframe
        const limits: Record<Timeframe, number> = {
          '1Day': 100,
          '1Week': 100,
          '1Month': 100,
        };

        const data = await InvestmentService.getChartData(
          symbol,
          timeframe,
          limits[timeframe]
        );

        setChartData(data);
      } catch (err: any) {
        console.error('Error loading chart:', err);
        toast.error('Failed to load chart data');
      } finally {
        setChartLoading(false);
      }
    };

    loadChart();
  }, [symbol, timeframe]);

  // Format chart data for recharts
  const formattedChartData = chartData?.bars?.map((bar) => ({
    timestamp: new Date(bar.timestamp).getTime(),
    date: new Date(bar.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  }));

  const currentPrice = asset?.current_price || asset?.price;
  const priceChange = asset?.change ?? 0;
  const priceChangePercent = asset?.changePercent ?? 0;
  const isPositive = priceChange >= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/invest')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Asset Details</h1>
            <p className="text-muted-foreground mt-1">
              View asset information and price history
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">{error || 'Asset not found'}</p>
            <Button onClick={() => router.push('/invest')} variant="outline">
              Back to Invest
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/invest')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{asset.symbol}</h1>
          <p className="text-muted-foreground mt-1">{asset.name}</p>
        </div>
        <Button onClick={() => router.push(`/invest/trade?side=buy&symbol=${asset.symbol}`)}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Trade
        </Button>
      </div>

      {/* Asset Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold mt-1">
                  {currentPrice != null ? `$${currentPrice.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <div className="flex items-center gap-2 mt-1">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <p
                    className={`text-2xl font-bold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {priceChange >= 0 ? '+' : ''}
                    {priceChange.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Change %</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {priceChangePercent >= 0 ? '+' : ''}
                  {priceChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previous Close</p>
                <p className="text-2xl font-bold mt-1">
                  {asset.previousClose != null ? `$${asset.previousClose.toFixed(2)}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-medium">{asset.symbol}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-right">{asset.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asset Class</span>
              <Badge variant="outline">{asset.class || 'N/A'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.bidPrice != null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bid Price</span>
                  <span className="font-medium">${asset.bidPrice.toFixed(2)}</span>
                </div>
                <Separator />
              </>
            )}
            {asset.askPrice != null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ask Price</span>
                  <span className="font-medium">${asset.askPrice.toFixed(2)}</span>
                </div>
                {asset.bidPrice != null && <Separator />}
              </>
            )}
            {asset.bidPrice != null && asset.askPrice != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spread</span>
                <span className="font-medium">
                  ${(asset.askPrice - asset.bidPrice).toFixed(2)}
                </span>
              </div>
            )}
            {!asset.bidPrice && !asset.askPrice && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Market data not available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price History Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Price History</CardTitle>
            </div>
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
              <TabsList>
                <TabsTrigger value="1Day">1D</TabsTrigger>
                <TabsTrigger value="1Week">1W</TabsTrigger>
                <TabsTrigger value="1Month">1M</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : formattedChartData && formattedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={formattedChartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? '#22c55e' : '#ef4444'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? '#22c55e' : '#ef4444'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => {
                    // Show fewer labels for better readability
                    const index = formattedChartData.findIndex((d) => d.date === value);
                    if (formattedChartData.length > 20) {
                      return index % Math.ceil(formattedChartData.length / 6) === 0
                        ? value
                        : '';
                    }
                    return value;
                  }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | undefined) => [
                    value != null ? `$${value.toFixed(2)}` : 'N/A',
                    'Price',
                  ]}
                  labelFormatter={(label) => {
                    const dataPoint = formattedChartData.find((d) => d.date === label);
                    return dataPoint ? new Date(dataPoint.timestamp).toLocaleString() : label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">No chart data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
