"use client";

export default function CguOccupant() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
        Conditions d&apos;Utilisation - Occupant
      </h1>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            1. Objet
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            La société TECHEM met à votre disposition un accès à votre compte
            personnel sur le site
            <a
              href="https://client.techem.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              {" "}
              client.techem.fr
            </a>
            , vous permettant de suivre vos consommations d&apos;eau.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            2. Accès à votre Compte Personnel
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            3. Les services proposés
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            En accédant à votre Espace Personnel, vous pourrez notamment
            consulter les consommations d&apos;eau ou de chauffage de votre logement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            4. Données à caractère personnel
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              Les informations collectées sont traitées dans le strict respect du
              RGPD. Vous disposez d&apos;un droit d&apos;accès et de rectification des
              données vous concernant.
            </p>
            <p>
              Pour exercer ces droits, contactez :
              <a
                href="mailto:data@techem.fr"
                className="text-brand-600 hover:underline dark:text-brand-400"
              >
                {" "}
                data@techem.fr
              </a>
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            5. Loi applicable
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Les présentes Conditions d&apos;Utilisation sont soumises à la loi
            française.
          </p>
        </section>
      </div>
    </>
  );
}

