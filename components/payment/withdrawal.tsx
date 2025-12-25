'use client';

import { useState } from 'react';
import { Building2, ArrowRight, ArrowLeft, Loader2, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvestmentService } from '@/services/investment.service';
import { toast } from 'sonner';

interface WithdrawalProps {
  accountId: string;
  availableBalance: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type Step = 1 | 2;

export function Withdrawal({
  accountId,
  availableBalance,
  onSuccess,
  onCancel,
}: WithdrawalProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const withdrawalMethod = 'ach'; // Only bank transfer is available

  // Bank transfer fields
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const formatRoutingNumber = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 9);
  };

  const formatAccountNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const validateStep1 = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > availableBalance) {
      toast.error('Insufficient balance');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!bankName || bankName.trim().length < 2) {
      toast.error('Please enter the bank name');
      return false;
    }
    if (!routingNumber || routingNumber.length !== 9) {
      toast.error('Please enter a valid 9-digit routing number');
      return false;
    }
    if (!accountNumber || accountNumber.length < 4) {
      toast.error('Please enter a valid account number');
      return false;
    }
    if (!accountHolderName || accountHolderName.trim().length < 2) {
      toast.error('Please enter the account holder name');
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
      const bankAccountId = `bank_${routingNumber.slice(-4)}_${accountNumber.slice(-4)}`;

      await InvestmentService.withdrawFunds({
        account_id: accountId,
        amount: amountStr,
        funding_details: {
          funding_type: 'fiat',
          fiat_currency: 'USD',
          bank_account_id: bankAccountId,
          method: withdrawalMethod,
        },
        description: `Bank transfer withdrawal of $${amountStr} to ${bankName}`,
        external_reference_id: `withdrawal_${Date.now()}`,
      });

      toast.success('Withdrawal request submitted successfully!');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process withdrawal';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Withdraw Funds</h2>
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

      {/* Step 1: Amount and Withdrawal Method */}
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
            <p className="text-xs text-muted-foreground">
              Available: $
              {availableBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Bank Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              type="text"
              placeholder="John Doe"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              type="text"
              placeholder="123456789"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(formatRoutingNumber(e.target.value))}
              disabled={processing}
              maxLength={9}
            />
            <p className="text-xs text-muted-foreground">9-digit routing number</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(formatAccountNumber(e.target.value))}
              disabled={processing}
            />
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Transfer Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Bank transfers typically take 1-3 business days to process</li>
                <li>Please ensure all bank details are correct</li>
                <li>You will receive a confirmation email once the transfer is initiated</li>
              </ul>
            </div>
          </div>
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
              'Confirm Withdrawal'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
