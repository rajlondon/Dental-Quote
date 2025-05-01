import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { adminUser, isLoading, adminLogin } = useAdminAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  // After successful authentication, navigate to admin portal
  useEffect(() => {
    if (adminUser) {
      console.log("Admin authentication successful, navigating to admin portal");
      navigate("/admin-portal");
    }
  }, [adminUser, navigate]);

  // Login form validation schema
  const formSchema = z.object({
    email: z.string().email(t("form.validation.email", "Please enter a valid email")),
    password: z.string().min(6, t("form.validation.password_length", "Password must be at least 6 characters")),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setLoginError(null);
    
    try {
      await adminLogin(values.email, values.password);
      // Navigation is handled by the useEffect above
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError(t("admin.login.unknown_error", "An unknown error occurred"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img 
          src="/images/mydentalfly-logo.png" 
          alt="MyDentalFly" 
          className="h-12 mx-auto"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t("admin.login.title", "Admin Portal")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t("admin.login.subtitle", "Secure access for administrators")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("admin.login.signin", "Sign in")}</CardTitle>
            <CardDescription>
              {t("admin.login.signin_desc", "Enter your credentials to access the admin portal")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.email", "Email")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("form.email_placeholder", "admin@example.com")} 
                          {...field}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.password", "Password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginError && (
                  <div className="text-sm font-medium text-destructive">
                    {loginError}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("form.signing_in", "Signing in...")}
                    </>
                  ) : (
                    t("form.sign_in", "Sign in")
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              onClick={() => navigate("/")}
              className="text-sm text-gray-500"
            >
              {t("admin.login.back_to_home", "Back to home page")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;