'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PlaidLink } from '@/components/plaid/plaid-link';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { toast } from 'sonner';

interface DepositProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'plaid';
type Step = 1 | 2;

export function Deposit({ accountId, onSuccess, onCancel }: DepositProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('plaid');
  const [processing, setProcessing] = useState(false);

  // Plaid fields
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [selectedPlaidAccount, setSelectedPlaidAccount] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Load connected Plaid accounts
  useEffect(() => {
    const loadConnectedAccounts = async () => {
      if (paymentMethod === 'plaid') {
        setLoadingAccounts(true);
        try {
          const accounts = await PlaidService.getConnectedAccounts(accountId);
          setConnectedAccounts(accounts || []);
        } catch (error: any) {
          console.error('Failed to load connected accounts:', error);
          setConnectedAccounts([]);
          // Don't show error toast, just allow new connection
        } finally {
          setLoadingAccounts(false);
        }
      }
    };

    loadConnectedAccounts();
  }, [accountId, paymentMethod, step]);

  const handlePlaidSuccess = async (token: string, metadata: any) => {
    setPublicToken(token);
    // If multiple accounts, select the first one
    if (metadata.accounts && metadata.accounts.length > 0) {
      setSelectedPlaidAccount(metadata.accounts[0].id);
    }

    // Save the connection to the backend
    setLoadingAccounts(true);
    try {
      await PlaidService.connectAccount(accountId, token);

      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      // Auto-select the newly connected account if available
      if (metadata.accounts && metadata.accounts.length > 0 && accounts.length > 0) {
        const newAccountId = metadata.accounts[0].id;
        // Find the account in the loaded accounts
        const accountExists = accounts.some((item) =>
          item.accounts.some((acc) => acc.accountId === newAccountId)
        );
        if (accountExists) {
          setSelectedPlaidAccount(newAccountId);
        }
      }

      toast.success('Bank account connected successfully!');
    } catch (error: any) {
      console.error('Failed to connect or reload accounts:', error);
      toast.error(error.message || 'Failed to connect bank account');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleDeleteAccount = async (fundingSourceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent account selection when clicking delete
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    setLoadingAccounts(true);
    try {
      await PlaidService.disconnectItem(accountId, fundingSourceId);
      // Reload accounts after deletion
      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      // Clear selection if deleted account was selected
      if (
        connectedAccounts.some(
          (item) =>
            item.id === fundingSourceId &&
            item.accounts.some((acc) => acc.accountId === selectedPlaidAccount)
        )
      ) {
        setSelectedPlaidAccount(null);
      }

      toast.success('Bank account disconnected successfully');
    } catch (error: any) {
      console.error('Failed to disconnect account:', error);
      toast.error(error.message || 'Failed to disconnect bank account');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const validateStep1 = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // For Plaid, we need either a public token (new connection) or a selected stored account
    if (!publicToken && connectedAccounts.length === 0) {
      toast.error('Please connect a bank account');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const amountStr = parseFloat(amount).toFixed(2);

      // Handle Plaid transfers
      const request: any = {
        amount: amountStr,
        currency: 'USD',
        description: `Plaid ACH deposit of $${amountStr}`,
      };

      // Use stored account if available, otherwise use new connection
      if (connectedAccounts.length > 0 && !publicToken) {
        // Find selected account or use first available
        const selectedItem =
          connectedAccounts.find((item) =>
            item.accounts.some((acc) => acc.accountId === selectedPlaidAccount)
          ) || connectedAccounts[0];

        request.itemId = selectedItem.providerId;
        if (selectedPlaidAccount) {
          request.accountId = selectedPlaidAccount;
        } else if (selectedItem.accounts.length > 0) {
          request.accountId = selectedItem.accounts[0].accountId;
        }
      } else if (publicToken) {
        request.publicToken = publicToken;
        if (selectedPlaidAccount) {
          request.accountId = selectedPlaidAccount;
        }
      }

      const response = await PlaidService.createDeposit(accountId, request);
      toast.success(
        'Deposit initiated successfully! Funds will be available once the transfer completes.'
      );
      onSuccess?.();
    } catch (error: any) {
      // Error message is already extracted by apiClient interceptor
      const errorMessage = error.message || 'Failed to process deposit';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Deposit Funds</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            disabled={processing}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Step 1: Amount and Payment Method */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={processing}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={processing}
            >
              <option value="plaid">Bank Transfer (ACH)</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Securely connect your bank account for ACH transfers
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && (
        <div className="space-y-4">
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : connectedAccounts.length > 0 ? (
            <div className="space-y-3">
              <Label>Select Bank Account</Label>
              {connectedAccounts.map((item) =>
                item.accounts.map((account) => (
                  <div
                    key={account.accountId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPlaidAccount === account.accountId
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                      }`}
                    onClick={() => setSelectedPlaidAccount(account.accountId)}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{item.institutionName}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.accountName} •••• {account.mask}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteAccount(item.id, e)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive/80 transition-colors"
                        title="Disconnect account"
                        disabled={loadingAccounts}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="pt-2">
                <PlaidLink
                  accountId={accountId}
                  onSuccess={handlePlaidSuccess}
                  onExit={(error) => {
                    if (error) {
                      toast.error('Failed to connect bank account');
                    }
                  }}
                  className="w-full"
                >
                  Connect Another Bank Account
                </PlaidLink>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {publicToken && connectedAccounts.length === 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ Bank account connected successfully
                  </p>
                  <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                    You can proceed with this account or connect another one below.
                  </p>
                </div>
              )}
              <Label>Connect Bank Account</Label>
              <PlaidLink
                accountId={accountId}
                onSuccess={handlePlaidSuccess}
                onExit={(error) => {
                  if (error) {
                    toast.error('Failed to connect bank account');
                  }
                }}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-4">
        {step > 1 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleBack}
            disabled={processing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {onCancel && step === 1 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
        )}
        {step === 1 ? (
          <Button className="flex-1" onClick={handleNext} disabled={processing}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleNext} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Deposit $${parseFloat(amount || '0').toFixed(2)}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
