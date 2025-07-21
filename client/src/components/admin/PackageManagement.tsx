import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface Package {
  id: string;
  name: string;
  description: string;
  packagePrice: string;
  originalPrice: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch packages
  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      const data = await response.json();
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update package
  const updatePackage = async (packageData: Package) => {
    try {
      const response = await fetch(`/api/admin/packages/${packageData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: packageData.name,
          description: packageData.description,
          packagePrice: parseFloat(packageData.packagePrice),
          originalPrice: parseFloat(packageData.originalPrice)
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPackages(); // Refresh list
        setEditingPackage(null);
        alert('Package updated successfully!');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Error updating package');
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return <div className="p-4">Loading packages...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Package Management</h1>
      
      {/* Package List */}
      <div className="grid gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{pkg.name}</span>
                <div className="space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    £{pkg.packagePrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    £{pkg.originalPrice}
                  </span>
                  <Button 
                    onClick={() => setEditingPackage(pkg)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{pkg.description}</p>
              <div className="text-xs text-gray-400">
                <p>Created: {new Date(pkg.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(pkg.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit Package: {editingPackage.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Package Name</label>
                <Input
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({
                    ...editingPackage,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({
                    ...editingPackage,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Package Price (£)</label>
                  <Input
                    type="number"
                    value={editingPackage.packagePrice}
                    onChange={(e) => setEditingPackage({
                      ...editingPackage,
                      packagePrice: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Original Price (£)</label>
                  <Input
                    type="number"
                    value={editingPackage.originalPrice}
                    onChange={(e) => setEditingPackage({
                      ...editingPackage,
                      originalPrice: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setEditingPackage(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => updatePackage(editingPackage)}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
