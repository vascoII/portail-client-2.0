"use client";

import Link from "next/link";
import React from "react";

const AppFooter: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-4 md:px-6">
        <nav>
          <ul className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/legal-notices"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                href="/personal-datas"
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                Données personnelles
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default AppFooter;

