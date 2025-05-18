import React from 'react';
import { useParams } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Download, Info, PiggyBank, CheckCircle2, X, ArrowUpDown } from 'lucide-react';
import { useQuoteDetails } from '@/hooks/use-quote-details';

// Currency formatter component
const CurrencyFormat: React.FC<{amount: number, currency?: string}> = ({ 
  amount, 
  currency = 'USD' 
}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  
  return <span>{formatter.format(amount)}</span>;
};

const PatientQuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { quote, loading, error, downloadPdf } = useQuoteDetails(id);
  const { toast } = useToast();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'submitted':
        return <ArrowUpDown className="h-4 w-4 mr-1" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      default:
        return <Info className="h-4 w-4 mr-1" />;
    }
  };

  const handleDownloadPdf = async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your quote PDF...",
      });
      
      const blob = await downloadPdf();
      
      if (!blob) {
        throw new Error('Failed to download PDF');
      }
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quote-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Your quote PDF has been downloaded successfully",
      });
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast({
        title: "Error",
        description: "Failed to download quote PDF",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto my-8">
        <X className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Unable to load quote. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Quote #{quote.id} 
            <Badge className={`ml-3 ${getStatusBadgeColor(quote.status)}`}>
              <span className="flex items-center">
                {getStatusIcon(quote.status)}
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </span>
            </Badge>
          </h1>
          <p className="text-muted-foreground">Created: {new Date(quote.createdAt).toLocaleDateString()}</p>
        </div>
        <Button onClick={handleDownloadPdf} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{quote.patientName}</p>
            <p>{quote.patientEmail}</p>
            <p>{quote.patientPhone}</p>
          </CardContent>
        </Card>
        
        {quote.clinicId && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Clinic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{quote.clinicName || `Clinic #${quote.clinicId}`}</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p>Total Amount:</p>
              <p className="font-bold text-lg">
                <CurrencyFormat amount={quote.totalAmount} />
              </p>
            </div>
            
            {quote.promoCode && (
              <>
                <Separator className="my-2" />
                <div className="rounded-md bg-green-50 p-3 mt-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <PiggyBank className="h-5 w-5 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Promo Applied: {quote.promoCode}</h3>
                      {quote.discountAmount && (
                        <div className="mt-1 text-sm text-green-700">
                          You saved <CurrencyFormat amount={quote.discountAmount} />
                        </div>
                      )}
                      {quote.promoDescription && (
                        <div className="mt-1 text-xs text-green-700">
                          {quote.promoDescription}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="treatments" className="max-w-4xl mx-auto">
        <TabsList className="mb-4">
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          {quote.packageDetails && <TabsTrigger value="package">Package</TabsTrigger>}
          {quote.additionalServices && quote.additionalServices.length > 0 && (
            <TabsTrigger value="services">Additional Services</TabsTrigger>
          )}
          {quote.notes && <TabsTrigger value="notes">Notes</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle>Selected Treatments</CardTitle>
              <CardDescription>Dental treatments included in this quote</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell>
                        <div className="font-medium">{treatment.name}</div>
                        {treatment.description && (
                          <div className="text-sm text-muted-foreground">{treatment.description}</div>
                        )}
                      </TableCell>
                      <TableCell>{treatment.quantity}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyFormat amount={treatment.price} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {quote.packageDetails && (
          <TabsContent value="package">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Package</CardTitle>
                <CardDescription>Package details included in this quote</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold">{quote.packageDetails.name}</h3>
                  {quote.packageDetails.description && (
                    <p className="mt-2 text-muted-foreground">{quote.packageDetails.description}</p>
                  )}
                  <div className="mt-4 text-right">
                    <span className="font-bold">
                      <CurrencyFormat amount={quote.packageDetails.price} />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {quote.additionalServices && quote.additionalServices.length > 0 && (
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Additional Services</CardTitle>
                <CardDescription>Extra services included in this quote</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.additionalServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground">{service.description}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyFormat amount={service.price} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {quote.notes && (
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional information about this quote</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg whitespace-pre-wrap">
                  {quote.notes}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PatientQuoteDetail;