const QuoteDisplayTestPage = () => {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Promo Code Display in Quotes - Design Demo
      </h1>
      
      <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
        A demonstration of how promo codes appear in the quote system.
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
        gap: '2rem' 
      }}>
        {/* Example 1: Quote with WELCOME10 Promo */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Quote with 10% Promo Code
          </h2>
          
          {/* Promo code display */}
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '0.375rem', 
            padding: '1rem', 
            display: 'flex', 
            alignItems: 'flex-start',
            marginBottom: '1.5rem'
          }}>
            <span style={{ color: '#16a34a', marginRight: '0.75rem', fontSize: '1.25rem' }}>🏷️</span>
            <div>
              <h3 style={{ fontWeight: '500', color: '#166534' }}>
                Promo Code Applied: WELCOME10
              </h3>
              <p style={{ color: '#15803d', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                10% off your first dental treatment
              </p>
            </div>
          </div>
          
          {/* Price breakdown */}
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.375rem', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>$4,000.00</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem',
              color: '#16a34a'
            }}>
              <span>% Discount (WELCOME10):</span>
              <span>-$400.00</span>
            </div>
            <div style={{ borderTop: '1px solid #d1d5db', margin: '0.5rem 0' }}></div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold' 
            }}>
              <span>Total:</span>
              <span style={{ fontSize: '1.125rem' }}>$3,600.00</span>
            </div>
          </div>
          
          {/* Treatments */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '0.375rem', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              Treatments Included
            </h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Dental Implant - $1,200</li>
              <li>Porcelain Crown (x2) - $1,600</li>
              <li>X-Ray Full Mouth - $300</li>
              <li>Consultation - $150</li>
            </ul>
          </div>
        </div>
        
        {/* Example 2: Package Promo */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Quote with Package Promo
          </h2>
          
          {/* Promo code display */}
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '0.375rem', 
            padding: '1rem', 
            display: 'flex', 
            alignItems: 'flex-start',
            marginBottom: '1.5rem'
          }}>
            <span style={{ color: '#16a34a', marginRight: '0.75rem', fontSize: '1.25rem' }}>🏷️</span>
            <div>
              <h3 style={{ fontWeight: '500', color: '#166534' }}>
                Promo Code Applied: IMPLANTCROWN30
              </h3>
              <p style={{ color: '#15803d', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                30% off on our premium implant and crown package
              </p>
            </div>
          </div>
          
          {/* Price breakdown */}
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.375rem', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>$6,000.00</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem',
              color: '#16a34a'
            }}>
              <span>% Discount (IMPLANTCROWN30):</span>
              <span>-$1,800.00</span>
            </div>
            <div style={{ borderTop: '1px solid #d1d5db', margin: '0.5rem 0' }}></div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold' 
            }}>
              <span>Total:</span>
              <span style={{ fontSize: '1.125rem' }}>$4,200.00</span>
            </div>
          </div>
          
          {/* Treatments */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '0.375rem', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              Treatments Included
            </h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Premium Dental Implant (x2) - $3,000</li>
              <li>Ceramic Crown (x2) - $3,000</li>
            </ul>
          </div>
        </div>
        
        {/* Example 3: No Promo Code */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Quote without Promo Code
          </h2>
          
          {/* No promo code display */}
          
          {/* Price breakdown */}
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.375rem', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>$5,000.00</span>
            </div>
            <div style={{ borderTop: '1px solid #d1d5db', margin: '0.5rem 0' }}></div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: 'bold' 
            }}>
              <span>Total:</span>
              <span style={{ fontSize: '1.125rem' }}>$5,000.00</span>
            </div>
          </div>
          
          {/* Treatments */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '0.375rem', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
              Treatments Included
            </h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Full Mouth Veneers - $4,000</li>
              <li>Professional Whitening - $600</li>
              <li>Dental Consultation - $400</li>
            </ul>
          </div>
        </div>
        
        {/* Design Notes */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '0.5rem', 
          padding: '1.5rem', 
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Design Elements
          </h2>
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #bbf7d0',
                borderRadius: '0.25rem',
                marginRight: '0.5rem'
              }}></div>
              <span>Green background for promo code highlight boxes</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ 
                color: '#16a34a', 
                marginRight: '0.5rem',
                fontWeight: 'bold'
              }}>%</div>
              <span>Green discount text with percentage symbol</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                backgroundColor: '#eff6ff', 
                border: '1px solid #bfdbfe',
                borderRadius: '0.25rem',
                marginRight: '0.5rem'
              }}></div>
              <span>Blue treatment section for visual separation</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ 
                fontSize: '1.125rem',
                fontWeight: 'bold',
                marginRight: '0.5rem'
              }}>$</div>
              <span>Larger font size for final total amount</span>
            </li>
          </ul>
          
          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              This simplified display shows how promo codes are highlighted in a green box at the top of the quote, 
              with discounts clearly shown in the pricing breakdown. The green color visually connects the promo code with 
              the discount amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplayTestPage;