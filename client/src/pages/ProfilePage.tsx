import React from "react";
import ProfileSection from "@/components/portal/ProfileSection";
import { Helmet } from "react-helmet";

const ProfilePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>My Profile | MyDentalFly</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal details, emergency contacts, and medical information
            </p>
          </div>
          
          <ProfileSection />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;