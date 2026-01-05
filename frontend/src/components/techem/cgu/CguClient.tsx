"use client";

export default function CguClient() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
        Conditions Générales d&apos;Utilisation - Client / Gestionnaire
      </h1>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            1. Objet
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            La société TECHEM met à la disposition de ses clients un accès personnalisé à une interface 
            de gestion de l&apos;ensemble de leurs immeubles, permettant le suivi des consommations de leur 
            parc d&apos;immeubles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            2. Inscription aux Services
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            L&apos;accès à l&apos;Espace Client et les Services sont réservés aux professionnels de la gestion 
            d&apos;immeubles liés à TECHEM par un contrat de fourniture et/ou d&apos;entretien de compteurs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            3. Conditions d&apos;accès aux Services
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Codes d&apos;accès:</strong> L&apos;Utilisateur est seul responsable de l&apos;utilisation de son 
              compte. Nous recommandons de quitter votre compte à la fin de chaque session.
            </p>
            <p>
              <strong>Utilisation:</strong> Les Services doivent être utilisés dans le respect de la 
              législation et de la réglementation applicables.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            4. Services disponibles
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Vous pourrez notamment :
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
            <li>Accéder à l&apos;ensemble des immeubles dont vous avez la gérance</li>
            <li>Consulter les relevés de consommations, les statistiques</li>
            <li>Télécharger des documents PDF</li>
            <li>Exporter des données Excel</li>
            <li>Accéder à la répartition des charges d&apos;eau</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            5. Données à caractère personnel
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Conformément au RGPD, les données personnelles sont traitées avec attention. 
            Pour exercer vos droits, contactez : 
            <a
              href="mailto:data@techem.fr"
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              {" "}
              data@techem.fr
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            6. Loi applicable
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Les présentes CGU sont soumises à la loi française.
          </p>
        </section>
      </div>
    </>
  );
}

