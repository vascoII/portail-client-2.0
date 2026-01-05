"use client";

import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";

const CGU_CONTENT = `
Objet
La société TECHEM (ci-après « TECHEM ») est une société par actions simplifiée, inscrite au RCS de Nanterre sous le numéro 439 290 685, dont le siège social est sis 380 avenue de la division Leclerc - 92290 CHATENAY MALABRY.

TECHEM met à la disposition de ses clients un accès personnalisé à une interface de gestion de l'ensemble de leurs immeubles (ci-après « Espace Client »), permettant le suivi des consommations de leur parc d'immeubles (ci-après « les Services »). L'interface de TECHEM est accessible à l'adresse URL « client.techem.fr » (ci-après le « Site »).

Les présentes conditions générales d'utilisation (ci-après les « CGU ») décrivent les modalités et les conditions d'utilisation des Services, applicables sans réserve à tout client de TECHEM gestionnaire d'immeubles (ci-après « le Client »), ayant souscrit auxdits Services par l'acceptation des présentes CGU.

Le Client déclare avoir pris connaissance, préalablement à sa souscription aux présentes CGU, de toutes les caractéristiques informationnelles et techniques des Services et avoir demandé toutes précisions qu'il estimerait nécessaires concernant le mode de fonctionnement et le contenu des Services. Après avoir pris connaissance de l'ensemble des caractéristiques et conditions d'accès aux Services, le Client accepte les présentes CGU en cochant la case « J'accepte les Conditions Générales d'Utilisation ».

Les présentes CGU complètent le contrat de fourniture et/ou de maintenance des compteurs conclu entre TECHEM et le Client. En cas de contradiction entre les présentes CGU et le contrat mentionné ci-avant, le contrat prévaudra sur les CGU.

Inscription aux Services
L'accès à l'Espace Client et les Services sont réservés aux professionnels de la gestion d'immeubles liés à TECHEM par un contrat de fourniture et/ou d'entretien de compteurs. L'accès à l'Espace Client et les Services sont ainsi exclusivement réservés aux gestionnaires de copropriété, aux administrateurs de biens, aux syndics bénévoles et aux bailleurs sociaux (à l'exclusion notamment des occupants et des membres du conseil syndical).

Une fois inscrit, le Client devient utilisateur et a accès aux Services (ci-après « Utilisateur »).

Aux fins d'activation du compte, TECHEM adressera un identifiant et un code d'accès à l'Utilisateur à sa demande.

Conditions d'accès aux Services
a) Codes d'accès

Sur simple demande, l'Utilisateur reçoit, dans les conditions décrites ci-dessus, son identifiant et le code d'accès personnels et confidentiels, servant à l'identifier et à permettre une connexion à l'Espace Client et aux Services.

Lors de l'activation du compte et de l'accès à l'Espace Client, l'Utilisateur a accès à l'ensemble de son parc d'immeubles, et peut désigner des utilisateurs autorisés (ci-après « l'Utilisateur Autorisé » et/ou « Utilisateurs Autorisés ») en précisant, le cas échéant, les immeubles ou bâtiments gérés par chaque Utilisateur Autorisé, de manière à hiérarchiser les droits d'accès. Les Utilisateurs Autorisés ainsi désignés, reçoivent leur code d'accès par e-mail.

L'Utilisateur est seul responsable de l'utilisation de son compte ; toute connexion ou transmission de données effectuée en utilisant les Services liés à son compte sera réputée avoir été effectuée par lui-même et sous sa responsabilité exclusive. Il est également précisé que l'Utilisateur est entièrement et exclusivement responsable de l'usage des Services par lui-même et par tout tiers.

Afin de préserver le caractère personnel et confidentiel de leur accès, TECHEM recommande aux Utilisateurs de quitter leurs comptes à la fin de chacune des sessions en cliquant sur « déconnexion » ou toute mention assimilée.

b) Conditions d'accès au Site et aux Services

Les Services ne sont accessibles qu'aux seules personnes physiques autorisées par l'Utilisateur - c'est-à-dire les Utilisateurs Autorisés - à utiliser les Services, étant précisé que l'Utilisateur ne peut autoriser des personnes autres que ses utilisateurs internes à son organisme à accéder aux Services.

Les Services doivent être utilisés dans le respect de la législation et de la réglementation applicables.

L'Utilisateur s'engage expressément :

à préserver la confidentialité de son code d'identification et à prendre les mesures nécessaires pour qu'aucun tiers, en quelque qualité que ce soit, ait accès son code d'accès et/ou à son mot de passe et puisse ainsi accéder illicitement à son Espace Client et aux Services ;
à informer immédiatement TECHEM en cas de vol, perte ou utilisation illicite du code d'accès et/ou du mot de passe afin que TECHEM puisse prendre les mesures de sécurité nécessaires et renvoyer à l'Utilisateur de nouveaux identifiant et/ou mot de passe ;
à faire respecter l'étendue de ces obligations par ses Utilisateurs Autorisés, de manière générale à faire respecter les présentes CGU.
Tout usage de l'accès de l'Utilisateur par une personne non autorisée engage la responsabilité de l'Utilisateur.

Le respect par l'Utilisateur et par ses Utilisateurs Autorisés des obligations précisées ci-dessus constitue une condition substantielle des CGU. En conséquence, TECHEM se réserve le droit de suspendre l'accès au Site et aux Services sans avoir à respecter un quelconque préavis dès lors que l'Utilisateur ou ses Utilisateurs Autorisés ne respectent pas tout ou partie des obligations précisées ci-dessus, et ce sans préjudice des dommages et intérêts qui pourraient être dus à TECHEM ni de toute autre voie de recours qui pourrait être exercée à l'encontre de l'Utilisateur et des Utilisateurs Autorisés.

L'accès de l'Utilisateur et de l'Utilisateur Autorisé aux Services se fait selon les modalités techniques suivantes : via l'URL public www.techem.fr et après saisine du code d'identification composé d'un code d'accès et d'un mot de passe. Le code d'identification est attribué par TECHEM conformément aux dispositions ci-dessus.

L'Utilisateur et les Utilisateurs Autorisés peuvent accéder aux services 24 heures sur 24, 7 jours sur 7, sauf cas de force majeure ou événements hors du contrôle de TECHEM et sous réserve des éventuelles interventions de maintenance et mises à jour nécessaires au bon fonctionnement du Site et des matériels. L'Utilisateur est informé que les Services pourront être suspendus sans préavis notamment pour ses opérations de maintenance et de mises à jour.

c) Conditions d'utilisation des Services

L'Utilisateur a accès à un espace privé, l'Espace Client, qui lui est dédié et dans lequel il accède aux données concernant les immeubles dont il a la gérance. Néanmoins, il est expressément précisé que TECHEM ne garantit pas la disponibilité permanente et définitive de ces données, étant rappelé que l'Utilisateur peut à tout moment prendre une copie de ses données.

L'Utilisateur se connectant au Site pourra notamment :

accéder à l'ensemble des immeubles dont il a la gérance,
pour chaque immeuble, consulter : les relevés de consommations, les statistiques, les rendez-vous d'intervention planifiés et ceux déjà réalisés, le compte rendu des interventions, la consommation par logement (dont la périodicité dépend des conditions contractuelles),
télécharger des documents sous format PDF, ou exporter des données vers un document en format Excel,
accéder à la répartition des charges d'eau.
d) Obligation d'information à la charge du Client

Le Client s'engage à prévenir TECHEM par écrit par envoi d'un e-mail à l'adresse commercial@techem.fr dans les plus brefs délais de tout changement concernant les immeubles dont il a la gestion, et à paramétrer son compte pour ne plus avoir accès aux immeubles qu'il ne gère plus. A cet effet, TECHEM pourra prendre toute mesure qu'elle estime utile ou nécessaire pour interrompre l'accès aux données relatives aux immeubles que le Client ne gère plus.

Évolution des Services
TECHEM a la faculté d'apporter toutes les modifications nécessaires à l'évolution de son Site, ainsi qu'aux Services. Elle est seule juge des modifications à apporter, tant du point de vue technique qu'esthétique.

TECHEM se réserve également le droit de modifier la teneur des CGU à tout moment et notifiera à l'Utilisateur les modifications ainsi effectuées par courrier électronique ou par tout autre moyen adéquat. Les nouvelles CGU entreront en vigueur à compter de leur date de notification par courrier électronique (e-mail) à l'Utilisateur.

Responsabilité
TECHEM est soumise à une obligation de moyens pour l'exécution des Services et l'accès au Site et à l'Espace Client.

La description des Services dans les présentes CGU est donnée à titre indicatif, les Services étant notamment susceptibles d'évoluer, par exemple pour s'adapter aux évolutions techniques, informatiques ou législatives.

TECHEM ne garantit pas un accès continu à ces Services, le bon fonctionnement du Site et des Services pouvant être affecté par des facteurs qui ne sont pas contrôlés par TECHEM. Pour des raisons techniques, notamment de maintenance ou de panne de réseau ou du Site, une interruption momentanée des Services est possible sans que celui puisse engager la responsabilité de TECHEM.

En outre, l'Utilisateur reconnaît et accepte les contraintes et limites du réseau Internet, notamment en matière de transmission de données d'information via les réseaux et d'atteintes aux données. Il appartient à l'Utilisateur de prendre toutes mesures nécessaires pour s'assurer que les caractéristiques techniques de son ordinateur et/ou de son réseau informatique lui permettent l'accès aux Services. L'Utilisateur reconnaît avoir pris connaissance des configurations minimales requises pour l'utilisation normale des services, consultables sur le Site.

L'Utilisateur est seul responsable de l'utilisation qu'il fait des Services et ne saurait tenir responsable TECHEM pour toute réclamation et/ou procédure faite à son encontre.

En aucun cas TECHEM n'engagera sa responsabilité pour les dommages directs ou indirects qui pourraient être causés par les Services. De convention expresse entre les parties, sont considérés comme dommages indirects tout préjudice moral ou commercial, pertes de bénéfices, de chiffre d'affaires, de revenus, de clientèle, pertes de données et toute action dirigée contre le Client par un tiers et les conséquences en résultant.

Propriété intellectuelle
Les présentes CGU et l'accès au Site et aux Services ne confèrent à l'Utilisateur aucun droit de propriété intellectuelle sur les éléments constituant le Site et les Services, qui demeurent la propriété entière et exclusive de TECHEM.

L'Utilisateur s'interdit donc formellement d'intervenir ou de faire intervenir un tiers sur le Site et les Services.

La mise à disposition du Site et des Services ne saurait être considérée comme une cession au sens du Code de la propriété intellectuelle d'un quelconque droit de propriété intellectuelle au bénéfice de l'Utilisateur.

En utilisant le Site, l'Utilisateur s'engage à ne pas :

procéder à une quelconque atteinte aux systèmes informatisés mis en œuvre pour la fourniture des Services, en ce compris toute intrusion ou tentative d'intrusion ;
procéder à une quelconque opération d'ingénierie inversée de tout ou partie des Services ;
compiler, décompiler ou désassembler tout ou partie des Services ;
modifier ou créer des programmes développés sur tout ou partie des services, y compris pour corriger d'éventuelles erreurs ;
distribuer et/ou diffuser des copies de tout ou partie des Services ;
revendre, louer, sous-louer ou transférer de quelque manière que ce soit à un tiers les Services.
Données à caractère personnel
a) Données à caractère personnel de l'Utilisateur et des Utilisateurs Autorisés

Les informations collectées, y compris, sans s'y limiter, les coordonnées du contact au sein de l'entité du Client, les informations sur les occupants des logements gérés par les clients, leurs compteurs et relevés de consommation d'eau et de chauffage des occupants et les données nécessaires à la facturation des clients, sont traitées avec attention dans le strict respect des lois applicables en matière de protection des données, notamment du Règlement Général sur la Protection des Données n° 2016/679 du 27 avril 2016 (désigné « RGPD »). Ces données personnelles ne seront traitées que pour l'exécution du contrat à des fins de gestion des commandes et des dossiers clients (par exemple, livraison, facturation, service client, gestion des réclamations, traitement des comptes, installation des relevés de consommation d'eau et/ou de chauffage, fourniture des informations sur la consommation d'eau et de chauffage des usagers, notamment par un espace client). Les destinataires de ces données au sein de TECHEM sont la comptabilité, service exploitation et le service commercial. Nous / TECHEM conserverons les données personnelles pendant la durée nécessaire pour exécuter le contrat et pour une période maximale de dix ans après la fin du contrat. Les données ne seront pas utilisées dans le cadre de prise de décision automatisée. Le Client s'engage à informer les occupants dont les données sont fournies à la Société sur le traitement des données et les informations y afférentes figurant aux présentes Le Client peut contacter TECHEM par courrier à l'adresse suivante : Techem 378-380 avenue de la division Leclerc 92290 Chatenay Malabry Ou par mail data@techem.fr s'il souhaite: • Accéder, modifier ou supprimer les données personnelles conservées par TECHEM, • Restreindre ou s'opposer au traitement et au transfert des données personnelles. Si vous estimez que TECHEM a enfreint le Règlement Général sur la Protection des Données n° 2016/679 du 27 avril 2016 (RGPD), vous pouvez déposer une plainte auprès de la CNIL conformément à la loi.

b) Informations relatives aux traitements de données à caractère personnel des occupants des appartements et locaux concernés

Les Parties s'engagent à collecter et à traiter toute donnée personnelle des occupants des appartements et locaux concernés en conformité avec toute réglementation en vigueur applicable au traitement de ces données, et notammentau règlement Général sur la Protection des Données n° 2016/679 du 27 avril 2016 (RGPD). Au regard de ce règlement, le Client est responsable du traitement de données à caractère personnel réalisé.

TECHEM précise que les informations recueillies par les compteurs et, partant, figurant dans l'Espace Client, ne permettent pas d'avoir une connaissance précise des consommations journalières des occupants, les indications étant données par 100 litres d'eau consommée, afin de pouvoir notamment détecter des anomalies telles que des suspicions de fuite.

TECHEM s'engage à communiquer au Client la survenance de toute faille de sécurité du Site ayant des conséquences directes ou indirectes sur le traitement des données à caractère personnel, ainsi que toute plainte qui lui serait adressée par tout individu concerné par ledit traitement réalisé au titre des CGU. Cette communication devra être effectuée dans les plus brefs délais après la découverte de la faille de sécurité ou suivant réception d'une plainte.

TECHEM s'engage à coopérer avec le Client et à l'aider à satisfaire aux exigences légales relatives à la protection des données à caractère personnel qui incombent à ce dernier, afin notamment de respecter les droits des personnes concernées en vertu des articles 38 à 43 de la loi n°78-17 du 6 janvier 1978 modifiée.

Les Parties s'engagent à coopérer avec les autorités de protection des données compétentes, notamment en cas de demande d'information qui pourrait leur être adressée ou en cas de contrôle.

c) Localisation et transferts des données à caractère personnel des occupants des logements concernés

TECHEM informe le Client que les données à caractère personnel seront hébergées dans des serveurs localisés en France. En cas de modification des pays destinataires par TECHEM, cette dernière devra en informer préalablement le Client sans délai et obtenir son consentement écrit. Le cas échéant, TECHEM devra fournir au Client une liste des pays destinataires mise à jour.

d) Formalités

Le Client s'acquittera des formalités déclaratives relatives au traitement de données à caractère personnel auprès des autorités de protection des données à caractère personnel compétentes. TECHEM s'engage à lui fournir toute information utile afin de procéder à ces formalités.

Le Client informera les occupants des logements concernés du traitement des données à caractère personnel mis en œuvre et, le cas échéant, obtiendra auprès des occupants tout consentement nécessaire.

TECHEM s'engage à fournir, sur simple demande du Client, toute information utile afin de lui permettre de procéder à ces formalités.

e) Sécurité et confidentialité

TECHEM agira uniquement sur les instructions du Client. A ce titre, TECHEM s'engage à ne pas utiliser les données à caractère personnel pour son propre compte ou pour celui d'un tiers.

Conformément à l'article 34 de la loi Informatique et Libertés modifiée, TECHEM s'engage à prendre toutes précautions utiles afin de préserver la sécurité des informations et notamment de les protéger contre toute destruction accidentelle ou illicite, perte accidentelle, altération, diffusion ou accès non autorisés, ainsi que contre toute autre forme de traitement illicite ou communication à des personnes non autorisées.

Durée - résiliation
La présente convention est conclue pour une durée indéterminée. L'Utilisateur peut fermer son compte à tout moment sur simple demande écrite commercial@techem.fr

La présente convention pourra être résiliée automatiquement et de plein droit par TECHEM dans l'hypothèse où l'Utilisateur ne respecte pas les obligations mises à sa charge, ce qui aura pour effet de mettre fin à l'accès au Site et aux Services.

La résiliation des présentes CGU n'a pas, en tant que telle, pour effet la résiliation du contrat de fourniture et/ou de maintenance des compteurs liant le Client et TECHEM.

La résiliation du contrat de fourniture et/ou de maintenance des compteurs liant le Client et TECHEM entraînera automatiquement la résiliation des présentes CGU et de l'accès du Client au Site et aux Services.

Loi applicable
Les présentes CGU sont soumises à la loi française.`;

interface CGUSection {
  title: string;
  subsections: Array<{
    subtitle?: string;
    content: string;
  }>;
}

/**
 * Parse le contenu des CGU pour identifier les titres et sous-titres
 */
function parseCGUContent(content: string): CGUSection[] {
  const lines = content.split("\n");
  const sections: CGUSection[] = [];
  let currentSection: CGUSection | null = null;
  let currentSubsection: { subtitle?: string; content: string } | null = null;

  // Liste des titres principaux identifiés
  const mainTitles = [
    "Objet",
    "Inscription aux Services",
    "Conditions d'accès aux Services",
    "Évolution des Services",
    "Responsabilité",
    "Propriété intellectuelle",
    "Données à caractère personnel",
    "Durée - résiliation",
    "Loi applicable",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignorer les lignes vides
    if (!line) {
      continue;
    }

    // Vérifier si c'est un titre principal
    if (mainTitles.includes(line)) {
      // Sauvegarder la section précédente si elle existe
      if (currentSection) {
        if (currentSubsection && currentSubsection.content.trim()) {
          currentSection.subsections.push(currentSubsection);
        }
        sections.push(currentSection);
      }

      // Créer une nouvelle section
      currentSection = {
        title: line,
        subsections: [],
      };
      currentSubsection = null;
      continue;
    }

    // Vérifier si c'est un sous-titre (commence par une lettre suivie de ")" comme "a)", "b)", etc.)
    const subtitleMatch = line.match(/^([a-e])\)\s*(.+)$/);
    if (subtitleMatch && currentSection) {
      // Sauvegarder le sous-titre précédent si il existe
      if (currentSubsection && currentSubsection.content.trim()) {
        currentSection.subsections.push(currentSubsection);
      }

      // Créer un nouveau sous-titre
      currentSubsection = {
        subtitle: line,
        content: "",
      };
      continue;
    }

    // Ajouter le contenu
    if (currentSection) {
      if (currentSubsection) {
        // Ajouter au contenu du sous-titre
        currentSubsection.content += (currentSubsection.content ? "\n" : "") + line;
      } else {
        // Créer un sous-titre par défaut si aucun n'existe (contenu avant les sous-titres)
        currentSubsection = {
          content: line,
        };
      }
    }
  }

  // Ajouter la dernière section
  if (currentSection) {
    if (currentSubsection && currentSubsection.content.trim()) {
      currentSection.subsections.push(currentSubsection);
    }
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Valide si une chaîne est un email valide
 */
function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function CGUPageClient() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);

  // Validation des champs
  const isEmailValid = email ? isValidEmail(email) : false;
  const isConfirmEmailValid = confirmEmail ? isValidEmail(confirmEmail) : false;
  const emailsMatch = email && confirmEmail && email === confirmEmail;
  
  // Messages d'info/erreur
  const emailError = email && !isEmailValid ? "Veuillez entrer une adresse email valide" : "";
  const confirmEmailError = confirmEmail && !isConfirmEmailValid 
    ? "Veuillez entrer une adresse email valide" 
    : confirmEmail && isConfirmEmailValid && !emailsMatch
    ? "Les adresses email ne correspondent pas"
    : "";

  // Le bouton est enabled uniquement si :
  // - Email est valide
  // - Confirmation Email est valide
  // - Les deux emails correspondent
  // - La case est cochée
  const isFormValid = isEmailValid && isConfirmEmailValid && emailsMatch && acceptCGU;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ne rien faire pour le moment
  };

  const sections = parseCGUContent(CGU_CONTENT);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
        Première connexion: Vous devez valider les CGU pour pouvoir accéder à l&apos;espace client.
      </h1>

      {/* Contenu des CGU */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {section.title}
              </h2>
              {section.subsections.length > 0 ? (
                section.subsections.map((subsection, subsectionIndex) => (
                  <div key={subsectionIndex} className="space-y-2">
                    {subsection.subtitle && (
                      <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">
                        {subsection.subtitle}
                      </h3>
                    )}
                    {subsection.content.trim() && (
                      <div className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
                        {subsection.content.trim()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Aucun contenu disponible pour cette section.
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Formulaire d&apos;acceptation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              hint={emailError}
            />
          </div>

          <div>
            <Label htmlFor="confirmEmail">
              Confirmation Email <span className="text-error-500">*</span>
            </Label>
            <Input
              id="confirmEmail"
              type="email"
              placeholder="Confirmez votre adresse email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              error={!!confirmEmailError}
              hint={confirmEmailError}
            />
          </div>

          <div>
            <Checkbox
              id="acceptCGU"
              checked={acceptCGU}
              onChange={setAcceptCGU}
              label="J'accepte les Conditions Générales d'Utilisation"
            />
          </div>

          <div>
            <Button 
              type="submit" 
              size="sm" 
              className="w-full sm:w-auto"
              disabled={!isFormValid}
            >
              Valider
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
