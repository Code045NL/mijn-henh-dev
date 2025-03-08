
import { PropertyData } from "@/types/property";
import { AgencySettings } from "@/types/agency";
import { OverviewSection } from "../sections/OverviewSection";
import { DetailsSection } from "../sections/DetailsSection";
import { AreasSection } from "../sections/AreasSection";
import { SingleAreaSection } from "../sections/SingleAreaSection";
import { FloorplanSection } from "../sections/FloorplanSection";
import { NeighborhoodSection } from "../sections/NeighborhoodSection";
import { ContactSection } from "../sections/ContactSection";
import React from "react";

interface SectionConfigProps {
  property: PropertyData;
  settings: AgencySettings;
  currentPage: number;
  waitForPlaces?: boolean;
  isPrintView?: boolean;
}

interface Section {
  title: string;
  content: React.ReactNode;
}

export function getSections({
  property,
  settings,
  currentPage,
  waitForPlaces = false,
  isPrintView = false
}: SectionConfigProps): Section[] {
  // Start with the fixed sections
  const sections: Section[] = [
    {
      title: "Overview",
      content: <OverviewSection property={property} settings={settings} />
    },
    {
      title: "Details",
      content: <DetailsSection property={property} />
    }
  ];
  
  // Add individual area sections
  if (property.areas && property.areas.length > 0) {
    property.areas.forEach((area, index) => {
      sections.push({
        title: `Area: ${area.title || `Area ${index + 1}`}`,
        content: <SingleAreaSection property={property} settings={settings} areaIndex={index} />
      });
    });
  }
  
  // Add floorplan section if available
  if (property.floorplanEmbedScript) {
    console.log('Adding floorplan section to sections array');
    sections.push({
      title: "Floorplan",
      content: <FloorplanSection property={property} settings={settings} />
    });
  } else {
    console.log('Skipping floorplan section - no embed script found');
  }
  
  // Add remaining sections
  sections.push({
    title: "Neighborhood",
    content: <NeighborhoodSection 
      property={property} 
      settings={settings} 
      waitForPlaces={waitForPlaces} 
    />
  });
  
  // Add contact section if not in print view
  if (!isPrintView) {
    sections.push({
      title: "Contact",
      content: <ContactSection property={property} settings={settings} />
    });
  }

  // Log the final sections structure for debugging
  console.log('Sections generated:', sections.map(s => s.title).join(', '), 
    { totalSections: sections.length, hasFloorplan: !!property.floorplanEmbedScript });

  return sections;
}
