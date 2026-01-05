"use client";

export default function LegalNotices() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Mentions légales
        </h1>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              1. Dénomination de l&apos;éditeur du site internet
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>TECHEM SAS</p>
              <p>Téléphone: +33(0)1 46015970</p>
              <p>Télécopie: +33(0)1 46015979</p>
              <p>E-mail: commercial@techem.fr</p>
              <p>Registre de commerce: 43929068500023</p>
              <p>Capital social: 4 560 100 Euros</p>
              <p>Nº TVA: FR 94439290685</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              2. Directeur de la publication du site internet
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Eric CHAUMONT, Managing Director.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              3. Hébergeur du site
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>Nom : Techem Gmbh</p>
              <p>Adresse :</p>
              <p>Téléphone :</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              4. Limite de responsabilité
            </h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                Les informations consultables sur ce site internet ne valent pas
                offre de services et ne sont données qu&apos;à titre
                d&apos;information.
              </p>
              <p>
                TECHEM ne garantit en aucune manière que les informations
                présentes sur son site sont exactes, complètes et à jour, et ne
                fournit aucune garantie expresse ou tacite concernant tout ou
                partie de son site Internet. TECHEM décline toute
                responsabilité directe ou indirecte, concernant
                l&apos;utilisation et l&apos;accès des informations contenues sur
                le présent site, ce que l&apos;utilisateur du site accepte
                expressément.
              </p>
              <p>
                Les données affichées sur le site ne sont pas opposables en
                l&apos;état aux données utilisées par les gestionnaires pour
                quittancer les fluides dont le comptage est confié à TECHEM.
                Elles ne sauraient être considérées comme constituant une offre
                contractuelle et ne sont données qu&apos;à titre indicatif.
              </p>
              <p>
                TECHEM s&apos;efforce de mettre à disposition des utilisateurs
                les informations les plus exactes et les plus complètes
                possibles. Cependant, elle ne garantit pas que les informations
                affichées sur le site soient actualisées, justes et
                exhaustives.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              5. Propriété Intellectuelle
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>TECHEM SAS</p>
              <p>Téléphone: +33(0)1 46015970</p>
              <p>Télécopie: +33(0)1 46015979</p>
              <p>E-mail: data@techem.fr</p>
              <p>Registre de commerce: 43929068500023</p>
              <p>Capital social: 4 560 100 Euros</p>
              <p>Nº TVA: FR 94439290685</p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Utilisation de l&apos;Espace Client
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Il est précisé que certains clients peuvent accéder à leur compte
              personnel sur le site internet accessible à l&apos;adresse URL
              https://client.techem.fr. Pour créer ce compte personnel,
              l&apos;utilisateur devra être titulaire d&apos;un bail et avoir
              reçu de son bailleur un identifiant et un mot de passe destinés à
              accéder à un compte personnel, et avoir accepté les Conditions
              Générales d&apos;Utilisation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

