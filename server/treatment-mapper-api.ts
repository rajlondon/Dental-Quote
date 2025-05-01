import express from 'express';
import { TreatmentMap, ClinicTreatmentVariant, CustomTreatment, INITIAL_TREATMENT_MAP } from '../shared/treatmentMapper';
import { v4 as uuidv4 } from 'uuid';

// Mock database for development - would be replaced with actual DB storage
let treatmentMap: TreatmentMap = { ...INITIAL_TREATMENT_MAP };
// Custom treatments storage by clinic ID
let customTreatments: Map<string, CustomTreatment[]> = new Map();

export function setupTreatmentMapperApi(app: express.Express) {
  // Get full treatment map (admin only)
  app.get('/api/treatment-mapper', (req, res) => {
    // In a real implementation, check admin permissions here
    res.json(treatmentMap);
  });

  // Get treatment variants for a specific clinic
  app.get('/api/treatment-mapper/clinic/:clinicId', (req, res) => {
    const { clinicId } = req.params;
    
    const clinicVariants: Record<string, ClinicTreatmentVariant | null> = {};
    
    Object.entries(treatmentMap).forEach(([standardName, treatment]) => {
      const variant = treatment.clinic_variants.find(
        variant => variant.clinic_id === clinicId
      );
      
      clinicVariants[standardName] = variant || null;
    });
    
    res.json(clinicVariants);
  });

  // Update a clinic's variant for a standard treatment
  app.post('/api/treatment-mapper/clinic/:clinicId/treatment/:treatmentName', (req, res) => {
    const { clinicId, treatmentName } = req.params;
    const variantData = req.body as ClinicTreatmentVariant;
    
    // Ensure the variant's clinic_id matches the URL parameter
    variantData.clinic_id = clinicId;
    
    // Get the treatment
    const treatment = treatmentMap[treatmentName];
    
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    
    // Find if this clinic already has a variant for this treatment
    const existingIndex = treatment.clinic_variants.findIndex(
      variant => variant.clinic_id === clinicId
    );
    
    if (existingIndex >= 0) {
      // Update existing variant
      treatment.clinic_variants[existingIndex] = variantData;
    } else {
      // Add new variant
      treatment.clinic_variants.push(variantData);
    }
    
    res.json({ success: true });
  });

  // Delete a clinic's variant for a standard treatment
  app.delete('/api/treatment-mapper/clinic/:clinicId/treatment/:treatmentName', (req, res) => {
    const { clinicId, treatmentName } = req.params;
    
    // Get the treatment
    const treatment = treatmentMap[treatmentName];
    
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    
    // Find if this clinic has a variant for this treatment
    const existingIndex = treatment.clinic_variants.findIndex(
      variant => variant.clinic_id === clinicId
    );
    
    if (existingIndex >= 0) {
      // Remove the variant
      treatment.clinic_variants.splice(existingIndex, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Clinic variant not found' });
    }
  });

  // Admin: Replace entire treatment map
  app.put('/api/treatment-mapper', (req, res) => {
    // In a real implementation, check admin permissions here
    const newMap = req.body as TreatmentMap;
    treatmentMap = newMap;
    res.json({ success: true });
  });

  // Admin: Add a new standard treatment
  app.post('/api/treatment-mapper/treatment', (req, res) => {
    // In a real implementation, check admin permissions here
    const { name, category } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    
    if (treatmentMap[name]) {
      return res.status(409).json({ error: 'Treatment already exists' });
    }
    
    treatmentMap[name] = {
      category,
      clinic_variants: []
    };
    
    res.json({ success: true });
  });

  // Admin: Delete a standard treatment
  app.delete('/api/treatment-mapper/treatment/:name', (req, res) => {
    // In a real implementation, check admin permissions here
    const { name } = req.params;
    
    if (!treatmentMap[name]) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    
    delete treatmentMap[name];
    res.json({ success: true });
  });
  
  // Get custom treatments for a specific clinic
  app.get('/api/treatment-mapper/clinic/:clinicId/custom', (req, res) => {
    const { clinicId } = req.params;
    const clinicCustomTreatments = customTreatments.get(clinicId) || [];
    
    // Return only the variant part for easier client-side integration
    const treatments = clinicCustomTreatments.map(t => t.variant);
    res.json(treatments);
  });
  
  // Create a new custom treatment for a clinic
  app.post('/api/treatment-mapper/clinic/:clinicId/custom', (req, res) => {
    const { clinicId } = req.params;
    const { name, category, description, variant } = req.body;
    
    if (!name || !category || !variant) {
      return res.status(400).json({ 
        error: 'Name, category, and variant details are required' 
      });
    }
    
    // Ensure variant's clinic_id matches URL parameter
    variant.clinic_id = clinicId;
    
    // Create the custom treatment
    const customTreatment: CustomTreatment = {
      id: uuidv4(),
      name,
      category,
      description: description || '',
      clinic_id: clinicId,
      variant,
      created_at: new Date().toISOString()
    };
    
    // Get existing custom treatments for this clinic or initialize empty array
    const clinicCustomTreatments = customTreatments.get(clinicId) || [];
    
    // Add the new treatment and update the map
    clinicCustomTreatments.push(customTreatment);
    customTreatments.set(clinicId, clinicCustomTreatments);
    
    res.status(201).json({ 
      success: true, 
      treatment: customTreatment 
    });
  });
  
  // Update a custom treatment
  app.put('/api/treatment-mapper/clinic/:clinicId/custom/:treatmentId', (req, res) => {
    const { clinicId, treatmentId } = req.params;
    const { name, category, description, variant } = req.body;
    
    // Get existing custom treatments for this clinic
    const clinicCustomTreatments = customTreatments.get(clinicId) || [];
    
    // Find the treatment to update
    const treatmentIndex = clinicCustomTreatments.findIndex(t => t.id === treatmentId);
    
    if (treatmentIndex === -1) {
      return res.status(404).json({ error: 'Custom treatment not found' });
    }
    
    // Ensure variant's clinic_id matches URL parameter
    variant.clinic_id = clinicId;
    
    // Update the treatment
    clinicCustomTreatments[treatmentIndex] = {
      ...clinicCustomTreatments[treatmentIndex],
      name: name || clinicCustomTreatments[treatmentIndex].name,
      category: category || clinicCustomTreatments[treatmentIndex].category,
      description: description !== undefined ? description : clinicCustomTreatments[treatmentIndex].description,
      variant: variant || clinicCustomTreatments[treatmentIndex].variant
    };
    
    // Update the map
    customTreatments.set(clinicId, clinicCustomTreatments);
    
    res.json({ 
      success: true, 
      treatment: clinicCustomTreatments[treatmentIndex] 
    });
  });
  
  // Delete a custom treatment
  app.delete('/api/treatment-mapper/clinic/:clinicId/custom/:treatmentId', (req, res) => {
    const { clinicId, treatmentId } = req.params;
    
    // Get existing custom treatments for this clinic
    const clinicCustomTreatments = customTreatments.get(clinicId) || [];
    
    // Find the treatment to delete
    const treatmentIndex = clinicCustomTreatments.findIndex(t => t.id === treatmentId);
    
    if (treatmentIndex === -1) {
      return res.status(404).json({ error: 'Custom treatment not found' });
    }
    
    // Remove the treatment
    clinicCustomTreatments.splice(treatmentIndex, 1);
    
    // Update the map
    customTreatments.set(clinicId, clinicCustomTreatments);
    
    res.json({ success: true });
  });
}