import React from "react";
import { Link } from "wouter";
import { QuoteRequest, QuoteVersion } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getStatusBadgeColor, getStatusLabel } from "./quote-list-table";
import { useNavigation } from "@/hooks/use-navigation";
import { ROUTES } from "@/lib/routes";
import { 
  ArrowLeft, 
  Clipboard, 
  Download, 
  File, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  FileCheck,
  Sparkles,
  Tag,
  Clock
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import QuoteXrayFiles from "./quote-xray-files";
import { PromoCodeBadge } from "@/components/promo/PromoCodeSummary";
import { PromoCodeSummary } from "@/components/promo/PromoCodeSummary";
import { DiscountType, PromoType } from "@shared/schema";

type PortalType = "patient" | "clinic" | "admin";

export interface ActionButton {
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary" | "primary" | "accent" | "success" | "warning";
  onClick: () => void;
}

interface QuoteDetailProps {
  quoteRequest: QuoteRequest;
  versions: QuoteVersion[];
  portalType: PortalType;
  onBack?: () => void;
  actions?: ActionButton[];
}

export default function QuoteDetail({
  quoteRequest,
  versions,
  portalType,
  onBack,
  actions = [],
}: QuoteDetailProps) {
  // Use our navigation system
  const { navigateTo } = useNavigation();
  // Check if a custom action already exists for the same functionality
  const hasEquivalentCustomAction = () => {
    // If no actions provided, we definitely don't have an equivalent
    if (!actions || actions.length === 0) return false;
    
    // Check for clinic status actions that would conflict with our standard ones
    if (portalType === "clinic" && quoteRequest.status === "assigned") {
      return actions.some(action => action.label === "Begin Processing");
    }
    
    // Add other portal checks if needed in the future
    return false;
  };

  const getActionText = () => {
    // If we already have a custom action button that does the same thing, don't show the standard one
    if (hasEquivalentCustomAction()) return null;
    
    if (portalType === "admin") {
      if (quoteRequest.status === "pending") {
        return "Assign to Clinic";
      } else if (
        quoteRequest.status === "assigned" ||
        quoteRequest.status === "in_progress"
      ) {
        return "Create Quote";
      }
    } else if (portalType === "clinic" && quoteRequest.status === "assigned") {
      return "Begin Processing";
    } else if (portalType === "patient" && quoteRequest.status === "sent") {
      return "Review Quote";
    }
    return null;
  };

  const getActionPath = () => {
    const basePath = `/${portalType}/quotes/${quoteRequest.id}`;
    if (portalType === "admin") {
      if (quoteRequest.status === "pending") {
        return `${basePath}/assign`;
      } else if (
        quoteRequest.status === "assigned" ||
        quoteRequest.status === "in_progress"
      ) {
        return `${basePath}/create-quote`;
      }
    } else if (portalType === "clinic" && quoteRequest.status === "assigned") {
      return `${basePath}/process`;
    } else if (portalType === "patient" && quoteRequest.status === "sent") {
      return `${basePath}/review`;
    }
    return basePath;
  };

  const actionText = getActionText();
  const actionPath = getActionPath();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => {
            // Use our improved navigation approach
            if (portalType === 'patient') {
              // Set the session flag first, then navigate to patient portal
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('patient_portal_section', 'quotes');
                navigateTo(ROUTES.PATIENT_PORTAL);
              }
            } else if (portalType === 'admin') {
              navigateTo(ROUTES.ADMIN_QUOTES);
            } else if (portalType === 'clinic') {
              navigateTo(ROUTES.CLINIC_QUOTES);
            } else if (onBack) {
              // Legacy fallback
              onBack();
            }
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quotes
        </Button>

        <div className="flex gap-2">
          {actions.map((action, index) => (
            <Button 
              key={index} 
              variant={action.variant} 
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
          
          {actionText && (
            <Button asChild>
              <Link to={actionPath}>{actionText}</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Special Offer Alert - Only show for clinics and if a special offer exists */}
          {(portalType === 'clinic' || portalType === 'admin') && quoteRequest.specialOffer && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-blue-800 gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Special Offer Selected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-800 text-lg">{quoteRequest.specialOffer.title}</span>
                    <div className="flex items-center mt-1 text-blue-700">
                      <Tag className="h-4 w-4 mr-2" />
                      {quoteRequest.specialOffer.discountType === 'percentage' 
                        ? `${quoteRequest.specialOffer.discountValue}% discount` 
                        : `£${quoteRequest.specialOffer.discountValue} discount`}
                      {quoteRequest.specialOffer.applicableTreatment && (
                        <span className="ml-1">on {quoteRequest.specialOffer.applicableTreatment}</span>
                      )}
                    </div>
                    {quoteRequest.specialOffer.expiryDate && (
                      <div className="flex items-center mt-1 text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Valid until {formatDate(quoteRequest.specialOffer.expiryDate)}
                      </div>
                    )}
                    {quoteRequest.specialOffer.terms && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>Terms:</strong> {quoteRequest.specialOffer.terms}
                      </p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-md text-sm text-gray-700 border border-blue-100">
                    <strong>Note for clinic:</strong> This patient selected this special offer from your promotions.
                    Please ensure the discount is applied to their quote as per the terms of the offer.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  Quote Request #{quoteRequest.id}
                  <Badge variant={getStatusBadgeColor(quoteRequest.status)}>
                    {getStatusLabel(quoteRequest.status)}
                  </Badge>
                  {quoteRequest.promoCode && quoteRequest.discountType && quoteRequest.discountValue && (
                    <PromoCodeBadge 
                      promoCode={quoteRequest.promoCode} 
                      discountType={quoteRequest.discountType as DiscountType}
                      discountValue={parseFloat(quoteRequest.discountValue.toString())}
                    />
                  )}
                </CardTitle>
                <CardDescription>
                  Created on {formatDate(quoteRequest.createdAt)}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="quotes">
                    Quotes ({versions.length})
                  </TabsTrigger>
                  <TabsTrigger value="xrays">
                    X-Rays ({quoteRequest.xrayCount || 0})
                  </TabsTrigger>
                  {portalType === "admin" && (
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Treatment Requested
                    </h3>
                    <p className="text-xl font-medium">{quoteRequest.treatment}</p>
                    {quoteRequest.specificTreatment && (
                      <p className="text-muted-foreground mt-1">
                        {quoteRequest.specificTreatment}
                      </p>
                    )}
                  </div>
                  
                  {quoteRequest.promoCode && (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100 space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                        <Tag className="h-4 w-4" />
                        Promotional Code
                      </h3>
                      
                      {quoteRequest.promoName && (
                        <p className="font-medium">{quoteRequest.promoName}</p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {quoteRequest.promoCode}
                        </Badge>
                        
                        {quoteRequest.discountType && quoteRequest.discountValue && (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            {quoteRequest.discountType === 'percentage' 
                              ? `${quoteRequest.discountValue}% off` 
                              : `${formatCurrency(parseFloat(quoteRequest.discountValue.toString()))} off`}
                          </Badge>
                        )}
                      </div>
                      
                      {quoteRequest.subtotal && quoteRequest.totalPrice && (portalType === 'admin' || portalType === 'clinic') && (
                        <div className="text-sm mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(quoteRequest.subtotal.toString()))}</span>
                          </div>
                          {quoteRequest.totalAfterDiscount && (
                            <>
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span className="font-medium">-{formatCurrency(parseFloat(quoteRequest.subtotal.toString()) - parseFloat(quoteRequest.totalAfterDiscount.toString()))}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Total after discount:</span>
                                <span>{formatCurrency(parseFloat(quoteRequest.totalAfterDiscount.toString()))}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {quoteRequest.budget && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Budget</h3>
                      <p className="text-xl font-medium">
                        {formatCurrency(quoteRequest.budget)}
                      </p>
                    </div>
                  )}

                  {quoteRequest.travelDateRange && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold mb-1">
                          Travel Date Preference
                        </h3>
                        <p>{quoteRequest.travelDateRange}</p>
                      </div>
                    </div>
                  )}

                  {quoteRequest.notes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Patient Notes
                      </h3>
                      <p className="whitespace-pre-line">{quoteRequest.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quotes">
                  {versions.length === 0 ? (
                    <div className="text-center py-6 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        No quotes have been created yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {versions
                        .sort((a, b) => b.versionNumber - a.versionNumber)
                        .map((version) => (
                          <Card key={version.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                  Quote Version {version.versionNumber}
                                  <Badge
                                    variant={
                                      version.status === "accepted"
                                        ? "success"
                                        : version.status === "rejected"
                                        ? "destructive"
                                        : version.status === "sent"
                                        ? "accent"
                                        : "secondary"
                                    }
                                  >
                                    {version.status.charAt(0).toUpperCase() +
                                      version.status.slice(1)}
                                  </Badge>
                                </CardTitle>
                                <CardDescription>
                                  {formatDate(version.createdAt)}
                                </CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                      Total
                                    </h4>
                                    <p className="text-2xl font-bold">
                                      {formatCurrency(
                                        version.quoteData.total,
                                        version.quoteData.currency
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                      Treatments
                                    </h4>
                                    <p className="text-lg">
                                      {version.quoteData.treatments.length} items
                                    </p>
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="flex items-center gap-2"
                                  >
                                    <Link
                                      to={`/${portalType}/quotes/${quoteRequest.id}/versions/${version.id}`}
                                    >
                                      <FileCheck className="h-4 w-4" />
                                      View Full Quote
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="xrays">
                  {!quoteRequest.hasXrays ? (
                    <div className="text-center py-6 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        No X-rays have been uploaded.
                      </p>
                      {portalType === "patient" && (
                        <Button className="mt-4" asChild>
                          <Link to={`/patient/quotes/${quoteRequest.id}/upload-xrays`}>
                            Upload X-Rays
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <QuoteXrayFiles quoteId={quoteRequest.id} portalType={portalType} />
                  )}
                </TabsContent>

                {portalType === "admin" && (
                  <TabsContent value="notes">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Admin Notes
                        </h3>
                        <textarea
                          className="w-full min-h-[120px] p-3 border rounded-md"
                          placeholder="Add admin notes here..."
                          defaultValue={quoteRequest.adminNotes || ""}
                        />
                        <div className="flex justify-end mt-2">
                          <Button>Save Notes</Button>
                        </div>
                      </div>

                      {quoteRequest.clinicNotes && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Clinic Notes
                          </h3>
                          <div className="p-4 bg-muted/30 rounded-md whitespace-pre-line">
                            {quoteRequest.clinicNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {quoteRequest.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{quoteRequest.name}</h3>
                  {(quoteRequest.patientCountry || quoteRequest.patientCity) && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {quoteRequest.patientCity && quoteRequest.patientCountry
                        ? `${quoteRequest.patientCity}, ${quoteRequest.patientCountry}`
                        : quoteRequest.patientCity || quoteRequest.patientCountry}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{quoteRequest.email}</span>
                </div>
                {quoteRequest.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{quoteRequest.phone}</span>
                  </div>
                )}
                {quoteRequest.patientLanguage && (
                  <div className="flex items-center gap-2">
                    <Clipboard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Preferred Language: {quoteRequest.patientLanguage}
                    </span>
                  </div>
                )}
              </div>

              {portalType !== "patient" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {quoteRequest.selectedClinic && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Clinic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {quoteRequest.selectedClinic.logo ? (
                      <AvatarImage src={quoteRequest.selectedClinic.logo} />
                    ) : (
                      <AvatarFallback>
                        {quoteRequest.selectedClinic.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {quoteRequest.selectedClinic.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {quoteRequest.selectedClinic.city},{" "}
                      {quoteRequest.selectedClinic.country}
                    </p>
                  </div>
                </div>
                
                {quoteRequest.assignedAt && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Assigned on {formatDate(quoteRequest.assignedAt)}
                  </p>
                )}

                {portalType === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    asChild
                  >
                    <Link to={`/admin/clinics/${quoteRequest.selectedClinicId}`}>
                      View Clinic Details
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quote Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="absolute h-full w-px bg-border left-[7px] top-6" />
                    <div className="h-3.5 w-3.5 rounded-full bg-primary mt-1" />
                  </div>
                  <div>
                    <p className="font-medium">Quote Request Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(quoteRequest.createdAt)}
                    </p>
                  </div>
                </div>

                {quoteRequest.assignedAt && (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="absolute h-full w-px bg-border left-[7px] top-6" />
                      <div className="h-3.5 w-3.5 rounded-full bg-secondary mt-1" />
                    </div>
                    <div>
                      <p className="font-medium">Assigned to Clinic</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(quoteRequest.assignedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {versions.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="absolute h-full w-px bg-border left-[7px] top-6" />
                      <div className="h-3.5 w-3.5 rounded-full bg-accent mt-1" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Quote{versions.length > 1 ? "s" : ""} Created
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(versions[0].createdAt)}
                        {versions.length > 1 &&
                          ` (${versions.length} versions)`}
                      </p>
                    </div>
                  </div>
                )}

                {quoteRequest.status === "accepted" && (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-3.5 w-3.5 rounded-full bg-success mt-1" />
                    </div>
                    <div>
                      <p className="font-medium">Quote Accepted</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          versions.find((v) => v.status === "accepted")
                            ?.createdAt || new Date().toISOString()
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {quoteRequest.status === "rejected" && (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-3.5 w-3.5 rounded-full bg-destructive mt-1" />
                    </div>
                    <div>
                      <p className="font-medium">Quote Rejected</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(
                          versions.find((v) => v.status === "rejected")
                            ?.createdAt || new Date().toISOString()
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}