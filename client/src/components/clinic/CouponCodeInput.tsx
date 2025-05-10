import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Tag, CheckCircle } from 'lucide-react';
import { useApplyCode } from '@/hooks/use-apply-code';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface CouponCodeInputProps {
  quoteId: string;
  clinicId: string;
  onSuccess?: (data: {
    subtotal: number;
    discount: number;
    total: number;
    promoLabel: string;
  }) => void;
  className?: string;
}

const CouponCodeInput: React.FC<CouponCodeInputProps> = ({
  quoteId,
  clinicId,
  onSuccess,
  className,
}) => {
  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const { mutate: applyCode, isPending } = useApplyCode();
  const { toast } = useToast();

  const handleApplyCode = () => {
    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }

    applyCode(
      {
        quoteId,
        clinicId,
        code: code.trim(),
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            setAppliedCode(code.toUpperCase().trim());
            setCode(''); // Clear input
            if (onSuccess) {
              onSuccess(response.data);
            }
          }
        },
      }
    );
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="promo-code" className="text-sm font-medium">
              Promo Code
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="promo-code"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isPending}
                className="uppercase"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCode();
                  }
                }}
              />
              <Button
                onClick={handleApplyCode}
                disabled={isPending || !code.trim()}
                className="whitespace-nowrap"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Tag className="h-4 w-4 mr-2" />
                )}
                Apply
              </Button>
            </div>
          </div>

          {appliedCode && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                <span className="font-semibold">{appliedCode}</span> applied
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponCodeInput;