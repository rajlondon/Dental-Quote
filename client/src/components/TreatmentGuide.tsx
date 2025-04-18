import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertCircle, CheckCircle, Lightbulb, Shield, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GeneralDentistryTab from './GeneralDentistryTab';

const TreatmentGuide: React.FC = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold">
          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
          Dental Treatment Guide
        </CardTitle>
        <CardDescription>
          Learn about popular dental treatments and what to consider when creating your treatment plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="implants" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="implants">Implants</TabsTrigger>
            <TabsTrigger value="veneers">Veneers</TabsTrigger>
            <TabsTrigger value="crowns">Crowns</TabsTrigger>
            <TabsTrigger value="bridges">Bridges</TabsTrigger>
            <TabsTrigger value="general">General Dentistry</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value="implants" className="pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dental Implants</h3>
              <p className="text-gray-700">
                Dental implants are titanium posts surgically placed into the jawbone to replace missing tooth roots.
                They provide a strong foundation for fixed or removable replacement teeth.
              </p>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  When building your treatment plan, specify the number of implants needed. An average full arch replacement
                  requires 4-6 implants, while a single tooth requires just one.
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="brands">
                  <AccordionTrigger className="text-sm font-medium">
                    Implant Brands & Quality Levels
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-blue-500" />
                            Standard
                          </h4>
                          <p className="text-xs text-gray-600">
                            Brands like Osstem and Hiossen provide reliable quality at a lower price point.
                            3-5 year guarantees typically offered.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-purple-500" />
                            Premium
                          </h4>
                          <p className="text-xs text-gray-600">
                            Brands like Straumann and Nobel Biocare offer excellent quality with extensive
                            research backing. 5-10 year guarantees.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-amber-500" />
                            Luxury
                          </h4>
                          <p className="text-xs text-gray-600">
                            Top-tier options from Nobel Biocare All-on-4 and Straumann BLX offer lifetime
                            guarantees and the highest success rates.
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        Our dental advisors will help you select the right brand based on your needs and budget.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="process">
                  <AccordionTrigger className="text-sm font-medium">
                    Implant Treatment Process
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Consultation & Planning</p>
                          <p className="text-xs text-gray-600">Comprehensive examination, 3D scans, and treatment planning</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Implant Placement</p>
                          <p className="text-xs text-gray-600">Surgical placement of titanium implants into the jawbone</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Healing Period</p>
                          <p className="text-xs text-gray-600">3-6 months of osseointegration (implant bonding with bone)</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">4</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Abutment Placement</p>
                          <p className="text-xs text-gray-600">Attachment of the connector that will hold your new tooth</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">5</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Crown Placement</p>
                          <p className="text-xs text-gray-600">Final restoration with custom-made porcelain or zirconia crowns</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips for Your Treatment Plan
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Include bone grafting if you've been missing teeth for a long time</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">For full-mouth restorations, consider All-on-4 or All-on-6 options</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Request metal-free zirconia abutments for implants in visible areas</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Consider temporary teeth options during the healing period</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="veneers" className="pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dental Veneers</h3>
              <p className="text-gray-700">
                Veneers are thin shells of porcelain or composite material bonded to the front surface of teeth to improve 
                their appearance. They're perfect for addressing discoloration, chips, gaps, or misshapen teeth.
              </p>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  For your treatment plan, consider how many veneers you need. A full smile makeover 
                  typically involves 8-10 veneers (covering the visible front teeth).
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="types">
                  <AccordionTrigger className="text-sm font-medium">
                    Types of Veneers
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-blue-500" />
                            Composite Veneers
                          </h4>
                          <p className="text-xs text-gray-600">
                            Made from resin, less expensive, can be done in a single visit. 
                            5-7 year lifespan with proper care.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-purple-500" />
                            Porcelain Veneers
                          </h4>
                          <p className="text-xs text-gray-600">
                            Custom-made in a lab, more durable, stain-resistant, natural-looking.
                            10-15 year lifespan with proper care.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-amber-500" />
                            E.max/Lumineers
                          </h4>
                          <p className="text-xs text-gray-600">
                            Ultra-thin, require minimal tooth reduction, strongest material.
                            15-20+ year lifespan with proper care.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="process">
                  <AccordionTrigger className="text-sm font-medium">
                    Veneer Treatment Process
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Consultation & Design</p>
                          <p className="text-xs text-gray-600">Digital smile design to preview your new smile</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tooth Preparation</p>
                          <p className="text-xs text-gray-600">Minimal removal of enamel (0.3-0.7mm) to make room for veneers</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Temporary Veneers</p>
                          <p className="text-xs text-gray-600">Placement of temporaries while permanent ones are crafted</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">4</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Veneer Placement</p>
                          <p className="text-xs text-gray-600">Bonding of custom-made veneers to your teeth</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">5</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Final Adjustments</p>
                          <p className="text-xs text-gray-600">Fine-tuning of bite and appearance</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips for Your Treatment Plan
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Include teeth whitening before veneer placement for best color matching</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Consider gum contouring for a more aesthetic gumline</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">E.max veneers offer the best combination of strength and aesthetics</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Request a wax mock-up to preview your smile before final placement</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="crowns" className="pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dental Crowns</h3>
              <p className="text-gray-700">
                Dental crowns are tooth-shaped caps placed over damaged or weakened teeth to restore their shape, 
                size, strength, and improve appearance. They're ideal for teeth with large fillings, root canals, 
                or significant damage.
              </p>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  For your treatment plan, specify the number of crowns needed and their locations. 
                  Different materials may be recommended for front teeth versus molars.
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="materials">
                  <AccordionTrigger className="text-sm font-medium">
                    Crown Materials
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-blue-500" />
                            PFM (Porcelain-Fused-to-Metal)
                          </h4>
                          <p className="text-xs text-gray-600">
                            Durable with reasonable aesthetics. Good for back teeth.
                            5-10 year guarantees typically offered.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-purple-500" />
                            Zirconia Crowns
                          </h4>
                          <p className="text-xs text-gray-600">
                            Very strong, natural-looking, metal-free. Excellent for any location.
                            10-15 year guarantees typically offered.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-amber-500" />
                            E.max (Lithium Disilicate)
                          </h4>
                          <p className="text-xs text-gray-600">
                            Superior aesthetics, strong, ideal for front teeth.
                            10-15 year guarantees typically offered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="process">
                  <AccordionTrigger className="text-sm font-medium">
                    Crown Treatment Process
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Tooth Preparation</p>
                          <p className="text-xs text-gray-600">Reshaping the tooth to make room for the crown</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Impressions</p>
                          <p className="text-xs text-gray-600">Digital or physical impressions taken for custom crown fabrication</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Temporary Crown</p>
                          <p className="text-xs text-gray-600">Placement of a temporary crown while permanent one is crafted</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">4</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Permanent Crown Placement</p>
                          <p className="text-xs text-gray-600">Fitting and cementing of the custom-made crown</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                          <span className="text-xs">5</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Adjustments</p>
                          <p className="text-xs text-gray-600">Fine-tuning the fit and bite if necessary</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips for Your Treatment Plan
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">If you need root canal treatment, include it with your crown</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Consider zirconia for back teeth and e.max for front teeth</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">If you grind your teeth, ask about reinforced crowns</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Match crown color to existing teeth or consider whitening first</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="bridges" className="pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dental Bridges</h3>
              <p className="text-gray-700">
                Dental bridges literally "bridge" the gap created by one or more missing teeth. They consist of one or more 
                pontics (artificial teeth) held in place by dental crowns that are cemented to the natural teeth or 
                implants on either side of the gap.
              </p>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  For your treatment plan, specify the number of units in the bridge (e.g., a 3-unit bridge replaces 
                  one missing tooth with crowns on adjacent teeth).
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="types">
                  <AccordionTrigger className="text-sm font-medium">
                    Types of Bridges
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-blue-500" />
                            Traditional Bridge
                          </h4>
                          <p className="text-xs text-gray-600">
                            Consists of pontics held in place by dental crowns on adjacent teeth.
                            Most common type of bridge.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-purple-500" />
                            Implant-Supported Bridge
                          </h4>
                          <p className="text-xs text-gray-600">
                            Held in place by dental implants instead of crowns on natural teeth.
                            Best long-term solution for missing multiple teeth.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-amber-500" />
                            Cantilever Bridge
                          </h4>
                          <p className="text-xs text-gray-600">
                            Used when adjacent teeth exist on only one side of the missing tooth.
                            Less common due to mechanical disadvantages.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-green-500" />
                            Maryland Bridge
                          </h4>
                          <p className="text-xs text-gray-600">
                            Conservative option using metal or porcelain framework bonded to adjacent teeth.
                            Less invasive but not as strong as traditional bridges.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="materials">
                  <AccordionTrigger className="text-sm font-medium">
                    Bridge Materials
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-blue-500" />
                            PFM (Porcelain-Fused-to-Metal)
                          </h4>
                          <p className="text-xs text-gray-600">
                            Traditional option with good durability. Metal framework provides strength.
                            5-10 year guarantees typically offered.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-purple-500" />
                            Zirconia
                          </h4>
                          <p className="text-xs text-gray-600">
                            Very strong metal-free option ideal for longer bridges. Highly durable.
                            10-15 year guarantees typically offered.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-amber-500" />
                            E.max (Lithium Disilicate)
                          </h4>
                          <p className="text-xs text-gray-600">
                            Excellent aesthetics, suitable for smaller bridges (3 units) in visible areas.
                            10-15 year guarantees typically offered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips for Your Treatment Plan
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Consider implant-supported bridges for the best long-term outcome</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">If more than 3 teeth are missing, multiple bridges or implants may be better</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Ensure supporting teeth are healthy enough to support a bridge</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">For bridges in visible areas, request higher-quality aesthetic materials</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="pt-4">
            <GeneralDentistryTab />
          </TabsContent>
          
          <TabsContent value="other" className="pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Other Dental Treatments</h3>
              <p className="text-gray-700">
                Beyond the major restorative treatments, there are many other procedures that you might want to include 
                in your treatment plan for comprehensive dental care.
              </p>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  A comprehensive treatment plan may include multiple types of procedures. Our dental advisors 
                  can help you determine the optimal combination for your needs.
                </AlertDescription>
              </Alert>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="cosmetic">
                  <AccordionTrigger className="text-sm font-medium">
                    Cosmetic Treatments
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-blue-500" />
                            Professional Teeth Whitening
                          </h4>
                          <p className="text-xs text-gray-600">
                            In-office or take-home whitening systems to brighten your smile.
                            Great to do before getting crowns or veneers.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-purple-500" />
                            Gum Contouring
                          </h4>
                          <p className="text-xs text-gray-600">
                            Reshaping the gumline to create a more balanced, aesthetic smile.
                            Often combined with veneers or crowns.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-amber-500" />
                            Composite Bonding
                          </h4>
                          <p className="text-xs text-gray-600">
                            Tooth-colored resin applied to repair chips, cracks, or gaps.
                            Less expensive alternative to veneers.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Zap className="h-3 w-3 mr-1 text-green-500" />
                            Smile Design
                          </h4>
                          <p className="text-xs text-gray-600">
                            Comprehensive approach combining multiple treatments for a complete smile makeover.
                            Customized to your facial features and preferences.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="functional">
                  <AccordionTrigger className="text-sm font-medium">
                    Functional Treatments
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-blue-500" />
                            Root Canal Treatment
                          </h4>
                          <p className="text-xs text-gray-600">
                            Removes infected pulp from inside the tooth, relieving pain and saving the tooth.
                            Usually followed by a crown placement.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-purple-500" />
                            Bone Grafting
                          </h4>
                          <p className="text-xs text-gray-600">
                            Builds up jawbone to support dental implants in areas of bone loss.
                            Often necessary for long-term missing teeth.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-amber-500" />
                            Tooth Extraction
                          </h4>
                          <p className="text-xs text-gray-600">
                            Removal of damaged or problematic teeth, including wisdom teeth.
                            May be necessary before implant placement.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-sm flex items-center mb-1">
                            <Shield className="h-3 w-3 mr-1 text-green-500" />
                            Sinus Lift
                          </h4>
                          <p className="text-xs text-gray-600">
                            Procedure to add bone to the upper jaw in the area of the molars and premolars.
                            Often needed for upper implants.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tips">
                  <AccordionTrigger className="text-sm font-medium">
                    Tips for Your Treatment Plan
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Include professional cleaning and exam as part of your treatment</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Consider teeth whitening before any color-matching procedures</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">If you have gum disease, include periodontal treatment in your plan</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Ask about a nightguard if you grind your teeth to protect your investment</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TreatmentGuide;