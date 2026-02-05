import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bluumAccountId = body.account_id;

    if (!bluumAccountId) {
      return NextResponse.json(
        { error: 'account_id (Bluum account ID) is required' },
        { status: 400 }
      );
    }

    if (!body.amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 });
    }

    const plaidOptions = body.plaidOptions || {
      publicToken: body.publicToken,
      itemId: body.itemId,
      accountId: body.accountId,
    };

    if (!plaidOptions?.publicToken && !plaidOptions?.itemId) {
      return NextResponse.json(
        {
          error:
            'Plaid options are required. Provide publicToken or itemId for ach_plaid deposits.',
        },
        { status: 400 }
      );
    }

    // Build plaid_options with only provided fields (snake_case for API)
    const plaidOptionsPayload: any = {};
    if (plaidOptions.publicToken) {
      plaidOptionsPayload.public_token = plaidOptions.publicToken;
    }
    if (plaidOptions.itemId) {
      plaidOptionsPayload.item_id = plaidOptions.itemId;
    }
    if (plaidOptions.accountId) {
      plaidOptionsPayload.account_id = plaidOptions.accountId;
    }

    const depositData = {
      amount: body.amount,
      currency: body.currency || 'USD',
      description: body.description,
      method: body.method || 'ach_plaid',
      plaid_options: plaidOptionsPayload,
    };

    const response = await bluumApi.createDeposit(bluumAccountId, depositData);
    return NextResponse.json(response, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
