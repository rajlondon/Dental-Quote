/**
 * Coupon Code Input Component
 * Allows users to apply coupon codes to their quotes
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApplyCode } from '@/hooks/use-apply-code';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { Loader2 } from 'lucide-react';

interface CouponCodeInputProps {
  quoteId: string;
  clinicId: string;
  className?: string;
}

export function CouponCodeInput({ quoteId, clinicId, className = '' }: CouponCodeInputProps) {
  const [code, setCode] = useState('');
  const applyCode = useApplyCode();

  // Don't render if the feature is disabled
  if (!isFeatureEnabled('couponCodes')) {
    return null;
  }

  const handleApplyCode = () => {
    if (!code.trim()) return;
    
    applyCode.mutate({
      quoteId,
      clinicId,
      code: code.trim()
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCode();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-sm font-medium">Have a coupon code?</p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Enter code"
          className="flex-1"
          disabled={applyCode.isPending}
        />
        <Button 
          onClick={handleApplyCode}
          disabled={!code.trim() || applyCode.isPending}
          size="sm"
        >
          {applyCode.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  );
}