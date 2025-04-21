import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { CheckCircle2, AlertCircle, Info, ArrowRight } from 'lucide-react';

// Component to show testing instructions for any portal
const PortalTestingGuide: React.FC<{ portalType: 'patient' | 'clinic' | 'admin' }> = ({ portalType }) => {
  // Define features based on portal type
  const portalFeatures = getPortalFeatures(portalType);
  
  // Determine portal name for display
  const portalNames = {
    'patient': 'Patient Portal',
    'clinic': 'Clinic Portal',
    'admin': 'Admin Portal'
  };
  
  const portalName = portalNames[portalType];
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 bg-muted/30">
        <h1 className="text-xl font-semibold mb-2">{portalName} Testing Guide</h1>
        <p className="text-muted-foreground mb-3">
          This guide outlines how to test all features available in the {portalName.toLowerCase()}.
          Follow the instructions for each feature to verify its functionality.
        </p>
        
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Test Credentials</AlertTitle>
          <AlertDescription className="flex flex-col gap-1">
            <span><strong>Patient:</strong> patient@mydentalfly.com / Patient123!</span>
            <span><strong>Clinic:</strong> clinic@mydentalfly.com / Clinic123!</span>
            <span><strong>Admin:</strong> admin@mydentalfly.com / Admin123!</span>
          </AlertDescription>
        </Alert>
        
        <Alert variant="default" className="mb-4 bg-primary/10 border-primary/20">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle>GDPR Compliance</AlertTitle>
          <AlertDescription>
            All data handling in this portal complies with GDPR regulations. Personal data is securely processed and stored.
          </AlertDescription>
        </Alert>
      </div>
      
      <Tabs defaultValue="features">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="workflow">Test Workflow</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4 pt-4">
          <Accordion type="single" collapsible className="w-full">
            {portalFeatures.map((feature, index) => (
              <AccordionItem key={index} value={`feature-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center text-left">
                    <div className={`w-2 h-2 rounded-full mr-2 ${feature.implemented ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span>{feature.name}</span>
                    {!feature.implemented && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">Partial</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 border-l-2 border-l-gray-200 ml-1">
                    <p className="text-muted-foreground mb-2">{feature.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium mt-3">How to Test:</h4>
                      <ol className="list-decimal pl-5 space-y-1 text-sm">
                        {feature.testSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                      
                      {feature.expectedResults && (
                        <>
                          <h4 className="text-sm font-medium mt-3">Expected Results:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {feature.expectedResults.map((result, idx) => (
                              <li key={idx}>{result}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      
                      {!feature.implemented && (
                        <Alert className="mt-3 bg-amber-50 border-amber-200">
                          <AlertCircle className="h-4 w-4 text-amber-800" />
                          <AlertTitle className="text-amber-800">Implementation Note</AlertTitle>
                          <AlertDescription className="text-amber-700">
                            {feature.implementationNote || "This feature is partially implemented. Some functionality may be limited."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        
        <TabsContent value="workflow" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>End-to-End Testing Workflow</CardTitle>
              <CardDescription>
                Follow this sequence to test the entire user journey in the {portalName.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {getWorkflowSteps(portalType).map((step, index) => (
                  <li key={index} className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm mr-3">
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-medium mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.note && (
                        <p className="text-xs italic mt-1 text-muted-foreground">{step.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <Link href={getPortalPath(portalType)}>
                  <span>Go to {portalName}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>
                These security measures protect user data and ensure secure interactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSecurityFeatures(portalType).map((feature, index) => (
                <div key={index} className="pb-3">
                  <h3 className="font-medium mb-1">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  
                  {feature.testStep && (
                    <div className="mt-2 bg-muted/30 p-3 rounded-md">
                      <h4 className="text-xs font-medium uppercase mb-1">How to Verify:</h4>
                      <p className="text-sm">{feature.testStep}</p>
                    </div>
                  )}
                  
                  {index < getSecurityFeatures(portalType).length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Functions to get features for each portal type
function getPortalFeatures(portalType: string) {
  if (portalType === 'patient') {
    return [
      {
        name: "Account Creation and Login",
        description: "Create a new patient account or log in to an existing account.",
        implemented: true,
        testSteps: [
          "Navigate to '/portal-login'",
          "Click the 'Register' tab to create a new account",
          "Fill in the registration form with required fields",
          "Alternatively, use the test credentials to log in directly",
          "Test the 'Remember me' option for convenience"
        ],
        expectedResults: [
          "Successful account creation with confirmation message",
          "Redirect to the Patient Portal dashboard after login",
          "Correct display of user profile information"
        ]
      },
      {
        name: "Quote Generation",
        description: "Generate a dental treatment quote based on your requirements.",
        implemented: true,
        testSteps: [
          "From the dashboard, click on 'Request Quote' or navigate to '/your-quote'",
          "Fill in the treatment needs form with dental procedures",
          "Specify additional details like X-rays or travel preferences",
          "Submit the quote request form",
          "Check the messages section for clinic responses"
        ],
        expectedResults: [
          "Successful submission confirmation",
          "Quote request visible in your dashboard",
          "Notification when clinics respond with custom quotes"
        ]
      },
      {
        name: "Clinic Quote Comparison",
        description: "Compare quotes from different clinics to make an informed decision.",
        implemented: true,
        testSteps: [
          "Go to the 'Treatment Comparison' section",
          "View the side-by-side comparison of clinic quotes",
          "Toggle between different treatment options",
          "Filter by price, clinic rating, or location",
          "Select a preferred quote to proceed"
        ],
        expectedResults: [
          "Clear visual comparison of quotes",
          "Accurate price and treatment information",
          "Ability to select a preferred clinic"
        ]
      },
      {
        name: "Clinic Communication",
        description: "Message clinics directly with questions or treatment inquiries.",
        implemented: true,
        testSteps: [
          "Navigate to the 'Messages' section",
          "Choose a clinic from your active communications",
          "Type and send a new message in the chat interface",
          "Attach files if needed using the paperclip icon",
          "Test notification alerts for new messages"
        ],
        expectedResults: [
          "Message appears in the chat thread",
          "Timestamp and read status indicators work correctly",
          "Notification counters update appropriately"
        ]
      },
      {
        name: "Document Uploads",
        description: "Securely upload medical documents, X-rays, and other files.",
        implemented: true,
        testSteps: [
          "Go to the 'Documents' section",
          "Click the 'Upload Document' button",
          "Select a file from your device (supported formats: PDF, JPG, PNG)",
          "Add a document type classification and notes",
          "Submit the upload form"
        ],
        expectedResults: [
          "Document appears in your documents list",
          "File preview functionality works correctly",
          "Documents are correctly categorized by type"
        ]
      },
      {
        name: "Treatment Plan Review",
        description: "Review and accept treatment plans from your selected clinic.",
        implemented: true,
        testSteps: [
          "Navigate to the 'Treatment Plan' section",
          "View your current treatment plan details",
          "Expand specific treatment items for more information",
          "Review associated costs and clinic recommendations",
          "Accept the treatment plan or request changes"
        ],
        expectedResults: [
          "Treatment plan details display correctly",
          "Accept/Decline buttons function as expected",
          "Status updates after taking action"
        ]
      },
      {
        name: "Deposit Payment",
        description: "Make secure deposit payments to confirm your selected treatment.",
        implemented: true,
        testSteps: [
          "From the treatment plan section, click 'Make Deposit Payment'",
          "Review the booking summary and payment amount",
          "Enter Stripe test card details (4242 4242 4242 4242, any future date, any CVV)",
          "Complete the payment process",
          "Check for confirmation and receipt"
        ],
        expectedResults: [
          "Secure payment form loads correctly",
          "Payment processing indicators work",
          "Success confirmation page appears",
          "Booking status updates to 'Deposit Paid'"
        ]
      },
      {
        name: "Dental Chart Visualization",
        description: "View interactive dental charts showing your current dental status.",
        implemented: true,
        testSteps: [
          "Go to the 'Dental Chart' section",
          "Interact with the 3D dental model",
          "Toggle between different views (3D and 2D)",
          "Click on specific teeth to see treatment details",
          "Check the color-coding legend"
        ],
        expectedResults: [
          "Dental chart renders correctly",
          "Interactive elements function properly",
          "Treatment information displays accurately"
        ]
      }
    ];
  } else if (portalType === 'clinic') {
    return [
      {
        name: "Secure Login",
        description: "Clinic staff can securely log in to their dedicated portal.",
        implemented: true,
        testSteps: [
          "Navigate to '/portal-login'",
          "Use clinic test credentials: clinic@mydentalfly.com / Clinic123!",
          "Verify you're redirected to the clinic dashboard"
        ],
        expectedResults: [
          "Successful authentication",
          "Access to clinic-specific features",
          "Appropriate role permissions"
        ]
      },
      {
        name: "Quote Request Management",
        description: "View and respond to patient-generated quote requests.",
        implemented: true,
        testSteps: [
          "Go to the 'Quote Requests' section",
          "Review incoming quote requests from patients",
          "Open a specific request to see detailed requirements",
          "Create a customized quote in response",
          "Send the quote back to the patient"
        ],
        expectedResults: [
          "Quote requests display correctly",
          "Quote creation form works properly",
          "Confirmation of quote sent to patient"
        ]
      },
      {
        name: "Patient Document Review",
        description: "Access and review documents uploaded by patients, such as X-rays and medical forms.",
        implemented: true,
        testSteps: [
          "Navigate to the 'Patient Documents' section",
          "Select a patient from the list",
          "View their uploaded documents",
          "Download and preview X-rays or medical records",
          "Add clinical notes to specific documents"
        ],
        expectedResults: [
          "Patient documents display correctly",
          "Preview functionality works",
          "Notes can be added and saved"
        ]
      },
      {
        name: "Treatment Plan Creation",
        description: "Create and send detailed treatment plans to patients.",
        implemented: true,
        testSteps: [
          "Go to the 'Treatment Plans' section",
          "Click 'Create New Plan' for a specific patient",
          "Add treatment procedures, costs, and recommendations",
          "Include notes and recovery instructions",
          "Send the completed plan to the patient"
        ],
        expectedResults: [
          "Treatment plan editor functions properly",
          "All data fields save correctly",
          "Plan is successfully sent to patient"
        ]
      },
      {
        name: "Patient Communication",
        description: "Direct messaging with patients to discuss treatments, answer questions, and provide support.",
        implemented: true,
        testSteps: [
          "Access the 'Messages' section",
          "Select a patient conversation",
          "Send a test message",
          "Attach a document or image if needed",
          "Test notification alerts for new messages"
        ],
        expectedResults: [
          "Message thread updates in real-time",
          "Attachments can be added successfully",
          "Message status indicators work properly"
        ]
      },
      {
        name: "Appointment Management",
        description: "Schedule and manage patient appointments at the clinic.",
        implemented: false,
        implementationNote: "Calendar integration is partially implemented. You can create appointments, but automated reminders are not fully functional.",
        testSteps: [
          "Go to the 'Appointments' section",
          "View the clinic schedule calendar",
          "Create a new appointment for a patient",
          "Set date, time, and appointment type",
          "Save the appointment details"
        ],
        expectedResults: [
          "Appointment appears on the calendar",
          "Patient receives notification about the appointment",
          "Appointment details are accurately stored"
        ]
      },
      {
        name: "Treatment Mapper",
        description: "Map standardized treatment codes to clinic-specific procedures and pricing.",
        implemented: false,
        implementationNote: "The treatment mapper has basic functionality but complex mappings may not be saved correctly.",
        testSteps: [
          "Navigate to 'Treatment Mapper'",
          "Review the list of standard treatment codes",
          "Map a standard treatment to your clinic's procedure",
          "Set pricing and notes for the treatment",
          "Save the mapping configuration"
        ],
        expectedResults: [
          "Mapping is saved successfully",
          "Mapped treatments appear in your clinic profile",
          "Correct pricing is reflected in patient quotes"
        ]
      }
    ];
  } else if (portalType === 'admin') {
    return [
      {
        name: "Secure Admin Login",
        description: "Admin users can securely access the administration portal.",
        implemented: true,
        testSteps: [
          "Navigate to '/portal-login'",
          "Use admin test credentials: admin@mydentalfly.com / Admin123!",
          "Verify you're redirected to the admin dashboard"
        ],
        expectedResults: [
          "Successful authentication",
          "Access to admin-specific features",
          "Full administrative permissions"
        ]
      },
      {
        name: "User Account Management",
        description: "View, edit, and manage patient and clinic accounts.",
        implemented: true,
        testSteps: [
          "Go to the 'User Management' section",
          "Filter users by type (patient/clinic/admin)",
          "View a specific user's details",
          "Edit information or update permissions",
          "Save changes to the user account"
        ],
        expectedResults: [
          "User list displays correctly",
          "User edit form works properly",
          "Changes are saved successfully"
        ]
      },
      {
        name: "Quote Oversight",
        description: "Monitor and oversee quote requests and clinic responses.",
        implemented: true,
        testSteps: [
          "Navigate to the 'Quotes' section",
          "Review active quote requests from patients",
          "Check clinic responses and pricing",
          "Approve or request adjustments to quotes",
          "Track conversion rates from quotes to bookings"
        ],
        expectedResults: [
          "Quote data displays accurately",
          "Approval workflows function correctly",
          "Analytics data is current and correct"
        ]
      },
      {
        name: "Clinic Management",
        description: "Add, edit, and manage clinic profiles and capabilities.",
        implemented: true,
        testSteps: [
          "Access the 'Clinics' section",
          "Review the list of registered clinics",
          "Edit a clinic's profile information",
          "Update treatment offerings or pricing",
          "Save changes to the clinic profile"
        ],
        expectedResults: [
          "Clinic data displays correctly",
          "Edit forms function properly",
          "Changes are saved successfully"
        ]
      },
      {
        name: "Document Verification",
        description: "Review and approve uploaded patient and clinic documents.",
        implemented: true,
        testSteps: [
          "Go to the 'Documents' section",
          "Filter documents requiring approval",
          "Preview document contents",
          "Approve, reject, or flag documents",
          "Add admin notes to documents"
        ],
        expectedResults: [
          "Document preview functions correctly",
          "Approval status updates properly",
          "Notes are saved with the document"
        ]
      },
      {
        name: "Communication Monitoring",
        description: "Oversee and moderate communications between patients and clinics.",
        implemented: true,
        testSteps: [
          "Navigate to the 'Communications' section",
          "Review active message threads",
          "Check for flagged or concerning content",
          "Intervene in conversations if necessary",
          "Add administrative notes to conversations"
        ],
        expectedResults: [
          "Message threads display correctly",
          "Admin intervention tools work properly",
          "Notes are saved with the conversation"
        ]
      },
      {
        name: "Booking Management",
        description: "Track and manage treatment bookings and appointments.",
        implemented: false,
        implementationNote: "Booking management is partially implemented. You can view bookings, but changing booking status may not update related data.",
        testSteps: [
          "Access the 'Bookings' section",
          "Review active bookings by status",
          "Check for bookings requiring approval",
          "Update booking status if needed",
          "Add administrative notes to bookings"
        ],
        expectedResults: [
          "Booking data displays correctly",
          "Status updates function properly",
          "Notes are saved with the booking"
        ]
      },
      {
        name: "Content Management",
        description: "Edit website content, FAQs, and treatment information.",
        implemented: false,
        implementationNote: "Content management is functioning with basic features only. Complex content changes may not save correctly.",
        testSteps: [
          "Go to the 'Content' section",
          "Select a page or content section to edit",
          "Make changes to the content",
          "Preview changes before publishing",
          "Publish the updated content"
        ],
        expectedResults: [
          "Content editor loads correctly",
          "Preview functionality works",
          "Changes publish to the live site"
        ]
      },
      {
        name: "Analytics Dashboard",
        description: "View comprehensive analytics about system usage and conversions.",
        implemented: false,
        implementationNote: "Analytics are implemented with simulated data. Live data tracking is not fully functional.",
        testSteps: [
          "Navigate to the 'Analytics' section",
          "Review key performance indicators",
          "Check conversion rates for quotes to bookings",
          "View user acquisition and engagement metrics",
          "Export reports if needed"
        ],
        expectedResults: [
          "Dashboard displays correctly",
          "Charts and graphs render properly",
          "Export functionality works"
        ]
      }
    ];
  }
  
  return [];
}

// Define types for workflow steps
interface WorkflowStep {
  title: string;
  description: string;
  note?: string;
}

// Function to get workflow steps for each portal type
function getWorkflowSteps(portalType: string): WorkflowStep[] {
  if (portalType === 'patient') {
    return [
      {
        title: "Login to Patient Portal",
        description: "Use the test patient account (patient@mydentalfly.com / Patient123!) to access the patient dashboard."
      },
      {
        title: "Generate a Dental Quote",
        description: "Navigate to 'Your Quote' and submit a new dental treatment quote request with your requirements."
      },
      {
        title: "Upload X-rays or Medical Documents",
        description: "In the Documents section, upload X-rays or medical history to support your treatment request."
      },
      {
        title: "Review Clinic Quotes",
        description: "Check the Treatment Comparison section to compare quotes from different clinics."
      },
      {
        title: "Communicate with a Clinic",
        description: "Use the Messages section to ask questions about your preferred treatment option."
      },
      {
        title: "Accept a Treatment Plan",
        description: "Review and accept a treatment plan from your selected clinic in the Treatment Plan section."
      },
      {
        title: "Make a Deposit Payment",
        description: "Process a deposit payment using the Stripe testing card (4242 4242 4242 4242) to confirm your booking."
      },
      {
        title: "Check Appointment Schedule",
        description: "Review your scheduled appointments in the Appointments section after confirming your booking."
      }
    ];
  } else if (portalType === 'clinic') {
    return [
      {
        title: "Login to Clinic Portal",
        description: "Use the test clinic account (clinic@mydentalfly.com / Clinic123!) to access the clinic dashboard."
      },
      {
        title: "Review Quote Requests",
        description: "Check the Quote Requests section for new patient inquiries and treatment needs."
      },
      {
        title: "View Patient Documents",
        description: "Access patient X-rays and medical documents to assess treatment requirements."
      },
      {
        title: "Create a Custom Quote",
        description: "Build a personalized treatment quote for the patient based on their requirements."
      },
      {
        title: "Send a Treatment Plan",
        description: "Create a detailed treatment plan with procedures, timelines, and pricing, then send it to the patient."
      },
      {
        title: "Communicate with the Patient",
        description: "Use the Messages section to discuss details, answer questions, or provide additional information."
      },
      {
        title: "Schedule Treatment Appointments",
        description: "Once a deposit is received, create appointments for the patient's treatment visits."
      },
      {
        title: "Upload Treatment Records",
        description: "After treatment, upload progress records or final results to the patient's file."
      }
    ];
  } else if (portalType === 'admin') {
    return [
      {
        title: "Login to Admin Portal",
        description: "Use the test admin account (admin@mydentalfly.com / Admin123!) to access the admin dashboard."
      },
      {
        title: "Review Active Users",
        description: "Check the User Management section to see active patients and clinic accounts."
      },
      {
        title: "Monitor Quote Requests",
        description: "Review pending and active quote requests in the Quotes section."
      },
      {
        title: "Verify Clinic Responses",
        description: "Check quotes sent by clinics to ensure they meet quality and pricing standards."
      },
      {
        title: "Oversee Communications",
        description: "Monitor communications between patients and clinics to ensure quality service."
      },
      {
        title: "Track Bookings and Payments",
        description: "Review booking status and payment confirmations in the Bookings section."
      },
      {
        title: "Manage Clinic Profiles",
        description: "Update clinic information, treatments offered, or pricing in the Clinics section."
      },
      {
        title: "Review Analytics",
        description: "Check system performance, conversion rates, and user engagement metrics."
      }
    ];
  }
  
  return [];
}

// Function to get security features for each portal type
function getSecurityFeatures(portalType: string) {
  const commonFeatures = [
    {
      name: "Secure Authentication",
      description: "Authentication uses salted password hashing via bcrypt and secure session management to protect user credentials.",
      testStep: "Try using incorrect credentials and observe the security message. The system doesn't reveal whether the username or password was incorrect."
    },
    {
      name: "Session Management",
      description: "Sessions are securely managed with HTTP-only cookies and appropriate timeout settings.",
      testStep: "Leave the portal inactive for an extended period (over 24 hours) and verify you're automatically logged out."
    },
    {
      name: "CSRF Protection",
      description: "Cross-Site Request Forgery protection is implemented on all form submissions and API endpoints.",
      testStep: "CSRF tokens are automatically managed - you don't need to test this directly."
    },
    {
      name: "Input Validation",
      description: "All user inputs are validated both client-side and server-side to prevent injection attacks.",
      testStep: "Try entering invalid data in forms (e.g., scripts in text fields) and observe that it's properly sanitized or rejected."
    }
  ];
  
  if (portalType === 'patient') {
    return [
      ...commonFeatures,
      {
        name: "Encrypted Data Transmission",
        description: "All sensitive medical and personal data is transmitted using secure HTTPS connections.",
        testStep: "Check that all URLs start with https:// and look for the lock icon in your browser."
      },
      {
        name: "Document Access Controls",
        description: "Patients can only view their own documents and treatment plans, enforced through server-side permissions.",
        testStep: "The system prevents access to other patients' data by design - no direct testing needed."
      }
    ];
  } else if (portalType === 'clinic') {
    return [
      ...commonFeatures,
      {
        name: "Role-Based Access Control",
        description: "Clinic staff can only access patients who have selected their clinic or submitted quote requests to them.",
        testStep: "Verify you can only see patients connected to your clinic in the patient list."
      },
      {
        name: "Medical Data Protection",
        description: "All medical records and patient details are handled according to healthcare data regulations.",
        testStep: "Note that sensitive patient information is only visible when necessary for treatment planning."
      }
    ];
  } else if (portalType === 'admin') {
    return [
      ...commonFeatures,
      {
        name: "Administrative Audit Logging",
        description: "All administrative actions are logged for security audit purposes.",
        testStep: "Make changes to any data and notice the system records who made the change and when."
      },
      {
        name: "Enhanced Access Controls",
        description: "Admins have complete access but actions are logged and require additional confirmation for sensitive operations.",
        testStep: "Try to delete a user or clinic and notice the system requires additional confirmation."
      },
      {
        name: "System Integrity Monitoring",
        description: "The admin portal includes tools to monitor system integrity and detect unusual activities.",
        testStep: "Check the Security section for system alerts and monitoring features."
      }
    ];
  }
  
  return commonFeatures;
}

// Helper function to get correct portal path
function getPortalPath(portalType: string) {
  if (portalType === 'patient') return '/client-portal';
  if (portalType === 'clinic') return '/clinic-portal';
  if (portalType === 'admin') return '/admin-portal';
  return '/portal-login';
}

export default PortalTestingGuide;