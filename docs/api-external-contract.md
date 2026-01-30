# Bluum Finance External API Contract

> **Base URLs**
> - **Production:** `https://api.bluumfinance.com/v1`
> - **Sandbox:** `https://sandbox.api.bluumfinance.com/v1`

## Authentication

All endpoints use **HTTP Basic Authentication**:
- **Username:** Your API Key
- **Password:** Your API Secret

```
Authorization: Basic base64(API_KEY:API_SECRET)
```

---

## Table of Contents

1. [Accounts](#accounts)
2. [Wallets](#wallets)
3. [Transactions](#transactions)
4. [Funding Sources (Plaid)](#funding-sources-plaid)
5. [Deposits](#deposits)
6. [Withdrawals](#withdrawals)
7. [Trading - Orders](#trading---orders)
8. [Trading - Positions](#trading---positions)
9. [Assets](#assets)
10. [Documents](#documents)
11. [Webhooks](#webhooks)
12. [Error Responses](#error-responses)

---

## Accounts

### List All Accounts

| Method | URL |
|--------|-----|
| `GET` | `/accounts` |

**Request Body:** None

**Success Response (200):**
```json
[
  {
    "id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "account_number": "968430933",
    "status": "ACTIVE",
    "crypto_status": "INACTIVE",
    "currency": "USD",
    "balance": "1000.00",
    "last_equity": "0",
    "created_at": "2025-10-18T01:08:46.263583Z",
    "account_type": "trading",
    "trading_type": "cash",
    "enabled_assets": ["us_equity"],
    "contact": {
      "email_address": "john.doe@example.com",
      "phone_number": "+15555555555",
      "street_address": ["123 Main St"],
      "city": "Berkeley",
      "state": "CA",
      "postal_code": "94704",
      "country": "USA"
    },
    "identity": {
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1980-01-01",
      "country_of_citizenship": "USA",
      "country_of_birth": "USA",
      "party_type": "natural_person",
      "tax_id_type": "SSN",
      "country_of_tax_residence": "USA",
      "funding_source": ["employment_income"]
    },
    "disclosures": {
      "is_control_person": false,
      "is_affiliated_exchange_or_finra": false,
      "is_politically_exposed": false,
      "immediate_family_exposed": false,
      "is_discretionary": false
    },
    "agreements": []
  }
]
```

**Note:** Returns all accounts for the authenticated tenant.

---

### Create Account

| Method | URL |
|--------|-----|
| `POST` | `/accounts` |

**Request Body:**
```json
{
  "account_type": "trading",
  "contact": {
    "email_address": "john.doe@example.com",
    "phone_number": "+15555555555",
    "street_address": ["123 Main St", "Apt 4B"],
    "city": "Berkeley",
    "state": "CA",
    "postal_code": "94704",
    "country": "US"
  },
  "identity": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1980-01-01",
    "tax_id": "123-45-6789",
    "tax_id_type": "SSN",
    "country_of_citizenship": "US",
    "country_of_birth": "US",
    "country_of_tax_residence": "US",
    "funding_source": ["employment_income"]
  },
  "disclosures": {
    "is_control_person": false,
    "is_affiliated_exchange_or_finra": false,
    "is_politically_exposed": false,
    "immediate_family_exposed": false
  },
  "agreements": [
    {
      "agreement": "account_agreement",
      "agreed": true,
      "signed_at": "2025-01-15T10:30:00Z",
      "ip_address": "192.168.1.1"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "account_number": null,
  "status": "ACTIVE",
  "crypto_status": null,
  "currency": "USD",
  "balance": "0.00",
  "last_equity": "0",
  "created_at": "2025-01-15T10:30:00Z",
  "account_type": "trading",
  "trading_type": null,
  "enabled_assets": ["us_equity"],
  "contact": { ... },
  "identity": { ... },
  "disclosures": { ... },
  "agreements": [...]
}
```

**Note:** Account number is assigned after approval. Status starts as `ACTIVE` but may change during KYC review. Required agreements may vary.

---

### Get Account

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Request Body:** None

**Success Response (200):** Same as account object above.

---

## Wallets

### List Account Wallets

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/wallets` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Request Body:** None

**Success Response (200):**
```json
{
  "wallets": [
    {
      "wallet_id": "w_a1b2c3d4e5f6",
      "currency": "USD",
      "balance": "1500.00",
      "available_balance": "1200.00",
      "reserved_balance": "300.00",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "wallet_id": "w_b2c3d4e5f6g7",
      "currency": "EUR",
      "balance": "500.00",
      "available_balance": "500.00",
      "reserved_balance": "0.00",
      "status": "active",
      "created_at": "2025-01-20T14:00:00Z"
    }
  ]
}
```

**Note:** `available_balance` = `balance` - `reserved_balance`. Reserved balance includes pending withdrawals and open orders.

---

## Transactions

### List Account Transactions

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/transactions` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | Filter: `deposit`, `withdrawal` |
| `status` | string | No | Filter: `pending`, `processing`, `received`, `completed`, `submitted`, `expired`, `canceled`, `failed` |
| `currency` | string | No | 3-letter ISO currency code |
| `date_from` | string | No | Start date (YYYY-MM-DD) |
| `date_to` | string | No | End date (YYYY-MM-DD) |
| `limit` | integer | No | Max results (1-100, default: 50) |
| `offset` | integer | No | Skip N results (default: 0) |

**Request Body:** None

**Success Response (200):**
```json
{
  "transactions": [
    {
      "transaction_id": "dep_a1b2c3d4e5f6",
      "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
      "wallet_id": "w_a1b2c3d4e5f6",
      "type": "deposit",
      "status": "completed",
      "amount": "5000.00",
      "currency": "USD",
      "method": "ach_plaid",
      "description": "Initial account funding",
      "created_at": "2025-01-15T10:30:00Z",
      "completed_at": "2025-01-16T14:20:00Z",
      "failed_at": null,
      "failure_reason": null
    },
    {
      "transaction_id": "wd_b2c3d4e5f6g7",
      "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
      "wallet_id": "w_a1b2c3d4e5f6",
      "type": "withdrawal",
      "status": "pending",
      "amount": "1000.00",
      "currency": "USD",
      "method": "ach_plaid",
      "description": "Withdrawal to bank account",
      "created_at": "2025-01-17T09:15:00Z",
      "completed_at": null,
      "failed_at": null,
      "failure_reason": null
    }
  ]
}
```

**Note:** Use `limit` and `offset` for pagination. Combines deposits and withdrawals in a unified view.

---

## Funding Sources (Plaid)

### Create Plaid Link Token

| Method | URL |
|--------|-----|
| `POST` | `/accounts/{account_id}/funding-sources/plaid/link-token` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Request Body (optional):**
```json
{
  "enable_hosted_link": false
}
```

**Success Response (200) - SDK Flow:**
```json
{
  "status": "success",
  "data": {
    "link_token": "link-production-abc123def456",
    "hosted_link_url": null
  }
}
```

**Success Response (200) - Hosted Link Flow:**
```json
{
  "status": "success",
  "data": {
    "link_token": "link-production-abc123def456",
    "hosted_link_url": "https://hosted.plaid.com/link/abc123def456"
  }
}
```

**Note:** 
- **SDK Integration (default):** Use `link_token` with Plaid Link SDK in your app.
- **Hosted Link:** Set `enable_hosted_link: true` to get a URL that redirects users to Plaid's hosted page.

---

### Connect Bank Account via Plaid

| Method | URL |
|--------|-----|
| `POST` | `/accounts/{account_id}/funding-sources/plaid/connect` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Request Body:**
```json
{
  "public_token": "public-production-abc123def456"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Account connected successfully",
  "data": {
    "item": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "itemId": "item_abc123",
      "institutionId": "ins_123456",
      "institutionName": "Chase Bank",
      "status": "ACTIVE",
      "accounts": [
        {
          "id": "234f5678-f9ac-23e4-b567-537725285115",
          "accountId": "acc_1234567890",
          "accountName": "Checking Account",
          "accountType": "depository",
          "accountSubtype": "checking",
          "mask": "0000"
        }
      ],
      "createdAt": "2026-01-22T10:30:00Z",
      "updatedAt": "2026-01-22T10:30:00Z"
    }
  }
}
```

**Note:** Call this after user completes Plaid Link flow. Save `item.id` and `accounts[].id` for deposits/withdrawals.

---

### List Funding Sources

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/funding-sources` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | Filter: `plaid`, `all` (default: `all`) |

**Request Body:** None

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "itemId": "item_abc123",
        "institutionId": "ins_123456",
        "institutionName": "Chase Bank",
        "status": "ACTIVE",
        "accounts": [
          {
            "id": "234f5678-f9ac-23e4-b567-537725285115",
            "accountId": "acc_1234567890",
            "accountName": "Checking Account",
            "accountType": "depository",
            "accountSubtype": "checking",
            "mask": "0000"
          }
        ],
        "createdAt": "2026-01-22T10:30:00Z",
        "updatedAt": "2026-01-22T10:30:00Z"
      }
    ]
  }
}
```

---

### Disconnect Funding Source

| Method | URL |
|--------|-----|
| `DELETE` | `/accounts/{account_id}/funding-sources/{id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |
| `id` | UUID | The funding source identifier |

**Request Body:** None

**Success Response (200):** Returns updated funding source with `status: "DISCONNECTED"`

**Note:** Disconnected funding sources cannot be used for new transfers but history is preserved.

---

## Deposits

### Initiate Deposit

| Method | URL |
|--------|-----|
| `POST` | `/accounts/{account_id}/deposits` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Headers:**
| Name | Required | Description |
|------|----------|-------------|
| `Idempotency-Key` | No | Unique key to prevent duplicate requests |

**Request Body - ACH via Plaid (new connection):**
```json
{
  "amount": "1000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "description": "Initial funding",
  "plaid_options": {
    "public_token": "public-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**Request Body - ACH via Plaid (existing connection):**
```json
{
  "amount": "1000.00",
  "currency": "USD",
  "method": "ach_plaid",
  "description": "Monthly deposit",
  "plaid_options": {
    "item_id": "item_abc123",
    "account_id": "acc_xyz789"
  }
}
```

**Request Body - Manual Bank Transfer:**
```json
{
  "amount": "5000.00",
  "currency": "USD",
  "method": "manual_bank_transfer",
  "description": "Large deposit via wire"
}
```

**Success Response (201):**
```json
{
  "deposit_id": "dep_a1b2c3d4e5f6g7h8",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "wallet_id": "wal_x1y2z3a4b5c6d7e8",
  "method": "manual_bank_transfer",
  "status": "pending",
  "amount": "5000.00",
  "currency": "USD",
  "description": "Large deposit via wire",
  "method_details": {
    "referenceCode": "BLUUM-ABC123XY",
    "bankDetails": {
      "bankName": "Bluum Finance Bank",
      "accountName": "Bluum Finance LLC",
      "accountNumber": "****1234",
      "routingNumber": "021000021",
      "instructions": "Include reference code \"BLUUM-ABC123XY\" in your transfer memo."
    }
  },
  "initiated_at": null,
  "received_at": null,
  "completed_at": null,
  "expires_at": "2026-01-22T10:00:00.000Z",
  "failure_reason": null,
  "created_at": "2026-01-15T09:00:00.000Z"
}
```

**Note:** 
- For `manual_bank_transfer`, display `method_details.bankDetails` to user with reference code.
- Manual deposits expire after 7 days if not received.
- Use `Idempotency-Key` header to prevent duplicate deposits on retry.
- Deposit statuses: `pending` → `processing` → `received` → `completed` (or `expired`/`canceled`/`failed`)

---

### List Deposits

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/deposits` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `method` | string | No | Filter: `ach_plaid`, `manual_bank_transfer`, `wire` |
| `status` | string | No | Filter: `pending`, `processing`, `received`, `completed`, `expired`, `canceled`, `failed` |
| `currency` | string | No | 3-letter ISO currency code |
| `date_from` | string | No | Start date (YYYY-MM-DD) |
| `date_to` | string | No | End date (YYYY-MM-DD) |
| `limit` | integer | No | Max results (1-100, default: 50) |
| `offset` | integer | No | Skip N results (default: 0) |

**Request Body:** None

**Success Response (200):**
```json
{
  "deposits": [
    {
      "deposit_id": "dep_a1b2c3d4e5f6g7h8",
      "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
      "wallet_id": "wal_x1y2z3a4b5c6d7e8",
      "method": "ach_plaid",
      "status": "completed",
      "amount": "1000.00",
      "currency": "USD",
      "description": "Monthly deposit",
      "method_details": null,
      "initiated_at": "2026-01-15T10:00:00.000Z",
      "received_at": null,
      "completed_at": "2026-01-16T12:00:00.000Z",
      "expires_at": null,
      "failure_reason": null,
      "created_at": "2026-01-15T09:00:00.000Z"
    }
  ],
  "total": 10
}
```

---

### Get Deposit

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/deposits/{deposit_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |
| `deposit_id` | string | The deposit identifier |

**Request Body:** None

**Success Response (200):** Same as single deposit object above.

---

### Cancel Deposit

| Method | URL |
|--------|-----|
| `POST` | `/accounts/{account_id}/deposits/{deposit_id}/cancel` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |
| `deposit_id` | string | The deposit identifier |

**Request Body:** None

**Success Response (200):**
```json
{
  "deposit_id": "dep_a1b2c3d4e5f6g7h8",
  "status": "canceled",
  ...
}
```

**Note:** Only deposits in `pending` status can be canceled. ACH deposits in `processing` may not be cancellable.

---

## Withdrawals

### Initiate Withdrawal

| Method | URL |
|--------|-----|
| `POST` | `/accounts/{account_id}/withdrawals` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Headers:**
| Name | Required | Description |
|------|----------|-------------|
| `Idempotency-Key` | No | Unique key to prevent duplicate requests |

**Request Body:**
```json
{
  "amount": "500.00",
  "currency": "USD",
  "method": "ach_plaid",
  "description": "Monthly withdrawal to checking account",
  "plaid_options": {
    "item_id": "item_abc123",
    "account_id": "acc_xyz789"
  }
}
```

**Success Response (201):**
```json
{
  "withdrawal_id": "wdr_a1b2c3d4e5f6g7h8",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "wallet_id": "wal_x1y2z3a4b5c6d7e8",
  "method": "ach_plaid",
  "status": "pending",
  "amount": "500.00",
  "currency": "USD",
  "description": "Monthly withdrawal to checking account",
  "method_details": null,
  "destination_details": {
    "bankName": "Chase Bank",
    "accountMask": "****5678"
  },
  "initiated_at": null,
  "submitted_at": null,
  "completed_at": null,
  "failure_reason": null,
  "created_at": "2026-01-17T08:00:00.000Z"
}
```

**Note:**
- `plaid_options.item_id` and `plaid_options.account_id` are required for `ach_plaid` withdrawals.
- Funds are placed on hold immediately; released if canceled or failed.
- Withdrawal statuses: `pending` → `processing` → `submitted` → `completed` (or `canceled`/`failed`)

---

### List Withdrawals

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/withdrawals` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `method` | string | No | Filter: `ach_plaid`, `wire` |
| `status` | string | No | Filter: `pending`, `processing`, `submitted`, `completed`, `canceled`, `failed` |
| `currency` | string | No | 3-letter ISO currency code |
| `date_from` | string | No | Start date (YYYY-MM-DD) |
| `date_to` | string | No | End date (YYYY-MM-DD) |
| `limit` | integer | No | Max results (1-100, default: 50) |
| `offset` | integer | No | Skip N results (default: 0) |

**Request Body:** None

**Success Response (200):**
```json
{
  "withdrawals": [
    {
      "withdrawal_id": "wdr_a1b2c3d4e5f6g7h8",
      "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
      "wallet_id": "wal_x1y2z3a4b5c6d7e8",
      "method": "ach_plaid",
      "status": "completed",
      "amount": "500.00",
      "currency": "USD",
      ...
    }
  ],
  "total": 5
}
```

---

### Get Withdrawal

| Method | URL |
|--------|-----|
| `GET` | `/accounts/{account_id}/withdrawals/{withdrawal_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |
| `withdrawal_id` | string | The withdrawal identifier |

**Request Body:** None

**Success Response (200):** Same as single withdrawal object.

---

### Cancel Withdrawal

| Method | URL |
|--------|-----|
| `POST` | `/accounts/{account_id}/withdrawals/{withdrawal_id}/cancel` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |
| `withdrawal_id` | string | The withdrawal identifier |

**Request Body:** None

**Success Response (200):**
```json
{
  "withdrawal_id": "wdr_a1b2c3d4e5f6g7h8",
  "status": "canceled",
  ...
}
```

**Note:** Only withdrawals in `pending` status can be canceled. Funds are released back to wallet on cancellation.

---

## Trading - Orders

### Place Order

| Method | URL |
|--------|-----|
| `POST` | `/trading/accounts/{account_id}/orders` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Request Body - Market Buy (quantity):**
```json
{
  "symbol": "AAPL",
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "qty": "10",
  "extended_hours": false
}
```

**Request Body - Market Buy (notional/dollar amount):**
```json
{
  "symbol": "GOOGL",
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "notional": "1000.00",
  "extended_hours": false
}
```

**Request Body - Limit Order:**
```json
{
  "symbol": "MSFT",
  "side": "buy",
  "type": "limit",
  "time_in_force": "gtc",
  "qty": "5",
  "limit_price": "350.00",
  "extended_hours": false,
  "client_order_id": "my-order-123"
}
```

**Request Body - Stop Loss:**
```json
{
  "symbol": "TSLA",
  "side": "sell",
  "type": "stop",
  "time_in_force": "gtc",
  "qty": "20",
  "stop_price": "200.00"
}
```

**Request Body - Trailing Stop:**
```json
{
  "symbol": "NVDA",
  "side": "sell",
  "type": "trailing_stop",
  "time_in_force": "gtc",
  "qty": "15",
  "trail_percent": "5.0"
}
```

**Success Response (201):**
```json
{
  "id": "ord_x9y8z7a6b5c4d3e2",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "symbol": "AAPL",
  "qty": "10",
  "side": "buy",
  "type": "market",
  "time_in_force": "day",
  "extended_hours": false,
  "status": "accepted",
  "filled_qty": "0",
  "remaining_qty": "10",
  "average_price": "0.00",
  "submitted_at": "2025-01-15T14:30:00Z",
  "filled_at": null,
  "canceled_at": null,
  "reject_reason": null
}
```

**Note:**
- Use `qty` for share quantity OR `notional` for dollar amount (not both).
- `time_in_force`: `day` (expires EOD), `gtc` (good till canceled), `ioc` (immediate or cancel), `fok` (fill or kill).
- `client_order_id` is optional; useful for idempotency and tracking.
- Order statuses: `accepted` → `filled`/`partially_filled`/`canceled`/`rejected`

---

### List Orders

| Method | URL |
|--------|-----|
| `GET` | `/trading/accounts/{account_id}/orders` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | No | Filter: `accepted`, `filled`, `partially_filled`, `canceled`, `rejected` |
| `symbol` | string | No | Filter by symbol |
| `side` | string | No | Filter: `buy`, `sell` |
| `limit` | integer | No | Max results (1-100, default: 50) |
| `offset` | integer | No | Skip N results (default: 0) |

**Request Body:** None

**Success Response (200):**
```json
[
  {
    "id": "ord_x9y8z7a6b5c4d3e2",
    "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "symbol": "AAPL",
    "qty": "10",
    "side": "buy",
    "type": "market",
    "time_in_force": "day",
    "status": "filled",
    "filled_qty": "10",
    "remaining_qty": "0",
    "average_price": "175.50",
    "submitted_at": "2025-01-15T14:30:00Z",
    "filled_at": "2025-01-15T14:30:15Z",
    "canceled_at": null,
    "reject_reason": null
  }
]
```

---

### Get Order

| Method | URL |
|--------|-----|
| `GET` | `/trading/orders/{order_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `order_id` | UUID | The order identifier |

**Request Body:** None

**Success Response (200):** Same as single order object.

---

## Trading - Positions

### List Positions

| Method | URL |
|--------|-----|
| `GET` | `/trading/accounts/{account_id}/positions` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | string | No | Filter by symbol |
| `non_zero_only` | boolean | No | Only non-zero positions (default: false) |
| `refresh_prices` | boolean | No | Fetch live prices (adds latency, default: false) |

**Request Body:** None

**Success Response (200):**
```json
[
  {
    "id": "pos_a1b2c3d4e5f6g7h8",
    "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
    "symbol": "AAPL",
    "asset_id": "6c5b2403-24a9-4b55-a3dd-5cb1e4b50da6",
    "quantity": "10.5",
    "average_cost_basis": "175.50",
    "total_cost_basis": "1842.75",
    "current_price": "180.00",
    "market_value": "1890.00",
    "unrealized_pl": "47.25",
    "unrealized_pl_percent": "2.56",
    "last_transaction_at": "2025-01-15T14:30:15Z",
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-15T14:30:15Z"
  }
]
```

**Note:** Set `refresh_prices=true` for real-time prices; otherwise, uses cached/last known prices.

---

### Get Position

| Method | URL |
|--------|-----|
| `GET` | `/trading/accounts/{account_id}/positions/{position_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |
| `position_id` | UUID | The position identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `refresh_prices` | boolean | No | Fetch live price (default: false) |

**Request Body:** None

**Success Response (200):** Same as single position object.

---

## Assets

### Search Assets

| Method | URL |
|--------|-----|
| `GET` | `/assets/search` |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `q` | string | No | Search query (ticker, name, partial match) |
| `status` | string | No | Filter: `active`, `inactive` (default: `active`) |
| `asset_class` | string | No | Filter: `us_equity`, `crypto`, `us_option` |
| `limit` | integer | No | Max results (1-100, default: 50) |

**Request Body:** None

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "b0b6dd9d-8b9b-48b9-bbb8-bbbb49bb1bbb",
      "class": "us_equity",
      "market": "NASDAQ",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "status": "active",
      "tradable": true,
      "marginable": true,
      "shortable": true,
      "easy_to_borrow": true,
      "fractionable": true
    }
  ],
  "count": 1
}
```

---

### List Assets

| Method | URL |
|--------|-----|
| `GET` | `/assets/list` |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | No | Filter: `active`, `inactive` (default: `active`) |
| `asset_class` | string | No | Filter: `us_equity`, `crypto`, `us_option` |
| `tradable` | boolean | No | Filter tradable assets only |

**Request Body:** None

**Success Response (200):** Array of asset objects.

---

### Get Asset by Symbol

| Method | URL |
|--------|-----|
| `GET` | `/assets/{symbol}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `symbol` | string | Asset ticker (e.g., AAPL, MSFT, BTCUSD) |

**Request Body:** None

**Success Response (200):**
```json
{
  "data": {
    "id": "b0b6dd9d-8b9b-48b9-bbb8-bbbb49bb1bbb",
    "class": "us_equity",
    "market": "NASDAQ",
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "status": "active",
    "tradable": true,
    "marginable": true,
    "shortable": true,
    "easy_to_borrow": true,
    "fractionable": true
  }
}
```

---

### Get Chart Data

| Method | URL |
|--------|-----|
| `GET` | `/assets/chart` |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `symbol` | string | **Yes** | Asset ticker |
| `timeframe` | string | **Yes** | `1Min`, `5Min`, `15Min`, `30Min`, `1Hour`, `1Day`, `1Week`, `1Month` |
| `start` | datetime | No | Start date (ISO 8601) |
| `end` | datetime | No | End date (ISO 8601) |
| `limit` | integer | No | Max bars (1-10000, default: 100) |
| `adjustment` | string | No | `raw`, `split`, `dividend`, `all` (default: `raw`) |
| `feed` | string | No | `iex` (free), `sip` (premium), `otc` (default: `iex`) |

**Request Body:** None

**Success Response (200):**
```json
{
  "data": {
    "symbol": "AAPL",
    "bars": [
      {
        "timestamp": "2025-01-15T16:00:00Z",
        "open": 175.25,
        "high": 177.50,
        "low": 174.80,
        "close": 176.75,
        "volume": 5000000,
        "tradeCount": 12500,
        "volumeWeightedAveragePrice": 176.20
      }
    ],
    "nextPageToken": null
  }
}
```

**Note:** For paginated results, use `nextPageToken` in subsequent requests.

---

## Documents

### Upload Document

| Method | URL |
|--------|-----|
| `POST` | `/documents/accounts/{account_id}/upload` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Request Body:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | file | The document file |
| `document_type` | string | `id_verification`, `proof_of_address`, `w9_form` |

**Success Response (201):**
```json
{
  "document_id": "doc_a1b2c3d4e5f6g7h8",
  "account_id": "3d0b0e65-35d3-4dcd-8df7-10286ebb4b4b",
  "document_type": "id_verification",
  "upload_status": "processing",
  "uploaded_at": "2025-01-15T10:30:00Z"
}
```

**Note:** Documents are processed asynchronously. Poll status or use webhooks for updates.

---

### List Documents

| Method | URL |
|--------|-----|
| `GET` | `/documents/accounts/{account_id}/upload` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `account_id` | UUID | The account identifier |

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `document_type` | string | No | Filter: `id_verification`, `proof_of_address`, `w9_form` |
| `status` | string | No | Filter: `processing`, `approved`, `rejected` |

**Request Body:** None

**Success Response (200):** Array of document objects.

---

### Get Document

| Method | URL |
|--------|-----|
| `GET` | `/documents/{document_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `document_id` | UUID | The document identifier |

**Request Body:** None

**Success Response (200):** Single document object.

---

### Delete Document

| Method | URL |
|--------|-----|
| `DELETE` | `/documents/{document_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `document_id` | UUID | The document identifier |

**Request Body:** None

**Success Response (204):** No content.

---

## Webhooks

### Get Event Types

| Method | URL |
|--------|-----|
| `GET` | `/webhooks/event-types` |

**Request Body:** None

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "eventTypes": [
      { "name": "account.created", "description": "..." },
      { "name": "account.updated", "description": "..." },
      { "name": "deposit.completed", "description": "..." },
      { "name": "withdrawal.completed", "description": "..." },
      { "name": "order.filled", "description": "..." }
    ]
  }
}
```

---

### List Webhooks

| Method | URL |
|--------|-----|
| `GET` | `/webhooks` |

**Request Body:** None

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "webhooks": [
      {
        "id": "wh_abc123",
        "name": "Production Webhook",
        "url": "https://yourapp.com/webhooks/bluum",
        "status": "ACTIVE",
        "eventTypes": ["deposit.completed", "withdrawal.completed"],
        "createdAt": "2025-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

### Create Webhook

| Method | URL |
|--------|-----|
| `POST` | `/webhooks` |

**Request Body:**
```json
{
  "name": "Production Webhook",
  "url": "https://yourapp.com/webhooks/bluum",
  "eventTypeNames": ["deposit.completed", "withdrawal.completed", "order.filled"],
  "description": "Main production webhook endpoint"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Webhook created successfully",
  "data": {
    "webhook": {
      "id": "wh_abc123",
      "name": "Production Webhook",
      "url": "https://yourapp.com/webhooks/bluum",
      "status": "ACTIVE",
      "eventTypes": ["deposit.completed", "withdrawal.completed", "order.filled"],
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

---

### Update Webhook

| Method | URL |
|--------|-----|
| `PATCH` | `/webhooks/{webhook_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `webhook_id` | UUID | The webhook identifier |

**Request Body:**
```json
{
  "eventTypeNames": ["deposit.completed"],
  "status": "INACTIVE"
}
```

**Success Response (200):** Updated webhook object.

---

### Delete Webhook

| Method | URL |
|--------|-----|
| `DELETE` | `/webhooks/{webhook_id}` |

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `webhook_id` | UUID | The webhook identifier |

**Request Body:** None

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Webhook deleted successfully"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "code": "BLUM-XXX-XXX",
  "message": "Human-readable error message"
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BLUM-400-XXX` | Bad Request - Invalid input or validation error |
| 401 | `BLUM-401-001` | Unauthorized - Missing or invalid API credentials |
| 403 | `BLUM-403-001` | Forbidden - Access denied to resource |
| 404 | `BLUM-404-001` | Not Found - Resource does not exist |
| 409 | `BLUM-409-XXX` | Conflict - Duplicate idempotency key or resource conflict |
| 500 | `BLUM-500-001` | Internal Server Error - Unexpected error |

### Example Error Responses

**401 Unauthorized:**
```json
{
  "code": "BLUM-401-001",
  "message": "Missing or invalid Authorization header."
}
```

**400 Bad Request:**
```json
{
  "code": "BLUM-400-002",
  "message": "Required field 'symbol' is missing."
}
```

**404 Not Found:**
```json
{
  "code": "BLUM-404-001",
  "message": "Account with ID acc_a1b2c3d4e5f6g7h8 not found."
}
```

**409 Conflict (Idempotency):**
```json
{
  "code": "BLUM-409-001",
  "message": "Request with this idempotency key has already been processed."
}
```

---

## Integration Tips

1. **Idempotency:** Use `Idempotency-Key` header for POST requests (deposits, withdrawals, orders) to safely retry on network failures.

2. **Pagination:** Use `limit` and `offset` query parameters. Check `total` in response for full count.

3. **Webhooks:** Subscribe to webhooks for real-time updates instead of polling.

4. **Plaid Integration Flow:**
   - Call `POST /accounts/{id}/funding-sources/plaid/link-token` to get a link token
   - Open Plaid Link in your app with the token
   - On success, call `POST /accounts/{id}/funding-sources/plaid/connect` with the public token
   - Store the returned `item.id` and `accounts[].id` for future deposits/withdrawals

5. **Manual Deposits:** Display the `method_details.bankDetails` to users with clear instructions including the reference code.

6. **Date Formats:** All dates use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`). Date-only filters use `YYYY-MM-DD`.

7. **Currency:** Always 3-letter ISO 4217 codes (e.g., `USD`, `EUR`). Default is `USD`.

8. **Amounts:** All monetary amounts are strings with up to 2 decimal places (e.g., `"1000.00"`).
