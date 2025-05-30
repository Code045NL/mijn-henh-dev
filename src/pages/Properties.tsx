
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useProperties, Property } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgentSelect } from "@/hooks/useAgentSelect";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useEffect } from "react";
import { PropertyData } from "@/types/property";

export default function Properties() {
  const navigate = useNavigate();
  const { properties, isLoading, handleDelete, refetch } = useProperties();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { agents } = useAgentSelect();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all-agents");

  useEffect(() => {
    console.log("Properties component - Properties loaded:", properties.length);
  }, [properties]);

  useEffect(() => {
    if (properties) {
      if (selectedAgentId && selectedAgentId !== "all-agents") {
        setFilteredProperties(properties.filter(p => p.agent_id === selectedAgentId));
      } else {
        setFilteredProperties(properties);
      }
    }
  }, [properties, selectedAgentId]);

  const handleCreateNewProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: 'New Property',
          status: 'Draft'
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data && data.id) {
        navigate(`/?tab=property&propertyId=${data.id}`);
      }
    } catch (error) {
      console.error("Error creating new property:", error);
      toast({
        title: "Error",
        description: "Failed to create new property",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-estate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <h1 className="text-4xl font-bold text-estate-800">Property Overview</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isAdmin && (
              <div className="w-full sm:w-56">
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                  defaultValue="all-agents"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-agents">All Agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem 
                        key={agent.id} 
                        value={agent.id}
                      >
                        {agent.display_name || "Unnamed Agent"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleCreateNewProperty} className="w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProperties.length === 0 ? (
              <div className="col-span-4 text-center py-20">
                <p className="text-gray-500">No properties found</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    ...property,
                    price: property.price || "",
                    bedrooms: "",
                    bathrooms: "",
                    sqft: "",
                    livingArea: "",
                    buildYear: "",
                    garages: "",
                    energyLabel: "",
                    hasGarden: false,
                    description: "",
                    location_description: "",
                    features: [],
                    areas: [],
                    images: [],
                    map_image: null,
                    latitude: null,
                    longitude: null
                  } as PropertyData}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
