"use client";

import Link from "next/link";
import React from "react";

const AppFooterLess: React.FC = () => {
  return (
    <footer className="border-t border-[#1d1914] bg-[#1d1914] text-white text-sm py-6">
      <div className="mx-auto max-w-[77rem] px-6">
        <nav>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            <li>
              <Link
                href="https://www.techem.com/fr/fr/mentions-legales"
                target="_blank"
                rel="noopener noreferrer"
                className="block pr-6 text-white hover:underline transition-all duration-300"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <a
                href="https://www.techem.com/fr/fr/politique-de-confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                className="block pr-6 text-white hover:underline transition-all duration-300"
              >
                Politique de confidentialité
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default AppFooterLess;

