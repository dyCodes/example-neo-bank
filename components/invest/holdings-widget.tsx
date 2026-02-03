'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { InvestmentService, type Position } from '@/services/investment.service';
import { getAuth } from '@/lib/auth';

export type AssetCategory = 'all' | 'treasury' | 'stocks' | 'bonds';

interface ExtendedPosition extends Position {
  assetType?: 'Money Market' | 'Ultra-Short Bond' | 'US Equity ETF' | 'Bond ETF' | 'Treasury Bill ETF' | 'Stock';
  category?: AssetCategory;
  todayChange?: number;
  allocation?: number;
  iconColor?: string;
}

// Mock holdings data matching the image
const mockHoldings: ExtendedPosition[] = [
  {
    symbol: 'JTCXX',
    name: 'J.P. Morgan Treasury Plus',
    shares: 692417.21,
    currentPrice: 1.0,
    purchasePrice: 1.0,
    value: 692417.21,
    gain: 77.12,
    gainPercent: 0.01,
    assetType: 'Money Market',
    category: 'treasury',
    todayChange: 77.12,
    allocation: 37.5,
    iconColor: '#4B5563', // dark grey
  },
  {
    symbol: 'MULSX',
    name: 'Morgan Stanley Ultra-Short',
    shares: 23012.84,
    currentPrice: 10.07,
    purchasePrice: 10.0,
    value: 231739.07,
    gain: 24.89,
    gainPercent: 0.01,
    assetType: 'Ultra-Short Bond',
    category: 'bonds',
    todayChange: 24.89,
    allocation: 12.5,
    iconColor: '#9333EA', // purple
  },
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market',
    shares: 1847.39,
    currentPrice: 300.02,
    purchasePrice: 295.0,
    value: 554217.76,
    gain: 8847.23,
    gainPercent: 1.62,
    assetType: 'US Equity ETF',
    category: 'stocks',
    todayChange: 8847.23,
    allocation: 30.0,
    iconColor: '#10B981', // green
  },
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market',
    shares: 3847.62,
    currentPrice: 72.02,
    purchasePrice: 72.5,
    value: 277108.88,
    gain: -384.76,
    gainPercent: -0.14,
    assetType: 'Bond ETF',
    category: 'bonds',
    todayChange: -384.76,
    allocation: 15.0,
    iconColor: '#F97316', // orange
  },
  {
    symbol: 'SGOV',
    name: 'iShares 0-3 Month Treasury',
    shares: 913.24,
    currentPrice: 100.63,
    purchasePrice: 100.5,
    value: 91909.62,
    gain: 9.13,
    gainPercent: 0.01,
    assetType: 'Treasury Bill ETF',
    category: 'treasury',
    todayChange: 9.13,
    allocation: 5.0,
    iconColor: '#3B82F6', // light blue
  },
];

export function HoldingsWidget() {
  const [holdings, setHoldings] = useState<ExtendedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('all');
  const user = getAuth();
  const accountId = user?.externalAccountId;

  useEffect(() => {
    const loadHoldings = async () => {
      setLoading(true);
      try {
        if (accountId) {
          // Try to load real positions
          const positions = await InvestmentService.getPositions(accountId);
          if (positions && positions.length > 0) {
            // Transform positions to ExtendedPosition format
            const totalValue = positions.reduce((sum, pos) => sum + (pos.value || 0), 0);
            const extendedPositions: ExtendedPosition[] = positions.map((pos, index) => {
              // Determine category based on symbol/name
              const symbol = pos.symbol.toUpperCase();
              let category: AssetCategory = 'stocks';
              let assetType: ExtendedPosition['assetType'] = 'Stock';
              let iconColor = '#083423'; // default

              if (symbol.includes('TREASURY') || symbol.includes('SGOV') || symbol.includes('JTC')) {
                category = 'treasury';
                assetType = symbol.includes('SGOV') ? 'Treasury Bill ETF' : 'Money Market';
                iconColor = symbol.includes('SGOV') ? '#3B82F6' : '#4B5563';
              } else if (symbol.includes('BND') || symbol.includes('MULSX')) {
                category = 'bonds';
                assetType = symbol.includes('BND') ? 'Bond ETF' : 'Ultra-Short Bond';
                iconColor = symbol.includes('BND') ? '#F97316' : '#9333EA';
              } else if (symbol.includes('VTI')) {
                category = 'stocks';
                assetType = 'US Equity ETF';
                iconColor = '#10B981';
              }

              return {
                ...pos,
                assetType,
                category,
                todayChange: pos.gain || 0,
                allocation: totalValue > 0 ? ((pos.value || 0) / totalValue) * 100 : 0,
                iconColor,
              };
            });
            setHoldings(extendedPositions);
          } else {
            // Use mock data if no positions
            setHoldings(mockHoldings);
          }
        } else {
          // Use mock data if no account
          setHoldings(mockHoldings);
        }
      } catch (error) {
        console.error('Failed to load holdings:', error);
        // Fallback to mock data
        setHoldings(mockHoldings);
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();
  }, [accountId]);

  const filteredHoldings = useMemo(() => {
    if (selectedCategory === 'all') {
      return holdings;
    }
    return holdings.filter((holding) => holding.category === selectedCategory);
  }, [holdings, selectedCategory]);

  const totalValue = useMemo(() => {
    return filteredHoldings.reduce((sum, holding) => sum + (holding.value || 0), 0);
  }, [filteredHoldings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getTickerFromSymbol = (symbol: string) => {
    // Extract ticker (first 2-4 letters) from symbol
    return symbol.substring(0, 4).toUpperCase();
  };

  const getAssetTypeLabel = (holding: ExtendedPosition) => {
    if (holding.assetType) return holding.assetType;
    // Fallback logic
    const symbol = holding.symbol.toUpperCase();
    if (symbol.includes('TREASURY') || symbol.includes('SGOV')) return 'Treasury';
    if (symbol.includes('BND') || symbol.includes('BOND')) return 'Bond ETF';
    if (symbol.includes('VTI') || symbol.includes('ETF')) return 'US Equity ETF';
    return 'Stock';
  };

  const categories: { key: AssetCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'treasury', label: 'Treasury' },
    { key: 'stocks', label: 'Stocks' },
    { key: 'bonds', label: 'Bonds' },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">Loading holdings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Holdings</CardTitle>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedCategory === category.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredHoldings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No holdings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ASSET
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    VALUE
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SHARES
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    PRICE
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TODAY
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ALLOCATION
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((holding, index) => {
                  const ticker = getTickerFromSymbol(holding.symbol);
                  const isPositive = (holding.todayChange || 0) >= 0;
                  const allocation = holding.allocation || 0;

                  return (
                    <tr key={holding.symbol || index} className="border-b hover:bg-gray-50">
                      {/* ASSET */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-12 rounded flex items-center justify-center text-white font-semibold text-sm"
                            style={{ backgroundColor: holding.iconColor || '#083423' }}
                          >
                            {ticker}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{holding.name}</div>
                            <div className="text-xs text-gray-500">
                              {holding.symbol}
                              {holding.assetType && ` • ${getAssetTypeLabel(holding)}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VALUE */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(holding.value || 0)}
                        </div>
                      </td>

                      {/* SHARES */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-gray-900">{formatNumber(holding.shares || 0, 2)}</div>
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-gray-900">
                          {formatCurrency(holding.currentPrice || 0)}
                        </div>
                      </td>

                      {/* TODAY */}
                      <td className="py-4 px-4 text-right">
                        <div
                          className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {isPositive ? '+' : ''}
                            {formatCurrency(holding.todayChange || 0)}
                          </span>
                        </div>
                      </td>

                      {/* ALLOCATION */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${allocation}%`,
                                backgroundColor: holding.iconColor || '#083423',
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[45px] text-right">
                            {allocation.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
