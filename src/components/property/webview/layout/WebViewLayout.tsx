
import { PropertyData } from "@/types/property";
import { AgencySettings } from "@/types/agency";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Navigation } from "./Navigation";
import { ShareButton } from "./ShareButton";
import { SideMenu } from "./SideMenu";
import { ContactSidebar } from "./ContactSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WebViewLayoutProps {
  property: PropertyData;
  settings: AgencySettings;
  currentPage: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}

export function WebViewLayout({
  property,
  settings,
  currentPage,
  onPageChange,
  children
}: WebViewLayoutProps) {
  const { primaryColor, secondaryColor } = useThemeColors(settings);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="w-40">
            {settings.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt={settings.name || 'Agency logo'} 
                className="h-12 object-contain"
              />
            )}
          </div>
          
          {/* Title and Price */}
          <div className="text-center">
            <h1 className="text-xl font-semibold" style={{ color: primaryColor }}>
              {property.title}
            </h1>
            <p className="text-lg" style={{ color: secondaryColor }}>
              € {property.price}
            </p>
          </div>
          
          {/* Share Button */}
          <div className="w-40 flex justify-end">
            <ShareButton propertyId={property.id} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 flex overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-8 flex-1 flex w-full">
          <div className="flex gap-8 h-full w-full">
            {/* Left Sidebar */}
            <aside className="w-64 shrink-0">
              <SideMenu 
                property={property}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-[60%] flex flex-col h-full">
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto pr-4">
                {children}
              </div>
              
              {/* Navigation - sticky to the bottom */}
              <div className="sticky bottom-0 mt-4 pt-4 pb-2 z-10 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent backdrop-blur-[2px]">
                <Navigation
                  currentPage={currentPage}
                  totalPages={calculateTotalPages(property)}
                  onPrevious={() => onPageChange(currentPage - 1)}
                  onNext={() => onPageChange(currentPage + 1)}
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-80 shrink-0">
              <div className="sticky top-24">
                <ContactSidebar 
                  property={property}
                  settings={settings}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to calculate total pages
function calculateTotalPages(property: PropertyData): number {
  let total = 2; // Start with Overview and Details pages
  
  // Add individual area pages
  if (property.areas && property.areas.length > 0) {
    total += property.areas.length;
  }
  
  // Add floorplan page if available
  if ((property.floorplanEmbedScript && property.floorplanEmbedScript.trim() !== '') ||
      (property.floorplans && property.floorplans.length > 0)) {
    total += 1;
  }
  
  // Add neighborhood page
  total += 1;
  
  // Add virtual tour/media page if either exists
  if ((property.virtualTourUrl && property.virtualTourUrl.trim() !== '') ||
      (property.youtubeUrl && property.youtubeUrl.trim() !== '')) {
    total += 1;
  }
  
  // Add contact page
  total += 1;
  
  return total;
}
