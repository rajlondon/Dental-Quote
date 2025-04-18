import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownToLine, ArrowUpToLine, Smartphone, Building2, Database, RefreshCw, Shield, MessageSquare } from 'lucide-react';

const DataFlowDiagram: React.FC = () => {
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium mb-6">Cross-Portal Data Flow</h3>
          
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
            {/* Patient Portal */}
            <div className="flex-1 border rounded-lg p-4 bg-blue-50 dark:bg-blue-950 min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Patient Portal</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowUpToLine className="h-4 w-4 text-green-500" />
                  <span>Patient Profile Data</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUpToLine className="h-4 w-4 text-green-500" />
                  <span>Medical History</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUpToLine className="h-4 w-4 text-green-500" />
                  <span>Travel & Accommodation</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-amber-500" />
                  <span>Treatment Plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span>Appointments</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span>Messages</span>
                </li>
              </ul>
            </div>
            
            {/* Central Arrows & Server */}
            <div className="flex flex-col items-center space-y-4">
              {/* Top Arrow */}
              <div className="hidden md:flex w-24 items-center justify-center">
                <div className="h-0.5 bg-blue-400 dark:bg-blue-600 w-full relative">
                  <div className="absolute -right-2 -top-1.5 border-t-4 border-r-4 border-b-4 border-l-0 border-transparent border-r-blue-400 dark:border-r-blue-600 h-4 w-4"></div>
                  <div className="absolute -left-2 -top-1.5 border-t-4 border-l-4 border-b-4 border-r-0 border-transparent border-l-blue-400 dark:border-l-blue-600 h-4 w-4"></div>
                </div>
              </div>
              
              {/* Server & DB */}
              <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium">Secure WebSocket</span>
                  <Database className="h-6 w-6 text-indigo-600" />
                  <span className="text-xs font-medium">Database</span>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200">End-to-End Encrypted</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom Arrow */}
              <div className="hidden md:flex w-24 items-center justify-center">
                <div className="h-0.5 bg-blue-400 dark:bg-blue-600 w-full relative">
                  <div className="absolute -right-2 -top-1.5 border-t-4 border-r-4 border-b-4 border-l-0 border-transparent border-r-blue-400 dark:border-r-blue-600 h-4 w-4"></div>
                  <div className="absolute -left-2 -top-1.5 border-t-4 border-l-4 border-b-4 border-r-0 border-transparent border-l-blue-400 dark:border-l-blue-600 h-4 w-4"></div>
                </div>
              </div>
            </div>
            
            {/* Clinic Portal */}
            <div className="flex-1 border rounded-lg p-4 bg-green-50 dark:bg-green-950 min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Clinic Portal</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-amber-500" />
                  <span>Patient Profile Data</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-amber-500" />
                  <span>Medical History</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4 text-amber-500" />
                  <span>Travel Details</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUpToLine className="h-4 w-4 text-green-500" />
                  <span>Treatment Plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span>Clinic Schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span>Patient Communication</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-8 border-t pt-4 w-full">
            <div className="text-sm text-center mb-2 font-medium">Legend</div>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <ArrowUpToLine className="h-4 w-4 text-green-500" />
                <span>Data Source</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownToLine className="h-4 w-4 text-amber-500" />
                <span>Data Consumer</span>
              </div>
              <div className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4 text-blue-500" />
                <span>Bidirectional Sync</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span>Real-time Messages</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFlowDiagram;