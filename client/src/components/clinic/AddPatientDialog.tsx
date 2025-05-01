import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define form validation schema
const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  treatment: z.string().optional(),
  status: z.string(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Configure form with default values
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      treatment: "",
      status: "New Patient",
    },
  });

  // Mutation for adding a new patient
  const addPatientMutation = useMutation({
    mutationFn: async (values: PatientFormValues) => {
      const response = await apiRequest("POST", "/api/clinic/patients", values);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add patient");
      }
      return await response.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Invalidate patients query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/clinic/patients"] });
      
      // Show success message
      toast({
        title: t("clinic.patients.add_success", "Patient Added"),
        description: t(
          "clinic.patients.add_success_desc",
          "The patient has been added successfully."
        ),
      });
    },
    onError: (error) => {
      toast({
        title: t("clinic.patients.add_error", "Error"),
        description: error.message || t("clinic.patients.add_error_desc", "Failed to add patient"),
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: PatientFormValues) => {
    addPatientMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t("clinic.patients.add_patient", "Add Patient")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "clinic.patients.add_patient_desc",
              "Enter the details of the new patient"
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("clinic.patients.form.name", "Full Name")}*
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Smith" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("clinic.patients.form.email", "Email")}*
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john.smith@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("clinic.patients.form.phone", "Phone Number")}*
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+44 7700 900123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("clinic.patients.form.treatment", "Treatment Interest")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Dental Implants, Veneers"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("clinic.patients.form.status", "Status")}*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New Patient">
                        {t("clinic.patients.status_new", "New Patient")}
                      </SelectItem>
                      <SelectItem value="Active">
                        {t("clinic.patients.status_active", "Active")}
                      </SelectItem>
                      <SelectItem value="Scheduled">
                        {t("clinic.patients.status_scheduled", "Scheduled")}
                      </SelectItem>
                      <SelectItem value="Completed">
                        {t("clinic.patients.status_completed", "Completed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={addPatientMutation.isPending}
                className="gap-2"
              >
                {addPatientMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t("clinic.patients.add_patient_submit", "Add Patient")}
              </Button>
            </DialogFooter>
            <Alert variant="destructive" className="mt-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Patient Privacy Protection</AlertTitle>
              <AlertDescription>
                For business protection, patient contact information will be partially masked until treatment is confirmed. 
                Attempting to directly contact patients outside the platform is prohibited by our terms of service.
              </AlertDescription>
            </Alert>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;