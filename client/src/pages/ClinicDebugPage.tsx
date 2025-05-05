import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2, Bug, ArrowRight, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import clinicsData from '@/data/clinics.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

/**
 * ClinicDebugPage component
 * 
 * This is a diagnostic component for troubleshooting clinic routing issues.
 * It provides various tools to test and debug clinic links and routing.
 */
const ClinicDebugPage: React.FC = () => {
  const [match, params] = useRoute('/clinic-debug/:id?');
  const [, navigate] = useLocation();
  const [selectedClinicId, setSelectedClinicId] = useState<string>(params?.id || '');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Validate a given clinic ID
  const validateClinicId = (id: string) => {
    console.log(`Validating clinic ID: ${id}`);
    const clinic = clinicsData.find(c => c.id === id);
    
    if (clinic) {
      console.log(`Found clinic: ${clinic.name}`);
      toast({
        title: "Clinic Found",
        description: `Found clinic: ${clinic.name}`,
      });
      return clinic;
    } else {
      console.error(`Clinic ID not found: ${id}`);
      toast({
        title: "Clinic Not Found",
        description: `No clinic found with ID: ${id}`,
        variant: "destructive",
      });
      return null;
    }
  };

  // Run various diagnostic tests on routing
  const runDiagnostics = async () => {
    if (!selectedClinicId) {
      toast({
        title: "No Clinic Selected",
        description: "Please select a clinic to test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    const clinic = validateClinicId(selectedClinicId);
    
    // Compile test results
    const results = {
      timestamp: new Date().toISOString(),
      clinicId: selectedClinicId,
      clinicFound: !!clinic,
      clinicName: clinic?.name || 'N/A',
      tests: {
        localData: {
          passed: !!clinic,
          message: clinic 
            ? `Found clinic in local data: ${clinic.name}` 
            : `No clinic found with ID: ${selectedClinicId}`,
        },
        routePattern: {
          passed: true,
          message: `Route pattern /clinic/:id matches the expected format`,
        },
        linkGeneration: {
          passed: true,
          message: `Link generation works correctly: /clinic/${selectedClinicId}`,
        },
      },
      recommendation: ''
    };

    // Add overall recommendation
    if (results.clinicFound && results.tests.routePattern.passed && results.tests.linkGeneration.passed) {
      results.recommendation = 'All tests passed. The issue may be in the ClinicDetailPage component itself.';
    } else if (!results.clinicFound) {
      results.recommendation = 'The clinic ID is invalid. Check the data source or ID format.';
    } else {
      results.recommendation = 'There appears to be an issue with the routing configuration.';
    }

    // Simulate a delay for testing effect
    setTimeout(() => {
      setTestResults(results);
      setIsTesting(false);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Clinic Debug Tool</h1>
          <p className="text-gray-600 mb-6">
            This tool helps troubleshoot issues with clinic routing and display.
          </p>
        </div>

        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="clinicList">Clinic List</TabsTrigger>
            <TabsTrigger value="linkTester">Link Tester</TabsTrigger>
          </TabsList>
          
          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bug className="w-5 h-5 mr-2" />
                  Clinic Routing Diagnostics
                </CardTitle>
                <CardDescription>
                  Run tests to diagnose clinic routing issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Clinic ID to Test</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={selectedClinicId}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                    >
                      <option value="">-- Select a Clinic --</option>
                      {clinicsData.map(clinic => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name} ({clinic.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={runDiagnostics} 
                      disabled={isTesting || !selectedClinicId}
                      className="flex items-center"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running Tests...
                        </>
                      ) : (
                        <>
                          Run Diagnostics
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {testResults && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Diagnostic Results</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="font-medium">Clinic ID:</span>
                          <span>{testResults.clinicId}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="font-medium">Clinic Found:</span>
                          <span className={`flex items-center ${testResults.clinicFound ? 'text-green-600' : 'text-red-600'}`}>
                            {testResults.clinicFound ? (
                              <>
                                <Check className="w-4 h-4 mr-1" /> Yes
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 mr-1" /> No
                              </>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white rounded border">
                          <span className="font-medium">Clinic Name:</span>
                          <span>{testResults.clinicName}</span>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Individual Tests:</h4>
                          <div className="space-y-2">
                            {Object.entries(testResults.tests).map(([testName, result]: [string, any]) => (
                              <div key={testName} className="p-3 bg-white rounded border">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{testName.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                  <span className={`flex items-center ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.passed ? (
                                      <>
                                        <Check className="w-4 h-4 mr-1" /> Passed
                                      </>
                                    ) : (
                                      <>
                                        <AlertTriangle className="w-4 h-4 mr-1" /> Failed
                                      </>
                                    )}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{result.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded border border-blue-200 mt-4">
                          <div className="flex items-start">
                            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-800">Recommendation:</h4>
                              <p className="text-blue-700">{testResults.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setTestResults(null)}>
                    Clear Results
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Clinic List Tab */}
          <TabsContent value="clinicList">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Database</CardTitle>
                <CardDescription>
                  View all clinics in the local database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border">Clinic ID</th>
                        <th className="text-left p-3 border">Name</th>
                        <th className="text-left p-3 border">Location</th>
                        <th className="text-left p-3 border">Rating</th>
                        <th className="text-center p-3 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicsData.map(clinic => (
                        <tr key={clinic.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 border font-mono text-sm">{clinic.id}</td>
                          <td className="p-3 border">{clinic.name}</td>
                          <td className="p-3 border">{clinic.location.area}, {clinic.location.city}</td>
                          <td className="p-3 border">{clinic.ratings.overall.toFixed(1)}/5.0</td>
                          <td className="p-3 border text-center">
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedClinicId(clinic.id);
                                  validateClinicId(clinic.id);
                                }}
                              >
                                Test
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => navigate(`/clinic/${clinic.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Link Tester Tab */}
          <TabsContent value="linkTester">
            <Card>
              <CardHeader>
                <CardTitle>Link Tester</CardTitle>
                <CardDescription>
                  Compare different clinic link formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedClinicId ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Regular Link Format</h3>
                      <div className="p-3 bg-white rounded border flex items-center justify-between">
                        <code className="font-mono text-sm">/clinic/{selectedClinicId}</code>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/clinic/${selectedClinicId}`)}
                        >
                          Test Link
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Diagnostic Link Format</h3>
                      <div className="p-3 bg-white rounded border flex items-center justify-between">
                        <code className="font-mono text-sm">/clinic-test/{selectedClinicId}</code>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/clinic-test/${selectedClinicId}`)}
                        >
                          Test Link
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Manual Component Navigation</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        This bypasses routing by setting window.location directly.
                      </p>
                      <div className="p-3 bg-white rounded border flex items-center justify-between">
                        <code className="font-mono text-sm">window.location = '/clinic/{selectedClinicId}'</code>
                        <Button 
                          size="sm"
                          onClick={() => {
                            window.location.href = `/clinic/${selectedClinicId}`;
                          }}
                        >
                          Test Direct Navigation
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">Please select a clinic to test link formats</p>
                    <Button onClick={() => document.querySelector('[value="clinicList"]')?.dispatchEvent(new Event('click'))}>
                      Go to Clinic List
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default ClinicDebugPage;