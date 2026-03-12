<?php

namespace App\Repository\Oracle;

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

        // Retourner une structure simple, qui sera normalisée côté contrôleur.
        return [
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
        /**
        //WEBTODO TODO :
        // - logement remplace par web_logement
#if WS2
            tableauDeBordLogement TBLogement = new tableauDeBordLogement();
            bool IsTbOccupant; // servira éventuellement à savoir si tableau de bord logement (gestionnaires etc...) ou user de type occupant
            try
            {
                DateTime LastDateIndex = getLastDateIndex();
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TBLogement.Erreur = "incohérence de session";
                    return TBLogement;
                }

                if (PkLogement != -1 && PkOccupant != -1)
                {
                    TBLogement.Erreur = "On doit spécifier PkLogement ou PkOccupant";
                    return TBLogement;
                }
                if (PkLogement == -1 && PkOccupant == -1)
                {
                    TBLogement.Erreur = "On doit spécifier un PkLogement ou un PkOccupant";
                    return TBLogement;
                }
                if (!(PkLogement != -1 || PkOccupant != -1))
                {
                    TBLogement.Erreur = "PkLogement ou PkOccupant doit être à -1";
                    return TBLogement;
                }

                string whereLGT = "";
                if (PkOccupant == -1)// si on a passé le Pklogement (on va récupérer son occupant)
                {
                    IsTbOccupant = false;
                    whereLGT = $@" WHERE pklogement = {PkLogement}";
                }
                else // sinon, on a passé le PkOccupant (on va récupérer son logement)
                {
                    IsTbOccupant = true;
                    whereLGT = $@" WHERE pkoccupant = {PkOccupant}";
                }

                string queryLGT = $@"SELECT web_logement.numbatiment AS numbatiment, web_logement.adrbatiment AS adrbatiment,
                                        web_logement.numescalier, web_logement.adresseesc AS adrescalier,
                                        web_logement.numetage, web_logement.numordre, web_logement.pklogement, 
                                        web_logement.typelogement, 
                                        web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio,
                                        web_occupant.datearrivee, web_occupant.datedepart, web_logement.fkimmeuble,
                                        web_logement.nbticketinter,
                                        web_logement.nbef,
                                        web_logement.nbec,
                                        web_logement.nbrepart,
                                        web_logement.nbcet,
                                        web_logement.nbcapteur,
                                        web_logement.nbdepannages,
                                        web_logement.nbfuites,
                                        web_logement.nbfuites_ec,
                                        web_logement.nbfuites_ef,
                                        web_logement.nbalarms,
                                        web_logement.nbsusfraudcli,
                                        web_logement.nbano_ec ,
                                        web_logement.nbano_ef ,
                                        web_immeuble.pkimmeuble, web_immeuble.cp, web_immeuble.ville, web_immeuble.adresse, 
                                        web_immeuble.nom, web_immeuble.id, web_immeuble.adresse2, web_immeuble.adresse3, 
                                        web_immeuble.actif, web_immeuble.codegestio, web_immeuble.telereleve, web_immeuble.fkclienttop,
                                        web_immeuble.noteoccupant, web_immeuble.espaceclient_showbillingocc,
                                        web_immeuble.espaceclient_showfactures, web_immeuble.espaceclient_showchantiers, 
                                        web_immeuble.espaceclient_dateactivationocc
                                    FROM web_logement, web_immeuble, web_occupant "
                                        + whereLGT + $@" and web_logement.fkimmeuble = web_immeuble.pkimmeuble 
                                            AND web_occupant.fklogement = web_logement.pklogement ";

                DataRow drLogement = WS_DBUtils.utils_LER.DBSelectRow(queryLGT);

                TBLogement.Immeuble = GetImmeubleByRow(drLogement);
                TBLogement.Logement = GetLogementByRow(drLogement);
                TBLogement.Occupant = GetOccupantByRow(drLogement);

                bool HasNoteOccupant = false;
                bool HasDecompteOccupant = false;
                bool HasFactures = false;
                bool HasChantiers = false;
                DateTime DateActivationCli = DateTime.MinValue;
                DateTime DateActivationOcc = DateTime.MinValue;
                string espaceclient_gestion = string.Empty;

                try
                {
                    DataRow c = WS_DBUtils.utils_LER.DBSelectRow(
                    $@"SELECT web_client.noteoccupant, web_client.espaceclient_dateactivationcli, 
                        web_client.espaceclient_dateactivationocc,
                        web_client.espaceclient_showbillingocc, web_client.espaceclient_gestion,
                        web_client.espaceclient_showfactures, web_client.espaceclient_showchantiers
                        FROM web_client 
                        WHERE pkclient = {drLogement["FKCLIENTTOP"]}");

                    espaceclient_gestion = c["ESPACECLIENT_GESTION"].ToString();
                    HasNoteOccupant = c["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                    HasDecompteOccupant = c["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                    HasFactures = c["ESPACECLIENT_SHOWFACTURES"].ToString().ToBooleanOrDefault(false);
                    HasChantiers = c["ESPACECLIENT_SHOWCHANTIERS"].ToString().ToBooleanOrDefault(false);
                    if (c["ESPACECLIENT_DATEACTIVATIONCLI"] != DBNull.Value)
                        DateActivationCli = Convert.ToDateTime(c["ESPACECLIENT_DATEACTIVATIONCLI"].ToString());
                    if (c["ESPACECLIENT_DATEACTIVATIONOCC"] != DBNull.Value)
                        DateActivationOcc = Convert.ToDateTime(c["ESPACECLIENT_DATEACTIVATIONOCC"].ToString());
                }
                catch { }

                if (espaceclient_gestion.ToLower() == "client")
                {
                    TBLogement.Immeuble.HasNoteOccupant = HasNoteOccupant;
                    TBLogement.Immeuble.HasDecompteOccupant = HasDecompteOccupant;
                    TBLogement.Immeuble.DateActivationClient = DateActivationCli;
                    TBLogement.Immeuble.DateActivationOccupant = DateActivationOcc;
                    TBLogement.Immeuble.HasFactures = HasFactures;
                    TBLogement.Immeuble.HasChantiers = HasChantiers;
                }
                else // gestion à l'immeuble
                {
                    TBLogement.Immeuble.HasNoteOccupant = drLogement["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                    TBLogement.Immeuble.HasDecompteOccupant = drLogement["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                    TBLogement.Immeuble.DateActivationClient = DateActivationCli;
                    TBLogement.Immeuble.DateActivationOccupant = drLogement["ESPACECLIENT_DATEACTIVATIONOCC"].ToString().ToDateTime();
                    TBLogement.Immeuble.HasFactures = drLogement["ESPACECLIENT_SHOWFACTURES"].ToString().ToBooleanOrDefault(false);
                    TBLogement.Immeuble.HasChantiers = drLogement["ESPACECLIENT_SHOWCHANTIERS"].ToString().ToBooleanOrDefault(false);
                }

                //check logement / user
                if (!CheckLogement(PkUser, TBLogement.Logement.PkLogement))
                {
                    TBLogement.Erreur = "incohérence user / logement";
                    return TBLogement;
                }

                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (User.FK != TBLogement.Occupant.PkOccupant)
                    {
                        TBLogement.Erreur = "incohérence user / occupant";
                        return TBLogement;
                    }
                }

                //quelques Infos de l'immeuble:
                int PkImmeuble0 = TBLogement.Immeuble.PkImmeuble;
                int PkImmeubleEAU = -1;
                int PkImmeubleCHAUFF = -1;
                int PkLogementEAU = -1;
                int PkLogementCHAUFF = -1;
                int PkOccupantEAU = -1;
                int PkOccupantCHAUFF = -1;

                bool IsDemo = IsUserDemo(User);

                TBLogement.NbCompteursEC = drLogement["nbec"].ToString().ToInt32OrDefault(-1);
                TBLogement.NbCompteursEF = drLogement["nbef"].ToString().ToInt32OrDefault(-1);
                TBLogement.NbCompteursRepart = drLogement["nbrepart"].ToString().ToInt32OrDefault(-1);
                TBLogement.NbCompteursCET = drLogement["nbcet"].ToString().ToInt32OrDefault(-1);
                TBLogement.NbCompteursCapteur = drLogement["nbcapteur"].ToString().ToInt32OrDefault(-1);

                if (TBLogement.NbCompteursEC > 0 || TBLogement.NbCompteursEF > 0)
                {
                    // si on est sur un logement d'EAU
                    // --> on va rechercher le logement de chauffage correspondant
                    //A optimiser
                    PkImmeubleEAU = TBLogement.Immeuble.PkImmeuble;
                    PkLogementEAU = TBLogement.Logement.PkLogement;
                    PkOccupantEAU = TBLogement.Occupant.PkOccupant;

                    if (TBLogement.NbCompteursRepart > 0 || TBLogement.NbCompteursCET > 0)
                    {
                        PkImmeubleCHAUFF = TBLogement.Immeuble.PkImmeuble;
                        PkLogementCHAUFF = TBLogement.Logement.PkLogement;
                        PkOccupantCHAUFF = TBLogement.Occupant.PkOccupant;
                    }
                    else
                    {
                        PkImmeubleCHAUFF = GetPKImmeubleAutre(PkImmeubleEAU, PkOccupantEAU);

                        if (PkImmeubleCHAUFF != -1)
                        {
                            string sqlLogementChauff =
                            $@"SELECT pklogement, pkoccupant, nbrepart, nbcet
                        FROM web_logement, web_occupant
                        WHERE web_logement.fkimmeuble = {PkImmeubleEAU}
                            AND web_occupant.datedepart > sysdate
                            AND web_logement.codelogegestio_occupant = {TBLogement.Occupant.Ref.QuotedStr()}
                            AND web_occupant.fklogement = web_logement.pklogement
                        ORDER BY pkoccupant DESC
                        FETCH FIRST 1 ROWS ONLY";
                            DataRow drLogementChauff = WS_DBUtils.utils_LER.DBSelectRow(sqlLogementChauff);

                            if (drLogementChauff != null)
                            {
                                PkLogementEAU = drLogementChauff["pklogement"].ToString().ToInt32OrDefault(-1);
                                PkOccupantEAU = drLogementChauff["pkoccupant"].ToString().ToInt32OrDefault(-1);
                                TBLogement.NbCompteursRepart = drLogementChauff["nbrepart"].ToString().ToInt32OrDefault(-1);
                                TBLogement.NbCompteursCET = drLogementChauff["nbcet"].ToString().ToInt32OrDefault(-1);
                            }
                        }
                    }

                }
                else if (TBLogement.NbCompteursRepart > 0 || TBLogement.NbCompteursCET > 0)
                {
                    // si on est sur un logement chauffage
                    // --> on va rechercher le logement EAU correspondant
                    //A optimiser
                    PkImmeubleCHAUFF = TBLogement.Immeuble.PkImmeuble;
                    PkLogementCHAUFF = TBLogement.Logement.PkLogement;
                    PkOccupantCHAUFF = TBLogement.Occupant.PkOccupant;

                    PkImmeubleEAU = GetPKImmeubleAutre(PkImmeubleCHAUFF, PkOccupantCHAUFF);

                    if (PkImmeubleEAU != -1)
                    {
                        string sqlLogementEau =
                        $@"SELECT web_logement.pklogement, web_occupant.pkoccupant, web_logement.nbef, web_logement.nbec
                        FROM web_logement
                        WHERE web_logement.fkimmeuble = {PkImmeubleEAU}
                            AND web_occupant.datedepart > sysdate
                            AND web_occupant.codelogegestio = {TBLogement.Occupant.Ref.QuotedStr()}
                            AND web_occupant.fklogement = web_logement.pklogement
                        ORDER BY pkoccupant DESC
                        FETCH FIRST 1 ROWS ONLY";
                        DataRow drLogementEau = WS_DBUtils.utils_LER.DBSelectRow(sqlLogementEau);

                        if (drLogementEau != null)
                        {
                            PkLogementEAU = drLogementEau["pklogement"].ToString().ToInt32OrDefault(-1);
                            PkOccupantEAU = drLogementEau["pkoccupant"].ToString().ToInt32OrDefault(-1);
                            TBLogement.NbCompteursEC = drLogementEau["nbec"].ToString().ToInt32OrDefault(-1);
                            TBLogement.NbCompteursEF = drLogementEau["nbef"].ToString().ToInt32OrDefault(-1);
                        }
                    }
                }

                #region Tickets d'intervention
                TBLogement.NbTicketsInter = drLogement["nbticketinter"].ToString().ToInt32OrDefault();
                TBLogement.TicketsInterEnabled = CheckTicketsInterEnabled(SessionID, PkUser);

                DateTime DateDebut = DateTime.Now.AddYears(-5); // on ramène max 5 ans de relevés (sauf si on veut ceux de l'occupant)
                DateTime DateFin = DateTime.Now;
                if (IsTbOccupant)
                {
                    DateDebut = TBLogement.Occupant.DateArrivee;
                    DateFin = TBLogement.Occupant.DateDepart;
                    if (DateFin > DateTime.Now)//05/12/2017 (occupant pas parti : 2999)
                        DateFin = DateTime.Now;
                }


                DateTime dateActivationClient = TBLogement.Immeuble.DateActivationClient;
                DateTime dateActivationOccupant = TBLogement.Immeuble.DateActivationOccupant;

                if (IsTbOccupant)
                {
                    if (DateDebut < dateActivationOccupant)
                        DateDebut = dateActivationOccupant;
                }
                else
                {
                    if (DateDebut < dateActivationClient)
                        DateDebut = dateActivationClient;
                }

                #endregion

                int LastPKreleve;

                TBLogement.NbAppareils = TBLogement.NbCompteursEC + TBLogement.NbCompteursEF + TBLogement.NbCompteursRepart + TBLogement.NbCompteursCET;

                // EAU CHAUDE
                if (TBLogement.NbCompteursEC > 0)
                {
                    if (IsTbOccupant)
                    {// Infos Fuites
                        TBLogement.LogementEC.NbFuites = GetNbFlagsAlarme("PKLOGEMENT=" + PkLogementEAU.ToString() + "|PKOCCUPANT=" + PkOccupantEAU.ToString(), "EC", "FUITECLIENT", LastDateIndex);
                        // Anomalies de conso
                        TBLogement.LogementEC.NbAnomalies = GetNbAnomalies("PKLOGEMENT=" + PkLogementEAU.ToString() + "|PKOCCUPANT=" + PkOccupantEAU.ToString(), "EC");
                    }
                    else
                    {
                        TBLogement.LogementEC.NbFuites = GetNbFlagsAlarme("PKLOGEMENT=" + PkLogementEAU.ToString(), "EC", "FUITECLIENT", LastDateIndex);
                        TBLogement.LogementEC.NbAnomalies = GetNbAnomalies("PKLOGEMENT=" + PkLogementEAU.ToString(), "EC");
                    }

                    // Appareils
                    infosAppareilsEAU InfosAppareilsEC = GetInfosAppareilsByLogementEAU(SessionID, PkUser, PkLogementEAU, DateDebut, DateFin, "EC", "SERIECONSOS=O");
                    TBLogement.LogementEC.ListeInfosAppareils = InfosAppareilsEC.ListeInfosAppareils;

                    // Pavés consos cumulées appareils
                    TBLogement.LogementEC.ConsoPeriode = GetConsosPeriodeEAU(TBLogement.LogementEC.ListeInfosAppareils);
                    TBLogement.LogementEC.SerieConsos = GetSommeSerieIndexconsotch(SessionID, PkUser, "L", PkLogementEAU, "EC", DateDebut, DateFin);
                    if (TBLogement.Immeuble.HasTelereleve)
                        TBLogement.LogementEC.SerieConsos.DefaultIntervalle = 30;

                    // Consos même type logement
                    LastPKreleve = GetPkReleveByDate(PkImmeubleEAU, TBLogement.LogementEC.ConsoPeriode.R1.DateReleve, "EAU");
                    if (LastPKreleve >= 0)
                        TBLogement.LogementEC.ConsoMemeTypeLogement = GetConsoMemeTypeLogement(LastPKreleve, TBLogement.Logement.Type, "EC");
                }

                // EAU FROIDE
                if (TBLogement.NbCompteursEF > 0)
                {
                    if (IsTbOccupant)
                    {// Infos Fuites
                        TBLogement.LogementEF.NbFuites = GetNbFlagsAlarme("PKLOGEMENT=" + PkLogementEAU.ToString() + "|PKOCCUPANT=" + PkOccupantEAU.ToString(), "EF", "FUITECLIENT", LastDateIndex);
                        // Anomalies de conso
                        TBLogement.LogementEF.NbAnomalies = GetNbAnomalies("PKLOGEMENT=" + PkLogementEAU.ToString() + "|PKOCCUPANT=" + PkOccupantEAU.ToString(), "EF");
                    }
                    else
                    {
                        TBLogement.LogementEF.NbFuites = GetNbFlagsAlarme("PKLOGEMENT=" + PkLogementEAU.ToString(), "EF", "FUITECLIENT", LastDateIndex);
                        TBLogement.LogementEF.NbAnomalies = GetNbAnomalies("PKLOGEMENT=" + PkLogementEAU.ToString(), "EF");
                    }
                    // Appareils
                    infosAppareilsEAU InfosAppareilsEF = GetInfosAppareilsByLogementEAU(SessionID, PkUser, PkLogementEAU, DateDebut, DateFin, "EF", "SERIECONSOS=O");
                    TBLogement.LogementEF.ListeInfosAppareils = InfosAppareilsEF.ListeInfosAppareils;

                    // Pavés consos cumulées appareils
                    TBLogement.LogementEF.ConsoPeriode = GetConsosPeriodeEAU(TBLogement.LogementEF.ListeInfosAppareils);

                    TBLogement.LogementEF.SerieConsos = GetSommeSerieIndexconsotch(SessionID, PkUser, "L", PkLogementEAU, "EF", DateDebut, DateFin);
                    if (TBLogement.Immeuble.HasTelereleve)
                        TBLogement.LogementEF.SerieConsos.DefaultIntervalle = 30;
                    // Consos même type logement
                    LastPKreleve = GetPkReleveByDate(PkImmeubleEAU, TBLogement.LogementEF.ConsoPeriode.R1.DateReleve, "EAU");
                    if (LastPKreleve >= 0)
                        TBLogement.LogementEF.ConsoMemeTypeLogement = GetConsoMemeTypeLogement(LastPKreleve, TBLogement.Logement.Type, "EF");
                }

                // Répartiteurs
                if (TBLogement.NbCompteursRepart > 0)
                {
                    int PkRepart = GetLastPkRepartImmeuble(PkImmeubleCHAUFF);
                    infosRepartImm infosRepartImm = GetInfosRepartImmByPkRepart(PkRepart);
                    TBLogement.LogementRepart.Tot_URepart = infosRepartImm.Tot_URepart;
                    TBLogement.LogementRepart.Tot_TantChauff = infosRepartImm.Tot_TantChauff;
                    TBLogement.LogementRepart.PU_Tant = infosRepartImm.PU_Tant;
                    TBLogement.LogementRepart.Prix_URepart = infosRepartImm.Prix_URepart;
                    TBLogement.LogementRepart.Prix_Abonn = infosRepartImm.Prix_Abonn;
                    TBLogement.LogementRepart.Mont_ARepartTant = infosRepartImm.Mont_ARepartTant;
                    TBLogement.LogementRepart.Part_RepartConsos = infosRepartImm.Part_RepartConsos;
                    TBLogement.LogementRepart.CT_Combust = infosRepartImm.CT_Combust;

                    //Répart logement / occupant
                    int PkOccParam;
                    if (IsTbOccupant)
                        PkOccParam = PkOccupantCHAUFF;
                    else
                        PkOccParam = -1;

                    infosRepartLog infosRepartLog = GetInfosLastRepartLogement(PkImmeubleCHAUFF, PkLogementCHAUFF, PkOccParam);
                    TBLogement.LogementRepart.URepartLog = infosRepartLog.URepartLog;
                    TBLogement.LogementRepart.TantLog = infosRepartLog.TantLog;
                    TBLogement.LogementRepart.Prix_ChauffTantLog = infosRepartLog.Prix_ChauffTantLog;
                    TBLogement.LogementRepart.CT_ChauffLog = infosRepartLog.CT_ChauffLog;

                    // Série
                    bool isRepart = (infosRepartImm.DateDebut != DateTime.MinValue && infosRepartImm.DateFin != DateTime.MinValue);
                    TBLogement.LogementRepart.SerieConsosDJU = GetSommeSerieIndexconsotch(SessionID, PkUser, "L", PkLogementCHAUFF, "REPART", DateDebut, DateFin);
                    if (TBLogement.Immeuble.HasTelereleve)
                        TBLogement.LogementRepart.SerieConsosDJU.DefaultIntervalle = 30;
                    else if (isRepart)
                    {
                        TimeSpan difference = DateFin - infosRepartImm.DateDebut;
                        TBLogement.LogementRepart.SerieConsosDJU.DefaultIntervalle = difference.Days;
                    }
                    else
                    {
                        TBLogement.LogementRepart.SerieConsosDJU.DefaultIntervalle = 365;
                    }

                    // Appareils
                    infosAppareilsRepart InfosAppareilsRepart = GetInfosAppareilsByLogementRepart(SessionID, PkUser, PkLogementCHAUFF, DateDebut, DateFin, "SERIECONSOS=O");
                    TBLogement.LogementRepart.ListeInfosAppareils = InfosAppareilsRepart.ListeInfosAppareils;

                    //par Pieces
                    List<consoPieceRepart> consosPieces = new List<consoPieceRepart>();

                    // on récupère les 2 dernières répartitions (order décroissant : plus récente d'abord)
                    List<infosRepartImm> RepartsImm = GetLastsPkRepartImmeuble(PkImmeubleCHAUFF, 2, DateDebut);//Date début = date entree sinon 5 ans
                                                                                                               // pkRepart : de plus vieille répart à plus récente
                    foreach (infosAppareilRepart appRepart in TBLogement.LogementRepart.ListeInfosAppareils)
                    {
                        // on ajoute piece si existe pas
                        if (consosPieces.Count(x => x.Emplacement.ToUpper() == appRepart.Appareil.Emplacement) == 0)
                        {
                            consoPieceRepart c = new consoPieceRepart
                            {
                                Emplacement = appRepart.Appareil.Emplacement
                            };
                            consosPieces.Add(c);
                        }

                        // on ajoute conso de appareil à pièce de appareil
                        consoPieceRepart cp = consosPieces.FirstOrDefault(x => x.Emplacement.ToUpper() == appRepart.Appareil.Emplacement);
                        // Récup index dernière répart
                        if (RepartsImm.Count > 0) // dernière répartition
                        {
                            infosRepartImm CurrRep1 = RepartsImm.ElementAt(0);
                            string Query = $@"SELECT nb 
                                FROM web_repartition_cpt 
                                WHERE fkrepartition={CurrRep1.PkRepartition.ToString()} 
                                    AND fkcompteur={appRepart.Appareil.PkAppareil.ToString()}";

                            string NB1 = WS_DBUtils.utils_LER.DBSelect(Query);
                            if (!string.IsNullOrEmpty(NB1))
                            {
                                cp.R1.Index += NB1.ToDecimalOrDefault();
                                cp.R1.Conso = cp.R1.Index;
                                cp.R1.DateReleve = RepartsImm[0].DateFin;
                            }

                            if (RepartsImm.Count > 1) // répartition d'avant
                            {
                                infosRepartImm CurrRep2 = RepartsImm.ElementAt(1);
                                string Query2 = $@"SELECT nb 
                                    FROM web_repartition_cpt 
                                    WHERE fkrepartition={CurrRep2.PkRepartition.ToString()} 
                                        AND fkcompteur={appRepart.Appareil.PkAppareil.ToString()}";
                                string NB2 = WS_DBUtils.utils_LER.DBSelect(Query2);
                                if (!string.IsNullOrEmpty(NB2))
                                {
                                    cp.R2.Index += NB2.ToDecimalOrDefault();
                                    cp.R2.Conso = cp.R2.Index;
                                    cp.R2.DateReleve = RepartsImm[1].DateFin;
                                }
                            }
                            else // si une seule répartition, on prend dernier index de compteur d'avant la répartition
                            {
                                DateTime dateDeb = CurrRep1.DateDebut.Date;

                                #region Where
                                Dictionary<string, Object> filter = new Dictionary<string, object>
                                {
                                    { Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, appRepart.Appareil.PkAppareil },
                                    {  Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, new BsonDocument().Add("$lte",dateDeb)}
                                };
                                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(filter);
                                #endregion
                                #region Select 
                                Dictionary<string, string> projectDic = new Dictionary<string, string>
                                {
                                    { "DATEINDEX", Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX },
                                    { "THEINDEXD", Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD }
                                };

                                var project = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);


                                #region Tri

                                Dictionary<string, int> sortList4DebutFuite = new Dictionary<string, int>
                                {
                                    { "DATEINDEX", -1 }
                                };

                                BsonDocument sort4DebutFuite = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortList4DebutFuite);


                                #endregion

                                BsonDocument limit4DebutFuite = WS_DBUtils.utils_Mongo.Limit2BsonDocument(1);

                                var pipeline = new[] { match, project, sort4DebutFuite, limit4DebutFuite };


                                DataRow ROW2 = null;

                                DataTable dt = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline); // A changer, trop de temps... mettre limit

                                if (dt != null && dt.Rows.Count > 0)
                                {
                                    ROW2 = dt.Rows[0];
                                }
                                #endregion
                                if (ROW2 != null)
                                {
                                    cp.R2.Index += Convert.ToDecimal(ROW2["THEINDEXD"]);
                                    cp.R2.Conso = cp.R2.Index;
                                    cp.R2.DateReleve = Convert.ToDateTime(ROW2["DATEINDEX"]);
                                }
                            }
                        }
                    }

                    TBLogement.LogementRepart.ConsosPieces = consosPieces;
                }

                // CET
                if (TBLogement.NbCompteursCET > 0) // même code que pour REPART (sauf pièces)
                {

                    int PkRepart = GetLastPkRepartImmeuble(PkImmeubleCHAUFF);
                    infosRepartImm infosRepartImm = GetInfosRepartImmByPkRepart(PkRepart);
                    TBLogement.LogementCET.Tot_URepart = infosRepartImm.Tot_URepart;
                    TBLogement.LogementCET.Tot_TantChauff = infosRepartImm.Tot_TantChauff;
                    TBLogement.LogementCET.PU_Tant = infosRepartImm.PU_Tant;
                    TBLogement.LogementCET.Prix_URepart = infosRepartImm.Prix_URepart;
                    TBLogement.LogementCET.Prix_Abonn = infosRepartImm.Prix_Abonn;
                    TBLogement.LogementCET.Mont_ARepartTant = infosRepartImm.Mont_ARepartTant;
                    TBLogement.LogementCET.Part_RepartConsos = infosRepartImm.Part_RepartConsos;
                    TBLogement.LogementCET.CT_Combust = infosRepartImm.CT_Combust;

                    //Répart logement / occupant
                    int PkOccParam;
                    if (IsTbOccupant)
                        PkOccParam = PkOccupantCHAUFF;
                    else
                        PkOccParam = -1;

                    infosRepartLog infosRepartLog = GetInfosLastRepartLogement(PkImmeubleCHAUFF, PkLogementCHAUFF, PkOccParam);
                    TBLogement.LogementCET.URepartLog = infosRepartLog.URepartLog;
                    TBLogement.LogementCET.TantLog = infosRepartLog.TantLog;
                    TBLogement.LogementCET.Prix_ChauffTantLog = infosRepartLog.Prix_ChauffTantLog;
                    TBLogement.LogementCET.CT_ChauffLog = infosRepartLog.CT_ChauffLog;

                    // Série
                    bool isRepart = (infosRepartImm.DateDebut != DateTime.MinValue && infosRepartImm.DateFin != DateTime.MinValue);
                    TBLogement.LogementCET.SerieConsosDJU = GetSommeSerieIndexconsotch(SessionID, PkUser, "L", PkLogementCHAUFF, "CET", DateDebut, DateFin);
                    if (TBLogement.Immeuble.HasTelereleve)
                        TBLogement.LogementCET.SerieConsosDJU.DefaultIntervalle = 30;
                    else if (isRepart)
                    {
                        TimeSpan difference = DateFin - infosRepartImm.DateDebut;
                        TBLogement.LogementCET.SerieConsosDJU.DefaultIntervalle = difference.Days;
                    }
                    else
                    {
                        TBLogement.LogementCET.SerieConsosDJU.DefaultIntervalle = 365;
                    }

                    // Appareils
                    infosAppareilsCET InfosAppareilsCET = GetInfosAppareilsByLogementCET(SessionID, PkUser, PkLogementCHAUFF, DateDebut, DateFin, "SERIECONSOS=O");
                    TBLogement.LogementCET.ListeInfosAppareils = InfosAppareilsCET.ListeInfosAppareils;
                }

                // Capteurs
                if (TBLogement.NbCompteursCapteur > 0)
                {
                    TBLogement.LogementCapteur.IndexRecapTemperature = GetIndexRecapCapteur("L", TBLogement.Logement.PkLogement, UnitesFk.Temperature, LastDateIndex);
                    TBLogement.LogementCapteur.SerieConsosTemperature = GetSerieCapteurByLogement(TBLogement.Logement.PkLogement, 9, DateDebut, DateFin);
                    TBLogement.LogementCapteur.IndexRecapHumidite = GetIndexRecapCapteur("L", TBLogement.Logement.PkLogement, UnitesFk.Humidite, LastDateIndex);
                    TBLogement.LogementCapteur.SerieConsosHumidite = GetSerieCapteurByLogement(TBLogement.Logement.PkLogement, 10, DateDebut, DateFin);
                }

                // Infos dépannages // Dysfonctionnements
                TBLogement.NbDepannages = GetNbDepannages("O", PkOccupantEAU, true);// En cours
                TBLogement.NbDepannagesTotal = GetNbDepannages("O", PkOccupantEAU, false);// Total
                TBLogement.NbDysfonctionnements = GetNbDysfonctionnements("PKLOGEMENT=" + PkLogementEAU.ToString() + "|PKOCCUPANT=" + PkOccupantEAU.ToString(), "", LastDateIndex);

                TBLogement.NbDepannages += GetNbDepannages("O", PkOccupantCHAUFF, true);// En cours
                TBLogement.NbDepannagesTotal += GetNbDepannages("O", PkOccupantCHAUFF, false);// Total
                TBLogement.NbDysfonctionnements += GetNbDysfonctionnements("PKLOGEMENT=" + PkLogementCHAUFF.ToString() + "|PKOCCUPANT=" + PkOccupantCHAUFF.ToString(), "", LastDateIndex);
            }
            catch (Exception Ex)
            {
                TBLogement.Erreur = Ex.Message;
            }

            return TBLogement;

        }
         */
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
        /*
        //WEBTODO :
        // - occupant remplace par web_logement
#if WS2
            ticketInterInit ti = new ticketInterInit();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    ti.Erreur = "incohérence de session";
                }
                else if (!CheckLogement(PkUser, PkLogement))//check logement / user //new 07/05/2018
                {
                    ti.Erreur = "incohérence user / logement";
                }
                else
                {
                    ti.FkLogement = PkLogement;
                    string Query =
                $@"SELECT web_occupant.nom, web_occupant.telfixe, web_occupant.telmobile, web_occupant.email
                        FROM web_logement, web_occupant 
                        WHERE pklogement = {PkLogement} 
                            AND web_occupant.fklogement = web_logement.pklogement ";

                    DataRow drOccupant = WS_DBUtils.utils_LER.DBSelectRow(Query);
                    if (drOccupant != null)
                    {
                        ti.Nom = drOccupant["NOM"].ToString();
                        ti.TelFixe = drOccupant["TELFIXE"].ToString();
                        ti.TelMobile = drOccupant["TELMOBILE"].ToString();
                        ti.Email = drOccupant["EMAIL"].ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                ti.Erreur = ex.Message;
            }
            return ti;
        }
*/

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
        /*
        int Nb = -1;
        try
        {
            if (session.checkSession(SessionID, PkUser) == false)
            {
                Nb = -1;
            }
            else if (!CheckLogement(PkUser, PkLogement))//check logement / user //new 07/05/2018
            {
                Nb = -1;
            }
            else
            {
                Nb = 0;
            }
        }
        catch
        {
        }
        return Nb;
        }
        */
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
        /*
            //WEBTODO TODO :
            // - immeuble remplace par web_immeuble
            // - immeuble_stats remplace par web_immeuble
            // - client remplace par web_client
            // - logement remplace par web_logement
            // - occupant remplace par web_logement
            // - compteur remplace par web_compteur
            // - article remplace par web_article
            // - indexconso remplace par web_indexconso
            // - releve remplace par web_releve
#if WS2
            List<occupant4Chgt> occupants = new List<occupant4Chgt>();
            if (session.checkSession(SessionID, PkUser) == false) return occupants;

            user u = GetUserByPk(PkUser);
            if (u.UserType != "C") return occupants;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT Web_immeuble.id as idimm, Web_immeuble.codegestio, Web_immeuble.adresse, Web_immeuble.cp, Web_immeuble.ville, 
                Web_logement.numbatiment as numbat, Web_logement.adrbatiment as adressebat,
                Web_logement.numescalier as numesc, Web_logement.adresseesc, Web_logement.numetage, Web_logement.numordre, 
                web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio, 
                web_occupant.datearrivee, web_occupant.email, web_occupant.telfixe, web_occupant.telmobile, web_occupant.numbail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newname, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newcodelogegestio, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newdatearrivee, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newemail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelfixe, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelmobile, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newnumbail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew

FROM 
    web_logement, web_immeuble, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ, web_occupant
WHERE
    (web_occupant.datedepart IS NULL OR web_occupant.datedepart > sysdate)
    AND web_logement.fkimmeuble = Web_immeuble.pkimmeuble
    AND web_occupant.fklogement = web_logement.pklogement
    {(PkImmeuble == -1 ? "" : " AND web_immeuble.pkimmeuble=" + PkImmeuble + " ")}
    {(PkOccupant == -1 ? "" : " AND web_occupant.pkoccupant=" + PkOccupant + " ")}
        AND NVL(Web_immeuble.ACTIF, 'O') <> 'N' 
        AND Web_immeuble.FKclient IN (SELECT pkclient FROM web_client  
                                               START WITH web_client.pkclient =  {u.FKClient}
                                               CONNECT BY fkclient= PRIOR pkclient )
        AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.fkoccupant(+) = pkoccupant
        AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew={isNew.QuotedStr()}
    ORDER BY Web_immeuble.codegestio, Web_immeuble.id, numbat, numesc, Web_logement.numetage, Web_logement.numordre");
            dt.TableName = "Occupants";

            foreach (DataRow row in dt.Rows)
            {
                occupant4Chgt o = new occupant4Chgt
                {
                    PkOccupant = row["PKOCCUPANT"].ToString().ToInt32OrDefault(-1),
                    Nom = row["nom"].ToString(),
                    CodeLogeGestio = row["codelogegestio"].ToString(),
                    DateArrivee = row["DateArrivee"].ToString().ToDateTime(),
                    email = row["email"].ToString(),
                    telfixe = row["telfixe"].ToString(),
                    telmobile = row["telmobile"].ToString(),
                    numbail = row["numbail"].ToString(),

                    idIMM = row["idimm"].ToString(),
                    codegestioIMM = row["codegestio"].ToString(),
                    adresseIMM = row["adresse"].ToString(),
                    cpIMM = row["cp"].ToString(),
                    villeIMM = row["ville"].ToString(),
                    numBAT = row["numbat"].ToString(),
                    adresseBAT = row["adresseBAT"].ToString(),
                    numESC = row["numESC"].ToString(),
                    adresseESC = row["adresseESC"].ToString(),
                    numetage = row["numetage"].ToString(),
                    numordre = row["numordre"].ToString(),

                    newNom = row["newName"].ToString(),
                    newCodeLogeGestio = row["newcodelogegestio"].ToString(),
                    newDateArrivee = row["newDateArrivee"].ToString().ToDateTime(),
                    newEmail = row["newEmail"].ToString(),
                    newTelfixe = row["newTelfixe"].ToString(),
                    newTelmobile = row["newTelmobile"].ToString(),
                    newNumbail = row["newNumbail"].ToString(),

                    isNew = row["isnew"].ToString().ToBooleanOrDefault(false)
                };
                occupants.Add(o);
            }
            return occupants;
        }
        */
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
