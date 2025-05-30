
import { PropertyData } from '@/types/property';
import { AgencySettings } from '@/types/agency';
import jsPDF from 'jspdf';
import { renderIconToPDF } from '../helpers/iconUtils';

export const generateKeyInfoCards = async (
  pdf: jsPDF,
  property: PropertyData,
  settings: AgencySettings,
  x: number,
  width: number,
  y: number,
  height: number
) => {
  // Define colors
  const primaryColor = settings?.primaryColor || '#9b87f5';
  const secondaryColor = settings?.secondaryColor || '#7E69AB';
  
  // Get icons from settings or use defaults
  const buildYearIcon = settings?.iconBuildYear || 'calendar';
  const livingAreaIcon = settings?.iconLivingSpace || 'home'; // Fixed to use 'home'
  const sqftIcon = settings?.iconSqft || 'ruler';
  const bedroomsIcon = settings?.iconBedrooms || 'bed';
  const bathroomsIcon = settings?.iconBathrooms || 'bath';
  const energyClassIcon = settings?.iconEnergyClass || 'zap';
  
  // Format price with Euro symbol and thousand separators
  const formatPrice = (price?: string | number) => {
    if (!price) return 'N/A';
    
    // Convert to string and remove any non-numeric characters except decimal
    const numericPrice = String(price).replace(/[^\d.]/g, '');
    
    // Parse as number
    const priceNum = parseFloat(numericPrice);
    if (isNaN(priceNum)) return 'N/A';
    
    // Format with thousand separators
    return '€ ' + priceNum.toLocaleString('nl-NL');
  };
  
  // Property specs in a 3x2 grid
  const specs = [
    { label: 'Bouwjaar', value: property.buildYear || 'N/A', icon: buildYearIcon },
    { label: 'Woonoppervlak', value: `${property.livingArea || 'N/A'} m²`, icon: livingAreaIcon },
    { label: 'Perceeloppervlak', value: `${property.sqft || 'N/A'} m²`, icon: sqftIcon },
    { label: 'Slaapkamers', value: property.bedrooms || 'N/A', icon: bedroomsIcon },
    { label: 'Badkamers', value: property.bathrooms || 'N/A', icon: bathroomsIcon },
    { label: 'Energie klasse', value: property.energyLabel || 'N/A', icon: energyClassIcon }
  ];
  
  // Calculate spec card dimensions (3x2 grid)
  const cols = 3; // 3 columns
  const rows = 2; // 2 rows
  const specWidth = (width / cols) - 4; // Add spacing between cards
  const specHeight = height / rows - 4; // Add spacing between rows
  const specMargin = 4; // Margin between cards
  
  // Process each spec card
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    const specX = x + (col * (specWidth + specMargin));
    const specY = y + (row * (specHeight + specMargin));
    
    // Background
    pdf.setFillColor(primaryColor);
    pdf.roundedRect(specX, specY, specWidth, specHeight, 2, 2, 'F');
    
    // Position for icon at left side of the card
    const iconX = specX + 8;
    const iconY = specY + 13;
    
    // Circle background for icon
    pdf.setFillColor(secondaryColor);
    pdf.circle(iconX, iconY, 4, 'F');
    
    // Render icon - use 'light' theme for white icons
    await renderIconToPDF(pdf, spec.icon, iconX, iconY, 6, 'light');
    
    // Label to the right of the icon
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(spec.label, specX + 16, specY + 10);
    
    // Value below label
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(String(spec.value), specX + 16, specY + 15);
  }
};
