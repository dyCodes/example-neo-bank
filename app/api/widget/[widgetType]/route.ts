import { NextRequest, NextResponse } from 'next/server';

// Demo data for all widget types
const demoData = {
  insights: [
    {
      id: 'portfolio-performance',
      type: 'success',
      text: 'Your portfolio is up',
      value: '18%',
      description: 'YTD outperforming the market benchmark by +1.2%',
    },
    {
      id: 'sector-concentration',
      type: 'warning',
      text: 'Over',
      value: '52%',
      description: 'of your portfolio is in one sector (Technology), increasing risk',
    },
    {
      id: 'fund-fees',
      type: 'warning',
      text: 'Your mutual funds cost',
      value: '1.8%',
      description: 'annually, which reduces long-term growth',
    },
    {
      id: 'liquidity',
      type: 'warning',
      text: 'Only',
      value: '20%',
      description: 'of your portfolio can be liquidated within 24 hours',
    },
  ],
  accounts: [
    {
      id: 'credit-card',
      name: 'Credit Card',
      initials: 'CC',
      iconColor: '#1E40AF',
      iconBgColor: '#DBEAFE',
      balanceMasked: true,
    },
    {
      id: 'checking',
      name: 'Checking',
      initials: 'CK',
      iconColor: '#166534',
      iconBgColor: '#D1FAE5',
      subDetails: '••8619',
      balanceMasked: true,
    },
    {
      id: 'savings',
      name: 'Savings',
      initials: 'SV',
      iconColor: '#7C3AED',
      iconBgColor: '#EDE9FE',
      subDetails: '••6488',
      balanceMasked: true,
    },
    {
      id: 'treasury',
      name: 'Treasury',
      initials: 'TR',
      iconColor: '#1E40AF',
      iconBgColor: '#DBEAFE',
      subDetails: '4.06% APY',
      balance: 924156.28,
      balanceMasked: false,
    },
    {
      id: 'invest',
      name: 'Invest',
      initials: 'IV',
      iconColor: '#166534',
      iconBgColor: '#D1FAE5',
      subDetails: '+8.67% YTD',
      subDetailsColor: '#10B981',
      balance: 923236.26,
      balanceMasked: false,
      performance: {
        value: 8.67,
        label: 'YTD',
        isPositive: true,
      },
    },
  ],
  'financial-goals': [
    {
      id: 'retirement',
      title: 'Retirement Fund',
      target: 'Target: $2,500,000 by 2045',
      currentAmount: 1825000,
      targetAmount: 2500000,
      progress: 73,
      icon: 'umbrella',
      iconColor: '#9333EA',
      iconBgColor: 'rgba(191, 90, 242, 0.12)',
      barColor: '#30D158',
      status: 'in-progress',
    },
    {
      id: 'emergency',
      title: 'Emergency Fund',
      target: 'Target: 6 months expenses',
      currentAmount: 90000,
      targetAmount: 90000,
      progress: 100,
      icon: 'shield',
      iconColor: '#9333EA',
      iconBgColor: 'rgba(191, 90, 242, 0.12)',
      barColor: '#30D158',
      status: 'complete',
    },
    {
      id: 'wealth-growth',
      title: 'Wealth Growth',
      target: 'Target: $5,000,000 by 2035',
      currentAmount: 2250000,
      targetAmount: 5000000,
      progress: 45,
      icon: 'trending-up',
      iconColor: '#9333EA',
      iconBgColor: 'rgba(191, 90, 242, 0.12)',
      barColor: '#30D158',
      status: 'in-progress',
    },
    {
      id: 'education',
      title: 'Education Fund',
      target: 'Target: $500,000 by 2030',
      currentAmount: 150000,
      targetAmount: 500000,
      progress: 30,
      icon: 'umbrella',
      iconColor: '#9333EA',
      iconBgColor: 'rgba(191, 90, 242, 0.12)',
      barColor: '#30D158',
      status: 'in-progress',
    },
  ],
  'investment-policy': {
    riskTolerance: {
      level: 'Moderate-High',
      position: 75,
      description: 'Growth-oriented portfolio',
    },
    timeHorizon: {
      range: '15-20 Years',
      description: 'Long-term investment horizon',
    },
    liquidity: {
      percentage: 5,
      description: 'Maintain 5% in cash/equivalents for operational needs.',
    },
    taxConsiderations: 'Prioritize tax-advantaged accounts; harvest losses annually.',
    objectives: [
      { text: 'Capital appreciation', tag: 'PRIMARY', tagColor: 'bg-red-500' },
      { text: 'Income generation', tag: 'SECONDARY', tagColor: 'bg-orange-500' },
      { text: 'Tax efficiency', tag: 'TERTIARY', tagColor: 'bg-blue-500' },
    ],
    targetAllocation: [
      { name: 'Stocks', value: 50, color: '#22C55E' },
      { name: 'Bonds', value: 25, color: '#3B82F6' },
      { name: 'Treasury', value: 20, color: '#9333EA' },
      { name: 'Alternatives', value: 5, color: '#F97316' },
    ],
    restrictions: 'No individual stocks; ESG screening on all holdings.',
    rebalancing: 'Quarterly review; rebalance when drift exceeds ±5%.',
  },
  'recent-activities': [
    {
      id: 'deposit-1',
      type: 'deposit',
      title: 'Deposit to Invest',
      description: 'From Operating Account',
      amount: 50000,
      date: 'Today',
      iconEmoji: '💰',
    },
    {
      id: 'dividend-1',
      type: 'dividend',
      title: 'Dividend Received',
      description: 'VTI Quarterly Dividend',
      amount: 1247.32,
      date: 'Yesterday',
      iconEmoji: '📈',
    },
    {
      id: 'rebalance-1',
      type: 'rebalance',
      title: 'Auto-Rebalance',
      description: 'Portfolio rebalanced to target',
      amount: null,
      date: 'Jan 25',
      iconEmoji: '⚖️',
    },
    {
      id: 'withdrawal-1',
      type: 'withdrawal',
      title: 'Transfer to Checking',
      description: 'From Treasury Account',
      amount: 25000,
      date: 'Jan 24',
      iconEmoji: '💸',
    },
  ],
  'widget-insights': [
    {
      id: 'tax-optimization',
      title: 'Tax Optimization',
      description:
        "Your Treasury holdings are typically exempt from state and local<br/>taxes. You've saved an estimated $847 in taxes this year.",
      icon: 'question',
      iconColor: '#5856D6',
      iconBgColor: 'rgba(88, 86, 214, 0.10)',
    },
    {
      id: 'outperforming',
      title: 'Outperforming Benchmark',
      description:
        'Your portfolio is beating the S&P 500 by 3.44% this month. Great<br/>diversification strategy!',
      icon: 'check',
      iconColor: '#5856D6',
      iconBgColor: 'rgba(88, 86, 214, 0.10)',
    },
    {
      id: 'rebalancing',
      title: 'Rebalancing Opportunity',
      description:
        'Your stock allocation has drifted 2% above target. Consider<br/>rebalancing to maintain your risk profile.',
      icon: 'alert',
      iconColor: '#5856D6',
      iconBgColor: 'rgba(88, 86, 214, 0.10)',
      actionLabel: 'Review allocation',
      actionLink: '/invest/trade',
    },
  ],
};

// Generate demo portfolio performance data
function generatePortfolioPerformance(range: '1W' | '1M' | '3M' | '1Y' | 'All') {
  const now = new Date();
  const data: Array<{ date: string; portfolio: number; sp500: number }> = [];

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
  const portfolioDailyReturn = range === '1M' ? 0.0028 : 0.0015;
  const sp500DailyReturn = range === '1M' ? 0.0017 : 0.0012;

  for (let i = 0; i <= days; i += interval) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));

    // Add some volatility
    const portfolioVolatility = (Math.random() - 0.5) * 0.01;
    const sp500Volatility = (Math.random() - 0.5) * 0.008;

    portfolioValue *= 1 + portfolioDailyReturn + portfolioVolatility;
    sp500Value *= 1 + sp500DailyReturn + sp500Volatility;

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
}

export async function GET(
  request: NextRequest,
  { params }: { params: { widgetType: string } }
) {
  try {
    const { widgetType } = params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    // In the future, this would fetch from a real API based on account_id
    // For now, we return demo data

    // Handle portfolio-performance which needs a range parameter
    if (widgetType === 'portfolio-performance') {
      const range = (searchParams.get('range') || '1M') as '1W' | '1M' | '3M' | '1Y' | 'All';
      const data = generatePortfolioPerformance(range);
      return NextResponse.json(data);
    }

    // Get data for other widget types
    const data = demoData[widgetType as keyof typeof demoData];

    if (!data) {
      return NextResponse.json(
        {
          error: `Unknown widget type: ${widgetType}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || `Failed to fetch ${params.widgetType}`,
      },
      { status: 500 }
    );
  }
}
