import { generateCSSFix } from './openai-service';

const formElementStructure = `
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
  <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-5 md:gap-4 col-span-full">
    {/* Country Selection */}
    <div className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm md:shadow-none md:p-0 md:bg-transparent border border-gray-100 md:border-0">
      <div className="flex items-center mb-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mr-2">
          <PlaneIcon className="h-3 w-3 text-primary" />
        </div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Treatment Country
        </label>
      </div>
      <div className="relative">
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="quote-select-trigger w-full h-[42px]">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    
    {/* City Selection - Same structure */}
    <div className="md:col-span-1">
      <Select>
        <SelectTrigger className="quote-select-trigger">
          <SelectValue placeholder="Select city" />
        </SelectTrigger>
      </Select>
    </div>
    
    {/* Treatment Type - Same structure */}
    <div className="md:col-span-1">
      <Select>
        <SelectTrigger className="quote-select-trigger">
          <SelectValue placeholder="Select treatment" />
        </SelectTrigger>
      </Select>
    </div>
    
    {/* Travel Month - Same structure */}
    <div className="md:col-span-1">
      <Select>
        <SelectTrigger className="quote-select-trigger">
          <SelectValue placeholder="When?" />
        </SelectTrigger>
      </Select>
    </div>
    
    {/* Submit Button */}
    <div className="md:col-span-1 flex flex-col justify-end">
      <Button 
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-[42px] md:h-[42px] rounded-md flex items-center justify-center shadow-md transition-all"
      >
        <span className="mr-2">Get My Quote</span>
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
`;

const currentCSS = `
/* Global forceful styling for all select elements & form elements */
[data-radix-select-trigger],
.select-trigger,
[class*="SelectTrigger"],
button[role="combobox"],
div[role="combobox"],
.quote-select-trigger,
*[class*="SelectTrigger-"] {
  height: 42px !important;
  min-height: 42px !important;
  max-height: 42px !important;
  line-height: 38px !important;
  background-color: rgb(249, 250, 251) !important; /* bg-gray-50 */
  border: 1px solid rgb(229, 231, 235) !important; /* border-gray-200 */
  border-radius: 0.375rem !important; /* rounded-md */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; /* shadow-sm */
  transition: all 0.2s ease-in-out !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
}

/* Forceful styling for buttons and inputs */
.date-picker-button,
button[role="button"][class*="outline"],
.quote-calendar-button {
  height: 42px !important;
  min-height: 42px !important;
  max-height: 42px !important;
  line-height: 38px !important;
  background-color: rgb(249, 250, 251) !important;
  border: 1px solid rgb(229, 231, 235) !important;
  border-radius: 0.375rem !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
}

/* Fix for the 'Get My Quote' button */
form[id="hero-quote-form"] button[type="submit"],
button.bg-primary,
button.w-full,
form button[type="submit"] {
  height: 42px !important;
  min-height: 42px !important;
  max-height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  text-align: center !important;
}

/* Fix for all form items in one row */
.grid-cols-1.md\\:grid-cols-5 > div,
.space-y-5.md\\:space-y-0.md\\:grid.md\\:grid-cols-5 > div {
  display: flex !important;
  align-items: flex-end !important;
  height: 100% !important;
}

/* Fix for CTA button text alignment */
[type="submit"] span {
  display: inline-block !important;
  line-height: 42px !important;
  vertical-align: middle !important;
}
`;

const description = `
We have a form with select boxes and a button that need to be aligned perfectly in a straight line with the same height.
The form has:
1. Four Select components with SelectTrigger elements that need to be exactly 42px high
2. A "Get My Quote" button that also needs to be exactly 42px high with text centered vertically
3. All elements should have the same appearance, height, and align perfectly in one row

Currently, the select boxes are sometimes at different heights, and the "Get My Quote" button text is not centered properly.
We need to force all elements to have the exact same height and proper text alignment.
The styling should apply to all form elements regardless of their original styling.
`;

/**
 * Generate the optimal CSS solution using AI
 */
export async function generateOptimalCSS(): Promise<string> {
  try {
    console.log('Generating optimal CSS solution using OpenAI...');
    
    // Use OpenAI to generate a better CSS solution
    const optimizedCSS = await generateCSSFix(
      description,
      currentCSS,
      formElementStructure
    );
    
    console.log('CSS solution generated successfully!');
    return optimizedCSS;
  } catch (error) {
    console.error('Failed to generate CSS:', error);
    return '';
  }
}