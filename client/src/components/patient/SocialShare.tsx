import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Twitter, MessageCircle, Mail, Copy, Share2 } from 'lucide-react';

interface SocialShareProps {
  referralCode: string;
  patientName: string;
}

export default function SocialShare({ referralCode, patientName }: SocialShareProps) {
  const { toast } = useToast();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralUrl = `${baseUrl}/register?ref=${referralCode}`;
  
  const shareText = `I had a fantastic dental treatment experience in Turkey with MyDentalFly. Save on quality dental care and check them out: ${referralUrl}`;
  
  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareOnWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
  
  const shareByEmail = () => {
    const subject = 'Quality Dental Treatment in Turkey - MyDentalFly';
    const body = `Hi,\n\nI wanted to share my experience with dental treatment in Turkey through MyDentalFly. They offer exceptional quality at affordable prices with professional care.\n\nCheck it out here: ${referralUrl}\n\nI highly recommend them for anyone considering dental work!\n\nBest,\n${patientName}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link from the text field.",
        variant: "destructive",
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MyDentalFly - Quality Dental Care in Turkey',
          text: shareText,
          url: referralUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      copyLink();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold mb-2 text-blue-900">Share Your Referral Link</h2>
      <p className="text-gray-600 mb-6">
        Share your unique referral link on social media or directly with friends and earn rewards when they book a treatment!
      </p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Your Referral Link</label>
        <div className="flex gap-2">
          <Input
            value={referralUrl}
            readOnly
            className="flex-1 bg-gray-50 font-mono text-sm"
          />
          <Button
            onClick={copyLink}
            variant="outline"
            size="icon"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-4 text-gray-900">Share via Social Media</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={shareOnTwitter}
            className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
          >
            <Twitter className="w-4 h-4" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>
          
          <Button
            onClick={shareOnFacebook}
            className="flex items-center justify-center gap-2 bg-[#4267B2] hover:bg-[#365a9a] text-white"
          >
            <Facebook className="w-4 h-4" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          
          <Button
            onClick={shareOnWhatsapp}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b954] text-white"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          
          <Button
            onClick={shareByEmail}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </Button>
        </div>
      </div>

      {navigator.share && (
        <div className="mb-6">
          <Button
            onClick={nativeShare}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share with More Apps
          </Button>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg">
        <h3 className="font-medium text-purple-800 mb-2">Referral Code: {referralCode}</h3>
        <p className="text-sm text-purple-700">
          Your friends can also use this code directly when registering to ensure you get credit for the referral.
        </p>
      </div>
    </div>
  );
}