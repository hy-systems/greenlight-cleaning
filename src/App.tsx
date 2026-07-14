import React, { useReducer, useState, useEffect, useRef, memo } from "react";
import {
  Menu, X, Phone, Mail, MessageCircle, MapPin, Check, CheckCircle2, Star,
  Shield, ArrowRight, ChevronRight, Clock, Award, ArrowLeft,
  Home, Building2, KeyRound, Truck, Paintbrush2, Hammer, Tag,
  HeartHandshake, Accessibility, Layers, Smartphone
} from "lucide-react";

/* ============================================================
   CONTACT + BRAND CONSTANTS
   ============================================================ */
const PHONE_DISPLAY = "0430 230 971";
const TEL = "tel:+61430230971";
const SMS = "sms:0430230971";
const EMAIL = "Info@greenlightclean.com.au";
const MAILTO = "mailto:Info@greenlightclean.com.au?subject=Cleaning%20Quote";
const WA = "https://wa.me/61430230971?text=Hi%20Greenlight%2C%20I%27d%20like%20a%20cleaning%20quote.%20Here%20are%20my%20property%20photos%2Fvideos.";

/* ============================================================
   TYPES
   ============================================================ */
interface ServiceGroup { title: string; items: string[]; }
interface Pricing { type: string; header: string[]; rows: string[][]; }
interface ExtraCategory { title: string; items: [string, string][]; note?: string; }
type ContentBlock =
  | { kind: "text"; title?: string; body?: string; items?: string[] }
  | { kind: "extras"; title: string; intro?: string[]; categories: ExtraCategory[] }
  | { kind: "rates"; title: string; intro?: string; headers: string[]; rows: string[][]; footnote?: string };
interface Service {
  icon: string;
  name: string;
  summary: string;
  intro?: string[];
  introList?: { title: string; items: string[] };
  groups: ServiceGroup[];
  exclusions?: string[];
  chips?: string[];
  chipsTitle?: string;
  pricing?: Pricing;
  contentBlocks?: ContentBlock[];
  rate?: string;
  note?: string;
  quote?: boolean;
}

type Route = "home" | "services" | "service-detail" | "gallery" | "areas" | "about" | "contact";

interface State {
  currentRoute: Route;
  isMenuOpen: boolean;
  isChatOpen: boolean;
  activeServiceCategory: string;
}

type Action =
  | { type: "NAVIGATE"; route: Route }
  | { type: "OPEN_SERVICE"; key: string }
  | { type: "SET_SERVICE"; key: string }
  | { type: "TOGGLE_MENU" }
  | { type: "CLOSE_MENU" }
  | { type: "TOGGLE_CHAT" }
  | { type: "CLOSE_CHAT" };

type Dispatch = React.Dispatch<Action>;

interface NavLink { label: string; route: Route; }
interface IconItem { icon: React.ElementType; text: string; }

/* ============================================================
   WHATSAPP GLYPH (lucide has no brand icon)
   ============================================================ */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ============================================================
   SERVICE DATA PAYLOADS
   ============================================================ */
const ICONS: Record<string, React.ElementType> = {
  home: Home, building: Building2, key: KeyRound, truck: Truck,
  paint: Paintbrush2, hammer: Hammer, tag: Tag, access: Accessibility,
  heart: HeartHandshake, layers: Layers
};

const NDIS_PROVIDERS: string[] = [
  "Scope", "Mable", "Hireup", "Claro", "Aruma", "Yooralla", "Melba Support Services",
  "VMCH", "Baptcare", "Jewish Care", "Bolton Clarke", "mecwacare", "Benetas",
  "Australian Unity", "Silverchain", "HammondCare", "MiCare", "Fronditha Care"
];

const SERVICES: Record<string, Service> = {
  "regular-domestic": {
    icon: "home",
    name: "Regular Domestic Cleaning",
    summary: "Scheduled home cleans that keep every room consistently fresh.",
    intro: [
      "Our regular domestic cleaning service is designed to keep your home fresh, hygienic and well maintained. The first visit is usually a more detailed clean to bring the property up to our maintenance standard, followed by regular ongoing visits."
    ],
    groups: [
      {
        title: "General Areas",
        items: [
          "Dust and wipe accessible surfaces",
          "Vacuum carpets and rugs",
          "Mop hard floors",
          "Empty bins and replace liners",
          "Dust skirting boards, window sills and furniture surfaces",
          "Remove cobwebs where accessible",
          "Tidy and straighten rooms"
        ]
      },
      {
        title: "Kitchen",
        items: [
          "Wipe benchtops and splashbacks",
          "Clean sink and taps",
          "Clean stovetop and exterior of rangehood",
          "Wipe exterior of microwave",
          "Clean exterior of oven and dishwasher",
          "Wipe cupboard fronts and handles",
          "Clean exterior of refrigerator",
          "Spot clean fingerprints and marks"
        ]
      },
      {
        title: "Bathrooms and Toilets",
        items: [
          "Clean and disinfect toilet",
          "Clean shower screens and shower area",
          "Clean bathtub",
          "Clean vanity, basin and taps",
          "Polish mirrors",
          "Wipe bathroom surfaces",
          "Vacuum and mop floors"
        ]
      },
      {
        title: "Bedrooms",
        items: [
          "Dust furniture and accessible surfaces",
          "Vacuum or mop floors",
          "Make beds if requested",
          "Empty bins"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Optional Extras (Additional Charges May Apply)",
        items: [
          "Interior oven cleaning",
          "Rangehood filter cleaning",
          "Interior windows and glass doors",
          "Wall mark removal",
          "Blind cleaning",
          "Inside fridge cleaning",
          "Inside cupboards and drawers",
          "Bed linen change",
          "Balcony cleaning",
          "Garage sweeping"
        ]
      }
    ],
    pricing: {
      type: "single",
      header: ["Configuration", "Price (Cash)"],
      rows: [
        ["1 Bed / 1 Bath", "$100"],
        ["2 Bed / 1 Bath", "$120 to $130"],
        ["2 Bed / 2 Bath", "$130 to $140"],
        ["3 Bed / 2 Bath, single storey", "$140 to $150"],
        ["3 Bed / 2 Bath, double storey", "$150 to $160"],
        ["4 Bed / 2 Bath, single storey", "$150 to $160"],
        ["4 Bed / 2 Bath, double storey", "$160 to $170"],
        ["4 Bed / 3 Bath, single storey", "$170 to $180"],
        ["4 Bed / 3 Bath, double storey", "$200 to $250"],
        ["5 Bed / 3 Bath", "$220 to $270"],
        ["5 Bed / 4 Bath", "$240 to $300"]
      ]
    },
    note: "Initial or first cleans are charged at 1.5x to 2x the regular rate."
  },

  "commercial": {
    icon: "building",
    name: "Commercial Cleaning",
    summary: "Reliable contract cleaning for workplaces and public facilities.",
    chipsTitle: "Industries served",
    chips: ["Clinic", "School", "Kindergarten", "Gym", "Office", "Factory", "Shopping Centre", "Body Corporate", "Church", "Hospital", "Restaurant"],
    groups: [{
      title: "Scope of work",
      items: [
        "Dusting and surface disinfecting",
        "Keyboard and workstation disinfecting",
        "Reception areas and workspaces",
        "Kitchens and staff areas",
        "Toilets and amenities",
        "Rubbish removal",
        "Front entrance glass",
        "Securing and locking doors on exit",
        "Urine stain removal in male toilets",
        "Urinal mat replacement"
      ]
    }],
    quote: true
  },

  "end-of-lease": {
    icon: "key",
    name: "End of Lease Cleaning",
    summary: "Bond back focused cleans aligned to real estate agency requirements.",
    intro: [
      "Our comprehensive end of lease cleaning service is designed to help tenants prepare their property for the final inspection and maximise their chances of receiving their bond back."
    ],
    groups: [
      {
        title: "General & Carpet Care",
        items: [
          "Carpet steam cleaning and deodorising",
          "Vacuuming of all carpeted areas",
          "Cleaning of interior windows",
          "Cleaning of accessible exterior windows",
          "Cleaning of interior window sills and window tracks"
        ]
      },
      {
        title: "Complete Bathroom Cleaning",
        items: [
          "Showers and shower screens",
          "Bathtubs",
          "Toilets",
          "Sinks and basins",
          "Mirrors",
          "Bathroom surfaces",
          "Accessible exhaust fans and air vents"
        ]
      },
      {
        title: "Complete Kitchen Cleaning",
        items: [
          "Stovetops",
          "Benchtops",
          "Splashbacks",
          "Rangehood and accessible filters",
          "Oven interior and exterior",
          "Dishwasher interior and exterior",
          "Pantry surfaces",
          "Kitchen sink and taps"
        ]
      },
      {
        title: "Cupboards & Laundry",
        items: [
          "Cleaning of cupboards, shelves and drawers, inside and outside, provided they are empty",
          "Full laundry cleaning, including sinks, taps, cupboards and surfaces",
          "Cleaning of wardrobe mirrors, frames and tracks",
          "Sweeping of the garage floor",
          "Removal of cobwebs from the garage"
        ]
      },
      {
        title: "Finishing Touches",
        items: [
          "Dusting throughout the property",
          "Removal of cobwebs throughout the property",
          "Vacuuming and mopping of all hard and wet-area floors",
          "Dusting and wiping of blinds",
          "Cleaning of accessible light fittings",
          "Cleaning of skirting boards",
          "Cleaning of power points and light switches",
          "Cleaning of doors, door frames and handles",
          "Spot cleaning of removable wall marks"
        ]
      }
    ],
    chipsTitle: "Agency approved",
    chips: ["Ray White", "Hodges", "Jellis Craig", "Barry Plant", "Buxton", "Biggin & Scott", "Marshall White", "Woodards", "Harcourts", "Belle Property", "McGrath", "LJ Hooker", "Noel Jones", "OBrien Real Estate"],
    pricing: {
      type: "carpet",
      header: ["Configuration", "Base", "With Carpet Steam"],
      rows: [
        ["1 Bed / 1 Bath", "$220", "$290"],
        ["2 Bed / 1 Bath", "$260", "$340"],
        ["2 Bed / 2 Bath", "$300", "$370"],
        ["3 Bed / 1 Bath", "$340", "$420"],
        ["3 Bed / 2 Bath", "$370", "$470"],
        ["3 Bed / 3 Bath", "$410", "$500"],
        ["4 Bed / 2 Bath", "$450", "$550"],
        ["4 Bed / 3 Bath / 2 Living", "$520", "$660"],
        ["5 Bed / 3 Bath / 2 Living", "$560", "$680"]
      ]
    },
    contentBlocks: [
      {
        kind: "text",
        title: "Bond Back Support",
        body: "We follow a detailed end of lease cleaning checklist commonly required by property managers and real estate agents. If your property manager identifies any cleaning-related issues covered by our original service, please contact us promptly so we can review the request."
      },
      {
        kind: "text",
        title: "Please Note",
        items: [
          "The property must be vacant and personal belongings must be removed before cleaning begins.",
          "Cupboards, drawers, shelves and wardrobes must be empty for interior cleaning.",
          "Exterior window cleaning is limited to safely accessible areas.",
          "Permanent stains, damage, mould, discolouration, worn surfaces and marks that cannot be removed through standard cleaning are not considered cleaning defects.",
          "Additional charges may apply for heavily soiled properties, excessive grease, pet hair, mould, high windows, balconies, garages or areas requiring specialised equipment.",
          "Carpet steam cleaning may be arranged as part of the service where requested.",
          "A Tax Invoice can be provided."
        ]
      },
      {
        kind: "extras",
        title: "Additional Services & Charges",
        intro: [
          "Every property is different in size, layout and condition, and individual property managers may have different inspection requirements. Our standard end of lease cleaning package covers the items listed above. Services outside the standard scope may incur additional charges.",
          "The following prices are general guides only. Final pricing will depend on the size, condition, accessibility and amount of work required."
        ],
        categories: [
          {
            title: "Walls, Mould and Repairs",
            items: [
              ["Wall mark cleaning", "from $15 per wall"],
              ["Minor wall patching and touch-up painting", "from $80"],
              ["Mould treatment and removal", "from $20"],
              ["Drain cleaning or minor blockage clearing", "from $30"]
            ],
            note: "Please note that permanent stains, damaged paint, water damage, structural mould and marks that cannot be removed through normal cleaning may require repair or specialist treatment."
          },
          {
            title: "Kitchen Appliances",
            items: [
              ["Refrigerator cleaning", "$20 to $60 each"],
              ["Microwave cleaning", "$15 each"],
              ["Oven cleaning", "$30 to $80 each"],
              ["Air-conditioning filter cleaning", "$15 each"]
            ],
            note: "Pricing may vary depending on the size, grease build-up and overall condition of the appliance."
          },
          {
            title: "Windows and Blinds",
            items: [
              ["Window glass cleaning", "from $10 per panel"],
              ["Blind cleaning", "$15 to $40 per blind"]
            ],
            note: "Exterior windows are cleaned only where they can be accessed safely. High windows, heavily soiled windows, security screens and specialised access may incur additional charges."
          },
          {
            title: "Additional Rooms and Areas",
            items: [
              ["Additional living room", "$40"],
              ["Additional separate toilet", "$25"],
              ["Additional bathroom", "$50"],
              ["Carpeted stairs", "$50 per level"],
              ["Non-carpeted stairs", "$20 per level"],
              ["Garage, balcony, courtyard or other outdoor area", "$20 to $60 per area"]
            ]
          },
          {
            title: "Carpet and Pet Hair",
            items: [
              ["Excessive pet hair removal from carpet", "$20 to $80 per room"]
            ],
            note: "This charge applies where additional vacuuming, brushing or specialised pet-hair removal is required beyond normal carpet vacuuming or steam cleaning."
          },
          {
            title: "Rubbish Removal",
            items: [
              ["Rubbish packing and bagging", "from $30"],
              ["Rubbish disposal", "$10 per bag"]
            ],
            note: "Additional charges may apply for large, heavy, hazardous or bulky items. Rubbish disposal is subject to available space and local disposal requirements."
          }
        ]
      },
      {
        kind: "text",
        title: "Important Pricing Information",
        items: [
          "All additional services must be confirmed before work begins wherever possible.",
          "Photos or an on-site inspection may be required before a final quotation can be provided.",
          "Prices may increase for heavily soiled properties, excessive grease, mould, pet hair, rubbish, difficult access or additional real estate agent requirements.",
          "Repair work, painting, specialist mould treatment and rubbish removal are separate from standard cleaning.",
          "Any additional work requested by the tenant, landlord or property manager after the original cleaning may incur a return service fee.",
          "Prices are subject to GST where applicable."
        ]
      }
    ]
  },

  "move-in": {
    icon: "truck",
    name: "Move In Cleaning",
    summary: "A deep clean before you move into a new home.",
    groups: [{
      title: "Scope of work",
      items: [
        "Internal and external cupboards",
        "Thorough kitchen clean and degrease",
        "Thorough bathroom clean",
        "Rangehood checks",
        "Dusting throughout",
        "Vacuuming",
        "Mopping"
      ]
    }],
    quote: true
  },

  "builders": {
    icon: "hammer",
    name: "Builder's Cleaning & Post Renovation Cleaning",
    summary: "Rough, sparkle and final cleans for new builds and sites.",
    intro: [
      "Our Builder's Cleaning service is designed for newly constructed homes, renovations, extensions and commercial projects that require detailed cleaning before handover or occupancy.",
      "Construction sites generate large amounts of dust, debris, adhesive residue and building materials that require specialised cleaning techniques and equipment. Our experienced team works with builders, developers, project managers, real estate agents and homeowners to ensure the property is ready for handover."
    ],
    groups: [
      {
        title: "Removal of Construction Dust",
        items: [
          "Removal of fine construction dust from all accessible surfaces",
          "Dusting of walls, ceilings and cornices",
          "Dust removal from skirting boards and architraves",
          "Cleaning of doors, frames and handles",
          "Cleaning of wardrobes, shelves and cupboards",
          "Cleaning of joinery and cabinetry",
          "Dust removal from light fittings and switches",
          "Cleaning of power points and electrical fittings",
          "Cleaning of air-conditioning vents and exhaust vents"
        ]
      },
      {
        title: "Window and Glass Cleaning",
        items: [
          "Cleaning of interior windows and accessible exterior windows",
          "Removal of stickers and labels from glass surfaces",
          "Cleaning of window frames, tracks and sills",
          "Removal of paint splashes and silicone residue from glass where possible",
          "Cleaning of mirrors and glass balustrades"
        ]
      },
      {
        title: "Kitchen Cleaning",
        items: [
          "Cleaning of kitchen cabinetry inside and outside",
          "Cleaning of benchtops and splashbacks",
          "Cleaning of sinks and taps",
          "Cleaning of rangehoods and filters",
          "Cleaning of ovens and cooktops",
          "Cleaning of dishwashers and appliances",
          "Removal of dust from drawers and pantry shelving"
        ]
      },
      {
        title: "Bathroom Cleaning",
        items: [
          "Cleaning and polishing of showers and shower screens",
          "Cleaning of bathtubs and basins",
          "Cleaning and sanitising of toilets",
          "Cleaning of mirrors and vanities",
          "Cleaning of tiles and grout surfaces",
          "Removal of construction dust from vents and exhaust fans",
          "Removal of silicone smears where possible"
        ]
      },
      {
        title: "Floors",
        items: [
          "Vacuuming of all floor surfaces",
          "Removal of construction dust from corners and edges",
          "Mopping and detailing of hard floors",
          "Cleaning and vacuuming of carpeted areas",
          "Removal of minor paint spots and residue where possible"
        ]
      },
      {
        title: "Detailed Finishing Touches",
        items: [
          "Cleaning of staircases and handrails",
          "Cleaning of built-in furniture and shelving",
          "Removal of cobwebs",
          "Cleaning of garage areas",
          "Cleaning of entry areas and external pathways where required",
          "Final presentation cleaning prior to handover"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Optional Additional Services",
        body: "Additional services can be arranged where required, including:",
        items: [
          "Pressure washing",
          "Exterior building wash-down",
          "High window cleaning",
          "Balcony and outdoor area cleaning",
          "Sticker and adhesive removal",
          "Paint overspray removal",
          "Silicone residue removal",
          "Builders waste and rubbish removal",
          "Carpet steam cleaning",
          "Floor scrubbing and machine polishing",
          "Tile and grout detailing"
        ]
      },
      {
        kind: "text",
        title: "Multi-Stage Builder's Cleans Available",
        body: "We can provide cleaning services at different stages of construction, including:",
        items: [
          "Initial Builders Clean: Removal of heavy dust and construction debris during the build process.",
          "Final Builders Clean: Detailed cleaning before practical completion and handover.",
          "Handover or Sparkle Clean: Final presentation clean to ensure the property is ready for occupancy, photography or client handover."
        ]
      },
      {
        kind: "text",
        title: "Please Note",
        body: "Builder's cleaning requirements vary significantly depending on the size of the property, the stage of construction and the level of dust and debris present. Pricing is based on:",
        items: [
          "Property size",
          "Number of rooms and bathrooms",
          "Level of dust and contamination",
          "Accessibility",
          "Type of flooring and surfaces",
          "Extent of paint, silicone and adhesive residue",
          "Site condition and access requirements"
        ]
      }
    ],
    note: "Site inspections or photos are usually required before a quotation can be provided.",
    quote: true
  },

  "house-for-sale": {
    icon: "tag",
    name: "House for Sale Cleaning",
    summary: "Presentation ready cleans for inspections and photography.",
    intro: [
      "Our House for Sale Cleaning service is specifically designed to prepare your property for professional photography, open inspections and sale campaigns.",
      "A professionally cleaned home creates a stronger first impression, improves presentation and helps potential buyers focus on the property's features rather than its condition."
    ],
    groups: [
      {
        title: "General Cleaning Throughout the Property",
        items: [
          "Removal of dust from all accessible surfaces",
          "Dusting of skirting boards and architraves",
          "Cleaning of doors, frames and handles",
          "Cleaning of power points and light switches",
          "Removal of cobwebs throughout the property",
          "Vacuuming all carpets and rugs",
          "Mopping all hard floor surfaces",
          "Spot cleaning of wall marks where possible"
        ]
      },
      {
        title: "Kitchen Presentation Cleaning",
        items: [
          "Cleaning and polishing all benchtops",
          "Cleaning of splashbacks and tiled areas",
          "Cleaning of cupboards and drawers externally",
          "Internal cleaning of empty cupboards if required",
          "Cleaning of sinks and taps",
          "Cleaning and polishing of appliances",
          "Cleaning of stovetops and rangehoods",
          "Oven cleaning where required",
          "Cleaning of pantry shelving and storage areas"
        ]
      },
      {
        title: "Bathroom Presentation Cleaning",
        items: [
          "Cleaning and polishing of shower screens",
          "Removal of soap scum and water marks",
          "Cleaning and sanitising of toilets",
          "Cleaning of bathtubs and basins",
          "Cleaning and polishing of mirrors",
          "Cleaning of vanities and cabinetry",
          "Cleaning of tiles and grout surfaces",
          "Cleaning of exhaust fans and air vents"
        ]
      },
      {
        title: "Window and Glass Cleaning",
        items: [
          "Cleaning of interior windows",
          "Cleaning of accessible exterior windows",
          "Cleaning of window tracks and window sills",
          "Cleaning of mirrors throughout the property",
          "Cleaning of glass doors and glass balustrades"
        ]
      },
      {
        title: "Bedrooms and Living Areas",
        items: [
          "Dusting and cleaning of wardrobes",
          "Cleaning of wardrobe mirrors, tracks and frames",
          "Cleaning of shelves and built-in cabinetry",
          "Cleaning of blinds and shutters",
          "Detailed dust removal from display areas"
        ]
      },
      {
        title: "Lighting and Presentation Details",
        items: [
          "Cleaning of light fittings and ceiling fans",
          "Cleaning of air-conditioning vents",
          "Removal of fingerprints from doors and glass",
          "Polishing of stainless steel and chrome fixtures",
          "Final presentation detailing prior to photography or inspections"
        ]
      },
      {
        title: "Outdoor Areas",
        items: [
          "Sweeping of garages and storage areas",
          "Removal of cobwebs from external areas",
          "Sweeping of balconies, patios and alfresco areas",
          "Cleaning of entry areas and front porches",
          "Basic presentation cleaning of outdoor entertaining areas"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Optional Premium Presentation Services",
        body: "Additional services can be arranged where required:",
        items: [
          "Carpet steam cleaning",
          "Pressure washing",
          "High window cleaning",
          "Exterior house washing",
          "Driveway and pathway pressure cleaning",
          "Garden tidy-up",
          "Lawn mowing and edging",
          "Rubbish removal",
          "Wall washing",
          "Minor wall repairs and touch-up painting",
          "Mould treatment and removal",
          "Decluttering assistance",
          "Furniture staging preparation",
          "Pre-photography sparkle clean"
        ]
      },
      {
        kind: "text",
        title: "Why Choose House for Sale Cleaning?",
        body: "A professionally presented home can:",
        items: [
          "Create a stronger first impression",
          "Improve online listing photos",
          "Enhance open inspection presentation",
          "Help attract more buyers",
          "Increase buyer confidence",
          "Potentially improve sale outcomes and reduce time on market"
        ]
      },
      {
        kind: "text",
        title: "Please Note",
        body: "Every property is different and sale preparation requirements vary depending on the property's condition, size and marketing strategy. Photos or an on-site inspection are usually required before providing an accurate quotation."
      }
    ],
    quote: true
  },

  "ndis": {
    icon: "access",
    name: "NDIS Cleaning Services",
    summary: "Plan aligned domestic support for NDIS participants.",
    rate: "$58.03 per hour",
    intro: [
      "Greenlight Cleaning provides professional household cleaning and domestic assistance services for NDIS participants, helping individuals maintain a safe, clean and comfortable living environment while supporting independence and wellbeing.",
      "We work with self-managed participants, plan-managed participants, support coordinators, families and carers to provide flexible and reliable support services tailored to individual needs."
    ],
    groups: [
      {
        title: "General Household Cleaning",
        items: [
          "Dusting all accessible surfaces",
          "Vacuuming carpets and rugs",
          "Mopping hard floors",
          "Cleaning skirting boards",
          "Cleaning light switches and power points",
          "Removing cobwebs",
          "Emptying rubbish bins"
        ]
      },
      {
        title: "Kitchen Cleaning",
        items: [
          "Cleaning benchtops and splashbacks",
          "Cleaning sinks and taps",
          "Cleaning stovetops",
          "Cleaning microwave interiors and exteriors",
          "Cleaning appliance exteriors",
          "Cleaning cupboard fronts and pantry areas"
        ]
      },
      {
        title: "Bathroom Cleaning",
        items: [
          "Cleaning and sanitising toilets",
          "Cleaning showers and shower screens",
          "Cleaning bathtubs",
          "Cleaning basins and vanities",
          "Cleaning mirrors",
          "Mopping bathroom floors",
          "Sanitising high-touch surfaces"
        ]
      },
      {
        title: "Bedroom and Living Area Cleaning",
        items: [
          "Dusting furniture and surfaces",
          "Vacuuming and mopping floors",
          "General tidying assistance",
          "Cleaning bedside tables and shelving"
        ]
      },
      {
        title: "Laundry Assistance",
        items: [
          "Washing clothes and linen",
          "Hanging washing to dry",
          "Folding clothes",
          "Putting away laundry",
          "Changing bed linen"
        ]
      },
      {
        title: "Additional Household Assistance",
        items: [
          "Dishwashing",
          "Kitchen tidying",
          "Household organisation assistance",
          "Maintaining a safe and tidy living environment"
        ]
      }
    ],
    chipsTitle: "Providers we work with",
    chips: NDIS_PROVIDERS,
    contentBlocks: [
      {
        kind: "text",
        title: "Service Options",
        items: [
          "Weekly services",
          "Fortnightly services",
          "Monthly services",
          "One-off cleaning services",
          "Additional support during recovery periods or hospital discharge"
        ]
      },
      {
        kind: "rates",
        title: "NDIS Pricing",
        intro: "Our domestic assistance services are charged in accordance with the current NDIS Pricing Arrangements and Price Limits under House Cleaning and Other Household Activities.",
        headers: ["Financial Year", "Hourly Rate", "GST"],
        rows: [
          ["2025-2026", "$58.03 per hour", "No GST"],
          ["Future Financial Years", "Subject to annual NDIA pricing updates", "Subject to applicable NDIS rules"]
        ],
        footnote: "NDIS pricing is reviewed annually and usually changes from 1 July each year."
      },
      {
        kind: "text",
        title: "Why Choose Greenlight Cleaning?",
        items: [
          "Experienced and reliable cleaning team",
          "Friendly and respectful staff",
          "Flexible scheduling options",
          "Public Liability Insurance",
          "Police checked staff",
          "Services tailored to participant goals and support needs",
          "Support Coordinators and Plan Managers welcome"
        ]
      }
    ]
  },

  "aged-care": {
    icon: "heart",
    name: "Aged Care Cleaning Services",
    summary: "Respectful, professional domestic support for older Australians living independently.",
    rate: "From $55 per hour",
    intro: [
      "Greenlight Cleaning provides reliable, respectful and professional cleaning and domestic assistance services for older Australians who wish to continue living safely, comfortably and independently in their own homes.",
      "We understand that maintaining a clean and organised home can become more difficult with age, reduced mobility or health conditions. Our experienced team provides personalised support tailored to each client's individual needs."
    ],
    introList: {
      title: "We welcome",
      items: [
        "Support at Home participants",
        "Commonwealth Home Support Programme (CHSP) participants",
        "Privately funded clients",
        "Family-arranged services",
        "Case managers and care coordinators"
      ]
    },
    groups: [
      {
        title: "General Household Cleaning",
        items: [
          "Dusting furniture and accessible surfaces",
          "Vacuuming carpets and rugs",
          "Mopping hard floors",
          "Cleaning skirting boards",
          "Cleaning light switches and power points",
          "Removing cobwebs",
          "Emptying rubbish bins"
        ]
      },
      {
        title: "Kitchen Cleaning",
        items: [
          "Cleaning kitchen benchtops and splashbacks",
          "Cleaning sinks and taps",
          "Cleaning stovetops",
          "Cleaning microwave interiors and exteriors",
          "Cleaning appliance exteriors",
          "Cleaning cupboard fronts and pantry areas"
        ]
      },
      {
        title: "Bathroom Cleaning",
        items: [
          "Cleaning and sanitising toilets",
          "Cleaning showers and shower screens",
          "Cleaning bathtubs",
          "Cleaning basins and vanities",
          "Cleaning mirrors",
          "Mopping bathroom floors",
          "Sanitising high-touch surfaces"
        ]
      },
      {
        title: "Bedroom and Living Areas",
        items: [
          "Dusting furniture and shelving",
          "Vacuuming and mopping floors",
          "Making beds",
          "Changing bed linen",
          "General tidying assistance"
        ]
      },
      {
        title: "Laundry Assistance",
        items: [
          "Washing clothes and linen",
          "Hanging washing to dry",
          "Folding clothes",
          "Putting away laundry",
          "Changing bedding and towels"
        ]
      },
      {
        title: "Additional Household Assistance",
        items: [
          "Dishwashing",
          "Kitchen tidying",
          "Household organisation assistance",
          "Maintaining a safe and tidy living environment"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Flexible Service Options",
        items: [
          "Weekly services",
          "Fortnightly services",
          "Monthly services",
          "One-off cleaning services",
          "Additional support following illness, surgery or hospital discharge"
        ]
      },
      {
        kind: "rates",
        title: "Hourly Rates",
        headers: ["Service Type", "Hourly Rate", "GST"],
        rows: [
          ["Government Funded Aged Care Services (Support at Home / CHSP)", "In accordance with individual provider agreements and funding arrangements", "Usually GST Free"],
          ["Private Aged Care Cleaning Services", "From $55 per hour", "GST may apply"],
          ["Deep Cleaning or Additional Services", "Quoted individually", "GST may apply"]
        ],
        footnote: "Please note that aged care pricing is not nationally fixed and may vary depending on funding arrangements, property size, service frequency and individual support requirements."
      },
      {
        kind: "text",
        title: "Why Choose Greenlight Cleaning?",
        items: [
          "Experienced and reliable cleaning team",
          "Friendly and respectful staff",
          "Police checked team members",
          "Fully insured business",
          "Flexible scheduling options",
          "Services tailored to individual needs",
          "Families, case managers and care coordinators welcome"
        ]
      }
    ]
  },

  "strata": {
    icon: "layers",
    name: "Strata & Common Area Cleaning",
    summary: "Scheduled cleaning for shared residential and commercial areas.",
    intro: [
      "Greenlight Cleaning provides reliable and professional strata and common area cleaning services for apartment buildings, townhouse complexes, body corporates, commercial buildings and managed properties.",
      "We understand that clean and well-maintained common areas create a positive first impression for residents, visitors and tenants while helping preserve the value and presentation of the property."
    ],
    introList: {
      title: "We work with",
      items: [
        "Owners Corporations",
        "Body Corporate Managers",
        "Property Managers",
        "Real Estate Agencies",
        "Commercial Building Managers",
        "Residential Apartment Complexes",
        "Townhouse Developments"
      ]
    },
    groups: [
      {
        title: "Entrance and Lobby Areas",
        items: [
          "Vacuuming and mopping floors",
          "Cleaning entrance doors and glass panels",
          "Cleaning intercom systems",
          "Dusting furniture and decorative items",
          "Cleaning reception areas and mailboxes",
          "Spot cleaning fingerprints and marks",
          "Cleaning skirting boards and corners"
        ]
      },
      {
        title: "Hallways and Corridors",
        items: [
          "Vacuuming carpeted hallways",
          "Sweeping and mopping hard floors",
          "Cleaning handrails and balustrades",
          "Dusting ledges and window sills",
          "Removing cobwebs",
          "Cleaning doors and door frames",
          "Cleaning lift lobby areas"
        ]
      },
      {
        title: "Lift Cleaning",
        items: [
          "Cleaning lift walls and mirrors",
          "Cleaning lift buttons and control panels",
          "Vacuuming or mopping lift floors",
          "Sanitising high-touch surfaces",
          "Removing fingerprints and smudges from stainless steel surfaces"
        ]
      },
      {
        title: "Stairwells",
        items: [
          "Sweeping staircases",
          "Vacuuming carpeted stairs",
          "Mopping hard surface stairs",
          "Cleaning handrails",
          "Dusting skirting boards and ledges",
          "Removing cobwebs"
        ]
      },
      {
        title: "Shared Kitchen and Amenities Areas",
        items: [
          "Cleaning benchtops and tables",
          "Cleaning sinks and taps",
          "Cleaning microwaves and appliances",
          "Emptying rubbish bins",
          "Sanitising high-touch surfaces"
        ]
      },
      {
        title: "Shared Bathroom Facilities",
        items: [
          "Cleaning and sanitising toilets",
          "Cleaning basins and mirrors",
          "Cleaning showers where applicable",
          "Refilling consumables if supplied by the client",
          "Mopping floors and sanitising touch points"
        ]
      },
      {
        title: "External Common Areas",
        items: [
          "Sweeping entry areas and pathways",
          "Sweeping courtyards and common outdoor spaces",
          "Removing cobwebs from external areas",
          "Cleaning outdoor furniture where required",
          "Cleaning shared balconies and terraces"
        ]
      },
      {
        title: "Bin Rooms and Waste Areas",
        items: [
          "Sweeping and mopping bin rooms",
          "Cleaning bin storage areas",
          "Removing spills and stains",
          "Deodorising waste areas",
          "Cleaning bin lids and external surfaces"
        ]
      },
      {
        title: "Car Parks and Garages",
        items: [
          "Sweeping car park areas",
          "Removing rubbish and debris",
          "Cobweb removal",
          "Cleaning access doors and common touch points"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Additional Services Available",
        items: [
          "Pressure washing",
          "High dusting",
          "Window cleaning",
          "Graffiti removal",
          "Emergency clean-ups",
          "Builders clean for common areas",
          "Carpet steam cleaning",
          "Floor scrubbing and machine polishing",
          "Garden and outdoor maintenance coordination"
        ]
      },
      {
        kind: "text",
        title: "Flexible Cleaning Schedules",
        body: "We offer:",
        items: [
          "Daily cleaning",
          "Multiple visits per week",
          "Weekly cleaning",
          "Fortnightly cleaning",
          "Monthly cleaning",
          "Custom maintenance schedules"
        ]
      },
      {
        kind: "text",
        title: "Why Choose Greenlight Cleaning?",
        items: [
          "Reliable and consistent service",
          "Fully insured business",
          "Police checked staff",
          "Detailed cleaning checklists",
          "Flexible scheduling options",
          "Experienced with strata and body corporate properties",
          "Regular communication with property managers and committees"
        ]
      },
      {
        kind: "text",
        body: "We understand the importance of maintaining clean, safe and welcoming common areas for residents, tenants and visitors."
      }
    ],
    quote: true
  }
};

const SERVICE_KEYS: string[] = Object.keys(SERVICES);

const AREAS: string[] = [
  "Bentleigh", "Bentleigh East", "Brighton", "Hampton", "Black Rock", "Sandringham",
  "Elwood", "St Kilda", "Middle Park", "Port Melbourne", "South Melbourne", "South Yarra",
  "Prahran", "Windsor", "Richmond", "Hawthorn", "Kew", "Camberwell", "Canterbury", "Balwyn",
  "Glen Iris", "Malvern", "Carnegie", "Murrumbeena", "Hughesdale", "Oakleigh", "Chadstone",
  "Mount Waverley", "Glen Waverley", "Doncaster", "Box Hill", "Clayton", "Springvale",
  "Noble Park", "Dandenong", "Keysborough", "Aspendale", "Cheltenham", "Moorabbin",
  "Caulfield", "Ormond", "McKinnon", "Toorak", "Fitzroy", "Thornbury", "Brunswick",
  "Carlton", "Melbourne CBD"
];

const STATS: { value: string; label: string }[] = [
  { value: "15+", label: "Years cleaning Melbourne" },
  { value: "48", label: "Suburbs serviced" },
  { value: "14", label: "Agencies approved" },
  { value: "18", label: "NDIS and care providers" }
];

const WHY_CHOOSE_US_REASONS = [
  { title: "Over 15 Years of Trusted Cleaning Experience", desc: "We've proudly provided professional cleaning services to Melbourne families for over 15 years, earning long-term relationships through quality workmanship and dependable service." },
  { title: "Transparent & Fair Pricing", desc: "We don't believe in charging every home the same fixed price. Every quotation is tailored to your home's actual cleaning requirements, ensuring you only pay for the cleaning your home genuinely needs." },
  { title: "No Extra Charges for Unused Rooms", desc: "If a spare bedroom hasn't been used for months or certain areas require very little attention, we won't charge you as though every room has been heavily used. Our pricing reflects the actual work required, making our service fair for every customer." },
  { title: "Fully Insured & Police Checked", desc: "Your home and belongings are important. Our team is fully insured, professionally trained and police checked for your peace of mind." },
  { title: "Reliable, Friendly & Professional Team", desc: "Our cleaners are punctual, respectful and committed to maintaining the highest cleaning standards on every visit." },
  { title: "Tailored Cleaning Plans", desc: "Whether you need weekly, fortnightly or monthly cleaning, we'll customise a cleaning schedule that suits your lifestyle, family and budget." },
  { title: "Premium Equipment & Professional Cleaning Products", desc: "We use professional-grade equipment and quality cleaning products to achieve consistently outstanding results." },
  { title: "100% Satisfaction Guarantee", desc: "If you're not completely satisfied with any cleaning-related area, simply let us know within 24 hours, and we'll return to rectify it free of charge." }
];

const CUSTOMER_PROMISES = [
  "Honest advice",
  "Fair pricing",
  "Reliable service",
  "Exceptional attention to detail",
  "Long-term customer relationships"
];

/* ============================================================
   STATE MACHINE (useReducer)
   ============================================================ */
const initialState: State = {
  currentRoute: "home",
  isMenuOpen: false,
  isChatOpen: false,
  activeServiceCategory: "regular-domestic"
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, currentRoute: action.route, isMenuOpen: false };
    case "OPEN_SERVICE":
      return { ...state, currentRoute: "service-detail", activeServiceCategory: action.key, isMenuOpen: false };
    case "SET_SERVICE":
      return { ...state, activeServiceCategory: action.key };
    case "TOGGLE_MENU":
      return { ...state, isMenuOpen: !state.isMenuOpen };
    case "CLOSE_MENU":
      return { ...state, isMenuOpen: false };
    case "TOGGLE_CHAT":
      return { ...state, isChatOpen: !state.isChatOpen };
    case "CLOSE_CHAT":
      return { ...state, isChatOpen: false };
    default:
      return state;
  }
}

/* ============================================================
   GLOBAL STYLES (Performance Optimization)
   Extracted from the render tree to prevent layout thrashing
   ============================================================ */
const GlobalStyles = memo(function GlobalStyles() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        html { scroll-behavior: smooth; }
        .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        /* Smooth animation curves with extended durations */
        @keyframes gl-fade-up { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .gl-reveal { 
          opacity: 0; 
        }
        .gl-reveal.gl-in { 
          animation: gl-fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        .gl-elevate { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease; }
        .gl-elevate:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 18px 40px -18px rgba(15,23,42,0.35); }
        .gl-cta { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, background-color 0.2s ease; }
        .gl-cta:hover { transform: translateY(-3px) scale(1.02); }

        .gl-hero-glow { position: absolute; inset: 0; background:
          radial-gradient(60% 60% at 80% 0%, rgba(16,185,129,0.22), transparent 60%),
          radial-gradient(50% 50% at 0% 100%, rgba(16,185,129,0.10), transparent 60%); }

        @keyframes gl-pulse { 0%,100% { box-shadow: 0 12px 30px -8px rgba(16,185,129,0.5), 0 0 0 0 rgba(16,185,129,0.45); } 50% { box-shadow: 0 12px 30px -8px rgba(16,185,129,0.5), 0 0 0 12px rgba(16,185,129,0); } }
        .gl-fab { animation: gl-pulse 2.6s infinite; transition: transform 0.2s ease; }
        .gl-fab:hover { transform: scale(1.06); }
        
        @keyframes gl-pop-in { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .gl-pop { animation: gl-pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes gl-fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .gl-fade-in { animation: gl-fade-in 0.6s ease-out both; }

        .gl-tap { min-height: 44px; }
        .gl-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .gl-noscroll::-webkit-scrollbar { display: none; }

        .gl-range::-webkit-slider-thumb { -webkit-appearance: none; width: 44px; height: 100%; cursor: ew-resize; }
        .gl-range::-moz-range-thumb { width: 44px; height: 100%; border: 0; background: transparent; cursor: ew-resize; }

        @media (prefers-reduced-motion: reduce) {
          .gl-reveal, .gl-reveal.gl-in, .gl-fab, .gl-pop, .gl-fade-in { animation: none !important; opacity: 1 !important; transform: none !important; }
          .gl-elevate, .gl-cta { transition: none !important; }
          html { scroll-behavior: auto; }
        }
      `
    }} />
  );
});

/* ============================================================
   MOTION PRIMITIVE
   Bypasses React state to directly manipulate DOM for performance
   ============================================================ */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("gl-in");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as any}
      className={`gl-reveal ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}

/* ============================================================
   LAYOUT HELPERS
   ============================================================ */
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function EmeraldButton({ href, onClick, children, className = "" }: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = `gl-cta gl-tap inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 ${className}`;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}

function OutlineButton({ href, onClick, children, dark = false, className = "" }: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  const tone = dark ? "border-white/25 text-white hover:bg-white/10" : "border-slate-300 text-slate-900 hover:bg-slate-100";
  const cls = `gl-cta gl-tap inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${tone} ${className}`;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </span>
  );
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function Navigation({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const links: NavLink[] = [
    { label: "Home", route: "home" },
    { label: "Services", route: "services" },
    { label: "Gallery", route: "gallery" },
    { label: "Service Areas", route: "areas" },
    { label: "About", route: "about" },
    { label: "Contact", route: "contact" }
  ];
  const go = (route: Route) => dispatch({ type: "NAVIGATE", route });
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <Container className="flex h-16 items-center justify-between lg:h-20">
        <button onClick={() => go("home")} className="gl-fade-in flex items-center gap-3 gl-tap">
          <img src="/logo.png" alt="Greenlight Cleaning Pty Ltd" className="h-10 w-auto" />
          <span className="text-xl font-extrabold tracking-tighter text-slate-900">Greenlight Cleaning</span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = state.currentRoute === l.route || (l.route === "services" && state.currentRoute === "service-detail");
            return (
              <button
                key={l.route}
                onClick={() => go(l.route)}
                className={`inline-flex items-center gl-tap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                {l.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <EmeraldButton href={TEL}>
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </EmeraldButton>
        </div>

        <button
          onClick={() => dispatch({ type: "TOGGLE_MENU" })}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-900 lg:hidden"
          aria-label="Toggle menu"
        >
          {state.isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {state.isMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((l) => (
              <button
                key={l.route}
                onClick={() => go(l.route)}
                className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {l.label}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
            <EmeraldButton href={TEL} className="mt-2 w-full">
              <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
            </EmeraldButton>
          </Container>
        </div>
      )}
    </header>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function QuickContactCluster() {
  const channels: { href: string; Icon: React.ElementType; label: string; accent: string }[] = [
    { href: WA, Icon: WhatsAppIcon, label: "WhatsApp", accent: "emerald" },
    { href: SMS, Icon: Smartphone, label: "Text", accent: "slate" },
    { href: MAILTO, Icon: Mail, label: "Email", accent: "slate" }
  ];
  return (
    <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
      <Reveal delay={0.05} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 backdrop-blur-sm">
        {channels.map((c, i) => (
          <a
            key={i}
            href={c.href}
            aria-label={`Contact us via ${c.label}`}
            title={`Contact us via ${c.label}`}
            className={`gl-tap flex h-9 w-9 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10 ${c.accent === "emerald" ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            <c.Icon className="h-4 w-4" />
          </a>
        ))}
      </Reveal>
    </div>
  );
}

function HeroSection({ dispatch }: { dispatch: Dispatch }) {
  const highlights: IconItem[] = [
    { icon: Shield, text: "Bond back focused end of lease cleans" },
    { icon: Accessibility, text: "NDIS and Aged Care provider ready" },
    { icon: Award, text: "Fully insured, agency approved teams" },
    { icon: MapPin, text: "Serving most of Southeast suburbs in Melbourne and part of North and west suburbs" }
  ];
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="gl-hero-glow" />
      <QuickContactCluster />
      <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-tight text-emerald-300">
              <Clock className="h-3.5 w-3.5" /> 15+ years in Melbourne
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Spotless homes and workplaces,
              <span className="text-emerald-400"> every single time.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Domestic, commercial, end of lease, NDIS and aged care cleaning across
              Melbourne. Transparent pricing, agency approved standards, and a team that
              shows up ready.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <EmeraldButton href={WA} className="text-base">
                <WhatsAppIcon className="h-5 w-5" /> Get a free quote
              </EmeraldButton>
              <OutlineButton href={TEL} dark className="text-base">
                <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
              </OutlineButton>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.2}>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-tight text-emerald-300">Why Greenlight</p>
              <div className="mt-5 grid gap-4">
                {highlights.map((h, i) => (
                  <Reveal key={i} delay={0.28 + i * 0.1} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                      <h.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-200">{h.text}</span>
                  </Reveal>
                ))}
              </div>
              <button
                onClick={() => dispatch({ type: "NAVIGATE", route: "services" })}
                className="gl-cta gl-tap mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                View all services <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   STATS BAND
   ============================================================ */
function StatsBand() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <Container className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={i} delay={i * 0.1} className="text-center">
            <div className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{s.label}</div>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}

/* ============================================================
   TRI CHANNEL CONTACT
   ============================================================ */
function TriChannelContact({ compact = false }: { compact?: boolean }) {
  const channels: { href: string; accent: string; Icon: React.ElementType; label: string; micro: string; action: string }[] = [
    {
      href: WA, accent: "emerald", Icon: WhatsAppIcon, label: "WhatsApp",
      micro: "Fastest for quotes. Send us your property photos and videos directly.",
      action: "Message us"
    },
    {
      href: SMS, accent: "slate", Icon: Smartphone, label: "Text message",
      micro: "Text us for an instant reply.", action: "Send a text"
    },
    {
      href: MAILTO, accent: "slate", Icon: Mail, label: "Email enquiry",
      micro: "Send your details and we will reply with a quote.", action: "Email us"
    }
  ];
  return (
    <section className={compact ? "" : "bg-white py-16 sm:py-20"}>
      <Container>
        {!compact && (
          <Reveal className="mb-10 max-w-2xl">
            <Eyebrow>Talk to us</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Three fast ways to reach Greenlight
            </h2>
          </Reveal>
        )}
        <div className="grid gap-5 md:grid-cols-3">
          {channels.map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <a
                href={c.href}
                className={`gl-elevate flex h-full flex-col rounded-2xl border p-6 ${c.accent === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.accent === "emerald" ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"}`}>
                  <c.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{c.label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.micro}</p>
                <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${c.accent === "emerald" ? "text-emerald-600" : "text-slate-900"}`}>
                  {c.action} <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   SERVICE GRID
   ============================================================ */
function ServiceCard({ k, dispatch, delay }: { k: string; dispatch: Dispatch; delay: number }) {
  const s = SERVICES[k];
  const Icon = ICONS[s.icon];
  return (
    <Reveal delay={delay}>
      <button
        onClick={() => dispatch({ type: "OPEN_SERVICE", key: k })}
        className="gl-elevate flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">{s.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          View details <ChevronRight className="h-4 w-4" />
        </span>
      </button>
    </Reveal>
  );
}

function ServiceGrid({ dispatch }: { dispatch: Dispatch }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {SERVICE_KEYS.map((k, i) => (
        <ServiceCard key={k} k={k} dispatch={dispatch} delay={(i % 3) * 0.1} />
      ))}
    </div>
  );
}

/* ============================================================
   DYNAMIC SERVICE VIEW
   ============================================================ */
function PricingTable({ pricing }: { pricing: Pricing }) {
  const isCarpet = pricing.type === "carpet";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-slate-900 text-white">
            {pricing.header.map((h, i) => (
              <th key={i} className={`px-4 py-3 font-semibold ${i === 0 ? "" : "text-right"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pricing.rows.map((row, i) => (
            <tr key={i} className={i % 2 ? "bg-slate-50" : "bg-white"}>
              <td className="px-4 py-3 font-medium text-slate-800">{row[0]}</td>
              <td className="px-4 py-3 text-right font-bold text-slate-900">{row[1]}</td>
              {isCarpet && <td className="px-4 py-3 text-right font-bold text-emerald-600">{row[2]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Prices shown are cash. Bank transfer or invoice adds 10 percent GST.
      </div>
    </div>
  );
}

function ContentBlockRenderer({ block, index }: { block: ContentBlock; index: number }) {
  const delay = Math.min(index * 0.05, 0.3);

  if (block.kind === "text") {
    return (
      <Reveal delay={delay} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {block.title && <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">{block.title}</h3>}
        {block.body && (
          <p className={`text-sm leading-relaxed text-slate-600 ${block.title ? "mt-3" : ""}`}>{block.body}</p>
        )}
        {block.items && (
          <ul className={`space-y-2.5 ${block.title || block.body ? "mt-4" : ""}`}>
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    );
  }

  if (block.kind === "extras") {
    return (
      <Reveal delay={delay} className="mt-8">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{block.title}</h3>
        {block.intro && block.intro.map((p, i) => (
          <p key={i} className="mt-2 text-sm leading-relaxed text-slate-600">{p}</p>
        ))}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {block.categories.map((cat, ci) => (
            <div key={ci} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900">{cat.title}</h4>
              <ul className="mt-3 space-y-2">
                {cat.items.map((it, ii) => (
                  <li key={ii} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700">{it[0]}</span>
                    <span className="whitespace-nowrap font-bold text-emerald-600">{it[1]}</span>
                  </li>
                ))}
              </ul>
              {cat.note && <p className="mt-3 text-xs leading-relaxed text-slate-500">{cat.note}</p>}
            </div>
          ))}
        </div>
      </Reveal>
    );
  }

  if (block.kind === "rates") {
    return (
      <Reveal delay={delay} className="mt-8">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{block.title}</h3>
        {block.intro && <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.intro}</p>}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 ? "bg-slate-50" : "bg-white"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 ${ci === 0 ? "font-medium text-slate-800" : "text-slate-600"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {block.footnote && <p className="mt-3 text-xs text-slate-500">{block.footnote}</p>}
      </Reveal>
    );
  }

  return null;
}

function DynamicServiceView({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const k = state.activeServiceCategory;
  const s = SERVICES[k];
  const Icon = ICONS[s.icon];
  const tabStripRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const strip = tabStripRef.current;
    const tab = activeTabRef.current;
    if (!strip || !tab) return;
    const stripRect = strip.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const delta = (tabRect.left + tabRect.width / 2) - (stripRect.left + stripRect.width / 2);
    strip.scrollTo({ left: strip.scrollLeft + delta, behavior: "smooth" });
  }, [k]);

  return (
    <section className="bg-white py-12 sm:py-16">
      <Container>
        <button
          onClick={() => dispatch({ type: "NAVIGATE", route: "services" })}
          className="mb-8 inline-flex items-center gap-1.5 gl-tap text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> All services
        </button>

        {/* Tab strip with mobile scroll affordance */}
        <div className="relative mb-10">
          <div ref={tabStripRef} className="gl-noscroll overflow-x-auto pb-1">
            <div className="flex gap-2">
              {SERVICE_KEYS.map((key) => {
                const active = key === k;
                return (
                  <button
                    key={key}
                    ref={active ? activeTabRef : null}
                    onClick={() => dispatch({ type: "SET_SERVICE", key })}
                    className={`inline-flex items-center gl-tap whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {SERVICES[key].name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* Header */}
        <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{s.name}</h1>
              <p className="mt-2 max-w-xl text-slate-600">{s.summary}</p>
            </div>
          </div>
          {s.rate && (
            <div className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
              <div className="text-xs font-bold uppercase tracking-tight text-emerald-600">Rate</div>
              <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">{s.rate}</div>
            </div>
          )}
        </Reveal>

        {/* Intro */}
        {s.intro && (
          <Reveal className="mt-6 max-w-3xl space-y-3">
            {s.intro.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-600 sm:text-base">{p}</p>
            ))}
          </Reveal>
        )}

        {/* Intro list: We welcome / We work with */}
        {s.introList && (
          <Reveal className="mt-5 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">{s.introList.title}</h3>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {s.introList.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* Scope groups */}
        <div className={`mt-10 grid gap-5 ${s.groups.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {s.groups.map((g, gi) => (
            <Reveal key={gi} delay={gi * 0.1} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">{g.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {g.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/* Exclusions */}
        {s.exclusions && (
          <Reveal className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">Not included as standard</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.exclusions.map((ex, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <X className="h-3.5 w-3.5 text-slate-400" /> {ex}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {/* Chips: agencies / providers / industries */}
        {s.chips && (
          <Reveal className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">{s.chipsTitle}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.chips.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> {c}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {/* Pricing */}
        {s.pricing && (
          <div className="mt-8">
            <Reveal>
              <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Pricing</h3>
              <PricingTable pricing={s.pricing} />
            </Reveal>
          </div>
        )}

        {/* Rich content blocks: bond back support, please note, categorised extras, rate tables, why choose, etc. */}
        {s.contentBlocks && s.contentBlocks.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} index={i} />
        ))}

        {/* Quote on inspection */}
        {s.quote && (
          <Reveal className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-semibold text-slate-900">Quoted on inspection</p>
            <p className="mt-1 text-sm text-slate-600">
              Send photos or videos of the space over WhatsApp for a fast, accurate quote.
            </p>
          </Reveal>
        )}

        {/* Note */}
        {s.note && (
          <Reveal className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <Star className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{s.note}</span>
          </Reveal>
        )}

        {/* CTA */}
        <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
          <EmeraldButton href={WA}>
            <WhatsAppIcon className="h-5 w-5" /> Quote for {s.name.toLowerCase()}
          </EmeraldButton>
          <OutlineButton href={TEL}>
            <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
          </OutlineButton>
        </Reveal>
      </Container>
    </section>
  );
}

/* ============================================================
   BEFORE / AFTER GALLERY
   ============================================================ */
function BeforeAfter({ title, sublabel, beforeImage, afterImage }: {
  title: string;
  sublabel: string;
  beforeImage: string;
  afterImage: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <Reveal>
      <figure className="gl-elevate overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-64 w-full select-none sm:h-72">
          {/* Before image (full) */}
          <div className="absolute inset-0 bg-slate-200">
            <img src={beforeImage} alt={`${title} before cleaning`} loading="lazy" draggable={false} className="h-full w-full object-cover" />
          </div>
          {/* After image clipped by the slider position */}
                      <div className="absolute inset-0 overflow-hidden bg-emerald-100" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <img src={afterImage} alt={`${title} after cleaning`} loading="lazy" draggable={false} className="h-full w-full object-cover" />
          </div>
          {/* Labels */}
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold uppercase tracking-tight text-white">Before</span>
          <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-tight text-white">After</span>
          {/* Divider + handle */}
          <div className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" style={{ left: `${pos}%` }}>
            <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-500 bg-white shadow-md">
              <span className="text-emerald-600">
                <ChevronRight className="-mr-1 inline h-3.5 w-3.5 rotate-180" />
                <ChevronRight className="-ml-1 inline h-3.5 w-3.5" />
              </span>
            </span>
          </div>
          {/* Range control */}
          <input
            type="range" min="0" max="100" value={pos}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPos(Number(e.target.value))}
            aria-label={`Reveal ${title} after cleaning`}
            className="gl-range absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <figcaption className="flex items-center justify-between px-5 py-4">
          <span className="text-sm font-bold tracking-tight text-slate-900">{title}</span>
          <span className="text-xs text-slate-500">{sublabel}</span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

function BeforeAfterGallery({ heading = true }: { heading?: boolean }) {
  const items = [
    { title: "Kitchen detail", sublabel: "Benchtops, splashback, cooktop", before: "/kitchen-before.jpg", after: "/kitchen-after.jpg" },
    { title: "Bathroom refresh", sublabel: "Showers, tiles, grout, basins", before: "/bathroom-before.jpg", after: "/bathroom-after.jpg" },
    { title: "Tile and grout cleaning", sublabel: "Hard floor restoration and stain removal", before: "/tiles-before.jpg", after: "/tiles-after.jpg" }
  ];
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <Container>
        {heading && (
          <Reveal className="mb-10 max-w-2xl">
            <Eyebrow>Results you can see</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Before and after</h2>
            <p className="mt-3 text-slate-600">Drag the slider on each panel to compare. Real photos can be dropped straight into these frames.</p>
          </Reveal>
        )}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <BeforeAfter key={i} title={it.title} sublabel={it.sublabel} beforeImage={it.before} afterImage={it.after} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   PAGE: HOME
   ============================================================ */
function HomePage({ dispatch }: { dispatch: Dispatch }) {
  return (
    <>
      <HeroSection dispatch={dispatch} />
      <StatsBand />
      
      {/* --- NEW CLIENT COPY SECTION --- */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow>Why Choose Us</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Why Choose Greenlight Cleaning?
            </h2>
            <p className="mt-4 text-lg font-bold text-slate-900">
              More Than Just a Cleaning Service: A Team You Can Trust
            </p>
            <p className="mt-2 text-slate-600">
              At Greenlight Cleaning, we believe that great cleaning is about more than simply making your home look tidy. It's about delivering reliable service, honest pricing and complete peace of mind every time we visit.
            </p>
          </Reveal>

          <div className="mt-12">
            <Reveal>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Why Melbourne Families Choose Us</h3>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {WHY_CHOOSE_US_REASONS.map((r, i) => (
                <Reveal key={i} delay={i * 0.05} className="gl-elevate rounded-2xl border border-slate-200 p-6 bg-white flex flex-col h-full">
                   <div className="flex items-start gap-3">
                     <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                     <div>
                       <h4 className="font-bold text-slate-900 leading-snug">{r.title}</h4>
                       <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.desc}</p>
                     </div>
                   </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="mt-12 rounded-3xl bg-slate-50 p-8 sm:p-10 border border-slate-100 text-center flex flex-col items-center">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Our Promise to Every Customer</h3>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto font-medium">
              We don't measure success by how many houses we clean each day.<br/>
              We measure success by how many customers continue to trust us year after year.
            </p>
            
            <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-xl">
               <p className="font-bold text-slate-900 mb-4 text-left">Our commitment is simple:</p>
               <ul className="grid sm:grid-cols-2 gap-3 text-left">
                 {CUSTOMER_PROMISES.map((p, i) => (
                   <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                     <Check className="h-4 w-4 text-emerald-500" /> {p}
                   </li>
                 ))}
               </ul>
            </div>
            
            <p className="mt-8 text-slate-600 max-w-2xl mx-auto">
              We believe professional cleaning should always be transparent, personalised and reasonably priced.<br/>
              With Greenlight Cleaning, you'll never pay for cleaning you don't need, you'll only pay for the cleaning your home actually requires.
            </p>
          </Reveal>

          <Reveal className="mt-12 flex flex-col items-center text-center">
             <h3 className="text-xl font-black tracking-tight text-slate-900">Request Your Free Quote Today</h3>
             <p className="mt-3 text-slate-600 max-w-2xl">
               Whether you're looking for regular home cleaning or simply want professional advice on the best cleaning schedule for your home, we're here to help. Contact Greenlight Cleaning today for a free, no-obligation quote and discover why so many Melbourne families trust us with their homes.
             </p>
             <div className="mt-6">
               <EmeraldButton href={WA} className="text-base shadow-emerald-500/20">
                 <WhatsAppIcon className="h-5 w-5" /> Request a free quote
               </EmeraldButton>
             </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20 border-t border-slate-100">
        <Container>
          <Reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>What we clean</Eyebrow>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Ten cleaning services, one trusted team</h2>
            </div>
            <button onClick={() => dispatch({ type: "NAVIGATE", route: "services" })} className="inline-flex items-center gap-1.5 gl-tap text-sm font-semibold text-emerald-600">
              See all services <ArrowRight className="h-4 w-4" />
            </button>
          </Reveal>
          <ServiceGrid dispatch={dispatch} />
        </Container>
      </section>
      <BeforeAfterGallery />
      <TriChannelContact />
      <CtaBand dispatch={dispatch} />
    </>
  );
}

/* ============================================================
   PAGE: SERVICES
   ============================================================ */
function ServicesPage({ dispatch }: { dispatch: Dispatch }) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <Container>
        <Reveal className="mb-10 max-w-2xl">
          <Eyebrow>Services</Eyebrow>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Cleaning for every space and standard</h1>
          <p className="mt-4 text-slate-600">From weekly domestic cleans to bond back end of lease work, NDIS support and strata maintenance. Select a service for full scope and pricing.</p>
        </Reveal>
        <ServiceGrid dispatch={dispatch} />
      </Container>
    </section>
  );
}

/* ============================================================
   PAGE: ABOUT
   ============================================================ */
function AboutPage({ dispatch }: { dispatch: Dispatch }) {
  const points: { icon: React.ElementType; title: string; body: string }[] = [
    { icon: Award, title: "15+ years experience", body: "A decade and a half cleaning Melbourne homes, offices and rentals." },
    { icon: Shield, title: "Fully insured", body: "Insured teams trained to consistent, repeatable standards." },
    { icon: KeyRound, title: "Agency approved", body: "Bond back cleans aligned to the requirements of 14 leading agencies." },
    { icon: Accessibility, title: "NDIS and aged care ready", body: "Plan aligned support and recognised provider relationships." },
    { icon: Tag, title: "Transparent pricing", body: "Clear cash rates published up front, GST applied only on invoice." },
    { icon: MapPin, title: "Local coverage", body: "Servicing suburbs across Melbourne's southeast, with coverage extending into the north and west." }
  ];
  return (
    <>
      <section className="bg-slate-900 py-16 text-white sm:py-20">
        <Container>
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-tight text-emerald-300">
              <Clock className="h-3.5 w-3.5" /> Since our first clean
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">A Melbourne cleaning company built on showing up</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              Greenlight Cleaning has spent more than fifteen years delivering consistent
              results for households, businesses, tenants and care clients. The work is
              simple: turn up on time, clean to a standard that holds up to inspection, and
              charge what we quote.
            </p>
          </Reveal>
        </Container>
      </section>
      <StatsBand />
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {points.map((p, i) => (
              <Reveal key={i} delay={(i % 3) * 0.1} className="gl-elevate rounded-2xl border border-slate-200 bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand dispatch={dispatch} />
    </>
  );
}

/* ============================================================
   PAGE: AREAS
   ============================================================ */
function AreasPage({ dispatch }: { dispatch: Dispatch }) {
  return (
    <>
      <section className="bg-white py-12 sm:py-16">
        <Container>
          <Reveal className="mb-10 max-w-2xl">
            <Eyebrow>Service areas</Eyebrow>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Cleaning across Southeast Melbourne, and into the North and West</h1>
            <p className="mt-4 text-slate-600">We cover most of Melbourne's southeast, with additional coverage across the north and west. If your suburb is on the list, we clean there.</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {AREAS.map((a, i) => (
              <Reveal key={a} delay={(i % 4) * 0.05}>
                <div className="gl-elevate flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{a}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand dispatch={dispatch} />
    </>
  );
}

/* ============================================================
   PAGE: CONTACT
   ============================================================ */
function ContactPage() {
  const details: { Icon: React.ElementType; label: string; value: string; href: string }[] = [
    { Icon: Phone, label: "Call", value: PHONE_DISPLAY, href: TEL },
    { Icon: Mail, label: "Email", value: EMAIL, href: MAILTO },
    { Icon: WhatsAppIcon, label: "WhatsApp", value: "Send photos for a quote", href: WA }
  ];
  return (
    <section className="bg-white py-12 sm:py-16">
      <Container>
        <Reveal className="mb-10 max-w-2xl">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Get a quote today</h1>
          <p className="mt-4 text-slate-600">The fastest way to an accurate quote is a WhatsApp message with photos or a short video of the space.</p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {details.map((d, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <a href={d.href} className="gl-elevate flex h-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <d.Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-tight text-slate-500">{d.label}</span>
                  <span className="mt-0.5 block text-base font-bold tracking-tight text-slate-900">{d.value}</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <TriChannelContact compact />
        </div>

        <Reveal className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          Prices listed across the site are cash. Bank transfer or tax invoice adds 10 percent GST.
        </Reveal>
      </Container>
    </section>
  );
}

/* ============================================================
   CTA BAND
   ============================================================ */
function CtaBand({ dispatch }: { dispatch: Dispatch }) {
  return (
    <section className="bg-slate-900 py-16 text-white sm:py-20">
      <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <Reveal className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready for a spotless space?</h2>
          <p className="mt-3 text-slate-300">Send photos over WhatsApp or call now. Quotes are fast and pricing is transparent.</p>
        </Reveal>
        <Reveal delay={0.1} className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <EmeraldButton href={WA}><WhatsAppIcon className="h-5 w-5" /> Get a quote</EmeraldButton>
          <OutlineButton href={TEL} dark><Phone className="h-4 w-4" /> {PHONE_DISPLAY}</OutlineButton>
        </Reveal>
      </Container>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ dispatch }: { dispatch: Dispatch }) {
  const quick: NavLink[] = [
    { label: "Home", route: "home" },
    { label: "Services", route: "services" },
    { label: "Gallery", route: "gallery" },
    { label: "Service Areas", route: "areas" },
    { label: "About", route: "about" },
    { label: "Contact", route: "contact" }
  ];
  return (
    <footer className="bg-slate-900 text-slate-300">
      <Container className="grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Greenlight Cleaning" className="h-9 w-auto" />
            <span className="text-lg font-black tracking-tight text-white">Greenlight Cleaning</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Domestic, commercial, end of lease, NDIS and aged care cleaning across Melbourne.
            15+ years of consistent, agency approved results.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a href={TEL} className="flex items-center gap-2.5 hover:text-white"><Phone className="h-4 w-4 text-emerald-400" /> {PHONE_DISPLAY}</a>
            <a href={MAILTO} className="flex items-center gap-2.5 hover:text-white"><Mail className="h-4 w-4 text-emerald-400" /> {EMAIL}</a>
            <a href={WA} className="flex items-center gap-2.5 hover:text-white"><WhatsAppIcon className="h-4 w-4 text-emerald-400" /> WhatsApp us</a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-sm font-bold uppercase tracking-tight text-white">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quick.map((q) => (
              <li key={q.route}>
                <button onClick={() => dispatch({ type: "NAVIGATE", route: q.route })} className="inline-flex items-center gl-tap text-slate-400 hover:text-white">{q.label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="text-sm font-bold uppercase tracking-tight text-white">Services</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICE_KEYS.map((k) => (
              <li key={k}>
                <button onClick={() => dispatch({ type: "OPEN_SERVICE", key: k })} className="inline-flex items-center gl-tap text-left text-slate-400 hover:text-white">{SERVICES[k].name}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="text-sm font-bold uppercase tracking-tight text-white">Service areas</h4>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {AREAS.map((a) => (
              <span key={a} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">{a}</span>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Greenlight Cleaning Pty Ltd. All rights reserved.</span>
          <span>Listed prices are cash. Bank transfer or invoice adds 10 percent GST.</span>
        </Container>
      </div>
    </footer>
  );
}

/* ============================================================
   FLOATING ACTION MENU (Tri channel)
   ============================================================ */
function FloatingActionMenu({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const channels: { href: string; Icon: React.ElementType; label: string; micro: string; accent: string }[] = [
    { href: WA, Icon: WhatsAppIcon, label: "WhatsApp", micro: "Fastest for quotes: Send us your property photos/videos directly.", accent: "emerald" },
    { href: SMS, Icon: Smartphone, label: "Direct SMS", micro: "Text us for an instant reply.", accent: "slate" },
    { href: MAILTO, Icon: Mail, label: "Email enquiry", micro: "Send your details and we will reply with a quote.", accent: "slate" }
  ];
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {state.isChatOpen && (
        <div className="gl-pop w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
            <span className="text-sm font-bold tracking-tight text-white">Contact Greenlight</span>
            <button onClick={() => dispatch({ type: "CLOSE_CHAT" })} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col p-3">
            {channels.map((c, i) => (
              <a key={i} href={c.href} className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.accent === "emerald" ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"}`}>
                  <c.Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold tracking-tight text-slate-900">{c.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">{c.micro}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => dispatch({ type: "TOGGLE_CHAT" })}
        className="gl-fab flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/40"
        aria-label="Open contact menu"
      >
        {state.isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}

/* ============================================================
   JSON-LD (LocalBusiness) for SEO when deployed
   ============================================================ */
function SeoSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HousecleaningService",
    name: "Greenlight Cleaning Pty Ltd",
    telephone: "+61430230971",
    email: EMAIL,
    priceRange: "$$",
    areaServed: AREAS.map((a) => ({ "@type": "City", name: a + ", Melbourne VIC" })),
    address: { "@type": "PostalAddress", addressRegion: "VIC", addressCountry: "AU", addressLocality: "Melbourne" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning services",
      itemListElement: SERVICE_KEYS.map((k) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: SERVICES[k].name } }))
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentRoute, state.activeServiceCategory]);

  const renderRoute = () => {
    switch (state.currentRoute) {
      case "home": return <HomePage dispatch={dispatch} />;
      case "services": return <ServicesPage dispatch={dispatch} />;
      case "service-detail": return <DynamicServiceView state={state} dispatch={dispatch} />;
      case "gallery": return <BeforeAfterGallery />;
      case "areas": return <AreasPage dispatch={dispatch} />;
      case "about": return <AboutPage dispatch={dispatch} />;
      case "contact": return <ContactPage />;
      default: return <HomePage dispatch={dispatch} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <GlobalStyles />
      <SeoSchema />
      <Navigation state={state} dispatch={dispatch} />
      <main>{renderRoute()}</main>
      <Footer dispatch={dispatch} />
      <FloatingActionMenu state={state} dispatch={dispatch} />
    </div>
  );
}
