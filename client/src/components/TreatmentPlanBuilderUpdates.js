/**
 * Changes needed for TreatmentPlanBuilder.tsx:
 * 
 * 1. Remove all individual prices display from treatment options in all tabs:
 *    Find: <div className="font-semibold">£{treatment.priceGBP}</div>
 *    Replace with: <Badge variant="outline" className="font-normal">Price varies by clinic</Badge>
 *    Also remove: <div className="text-xs text-gray-500">${treatment.priceUSD}</div>
 * 
 * 2. Consolidated Cost Summary (keep the right sidebar card, remove the cost info from the table):
 *    Keep the "Your Treatment Plan" section with:
 *    - Estimated Cost Range
 *    - Typical UK Equivalent
 *    - Potential Savings
 *    Remove the detailed cost summary at the bottom of the page
 * 
 * 3. Single CTA Button:
 *    Keep only one "View Matching Clinics & Request Final Quote" button
 *    Remove extra buttons that appear at multiple locations
 */