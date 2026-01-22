"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { useAuth } from "@/lib/hooks/useAuth";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth();

  // Extract user information
  const firstName = user?.FirstName ?? "";
  const lastName = user?.UserName ?? "";
  const email = user?.EMail ?? user?.Email ?? "";

  const handleSave = () => {
    // Handle save logic here
    console.log("Sauvegarde des informations personnelles...");
    closeModal();
  };
  return (
    <div className="p-5 border border-[#1d1914] rounded-xl shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-xl font-normal text-[#1d1914] lg:mb-6">
            Informations Personnelles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-[#1d1914]">
                Prénom
              </p>
              <p className="text-sm font-normal text-[#1d1914]">
                {firstName || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-[#1d1914]">
                Nom
              </p>
              <p className="text-sm font-normal text-[#1d1914]">
                {lastName || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-[#1d1914]">
                Addresse Email
              </p>
              <p className="text-sm font-normal text-[#1d1914]">
                {email || "—"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#1d1914] bg-white px-4 py-3 text-sm font-normal text-[#1d1914] transition-all duration-300 hover:bg-[#ffe5e6] hover:text-[#e20613] lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-xl bg-white p-4 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-normal text-[#1d1914]">
              Editer Informations Personnelles
            </h4>
            <p className="mb-6 text-sm text-[#1d1914] lg:mb-7">
              Mettez à jour vos informations pour que votre profil reste à jour.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-xl font-normal text-[#1d1914] lg:mb-6">
                  Informations Personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <label className="block text-sm font-normal text-[#1d1914] mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      defaultValue={firstName}
                      className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="block text-sm font-normal text-[#1d1914] mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      defaultValue={lastName}
                      className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="block text-sm font-normal text-[#1d1914] mb-2">
                      Addresse Email
                    </label>
                    <input
                      type="email"
                      defaultValue={email}
                      className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="block text-sm font-normal text-[#1d1914] mb-2">
                      Addresse Email Confirmation
                    </label>
                    <input
                      type="email"
                      defaultValue={email}
                      className="w-full rounded-lg border border-[#1d1914] px-3 py-2 text-sm text-[#1d1914] focus:outline-none focus:ring-2 focus:ring-[#1d1914] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-[#1d1914] bg-white text-[#1d1914] text-sm font-normal transition-all duration-300 hover:bg-[#ffe5e6] hover:text-[#e20613]"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#1d1914] text-white text-sm font-normal transition-all duration-300 hover:bg-[#e20613]"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
