import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;
    
    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    // Validate required fields
    if (!body.amount) {
      return NextResponse.json(
        { error: 'amount is required' },
        { status: 400 }
      );
    }

    // Support both new format (plaidOptions) and legacy format (funding_details)
    let withdrawalData: any;
    
    if (body.plaidOptions) {
      // New format: direct plaid_options structure
      withdrawalData = {
        amount: body.amount,
        currency: body.currency || 'USD',
        method: body.method || 'ach_plaid',
        description: body.description,
        plaid_options: body.plaidOptions,
      };
    } else if (body.funding_details) {
      // Legacy format: map to new format
      const plaidOptions = body.funding_details.bank_account_id
        ? {
            item_id: body.funding_details.bank_account_id,
            account_id: body.funding_details.bank_account_id,
          }
        : undefined;

      if (!plaidOptions) {
        return NextResponse.json(
          { error: 'Plaid options are required for ACH withdrawals' },
          { status: 400 }
        );
      }

      withdrawalData = {
        amount: body.amount,
        currency: body.currency || body.funding_details.fiat_currency || 'USD',
        method: body.funding_details.method === 'ach' ? 'ach_plaid' : 'wire',
        description: body.description,
        plaid_options: plaidOptions,
      };
    } else {
      return NextResponse.json(
        { error: 'Either plaidOptions or funding_details is required' },
        { status: 400 }
      );
    }

    const response = await bluumApi.createWithdrawal(accountId, withdrawalData, body.idempotency_key);
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

