/**
 * Admin Treatment Plan Component
 * 
 * Implements treatment plan functionality specifically for the admin portal
 * with full permissions and advanced UI for admin users.
 */
import React, { useState } from 'react';
import { BaseTreatmentPlan } from './BaseTreatmentPlan';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Filter, Download, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TreatmentPlanStatus } from '@shared/models/treatment-plan';
import { useTranslation } from 'react-i18next';

interface AdminTreatmentPlanProps {
  quoteId?: string;
  planId?: string | number;
  showActions?: boolean;
  showFullDetails?: boolean;
  initialSearch?: string;
  initialStatus?: string;
  initialPage?: number;
  onExportData?: () => void;
}

export function AdminTreatmentPlan({
  quoteId,
  planId,
  showActions = true,
  showFullDetails = true,
  initialSearch = '',
  initialStatus = 'all',
  initialPage = 1,
  onExportData
}: AdminTreatmentPlanProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // State for filtering and pagination
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  
  // Basic security check - component should only be used by admins
  if (!user || user.role !== 'admin') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Error</AlertTitle>
        <AlertDescription>
          You don't have permission to access admin treatment plans.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Custom header for admin view with advanced filtering
  const renderHeader = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('admin.treatment_plan.title', 'Treatment Plans Management')}
          </h2>
          <p className="text-muted-foreground">
            {t('admin.treatment_plan.description', 'Manage all treatment plans across the platform')}
          </p>
        </div>
        
        {/* Export data button for admins */}
        <Button
          variant="outline"
          onClick={() => {
            if (onExportData) {
              onExportData();
            } else {
              console.log('Export data functionality not implemented');
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      {/* Advanced filtering for admins */}
      {!planId && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.treatment_plan.search_placeholder', 'Search by patient or clinic name...')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select 
            value={status} 
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('admin.treatment_plan.status_placeholder', 'Filter by status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(TreatmentPlanStatus).map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearch('');
              setStatus('all');
            }}
            title={t('admin.treatment_plan.reset_filters', 'Reset filters')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
  
  return (
    <BaseTreatmentPlan 
      quoteId={quoteId}
      planId={planId}
      title={t('admin.treatment_plan.title', 'Treatment Plans Management')}
      description={t('admin.treatment_plan.description', 'Manage all treatment plans across the platform')}
      showActions={showActions}
      showFullDetails={showFullDetails}
      // Admin-specific customizations
      allowCreating={true}
      allowEditing={true}
      allowDeleting={true}
      renderHeader={renderHeader}
      // Pass filter and pagination props
      search={search.length >= 2 ? search : undefined}
      status={status === 'all' ? undefined : status}
      page={page}
      onPageChange={setPage}
    />
  );
}