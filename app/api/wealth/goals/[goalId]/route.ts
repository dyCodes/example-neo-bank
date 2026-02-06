import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const { goalId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const includeProjections = searchParams.get('include_projections') === 'true';
    const goal = await bluumApi.getGoal(accountId, goalId, {
      include_projections: includeProjections,
    });
    return NextResponse.json(goal);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const { goalId } = await params;
    const body = await request.json();
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'account_id is required' },
        { status: 400 }
      );
    }

    const goalData: Partial<{
      name: string;
      goal_type: 'retirement' | 'education' | 'emergency' | 'wealth_growth' | 'home_purchase' | 'custom';
      target_amount: string;
      target_date: string;
      priority: number;
      monthly_contribution: string;
      status: 'active' | 'completed' | 'archived';
    }> = {};

    if (body.name !== undefined) goalData.name = body.name;
    if (body.goal_type !== undefined) goalData.goal_type = body.goal_type;
    if (body.target_amount !== undefined) goalData.target_amount = body.target_amount;
    if (body.target_date !== undefined) goalData.target_date = body.target_date;
    if (body.priority !== undefined) goalData.priority = body.priority;
    if (body.monthly_contribution !== undefined) goalData.monthly_contribution = body.monthly_contribution;
    if (body.status !== undefined) goalData.status = body.status;

    const response = await bluumApi.updateGoal(accountId, goalId, goalData);
    return NextResponse.json(response);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const { goalId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    await bluumApi.deleteGoal(accountId, goalId);
    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
