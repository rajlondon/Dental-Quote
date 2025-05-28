import React from 'react';
import { format } from 'date-fns';
import { Users, Gift, Clock, CheckCircle, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Referral } from '@shared/schema';

interface ReferralHistoryProps {
  referrals: Referral[];
}

export default function ReferralHistory({ referrals }: ReferralHistoryProps) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Referrals Yet</h3>
        <p className="text-gray-500 mb-4">
          You haven't referred anyone yet. Start sharing to earn rewards!
        </p>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg inline-block">
          <p className="text-blue-700 text-sm">
            💡 Tip: Use the "Refer a Friend" tab to send your first referral and start earning £50 rewards!
          </p>
        </div>
      </div>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'REGISTERED':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
            <UserPlus className="w-3 h-3 mr-1" />
            Registered
          </Badge>
        );
      case 'CONVERTED':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Converted
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Unknown
          </Badge>
        );
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Email sent, waiting for registration';
      case 'REGISTERED':
        return 'Friend registered, waiting for booking';
      case 'CONVERTED':
        return 'Friend booked treatment - reward earned!';
      default:
        return 'Status unknown';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center border">
          <div className="text-2xl font-bold text-gray-700 mb-1">
            {referrals.length}
          </div>
          <p className="text-gray-600 text-sm">Total Referrals</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center border">
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {referrals.filter(r => r.status === 'CONVERTED').length}
          </div>
          <p className="text-blue-600 text-sm">Successful Referrals</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center border">
          <div className="text-2xl font-bold text-green-700 mb-1">
            £{(referrals.filter(r => r.status === 'CONVERTED').length * 50).toFixed(2)}
          </div>
          <p className="text-green-600 text-sm">Total Rewards Earned</p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Referral History</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {referrals.map((referral) => (
            <div key={referral.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{referral.referredName}</h4>
                    {getStatusBadge(referral.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{referral.referredEmail}</p>
                  <p className="text-xs text-gray-500">{getStatusDescription(referral.status)}</p>
                  
                  {referral.message && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 italic">"{referral.message}"</p>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">
                    Referred on {format(new Date(referral.createdAt), 'MMM d, yyyy')}
                  </div>
                  
                  {referral.status === 'CONVERTED' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Gift className="w-4 h-4" />
                      <span className="font-medium">£{Number(referral.rewardAmount).toFixed(2)}</span>
                      {referral.rewardClaimed && (
                        <span className="text-xs text-green-500 ml-1">(Claimed)</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Potential: £{Number(referral.rewardAmount).toFixed(2)}
                    </div>
                  )}
                  
                  {referral.conversionDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Converted on {format(new Date(referral.conversionDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">How Referral Rewards Work</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Pending:</strong> Your friend has been sent an invitation email</li>
          <li>• <strong>Registered:</strong> Your friend created an account using your referral link</li>
          <li>• <strong>Converted:</strong> Your friend completed a booking and you earned your £50 reward</li>
          <li>• Rewards can be used toward your next treatment or follow-up care</li>
        </ul>
      </div>
    </div>
  );
}