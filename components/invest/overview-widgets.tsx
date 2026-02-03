'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUp,
  ArrowDown,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth } from '@/lib/auth';
import { type RecentActivity, type QuickAction, type WidgetInsight } from '@/services/widget.service';

interface OverviewWidgetsProps {
  recentActivities?: RecentActivity[];
  quickActions?: QuickAction[];
  insights?: WidgetInsight[];
}

export function OverviewWidgets({
  recentActivities = [],
  quickActions = [],
  insights = [],
}: OverviewWidgetsProps) {
  const router = useRouter();
  const user = getAuth();
  const accountId = user?.externalAccountId;

  // Convert quick actions from service format to component format
  const iconMap: Record<string, React.ReactNode> = {
    'arrow-up': <ArrowUp className="h-5 w-5" />,
    'arrow-down': <ArrowDown className="h-5 w-5" />,
    settings: <Settings className="h-5 w-5" />,
    clock: <Clock className="h-5 w-5" />,
  };

  const insightIconMap: Record<string, React.ReactNode> = {
    clock: <Clock className="h-5 w-5" />,
    'check-circle': <CheckCircle2 className="h-5 w-5" />,
    'alert-circle': <AlertCircle className="h-5 w-5" />,
  };

  const convertedQuickActions = quickActions.map((action) => ({
    ...action,
    icon: iconMap[action.icon] || <ArrowUp className="h-5 w-5" />,
    onClick: () => router.push(action.route),
  }));

  const convertedInsights = insights.map((insight) => ({
    ...insight,
    icon: insightIconMap[insight.icon] || <Clock className="h-5 w-5" />,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!accountId) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Recent Activity Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const isPositive = activity.amount !== null && activity.amount >= 0;
              const isNegative = activity.amount !== null && activity.amount < 0;

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">{activity.iconEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <span
                        className={`text-sm font-semibold ml-2 ${isPositive
                          ? 'text-green-600'
                          : isNegative
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                          }`}
                      >
                        {activity.amount === null
                          ? '—'
                          : `${isPositive ? '+' : ''}${formatCurrency(Math.abs(activity.amount))}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {convertedQuickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${action.iconColor}15`,
                    color: action.iconColor,
                  }}
                >
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {convertedInsights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${insight.iconColor}15`,
                    color: insight.iconColor,
                  }}
                >
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.actionLabel && insight.actionLink && (
                    <Link
                      href={insight.actionLink}
                      className="text-xs font-medium mt-2 inline-block"
                      style={{ color: '#3B82F6' }}
                    >
                      {insight.actionLabel}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
