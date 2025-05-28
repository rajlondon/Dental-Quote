import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Gift, Users, Star } from 'lucide-react';
import ReviewForm from './ReviewForm';
import ReferralForm from './ReferralForm';
import SocialShare from './SocialShare';
import ReferralHistory from './ReferralHistory';

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [hasReviewed, setHasReviewed] = useState(false);
  
  const { data: patientData, isLoading, refetch } = useQuery({
    queryKey: ['/api/patient/profile'],
    enabled: !!user,
  });

  useEffect(() => {
    if (patientData?.reviews && patientData.reviews.length > 0) {
      setHasReviewed(true);
    }
  }, [patientData]);
  
  const handleReviewSubmitted = () => {
    setHasReviewed(true);
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!hasReviewed) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">Refer & Earn Rewards</h2>
              <p className="text-gray-600">Share your experience and earn £50 for each friend who books treatment</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Review Required</span>
            </div>
            <p className="text-yellow-700">
              To start referring friends and earning rewards, please share your experience with us first.
            </p>
          </div>
        </div>
        
        <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Refer & Earn Rewards</h2>
              <p className="text-gray-600">Earn £50 for each friend who books a treatment</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 bg-gradient-to-r from-green-50 to-blue-50 px-6 py-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">Your Reward Balance</p>
            <p className="text-2xl font-bold text-green-800">
              £{Number(patientData?.referralBalance || 0).toFixed(2)}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="refer">Refer a Friend</TabsTrigger>
            <TabsTrigger value="share">Share on Social</TabsTrigger>
            <TabsTrigger value="history">Referral History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center border">
                <div className="text-3xl font-bold text-gray-700 mb-2">
                  {patientData?.referralsGiven?.length || 0}
                </div>
                <p className="text-gray-600">Total Referrals</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center border">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {patientData?.referralsGiven?.filter((r: any) => r.status === 'CONVERTED').length || 0}
                </div>
                <p className="text-blue-600">Successful Referrals</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center border">
                <div className="text-3xl font-bold text-green-700 mb-2">
                  £{Number(patientData?.referralBalance || 0).toFixed(2)}
                </div>
                <p className="text-green-600">Reward Balance</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-4">How It Works</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold mb-3">
                    1
                  </div>
                  <h4 className="font-medium mb-2">Refer Friends</h4>
                  <p className="text-sm text-blue-700">Send referrals via email or share on social media</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold mb-3">
                    2
                  </div>
                  <h4 className="font-medium mb-2">Friends Book Treatment</h4>
                  <p className="text-sm text-blue-700">They register using your referral link and book a treatment</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold mb-3">
                    3
                  </div>
                  <h4 className="font-medium mb-2">Earn Rewards</h4>
                  <p className="text-sm text-blue-700">Receive £50 for each successful referral</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="refer" className="mt-6">
            <ReferralForm />
          </TabsContent>
          
          <TabsContent value="share" className="mt-6">
            {patientData?.referralCode ? (
              <SocialShare 
                referralCode={patientData.referralCode} 
                patientName={`${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'Friend'} 
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Generating your referral code...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <ReferralHistory referrals={patientData?.referralsGiven || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}