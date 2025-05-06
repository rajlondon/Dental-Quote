# MyDentalFly API Specification

## Treatment Lines API

**IMPORTANT: All treatment line operations MUST use these standards**

### API Contract

- **Public Path**: `/api/v1/treatment-lines/:lineId`
- **ID Format**: Always UUID (numeric IDs converted to UUID format on the way in)
- **ID Pattern**: `00000000-0000-4000-a000-${numericId.padStart(12, '0')}`

### Examples:
- ID 123 → UUID `00000000-0000-4000-a000-000000000123`
- ID 45 → UUID `00000000-0000-4000-a000-000000000045`

### Deprecated Routes (DO NOT USE):
- `/api/treatment-module/treatment-lines/:id` 
- `/api/treatment-plans/treatment-lines/:id`

These legacy routes are being phased out and should not be used for new development.