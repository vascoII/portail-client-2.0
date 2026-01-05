"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLogements } from "@/lib/hooks/useLogements";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const IMMEUBLE_SECTION_SLUGS = [
  { slug: "fuites", label: "Fuites" },
  { slug: "anomalies", label: "Anomalies" },
  { slug: "dysfonctionnements", label: "Dysfonctionnements" },
  { slug: "interventions", label: "Interventions" },
];

const IMMEUBLE_SECTION_PATTERN = IMMEUBLE_SECTION_SLUGS.map((s) => s.slug).join("|");
const IMMEUBLE_DETAIL_REGEX = /^\/immeuble\/[^/]+$/;
const IMMEUBLE_SECTION_REGEX = new RegExp(
  `^\\/immeuble\\/[^/]+\\/(?:${IMMEUBLE_SECTION_PATTERN})$`
);
const LOGEMENTS_REGEX = /^\/immeuble\/[^/]+\/logements$/;
const LOGEMENT_DETAIL_REGEX = /^\/immeuble\/[^/]+\/logements\/[^/]+$/;
const LOGEMENT_SECTION_REGEX = new RegExp(
  `^\\/immeuble\\/[^/]+\\/logements\\/[^/]+\\/(?:${IMMEUBLE_SECTION_PATTERN})$`
);

const getNavItems = (
  pathname: string,
  pkImmeuble?: string,
  pkLogement?: string,
  currentSection?: string,
  userType?: string,
  hasTicketPermission?: boolean
): NavItem[] => {
  const dashboardSubItems: { name: string; path: string; pro?: boolean; new?: boolean }[] = [];
  const dashboardSubItemsOcupant: { name: string; path: string; pro?: boolean; new?: boolean }[] = [];

  // Pattern 1: /parc → ParcDashboard
  // Pattern 2: /immeuble → Parc et Immeubles
  // Pattern 3: /immeuble/{pkImmeuble} → Parc et Immeubles et Immeuble
  // Pattern 4: /immeuble/{pkImmeuble}/(fuites|anomalies|...) → Parc et Immeubles et Immeuble et les 4 types
  // Pattern 5: /immeuble/{pkImmeuble}/logements → Parc et Immeubles et Immeuble et Logements
  // Pattern 6: /immeuble/{pkImmeuble}/logements/{pkLogement} → Parc et Immeubles et Immeuble et Logements et Logement
  // Pattern 7: /immeuble/{pkImmeuble}/logements/{pkLogement}/(fuites|...) → Parc et Immeubles et Immeuble et Logements et Logement et les 4 types

  // Always show Parc (all patterns) - for non-occupant users
  dashboardSubItems.push({ name: "Parc", path: "/parc", pro: false });

  // Always show Occupant (all patterns) - for occupant users
  dashboardSubItemsOcupant.push({ name: "Occupant", path: "/occupant", pro: false });

  // Show Immeubles if we're on /immeuble or /logement (patterns 2-7)
  if (pathname.startsWith("/immeuble") || pathname.startsWith("/logement")) {
    dashboardSubItems.push({ name: "Immeubles", path: "/immeuble", pro: false });
  }

  // Show Immeuble if we have pkImmeuble (patterns 3-7)
  if (pkImmeuble) {
    dashboardSubItems.push({ name: "Immeuble", path: `/immeuble/${pkImmeuble}`, pro: false });

    // Show all 4 types if we're on an immeuble type page (pattern 4)
    if (pathname.startsWith(`/immeuble/${pkImmeuble}/`) && currentSection && IMMEUBLE_SECTION_SLUGS.some(s => s.slug === currentSection)) {
      IMMEUBLE_SECTION_SLUGS.forEach(({ slug, label }) => {
        dashboardSubItems.push({
          name: label,
          path: `/immeuble/${pkImmeuble}/${slug}`,
          pro: false,
        });
      });
    }

    // Show Logements if we're on logements page or logement detail page (patterns 5-7)
    if (pathname.includes("/logements") || pkLogement) {
      const logementsPath = `/immeuble/${pkImmeuble}/logements`;
      dashboardSubItems.push({ name: "Logements", path: logementsPath, pro: false });

      if (pkLogement) {
        const logementPath = `${logementsPath}/${pkLogement}`;
        dashboardSubItems.push({ name: "Logement", path: logementPath, pro: false });

        if (
          pathname.startsWith(`${logementPath}/`) &&
          currentSection &&
          IMMEUBLE_SECTION_SLUGS.some((s) => s.slug === currentSection)
        ) {
          IMMEUBLE_SECTION_SLUGS.forEach(({ slug, label }) => {
            dashboardSubItems.push({
              name: label,
              path: `${logementPath}/${slug}`,
              pro: false,
            });
          });
        }
      }
    }
  }

  // Select the appropriate dashboard items based on userType
  const selectedDashboardItems = userType === "O" ? dashboardSubItemsOcupant : dashboardSubItems;
  const isClient = userType === "C" ? true : false;

  // Check if Administration should be shown
  // Show if: (env=prod && userType == "A") OR env=dev
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  const showAdministration = (isProduction && userType === "A") || isDevelopment;

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      subItems: selectedDashboardItems,
    },
  ];

  if (hasTicketPermission && isClient) {
    navItems.push({
      icon: <ListIcon />,
      name: "Tickets",
      path: "/tickets",
    });
  }

  if (isClient) {
    navItems.push({
      icon: <UserCircleIcon />,
      name: "Gestionnaires",
      path: "/gestionnaire",
    });
  }

  if (isClient) {
    navItems.push({
      icon: <TableIcon />,
      name: "Factures",
      path: "/factures",
    });
  }

  if (isClient) {
    navItems.push({
      icon: <UserCircleIcon />,
      name: "Stats de connexion occupants",
      path: "/gestionnaire/statistiques",
    });
  }
  // Add Administration item conditionally
  if (showAdministration) {
    navItems.push({
      icon: <UserCircleIcon />,
      name: "Administration (Developpement mode)",
      path: "/admin",
    });
  }

  return navItems;
};

const othersItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Template",
    subItems: [
      { name: "Ecommerce", path: "/", pro: false }
    ],
    
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/login", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const { getLogementQuery } = useLogements();

  const isDevelopment = process.env.NODE_ENV === "development";

  // Extract pkImmeuble from pathname if we're on an immeuble detail page
  const immeubleMatch = pathname.match(/^\/immeuble\/([^/]+)/);
  const pkImmeuble = immeubleMatch ? immeubleMatch[1] : undefined;

  // Extract pkLogement from pathname if we're on a logement detail page
  const logementMatch = pathname.match(
    /^\/immeuble\/[^/]+\/logements\/([^/]+)/
  );
  const pkLogement = logementMatch ? logementMatch[1] : undefined;

  // If we're on a logement page, try to get pkImmeuble from the logement data
  // Always call the hook (React rules), but it will only execute when pkLogement is provided
  const { data: logementData } = getLogementQuery(pkLogement || "");
  
  // Extract current section (fuites, anomalies, etc.) from pathname
  let currentSection: string | undefined;
  if (pkImmeuble) {
    // Match direct section URL: /immeuble/{pkImmeuble}/{section}
    let sectionMatch = pathname.match(/^\/immeuble\/[^/]+\/([^/]+)$/);
    if (
      sectionMatch &&
      IMMEUBLE_SECTION_SLUGS.some((s) => s.slug === sectionMatch[1])
    ) {
      currentSection = sectionMatch[1];
    } else {
      // Match nested URLs like /immeuble/{pkImmeuble}/{section}/{pkIntervention}
      sectionMatch = pathname.match(/^\/immeuble\/[^/]+\/([^/]+)\/[^/]+$/);
      if (
        sectionMatch &&
        IMMEUBLE_SECTION_SLUGS.some((s) => s.slug === sectionMatch[1])
      ) {
        currentSection = sectionMatch[1];
      }
    }
  }
  if (pkLogement && !currentSection) {
    const sectionMatch = pathname.match(
      /^\/immeuble\/[^/]+\/logements\/[^/]+\/([^/]+)$/
    );
    if (
      sectionMatch &&
      IMMEUBLE_SECTION_SLUGS.some((s) => s.slug === sectionMatch[1])
    ) {
      currentSection = sectionMatch[1];
    }
  }

  // Get pkImmeuble from logement data if available (for logement pages)
  const resolvedPkImmeuble = useMemo(() => {
    if (pkImmeuble) {
      return pkImmeuble;
    }
    if (pkLogement && logementData?.logement?.Immeuble?.PkImmeuble) {
      return String(logementData.logement.Immeuble.PkImmeuble);
    }
    return undefined;
  }, [pkImmeuble, pkLogement, logementData]);

  // Get dynamic nav items based on current route (memoized to avoid unnecessary re-renders)
  const navItems = useMemo(
    () => getNavItems(pathname, resolvedPkImmeuble, pkLogement, currentSection, user?.UserType, user?.hasTicketPermission),
    [pathname, resolvedPkImmeuble, pkLogement, currentSection, user?.UserType, user?.hasTicketPermission]
  );

  // Determine the home link based on user type
  const homeLink = useMemo(() => {
    if (!user?.UserType) {
      return "/parc"; // Default fallback
    }
    
    // If UserType is O (Occupant), redirect to /occupant
    if (user.UserType === "O") {
      return "/occupant";
    }
    
    // If UserType is C (Client) or G (Gestionnaire), redirect to /parc
    if (user.UserType === "C" || user.UserType === "G") {
      return "/parc";
    }
    
    // Default fallback
    return "/parc";
  }, [user?.UserType]);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => {
                  // Determine indentation level based on path hierarchy
                  // Pattern: Parc (0) -> Immeubles (1) -> Immeuble (2) -> Sections/Logements (3) -> Logement (4) -> Sections (5)
                  // Pattern: Occupant (0)
                  let indentLevel = 0;
                  if (subItem.path === "/parc" || subItem.path === "/occupant") {
                    indentLevel = 0; // Parc or Occupant - no indent
                  } else if (subItem.path === "/immeuble") {
                    indentLevel = 1; // Immeubles - level 1
                  } else if (IMMEUBLE_DETAIL_REGEX.test(subItem.path)) {
                    indentLevel = 2; // Specific immeuble
                  } else if (IMMEUBLE_SECTION_REGEX.test(subItem.path)) {
                    indentLevel = 3; // Immeuble sections
                  } else if (LOGEMENTS_REGEX.test(subItem.path)) {
                    indentLevel = 3; // Logements listing
                  } else if (LOGEMENT_DETAIL_REGEX.test(subItem.path)) {
                    indentLevel = 4; // Specific logement
                  } else if (LOGEMENT_SECTION_REGEX.test(subItem.path)) {
                    indentLevel = 5; // Logement sections
                  }
                  
                  return (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                      style={{ paddingLeft: `${indentLevel * 1.5}rem` }}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems && nav.subItems.length > 0) {
          // Check if we're on a page that should open this submenu
          // For Dashboard, open if we're on /parc, /immeuble, /occupant, or /logement
          if (
            nav.name === "Dashboard" &&
            (pathname.startsWith("/parc") || pathname.startsWith("/immeuble") || pathname.startsWith("/occupant"))
          ) {
            setOpenSubmenu({
              type: menuType as "main" | "others",
              index,
            });
            submenuMatched = true;
          } else {
            // Check if current pathname matches any subItem path
            nav.subItems.forEach((subItem) => {
              // Check if current pathname matches the subItem path or starts with it (for dynamic routes)
              const pathMatches = pathname === subItem.path || pathname.startsWith(subItem.path + "/");
              if (pathMatches) {
                setOpenSubmenu({
                  type: menuType as "main" | "others",
                  index,
                });
                submenuMatched = true;
              }
            });
          }
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={homeLink}>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/techem/logo.svg"
                alt="Logo Techem"
                width={200}
                height={140}
              />
              <Image
                className="hidden dark:block"
                src="/images/techem/logo-dark.svg"
                alt="Logo Techem"
                width={200}
                height={140}
              />
            </>
          ) : (
            <Image
              src="/images/techem/auth-logo.svg"
              alt="Logo Techem"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {isDevelopment && (    
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others (developpement mode)"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>)}
          </div>
        </nav>
        
      </div>
    </aside>
  );
};

export default AppSidebar;
