'use client';

import { ChevronDown } from 'lucide-react';
import { type Insight } from '@/services/widget.service';

interface InsightsWidgetProps {
  insights?: Insight[];
  // Props kept for future use when connecting to real data
  positions?: any[];
  portfolioGains?: {
    totalGain: number;
    totalGainPercent: number;
  };
  accountBalance?: number;
}

export function InsightsWidget({
  insights = [],
  positions,
  portfolioGains,
  accountBalance,
}: InsightsWidgetProps) {

  return (
    <div
      className="w-full h-full p-4 rounded-xl overflow-hidden bg-white border border-gray-200"
      style={{
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
        <div
          className="text-base font-semibold"
          style={{ color: '#1F2937', fontSize: 16, fontFamily: 'Inter', fontWeight: 600 }}
        >
          Your Insights
        </div>
        <ChevronDown className="w-[18px] h-[18px] text-gray-600" />
      </div>

      {/* Insights Pills */}
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="px-2 py-1 rounded-[20px] flex items-center flex-wrap"
            style={{
              gap: 4,
              background:
                insight.type === 'success'
                  ? 'linear-gradient(0deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)'
                  : 'linear-gradient(0deg, rgba(239, 68, 68, 0.10) 0%, rgba(239, 68, 68, 0.10) 100%)',
              borderRadius: 20,
            }}
          >
            <span
              className="text-xs font-normal"
              style={{
                color: '#374151',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              {insight.text}
            </span>
            <div
              className="px-1 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  insight.type === 'success'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                borderRadius: 16,
              }}
            >
              <span
                className="text-xs font-medium text-center leading-[18px]"
                style={{
                  color: insight.type === 'success' ? '#22C55E' : '#EF4444',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                }}
              >
                {insight.value}
              </span>
            </div>
            <span
              className="text-xs font-normal"
              style={{
                color: '#374151',
                fontSize: 12,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}
            >
              {insight.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
