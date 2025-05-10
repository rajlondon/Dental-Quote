import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CouponCodeInputProps {
  onApplyCode: (code: string) => Promise<boolean>;
  disabled?: boolean;
  label?: string;
  description?: string;
}

/**
 * Input component for entering and applying coupon codes
 */
export const CouponCodeInput: React.FC<CouponCodeInputProps> = ({ 
  onApplyCode,
  disabled = false,
  label = "Have a coupon code?",
  description = "Enter your code to receive a discount"
}) => {
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const success = await onApplyCode(code.trim());
      
      if (success) {
        toast({
          title: "Discount applied",
          description: "Your coupon code was successfully applied",
          variant: "default",
        });
        setCode('');
      } else {
        setError('Invalid or expired coupon code');
        toast({
          title: "Invalid code",
          description: "The coupon code you entered is invalid or expired",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error applying code:', err);
      setError('Error applying code');
      toast({
        title: "Error",
        description: "There was a problem applying your coupon code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-primary" />
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleApplyCode} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="couponCode" className="sr-only">
              Coupon Code
            </Label>
            <Input
              id="couponCode"
              placeholder="Enter code (e.g. WELCOME20)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={disabled || isSubmitting}
              className={`font-mono uppercase ${error ? 'border-destructive' : ''}`}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
          <Button 
            type="submit" 
            variant="outline"
            size="sm"
            className="w-full"
            disabled={disabled || isSubmitting || !code.trim()}
          >
            {isSubmitting && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            Apply Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CouponCodeInput;