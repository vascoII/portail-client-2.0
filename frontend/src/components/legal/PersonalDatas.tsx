"use client";

import Link from "next/dist/client/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PersonalDatas() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Déclaration de protection des données
        </h1>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              1. Périmètre
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                Cette déclaration de protection des données s'applique au portail client de Techem France sous client.techem.fr et pour les données collectées sur ce site. Pour les sites Internet d'autres fournisseurs qui sont, par exemple, visés par des liens, l'avis de protection des données et l'état de ces sites s'appliquent.
              </p>
              <p>
                Veuillez lire attentivement cette notice de protection des données avant d'utiliser les sites Web de Techem France . Avec cette notification de protection des données, nous déclarons, entre autres, comment nous manipulons vos données personnelles et utilisons des cookies. En utilisant les sites Web de Techem France, vous acceptez ces réglementations.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              2. Protection des données
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
                Techem France prend très au sérieux la protection de ses données personnelles. Nous traitons vos données personnelles de manière confidentielle et conformément aux dispositions légales en matière de protection des données ainsi qu'à cette déclaration de protection des données.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
                L'utilisation de notre espace client est généralement possible sans la spécification de données personnelles. Si des données personnelles ou des données personnelles de tiers (par exemple, nom, adresse, numéro de téléphone ou adresses e-mail) sont collectées sur une base volontaire. Ces données ne sont pas transmises à des tiers sans votre consentement exprès.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300" >
                Nous soulignons que le transfert de données sur Internet (par exemple, lors de la communication par courrier électronique) peut présenter des failles de sécurité. Une protection complète des données contre l'accès par des tiers n'est pas possible.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              3. Autorité responsable de la protection des données:
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                L'autorité responsable du traitement des données personnelles des visiteurs de notre espace client est:
              </p>
              <br/>
              <p>Techem FRANCE</p>
              <p>Eric CHAUMONT</p>
              <p>378-380 avenue de la division Leclerc</p>
              <p>92290 CHATENAY MALABRY</p>
              <br/>
              <p className="text-sm text-gray-700 dark:text-gray-300">ainsi que l'une de ses filiales ou les sociétés qui lui sont affiliées.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              4. Hébergement
            </h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                La présence sur Internet est assurée par la société Techem Gmbh en tant que fournisseur de services techniques en notre nom et selon nos spécifications
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              5. Qu'est-ce que les données personnelles?
            </h2>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Les données personnelles sont toutes les informations relatives à une personne physique identifiée ou identifiable. Personne physique pouvant être identifiée directement ou indirectement, notamment par attribution à une identification telle qu'un nom, un numéro d'identification, des localisations, une identification en ligne ou à une ou plusieurs particularités qui sont le reflet de facteurs physiques, physiologiques, génétiques, psychologiques, l'identité économique, culturelle ou sociale de cette personne est considérée comme identifiable.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              6. Quelles informations collectons-nous? Comment les utilisons-nous? Données personnelles que nous obtenons directement de vous
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les données personnelles sont collectées via ce site et enregistrées par la suite, si vous les fournissez volontairement, par exemple dans le cadre d'une inscription, en remplissant des formulaires, en envoyant des emails ou en engageant Techem. Nous utilisons ces données que pour l’exécution du contrat qui nous lie. Une divulgation à des tiers ne se produit que si elle est requise pour l'exécution d'un contrat.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              7. Formulaires en ligne
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous nous envoyez des requêtes à l'aide du formulaire de contact, vos informations du formulaire de requête, y compris les coordonnées que vous nous avez fournies, sont enregistrées dans le but de traiter la requête et pour des questions de suivi. Nous ne transmettons pas ces données sans votre permission.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              8. Informations personnelles que nous collectons automatiquement sur ce site
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              A chaque accès au site Web de Techem ou à la réception d'un courriel et en cliquant sur un lien à l'intérieur, Techem peut collecter automatiquement certaines informations vous concernant, que vous utilisiez nos services ou non.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              En visitant ce site, Techem enregistre simplement une adresse IP raccourcie de l'ordinateur demandeur et le site Web à partir de laquelle vous avez visité le nôtre. Lors de votre visite, la date d'accès, les noms de fichiers interrogés, l'URL, le code de réponse / réponse HTTP, l'état d'accès, la durée d'accès et les octets transférés dans le cadre de cette connexion sont sauvegardés. Nous utilisons cette information exclusivement à des fins statistiques où les utilisateurs individuels restent anonymes.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              9. Etracker
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Notre site utilise le service d'analyse etracker. Le fournisseur de services est etracker GmbH, Erste Brunnenstraße 1, 20459 Hamburg, Allemagne.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les profils d'utilisation peuvent être créés sous des pseudonymes à partir des données. Les cookies peuvent être utilisés pour cela. Les cookies impliquent de petits fichiers texte qui sont enregistrés localement dans le cache de votre navigateur Internet.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les cookies permettent la reconnaissance de votre navigateur. Les données collectées avec etracker technologies ne sont pas utilisées sans un accord accordé séparément par les parties concernées pour identifier les visiteurs de notre site Web et ne sont pas mises en commun avec les données personnelles en utilisant le porteur du pseudonyme.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vous pouvez être en désaccord avec cette collecte de données et stockage à tout moment .
              Pour stopper la collecte et le stockage de vos données de visiteurs , vous pouvez obtenir un 
              cookie de désactivation etracker sur le lien ci-dessous, ce qui conduit à ne pas collecter et 
              stocker les données de visiteur de votre navigateur dans etracker: 
              <br/><br/>
              <Link href="http://www.etracker.de/privacy?sid=897433cce9bbcd44aa1e66283e20ba32&id=privacy&et=V23Jbb&languageId=3.">
                http://www.etracker.de/
              </Link>
              
              <br/><br/>
              Grâce à cela, un Opt-Out-Cookie avec le nom "cntcookie" est placé par etracker. 
              Veuillez ne pas supprimer ce cookie tant que vous souhaitez conserver votre objection. 
              Pour plus d'informations, consultez les dispositions de protection des données d'etracker: 
              <br/><br/>
              <Link href="https://www.etracker.com/de/datenschutz.html">
               https://www.etracker.com
              </Link>
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              10. Cookies
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tous les sites internet utilisent dans une certaine mesure des soi-disant cookies. Les cookies ne causent aucun dommage à votre ordinateur et ne contiennent aucun virus. Les cookies aident à rendre nos offres plus conviviales, plus efficaces et plus sécurisées. Les cookies sont de petits fichiers texte stockés sur votre ordinateur et enregistrés par votre navigateur.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              La majorité des cookies que nous utilisons sont des "cookies de session". Ils sont automatiquement supprimés à la fin de votre visite. Les autres cookies restent enregistrés sur votre terminal jusqu'à leur suppression. Ces cookies nous permettent de reconnaître votre navigateur lors de visites ultérieures.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vous pouvez configurer votre navigateur de sorte que vous soyez informé de l'emplacement des cookies et uniquement autoriser les cookies dans certains cas, exclure l'acceptation des cookies dans certains cas ou en général, et activer la suppression automatique des cookies en fermant le navigateur. La fonctionnalité de ce site peut être restreinte lors de la désactivation des cookies.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              11. Fichiers journaux du serveur
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Le fournisseur de services de site Web recueille et stocke des informations automatiques dans des fichiers journaux de serveur, qui nous sont automatiquement transmis par votre navigateur. Ceux-ci sont:
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">- Type de navigateur et version</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">- Système d'exploitation utilisé</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">- URL de référence</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">- Adresse IP</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">- Nom d'hôte de l'ordinateur accédant</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">- Heure de la requête au serveur</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les informations auous nous réservons le droit de vérifier les données ultérieurement si certaines indications d'utilisation illicite nous sont connues.tomatiquement transmis par votre navigateur. Ceux-ci sont:
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              12. Cryptage SSL
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Ce site utilise le cryptage SSL pour des raisons de sécurité et de protection de la transmission de contenus confidentiels, tels que les requêtes que vous nous envoyez en tant qu'opérateur du site. Vous pouvez reconnaître une connexion cryptée en changeant la barre d'adresse du navigateur de "http: //" à "https: //" par le symbole de cadenas dans la ligne de votre navigateur. Lorsque le cryptage SSL est activé, les données que vous nous transmettez ne peuvent pas être lues par des tiers.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              13. Droit à l'information, suppression, blocage
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vous avez le droit d'obtenir gratuitement des informations sur vos données personnelles enregistrées, leur origine et leurs destinataires, le but du traitement des données et un droit à l'autorisation, au blocage ou à la suppression de ces données. Si vous avez des questions à ce sujet ou pour d'autres questions sur les données personnelles, n'hésitez pas à nous contacter à l'adresse indiquée ci-dessous ou par courrier électronique à l'adresse data@techem.fr.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              14. Droit d'appel devant une autorité de surveillance
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Si vous estimez que TECHEM a enfreint le Règlement Général sur la Protection des Données n° 2016/679 du 27 avril 2016 (RGPD), vous pouvez déposer une plainte auprès de la CNIL conformément à la loi.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              15. Objection aux e-mail promotionnels
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Nous nous opposons à l'utilisation des données de contact publiées dans le cadre de l'obligation de publier une empreinte pour la soumission de promotions et de matériel d'information qui n'est pas expressément demandé par nous.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              L'exploitant des sites se réserve le droit de prendre des mesures juridiques expresses en cas d'envoi non sollicité d'informations promotionnelles par, par exemple, des spams.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              16. Consentement
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">Le Client s'engage à informer les occupants dont les données sont fournies à la Société sur le traitement des données et les informations y afférentes figurant aux présentes.</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Le Client peut contacter TECHEM par courrier à l’adresse suivante :</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Techem, 20 rue Edouard Herriot, 92350 Le Plessis Robinson</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Ou par mail: data@techem.fr</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">s'il souhaite: Accéder, modifier ou supprimer les données personnelles conservées par TECHEM,
                Restreindre ou s'opposer au traitement et au transfert des données personnelles.</p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              17. Votre sécurité est notre priorité absolue.
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">Nous avons pris des précautions de sécurité techniques et opérationnelles importantes, qui sont régulièrement vérifiées et mises à jour Pour la protection des données personnelles que nous conservons contre un accès non autorisé et une mauvaise utilisation.</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Si vos données sont traitées chez Techem dans le cadre du traitement central des données pour améliorer le service client ou pour des raisons techniques, des mesures appropriées garantissent que les intérêts de nos clients en matière de protection des données sont pris en compte conformément aux dispositions du Règlement général sur la protection des données (GDPR). Veuillez noter que nous prenons les plus grandes mesures possibles pour assurer une transmission de données sécurisée. La transmission de données sur Internet n'est cependant pas totalement sécurisée. La sécurité des données transmises sur nos sites ne peut donc pas être garantie.</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Si nous modifions nos consignes de protection des données, nous publierons les modifications sur ce site. De cette façon, vous pouvez toujours découvrir comment nous collectons différentes informations et comment nous les utilisons.</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Sur demande écrite, nous serons heureux de vous informer des données que vous avez stockées à votre sujet.</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Vos questions et commentaires sur la protection des données et la sécurité des données sont les bienvenus chez Techem</p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              18. Liste des sous-traitants
            </h2>
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                      <span>Sous-traitant</span>
                    
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <span>Activité</span>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 select-none"
                  >
                    <span>Adresse</span>
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">LT SERVICES</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">2 Avenue Auguste Rodin - 93160 Noisy Leroy</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">L RENOV</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">26 rue Damremont - 75018 PARIS</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">AIRCALL</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Plateforme de téléphonie</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">11 rue Saint Georges - 75009 Paris</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">MGS (EZYGED)</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Envoi de courriers intervention/relève/chantier</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">34 rue de la Vallée aux Bœufs - 41000 Blois</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">SALESFORCES</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Outil de gestion de la relation client et pilotage d'activité métier relève intervention</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">3 avenue Octve Greard - 75007 Paris</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">SMS ScreenMagic</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Envoi de SMS Intervention</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Screen-Magic Mobile Media Inc., 2831 St. Rose Parkway, Suite 200, Henderson, NV 89052, USA</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Techem Grp - HCL</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Infogérance pour Techem Gmbh</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Hauptstraße 89 - 65760 Eschborn</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Techem Grp - HEIZTEC</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Plateforme de gestion des appareils, données de pose et relève</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Hauptstraße 89 - 65760 Eschborn</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Techem Grp - LER</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Logiciel de gestion des contrats immeuble</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Hauptstraße 89 - 65760 Eschborn</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Techem Grp - Microsoft</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Plateforme de gestion bureautique</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Hauptstraße 89 - 65760 Eschborn</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">VICTOR</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">40 rue Alexandre Dumas - 75011 PARIS</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">SEOTEC</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">4 rue Max Linder - 91700 Sainte Genevièvre des Bois</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">SSA SERVICES</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">1 rue Albert et Victor Plantir - 69150 Decines</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">FRERES ARTISANT</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">24 rue de Clichy - 75009 Paris</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">AN RENOV</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">8 Bis rue de la nourrée - 78270 Bnnecourt</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Techem Grp - TAVO</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Plateforme de gestion de pose des appareils</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Hauptstraße 89 - 65760 Eschborn</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">SBCR</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">25 Hameau de Guillerville - 91410 Escobille</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">DUVAL John</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">101 avenue de la Division Leclerc - 91620 La Ville du Bois</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">DUVAL Kylian</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">99 avenue de la Division Leclerc - 91620 La Ville du Bois</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">RSP</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">1 square Benjamin Franklin - 78180 Montigny Le Bretonneux</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">S.A.F.F</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">30 rue Pierre Brasseur - 77100 Meaux</TableCell>
                </TableRow>
                <TableRow className="align-top">
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">TMT SERVICES</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">Pose et relève de compteurs</TableCell>
                  <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-200">15 rue dapos;Arras - 93800 Epinay sur Seine</TableCell>
                </TableRow>





              </TableBody>
            </Table>
          </section>
        </div>
      </div>
    </div>
  );
}

