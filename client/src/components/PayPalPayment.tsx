import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayPalPaymentProps {
  amount: number;
  vehicleNumber: string;
  towingId: string;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

type PaymentStatus = 'pending' | 'processing' | 'success' | 'error';

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  vehicleNumber,
  towingId,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const { toast } = useToast();

  // PayPal Sandbox Client ID - you'll get this from PayPal Developer Dashboard
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sandbox_client_id_here';

  const handlePaymentSuccess = async (details: any) => {
    setPaymentStatus('success');
    setPaymentId(details.id);
    
    try {
      // Update payment status in backend
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/payments/${towingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentId: details.id
        })
      });

      if (response.ok) {
        toast({
          title: 'Payment Successful!',
          description: `Fine of ₹${amount.toLocaleString()} (~$${(amount / 83).toFixed(2)}) has been paid successfully.`,
        });
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Payment Successful!',
        description: 'Payment completed, but there was an issue updating the status.',
        variant: 'destructive'
      });
    }

    // Call success callback
    if (onPaymentSuccess) {
      onPaymentSuccess(details.id);
    }

    console.log('Payment successful:', details);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error');
    
    toast({
      title: 'Payment Failed',
      description: 'There was an error processing your payment. Please try again.',
      variant: 'destructive'
    });

    if (onPaymentError) {
      onPaymentError(error.message || 'Payment failed');
    }

    console.error('Payment error:', error);
  };

  const handlePaymentCancel = () => {
    setPaymentStatus('pending');
    toast({
      title: 'Payment Cancelled',
      description: 'You cancelled the payment process.',
    });
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'error':
        return <Badge className="bg-destructive text-destructive-foreground">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-warning text-warning-foreground">Processing</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Unpaid</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
      default:
        return <CreditCard className="w-5 h-5 text-warning" />;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Fine Payment
        </CardTitle>
        <CardDescription>
          Pay your towing fine securely with PayPal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Vehicle Number:</span>
            <span className="text-sm">{vehicleNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Fine Amount:</span>
            <div className="text-right">
              <span className="text-lg font-bold">₹{amount.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground block">(~${(amount / 83).toFixed(2)} USD)</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>
        </div>

        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-success">Payment Successful!</h3>
            </div>
            <p className="text-sm text-success/80">
              Your fine has been paid successfully. Payment ID: {paymentId}
            </p>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Payment Failed</h3>
            </div>
            <p className="text-sm text-destructive/80">
              There was an error processing your payment. Please try again.
            </p>
          </div>
        )}

        {/* PayPal Payment Button */}
        {paymentStatus === 'pending' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click the PayPal button below to pay your fine securely
              </p>
            </div>
            
            <PayPalScriptProvider 
              options={{ 
                clientId: PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'capture'
              }}
            >
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'blue',
                  shape: 'rect',
                  label: 'paypal'
                }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [
                      {
                        amount: {
                          currency_code: 'USD',
                          value: (amount / 83).toFixed(2), // Convert INR to USD (approximate rate)
                        },
                        description: `Towing fine for vehicle ${vehicleNumber}`,
                        custom_id: towingId,
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  setPaymentStatus('processing');
                  return actions.order!.capture().then((details) => {
                    handlePaymentSuccess(details);
                  });
                }}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Alternative Payment Methods */}
        {paymentStatus === 'pending' && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Alternative payment methods coming soon
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <CreditCard className="w-4 h-4 mr-2" />
                Credit Card
              </Button>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <CreditCard className="w-4 h-4 mr-2" />
                UPI
              </Button>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Payment Instructions:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Use PayPal Sandbox for testing (no real money)</li>
            <li>• After payment, your vehicle will be released</li>
            <li>• Keep the payment receipt for your records</li>
            <li>• Contact support if you face any issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayPalPayment;
