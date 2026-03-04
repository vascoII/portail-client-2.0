"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useSearch } from "@/lib/hooks/useSearch";
import type {
  SearchImmeublesParams,
  SearchOccupantsParams,
  SearchImmeublesResponse,
  SearchOccupantsResponse,
} from "@/lib/hooks/useSearch";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  const { search } = useSearch();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNoResultsModalOpen, setIsNoResultsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState<
    "tout" | "immeuble" | "occupant"
  >("tout");
  const [searchAll, setSearchAll] = useState("");
  const [refNumero, setRefNumero] = useState("");
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [cp, setCp] = useState("");
  const [ville, setVille] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Determine the home link based on user type
  const homeLink = useMemo(() => {
    if (!user?.UserType) {
      return "/parc"; // Default fallback
    }
    
    // If CGU is "N", redirect to /cgu
    if (user.CGU === "N") {
      return "/cgu";
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
  }, [user?.UserType, user?.CGU]);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  const inputRef = useRef<HTMLButtonElement>(null);

  const openSearchModal = () => {
    setSearchError(null);
    setSearchType("tout");
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const handleSearchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearchError(null);
    setIsSearching(true);

    try {
      // Always clear previous cached UI results before a new search
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("search_immeubles_results");
        window.sessionStorage.removeItem("search_logements_results");
      }

      // Global search ("Tout"): essayer d'abord sur les immeubles puis sur les occupants
      if (searchType === "tout") {
        const query = searchAll.trim();

        if (!query) {
          setSearchError("Veuillez saisir un critère de recherche.");
          setIsSearching(false);
          return;
        }

        const immeublesParams: SearchImmeublesParams = { tout: query };
        const immeublesResult = (await search(
          "immeuble",
          immeublesParams,
        )) as SearchImmeublesResponse;

        if (
          immeublesResult.immeubles &&
          immeublesResult.immeubles.length > 0
        ) {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
              "search_immeubles_results",
              JSON.stringify(immeublesResult.immeubles),
            );
          }
          closeSearchModal();
          router.push("/immeuble");
          return;
        }

        const occupantsParams: SearchOccupantsParams = { tout: query };
        const occupantsResult = (await search(
          "occupant",
          occupantsParams,
        )) as SearchOccupantsResponse;

        if (
          occupantsResult.logement &&
          occupantsResult.logement.length > 0
        ) {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
              "search_logements_results",
              JSON.stringify(occupantsResult.logement),
            );
          }
          closeSearchModal();
          router.push("/logements");
          return;
        }

        setIsNoResultsModalOpen(true);
        return;
      }

      // Recherche Immeuble seule
      if (searchType === "immeuble") {
        const params: SearchImmeublesParams = {};

        if (refNumero.trim()) {
          params.ref_numero = refNumero.trim();
        }
        if (nom.trim()) {
          params.nom = nom.trim();
        }
        const fullAdresse = [adresse.trim(), cp.trim(), ville.trim()]
          .filter(Boolean)
          .join(" ");
        if (fullAdresse) {
          params.adresse = fullAdresse;
        }

        if (Object.keys(params).length === 0) {
          setSearchError("Veuillez saisir au moins un critère.");
          setIsSearching(false);
          return;
        }

        const result = (await search(
          "immeuble",
          params,
        )) as SearchImmeublesResponse;

        if (!result.immeubles || result.immeubles.length === 0) {
          setIsNoResultsModalOpen(true);
          return;
        }

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "search_immeubles_results",
            JSON.stringify(result.immeubles),
          );
        }

        closeSearchModal();
        router.push("/immeuble");
        return;
      }

      // Recherche Occupant seule
      if (searchType === "occupant") {
        const params: SearchOccupantsParams = {};

        if (refNumero.trim()) {
          params.ref_numero = refNumero.trim();
        }
        if (nom.trim()) {
          params.nom = nom.trim();
        }
        const fullAdresse = [adresse.trim(), cp.trim(), ville.trim()]
          .filter(Boolean)
          .join(" ");
        if (fullAdresse) {
          params.adresse = fullAdresse;
        }

        if (Object.keys(params).length === 0) {
          setSearchError("Veuillez saisir au moins un critère.");
          setIsSearching(false);
          return;
        }

        const result = (await search(
          "occupant",
          params,
        )) as SearchOccupantsResponse;

        if (!result.logement || result.logement.length === 0) {
          setIsNoResultsModalOpen(true);
          return;
        }

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "search_logements_results",
            JSON.stringify(result.logement),
          );
        }

        closeSearchModal();
        router.push("/logements");
        return;
      }
    } catch {
      setSearchError(
        "Une erreur s'est produite lors de la recherche. Veuillez réessayer.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (!isSearchModalOpen) {
          openSearchModal();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchModalOpen]);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {/* Cross Icon */}
          </button>

          <Link href={homeLink} className="lg:hidden">
            <Image
              width={154}
              height={32}
              className="dark:hidden"
              src="./images/logo/logo.svg"
              alt="Logo"
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block"
              src="./images/logo/logo-dark.svg"
              alt="Logo"
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <div className="relative">
              <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <button
                ref={inputRef}
                type="button"
                onClick={openSearchModal}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-left text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
              >
                Recherche avancée...
              </button>
            </div>
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}

           <NotificationDropdown /> 
            {/* <!-- Notification Menu Area --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown /> 
    
        </div>
      </div>

      {/* Advanced Search Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        className="max-w-[600px] p-5 lg:p-8"
      >
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-2 dark:bg-gray-900 sm:p-4">
          <div className="px-2 pb-4">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Recherche avancée
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recherchez un immeuble ou un occupant selon vos critères.
            </p>
          </div>
          <form onSubmit={handleSearchSubmit} className="space-y-4 px-2 pb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Type de recherche
              </span>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="searchType"
                    value="tout"
                    checked={searchType === "tout"}
                    onChange={() => setSearchType("tout")}
                    className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Tout
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="searchType"
                    value="immeuble"
                    checked={searchType === "immeuble"}
                    onChange={() => setSearchType("immeuble")}
                    className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Immeuble
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="radio"
                    name="searchType"
                    value="occupant"
                    checked={searchType === "occupant"}
                    onChange={() => setSearchType("occupant")}
                    className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Occupant
                </label>
              </div>
            </div>
            {searchType === "tout" ? (
              <div className="space-y-1">
                <label
                  htmlFor="tout"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Recherche
                </label>
                <input
                  id="tout"
                  type="text"
                  value={searchAll}
                  onChange={(e) => setSearchAll(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Référence / Numéro
                    </label>
                    <input
                      type="text"
                      value={refNumero}
                      onChange={(e) => setRefNumero(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={cp}
                      onChange={(e) => setCp(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </>
            )}

            {searchError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {searchError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeSearchModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSearching ? "Recherche..." : "Rechercher"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* No Results Modal */}
      <Modal
        isOpen={isNoResultsModalOpen}
        onClose={() => setIsNoResultsModalOpen(false)}
        className="max-w-[400px] p-5"
      >
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900">
          <h4 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
            Aucun résultat
          </h4>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Pas de résultats trouvés selon vos critères.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsNoResultsModalOpen(false)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default AppHeader;
