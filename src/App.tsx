import React, { useReducer, useState, useEffect, useRef } from "react";
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
interface Service {
  icon: string;
  name: string;
  summary: string;
  groups: ServiceGroup[];
  exclusions?: string[];
  chips?: string[];
  chipsTitle?: string;
  pricing?: Pricing;
  extras?: string[][];
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
    groups: [
      { title: "General", items: ["Dusting of tables, sills, cobwebs, skirting boards and bed frames", "Vacuuming of all floors and carpets", "Mopping of all hard floors"] },
      { title: "Kitchen", items: ["Benchtops and cupboard faces", "Sinks, cooktops and splashbacks", "Microwave, oven exterior and fridge exterior"] },
      { title: "Bathroom", items: ["Basins, bathtubs and showers", "Toilets and mirrors", "Floors"] }
    ],
    exclusions: ["Oven interior", "Rangehood degreasing", "Window glass", "Wall marks", "Soft Venetian blinds"],
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
        ["4 Bed / 3 Bath, double storey", "$180 to $200"],
        ["5 Bed / 3 Bath", "$200 to $220"],
        ["5 Bed / 4 Bath", "$220 to $250"]
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
    groups: [{
      title: "Scope of work",
      items: [
        "Carpet steam cleaning",
        "Internal and external windows",
        "Window sills and tracks",
        "Full bathroom detail",
        "Full kitchen detail",
        "Dusting and cobweb removal",
        "Blinds and light fittings",
        "Skirting boards",
        "Laundry",
        "Cupboards emptied and wiped",
        "Garage sweeping"
      ]
    }],
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
    extras: [
      ["Wall Cleaning", "$50/hr"],
      ["Fridge", "$50 to $100"],
      ["Microwave", "$15"],
      ["Oven 600mm", "$60"],
      ["Oven 900mm", "$80"],
      ["Windows", "$10/panel"],
      ["Venetian Blinds", "$30 to $50"],
      ["Balcony", "$20 to $60"]
    ],
    note: "Pricing aligned to agent bond inspection requirements."
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

  "post-renovation": {
    icon: "paint",
    name: "Post Renovation Cleaning",
    summary: "Removes renovation dust and residue from finished spaces.",
    groups: [{
      title: "Scope of work",
      items: [
        "Construction dust removed from all surfaces",
        "Paint and adhesive spot removal",
        "Fixture and fitting detail",
        "Windows and frames",
        "Floor wash and vacuum",
        "Vents and skirting dusting"
      ]
    }],
    quote: true
  },

  "builders": {
    icon: "hammer",
    name: "Builders Cleaning",
    summary: "Rough, sparkle and final cleans for new builds and sites.",
    groups: [{
      title: "Scope of work",
      items: [
        "Rough clean during build stage",
        "Sparkle clean before handover",
        "Debris and dust removal",
        "Sticker and label removal from windows and appliances",
        "Fixture polishing",
        "Final presentation detail"
      ]
    }],
    quote: true
  },

  "house-for-sale": {
    icon: "tag",
    name: "House for Sale Cleaning",
    summary: "Presentation ready cleans for inspections and photography.",
    groups: [{
      title: "Scope of work",
      items: [
        "Presentation clean for open inspections",
        "Photography ready detailing",
        "Kitchen and bathroom detail",
        "Glass and mirror polish",
        "Dusting and vacuuming throughout",
        "Entry and exterior tidy"
      ]
    }],
    quote: true
  },

  "ndis": {
    icon: "access",
    name: "NDIS Cleaning",
    summary: "Plan aligned domestic support for NDIS participants.",
    rate: "$58.03 per hour",
    groups: [{
      title: "Scope of work",
      items: [
        "Domestic assistance tailored to your plan",
        "Kitchen and bathroom cleaning",
        "Floors vacuumed and mopped",
        "Dusting and surfaces",
        "Linen change",
        "Rubbish removal"
      ]
    }],
    chipsTitle: "Providers we work with",
    chips: NDIS_PROVIDERS,
    note: "Plan managed, self managed and agency referred clients welcome."
  },

  "home-care": {
    icon: "heart",
    name: "Home Care Cleaning",
    summary: "Ongoing domestic support for ageing and home care clients.",
    rate: "$58.03 per hour",
    groups: [{
      title: "Scope of work",
      items: [
        "Ongoing light domestic duties",
        "Kitchen and bathroom cleaning",
        "Floors vacuumed and mopped",
        "Laundry support",
        "Dusting and tidying"
      ]
    }],
    chipsTitle: "Providers we work with",
    chips: NDIS_PROVIDERS,
    note: "Suitable for Home Care Package and aged support clients."
  },

  "strata": {
    icon: "layers",
    name: "Strata & Common Area Cleaning",
    summary: "Scheduled cleaning for shared residential and commercial areas.",
    groups: [{
      title: "Scope of work",
      items: [
        "Lobbies and foyers",
        "Hallways and corridors",
        "Lift interiors",
        "Stairwells and handrails",
        "Glass entry doors",
        "Bin rooms and rubbish areas",
        "Car park sweeping"
      ]
    }],
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
   MOTION PRIMITIVE
   Replicates Framer Motion fadeInUp + staggerChildren(0.1)
   via IntersectionObserver and CSS keyframes.
   ============================================================ */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as any}
      className={`gl-reveal ${inView ? "gl-in" : ""} ${className}`}
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
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
function HeroSection({ dispatch }: { dispatch: Dispatch }) {
  const highlights: IconItem[] = [
    { icon: Shield, text: "Bond back focused end of lease cleans" },
    { icon: Accessibility, text: "NDIS and Home Care provider ready" },
    { icon: Award, text: "Fully insured, agency approved teams" },
    { icon: MapPin, text: "Serving 48 Melbourne suburbs" }
  ];
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="gl-hero-glow" />
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
              Domestic, commercial, end of lease, NDIS and home care cleaning across
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
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

        {/* Extras */}
        {s.extras && (
          <div className="mt-8">
            <Reveal>
              <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Optional extras</h3>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {s.extras.map((e, i) => (
                <Reveal key={i} delay={(i % 4) * 0.1} className="gl-elevate rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-700">{e[0]}</div>
                  <div className="mt-1 text-base font-black tracking-tight text-emerald-600">{e[1]}</div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

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
            <img src={beforeImage} alt={`${title} before cleaning`} draggable={false} className="h-full w-full object-cover" />
          </div>
          {/* After image clipped by the slider position */}
          <div className="absolute inset-0 overflow-hidden bg-emerald-100" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img src={afterImage} alt={`${title} after cleaning`} draggable={false} className="h-full w-full object-cover" />
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
    { title: "Kitchen detail", sublabel: "Benchtops, splashback, cooktop", before: "/kitchen-after.jpg", after: "/kitchen-before.jpg" },
    { title: "Bathroom refresh", sublabel: "Showers, tiles, grout, basins", before: "/bathroom-after.jpg", after: "/bathroom-before.jpg" },
    { title: "Tile and grout cleaning", sublabel: "Hard floor restoration and stain removal", before: "/tiles-after.jpg", after: "/tiles-before.jpg" }
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
      <section className="bg-white py-16 sm:py-20">
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
    { icon: Accessibility, title: "NDIS and home care ready", body: "Plan aligned support and recognised provider relationships." },
    { icon: Tag, title: "Transparent pricing", body: "Clear cash rates published up front, GST applied only on invoice." },
    { icon: MapPin, title: "Local coverage", body: "Servicing 48 suburbs across bayside, inner and eastern Melbourne." }
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
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">Cleaning across 48 Melbourne suburbs</h1>
            <p className="mt-4 text-slate-600">Bayside, inner city and eastern Melbourne. If your suburb is on the list, we clean there.</p>
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
            Domestic, commercial, end of lease, NDIS and home care cleaning across Melbourne.
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
      <style>{`
        html { scroll-behavior: smooth; }
        .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        /* fadeInUp + stagger */
        @keyframes gl-fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .gl-reveal { opacity: 0; }
        .gl-reveal.gl-in { animation: gl-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* hoverElevate: scale 1.02, y -5 */
        .gl-elevate { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease; will-change: transform; }
        .gl-elevate:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 18px 40px -18px rgba(15,23,42,0.35); }
        .gl-cta { transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, background-color 0.2s ease; }
        .gl-cta:hover { transform: translateY(-5px) scale(1.02); }

        /* hero ambient glow */
        .gl-hero-glow { position: absolute; inset: 0; background:
          radial-gradient(60% 60% at 80% 0%, rgba(16,185,129,0.22), transparent 60%),
          radial-gradient(50% 50% at 0% 100%, rgba(16,185,129,0.10), transparent 60%); }

        /* FAB pulse */
        @keyframes gl-pulse { 0%,100% { box-shadow: 0 12px 30px -8px rgba(16,185,129,0.5), 0 0 0 0 rgba(16,185,129,0.45); } 50% { box-shadow: 0 12px 30px -8px rgba(16,185,129,0.5), 0 0 0 12px rgba(16,185,129,0); } }
        .gl-fab { animation: gl-pulse 2.6s infinite; transition: transform 0.2s ease; }
        .gl-fab:hover { transform: scale(1.06); }
        @keyframes gl-pop-in { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .gl-pop { animation: gl-pop-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* header brand fade-in */
        @keyframes gl-fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .gl-fade-in { animation: gl-fade-in 0.5s ease-out both; }

        /* touch target floor (WCAG 44px minimum) */
        .gl-tap { min-height: 44px; }
        /* hide scrollbar so the edge fade is the scroll affordance */
        .gl-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
        .gl-noscroll::-webkit-scrollbar { display: none; }

        /* range slider thumb invisible (handle is drawn separately) */
        .gl-range::-webkit-slider-thumb { -webkit-appearance: none; width: 44px; height: 100%; cursor: ew-resize; }
        .gl-range::-moz-range-thumb { width: 44px; height: 100%; border: 0; background: transparent; cursor: ew-resize; }

        @media (prefers-reduced-motion: reduce) {
          .gl-reveal, .gl-reveal.gl-in, .gl-fab, .gl-pop, .gl-fade-in { animation: none !important; opacity: 1 !important; transform: none !important; }
          .gl-elevate, .gl-cta { transition: none !important; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      <SeoSchema />
      <Navigation state={state} dispatch={dispatch} />
      <main>{renderRoute()}</main>
      <Footer dispatch={dispatch} />
      <FloatingActionMenu state={state} dispatch={dispatch} />
    </div>
  );
}
