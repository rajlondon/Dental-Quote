import express from 'express';
import { TreatmentMap, ClinicTreatmentVariant, INITIAL_TREATMENT_MAP } from '../shared/treatmentMapper';

// Mock database for development - would be replaced with actual DB storage
let treatmentMap: TreatmentMap = { ...INITIAL_TREATMENT_MAP };

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
}