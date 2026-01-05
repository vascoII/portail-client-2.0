"use client";

import Link from "next/link";
import React from "react";

const AppFooterLess: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-4 md:px-6">
        <nav>
          <ul className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="https://www.techem.com/fr/fr/mentions-legales"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <a
                href="https://www.techem.com/fr/fr/politique-de-confidentialite"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 dark:hover:text-gray-200"
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

