import React from 'react';
import { Helmet } from 'react-helmet';

import PendingApprovalsList from '@/components/admin/PendingApprovalsList';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const PendingApprovalsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Promotion Approvals | Admin Portal | MyDentalFly</title>
      </Helmet>
      
      <div>
        <h1 className="text-3xl font-bold">Promotion Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve clinic-initiated promotions
        </p>
      </div>
      
      <PendingApprovalsList />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Approval Guidelines</CardTitle>
            <CardDescription>
              Criteria for reviewing clinic promotions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h3 className="font-medium">Verify Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Ensure that prices are reasonable and offer genuine savings. Packages should show clear value compared to individual treatment prices.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Check Treatment Combinations</h3>
              <p className="text-sm text-muted-foreground">
                Verify that bundled treatments make clinical sense and are typically requested together.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Review Marketing Claims</h3>
              <p className="text-sm text-muted-foreground">
                Ensure that all claims made in the promotion are accurate, ethical, and comply with our guidelines.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Homepage Promotion Tips</CardTitle>
            <CardDescription>
              Best practices for featuring promotions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h3 className="font-medium">Use High Priority Sparingly</h3>
              <p className="text-sm text-muted-foreground">
                Reserve high priority (8-10) for exceptional promotions or limited-time offers to maintain homepage balance.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Require Quality Images</h3>
              <p className="text-sm text-muted-foreground">
                For homepage display, ensure promotions have high-quality, relevant images. Generated images should be appropriate and professional.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Promote Diversity</h3>
              <p className="text-sm text-muted-foreground">
                Feature a variety of clinics and treatment types on the homepage to showcase our platform's diversity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApprovalsPage;