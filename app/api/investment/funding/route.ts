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

    // Map legacy format (funding_details) or new format (plaidOptions) to createDeposit format
    let depositData: any;

    if (body.plaidOptions) {
      // New format: direct plaid_options structure
      depositData = {
        amount: body.amount,
        currency: body.currency || 'USD',
        method: body.method || 'ach_plaid',
        description: body.description,
        plaid_options: body.plaidOptions,
      };
    } else if (body.funding_details) {
      // Legacy format: map to new format
      if (body.public_token) {
        // Plaid connection
        depositData = {
          amount: body.amount,
          currency: body.funding_details.fiat_currency || 'USD',
          method: body.funding_details.method === 'ach' ? 'ach_plaid' : 'wire',
          description: body.description,
          plaid_options: {
            public_token: body.public_token,
          },
        };
      } else {
        // Manual bank transfer
        depositData = {
          amount: body.amount,
          currency: body.funding_details.fiat_currency || 'USD',
          method: 'manual_bank_transfer',
          description: body.description,
        };
      }
    } else {
      return NextResponse.json(
        { error: 'Either plaidOptions or funding_details is required' },
        { status: 400 }
      );
    }

    const response = await bluumApi.createDeposit(accountId, depositData, body.external_reference_id);
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

