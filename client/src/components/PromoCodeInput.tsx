import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PromoCodeInputProps {
  onApplyPromoCode: (code: string) => void;
  onRemovePromoCode: () => void;
  appliedCode: string | null;
  isValidCode: boolean;
  discountAmount: number;
  currencySymbol?: string;
  disabled?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  onApplyPromoCode,
  onRemovePromoCode,
  appliedCode,
  isValidCode,
  discountAmount,
  currencySymbol = '£',
  disabled = false
}) => {
  const { t } = useTranslation();
  const [inputCode, setInputCode] = useState('');
  const { toast } = useToast();

  const handleApply = () => {
    if (!inputCode.trim()) {
      toast({
        title: t("common.error", "Error"),
        description: t("pricing.promo_code.empty", "Please enter a promo code"),
        variant: "destructive",
      });
      return;
    }
    
    onApplyPromoCode(inputCode.trim().toUpperCase());
    setInputCode('');
  };

  return (
    <div className="rounded-md border p-4 mb-4">
      <h3 className="text-sm font-medium mb-2">{t("pricing.promo_code.title", "Promo Code")}</h3>
      
      {appliedCode ? (
        <div className="space-y-2">
          <div className="flex items-center">
            {isValidCode ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className="font-medium">{appliedCode}</span>
            {isValidCode && (
              <span className="ml-2 text-sm text-green-600">
                ({t("pricing.promo_code.discount", "Discount")}: {currencySymbol}{discountAmount})
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRemovePromoCode}
            disabled={disabled}
          >
            {t("pricing.promo_code.remove", "Remove")}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={t("pricing.promo_code.placeholder", "Enter promo code")}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1"
            disabled={disabled}
          />
          <Button 
            onClick={handleApply}
            disabled={disabled}
          >
            {t("pricing.promo_code.apply", "Apply")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;