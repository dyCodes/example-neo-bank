'use client';

import { useState } from 'react';
import { CreditCard, Building2, ArrowRight, ArrowLeft, Loader2, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { InvestmentService } from '@/services/investment.service';
import { toast } from 'sonner';

interface DepositProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'card' | 'ach' | 'wire';
type Step = 1 | 2;

export function Deposit({ accountId, onSuccess, onCancel }: DepositProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Bank transfer fields
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

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
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'card') {
      const cardNumberDigits = cardNumber.replace(/\s/g, '');
      if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!expiryDate || expiryDate.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      const [month, year] = expiryDate.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt('20' + year, 10);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      if (monthNum < 1 || monthNum > 12) {
        toast.error('Please enter a valid month');
        return false;
      }
      if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        toast.error('Card has expired');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      if (!cardholderName || cardholderName.trim().length < 2) {
        toast.error('Please enter the cardholder name');
        return false;
      }
    } else if (paymentMethod === 'ach' || paymentMethod === 'wire') {
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
      let fundingDetails: any;

      if (paymentMethod === 'card') {
        fundingDetails = {
          funding_type: 'fiat',
          fiat_currency: 'USD',
          bank_account_id: `card_${cardNumber.replace(/\s/g, '').slice(-4)}`,
          method: 'ach', // Using ACH as the method, but in reality this would be 'card'
        };
      } else {
        const bankAccountId = `bank_${routingNumber.slice(-4)}_${accountNumber.slice(-4)}`;
        fundingDetails = {
          funding_type: 'fiat',
          fiat_currency: 'USD',
          bank_account_id: bankAccountId,
          method: paymentMethod,
        };
      }

      await InvestmentService.fundAccount({
        account_id: accountId,
        amount: amountStr,
        funding_details: fundingDetails,
        description: `${
          paymentMethod === 'card' ? 'Card' : paymentMethod?.toUpperCase()
        } deposit of $${amountStr}`,
        external_reference_id: `${paymentMethod}_${Date.now()}`,
      });

      toast.success('Deposit successful!');
      onSuccess?.();
    } catch (error: any) {
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
              value={paymentMethod || ''}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={processing}
            >
              <option value="">Select payment method</option>
              <option value="card">Card Payment - Instant deposit</option>
              <option value="ach" disabled>
                Bank Transfer (ACH) - Not available
              </option>
              <option value="wire" disabled>
                Wire Transfer - Not available
              </option>
            </Select>
            {paymentMethod === 'card' && (
              <p className="text-xs text-muted-foreground">
                Instant deposit with credit or debit card
              </p>
            )}
            {(paymentMethod === 'ach' || paymentMethod === 'wire') && (
              <p className="text-xs text-destructive">
                This payment method is not available at the moment
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && (
        <div className="space-y-4">
          {paymentMethod === 'card' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    disabled={processing}
                    maxLength={19}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  disabled={processing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    disabled={processing}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))
                      }
                      disabled={processing}
                      maxLength={4}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your full
                  card details.
                </p>
              </div>
            </>
          ) : (
            <>
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
            </>
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
              'Confirm Deposit'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
