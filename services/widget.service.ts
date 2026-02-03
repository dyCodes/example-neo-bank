// Widget Service - Demo data for investment widgets
// This service provides demo data for all investment dashboard widgets
// Makes API calls to /api/widget/* endpoints which return demo data

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || 'An error occurred'
    );
  }
  return response.json();
}

export interface Insight {
  id: string;
  type: 'success' | 'warning';
  text: string;
  value: string;
  description: string;
}

export interface Account {
  id: string;
  name: string;
  initials: string;
  iconColor: string;
  iconBgColor: string;
  subDetails?: string;
  subDetailsColor?: string;
  balance?: number;
  balanceMasked?: boolean;
  performance?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export interface FinancialGoal {
  id: string;
  title: string;
  target: string;
  currentAmount: number;
  targetAmount: number;
  progress: number; // 0-100
  icon: string; // Icon name/identifier
  iconColor: string;
  iconBgColor: string;
  barColor: string;
  status?: 'complete' | 'in-progress';
}

export interface AllocationData {
  name: string;
  value: number;
  color: string;
}

export interface InvestmentPolicy {
  riskTolerance: {
    level: string;
    position: number; // 0-100 percentage
    description: string;
  };
  timeHorizon: {
    range: string;
    description: string;
  };
  liquidity: {
    percentage: number;
    description: string;
  };
  taxConsiderations: string;
  objectives: Array<{
    text: string;
    tag: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
    tagColor: string;
  }>;
  targetAllocation: AllocationData[];
  restrictions: string;
  rebalancing: string;
}

export interface PerformanceDataPoint {
  date: string;
  portfolio: number;
  sp500: number;
}

export interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'dividend' | 'rebalance' | 'transfer';
  title: string;
  description: string;
  amount: number | null;
  date: string;
  iconEmoji: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon identifier
  iconColor: string;
  route: string;
}

export interface WidgetInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  actionLabel?: string;
  actionLink?: string;
}

// Widget Service
export class WidgetService {
  /**
   * Get insights data for InsightsWidget
   */
  static async getInsights(accountId?: string): Promise<Insight[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/insights${queryParams}`);
    return handleResponse<Insight[]>(response);
  }

  /**
   * Get accounts data for AccountsWidget
   */
  static async getAccounts(accountId?: string): Promise<Account[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/accounts${queryParams}`);
    return handleResponse<Account[]>(response);
  }

  /**
   * Get financial goals data for FinancialPlan widget
   */
  static async getFinancialGoals(accountId?: string): Promise<FinancialGoal[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/financial-goals${queryParams}`);
    return handleResponse<FinancialGoal[]>(response);
  }

  /**
   * Get investment policy data for InvestmentPolicyWidget
   */
  static async getInvestmentPolicy(accountId?: string): Promise<InvestmentPolicy> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/investment-policy${queryParams}`);
    return handleResponse<InvestmentPolicy>(response);
  }

  /**
   * Get portfolio performance chart data
   */
  static async getPortfolioPerformanceData(
    range: '1W' | '1M' | '3M' | '1Y' | 'All' = '1M',
    accountId?: string
  ): Promise<PerformanceDataPoint[]> {
    const queryParams = new URLSearchParams({
      range,
      ...(accountId && { account_id: accountId }),
    });
    const response = await fetch(`/api/widget/portfolio-performance?${queryParams}`);
    return handleResponse<PerformanceDataPoint[]>(response);
  }

  /**
   * Get recent activities for OverviewWidgets
   */
  static async getRecentActivities(accountId?: string): Promise<RecentActivity[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/recent-activities${queryParams}`);
    return handleResponse<RecentActivity[]>(response);
  }

  /**
   * Get quick actions for OverviewWidgets
   */
  static async getQuickActions(accountId?: string): Promise<QuickAction[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/quick-actions${queryParams}`);
    return handleResponse<QuickAction[]>(response);
  }

  /**
   * Get insights for OverviewWidgets
   */
  static async getWidgetInsights(accountId?: string): Promise<WidgetInsight[]> {
    const queryParams = accountId ? `?account_id=${encodeURIComponent(accountId)}` : '';
    const response = await fetch(`/api/widget/widget-insights${queryParams}`);
    return handleResponse<WidgetInsight[]>(response);
  }

  /**
   * Calculate portfolio performance percentage from data
   */
  static calculatePerformance(data: PerformanceDataPoint[]): { portfolio: number; sp500: number } {
    if (data.length === 0) return { portfolio: 0, sp500: 0 };

    const startPortfolio = data[0].portfolio;
    const endPortfolio = data[data.length - 1].portfolio;
    const startSp500 = data[0].sp500;
    const endSp500 = data[data.length - 1].sp500;

    return {
      portfolio: ((endPortfolio - startPortfolio) / startPortfolio) * 100,
      sp500: ((endSp500 - startSp500) / startSp500) * 100,
    };
  }
}
