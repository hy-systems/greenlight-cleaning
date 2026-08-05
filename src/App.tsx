import React, { useReducer, useState, useEffect, useRef, memo } from "react";
import {
  BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams, Navigate
} from "react-router-dom";
import {
  Menu, X, Phone, Mail, MessageCircle, MapPin, Check, CheckCircle2, Star,
  Shield, ArrowRight, ChevronRight, Clock, Award, ArrowLeft,
  Home, Building2, KeyRound, Truck, Paintbrush2, Hammer, Tag,
  HeartHandshake, Accessibility, Layers, Smartphone, BedDouble, ChevronDown, Sparkles, PanelTop
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

interface State {
  isMenuOpen: boolean;
  isChatOpen: boolean;
}

type Action =
  | { type: "TOGGLE_MENU" }
  | { type: "CLOSE_MENU" }
  | { type: "TOGGLE_CHAT" }
  | { type: "CLOSE_CHAT" };

type Dispatch = React.Dispatch<Action>;

interface NavLink { label: string; path: string; }
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
  heart: HeartHandshake, layers: Layers, bed: BedDouble, sparkle: Sparkles, window: PanelTop
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
  },

  "airbnb-short-term-rental": {
    icon: "bed",
    name: "Airbnb & Short-Term Rental Cleaning",
    summary: "Professional Airbnb turnover cleaning built around five-star guest presentation, not just a standard clean.",
    intro: [
      "Delivering a five-star guest experience starts with a perfectly prepared property. We provide comprehensive Airbnb turnover services that go beyond standard cleaning, helping hosts present their properties to the highest standard while saving valuable time between guest bookings.",
      "Whether you manage one property or multiple short-term rentals, our experienced team ensures your home is clean, guest-ready and professionally presented before every check-in."
    ],
    groups: [
      {
        title: "General Cleaning",
        items: [
          "Vacuuming and mopping all floors",
          "Thorough bathroom cleaning and sanitising",
          "Kitchen cleaning, including benchtops, sink, splashback and cooktop",
          "Exterior cleaning of kitchen appliances",
          "Dusting all reachable surfaces",
          "Cleaning mirrors and glass surfaces",
          "Emptying rubbish bins and replacing liners",
          "Spot cleaning doors, light switches and marks where required",
          "Removing cobwebs",
          "Final presentation inspection"
        ]
      },
      {
        title: "Bed Making & Linen Change",
        items: [
          "Strip used bed linen",
          "Replace beds with fresh linen",
          "Make beds to hotel presentation standards",
          "Arrange pillows and bedding professionally"
        ]
      },
      {
        title: "Guest-Ready Final Checklist",
        items: [
          "Beds professionally made",
          "Bathrooms fully prepared",
          "Kitchen clean and ready for use",
          "Floors vacuumed and mopped",
          "Rubbish removed",
          "Property presentation checked",
          "Lights switched off where appropriate",
          "Doors and windows secured",
          "Air conditioning set as requested",
          "Essential guest supplies checked"
        ]
      }
    ],
    introList: {
      title: "Property inspection covers",
      items: [
        "Accidental guest damage",
        "Broken furniture or appliances",
        "Missing items",
        "Excessive stains or unusual mess",
        "Safety concerns",
        "General wear and tear"
      ]
    },
    contentBlocks: [
      {
        kind: "text",
        title: "Linen Laundry & Rotation Service (Optional Extra)",
        body: "Take the hassle out of managing Airbnb laundry. Our optional linen rotation service includes:",
        items: [
          "Collecting used sheets, pillowcases and towels",
          "Professionally washing all linen off-site",
          "Drying and folding linen",
          "Preparing fresh linen for your next booking",
          "Delivering clean linen during your next scheduled service",
          "Removing used linen after every turnover to be professionally cleaned and prepared for the following guest"
        ]
      },
      {
        kind: "text",
        title: "Property Inspection & Host Support",
        body: "Cleaning is only part of preparing an Airbnb property. Before every clean, our team carries out a visual property inspection to identify any issues left by previous guests. If any damage or concerns are found, we'll notify you promptly so you can decide whether to request reimbursement through Airbnb or arrange repairs before your next guest arrives."
      },
      {
        kind: "text",
        title: "Photo Reports After Every Visit",
        body: "After completing the clean, we provide photo updates to give you confidence that your property is fully prepared, including:",
        items: [
          "Photos of completed cleaning",
          "Photos of any damage or maintenance concerns",
          "Confirmation that the property is guest-ready",
          "General condition updates where required"
        ]
      },
      {
        kind: "text",
        title: "Host Supply Monitoring",
        body: "We monitor essential guest supplies during every visit and let you know if anything needs replenishing, including:",
        items: [
          "Toilet paper and paper towels",
          "Hand soap, shampoo & conditioner, body wash",
          "Dishwashing liquid",
          "Bin liners",
          "Coffee, tea or welcome amenities",
          "Cleaning supplies",
          "Any other host-provided essentials"
        ]
      },
      {
        kind: "text",
        title: "Maintenance Reporting",
        body: "If we identify maintenance issues while cleaning, we'll let you know immediately, including:",
        items: [
          "Water leaks",
          "Broken lights",
          "Appliance faults",
          "Loose door handles",
          "Damaged furniture",
          "Mould or moisture issues",
          "Air-conditioning problems",
          "General maintenance concerns"
        ]
      },
      {
        kind: "rates",
        title: "Changeover Cleaning Rates",
        intro: "Priced by property size and the number of bedrooms actually used by guests, not the total bedrooms in the property.",
        headers: ["Property", "1 Bed", "2 Beds", "3 Beds", "4 Beds", "5 Beds"],
        rows: [
          ["3 Bed / 1 Bath", "$180", "$230", "$280", "—", "—"],
          ["3 Bed / 2 Bath", "$200", "$250", "$300", "—", "—"],
          ["4 Bed / 2 Bath", "$220", "$270", "$320", "$370", "—"],
          ["4 Bed / 3 Bath", "$240", "$290", "$340", "$390", "—"],
          ["5 Bed / 2 Bath", "$250", "$300", "$350", "$400", "$450"],
          ["5 Bed / 3 Bath", "$270", "$320", "$370", "$420", "$470"]
        ],
        footnote: "Base price includes linen service for the first occupied bedroom. Add $50 per additional occupied bedroom needing linen changed. Linen laundry & rotation is charged separately from the standard cleaning fee."
      },
      {
        kind: "text",
        title: "Optional Extras",
        items: [
          "Inside oven cleaning",
          "Inside refrigerator cleaning",
          "Window cleaning",
          "Balcony or outdoor area cleaning",
          "Deep cleaning",
          "Additional linen changes",
          "Restocking guest amenities",
          "Interior cupboard cleaning",
          "Garage or storage area cleaning",
          "Same-day emergency turnover — priced on application"
        ]
      },
      {
        kind: "text",
        title: "Why Choose Greenlight Cleaning?",
        items: [
          "Reliable Airbnb turnover specialists",
          "Professional and fully insured cleaners",
          "Hotel-quality presentation standards",
          "Optional off-site linen washing and rotation",
          "Property inspections before every clean",
          "Photo reports after every visit",
          "Damage and maintenance reporting",
          "Host supply monitoring",
          "Flexible scheduling between bookings",
          "Helping hosts achieve better guest reviews and repeat bookings"
        ]
      }
    ],
    note: "Pricing is based on the number of bedrooms actually occupied by guests, not the total bedrooms in the property. Base price includes linen service for the first occupied bedroom, plus $50 per additional occupied bedroom needing linen changed. Linen washing, drying and collection is available as an optional add-on, arranged and priced separately from the standard clean.",
    quote: false
  },

  "deep-cleaning": {
    icon: "sparkle",
    name: "Deep Cleaning",
    summary: "A thorough top-to-bottom clean for homes that need more than a standard visit.",
    intro: [
      "Deep cleaning goes further than a regular clean, reaching the buildup that accumulates over months rather than days. It's the right choice before a big event, after a long stretch without a proper clean, as a seasonal reset, or simply when a home needs to be brought back up to a genuinely spotless standard.",
      "This service covers everything included in a standard clean, then goes further into the detail work: skirting boards, inside appliances, built-up grime in kitchens and bathrooms, and the areas that get missed week to week."
    ],
    groups: [
      {
        title: "Kitchen Deep Clean",
        items: [
          "Interior oven cleaning",
          "Rangehood and filter degreasing",
          "Inside microwave, front to back",
          "Cupboard fronts and handles, degreased",
          "Splashback and grout detailing",
          "Inside fridge cleaning (on request)",
          "Skirting boards and floor edges"
        ]
      },
      {
        title: "Bathroom Deep Clean",
        items: [
          "Grout and tile detailing",
          "Descaling shower screens and taps",
          "Behind and around toilets",
          "Exhaust fan cleaning",
          "Cabinet interiors wiped down",
          "Mould treatment on sealant and tile lines"
        ]
      },
      {
        title: "Whole-Home Detail Work",
        items: [
          "Skirting boards throughout",
          "Light switches and power points",
          "Door frames and handles",
          "Window sills and tracks",
          "Ceiling fans and light fittings",
          "Behind and under furniture where accessible",
          "Cobwebs from all corners and ceilings"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Optional Add-Ons",
        items: [
          "Interior windows and glass doors",
          "Blind cleaning",
          "Wall mark removal",
          "Carpet steam cleaning",
          "Balcony and outdoor area detailing"
        ]
      },
      {
        kind: "text",
        title: "When to Book a Deep Clean",
        body: "A deep clean is worth booking:",
        items: [
          "Before hosting a big event or family gathering",
          "As a seasonal reset, typically once or twice a year",
          "After renovation dust has settled but before the builders clean",
          "When starting a new regular cleaning arrangement with us",
          "Any time a home simply needs more than a standard visit can cover"
        ]
      }
    ],
    note: "Deep cleans are quoted based on property size and current condition. Send photos over WhatsApp for a fast, accurate quote.",
    quote: true
  },

  "window-cleaning": {
    icon: "window",
    name: "Window Cleaning",
    summary: "Streak-free interior and accessible exterior window cleaning.",
    intro: [
      "Clean windows change how a whole home looks and feels, letting in more light and giving every room a sharper, brighter finish. We clean interior glass as standard, with accessible exterior windows, tracks and sills included where they can be reached safely.",
      "This service is available as a standalone booking or bundled with any of our other cleaning services, and is a popular add-on for pre-sale presentation, end of lease cleans and regular seasonal upkeep."
    ],
    groups: [
      {
        title: "Standard Scope",
        items: [
          "Interior glass cleaning, streak-free finish",
          "Accessible exterior glass cleaning",
          "Window sills wiped down",
          "Window tracks cleaned of dust and debris",
          "Flyscreens wiped where fitted",
          "Glass doors and sliding door tracks"
        ]
      },
      {
        title: "Not Included as Standard",
        items: [
          "High or second-storey exterior windows requiring specialised access equipment",
          "Security screens requiring removal",
          "Heavily soiled windows from construction or long-term neglect (quoted separately)"
        ]
      }
    ],
    contentBlocks: [
      {
        kind: "text",
        title: "Good to Know",
        items: [
          "Exterior windows are only cleaned where they can be accessed safely from ground level or a standard ladder.",
          "High windows, balcony glass with restricted access, or heavily soiled exteriors may require a specialised quote.",
          "Can be booked as a standalone service or added to any regular, end of lease, deep clean or house-for-sale booking."
        ]
      }
    ],
    note: "Pricing depends on the number of windows, property size and accessibility. Send photos or your property details over WhatsApp for an accurate quote.",
    quote: true
  }
};

const SERVICE_KEYS: string[] = Object.keys(SERVICES);

/* ============================================================
   SUBURB LANDING PAGE DATA
   ============================================================ */
interface SuburbFAQ {
  question: string;
  answer: string;
}

interface SuburbPage {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  servicesOffered: string[];
  whyLocalsChooseUs: string[];
  propertyTypes: string[];
  streetsAndLandmarks: string[];
  localCleaningNeeds: string;
  faq: SuburbFAQ[];
  nearbySuburbs: string[];
}

const SUBURBS: Record<string, SuburbPage> = {
  brighton: {
    slug: "brighton",
    name: "Brighton",
    metaTitle: "Cleaning Services Brighton | Greenlight Cleaning",
    metaDescription: "Domestic, end of lease and Airbnb cleaning across Brighton. Local team experienced with bayside homes, apartments and premium finishes.",
    h1: "Professional Cleaning Services in Brighton",
    intro: [
      "Brighton's mix of grand bayside homes, apartments and short-stay properties means no two cleans look quite the same. A weatherboard on Were Street needs a different touch to a glass-fronted apartment near Middle Brighton Station, and we plan every job around the property in front of us rather than a one-size checklist.",
      "We service homeowners along Church Street and Bay Street, families near Elsternwick Park, and hosts running short-stay properties close to Dendy Beach and Brighton Baths. Whether it's a weekly domestic clean, a pre-sale presentation, an end of lease clean, or a same-day guest turnover, our team turns up on time and works to the standard the property deserves."
    ],
    servicesOffered: ["regular-domestic", "house-for-sale", "end-of-lease", "airbnb-short-term-rental"],
    whyLocalsChooseUs: [
      "Local team familiar with the streets between North Brighton and South Road",
      "Experience cleaning premium finishes without damaging stone, timber or glass",
      "Flexible scheduling around beach season and holiday-let turnovers",
      "Same checklist standard whether it's a weekly clean or a one-off deep clean",
      "Comfortable working in occupied family homes and vacant properties alike"
    ],
    propertyTypes: ["Beachside family homes", "Premium residences", "Apartments", "Townhouses", "Short-stay and Airbnb properties"],
    streetsAndLandmarks: ["Church Street", "Bay Street", "Beach Road", "New Street", "St Kilda Street", "North Road", "South Road", "Dendy Street", "Were Street", "Martin Street", "Brighton Beach", "Dendy Beach", "Brighton Baths", "Middle Brighton Station", "North Brighton Station", "Elsternwick Park", "Brighton Grammar", "Firbank Grammar"],
    localCleaningNeeds: "Bayside living brings its own maintenance headaches. Salt air off Port Phillip Bay leaves a residue on glass, balcony railings and metal fittings that builds up faster than most homeowners expect, and beach visits track sand into entryways and living areas most weekends. The humidity that comes with coastal exposure also raises mould risk in bathrooms and window tracks if it's not kept on top of. Brighton's premium stone benchtops and timber floors need non-abrasive products applied properly, not a generic all-purpose spray, so we adjust our approach property by property rather than treating every surface the same.",
    faq: [
      { question: "Do you clean short-stay and Airbnb properties in Brighton?", answer: "Yes. We run guest changeover cleans between bookings for hosts near the beach and the Church Street and Bay Street precincts, with same-day turnaround where needed. See our Airbnb & short-term rental cleaning page for full pricing." },
      { question: "Can you manage salt residue and sand tracked in from the beach?", answer: "Yes, this is one of the most common requests we get in Brighton. We focus extra attention on glass, balcony fittings and entryways where salt film and sand tend to build up fastest." },
      { question: "Do you bring your own cleaning products and equipment?", answer: "Yes, our team arrives fully equipped. If a property has specific product requirements for premium stone or timber surfaces, let us know in advance and we'll accommodate it." },
      { question: "Can you clean an occupied family home rather than a vacant property?", answer: "Yes, most of our Brighton work is regular domestic cleaning in occupied homes. We work around your schedule and can set up a recurring weekly or fortnightly visit." },
      { question: "Do you offer end of lease cleaning for Brighton rentals and apartments?", answer: "Yes, our end of lease service is bond-back focused and covers apartments and houses across Brighton, including properties near Middle Brighton and North Brighton stations." },
      { question: "How far in advance should I book for a beach-season weekend turnover?", answer: "Beach season books out fastest, so for Friday or Saturday turnovers we'd recommend locking in your booking at least a few days ahead where possible." }
    ],
    nearbySuburbs: ["Hampton", "Brighton East", "Elwood", "Sandringham", "Bentleigh", "Bentleigh East"]
  },

  hampton: {
    slug: "hampton",
    name: "Hampton",
    metaTitle: "Cleaning Services Hampton | Greenlight Cleaning",
    metaDescription: "House cleaning, end of lease and regular domestic services for Hampton families, near Hampton Street village and Hampton Beach.",
    h1: "Professional Cleaning Services in Hampton",
    intro: [
      "Hampton runs at a family pace. Between school pickups, the Hampton Street shopping strip and weekend trips down to the beach, cleaning is usually the thing that gets pushed to the bottom of the list, which is exactly the gap we fill for busy households around Ludstone Street, Thomas Street and the wider Hampton Street village.",
      "Our team covers Californian bungalows, modern townhouses and beachside apartments across the suburb, from streets near Boss James Reserve through to homes closer to Bluff Road. Regular domestic cleaning is our most requested service here, alongside end of lease cleans for renters moving in or out of the area."
    ],
    servicesOffered: ["regular-domestic", "end-of-lease", "house-for-sale"],
    whyLocalsChooseUs: [
      "Built around the routines of busy families near the Hampton Street village",
      "Reliable recurring bookings that fit school-run and work schedules",
      "Experience with both older Californian bungalows and newer townhouse builds",
      "Straightforward pricing with no surprise add-ons for a standard clean",
      "Comfortable working around kids, pets and everyday household activity"
    ],
    propertyTypes: ["Californian bungalows", "Modern townhouses", "Beachside apartments", "Family homes"],
    streetsAndLandmarks: ["Hampton Street", "Beach Road", "Bluff Road", "South Road", "Ludstone Street", "Thomas Street", "Orlando Street", "Linacre Road", "Willis Street", "Hampton Beach", "Hampton Railway Station", "Hampton Primary School", "Boss James Reserve", "Castlefield Reserve"],
    localCleaningNeeds: "Living close to Hampton Beach means the same coastal challenges as anywhere along this stretch of bay, salt film on windows and railings, sand carried in after a walk along the foreshore, and bathrooms that need regular attention to keep humidity-driven mould from taking hold. What sets Hampton apart from its neighbours is the volume of family life packed into a small area, school bags dropped by the door, sports gear tracked through hallways, and a shopping village that keeps the whole suburb busy on weekends. Our cleans are built around that rhythm rather than an empty showroom.",
    faq: [
      { question: "Do you offer regular weekly or fortnightly cleaning in Hampton?", answer: "Yes, recurring domestic cleaning is our most common booking type in Hampton, and we can set a schedule that fits around school runs and work hours." },
      { question: "Can you work around kids and pets being home during the clean?", answer: "Yes, most of our Hampton clients are in occupied family homes and our team is used to working around everyday household activity without disrupting your day." },
      { question: "Do you clean properties near the Hampton Street shops?", answer: "Yes, we regularly service homes and apartments in and around the Hampton Street village, including streets like Ludstone and Thomas." },
      { question: "Is end of lease cleaning available for Hampton rentals?", answer: "Yes, our end of lease service is aimed at getting your bond back and covers houses, townhouses and apartments across Hampton." },
      { question: "Do you handle sand and salt buildup from beach visits?", answer: "Yes, given how close most of Hampton sits to the beach, we pay particular attention to entryways, floors and window sills where sand and salt residue collect." },
      { question: "How do I book a one-off clean before an inspection or open house?", answer: "Get in touch through our contact form or WhatsApp and let us know the property size and the date you need it done by, and we'll confirm availability." }
    ],
    nearbySuburbs: ["Brighton", "Sandringham", "Black Rock", "Highett"]
  },

  camberwell: {
    slug: "camberwell",
    name: "Camberwell",
    metaTitle: "Cleaning Services Camberwell | Greenlight Cleaning",
    metaDescription: "Heritage-aware house cleaning and end of lease services in Camberwell, covering period homes near Camberwell Junction and Burke Road.",
    h1: "Professional Cleaning Services in Camberwell",
    intro: [
      "Period homes with decorative ceilings, original timber floors and ornate cornices are the norm rather than the exception around Camberwell Junction, and cleaning them well means knowing which products to avoid as much as which ones to use. That's the reputation we've built with homeowners along Prospect Hill Road, Trafalgar Road and the streets fanning out from the Junction.",
      "From Burke Road through to Wattle Valley Road, we clean everything from grand heritage residences to more modest Californian bungalows, working with families who've been in the area for decades and newer arrivals drawn to the tree-lined streets, the shopping precinct and the Rivoli Cinemas end of town."
    ],
    servicesOffered: ["regular-domestic", "house-for-sale", "end-of-lease"],
    whyLocalsChooseUs: [
      "Experienced with heritage features like ornate cornices and original timber flooring",
      "Careful, non-abrasive approach on decorative ceilings and period detailing",
      "Familiar with the seasonal leaf and pollen buildup around Camberwell's tree-lined streets",
      "Trusted by families near Camberwell High School and Canterbury Girls' for reliable scheduling",
      "Presentation-focused cleans for homes going on the market near the Junction"
    ],
    propertyTypes: ["Period homes", "Heritage residences", "Californian bungalows", "Large family homes"],
    streetsAndLandmarks: ["Burke Road", "Camberwell Road", "Riversdale Road", "Prospect Hill Road", "Trafalgar Road", "Highfield Road", "Wattle Valley Road", "Camberwell Junction", "Camberwell Railway Station", "Rivoli Cinemas", "Canterbury Girls' Secondary College", "Camberwell High School", "Siena College"],
    localCleaningNeeds: "The mature trees that give Camberwell's streets their character also mean a genuine seasonal workload, particularly through autumn when leaf litter and pollen collect around entrances, verandahs and window tracks faster than most residents can keep up with on their own. Inside, the same period features that make these homes desirable, decorative ceilings, original cornices, polished timber floors, need a gentler hand than a standard clean. We use non-abrasive methods on these surfaces so the heritage detailing stays intact rather than dulled or scratched over time.",
    faq: [
      { question: "Do you know how to clean older heritage homes without damaging original features?", answer: "Yes, we regularly work in period homes around Camberwell Junction and use non-abrasive methods on decorative ceilings, cornices and original timber flooring." },
      { question: "Can you help with autumn leaf and pollen buildup around entrances?", answer: "Yes, this is a genuine seasonal issue on Camberwell's tree-lined streets, and we factor extra time into entryway and verandah cleaning during autumn and spring where needed." },
      { question: "Do you offer presentation cleaning for homes going up for sale near the Junction?", answer: "Yes, our house-for-sale service is built to get a property looking its best for open inspections, including homes with heritage features that need careful handling." },
      { question: "Is regular domestic cleaning available for busy Camberwell families?", answer: "Yes, we offer weekly and fortnightly domestic cleaning for households near Camberwell High School, Canterbury Girls' and the surrounding streets." },
      { question: "Do you provide end of lease cleaning for period apartments and houses?", answer: "Yes, our end of lease clean is bond-back focused and suited to both period conversions and standard rental properties across Camberwell." }
    ],
    nearbySuburbs: ["Canterbury", "Hawthorn East", "Surrey Hills", "Glen Iris", "Balwyn"]
  },

  malvern: {
    slug: "malvern",
    name: "Malvern",
    metaTitle: "Cleaning Services Malvern | Greenlight Cleaning",
    metaDescription: "Trusted house cleaning near Malvern's Glenferrie Road village, servicing period homes, luxury townhouses and apartments.",
    h1: "Professional Cleaning Services in Malvern",
    intro: [
      "Malvern sits in that stretch of Melbourne where a stroll down Glenferrie Road or High Street can turn into a full afternoon, and residents here expect their home to keep pace with the polish of the shopping village around it. We clean period homes, luxury townhouses and apartments across the suburb with that standard in mind.",
      "Sitting between the Toorak and Armadale prestige corridor and the Malvern Central precinct, this suburb attracts homeowners who want reliability as much as quality, someone who turns up when they say they will and leaves the property exactly as expected. That's the standard we hold ourselves to on every job along Wattletree Road, Kooyong Road and the streets around Malvern Public Gardens."
    ],
    servicesOffered: ["regular-domestic", "house-for-sale", "end-of-lease"],
    whyLocalsChooseUs: [
      "Comfortable working in elegant, high-presentation homes near the Glenferrie Road village",
      "Reliable scheduling for households that value consistency over convenience",
      "Careful with premium finishes in period homes and newer luxury townhouses",
      "Experience preparing properties near Malvern Central and Tooronga Station for sale",
      "Discreet, professional service suited to busy professional households"
    ],
    propertyTypes: ["Period homes", "Luxury townhouses", "Apartments near the village"],
    streetsAndLandmarks: ["Glenferrie Road", "High Street", "Malvern Road", "Wattletree Road", "Tooronga Road", "Kooyong Road", "Stanhope Street", "Claremont Avenue", "Malvern Public Gardens", "Malvern Central", "Malvern Railway Station", "Tooronga Railway Station", "Cabrini Hospital", "De La Salle College"],
    localCleaningNeeds: "Proximity to the Toorak and Armadale corridor means many Malvern homes carry the same premium stone, timber and cabinetry finishes as their more famous neighbours, and those surfaces need products that clean without dulling or scratching them over time. The Glenferrie Road and High Street shopping villages also mean a steady flow of foot traffic through entryways and living spaces in busy households, so we pay close attention to high-traffic zones like hallways and kitchens where day-to-day wear shows up fastest.",
    faq: [
      { question: "Can you clean luxury townhouses and period homes near the Malvern village?", answer: "Yes, we regularly work in both period homes and newer luxury townhouses around Glenferrie Road and High Street, using products suited to premium finishes." },
      { question: "Do you offer recurring cleaning for busy professional households?", answer: "Yes, weekly and fortnightly domestic cleaning is common in Malvern, and we build a schedule around your household's routine." },
      { question: "Can you prepare a property for sale near Malvern Central or Tooronga Station?", answer: "Yes, our house-for-sale service focuses on presentation cleaning to get a property ready for open inspections and photography." },
      { question: "Do you clean apartments as well as houses in Malvern?", answer: "Yes, we service apartments near the village as well as detached homes and townhouses throughout the suburb." },
      { question: "Is end of lease cleaning available for Malvern rentals?", answer: "Yes, our end of lease service is bond-back focused and covers houses, townhouses and apartments across Malvern." }
    ],
    nearbySuburbs: ["Armadale", "Toorak", "Glen Iris", "Caulfield", "Prahran"]
  },

  toorak: {
    slug: "toorak",
    name: "Toorak",
    metaTitle: "Cleaning Services Toorak | Greenlight Cleaning",
    metaDescription: "Discreet, reliable house cleaning for Toorak homes, experienced with natural stone, marble, hardwood and custom cabinetry.",
    h1: "Professional Cleaning Services in Toorak",
    intro: [
      "A home on Lansell Road or Towers Road isn't cleaned the same way as a standard suburban house, the scale alone changes the job, and the finishes throughout mean the wrong product on the wrong surface can cause real damage. We've built our approach around that reality rather than trying to fit Toorak homes into a generic checklist.",
      "Our clients here are mostly busy professional households who value discretion and consistency, someone they don't have to manage or double-check. From architect-designed homes near Como Park to landscaped properties off Orrong Road and St Georges Road, we work quietly, thoroughly, and to the same standard every visit."
    ],
    servicesOffered: ["regular-domestic", "house-for-sale", "end-of-lease"],
    whyLocalsChooseUs: [
      "Experienced with natural stone, marble, hardwood and custom cabinetry",
      "Discreet service suited to busy, privacy-conscious professional households",
      "Consistent attention across large, multi-living-area homes",
      "Reliable, punctual scheduling without needing to be managed",
      "Careful, non-damaging products used throughout every clean"
    ],
    propertyTypes: ["Grand family homes", "Architect-designed residences", "Landscaped estate properties"],
    streetsAndLandmarks: ["Toorak Road", "Malvern Road", "Williams Road", "Orrong Road", "St Georges Road", "Kooyong Road", "Grange Road", "Lansell Road", "Towers Road", "Toorak Village", "Como Park", "Heyington Railway Station", "St Catherine's School", "St Kevin's College", "Loreto Mandeville Hall"],
    localCleaningNeeds: "Toorak properties tend to run larger than average, often with multiple living areas that all need the same level of attention rather than a quick pass through the main rooms. Natural stone benchtops, marble flooring, hardwood surfaces and custom cabinetry all require specific, non-abrasive products, using the wrong one can etch stone or strip a timber finish, so our team adjusts its approach room by room. For households near St Catherine's, St Kevin's or Loreto Mandeville Hall managing busy family schedules, having a cleaning team that's consistent and doesn't need constant instruction matters as much as the clean itself.",
    faq: [
      { question: "Do you have experience cleaning homes with natural stone and marble surfaces?", answer: "Yes, this is common across Toorak properties and we use non-abrasive, stone-safe products to avoid etching or dulling these finishes." },
      { question: "Can you manage a large home with multiple living areas consistently?", answer: "Yes, our team allocates time based on the actual size and layout of the property so every living area gets the same standard of attention, not just the main rooms." },
      { question: "Is your service discreet for busy professional households?", answer: "Yes, discretion and reliability are central to how we operate in Toorak, and we're comfortable working independently without requiring ongoing supervision." },
      { question: "Do you offer presentation cleaning ahead of a sale or open for inspection?", answer: "Yes, our house-for-sale service is designed to get large, high-finish properties presentation-ready for private inspections or open homes." },
      { question: "Can you work around a household's specific product preferences for premium finishes?", answer: "Yes, if a property has particular product requirements for stone, hardwood or custom cabinetry, let us know in advance and we'll work within that." }
    ],
    nearbySuburbs: ["South Yarra", "Armadale", "Malvern", "Kooyong", "Prahran"]
  },

  "glen-iris": {
    slug: "glen-iris",
    name: "Glen Iris",
    metaTitle: "Cleaning Services Glen Iris | Greenlight Cleaning",
    metaDescription: "House cleaning across Glen Iris, spanning Stonnington and Boroondara, from period homes to renovated family townhouses.",
    h1: "Professional Cleaning Services in Glen Iris",
    intro: [
      "Sitting between the CBD and the eastern suburbs, Glen Iris has always attracted families looking for leafy streets without giving up easy access to the city. The suburb spans both the Stonnington and Boroondara council areas, and we service properties across both sides without treating either as an afterthought.",
      "Along High Street, Warrigal Road and the streets near Gardiners Creek Trail, we clean everything from original family homes to renovated period properties and architect-designed townhouses, working closely with families who need a cleaning schedule that actually holds up week to week."
    ],
    servicesOffered: ["regular-domestic", "house-for-sale", "end-of-lease"],
    whyLocalsChooseUs: [
      "Servicing both sides of Glen Iris across Stonnington and Boroondara",
      "Experienced with leaf and pollen buildup from mature street trees and gardens",
      "Careful with polished hardwood floors and heritage cornices in older homes",
      "Reliable for families managing school-term routines near Sacré Cœur and Korowa",
      "Comfortable in both original family homes and renovated architect-designed townhouses"
    ],
    propertyTypes: ["Family homes", "Renovated period homes", "Architect-designed townhouses"],
    streetsAndLandmarks: ["High Street", "Toorak Road", "Burke Road", "Glen Iris Road", "Malvern Road", "Waverley Road", "Warrigal Road", "Tooronga Road", "Gardiners Creek Trail", "Harold Holt Swim Centre", "Glen Iris Railway Station", "Gardiner Railway Station", "Sacré Cœur", "Korowa Anglican Girls' School"],
    localCleaningNeeds: "Mature gardens are one of the defining features of Glen Iris, and they bring a genuine seasonal cleaning load, leaf litter around entryways and courtyards, pollen settling on outdoor furniture and window sills, particularly through spring, which is also allergy season for a lot of local families with young kids. Inside, older properties often still have polished hardwood floors and heritage cornices that need gentler treatment than a standard clean, while the newer architect-designed townhouses closer to Tooronga Road tend to favour large glass surfaces that show streaks and dust more visibly.",
    faq: [
      { question: "Do you service both the Stonnington and Boroondara sides of Glen Iris?", answer: "Yes, we clean properties across the full suburb regardless of which council area they fall under." },
      { question: "Can you help with spring pollen and allergy-related cleaning needs?", answer: "Yes, we pay extra attention to window sills, outdoor furniture and entryways during spring when pollen buildup is at its worst for local families." },
      { question: "Do you clean polished hardwood floors in older Glen Iris homes?", answer: "Yes, we use appropriate non-abrasive methods on polished hardwood and heritage cornices to avoid dulling or damaging these surfaces." },
      { question: "Is regular domestic cleaning available for families near Korowa or Sacré Cœur?", answer: "Yes, weekly and fortnightly cleaning is our most common booking in Glen Iris, scheduled around school-term routines." },
      { question: "Do you offer end of lease cleaning for townhouses near Tooronga Road?", answer: "Yes, our end of lease service covers houses, townhouses and apartments throughout Glen Iris and is focused on getting your bond back." }
    ],
    nearbySuburbs: ["Malvern", "Ashburton", "Camberwell", "Hawthorn East", "Burwood"]
  },

  hawthorn: {
    slug: "hawthorn",
    name: "Hawthorn",
    metaTitle: "Cleaning Services Hawthorn | Greenlight Cleaning",
    metaDescription: "Cleaning for Hawthorn's heritage terraces, modern apartments and student rentals near Swinburne, with move-in and turnover options.",
    h1: "Professional Cleaning Services in Hawthorn",
    intro: [
      "Few suburbs mix character quite like Hawthorn does. Heritage Victorian terraces sit a few doors down from glass-fronted apartment blocks, and the presence of Swinburne University means the suburb has a constant flow of students, young professionals and short-term renters moving through, alongside long-term family households.",
      "That mix shapes how we work here. Along Glenferrie Road, Auburn Road and the streets around Central Gardens, our team switches between heritage-appropriate cleaning in older terraces and a faster, high-turnover approach for apartments and rentals that change hands often."
    ],
    servicesOffered: ["regular-domestic", "end-of-lease", "move-in", "airbnb-short-term-rental"],
    whyLocalsChooseUs: [
      "Experience with both heritage Victorian terraces and modern apartment fit-outs",
      "Fast turnaround for student and rental properties near Swinburne",
      "Appropriate product knowledge for engineered stone and floor-to-ceiling glass",
      "Familiar with seasonal leaf debris on Hawthorn's older tree-lined streets",
      "Flexible booking suited to shorter tenancy cycles and frequent move-ins"
    ],
    propertyTypes: ["Victorian terrace homes", "Modern apartments", "Student rentals", "Shared professional households"],
    streetsAndLandmarks: ["Glenferrie Road", "Burwood Road", "Power Street", "Auburn Road", "Riversdale Road", "Swinburne University of Technology", "Glenferrie Railway Station", "Auburn Railway Station", "Central Gardens", "Scotch College", "Xavier College"],
    localCleaningNeeds: "Hawthorn's rental and student population means turnover cleaning is a genuinely bigger part of life here than in most of the surrounding suburbs, tenants moving in and out of apartments near Glenferrie and Auburn stations need a fast, reliable clean between leases, and we're set up for exactly that. At the same time, the suburb's heritage terraces need a completely different approach, appropriate care for original detailing rather than the same quick pass used on a modern apartment. Mature street trees also mean seasonal leaf debris around entrances on the older blocks, something the newer apartment buildings largely avoid.",
    faq: [
      { question: "Do you offer fast turnaround cleaning for student rentals near Swinburne?", answer: "Yes, we understand Hawthorn has a lot of shorter tenancy cycles around the university, and we can accommodate quick turnaround bookings between move-outs and move-ins." },
      { question: "Can you clean heritage Victorian terraces without damaging original features?", answer: "Yes, we use appropriate, non-abrasive methods on original detailing in Hawthorn's older terrace homes, distinct from how we'd approach a modern apartment." },
      { question: "Do you offer move-in cleaning for new tenants or owners?", answer: "Yes, our move-in service gets a property genuinely clean and ready before you unpack, which matters a lot given how often properties change hands here." },
      { question: "Is short-stay or Airbnb changeover cleaning available in Hawthorn?", answer: "Yes, given the volume of short-term renters and visiting students and professionals, we offer guest changeover cleaning for short-stay listings in the area." },
      { question: "Do you provide end of lease cleaning for apartments near Glenferrie or Auburn stations?", answer: "Yes, our end of lease service covers apartments and terrace houses across Hawthorn and is built around getting your bond back." }
    ],
    nearbySuburbs: ["Hawthorn East", "Kew", "Richmond", "Camberwell", "Glen Iris"]
  },

  "bentleigh-east": {
    slug: "bentleigh-east",
    name: "Bentleigh East",
    metaTitle: "Cleaning Services Bentleigh East | Greenlight Cleaning",
    metaDescription: "Domestic and move-in cleaning for Bentleigh East's growing family homes and new townhouse developments near Centre Road.",
    h1: "Professional Cleaning Services in Bentleigh East",
    intro: [
      "New townhouse developments have reshaped a lot of Bentleigh East over the past several years, and the suburb now has a mix of established family homes and brand-new builds sitting side by side along Centre Road, Tucker Road and East Boundary Road. Families here are typically stretched between work and school runs, with little spare time for anything beyond the essentials.",
      "We fill that gap with straightforward, reliable domestic cleaning, along with move-in cleans for households settling into a new build and end of lease cleaning for renters shifting between properties near McKinnon Road or Chesterville Road."
    ],
    servicesOffered: ["regular-domestic", "move-in", "end-of-lease", "builders"],
    whyLocalsChooseUs: [
      "Experienced with the finer detail required in new townhouse builds",
      "Reliable recurring cleaning for busy dual-income households",
      "Move-in cleaning that accounts for construction dust in new developments",
      "Straightforward pricing without unnecessary extras for standard homes",
      "Comfortable working across a mix of established homes and new estates"
    ],
    propertyTypes: ["Modern townhouses", "New residential developments", "Established family homes"],
    streetsAndLandmarks: ["Centre Road", "East Boundary Road", "Tucker Road", "Chesterville Road", "Mackie Road", "Bignell Road", "Brady Road", "McKinnon Road"],
    localCleaningNeeds: "The steady growth of new townhouse developments across Bentleigh East means move-in cleaning is a genuinely common request here, freshly built or renovated properties often carry construction dust in vents, tracks and skirting that a standard clean won't fully lift, and we account for that specifically rather than treating a new build the same as an established home. Beyond that, most of our work is recurring domestic cleaning for families juggling work and school schedules who simply don't have the spare hours a house needs each week, and we build a schedule that takes that pressure off without adding another thing to manage.",
    faq: [
      { question: "Do you offer move-in cleaning for new townhouse builds?", answer: "Yes, we account for construction dust in vents, tracks and skirting boards that's common in newly built or newly renovated Bentleigh East properties." },
      { question: "Can you set up a regular weekly or fortnightly clean for a busy family?", answer: "Yes, recurring domestic cleaning is our most common booking type in Bentleigh East, and we schedule around work and school-run routines." },
      { question: "Do you clean both new developments and older established homes?", answer: "Yes, we service the full mix of property types across the suburb, from brand-new townhouses to long-established family homes." },
      { question: "Is builders clean cleaning available after renovation work?", answer: "Yes, our builders clean service is suited to post-renovation and post-construction properties, common given the pace of development in this area." },
      { question: "Do you offer end of lease cleaning near Centre Road or McKinnon Road?", answer: "Yes, our end of lease service covers houses, townhouses and apartments throughout Bentleigh East and is focused on getting your bond back." }
    ],
    nearbySuburbs: ["McKinnon", "Ormond", "Moorabbin", "Oakleigh South", "Carnegie", "Brighton East", "Caulfield South", "Hampton East"]
  }
};

const SUBURB_PAGE_SLUGS: Record<string, string> = {
  brighton: "brighton-cleaning-services",
  hampton: "hampton-cleaning-services",
  camberwell: "camberwell-cleaning-services",
  malvern: "malvern-cleaning-services",
  toorak: "toorak-cleaning-services",
  "glen-iris": "glen-iris-cleaning-services",
  hawthorn: "hawthorn-cleaning-services",
  "bentleigh-east": "bentleigh-east-cleaning-services"
};

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
   STATE MACHINE (useReducer) — now UI-only, routing lives in
   react-router instead of app state
   ============================================================ */
const initialState: State = {
  isMenuOpen: false,
  isChatOpen: false
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
   Uses <Link> for real hrefs + useLocation for active state
   ============================================================ */
function Navigation({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/services") return location.pathname.startsWith("/services");
    if (path === "/service-areas") return location.pathname.startsWith("/service-areas");
    return location.pathname === path;
  };

  const closeEverything = () => {
    setOpenDropdown(null);
    setMobileSection(null);
    dispatch({ type: "CLOSE_MENU" });
  };

  const navItem = (active: boolean) =>
    `inline-flex items-center gap-1 gl-tap rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
    }`;

  const suburbKeys = Object.keys(SUBURBS);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <Container className="flex h-16 items-center justify-between lg:h-20">
        <Link to="/" className="gl-fade-in flex items-center gap-3 gl-tap" onClick={closeEverything}>
          <img src="/logo.png" alt="Greenlight Cleaning Pty Ltd" className="h-10 w-auto" />
          <span className="text-lg font-extrabold tracking-tighter text-slate-900 sm:text-xl">Greenlight Cleaning</span>
        </Link>

        {/* Desktop navigation with dropdowns */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          <Link to="/" className={navItem(isActive("/"))}>Home</Link>

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("services")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link to="/services" className={navItem(isActive("/services"))}>
              Services
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "services" ? "rotate-180" : ""}`} />
            </Link>
            {openDropdown === "services" && (
              <div className="absolute left-1/2 top-full z-50 w-[36rem] -translate-x-1/2 pt-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-1">
                    {SERVICE_KEYS.map((k) => {
                      const Icon = ICONS[SERVICES[k].icon];
                      return (
                        <Link
                          key={k}
                          to={`/services/${k}`}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="leading-tight">{SERVICES[k].name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    to="/services"
                    onClick={() => setOpenDropdown(null)}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border-t border-slate-100 px-3 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-slate-50"
                  >
                    View all services <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Service Areas dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("areas")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link to="/service-areas" className={navItem(isActive("/service-areas"))}>
              Service Areas
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === "areas" ? "rotate-180" : ""}`} />
            </Link>
            {openDropdown === "areas" && (
              <div className="absolute left-1/2 top-full z-50 w-[28rem] -translate-x-1/2 pt-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-1">
                    {suburbKeys.map((key) => (
                      <Link
                        key={key}
                        to={`/service-areas/${SUBURB_PAGE_SLUGS[key]}`}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="leading-tight">{SUBURBS[key].name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/service-areas"
                    onClick={() => setOpenDropdown(null)}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border-t border-slate-100 px-3 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-slate-50"
                  >
                    View all service areas <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/gallery" className={navItem(isActive("/gallery"))}>Gallery</Link>
          <Link to="/about" className={navItem(isActive("/about"))}>About</Link>
          <Link to="/contact" className={navItem(isActive("/contact"))}>Contact</Link>
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

      {/* Mobile menu with expandable Services and Service Areas */}
      {state.isMenuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <Link
              to="/"
              onClick={closeEverything}
              className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Home <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            {/* Services accordion */}
            <button
              onClick={() => setMobileSection(mobileSection === "services" ? null : "services")}
              className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Services
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${mobileSection === "services" ? "rotate-180" : ""}`} />
            </button>
            {mobileSection === "services" && (
              <div className="mb-1 flex flex-col gap-0.5 rounded-xl bg-slate-50 p-2">
                {SERVICE_KEYS.map((k) => {
                  const Icon = ICONS[SERVICES[k].icon];
                  return (
                    <Link
                      key={k}
                      to={`/services/${k}`}
                      onClick={closeEverything}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-emerald-500" />
                      {SERVICES[k].name}
                    </Link>
                  );
                })}
                <Link
                  to="/services"
                  onClick={closeEverything}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-white"
                >
                  View all services
                </Link>
              </div>
            )}

            {/* Service Areas accordion */}
            <button
              onClick={() => setMobileSection(mobileSection === "areas" ? null : "areas")}
              className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Service Areas
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${mobileSection === "areas" ? "rotate-180" : ""}`} />
            </button>
            {mobileSection === "areas" && (
              <div className="mb-1 flex flex-col gap-0.5 rounded-xl bg-slate-50 p-2">
                {suburbKeys.map((key) => (
                  <Link
                    key={key}
                    to={`/service-areas/${SUBURB_PAGE_SLUGS[key]}`}
                    onClick={closeEverything}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                    {SUBURBS[key].name}
                  </Link>
                ))}
                <Link
                  to="/service-areas"
                  onClick={closeEverything}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-white"
                >
                  View all service areas
                </Link>
              </div>
            )}

            <Link to="/gallery" onClick={closeEverything} className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Gallery <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link to="/about" onClick={closeEverything} className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
              About <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link to="/contact" onClick={closeEverything} className="flex items-center justify-between gl-tap rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Contact <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

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

const CLEANING_TYPES = [
  "Regular Domestic Cleaning",
  "End of Lease Cleaning",
  "Commercial Cleaning",
  "NDIS Cleaning",
  "Aged Care Cleaning",
  "Builder's Cleaning & Post Renovation Cleaning",
  "Move In Cleaning",
  "Airbnb & Short-Term Rental Cleaning",
  "Other"
];

const HERO_TRUST_BADGES = [
  "Airbnb Specialists",
  "End of Lease Experts",
  "Fully Insured",
  "Police Checked",
  "15+ Years Experience",
  "100% Satisfaction Guaranteed"
];

function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get("name") as string) || "";
    const phone = (data.get("phone") as string) || "";
    const email = (data.get("email") as string) || "";
    const cleaningType = (data.get("cleaningType") as string) || "";
    const propertySize = (data.get("propertySize") as string) || "";
    const suburb = (data.get("suburb") as string) || "";
    const preferredDate = (data.get("preferredDate") as string) || "";
    const message = (data.get("message") as string) || "";

    const lines = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Cleaning Type: ${cleaningType}`,
      `Suburb: ${suburb}`
    ];
    if (propertySize) lines.push(`Property Size: ${propertySize}`);
    if (preferredDate) lines.push(`Preferred Date: ${preferredDate}`);
    if (message) lines.push(`Message: ${message}`);

    const summary = lines.join("\n");
    const subject = `Cleaning Enquiry from ${name}`;

    const mailtoLink = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
    const waLink = `https://wa.me/61430230971?text=${encodeURIComponent(summary)}`;

    window.open(waLink, "_blank");
    window.location.href = mailtoLink;

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-white">
          Thank you for your enquiry. Greenlight Cleaning has received your request and we will contact you shortly.
        </p>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400";
  const labelCls = "mb-1.5 block text-sm font-medium text-white/80";

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <h3 className="text-lg font-semibold text-white">Get a Free Quote</h3>
      <p className="mt-1 text-sm text-slate-400">Fill in your details and we'll get back to you shortly.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="name" className={labelCls}>Name</label>
          <input id="name" name="name" type="text" required className={inputCls} placeholder="Your full name" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelCls}>Phone</label>
            <input id="phone" name="phone" type="tel" required className={inputCls} placeholder="04XX XXX XXX" />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input id="email" name="email" type="email" required className={inputCls} placeholder="you@email.com" />
          </div>
        </div>

        <div>
          <label htmlFor="cleaningType" className={labelCls}>Cleaning Type Needed</label>
          <select id="cleaningType" name="cleaningType" required defaultValue="" className={inputCls}>
            <option value="" disabled>Select a service</option>
            {CLEANING_TYPES.map((type) => (
              <option key={type} value={type} className="text-slate-900">{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="propertySize" className={labelCls}>Property Size (optional)</label>
            <input id="propertySize" name="propertySize" type="text" className={inputCls} placeholder="e.g. 3 bed / 2 bath" />
          </div>
          <div>
            <label htmlFor="suburb" className={labelCls}>Suburb</label>
            <input id="suburb" name="suburb" type="text" required className={inputCls} placeholder="e.g. Brighton" />
          </div>
        </div>

        <div>
          <label htmlFor="preferredDate" className={labelCls}>Preferred Date (optional)</label>
          <input id="preferredDate" name="preferredDate" type="date" className={inputCls} />
        </div>

        <div>
          <label htmlFor="message" className={labelCls}>Message (optional)</label>
          <textarea id="message" name="message" rows={3} className={inputCls} placeholder="Any extra details we should know" />
        </div>

        <button
          type="submit"
          className="gl-cta gl-tap inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30"
        >
          Send Enquiry
        </button>
      </form>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
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
      <Container className="relative grid items-center gap-10 py-10 lg:grid-cols-12 lg:py-12">
        <div className="lg:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-tight text-emerald-300">
              <Clock className="h-3.5 w-3.5" /> 15+ years in Melbourne
            </span>
          </Reveal>
          <Reveal delay={0.03}>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Spotless homes and workplaces,
              <span className="text-emerald-400"> every single time.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Domestic, commercial, end of lease, NDIS and aged care cleaning across
              Melbourne. Transparent pricing, agency approved standards, and a team that
              shows up ready.
            </p>
          </Reveal>
          <Reveal delay={0.09}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <EmeraldButton href={WA} className="text-base">
                <WhatsAppIcon className="h-5 w-5" /> Get a free quote
              </EmeraldButton>
              <OutlineButton href={TEL} dark className="text-base">
                <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
              </OutlineButton>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <a
              href={TEL}
              className="mt-6 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 transition-colors hover:bg-white/10"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Phone className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-tight text-emerald-300">Prefer to talk? Call us directly</span>
                <span className="block text-2xl font-black tracking-tight text-white">{PHONE_DISPLAY}</span>
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 flex flex-wrap gap-2">
              {HERO_TRUST_BADGES.map((badge, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> {badge}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-tight text-emerald-300">Before &amp; after</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { before: "/kitchen-before.jpg", after: "/kitchen-after.jpg", label: "Kitchen" },
                  { before: "/bathroom-before.jpg", after: "/bathroom-after.jpg", label: "Bathroom" },
                  { before: "/tiles-before.jpg", after: "/tiles-after.jpg", label: "Tile & Grout" }
                ].map((pair, i) => (
                  <div key={i} className="overflow-hidden rounded-xl">
                    <div className="grid grid-cols-2">
                      <div className="relative h-28 overflow-hidden sm:h-36">
                        <img src={pair.before} alt={`${pair.label} before cleaning`} loading="lazy" className="h-full w-full object-cover" />
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight text-white">Before</span>
                      </div>
                      <div className="relative h-28 overflow-hidden sm:h-36">
                        <img src={pair.after} alt={`${pair.label} after cleaning`} loading="lazy" className="h-full w-full object-cover" />
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight text-white">After</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center text-xs font-semibold text-slate-300">{pair.label}</p>
                  </div>
                ))}
              </div>
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
                onClick={() => navigate("/services")}
                className="gl-cta gl-tap mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                View all services <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <EnquiryForm />
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
function ServiceCard({ k, delay }: { k: string; delay: number }) {
  const s = SERVICES[k];
  const Icon = ICONS[s.icon];
  return (
    <Reveal delay={delay}>
      <Link
        to={`/services/${k}`}
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
      </Link>
    </Reveal>
  );
}

function ServiceGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {SERVICE_KEYS.map((k, i) => (
        <ServiceCard key={k} k={k} delay={(i % 3) * 0.1} />
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

function DynamicServiceView() {
  const { serviceKey } = useParams<{ serviceKey: string }>();
  const navigate = useNavigate();
  const k = serviceKey && SERVICES[serviceKey] ? serviceKey : SERVICE_KEYS[0];

  // Unknown service slug in the URL — bounce to the services index instead of crashing
  if (serviceKey && !SERVICES[serviceKey]) {
    return <Navigate to="/services" replace />;
  }

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
        <Link
          to="/services"
          className="mb-8 inline-flex items-center gap-1.5 gl-tap text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> All services
        </Link>

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
                    onClick={() => navigate(`/services/${key}`)}
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
   SUBURB PAGE VIEW
   ============================================================ */
function SuburbPageView() {
  const { suburbSlug } = useParams<{ suburbSlug: string }>();
  const lookupKey = (suburbSlug || "").replace(/-cleaning-services$/, "");
  const suburb = SUBURBS[lookupKey];

  useEffect(() => {
    if (!suburb) return;
    document.title = suburb.metaTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", suburb.metaDescription);
  }, [suburb]);

  if (!suburb) {
    return (
      <Container className="py-24 text-center">
        <p className="text-slate-600">This service area page is coming soon.</p>
        <Link to="/service-areas" className="text-emerald-600 underline">
          View all service areas
        </Link>
      </Container>
    );
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Cleaning Services",
    provider: {
      "@type": "LocalBusiness",
      name: "Greenlight Cleaning Pty Ltd",
      telephone: "+61430230971",
      email: EMAIL
    },
    areaServed: { "@type": "Place", name: suburb.name },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Cleaning Services in ${suburb.name}`,
      itemListElement: suburb.servicesOffered
        .filter((key) => SERVICES[key])
        .map((key) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: SERVICES[key].name }
        }))
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: suburb.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {suburb.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <Container className="py-16">
        <Reveal>
          <Eyebrow>{suburb.name} Cleaning Services</Eyebrow>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{suburb.h1}</h1>
        </Reveal>

        <Reveal delay={0.05} className="mt-6 space-y-4 text-slate-600">
          {suburb.intro.map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </Reveal>

        {suburb.servicesOffered.length > 0 && (
          <Reveal delay={0.1}>
            <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Services We Offer in {suburb.name}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {suburb.servicesOffered.map((key) => {
                const service = SERVICES[key];
                if (!service) return null;
                return (
                  <Link
                    key={key}
                    to={`/services/${key}`}
                    className="gl-elevate rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-emerald-400"
                  >
                    {service.name}
                  </Link>
                );
              })}
            </div>
          </Reveal>
        )}

        {suburb.whyLocalsChooseUs.length > 0 && (
          <Reveal delay={0.15}>
            <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Why {suburb.name} Locals Choose Us</h2>
            <ul className="mt-4 space-y-2">
              {suburb.whyLocalsChooseUs.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {suburb.propertyTypes.length > 0 && (
          <Reveal delay={0.2}>
            <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Property Types We Clean</h2>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-600">
              {suburb.propertyTypes.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Reveal>
        )}

        {suburb.streetsAndLandmarks.length > 0 && (
          <Reveal delay={0.25}>
            <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Areas We Cover Near You</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {suburb.streetsAndLandmarks.map((item, i) => (
                <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {suburb.localCleaningNeeds && (
          <Reveal delay={0.3}>
            <div className="mt-12 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Cleaning Needs in {suburb.name}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{suburb.localCleaningNeeds}</p>
            </div>
          </Reveal>
        )}

        {suburb.faq.length > 0 && (
          <Reveal delay={0.35}>
            <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {suburb.faq.map((f, i) => (
                <details key={i} className="gl-elevate rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <summary className="cursor-pointer font-medium text-slate-800">{f.question}</summary>
                  <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        )}

        {suburb.nearbySuburbs.length > 0 && (
          <Reveal delay={0.4}>
            <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Nearby Areas We Service</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {suburb.nearbySuburbs.map((s, i) => (
                <span key={i} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.45} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <EmeraldButton href={WA}>
            <WhatsAppIcon className="h-5 w-5" /> Get a Free Quote
          </EmeraldButton>
          <OutlineButton href="/service-areas">View All Service Areas</OutlineButton>
        </Reveal>
      </Container>
    </>
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
   QUICK SERVICES BAR — top-of-page service navigation
   ============================================================ */
function QuickServicesBar() {
  return (
    <section className="border-b border-slate-200 bg-white py-8 sm:py-10">
      <Container>
        <Reveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Our services</Eyebrow>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              What can we clean for you?
            </h2>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1.5 gl-tap text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            See all services <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SERVICE_KEYS.map((k, i) => {
            const s = SERVICES[k];
            const Icon = ICONS[s.icon];
            return (
              <Reveal key={k} delay={(i % 5) * 0.04}>
                <Link
                  to={`/services/${k}`}
                  className="gl-elevate flex h-full flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center hover:border-emerald-400"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight text-slate-800">{s.name}</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   SERVICE AREAS STRIP — top-of-page suburb navigation
   ============================================================ */
function ServiceAreasStrip() {
  const suburbKeys = Object.keys(SUBURBS);
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-8 sm:py-10">
      <Container>
        <Reveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Service areas</Eyebrow>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Where we clean across Melbourne
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Find cleaning services in your local suburb, or view our full coverage across Melbourne's southeast.
            </p>
          </div>
          <Link to="/service-areas" className="inline-flex shrink-0 items-center gap-1.5 gl-tap text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            All service areas <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {suburbKeys.map((key, i) => (
            <Reveal key={key} delay={(i % 4) * 0.04}>
              <Link
                to={`/service-areas/${SUBURB_PAGE_SLUGS[key]}`}
                className="gl-elevate flex h-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 hover:border-emerald-400"
              >
                <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm font-semibold leading-tight text-slate-800">{SUBURBS[key].name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   PAGE: HOME
   ============================================================ */
function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <HeroSection />
      <QuickServicesBar />
      <ServiceAreasStrip />
      <StatsBand />
      
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
              <Eyebrow>Full service details</Eyebrow>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Every service, explained in full</h2>
            </div>
            <button onClick={() => navigate("/services")} className="inline-flex items-center gap-1.5 gl-tap text-sm font-semibold text-emerald-600">
              See all services <ArrowRight className="h-4 w-4" />
            </button>
          </Reveal>
          <ServiceGrid />
        </Container>
      </section>
      <BeforeAfterGallery />
      <TriChannelContact />
      <CtaBand />
    </>
  );
}

/* ============================================================
   PAGE: SERVICES
   ============================================================ */
function ServicesPage() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <Container>
        <Reveal className="mb-10 max-w-2xl">
          <Eyebrow>Services</Eyebrow>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Cleaning for every space and standard</h1>
          <p className="mt-4 text-slate-600">From weekly domestic cleans to bond back end of lease work, NDIS support and strata maintenance. Select a service for full scope and pricing.</p>
        </Reveal>
        <ServiceGrid />
      </Container>
    </section>
  );
}

/* ============================================================
   PAGE: ABOUT
   ============================================================ */
function AboutPage() {
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
      <CtaBand />
    </>
  );
}

/* ============================================================
   PAGE: AREAS
   ============================================================ */
function AreasPage() {
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
            {AREAS.map((a, i) => {
              const key = a.toLowerCase().replace(/\s+/g, "-");
              const pageSlug = SUBURB_PAGE_SLUGS[key];
              return (
                <Reveal key={a} delay={(i % 4) * 0.05}>
                  {pageSlug ? (
                    <Link
                      to={`/service-areas/${pageSlug}`}
                      className="gl-elevate flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-emerald-400"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700">{a}</span>
                    </Link>
                  ) : (
                    <div className="gl-elevate flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700">{a}</span>
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
      <CtaBand />
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
function CtaBand() {
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
function Footer() {
  const quick: NavLink[] = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Gallery", path: "/gallery" },
    { label: "Service Areas", path: "/service-areas" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" }
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
              <li key={q.path}>
                <Link to={q.path} className="inline-flex items-center gl-tap text-slate-400 hover:text-white">{q.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="text-sm font-bold uppercase tracking-tight text-white">Services</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICE_KEYS.map((k) => (
              <li key={k}>
                <Link to={`/services/${k}`} className="inline-flex items-center gl-tap text-left text-slate-400 hover:text-white">{SERVICES[k].name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="text-sm font-bold uppercase tracking-tight text-white">Service areas</h4>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {AREAS.map((a) => {
              const key = a.toLowerCase().replace(/\s+/g, "-");
              const pageSlug = SUBURB_PAGE_SLUGS[key];
              return pageSlug ? (
                <Link
                  key={a}
                  to={`/service-areas/${pageSlug}`}
                  className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                >
                  {a}
                </Link>
              ) : (
                <span key={a} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">{a}</span>
              );
            })}
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
   SCROLL TO TOP ON ROUTE CHANGE
   ============================================================ */
function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return null;
}

/* ============================================================
   APP SHELL — layout that wraps every route
   ============================================================ */
function AppShell({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <GlobalStyles />
      <SeoSchema />
      <ScrollToTop />
      <Navigation state={state} dispatch={dispatch} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:serviceKey" element={<DynamicServiceView />} />
          <Route path="/service-areas/:suburbSlug" element={<SuburbPageView />} />
          <Route path="/gallery" element={<BeforeAfterGallery />} />
          <Route path="/service-areas" element={<AreasPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Unknown paths fall back to home rather than a dead page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActionMenu state={state} dispatch={dispatch} />
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BrowserRouter>
      <AppShell state={state} dispatch={dispatch} />
    </BrowserRouter>
  );
}
