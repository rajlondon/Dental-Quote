import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useApplyCode } from "@/hooks/use-apply-code";

const formSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50)
});

type FormValues = z.infer<typeof formSchema>;

interface CouponCodeInputProps {
  quoteId: string;
  onApplied?: () => void;
}

/**
 * Input component for users to enter and apply promotional codes
 */
export const CouponCodeInput = ({ quoteId, onApplied }: CouponCodeInputProps) => {
  const { applyPromoCode, isApplying } = useApplyCode();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ""
    }
  });

  const onSubmit = (values: FormValues) => {
    if (isApplying) return;
    
    applyPromoCode(
      { 
        code: values.code.trim().toUpperCase(), 
        quoteId 
      },
      {
        onSuccess: () => {
          form.reset();
          if (onApplied) onApplied();
        }
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input 
                      placeholder="Enter coupon code" 
                      {...field} 
                      className="uppercase" 
                      disabled={isApplying}
                      autoComplete="off"
                    />
                  </FormControl>
                  <Button 
                    type="submit" 
                    disabled={isApplying || !form.formState.isValid}
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};