"use client";

export default function CguClient() {
  return (
    <div className="rounded-xl border border-[#1d1914] bg-white p-6 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]">
      <h1 className="mb-6 text-xl font-normal text-[#1d1914]">
        Conditions Générales d&apos;Utilisation - Client / Gestionnaire
      </h1>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            1. Objet
          </h2>
          <p className="text-sm text-[#1d1914]">
            La société TECHEM met à la disposition de ses clients un accès personnalisé à une interface 
            de gestion de l&apos;ensemble de leurs immeubles, permettant le suivi des consommations de leur 
            parc d&apos;immeubles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            2. Inscription aux Services
          </h2>
          <p className="text-sm text-[#1d1914]">
            L&apos;accès à l&apos;Espace Client et les Services sont réservés aux professionnels de la gestion 
            d&apos;immeubles liés à TECHEM par un contrat de fourniture et/ou d&apos;entretien de compteurs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            3. Conditions d&apos;accès aux Services
          </h2>
          <div className="space-y-3 text-sm text-[#1d1914]">
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
          <h2 className="text-lg font-normal text-[#1d1914]">
            4. Services disponibles
          </h2>
          <p className="text-sm text-[#1d1914] mb-3">
            Vous pourrez notamment :
          </p>
          <ul className="space-y-2 text-sm text-[#1d1914] list-disc list-inside ml-4">
            <li>Accéder à l&apos;ensemble des immeubles dont vous avez la gérance</li>
            <li>Consulter les relevés de consommations, les statistiques</li>
            <li>Télécharger des documents PDF</li>
            <li>Exporter des données Excel</li>
            <li>Accéder à la répartition des charges d&apos;eau</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            5. Données à caractère personnel
          </h2>
          <p className="text-sm text-[#1d1914]">
            Conformément au RGPD, les données personnelles sont traitées avec attention. 
            Pour exercer vos droits, contactez : 
            <a
              href="mailto:data@techem.fr"
              className="text-[#e20613] hover:underline transition-all duration-300"
            >
              {" "}
              data@techem.fr
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-normal text-[#1d1914]">
            6. Loi applicable
          </h2>
          <p className="text-sm text-[#1d1914]">
            Les présentes CGU sont soumises à la loi française.
          </p>
        </section>
      </div>
    </div>
  );
}

