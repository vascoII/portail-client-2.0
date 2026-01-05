"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

export default function FicheClient() {
  const [isOpenPanel, setIsOpenPanel] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-6 bg-white shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Fiche client
          </h3>
          <button
            type="button"
            onClick={() => setIsOpenPanel((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-expanded={isOpenPanel}
          >
            {isOpenPanel ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L10 7L15 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 8L10 13L15 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            Voir le statut
          </button>
        </div>

        <div
          className={`transition-all ${
            isOpenPanel ? "mt-5 max-h-40 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 px-4 py-4 dark:border-sky-500/40 dark:bg-sky-500/10">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-200 text-sky-800 dark:bg-sky-500/30 dark:text-sky-200">
                📄
              </span>
              <div>
                <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                  Fonctionnalité à venir
                </p>
                <p className="text-sm text-sky-800 dark:text-sky-200/80">
                  La fiche client détaillée sera bientôt disponible.
                  Vous serez informés par notification lorsque la fonctionnalité sera disponible.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-100"
            >
              Editer
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[500px] p-5 lg:p-8"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Editer ma fiche client
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cette modale est statique pour le moment. Le contenu sera ajouté
            ultérieurement.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-100"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-theme-xs hover:bg-brand-600 transition"
            >
              Appliquer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
