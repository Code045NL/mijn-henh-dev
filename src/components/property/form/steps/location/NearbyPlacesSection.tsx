
import { PropertyFormData, PropertyNearbyPlace } from "@/types/property";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CategoryFilters } from "./components/CategoryFilters";
import { CategorySection } from "./components/CategorySection";
import { useLocationCategories } from "./useLocationCategories";

interface NearbyPlacesSectionProps {
  formData: PropertyFormData;
  onRemovePlace?: (index: number) => void;
  onFieldChange?: (field: keyof PropertyFormData, value: any) => void;
}

export function NearbyPlacesSection({
  formData,
  onRemovePlace,
  onFieldChange
}: NearbyPlacesSectionProps) {
  const nearbyPlaces = formData.nearby_places || [];
  const { categories, handleFilterChange, activeFilters } = useLocationCategories(nearbyPlaces);
  
  // Toggle place visibility in webview
  const togglePlaceVisibility = (placeIndex: number, visible: boolean) => {
    if (!onFieldChange || !formData.nearby_places) return;
    
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces[placeIndex] = {
      ...updatedPlaces[placeIndex],
      visible_in_webview: visible
    };
    
    onFieldChange('nearby_places', updatedPlaces);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>Nearby Places</Label>
          
          {(nearbyPlaces && nearbyPlaces.length > 0) ? (
            <>
              <CategoryFilters 
                categories={categories}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
              
              {categories.map(category => (
                <CategorySection 
                  key={category.name}
                  category={category}
                  places={nearbyPlaces.filter(place => place.type === category.name)}
                  allPlaces={nearbyPlaces}
                  toggleVisibility={togglePlaceVisibility}
                  isVisible={activeFilters.includes(category.name)}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No nearby places found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Use the "Fetch Location Data" button in the Address section to get nearby places.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
