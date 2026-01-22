"use client";

export default function CguOccupant() {
  return (
    <div className="rounded-xl border border-[#1d1914] bg-white p-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <h1 className="mb-6 text-xl font-normal text-[#1d1914]">
        Conditions d&apos;Utilisation - Occupant
      </h1>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            1. Objet
          </h2>
          <p className="text-sm text-[#1d1914]">
            La société TECHEM met à votre disposition un accès à votre compte
            personnel sur le site
            <a
              href="https://client.techem.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e20613] hover:underline transition-all duration-300"
            >
              {" "}
              client.techem.fr
            </a>
            , vous permettant de suivre vos consommations d&apos;eau.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            2. Accès à votre Compte Personnel
          </h2>
          <div className="space-y-3 text-sm text-[#1d1914]">
            <p>
              Seules les personnes titulaires d&apos;un bail et ayant reçu de leur
              bailleur un identifiant et un mot de passe peuvent utiliser un
              Compte Personnel.
            </p>
            <p>
              Par sécurité, nous vous conseillons de modifier votre mot de passe
              lors de votre première connexion.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            3. Les services proposés
          </h2>
          <p className="text-sm text-[#1d1914]">
            En accédant à votre Espace Personnel, vous pourrez notamment
            consulter les consommations d&apos;eau ou de chauffage de votre logement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            4. Données à caractère personnel
          </h2>
          <div className="space-y-3 text-sm text-[#1d1914]">
            <p>
              Les informations collectées sont traitées dans le strict respect du
              RGPD. Vous disposez d&apos;un droit d&apos;accès et de rectification des
              données vous concernant.
            </p>
            <p>
              Pour exercer ces droits, contactez :
              <a
                href="mailto:data@techem.fr"
                className="text-[#e20613] hover:underline transition-all duration-300"
              >
                {" "}
                data@techem.fr
              </a>
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            5. Loi applicable
          </h2>
          <p className="text-sm text-[#1d1914]">
            Les présentes Conditions d&apos;Utilisation sont soumises à la loi
            française.
          </p>
        </section>
      </div>
    </div>
  );
}

