import React from 'react';
import { PackageManagement } from '../../components/admin/PackageManagement';

const AdminPackagesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <PackageManagement />
      </div>
    </div>
  );
};

export default AdminPackagesPage;
