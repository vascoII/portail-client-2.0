"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

export default function FicheClient() {
  const [isOpenPanel, setIsOpenPanel] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="rounded-xl border border-[#1d1914] shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <div className="px-5 pt-5 pb-6 bg-white rounded-xl sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-normal text-[#1d1914]">
            Fiche client
          </h3>
          <button
            type="button"
            onClick={() => setIsOpenPanel((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1d1914] px-3 py-2 text-sm font-normal text-[#1d1914] hover:bg-[#ffe5e6] hover:border-[#e20613] hover:text-[#e20613] transition-all duration-300"
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
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#1d1914] bg-[#ffe5e6] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#009bb4] text-white">
                📄
              </span>
              <div>
                <p className="text-sm font-medium text-[#1d1914]">
                  Fonctionnalité à venir
                </p>
                <p className="text-sm text-[#1d1914]">
                  La fiche client détaillée sera bientôt disponible.
                  Vous serez informés par notification lorsque la fonctionnalité sera disponible.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-3 py-2 text-sm font-normal transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe]"
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
          <h2 className="text-xl font-normal text-[#1d1914]">
            Editer ma fiche client
          </h2>
          <p className="text-base text-[#1d1914]">
            Cette modale est statique pour le moment. Le contenu sera ajouté
            ultérieurement.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="bg-transparent text-[#1d1914] border-2 border-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-2.5 text-sm font-normal transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="bg-[#e20613] text-white hover:bg-[#b4050f] border border-[#e20613] hover:border-[#b4050f] rounded-lg px-4 py-2.5 text-sm font-normal transition-all duration-300 focus-visible:outline-4 focus-visible:outline-[#c2dafe]"
            >
              Appliquer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
