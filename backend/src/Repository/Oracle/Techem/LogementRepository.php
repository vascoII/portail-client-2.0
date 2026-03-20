<?php

namespace App\Repository\Oracle\Techem;

use App\Oracle\OciFacade;
use App\Service\GetLogementsParams;

class LogementRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getLogements(int $pkUser, int $pkImmeuble, ?GetLogementsParams $params = null)
    {
        return [];
    }

    /// <summary>
    /// Récupère les informations necessaires pour générer le tableau de bord d'un logement
    /// </summary>
    /// <param name="SessionID">Identificateur de session</param>
    /// <param name="PkUser">PK de l'utilisateur</param>
    /// <param name="PkLogement">Pk du logement</param>
    /// <param name="PkOccupant">PK Occupant</param>
    /// <returns></returns>
    public function getTableauBordLogement(string $SessionID, int $PkUser, int $PkLogement, int $PkOccupant)
    {
        // Implémentation Oracle "phase 1" de GetTableauBordLogement (WS2) :
        // on récupère les informations principales logement / occupant / immeuble
        // depuis WEB_LOGEMENT, WEB_OCCUPANT, WEB_IMMEUBLE.

        // Construction dynamique du WHERE comme dans le code C# :
        // - si PkOccupant == -1 → filtre sur PKLOGEMENT
        // - sinon → filtre sur PKOCCUPANT
        if ($PkOccupant === -1) {
            $where = 'WHERE l.PKLOGEMENT = :pkLogement';
            $params = ['pkLogement' => $PkLogement];
        } else {
            $where = 'WHERE o.PKOCCUPANT = :pkOccupant';
            $params = ['pkOccupant' => $PkOccupant];
        }

        $sql = <<<SQL
SELECT
    -- Logement
    l.NUMBATIMENT      AS NUMBATIMENT,
    l.ADRBATIMENT      AS ADRBATIMENT,
    l.NUMESCALIER      AS NUMESCALIER,
    l.ADRESSEESC       AS ADRESSEESC,
    l.NUMETAGE         AS NUMETAGE,
    l.NUMORDRE         AS NUMORDRE,
    l.PKLOGEMENT       AS PKLOGEMENT,
    l.TYPELOGEMENT     AS TYPELOGEMENT,
    l.NBTICKETINTER    AS NBTICKETINTER,
    l.NBEF             AS NBEF,
    l.NBEC             AS NBEC,
    l.NBREPART         AS NBREPART,
    l.NBCET            AS NBCET,
    l.NBCAPTEUR        AS NBCAPTEUR,
    l.NBDEPANNAGES     AS NBDEPANNAGES,
    l.NBFUITES         AS NBFUITES,
    l.NBFUITES_EC      AS NBFUITES_EC,
    l.NBFUITES_EF      AS NBFUITES_EF,
    l.NBALARMS         AS NBALARMS,
    l.NBSUSFRAUDCLI    AS NBSUSFRAUDCLI,
    l.NBANO_EC         AS NBANO_EC,
    l.NBANO_EF         AS NBANO_EF,
    l.FKIMMEUBLE       AS FKIMMEUBLE,

    -- Occupant
    o.PKOCCUPANT       AS PKOCCUPANT,
    o.NOM              AS NOM_OCCUPANT,
    o.CODELOGEGESTIO   AS CODELOGEGESTIO_OCCUPANT,
    o.DATEARRIVEE,
    o.DATEDEPART,
    o.EMAIL,
    o.TELFIXE,
    o.TELMOBILE,

    -- Immeuble
    i.PKIMMEUBLE,
    i.CP,
    i.VILLE,
    i.ADRESSE          AS ADRESSE1,
    i.NOM,
    i.ID,
    i.ADRESSE2,
    i.ADRESSE3,
    i.ACTIF,
    i.CODEGESTIO,
    i.TELERELEVE,
    i.FKCLIENTTOP,
    i.NOTEOCCUPANT,
    i.ESPACECLIENT_SHOWBILLINGOCC,
    i.ESPACECLIENT_SHOWFACTURES,
    i.ESPACECLIENT_SHOWCHANTIERS,
    i.ESPACECLIENT_DATEACTIVATIONOCC
FROM WEB_LOGEMENT l
JOIN WEB_OCCUPANT o ON o.FKLOGEMENT = l.PKLOGEMENT
JOIN WEB_IMMEUBLE i ON i.PKIMMEUBLE = l.FKIMMEUBLE
{$where}
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, $params);
        if ($rows === []) {
            return null;
        }

        $row = $rows[0];

        // Présence compteur Eau Chaude
        $LogementEC = (int) ($row['NBEC'] ?? 0) > 0 ? [
            'LogementEC' => [
                'NbFuites' => (int) ($row['NBFUITES_EC'] ?? 0),
                'NbAnomalies' => (int) ($row['NBANO_EC'] ?? 0),
                'ConsoPeriode' => [],
                'ListeInfosAppareils' => [],
                'SerieConsos' => [],
                'ConsoMemeTypeLogement' => ""
            ]
        ] : ['LogementEC' => []];
        // Présence compteur Eau Froide
        $LogementEF = (int) ($row['NBEF'] ?? 0) > 0 ? [
            'LogementEF' => [
                'NbFuites' => (int) ($row['NBFUITES_EF'] ?? 0),
                'NbAnomalies' => (int) ($row['NBANO_EF'] ?? 0),
                'ConsoPeriode' => [],
                'ListeInfosAppareils' => [],
                'SerieConsos' => [],
                'ConsoMemeTypeLogement' => ""
            ]
        ] : [
        'LogementEF' => []];
        // Présence compteur Repartiteurs
        $LogementRepart = [
            'LogementRepart' => []
        ];
        // Présence compteur Compteur électrique
        $LogementCET = [
            'LogementCET' => []
        ];
        // Présence capteurs 
        $LogementCapteur = [
            'LogementCapteur' => []
        ];

        // Retourner une structure simple, qui sera normalisée côté contrôleur.
        $mainData = [
            'Immeuble' => [
                'PkImmeuble' => (int) ($row['PKIMMEUBLE'] ?? 0),
                'Cp' => $row['CP'] ?? null,
                'Ville' => $row['VILLE'] ?? null,
                'Adresse1' => $row['ADRESSE1'] ?? null,
                'Adresse2' => $row['ADRESSE2'] ?? null,
                'Adresse3' => $row['ADRESSE3'] ?? null,
                'Nom' => $row['NOM'] ?? null,
                'Id' => $row['ID'] ?? null,
                'Actif' => $row['ACTIF'] ?? null,
                'CodeGestio' => $row['CODEGESTIO'] ?? null,
                'Telereleve' => $row['TELERELEVE'] ?? null,
                'FkClientTop' => $row['FKIMMEUBLE'] ?? null,
            ],
            'Logement' => [
                'PkLogement' => (int) ($row['PKLOGEMENT'] ?? 0),
                'TypeLogement' => $row['TYPELOGEMENT'] ?? null,
                'NumBatiment' => $row['NUMBATIMENT'] ?? null,
                'AdrBatiment' => $row['ADRbatiment'] ?? $row['ADRbatiment'] ?? null,
                'NumEscalier' => $row['NUMESCALIER'] ?? null,
                'AdresseEsc' => $row['ADRESSEESC'] ?? null,
                'NumEtage' => $row['NUMETAGE'] ?? null,
                'NumOrdre' => $row['NUMORDRE'] ?? null,
            ],
            'Occupant' => [
                'PkOccupant' => (int) ($row['PKOCCUPANT'] ?? 0),
                'Nom' => $row['NOM_OCCUPANT'] ?? null,
                'CodeLogeGestio' => $row['CODELOGEGESTIO_OCCUPANT'] ?? null,
                'DateArrivee' => $row['DATEARRIVEE'] ?? null,
                'DateDepart' => $row['DATEDEPART'] ?? null,
                'Email' => $row['EMAIL'] ?? null,
                'TelFixe' => $row['TELFIXE'] ?? null,
                'TelMobile' => $row['TELMOBILE'] ?? null,
            ],
            'NbCompteursEC' => (int) ($row['NBEC'] ?? 0),
            'NbCompteursEF' => (int) ($row['NBEF'] ?? 0),
            'NbCompteursRepart' => (int) ($row['NBREPART'] ?? 0),
            'NbCompteursCET' => (int) ($row['NBCET'] ?? 0),
            'NbCompteursCapteur' => (int) ($row['NBCAPTEUR'] ?? 0),
            'NbAppareils' => (int) ($row['NBEC'] ?? 0)
                + (int) ($row['NBEF'] ?? 0)
                + (int) ($row['NBREPART'] ?? 0)
                + (int) ($row['NBCET'] ?? 0),
            'NbDepannages' => (int) ($row['NBDEPANNAGES'] ?? 0),
            'NbFuites' => (int) ($row['NBFUITES'] ?? 0),
            'NbFuitesEC' => (int) ($row['NBFUITES_EC'] ?? 0),
            'NbFuitesEF' => (int) ($row['NBFUITES_EF'] ?? 0),
            'NbDysfonctionnements' => (int) ($row['NBSUSFRAUDCLI'] ?? 0),
            'NbAnomaliesEC' => (int) ($row['NBANO_EC'] ?? 0),
            'NbAnomaliesEF' => (int) ($row['NBANO_EF'] ?? 0),
            'NbTicketsInter' => (int) ($row['NBTICKETINTER'] ?? 0),
        ];

        $mainData = array_merge($mainData, $LogementEC);
        $mainData = array_merge($mainData, $LogementEF);
        $mainData = array_merge($mainData, $LogementRepart);
        $mainData = array_merge($mainData, $LogementCET);
        $mainData = array_merge($mainData, $LogementCapteur);
        
        return $mainData;
    }

    public function getTableauBordImmeuble(int $pkUser, int $pkImmeuble)
    {
        return [];
    }

    public function getFuitesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null)
    {
        return [];
    }

    public function getDysfonctionnementsImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null)
    {
        return [];
    }

    public function getAnomaliesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null)
    {
        return [];
    }
    
    /// <summary>
        /// Retourne un ticket d'intervention initialisé avec les informations du logement
        /// à la création d'un ticket, permet de récupérer les données par logement 
        /// pour les afficher, par défaut, dans le formulaire
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk du logement</param>
        /// <returns></returns>
    public function getTicketInterInit(string $SessionID, int $PkUser, int $PkLogement)
    {
        // Version simplifiée de GetTicketInterInit (WS2) basée sur Oracle.
        //
        // L'objectif est de pré-remplir le formulaire de ticket à partir
        // des informations de l'occupant actuel du logement.

        $sql = <<<SQL
SELECT
    o.NOM      AS NOM,
    o.TELFIXE  AS TELFIXE,
    o.TELMOBILE AS TELMOBILE,
    o.EMAIL    AS EMAIL
FROM WEB_LOGEMENT l
JOIN WEB_OCCUPANT o
  ON o.FKLOGEMENT = l.PKLOGEMENT
WHERE l.PKLOGEMENT = :pkLogement
  AND (o.DATEDEPART IS NULL OR o.DATEDEPART > SYSDATE)
FETCH FIRST 1 ROWS ONLY
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkLogement' => $PkLogement]);

        $result = [
            'FkLogement' => $PkLogement,
            'Nom' => null,
            'TelFixe' => null,
            'TelMobile' => null,
            'Email' => null,
            'Erreur' => null,
        ];

        if ($rows === []) {
            // Pas d'occupant trouvé : on renvoie un ticket vide sans erreur bloquante.
            return $result;
        }

        $row = $rows[0];

        $result['Nom'] = $row['NOM'] ?? null;
        $result['TelFixe'] = $row['TELFIXE'] ?? null;
        $result['TelMobile'] = $row['TELMOBILE'] ?? null;
        $result['Email'] = $row['EMAIL'] ?? null;

        return $result;
    }

    public function getMyTableauBordClient(int $pkUser)
    {
        return [];
    }

    public function getInfosAppareilsType(int $pkUser, int $pkLogement, array $type)
    {
        return [];
    }

    /// <summary>
    /// Retourne le nombre d'intervention pour un logement
    /// </summary>
    /// <param name="SessionID">Identificateur de session</param>
    /// <param name="PkUser">PK de l'utilisateur</param>
    /// <param name="PkLogement">PK Logement</param>
    /// <param name="ParamsFiltres">Filtres </param>
    /// <returns></returns>
    public function getNbTicketsInterByLogement(string $SessionID, int $PkUser, int $PkLogement, string $ParamsFiltres)
    {
        // Version Oracle simple : on renvoie le compteur stocké sur WEB_LOGEMENT
        // (NB TICKETINTER), sans tenir compte des filtres avancés.

        $sql = <<<SQL
SELECT NVL(NBTICKETINTER, 0) AS NBTICKETINTER
FROM WEB_LOGEMENT
WHERE PKLOGEMENT = :pkLogement
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkLogement' => $PkLogement]);

        if ($rows === []) {
            return 0;
        }

        return (int) ($rows[0]['NBTICKETINTER'] ?? 0);
    }

    /// <summary>
    /// Retourne la liste des changements d'occupants
    /// </summary>
    /// <param name="SessionID">Identificateur de session</param>
    /// <param name="PkUser">PK de l'utilisateur</param>
    /// <param name="PkImmeuble">PK Immeuble</param>
    /// <param name="PkOccupant">PK Occupant</param>
    /// <param name="isNew"></param>
    /// <returns></returns>
    public function getOccupants(int $pkUser, int $pkLogement, int $pkOccupant, bool $isActif = true)
    {
        // Version Oracle simplifiée de la liste des occupants,
        // limitée au logement / occupant passés en paramètre.

        $params = ['pkLogement' => $pkLogement];
        $whereExtra = '';

        if ($pkOccupant !== -1) {
            $whereExtra .= ' AND o.PKOCCUPANT = :pkOccupant';
            $params['pkOccupant'] = $pkOccupant;
        }

        if ($isActif) {
            $whereExtra .= ' AND (o.DATEDEPART IS NULL OR o.DATEDEPART > SYSDATE)';
        }

        $sql = <<<SQL
SELECT
    o.PKOCCUPANT,
    o.NOM,
    o.CODELOGEGESTIO,
    o.DATEARRIVEE,
    o.DATEDEPART,
    o.EMAIL,
    o.TELFIXE,
    o.TELMOBILE,
    o.NUMBAIL
FROM WEB_LOGEMENT l
JOIN WEB_OCCUPANT o
  ON o.FKLOGEMENT = l.PKLOGEMENT
WHERE l.PKLOGEMENT = :pkLogement
{$whereExtra}
ORDER BY o.PKOCCUPANT DESC
SQL;

        return $this->oci->fetchAllAssoc($sql, $params);
    }

    public function getDetailDepannage(int $pkUser, int $pkIntervention)
    {
        return [];
    }

    public function getInterventionsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement)
    {
        return [];
    }
    
}
