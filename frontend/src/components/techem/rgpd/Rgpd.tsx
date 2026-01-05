"use client";

import { useState } from "react";

const sections = [
  {
    title: "1. Périmètre",
    content: `Cette déclaration de protection des données s'applique au portail client de Techem France sous client.techem.fr et pour les données collectées sur ce site. Pour les sites Internet d'autres fournisseurs qui sont, par exemple, visés par des liens, l'avis de protection des données et l'état de ces sites s'appliquent.

Veuillez lire attentivement cette notice de protection des données avant d'utiliser les sites Web de Techem France. Avec cette notification de protection des données, nous déclarons, entre autres, comment nous manipulons vos données personnelles et utilisons des cookies. En utilisant les sites Web de Techem France, vous acceptez ces réglementations.`,
  },
  {
    title: "2. Protection des données",
    content: `Techem France prend très au sérieux la protection de ses données personnelles. Nous traitons vos données personnelles de manière confidentielle et conformément aux dispositions légales en matière de protection des données ainsi qu'à cette déclaration de protection des données.

L'utilisation de notre espace client est généralement possible sans la spécification de données personnelles. Si des données personnelles ou des données personnelles de tiers (par exemple, nom, adresse, numéro de téléphone ou adresses e-mail) sont collectées sur une base volontaire, ces données ne sont pas transmises à des tiers sans votre consentement exprès.

Nous soulignons que le transfert de données sur Internet (par exemple, lors de la communication par courrier électronique) peut présenter des failles de sécurité. Une protection complète des données contre l'accès par des tiers n'est pas possible.`,
  },
  {
    title: "3. Autorité responsable",
    content: `L'autorité responsable du traitement des données personnelles des visiteurs de notre espace client est :

Techem FRANCE  
Eric CHAUMONT  
378-380 avenue de la division Leclerc  
92290 CHATENAY MALABRY  

ainsi que l'une de ses filiales ou les sociétés qui lui sont affiliées.`,
  },
  {
    title: "4. Hébergement",
    content: `Les données personnelles sont toutes les informations relatives à une personne physique identifiée ou identifiable. Une personne physique pouvant être identifiée directement ou indirectement, notamment par attribution à une identification telle qu'un nom, un numéro d'identification, des localisations, une identification en ligne ou à une ou plusieurs particularités qui sont le reflet de facteurs physiques, physiologiques, génétiques, psychologiques, l'identité économique, culturelle ou sociale de cette personne est considérée comme identifiable.`,
  },
  {
    title: "5. Qu'est-ce que les données personnelles?",
    content: `Les données personnelles sont toutes les informations relatives à une personne physique identifiée ou identifiable. Une personne physique pouvant être identifiée directement ou indirectement, notamment par attribution à une identification telle qu'un nom, un numéro d'identification, des localisations, une identification en ligne ou à une ou plusieurs particularités qui sont le reflet de facteurs physiques, physiologiques, génétiques, psychologiques, l'identité économique, culturelle ou sociale de cette personne est considérée comme identifiable.`,
  },
  {
    title:
      "6. Quelles informations collectons-nous? Comment les utilisons-nous?",
    content: `Les données personnelles sont collectées via ce site et enregistrées par la suite, si vous les fournissez volontairement, par exemple dans le cadre d'une inscription, en remplissant des formulaires, en envoyant des emails ou en engageant Techem. Nous utilisons ces données que pour l'exécution du contrat qui nous lie. Une divulgation à des tiers ne se produit que si elle est requise pour l'exécution d'un contrat.`,
  },
  {
    title: "7. Formulaires en ligne",
    content: `Si vous nous envoyez des requêtes à l'aide du formulaire de contact, vos informations du formulaire de requête, y compris les coordonnées que vous nous avez fournies, sont enregistrées dans le but de traiter la requête et pour des questions de suivi. Nous ne transmettons pas ces données sans votre permission.`,
  },
  {
    title:
      "8. Informations personnelles que nous collectons automatiquement sur ce site",
    content: `À chaque accès au site Web de Techem ou à la réception d'un courriel contenant un lien, Techem peut collecter automatiquement certaines informations vous concernant, que vous utilisiez nos services ou non.

En visitant ce site, Techem enregistre simplement une adresse IP raccourcie de l'ordinateur demandeur et le site Web à partir duquel vous avez visité le nôtre. Lors de votre visite, la date d'accès, les noms de fichiers interrogés, l'URL, le code de réponse / réponse HTTP, l'état d'accès, la durée d'accès et les octets transférés dans le cadre de cette connexion sont sauvegardés. Nous utilisons cette information exclusivement à des fins statistiques où les utilisateurs individuels restent anonymes.`,
  },
  {
    title: "9. Etracker",
    content: `Notre site utilise le service d'analyse Etracker. Le fournisseur de services est Etracker GmbH, Erste Brunnenstraße 1, 20459 Hamburg, Allemagne.

Les profils d'utilisation peuvent être créés sous des pseudonymes à partir des données. Les cookies peuvent être utilisés pour cela. Les cookies impliquent de petits fichiers texte qui sont enregistrés localement dans le cache de votre navigateur Internet.

Les cookies permettent la reconnaissance de votre navigateur. Les données collectées avec les technologies Etracker ne sont pas utilisées sans un accord accordé séparément par les parties concernées pour identifier les visiteurs de notre site Web et ne sont pas mises en commun avec les données personnelles en utilisant le porteur du pseudonyme.

Vous pouvez vous opposer à cette collecte et à ce stockage de données à tout moment. Pour stopper la collecte et le stockage de vos données de visiteurs, vous pouvez obtenir un cookie de désactivation sur le lien suivant : http://www.etracker.de/privacy?sid=897433cce9bbcd44aa1e66283e20ba32&id=privacy&et=V23Jbb&languageId=3

Grâce à cela, un Opt-Out-Cookie avec le nom "cntcookie" est placé par Etracker. Veuillez ne pas supprimer ce cookie tant que vous souhaitez conserver votre objection. Pour plus d'informations, consultez les dispositions de protection des données d'Etracker : https://www.etracker.com/de/datenschutz.html`,
  },
  {
    title: "10. Cookies",
    content: `Tous les sites internet utilisent dans une certaine mesure des soi-disant cookies. Les cookies ne causent aucun dommage à votre ordinateur et ne contiennent aucun virus. Ils aident à rendre nos offres plus conviviales, plus efficaces et plus sécurisées. Les cookies sont de petits fichiers texte stockés sur votre ordinateur et enregistrés par votre navigateur.

La majorité des cookies que nous utilisons sont des "cookies de session". Ils sont automatiquement supprimés à la fin de votre visite. Les autres cookies restent enregistrés sur votre terminal jusqu'à leur suppression. Ces cookies nous permettent de reconnaître votre navigateur lors de visites ultérieures.

Vous pouvez configurer votre navigateur pour être informé de l'emplacement des cookies et autoriser ceux-ci uniquement dans certains cas, exclure l'acceptation des cookies ou activer la suppression automatique des cookies en fermant le navigateur. La fonctionnalité de ce site peut être restreinte lors de la désactivation des cookies.`,
  },
  {
    title: "11. Fichiers journaux du serveur",
    content: `Le fournisseur de services de site Web recueille et stocke des informations automatiques dans des fichiers journaux de serveur, qui nous sont automatiquement transmis par votre navigateur. Ceux-ci sont :

- Type de navigateur et version du navigateur  
- Système d'exploitation utilisé  
- URL de référence  
- Adresse IP  
- Nom d'hôte de l'ordinateur accédant  
- Heure de la requête du serveur  

Nous nous réservons le droit de vérifier les données ultérieurement si certaines indications d'utilisation illicite nous sont connues.`,
  },
  {
    title: "12. Cryptage SSL",
    content: `Ce site utilise le cryptage SSL pour des raisons de sécurité et de protection de la transmission de contenus confidentiels, tels que les requêtes que vous nous envoyez en tant qu'opérateur du site. Vous pouvez reconnaître une connexion cryptée par le changement de la barre d'adresse du navigateur de "http://" à "https://" et par le symbole de cadenas. Lorsque le cryptage SSL est activé, les données que vous nous transmettez ne peuvent pas être lues par des tiers.`,
  },
  {
    title: "13. Droit à l'information, suppression, blocage",
    content: `Vous avez le droit d'obtenir gratuitement des informations sur vos données personnelles enregistrées, leur origine et leurs destinataires, le but du traitement des données et un droit à l'autorisation, au blocage ou à la suppression de ces données. Si vous avez des questions à ce sujet ou pour d'autres questions sur les données personnelles, n'hésitez pas à nous contacter à l'adresse indiquée ci-dessous ou par courrier électronique à l'adresse data@techem.fr.`,
  },
  {
    title: "14. Droit d'appel devant une autorité de surveillance",
    content: `Si vous estimez que Techem a enfreint le Règlement Général sur la Protection des Données n°2016/679 du 27 avril 2016 (RGPD), vous pouvez déposer une plainte auprès de la CNIL conformément à la loi.`,
  },
  {
    title: "15. Objection aux e-mails promotionnels",
    content: `Nous nous opposons à l'utilisation des données de contact publiées dans le cadre de l'obligation de publier une empreinte pour la soumission de promotions et de matériel d'information non expressément demandé.

L'exploitant du site se réserve le droit de prendre des mesures juridiques expresses en cas d'envoi non sollicité d'informations promotionnelles, par exemple sous forme de spams.`,
  },
  {
    title: "16. Consentement",
    content: `Le Client s'engage à informer les occupants dont les données sont fournies à la Société sur le traitement des données et les informations y afférentes figurant aux présentes.

Le Client peut contacter Techem par courrier à l'adresse suivante :

Techem  
20 rue Edouard Herriot  
92350 Le Plessis Robinson  

Ou par mail à data@techem.fr  

s'il souhaite accéder, modifier ou supprimer les données personnelles conservées par Techem, restreindre ou s'opposer au traitement et au transfert des données personnelles.`,
  },
  {
    title: "17. Votre sécurité est notre priorité absolue",
    content: `Nous avons pris des précautions de sécurité techniques et opérationnelles importantes, qui sont régulièrement vérifiées et mises à jour, pour la protection des données personnelles que nous conservons contre un accès non autorisé et une mauvaise utilisation.

Si vos données sont traitées chez Techem dans le cadre du traitement central des données pour améliorer le service client ou pour des raisons techniques, des mesures appropriées garantissent que les intérêts de nos clients en matière de protection des données sont pris en compte conformément aux dispositions du RGPD.

Veuillez noter que nous prenons les plus grandes mesures possibles pour assurer une transmission de données sécurisée. La transmission de données sur Internet n'est cependant pas totalement sécurisée. La sécurité des données transmises sur nos sites ne peut donc pas être garantie.

Si nous modifions nos consignes de protection des données, nous publierons les modifications sur ce site afin que vous puissiez toujours savoir comment nous collectons et utilisons les informations.

Sur demande écrite, nous serons heureux de vous informer des données que vous avez stockées à votre sujet.

Vos questions et commentaires sur la protection et la sécurité des données sont les bienvenus chez Techem.`,
  },
];

export default function Rgpd() {
  const [openSections, setOpenSections] = useState<boolean[]>(
    sections.map(() => false)
  );

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.map((isOpen, i) => (i === index ? !isOpen : isOpen))
    );
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          RGPD – Protection des données
        </h1>
        <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
          Informations relatives à la collecte et au traitement de vos données
          personnelles
        </p>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
              >
                <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {section.title}
                </h2>
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  {openSections[index] ? "−" : "+"}
                </span>
              </button>
              {openSections[index] && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

