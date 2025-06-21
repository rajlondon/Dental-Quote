import { useState } from "react";
// Removed react-i18next
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Forgot password form schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPasswordPage() {
  // Translation removed
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Forgot password form
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", values);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setEmailSent(true);
        toast({
          title: "Reset Email Sent",
          description: "If your email is registered, you will receive a password reset link.",
        });
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "There was a problem sending the reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              {emailSent 
                ? "Check your email for a password reset link" 
                : "Enter your email address below and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-center text-green-600">
                  If your email is registered, you will receive a password reset link shortly.
                </p>
                <p className="text-center text-sm text-gray-600">
                  Please check your inbox and spam folder.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEmailSent(false);
                    form.reset();
                  }}
                  className="w-full"
                >
                  Send Another Reset Link
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/portal-login" className="text-sm text-blue-600 hover:underline">
              Return to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}