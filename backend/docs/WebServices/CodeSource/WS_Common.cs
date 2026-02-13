
using Amazon.Runtime.Internal.Endpoints.StandardLibrary;
using DevExpress.ClipboardSource.SpreadsheetML;
using DevExpress.CodeParser;
using DevExpress.DataProcessing.InMemoryDataProcessor;
using DevExpress.Xpo.DB.Helpers;
using DevExpress.XtraReports.UI;
using DevExpress.XtraReports.Wizards;
using DevExpress.XtraRichEdit;
using MongoDB.Bson;
using MongoDB.Driver;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Sockets;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Web.UI.MobileControls;
using Techem.DBUtils.Mongo;
using Techem.DBUtils.SF;
using Techem.LER.LER_PrintPlugin;
using Techem.LER.LER_PrintPlugin.Tools;
using Techem.Webservices.WS_EspaceClient.Tools;
using Tools;
using Utils_Releve = Techem.Webservices.WS_EspaceClient.Tools.Utils_Releve;

namespace Techem.Webservices.WS_EspaceClient
{
    #region Objets internes
    public class nbAppareils
    {
        public int NbCompteursEC = -1;
        public int NbCompteursEF = -1;
        public int NbCompteursRepart = -1;
        public int NbCompteursCET = -1;
        public int NbCompteursCapteur = -1;
        //public int NbCompteursElect = -1;
        //public int NbCompteursGaz = -1;
    }
    #endregion

    static public partial class WS_Common
    {
        /// <summary>
        /// Retourne la liste des immeubles pour un utilisateur donné
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="PkUser">Pk du User </param>
        /// <returns></returns>
        static public DataRowCollection GetRowsImmeublesByPKUser(string SuperLoginID, string SuperPassword, int PkUser)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
#if WS2
            if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
            {
                //retourne la liste des immeubles de n'importe quel USER
                string Query = GetQueryImmeubles(
                    "web_immeuble.pkimmeuble, web_immeuble.cp, web_immeuble.ville, web_immeuble.adresse, web_immeuble.nom, web_immeuble.id, web_immeuble.adresse2, web_immeuble.adresse3, web_immeuble.actif, web_immeuble.codegestio, web_immeuble.telereleve, web_immeuble.fkclienttop",
                    "U",
                    PkUser);

                return WS_DBUtils.utils_LER.DBSelectRows(Query);
            }
            else return null;
#else
            if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
            {
                //retourne la liste des immeubles de n'importe quel USER
                string Query = GetQueryImmeubles(
                    "PKIMMEUBLE, IMMEUBLE.CP, IMMEUBLE.VILLE, IMMEUBLE.ADRESSE, IMMEUBLE.NOM, IMMEUBLE.ID, IMMEUBLE.ADRESSE2, IMMEUBLE.ADRESSE3, IMMEUBLE.ACTIF, CODEGESTIO, TELERELEVE, FKCLIENTTOP",
                    "U",
                    PkUser);

                return WS_DBUtils.utils_LER.DBSelectRows(Query);
            }
            else return null;
#endif
        }

        /// <summary>
        /// Retourne la query destinée à selectionner des infos d'immeubles d'un user ou syndic ou agence ou maison mère ou immeuble
        /// la chaine "query" sera destinées à être insérée en tant "and IMMEUBLE.PKIMMEUBLE in (query)"
        /// </summary>
        /// <param name="Fields">Champs à retourner</param>
        /// <param name="TypeConteneur">U (User) ou sinon directement (M, A, S, I, L (dans ce cas, le pk est celui d'une maison mère, ..., immeuble))</param>
        /// <param name="PkConteneur">Pk du User (si TypeConteneur = U), sinon Pk d'un immeuble, agence, maison mère, syndic</param>
        /// <returns></returns>
        static public string GetQueryImmeubles(string Fields, string TypeConteneur, int PkConteneur)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - client remplace par web_client
            // - logement remplace par web_logement
#if WS2
            int Fk;
            string type;
            user User = GetUserByPk(PkConteneur);

            if (TypeConteneur.ToUpper() == "U")
            {
                type = User.UserType;
                if (type == "G")
                    Fk = PkConteneur;
                else
                    Fk = User.FK;
            }
            else
            {
                type = TypeConteneur;
                Fk = PkConteneur;
            }

            string fromWhere = "";
            if (type == "I")
                fromWhere = $@" FROM web_immeuble 
WHERE (web_immeuble.pkimmeuble = {Fk}) 
AND (SUBSTR(web_immeuble.ID, 1, 1) <> 'P') ";

            else if (type == "C")
                fromWhere = $@"FROM web_immeuble  
WHERE 
{(User.showImmeublesArc ? "" : "web_immeuble.ACTIF='O' AND ")}
web_immeuble.fkclient IN (
    select web_client.pkclient
    from web_client
    start with web_client.pkclient = {Fk} 
    connect by web_client.fkclient= prior web_client.pkclient )
AND (SUBSTR(web_immeuble.ID, 1, 1) <> 'P' )";

            else if (type == "G")
            {
                fromWhere =
                    $@" FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right, web_immeuble
                        WHERE
                            {(User.showImmeublesArc ? "" : " web_immeuble.actif='O' AND ")}
                            web_immeuble.pkimmeuble = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.fk 
                            AND web_immeuble.fkclient IN
                            (
                                SELECT web_client.pkclient
                                FROM web_client
                                START WITH web_client.pkclient =
                                (
                                    SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient
                                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
                                    WHERE pkweb_user = (SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkparentuser
                                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user WHERE pkweb_user = {Fk})
                                )
                                CONNECT BY web_client.fkclient = PRIOR web_client.pkclient
                            )
                            AND(SUBSTR(web_immeuble.ID, 1, 1) <> 'P') 
                            AND {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.TYPER = 'I'
                            AND {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.FKWEB_USER = {Fk} 
                            ";
            }

            else if (type == "O")
            {
                fromWhere = $@" FROM web_immeuble, web_logement, web_occupant
                                    WHERE web_immeuble.pkimmeuble = web_logement.fkimmeuble
                                        AND web_occupant.fklogement = web_logement.pklogement
                                        AND web_occupant.pkoccupant = {Fk} ";
            }

            string query = $@" SELECT {Fields} {fromWhere} ";

            return query;
#else
            int Fk;
            string type;
            user User = GetUserByPk(PkConteneur);

            if (TypeConteneur.ToUpper() == "U")
            {
                type = User.UserType;
                if (type == "G")
                    Fk = PkConteneur;
                else
                    Fk = User.FK;
            }
            else
            {
                type = TypeConteneur;
                Fk = PkConteneur;
            }

            string fromWhere = "";
            if (type == "I")
                fromWhere = $@" FROM IMMEUBLE, IMMEUBLE_STATS  
WHERE (IMMEUBLE.PKIMMEUBLE = {Fk}) 
AND (SUBSTR(IMMEUBLE.ID, 1, 1) <> 'P')
AND IMMEUBLE_STATS.FKIMMEUBLE(+) = IMMEUBLE.PKIMMEUBLE ";

            else if (type == "C")
                fromWhere = $@"FROM IMMEUBLE, IMMEUBLE_STATS  
WHERE 
{(User.showImmeublesArc ? "" : "IMMEUBLE.ACTIF='O' AND ")}
IMMEUBLE_STATS.FKIMMEUBLE(+) = IMMEUBLE.PKIMMEUBLE 
AND IMMEUBLE.FKCLIENT IN (
select CLIENT.PKCLIENT
from CLIENT
where NVL(CLIENT.ACTIF, 'O') <> 'N'
start with CLIENT.PKCLIENT = {Fk} 
connect by CLIENT.FKCLIENT= prior CLIENT.PKCLIENT )
AND (SUBSTR(IMMEUBLE.ID, 1, 1) <> 'P' )";

            else if (type == "G")
            {
                fromWhere =
                    $@" FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT, IMMEUBLE, IMMEUBLE_STATS
                        WHERE
                            {(User.showImmeublesArc ? "" : " IMMEUBLE.ACTIF='O' AND ")}
                            IMMEUBLE.PKIMMEUBLE = {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.FK 
                            AND IMMEUBLE.FKCLIENT IN
                            (
                                SELECT CLIENT.PKCLIENT
                                FROM CLIENT
                                WHERE NVL(CLIENT.ACTIF, 'O') <> 'N'
                                START WITH CLIENT.PKCLIENT =
                                (
                                    SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER.FKCLIENT
                                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER
                                    WHERE PKWEB_USER = (SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER.FKPARENTUSER
                                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE PKWEB_USER = :PKWEB_USER )
                                )
                                CONNECT BY CLIENT.FKCLIENT = PRIOR CLIENT.PKCLIENT
                            )
                            AND(SUBSTR(IMMEUBLE.ID, 1, 1) <> 'P') 
                            AND {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.TYPER = 'I'
                            AND {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.FKWEB_USER = :PKWEB_USER 
                            AND IMMEUBLE_STATS.FKIMMEUBLE(+) = IMMEUBLE.PKIMMEUBLE ".Replace(":PKWEB_USER", Fk.ToString());
            }

            else if (type == "O")
            {
                fromWhere = $@" FROM immeuble, IMMEUBLE_STATS, batiment, logement, occupant
                                    WHERE immeuble.pkimmeuble = batiment.fkimmeuble
                                    AND logement.fkbatiment = batiment.pkbatiment
                                    AND occupant.fklogement = logement.pklogement
                                    AND occupant.pkoccupant = {Fk}
                                    AND IMMEUBLE_STATS.fkimmeuble(+) = immeuble.pkimmeuble ";
            }

            string query = " select " + Fields + " " + fromWhere;

            return query;
#endif
        }
        /// <summary>
        /// Retourne un objet immeuble initialisé avec les informations provenant d'un datarow
        /// </summary>
        /// <param name="DrImm">Ligne de données</param>
        /// <returns>Retourne un objet immeuble</returns>
        private static immeuble GetImmeubleByRow(DataRow DrImm)
        {
            immeuble Imm = new immeuble
            {
                PkImmeuble = DrImm["PKIMMEUBLE"].ToString().ToInt32OrDefault(),
                Nom = DrImm["NOM"].ToString(),
                Numero = DrImm["ID"].ToString(),
                Ref = DrImm["CODEGESTIO"].ToString(),
                Adresse1 = DrImm["ADRESSE"].ToString(),
                Adresse2 = DrImm["ADRESSE2"].ToString(),
                Adresse3 = DrImm["ADRESSE3"].ToString(),
                Cp = DrImm["CP"].ToString(),
                Ville = DrImm["VILLE"].ToString(),
                HasTelereleve = DrImm["TELERELEVE"].ToString().ToBooleanOrDefault(),
                Actif = DrImm["ACTIF"].ToString().ToBooleanOrDefault(),
                FkClientTop = DrImm["FKCLIENTTOP"].ToString().ToInt32OrDefault()
            };

            return Imm;
        }
        /// <summary>
        /// Retourne un objet immeuble en fonction de son PK
        /// </summary>
        /// <param name="PkImmeuble">Pk immeuble</param>
        /// <returns>Retourne un objet immeuble</returns>
        private static immeuble GetImmeubleByPk(int PkImmeuble)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - client remplace par web_client
#if WS2
            immeuble Imm;
            try
            {
                string Query =
$@"SELECT pkimmeuble, web_immeuble.cp, web_immeuble.ville, web_immeuble.adresse, 
    web_immeuble.nom, web_immeuble.id, web_immeuble.adresse2, web_immeuble.adresse3, 
    web_immeuble.actif, web_immeuble.codegestio, web_immeuble.telereleve, web_immeuble.fkclienttop,
    web_client.noteoccupant, web_client.espaceclient_dateactivationcli,
    web_client.espaceclient_dateactivationocc, web_client.espaceclient_showbillingocc, 
    web_client.espaceclient_gestion, web_client.espaceclient_showfactures, web_client.espaceclient_showchantiers,
    web_immeuble.espaceclient_dateactivationocc as espaceclient_dateactivationoccimm, 
    web_immeuble.noteoccupant as noteoccupantimm, 
    web_immeuble.espaceclient_showbillingocc as espaceclient_showbillingoccimm,
    web_immeuble.espaceclient_showfactures as espaceclient_showfacturesimm,
    web_immeuble.espaceclient_showchantiers as espaceclient_showchantiersimm
FROM web_immeuble, web_client
WHERE pkimmeuble= {PkImmeuble} 
AND web_client.pkclient(+) = web_immeuble.fkclienttop";

                DataRow DrImm = WS_DBUtils.utils_LER.DBSelectRow(Query);
                Imm = GetImmeubleByRow(DrImm);
                string suffixe = "";
                if (DrImm["ESPACECLIENT_GESTION"].ToString().ToLower() == "immeuble")
                    suffixe = "IMM";

                Imm.HasNoteOccupant = DrImm["NOTEOCCUPANT" + suffixe].ToString().ToBooleanOrDefault(false);
                Imm.HasDecompteOccupant = DrImm["ESPACECLIENT_SHOWBILLINGOCC" + suffixe].ToString().ToBooleanOrDefault(false);
                Imm.HasFactures = DrImm["ESPACECLIENT_SHOWFACTURES" + suffixe].ToString().ToBooleanOrDefault(false);
                Imm.HasChantiers = DrImm["ESPACECLIENT_SHOWCHANTIERS" + suffixe].ToString().ToBooleanOrDefault(false);
                if (DrImm["ESPACECLIENT_DATEACTIVATIONCLI"] != DBNull.Value)
                    Imm.DateActivationClient = DrImm["ESPACECLIENT_DATEACTIVATIONCLI"].ToString().ToDateTime();
                if (DrImm["ESPACECLIENT_DATEACTIVATIONOCC" + suffixe] != DBNull.Value)
                    Imm.DateActivationOccupant = DrImm["ESPACECLIENT_DATEACTIVATIONOCC" + suffixe].ToString().ToDateTime();
            }
            catch
            {
                Imm = new immeuble();//Vide plutôt que pas instancié
            }
            return Imm;
#else
            immeuble Imm;
            try
            {
                string Query =
$@"SELECT pkimmeuble, immeuble.cp, immeuble.ville, immeuble.adresse, 
immeuble.nom, immeuble.id, immeuble.adresse2, immeuble.adresse3, 
immeuble.actif, codegestio, telereleve, fkclienttop,
client.noteoccupant, client.espaceclient_dateactivationcli,
client.espaceclient_dateactivationocc, client.espaceclient_showbillingocc, 
client.espaceclient_gestion, client.espaceclient_showfactures, client.espaceclient_showchantiers,
immeuble.espaceclient_dateactivationocc as espaceclient_dateactivationoccimm, 
immeuble.noteoccupant as noteoccupantimm, 
immeuble.espaceclient_showbillingocc as espaceclient_showbillingoccimm,
immeuble.espaceclient_showfactures as espaceclient_showfacturesimm,
immeuble.espaceclient_showchantiers as espaceclient_showchantiersimm
FROM immeuble, client
WHERE pkimmeuble= {PkImmeuble} 
AND client.pkclient(+) = immeuble.fkclienttop";

                DataRow DrImm = WS_DBUtils.utils_LER.DBSelectRow(Query);
                Imm = GetImmeubleByRow(DrImm);
                string suffixe = "";
                if (DrImm["ESPACECLIENT_GESTION"].ToString().ToLower() == "immeuble")
                    suffixe = "IMM";

                Imm.HasNoteOccupant = DrImm["NOTEOCCUPANT" + suffixe].ToString().ToBooleanOrDefault(false);
                Imm.HasDecompteOccupant = DrImm["ESPACECLIENT_SHOWBILLINGOCC" + suffixe].ToString().ToBooleanOrDefault(false);
                Imm.HasFactures = DrImm["ESPACECLIENT_SHOWFACTURES" + suffixe].ToString().ToBooleanOrDefault(false);
                Imm.HasChantiers = DrImm["ESPACECLIENT_SHOWCHANTIERS" + suffixe].ToString().ToBooleanOrDefault(false);
                if (DrImm["ESPACECLIENT_DATEACTIVATIONCLI"] != DBNull.Value)
                    Imm.DateActivationClient = Convert.ToDateTime(DrImm["ESPACECLIENT_DATEACTIVATIONCLI"].ToString());
                if (DrImm["ESPACECLIENT_DATEACTIVATIONOCC" + suffixe] != DBNull.Value)
                    Imm.DateActivationOccupant = Convert.ToDateTime(DrImm["ESPACECLIENT_DATEACTIVATIONOCC" + suffixe].ToString());
            }
            catch
            {
                Imm = new immeuble();//Vide plutôt que pas instancié
            }
            return Imm;
#endif
        }

        ///<summary>
        ///Récupère les immeubles pour un utilisateur donné
        /// public immeubles GetImmeubles(string SessionID, int PkUser, int PkUserChild, string ParamsFiltres, string ParamsInfos)
        ///</summary>        
        ///<param name="SessionID">Identificateur de session</param>
        ///<param name="PkUser">PK de l'utilisateur connecté</param>
        ///<param name="PkUserChild">=-1 --> renvoie la liste des immeubles du PKUser, 
        /// != -1 --> renvoie la liste des immeubles du PKUserChild 
        /// </param>
        /// <param name="ParamsFiltres">Filtres pour n'avoir que les immeubles ayant le bon critère (si vide : pas de filtre)
        /// valeurs possibles cumulables (le séparateur est |)
        /// FUITES=O
        /// DEPANNAGES=O
        /// DYSFONCTIONNEMENTS=O
        /// ANOMALIES=O
        ///</param>
        ///<param name="ParamsInfos">
        /// Infos additionnelles demandées (si vide, aucune info additionnelle n'est retournée)
        /// valeurs possibles cumulables (le séparateur est |)
        /// NBAPPAREILS=O : on veut le nombre de compteurs
        /// NBLOGEMENTS=O : on veut le nombre de logements
        /// NBFUITES=O : on veut le nombre de fuites
        /// NBDEPANNAGES=O : on veut le nombre de dépannages
        /// NBDYSFONCTIONNEMENTS=O : on veut le nombre d'alertes
        /// NBANOMALIES=O : on veut le nombre d'anomalies
        ///</param>
        /// <returns>renvoie les immeubles du PKUser ou PKUserChild</returns>
        static public infosImmeubles GetInfosImmeubles(string SessionID, int PkUser, int PkUserChild, string ParamsFiltres, string ParamsInfos)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - compteur remplace par web_compteur
            // - artcile remplace par web_article
            // - immeuble_stats remplace par web_immeuble

#if WS2
            infosImmeubles InfosImms = new infosImmeubles();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            ParamsString Pinfos = new ParamsString(ParamsInfos);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosImms.Erreur = "incohérence de session";
                    return InfosImms;
                }

                else if ((PkUserChild != -1) && (!IsChildUser(PkUser, PkUserChild)))
                {
                    InfosImms.Erreur = "Impossible de lire cet utilisateur";
                    return InfosImms;
                }
                else
                {
                    int PkUserWanted;
                    if (PkUserChild != -1)
                        PkUserWanted = PkUserChild;
                    else
                        PkUserWanted = PkUser;

                    user UserConnected = GetUserByPk(PkUserWanted);
                    bool IsDemo = IsUserDemo(UserConnected);

                    string Fields =
$@" web_immeuble.pkimmeuble, web_immeuble.cp, web_immeuble.ville, web_immeuble.adresse, web_immeuble.nom, web_immeuble.id,
web_immeuble.adresse2, web_immeuble.adresse3, web_immeuble.actif, web_immeuble.codegestio, web_immeuble.telereleve, web_immeuble.fkclienttop, 
web_immeuble.espaceclient_dateactivationocc, web_immeuble.noteoccupant, web_immeuble.espaceclient_showbillingocc, 
web_immeuble.espaceclient_showchantiers, web_immeuble.espaceclient_showfactures, ";

                    //EC
                    Fields += " web_immeuble.nbec, ";

                    //EF
                    Fields += " web_immeuble.nbef, ";

                    //REPART
                    Fields += " web_immeuble.nbrepart,  ";

                    //CET
                    Fields += " web_immeuble.nbcet,  ";

                    //CAPTEURS
                    Fields += " web_immeuble.nbcapteur,   ";

                    //Nb Logements
                    Fields += " NVL(web_immeuble.nblogement,0) as nblog, ";

                    //Nb Dépannages
                    Fields += " NVL(web_immeuble.nbdepannages,0) as nbdepannages, ";

                    //NBFuites
                    Fields += " NVL(web_immeuble.nbfuites,0) as nbfuites, ";

                    //NBDYSFONCTIONNEMENTS
                    Fields += " NVL(web_immeuble.nbalarms,0) as nbalarms, NVL(web_immeuble.nbsusfraudcli,0) as NBSUSFRAUDCLI, ";

                    //Nb Anomalies de conso
                    Fields += $@" NVL(web_immeuble.nbano_ec,0) + NVL(web_immeuble.nbano_ef,0) as nbano,";

                    Fields += $@" NVL(web_immeuble.nbchantiers,0) as nb_chantiers,";

                    string QueryImms = GetQueryImmeubles(Fields.Trim(",".ToCharArray()), "U", PkUserWanted);

                    //Gestion recherche
                    string AdditionnalFilter = "";

                    if (Pfiltres.GetParam("FIELD_ALLFIELDS").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("web_immeuble.codegestio|web_immeuble.id|web_immeuble.adresse|web_immeuble.adresse2|web_immeuble.adresse3|web_immeuble.cp|web_immeuble.ville|web_immeuble.nom", Pfiltres.GetParam("FIELD_ALLFIELDS").Trim());

                    if (Pfiltres.GetParam("FIELD_REF").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("web_immeuble.codegestio", Pfiltres.GetParam("FIELD_REF").Trim());

                    if (Pfiltres.GetParam("FIELD_REF-NUMERO").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("web_immeuble.codegestio|web_immeuble.id", Pfiltres.GetParam("FIELD_REF-NUMERO").Trim());

                    if (Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("web_immeuble.ADRESSE|web_immeuble.ADRESSE2|web_immeuble.ADRESSE3|web_immeuble.CP|web_immeuble.VILLE", Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim());

                    if (Pfiltres.GetParam("FIELD_NOM").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("web_immeuble.nom", Pfiltres.GetParam("FIELD_NOM").Trim());

                    if (AdditionnalFilter.Trim() != "")
                        QueryImms += " " + AdditionnalFilter;

                    DataTable imms = WS_DBUtils.utils_LER.DBSelectTable(QueryImms);

                    int nbImmeubles = imms.Select("ACTIF='O'").Length;

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
                        WHERE pkclient = {imms.Rows[0]["FKCLIENTTOP"]}");

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

                    foreach (DataRow imm in imms.Rows)
                    {
                        if (!UserConnected.showImmeublesArc && (imm["ACTIF"].ToString() == "N")) continue;

                        infosImmeuble InfosImm = new infosImmeuble
                        {
                            Immeuble = GetImmeubleByRow(imm)
                        };
                        if (espaceclient_gestion.ToLower() == "client")
                        {
                            InfosImm.Immeuble.HasNoteOccupant = HasNoteOccupant;
                            InfosImm.Immeuble.HasDecompteOccupant = HasDecompteOccupant;
                            InfosImm.Immeuble.DateActivationClient = DateActivationCli;
                            InfosImm.Immeuble.DateActivationOccupant = DateActivationOcc;
                            InfosImm.Immeuble.HasFactures = HasFactures;
                            InfosImm.Immeuble.HasChantiers = HasChantiers;
                        }
                        else // gestion à l'immeuble
                        {
                            InfosImm.Immeuble.HasNoteOccupant = imm["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                            InfosImm.Immeuble.HasDecompteOccupant = imm["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                            InfosImm.Immeuble.DateActivationClient = DateActivationCli;
                            InfosImm.Immeuble.DateActivationOccupant = imm["ESPACECLIENT_DATEACTIVATIONOCC"].ToString().ToDateTime();
                            InfosImm.Immeuble.HasFactures = imm["ESPACECLIENT_SHOWFACTURES"].ToString().ToBooleanOrDefault(false);
                            InfosImm.Immeuble.HasChantiers = imm["ESPACECLIENT_SHOWCHANTIERS"].ToString().ToBooleanOrDefault(false);
                        }
                        // gestion du filtre
                        bool Exclue = false;

                        //NbCompteurs
                        InfosImm.NbCompteursEC = imm["NBEC"].ToString().ToInt32OrDefault();
                        InfosImm.NbCompteursEF = imm["NBEF"].ToString().ToInt32OrDefault();
                        InfosImm.NbCompteursRepart = imm["NBREPART"].ToString().ToInt32OrDefault();
                        InfosImm.NbCompteursCET = imm["NBCET"].ToString().ToInt32OrDefault();
                        InfosImm.NbCompteursCapteur = imm["NBCAPTEUR"].ToString().ToInt32OrDefault();//ne sera pas compté dans appareils
                        InfosImm.NbAppareils = InfosImm.NbCompteursEC + InfosImm.NbCompteursEF + InfosImm.NbCompteursRepart + InfosImm.NbCompteursCET;

                        // Infos Logements
                        int NbLogements = -1;
                        NbLogements = imm["NBLOG"].ToString().ToInt32OrDefault(-1);
                        InfosImm.NbLogements = NbLogements;

                        // Infos Fuites --> Mongo
                        int NbFuites = -1;
                        NbFuites = imm["NBFUITES"].ToString().ToInt32OrDefault(-1);
                        InfosImm.NbFuites = NbFuites;

                        // Infos Depannages -->SF
                        int NbDepannages = -1;
                        NbDepannages = imm["NBDEPANNAGES"].ToString().ToInt32OrDefault(-1);
                        InfosImm.NbDepannages = NbDepannages;

                        // Infos Dysfonctionnements --> Mongo
                        int NbDysfonctionnements = -1;
                        int nbAlarms = imm["NBALARMS"].ToString().ToInt32OrDefault();
                        int nbSusFraudCli = imm["NBSUSFRAUDCLI"].ToString().ToInt32OrDefault();
                        NbDysfonctionnements = nbAlarms - nbSusFraudCli;
                        InfosImm.NbDysfonctionnements = NbDysfonctionnements;

                        // Infos Anomalies --> Relevés
                        int NbAnomalies = -1;
                        if (Pinfos.GetParam("NBANOMALIES").ToUpper() != "N" || Pfiltres.GetParam("ANOMALIES").ToUpper() == "O")
                            NbAnomalies = imm["NBANO"].ToString().ToInt32OrDefault();
                        InfosImm.NbAnomalies = NbAnomalies;

                        // gestion du filtre:
                        if (Pfiltres.GetParam("FUITES").ToUpper() == "O" && NbFuites <= 0)
                            Exclue = true;

                        if (Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O" && NbDepannages <= 0)
                            Exclue = true;

                        if (Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O" && NbDysfonctionnements <= 0)
                            Exclue = true;

                        if (Pfiltres.GetParam("ANOMALIES").ToUpper() == "O" && NbAnomalies <= 0)
                            Exclue = true;

                        // chantiers
                        int NbChantiers = -1;
                        NbChantiers = imm["NB_CHANTIERS"].ToString().ToInt32OrDefault(-1);

                        if (Pfiltres.GetParam("CHANTIERS").ToUpper() == "O" && NbChantiers <= 0)
                            Exclue = true;
                        InfosImm.NbChantiers = NbChantiers;

                        if (!UserConnected.showImmeublesArc && InfosImm.NbAppareils < 0 && InfosImm.NbCompteursCapteur <= 0)
                            Exclue = true;

                        if (Exclue == false)
                            InfosImms.ListeInfosImmeubles.Add(InfosImm);
                    }
                }

            }
            catch (Exception Ex)
            {
                InfosImms.Erreur = Ex.Message;
            }

            return InfosImms;
#else
            infosImmeubles InfosImms = new infosImmeubles();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            ParamsString Pinfos = new ParamsString(ParamsInfos);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosImms.Erreur = "incohérence de session";
                    return InfosImms;
                }

                else if ((PkUserChild != -1) && (!IsChildUser(PkUser, PkUserChild)))
                {
                    InfosImms.Erreur = "Impossible de lire cet utilisateur";
                    return InfosImms;
                }
                else
                {
                    int PkUserWanted;
                    if (PkUserChild != -1)
                        PkUserWanted = PkUserChild;
                    else
                        PkUserWanted = PkUser;

                    user UserConnected = GetUserByPk(PkUserWanted);
                    bool IsDemo = IsUserDemo(UserConnected);

                    DateTime DateJour = getLastDateIndex();
                    DateTime DateCheckFuite = DateJour.AddDays(-1).Date;
                    string Fields =
$@"immeuble.pkimmeuble, immeuble.cp, immeuble.ville, immeuble.adresse, immeuble.nom, immeuble.id,
immeuble.adresse2, immeuble.adresse3, immeuble.actif, immeuble.codegestio, immeuble.telereleve, fkclienttop, 
immeuble.espaceclient_dateactivationocc, immeuble.noteoccupant, immeuble.espaceclient_showbillingocc, 
espaceclient_showchantiers, espaceclient_showfactures, ";

                    //EC
                    Fields += " (select count(*) from BATIMENT, LOGEMENT, COMPTEUR where (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and COMPTEUR.FKCRITERE=1 and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE)) as NBEC, ";

                    //EF
                    Fields += " (select count(*) from BATIMENT, LOGEMENT, COMPTEUR where (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and COMPTEUR.FKCRITERE=2 and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE)) as NBEF, ";

                    //REPART
                    Fields += " (SELECT count(*)" +
                        " from BATIMENT, LOGEMENT, COMPTEUR, ARTICLE" +
                        " where COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                        " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("REPART") +
                        " and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE)" +
                        " ) as NBREPART, ";

                    //CET
                    Fields += " (SELECT count(*)" +
                        " from BATIMENT, LOGEMENT, COMPTEUR, ARTICLE" +
                        " where COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                        " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("CET") +
                        " and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE)" +
                        " ) as NBCET, ";

                    //CAPTEURS
                    Fields += " (SELECT count(*)" +
                        " from BATIMENT, LOGEMENT, COMPTEUR, ARTICLE" +
                        " where COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                        " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("CAPTEUR") +
                        " and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = PKIMMEUBLE)" +
                        " ) as NBCAPTEUR, ";

                    //Nb Logements
                    if (Pinfos.GetParam("NBLOGEMENTS").ToUpper() != "N")
                        Fields += " (select count(distinct(pklogement)) from LOGEMENT, BATIMENT, COMPTEUR where (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT) and LOGEMENT.PKLOGEMENT = COMPTEUR.FKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = PKIMMEUBLE) as NBLOG, ";

                    //Nb Dépannages
                    if (Pinfos.GetParam("NBDEPANNAGES").ToUpper() != "N" || Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O")
                        Fields += " NVL(IMMEUBLE_STATS.NBDEPANNAGES,0) as NBDEPANNAGES, ";
                    //NBFuites
                    if (Pinfos.GetParam("NBFUITES").ToUpper() != "N" || Pfiltres.GetParam("FUITES").ToUpper() == "O")
                        Fields += " NVL(IMMEUBLE_STATS.NBFUITES,0) as NBFUITES, ";
                    //NBDYSFONCTIONNEMENTS
                    if (Pinfos.GetParam("NBDYSFONCTIONNEMENTS").ToUpper() != "N" || Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O")
                        Fields += " NVL(IMMEUBLE_STATS.NBALARMS,0) as NBALARMS, NVL(IMMEUBLE_STATS.NBSUSFRAUDCLI,0) as NBSUSFRAUDCLI, ";

                    //Nb Anomalies de conso
                    if (Pinfos.GetParam("NBANOMALIES").ToUpper() != "N" || Pfiltres.GetParam("ANOMALIES").ToUpper() == "O")
                        Fields +=
$@"(SELECT count(*) 
FROM INDEXCONSO, RELEVE  
WHERE ((indexconso.code1 in ('91')) or (indexconso.code2 in ('91')) or (indexconso.code3 in ('91')) or (indexconso.code4 in ('91')))
AND releve.datereleve=(SELECT max(releve.datereleve) FROM releve WHERE releve.fkimmeuble = pkimmeuble AND releve.datecloture is not null)
AND (indexconso.fkreleve=releve.pkreleve AND releve.fkimmeuble=pkimmeuble)) as NBANO,";

                    if (Pinfos.GetParam("NBCHANTIERS").ToUpper() != "N" || Pfiltres.GetParam("CHANTIERS").ToUpper() == "O")
                        Fields +=
$@"(SELECT COUNT(*)
FROM chantier, devis_immeuble, devis
WHERE devis.actif = 'O'
AND chantier.datecloturedossier IS NULL
AND devis_immeuble.fkdevis = devis.pkdevis
AND chantier.fkdevis = devis.pkdevis
AND chantier.typec = 'POSE COMPTEUR'
AND devis_immeuble.fkimmeuble=chantier.fkimmeuble
AND devis_immeuble.dateentreecommande IS NOT NULL
AND devis_immeuble.dateentreecommande >= sysdate - 365
AND chantier.fkimmeuble = immeuble.pkimmeuble) as NB_CHANTIERS,";

                    string QueryImms = GetQueryImmeubles(Fields.Trim(",".ToCharArray()), "U", PkUserWanted);

                    //Gestion recherche
                    string AdditionnalFilter = "";

                    if (Pfiltres.GetParam("FIELD_ALLFIELDS").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("IMMEUBLE.CODEGESTIO|IMMEUBLE.ID|IMMEUBLE.ADRESSE|IMMEUBLE.ADRESSE2|IMMEUBLE.ADRESSE3|IMMEUBLE.CP|IMMEUBLE.VILLE|IMMEUBLE.NOM", Pfiltres.GetParam("FIELD_ALLFIELDS").Trim());

                    if (Pfiltres.GetParam("FIELD_REF").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("IMMEUBLE.CODEGESTIO", Pfiltres.GetParam("FIELD_REF").Trim());

                    if (Pfiltres.GetParam("FIELD_REF-NUMERO").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("IMMEUBLE.CODEGESTIO|IMMEUBLE.ID", Pfiltres.GetParam("FIELD_REF-NUMERO").Trim());

                    if (Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("IMMEUBLE.ADRESSE|IMMEUBLE.ADRESSE2|IMMEUBLE.ADRESSE3|IMMEUBLE.CP|IMMEUBLE.VILLE", Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim());

                    if (Pfiltres.GetParam("FIELD_NOM").Trim() != "")
                        AdditionnalFilter += " and " + GetFtxtFilter("IMMEUBLE.NOM", Pfiltres.GetParam("FIELD_NOM").Trim());

                    if (AdditionnalFilter.Trim() != "")
                        QueryImms += " " + AdditionnalFilter;

                    DataTable imms = WS_DBUtils.utils_LER.DBSelectTable(QueryImms);

                    int nbImmeubles = imms.Select("ACTIF='O'").Length;

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
$@"SELECT client.noteoccupant, client.espaceclient_dateactivationcli, 
client.espaceclient_dateactivationocc,
client.espaceclient_showbillingocc, client.espaceclient_gestion,
client.espaceclient_showfactures, client.espaceclient_showchantiers
FROM client 
WHERE pkclient = {imms.Rows[0]["FKCLIENTTOP"]}");
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

                    foreach (DataRow imm in imms.Rows)
                    {
                        if (!UserConnected.showImmeublesArc && (imm["ACTIF"].ToString() == "N")) continue;

                        infosImmeuble InfosImm = new infosImmeuble
                        {
                            Immeuble = GetImmeubleByRow(imm)
                        };
                        if (espaceclient_gestion.ToLower() == "client")
                        {
                            InfosImm.Immeuble.HasNoteOccupant = HasNoteOccupant;
                            InfosImm.Immeuble.HasDecompteOccupant = HasDecompteOccupant;
                            InfosImm.Immeuble.DateActivationClient = DateActivationCli;
                            InfosImm.Immeuble.DateActivationOccupant = DateActivationOcc;
                            InfosImm.Immeuble.HasFactures = HasFactures;
                            InfosImm.Immeuble.HasChantiers = HasChantiers;
                        }
                        else // gestion à l'immeuble
                        {
                            InfosImm.Immeuble.HasNoteOccupant = imm["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                            InfosImm.Immeuble.HasDecompteOccupant = imm["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                            InfosImm.Immeuble.DateActivationClient = DateActivationCli;
                            InfosImm.Immeuble.DateActivationOccupant = imm["ESPACECLIENT_DATEACTIVATIONOCC"].ToString().ToDateTime();
                            InfosImm.Immeuble.HasFactures = imm["ESPACECLIENT_SHOWFACTURES"].ToString().ToBooleanOrDefault(false);
                            InfosImm.Immeuble.HasChantiers = imm["ESPACECLIENT_SHOWCHANTIERS"].ToString().ToBooleanOrDefault(false);
                        }
                        // gestion du filtre
                        bool Exclue = false;

                        //NbCompteurs
                        InfosImm.NbCompteursEC = Convert.ToInt32(imm["NBEC"]);
                        InfosImm.NbCompteursEF = Convert.ToInt32(imm["NBEF"]);
                        InfosImm.NbCompteursRepart = Convert.ToInt32(imm["NBREPART"]);
                        InfosImm.NbCompteursCET = Convert.ToInt32(imm["NBCET"]);
                        InfosImm.NbCompteursCapteur = Convert.ToInt32(imm["NBCAPTEUR"]);//ne sera pas compté dans appareils
                        InfosImm.NbAppareils = InfosImm.NbCompteursEC + InfosImm.NbCompteursEF + InfosImm.NbCompteursRepart + InfosImm.NbCompteursCET;

                        // Infos Logements
                        int NbLogements = -1;
                        if (Pinfos.GetParam("NBLOGEMENTS").ToUpper() != "N")
                        {
                            NbLogements = Convert.ToInt32(imm["NBLOG"]);
                        }
                        InfosImm.NbLogements = NbLogements;

                        // Infos Fuites --> Mongo
                        int NbFuites = -1;
                        if ((Pinfos.GetParam("NBFUITES").ToUpper() != "N" || Pfiltres.GetParam("FUITES").ToUpper() == "O"))
                        {
                            NbFuites = Convert.ToInt32(imm["NBFUITES"]);
                        }
                        InfosImm.NbFuites = NbFuites;

                        // Infos Depannages -->SF
                        int NbDepannages = -1;
                        if (Pinfos.GetParam("NBDEPANNAGES").ToUpper() != "N" || Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O")
                        {
                            NbDepannages = Convert.ToInt32(imm["NBDEPANNAGES"]);
                        }
                        InfosImm.NbDepannages = NbDepannages;

                        // Infos Dysfonctionnements --> Mongo
                        int NbDysfonctionnements = -1;
                        if (Pinfos.GetParam("NBDYSFONCTIONNEMENTS").ToUpper() != "N" || Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O")
                        {
                            int nbAlarms = Convert.ToInt32(imm["NBALARMS"]);
                            int nbSusFraudCli = Convert.ToInt32(imm["NBSUSFRAUDCLI"]);
                            NbDysfonctionnements = nbAlarms - nbSusFraudCli;
                        }
                        InfosImm.NbDysfonctionnements = NbDysfonctionnements;

                        // Infos Anomalies --> Relevés
                        int NbAnomalies = -1;
                        if (Pinfos.GetParam("NBANOMALIES").ToUpper() != "N" || Pfiltres.GetParam("ANOMALIES").ToUpper() == "O")
                            NbAnomalies = Convert.ToInt32(imm["NBANO"]);
                        InfosImm.NbAnomalies = NbAnomalies;

                        // gestion du filtre:
                        if (Pfiltres.GetParam("FUITES").ToUpper() == "O" && NbFuites <= 0)
                            Exclue = true;

                        if (Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O" && NbDepannages <= 0)
                            Exclue = true;

                        if (Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O" && NbDysfonctionnements <= 0)
                            Exclue = true;

                        if (Pfiltres.GetParam("ANOMALIES").ToUpper() == "O" && NbAnomalies <= 0)
                            Exclue = true;

                        // chantiers
                        int NbChantiers = -1;
                        if (Pinfos.GetParam("NBCHANTIERS").ToUpper() != "N" || Pfiltres.GetParam("CHANTIERS").ToUpper() == "O")
                            NbChantiers = imm["NB_CHANTIERS"].ToString().ToInt32OrDefault(-1);

                        if (Pfiltres.GetParam("CHANTIERS").ToUpper() == "O" && NbChantiers <= 0)
                            Exclue = true;
                        InfosImm.NbChantiers = NbChantiers;

                        if (!UserConnected.showImmeublesArc && InfosImm.NbAppareils < 0 && InfosImm.NbCompteursCapteur <= 0)
                            Exclue = true;

                        if (Exclue == false)
                            InfosImms.ListeInfosImmeubles.Add(InfosImm);
                    }
                }

            }
            catch (Exception Ex)
            {
                InfosImms.Erreur = Ex.Message;
            }

            return InfosImms;
#endif
        }

        /// <summary>
        /// Récupère les occupants d'un immeuble
        /// </summary>
        /// <param name="PkImmeuble">PK Immeuble</param>
        /// <returns></returns>
        static private DataRowCollection GetOccupantsByImmeuble(int PkImmeuble)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - logement remplace par web_logement
#if WS2
            string Query =
$@"SELECT web_occupant.pkoccupant, web_occupant.nom, web_occupant.datearrivee, web_occupant.datedepart,
    web_occupant.codelogegestio, web_occupant.email
FROM web_logement, web_occupant
    AND web_occupant.fklogement = web_logement.pklogement
WHERE SYSDATE between datearrivee AND datedepart
    AND Web_logement.fkimmeuble={PkImmeuble} ";

            return WS_DBUtils.utils_LER.DBSelectRows(Query);

#else
            string Query =
$@"SELECT pkoccupant, occupant.nom, datearrivee, datedepart, occupant.codelogegestio, email
FROM occupant, logement, batiment
WHERE occupant.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND SYSDATE between datearrivee AND datedepart
AND batiment.fkimmeuble={PkImmeuble} ";

            return WS_DBUtils.utils_LER.DBSelectRows(Query);
#endif
        }
        /// <summary>
        /// Retourne un objet occupant initialisé avec les informations provenant d'un datarow
        /// </summary>
        /// <param name="drOcc">Ligne de données</param>
        /// <returns>Retourne un objet occupant</returns>
        private static occupant GetOccupantByRow(DataRow drOcc)
        {
            occupant occ = new occupant
            {
                PkOccupant = drOcc["PKOCCUPANT"].ToString().ToInt32OrDefault(-1),
                Nom = AnonymizeContactName(drOcc["NOM"].ToString()),
                Ref = drOcc["CODELOGEGESTIO"].ToString(),
                DateArrivee = drOcc["DATEARRIVEE"].ToString().ToDateTime(),
                DateDepart = drOcc["DATEDEPART"].ToString().ToDateTime()
            };

            return occ;
        }

        /// <summary>
        /// Récupère le nombre d'immeubles en téléreleve d'un User (TypeConteneur=U), ou d'un M, A, S, I, L
        /// </summary>
        /// <param name="TypeConteneur">Type Conteneur U(User) ou sinon directement(M, A, S, I, L (dans ce cas, le pk est celui d'une maison mère, ..., immeuble))</param>
        /// <param name="PkConteneur">Pk du User (si TypeConteneur = U), sinon Pk d'un immeuble, agence, maison mère, syndic</param>
        /// <returns></returns>
        static public int getNbImmeubles(string TypeConteneur, int PkConteneur)
        {
            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(QuerySelectPkImm);
            return Drc.Count;
        }

        /// <summary>
        /// Récupère le nombre d'immeubles en téléreleve d'un User (TypeConteneur=U), ou d'un M, A, S, I, L
        /// </summary>
        /// <param name="TypeConteneur">Type Conteneur U(User) ou sinon directement(M, A, S, I, L (dans ce cas, le pk est celui d'une maison mère, ..., immeuble))</param>
        /// <param name="PkConteneur">Pk du User (si TypeConteneur = U), sinon Pk d'un immeuble, agence, maison mère, syndic</param>
        /// <returns></returns>
        static private int getNbImmeublesTelereleve(string TypeConteneur, int PkConteneur)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
#if WS2
            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            string QueryR;

            QueryR = $@"SELECT pkimmeuble 
                    FROM Web_immeuble
                    WHERE telereleve='O'
                        AND Web_immeuble.pkimmeuble in ( {QuerySelectPkImm})";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(QueryR);
            return Drc.Count;
#else
            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            string QueryR;

            QueryR = $@"SELECT pkimmeuble FROM immeuble
                    WHERE telereleve='O'
                    AND immeuble.pkimmeuble in ( {QuerySelectPkImm})";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(QueryR);
            return Drc.Count;
#endif
        }

        #region alarmes

        /// <summary>
        /// Récupère le nombre de dysfonctionnements (alarmes techniques) d'un User (TypeConteneur=U), ou d'un M, A, S, I, L, C (compteur), + Occupant
        /// </summary>
        /// <param name="ParamsFiltres">Filtres pour pouvoir filtrer sur un occupant, compteur, immeuble, logement ou/et utilisateur </param>
        /// <param name="Fluides">Types de fluide 
        /// Valeurs possibles cumulables (le séparateur est |)
        /// EF : Eau froide
        /// EC : Eau chaude</param>
        /// <param name="Date">Date de la demande</param>
        /// <returns></returns>
        static private int GetNbDysfonctionnements(string ParamsFiltres, string Fluides, DateTime Date)
        {

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);


            if (Pfiltres.GetParam("PKOCCUPANT") == "-1")
                return -1;

            Date = Date.AddDays(-1); // Mod 5.1, infos envoyées la veille

            if (Pfiltres.GetParam("PKOCCUPANT") != "") // cas particulier : si l'occupant est parti, on envoit jamais les fuites
            {
                occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                if (Occupant.DateDepart < Date)
                    return -1;
            }

            #region Select2
            Dictionary<string, object> projectDic2 = new Dictionary<string, object>
                            {
                                { "NB_ALARMESTECH_WEB", "$" + Mongo_DBUtils.INDEXCONSOTCH.NB_ALARMESTECH_WEB },
                                { "SUSFRAUDCLINB2",new BsonDocument().Add("$cond", new BsonArray().Add(Mongo_DBUtils.AreEqual("$SUSFRAUDCLINB", "O"))
                                                                  .Add(1)
                                                                  .Add(0)
                                                                         )
                                }
                            };
            var select2 = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic2);

            #endregion

            #region Where pour la table Join

            Dictionary<string, object> matchList4Join = new Dictionary<string, object>
            {
                    { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Date},
                    { Mongo_DBUtils.INDEXCONSOTCH.NB_ALARMESTECH_WEB,  new BsonDocument().Add("$exists", true)},
            };
            #endregion

            #region Join 
            BsonDocument lookup4Join, unwind4Join, match4Join;

            string aliasJoinTable = "indexHisto";

            WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable, matchList4Join, out lookup4Join, out unwind4Join, out match4Join);

            #endregion

            #region GroupBy pour distinct

            var groupDistinct = new BsonDocument
            {
                {
                    "$group",
                    new BsonDocument().Add("_id", new BsonDocument().Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK,"$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK))
                                      .Add(Mongo_DBUtils.INDEXCONSOTCH.NB_ALARMESTECH_WEB,new BsonDocument().Add("$first","$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.NB_ALARMESTECH_WEB))
                                      .Add("SUSFRAUDCLINB",new BsonDocument().Add("$first","$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.SUSPFRAUDECLIENT))
                }
            };

            #endregion

            #region Group

            var groupSum = new BsonDocument
            {
                {
                    "$group",
                    new BsonDocument().Add("_id", new BsonDocument())
                                      .Add("SUM",new BsonDocument().Add("$sum","$NB_ALARMESTECH_WEB")) //somme
                                      .Add("SUMSUSFRAUDCLI",new BsonDocument().Add("$sum","$SUSFRAUDCLINB2"))
                }
            };

            #endregion

            #region Where

            Dictionary<string, object> matchList = new Dictionary<string, object>
            {
                { Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEINSTALL, new BsonDocument().Add("$lte", Date) },
                {
                    "$or",
                    new BsonArray().Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$gte", Date)))
                                   .Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$exists", false))) //Vérifie que le champ n'existe pas (équivalant au DATEDEPOSE IS NULL en SQL)
                }
            };
            if (!string.IsNullOrEmpty(Fluides))
            {
                FilterCriterias added2Dic = GetFluidesFilter4Mongo(Fluides);
                if (!string.IsNullOrEmpty(added2Dic.key))
                    matchList.Add(added2Dic.key, added2Dic.criteria);
            }

            if (Pfiltres.GetParam("PKLOGEMENT") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, Convert.ToDecimal(Pfiltres.GetParam("PKLOGEMENT")));
            else if (Pfiltres.GetParam("PKAPPAREIL") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Convert.ToDecimal(Pfiltres.GetParam("PKAPPAREIL")));
            else if (Pfiltres.GetParam("PKIMMEUBLE") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, Convert.ToDecimal(Pfiltres.GetParam("PKIMMEUBLE")));
            else if (Pfiltres.GetParam("PKUSER") != "")
            {
                string Query = GetQueryImmeubles("PKIMMEUBLE", "U", Convert.ToInt32(Pfiltres.GetParam("PKUSER")));

                List<decimal> immeublesPk = new List<decimal>();

                DataRowCollection drcImmeubles = WS_DBUtils.utils_LER.DBSelectRows(Query);
                foreach (DataRow drImmeuble in drcImmeubles)
                    immeublesPk.Add(Convert.ToDecimal(drImmeuble["PKIMMEUBLE"].ToString()));

                matchList.Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(immeublesPk)));
            }

            var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

            #endregion

            var pipeline4FlagsAlarme = new[] { match, lookup4Join, unwind4Join, match4Join, groupDistinct, select2, groupSum };

            //trop long
            DataTable dtDebutFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline4FlagsAlarme);

            int NbDysfonctionnements = -1;
            try
            {
                if (dtDebutFuite != null && dtDebutFuite.Rows.Count > 0)
                    NbDysfonctionnements = (int)dtDebutFuite.Rows[0]["SUM"] - (int)dtDebutFuite.Rows[0]["SUMSUSFRAUDCLI"];
                else
                    NbDysfonctionnements = 0;
            }
            catch
            {
            }

            return NbDysfonctionnements;
        }

        /// <summary>
        /// Récupère le nombre de flags (fuites etc..) d'un User (TypeConteneur=U), ou d'un M, A, S, I, L, C (compteur), + Occupant
        /// </summary>
        /// <param name="ParamsFiltres">Filtres pour pouvoir filtrer sur un occupant, compteur, immeuble, logement ou/et utilisateur </param>
        /// <param name="Fluides">Types de fluide 
        /// Valeurs possibles cumulables (le séparateur est |)
        /// EF : Eau froide
        /// EC : Eau chaude</param>
        /// <param name="FlagField">Type de fuite</param>
        /// <param name="Date">Date de la demande</param>
        /// <returns></returns>
        // 
        static private int GetNbFlagsAlarme(string ParamsFiltres, string Fluides, string FlagField, DateTime Date)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - immeuble_stats remplace par web_immeuble
#if WS2
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            Date = Date.AddDays(-1).Date; // Mod 5.1, infos envoyées la veille
                                          //string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);

            if (Pfiltres.GetParam("PKIMMEUBLE") != "")
            {
                string sql =
                   $@"SELECT nbfuites
                    FROM web_immeuble
                    WHERE fkimmeuble = {Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-999)}";
                return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(0);
            }

            else if (Pfiltres.GetParam("PKUSER") != "")
            {
                string sql = GetQueryImmeubles("NBFUITES", "U", Convert.ToInt32(Pfiltres.GetParam("PKUSER")));
                DataTable imms = WS_DBUtils.utils_LER.DBSelectTable(sql);
                int nbfuites = 0;
                foreach (DataRow imm in imms.Rows)
                    nbfuites += imm["NBFUITES"].ToString().ToInt32OrDefault(0);
                return nbfuites;
            }

            if (Pfiltres.GetParam("PKOCCUPANT") != "") // cas particulier : si l'occupant est parti, on envoit jamais les fuites
            {
                occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                if (Occupant.DateDepart.Date < Date)
                    return -1;
            }

            #region Where pour la table Join

            Dictionary<string, object> matchList4Join = new Dictionary<string, object>
            {
                    { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Date},
                    { Mongo_DBUtils.GetEquivalentNameInMongo(FlagField),"O"}
            };
            #endregion

            #region Join 
            BsonDocument lookup4Join, unwind4Join, match4Join;

            string aliasJoinTable = "indexHisto";

            WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable, matchList4Join, out lookup4Join, out unwind4Join, out match4Join);

            #endregion

            #region GroupBy pour distinct

            Dictionary<string, string> groupList = new Dictionary<string, string>
            {
                { Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK },
                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX }
            };
            var groupDistinct = WS_DBUtils.utils_Mongo.Group2BsonDocument(groupList);
            #endregion

            #region Where

            Dictionary<string, object> matchList = new Dictionary<string, object>
            {
                { Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEINSTALL, new BsonDocument().Add("$lte", Date) },
                {
                    "$or",
                    new BsonArray().Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$gte", Date)))
                                   .Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$exists", false))) //Vérifie que le champ n'existe pas (équivalant au DATEDEPOSE IS NULL en SQL)
                }
            };
            if (!string.IsNullOrEmpty(Fluides))
            {
                FilterCriterias added2Dic = GetFluidesFilter4Mongo(Fluides);
                if (!string.IsNullOrEmpty(added2Dic.key))
                    matchList.Add(added2Dic.key, added2Dic.criteria);
            }

            if (Pfiltres.GetParam("PKLOGEMENT") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, Convert.ToDecimal(Pfiltres.GetParam("PKLOGEMENT")));
            else if (Pfiltres.GetParam("PKAPPAREIL") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Convert.ToDecimal(Pfiltres.GetParam("PKAPPAREIL")));
            else if (Pfiltres.GetParam("PKIMMEUBLE") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, Convert.ToDecimal(Pfiltres.GetParam("PKIMMEUBLE")));
            else if (Pfiltres.GetParam("PKUSER") != "")
            {
                string Query = GetQueryImmeubles("PKIMMEUBLE", "U", Convert.ToInt32(Pfiltres.GetParam("PKUSER")));

                List<decimal> immeublesPk = new List<decimal>();

                DataRowCollection drcImmeubles = WS_DBUtils.utils_LER.DBSelectRows(Query);
                foreach (DataRow drImmeuble in drcImmeubles)
                    immeublesPk.Add(Convert.ToDecimal(drImmeuble["PKIMMEUBLE"].ToString()));

                matchList.Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(immeublesPk)));
            }

            var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

            #endregion

            var pipeline4FlagsAlarme = new[] { match, lookup4Join, unwind4Join, match4Join, groupDistinct };

            DataTable dtDebutFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline4FlagsAlarme);

            int Nb = -1;
            try
            {
                if (dtDebutFuite != null && dtDebutFuite.Rows.Count > 0)
                    Nb = (int)dtDebutFuite.Rows.Count;
                else
                    Nb = 0;
            }
            catch
            {
            }

            return Nb;
#else

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            Date = Date.AddDays(-1).Date; // Mod 5.1, infos envoyées la veille
                                          //string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);

            if (Pfiltres.GetParam("PKIMMEUBLE") != "")
            {
                string sql =
                   $@"SELECT nbfuites
                    FROM immeuble_stats
                    WHERE fkimmeuble = {Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-999)}";
                return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(0);
            }

            else if (Pfiltres.GetParam("PKUSER") != "")
            {
                string sql = GetQueryImmeubles("NBFUITES", "U", Convert.ToInt32(Pfiltres.GetParam("PKUSER")));
                DataTable imms = WS_DBUtils.utils_LER.DBSelectTable(sql);
                int nbfuites = 0;
                foreach (DataRow imm in imms.Rows)
                    nbfuites += imm["NBFUITES"].ToString().ToInt32OrDefault(0);
                return nbfuites;
            }

            if (Pfiltres.GetParam("PKOCCUPANT") != "") // cas particulier : si l'occupant est parti, on envoit jamais les fuites
            {
                occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                if (Occupant.DateDepart.Date < Date)
                    return -1;
            }

            #region Where pour la table Join

            Dictionary<string, object> matchList4Join = new Dictionary<string, object>
            {
                    { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Date},
                    { Mongo_DBUtils.GetEquivalentNameInMongo(FlagField),"O"}
            };
            #endregion

            #region Join 
            BsonDocument lookup4Join, unwind4Join, match4Join;

            string aliasJoinTable = "indexHisto";

            WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable, matchList4Join, out lookup4Join, out unwind4Join, out match4Join);

            #endregion

            #region GroupBy pour distinct

            Dictionary<string, string> groupList = new Dictionary<string, string>
            {
                { Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK },
                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX }
            };
            var groupDistinct = WS_DBUtils.utils_Mongo.Group2BsonDocument(groupList);
            #endregion

            #region Where

            Dictionary<string, object> matchList = new Dictionary<string, object>
            {
                { Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEINSTALL, new BsonDocument().Add("$lte", Date) },
                {
                    "$or",
                    new BsonArray().Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$gte", Date)))
                                   .Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$exists", false))) //Vérifie que le champ n'existe pas (équivalant au DATEDEPOSE IS NULL en SQL)
                }
            };
            if (!string.IsNullOrEmpty(Fluides))
            {
                FilterCriterias added2Dic = GetFluidesFilter4Mongo(Fluides);
                if (!string.IsNullOrEmpty(added2Dic.key))
                    matchList.Add(added2Dic.key, added2Dic.criteria);
            }

            if (Pfiltres.GetParam("PKLOGEMENT") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, Convert.ToDecimal(Pfiltres.GetParam("PKLOGEMENT")));
            else if (Pfiltres.GetParam("PKAPPAREIL") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Convert.ToDecimal(Pfiltres.GetParam("PKAPPAREIL")));
            else if (Pfiltres.GetParam("PKIMMEUBLE") != "")
                matchList.Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, Convert.ToDecimal(Pfiltres.GetParam("PKIMMEUBLE")));
            else if (Pfiltres.GetParam("PKUSER") != "")
            {
                string Query = GetQueryImmeubles("PKIMMEUBLE", "U", Convert.ToInt32(Pfiltres.GetParam("PKUSER")));

                List<decimal> immeublesPk = new List<decimal>();

                DataRowCollection drcImmeubles = WS_DBUtils.utils_LER.DBSelectRows(Query);
                foreach (DataRow drImmeuble in drcImmeubles)
                    immeublesPk.Add(Convert.ToDecimal(drImmeuble["PKIMMEUBLE"].ToString()));

                matchList.Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(immeublesPk)));
            }

            var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

            #endregion

            var pipeline4FlagsAlarme = new[] { match, lookup4Join, unwind4Join, match4Join, groupDistinct };

            DataTable dtDebutFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline4FlagsAlarme);

            int Nb = -1;
            try
            {
                if (dtDebutFuite != null && dtDebutFuite.Rows.Count > 0)
                    Nb = (int)dtDebutFuite.Rows.Count;
                else
                    Nb = 0;
            }
            catch
            {
            }

            return Nb;
#endif

        }

        /// <summary>
        /// Récupère les informations sur les fuites pour un immeuble donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble">N° d'immeuble</param>
        /// <param name="Date">Date de la requête</param>
        /// <param name="ParamsFiltres">Filtres pour pouvoir filtrer sur un occupant, compteur, immeuble, logement ou/et utilisateur </param>
        /// <returns></returns>
        static public infosFuites GetInfosFuitesByImmeuble(string SessionID, int PkUser, int PkImmeuble, DateTime Date, string ParamsFiltres)
        {
            //WEBTODO :
            //Remplace 
#if WS2
            infosFuites InfosFuites = new infosFuites();

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            try
            {

                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosFuites.Erreur = "incohérence de session";
                    return InfosFuites;
                }
                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    {
                        InfosFuites.Erreur = "incohérence User, Occupant";
                        return InfosFuites;
                    }
                }
                else
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosFuites.Erreur = "incohérence user / immeuble";
                        return InfosFuites;
                    }
                }

                Date = Date.AddDays(-1).Date; // Mod 5.1, infos envoyées la veille

                string aliasJoinTable = "indexHisto";

                #region Select
                Dictionary<string, object> projectDic = new Dictionary<string, object>
                {
                    { "PKCOMPTEUR", "$_id." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK},
                    { "DATEINDEX", "$_id." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX},
                    { "THEINDEXD","$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD},
                    { "PKLOGEMENT" , "$" + Mongo_DBUtils.STRUCTURE.LOGEMENT_FK},
                    { "NUMEROSERIE" , "$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMSERIE},
                    { "FKCRITERE" , "$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE},
                    { "FKSOUSFAMILLE" , "$" + Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE},
                    { "EMPLACEMENT" , "$" + Mongo_DBUtils.STRUCTURE.EMPLACEMENT_LIB},
                };
                var select = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);

                #endregion

                #region Where pour la table Join

                Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                {
                    { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Date},
                    { Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT, "O"},
                    { Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK ,PkImmeuble },
                };

                #endregion

                #region Join 

                WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable, matchList4Join, out BsonDocument lookup4Join, out BsonDocument unwind4Join, out BsonDocument match4Join);

                #endregion

                #region GroupBy avec distinct

                var groupDistinct = new BsonDocument
                {
                    {
                        "$group",
                        new BsonDocument().Add("_id", new BsonDocument()
                                                                       .Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK,"$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK)
                                                                       .Add(Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,"$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX)
                                                )
                                          .Add(Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD,new BsonDocument().Add("$first","$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD))
                                          .Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.LOGEMENT_FK))
                                          .Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMSERIE,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMSERIE))
                                          .Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE))
                                          .Add(Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE))
                                          .Add(Mongo_DBUtils.STRUCTURE.EMPLACEMENT_LIB,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.EMPLACEMENT_LIB))
                    }
                };
                #endregion

                #region Where

                Dictionary<string, object> matchList = new Dictionary<string, object>
                {
                    { Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEINSTALL, new BsonDocument().Add("$lte", Date) },
                    { Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK ,PkImmeuble },
                    {
                        "$or",
                        new BsonArray().Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$gte", Date)))
                                       .Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$exists", false))) //Vérifie que le champ n'existe pas (équivalant au DATEDEPOSE IS NULL en SQL)
                    }
                };

                if (Pfiltres.GetParam("PKOCCUPANT") != "") // cas particulier : si l'occupant est parti, on envoit jamais les fuites
                {
                    occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                    if (Occupant.DateDepart < Date)
                        return InfosFuites;
                    if (Pfiltres.GetParam("PKLOGEMENT").Trim() == "")
                        matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, GetPkLogementByPkOccupant(Occupant.PkOccupant));
                }

                if (Pfiltres.GetParam("PKLOGEMENT") != "")
                    matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, Convert.ToDecimal(Pfiltres.GetParam("PKLOGEMENT")));
                if (Pfiltres.GetParam("PKAPPAREIL") != "")
                    matchList.Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Convert.ToDecimal(Pfiltres.GetParam("PKAPPAREIL")));

                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                #endregion

                var pipeline4Fuite = new[] { match, lookup4Join, unwind4Join, match4Join, groupDistinct, select };

                DataTable dtFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline4Fuite);

                DataRowCollection DrcFuites;

                if (dtFuite != null && dtFuite.Rows.Count > 0)
                {
                    DrcFuites = dtFuite.Rows;

                    foreach (DataRow DrFuite in DrcFuites)
                    {
                        infosFuite InfosFuite = new infosFuite();

                        int PkCompteur = int.Parse(DrFuite["PKCOMPTEUR"].ToString());
                        DateTime DateIndexFuite = DateTime.Parse(DrFuite["DATEINDEX"].ToString());
                        DataRow drInfosFuite = GetRowFirstDayFlag(PkCompteur, DateIndexFuite, "FUITECLIENT");

                        int PkLogement = int.Parse(DrFuite["PKLOGEMENT"].ToString());

                        //TODO à optimiser peut-être

                        string queryLGT = $@"SELECT web_logement.numbatiment AS numbatiment, web_logement.adrbatiment AS adrbatiment,
                                        web_logement.numescalier, web_logement.adresseesc AS adrescalier,
                                        web_logement.numetage, web_logement.numordre, web_logement.pklogement, 
                                        web_logement.typelogement, 
                                        web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio,
                                        web_occupant.datearrivee, web_occupant.datedepart, web_occupant.fkimmeuble
                                    FROM web_logement, web_occupant 
                                    WHERE pklogement = {PkLogement}
                                       AND web_occupant.fklogement = web_logement.pklogement ";

                        DataRow drLogement = WS_DBUtils.utils_LER.DBSelectRow(queryLGT);


                        InfosFuite.Logement = GetLogementByRow(drLogement);
                        InfosFuite.Occupant = GetOccupantByRow(drLogement);
                        InfosFuite.Appareil = GetAppareilByPk4Mongo(DrFuite);
                        InfosFuite.Fuite.Duree = Convert.ToInt32(drInfosFuite["DUREE"]);
                        InfosFuite.Fuite.DateDebut = Convert.ToDateTime(drInfosFuite["DATEINDEX"]);
                        InfosFuite.Fuite.IndexDebut = Convert.ToDecimal(drInfosFuite["THEINDEXD"]);
                        decimal i2 = decimal.Parse(DrFuite["THEINDEXD"].ToString());
                        decimal i1 = decimal.Parse(drInfosFuite["THEINDEXD"].ToString());
                        InfosFuite.Fuite.Conso = i2 - i1;
                        //

                        InfosFuites.ListeInfosFuites.Add(InfosFuite);
                    }

                }

            }

            catch (Exception Ex)
            {
                InfosFuites.Erreur = Ex.Message;
            }
            return InfosFuites;
#else

            infosFuites InfosFuites = new infosFuites();

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            try
            {

                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosFuites.Erreur = "incohérence de session";
                    return InfosFuites;
                }
                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    {
                        InfosFuites.Erreur = "incohérence User, Occupant";
                        return InfosFuites;
                    }
                }
                else
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosFuites.Erreur = "incohérence user / immeuble";
                        return InfosFuites;
                    }
                }

                Date = Date.AddDays(-1).Date; // Mod 5.1, infos envoyées la veille

                string aliasJoinTable = "indexHisto";

                #region Select
                Dictionary<string, object> projectDic = new Dictionary<string, object>
                {
                    { "PKCOMPTEUR", "$_id." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK},
                    { "DATEINDEX", "$_id." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX},
                    { "THEINDEXD","$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD},
                    { "PKLOGEMENT" , "$" + Mongo_DBUtils.STRUCTURE.LOGEMENT_FK},
                    { "NUMEROSERIE" , "$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMSERIE},
                    { "FKCRITERE" , "$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE},
                    { "FKSOUSFAMILLE" , "$" + Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE},
                    { "EMPLACEMENT" , "$" + Mongo_DBUtils.STRUCTURE.EMPLACEMENT_LIB},
                };
                var select = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);

                #endregion

                #region Where pour la table Join

                Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                {
                    { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Date},
                    { Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT, "O"},
                    { Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK ,PkImmeuble },
                };

                #endregion

                #region Join 

                WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable, matchList4Join, out BsonDocument lookup4Join, out BsonDocument unwind4Join, out BsonDocument match4Join);

                #endregion

                #region GroupBy avec distinct

                var groupDistinct = new BsonDocument
                {
                    {
                        "$group",
                        new BsonDocument().Add("_id", new BsonDocument()
                                                                       .Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK,"$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK)
                                                                       .Add(Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,"$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX)
                                                )
                                          .Add(Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD,new BsonDocument().Add("$first","$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD))
                                          .Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.LOGEMENT_FK))
                                          .Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMSERIE,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMSERIE))
                                          .Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE))
                                          .Add(Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE))
                                          .Add(Mongo_DBUtils.STRUCTURE.EMPLACEMENT_LIB,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.EMPLACEMENT_LIB))
                    }
                };
                #endregion

                #region Where

                Dictionary<string, object> matchList = new Dictionary<string, object>
                {
                    { Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEINSTALL, new BsonDocument().Add("$lte", Date) },
                    { Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK ,PkImmeuble },
                    {
                        "$or",
                        new BsonArray().Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$gte", Date)))
                                       .Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$exists", false))) //Vérifie que le champ n'existe pas (équivalant au DATEDEPOSE IS NULL en SQL)
                    }
                };

                if (Pfiltres.GetParam("PKOCCUPANT") != "") // cas particulier : si l'occupant est parti, on envoit jamais les fuites
                {
                    occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                    if (Occupant.DateDepart < Date)
                        return InfosFuites;
                    if (Pfiltres.GetParam("PKLOGEMENT").Trim() == "")
                        matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, GetPkLogementByPkOccupant(Occupant.PkOccupant));
                }

                if (Pfiltres.GetParam("PKLOGEMENT") != "")
                    matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, Convert.ToDecimal(Pfiltres.GetParam("PKLOGEMENT")));
                if (Pfiltres.GetParam("PKAPPAREIL") != "")
                    matchList.Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Convert.ToDecimal(Pfiltres.GetParam("PKAPPAREIL")));

                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                #endregion

                var pipeline4Fuite = new[] { match, lookup4Join, unwind4Join, match4Join, groupDistinct, select };

                DataTable dtFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline4Fuite);

                DataRowCollection DrcFuites;

                if (dtFuite != null && dtFuite.Rows.Count > 0)
                {
                    DrcFuites = dtFuite.Rows;

                    foreach (DataRow DrFuite in DrcFuites)
                    {
                        infosFuite InfosFuite = new infosFuite();

                        int PkCompteur = int.Parse(DrFuite["PKCOMPTEUR"].ToString());
                        DateTime DateIndexFuite = DateTime.Parse(DrFuite["DATEINDEX"].ToString());
                        DataRow drInfosFuite = GetRowFirstDayFlag(PkCompteur, DateIndexFuite, "FUITECLIENT");

                        int PkLogement = int.Parse(DrFuite["PKLOGEMENT"].ToString());

                        //TODO à optimiser peut-être
                        InfosFuite.Logement = GetLogementByPk(PkLogement);
                        InfosFuite.Occupant = GetOccupantByPk(GetPkOccupantByPkLogement(PkLogement, DateTime.Now));
                        InfosFuite.Appareil = GetAppareilByPk4Mongo(DrFuite);
                        InfosFuite.Fuite.Duree = Convert.ToInt32(drInfosFuite["DUREE"]);
                        InfosFuite.Fuite.DateDebut = Convert.ToDateTime(drInfosFuite["DATEINDEX"]);
                        InfosFuite.Fuite.IndexDebut = Convert.ToDecimal(drInfosFuite["THEINDEXD"]);
                        decimal i2 = decimal.Parse(DrFuite["THEINDEXD"].ToString());
                        decimal i1 = decimal.Parse(drInfosFuite["THEINDEXD"].ToString());
                        InfosFuite.Fuite.Conso = i2 - i1;
                        //

                        InfosFuites.ListeInfosFuites.Add(InfosFuite);
                    }

                }

            }

            catch (Exception Ex)
            {
                InfosFuites.Erreur = Ex.Message;
            }
            return InfosFuites;
#endif
        }
        /// <summary>
        /// Récupère mes disfonctionnement poour un immeuble et un utilisateur donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble"></param>
        /// <param name="Date"></param>
        /// <param name="ParamsFiltres">Filtres pour pouvoir filtrer sur un occupant, compteur, immeuble, logement ou/et utilisateur</param>
        /// <returns></returns>
        static public infosDysfonctionnements GetInfosDysfonctionnementsByImmeuble(string SessionID, int PkUser, int PkImmeuble, DateTime Date, string ParamsFiltres)
        {

            // traces("DEBUT");

            infosDysfonctionnements InfosDysfonctionnements = new infosDysfonctionnements();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            try
            {

                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosDysfonctionnements.Erreur = "incohérence de session";
                    return InfosDysfonctionnements;
                }
                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    {
                        InfosDysfonctionnements.Erreur = "incohérence User, Occupant";
                        return InfosDysfonctionnements;
                    }
                }
                else
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosDysfonctionnements.Erreur = "incohérence user / immeuble";
                        return InfosDysfonctionnements;
                    }
                }


                {

                    Date = Date.AddDays(-1).Date; // Mod 5.1, infos envoyées la veille

                    string aliasJoinTable = "indexHisto";

                    #region Select
                    Dictionary<string, object> projectDic = new Dictionary<string, object>
                    {
                        { "PKCOMPTEUR", "$_id." + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK},
                        { "DATEINDEX", "$" + aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX},
                        { "THEINDEXD", Mongo_DBUtils.IfNull("$" + aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD,0)},
                        { "PKLOGEMENT" , "$" + Mongo_DBUtils.STRUCTURE.LOGEMENT_FK},
                        { "BACKFLOWCLIENT",Mongo_DBUtils.IfNull("$" + aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.BACKFLOWCLIENT,"N")},
                        //{ "SUSPFRAUDECLIENT",WS_DBUtils.utils_Mongo.IfNull("$" + aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.SUSPFRAUDECLIENT,"N")},
                        { "SUSPFRAUDECLIENT","N"},
                        { "SUSPBACKFLOWCLIENT", Mongo_DBUtils.IfNull("$" + aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.SUSPBACKFLOWCLIENT,"N")},
                    };
                    var select = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);

                    #endregion

                    #region Where pour la table Join

                    Dictionary<string, object> matchList4Join2 = new Dictionary<string, object>();
                    //Obligé de refaire un bsondocument à cause de la condition "or" dans la requête
                    Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                    {
                        { aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Date},
                        {
                            "$or",
                            new BsonArray().Add(new BsonDocument(aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.BACKFLOWCLIENT, "O"))
                                           //.Add(new BsonDocument(aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.SUSPFRAUDECLIENT, "O"))
                                           .Add(new BsonDocument(aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.SUSPBACKFLOWCLIENT, "O"))
                        },
                        { aliasJoinTable  + "." + Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK ,PkImmeuble },

                    };

                    var match4Join = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4Join);

                    #endregion

                    #region Join 

                    WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, "_id." + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, aliasJoinTable, matchList4Join2, out BsonDocument lookup4Join, out BsonDocument unwind4Join, out BsonDocument match4Join2);

                    #endregion

                    #region GroupBy pour distinct

                    var distinct = new BsonDocument
                    {
                        {
                            "$group",
                            new BsonDocument().Add("_id", new BsonDocument()
                                                                           .Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK,"$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK))
                                              .Add(Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK))
                                              .Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK,new BsonDocument().Add("$first","$" + Mongo_DBUtils.STRUCTURE.LOGEMENT_FK ))
                        }
                    };
                    #endregion

                    #region Where

                    Dictionary<string, object> matchList = new Dictionary<string, object>
                    {
                        { Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEINSTALL, new BsonDocument().Add("$lte", Date) },
                        { Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK ,PkImmeuble },
                        {
                            "$or",
                            new BsonArray().Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$gte", Date)))
                                            .Add(new BsonDocument(Mongo_DBUtils.STRUCTURE.COMPTEUR_DATEDEPOSE, new BsonDocument().Add("$exists", false))) //Vérifie que le champ n'existe pas (équivalant au DATEDEPOSE IS NULL en SQL)
                        }
                    };

                    //Gestion recherche
                    if (Pfiltres.GetParam("PKOCCUPANT") != "") // si la date de sortie de l'occupant est passée : on n'envoie pas de fuites
                    {
                        occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                        if (Occupant.DateDepart < Date)
                            return InfosDysfonctionnements;
                        if (Pfiltres.GetParam("PKLOGEMENT").Trim() == "")
                            matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, GetPkLogementByPkOccupant(Occupant.PkOccupant));
                    }



                    if (Pfiltres.GetParam("PKLOGEMENT") != "")
                        matchList.Add(Mongo_DBUtils.STRUCTURE.LOGEMENT_FK, Convert.ToDecimal(Pfiltres.GetParam("PKLOGEMENT")));
                    if (Pfiltres.GetParam("PKAPPAREIL") != "")
                        matchList.Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK, Convert.ToDecimal(Pfiltres.GetParam("PKAPPAREIL")));


                    var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);
                    #endregion

                    var pipeline4Fuite = new[] { match, distinct, lookup4Join, unwind4Join, match4Join, select };

                    DataRowCollection DrcDysfonctionnements = WS_DBUtils.utils_Mongo.MongoAggregateRows(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline4Fuite);

                    foreach (DataRow DrDysfonctionnement in DrcDysfonctionnements)
                    {
                        int PkCompteur = int.Parse(DrDysfonctionnement["PKCOMPTEUR"].ToString());
                        DateTime DateIndexDysfonctionnement = DateTime.Parse(DrDysfonctionnement["DATEINDEX"].ToString());
                        int PkLogement = int.Parse(DrDysfonctionnement["PKLOGEMENT"].ToString());

                        logement Logement = GetLogementByPk(PkLogement);
                        occupant Occupant = GetOccupantByPk(GetPkOccupantByPkLogement(PkLogement, DateTime.Now));
                        appareil Appareil = GetAppareilByPk(PkCompteur);

                        if (DrDysfonctionnement["BACKFLOWCLIENT"].ToString() == "O")
                        {
                            infosDysfonctionnement InfosDysfonctionnement = new infosDysfonctionnement();

                            //int Duree = int.Parse(GetNbJoursFuiteCompteur(PkCompteur, DateIndexFuite).ToString());
                            DataRow drInfosDysfonctionnement = GetRowFirstDayFlag(PkCompteur, DateIndexDysfonctionnement, "BACKFLOWCLIENT");

                            InfosDysfonctionnement.Logement = Logement;
                            InfosDysfonctionnement.Occupant = Occupant;
                            InfosDysfonctionnement.Appareil = Appareil;
                            InfosDysfonctionnement.Dysfonctionnement.Duree = Convert.ToInt32(drInfosDysfonctionnement["DUREE"]);
                            InfosDysfonctionnement.Dysfonctionnement.DateDebut = Convert.ToDateTime(drInfosDysfonctionnement["DATEINDEX"]);
                            InfosDysfonctionnement.Dysfonctionnement.IndexDebut = Convert.ToDecimal(drInfosDysfonctionnement["THEINDEXD"]);
                            decimal i2 = decimal.Parse(DrDysfonctionnement["THEINDEXD"].ToString());
                            decimal i1 = decimal.Parse(drInfosDysfonctionnement["THEINDEXD"].ToString());
                            InfosDysfonctionnement.Dysfonctionnement.Conso = i2 - i1;
                            InfosDysfonctionnement.Dysfonctionnement.Type = "Retour d'eau";

                            InfosDysfonctionnements.ListeInfosDysfonctionnements.Add(InfosDysfonctionnement);
                        }

                        if (DrDysfonctionnement["SUSPBACKFLOWCLIENT"].ToString() == "O")
                        {
                            infosDysfonctionnement InfosDysfonctionnement = new infosDysfonctionnement();
                            DataRow drInfosDysfonctionnement = GetRowFirstDayFlag(PkCompteur, DateIndexDysfonctionnement, "SUSPBACKFLOWCLIENT");

                            InfosDysfonctionnement.Logement = Logement;
                            InfosDysfonctionnement.Occupant = Occupant;
                            InfosDysfonctionnement.Appareil = Appareil;
                            InfosDysfonctionnement.Dysfonctionnement.Duree = Convert.ToInt32(drInfosDysfonctionnement["DUREE"]);
                            InfosDysfonctionnement.Dysfonctionnement.DateDebut = Convert.ToDateTime(drInfosDysfonctionnement["DATEINDEX"]);
                            InfosDysfonctionnement.Dysfonctionnement.IndexDebut = Convert.ToDecimal(drInfosDysfonctionnement["THEINDEXD"]);
                            decimal i2 = decimal.Parse(DrDysfonctionnement["THEINDEXD"].ToString());
                            decimal i1 = decimal.Parse(drInfosDysfonctionnement["THEINDEXD"].ToString());
                            InfosDysfonctionnement.Dysfonctionnement.Conso = i2 - i1;
                            InfosDysfonctionnement.Dysfonctionnement.Type = "Suspicion de retour d'eau";

                            InfosDysfonctionnements.ListeInfosDysfonctionnements.Add(InfosDysfonctionnement);
                        }

                    }

                }

            }
            catch (Exception Ex)
            {
                InfosDysfonctionnements.Erreur = Ex.Message;
            }

            return InfosDysfonctionnements;
        }
        /// <summary>
        /// Retourne le premier jour du disfonctionnement pour un compteur donné
        /// </summary>
        /// <param name="pkCompteur">PK Compteur</param>
        /// <param name="DateFlag">Date de prise en compte</param>
        /// <param name="flagField">Type de disfonctionnement
        /// Valeurs possibles :
        /// FUITECLIENT
        /// DEMOUNTING
        /// BACKFLOWCLIENT
        /// LEAKAGE
        /// LEAKAGEPAST
        /// DEMOUTINGPAST
        /// SUSPFRAUDECLIENT
        /// SUSPBACKFLOWCLIENT
        /// SUSPFUITECLIENT
        /// </param>
        /// <returns>retourne une ligne avec la date du premier jour du disfocntionnement, l'index de ce jour et la durée </returns>
        static public DataRow GetRowFirstDayFlag(int pkCompteur, DateTime DateFlag, string flagField)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("DATEINDEX");
            dt.Columns.Add("THEINDEXD");
            dt.Columns.Add("DUREE");

            DataRow dr = dt.NewRow();

            DateFlag = DateFlag.Date;

            // recup date début fuite
            #region Where

            Dictionary<string, object> matchList4DebutFuite = new Dictionary<string, object>
            {
                { Mongo_DBUtils.GetEquivalentNameInMongo(flagField),new BsonDocument().Add("$ne", "O") },
                { Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, pkCompteur },
                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, new BsonDocument().Add("$lt", Convert.ToDateTime(DateFlag)) }
            };

            var match4DebutFuite = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4DebutFuite);

            #endregion

            #region Select
            Dictionary<string, string> projectDic4DebutFuite = new Dictionary<string, string>
            {
                { "DATEINDEX", Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX },
                { "THEINDEXD", Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD }
            };

            var project4DebutFuite = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic4DebutFuite);
            #endregion

            #region Max DATEINDEX , tri + limit plus rapide que le max sur mongo

            Dictionary<string, int> sortList4DebutFuite = new Dictionary<string, int>
            {
                { "DATEINDEX", -1 }
            };

            BsonDocument sort4DebutFuite = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortList4DebutFuite);

            BsonDocument limit4DebutFuite = WS_DBUtils.utils_Mongo.Limit2BsonDocument(1);
            #endregion

            var pipeline4DebutFuite = new[] { match4DebutFuite, project4DebutFuite, sort4DebutFuite, limit4DebutFuite };

            DataRow drDebutFuite;

            DataTable dtDebutFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline4DebutFuite);

            if (dtDebutFuite != null && dtDebutFuite.Rows.Count > 0)
            {
                drDebutFuite = dtDebutFuite.Rows[0];
            }
            else
            {
                // compteur en fuite depuis son install
                #region Where
                Dictionary<string, object> matchList = new Dictionary<string, object>
                {

                    { Mongo_DBUtils.GetEquivalentNameInMongo(flagField), "O"},
                    { Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, pkCompteur}
                };

                // compteur en fuite depuis son install
                var match4Fuite = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);
                #endregion

                #region Select
                Dictionary<string, string> projectDic4Fuite = new Dictionary<string, string>
                {
                    { "DATEINDEX", Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX },
                    { "THEINDEXD", Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD }
                };

                var project4Fuite = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic4Fuite);
                #endregion

                #region Min DATEINDEX , tri + limit plus rapide que le min sur mongo

                Dictionary<string, int> sortList4Fuite = new Dictionary<string, int>
                {
                    { "DATEINDEX", -1 }
                };

                BsonDocument sort4Fuite = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortList4Fuite);

                BsonDocument limit4Fuite = WS_DBUtils.utils_Mongo.Limit2BsonDocument(1);
                #endregion

                var pipeline4Fuite = new[] { match4Fuite, project4Fuite, sort4Fuite, limit4Fuite };

                DataTable dtFuite = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline4Fuite);
                drDebutFuite = dtFuite.Rows[0];
            }

            if (drDebutFuite != null)
            {
                try
                {
                    DateTime dtDateFlag = Convert.ToDateTime(DateFlag);
                    DateTime dtDatePasFlag;

                    dtDatePasFlag = DateTime.Parse(drDebutFuite["DATEINDEX"].ToString());

                    TimeSpan t = dtDateFlag - dtDatePasFlag;
                    string NbJours = string.Empty;
                    NbJours = (t.TotalDays).ToString();

                    dr["DATEINDEX"] = dtDatePasFlag.ToString("dd/MM/yyyy");
                    dr["THEINDEXD"] = drDebutFuite["THEINDEXD"];
                    dr["DUREE"] = NbJours;
                }
                catch (Exception)
                {
                }

            }
            return dr;
        }

        #endregion

        /// <summary>
        /// récupère le nombre de logements d'un User (TypeConteneur=U), ou d'un M, A, S, I, L
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">PK</param>
        /// <returns></returns>
        private static int GetNbLogementsImmeubles(string TypeConteneur, int PkConteneur)
        {
            //WEBTODO :
            // - logement remplace par Web_immeuble
#if WS2
            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            string Query = $@"SELECT SUM(nblogement)
            FROM Web_immeuble
            WHERE Web_immeuble.pkimmeuble in ( {QuerySelectPkImm})";

            return WS_DBUtils.utils_LER.DBSelect(Query).ToInt32OrDefault(-1);

#else
            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            string Query = $@"SELECT count(distinct(pklogement))
            FROM
            logement, batiment, compteur
            WHERE (logement.fkbatiment = batiment.pkbatiment)
            AND logement.pklogement = compteur.fklogement
            AND compteur.typecompteur='D'
            AND batiment.fkimmeuble in ( {QuerySelectPkImm})";

            int Nb = -1;
            try
            {
                Nb = int.Parse(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            {
            }
            return Nb;
#endif
        }
        /// <summary>
        /// Récupère le nombre d'appareils
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">PK</param>
        /// <param name="Fluide">Type de fluide
        /// Valeurs possibles : "EF", "EC", "REPART", "CET", "CAPTEUR", ""
        /// "" : Tous
        /// </param>
        /// <returns></returns>
        private static int GetNbAppareils(string TypeConteneur, int PkConteneur, string Fluide)
        {
            //WEBTODO :
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
            string Query = "";
            Query += $@"SELECT count(*) 
                        FROM web_logement, web_compteur
                        WHERE web_compteur.fklogement = web_logement.pklogement
                        AND web_compteur.actif='O'
                        AND web_compteur.typecompteur='D'";

            if (TypeConteneur == "L")
                Query += " AND web_logement.pklogement=" + PkConteneur;
            else
                Query += " AND web_logement.fkimmeuble in (" + GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur) + ")";

            if (!string.IsNullOrEmpty(Fluide))
                Query += " AND web_compteur.fluide=" + Fluide.QuotedStr();


            int Nb = -1;
            try
            {
                Nb = int.Parse(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            {
            }
            return Nb;

        }

        /// <summary>
        /// Récupère le nombre de compteurs
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">PK</param>
        /// <param name="Fluide">Type de fluide
        /// Valeurs possibles :
        /// 2 : Eau froide
        /// 1 : Eau chaude
        /// 0 : Tous
        /// </param>
        /// <returns></returns>
        private static int GetNbAppareils(string TypeConteneur, int PkConteneur, int Fluide)
        {
            //WEBTODO :
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
#if WS2
            string Query = "";
            Query += $@"SELECT count(*) 
                        FROM web_logement, web_compteur
                        WHERE web_compteur.fklogement = web_logement.pklogement
                        AND NVL(web_compteur.actif, 'O') <> 'N'
                        AND web_compteur.typecompteur='D'";

            if (TypeConteneur == "L")
                Query += " AND web_logement.pklogement=" + PkConteneur;
            else
                Query += " AND web_logement.fkimmeuble in (" + GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur) + ")";

            if (Fluide > 0)
                Query += " AND web_compteur.fluide=" + Fluide;


            int Nb = -1;
            try
            {
                Nb = int.Parse(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            {
            }
            return Nb;
#else
            string Query = "";
            Query += $@"SELECT count(*) 
                        FROM batiment, logement, compteur
                        WHERE logement.fkbatiment = batiment.pkbatiment
                        AND compteur.fklogement = logement.pklogement
                        AND NVL(compteur.actif, 'O') <> 'N'
                        AND compteur.typecompteur='D'";

            if (TypeConteneur == "L")
                Query += " and LOGEMENT.PKLOGEMENT=" + PkConteneur;
            else
                Query += " and BATIMENT.FKIMMEUBLE in (" + GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur) + ")";

            if (Fluide > 0)
                Query += " and FKCRITERE=" + Fluide;


            int Nb = -1;
            try
            {
                Nb = int.Parse(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            {
            }
            return Nb;
#endif
        }

        /// <summary>
        /// Récupère le nombre d'appareils
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">PK</param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        private static nbAppareils GetNbAppareils(string TypeConteneur, int PkConteneur)
        {
            //WEBTODO :
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
            // - article remplace par web_article
#if WS2
            nbAppareils NbAppareils = new nbAppareils();
            if (TypeConteneur == "O" || TypeConteneur == "L")
                throw new Exception("TypeConteneur " + TypeConteneur + " non géré");

            string Fields = " nbec, nbef, nbrepart, nbcet, nbcapteur";

            string Query = GetQueryImmeubles(Fields.Trim(",".ToCharArray()), TypeConteneur, PkConteneur);
            DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(Query);
            int nbEC = 0;
            int nbEF = 0;
            int nbREPART = 0;
            int nbCET = 0;
            int nbCAPTEUR = 0;
            foreach (DataRow dr in rows)
            {
                nbEC += dr["NBEC"].ToString().ToInt32OrDefault(0);
                nbEF += Convert.ToInt32(dr["NBEF"]);
                nbREPART += Convert.ToInt32(dr["NBREPART"]);
                nbCET += Convert.ToInt32(dr["NBCET"]);
                nbCAPTEUR += Convert.ToInt32(dr["NBCAPTEUR"]);
            }

            NbAppareils.NbCompteursEC = nbEC;
            NbAppareils.NbCompteursEF = nbEF;
            NbAppareils.NbCompteursRepart = nbREPART;
            NbAppareils.NbCompteursCET = nbCET;
            NbAppareils.NbCompteursCapteur = nbCAPTEUR;
            return NbAppareils;

#else
            nbAppareils NbAppareils = new nbAppareils();
            if (TypeConteneur == "O" || TypeConteneur == "L")
                throw new Exception("TypeConteneur " + TypeConteneur + " non géré");

            string Fields = "";
            //EC
            Fields += " (select count(*) from BATIMENT, LOGEMENT, COMPTEUR where (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and COMPTEUR.FKCRITERE=1 and BATIMENT.FKIMMEUBLE = PKIMMEUBLE)) as NBEC,";
            //EF
            Fields += " (select count(*) from BATIMENT, LOGEMENT, COMPTEUR where (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and COMPTEUR.FKCRITERE=2 and BATIMENT.FKIMMEUBLE = PKIMMEUBLE)) as NBEF,";
            //REPART
            Fields += " (SELECT count(*)" +
                " from BATIMENT, LOGEMENT, COMPTEUR, ARTICLE" +
                " where COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("REPART") +
                " and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = PKIMMEUBLE)" +
                " ) as NBREPART,";
            //CET
            Fields += " (SELECT count(*)" +
                " from BATIMENT, LOGEMENT, COMPTEUR, ARTICLE" +
                " where COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("CET") +
                " and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = PKIMMEUBLE)" +
                " ) as NBCET,";
            //Capteur
            Fields += " (SELECT count(*)" +
                " from BATIMENT, LOGEMENT, COMPTEUR, ARTICLE" +
                " where COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("CAPTEUR") +
                " and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT and NVL(COMPTEUR.ACTIF, 'O') <> 'N' and COMPTEUR.TYPECOMPTEUR='D' and BATIMENT.FKIMMEUBLE = PKIMMEUBLE)" +
                " ) as NBCAPTEUR,";


            string Query = GetQueryImmeubles(Fields.Trim(",".ToCharArray()), TypeConteneur, PkConteneur);
            DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(Query);
            int nbEC = 0;
            int nbEF = 0;
            int nbREPART = 0;
            int nbCET = 0;
            int nbCAPTEUR = 0;
            foreach (DataRow dr in rows)
            {
                nbEC += Convert.ToInt32(dr["NBEC"]);
                nbEF += Convert.ToInt32(dr["NBEF"]);
                nbREPART += Convert.ToInt32(dr["NBREPART"]);
                nbCET += Convert.ToInt32(dr["NBCET"]);
                nbCAPTEUR += Convert.ToInt32(dr["NBCAPTEUR"]);
            }

            NbAppareils.NbCompteursEC = nbEC;
            NbAppareils.NbCompteursEF = nbEF;
            NbAppareils.NbCompteursRepart = nbREPART;
            NbAppareils.NbCompteursCET = nbCET;
            NbAppareils.NbCompteursCapteur = nbCAPTEUR;
            return NbAppareils;

#endif
        }
        /// <summary>
        /// Récupère les chantiers en cours
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">PK</param>
        /// <param name="TypeAppareil"></param>
        /// <returns></returns>
        private static List<chantier> GetChantiersEncoursImmeubles(string TypeConteneur, int PkConteneur, string TypeAppareil)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - compteur remplace par web_compteur
            List<chantier> ListeChantiers = new List<chantier>();

            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);

            // Récupération des devis en cours
            string sql = $@"select PKDEVIS, PKCHANTIER, DEVIS_IMMEUBLE.FKIMMEUBLE, 
DEVIS_IMMEUBLE.DATEENTREECOMMANDE, LIGNES.NBCOMPTEURS, LIGNES.FKARTICLE,
(select count(*) as NBPOSES
from BATIMENT, LOGEMENT, COMPTEUR, NONEXECUTION2, ARTICLE
where (COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT)
and (LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT)
and (NONEXECUTION2.FKCOMPTEUR = COMPTEUR.PKCOMPTEUR)
and nvl(COMPTEUR.CONCURRENT, 'N') <>'O'
and NONEXECUTION2.FKDBLISTS = 248
and BATIMENT.FKIMMEUBLE = DEVIS_IMMEUBLE.FKIMMEUBLE
and COMPTEUR.FKARTICLE = LIGNES.FKARTICLE
and COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE
{GetTypeAppareilFilter(TypeAppareil)}
and dateinstall>=DEVIS_IMMEUBLE.DATEENTREECOMMANDE) as NB_POSES

from CHANTIER, DEVIS_IMMEUBLE, DEVIS, LIGNES, SOUSFAMILLE, ARTICLE
where NVL(DEVIS.ACTIF, 'O') <> 'N'
and CHANTIER.DATECLOTUREDOSSIER is null
and DEVIS_IMMEUBLE.FKDEVIS=PKDEVIS
and CHANTIER.FKDEVIS=PKDEVIS
and CHANTIER.typec = 'POSE COMPTEUR'
and DEVIS_IMMEUBLE.FKIMMEUBLE=CHANTIER.FKIMMEUBLE
and DEVIS_IMMEUBLE.DATEENTREECOMMANDE is not null
and DEVIS_IMMEUBLE.DATEENTREECOMMANDE >= sysdate - 365
and DEVIS_IMMEUBLE.FKIMMEUBLE in ({QuerySelectPkImm} )
and LIGNES.FK = DEVIS.PKDEVIS
and FKSOUSFAMILLE=PKSOUSFAMILLE
and TYPELIGNE ='D' 
and TYPEPRESTATION='P' 
and LIGNES.FKARTICLE = ARTICLE.PKARTICLE
and FKFAMILLE=81
and LIGNES.FKIMM = CHANTIER.FKIMMEUBLE ";

            if (TypeAppareil == "EC")
                sql += " and ARTICLE.FKCRITERE=1";
            if (TypeAppareil == "EF")
                sql += " and ARTICLE.FKCRITERE=2";
            if (TypeAppareil == "REPART")
                sql += " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("REPART");
            if (TypeAppareil == "CET")
                sql += " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil("CET");

            sql += " order by DEVIS_IMMEUBLE.FKIMMEUBLE, DEVIS_IMMEUBLE.DATEENTREECOMMANDE desc";

            DataRowCollection DtrCommande = WS_DBUtils.utils_LER.DBSelectRows(sql);
            foreach (DataRow DrCommande in DtrCommande)
            {
                chantier Chantier = null;
                int pkimmeuble = Convert.ToInt32(DrCommande["FKIMMEUBLE"]);
                int pkarticle = Convert.ToInt32(DrCommande["FKARTICLE"]);
                int pkdevis = Convert.ToInt32(DrCommande["PKDEVIS"]);
                int pkchantier = Convert.ToInt32(DrCommande["PKCHANTIER"]);

                List<chantier> chantiers = ListeChantiers.Where(c => c.PkImmeuble == pkimmeuble).ToList();
                if (chantiers.Count == 0)
                {
                    Chantier = new chantier
                    {
                        PkChantier = pkchantier,
                        DateEntreeChantier = Convert.ToDateTime(DrCommande["DATEENTREECOMMANDE"]),
                        PkDevis = pkdevis,
                        PkImmeuble = pkimmeuble,
                        NbCompteursCommandes = DrCommande["NBCOMPTEURS"].ToString().ToInt32OrDefault(0),
                        NbCompteursPoses = DrCommande["NB_POSES"].ToString().ToInt32OrDefault(0)
                    };
                    ListeChantiers.Add(Chantier);
                }
                else
                {
                    Chantier = chantiers.First();
                    Chantier.NbCompteursCommandes += DrCommande["NBCOMPTEURS"].ToString().ToInt32OrDefault(0);
                    Chantier.NbCompteursPoses += DrCommande["NB_POSES"].ToString().ToInt32OrDefault(0);
                }
            }
            return ListeChantiers;
        }
        /// <summary>
        /// Récupère le nombre de dépannages
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "U" ou "O"</param>
        /// <param name="PkConteneur">PK</param>
        /// <param name="SeulementEnCours">Dépannages en cours seulement ou non</param>
        /// <returns></returns>
        public static int GetNbDepannages(string TypeConteneur, int PkConteneur, bool SeulementEnCours)
        {
            return GetDepannages(TypeConteneur, PkConteneur, SeulementEnCours).Rows.Count;
        }
        /// <summary>
        /// Récupère les dépannages
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "O" ou "U"</param>
        /// <param name="PkConteneur">PK</param>
        /// <param name="SeulementEnCours">Dépannages en cours seulement ou non</param>
        /// <returns></returns>
        public static DataTable GetDepannages(string TypeConteneur, int PkConteneur, bool SeulementEnCours)
        {
            //WEBTODO :
            //remplace par immeuble_stats.nbdepannages methode au dessus
            //remplace par logement_stats.nbdepannages methode au dessus
            //Seul cas occupant reste
            DateTime date = DateTime.Today.AddDays(-720);

            string Query = $@"SELECT id, immeuble__r.pkler__c, logement__r.pkler__c
                            FROM workorder
                            WHERE workorder.Maintenance__c = true
                            AND workorder.createddate > = {date.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")} ";
            switch (TypeConteneur)
            {
                case "O": //Occupant
                    Query += $@" AND contactid in (SELECT id FROM contact WHERE pkler__c = {("OCC_" + PkConteneur).QuotedStr()}) ";
                    break;
                case "L": //Logement
                    Query += $@" AND logement__r.pkler__c = {("LOG_" + PkConteneur).QuotedStr()}";
                    break;
                case "I": //Immeuble
                    Query += $@" AND immeuble__r.pkler__c = {("IMM_" + PkConteneur).QuotedStr()}";
                    break;
                case "U": //Utilisateur
                default:

                    string sql = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
                    DataRowCollection drcImmeubles = WS_DBUtils.utils_LER.DBSelectRows(sql);
                    //string listPkImmeuble = string.Empty;
                    string listPkImmeuble = "'IMM_9999999', ";
                    foreach (DataRow drImmeuble in drcImmeubles)
                        listPkImmeuble += $@"'IMM_{drImmeuble["PKIMMEUBLE"]}', ";

                    if (!string.IsNullOrEmpty(listPkImmeuble))
                        listPkImmeuble = listPkImmeuble.Substring(0, listPkImmeuble.Length - 2);

                    Query += $@" AND immeuble__r.pkler__c in ({listPkImmeuble}) ";
                    break;
            }

            // to do ?
            //conserve toujours le statut du wo
            // sauf si statutWO='Planifié' and statutSA='Planifié' alors statut = 'EnAttentePlanification'

            if (SeulementEnCours)
                Query += $@" AND status in ('Planifie','EnAttentePlanification') ";

            return WS_DBUtils.utils_SF.DBSelectTable(Query);
        }
        /// <summary>
        /// Récupère le nombre d'anomalies de consommations d'un User (TypeConteneur=U), ou d'un M, A, S, I, L, C (compteur), + Occupant 
        /// </summary>
        /// <param name="ParamsFiltres">Filtres pour pouvoir filtrer sur un occupant, compteur, immeuble, logement ou/et utilisateur</param>
        /// <param name="Fluides">Types de fluide 
        /// Valeurs possibles cumulables (le séparateur est |)
        /// EF : Eau froide
        /// EC : Eau chaude</param>
        /// <returns></returns>
        private static int GetNbAnomalies(string ParamsFiltres, string Fluides)
        {
            //WEBTODO :
            // - nb logement/ng immeuble remplace par immeuble_stat et logement_stat
            // - indexconso remplace par web_indexconso


#if WS2
            DateTime Date1 = DateTime.Now.AddYears(-5); // on ramène 5 ans
            DateTime Date2 = DateTime.Now;

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            if (Pfiltres.GetParam("PKOCCUPANT") != "") // filtre supplémentaire pour l'occupant
            {
                occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                Date1 = Occupant.DateArrivee;
                Date2 = Occupant.DateDepart;
            }

            int nbAnosTotal = 0;
            string codes_ano = "('91')";

            if (Pfiltres.GetParam("PKAPPAREIL") != "") // pour un compteur
            {
                int PkAppareil = Convert.ToInt32(Pfiltres.GetParam("PKAPPAREIL"));
                int PkImmeuble = GetPKImmeubleByPkAppareil(PkAppareil);
                releve Releve = GetLastReleve(PkImmeuble, Date1, Date2, "");

                try
                {
                    string QueryAnos = 
$@"SELECT count(*) FROM web_indexconso, web_compteur
WHERE web_indexconso.fkcompteur = web_compteur.pkcompteur
AND ((code1 in {codes_ano}) or 
     (code2 in {codes_ano}) or 
     (code3 in {codes_ano}) or 
     (code4 in {codes_ano}))
AND fkreleve= {Releve.PkReleve} 
AND fkcompteur = {PkAppareil} ";

                    if (Fluides != "")
                        QueryAnos += $@" AND {GetFluidesFilter(Fluides)}";

                    nbAnosTotal = int.Parse(WS_DBUtils.utils_LER.DBSelect(QueryAnos));
                }
                catch
                {
                }

            }
            else if (Pfiltres.GetParam("PKLOGEMENT") != "") // pour un logement
            {
                int PkLogement = Convert.ToInt32(Pfiltres.GetParam("PKLOGEMENT"));
                int PkImmeuble = GetPKImmeubleByPKLogement(Convert.ToInt32(Pfiltres.GetParam("PKLOGEMENT")));
                releve Releve = GetLastReleve(PkImmeuble, Date1, Date2, "");
                try
                {
                    string QueryAnos = 
                        $@"SELECT count(*) FROM web_indexconso, web_compteur
WHERE web_indexconso.fkcompteur = web_compteur.pkcompteur
AND ((code1 in {codes_ano}) or 
     (code2 in {codes_ano}) or 
     (code3 in {codes_ano}) or 
     (code4 in {codes_ano}))
AND fkreleve= {Releve.PkReleve} 
AND fkcompteur in ( {GetQueryAppareilsByPkLogement("PKCOMPTEUR", PkLogement)}) ";

                    if (Fluides != "")
                        QueryAnos += $@" AND {GetFluidesFilter(Fluides)}";

                    nbAnosTotal = int.Parse(WS_DBUtils.utils_LER.DBSelect(QueryAnos));
                }
                catch
                {
                }
            }

            else // immeuble, syndic etc...
            {
                string TypeConteneur = "";
                int PkConteneur = -1;

                if (Pfiltres.GetParam("PKUSER") != "")
                {
                    TypeConteneur = "U";
                    PkConteneur = Convert.ToInt32(Pfiltres.GetParam("PKUSER"));
                }
                else if (Pfiltres.GetParam("PKIMMEUBLE") != "")
                {
                    TypeConteneur = "I";
                    PkConteneur = Convert.ToInt32(Pfiltres.GetParam("PKIMMEUBLE"));
                }
                string QuerySelectPk = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
                //DataRowCollection DtrPkImm = WS_DBUtils.utils_LER.DBSelectRows(QuerySelectPk);

                string QueryAnos =
$@"SELECT count(*) FROM web_indexconso, web_compteur
WHERE web_indexconso.fkcompteur = web_compteur.pkcompteur
AND (code1 in {codes_ano} or code2 in {codes_ano} or code3 in {codes_ano} or code4 in {codes_ano})
AND fkreleve in (
    SELECT MAX(pkreleve) AS pkreleve 
    FROM web_releve
    WHERE fkimmeuble in ({QuerySelectPk})
    AND datecloture IS NOT NULL
    GROUP BY fkimmeuble)
{(Fluides != "" ? $@" AND {GetFluidesFilter(Fluides)}" : "")}";
                nbAnosTotal = WS_DBUtils.utils_LER.DBSelect(QueryAnos).ToInt32OrDefault(0);

                //foreach (DataRow DrPkImm in DtrPkImm)
                //{
                //    // Recup du dernier relevé de chaque immeuble
                //    releve Releve = GetLastReleve(Convert.ToInt32(DrPkImm["PKIMMEUBLE"]), Date1, Date2, "");
                //    if (Releve.PkReleve != -1) // Seulement si on a trouvé un relévé
                //    {
                //        try
                //        {

                //            string QueryAnos = $@"SELECT count(*) FROM indexconso, compteur
                //                                    WHERE indexconso.fkcompteur = compteur.pkcompteur
                //                                    AND ((code1 in {codes_ano} 
                //                                    ) or (code2 in {codes_ano} 
                //                                    ) or (code3 in {codes_ano} 
                //                                    ) or (code4 in {codes_ano} 
                //                                    ))
                //                                    AND fkreleve= {Releve.PkReleve} ";

                //            if (Fluides != "")
                //                QueryAnos += " and " + GetFluidesFilter(Fluides);

                //            int Nb = int.Parse(WS_DBUtils.utils_LER.DBSelect(QueryAnos));
                //            nbAnosTotal += Nb;
                //        }
                //        catch
                //        {
                //        }
                //    }
                //}
            }
            return nbAnosTotal;
#else
            DateTime Date1 = DateTime.Now.AddYears(-5); // on ramène 5 ans
            DateTime Date2 = DateTime.Now;

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            if (Pfiltres.GetParam("PKOCCUPANT") != "") // filtre supplémentaire pour l'occupant
            {
                occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));
                Date1 = Occupant.DateArrivee;
                Date2 = Occupant.DateDepart;
            }

            int nbAnosTotal = 0;
            string codes_ano = "('91')";

            if (Pfiltres.GetParam("PKAPPAREIL") != "") // pour un compteur
            {
                int PkAppareil = Convert.ToInt32(Pfiltres.GetParam("PKAPPAREIL"));
                int PkImmeuble = GetPKImmeubleByPkAppareil(PkAppareil);
                releve Releve = GetLastReleve(PkImmeuble, Date1, Date2, "");

                try
                {
                    string QueryAnos = $@"SELECT count(*) FROM indexconso, compteur
                                        WHERE indexconso.fkcompteur = compteur.pkcompteur
                                        AND ((code1 in {codes_ano} 
                                        ) or (code2 in {codes_ano} 
                                        ) or (code3 in {codes_ano} 
                                        ) or (code4 in {codes_ano} 
                                        ))
                                        AND fkreleve= {Releve.PkReleve} 
                                        AND fkcompteur = {PkAppareil} ";

                    if (Fluides != "")
                        QueryAnos += $@" AND {GetFluidesFilter(Fluides)}";

                    nbAnosTotal = int.Parse(WS_DBUtils.utils_LER.DBSelect(QueryAnos));
                }
                catch
                {
                }

            }
            else if (Pfiltres.GetParam("PKLOGEMENT") != "") // pour un logement
            {
                int PkLogement = Convert.ToInt32(Pfiltres.GetParam("PKLOGEMENT"));
                int PkImmeuble = GetPKImmeubleByPKLogement(Convert.ToInt32(Pfiltres.GetParam("PKLOGEMENT")));
                releve Releve = GetLastReleve(PkImmeuble, Date1, Date2, "");
                try
                {
                    string QueryAnos = $@"SELECT count(*) FROM indexconso, compteur
                                        WHERE indexconso.fkcompteur = compteur.pkcompteur
                                        AND ((code1 in {codes_ano} 
                                        ) or (code2 in {codes_ano} 
                                        ) or (code3 in {codes_ano} 
                                        ) or (code4 in {codes_ano} 
                                        ))
                                        AND fkreleve= {Releve.PkReleve} 
                                        AND fkcompteur in ( {GetQueryAppareilsByPkLogement("PKCOMPTEUR", PkLogement)} 
                                        ) ";

                    if (Fluides != "")
                        QueryAnos += $@" AND {GetFluidesFilter(Fluides)}";

                    nbAnosTotal = int.Parse(WS_DBUtils.utils_LER.DBSelect(QueryAnos));
                }
                catch
                {
                }
            }

            else // immeuble, syndic etc...
            {
                string TypeConteneur = "";
                int PkConteneur = -1;

                if (Pfiltres.GetParam("PKUSER") != "")
                {
                    TypeConteneur = "U";
                    PkConteneur = Convert.ToInt32(Pfiltres.GetParam("PKUSER"));
                }
                else if (Pfiltres.GetParam("PKIMMEUBLE") != "")
                {
                    TypeConteneur = "I";
                    PkConteneur = Convert.ToInt32(Pfiltres.GetParam("PKIMMEUBLE"));
                }
                string QuerySelectPk = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
                //DataRowCollection DtrPkImm = WS_DBUtils.utils_LER.DBSelectRows(QuerySelectPk);

                string QueryAnos =
$@"SELECT count(*) FROM indexconso, compteur
WHERE indexconso.fkcompteur = compteur.pkcompteur
AND (code1 in {codes_ano} or code2 in {codes_ano} or code3 in {codes_ano} or code4 in {codes_ano})
AND fkreleve in (
    SELECT MAX(pkreleve) AS pkreleve 
    FROM releve
    WHERE fkimmeuble in ({QuerySelectPk})
    AND datecloture IS NOT NULL
    GROUP BY fkimmeuble)
{(Fluides != "" ? $@" AND {GetFluidesFilter(Fluides)}" : "")}";
                nbAnosTotal = WS_DBUtils.utils_LER.DBSelect(QueryAnos).ToInt32OrDefault(0);

                //foreach (DataRow DrPkImm in DtrPkImm)
                //{
                //    // Recup du dernier relevé de chaque immeuble
                //    releve Releve = GetLastReleve(Convert.ToInt32(DrPkImm["PKIMMEUBLE"]), Date1, Date2, "");
                //    if (Releve.PkReleve != -1) // Seulement si on a trouvé un relévé
                //    {
                //        try
                //        {

                //            string QueryAnos = $@"SELECT count(*) FROM indexconso, compteur
                //                                    WHERE indexconso.fkcompteur = compteur.pkcompteur
                //                                    AND ((code1 in {codes_ano} 
                //                                    ) or (code2 in {codes_ano} 
                //                                    ) or (code3 in {codes_ano} 
                //                                    ) or (code4 in {codes_ano} 
                //                                    ))
                //                                    AND fkreleve= {Releve.PkReleve} ";

                //            if (Fluides != "")
                //                QueryAnos += " and " + GetFluidesFilter(Fluides);

                //            int Nb = int.Parse(WS_DBUtils.utils_LER.DBSelect(QueryAnos));
                //            nbAnosTotal += Nb;
                //        }
                //        catch
                //        {
                //        }
                //    }
                //}
            }
            return nbAnosTotal;
#endif
        }
        
        /// <summary>
        /// Récupère le dernier relevé d'un immeuble
        /// </summary>
        /// <param name="PkImmeuble">Pk Immeuble</param>
        /// <param name="DateDebut">Date de début</param>
        /// <param name="DateFin">Date de fin</param>
        /// <param name="TypeAppareil">Type de compteur</param>
        /// <returns></returns>
        public static releve GetLastReleve(int PkImmeuble, DateTime DateDebut, DateTime DateFin, string TypeAppareil)
        {
#if WS2
            string Query = $@"SELECT pkreleve, datereleve, typeerc FROM web_releve WHERE
                                datereleve=(SELECT max(datereleve) FROM web_releve WHERE fkimmeuble= {PkImmeuble} 
                                AND datereleve between {DateDebut.QuotedStr()} 
                                AND {DateFin.QuotedStr()} 
                                AND datecloture is not null)
                                AND fkimmeuble= {PkImmeuble} ";

            if (TypeAppareil != "")
                Query += " AND typeerc=" + GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr();

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);

            releve Releve = new releve();

            if (Dr != null)
            {

                Releve.PkReleve = Dr["PKRELEVE"].ToString().ToInt32OrDefault();
                Releve.DateReleve = Dr["DATERELEVE"].ToString().ToDateTime();
                Releve.TypeERC = Dr["TYPEERC"].ToString();
            }
            return Releve;
#else
            string Query = $@"SELECT pkreleve, datereleve, typeerc FROM releve WHERE
                                datereleve=(SELECT max(datereleve) FROM releve WHERE fkimmeuble= {PkImmeuble} 
                                AND datereleve between {DateDebut.QuotedStr()} 
                                AND {DateFin.QuotedStr()} 
                                AND datecloture is not null)
                                AND fkimmeuble= {PkImmeuble} ";

            if (TypeAppareil != "")
                Query += " AND TYPEERC=" + GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr();

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);

            releve Releve = new releve();

            if (Dr != null)
            {

                Releve.PkReleve = Convert.ToInt32(Dr["PKRELEVE"]);
                Releve.DateReleve = Convert.ToDateTime(Dr["DATERELEVE"]);
                Releve.TypeERC = Dr["TYPEERC"].ToString();
            }
            return Releve;
#endif
        }
        
        /// <summary>
        /// Obtient le libellé pour le critère passé en paramètre
        /// </summary>
        /// <param name="critere">Critère
        /// Valeurs possibles :
        /// 1 : Eau chaude
        /// 2 : Eau froide
        /// "" </param>
        /// <returns></returns>
        public static string GetLibCriteria(string critere)
        {
            switch (critere)
            {
                case "1":
                    return "EC";
                case "2":
                    return "EF";
                default:
                    return "T";
            }
        }
        
        /// <summary>
        /// Obtient la liste des incidents et formatte pour les afficher dans un rapport
        /// </summary>
        /// <param name="code1">Code 1</param>
        /// <param name="code2">Code 2</param>
        /// <param name="code3">Code 3</param>
        /// <param name="code4">Code 4</param>
        /// <param name="typeReleve">Type de relevé</param>
        /// <param name="datereleve">Date de relevé</param>
        /// <param name="pkCompteur">PK du compteur</param>
        /// <returns></returns>
        public static string GetIncidents(string code1, string code2, string code3, string code4, string typeReleve, string datereleve, int pkCompteur)
        {
            string res = "";

            if (typeReleve == "I")
                res = res + "Relevé intermédiaire du " + datereleve.Substring(0, 10);
            if (typeReleve == "P")
                res = res + "Compteur posé (" + WS_DBUtils.utils_LER.DBSelect($@"SELECT dateinstall FROM compteur WHERE pkcompteur = {pkCompteur} ").Substring(0, 10) + ")";
            if ((code1 != "0") && (code1 != ""))
            {
                if (res != "")
                    res += "\r\n";

                res += WS_DBUtils.utils_LER.DBSelect($@"SELECT libelle FROM codeincident WHERE code = '{code1}'");

                if (code1 == "91")
                {
                    string dateDernièreConso = getLastDerniereConso(pkCompteur);
                    res = res + " " + dateDernièreConso;
                }
            }
            if ((code2 != "0") && (code2 != ""))
            {
                res = res + "\r\n" + WS_DBUtils.utils_LER.DBSelect($@"SELECT libelle FROM codeincident WHERE code = '{code2}'");
                if (code2 == "91")
                {
                    string dateDernièreConso = getLastDerniereConso(pkCompteur);
                    res = res + " " + dateDernièreConso;
                }
            }

            if ((code3 != "0") && (code3 != ""))
            {
                res = res + "\r\n" + WS_DBUtils.utils_LER.DBSelect($@"SELECT libelle FROM codeincident WHERE code = '{code3}'");
                if (code3 == "91")
                {
                    string dateDernièreConso = getLastDerniereConso(pkCompteur);
                    res = res + " " + dateDernièreConso;
                }
            }

            if ((code4 != "0") && (code4 != ""))
            {
                res = res + "\r\n" + WS_DBUtils.utils_LER.DBSelect($@"SELECT libelle FROM codeincident WHERE code = '{code4}'");
                if (code4 == "91")
                {
                    string dateDernièreConso = getLastDerniereConso(pkCompteur);
                    res = res + " " + dateDernièreConso;
                }
            }

            res += "";
            if (res.ToUpper() == "NULL")
                res = "";
            return res;
        }
                
        /// <summary>
        /// Otient la date de la dernière conso 
        /// </summary>
        /// <param name="pkCompteur">PK compteur</param>
        /// <returns></returns>
        private static string getLastDerniereConso(int pkCompteur)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur
            // - releve remplace par web_releve
#if WS2
            string sdateDerniereConso;
            string sql =
                   $@"SELECT web_releve.datereleve
                        FROM web_indexconso, web_releve
                        WHERE web_indexconso.fkreleve = web_releve.pkreleve
                        AND web_indexconso.fkcompteur = {pkCompteur} 
                        AND web_indexconso.conso <> 0
                        union
                        SELECT web_releveinter.datereleve
                        FROM web_releveinter
                        WHERE web_releveinter.fkcompteur = {pkCompteur} 
                        AND web_releveinter.conso <> 0
                        ORDER BY datereleve DESC
                        FETCH FIRST 1 ROWS ONLY";
            sdateDerniereConso = WS_DBUtils.utils_LER.DBSelect(sql);
            if (string.IsNullOrEmpty(sdateDerniereConso))
            {
                sdateDerniereConso = WS_DBUtils.utils_LER.DBSelect($@"SELECT dateinstall FROM web_compteur WHERE pkcompteur = {pkCompteur}");
            }
            if (!string.IsNullOrEmpty(sdateDerniereConso))
            {
                DateTime dtDerniereConso = DateTime.Parse(sdateDerniereConso);
                return dtDerniereConso.ToShortDateString();
            }
            return sdateDerniereConso;
#else
            string sdateDerniereConso;
            string sql =
                   $@"SELECT releve.datereleve
                        FROM indexconso, releve
                        WHERE indexconso.fkreleve = releve.pkreleve
                        AND indexconso.fkcompteur = {pkCompteur} 
                        AND conso <> 0
                        union
                        SELECT datereleve
                        FROM releveinter
                        WHERE fkcompteur = {pkCompteur} 
                        AND conso <> 0
                        order by datereleve desc
                        fetch first 1 rows only";
            sdateDerniereConso = WS_DBUtils.utils_LER.DBSelect(sql);
            if (string.IsNullOrEmpty(sdateDerniereConso))
            {
                sdateDerniereConso = WS_DBUtils.utils_LER.DBSelect($@"SELECT DATEINSTALL FROM COMPTEUR WHERE PKCOMPTEUR = {pkCompteur}");
            }
            if (!string.IsNullOrEmpty(sdateDerniereConso))
            {
                DateTime dtDerniereConso = DateTime.Parse(sdateDerniereConso);
                return dtDerniereConso.ToShortDateString();
            }
            return sdateDerniereConso;
#endif
        }

        /// <summary>
        /// Retourne le nombre de transfert de fichier 
        /// </summary>
        /// <param name="TypeConteneur">U (User) ou sinon directement (M, A, S, I, L)</param>
        /// <param name="PkConteneur">Pk du User (si TypeConteneur = U), sinon Pk d'un immeuble, agence, maison mère, syndic</param>
        /// <returns></returns>
        public static int GetNbTransfertFichiersImmeuble(string SessionID, int PkUser, int PkImmeuble)
        {
            user User = GetUserByPk(PkUser);
            if (session.checkSession(SessionID, PkUser) == false)
            {
                //TBImmeuble.Erreur = "incohérence de session";
                return -1;
            }
            else if (User.UserType != "M" && User.UserType != "A" && User.UserType != "S" && User.UserType != "G" && User.UserType != "C" && User.UserType != "SB")
            {
                //TBImmeuble.Erreur = "type de user non autorisé à voir un TBImmeuble";
                return -1;
            }
            else if (CheckImmeuble(User, PkImmeuble) == false)
            {
                //TBImmeuble.Erreur = "incohérence user / immeuble";
                return -1;
            }

            return GetNbTransfertFichiersImmeubles("I", PkImmeuble);
        }
        /// <summary>
        /// Retourne le nombre de transfert de fichier 
        /// </summary>
        /// <param name="TypeConteneur">U (User) ou sinon directement (M, A, S, I, L)</param>
        /// <param name="PkConteneur">Pk du User (si TypeConteneur = U), sinon Pk d'un immeuble, agence, maison mère, syndic</param>
        /// <returns></returns>
        public static int GetNbTransfertFichiersClient(string SessionID, int PkUser)
        {
            user User = GetUserByPk(PkUser);
            if (session.checkSession(SessionID, PkUser) == false)
            {
                //TBClient.Erreur = "incohérence de session";
                return -1;
            }
            else if (User.UserType != "M" &&
                    User.UserType != "A" &&
                    User.UserType != "S" &&
                    User.UserType != "G" &&
                    User.UserType != "C" &&
                    User.UserType != "SB")
            {
                //TBClient.Erreur = "type de user non autorisé à voir un TBClient";
                return -1;
            }

            return GetNbTransfertFichiersImmeubles("U", PkUser);
        }

        /// <summary>
        /// Retourne le nombre de transfert de fichier 
        /// </summary>
        /// <param name="TypeConteneur">U (User) ou sinon directement (M, A, S, I, L)</param>
        /// <param name="PkConteneur">Pk du User (si TypeConteneur = U), sinon Pk d'un immeuble, agence, maison mère, syndic</param>
        /// <returns></returns>
        private static int GetNbTransfertFichiersImmeubles(string TypeConteneur, int PkConteneur)
        {

            //WEBTODO :
            // - immeuble remplace par web_immeuble (ajout champ export)
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
            //
#if WS2
            string QuerySelectPkImm = "";
            if (TypeConteneur != "I")
            {
                QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            }
            else
            {
                QuerySelectPkImm = PkConteneur.ToString();
            }


            string Query = "";
            Query += $@"SELECT distinct l.fkimmeuble
                        , (SELECT count(*) 
                            FROM web_logement, web_compteur 
                            WHERE web_logement.pklogement = web_compteur.fklogement 
                            AND NVL(web_compteur.actif, 'O') <> 'N' 
                            AND web_compteur.typecompteur='D' 
                            AND web_logement.fkimmeuble = l.fkimmeuble) as nbcompteurs
                        FROM web_logement l, conditionpart cp, commande_immeuble ci
                        WHERE cp.fk = ci.fkcommande AND ci.fkimmeuble = l.fkimmeuble AND cp.type = 'C' AND cp.export='O'
                        AND l.fkimmeuble in ({QuerySelectPkImm})";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            int NbImm = 0;
            foreach (DataRow Dr in Drc)
            {
                if (Convert.ToInt32(Dr["NBCOMPTEURS"]) > 0)
                    NbImm++;
            }
            return NbImm;
#else
            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);

            string Query = "";
            Query += $@"SELECT distinct i.pkimmeuble
                        , (SELECT count(*) 
                            FROM logement, batiment, compteur 
                            WHERE (logement.fkbatiment = batiment.pkbatiment) 
                            AND logement.pklogement = compteur.fklogement 
                            AND NVL(compteur.actif, 'O') <> 'N' 
                            AND compteur.typecompteur='D' 
                            AND batiment.fkimmeuble = i.pkimmeuble) as nbcompteurs
                        FROM immeuble i, conditionpart cp, commande_immeuble
                        WHERE cp.fk = commande_immeuble.fkcommande AND commande_immeuble.fkimmeuble = i.pkimmeuble AND cp.type = 'C' AND cp.export='O'
                        AND i.pkimmeuble in ({QuerySelectPkImm})";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            int NbImm = 0;
            foreach (DataRow Dr in Drc)
            {
                if (Convert.ToInt32(Dr["NBCOMPTEURS"]) > 0)
                    NbImm++;
            }
            return NbImm;
#endif
        }

        #region Relevés

        /// <summary>
        /// Récupération de la date du dernier index de la base (utile pour savoir si problème de récup de dump)
        /// </summary>
        /// <returns></returns>
        static public DateTime getLastDateIndex()
        {
            //WEBTODO :
            //Methode à virer
            DateTime DateTimeResult;
            try
            {
                #region Where
                Dictionary<string, object> matchDic = new Dictionary<string, object>();

                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchDic);

                #endregion

                DataRow dr = WS_DBUtils.utils_Mongo.MongoFindDataRow("VARIABLES", matchDic);

                DateTimeResult = DateTime.Parse(dr["DATMAX"].ToString());
                long count = Convert.ToInt64(dr["DATINDCOUNT"].ToString());

                int minIndexNb = 300000;   //verrue : problèmes de dump envoient parfois données partielles : on prend veille si pas assez d'index


                if (count < minIndexNb)
                    DateTimeResult = DateTimeResult.AddDays(-1);
            }
            catch
            {
                DateTimeResult = DateTime.Today;
            }

            return DateTimeResult;
        }
        /// <summary>
        /// Récupère la PK du relevé d'un immeuble à une date donnée 
        /// </summary>
        /// <param name="PkImmeuble">PK Immeuble</param>
        /// <param name="DateReleve">Date du relevé</param>
        /// <param name="TypeAppareil">Type d'appareil
        /// Valeurs possibles :
        /// "EAU"
        /// "EC"
        /// "EF"
        /// "EC+EF"
        /// "EF+EC"
        /// "REPART"
        /// "CET"</param>
        /// <returns></returns>
        static int GetPkReleveByDate(int PkImmeuble, DateTime DateReleve, string TypeAppareil)
        {
            //WEBTODO :
            // - releve remplace par web_releve
#if WS2
            string Query = $@"SELECT pkreleve FROM web_releve
                            WHERE datecloture is not null
                            AND fkimmeuble= {PkImmeuble} 
                            AND datereleve= {DateReleve.QuotedStr()} ";
            if (TypeAppareil != "")
                Query += $@" AND typeerc= {GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr()}";
            int PkReleve;
            try
            {
                PkReleve = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            {
                PkReleve = -1;
            }
            return PkReleve;
#else
            string Query = $@"SELECT pkreleve FROM releve
                            WHERE datecloture is not null
                            AND fkimmeuble= {PkImmeuble} 
                            AND datereleve= {DateReleve.QuotedStr()} ";
            if (TypeAppareil != "")
                Query += $@" AND typeerc= {GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr()}";
            int PkReleve;
            try
            {
                PkReleve = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            {
                PkReleve = -1;
            }
            return PkReleve;
#endif
        }
        /// <summary>
        /// Otient le nombre de compteur en télérelève OK par immeuble
        /// </summary>
        /// <param name="PkImmeuble">Pk immeuble</param>
        /// <param name="Date">Date de la requête</param>
        /// <returns></returns>
        public static int GetNbCompteursTeleOKByImmeuble(int PkImmeuble, DateTime Date)
        {

            Date = Date.AddDays(-1); // Mod 5.1, infos envoyées la veillec
            int NbReleve = 0;

            try
            {
                #region Join + Where pour la table jointe
                BsonDocument lookup4Join, unwind4Join, match4Join;

                Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                {
                    { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, Convert.ToDateTime(Date).Date}
                };

                string aliasJoinTable = "indexHisto";

                WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName
                                                , Mongo_DBUtils.STRUCTURE.COMPTEUR_PK
                                                , Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK
                                                , aliasJoinTable, matchList4Join, out lookup4Join, out unwind4Join, out match4Join);
                #endregion

                #region Where
                Dictionary<string, object> matchDic = new Dictionary<string, object>
                {
                    { Mongo_DBUtils.STRUCTURE.IMMEUBLE_FK, PkImmeuble},
                    { Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMMODULERADIO, new BsonDocument().Add("$exists", true)}, //test l'existence du champ "NUMMODULERADIO" afin de pouvoir evaluer LENGTH(NUMMODULERADIO)=18
                    { Mongo_DBUtils.STRUCTURE.COMPTEUR_TYPECOMPTEUR, "D" }
                };
                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchDic);
                #endregion

                #region GroupBy pour distinct
                var groupDistinct = new BsonDocument().Add
                (
                    "$group",
                    new BsonDocument().Add("_id", "$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK)
                );
                #endregion

                #region WHERE LENGTH(NUMMODULERADIO)=18

                var redact = new BsonDocument
                {
                    { "$redact",
                                Mongo_DBUtils.IIf(Mongo_DBUtils.AreEqual(
                                                                            Mongo_DBUtils.StrLength("$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_NUMMODULERADIO)
                                                                            ,18
                                                                        )
                                                    ,"$$KEEP"
                                                    ,"$$PRUNE")

                    }
                };
                #endregion

                var pipeline = new[] { match, lookup4Join, unwind4Join, match4Join, redact, groupDistinct };

                DataTable dt = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline);

                if (dt != null && dt.Rows.Count > 0)
                {
                    NbReleve = dt.Rows.Count;
                }

            }
            catch
            {

            }
            return NbReleve;
        }
        /// <summary>
        /// Otient le nombre de compteur en 
        /// </summary>
        /// <param name="PkImmeuble">Pk Immeuble</param>
        /// <param name="Date">Date de la requête</param>
        /// <returns></returns>
        public static int GetNbCompteursTeleTotalByImmeuble(int PkImmeuble, DateTime Date)
        {
#if WS2
            //WEBTODO :
            // - web_immeuble pour total compteur
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
            string sql = $@"SELECT count(*)
                            FROM web_logement, web_compteur
                            WHERE web_compteur.fklogement = web_logement.pklogement
                            AND length(web_compteur.nummoduleradio)=18
                            AND web_compteur.actif='O'
                            AND web_compteur.typecompteur='D'
                            AND (web_compteur.dateinstall <= {Date.QuotedStr()} 
                            AND (web_compteur.datedepose >= {Date.QuotedStr()} 
                            or web_compteur.datedepose is null))
                            AND web_logement.fkimmeuble = {PkImmeuble} ";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#else
            string sql = $@"SELECT count(*)
                            FROM immeuble, batiment, logement, compteur
                            WHERE  batiment.fkimmeuble = immeuble.pkimmeuble
                            AND logement.fkbatiment = batiment.pkbatiment
                            AND compteur.fklogement = logement.pklogement
                            AND length(nummoduleradio)=18
                            AND compteur.actif='O'
                            AND compteur.typecompteur='D'
                            AND (compteur.dateinstall <= {Date.QuotedStr()} 
                            AND (compteur.datedepose >= {Date.QuotedStr()} 
                            or compteur.datedepose is null))
                            AND immeuble.pkimmeuble = {PkImmeuble} ";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#endif
        }
        /// <summary>
        /// Retourne si l'immeuble est en télérelève ou non
        /// </summary>
        /// <param name="PkImmeuble">Pk Immeuble</param>
        /// <returns></returns>
        public static bool HasImmeubleTelereleve(int PkImmeuble)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            string Query =
$@"SELECT pkimmeuble 
FROM immeuble 
WHERE (telereleve = 'O')
AND pkimmeuble= {PkImmeuble} ";
            return WS_DBUtils.utils_LER.DBSelect(Query).ToInt32OrDefault(-1) > 0;
        }
        /// <summary>
        /// Récupère le nombre de compteurs à relever / relevés
        /// </summary>
        /// <param name="TypeConteneur">Type Conteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">PK Conteneur</param>
        /// <param name="TypeERC">"EAU", "REPARTITEUR", "CET", ""</param>
        /// <param name="NbCompteursARelever">Nombre de compteurs à relever</param>
        /// <param name="NbCompteursReleves">Nombre de compteurs relevés</param> 
        private static void GetInfosRatioReleveImmeubles(
            string TypeConteneur, int PkConteneur,
            string TypeERC,
            ref int NbCompteursARelever, ref int NbCompteursReleves)
        {
            //WEBTODO :
            // - indexconso remplace par web_indexconso
            // - releve remplace par web_releve
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
#if WS2

            NbCompteursARelever = 0;
            NbCompteursReleves = 0;

            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);
            string sql = $@"
SELECT SUM(nbcompteursreleves) AS nbcompteursreleves, 
SUM(nbcompteursarelever) as nbcompteursarelever
FROM
    (SELECT pkreleve, nbcompteursreleves, nbcompteursarelever,
    RANK() OVER(PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) rnk
    FROM web_releve
    WHERE fkimmeuble in ({GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur)})
    {(TypeERC != "" ? $@"AND substr(upper(typeERC), 1, 11)={TypeERC.ToUpper().QuotedStr()}" : "")}
    )
WHERE rnk = 1";
            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(sql);
            if (r != null)
            {
                NbCompteursARelever = r["NBCOMPTEURSARELEVER"].ToString().ToInt32OrDefault(-1);
                NbCompteursReleves = r["NBCOMPTEURSRELEVES"].ToString().ToInt32OrDefault(-1);
            }
#else
            NbCompteursARelever = 0;
            NbCompteursReleves = 0;

            string codes_ano = "('10', '90', '11', '13')";

            string QuerySelectPkImm = GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur);

            string sql = $@"
select (select count(*) from INDEXCONSO, COMPTEUR, RELEVE
where INDEXCONSO.FKRELEVE = RELEVE.PKRELEVE 
and COMPTEUR.PKCOMPTEUR = INDEXCONSO.FKCOMPTEUR 
and (
    (CODE1 NOT IN {codes_ano} or CODE1 is NULL) AND 
    (CODE2 NOT IN {codes_ano} or CODE2 is NULL) AND 
    (CODE3 NOT IN {codes_ano} or CODE3 is NULL) AND 
    (CODE4 NOT IN {codes_ano} or CODE4 is NULL))
and COMPTEUR.ACTIF='O'
and COMPTEUR.NUMeroserie not like 'CODE%'
and COMPTEUR.NUMeroserie <> '999999'
and COMPTEUR.TYPECOMPTEUR='D'
and RELEVE.FKIMMEUBLE in ( {QuerySelectPkImm} )
and DateReleve= (select max(DATERELEVE) from RELEVE r where r.FKIMMEUBLE = RELEVE.FKIMMEUBLE)) CRS_RELEVES,

(SELECT count(*)
from BATIMENT, LOGEMENT, COMPTEUR
where LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT
and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and COMPTEUR.ACTIF='O'
and COMPTEUR.NUMeroserie not like 'CODE%'
and COMPTEUR.NUMeroserie <> '999999'
and COMPTEUR.TYPECOMPTEUR='D'
and BATIMENT.FKIMMEUBLE in ( {QuerySelectPkImm} )) CRS_A_RELEVER
from dual";
            DataRow row = WS_DBUtils.utils_LER.DBSelectRow(sql);
            if (row == null) return;
            NbCompteursARelever = row["CRS_A_RELEVER"].ToString().ToInt32OrDefault();
            NbCompteursReleves = row["CRS_RELEVES"].ToString().ToInt32OrDefault();
#endif

        }

        #endregion


        /// <summary>
        /// Méthode qui permet de renvoyer un tableau de bord pour l'immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkImmeuble">N° d'immeuble</param>
        /// <returns>Retourne un tableau de bord pour l'immeuble</returns>
        static public tableauDeBordImmeuble GetTableauBordImmeuble(string SessionID, int PkUser, int PkImmeuble)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble pour tous les NBs
#if WS2
            tableauDeBordImmeuble TBImmeuble = new tableauDeBordImmeuble();
            try
            {
                DateTime LastDateIndex = getLastDateIndex(); // A remplacer par date du jour -1?
                user User = GetUserByPk(PkUser);
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TBImmeuble.Erreur = "incohérence de session";
                    return TBImmeuble;
                }
                else if (User.UserType != "M" && User.UserType != "A" && User.UserType != "S" && User.UserType != "G" && User.UserType != "C" && User.UserType != "SB")
                {
                    TBImmeuble.Erreur = "type de user non autorisé à voir un TBImmeuble";
                    return TBImmeuble;
                }
                else if (CheckImmeuble(User, PkImmeuble) == false)
                {
                    TBImmeuble.Erreur = "incohérence user / immeuble";
                    return TBImmeuble;
                }
                else
                {
                    string Query =
                        $@"SELECT pkimmeuble, web_immeuble.cp, web_immeuble.ville, web_immeuble.adresse, 
                            web_immeuble.nom, web_immeuble.id, web_immeuble.adresse2, web_immeuble.adresse3, 
                            web_immeuble.actif, web_immeuble.codegestio, web_immeuble.telereleve, web_immeuble.fkclienttop,
                            web_immeuble.nbec, web_immeuble.nbef, web_immeuble.nbrepart, web_immeuble.nbcet,
                            web_immeuble.nbcapteur, web_immeuble.nblogement, web_immeuble.nbdepannages,
                            web_immeuble.nbfuites,  web_immeuble.nbfuites_ec,  web_immeuble.nbfuites_ef ,
                            web_immeuble.nbalarms, web_immeuble.nbsusfraudcli, web_immeuble.nbano_ec, web_immeuble.nbano_ef,
                            web_immeuble.nbchantiers, 
                            web_client.espaceclient_dateactivationcli,
                            web_client.espaceclient_dateactivationocc, web_client.espaceclient_showbillingocc, web_client.noteoccupant,  
                            web_client.espaceclient_gestion, web_client.espaceclient_showfactures, web_client.espaceclient_showchantiers,
                            web_immeuble.espaceclient_dateactivationocc as espaceclient_dateactivationoccimm, 
                            web_immeuble.noteoccupant as noteoccupantimm, 
                            web_immeuble.espaceclient_showbillingocc as espaceclient_showbillingoccimm,
                            web_immeuble.espaceclient_showfactures as espaceclient_showfacturesimm,
                            web_immeuble.espaceclient_showchantiers as espaceclient_showchantiersimm
                        FROM web_immeuble, web_client
                        WHERE pkimmeuble= {PkImmeuble} 
                            AND web_client.pkclient(+) = web_immeuble.fkclienttop";
                    DataRow DrImm = WS_DBUtils.utils_LER.DBSelectRow(Query);

                    TBImmeuble.Immeuble = GetImmeubleByRow(DrImm);

                    bool IsDemo = IsUserDemo(User);

                    // Infos Logements
                    TBImmeuble.NbLogements = DrImm["NBLOGEMENT"].ToString().ToInt32OrDefault(0);

                    // Infos Depannages
                    TBImmeuble.NbDepannages = DrImm["NBDEPANNAGES"].ToString().ToInt32OrDefault(0);//En Cours
                                                                                                   //TBImmeuble.NbDepannagesTotal = GetNbDepannages("I", PkImmeuble, false);//Tous
                                                                                                   // Infos Dysfonctionnements
                    TBImmeuble.NbDysfonctionnements = DrImm["NBSUSFRAUDCLI"].ToString().ToInt32OrDefault(0);

                    // Nb de compteurs (détail)
                    //nbAppareils NbAppareils = GetNbAppareils("I", PkImmeuble);
                    TBImmeuble.NbCompteursEC = DrImm["NBEC"].ToString().ToInt32OrDefault(0);
                    TBImmeuble.NbCompteursEF = DrImm["NBEF"].ToString().ToInt32OrDefault(0);
                    TBImmeuble.NbCompteursRepart = DrImm["NBREPART"].ToString().ToInt32OrDefault(0);
                    TBImmeuble.NbCompteursCET = DrImm["NBCET"].ToString().ToInt32OrDefault(0);
                    TBImmeuble.NbCompteursCapteur = DrImm["NBCAPTEUR"].ToString().ToInt32OrDefault(0);//on ne le comptera pas dans les appareils
                    TBImmeuble.NbAppareils = TBImmeuble.NbCompteursEC + TBImmeuble.NbCompteursEF + TBImmeuble.NbCompteursRepart + TBImmeuble.NbCompteursCET;

                    // Infos Téléreleve
                    TBImmeuble.HasTelereleve = DrImm["TELERELEVE"].ToString().ToBooleanOrDefault();
                    try
                    {
                        if (DrImm["ESPACECLIENT_GESTION"].ToString().ToLower() == "client")
                        {
                            TBImmeuble.Immeuble.HasNoteOccupant = DrImm["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                            TBImmeuble.Immeuble.HasDecompteOccupant = DrImm["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                            TBImmeuble.Immeuble.DateActivationClient = DrImm["ESPACECLIENT_DATEACTIVATIONCLI"].ToString().ToDateTime();
                            TBImmeuble.Immeuble.DateActivationOccupant = DrImm["ESPACECLIENT_DATEACTIVATIONOCC"].ToString().ToDateTime();
                            TBImmeuble.Immeuble.HasFactures = DrImm["ESPACECLIENT_SHOWFACTURES"].ToString().ToBooleanOrDefault(false);
                            TBImmeuble.Immeuble.HasChantiers = DrImm["ESPACECLIENT_SHOWCHANTIERS"].ToString().ToBooleanOrDefault(false);
                        }
                        else // gestion à l'immeuble
                        {
                            TBImmeuble.Immeuble.HasNoteOccupant = DrImm["NOTEOCCUPANTIMM"].ToString().ToBooleanOrDefault(false);
                            TBImmeuble.Immeuble.HasDecompteOccupant = DrImm["ESPACECLIENT_SHOWBILLINGOCCIMM"].ToString().ToBooleanOrDefault(false);
                            TBImmeuble.Immeuble.DateActivationClient = DrImm["ESPACECLIENT_DATEACTIVATIONCLIIMM"].ToString().ToDateTime();
                            TBImmeuble.Immeuble.DateActivationOccupant = DrImm["ESPACECLIENT_DATEACTIVATIONOCCIMM"].ToString().ToDateTime();
                            TBImmeuble.Immeuble.HasFactures = DrImm["ESPACECLIENT_SHOWFACTURESIMM"].ToString().ToBooleanOrDefault(false);
                            TBImmeuble.Immeuble.HasChantiers = DrImm["ESPACECLIENT_SHOWCHANTIERSIMM"].ToString().ToBooleanOrDefault(false);
                        }
                    }
                    catch
                    {
                    }

                    DateTime Date1 = DateTime.Now.AddYears(-5); // on ramène 5 ans
                    if (TBImmeuble.Immeuble.DateActivationClient > Date1)
                        Date1 = TBImmeuble.Immeuble.DateActivationClient;
                    TBImmeuble.Immeuble.DateActivationClient = Date1;

                    DateTime Date2 = DateTime.Now;
                    List<releve> ListeReleves = GetLastRelevesImmeuble(PkImmeuble, -1, Date1, Date2, "");

                    if (TBImmeuble.NbCompteursEC > 0)
                    {

                        TBImmeuble.ImmeubleEC.ListeReleves = (from rel in ListeReleves
                                                              where rel.TypeERC == GetTypeERCByTypeAppareil("EC")
                                                              orderby rel.DateReleve descending
                                                              select rel).ToList();
                        // Infos Fuites
                        TBImmeuble.ImmeubleEC.NbFuites = DrImm["NBFUITES_EC"].ToString().ToInt32OrDefault(0);
                        // Infos Anomalies de consommation
                        TBImmeuble.ImmeubleEC.NbAnomalies = DrImm["NBANO_EC"].ToString().ToInt32OrDefault(0);

                        int NbCompteursARelever = -1;
                        int NbCompteursReleves = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "EAU", ref NbCompteursARelever, ref NbCompteursReleves);
                        TBImmeuble.ImmeubleEC.NbCompteursARelever = NbCompteursARelever;
                        TBImmeuble.ImmeubleEC.NbCompteursReleves = NbCompteursReleves;
                    }

                    if (TBImmeuble.NbCompteursEF > 0)
                    {
                        TBImmeuble.ImmeubleEF.ListeReleves = (from rel in ListeReleves
                                                              where rel.TypeERC == GetTypeERCByTypeAppareil("EF")
                                                              orderby rel.DateReleve descending
                                                              select rel).ToList();
                        // Infos Fuites
                        TBImmeuble.ImmeubleEF.NbFuites = DrImm["NBFUITES_EF"].ToString().ToInt32OrDefault(0);
                        // Infos Anomalies de consommation
                        TBImmeuble.ImmeubleEF.NbAnomalies = DrImm["NBANO_EF"].ToString().ToInt32OrDefault(0);

                        int NbCompteursARelever = -1;
                        int NbCompteursReleves = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "EAU", ref NbCompteursARelever, ref NbCompteursReleves);
                        TBImmeuble.ImmeubleEF.NbCompteursARelever = NbCompteursARelever;
                        TBImmeuble.ImmeubleEF.NbCompteursReleves = NbCompteursReleves;
                    }

                    if (TBImmeuble.NbCompteursRepart > 0)
                    {
                        int PkRepart = GetLastPkRepartImmeuble(PkImmeuble);
                        infosRepartImm infosRepart = GetInfosRepartImmByPkRepart(PkRepart);
                        TBImmeuble.ImmeubleRepart.Tot_URepart = infosRepart.Tot_URepart;
                        TBImmeuble.ImmeubleRepart.Tot_TantChauff = infosRepart.Tot_TantChauff;
                        TBImmeuble.ImmeubleRepart.PU_Tant = infosRepart.PU_Tant;
                        TBImmeuble.ImmeubleRepart.Prix_URepart = infosRepart.Prix_URepart;
                        TBImmeuble.ImmeubleRepart.Prix_Abonn = infosRepart.Prix_Abonn;
                        TBImmeuble.ImmeubleRepart.Mont_ARepartTant = infosRepart.Mont_ARepartTant;
                        TBImmeuble.ImmeubleRepart.Part_RepartConsos = infosRepart.Part_RepartConsos;
                        TBImmeuble.ImmeubleRepart.CT_Combust = infosRepart.CT_Combust;
                        TBImmeuble.ImmeubleRepart.ListeReleves = (from rel in ListeReleves
                                                                  where rel.TypeERC == GetTypeERCByTypeAppareil("REPART")
                                                                  orderby rel.DateReleve descending
                                                                  select rel).ToList();
                        int NbCompteursARelever = -1;
                        int NbCompteursReleves = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "REPARTITEUR", ref NbCompteursARelever, ref NbCompteursReleves);
                        TBImmeuble.ImmeubleRepart.NbCompteursARelever = NbCompteursARelever;
                        TBImmeuble.ImmeubleRepart.NbCompteursReleves = NbCompteursReleves;
                    }

                    if (TBImmeuble.NbCompteursCET > 0) // code dupliqué de Bloc répartiteurs
                    {
                        // ?? existe répart + CET dans même immeuble ?
                        int PkRepart = GetLastPkRepartImmeuble(PkImmeuble);
                        infosRepartImm infosRepart = GetInfosRepartImmByPkRepart(PkRepart);
                        TBImmeuble.ImmeubleCET.Tot_URepart = infosRepart.Tot_URepart;
                        TBImmeuble.ImmeubleCET.Tot_TantChauff = infosRepart.Tot_TantChauff;
                        TBImmeuble.ImmeubleCET.PU_Tant = infosRepart.PU_Tant;
                        TBImmeuble.ImmeubleCET.Prix_URepart = infosRepart.Prix_URepart;
                        TBImmeuble.ImmeubleCET.Prix_Abonn = infosRepart.Prix_Abonn;
                        TBImmeuble.ImmeubleCET.Mont_ARepartTant = infosRepart.Mont_ARepartTant;
                        TBImmeuble.ImmeubleCET.Part_RepartConsos = infosRepart.Part_RepartConsos;
                        TBImmeuble.ImmeubleCET.CT_Combust = infosRepart.CT_Combust;

                        TBImmeuble.ImmeubleCET.ListeReleves = (from rel in ListeReleves
                                                               where rel.TypeERC == GetTypeERCByTypeAppareil("CET")
                                                               orderby rel.DateReleve descending
                                                               select rel).ToList();
                        int NbCompteursARelever = -1;
                        int NbCompteursReleves = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "CET", ref NbCompteursARelever, ref NbCompteursReleves);
                        TBImmeuble.ImmeubleCET.NbCompteursARelever = NbCompteursARelever;
                        TBImmeuble.ImmeubleCET.NbCompteursReleves = NbCompteursReleves;
                    }
                }
            }
            catch (Exception Ex)
            {
                TBImmeuble.Erreur = Ex.Message;
            }

            return TBImmeuble;
#else
            tableauDeBordImmeuble TBImmeuble = new tableauDeBordImmeuble();
            try
            {
                DateTime LastDateIndex = getLastDateIndex();
                user User = GetUserByPk(PkUser);
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TBImmeuble.Erreur = "incohérence de session";
                    return TBImmeuble;
                }
                else if (User.UserType != "M" && User.UserType != "A" && User.UserType != "S" && User.UserType != "G" && User.UserType != "C" && User.UserType != "SB")
                {
                    TBImmeuble.Erreur = "type de user non autorisé à voir un TBImmeuble";
                    return TBImmeuble;
                }
                else if (checkImmeuble(PkUser, PkImmeuble) == false)
                {
                    TBImmeuble.Erreur = "incohérence user / immeuble";
                    return TBImmeuble;
                }
                else
                {
                    TBImmeuble.Immeuble = GetImmeubleByPk(PkImmeuble);

                    bool IsDemo = IsUserDemo(User);

                    // Infos Logements
                    TBImmeuble.NbLogements = GetNbLogementsImmeubles("I", PkImmeuble);

                    // Infos Depannages
                    TBImmeuble.NbDepannages = GetNbDepannages("I", PkImmeuble, true);//En Cours
                    TBImmeuble.NbDepannagesTotal = GetNbDepannages("I", PkImmeuble, false);//Tous

                    // Infos Dysfonctionnements
                    TBImmeuble.NbDysfonctionnements = GetNbDysfonctionnements("PKIMMEUBLE=" + PkImmeuble.ToString(), "", LastDateIndex);

                    // Infos Téléreleve
                    TBImmeuble.HasTelereleve = HasImmeubleTelereleve(PkImmeuble);
                    if (TBImmeuble.HasTelereleve == true)
                    {
                        TBImmeuble.NbCompteursTelereveleTotal = GetNbCompteursTeleTotalByImmeuble(PkImmeuble, LastDateIndex);
                        TBImmeuble.NbCompteursTelereveleOK = GetNbCompteursTeleOKByImmeuble(PkImmeuble, LastDateIndex);
                    }

                    // Infos Transfert fichiers
                    int NbTransfertsFichiers = GetNbTransfertFichiersImmeubles("I", PkImmeuble);
                    if (NbTransfertsFichiers > 0)
                        TBImmeuble.HasTransfertFichiers = true;
                    else
                        TBImmeuble.HasTransfertFichiers = false;

                    // Nb de compteurs (détail)
                    nbAppareils NbAppareils = GetNbAppareils("I", PkImmeuble);
                    TBImmeuble.NbCompteursEC = NbAppareils.NbCompteursEC;
                    TBImmeuble.NbCompteursEF = NbAppareils.NbCompteursEF;
                    TBImmeuble.NbCompteursRepart = NbAppareils.NbCompteursRepart;
                    TBImmeuble.NbCompteursCET = NbAppareils.NbCompteursCET;
                    TBImmeuble.NbCompteursCapteur = NbAppareils.NbCompteursCapteur;//on ne le comptera pas dans les appareils
                    TBImmeuble.NbAppareils = TBImmeuble.NbCompteursEC + TBImmeuble.NbCompteursEF + TBImmeuble.NbCompteursRepart + TBImmeuble.NbCompteursCET;

                    //Consos
                    DateTime Date1 = DateTime.Now.AddYears(-5); // on ramène 5 ans
                    if (TBImmeuble.Immeuble.DateActivationClient > Date1)
                        Date1 = TBImmeuble.Immeuble.DateActivationClient;

                    DateTime Date2 = DateTime.Now;
                    List<releve> ListeReleves = GetLastRelevesImmeuble(PkImmeuble, -1, Date1, Date2, "");

                    if (TBImmeuble.NbCompteursEC > 0)
                    {
                        //Taux de releve (nombre de compteurs à relever / compteurs relevés)
                        int NbCompteursAReleverEC = -1;
                        int NbCompteursRelevesEC = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "EC", ref NbCompteursAReleverEC, ref NbCompteursRelevesEC);
                        TBImmeuble.ImmeubleEC.NbCompteursARelever = NbCompteursAReleverEC;
                        TBImmeuble.ImmeubleEC.NbCompteursReleves = NbCompteursRelevesEC;

                        // Top Consos
                        TBImmeuble.ImmeubleEC.TopConsos = GetTopConsosByImmeuble(SessionID, PkUser, PkImmeuble, "EC", 5);

                        // On affiches les 2 dernières années sur séries distinctes
                        int Year = DateTime.Now.Year;
                        multiSeries series = GetSerieConsosRelevesMois2Ans(
                            SessionID, PkUser,
                            "I", PkImmeuble,
                            "EC", "D", Year,
                            TBImmeuble.Immeuble.DateActivationClient);
                        TBImmeuble.ImmeubleEC.SerieConsos1 = series.Serie1;
                        TBImmeuble.ImmeubleEC.SerieConsos2 = series.Serie2;

                        // un peu de linq histoire de voir...
                        TBImmeuble.ImmeubleEC.ListeReleves = (from rel in ListeReleves
                                                              where rel.TypeERC == GetTypeERCByTypeAppareil("EC")
                                                              orderby rel.DateReleve descending
                                                              select rel).ToList();
                        // Infos Fuites
                        TBImmeuble.ImmeubleEC.NbFuites = GetNbFlagsAlarme("PKIMMEUBLE=" + PkImmeuble.ToString(), "EC", "FUITECLIENT", LastDateIndex);
                        // Infos Anomalies de consommation
                        TBImmeuble.ImmeubleEC.NbAnomalies = GetNbAnomalies("PKIMMEUBLE=" + PkImmeuble.ToString(), "EC");
                        // récupération dernier chantier de l'immeuble (ils sont triés par ordre décroissant)
                        List<chantier> ListeChantiersEC = GetChantiersEncoursImmeubles("I", PkImmeuble, "EC");
                        if (ListeChantiersEC.Count > 0)
                            TBImmeuble.ImmeubleEC.Chantier = ListeChantiersEC[0];
                    }

                    if (TBImmeuble.NbCompteursEF > 0)
                    {
                        //Taux de releve (nombre de compteurs à relever / compteurs relevés)
                        int NbCompteursAReleverEF = -1;
                        int NbCompteursRelevesEF = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "EF", ref NbCompteursAReleverEF, ref NbCompteursRelevesEF);
                        TBImmeuble.ImmeubleEF.NbCompteursARelever = NbCompteursAReleverEF;
                        TBImmeuble.ImmeubleEF.NbCompteursReleves = NbCompteursRelevesEF;

                        // Top Consos
                        TBImmeuble.ImmeubleEF.TopConsos = GetTopConsosByImmeuble(SessionID, PkUser, PkImmeuble, "EF", 5);

                        // On affiches les 2 dernières années sur séries distinctes
                        int Year = DateTime.Now.Year;
                        multiSeries series = GetSerieConsosRelevesMois2Ans(
                            SessionID, PkUser,
                            "I", PkImmeuble,
                            "EF", "D", Year,
                            TBImmeuble.Immeuble.DateActivationClient);

                        TBImmeuble.ImmeubleEF.SerieConsos1 = series.Serie1;
                        TBImmeuble.ImmeubleEF.SerieConsos2 = series.Serie2;
                        TBImmeuble.ImmeubleEF.ListeReleves = (from rel in ListeReleves
                                                              where rel.TypeERC == GetTypeERCByTypeAppareil("EF")
                                                              orderby rel.DateReleve descending
                                                              select rel).ToList();
                        // Infos Fuites
                        TBImmeuble.ImmeubleEF.NbFuites = GetNbFlagsAlarme("PKIMMEUBLE=" + PkImmeuble.ToString(), "EF", "FUITECLIENT", LastDateIndex);
                        // Infos Anomalies de consommation
                        TBImmeuble.ImmeubleEF.NbAnomalies = GetNbAnomalies("PKIMMEUBLE=" + PkImmeuble.ToString(), "EF");
                        List<chantier> ListeChantiersEF = GetChantiersEncoursImmeubles("I", PkImmeuble, "EF");
                        if (ListeChantiersEF.Count > 0)
                            TBImmeuble.ImmeubleEF.Chantier = ListeChantiersEF[0];
                    }

                    if (TBImmeuble.NbCompteursEC > 0 || TBImmeuble.NbCompteursEF > 0)
                        TBImmeuble.SerieConsosEAU = GetSerieConsosReleves(SessionID, PkUser, "I", PkImmeuble, "EC+EF", "D", Date1, Date2);

                    if (TBImmeuble.NbCompteursRepart > 0)
                    {
                        // radio relevés
                        int NbCompteursARelever = -1;
                        int NbCompteursReleves = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "REPART", ref NbCompteursARelever, ref NbCompteursReleves);
                        TBImmeuble.ImmeubleRepart.NbCompteursARelever = NbCompteursARelever;
                        TBImmeuble.ImmeubleRepart.NbCompteursReleves = NbCompteursReleves;

                        //Top Consos
                        TBImmeuble.ImmeubleRepart.TopConsos = GetTopConsosByImmeuble(SessionID, PkUser, PkImmeuble, "REPART", 5);

                        int PkRepart = GetLastPkRepartImmeuble(PkImmeuble);
                        infosRepartImm infosRepart = GetInfosRepartImmByPkRepart(PkRepart);
                        TBImmeuble.ImmeubleRepart.Tot_URepart = infosRepart.Tot_URepart;
                        TBImmeuble.ImmeubleRepart.Tot_TantChauff = infosRepart.Tot_TantChauff;
                        TBImmeuble.ImmeubleRepart.PU_Tant = infosRepart.PU_Tant;
                        TBImmeuble.ImmeubleRepart.Prix_URepart = infosRepart.Prix_URepart;
                        TBImmeuble.ImmeubleRepart.Prix_Abonn = infosRepart.Prix_Abonn;
                        TBImmeuble.ImmeubleRepart.Mont_ARepartTant = infosRepart.Mont_ARepartTant;
                        TBImmeuble.ImmeubleRepart.Part_RepartConsos = infosRepart.Part_RepartConsos;
                        TBImmeuble.ImmeubleRepart.CT_Combust = infosRepart.CT_Combust;

                        bool isRepart = (infosRepart.DateDebut != DateTime.MinValue && infosRepart.DateFin != DateTime.MinValue);
                        DateTime dateDebCurrRepart = DateTime.Now.Date.AddYears(-1);// date début consos actuelles répartiteurs

                        if (isRepart)
                        {
                            TBImmeuble.ImmeubleRepart.SerieConsosTotale2 = GetSerieConsos15J("I", PkImmeuble, "REPART", infosRepart.DateDebut, infosRepart.DateFin, -1);
                            dateDebCurrRepart = infosRepart.DateDebut.AddYears(1);
                        }

                        TBImmeuble.ImmeubleRepart.SerieConsosTotale1 = GetSerieConsos15J("I", PkImmeuble, "REPART", dateDebCurrRepart, DateTime.Now.Date, -1);
                        TBImmeuble.ImmeubleRepart.SerieConsosDJU = TBImmeuble.ImmeubleRepart.SerieConsosTotale2;



                        TBImmeuble.ImmeubleRepart.ListeReleves = (from rel in ListeReleves
                                                                  where rel.TypeERC == GetTypeERCByTypeAppareil("REPART")
                                                                  orderby rel.DateReleve descending
                                                                  select rel).ToList();
                    }

                    if (TBImmeuble.NbCompteursCET > 0) // code dupliqué de Bloc répartiteurs
                    {
                        // radio relevés
                        int NbCompteursARelever = -1;
                        int NbCompteursReleves = -1;
                        GetInfosRatioReleveImmeubles("I", PkImmeuble, "CET", ref NbCompteursARelever, ref NbCompteursReleves);
                        TBImmeuble.ImmeubleCET.NbCompteursARelever = NbCompteursARelever;
                        TBImmeuble.ImmeubleCET.NbCompteursReleves = NbCompteursReleves;

                        //Top Consos
                        TBImmeuble.ImmeubleCET.TopConsos = GetTopConsosByImmeuble(SessionID, PkUser, PkImmeuble, "CET", 5);

                        // ?? existe répart + CET dans même immeuble ?
                        int PkRepart = GetLastPkRepartImmeuble(PkImmeuble);
                        infosRepartImm infosRepart = GetInfosRepartImmByPkRepart(PkRepart);
                        TBImmeuble.ImmeubleCET.Tot_URepart = infosRepart.Tot_URepart;
                        TBImmeuble.ImmeubleCET.Tot_TantChauff = infosRepart.Tot_TantChauff;
                        TBImmeuble.ImmeubleCET.PU_Tant = infosRepart.PU_Tant;
                        TBImmeuble.ImmeubleCET.Prix_URepart = infosRepart.Prix_URepart;
                        TBImmeuble.ImmeubleCET.Prix_Abonn = infosRepart.Prix_Abonn;
                        TBImmeuble.ImmeubleCET.Mont_ARepartTant = infosRepart.Mont_ARepartTant;
                        TBImmeuble.ImmeubleCET.Part_RepartConsos = infosRepart.Part_RepartConsos;
                        TBImmeuble.ImmeubleCET.CT_Combust = infosRepart.CT_Combust;

                        //Donc on fait comme EAU
                        // On affiches les 2 dernières années sur séries distinctes
                        int Year = DateTime.Now.Year;
                        multiSeries series = GetSerieConsosRelevesMois2Ans(
                            SessionID, PkUser,
                            "I", PkImmeuble,
                            "CET", "D", Year,
                            TBImmeuble.Immeuble.DateActivationClient);
                        TBImmeuble.ImmeubleCET.SerieConsosTotale1 = series.Serie1;
                        TBImmeuble.ImmeubleCET.SerieConsosTotale2 = series.Serie2;

                        TBImmeuble.ImmeubleCET.SerieConsosDJU = series.Serie2;


                        TBImmeuble.ImmeubleCET.ListeReleves = (from rel in ListeReleves
                                                               where rel.TypeERC == GetTypeERCByTypeAppareil("CET")
                                                               orderby rel.DateReleve descending
                                                               select rel).ToList();
                    }

                    if (TBImmeuble.NbCompteursCapteur > 0)
                    {
                        TBImmeuble.ImmeubleCapteur.IndexRecapTemperature = GetIndexRecapCapteur("I", PkImmeuble, UnitesFk.Temperature, LastDateIndex);
                        TBImmeuble.ImmeubleCapteur.SerieConsosTemperature = GetSerieCapteurByImmeuble(PkImmeuble, 9, LastDateIndex);
                        TBImmeuble.ImmeubleCapteur.IndexRecapHumidite = GetIndexRecapCapteur("I", PkImmeuble, UnitesFk.Humidite, LastDateIndex);
                        TBImmeuble.ImmeubleCapteur.SerieConsosHumidite = GetSerieCapteurByImmeuble(PkImmeuble, 10, LastDateIndex);
                    }
                }
            }
            catch (Exception Ex)
            {
                TBImmeuble.Erreur = Ex.Message;
            }

            return TBImmeuble;
#endif
        }

        /// <summary>
        /// Méthode qui permet de renvoyer un tableau de bord pour le client
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <returns>Retourne un tableau de bord client</returns>
        static public tableauDeBordClient GetTableauBordClient(string SessionID, int PkUser)
        {
            //WEBTODO :
            // - client remplace par web_client
#if WS2
            WS_DBUtils.utils_SF.DBOpen();
            string function = string.Empty;

            tableauDeBordClient TBClient = new tableauDeBordClient();
            try
            {
                function = "LDate";

                //30s
                DateTime LastDateIndex = getLastDateIndex();

                function = "UserByPk";
                user User = GetUserByPk(PkUser);
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TBClient.Erreur = "incohérence de session";
                    return TBClient;
                }
                else if (User.UserType != "M" &&
                        User.UserType != "A" &&
                        User.UserType != "S" &&
                        User.UserType != "G" &&
                        User.UserType != "C" &&
                        User.UserType != "SB")
                {
                    TBClient.Erreur = "type de user non autorisé à voir un TBClient";
                    return TBClient;
                }
                else
                {

                    string QueryFields =
                        $@" web_immeuble.pkimmeuble, web_immeuble.telereleve,
                            web_immeuble.nbec, web_immeuble.nbef, web_immeuble.nbrepart, web_immeuble.nbcet,
                            web_immeuble.nbcapteur, web_immeuble.nblogement, web_immeuble.nbdepannages,
                            web_immeuble.nbfuites,  web_immeuble.nbfuites_ec,  web_immeuble.nbfuites_ef ,
                            web_immeuble.nbalarms, web_immeuble.nbsusfraudcli, web_immeuble.nbano_ec, web_immeuble.nbano_ef,
                            web_immeuble.nbchantiers ";

                    string QuerySelectPkImm = GetQueryImmeubles(QueryFields, "U", User.PKUser);

                    DataTable DrListImms = WS_DBUtils.utils_LER.DBSelectTable(QuerySelectPkImm);

                    TBClient.NbImmeubles = DrListImms.Rows.Count;
                    TBClient.NbImmeublesTelereleve = DrListImms.Select("TELERELEVE='O'").Count();

                    //Taux de releve (nombre de compteurs à relever / compteurs relevés)
                    int NbCompteursARelever = -1;
                    int NbCompteursReleves = -1;
                    GetInfosRatioReleveImmeubles("U", User.PKUser, "", ref NbCompteursARelever, ref NbCompteursReleves);
                    TBClient.NbCompteursARelever = NbCompteursARelever;
                    TBClient.NbCompteursReleves = NbCompteursReleves;

                    // Infos Logements
                    TBClient.NbLogements = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBLOGEMENT")));

                    // récupération chantiers des immeubles
                    List<chantier> ListeChantiers = GetChantiersEncoursImmeubles("U", User.PKUser, "");
                    TBClient.NbChantiers = ListeChantiers.Count;
                    TBClient.NbCompteursPoses = 0;
                    TBClient.NbCompteursCommandes = 0;
                    foreach (chantier Chantier in ListeChantiers)
                    {
                        TBClient.NbCompteursPoses += Chantier.NbCompteursPoses;
                        TBClient.NbCompteursCommandes += Chantier.NbCompteursCommandes;
                    }

                    // Infos Générale nombre de compteurs
                    TBClient.NbCompteursEC = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBEC")));
                    TBClient.NbCompteursEF = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBEF")));
                    TBClient.NbCompteursRepart = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBREPART")));
                    TBClient.NbCompteursCET = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBCET")));
                    TBClient.NbCompteursCapteur = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBCAPTEUR")));
                    TBClient.NbCompteurs = TBClient.NbCompteursEC + TBClient.NbCompteursEF + TBClient.NbCompteursRepart + TBClient.NbCompteursCET;

                    function = "NbFuites";
                    // Infos Fuites
                    TBClient.NbFuites = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBFUITES_EC"))) + Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBFUITES_EF")));

                    function = "NbDepannages";
                    // Infos dépannages
                    TBClient.NbDepannages = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBDEPANNAGES")));

                    function = "NbDysfonctionnements";
                    // Infos Dysfonctionnements
                    TBClient.NbDysfonctionnements = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBSUSFRAUDCLI")));

                    //// Infos Anomalies
                    TBClient.NbAnomalies = Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBANO_EC"))) + Convert.ToInt32(DrListImms.AsEnumerable().Sum(x => x.Field<decimal>("NBANO_EF")));
                }
            }
            catch (Exception Ex)
            {
                TBClient.Erreur = Ex.Message + function;
            }

            return TBClient;
#else
            WS_DBUtils.utils_SF.DBOpen();
            string function = string.Empty;

            tableauDeBordClient TBClient = new tableauDeBordClient();
            try
            {
                function = "LDate";

                //30s
                DateTime LastDateIndex = getLastDateIndex();

                function = "UserByPk";
                user User = GetUserByPk(PkUser);
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TBClient.Erreur = "incohérence de session";
                    return TBClient;
                }
                else if (User.UserType != "M" &&
                        User.UserType != "A" &&
                        User.UserType != "S" &&
                        User.UserType != "G" &&
                        User.UserType != "C" &&
                        User.UserType != "SB")
                {
                    TBClient.Erreur = "type de user non autorisé à voir un TBClient";
                    return TBClient;
                }
                else
                {
                    TBClient.NbImmeubles = getNbImmeubles("U", User.PKUser);

                    TBClient.NbImmeublesTelereleve = getNbImmeublesTelereleve("U", User.PKUser);

                    //Taux de releve (nombre de compteurs à relever / compteurs relevés)
                    int NbCompteursARelever = -1;
                    int NbCompteursReleves = -1;

                    //1.5s
                    GetInfosRatioReleveImmeubles("U", User.PKUser, "", ref NbCompteursARelever, ref NbCompteursReleves);
                    TBClient.NbCompteursARelever = NbCompteursARelever;
                    TBClient.NbCompteursReleves = NbCompteursReleves;

                    //0.4s
                    // Nb immeubles en transfert de fichiers                    
                    TBClient.NbImmeublesTransfertFichiers = GetNbTransfertFichiersImmeubles("U", User.PKUser);

                    //0.2s
                    // récupération chantiers des immeubles
                    List<chantier> ListeChantiers = GetChantiersEncoursImmeubles("U", User.PKUser, "");
                    TBClient.NbChantiers = ListeChantiers.Count;
                    TBClient.NbCompteursPoses = 0;
                    TBClient.NbCompteursCommandes = 0;
                    foreach (chantier Chantier in ListeChantiers)
                    {
                        TBClient.NbCompteursPoses += Chantier.NbCompteursPoses;
                        TBClient.NbCompteursCommandes += Chantier.NbCompteursCommandes;
                    }

                    // Infos Logements
                    TBClient.NbLogements = GetNbLogementsImmeubles("U", User.PKUser);

                    //0.6s
                    // Infos Générale nombre de compteurs
                    nbAppareils NbAppareils = GetNbAppareils("U", User.PKUser);
                    TBClient.NbCompteursEC = NbAppareils.NbCompteursEC;
                    TBClient.NbCompteursEF = NbAppareils.NbCompteursEF;
                    TBClient.NbCompteursRepart = NbAppareils.NbCompteursRepart;
                    TBClient.NbCompteursCET = NbAppareils.NbCompteursCET;
                    TBClient.NbCompteursCapteur = NbAppareils.NbCompteursCapteur;//on ne le comptera pas dans les appareils
                    TBClient.NbCompteurs = TBClient.NbCompteursEC + TBClient.NbCompteursEF + TBClient.NbCompteursRepart + TBClient.NbCompteursCET;

                    function = "GetNbFlagsAlarme";

                    //0.2s
                    // Infos Fuites
                    TBClient.NbFuites = GetNbFlagsAlarme("PKUSER=" + User.PKUser.ToString(), "", "FUITECLIENT", LastDateIndex);

                    //1.2s
                    // Infos dépannages
                    TBClient.NbDepannages = GetNbDepannages("U", User.PKUser, true);

                    function = "NbDysfonctionnements";

                    //3s
                    // Infos Dysfonctionnements
                    TBClient.NbDysfonctionnements = GetNbDysfonctionnements("PKUSER=" + User.PKUser.ToString(), "", LastDateIndex);

                    //16s
                    //// Infos Anomalies
                    TBClient.NbAnomalies = GetNbAnomalies("PKUSER=" + User.PKUser.ToString(), "");
                }
            }
            catch (Exception Ex)
            {
                TBClient.Erreur = Ex.Message + function;
            }

            return TBClient;
#endif
        }

        #region Impressions
        

        public static bool checkReport(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            switch (ReportType)
            {
                case "RELEVE_IMMEUBLE":
                    {
                        #region Checks
                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1) return false;
                        DataRow releveRow = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT fkimmeuble, datereleve
FROM releve
WHERE pkreleve = {pkReleve}");
                        if (releveRow == null) return false;
                        int pkImmeuble = releveRow["FKIMMEUBLE"].ToString().ToInt32OrDefault(-1);
                        DateTime dateReleve = releveRow["DATERELEVE"].ToString().ToDateTime();
                        if (pkImmeuble == -1) return false;
                        if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                            return false;
                        #endregion
                        break;
                    }

                case "RELEVE_OCCUPANT":
                    {
                        #region Checks
                        string typeERC = Pfiltres.GetParam("TYPEERC").ToString();
                        int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));
                        if (!(checkOccupant(PkUser, pkOccupant) ||
                            checkImmeubleOccupant(PkUser, pkOccupant) ||
                            SessionID == _SuperSessionId))
                            return false;

                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1)
                        {
                            DateTime dateReleve = Pfiltres.GetParam("DATERELEVE").ToDateTime();
                            if (dateReleve == DateTime.MinValue) dateReleve = DateTime.Today;
                            pkReleve = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkreleve
FROM releve, batiment, logement, occupant
WHERE occupant.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND batiment.fkimmeuble = releve.fkimmeuble
AND occupant.pkoccupant = {pkOccupant}
AND occupant.datedepart >= releve.datereleve
AND releve.datereleve <= {dateReleve.QuotedStrDate()}
AND releve.typeerc = {typeERC.QuotedStr()}
ORDER BY datereleve DESC
FETCH FIRST 1 ROWS ONLY").ToInt32OrDefault(-1);

                        }
                        if (pkReleve == -1) return false;

                        #endregion

                        break;
                    }

                case "REPART_IMMEUBLE":
                    {
                        #region Checks
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        if (!(checkImmeuble(PkUser, pkImmeuble) ||
                            SessionID == _SuperSessionId))
                            return false;
                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition 
FROM repartition
WHERE fkimmeuble = {pkImmeuble} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        if (pkRepart == -1) return false;
                        #endregion

                        break;
                    }

                case "REPART_OCCUPANT":
                    {
                        #region Checks
                        int pkImmeuble = Convert.ToInt32(Pfiltres.GetParam("PKIMMEUBLE"));
                        int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));

                        if (pkImmeuble == -1) return false;
                        if (pkOccupant == -1) return false;

                        if (!(checkOccupant(PkUser, pkOccupant) ||
                              checkImmeubleOccupant(PkUser, pkOccupant) ||
                              SessionID == _SuperSessionId))
                            return false;

                        int PkLogement = GetPkLogementByPkOccupant(pkOccupant);
                        int nbEC = GetNbAppareils("L", PkLogement, "EC");
                        int nbEF = GetNbAppareils("L", PkLogement, "EF");
                        int nbRepart = GetNbAppareils("L", PkLogement, "REPART");

                        int PkImmeubleCHAUFF;
                        int PkOccupantCHAUFF;
                        if (nbRepart == 0 && (nbEC > 0 || nbEF > 0))
                        {
                            // on est sur un logement EAU
                            //--> on recherche s'il y a un logement de REPART ou CET
                            //string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                            //$@"SELECT CODELOGEGESTIO FROM OCCUPANT WHERE PKOCCUPANT = {pkOccupant}");
                            PkImmeubleCHAUFF = GetPKImmeubleAutre(pkImmeuble, pkOccupant);
                            //PkOccupantCHAUFF = GetPkOccupant(PkImmeubleCHAUFF, CodeLogeGestio);
                        }
                        else
                        {
                            PkImmeubleCHAUFF = pkImmeuble;
                            //PkOccupantCHAUFF = pkOccupant;
                        }

                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition FROM repartition
WHERE fkimmeuble = {PkImmeubleCHAUFF} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        if (pkRepart == -1) return false;
                        #endregion

                        break;
                    }

                case "REPART_LOGEMENT":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkLogement = Pfiltres.GetParam("PKLOGEMENT").ToInt32OrDefault(-1);

                        if (pkImmeuble == -1) return false;
                        if (pkLogement == -1) return false;

                        int pkOccupant = GetPkOccupantByPkLogement(pkLogement, DateTime.Now);

                        if (!(checkOccupant(PkUser, pkOccupant) ||
                              checkImmeubleOccupant(PkUser, pkOccupant) ||
                              checkImmeuble(PkUser, pkImmeuble) ||
                              SessionID == _SuperSessionId))
                            return false;

                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition 
FROM repartition
WHERE fkimmeuble = {pkImmeuble} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        if (pkRepart == -1) return false;

                        break;
                    }

                case "CR_INTERVENTION":
                    {
                        #region Checks
                        if (!(CheckIntervention(PkUser, Pfiltres.GetParam("WORKORDERNUMBER")) ||
                              SessionID == _SuperSessionId))
                            return false;

                        #endregion
                        break;
                    }

                case "LIVRET_INTER_SYNTHESE":
                    {
                        //int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        DateTime date1 = Pfiltres.GetParam("DATE1").ToDateTime();
                        DateTime date2 = Pfiltres.GetParam("DATE2").ToDateTime();
                        //if (pkImmeuble == -1) return false;
                        if (date1 == DateTime.MinValue) return false;
                        if (date2 == DateTime.MinValue) return false;

                        break;
                    }

                case "LIVRET_INTER_DETAIL":
                    {
                        //int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        DateTime date1 = Pfiltres.GetParam("DATE1").ToDateTime();
                        DateTime date2 = Pfiltres.GetParam("DATE2").ToDateTime();
                        //if (pkImmeuble == -1) return false;
                        if (date1 == DateTime.MinValue) return false;
                        if (date2 == DateTime.MinValue) return false;
                        break;
                    }

                case "NOTE_INFO_MENSUELLE":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkOccupant = Pfiltres.GetParam("PKOCCUPANT").ToInt32OrDefault(-1);
                        string typeERC = Pfiltres.GetParam("TYPEERC").ToString();
                        string startDate = Pfiltres.GetParam("STARTDATE");

                        break;
                    }

                // TO DO TEST WS (PKFACTURE=12345)
                // Facture
                // appelé par le client
                case "FACTURE":
                    {
                        // attention, un client pourrait demander n'importe quelle facture
                        // il faut faire un check facture
                        #region Checks
                        if (!((session.checkSession(SessionID, PkUser) && GetUserByPk(PkUser).UserType == "C") ||
                            SessionID == _SuperSessionId))
                            return false;

                        int pkfacture = Convert.ToInt32(Pfiltres.GetParam("PKFACTURE"));
                        #endregion
                        break;
                    }

                // TO DO TEST WS (PKCHANTIER=12345)
                // Compte rendu de chantier
                // appelé par le client
                case "CR_CHANTIER":
                    {
                        #region Checks
                        int pkChantier = Pfiltres.GetParam("PKCHANTIER").ToInt32OrDefault(-1);
                        int fkImmeuble = WS_DBUtils.utils_LER.DBSelect($@"SELECT fkImmeuble from chantier where pkchantier = {pkChantier}").ToInt32OrDefault(-1);
                        if (!(session.checkSession(SessionID, PkUser) &&
                              checkImmeuble(PkUser, fkImmeuble) ||
                              SessionID == _SuperSessionId))
                            return false;

                        #endregion
                        break;
                    }

                // TO DO TEST
                // Devis
                // appelé par le client (mail)
                case "DEVIS":
                    {
                        #region Checks
                        if (!(SessionID == _SuperSessionId))
                            return false;
                        int pkDevis = Pfiltres.GetParam("PKDEVIS").ToInt32OrDefault(-1);
                        if (pkDevis == -1) return false;
                        #endregion
                        break;
                    }

                case "RELEVE_COMPLET":
                    {
                        #region Checks
                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1) return false;
                        DataRow releveRow = WS_DBUtils.utils_LER.DBSelectRow(
                        $@"SELECT fkimmeuble
                        FROM releve
                        WHERE pkreleve = {pkReleve}");
                        if (releveRow == null) return false;
                        int pkImmeuble = releveRow["FKIMMEUBLE"].ToString().ToInt32OrDefault(-1);
                        if (pkImmeuble == -1) return false;
                        if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                            return false;
                        #endregion
                        break;
                    }

                default: return false;
            }
            return true;
        }

        /// <summary>
        /// Otient le rapport correspondant
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="ReportType">Type de rapport
        /// Valeurs possibles :
        /// "RELEVE_EAU_IMMEUBLE"
        /// "RELEVE_REPART_IMMEUBLE"
        /// "RELEVE_CET_IMMEUBLE"
        /// "RELEVE_EAU_OCCUPANT"
        /// "INTERVENTION"
        /// "REPART_IMMEUBLE"
        /// "REPART_OCCUPANT"
        /// "REPART_LOGEMENT"
        /// "LIVRET_INTER_SYNTHESE"
        /// "LIVRET_INTER_DETAIL"
        /// "NOTE_INFO_MENSUELLE"
        /// "FACTURE"
        /// </param>
        /// <param name="ParamsFiltres">Filtres
        /// paires clef=valeur séparées par des "|" 
        /// Clefs possibles :
        /// PKIMMEUBLE
        /// DATE
        /// PKOCCUPANT
        /// PKLOGEMENT
        /// WORKORDERNUMBER
        /// PKUSER
        /// DATE1
        /// DATE2
        /// NOTEEC
        /// STARTDATE
        /// PKFACTURE
        /// </param>
        /// <returns></returns>        
        public static Byte[] GetReport(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            MemoryStream ms = new MemoryStream();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            switch (ReportType)
            {
                // TEST CET (PKRELEVE=1558981) REPART(PKRELEVE=1559136)
                // relevé
                // appelé par le client
                case "RELEVE_IMMEUBLE":
                    {
                        #region Checks
                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1) return null;
                        DataRow releveRow = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT fkimmeuble, datereleve
FROM releve
WHERE pkreleve = {pkReleve}");
                        if (releveRow == null) return null;
                        int pkImmeuble = releveRow["FKIMMEUBLE"].ToString().ToInt32OrDefault(-1);
                        DateTime dateReleve = releveRow["DATERELEVE"].ToString().ToDateTime();
                        if (pkImmeuble == -1) return null;
                        if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                            return null;
                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print("RELEVE_IMMEUBLE", pkReleve, "XTRAREPORT=O").ExportToPdf(ms);
                        break;
                    }

                // Seul PKOCCUPANT est obligatoire
                // TEST WS (PKOCCUPANT=123456|TYPEERC=EAU|DATERELEVE=01/01/2025)
                // TEST LER (PKOCCUPANT=123456|PKRELEVE=123)

                // TO DO : vérifier que la cohérence relevé / occupant 
                // relevé appelé par le client OU l'occupant
                case "RELEVE_OCCUPANT":
                    {
                        #region Checks
                        string typeERC = Pfiltres.GetParam("TYPEERC").ToString();
                        int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));
                        if (!(checkOccupant(PkUser, pkOccupant) ||
                            checkImmeubleOccupant(PkUser, pkOccupant) ||
                            SessionID == _SuperSessionId))
                            return null;

                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1)
                        {
                            DateTime dateReleve = Pfiltres.GetParam("DATERELEVE").ToDateTime();
                            if (dateReleve == DateTime.MinValue) dateReleve = DateTime.Today;
                            pkReleve = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkreleve
FROM releve, batiment, logement, occupant
WHERE occupant.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND batiment.fkimmeuble = releve.fkimmeuble
AND occupant.pkoccupant = {pkOccupant}
AND occupant.datedepart >= releve.datereleve
AND releve.datereleve <= {dateReleve.QuotedStrDate()}
AND SUBSTR(UPPER(releve.typeerc), 1, 11) = {typeERC.QuotedStr()}
ORDER BY datereleve DESC
FETCH FIRST 1 ROWS ONLY").ToInt32OrDefault(-1);

                        }
                        if (pkReleve == -1) return null;

                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print("RELEVE_IMMEUBLE",
                            pk: pkReleve,
                            param: $"XTRAREPORT=O|PKOCCUPANT={pkOccupant}")
                            .ExportToPdf(ms);

                        break;
                    }

                // TO DO TEST WS (PKIMMEUBLE=1234)
                // décompte individuel de chauffage
                // appelé par le client
                case "REPART_IMMEUBLE":
                    {
                        #region Checks
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        if (!(checkImmeuble(PkUser, pkImmeuble) ||
                            SessionID == _SuperSessionId))
                            return null;
                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition 
FROM repartition
WHERE fkimmeuble = {pkImmeuble} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        if (pkRepart == -1) return null;
                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print("DECOMPTE_INDIV",
                            pk: pkRepart,
                            param: "XTRAREPORT=O")
                            .ExportToPdf(ms);
                        break;
                    }

                // TO DO TEST WS (PKIMMEUBLE=1234|PKOCCUPANT=123456)
                // TO DO : vérifier que la cohérence répartition / occupant
                // décompte individuel de chauffage
                // appelé par l'occupant
                case "REPART_OCCUPANT":
                    {
                        #region Checks
                        int pkImmeuble = Convert.ToInt32(Pfiltres.GetParam("PKIMMEUBLE"));
                        int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));

                        if (pkImmeuble == -1) return null;
                        if (pkOccupant == -1) return null;

                        if (!(checkOccupant(PkUser, pkOccupant) ||
                              checkImmeubleOccupant(PkUser, pkOccupant) ||
                              SessionID == _SuperSessionId))
                            return null;

                        int PkLogement = GetPkLogementByPkOccupant(pkOccupant);
                        int nbEC = GetNbAppareils("L", PkLogement, "EC");
                        int nbEF = GetNbAppareils("L", PkLogement, "EF");
                        int nbRepart = GetNbAppareils("L", PkLogement, "REPART");

                        int PkImmeubleCHAUFF = -1;
                        int PkOccupantCHAUFF = -1;
                        if (nbRepart == 0 && (nbEC > 0 || nbEF > 0))
                        {
                            // on est sur un logement EAU
                            //--> on recherche s'il y a un logement de REPART ou CET
                            string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                            $@"SELECT CODELOGEGESTIO FROM OCCUPANT WHERE PKOCCUPANT = {pkOccupant}");
                            PkImmeubleCHAUFF = GetPKImmeubleAutre(pkImmeuble, pkOccupant);
                            PkOccupantCHAUFF = GetPkOccupant(PkImmeubleCHAUFF, CodeLogeGestio);
                        }
                        else
                        {
                            PkImmeubleCHAUFF = pkImmeuble;
                            PkOccupantCHAUFF = pkOccupant;
                        }

                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition FROM repartition
WHERE fkimmeuble = {PkImmeubleCHAUFF} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        if (pkRepart == -1) return null;
                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print("DECOMPTE_INDIV",
                            pk: pkRepart,
                            param: $"XTRAREPORT=O|PKOCCUPANT={PkOccupantCHAUFF}")
                        .ExportToPdf(ms);

                        break;
                    }

                // TO DO TEST
                // TO DO : vérifier que la cohérence répartition / logement-occupant
                // décompte individuel de chauffage
                // appelé par le client
                case "REPART_LOGEMENT":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkLogement = Pfiltres.GetParam("PKLOGEMENT").ToInt32OrDefault(-1);

                        if (pkImmeuble == -1) return null;
                        if (pkLogement == -1) return null;

                        int pkOccupant = GetPkOccupantByPkLogement(pkLogement, DateTime.Now);

                        if (!(checkOccupant(PkUser, pkOccupant) ||
                              checkImmeubleOccupant(PkUser, pkOccupant) ||
                              checkImmeuble(PkUser, pkImmeuble) ||
                              SessionID == _SuperSessionId))
                            return null;

                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition 
FROM repartition
WHERE fkimmeuble = {pkImmeuble} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        if (pkRepart == -1) return null;

                        LER.LER_PrintPlugin.Utils_Report.Print("DECOMPTE_INDIV",
                            pk: pkRepart,
                            param: $"XTRAREPORT=O|PKOCCUPANT={pkOccupant}")
                        .ExportToPdf(ms);

                        break;
                    }

                // TO DO TEST
                // compte rendu d'intervention
                // appelé par le client
                case "CR_INTERVENTION":
                    {
                        #region Checks
                        if (!(CheckIntervention(PkUser, Pfiltres.GetParam("WORKORDERNUMBER")) ||
                              SessionID == _SuperSessionId))
                            return null;

                        #endregion
                        LER.LER_PrintPlugin.Utils_Report.Print(ReportType,
                            pk: -1,
                            param: "XTRAREPORT=O|WORKORDERNUMBER=" + Pfiltres.GetParam("WORKORDERNUMBER"))
                            .ExportToPdf(ms);
                        break;
                    }


                // TO DO TEST
                // TO DO : vérif cohérence
                // livret d'intervention
                // appelé par le client
                case "LIVRET_INTER_SYNTHESE":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        DateTime date1 = Pfiltres.GetParam("DATE1").ToDateTime();
                        DateTime date2 = Pfiltres.GetParam("DATE2").ToDateTime();
                        string dataType = "";
                        bool bOk = false;

                        if (pkImmeuble != -1 && checkImmeuble(PkUser, pkImmeuble))
                        {
                            dataType = "IMMEUBLE";
                            bOk = true;
                        }
                        else
                        {
                            user u = GetUserByPk(PkUser);
                            if (u.UserType == "C")
                            {
                                dataType = "CLIENT";
                                bOk = true;
                            }
                            else if (u.UserType == "G")
                            {
                                dataType = "GESTIONNAIRE";
                                bOk = true;
                            }
                        }

                        if (IsUserDemo(GetUserByPk(PkUser)))
                        {
                            Reports.XtraReport_NoData r = new Reports.XtraReport_NoData();
                            r.Init("Livret d'intervention", "fonctionnalité non gérée en mode démo");
                            r.CreateDocument();
                            r.ExportToPdf(ms);
                            r = null;
                        }
                        else if (bOk)
                        {
                            switch (dataType)
                            {
                                case "CLIENT":
                                    {
                                        user u = GetUserByPk(PkUser);
                                        LER.LER_PrintPlugin.Utils_Report.Print(
                                            reportType: "LIVRET_INTERVENTION",
                                            pk: -1,
                                            param:
$@"XTRAREPORT=O|TABSYNTHESE=O|TABDETAILS=N|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}")
                                            .ExportToPdf(ms);
                                        break;
                                    }
                                case "GESTIONNAIRE":
                                    {
                                        user u = GetUserByPk(PkUser);
                                        DataTable dtImmeubles = WS_DBUtils.utils_LER.DBSelectTable(GetQueryImmeubles("PKIMMEUBLE", "U", PkUser));

                                        LER.LER_PrintPlugin.Utils_Report.Print(
                                            reportType: "LIVRET_INTERVENTION",
                                            pk: -1,
                                            param:
$@"XTRAREPORT=O|TABSYNTHESE=O|TABDETAILS=N|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                            data1: dtImmeubles)
                                            .ExportToPdf(ms);
                                        break;
                                    }
                                case "IMMEUBLE":
                                    {
                                        string IdImmeuble = WS_DBUtils.utils_LER.DBSelect("SELECT ID FROM IMMEUBLE WHERE PKIMMEUBLE = " + pkImmeuble);
                                        LER.LER_PrintPlugin.Utils_Report.Print(
                                            reportType: "LIVRET_INTERVENTION",
                                            pk: -1,
                                            param:
$@"XTRAREPORT=O|TABSYNTHESE=O|TABDETAILS=N|
REPORTDEST=I|
ID={IdImmeuble}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}")
                                            .ExportToPdf(ms);
                                        break;
                                    }
                                default:
                                    break;
                            }
                        }
                        break;
                    }

                // TO DO TEST
                // TO DO : vérif cohérence
                // livret d'intervention
                // appelé par le client
                case "LIVRET_INTER_DETAIL":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        DateTime date1 = Pfiltres.GetParam("DATE1").ToDateTime();
                        DateTime date2 = Pfiltres.GetParam("DATE2").ToDateTime();
                        string dataType = "";
                        bool bOk = false;

                        if (pkImmeuble != -1 && checkImmeuble(PkUser, pkImmeuble))
                        {
                            dataType = "IMMEUBLE";
                            bOk = true;
                        }
                        else
                        {
                            user u = GetUserByPk(PkUser);
                            if (u.UserType == "C")
                            {
                                dataType = "CLIENT";
                                bOk = true;
                            }
                            else if (u.UserType == "G")
                            {
                                dataType = "GESTIONNAIRE";
                                bOk = true;
                            }
                        }

                        if (IsUserDemo(GetUserByPk(PkUser)))
                        {
                            Reports.XtraReport_NoData r = new Reports.XtraReport_NoData();
                            r.Init("Livret d'intervention", "fonctionnalité non gérée en mode démo");
                            r.CreateDocument();
                            r.ExportToPdf(ms);
                            r = null;
                        }
                        else if (bOk)
                        {
                            switch (dataType)
                            {
                                case "CLIENT":
                                    {
                                        user u = GetUserByPk(PkUser);
                                        LER.LER_PrintPlugin.Utils_Report.Print(
                                            reportType: "LIVRET_INTERVENTION",
                                            pk: -1,
                                            param:
$@"XTRAREPORT=O|TABSYNTHESE=N|TABDETAILS=O|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}")
                                            .ExportToPdf(ms);
                                        break;
                                    }
                                case "GESTIONNAIRE":
                                    {
                                        user u = GetUserByPk(PkUser);
                                        DataTable dtImmeubles = WS_DBUtils.utils_LER.DBSelectTable(GetQueryImmeubles("PKIMMEUBLE", "U", PkUser));

                                        LER.LER_PrintPlugin.Utils_Report.Print(
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"XTRAREPORT=O|TABSYNTHESE=N|TABDETAILS=O|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
data1: dtImmeubles)
                                        .ExportToPdf(ms);
                                        break;
                                    }
                                case "IMMEUBLE":
                                    {
                                        string IdImmeuble = WS_DBUtils.utils_LER.DBSelect("SELECT ID FROM IMMEUBLE WHERE PKIMMEUBLE = " + pkImmeuble);
                                        LER.LER_PrintPlugin.Utils_Report.Print(
                                            reportType: "LIVRET_INTERVENTION",
                                            pk: -1,
                                            param:
$@"XTRAREPORT=O|TABSYNTHESE=N|TABDETAILS=O|
REPORTDEST=I|
ID={IdImmeuble}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}")
                                            .ExportToPdf(ms);
                                        break;
                                    }
                                default:
                                    break;
                            }
                        }
                        break;
                    }

                // TO DO TEST WS (PKIMMEUBLE=1234|PKOCCUPANT=123456|TYPEERC=EAU|STARTDATE=01/09/2025)
                // Note d'info mensuelle
                // appelé par le client (ou occupant portail public)
                case "NOTE_INFO_MENSUELLE":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkOccupant = Pfiltres.GetParam("PKOCCUPANT").ToInt32OrDefault(-1);
                        string typeERC = Pfiltres.GetParam("TYPEERC").ToString();
                        string startDate = Pfiltres.GetParam("STARTDATE");

                        int pkImmeubleEAU = -1;
                        int pkImmeubleCHAUF = -1;
                        int pkOccupantEAU = -1;
                        int pkOccupantCHAUF = -1;

                        int nbEC = GetNbAppareils("I", pkImmeuble, "EC");
                        int nbEF = GetNbAppareils("I", pkImmeuble, "EF");
                        int nbRepart = GetNbAppareils("I", pkImmeuble, "REPART");

                        string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                                $@"SELECT CODELOGEGESTIO FROM OCCUPANT WHERE PKOCCUPANT = {pkOccupant}");

                        if (nbRepart == 0 && (nbEC > 0 || nbEF > 0))
                        {
                            pkImmeubleEAU = pkImmeuble;
                            pkOccupantEAU = pkOccupant;
                            pkImmeubleCHAUF = GetPKImmeubleAutre(pkImmeubleEAU, pkOccupant);
                            pkOccupantCHAUF = GetPkOccupant(pkImmeubleCHAUF, CodeLogeGestio);
                        }
                        else
                        {
                            pkImmeubleCHAUF = pkImmeuble;
                            pkOccupantCHAUF = pkOccupant;
                            pkImmeubleEAU = GetPKImmeubleAutre(pkImmeubleCHAUF, pkOccupant);
                            pkOccupantEAU = GetPkOccupant(pkImmeubleEAU, CodeLogeGestio);
                        }

                        if (typeERC == "EAU")
                        {
                            pkImmeuble = pkImmeubleEAU;
                            pkOccupant = pkOccupantEAU;
                        }
                        else
                        {
                            pkImmeuble = pkImmeubleCHAUF;
                            pkOccupant = pkOccupantCHAUF;
                        }

                        //DataTable data = null;
                        //DataTable dtOccupants = null;

                        // on récupère les données par occupant
                        if (pkOccupant > -1 &&
                            (checkOccupant(PkUser, pkOccupantEAU) ||
                             checkImmeubleOccupant(PkUser, pkOccupantEAU) ||
                             checkOccupant(PkUser, pkOccupantCHAUF) ||
                             checkImmeubleOccupant(PkUser, pkOccupantCHAUF) ||
                             SessionID == _SuperSessionId))
                        {
                            LER.LER_PrintPlugin.Utils_Report.Print("NOTE_INFO_MENSUELLE",
                                pk: -1,
                                param:
$@"XTRAREPORT=O|
PKOCCUPANT={pkOccupant}|
DATERELEVE={DateTime.Today.ToShortDateString()}|
TYPEERC={typeERC}").ExportToPdf(ms);
                        }

                        // on récupère les données par immeuble
                        else if (pkOccupant == -1 &&
                            (checkImmeuble(PkUser, pkImmeubleCHAUF) ||
                             checkImmeuble(PkUser, pkImmeubleEAU)) ||
                             SessionID == _SuperSessionId)
                        {
                            LER.LER_PrintPlugin.Utils_Report.Print("NOTE_INFO_MENSUELLE",
                                pk: -1,
                                param:
$@"XTRAREPORT=O|PKIMMEUBLE={pkImmeuble}|DATERELEVE={DateTime.Today.ToShortDateString()}|TYPEERC={typeERC}").ExportToPdf(ms);
                        }
                        break;
                    }

                // TO DO TEST WS (PKFACTURE=12345)
                // Facture
                // appelé par le client
                case "FACTURE":
                    {
                        // attention, un client pourrait demander n'importe quelle facture
                        // il faut faire un check facture
                        #region Checks
                        if (!((session.checkSession(SessionID, PkUser) && GetUserByPk(PkUser).UserType == "C") ||
                            SessionID == _SuperSessionId))
                            return null;

                        int pkfacture = Convert.ToInt32(Pfiltres.GetParam("PKFACTURE"));
                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print(ReportType, pkfacture, "XTRAREPORT=O").ExportToPdf(ms);
                        break;
                    }

                // TO DO TEST WS (PKCHANTIER=12345)
                // Compte rendu de chantier
                // appelé par le client
                case "CR_CHANTIER":
                    {
                        #region Checks
                        int pkChantier = Pfiltres.GetParam("PKCHANTIER").ToInt32OrDefault(-1);
                        int fkImmeuble = WS_DBUtils.utils_LER.DBSelect($@"SELECT fkImmeuble from chantier where pkchantier = {pkChantier}").ToInt32OrDefault(-1);
                        if (!(session.checkSession(SessionID, PkUser) &&
                              checkImmeuble(PkUser, fkImmeuble) ||
                              SessionID == _SuperSessionId))
                            return null;

                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print(ReportType, pkChantier, "XTRAREPORT=O").ExportToPdf(ms);
                        break;
                    }

                // TO DO TEST
                // Devis
                // appelé par le client (mail)
                case "DEVIS":
                    {
                        #region Checks
                        if (!(SessionID == _SuperSessionId))
                            return null;
                        int pkDevis = Pfiltres.GetParam("PKDEVIS").ToInt32OrDefault(-1);
                        if (pkDevis == -1) return null;
                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print(ReportType, pkDevis, "XTRAREPORT=O").ExportToPdf(ms);
                        break;
                    }

                // TEST WS (PKRELEVE=123456)
                // relevé complet
                // appelé par le client (mail ?)
                case "RELEVE_COMPLET":
                    {
                        #region Checks
                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1) return null;
                        DataRow releveRow = WS_DBUtils.utils_LER.DBSelectRow(
                        $@"SELECT fkimmeuble
                        FROM releve
                        WHERE pkreleve = {pkReleve}");
                        if (releveRow == null) return null;
                        int pkImmeuble = releveRow["FKIMMEUBLE"].ToString().ToInt32OrDefault(-1);
                        if (pkImmeuble == -1) return null;
                        if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                            return null;
                        #endregion

                        LER.LER_PrintPlugin.Utils_Report.Print(ReportType, pkReleve, "XTRAREPORT=O").ExportToPdf(ms);
                        break;
                    }

                default: return null;
            }
            return ms.ToArray();
        }

        public static int InsertPrintJobs(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            if (!checkReport(SessionID, PkUser, ReportType, ParamsFiltres))
                return -1;
            //CALLBACKURAL = http://techn5274:83/api/document/receive
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            switch (ReportType)
            {
                case "RELEVE_IMMEUBLE":
                    {
                        return InsertPrintJobs(
                            "CALLBACK",
                            ReportType,
                            pk: Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1),
                            param: ParamsFiltres,
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                case "RELEVE_OCCUPANT":
                    {
                        #region Checks
                        string typeERC = Pfiltres.GetParam("TYPEERC").ToString();
                        int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));
                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                        if (pkReleve == -1)
                        {
                            DateTime dateReleve = Pfiltres.GetParam("DATERELEVE").ToDateTime();
                            if (dateReleve == DateTime.MinValue) dateReleve = DateTime.Today;
                            pkReleve = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkreleve
FROM releve, batiment, logement, occupant
WHERE occupant.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND batiment.fkimmeuble = releve.fkimmeuble
AND occupant.pkoccupant = {pkOccupant}
AND occupant.datedepart >= releve.datereleve
AND releve.datereleve <= {dateReleve.QuotedStrDate()}
AND SUBSTR(UPPER(releve.typeerc), 1, 11) = {typeERC.ToUpper().QuotedStr()}
ORDER BY datereleve DESC
FETCH FIRST 1 ROWS ONLY").ToInt32OrDefault(-1);

                        }
                        #endregion

                        return InsertPrintJobs(
                            "CALLBACK",
                            "RELEVE_IMMEUBLE",
                            pk: pkReleve,
                            param: $"PKOCCUPANT={pkOccupant}",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                case "REPART_IMMEUBLE":
                    {
                        #region Checks
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition 
FROM repartition
WHERE fkimmeuble = {pkImmeuble} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);

                        #endregion
                        return InsertPrintJobs(
                            "CALLBACK",
                            reportType: "REPARTITION",
                            pk: pkRepart,
                            param: "",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                case "REPART_OCCUPANT":
                    {
                        #region Checks
                        int pkImmeuble = Convert.ToInt32(Pfiltres.GetParam("PKIMMEUBLE"));
                        int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));
                        int PkLogement = GetPkLogementByPkOccupant(pkOccupant);
                        int nbEC = GetNbAppareils("L", PkLogement, "EC");
                        int nbEF = GetNbAppareils("L", PkLogement, "EF");
                        int nbRepart = GetNbAppareils("L", PkLogement, "REPART");

                        int PkImmeubleCHAUFF;
                        int PkOccupantCHAUFF;
                        if (nbRepart == 0 && (nbEC > 0 || nbEF > 0))
                        {
                            // on est sur un logement EAU
                            //--> on recherche s'il y a un logement de REPART ou CET
                            string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                            $@"SELECT CODELOGEGESTIO FROM OCCUPANT WHERE PKOCCUPANT = {pkOccupant}");
                            PkImmeubleCHAUFF = GetPKImmeubleAutre(pkImmeuble, pkOccupant);
                            PkOccupantCHAUFF = GetPkOccupant(PkImmeubleCHAUFF, CodeLogeGestio);
                        }
                        else
                        {
                            PkImmeubleCHAUFF = pkImmeuble;
                            PkOccupantCHAUFF = pkOccupant;
                        }

                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition FROM repartition
WHERE fkimmeuble = {PkImmeubleCHAUFF} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        #endregion

                        return InsertPrintJobs(
                            "CALLBACK",
                            reportType: "REPARTITION",
                            pk: pkRepart,
                            param: $"PKOCCUPANT={PkOccupantCHAUFF}",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);

                    }

                case "REPART_LOGEMENT":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkLogement = Pfiltres.GetParam("PKLOGEMENT").ToInt32OrDefault(-1);
                        int pkOccupant = GetPkOccupantByPkLogement(pkLogement, DateTime.Now);
                        int pkRepart = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkrepartition 
FROM repartition
WHERE fkimmeuble = {pkImmeuble} 
ORDER BY pkrepartition DESC").ToInt32OrDefault(-1);
                        return InsertPrintJobs(
                            "CALLBACK",
                            reportType:"REPARTITION",
                            pk: pkRepart,
                            param: $"PKOCCUPANT={pkOccupant}",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                case "CR_INTERVENTION":
                    {
                        return InsertPrintJobs(
                            "CALLBACK",
                            ReportType,
                            pk: -1,
                            param: Pfiltres.GetParam("WORKORDERNUMBER"),
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                case "LIVRET_INTER_SYNTHESE":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        DateTime date1 = Pfiltres.GetParam("DATE1").ToDateTime();
                        DateTime date2 = Pfiltres.GetParam("DATE2").ToDateTime();
                        string dataType = "";

                        if (pkImmeuble != -1 && checkImmeuble(PkUser, pkImmeuble))
                            dataType = "IMMEUBLE";
                        else
                        {
                            user u = GetUserByPk(PkUser);
                            if (u.UserType == "C")
                                dataType = "CLIENT";
                            else if (u.UserType == "G")
                                dataType = "GESTIONNAIRE";
                        }

                        if (IsUserDemo(GetUserByPk(PkUser)))
                            return -1;

                        switch (dataType)
                        {
                            case "CLIENT":
                                {
                                    user u = GetUserByPk(PkUser);

                                    return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"TABSYNTHESE=O|TABDETAILS=N|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                                }
                            case "GESTIONNAIRE":
                                {
                                    user u = GetUserByPk(PkUser);
                                    DataTable dtImmeubles = WS_DBUtils.utils_LER.DBSelectTable(GetQueryImmeubles("PKIMMEUBLE", "U", PkUser));

                                    return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"TABSYNTHESE=O|TABDETAILS=N|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                        data1: dtImmeubles,
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                                }
                            case "IMMEUBLE":
                                {
                                    string IdImmeuble = WS_DBUtils.utils_LER.DBSelect("SELECT ID FROM IMMEUBLE WHERE PKIMMEUBLE = " + pkImmeuble);
                                    return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"TABSYNTHESE=O|TABDETAILS=N|
REPORTDEST=C|
ID={IdImmeuble}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                                }
                            default:
                                return -1;
                        }
                    }

                // TO DO TEST
                // TO DO : vérif cohérence
                // livret d'intervention
                // appelé par le client
                case "LIVRET_INTER_DETAIL":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        DateTime date1 = Pfiltres.GetParam("DATE1").ToDateTime();
                        DateTime date2 = Pfiltres.GetParam("DATE2").ToDateTime();
                        string dataType = "";

                        if (pkImmeuble != -1 && checkImmeuble(PkUser, pkImmeuble))
                            dataType = "IMMEUBLE";
                        else
                        {
                            user u = GetUserByPk(PkUser);
                            if (u.UserType == "C")
                                dataType = "CLIENT";
                            else if (u.UserType == "G")
                                dataType = "GESTIONNAIRE";
                        }

                        if (IsUserDemo(GetUserByPk(PkUser)))
                            return -1;

                        switch (dataType)
                        {
                            case "CLIENT":
                                {
                                    user u = GetUserByPk(PkUser);
                                    return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"TABSYNTHESE=N|TABDETAILS=O|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                                }
                            case "GESTIONNAIRE":
                                {
                                    user u = GetUserByPk(PkUser);
                                    DataTable dtImmeubles = WS_DBUtils.utils_LER.DBSelectTable(GetQueryImmeubles("PKIMMEUBLE", "U", PkUser));

                                    return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"TABSYNTHESE=N|TABDETAILS=O|
REPORTDEST=C|
ID={u.ClientID}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                        data1: dtImmeubles,
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                                }
                            case "IMMEUBLE":
                                {
                                    string IdImmeuble = WS_DBUtils.utils_LER.DBSelect("SELECT ID FROM IMMEUBLE WHERE PKIMMEUBLE = " + pkImmeuble);
                                    return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: "LIVRET_INTERVENTION",
                                        pk: -1,
                                        param:
$@"TABSYNTHESE=N|TABDETAILS=O|
REPORTDEST=C|
ID={IdImmeuble}|
DATE1={date1.ToShortDateString()}|
DATE2={date2.ToShortDateString()}",
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                                }
                            default:
                                return -1;
                        }
                    }

                // TO DO TEST WS (PKIMMEUBLE=1234|PKOCCUPANT=123456|TYPEERC=EAU|STARTDATE=01/09/2025)
                // Note d'info mensuelle
                // appelé par le client (ou occupant portail public)
                case "NOTE_INFO_MENSUELLE":
                    {
                        int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                        int pkOccupant = Pfiltres.GetParam("PKOCCUPANT").ToInt32OrDefault(-1);
                        string typeERC = Pfiltres.GetParam("TYPEERC").ToString();
                        string startDate = Pfiltres.GetParam("STARTDATE");

                        int pkImmeubleEAU;
                        int pkImmeubleCHAUF;
                        int pkOccupantEAU;
                        int pkOccupantCHAUF;

                        int nbEC = GetNbAppareils("I", pkImmeuble, "EC");
                        int nbEF = GetNbAppareils("I", pkImmeuble, "EF");
                        int nbRepart = GetNbAppareils("I", pkImmeuble, "REPART");

                        string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                                $@"SELECT CODELOGEGESTIO FROM OCCUPANT WHERE PKOCCUPANT = {pkOccupant}");

                        if (nbRepart == 0 && (nbEC > 0 || nbEF > 0))
                        {
                            pkImmeubleEAU = pkImmeuble;
                            pkOccupantEAU = pkOccupant;
                            pkImmeubleCHAUF = GetPKImmeubleAutre(pkImmeubleEAU, pkOccupant);
                            pkOccupantCHAUF = GetPkOccupant(pkImmeubleCHAUF, CodeLogeGestio);
                        }
                        else
                        {
                            pkImmeubleCHAUF = pkImmeuble;
                            pkOccupantCHAUF = pkOccupant;
                            pkImmeubleEAU = GetPKImmeubleAutre(pkImmeubleCHAUF, pkOccupant);
                            pkOccupantEAU = GetPkOccupant(pkImmeubleEAU, CodeLogeGestio);
                        }

                        if (typeERC == "EAU")
                        {
                            pkImmeuble = pkImmeubleEAU;
                            pkOccupant = pkOccupantEAU;
                        }
                        else
                        {
                            pkImmeuble = pkImmeubleCHAUF;
                            pkOccupant = pkOccupantCHAUF;
                        }

                        return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: ReportType,
                                        pk: -1,
                                        param: $@"PKIMMEUBLE={pkImmeuble}|
PKOCCUPANT={pkOccupant}|
DATERELEVE={DateTime.Today.ToShortDateString()}|
TYPEERC={typeERC}",
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                    }

                // TO DO TEST WS (PKFACTURE=12345)
                // Facture
                // appelé par le client
                case "FACTURE":
                    {
                        int pkfacture = Convert.ToInt32(Pfiltres.GetParam("PKFACTURE"));

                        return InsertPrintJobs(
                                        "CALLBACK",
                                        reportType: ReportType,
                                        pk: pkfacture,
                                        param: "",
                                        callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                                        priority: 10);
                    }

                // TO DO TEST WS (PKCHANTIER=12345)
                // Compte rendu de chantier
                // appelé par le client
                case "CR_CHANTIER":
                    {
                        int pkChantier = Pfiltres.GetParam("PKCHANTIER").ToInt32OrDefault(-1);
                        return InsertPrintJobs(
                            "CALLBACK",
                            reportType: ReportType,
                            pk: pkChantier,
                            param: "",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                // TO DO TEST
                // Devis
                // appelé par le client (mail)
                case "DEVIS":
                    {
                        int pkDevis = Pfiltres.GetParam("PKDEVIS").ToInt32OrDefault(-1);
                        return InsertPrintJobs(
                            "CALLBACK",
                            reportType: ReportType,
                            pk: pkDevis,
                            param: "",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                // TEST WS (PKRELEVE=123456)
                // relevé complet
                // appelé par le client (mail ?)
                case "RELEVE_COMPLET":
                    {
                        int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);

                        return InsertPrintJobs(
                            "CALLBACK",
                            reportType: ReportType,
                            pk: pkReleve,
                            param: "",
                            callbackurl: Pfiltres.GetParam("CALLBACKURL"),
                            priority: 10);
                    }

                default: return -1;
            }
        }

        public static void ReplaceParametersInReport(XtraReport report, string codeEnt)
        {
            foreach (XRLabel label in report.AllControls<XRLabel>())
            {
                ReplaceParametersInLabel(label, codeEnt);
            }

            foreach (XRRichText richText in report.AllControls<XRRichText>())
            {
                List<string> parameters = GetParametersInText(richText.Text);

                foreach (string fieldName in parameters)
                {
                    RichEditDocumentServer richEditDocumentServer = new RichEditDocumentServer
                    {
                        RtfText = richText.Rtf
                    };
                    richEditDocumentServer.Document.ReplaceAll(
                        fieldName,
                        LER.LER_PrintPlugin.Tools.Utils_Entreprise.GetFieldValue(codeEnt, fieldName),
                        DevExpress.XtraRichEdit.API.Native.SearchOptions.None);
                    richText.Rtf = richEditDocumentServer.RtfText;
                }
            }
        }

        public static List<string> GetParametersInText(string text)
        {
            string pattern = @"\[.*?\]";
            string input = text;
            RegexOptions options = RegexOptions.IgnoreCase;

            List<string> r = new List<string>();
            foreach (Match m in Regex.Matches(input, pattern, options))
                r.Add(m.Value);
            return r;
        }

        public static void ReplaceParametersInLabel(XRLabel label, string codeEnt)
        {
            List<string> parameters = GetParametersInText(label.Text);
            foreach (string fieldName in parameters)
            {
                label.Text = label.Text.Replace(fieldName, LER.LER_PrintPlugin.Tools.Utils_Entreprise.GetFieldValue(codeEnt, fieldName));
            }
        }

        public static Byte[] GetNoteInfo(string SuperLoginID, string SuperPassword, string Params)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - logement remplace par web_logement
            // - occupant remplace par web_logement
            // - compteur remplace par web_compteur
#if WS2
            // permet de recupérer la note d'info mensuelle à partir d'une page publique
            if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
            {
                ParamsString Pfiltres = new ParamsString(Params);
                string IdImmeuble = Pfiltres.GetParam("IDIMMEUBLE");
                string numSerie = Pfiltres.GetParam("NUMEROSERIE");
                string password = Pfiltres.GetParam("PASSWORD");
                //int pkImmeuble = WS_DBUtils.utils_LER.DBSelect("SELECT pkimmeuble FROM web_immeuble WHERE id = " + ;

                string sql =
$@"SELECT web_logement.pklogement, web_occupant.pkoccupant, web_compteur.pkcompteur, 
    web_immeuble.pkimmeuble, web_compteur.fluide 
FROM web_compteur, web_logement, web_immeuble, web_occupant 
WHERE web_compteur.fklogement(+) = web_logement.pklogement
    AND web_logement.fkimmeuble = web_immeuble.pkimmeuble
    AND web_occupant.fklogement = web_logement.pklogement
    AND web_occupant.datedepart > SYSDATE
    -- on compare sur les 4 derniers caractères
    AND trim(substr(web_compteur.numeroserie, -4)) = {numSerie.Substring(Math.Max(0, numSerie.Length - 4)).QuotedStr().Trim()}
    AND replace(web_compteur.numeroserie, ' ', '') not in ('CODE72', 'ANOTER', 'CODE52', '999999')
    AND id = {IdImmeuble.QuotedStr().ToInt32OrDefault(-1)}";
                DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(sql);
                if (rows != null && rows.Count == 1)
                {
                    DataRow r = rows[0];
                    int pkOccpant = r["PKOCCUPANT"].ToString().ToInt32OrDefault(-1);
                    int pkLogement = r["PKLOGEMENT"].ToString().ToInt32OrDefault(-1);
                    int pkImmeuble = r["PKIMMEUBLE"].ToString().ToInt32OrDefault(-1);
                    if (r["FLUIDE"].ToString() == "EF")
                        return null;

                    string typeERC = Tools.Utils_Releve.GetTypeERC(r["PKIMMEUBLE"].ToString().ToInt32OrDefault(), "I", !(r["FLUIDE"].ToString() == "EC"));

                    DateTime startDate = InsertWeb_logement_public_access(pkLogement, password);

                    return GetReport(_SuperSessionId, 0, "NOTE_INFO_MENSUELLE",
                        "PKIMMEUBLE=" + pkImmeuble +
                        "|PKOCCUPANT=" + pkOccpant +
                        "|TYPEERC=" + typeERC +
                        "|STARTDATE=" + startDate.AddMonths(-1).ToShortDateString());
                }
            }
            return null;
#else

            // permet de recupérer la note d'info mensuelle à partir d'une page publique
            if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
            {
                ParamsString Pfiltres = new ParamsString(Params);
                string IdImmeuble = Pfiltres.GetParam("IDIMMEUBLE");
                string numSerie = Pfiltres.GetParam("NUMEROSERIE");
                string password = Pfiltres.GetParam("PASSWORD");
                int pkImmeuble = WS_DBUtils.utils_LER.DBSelect("SELECT PKIMMEUBLE FROM IMMEUBLE WHERE ID = " + IdImmeuble.QuotedStr()).ToInt32OrDefault(-1);

                string sql =
$@"select pklogement, pkoccupant, pkcompteur, fkcritere, pkImmeuble 
from COMPTEUR, LOGEMENT, BATIMENT, immeuble, occupant
where
COMPTEUR.FKLOGEMENT(+) = LOGEMENT.PKLOGEMENT
and LOGEMENT.FKBATIMENT(+) = BATIMENT.PKBATIMENT
and BATIMENT.FKIMMEUBLE = immeuble.PKIMMEUBLE
and occupant.fklogement = logement.pklogement
and occupant.datedepart > sysdate
-- on compare sur les 4 derniers caractères
and trim(substr(compteur.numeroserie, -4)) = {numSerie.Substring(Math.Max(0, numSerie.Length - 4)).QuotedStr().Trim()}
and replace(compteur.numeroserie, ' ', '') not in ('CODE72', 'ANOTER', 'CODE52', '999999')
and pkimmeuble = {pkImmeuble}";
                DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(sql);
                if (rows != null && rows.Count == 1)
                {
                    DataRow r = rows[0];
                    int pkOccpant = r["PKOCCUPANT"].ToString().ToInt32OrDefault(-1);
                    int pkLogement = r["PKLOGEMENT"].ToString().ToInt32OrDefault(-1);
                    if (!(r["FKCRITERE"].ToString() == "1" || r["FKCRITERE"].ToString() == "8"))
                        return null;

                    string typeERC = Utils_Releve.GetTypeERC(r["PKIMMEUBLE"].ToString().ToInt32OrDefault(), "I", !(r["FKCRITERE"].ToString() == "1"));

                    DateTime startDate = InsertWeb_logement_public_access(pkLogement, password);

                    return GetReport(_SuperSessionId, 0, "NOTE_INFO_MENSUELLE",
                        "PKIMMEUBLE=" + pkImmeuble +
                        "|PKOCCUPANT=" + pkOccpant +
                        "|TYPEERC=" + typeERC +
                        "|STARTDATE=" + startDate.AddMonths(-1).ToShortDateString());
                }
            }
            return null;
#endif
        }
        private static DateTime InsertWeb_logement_public_access(int pklogement, string password)
        {
            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
$@"select CREATIONDATE 
from {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_LOGEMENT_PUBLIC_ACCESS
where fklogement={pklogement}
and PASSWORD = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({password.QuotedStr()}), 4)
order by creationdate desc ");
            if (r == null)
            {
                // s'il n'y avait pas de mot de passe défini pour ce logement
                // on insère le mot de passe
                WS_DBUtils.utils_LER.DBExec(
$@"insert into {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_LOGEMENT_PUBLIC_ACCESS(fklogement, password)
values ({pklogement}, DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({password.QuotedStr()}), 4) )");
                return DateTime.Today;
            }
            else
            {
                return r["CREATIONDATE"].ToString().ToDateTime();
            }
        }
        public static XtraReport CombineTwoReports(XtraReport r1, XtraReport r2)
        {
            if (r1 == null && (r2 == null))
                return null;
            else if (r1 == null)
            {
                r2.CreateDocument();
                return r2;
            }
            else if (r2 == null)
            {
                r1.CreateDocument();
                return r1;
            }

            r2.CreateDocument();
            r1.Pages.AddRange(r2.Pages);
            r1.PrintingSystem.ContinuousPageNumbering = false;
            return r1;
        }
        /// <summary>
        /// Otient le fichier excel pour un type de rapport donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="ReportType">Type de rapport
        /// Valeurs possibles :
        /// "LIVRET_INTER_LISTE"
        /// "INDEXHISTO"
        /// </param>
        /// <param name="ParamsFiltres">Filtres
        ///  /// paires clef=valeur séparées par des "|" 
        /// Clefs possibles :
        /// PKIMMEUBLE
        /// PKUSER
        /// DATE1
        /// DATE2
        /// PKLOGEMENT
        /// STARTDATE
        /// ENDDATE
        /// FLUIDE
        /// </param>
        /// <returns></returns>
        public static Byte[] GetExcel(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            MemoryStream ms = new MemoryStream();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            if (session.checkSession(SessionID, PkUser) != false)
            {
                switch (ReportType)
                {
                    case "LIVRET_INTER_LISTE":
                        {
                            string s_pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE");
                            string s_pkUser = Pfiltres.GetParam("PKUSER");
                            string s_date1 = Pfiltres.GetParam("DATE1");
                            string s_date2 = Pfiltres.GetParam("DATE2");
                            DateTime date1 = DateTime.ParseExact(s_date1, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                            DateTime date2 = DateTime.ParseExact(s_date2, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                            //string dataType = "";
                            string dataType = "CLIENT";

                            bool bOk = false;

                            if (!string.IsNullOrEmpty(s_pkImmeuble) && checkImmeuble(PkUser, Convert.ToInt32(s_pkImmeuble)))
                            {
                                dataType = "IMMEUBLE";
                                bOk = true;
                            }
                            else if (!string.IsNullOrEmpty(s_pkUser) && s_pkUser == PkUser.ToString())
                            {
                                user u = GetUserByPk(Convert.ToInt32(s_pkUser));
                                if (u.UserType == "C")
                                {
                                    dataType = "CLIENT";
                                    bOk = true;
                                }
                                else if (u.UserType == "G")
                                {
                                    dataType = "GESTIONNAIRE";
                                    bOk = true;
                                }
                            }

                            if (bOk)
                            {
                                user u;
                                int pk;
                                DataTable dt = new DataTable();

                                switch (dataType)
                                {
                                    case "CLIENT":
                                        u = GetUserByPk(Convert.ToInt32(s_pkUser));
                                        pk = u.FK;

                                        dt = GetDataTableForAvancementClient(date1, date2, pk, dataType);

                                        break;
                                    case "GESTIONNAIRE":
                                        pk = Convert.ToInt32(s_pkUser);//on passe le pkUser, le report touvera le client et les immeubles du gestionnaire
                                        dt = GetDataTableForAvancementClient(date1, date2, pk, dataType);

                                        break;
                                    case "IMMEUBLE":
                                        pk = Convert.ToInt32(s_pkImmeuble);
                                        dt = GetDataTableForAvancementClient(date1, date2, pk, dataType);

                                        break;
                                    default:
                                        break;
                                }

                                using (var package = new ExcelPackage())
                                {
                                    var worksheet = package.Workbook.Worksheets.Add("LIVRET_INTER_LISTE");
                                    worksheet.Cells["A1"].LoadFromDataTable(dt, true);

                                    ms = new MemoryStream(package.GetAsByteArray());
                                }

                            }
                            break;
                        }

                    //case "INDEXHISTO":
                    //    {
                    //        int pkOccupant = Pfiltres.GetParam("PKOCCUPANT").ToInt32OrDefault(-1);
                    //        int pkLogement = Pfiltres.GetParam("PKLOGEMENT").ToInt32OrDefault(-1);
                    //        string sStartDate = Pfiltres.GetParam("STARTDATE");
                    //        string sEndDate = Pfiltres.GetParam("ENDDATE");
                    //        string fluide = Pfiltres.GetParam("FLUIDE").ToUpper();
                    //        tableauDeBordLogement tb;

                    //        DateTime startDate = sStartDate.ToDateTime();
                    //        DateTime endDate = sEndDate.ToDateTime();
                    //        if (endDate == DateTime.MinValue)
                    //            endDate = DateTime.MaxValue;

                    //        if (checkOccupant(PkUser, pkOccupant))
                    //            tb = GetTableauBordLogement(SessionID, PkUser, -1, pkOccupant);
                    //        else
                    //            tb = GetTableauBordLogement(SessionID, PkUser, pkLogement, -1);

                    //        string[] vals;

                    //        if (fluide == "EC")
                    //            vals = tb.LogementEC.SerieConsos.ValeursXYL.Split(';');
                    //        else if (fluide == "EF")
                    //            vals = tb.LogementEF.SerieConsos.ValeursXYL.Split(';');
                    //        else if (fluide == "REPARTITEUR")
                    //            vals = tb.LogementRepart.SerieConsosDJU.ValeursXYL.Split(';');
                    //        else if (fluide == "CET")
                    //            vals = tb.LogementCET.SerieConsosDJU.ValeursXYL.Split(';');
                    //        else vals = null;

                    //        DataTable dtIndex = new DataTable();
                    //        dtIndex.Columns.Add("DateIndex", typeof(DateTime));
                    //        dtIndex.Columns.Add("Valeur");

                    //        foreach (string val in vals)
                    //        {
                    //            try
                    //            {
                    //                string[] data = val.Split('|');
                    //                if (data[0].ToDateTime() >= startDate &&
                    //                    data[0].ToDateTime() <= endDate)
                    //                {
                    //                    DataRow newRow = dtIndex.NewRow();
                    //                    newRow["DateIndex"] = data[0].ToDateTime();
                    //                    newRow["Valeur"] = data[1];
                    //                    dtIndex.Rows.Add(newRow);
                    //                }
                    //            }
                    //            catch
                    //            { }
                    //        }

                    //        using (var package = new ExcelPackage())
                    //        {
                    //            var worksheet = package.Workbook.Worksheets.Add("INDEX");
                    //            worksheet.Cells["A1"].LoadFromDataTable(dtIndex, true);
                    //            ms = new MemoryStream(package.GetAsByteArray());
                    //        }
                    //        break;
                    //    }
                    case "RELEVE_IMMEUBLE":
                        {
                            int pkImmeuble = Pfiltres.GetParam("PKIMMEUBLE").ToInt32OrDefault(-1);
                            string fluide = Pfiltres.GetParam("FLUIDE").ToUpper();
                            if (pkImmeuble == -1)
                                return null;
                            if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                                return null;
                            ExcelPackage package = Tools.Utils_Releve.ExportReleveImmeubleToExcel(pkImmeuble, fluide);
                            if (package == null)
                                return null;
                            ms = new MemoryStream(package.GetAsByteArray());
                            break;
                        }

                    case "RELEVE":
                        {
#if WS2
                            int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                            if (pkReleve == -1) return null;
                            string sqlReleve =
                                $@"SELECT fkimmeuble
                                FROM web_releve
                                WHERE pkreleve = {pkReleve}";
                            int pkImmeuble = WS_DBUtils.utils_LER.DBSelect(sqlReleve).ToInt32OrDefault(-1);
                            if (pkImmeuble == -1) return null;
                            if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                                return null;
                            ExcelPackage package = Tools.Utils_Releve.ExportReleveToExcel(pkReleve);
                            if (package == null)
                                return null;
                            ms = new MemoryStream(package.GetAsByteArray());
                            break;
#else
                            int pkReleve = Pfiltres.GetParam("PKRELEVE").ToInt32OrDefault(-1);
                            if (pkReleve == -1) return null;
                            string sqlReleve =
                                $@"SELECT fkimmeuble
                                FROM releve
                                WHERE pkreleve = {pkReleve}";
                            int pkImmeuble = WS_DBUtils.utils_LER.DBSelect(sqlReleve).ToInt32OrDefault(-1);
                            if (pkImmeuble == -1) return null;
                            if (!(SessionID == _SuperSessionId || checkImmeuble(PkUser, pkImmeuble)))
                                return null;
                            ExcelPackage package = Utils_Releve.ExportReleveToExcel(pkReleve);
                            if (package == null)
                                return null;
                            ms = new MemoryStream(package.GetAsByteArray());
                            break;
#endif
                        }

                    default: return null;
                }

            }


            return ms.ToArray();
        }
        /// <summary>
        /// Obtient une datatable contenant les données de l'avancement client  
        /// </summary>
        /// <param name="dateDebut">Date de début</param>
        /// <param name="dateFin">Date de fin</param>
        /// <param name="pk"></param>
        /// <param name="destinationType">Type de destination
        /// Valeurs possibles :
        /// RD_CLIENT pour un client (plusieurs immeubles possible)
        /// RD_IMMEUBLE pour un immeuble
        /// RD_GESTIONNAIRE pour un gestionnaire
        /// </param>
        /// <returns></returns>
        private static DataTable GetDataTableForAvancementClient(DateTime dateDebut, DateTime dateFin, int pk, string destinationType)
        {
            DateTime dateStartSalesforce = new DateTime(2021, 06, 24);
            DataTable dt;
            DataTable dt2;
            if (dateDebut.Date > dateStartSalesforce.Date)
            {
                dt = Reports.AvancementClientSF.GetDataSource(pk,
                    dateDebut.Date,
                    dateFin.Date,
                    destinationType);
            }
            else
            {
                if (dateFin > dateStartSalesforce)
                {
                    dt = Reports.AvancementClientSF.GetDataSource(pk,
                        dateStartSalesforce,
                        dateFin.Date,
                        destinationType);
                    dt2 = Reports.AvancementClient.GetDataSource(pk,
                        dateDebut.Date,
                        dateStartSalesforce,
                        destinationType);
                    dt.Merge(dt2);
                    dt = dt.AsEnumerable()
                       .OrderBy(r => r.Field<string>("NOM"))
                       .ThenBy(r => r.Field<string>("INTERVENTION"))
                       .CopyToDataTable();
                }
                else
                {
                    dt = Reports.AvancementClient.GetDataSource(pk, dateDebut.Date, dateFin.Date,
                    destinationType);
                }
            }

            return dt;
        }
        #endregion


        #region Consos
        /// <summary>
        /// retourne le top des consommations d'un immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkImmeuble">N° d'immeuble</param>
        /// <param name="TypeAppareil">Type d'appareil</param>
        /// <param name="NbTop">si -1: toutes les consos, sinon que les NbTop premières</param>
        /// <returns>TopConso c'est à dire NbTop Plus grandes et NbTop plus petites consos</returns>
        static public topConsos GetTopConsosByImmeuble(string SessionID, int PkUser, int PkImmeuble, string TypeAppareil, int NbTop)
        {
            //WEBTODO TODO :
            // - releve remplace par web_releve
            // - indexconso remplace par web_indexconso
            // - occupant remplace par web_logement
            // - compteur remplace par web_compteur

#if WS2
            topConsos TopConsos = new topConsos();

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TopConsos.Erreur = "incohérence de session";
                    return TopConsos;
                }
                else
                {
                    // Recup du dernier relevé : (doit être cloturé)
                    string Query = $@"SELECT pkreleve, datereleve
                                    FROM web_releve
                                    WHERE fkimmeuble = {PkImmeuble} 
                                    AND datereleve <= {DateTime.Now.QuotedStr()} 
                                    AND datecloture is not null";

                    if (TypeAppareil != "")
                        Query += $@" AND typeerc= {GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr()} ";

                    Query += " ORDER BY DATERELEVE DESC";
                    DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
                    if (Dr != null) // Seulement si on a trouvé un relévé
                    {
                        try
                        {
                            TopConsos.DateReleve = Dr["DATERELEVE"].ToString().ToDateTime();
                            int PkReleve = Dr["PKRELEVE"].ToString().ToString().ToInt32OrDefault();

                            string QueryConsos = $@"SELECT web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio, web_compteur.fluide, web_logement.pklogement, sum(web_indexconso.conso)
                                                    FROM web_indexconso, web_compteur, web_logement, web_occupant
                                                    WHERE web_indexconso.fkreleve = {PkReleve} 
                                                    AND web_indexconso.fkcompteur = web_compteur.pkcompteur
                                                    AND web_compteur.fklogement = web_logement.pklogement
                                                    AND web_occupant.fklogement = web_logement.pklogement
                                                    AND web_compteur.actif = 'O'
                                                    AND web_logement.typecompteur='D'
                                                    AND (web_occupant.datedepart> {DateTime.Now.QuotedStr()} 
                                                    or web_occupant.datedepart is null)";
                            if (TypeAppareil != "")
                                QueryConsos += GetTypeAppareilFilter(TypeAppareil);

                            QueryConsos += $@" group by web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio, web_compteur.fluide, web_logement.pklogement, web_indexconso.conso
                                                having sum(web_indexconso.conso)>=0
                                                order by sum(web_indexconso.conso)";

                            DataRowCollection Dtr = WS_DBUtils.utils_LER.DBSelectRows(QueryConsos);

                            int NbConsosToRead;
                            if (NbTop > 0)
                                NbConsosToRead = NbTop;
                            else
                                NbConsosToRead = Dtr.Count;

                            if (NbConsosToRead > Dtr.Count)
                                NbConsosToRead = Dtr.Count;

                            // Parcours pour prendre que les plus petites
                            // on ne prend que les NbTop premières lignes (ou tout si NbTop pas -1)
                            for (int CptConso = 0; CptConso < NbConsosToRead; CptConso++)
                            {
                                conso Conso = new conso
                                {
                                    PkLogement = Dtr[CptConso]["PKLOGEMENT"].ToString().ToInt32OrDefault(),
                                    NomOcc = Dtr[CptConso]["NOM"].ToString(),
                                    RefOcc = Dtr[CptConso]["CODELOGEGESTIO"].ToString(),
                                    Fluide = GetFKCritereFromFluide(Dtr[CptConso]["FLUIDE"].ToString())
                                };
                                if (Conso.Fluide != 1 && Conso.Fluide != 2)
                                    Conso.Fluide = -1;
                                Conso.Conso = Dtr[CptConso]["SUM(web_releve.CONSO)"].ToString().ToDecimalOrDefault();
                                TopConsos.consosPetites.Add(Conso);
                            }

                            // Parcours pour prendre que les plus grandes
                            // on ne prend que les NbTop dernières lignes (ou tout si NbTop pas -1) en remontant depuis la fin
                            for (int CptConso = Dtr.Count - 1; CptConso >= (Dtr.Count - NbConsosToRead); CptConso--)
                            {
                                conso Conso = new conso
                                {
                                    PkLogement = Dtr[CptConso]["PKLOGEMENT"].ToString().ToInt32OrDefault(),
                                    NomOcc = Dtr[CptConso]["NOM"].ToString(),
                                    RefOcc = Dtr[CptConso]["CODELOGEGESTIO"].ToString(),
                                    Fluide = GetFKCritereFromFluide(Dtr[CptConso]["FLUIDE"].ToString())
                                };
                                if (Conso.Fluide != 1 && Conso.Fluide != 2)
                                    Conso.Fluide = -1;
                                Conso.Conso = Dtr[CptConso]["SUM(web_releve.CONSO)"].ToString().ToDecimalOrDefault();
                                TopConsos.consosGrandes.Add(Conso);
                            }
                        }
                        catch (Exception Ex)
                        {
                            TopConsos.Erreur = "Erreur dans la récupération des infos:" + Ex.Message;
                            return TopConsos;
                        }
                    }
                }
            }
            catch (Exception Ex)
            {
                TopConsos.Erreur = Ex.Message;
            }

            return TopConsos;
#else
            topConsos TopConsos = new topConsos();

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    TopConsos.Erreur = "incohérence de session";
                    return TopConsos;
                }
                else
                {
                    // Recup du dernier relevé : (doit être cloturé)
                    string Query = $@"SELECT pkreleve, datereleve
                                    FROM releve
                                    WHERE fkimmeuble = {PkImmeuble} 
                                    AND datereleve <= {DateTime.Now.QuotedStr()} 
                                    AND datecloture is not null";

                    if (TypeAppareil != "")
                        Query += $@" AND typeerc= {GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr()} ";

                    Query += " ORDER BY DATERELEVE DESC";
                    DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
                    if (Dr != null) // Seulement si on a trouvé un relévé
                    {
                        try
                        {
                            TopConsos.DateReleve = Convert.ToDateTime(Dr["DATERELEVE"].ToString());
                            int PkReleve = Convert.ToInt32(Dr["PKRELEVE"].ToString());

                            string QueryConsos = $@"SELECT occupant.pkoccupant, occupant.nom, occupant.codelogegestio, compteur.fkcritere, logement.pklogement, sum(indexconso.conso)
                                                    FROM indexconso, compteur, logement, occupant, article
                                                    WHERE fkreleve = {PkReleve} 
                                                    AND indexconso.fkcompteur = compteur.pkcompteur
                                                    AND compteur.fklogement = logement.pklogement
                                                    AND occupant.fklogement = logement.pklogement
                                                    AND compteur.actif = 'O'
                                                    AND compteur.typecompteur='D'
                                                    AND compteur.fkarticle = article.pkarticle
                                                    AND (occupant.datedepart> {DateTime.Now.QuotedStr()} 
                                                    or datedepart is null)";
                            if (TypeAppareil != "")
                                QueryConsos += GetTypeAppareilFilter(TypeAppareil);

                            QueryConsos += $@" group by occupant.pkoccupant, occupant.nom, occupant.codelogegestio, compteur.fkcritere, logement.pklogement, indexconso.conso
                                                having sum(indexconso.conso)>=0
                                                order by sum(indexconso.conso)";

                            DataRowCollection Dtr = WS_DBUtils.utils_LER.DBSelectRows(QueryConsos);

                            int NbConsosToRead;
                            if (NbTop > 0)
                                NbConsosToRead = NbTop;
                            else
                                NbConsosToRead = Dtr.Count;

                            if (NbConsosToRead > Dtr.Count)
                                NbConsosToRead = Dtr.Count;

                            // Parcours pour prendre que les plus petites
                            // on ne prend que les NbTop premières lignes (ou tout si NbTop pas -1)
                            for (int CptConso = 0; CptConso < NbConsosToRead; CptConso++)
                            {
                                conso Conso = new conso
                                {
                                    PkLogement = Convert.ToInt32(Dtr[CptConso]["PKLOGEMENT"].ToString()),
                                    NomOcc = Dtr[CptConso]["NOM"].ToString(),
                                    RefOcc = Dtr[CptConso]["CODELOGEGESTIO"].ToString(),
                                    Fluide = Convert.ToInt32(Dtr[CptConso]["FKCRITERE"].ToString())
                                };
                                if (Conso.Fluide != 1 && Conso.Fluide != 2)
                                    Conso.Fluide = -1;
                                Conso.Conso = Convert.ToDecimal(Dtr[CptConso]["SUM(INDEXCONSO.CONSO)"].ToString());
                                TopConsos.consosPetites.Add(Conso);
                            }

                            // Parcours pour prendre que les plus grandes
                            // on ne prend que les NbTop dernières lignes (ou tout si NbTop pas -1) en remontant depuis la fin
                            for (int CptConso = Dtr.Count - 1; CptConso >= (Dtr.Count - NbConsosToRead); CptConso--)
                            {
                                conso Conso = new conso
                                {
                                    PkLogement = Convert.ToInt32(Dtr[CptConso]["PKLOGEMENT"].ToString()),
                                    NomOcc = Dtr[CptConso]["NOM"].ToString(),
                                    RefOcc = Dtr[CptConso]["CODELOGEGESTIO"].ToString(),
                                    Fluide = Convert.ToInt32(Dtr[CptConso]["FKCRITERE"].ToString())
                                };
                                if (Conso.Fluide != 1 && Conso.Fluide != 2)
                                    Conso.Fluide = -1;
                                Conso.Conso = Convert.ToDecimal(Dtr[CptConso]["SUM(INDEXCONSO.CONSO)"].ToString());
                                TopConsos.consosGrandes.Add(Conso);
                            }
                        }
                        catch (Exception Ex)
                        {
                            TopConsos.Erreur = "Erreur dans la récupération des infos:" + Ex.Message;
                            return TopConsos;
                        }
                    }
                }
            }
            catch (Exception Ex)
            {
                TopConsos.Erreur = Ex.Message;
            }

            return TopConsos;
#endif

        }

        private static int GetFKCritereFromFluide(string fluide)
        {
            switch (fluide)
            {
                case "EC":
                    return 1;
                case "EF":
                    return 2;
                default:
                    return 8;
            }
        }

        /// <summary>
        /// retourne les valeurs de consommation pour un immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">Pk</param>
        /// <param name="TypeAppareil">Type d'appareil</param>
        /// <param name="TypeCompteur">D = divisionnaire, G = général</param>
        /// <param name="DateDebut">Intervalle min de date de relévé</param>
        /// <param name="DateFin">Intervalle max de date de relévé</param>
        /// <returns>serie c'est à dire serie de XYL (x | y | légende)</returns>
        static private serie GetSerieConsosReleves(string SessionID, int PkUser, string TypeConteneur, int PkConteneur, string TypeAppareil, string TypeCompteur, DateTime DateDebut, DateTime DateFin)
        {
            string codes_ano = ""; // désactivé
            serie SerieConsos = new serie();
            if (TypeConteneur != "I" && TypeConteneur != "L" && TypeConteneur != "C")
            {
                SerieConsos.Erreur = "Type de conteneur doit être I ou L ou C";
                return SerieConsos;
            }

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    SerieConsos.Erreur = "incohérence de session";
                    return SerieConsos;
                }
                else
                {
                    int PkImmeuble = PkConteneur;
                    // Recup des relevés :

                    if (TypeConteneur == "L")
                        PkImmeuble = GetPKImmeubleByPKLogement(PkConteneur);

                    if (TypeConteneur == "C")
                        PkImmeuble = GetPKImmeubleByPkAppareil(PkConteneur);

                    List<releve> Releves = GetLastRelevesImmeuble(PkImmeuble, -1, DateDebut, DateFin, TypeAppareil);
                    string SPkAppareils = "";
                    if (TypeConteneur == "L")
                    {
                        List<appareil> Appareils = GetAppareilsByPkLogement(PkConteneur, TypeAppareil);//TODO éventuellement optimiser (on veut que les Pk)
                        if (Appareils.Count <= 0) // si pas d'appareils pour un logement, pas la peine de continuer
                            return SerieConsos;

                        foreach (appareil app in Appareils)
                            SPkAppareils += app.PkAppareil.ToString() + ",";
                        SPkAppareils = SPkAppareils.Trim(",".ToCharArray());

                    }
                    string ValeursXYL = "";
                    bool hasValeurs = false;

                    foreach (releve Releve in Releves)
                    {
                        string QueryIndexs = $@"SELECT sum(theindexf),sum(conso) FROM indexconso, compteur, article
                                                WHERE compteur.fkarticle = article.pkarticle
                                                AND pkcompteur = fkcompteur
                                                AND NVL(compteur.actif, 'O') <> 'N'
                                                AND fkreleve= {Releve.PkReleve} ";
                        if (codes_ano != "")
                            QueryIndexs += $@" AND ((code1 not in {codes_ano} 
                                            or code1 is null) AND (code2 not in {codes_ano} 
                                            or code2 is null) AND (code3 not in {codes_ano} 
                                            or code3 is null) AND (code4 not in {codes_ano} 
                                            or code4 is null))";

                        if (TypeConteneur == "L")
                            QueryIndexs += $@" AND fkcompteur in ({SPkAppareils})";

                        if (TypeConteneur == "C")
                            QueryIndexs += $@" AND fkcompteur= {PkConteneur} ";


                        //verrue du 04/01/2016 EC+EF
                        if (TypeAppareil == "EC+EF")
                            QueryIndexs += $@" AND (compteur.fkcritere=1 or compteur.fkcritere=2)";
                        else
                        {
                            if (TypeAppareil != "")
                                QueryIndexs += GetTypeAppareilFilter(TypeAppareil);
                        }

                        if (TypeCompteur != "")
                            QueryIndexs += $@" AND typecompteur= {TypeCompteur.QuotedStr()} ";

                        DataRow DrConso = WS_DBUtils.utils_LER.DBSelectRow(QueryIndexs);

                        int Conso = 0;
                        int Index = 0;
                        try
                        {
                            Index = Convert.ToInt32(DrConso["sum(THEINDEXF)"].ToString());
                            Conso = Convert.ToInt32(DrConso["sum(CONSO)"].ToString());

                            ValeursXYL += Releve.DateReleve.ToString("dd/MM/yyyy") + "|" + Conso + "|" + Index + ";";
                        }
                        catch { }

                        if (Index > 0)
                            hasValeurs = true;

                    }
                    if (hasValeurs == true) // si il y a au moins un index >0 pour tous les relevés
                    {
                        ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
                        SerieConsos.ValeursXYL = ValeursXYL;
                    }
                }

            }
            catch (Exception Ex)
            {
                SerieConsos.Erreur = Ex.Message;
            }

            return SerieConsos;
        }
        /// <summary>
        /// Récupère une série de conso
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="TypeConteneur">Type de conteneur "L", "C" ></param>
        /// <param name="PkConteneur">Pk conteneur</param>
        /// <param name="Fluides">Types de fluide
        /// Valeurs possibles :
        /// "EC"
        /// "EF"
        /// "REPART
        /// "CET"
        /// "CAPTEUR"
        /// ""
        /// </param>
        /// <param name="DateDebut">Date de début</param>
        /// <param name="DateFin">Date de fin</param>
        /// <returns>serie c'est à dire serie de XYL (x | y | légende)</returns>
        static private serie GetSerieIndexconsotch(string SessionID, int PkUser, string TypeConteneur, int PkConteneur, string Fluides, DateTime DateDebut, DateTime DateFin)
        {
            DateDebut = DateDebut.Date;
            DateFin = DateFin.Date;
            serie SerieConsos = new serie();
            if (TypeConteneur != "L" && TypeConteneur != "C")//TODO
            {
                SerieConsos.Erreur = "Type de conteneur doit être L ou C";
                return SerieConsos;
            }

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    SerieConsos.Erreur = "incohérence de session";
                    return SerieConsos;
                }
                else
                {

                    #region Select
                    Dictionary<string, object> projectDic = new Dictionary<string, object>
                    {
                        { "DATEINDEX", "$" + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX},
                        { "THEINDEXD", "$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD},
                        { "FUITECLIENT", "$" + Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT},
                        //Ajouté seulement pour test sur le compteur 1801559 - A retirer ensuite quand test fini
                        { "PKCOMPTEUR", "$" + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK} 
                        //Fin Ajouté seulement pour test sur le compteur 1801559 - A retirer ensuite quand test fini
                    };

                    var project = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);

                    #endregion

                    #region Where
                    Dictionary<string, object> matchList = new Dictionary<string, object>
                    {
                        {
                            Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,
                            new BsonDocument().Add("$gte", DateDebut)
                                              .Add("$lte", DateFin)
                        }
                    };

                    switch (TypeConteneur)
                    {
                        case "C":
                            matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, PkConteneur);
                            break;
                        case "L":
                            List<int> Appareils = GetPkAppareilsByPkLogement(PkConteneur, Fluides);
                            matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(Appareils)));
                            break;
                        default:
                            break;
                    }

                    var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                    #endregion

                    #region Sort
                    Dictionary<string, int> sortList = new Dictionary<string, int>
                    {
                         { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, 1 }
                    };

                    var sort = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortList);

                    #endregion

                    var pipeline = new[] { match, sort, project };

                    DataRowCollection Drc = WS_DBUtils.utils_Mongo.MongoAggregateRows(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline);

                    string ValeursXYL = "";
                    bool hasValeurs = false;

                    // liste des index (utile pour rajouter les fuites etc.. dedans avant de faire la string de la série)
                    Dictionary<DateTime, indexTeleReleve> Indexs = new Dictionary<DateTime, indexTeleReleve>();
                    indexTeleReleve idx;

                    // création des indexs non relevés (dans l'intervalle Date1 et Date2 et (aussi entre le plus petit et le plus grand index))
                    DateTime DateIndexMin;
                    DateTime DateIndexMax;
                    if (Drc.Count > 0)
                    {
                        DateIndexMin = Convert.ToDateTime(Drc[0]["DATEINDEX"]);
                        DateIndexMax = Convert.ToDateTime(Drc[Drc.Count - 1]["DATEINDEX"]);
                        TimeSpan difference = DateIndexMax - DateIndexMin;
                        int NbJours = difference.Days;
                        for (int Cpt = 0; Cpt < NbJours; Cpt++)
                        {
                            idx = new indexTeleReleve();
                            DateTime DateCpt = DateIndexMin.AddDays(Cpt);
                            idx.DateReleve = DateCpt;
                            idx.Index = 0;
                            idx.Conso = 0;
                            idx.Releve = false;// valeur qui indiquera que ce n'est pas un index relevé
                            idx.Fuite = false;
                            Indexs.Add(DateCpt, idx);
                        }
                    }

                    foreach (DataRow Dr in Drc)
                    {
                        try // si erreur, l'index sera "non relevé
                        {
                            idx = new indexTeleReleve
                            {
                                DateReleve = Convert.ToDateTime(Dr["DATEINDEX"].ToString())
                            };
                            if (Dr["THEINDEXD"] is DBNull)//codes 93
                                idx.Index = 0;
                            else
                            {
                                hasValeurs = true;
                                idx.Index = Convert.ToDecimal(Dr["THEINDEXD"].ToString());
                            }

                            string FuiteClient = Dr["FUITECLIENT"].ToString();
                            //Ajouté seulement pour test sur le compteur 1801559 - A retirer ensuite quand test fini
                            if (Dr["PKCOMPTEUR"].ToString() == "1801559")
                                idx.Fuite = true;
                            else
                                //Fin Ajouté seulement pour test sur le compteur 1801559 - A retirer ensuite quand test fini
                                if (string.IsNullOrEmpty(FuiteClient) || FuiteClient == "N")
                                idx.Fuite = false;
                            else if (FuiteClient == "O")
                                idx.Fuite = true;

                            if (Indexs.ContainsKey(idx.DateReleve) == false)
                                Indexs.Add(idx.DateReleve, idx); // normalement pas utilisé
                            else
                            {
                                Indexs[idx.DateReleve].Releve = true;
                                Indexs[idx.DateReleve].Index += idx.Index; // on cumule les index des appareils
                                if (idx.Fuite == true)
                                    Indexs[idx.DateReleve].Fuite = true; // si un des compteur est en fuite, le point de la série l'est aussi
                            }
                        }
                        catch
                        {
                        }
                    }

                    // remplissage des trous (on veut envoyer toutes les dates de l'intervale
                    // + calcul conso
                    // + lissage conso //TODO (pas encore fait : pas grave pour fidésio)
                    // + construction chaine

                    indexTeleReleve LastIndex = new indexTeleReleve
                    {
                        Index = 0
                    };
                    foreach (DateTime dtime in Indexs.Keys)
                    {
                        //LastIdx = idx;
                        idx = Indexs[dtime];
                        string Index = "";
                        string Conso = "";
                        if (idx.Releve == true)
                        {
                            Index = Indexs[dtime].Index.ToString();
                            Conso = (idx.Index - LastIndex.Index).ToString();
                        }

                        ValeursXYL += Indexs[dtime].DateReleve.ToString("dd/MM/yyyy") + "|" + Conso + "|" + Index;
                        if (Indexs[dtime].Fuite == true)
                            ValeursXYL += "|FUITE=O";
                        ValeursXYL += ";";

                        if (idx.Releve == true)
                            LastIndex = idx;
                    }

                    if (hasValeurs == true)
                    {
                        ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
                        SerieConsos.ValeursXYL = ValeursXYL;
                    }
                }
            }
            catch (Exception Ex)
            {
                SerieConsos.Erreur = Ex.Message;
            }

            return SerieConsos;
        }
        /// <summary>
        /// Retourne une série de somme d'index pour une période donnée
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="TypeConteneur">TypeConteneur = "L" ou "C"</param>
        /// <param name="PkConteneur">Pk conteneur</param>
        /// <param name="TypeAppareil">Type d'appareil</param>
        /// <param name="DateDebut">Date de début</param>
        /// <param name="DateFin">Date de fin</param>
        /// <returns>serie c'est à dire serie de XYL (x | y | légende)</returns>
        static private serie GetSommeSerieIndexconsotch(string SessionID, int PkUser, string TypeConteneur, int PkConteneur, string TypeAppareil, DateTime DateDebut, DateTime DateFin)
        {
            DateDebut = DateDebut.Date;
            DateFin = DateFin.Date;
            serie SerieConsos = new serie();
            if (TypeConteneur != "L" && TypeConteneur != "C")//TODO
            {
                SerieConsos.Erreur = "Type de conteneur doit être L ou C";
                return SerieConsos;
            }

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    SerieConsos.Erreur = "incohérence de session";
                    return SerieConsos;
                }
                else
                {

                    #region Select
                    Dictionary<string, object> projectDic = new Dictionary<string, object>
                    {
                        { "DATEINDEX","$" + "_id." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX},
                        { "SOMMEINDEX", 1},
                        { "NBINDEX", 1},
                    };

                    var project = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);

                    #endregion

                    #region Where pour la table Join
                    Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                    {


                    };
                    #endregion

                    #region Group

                    var groupCount = new BsonDocument
                    {
                        {
                            "$group",
                            new BsonDocument().Add("_id", new BsonDocument().Add(Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,"$" + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX)) //Group By this
                                              .Add("SOMMEINDEX",new BsonDocument().Add("$sum","$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD)) //
                                              .Add("NBINDEX",new BsonDocument().Add("$sum", 1)) //Count
                        }
                    };

                    #endregion

                    #region Where
                    List<int> appareils;

                    Dictionary<string, object> matchList = new Dictionary<string, object>
                    {
                        {
                            Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,
                            new BsonDocument().Add("$gte", DateDebut)
                                              .Add("$lte", DateFin)
                        }
                    };
                    switch (TypeConteneur)
                    {

                        case "C":
                            matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, PkConteneur);
                            break;
                        case "L":
                            appareils = GetPkAppareilsByPkLogement(PkConteneur, TypeAppareil);
                            matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(appareils)));
                            break;
                        case "I":
                            appareils = GetPkAppareilsByPkImmeuble(PkConteneur, TypeAppareil);
                            matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(appareils)));
                            break;
                        default:
                            break;
                    }

                    var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                    #endregion

                    #region Sort
                    Dictionary<string, int> sortDic = new Dictionary<string, int>
                        {
                            {"DATEINDEX", 1 }
                        };

                    var sort = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortDic);
                    #endregion

                    var pipeline = new[] { match, groupCount, project, sort };// };

                    DataTable dtAggregate = null;

                    dtAggregate = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline);

                    DataRowCollection Drc = null;

                    if (dtAggregate != null)
                    {
                        Drc = dtAggregate.Rows;
                    }

                    string ValeursXYL = "";
                    bool hasValeurs = false;

                    // création des indexs non relevés (dans l'intervalle DateDebut et DateFin et (aussi entre le plus petit et le plus grand index))
                    DateTime DateIndexMin;
                    DateTime DateIndexMax;
                    int NbJours = 0;
                    if (Drc.Count > 0)
                    {
                        DateIndexMin = Convert.ToDateTime(Drc[0]["DATEINDEX"]);
                        DateIndexMax = Convert.ToDateTime(Drc[Drc.Count - 1]["DATEINDEX"]);
                        TimeSpan difference = DateIndexMax - DateIndexMin;
                        NbJours = difference.Days;
                    }
                    indexTeleReleve idx;
                    decimal LastIndex = 0;
                    int NbIndex = 0;
                    int LastNbIndex = 0;
                    foreach (DataRow Dr in Drc)
                    {
                        try // si erreur, l'index sera "non relevé
                        {
                            idx = new indexTeleReleve
                            {
                                DateReleve = Convert.ToDateTime(Dr["DATEINDEX"].ToString())
                            };
                            try
                            {
                                idx.Index = Convert.ToDecimal(Dr["SOMMEINDEX"].ToString());
                                NbIndex = Convert.ToInt32(Dr["NBINDEX"].ToString());
                            }
                            catch
                            {
                                idx.Index = 0;
                                NbIndex = 0;
                            }
                            string FuiteClient = "N";
                            if (string.IsNullOrEmpty(FuiteClient) || FuiteClient == "N")
                                idx.Fuite = false;
                            else if (FuiteClient == "O")
                                idx.Fuite = true;


                            if (idx.Index > 0)
                                hasValeurs = true;

                            string Index = "";
                            string Conso = "";

                            Index = idx.Index.ToString();
                            Conso = (idx.Index - LastIndex).ToString();

                            if (idx.Index < LastIndex)
                            {

                                //if ((NbIndex < LastNbIndex) && idx.Index>0)//baisse de la somme à cause problème relève certains répartiteurs
                                if (NbIndex < LastNbIndex)//baisse de la somme à cause problème relève certains répartiteurs
                                {//on affiche même valeur que précédente
                                    ValeursXYL += idx.DateReleve.ToString("dd/MM/yyyy") + "|0|" + LastIndex;// + "|VISIBLE=N"; ;
                                }
                                else // remise à zéro annuelle du répartiteur (ce n'est pas un problème de relève)
                                {// on ajoute un point invisible pour ne pas afficher la ligne de fidesio
                                    ValeursXYL += idx.DateReleve.ToString("dd/MM/yyyy") + "|" + Conso + "|" + Index + "|VISIBLE=N";//le premier suivant est invisible                                                                                                                                  // et on ajoute le même point visible
                                    ValeursXYL += ";" + idx.DateReleve.ToString("dd/MM/yyyy") + "|" + Conso + "|" + Index;
                                }
                                LastIndex = idx.Index;
                                LastNbIndex = NbIndex;

                            }
                            else// cas normal
                            {
                                ValeursXYL += idx.DateReleve.ToString("dd/MM/yyyy") + "|" + Conso + "|" + Index;
                                LastIndex = idx.Index;
                                LastNbIndex = NbIndex;
                            }
                            ValeursXYL += ";";
                        }
                        catch
                        {
                        }
                    }

                    if (hasValeurs == true)
                    {
                        ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
                        SerieConsos.ValeursXYL = ValeursXYL;
                        SerieConsos.DefaultIntervalle = NbJours;

                    }
                }
            }
            catch (Exception Ex)
            {
                SerieConsos.Erreur = Ex.Message;
            }

            return SerieConsos;
        }
        /// <summary>
        /// Retourne une série de conso pour une période donnée et un appareil donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkAppareil">Pk compteur</param>
        /// <param name="DateDebut">Date de début</param>
        /// <param name="DateFin">Date de fin</param>
        /// <returns>serie c'est à dire serie de XYL (x | y | légende)</returns>
        static public serie GetSerieConsosAppareil(string SessionID, int PkUser, int PkAppareil, DateTime DateDebut, DateTime DateFin)
        {
            serie SerieConsos = new serie();
            try
            {
                //           if (1==1 == false)
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    SerieConsos.Erreur = "incohérence de session";
                    return SerieConsos;
                }
                else
                {

                    #region Select
                    Dictionary<string, object> projectDic = new Dictionary<string, object>
                    {
                        { "DATEINDEX", "$" + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX},
                        { "THEINDEXD", "$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD},
                        { "FUITECLIENT", "$" + Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT},
                    };

                    var project = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);

                    #endregion

                    #region Where
                    Dictionary<string, object> matchList = new Dictionary<string, object>()
                    {
                        {Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,  Mongo_DBUtils.Between(DateDebut.Date,DateFin.Date)},
                         {Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, PkAppareil}
                    };
                    var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                    #endregion

                    #region Sort
                    Dictionary<string, int> sortDic = new Dictionary<string, int>
                        {
                            {"DATEINDEX", 1 }
                        };

                    var sort = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortDic);
                    #endregion

                    var pipeline = new[] { match, project, sort };

                    DataRowCollection Drc = WS_DBUtils.utils_Mongo.MongoAggregateRows(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline);

                    string ValeursXYL = "";
                    bool hasValeurs = false;

                    // création des indexs non relevés (dans l'intervalle Date1 et Date2 et (aussi entre le plus petit et le plus grand index))
                    DateTime DateIndexMin;
                    DateTime DateIndexMax;
                    int NbJours = 0;
                    if (Drc.Count > 0)
                    {
                        DateIndexMin = Convert.ToDateTime(Drc[0]["DATEINDEX"]);
                        DateIndexMax = Convert.ToDateTime(Drc[Drc.Count - 1]["DATEINDEX"]);
                        TimeSpan difference = DateIndexMax - DateIndexMin;
                        NbJours = difference.Days;
                    }
                    indexTeleReleve idx;
                    decimal LastIndex = 0;
                    foreach (DataRow Dr in Drc)
                    {
                        try // si erreur, l'index sera "non relevé
                        {
                            idx = new indexTeleReleve
                            {
                                DateReleve = Convert.ToDateTime(Dr["DATEINDEX"].ToString())
                            };
                            if (Dr["THEINDEXD"] is DBNull)//codes 93
                                idx.Index = 0;
                            else
                                idx.Index = Convert.ToDecimal(Dr["THEINDEXD"].ToString());
                            string FuiteClient = Dr["FUITECLIENT"].ToString();
                            if (string.IsNullOrEmpty(FuiteClient) || FuiteClient == "N")
                                idx.Fuite = false;
                            else if (FuiteClient == "O")
                                idx.Fuite = true;


                            if (idx.Index > 0)
                                hasValeurs = true;

                            string Index = "";
                            string Conso = "";
                            Index = idx.Index.ToString();
                            Conso = (idx.Index - LastIndex).ToString();

                            ValeursXYL += idx.DateReleve.ToString("dd/MM/yyyy") + "|" + Conso + "|" + Index;
                            if (idx.Fuite == true)
                                ValeursXYL += "|FUITE=O";
                            ValeursXYL += ";";

                            LastIndex = idx.Index;
                        }
                        catch
                        {
                        }
                    }

                    if (hasValeurs == true)
                    {
                        ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
                        SerieConsos.ValeursXYL = ValeursXYL;
                        SerieConsos.DefaultIntervalle = NbJours;

                    }
                }
            }
            catch (Exception Ex)
            {
                SerieConsos.Erreur = Ex.Message;
            }

            return SerieConsos;
        }
        /// <summary>
        /// Retourne l'index du mois précédent 
        /// </summary>
        /// <param name="IndexsMois">Liste d'index pour chaque mois</param>
        /// <param name="CurrIndexMois">Index actuel</param>
        /// <returns></returns>
        static public indexMois GetPrecIndexMois(List<indexMois> IndexsMois, indexMois CurrIndexMois)
        {
            indexMois retIndexMois = new indexMois { Virtual = true, Visible = false };
            //indexMois retIndexMois;

            int CurrIKey = Convert.ToInt32(CurrIndexMois.Key);
            int MinIKey = Convert.ToInt32(IndexsMois.Min(x => Convert.ToInt32(x.Key)));

            while (CurrIKey >= MinIKey)
            {
                CurrIKey--;
                retIndexMois = IndexsMois.FirstOrDefault(x => x.Key == CurrIKey.ToString() && x.Virtual == false);
                if (retIndexMois != null)
                    break;
            }

            return retIndexMois;
        }
        /// <summary>
        /// Retorune le libellé du mois
        /// </summary>
        /// <param name="i">Mois</param>
        /// <returns></returns>
        static string GetStringMois(int i)
        {
            switch (i)
            {
                case 1: return "Janv";
                case 2: return "Févr";
                case 3: return "Mars";
                case 4: return "Avr";
                case 5: return "Mai";
                case 6: return "Juin";
                case 7: return "Juil";
                case 8: return "Août";
                case 9: return "Sept";
                case 10: return "Oct";
                case 11: return "Nov";
                case 12: return "Déc";
                default: return "Erreur";
            }
        }

        // TB Immeubles (EAU + CET) (testé que sur immeubles)
        /// <summary>
        /// Retourne conso / index basé sur relevés de l'année courante et de l'année n-1
        /// tous les mois sont remplis soit par vraie valeur 
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="TypeConteneur">TypeConteneur = "I" ou "L" ou "C"</param>
        /// <param name="PkConteneur">Pk conteneur</param>
        /// <param name="TypeAppareil">Type d'appareil</param>
        /// <param name="TypeCompteur">Type de compteur</param>
        /// <param name="Year">Année</param>
        /// <param name="dateActivationClient"></param>
        /// <returns>objet contenant 3 séries (Serie1, Serie2,SerieDebug) c'est à dire serie de XYL (x | y | légende)</returns>
        static public multiSeries GetSerieConsosRelevesMois2Ans(
            string SessionID, int PkUser, string TypeConteneur, int PkConteneur,
            string TypeAppareil, string TypeCompteur, int Year,
            DateTime dateActivationClient)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur
            // - indexconso remplace par web_indexconso
#if WS2
            DateTime Date1 = new DateTime(Year - 2, 1, 1);// on est obligé de remonter n-2 pour avoir conso de janvier de n-1
            if (dateActivationClient > Date1)
                Date1 = dateActivationClient;

            DateTime Date2 = new DateTime(Year, 12, 31);
            if (dateActivationClient > Date2)
                Date2 = dateActivationClient;

            string codes_ano = "";
            multiSeries MultiSerie = new multiSeries();
            if (TypeConteneur != "I" && TypeConteneur != "L" && TypeConteneur != "C")
            {
                MultiSerie.Erreur = "Type de conteneur doit être I ou L ou C";
                return MultiSerie;
            }

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    MultiSerie.Erreur = "incohérence de session";
                    return MultiSerie;
                }
                else
                {
                    int PkImmeuble = PkConteneur;
                    // Recup des relevés :

                    if (TypeConteneur == "L")
                        PkImmeuble = GetPKImmeubleByPKLogement(PkConteneur);

                    if (TypeConteneur == "C")
                        PkImmeuble = GetPKImmeubleByPkAppareil(PkConteneur);

                    List<releve> Releves = GetLastRelevesImmeuble(PkImmeuble, -1, Date1, Date2, TypeAppareil);

                    string ValeursXYL = "";

                    // ***init mois (sur 36 mois)
                    List<indexMois> IndexsMois = new List<indexMois>();
                    DateTime CurrDate = Date1;

                    for (int i = 1; i <= 36; i++)
                    {
                        string Key = CurrDate.Year.ToString() + CurrDate.Month.ToString().PadLeft(2, '0');
                        IndexsMois.Add(new indexMois { Key = Key, Annee = CurrDate.Year, Mois = CurrDate.Month, Virtual = true, Visible = false });

                        CurrDate = CurrDate.AddMonths(1);
                    }

                    foreach (releve Releve in Releves)
                    {
                        string QueryIndexs = $@" SELECT SUM(theindexf),SUM(conso) 
                                                    FROM Web_indexconso, Web_compteur
                                                    WHERE Web_compteur.pkcompteur = Web_indexconso.fkcompteur 
                                                        AND Web_indexconso.fkcompteur = Web_compteur.pkcompteur 
                                                        AND fkreleve={Releve.PkReleve} ";
                        if (codes_ano != "")
                            QueryIndexs += " and ((CODE1 NOT IN " + codes_ano + " or CODE1 is NULL) AND (CODE2 NOT IN " + codes_ano + " or CODE2 is NULL) AND (CODE3 NOT IN " + codes_ano + " or CODE3 is NULL) AND (CODE4 NOT IN " + codes_ano + " or CODE4 is NULL))";

                        if (TypeConteneur == "L")
                            QueryIndexs += " and web_compteur.fklogement=" + PkConteneur;

                        if (TypeConteneur == "C")
                            QueryIndexs += " and web_compteur.pkcompteur=" + PkConteneur;


                        if (TypeAppareil == "EC+EF")
                            QueryIndexs += " and (Web_compteur.FLUIDE='EC' or Web_compteur.FLUIDE='EF')";
                        else
                        {
                            if (TypeAppareil != "")
                                QueryIndexs += GetTypeAppareilFilter(TypeAppareil);
                        }

                        if (TypeCompteur != "")
                            QueryIndexs += " and TYPECOMPTEUR=" + TypeCompteur.QuotedStr();

                        DataRow DrConso = WS_DBUtils.utils_LER.DBSelectRow(QueryIndexs);
                        int Conso = 0;
                        int Index = 0;
                        try
                        {
                            Index = DrConso["sum(THEINDEXF)"].ToString().ToInt32OrDefault();
                            Conso = DrConso["sum(CONSO)"].ToString().ToInt32OrDefault();
                            string KeyRow = Releve.DateReleve.Year + Releve.DateReleve.Month.ToString().PadLeft(2, '0');
                            if (IndexsMois.Count(x => x.Key == KeyRow) > 0)// on prend dernière valeur du mois (car c'est écrasé)
                            {
                                indexMois currIndexMois = IndexsMois.FirstOrDefault(x => x.Key == KeyRow);
                                currIndexMois.Index = Index;
                                currIndexMois.Virtual = false;
                                currIndexMois.Visible = true;
                            }
                        }
                        catch { }

                    }

                    //Calcul conso (différences entre releves) depuis index
                    decimal lastIndex = 0;
                    foreach (indexMois currIndexMois in IndexsMois.Where(x => x.Virtual == false).OrderBy(x => Convert.ToInt32(x.Key)))
                    {
                        decimal conso = currIndexMois.Index - lastIndex;
                        currIndexMois.Conso = conso;
                        lastIndex = currIndexMois.Index;
                    }

                    //Lissage des index et des consos pour points virtuels
                    foreach (indexMois currIndexMois in IndexsMois.OrderBy(x => Convert.ToInt32(x.Key)))
                    {
                        if (currIndexMois.Virtual == false) // on ne parcours que les vrais index releves
                        {
                            indexMois prec = GetPrecIndexMois(IndexsMois, currIndexMois);
                            if (prec != null)
                            {
                                // Différence en mois entre index et vrai index précédent
                                DateTime d1 = new DateTime(prec.Annee, prec.Mois, 01);
                                DateTime d2 = new DateTime(currIndexMois.Annee, currIndexMois.Mois, 01);
                                int diffMois = ((d2.Year - d1.Year) * 12) + d2.Month - d1.Month;
                                Decimal diffIndex = currIndexMois.Index - prec.Index;
                                Decimal diffConso = currIndexMois.Conso - prec.Conso;

                                // on remplie les index virtuels
                                DateTime CurrDateV = new DateTime(prec.Annee, prec.Mois, 1);
                                for (int m = 1; m < diffMois; m++)
                                {
                                    CurrDateV = CurrDateV.AddMonths(1);
                                    string Key = CurrDateV.Year.ToString() + CurrDateV.Month.ToString().PadLeft(2, '0');
                                    // 200 janv
                                    // 1000 avril
                                    // donne 200 + (((1000-200) * 1) /3)
                                    // puis 200 + (((1000-200) * 2) /3)
                                    indexMois CurrIndexMoisV = IndexsMois.FirstOrDefault(x => x.Key == Key);
                                    CurrIndexMoisV.Index = prec.Index + (((diffIndex) * m) / diffMois);
                                    CurrIndexMoisV.Conso = prec.Conso + (((diffConso) * m) / diffMois);
                                    CurrIndexMoisV.Virtual = true;
                                    CurrIndexMoisV.Visible = true;
                                }
                            }
                            else
                            {
                                //SerieConsos.ValeursXYL2 += currIndexMois.Key + "|    " + "VIDE" + ";";
                            }
                        }
                        else
                        {
                            //SerieConsos.ValeursXYL2 += currIndexMois.Key + "|    " + "VIRTUEL" + ";";
                        }
                    }

                    //Création création ValuesXYL par année
                    bool HasValueN1 = false;
                    bool HasValueN2 = false;
                    foreach (indexMois currIndexMois in IndexsMois.OrderBy(x => Convert.ToInt32(x.Key)))
                    {
                        string option = "";
                        if (currIndexMois.Virtual == true)
                            option = "VIRTUAL=O";
                        else
                            option = "VIRTUAL=N";

                        if (currIndexMois.Visible == false)
                        {
                            option = "VISIBLE=N";
                            currIndexMois.Index = -1;
                            currIndexMois.Conso = -1;
                        }

                        string MoisFinal = GetStringMois(currIndexMois.Mois);
                        decimal ConsoFinal = Math.Round(currIndexMois.Conso, 1);
                        decimal IndexFinal = Math.Round(currIndexMois.Index, 1);
                        if (currIndexMois.Annee == Year) // année courante ou année -1
                        {
                            MultiSerie.Serie1.ValeursXYL += MoisFinal + "|" + ConsoFinal + "|" + IndexFinal + "|" + option + ";";
                            if (currIndexMois.Visible)
                                HasValueN1 = true;

                        }
                        else if (currIndexMois.Annee == Year - 1)
                        {
                            MultiSerie.Serie2.ValeursXYL += MoisFinal + "|" + ConsoFinal + "|" + IndexFinal + "|" + option + ";";
                            if (currIndexMois.Visible)
                                HasValueN2 = true;
                        }
                    }
                    if (HasValueN1 == false)
                        MultiSerie.Serie1.ValeursXYL = "";
                    if (HasValueN2 == false)
                        MultiSerie.Serie2.ValeursXYL = "";
                    MultiSerie.SerieDebug.ValeursXYL = ValeursXYL;
                }
            }
            catch (Exception Ex)
            {
                MultiSerie.Erreur = Ex.Message;
            }

            MultiSerie.Serie1.ValeursXYL = MultiSerie.Serie1.ValeursXYL.TrimEnd(';');
            MultiSerie.Serie1.Annee = Year.ToString();
            MultiSerie.Serie1.DefaultIntervalle = 365;

            MultiSerie.Serie2.ValeursXYL = MultiSerie.Serie2.ValeursXYL.TrimEnd(';');
            MultiSerie.Serie2.Annee = (Year - 1).ToString();
            MultiSerie.Serie2.DefaultIntervalle = 365;

            return MultiSerie;
#else
            DateTime Date1 = new DateTime(Year - 2, 1, 1);// on est obligé de remonter n-2 pour avoir conso de janvier de n-1
            if (dateActivationClient > Date1)
                Date1 = dateActivationClient;

            DateTime Date2 = new DateTime(Year, 12, 31);
            if (dateActivationClient > Date2)
                Date2 = dateActivationClient;

            string codes_ano = "";
            multiSeries MultiSerie = new multiSeries();
            if (TypeConteneur != "I" && TypeConteneur != "L" && TypeConteneur != "C")
            {
                MultiSerie.Erreur = "Type de conteneur doit être I ou L ou C";
                return MultiSerie;
            }

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    MultiSerie.Erreur = "incohérence de session";
                    return MultiSerie;
                }
                else
                {
                    int PkImmeuble = PkConteneur;
                    // Recup des relevés :

                    if (TypeConteneur == "L")
                        PkImmeuble = GetPKImmeubleByPKLogement(PkConteneur);

                    if (TypeConteneur == "C")
                        PkImmeuble = GetPKImmeubleByPkAppareil(PkConteneur);

                    List<releve> Releves = GetLastRelevesImmeuble(PkImmeuble, -1, Date1, Date2, TypeAppareil);
                    string SPkAppareils = "";
                    if (TypeConteneur == "L")
                    {
                        List<appareil> Appareils = GetAppareilsByPkLogement(PkConteneur, TypeAppareil);//TODO éventuellement optimiser (on veut que les Pk)
                        if (Appareils.Count <= 0) // si pas d'appareils pour un logement, pas la peine de continuer
                            return MultiSerie;

                        foreach (appareil app in Appareils)
                            SPkAppareils += app.PkAppareil.ToString() + ",";
                        SPkAppareils = SPkAppareils.Trim(",".ToCharArray());

                    }
                    string ValeursXYL = "";

                    // ***init mois (sur 36 mois)
                    List<indexMois> IndexsMois = new List<indexMois>();
                    DateTime CurrDate = Date1;

                    for (int i = 1; i <= 36; i++)
                    {
                        string Key = CurrDate.Year.ToString() + CurrDate.Month.ToString().PadLeft(2, '0');
                        IndexsMois.Add(new indexMois { Key = Key, Annee = CurrDate.Year, Mois = CurrDate.Month, Virtual = true, Visible = false });

                        CurrDate = CurrDate.AddMonths(1);
                    }

                    foreach (releve Releve in Releves)
                    {
                        string QueryIndexs = "select sum(THEINDEXF),sum(CONSO) from INDEXCONSO, COMPTEUR, ARTICLE" +
                            " where PKCOMPTEUR = FKCOMPTEUR" +
                            " and COMPTEUR.FKARTICLE = ARTICLE.PKARTICLE" +
                            " and NVL(COMPTEUR.ACTIF, 'O') <> 'N'" +
                            " and FKRELEVE=" + Releve.PkReleve;
                        if (codes_ano != "")
                            QueryIndexs += " and ((CODE1 NOT IN " + codes_ano + " or CODE1 is NULL) AND (CODE2 NOT IN " + codes_ano + " or CODE2 is NULL) AND (CODE3 NOT IN " + codes_ano + " or CODE3 is NULL) AND (CODE4 NOT IN " + codes_ano + " or CODE4 is NULL))";

                        if (TypeConteneur == "L")
                            QueryIndexs += " and fkcompteur in (" + SPkAppareils + ")";

                        if (TypeConteneur == "C")
                            QueryIndexs += " and fkcompteur=" + PkConteneur;


                        if (TypeAppareil == "EC+EF")
                            QueryIndexs += " and (COMPTEUR.FKCRITERE=1 or COMPTEUR.FKCRITERE=2)";
                        else
                        {
                            if (TypeAppareil != "")
                                QueryIndexs += GetTypeAppareilFilter(TypeAppareil);
                        }

                        if (TypeCompteur != "")
                            QueryIndexs += " and TYPECOMPTEUR=" + TypeCompteur.QuotedStr();

                        DataRow DrConso = WS_DBUtils.utils_LER.DBSelectRow(QueryIndexs);
                        int Conso = 0;
                        int Index = 0;
                        try
                        {
                            Index = Convert.ToInt32(DrConso["sum(THEINDEXF)"].ToString());
                            Conso = Convert.ToInt32(DrConso["sum(CONSO)"].ToString());
                            string KeyRow = Releve.DateReleve.Year + Releve.DateReleve.Month.ToString().PadLeft(2, '0');
                            if (IndexsMois.Count(x => x.Key == KeyRow) > 0)// on prend dernière valeur du mois (car c'est écrasé)
                            {
                                indexMois currIndexMois = IndexsMois.FirstOrDefault(x => x.Key == KeyRow);
                                currIndexMois.Index = Index;
                                currIndexMois.Virtual = false;
                                currIndexMois.Visible = true;
                            }
                        }
                        catch { }

                    }

                    //Calcul conso (différences entre releves) depuis index
                    decimal lastIndex = 0;
                    foreach (indexMois currIndexMois in IndexsMois.Where(x => x.Virtual == false).OrderBy(x => Convert.ToInt32(x.Key)))
                    {
                        decimal conso = currIndexMois.Index - lastIndex;
                        currIndexMois.Conso = conso;
                        lastIndex = currIndexMois.Index;
                    }

                    //Lissage des index et des consos pour points virtuels
                    foreach (indexMois currIndexMois in IndexsMois.OrderBy(x => Convert.ToInt32(x.Key)))
                    {
                        if (currIndexMois.Virtual == false) // on ne parcours que les vrais index releves
                        {
                            indexMois prec = GetPrecIndexMois(IndexsMois, currIndexMois);
                            if (prec != null)
                            {
                                // Différence en mois entre index et vrai index précédent
                                DateTime d1 = new DateTime(prec.Annee, prec.Mois, 01);
                                DateTime d2 = new DateTime(currIndexMois.Annee, currIndexMois.Mois, 01);
                                int diffMois = ((d2.Year - d1.Year) * 12) + d2.Month - d1.Month;
                                Decimal diffIndex = currIndexMois.Index - prec.Index;
                                Decimal diffConso = currIndexMois.Conso - prec.Conso;

                                // on remplie les index virtuels
                                DateTime CurrDateV = new DateTime(prec.Annee, prec.Mois, 1);
                                for (int m = 1; m < diffMois; m++)
                                {
                                    CurrDateV = CurrDateV.AddMonths(1);
                                    string Key = CurrDateV.Year.ToString() + CurrDateV.Month.ToString().PadLeft(2, '0');
                                    // 200 janv
                                    // 1000 avril
                                    // donne 200 + (((1000-200) * 1) /3)
                                    // puis 200 + (((1000-200) * 2) /3)
                                    indexMois CurrIndexMoisV = IndexsMois.FirstOrDefault(x => x.Key == Key);
                                    CurrIndexMoisV.Index = prec.Index + (((diffIndex) * m) / diffMois);
                                    CurrIndexMoisV.Conso = prec.Conso + (((diffConso) * m) / diffMois);
                                    CurrIndexMoisV.Virtual = true;
                                    CurrIndexMoisV.Visible = true;
                                }
                            }
                            else
                            {
                                //SerieConsos.ValeursXYL2 += currIndexMois.Key + "|    " + "VIDE" + ";";
                            }
                        }
                        else
                        {
                            //SerieConsos.ValeursXYL2 += currIndexMois.Key + "|    " + "VIRTUEL" + ";";
                        }
                    }

                    //Création création ValuesXYL par année
                    bool HasValueN1 = false;
                    bool HasValueN2 = false;
                    foreach (indexMois currIndexMois in IndexsMois.OrderBy(x => Convert.ToInt32(x.Key)))
                    {
                        string option = "";
                        if (currIndexMois.Virtual == true)
                            option = "VIRTUAL=O";
                        else
                            option = "VIRTUAL=N";

                        if (currIndexMois.Visible == false)
                        {
                            option = "VISIBLE=N";
                            currIndexMois.Index = -1;
                            currIndexMois.Conso = -1;
                        }

                        string MoisFinal = GetStringMois(currIndexMois.Mois);
                        decimal ConsoFinal = Math.Round(currIndexMois.Conso, 1);
                        decimal IndexFinal = Math.Round(currIndexMois.Index, 1);
                        if (currIndexMois.Annee == Year) // année courante ou année -1
                        {
                            MultiSerie.Serie1.ValeursXYL += MoisFinal + "|" + ConsoFinal + "|" + IndexFinal + "|" + option + ";";
                            if (currIndexMois.Visible)
                                HasValueN1 = true;

                        }
                        else if (currIndexMois.Annee == Year - 1)
                        {
                            MultiSerie.Serie2.ValeursXYL += MoisFinal + "|" + ConsoFinal + "|" + IndexFinal + "|" + option + ";";
                            if (currIndexMois.Visible)
                                HasValueN2 = true;
                        }
                    }
                    if (HasValueN1 == false)
                        MultiSerie.Serie1.ValeursXYL = "";
                    if (HasValueN2 == false)
                        MultiSerie.Serie2.ValeursXYL = "";
                    MultiSerie.SerieDebug.ValeursXYL = ValeursXYL;
                }
            }
            catch (Exception Ex)
            {
                MultiSerie.Erreur = Ex.Message;
            }

            MultiSerie.Serie1.ValeursXYL = MultiSerie.Serie1.ValeursXYL.TrimEnd(';');
            MultiSerie.Serie1.Annee = Year.ToString();
            MultiSerie.Serie1.DefaultIntervalle = 365;

            MultiSerie.Serie2.ValeursXYL = MultiSerie.Serie2.ValeursXYL.TrimEnd(';');
            MultiSerie.Serie2.Annee = (Year - 1).ToString();
            MultiSerie.Serie2.DefaultIntervalle = 365;

            return MultiSerie;
#endif
        }
        #endregion

        #region Depannages
        /// <summary>
        /// Otient le pk de l'immeuble du logement rentré en paramètre
        /// </summary>
        /// <param name="PKLogement">Pk du logement</param>
        /// <returns></returns>
        static private int GetPKImmeubleByPKLogement(int PKLogement)
        {
            //WEBTODO :
            // - logement remplace par web_logement
#if WS2
            string Query;

            Query = $@"SELECT web_logement.fkimmeuble
                        FROM web_logement
                        WHERE web_logement.pklogement = {PKLogement} ";

            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#else
            string Query;

            Query = $@"SELECT batiment.fkimmeuble
                        FROM logement, batiment
                        WHERE (logement.fkbatiment = batiment.pkbatiment)
                        AND pklogement = {PKLogement} ";

            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#endif
        }
        /// <summary>
        /// Récupère le Pk de l'immeuble de l'occupant passé en paramètre
        /// </summary>
        /// <param name="PKOccupant">Pk Occupant</param>
        /// <returns></returns>
        static private int GetPKImmeubleByPKOccupant(int PKOccupant)
        {
#if WS2
            string Query;

            Query = $@"SELECT Web_logement.fkimmeuble
                        FROM Web_logement, web_occupant
                        WHERE web_occupant.pkoccupant = {PKOccupant} 
                            AND web_occupant.fklogement = Web_logement.pklogement ";

            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#else
            string Query;

            Query = $@"SELECT batiment.fkimmeuble
                        FROM logement, batiment, occupant
                        WHERE (logement.fkbatiment = batiment.pkbatiment)
                        AND (occupant.fklogement = logement.pklogement)
                        AND pkoccupant = {PKOccupant} ";

            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#endif
        }
        /// <summary>
        /// Récupère le Pk de l'immeuble de l'appareil passé en paramètre
        /// </summary>
        /// <param name="PkAppareil">Pk appareil</param>
        /// <returns></returns>
        static private int GetPKImmeubleByPkAppareil(int PkAppareil)
        {
#if WS2
            string Query;

            Query = $@"SELECT Web_logement.fkimmeuble
                FROM Web_compteur, Web_logement
                WHERE (Web_compteur.fklogement = Web_logement.pklogement)
                AND pkcompteur = {PkAppareil} ";

            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#else
            string Query;

            Query = $@"SELECT batiment.fkimmeuble
                FROM compteur, logement, batiment
                WHERE (logement.fkbatiment = batiment.pkbatiment)
                AND (compteur.fklogement = logement.pklogement)
                AND pkcompteur = {PkAppareil} ";

            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#endif
        }
        /// <summary>
        /// Récupère le Pk de l'immeuble du workorder passé en paramètre
        /// </summary>
        /// <param name="WorkOrderNumber">Numéro de workorder</param>
        /// <returns></returns>
        static private int GetPKImmeubleByWorkOrder(string WorkOrderNumber)
        {
            string Query;

            Query = $@"SELECT immeuble__r.pkler__c FROM workorder WHERE workordernumber = {WorkOrderNumber.QuotedStr()} ";

            int Nb = -1;
            try
            {
                DataTable dtResult = WS_DBUtils.utils_SF.DBSelectTable(Query);
                string Ret = dtResult.Rows[0][0].ToString().Replace("IMM_", "");
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
        }
        /// <summary>
        /// Vérifie si l'utilisateur a le droit de consulter les informations du logement
        /// </summary>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PKLogement">PK Logement</param>
        /// <returns></returns>
        static private bool CheckLogement(int PkUser, int PKLogement)
        {
            int PKImmeuble = GetPKImmeubleByPKLogement(PKLogement);
            return checkImmeuble(PkUser, PKImmeuble);
        }
        /// <summary>
        /// Vérifie si l'utilisateur a le droit de consulter les informations de l'occupant
        /// </summary>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PKOccupant">Pk de l'occupant</param>
        /// <returns></returns>
        static private bool checkImmeubleOccupant(int PkUser, int PKOccupant)
        {
            user u = GetUserByPk(PkUser);
            int PKImmeuble = GetPKImmeubleByPKOccupant(PKOccupant);
            return (u.UserType != "O" && checkImmeuble(PkUser, PKImmeuble));
        }
        /// <summary>
        /// Vérifie si l'utilisateur est le bon occupant
        /// </summary>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PKOccupant">PK de l'occupant</param>
        /// <returns></returns>
        static private bool checkOccupant(int PkUser, int PKOccupant)
        {
            user u = GetUserByPk(PkUser);
            //int PKImmeuble = GetPKImmeubleByPKOccupant(PKOccupant);
            return (u.UserType == "O" && u.FK == PKOccupant);
        }
        /// <summary>
        /// Vérifie que l'utilisateur a bien le droit d'accéder aux informatins du workorder
        /// </summary>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="workOrderNumber">Numéro du workorder</param>
        /// <returns></returns>
        static private bool CheckIntervention(int PkUser, string workOrderNumber)
        {
            int PKImmeuble = GetPKImmeubleByWorkOrder(workOrderNumber);
            return checkImmeuble(PkUser, PKImmeuble);
        }

        /// <summary>
        /// Vérifie que l'utilisateur a accès aux information de l'immeuble 
        /// </summary>
        /// <param name="_user">utilisateur</param>
        /// <param name="PKImmeuble">PK de l'immeuble</param>
        /// <returns></returns>
        static private bool CheckImmeuble(user _user, int PKImmeuble)
        {
            int Fk;
            string type;
            type = _user.UserType;
            if (type == "G")
                Fk = _user.PKUser;
            else
                Fk = _user.FK;

            string fromWhere = "";

            if (type == "C")
                fromWhere = $@"FROM web_immeuble  
                                WHERE 
                                {(_user.showImmeublesArc ? "" : "web_immeuble.ACTIF='O' AND ")}
                                web_immeuble.pkimmeuble = {PKImmeuble} AND 
                                web_immeuble.fkclient IN (
                                    select web_client.pkclient
                                    from web_client
                                    start with web_client.pkclient = {Fk} 
                                    connect by web_client.fkclient= prior web_client.pkclient )
                                AND (SUBSTR(web_immeuble.ID, 1, 1) <> 'P')";

            else if (type == "G")
            {
                fromWhere =
                    $@" FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right, web_immeuble
                        WHERE
                            {(_user.showImmeublesArc ? "" : " web_immeuble.actif='O' AND ")}
                            web_immeuble.pkimmeuble = {PKImmeuble} AND 
                            web_immeuble.pkimmeuble = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.fk 
                            AND web_immeuble.fkclient IN
                            (
                                SELECT web_client.pkclient
                                FROM web_client
                                START WITH web_client.pkclient =
                                (
                                    SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient
                                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
                                    WHERE pkweb_user = (SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkparentuser
                                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user WHERE pkweb_user = {Fk})
                                )
                                CONNECT BY web_client.fkclient = PRIOR web_client.pkclient
                            )
                            AND(SUBSTR(web_immeuble.ID, 1, 1) <> 'P') 
                            AND {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.TYPER = 'I'
                            AND {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT.FKWEB_USER = {Fk.ToString()} 
                            ";
            }

            else if (type == "O")
            {
                fromWhere = $@" FROM web_immeuble, web_logement, web_occupant
                                    WHERE web_immeuble.pkimmeuble = Web_logement.fkimmeuble
                                        AND web_occupant.fklogement = web_logement.pklogement
                                        AND web_occupant.pkoccupant = {Fk}";
            }

            string query = $@" select count(*) {fromWhere}";

            return Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(query)) >= 1;
        }
        /// <summary>
        /// Vérifie que l'utilisateur a accès aux information de l'immeuble 
        /// </summary>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PKImmeuble">PK de l'immeuble</param>
        /// <returns></returns>
        static private bool checkImmeuble(int PkUser, int PKImmeuble)
        {
            DataRowCollection imms = GetRowsImmeublesByPKUser(_SuperLoginID, _SuperPassword, PkUser);
            string ListTousImmeubles = ";";
            foreach (DataRow im in imms)
                ListTousImmeubles += im["PKIMMEUBLE"].ToString() + ";";
            return (ListTousImmeubles.IndexOf(";" + PKImmeuble.ToString() + ";") > -1);
        }
        /// <summary>
        /// Obtient les information de dépannages sur un immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble">PK de l'immeuble</param>
        /// <param name="ParamsFiltres">Filtre pour n'avoir que les immeubles ayant le bon critère (si vide : pas de filtre) (paires clef=valeur)
        ///  valeur clef possible : 
        ///  PKOCCUPANT</param>
        /// <returns></returns>
        static public infosDepannages GetInfosDepannagesByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres)
        {
            //WEBTODO :
            // - occupant remplace par web_compteur.
#if WS2
            infosDepannages InfosDepannages = GetInfosDepannagesByImmeuble(SessionID, PkUser, PkImmeuble, ParamsFiltres, false);

            //verrueAjoutCET (si, eau, même occupant avec CET d'autre immeuble)
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            if (Pfiltres.GetParam("PKOCCUPANT") != "")
            {
                int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));
                int PkLogement = GetPkLogementByPkOccupant(pkOccupant);
                int nbEC = GetNbAppareils("L", PkLogement, "EC");
                int nbEF = GetNbAppareils("L", PkLogement, "EF");

                if (nbEC > 0 || nbEF > 0)
                {
                    // on est sur un logement EAU
                    //--> on recherche s'il y a un logement de REPART ou CET
                    string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                    $@"SELECT codelogegestio FROM web_occupant WHERE pkoccupant = {pkOccupant}");
                    int PkImmeubleCHAUFF = GetPKImmeubleAutre(PkImmeuble, pkOccupant);
                    int PkLogementCHAUFF = GetPkLogement(PkImmeubleCHAUFF, CodeLogeGestio);
                    int PkOccupantCHAUFF = GetPkOccupant(PkImmeubleCHAUFF, CodeLogeGestio);

                    List<appareil> AppareilsCHAUFF = GetAppareilsByPkLogement(PkLogementCHAUFF, "");

                    if (AppareilsCHAUFF.Count > 0)
                    {
                        infosDepannages InfosDepannagesCHAUFF = GetInfosDepannagesByImmeuble(SessionID, PkUser, PkImmeubleCHAUFF, "PKOCCUPANT=" + PkOccupantCHAUFF, true);
                        foreach (infosDepannage infoCHAUFF in InfosDepannagesCHAUFF.ListeInfosDepannages)
                            InfosDepannages.ListeInfosDepannages.Add(infoCHAUFF);
                    }
                }
            }
            return InfosDepannages;

#else
            infosDepannages InfosDepannages = GetInfosDepannagesByImmeuble(SessionID, PkUser, PkImmeuble, ParamsFiltres, false);

            //verrueAjoutCET (si, eau, même occupant avec CET d'autre immeuble)
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            if (Pfiltres.GetParam("PKOCCUPANT") != "")
            {
                int pkOccupant = Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT"));
                int PkLogement = GetPkLogementByPkOccupant(pkOccupant);
                int nbEC = GetNbAppareils("L", PkLogement, 1);
                int nbEF = GetNbAppareils("L", PkLogement, 2);

                if (nbEC > 0 || nbEF > 0)
                {
                    // on est sur un logement EAU
                    //--> on recherche s'il y a un logement de REPART ou CET
                    string CodeLogeGestio = WS_DBUtils.utils_LER.DBSelect(
                    $@"SELECT codelogegestio FROM OCCUPANT WHERE PKOCCUPANT = {pkOccupant}");
                    int PkImmeubleCHAUFF = GetPKImmeubleAutre(PkImmeuble, pkOccupant);
                    int PkLogementCHAUFF = GetPkLogement(PkImmeubleCHAUFF, CodeLogeGestio);
                    int PkOccupantCHAUFF = GetPkOccupant(PkImmeubleCHAUFF, CodeLogeGestio);

                    List<appareil> AppareilsCHAUFF = GetAppareilsByPkLogement(PkLogementCHAUFF, "");

                    if (AppareilsCHAUFF.Count > 0)
                    {
                        infosDepannages InfosDepannagesCHAUFF = GetInfosDepannagesByImmeuble(SessionID, PkUser, PkImmeubleCHAUFF, "PKOCCUPANT=" + PkOccupantCHAUFF, true);
                        foreach (infosDepannage infoCHAUFF in InfosDepannagesCHAUFF.ListeInfosDepannages)
                            InfosDepannages.ListeInfosDepannages.Add(infoCHAUFF);
                    }
                }
            }
            return InfosDepannages;
#endif

        }

        /// <summary>
        /// Obtient les information de dépannages sur un immeuble 
        /// ancienne méthode GetInfosDepannagesByImmeuble renommée et appelée 2 fois si eau+CET pour même occupant dans 2 immeubles
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble">PK de l'immeuble</param>
        /// <param name="ParamsFiltres">Filtre pour n'avoir que les immeubles ayant le bon critère (si vide : pas de filtre) (paires clef=valeur)
        ///  valeur clef possible : 
        ///  PKOCCUPANT</param>
        /// <param name="AutreOccCET">Autre occupant CET</param>
        /// <returns></returns>
        static public infosDepannages GetInfosDepannagesByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres, bool AutreOccCET)
        {
            infosDepannages InfosDepannages = new infosDepannages();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosDepannages.Erreur = "incohérence de session";
                    return InfosDepannages;
                }

                if (!AutreOccCET)//si verrue autre occupant CET, on check rien
                {
                    user User = GetUserByPk(PkUser);
                    if (User.UserType == "O")
                    {
                        if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                        {
                            InfosDepannages.Erreur = "incohérence User, Occupant";
                            return InfosDepannages;
                        }
                    }
                    else
                    {
                        if (checkImmeuble(PkUser, PkImmeuble) == false)
                        {
                            InfosDepannages.Erreur = "incohérence user / immeuble";
                            return InfosDepannages;
                        }
                    }
                }

                string Query;
                if (Pfiltres.GetParam("PKOCCUPANT") != "")
                {
                    Query = $@"SELECT workordernumber, logement__r.pkler__c
                                FROM workorder
                                WHERE contactid in
                                (SELECT id FROM contact WHERE pkler__c = 'OCC_{Pfiltres.GetParam("PKOCCUPANT")}')";
                }
                else
                {
                    Query = $@"SELECT workordernumber, logement__r.pkler__c,
                                logement__r.batiment__r.numero__c, logement__r.batiment__r.adresse__c, logement__r.escalier__c
                                , logement__r.etage__c, logement__r.numeroordre__c, contact.name
                                FROM workorder
                                WHERE immeuble__r.pkler__c = 'IMM_{PkImmeuble}'";
                }

                DateTime date = DateTime.Today.AddDays(-720);

                Query += $@" AND workorder.createddate > = {date.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")} ";

                //2018-12-07 on exclut les en attente qui viennent du service relevé
                Query += $@" AND workorder.Maintenance__c = true";

                //Gestion recherche
                string AddtionnalFilter = "";
                string PKLOGEMENT = Pfiltres.GetParam("PKLOGEMENT").Trim();
                if (PKLOGEMENT.ToUpper() != "")
                {
                    AddtionnalFilter += $@"AND logement__r.pkler__c = {("LOG_" + PKLOGEMENT).QuotedStr()}";
                }

                if (AddtionnalFilter.Trim() != "")
                    Query += " " + AddtionnalFilter;

                DataRowCollection DrcDepan = WS_DBUtils.utils_SF.DBSelectTable(Query).Rows;
                foreach (DataRow DrDepan in DrcDepan)
                {
                    infosDepannage InfosDepan = new infosDepannage();

                    int PkLogement = -1;
                    try // pas élégant mais marre des Null pas checkés
                    {
                        PkLogement = Convert.ToInt32(DrDepan["_LOGEMENT__R_PKLER__C"].ToString().Replace("LOG_", ""));
                    }
                    catch { }

                    if (PkLogement >= 0) // le dépannage a un logement
                    {
                        DateTime DateInter;
                        try// on prend l'occupant à la date de l'inter
                        {
                            DateInter = Convert.ToDateTime(DrDepan["DATEINTER"]);
                        }
                        catch//si pas de date, occupant courant
                        {
                            DateInter = DateTime.Now;
                        }
                        InfosDepan.Logement = GetLogementByPk(PkLogement);
                        InfosDepan.Occupant = GetOccupantByPk(GetPkOccupantByPkLogement(PkLogement, DateInter));
                    }
                    else // sinon, les infos du logement / Occupant sont dans la table intervention
                    {
                        InfosDepan.Occupant.PkOccupant = -1;
                        InfosDepan.Logement.PkLogement = -1;
                        try
                        {
                            InfosDepan.Occupant.Nom = AnonymizeContactName(DrDepan["_Contact_Name"].ToString());
                            InfosDepan.Logement.NumBatiment = DrDepan["_logement__r_Batiment__r_Numero__c"].ToString();
                            InfosDepan.Logement.NumEscalier = DrDepan["_logement__r_Escalier__c"].ToString();
                            InfosDepan.Logement.NumEtage = DrDepan["_logement__r_Etage__c"].ToString();
                            InfosDepan.Logement.AdrBatiment = DrDepan["_logement__r_Batiment__r_Adresse__c"].ToString();
                            InfosDepan.Logement.NumOrdre = DrDepan["_logement__r_NumeroOrdre__c"].ToString();
                        }
                        catch
                        {
                        }

                    }

                    InfosDepan.Depannage = GetDepannageByWorkOrderNumber(DrDepan["_WorkOrderNumber"].ToString());
                    InfosDepannages.ListeInfosDepannages.Add(InfosDepan);
                }
            }
            catch (Exception Ex)
            {
                InfosDepannages.Erreur = Ex.Message;
            }

            return InfosDepannages;
        }
        /// <summary>
        /// Récupère le dépannage pour un workorder donné
        /// </summary>
        /// <param name="WorkOrderNumber">Numéro du workorder</param>
        /// <returns></returns>
        private static depannage GetDepannageByWorkOrderNumber(string WorkOrderNumber)
        {
            string Query = $@"SELECT status, compterenduintervention__c
                            , (SELECT id, tolabel(status), duedate, schedendtime, schedstarttime FROM serviceappointments)
                            , (SELECT tolabel(status), categorie__c, worktype.name, emplacement__c, tolabel(motifexecution__c), tolabel(motifnonexecution__c)
                            , asset.pkler__c, asset.serialnumber, asset.moduleradio__c, asset.typefluide__c FROM workorderlineitems)
                            FROM workorder
                            WHERE workordernumber = {WorkOrderNumber.QuotedStr()} ";

            DataTable dtWorkorder = WS_DBUtils.utils_SF.DBSelectTable(Query);
            DataRow DrDepan = dtWorkorder.Rows[0];
            depannage Depan = new depannage();

            //DATEINTER
            DateTime dateInter = new DateTime();

            if (DrDepan.Table.Columns.IndexOf("_ServiceAppointments_records") > -1)
            {
                DataTable sapps = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(DrDepan["_ServiceAppointments_records"].ToString());
                foreach (DataRow sapp in sapps.Rows)
                {
                    if ((sapp["_SchedStartTime"] != DBNull.Value) &&
                        (sapp["_SchedStartTime"].ToString() != "") &&
                        (Array.IndexOf(new string[2] { "Attribué", "Terminé" }, sapp["_Status"].ToString()) > -1))
                        dateInter = Convert.ToDateTime(sapp["_SchedStartTime"].ToString());
                    else
                        dateInter = DateTime.MinValue;
                }
            }

            //MOTIF 
            string motifConcat = string.Empty;
            string CRInter = string.Empty;
            DataTable sappsMotifs = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(DrDepan["_WorkOrderLineItems_records"].ToString());
            int i = 0;
            foreach (DataRow motif in sappsMotifs.Rows)
            {
                i++;
                if ((motif["_WorkType_Name"] != DBNull.Value) && (motif["_WorkType_Name"].ToString() != ""))
                {
                    string typeFluide = string.Empty;
                    if (sappsMotifs.Columns.IndexOf("_Asset_TypeFluide__c") > -1)
                        switch (motif["_Asset_TypeFluide__c"].ToString())
                        {
                            case "Eau chaude":
                                typeFluide = "EC";
                                break;
                            case "Eau froide":
                                typeFluide = "EF";
                                break;
                            default:
                                typeFluide = "";
                                break;
                        }
                    string typeCpt = string.Empty;
                    if (sappsMotifs.Columns.IndexOf("_Categorie__c") > -1)
                    {
                        string pkCatMotif = motif["_Categorie__c"].ToString();

                        typeCpt = WS_DBUtils.utils_LER.DBSelect($@"SELECT value FROM dblists WHERE list = 'INTERVENTION_CAT_MOTIF' AND pkdblists = {pkCatMotif} ");

                    }

                    string serialNumber = string.Empty;
                    if (sappsMotifs.Columns.IndexOf("_Asset_SerialNumber") > -1)
                        serialNumber = motif["_Asset_SerialNumber"].ToString();
                    string moduleRadio = string.Empty;
                    if (sappsMotifs.Columns.IndexOf("_Asset_ModuleRadio__c") > -1)
                        moduleRadio = motif["_Asset_ModuleRadio__c"].ToString();
                    string emplacement = string.Empty;
                    if (sappsMotifs.Columns.IndexOf("_Emplacement__c") > -1)
                        emplacement = motif["_Emplacement__c"].ToString();

                    motifConcat += i + " - " + typeCpt + " : " + serialNumber
                                    + " (" + moduleRadio + ")"
                                    + " (" + typeFluide + ")"
                                    + " (" + emplacement + ") : "
                                    + motif["_WorkType_Name"].ToString() + "\r\n";
                }

                if ((motif["_MotifExecution__c"] != DBNull.Value) && (motif["_MotifExecution__c"].ToString() != ""))
                    CRInter += i + " - " + motif["_MotifExecution__c"].ToString() + "\r\n";

                if ((motif["_MotifNonExecution__c"] != DBNull.Value) && (motif["_MotifNonExecution__c"].ToString() != ""))
                    CRInter += i + " - " + motif["_MotifNonExecution__c"].ToString() + "\r\n";
            }

            Depan.Date = dateInter.Date;
            Depan.WorkOrderNumber = WorkOrderNumber;
            Depan.Motif = motifConcat;
            Depan.MotifAbrege = GetMotifInter(motifConcat);
            Depan.Numero = WorkOrderNumber;
            Depan.Statut = dtWorkorder.Rows[0]["_Status"].ToString();
            Depan.StatutAbrege = GetResultInter(dtWorkorder.Rows[0]["_Status"].ToString());
            Depan.CompteRendu = CRInter;
            if ((dtWorkorder.Rows[0]["_CompteRenduIntervention__c"] != DBNull.Value) && (dtWorkorder.Rows[0]["_CompteRenduIntervention__c"].ToString() != ""))
                Depan.CompteRendu += "\r\n" + "Informations techniques détaillées : " + "\r\n" + dtWorkorder.Rows[0]["_CompteRenduIntervention__c"].ToString();

            return Depan;
        }
        /// <summary>
        /// Récupère le détail sur les dépannage d'un workorder
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="WorkOrderNumber">Numéro du workorder</param>
        /// <returns></returns>
        static public detailsDepannage GetDetailsDepannage(string SessionID, int PkUser, string WorkOrderNumber)//, int PkDepannage) // string WORKORDERNUMBER
        {
            detailsDepannage DetailsDepannage = new detailsDepannage();

            try
            {
                WS_DBUtils.utils_SF.DBOpen();
                DataTable dtResult = WS_DBUtils.utils_SF.DBSelectTable($@"SELECT immeuble__r.pkler__c FROM workorder WHERE workordernumber = {WorkOrderNumber.QuotedStr()}");

                int PkImmeuble = Convert.ToInt32(dtResult.Rows[0][0].ToString().Replace("IMM_", ""));

                if (session.checkSession(SessionID, PkUser) == false)
                {
                    DetailsDepannage.Erreur = "incohérence de session";
                    return DetailsDepannage;
                }

                else if (checkImmeuble(PkUser, PkImmeuble) == false)
                {
                    DetailsDepannage.Erreur = "incohérence user / immeuble";
                    return DetailsDepannage;
                }

                //TODO Check Depannage

                {
                    DetailsDepannage.InfosDepannage.Depannage = GetDepannageByWorkOrderNumber(WorkOrderNumber);
                    int PkLogement = -1;

                    try // pas élégant mais marre des Null pas checkés
                    {
                        PkLogement = Convert.ToInt32(WS_DBUtils.utils_SF.DBSelectTable($@"SELECT logement__r.pkler__c FROM workorder WHERE workordernumber = {WorkOrderNumber.QuotedStr()} ").Rows[0][0].ToString().Replace("LOG_", ""));
                    }
                    catch
                    {
                    }
                    if (PkLogement >= 0) // le dépannage a un logement
                    {
                        DateTime DateInter;
                        try// on prend l'occupant à la date de l'inter
                        {
                            DateInter = DetailsDepannage.InfosDepannage.Depannage.Date;
                            if (DateInter.Year <= 1980)
                                DateInter = DateTime.Now;
                        }
                        catch//si pas de date, occupant courant
                        {
                            DateInter = DateTime.Now;
                        }

                        DetailsDepannage.InfosDepannage.Logement = GetLogementByPk(PkLogement);
                        DetailsDepannage.InfosDepannage.Occupant = GetOccupantByPk(GetPkOccupantByPkLogement(PkLogement, DateInter));
                        // On Mets dans la liste les autres dépannagages de l'occupant
                        string QueryAutres = $@"SELECT WORKORDERNUMBER 
                                                    FROM workorder
                                                    WHERE contactid in
                                                    (SELECT id FROM contact WHERE pkler__c = 'OCC_{DetailsDepannage.InfosDepannage.Occupant.PkOccupant}')";

                        DataRowCollection DrcAutres = WS_DBUtils.utils_LER.DBSelectRows(QueryAutres);
                        foreach (DataRow DrAutre in DrcAutres)
                        {
                            depannage Depan = GetDepannageByWorkOrderNumber((DrAutre["_WORKORDERNUMBER"].ToString()));
                            if (Depan.WorkOrderNumber != DetailsDepannage.InfosDepannage.Depannage.WorkOrderNumber)
                                DetailsDepannage.ListeDepannagesOccupant.Add(Depan);
                        }
                    }
                    else // récup infos logement, occupant direcement dans Intervention
                    {
                        string QueryDepanSansLogt = $@"SELECT contact.name
                                                        , logement__r.batiment__r.numero__c, logement__r.batiment__r.adresse__c
                                                        logement__r.escalier__c, logement__r.etage__c, logement__r.numeroordre__c
                                                        FROM workorder
                                                        WHERE workorder = {WorkOrderNumber.QuotedStr()} ";
                        //TODO tester tout ça
                        DetailsDepannage.InfosDepannage.Occupant.PkOccupant = -1;
                        DetailsDepannage.InfosDepannage.Logement.PkLogement = -1;
                        try
                        {
                            DataRow DrDepan = WS_DBUtils.utils_SF.DBSelectTable(QueryDepanSansLogt).Rows[0];
                            if (DrDepan.Table.Columns.IndexOf("_Contact_Name") > -1)
                                DetailsDepannage.InfosDepannage.Occupant.Nom = WS_Common.AnonymizeContactName(DrDepan["_Contact_Name"].ToString());
                            DetailsDepannage.InfosDepannage.Logement.NumBatiment = DrDepan["_logement__r_Batiment__r_Numero__c"].ToString();
                            DetailsDepannage.InfosDepannage.Logement.NumEscalier = DrDepan["_logement__r_Escalier__c"].ToString();
                            DetailsDepannage.InfosDepannage.Logement.NumEtage = DrDepan["_logement__r_Etage__c"].ToString();
                            DetailsDepannage.InfosDepannage.Logement.AdrBatiment = DrDepan["_logement__r_Batiment__r_Adresse__c"].ToString();
                            DetailsDepannage.InfosDepannage.Logement.NumOrdre = DrDepan["_logement__r_NumeroOrdre__c"].ToString();
                        }
                        catch
                        {
                        }
                    }
                }
            }
            catch (Exception Ex)
            {
                DetailsDepannage.Erreur = Ex.Message;
            }

            return DetailsDepannage;
        }
        /// <summary>
        /// Otient le libellé du/des motif(s) de l'intervention
        /// </summary>
        /// <param name="Motif">Liste des motifs séparés par des ':' </param>
        /// <returns></returns>
        static private string GetMotifInter(string Motif)
        {
            string res = Motif;
            if (string.IsNullOrEmpty(res))
                return "";

            string[] items = Motif.Split(':');
            res = items[items.Length - 1].Trim();

            if (res.IndexOf("[") > 0)
                res = res.Substring(0, res.IndexOf("["));

            if (res == "Bloqué") return "Compteur bloqué";
            else if (res == "Illisible") return "Compteur illisible";
            else if (res == "Monté à l'envers") return "Compteur monté à l'envers";
            else if (res == "Tourne à l'envers (retour d'eau)") return "Compteur tourne à l'envers (retour d'eau)";
            else if (res == "A contrôler") return "Compteur à contrôler";
            else if (res == "Fuit") return "Compteur fuit";
            else if (res == "Cassé") return "Compteur cassé";
            else if (res == "A remplacer") return "Compteur à remplacer";
            res = res.Trim();
            return res;
        }
        /// <summary>
        /// Retourne le libellé pour un dépannage correspondant au statut passé en paramètre
        /// </summary>
        /// <param name="Statut">Statut de l'intervention</param>
        /// <returns></returns>
        static private string GetResultInter(string Statut)
        {
            string r = Statut;
            string[] tab = new string[4] { "clôturé", "absent", "problème technique", "facturé" };
            string[] tab2 = new string[4] { "Réalisé", "Absent", "Problème technique", "Réalisé" };

            for (int i = 0; i < tab.Length; i++)
                if (r.Contains(tab[i]))
                    return tab2[i];

            return "";
            //•	Résultat : Réalisé/Absent /Problème technique 
        }
        #endregion

        #region Logements
        /// <summary>
        /// Récupère les informations des logements d'un immeuble 
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté </param>
        /// <param name="PkImmeuble">N° d'immeuble</param>
        /// <param name="ParamsFiltres">Filtres pour n'avoir que les immeubles ayant le bon critère (si vide : pas de filtre)
        /// valeurs possibles cumulables (le séparateur est |)
        /// FUITES=O
        /// DEPANNAGES=O
        /// DYSFONCTIONNEMENTS=O
        /// ANOMALIES=O
        /// TICKETSINTER=O
        /// paires clef=valeur :
        /// FIELD_REFOCCUPANT : Référence de l'occupant
        /// FIELD_ALLFIELDS : Tous les champs
        /// FIELD_ADRESSE-CP-VILLE : Adresse de l'immeuble
        /// FIELD_NOM : Nom de l'occupant
        /// </param>
        /// <param name="ParamsInfos">
        /// Infos additionnelles demandées (si vide, aucune info additionnelle n'est retournée)
        /// valeurs possibles cumulables (le séparateur est |)
        /// NBAPPAREILS=O : on veut le nombre de compteurs
        /// NBLOGEMENTS=O : on veut le nombre de logements
        /// NBFUITES=O : on veut le nombre de fuites
        /// IMMEUBLE=O : on veut les informations de l'immeuble pour chaque logement
        /// NBDEPANNAGES=O : on veut le nombre de dépannages
        /// NBDYSFONCTIONNEMENTS=O : on veut le nombre d'alertes
        /// NBTICKETSINTER=O : on veut le nombre de tickets d'intervention
        /// NBANOMALIES=O : on veut le nombre d'anomalies</param>
        /// <returns></returns>
        static public infosLogements GetInfosLogements(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres, string ParamsInfos)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - logement remplace par web_logement
#if WS2
            infosLogements InfosLogts = new infosLogements();

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            ParamsString Pinfos = new ParamsString(ParamsInfos);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosLogts.Erreur = "incohérence de session";
                    return InfosLogts;
                }
                if (PkImmeuble >= 0) // on peut passer pkimmeuble = -1 pour la recherche logement danbs tous les immeubles
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosLogts.Erreur = "incohérence user / immeuble";
                        return InfosLogts;
                    }
                }

                user UserConnected = GetUserByPk(PkUser);

                if (UserConnected.UserType == "O")
                {
                    //if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    //{
                    InfosLogts.Erreur = "incohérence User, Occupant";
                    return InfosLogts;
                    //}
                }

                bool IsDemo = IsUserDemo(UserConnected);
                bool TicketsInterEnabled = CheckTicketsInterEnabled(SessionID, PkUser);

                DateTime DateJour = getLastDateIndex();
                DateTime DateCheckFuite = DateJour.AddDays(-1);
                //string codes_ano = "('91')";

                string Fields =
                    $@"SELECT DISTINCT web_immeuble.pkimmeuble, web_immeuble.cp, web_immeuble.ville, web_immeuble.adresse, web_immeuble.nom, 
                        web_immeuble.id, web_immeuble.adresse2, web_immeuble.adresse3, web_immeuble.actif, web_immeuble.codegestio, web_immeuble.telereleve,
                        web_immeuble.fkclienttop, 
                        web_immeuble.espaceclient_dateactivationocc, 
                        web_immeuble.noteoccupant, web_immeuble.espaceclient_showbillingocc,
                        web_logement.numbatiment AS numbatiment, web_logement.adrbatiment AS adrbatiment, 
                        web_logement.numescalier, web_logement.adresseesc AS adrescalier, 
                        web_logement.numetage, web_logement.numordre, web_logement.pklogement, web_logement.typelogement,
                        web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio,
                        web_logement.datearrivee, web_logement.datedepart,
                        web_logement.nbfuites, web_logement.nbsusfraudcli,
                        web_logement.nbdepannages, 
                        web_logement.nbef, web_logement.nbec, web_logement.nbrepart, web_logement.nbcet, web_logement.nbcapteur
                        ";
                //Nb Dépannages
                Fields += ", nbticketinter AS nbinter ";

                Fields += ", nbticketinter  AS nbticketinter ";

                //Nb Anomalies de conso
                Fields += ", web_logement.nbano_ec, web_logement.nbano_ef ";

                string QueryLogts = Fields +
                    $@" FROM web_immeuble, web_logement, web_compteur, web_occupant
                        WHERE web_immeuble.pkimmeuble = web_logement.fkimmeuble 
                            AND web_logement.pklogement = web_compteur.fklogement
                            AND web_occupant.fklogement = web_logement.pklogement
                            AND web_compteur.typecompteur='D'
                            AND SYSDATE between web_occupant.datearrivee AND web_occupant.datedepart
                            ";

                if (PkImmeuble > 0)
                    QueryLogts += $@" AND (web_immeuble.pkimmeuble = {PkImmeuble}) ";
                else
                    QueryLogts += $@" AND (web_immeuble.pkimmeuble in ( {GetQueryImmeubles("PKIMMEUBLE", "U", PkUser)})) ";

                //Gestion recherche
                string AddtionnalFilter = "";
                string REF = Pfiltres.GetParam("FIELD_REFOCCUPANT").Trim();
                if (REF.ToUpper() != "")
                    AddtionnalFilter += $@" AND web_occupant.codelogegestio= {REF.QuotedStr()} ";

                if (AddtionnalFilter.Trim() != "")
                    QueryLogts += " " + AddtionnalFilter;

                //Gestion recherche
                string AdditionnalFilter = "";

                if (Pfiltres.GetParam("FIELD_ALLFIELDS").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("web_occupant.codelogegestio|web_immeuble.adresse|web_immeuble.adresse2|web_immeuble.adresse3|web_immeuble.CP|web_immeuble.ville|web_occupant.nom|web_compteur.numeroserie", Pfiltres.GetParam("FIELD_ALLFIELDS").Trim())} ";

                if (Pfiltres.GetParam("FIELD_REFOCCUPANT").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("web_occupant.codelogegestio", Pfiltres.GetParam("FIELD_REFOCCUPANT").Trim())} ";

                if (Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("web_immeuble.adresse|web_immeuble.adresse2|web_immeuble.adresse3|web_immeuble.cp|web_immeuble.ville", Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim())} ";

                if (Pfiltres.GetParam("FIELD_NOM").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("web_occupant.nom", Pfiltres.GetParam("FIELD_NOM").Trim())} ";

                if (AdditionnalFilter.Trim() != "")
                    QueryLogts += " " + AdditionnalFilter;

                QueryLogts += $@" order by web_logement.numbatiment, web_logement.numescalier, web_logement.numetage, web_logement.numordre ";

                DataRowCollection rowsLogts = WS_DBUtils.utils_LER.DBSelectRows(QueryLogts);

                bool HasNoteOccupant = false;
                bool HasDecompteOccupant = false;
                DateTime DateActivationCli = DateTime.MinValue;
                DateTime DateActivationOcc = DateTime.MinValue;
                string espaceclient_gestion = string.Empty;
                try
                {
                    DataRow c = WS_DBUtils.utils_LER.DBSelectRow(
                        $@"SELECT noteoccupant, espaceclient_dateactivationcli, espaceclient_dateactivationocc, 
                            espaceclient_showbillingocc, espaceclient_gestion
                        FROM web_client 
                        WHERE pkclient = {rowsLogts[0]["FKCLIENTTOP"]}");
                    espaceclient_gestion = c["ESPACECLIENT_GESTION"].ToString();
                    HasNoteOccupant = c["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                    HasDecompteOccupant = c["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                    if (c["ESPACECLIENT_DATEACTIVATIONCLI"] != DBNull.Value)
                        DateActivationCli = Convert.ToDateTime(c["ESPACECLIENT_DATEACTIVATIONCLI"].ToString());
                    if (c["ESPACECLIENT_DATEACTIVATIONOCC"] != DBNull.Value)
                        DateActivationOcc = Convert.ToDateTime(c["ESPACECLIENT_DATEACTIVATIONOCC"].ToString());
                }
                catch { }

                foreach (DataRow DrLogt in rowsLogts)
                {
                    infosLogement InfosLogt = new infosLogement();
                    int PkLogement = Convert.ToInt32(DrLogt["PKLOGEMENT"].ToString());
                    InfosLogt.Logement.PkLogement = PkLogement;
                    InfosLogt.Logement.NumBatiment = DrLogt["NUMBATIMENT"].ToString();
                    InfosLogt.Logement.AdrBatiment = DrLogt["ADRBATIMENT"].ToString();
                    InfosLogt.Logement.NumEscalier = DrLogt["NUMESCALIER"].ToString();
                    InfosLogt.Logement.AdrEscalier = DrLogt["ADRESCALIER"].ToString();
                    InfosLogt.Logement.NumEtage = DrLogt["NUMETAGE"].ToString();
                    InfosLogt.Logement.NumOrdre = DrLogt["NUMORDRE"].ToString();
                    InfosLogt.Logement.Type = DrLogt["TYPELOGEMENT"].ToString();

                    InfosLogt.Occupant.PkOccupant = Convert.ToInt32(DrLogt["PKOCCUPANT"]);
                    InfosLogt.Occupant.Nom = DrLogt["NOM"].ToString();
                    InfosLogt.Occupant.Ref = DrLogt["CODELOGEGESTIO"].ToString();
                    InfosLogt.Occupant.DateArrivee = Convert.ToDateTime(DrLogt["DATEARRIVEE"]);
                    InfosLogt.Occupant.DateDepart = Convert.ToDateTime(DrLogt["DATEDEPART"]);

                    // gestion du filtre
                    bool Exclue = false;

                    // récup immeuble courant
                    if (Pinfos.GetParam("IMMEUBLE").ToUpper() != "N")
                    {
                        InfosLogt.Immeuble = GetImmeubleByRow(DrLogt);
                        if (espaceclient_gestion.ToLower() == "client")
                        {
                            InfosLogt.Immeuble.HasNoteOccupant = HasNoteOccupant;
                            InfosLogt.Immeuble.HasDecompteOccupant = HasDecompteOccupant;
                            InfosLogt.Immeuble.DateActivationClient = DateActivationCli;
                            InfosLogt.Immeuble.DateActivationOccupant = DateActivationOcc;
                        }

                        else // gestion à l'immeuble
                        {
                            InfosLogt.Immeuble.HasNoteOccupant = DrLogt["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                            InfosLogt.Immeuble.HasDecompteOccupant = DrLogt["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false); ;
                            InfosLogt.Immeuble.DateActivationClient = DateActivationCli;
                            InfosLogt.Immeuble.DateActivationOccupant = DrLogt["ESPACECLIENT_DATEACTIVATIONOCC"].ToString().ToDateTime();
                        }
                    }
                    //To do verif util dans WS?
                    //A optimiser!!!!!!
                    //List<appareil> Appareils = GetAppareilsByPkLogement(PkLogement, "");
                    //InfosLogt.ListeAppareils.AddRange(Appareils);

                    InfosLogt.NbCompteursEF = DrLogt["nbec"].ToString().ToInt32OrDefault(-1);
                    InfosLogt.NbCompteursEF = DrLogt["nbef"].ToString().ToInt32OrDefault(-1);
                    InfosLogt.NbCompteursRepart = DrLogt["nbrepart"].ToString().ToInt32OrDefault(-1);
                    InfosLogt.NbCompteursCET = DrLogt["nbcet"].ToString().ToInt32OrDefault(-1);
                    InfosLogt.NbCompteursCapteur = DrLogt["nbcapteur"].ToString().ToInt32OrDefault(-1);
                    InfosLogt.NbAppareils = InfosLogt.NbCompteursEC + InfosLogt.NbCompteursEF + InfosLogt.NbCompteursRepart + InfosLogt.NbCompteursCET;

                    // Infos Fuites
                    int NbFuites = -1;
                    InfosLogt.NbFuites = DrLogt["NBFUITES"].ToString().ToInt32OrDefault(0); ;

                    // Infos Depannages
                    int NbDepannages = -1;
                    InfosLogt.NbDepannages = DrLogt["NBDEPANNAGES"].ToString().ToInt32OrDefault(-1);

                    //*** Tickets inter
                    InfosLogt.NbTicketsInter = DrLogt["NBTICKETINTER"].ToString().ToInt32OrDefault(-1);

                    // droits
                    InfosLogt.TicketsInterEnabled = TicketsInterEnabled;

                    //// Infos Dysfonctionnements
                    int NbDysfonctionnements = 0;
                    InfosLogt.NbDysfonctionnements = DrLogt["NBSUSFRAUDCLI"].ToString().ToInt32OrDefault(0); ;

                    //// Infos Anomalies
                    int NbAnomalies = -1;
                    NbAnomalies = DrLogt["NBANO_EC"].ToString().ToInt32OrDefault(0) + DrLogt["NBANO_EF"].ToString().ToInt32OrDefault(0);
                    InfosLogt.NbAnomalies = NbAnomalies;

                    // gestion du filtre:
                    if (Pfiltres.GetParam("FUITES").ToUpper() == "O" && NbFuites <= 0)
                        Exclue = true;

                    if (Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O" && NbDepannages <= 0)
                        Exclue = true;

                    if (Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O" && NbDysfonctionnements <= 0)
                        Exclue = true;

                    if (Pfiltres.GetParam("ANOMALIES").ToUpper() == "O" && NbAnomalies <= 0)
                        Exclue = true;

                    if (Exclue == false)
                        InfosLogts.ListeInfosLogements.Add(InfosLogt);
                }
            }

            catch (Exception Ex)
            {
                InfosLogts.Erreur = Ex.Message;
            }

            return InfosLogts;
#else
            infosLogements InfosLogts = new infosLogements();

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);
            ParamsString Pinfos = new ParamsString(ParamsInfos);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosLogts.Erreur = "incohérence de session";
                    return InfosLogts;
                }
                if (PkImmeuble >= 0) // on peut passer pkimmeuble = -1 pour la recherche logement danbs tous les immeubles
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosLogts.Erreur = "incohérence user / immeuble";
                        return InfosLogts;
                    }
                }

                user UserConnected = GetUserByPk(PkUser);

                if (UserConnected.UserType == "O")
                {
                    //if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    //{
                    InfosLogts.Erreur = "incohérence User, Occupant";
                    return InfosLogts;
                    //}
                }

                bool IsDemo = IsUserDemo(UserConnected);
                bool TicketsInterEnabled = CheckTicketsInterEnabled(SessionID, PkUser);

                DateTime DateJour = getLastDateIndex();
                DateTime DateCheckFuite = DateJour.AddDays(-1);
                string codes_ano = "('91')";

                string Fields =
                    $@"SELECT DISTINCT pkimmeuble, immeuble.cp, immeuble.ville, immeuble.adresse, immeuble.nom, 
immeuble.id, immeuble.adresse2, immeuble.adresse3, immeuble.actif, immeuble.codegestio, immeuble.telereleve,
immeuble.fkclienttop, 
immeuble.espaceclient_dateactivationocc, 
immeuble.noteoccupant, immeuble.espaceclient_showbillingocc,

batiment.id as numbatiment, batiment.adresse as adrbatiment, 
escalier.numescalier, escalier.adresseesc as adrescalier, 
logement.numetage, logement.numordre, logement.pklogement, logement.typelogement,
occupant.pkoccupant, occupant.nom as nom_occupant, occupant.codelogegestio as codelogegestio_occupant,
occupant.datearrivee, occupant.datedepart";
                //Nb Dépannages
                if (Pinfos.GetParam("NBDEPANNAGES").ToUpper() != "N" || Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O")
                    Fields += ", 0 as NBINTER ";

                Fields += ", 0  as NBTICKETINTER ";

                //Nb Anomalies de conso
                if (Pinfos.GetParam("NBANOMALIES").ToUpper() != "N" || Pfiltres.GetParam("ANOMALIES").ToUpper() == "O")
                    Fields += $@", (SELECT count(*)
                                        FROM indexconso, compteur, releve
                                        WHERE ((code1 in {codes_ano} 
                                            ) or (code2 in {codes_ano} 
                                            ) or (code3 in {codes_ano} 
                                            ) or (code4 in {codes_ano} 
                                            ))
                                            AND releve.pkreleve = indexconso.fkreleve
                                            AND datereleve=(SELECT max(datereleve)
                                        FROM releve, immeuble, batiment, logement l
                                        WHERE releve.fkimmeuble =pkimmeuble AND datecloture is not null AND datecloture<= {DateTime.Now.QuotedStr()} 
                                            AND  batiment.fkimmeuble = immeuble.pkimmeuble
                                            AND (logement.fkbatiment = batiment.pkbatiment)
                                            AND l.pklogement = logement.pklogement)
                                            AND (indexconso.fkcompteur=compteur.pkcompteur)
                                            AND (compteur.fklogement = logement.pklogement) ) as nbano,";

                Fields += $@"(SELECT LISTAGG(PKCOMPTEUR, ';') WITHIN GROUP (ORDER BY PKCOMPTEUR) 
 FROM COMPTEUR 
 WHERE FKLOGEMENT=PKLOGEMENT
 AND NVL(COMPTEUR.ACTIF, 'O') <> 'N'
 AND COMPTEUR.DATEINSTALL <= {DateCheckFuite.Date.QuotedStr()}
 AND (COMPTEUR.DATEDEPOSE >= {DateCheckFuite.Date.QuotedStr()} OR COMPTEUR.DATEDEPOSE IS NULL)) PKS_COMPTEUR ";

                string QueryLogts = Fields +
                    $@" FROM immeuble, batiment, escalier, logement, compteur, occupant
                        WHERE immeuble.pkimmeuble = batiment.fkimmeuble 
                            AND logement.fkbatiment = batiment.pkbatiment 
                            AND logement.fkescalier = escalier.pkescalier 
                            AND logement.pklogement = compteur.fklogement
                            AND compteur.typecompteur='D'
                            AND (occupant.fklogement = logement.pklogement)
                            AND SYSDATE between occupant.datearrivee AND occupant.datedepart
                            AND occupant.fklogement = logement.pklogement ";

                if (PkImmeuble > 0)
                    QueryLogts += $@" AND (batiment.fkimmeuble = {PkImmeuble}) ";
                else
                    QueryLogts += $@" AND (batiment.fkimmeuble in ( {GetQueryImmeubles("PKIMMEUBLE", "U", PkUser)})) ";

                //Gestion recherche
                string AddtionnalFilter = "";
                string REF = Pfiltres.GetParam("FIELD_REFOCCUPANT").Trim();
                if (REF.ToUpper() != "")
                    AddtionnalFilter += $@" AND occupant.codelogegestio= {REF.QuotedStr()} ";

                if (AddtionnalFilter.Trim() != "")
                    QueryLogts += " " + AddtionnalFilter;

                //Gestion recherche
                string AdditionnalFilter = "";

                if (Pfiltres.GetParam("FIELD_ALLFIELDS").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("OCCUPANT.CODELOGEGESTIO|IMMEUBLE.ADRESSE|IMMEUBLE.ADRESSE2|IMMEUBLE.ADRESSE3|IMMEUBLE.CP|IMMEUBLE.VILLE|OCCUPANT.NOM|COMPTEUR.NUMEROSERIE", Pfiltres.GetParam("FIELD_ALLFIELDS").Trim())} ";

                if (Pfiltres.GetParam("FIELD_REFOCCUPANT").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("OCCUPANT.CODELOGEGESTIO", Pfiltres.GetParam("FIELD_REFOCCUPANT").Trim())} ";

                if (Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("IMMEUBLE.ADRESSE|IMMEUBLE.ADRESSE2|IMMEUBLE.ADRESSE3|IMMEUBLE.CP|IMMEUBLE.VILLE", Pfiltres.GetParam("FIELD_ADRESSE-CP-VILLE").Trim())} ";

                if (Pfiltres.GetParam("FIELD_NOM").Trim() != "")
                    AdditionnalFilter += $@" AND {GetFtxtFilter("OCCUPANT.NOM", Pfiltres.GetParam("FIELD_NOM").Trim())} ";

                if (AdditionnalFilter.Trim() != "")
                    QueryLogts += " " + AdditionnalFilter;

                QueryLogts += $@" order by numbatiment, escalier.numescalier, logement.numetage, logement.numordre ";

                DataRowCollection rowsLogts = WS_DBUtils.utils_LER.DBSelectRows(QueryLogts);

                DataTable dtDepannages = GetDepannages("I", PkImmeuble, true);

                // FUITES
                #region Where
                Dictionary<string, object> matchList4Fuites = new Dictionary<string, object>
                            {
                                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, DateCheckFuite.Date },
                                { Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT, "O" },
                                { Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK, PkImmeuble }
                            };
                var match4Fuites = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4Fuites);
                #endregion
                #region Select
                Dictionary<string, object> projectDic4Fuites = new Dictionary<string, object>
                        {
                             { "PK", "$_id"},
                             { "FKCOMPTEUR", "$" + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK}
                        };
                var project4Fuites = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic4Fuites);
                #endregion
                var pipeline4Fuites = new[] { match4Fuites, project4Fuites };
                DataTable dtFuites = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline4Fuites);

                // DYSFONCTIONNEMENTS
                #region Where
                Dictionary<string, object> matchList4Dys = new Dictionary<string, object>
                            {
                                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, DateCheckFuite.Date },
                                { Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK, PkImmeuble }
                            };
                var match4Dys = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4Dys);
                #endregion
                #region Select
                Dictionary<string, object> projectDic4Dys = new Dictionary<string, object>
                        {
                             { "PK", "$_id"},
                             { "FKCOMPTEUR", "$" + Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK},
                             { "NB_ALARMESTECH_WEB", "$" + Mongo_DBUtils.INDEXCONSOTCH.NB_ALARMESTECH_WEB},
                             { "SUSPFRAUDECLIENT", "$" + Mongo_DBUtils.INDEXCONSOTCH.SUSPFRAUDECLIENT}
                        };
                var project4Dys = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic4Dys);
                #endregion
                var pipeline4Dys = new[] { match4Dys, project4Dys };
                DataTable dtDys = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline4Dys);

                bool HasNoteOccupant = false;
                bool HasDecompteOccupant = false;
                DateTime DateActivationCli = DateTime.MinValue;
                DateTime DateActivationOcc = DateTime.MinValue;
                string espaceclient_gestion = string.Empty;
                try
                {
                    DataRow c = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT noteoccupant, espaceclient_dateactivationcli, espaceclient_dateactivationocc, 
espaceclient_showbillingocc, espaceclient_gestion
FROM client 
WHERE pkclient = {rowsLogts[0]["FKCLIENTTOP"]}");
                    espaceclient_gestion = c["ESPACECLIENT_GESTION"].ToString();
                    HasNoteOccupant = c["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                    HasDecompteOccupant = c["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false);
                    if (c["ESPACECLIENT_DATEACTIVATIONCLI"] != DBNull.Value)
                        DateActivationCli = Convert.ToDateTime(c["ESPACECLIENT_DATEACTIVATIONCLI"].ToString());
                    if (c["ESPACECLIENT_DATEACTIVATIONOCC"] != DBNull.Value)
                        DateActivationOcc = Convert.ToDateTime(c["ESPACECLIENT_DATEACTIVATIONOCC"].ToString());
                }
                catch { }

                foreach (DataRow DrLogt in rowsLogts)
                {
                    infosLogement InfosLogt = new infosLogement();
                    int PkLogement = Convert.ToInt32(DrLogt["PKLOGEMENT"].ToString());
                    InfosLogt.Logement.PkLogement = PkLogement;
                    InfosLogt.Logement.NumBatiment = DrLogt["NUMBATIMENT"].ToString();
                    InfosLogt.Logement.AdrBatiment = DrLogt["ADRBATIMENT"].ToString();
                    InfosLogt.Logement.NumEscalier = DrLogt["NUMESCALIER"].ToString();
                    InfosLogt.Logement.AdrEscalier = DrLogt["ADRESCALIER"].ToString();
                    InfosLogt.Logement.NumEtage = DrLogt["NUMETAGE"].ToString();
                    InfosLogt.Logement.NumOrdre = DrLogt["NUMORDRE"].ToString();
                    InfosLogt.Logement.Type = DrLogt["TYPELOGEMENT"].ToString();

                    InfosLogt.Occupant.PkOccupant = Convert.ToInt32(DrLogt["PKOCCUPANT"]);
                    InfosLogt.Occupant.Nom = DrLogt["NOM_OCCUPANT"].ToString();
                    InfosLogt.Occupant.Ref = DrLogt["CODELOGEGESTIO_OCCUPANT"].ToString();
                    InfosLogt.Occupant.DateArrivee = Convert.ToDateTime(DrLogt["DATEARRIVEE"]);
                    InfosLogt.Occupant.DateDepart = Convert.ToDateTime(DrLogt["DATEDEPART"]);

                    // gestion du filtre
                    bool Exclue = false;

                    // récup immeuble courant
                    if (Pinfos.GetParam("IMMEUBLE").ToUpper() != "N")
                    {
                        InfosLogt.Immeuble = GetImmeubleByRow(DrLogt);
                        if (espaceclient_gestion.ToLower() == "client")
                        {
                            InfosLogt.Immeuble.HasNoteOccupant = HasNoteOccupant;
                            InfosLogt.Immeuble.HasDecompteOccupant = HasDecompteOccupant;
                            InfosLogt.Immeuble.DateActivationClient = DateActivationCli;
                            InfosLogt.Immeuble.DateActivationOccupant = DateActivationOcc;
                        }

                        else // gestion à l'immeuble
                        {
                            InfosLogt.Immeuble.HasNoteOccupant = DrLogt["NOTEOCCUPANT"].ToString().ToBooleanOrDefault(false);
                            InfosLogt.Immeuble.HasDecompteOccupant = DrLogt["ESPACECLIENT_SHOWBILLINGOCC"].ToString().ToBooleanOrDefault(false); ;
                            InfosLogt.Immeuble.DateActivationClient = DateActivationCli;
                            InfosLogt.Immeuble.DateActivationOccupant = DrLogt["ESPACECLIENT_DATEACTIVATIONOCC"].ToString().ToDateTime();
                        }
                    }

                    List<appareil> Appareils = GetAppareilsByPkLogement(PkLogement, "");
                    InfosLogt.ListeAppareils.AddRange(Appareils);

                    InfosLogt.NbCompteursEC = Appareils.Count(x => x.TypeAppareil.ToUpper() == "EC");
                    InfosLogt.NbCompteursEF = Appareils.Count(x => x.TypeAppareil.ToUpper() == "EF");
                    InfosLogt.NbCompteursRepart = Appareils.Count(x => x.TypeAppareil.ToUpper() == "REPART");
                    InfosLogt.NbCompteursCET = Appareils.Count(x => x.TypeAppareil.ToUpper() == "CET");
                    InfosLogt.NbCompteursCapteur = Appareils.Count(x => x.TypeAppareil.ToUpper() == "CAPTEUR");//ne sera pas compté dans appareils
                    InfosLogt.NbAppareils = InfosLogt.NbCompteursEC + InfosLogt.NbCompteursEF + InfosLogt.NbCompteursRepart + InfosLogt.NbCompteursCET;

                    // Infos Fuites
                    int NbFuites = -1;

                    List<int> appareils = new List<int>();
                    if (Pinfos.GetParam("NBFUITES").ToUpper() != "N" || Pfiltres.GetParam("FUITES").ToUpper() == "O" || Pinfos.GetParam("NBDYSFONCTIONNEMENTS").ToUpper() == "O" || Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O")
                    {
                        if (DrLogt["PKS_COMPTEUR"] != DBNull.Value && DrLogt["PKS_COMPTEUR"].ToString() != "")
                            appareils = Array.ConvertAll(DrLogt["PKS_COMPTEUR"].ToString().Split(';'), int.Parse).ToList();
                    }

                    if (Pinfos.GetParam("NBFUITES").ToUpper() != "N" || Pfiltres.GetParam("FUITES").ToUpper() == "O")
                    {
                        if (appareils.Count > 0)
                            NbFuites = dtFuites.Select("FKCOMPTEUR in (" + string.Join(",", appareils.ToArray()) + ")").Count();
                        else
                            NbFuites = 0;

                    }
                    InfosLogt.NbFuites = NbFuites;

                    // Infos Depannages
                    int NbDepannages = -1;
                    if (Pinfos.GetParam("NBDEPANNAGES").ToUpper() != "N" || Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O")
                    {
                        if (dtDepannages.Columns.IndexOf("_LOGEMENT__R_PKLER__C") > -1)
                            NbDepannages = dtDepannages.Select("_LOGEMENT__R_PKLER__C =  'LOG_" + PkLogement + "'").Count();
                    }
                    InfosLogt.NbDepannages = NbDepannages;

                    //*** Tickets inter
                    int NbTicketsInter = -1;
                    if (Pinfos.GetParam("NBTICKETSINTER").ToUpper() != "N" || Pfiltres.GetParam("TICKETSINTER").ToUpper() == "O")
                    {
                        //NbDepannages = GetNbDepannages("L", PkLogement);
                        NbTicketsInter = Convert.ToInt32(DrLogt["NBTICKETINTER"]);
                    }
                    InfosLogt.NbTicketsInter = NbTicketsInter;

                    // droits
                    InfosLogt.TicketsInterEnabled = TicketsInterEnabled;

                    //// Infos Dysfonctionnements
                    int NbDysfonctionnements = -1;
                    if (Pinfos.GetParam("NBDYSFONCTIONNEMENTS").ToUpper() == "O" || Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O")
                    {
                        if (appareils.Count > 0)
                        {
                            try
                            {
                                NbDysfonctionnements = dtDys.Select("FKCOMPTEUR in (" + string.Join(",", appareils.ToArray()) + ")").Sum(dys => Convert.ToInt32(dys["NB_ALARMESTECH_WEB"]));
                                NbDysfonctionnements -= dtDys.Select("SUSPFRAUDECLIENT='O' AND FKCOMPTEUR in (" + string.Join(",", appareils.ToArray()) + ")").Count();
                            }
                            catch { }
                        }
                        else
                            NbDysfonctionnements = 0;
                    }
                    InfosLogt.NbDysfonctionnements = NbDysfonctionnements;

                    //// Infos Anomalies
                    int NbAnomalies = -1;
                    if (Pinfos.GetParam("NBANOMALIES").ToUpper() != "N" || Pfiltres.GetParam("ANOMALIES").ToUpper() == "O")
                    {
                        //NbAnomalies = GetNbAnomalies("L", PkLogement);
                        NbAnomalies = Convert.ToInt32(DrLogt["NBANO"]);
                    }
                    InfosLogt.NbAnomalies = NbAnomalies;

                    // gestion du filtre:
                    if (Pfiltres.GetParam("FUITES").ToUpper() == "O" && NbFuites <= 0)
                        Exclue = true;

                    if (Pfiltres.GetParam("DEPANNAGES").ToUpper() == "O" && NbDepannages <= 0)
                        Exclue = true;

                    if (Pfiltres.GetParam("DYSFONCTIONNEMENTS").ToUpper() == "O" && NbDysfonctionnements <= 0)
                        Exclue = true;

                    if (Pfiltres.GetParam("ANOMALIES").ToUpper() == "O" && NbAnomalies <= 0)
                        Exclue = true;

                    if (Exclue == false)
                        InfosLogts.ListeInfosLogements.Add(InfosLogt);
                }
            }

            catch (Exception Ex)
            {
                InfosLogts.Erreur = Ex.Message;
            }

            return InfosLogts;
#endif
        }
        /// <summary>
        /// Récupère le pk de l'occupant d'un logement à une date donnée
        /// </summary>
        /// <param name="PkLogement">PK logement</param>
        /// <param name="Date">Date de la reqûete</param>
        /// <returns></returns>
        private static int GetPkOccupantByPkLogement(int PkLogement, DateTime Date)
        {
            //WEBTODO :
            // - logement/occupant remplace par web_logement
#if WS2
            string Query = $@"SELECT web_occupant.pkoccupant
                                FROM web_logement, web_occupant
                                WHERE {Date.QuotedStr()} BETWEEN web_occupant.datearrivee AND web_occupant.datedepart
                                    AND web_occupant.fklogement = web_logement.pklogement
                                    AND web_logement.pklogement= {PkLogement} 
                                ORDER BY web_occupant.datearrivee DESC";
            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#else

            string Query = $@"SELECT pkoccupant
                                FROM
                                occupant, logement
                                WHERE (occupant.fklogement = logement.pklogement)
                                AND {Date.QuotedStr()} 
                                between datearrivee AND datedepart
                                AND occupant.fklogement= {PkLogement} 
                                order by datearrivee desc";
            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;

#endif

        }
        /// <summary>
        /// Récupère le pk du logement pour l'occupant actuel
        /// </summary>
        /// <param name="PkOccupant">PK de l'actuel occupant</param>
        /// <returns></returns>
        private static int GetPkLogementByPkOccupant(int PkOccupant)
        {
            //WEBTODO TODO :
            // - logement remplace par web_logement
#if WS2
            string Query = $@"SELECT pklogement
                        FROM web_logement, web_occupant
                        WHERE pkoccupant= {PkOccupant}
                            AND web_occupant.fklogement = web_logement.pklogement ";
            int Nb = -1;
            try
            {
                string Ret = WS_DBUtils.utils_LER.DBSelect(Query);
                Nb = int.Parse(Ret);
            }
            catch
            {
            }
            return Nb;
#else
            string Query =
$@"SELECT fklogement
FROM occupant
WHERE pkoccupant= {PkOccupant} ";
            return WS_DBUtils.utils_LER.DBSelect(Query).ToInt32OrDefault(-1);
#endif
        }
        /// <summary>
        /// Récupère les informations de l'occupant
        /// </summary>
        /// <param name="PkOccupant">PK Occupant</param>
        /// <returns></returns>
        private static occupant GetOccupantByPk(int PkOccupant)
        {
            //WEBTODO :
            // - occupant remplace par web_occupant
#if WS2
            string Query = $@" SELECT web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio,
                                    web_occupant.datearrivee, web_occupant.datedepart 
                                FROM web_occupant
                                WHERE web_occupant.pkoccupant= {PkOccupant} ";

            DataRow drOccupant = WS_DBUtils.utils_LER.DBSelectRow(Query);
            occupant Occupant = new occupant();
            try
            {
                Occupant.PkOccupant = Convert.ToInt32(drOccupant["PKOCCUPANT"].ToString());
                Occupant.Nom = AnonymizeContactName(drOccupant["NOM"].ToString());
                Occupant.Ref = drOccupant["CODELOGEGESTIO"].ToString();
                Occupant.DateArrivee = Convert.ToDateTime(drOccupant["DATEARRIVEE"]);
                Occupant.DateDepart = Convert.ToDateTime(drOccupant["DATEDEPART"]);
            }
            catch
            {

            }
            return Occupant;
#else
            string Query = $@" SELECT PKOCCUPANT, OCCUPANT.NOM, OCCUPANT.CODELOGEGESTIO, DATEARRIVEE, DATEDEPART 
                                FROM
                                occupant
                                WHERE pkoccupant= {PkOccupant} ";

            DataRow drOccupant = WS_DBUtils.utils_LER.DBSelectRow(Query);
            occupant Occupant = new occupant();
            try
            {
                Occupant.PkOccupant = Convert.ToInt32(drOccupant["PKOCCUPANT"].ToString());
                Occupant.Nom = AnonymizeContactName(drOccupant["NOM"].ToString());
                Occupant.Ref = drOccupant["CODELOGEGESTIO"].ToString();
                Occupant.DateArrivee = Convert.ToDateTime(drOccupant["DATEARRIVEE"]);
                Occupant.DateDepart = Convert.ToDateTime(drOccupant["DATEDEPART"]);
            }
            catch
            {

            }
            return Occupant;
#endif
        }
        /// <summary>
        /// Obtient les informations sur le logement en fonction de son pk
        /// </summary>
        /// <param name="PkLogement">Pk Logement</param>
        /// <returns></returns>
        private static logement GetLogementByPk(int PkLogement)
        {
            //WEBTODO :
            // - logement remplace par web_logement
#if WS2
            logement Logt = new logement();
            try
            {
                string Query = $@"SELECT web_logement.numbatiment AS numbatiment, web_logement.adrbatiment AS adrbatiment,
                                    web_logement.numescalier, web_logement.adresseesc AS adrescalier,
                                    web_logement.numetage, web_logement.numordre, web_logement.pklogement, 
                                    web_logement.typelogement
                                FROM web_logement
                                WHERE fklogement= {PkLogement} ";
                DataRow DrLogt = WS_DBUtils.utils_LER.DBSelectRow(Query);
                Logt.PkLogement = PkLogement;
                Logt.NumBatiment = DrLogt["NUMBATIMENT"].ToString();
                Logt.AdrBatiment = DrLogt["ADRBATIMENT"].ToString();
                Logt.NumEscalier = DrLogt["NUMESCALIER"].ToString();
                Logt.AdrEscalier = DrLogt["ADRESCALIER"].ToString();
                Logt.NumEtage = DrLogt["NUMETAGE"].ToString();
                Logt.NumOrdre = DrLogt["NUMORDRE"].ToString();
                Logt.Type = DrLogt["TYPELOGEMENT"].ToString();
            }
            catch
            {
            }
            return Logt;
#else
            logement Logt = new logement();
            try
            {
                string Query = $@"SELECT batiment.id as numbatiment, batiment.adresse as adrbatiment, escalier.numescalier, escalier.adresseesc as adrescalier, logement.numetage, logement.numordre, logement.pklogement, logement.typelogement
                                    FROM batiment, escalier, logement
                                    WHERE logement.fkbatiment = batiment.pkbatiment
                                    AND logement.fkescalier = escalier.pkescalier
                                    AND pklogement= {PkLogement} ";
                DataRow DrLogt = WS_DBUtils.utils_LER.DBSelectRow(Query);
                Logt.PkLogement = PkLogement;
                Logt.NumBatiment = DrLogt["NUMBATIMENT"].ToString();
                Logt.AdrBatiment = DrLogt["ADRBATIMENT"].ToString();
                Logt.NumEscalier = DrLogt["NUMESCALIER"].ToString();
                Logt.AdrEscalier = DrLogt["ADRESCALIER"].ToString();
                Logt.NumEtage = DrLogt["NUMETAGE"].ToString();
                Logt.NumOrdre = DrLogt["NUMORDRE"].ToString();
                Logt.Type = DrLogt["TYPELOGEMENT"].ToString();
            }
            catch
            {
            }
            return Logt;
#endif
        }

        /// <summary>
        /// Retourne un objet logement initialisé avec les informations provenant d'un datarow
        /// </summary>
        /// <param name="DrLogt">Ligne de données</param>
        /// <returns>Retourne un objet logement</returns>
        private static logement GetLogementByRow(DataRow DrLogt)
        {
            logement lgt = new logement
            {
                PkLogement = DrLogt["PKLOGEMENT"].ToString().ToInt32OrDefault(-1),
                NumBatiment = DrLogt["NUMBATIMENT"].ToString(),
                AdrBatiment = DrLogt["ADRBATIMENT"].ToString(),
                NumEscalier = DrLogt["NUMESCALIER"].ToString(),
                AdrEscalier = DrLogt["ADRESCALIER"].ToString(),
                NumEtage = DrLogt["NUMETAGE"].ToString(),
                NumOrdre = DrLogt["NUMORDRE"].ToString(),
                Type = DrLogt["TYPELOGEMENT"].ToString()
            };

            return lgt;
        }

        private static string GetTypeGestion(int pk, string pktype)
        {
            //WEBTODO :
            // - client remplace par web_client
            // - immeuble remplace par web_immeuble
#if WS2
            if (pktype == "C")
                return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT web_client.espaceclient_gestion FROM web_client where pkclient = {pk}");

            else if (pktype == "I")
                return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT web_client.espaceclient_gestion 
FROM web_client, web_immeuble 
where web_immeuble.fkclienttop = pkclient 
and web_immeuble.pkimmeuble = {pk}");

            return "";
#else
            if (pktype == "C")
                return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT client.espaceclient_gestion FROM client where pkclient = {pk}");

            else if (pktype == "I")
                return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT client.espaceclient_gestion 
FROM client, immeuble 
where immeuble.fkclienttop = pkclient 
and immeuble.pkimmeuble = {pk}");

            return "";
#endif
        }
        /// <summary>
        /// Récupère Pk Immeuble d'un occupant d'un autre immeuble du même client (pour eau + CET dans autre immeuble)
        /// </summary>
        /// <param name="PkImmeuble">PK de l'immeuble actuel</param>
        /// <param name="PkOccupant">Pk de l'occupant actuel</param>
        /// <returns></returns>
        private static int GetPKImmeubleAutre(int PkImmeuble, int PkOccupant)
        {
            //WEBTODO :
            // - occupant remplace par web_logement

#if WS2
            string espaceclient_gestion = GetTypeGestion(PkImmeuble, "I").ToLower();

            string sql;
            if (espaceclient_gestion == "client")
                sql =
$@"SELECT DISTINCT i2.pkimmeuble
FROM web_compteur, web_logement, web_occupant, web_immeuble, web_client,
    web_compteur c2, web_logement l2, web_occupant o2, web_immeuble i2
WHERE web_immeuble.pkimmeuble = {PkImmeuble}
    AND web_logement.fkimmeuble = web_immeuble.pkimmeuble
    AND web_occupant.fklogement = web_logement.pklogement
    AND web_occupant.datedepart > sysdate
    AND web_occupant.pkoccupant = {PkOccupant}
    AND web_immeuble.fkclienttop = web_client.pkclient
    AND web_client.espaceclient_unificationlogement = 'O'
    AND i2.fkclienttop = web_client.pkclient
    AND i2.pkimmeuble = l2.fkimmeuble
    AND o2.fklogement = l2.pklogement
    AND o2.datedepart > sysdate
    AND web_occupant.codelogegestio = o2.codelogegestio
    AND o2.pkoccupant != web_occupant.pkoccupant";

            else
                sql =
$@"SELECT DISTINCT i2.pkimmeuble
FROM web_compteur, web_logement, web_occupant, web_immeuble,
    web_compteur c2, web_logement l2, web_occupant o2, web_immeuble i2
WHERE web_logement.fkimmeuble = web_immeuble.pkimmeuble
    AND web_occupant.datedepart > sysdate
    AND web_immeuble.pkimmeuble = {PkImmeuble}
    AND web_occupant.pkoccupant = {PkOccupant}
    AND web_occupant.fklogement = web_logement.pklogement
    and (instr(''''||i2.id||'''', ''''||replace(replace(web_immeuble.immeubles_chauff, ' ', ''), ',', ''',''')||'''')>0 or 
         instr(''''||i2.id||'''', ''''||replace(replace(web_immeuble.immeubles_eau, ' ', ''), ',', ''',''')||'''')>0)

    AND l2.fkimmeuble = i2.pkimmeuble
    AND o2.datedepart > sysdate
    AND web_occupant.codelogegestio = o2.codelogegestio
    AND o2.pkoccupant != web_occupant.pkoccupant";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#else
            string espaceclient_gestion = GetTypeGestion(PkImmeuble, "I").ToLower();

            string sql;
            if (espaceclient_gestion == "client")
                sql =
$@"SELECT DISTINCT i2.pkimmeuble
FROM compteur, logement, occupant, batiment, immeuble, client,
compteur c2, logement l2, occupant o2, batiment b2, immeuble i2
WHERE immeuble.pkimmeuble = batiment.fkimmeuble
AND compteur.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND occupant.fklogement = logement.pklogement
AND occupant.datedepart > sysdate
AND immeuble.pkimmeuble = {PkImmeuble}
AND occupant.pkoccupant = {PkOccupant}
AND immeuble.fkclienttop = client.pkclient
AND client.espaceclient_unificationlogement = 'O'
AND i2.fkclienttop = client.pkclient
AND i2.pkimmeuble = b2.fkimmeuble
AND c2.fklogement = l2.pklogement
AND l2.fkbatiment = b2.pkbatiment
AND o2.fklogement = l2.pklogement
AND o2.datedepart > sysdate
AND occupant.codelogegestio = o2.codelogegestio
AND o2.pkoccupant != occupant.pkoccupant";

            else
                sql =
$@"SELECT DISTINCT i2.pkimmeuble
FROM compteur, logement, occupant, batiment, immeuble,
compteur c2, logement l2, occupant o2, batiment b2, immeuble i2
WHERE immeuble.pkimmeuble = batiment.fkimmeuble
AND compteur.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND occupant.fklogement = logement.pklogement
AND occupant.datedepart > sysdate
AND immeuble.pkimmeuble = {PkImmeuble}
AND occupant.pkoccupant = {PkOccupant}

and (instr(''''||i2.id||'''', ''''||replace(replace(immeuble.immeubles_chauff, ' ', ''), ',', ''',''')||'''')>0 or 
     instr(''''||i2.id||'''', ''''||replace(replace(immeuble.immeubles_eau, ' ', ''), ',', ''',''')||'''')>0)

AND i2.pkimmeuble = b2.fkimmeuble
AND c2.fklogement = l2.pklogement
AND l2.fkbatiment = b2.pkbatiment
AND o2.fklogement = l2.pklogement
AND o2.datedepart > sysdate
AND occupant.codelogegestio = o2.codelogegestio
AND o2.pkoccupant != occupant.pkoccupant";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#endif
        }
        /// <summary>
        /// Récupère le pk de l'occupant correspondant au code logement gestionnaire d'un immeuble
        /// </summary>
        /// <param name="fkimmeuble">PK Immeuble</param>
        /// <param name="CodeLogeGestio">Code logement gestionnaire</param>
        /// <returns></returns>
        private static int GetPkOccupant(int fkimmeuble, string CodeLogeGestio)
        {
            //WEBTODO :
            // - occupant remplace par web_logement
#if WS2
            if (fkimmeuble == -1) return -1;
            string sql =
                        $@"SELECT pkoccupant 
                        FROM Web_logement, web_occupant
                        WHERE Web_logement.fkimmeuble = {fkimmeuble}
                            AND web_occupant.datedepart > sysdate
                            AND web_occupant.codelogegestio =  {CodeLogeGestio.QuotedStr()}
                            AND web_occupant.fklogement = web_logement.pklogement
                        ORDER BY pkoccupant DESC
                        FETCH FIRST 1 ROWS ONLY";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#else
            if (fkimmeuble == -1) return -1;
            string sql =
                        $@"SELECT pkoccupant 
                        FROM immeuble, batiment, logement, occupant
                        WHERE batiment.fkimmeuble = {fkimmeuble}
                        AND logement.fkbatiment = batiment.pkbatiment
                        AND occupant.fklogement = logement.pklogement
                        AND occupant.datedepart > sysdate
                        AND occupant.codelogegestio =  {CodeLogeGestio.QuotedStr()}
                        ORDER BY pkoccupant DESC
                        FETCH FIRST 1 ROWS ONLY";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#endif
        }
        /// <summary>
        /// Récupère le pk du logement correspondant au code logement gestionnaire d'un immeuble
        /// </summary>
        /// <param name="fkimmeuble">PK Immeuble</param>
        /// <param name="CodeLogeGestio">Code logement gestionnaire</param>
        /// <returns></returns>
        private static int GetPkLogement(int fkimmeuble, string CodeLogeGestio)
        {
            //WEBTODO :
            // - logement remplace par web_logement
            // - occupant remplace par web_occupant
#if WS2
            if (fkimmeuble == -1) return -1;
            string sql =
                $@"select pklogement 
                FROM web_logement, web_occupant
                WHERE web_logement.fkimmeuble = {fkimmeuble}
                    AND web_occupant.datedepart > sysdate
                    AND web_occupant.codelogegestio_occupant =  {CodeLogeGestio.QuotedStr()}
                    AND web_occupant.fklogement = web_logement.pklogement
                ORDER BY pkoccupant DESC
                FETCH FIRST 1 ROWS ONLY";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#else
            if (fkimmeuble == -1) return -1;
            string sql =
                $@"select PKLOGEMENT 
                FROM IMMEUBLE, BATIMENT, LOGEMENT, OCCUPANT
                WHERE BATIMENT.FKIMMEUBLE = {fkimmeuble}
                and LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT
                and OCCUPANT.FKLOGEMENT = LOGEMENT.PKLOGEMENT
                and OCCUPANT.DATEDEPART > sysdate
                and OCCUPANT.CODELOGEGESTIO =  {CodeLogeGestio.QuotedStr()}
                ORDER BY PKOCCUPANT DESC
                FETCH FIRST 1 ROWS ONLY";

            return WS_DBUtils.utils_LER.DBSelect(sql).ToInt32OrDefault(-1);
#endif
        }
        /// <summary>
        /// Récupère les informations necessaires pour générer le tableau de bord d'un logement
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk du logement</param>
        /// <param name="PkOccupant">PK Occupant</param>
        /// <returns></returns>
        static public tableauDeBordLogement GetTableauBordLogement(string SessionID, int PkUser, int PkLogement, int PkOccupant)
        {

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
#else

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

                if (PkOccupant == -1)// si on a passé le Pklogement (on va récupérer son occupant)
                {
                    IsTbOccupant = false;
                    TBLogement.Logement = GetLogementByPk(PkLogement);
                    PkOccupant = GetPkOccupantByPkLogement(PkLogement, DateTime.Now);
                    TBLogement.Occupant = GetOccupantByPk(PkOccupant);
                }
                else // sinon, on a passé le PkOccupant (on va récupérer son logement)
                {
                    IsTbOccupant = true;
                    PkLogement = GetPkLogementByPkOccupant(PkOccupant);
                    TBLogement.Logement = GetLogementByPk(PkLogement);
                    TBLogement.Occupant = GetOccupantByPk(PkOccupant);
                }

                //check logement / user
                if (!CheckLogement(PkUser, PkLogement))
                {
                    TBLogement.Erreur = "incohérence user / logement";
                    return TBLogement;
                }

                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (User.FK != PkOccupant)
                    {
                        TBLogement.Erreur = "incohérence user / occupant";
                        return TBLogement;
                    }
                }

                //quelques Infos de l'immeuble:
                int PkImmeuble0 = GetPKImmeubleByPKLogement(PkLogement);
                int PkImmeubleEAU = -1;
                int PkImmeubleCHAUFF = -1;
                int PkLogementEAU = -1;
                int PkLogementCHAUFF = -1;
                int PkOccupantEAU = -1;
                int PkOccupantCHAUFF = -1;

                TBLogement.Immeuble = GetImmeubleByPk(PkImmeuble0);

                bool IsDemo = IsUserDemo(User);

                List<appareil> Appareils = GetAppareilsByPkLogement(PkLogement, "");
                TBLogement.NbCompteursEC = Appareils.Count(x => x.TypeAppareil.ToUpper() == "EC");
                TBLogement.NbCompteursEF = Appareils.Count(x => x.TypeAppareil.ToUpper() == "EF");
                TBLogement.NbCompteursRepart = Appareils.Count(x => x.TypeAppareil.ToUpper() == "REPART");
                TBLogement.NbCompteursCET = Appareils.Count(x => x.TypeAppareil.ToUpper() == "CET");
                TBLogement.NbCompteursCapteur = Appareils.Count(x => x.TypeAppareil.ToUpper() == "CAPTEUR");

                if (TBLogement.NbCompteursEC > 0 || TBLogement.NbCompteursEF > 0)
                {
                    // si on est sur un logement d'EAU
                    // --> on va rechercher le logement de chauffage correspondant
                    PkImmeubleEAU = PkImmeuble0;
                    PkLogementEAU = PkLogement;
                    PkOccupantEAU = PkOccupant;
                    PkImmeubleCHAUFF = GetPKImmeubleAutre(PkImmeubleEAU, PkOccupantEAU);
                    PkLogementCHAUFF = GetPkLogement(PkImmeubleCHAUFF, TBLogement.Occupant.Ref);
                    PkOccupantCHAUFF = GetPkOccupant(PkImmeubleCHAUFF, TBLogement.Occupant.Ref);

                    if (PkLogementCHAUFF > -1)
                    {
                        List<appareil> AppareilsChauff = GetAppareilsByPkLogement(PkLogementCHAUFF, "");
                        TBLogement.NbCompteursRepart = AppareilsChauff.Count(x => x.TypeAppareil.ToUpper() == "REPART");
                        TBLogement.NbCompteursCET = AppareilsChauff.Count(x => x.TypeAppareil.ToUpper() == "CET");
                    }
                }
                else if (TBLogement.NbCompteursRepart > 0 || TBLogement.NbCompteursCET > 0)
                {
                    // si on est sur un logement chauffage
                    // --> on va rechercher le logement EAU correspondant
                    PkImmeubleCHAUFF = PkImmeuble0;
                    PkLogementCHAUFF = PkLogement;
                    PkOccupantCHAUFF = PkOccupant;
                    PkImmeubleEAU = GetPKImmeubleAutre(PkImmeubleCHAUFF, PkOccupantCHAUFF);
                    PkLogementEAU = GetPkLogement(PkImmeubleEAU, TBLogement.Occupant.Ref);
                    PkOccupantEAU = GetPkOccupant(PkImmeubleEAU, TBLogement.Occupant.Ref);

                    if (PkLogementEAU > -1)
                    {
                        List<appareil> AppareilsEAU = GetAppareilsByPkLogement(PkLogementEAU, "");
                        TBLogement.NbCompteursEC = AppareilsEAU.Count(x => x.TypeAppareil.ToUpper() == "EC");
                        TBLogement.NbCompteursEF = AppareilsEAU.Count(x => x.TypeAppareil.ToUpper() == "EF");
                    }
                }

                #region Tickets d'intervention
                TBLogement.NbTicketsInter = GetNbTicketsInterByLogement(SessionID, PkUser, PkLogement, "STATUT_CLIENT=!Clos");
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
                        string Query = "select NB from REPARTITION_CPT where FKREPARTITION=@pkrepartition and FKCOMPTEUR=@pkcompteur";
                        if (RepartsImm.Count > 0) // dernière répartition
                        {
                            infosRepartImm CurrRep1 = RepartsImm.ElementAt(0);
                            String QueryCpt1 = Query.Replace("@pkrepartition", CurrRep1.PkRepartition.ToString());
                            QueryCpt1 = QueryCpt1.Replace("@pkcompteur", appRepart.Appareil.PkAppareil.ToString());

                            string NB1 = WS_DBUtils.utils_LER.DBSelect(QueryCpt1);
                            if (!string.IsNullOrEmpty(NB1))
                            {
                                cp.R1.Index += Convert.ToDecimal(NB1);
                                cp.R1.Conso = cp.R1.Index;
                                cp.R1.DateReleve = RepartsImm[0].DateFin;
                            }

                            if (RepartsImm.Count > 1) // répartition d'avant
                            {
                                infosRepartImm CurrRep2 = RepartsImm.ElementAt(1);
                                String QueryCpt2 = Query.Replace("@pkrepartition", CurrRep2.PkRepartition.ToString());
                                QueryCpt2 = QueryCpt2.Replace("@pkcompteur", appRepart.Appareil.PkAppareil.ToString());

                                string NB2 = WS_DBUtils.utils_LER.DBSelect(QueryCpt2);
                                if (!string.IsNullOrEmpty(NB2))
                                {
                                    cp.R2.Index += Convert.ToDecimal(NB2);
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
                    TBLogement.LogementCapteur.IndexRecapTemperature = GetIndexRecapCapteur("L", PkLogement, UnitesFk.Temperature, LastDateIndex);
                    TBLogement.LogementCapteur.SerieConsosTemperature = GetSerieCapteurByLogement(PkLogement, 9, DateDebut, DateFin);
                    TBLogement.LogementCapteur.IndexRecapHumidite = GetIndexRecapCapteur("L", PkLogement, UnitesFk.Humidite, LastDateIndex);
                    TBLogement.LogementCapteur.SerieConsosHumidite = GetSerieCapteurByLogement(PkLogement, 10, DateDebut, DateFin);
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

#endif
        }
        /// <summary>
        /// Obtient la conso pour une période suivant les 5 derniers relevés pour des compteurs d'eau
        /// </summary>
        /// <param name="InfosApps">Liste d'information sur des compteurs</param>
        /// <returns></returns>
        static private consosPeriode GetConsosPeriodeEAU(List<infosAppareilEAU> InfosApps)
        {
            consosPeriode ConsoPeriode = new consosPeriode();

            foreach (infosAppareilEAU InfosApp in InfosApps)
            {
                ConsoPeriode.R5.DateReleve = InfosApp.R5.DateReleve;
                ConsoPeriode.R5.Conso += InfosApp.R5.Conso;
                ConsoPeriode.R5.Index += InfosApp.R5.Index;

                ConsoPeriode.R4.DateReleve = InfosApp.R4.DateReleve;
                ConsoPeriode.R4.Index += InfosApp.R4.Index;
                ConsoPeriode.R4.Conso += InfosApp.R4.Conso;
                if (ConsoPeriode.R5.Conso != 0)
                    ConsoPeriode.VAR4 = (ConsoPeriode.R4.Conso - ConsoPeriode.R5.Conso) / ConsoPeriode.R5.Conso;

                ConsoPeriode.DegresVAR4 = GetDegresVAR(ConsoPeriode.R5.Conso, ConsoPeriode.R4.Conso);

                ConsoPeriode.R3.DateReleve = InfosApp.R3.DateReleve;
                ConsoPeriode.R3.Conso += InfosApp.R3.Conso;
                ConsoPeriode.R3.Index += InfosApp.R3.Index;
                if (ConsoPeriode.R4.Conso != 0)
                    ConsoPeriode.VAR3 = (ConsoPeriode.R3.Conso - ConsoPeriode.R4.Conso) / ConsoPeriode.R4.Conso;

                ConsoPeriode.DegresVAR3 = GetDegresVAR(ConsoPeriode.R4.Conso, ConsoPeriode.R3.Conso);

                ConsoPeriode.R2.DateReleve = InfosApp.R2.DateReleve;
                ConsoPeriode.R2.Conso += InfosApp.R2.Conso;
                ConsoPeriode.R2.Index += InfosApp.R2.Index;
                if (ConsoPeriode.R3.Conso != 0)
                    ConsoPeriode.VAR2 = (ConsoPeriode.R2.Conso - ConsoPeriode.R3.Conso) / ConsoPeriode.R3.Conso;

                ConsoPeriode.DegresVAR2 = GetDegresVAR(ConsoPeriode.R3.Conso, ConsoPeriode.R2.Conso);

                ConsoPeriode.R1.DateReleve = InfosApp.R1.DateReleve;
                ConsoPeriode.R1.Conso += InfosApp.R1.Conso;
                ConsoPeriode.R1.Index += InfosApp.R1.Index;
                if (ConsoPeriode.R2.Conso != 0)
                    ConsoPeriode.VAR1 = (ConsoPeriode.R1.Conso - ConsoPeriode.R2.Conso) / ConsoPeriode.R2.Conso;

                ConsoPeriode.DegresVAR1 = GetDegresVAR(ConsoPeriode.R2.Conso, ConsoPeriode.R1.Conso);
            }
            ConsoPeriode.Conso = ConsoPeriode.R1.Conso;
            ConsoPeriode.DateDeb = ConsoPeriode.R2.DateReleve;
            ConsoPeriode.DateFin = ConsoPeriode.R1.DateReleve;

            return ConsoPeriode;
        }
        /// <summary>
        /// Otient le degré de variation entre deux consommations
        /// </summary>
        /// <param name="ConsoAncien">Consommation précédente</param>
        /// <param name="ConsoNouveau">Consommation actuelle</param>
        /// <returns>
        /// -1 : Non signifcatif
        /// 0 : Baisse
        /// 1 : Egal
        /// 2 : Augmentation
        /// </returns>
        static public int GetDegresVAR(decimal ConsoAncien, decimal ConsoNouveau)
        {
            if (ConsoNouveau < ConsoAncien)
                return 0;
            else if (ConsoNouveau == ConsoAncien)
                return 1;
            else if (ConsoNouveau > ConsoAncien)
                return 2;
            return -1;
        }
        /// <summary>
        /// Obtient une requête permettant de récupérer les informations sur les compteurs d'un logement 
        /// </summary>
        /// <param name="Fields">Champs à afficher dans la requête</param>
        /// <param name="PkLogement">PK du logement</param>
        /// <returns></returns>
        static public string GetQueryAppareilsByPkLogement(string Fields, int PkLogement)
        {
            return $@" SELECT {Fields} 
                        FROM compteur
                        WHERE NVL(compteur.actif, 'O') <>  'N'
                        AND compteur.typecompteur='D'
                        AND compteur.fklogement= {PkLogement} ";
        }
        /// <summary>
        /// Récupère la liste des appareils pour un logement
        /// </summary>
        /// <param name="PkLogement">PK du logement</param>
        /// <param name="TypeAppareil">Filtre sur un type d'appareil
        /// Valeurs possibles :
        /// "EC" : Eau chaude
        /// "EF" : Eau froide
        /// "REPART" : Répartiteurs
        /// "CET" : CET
        /// "CAPTEUR" : capteurs
        /// "" : Tout appareil
        /// </param>
        /// <returns>Liste d'appareil</returns>
        static public List<appareil> GetAppareilsByPkLogement(int PkLogement, string TypeAppareil)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur
#if WS2
            string Query = $@" SELECT web_compteur.pkcompteur, web_compteur.numeroserie, web_compteur.fluide, 
                                web_compteur.emplacement, web_compteur.unite 
                            FROM web_compteur
                            WHERE NVL(web_compteur.actif, 'O') <> 'N'
                            AND web_compteur.fklogement= {PkLogement} ";

            if (TypeAppareil != "")
                Query += $@" AND web_compteur.fluide = {TypeAppareil.QuotedStr()}";

            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            List<appareil> Appareils = new List<appareil>();
            foreach (DataRow dr in drc)
            {
                appareil Appareil = new appareil
                {
                    PkAppareil = dr["PKCOMPTEUR"].ToString().ToInt32OrDefault(),
                    Numero = dr["NUMEROSERIE"].ToString()
                };
                Appareil.Numero = Appareil.Numero.Replace("CODE 72", "CODE_72").Replace("CODE 52", "CODE_52");
                if (dr["FLUIDE"] != DBNull.Value && (!string.IsNullOrEmpty(dr["FLUIDE"].ToString())))
                    Appareil.Fluide = dr["FLUIDE"].ToString();
                else
                    Appareil.TypeAppareil = "inconnu";

                if (dr["UNITE"] != DBNull.Value && (!string.IsNullOrEmpty(dr["UNITE"].ToString())))
                    Appareil.Unite = dr["UNITE"].ToString();
                else
                    Appareil.Unite = "";
                Appareil.Emplacement = dr["EMPLACEMENT"].ToString(); ;
                Appareils.Add(Appareil);
            }
            return Appareils;
#else
            string Query = $@" SELECT pkcompteur, numeroserie, compteur.fkcritere, codeemplacement.libelle as emplacement, article.fksousfamille
                            FROM compteur, codeemplacement, article
                            WHERE compteur.fkarticle = article.pkarticle AND compteur.fkcodeemplacement = codeemplacement.pkcodeemplacement
                            AND NVL(compteur.actif, 'O') <> 'N'
                            AND fklogement= {PkLogement} ";

            if (TypeAppareil != "")
                Query += GetTypeAppareilFilter(TypeAppareil);

            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            List<appareil> Appareils = new List<appareil>();
            foreach (DataRow dr in drc)
            {
                appareil Appareil = new appareil
                {
                    PkAppareil = Convert.ToInt32(dr["PKCOMPTEUR"]),
                    Numero = dr["NUMEROSERIE"].ToString()
                };
                Appareil.Numero = Appareil.Numero.Replace("CODE 72", "CODE_72").Replace("CODE 52", "CODE_52");
                if (dr["FKCRITERE"] != DBNull.Value && (!string.IsNullOrEmpty(dr["FKCRITERE"].ToString())))
                    Appareil.Fluide = GetNomFluideByPk(Convert.ToInt32(dr["FKCRITERE"]));
                if (Appareil.Fluide == "EC" || Appareil.Fluide == "EF")
                    Appareil.TypeAppareil = Appareil.Fluide;
                else
                    Appareil.TypeAppareil = GetTypeAppareilByPkSF(Convert.ToInt32(dr["FKSOUSFAMILLE"]));

                Appareil.Unite = GetUniteByTypeAppareil(Appareil.TypeAppareil);

                Appareil.Emplacement = dr["EMPLACEMENT"].ToString(); ;
                Appareils.Add(Appareil);
            }
            return Appareils;
#endif
        }
        /// <summary>
        /// Récupère la liste des PK des compteurs pour un logement
        /// </summary>
        /// <param name="PkLogement">PK du logement</param>
        /// <param name="TypeAppareil">/// Valeurs possibles :
        /// "EC" : Eau chaude
        /// "EF" : Eau froide
        /// "REPART" : Répartiteurs
        /// "CET" : CET
        /// "CAPTEUR" : capteurs
        /// "" : Tout appareil</param>
        /// <returns></returns>
        static public List<int> GetPkAppareilsByPkLogement(int PkLogement, string TypeAppareil)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur

#if WS2
            string Query = $@"SELECT pkcompteur
            FROM web_compteur
            WHERE web_compteur.fklogement= {PkLogement} ";

            if (TypeAppareil != "")
                Query += GetTypeAppareilFilter(TypeAppareil);

            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            List<int> Appareils = new List<int>();
            foreach (DataRow dr in drc)
            {
                Appareils.Add(Convert.ToInt32(dr["PKCOMPTEUR"]));
            }
            return Appareils;
#else
            string Query = $@"SELECT pkcompteur
FROM compteur, article
WHERE compteur.fkarticle = article.pkarticle
AND NVL(compteur.actif, 'O') <> 'N'
AND fklogement= {PkLogement} ";

            if (TypeAppareil != "")
                Query += GetTypeAppareilFilter(TypeAppareil);

            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            List<int> Appareils = new List<int>();
            foreach (DataRow dr in drc)
            {
                Appareils.Add(Convert.ToInt32(dr["PKCOMPTEUR"]));
            }
            return Appareils;
#endif
        }
        /// <summary>
        /// Récupère la liste des appareils pour un immeuble
        /// </summary>
        /// <param name="pkImmeuble">Pk de l'immeuble</param>
        /// <param name="typeAppareil">Filtre sur un type d'appareil
        /// Valeurs possibles :
        /// "EC" : Eau chaude
        /// "EF" : Eau froide
        /// "REPART" : Répartiteurs
        /// "CET" : CET
        /// "CAPTEUR" : capteurs
        /// "" : Tout appareil</param>
        /// <returns></returns>
        static public List<int> GetPkAppareilsByPkImmeuble(int pkImmeuble, string typeAppareil)
        {
            //WEBTODO :
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
#if WS2
            string Query = $@"SELECT web_compteur.pkcompteur
FROM web_compteur, web_logement
WHERE web_compteur.fklogement = web_logement.pklogement
AND web_logement.fkimmeuble= {pkImmeuble} ";

            if (typeAppareil != "")
                Query += GetTypeAppareilFilter(typeAppareil);
            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            List<int> Appareils = new List<int>();
            foreach (DataRow dr in drc)
            {
                Appareils.Add(Convert.ToInt32(dr["PKCOMPTEUR"]));
            }
            return Appareils;
#else
            string Query = $@"SELECT pkcompteur
FROM compteur, batiment, logement, article
WHERE logement.fkbatiment = batiment.pkbatiment
AND compteur.fklogement = logement.pklogement
AND compteur.fkarticle = article.pkarticle
AND NVL(compteur.actif, 'O') <> 'N'
AND batiment.fkimmeuble= {pkImmeuble} ";

            if (typeAppareil != "")
                Query += GetTypeAppareilFilter(typeAppareil);
            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            List<int> Appareils = new List<int>();
            foreach (DataRow dr in drc)
            {
                Appareils.Add(Convert.ToInt32(dr["PKCOMPTEUR"]));
            }
            return Appareils;
#endif
        }
        /// <summary>
        /// Obtient les informations d'un compteur en fonction de son PK
        /// </summary>
        /// <param name="PkCompteur">PK du compteur</param>
        /// <returns></returns>
        static public appareil GetAppareilByPk(int PkCompteur)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur
            // - article remplace par web_article
#if WS2
            string Query = $@"SELECT web_compteur.pkcompteur, numeroserie, web_compteur.fkcritere, 
                                web_compteur.emplacement, web_article.fksousfamille
                            FROM web_compteur, web_article
                            WHERE web_compteur.fkarticle = web_article.pkarticle 
                                AND pkcompteur= {PkCompteur} ";

            DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
            appareil Appareil = new appareil();
            try
            {
                Appareil.PkAppareil = Convert.ToInt32(dr["PKCOMPTEUR"]);
                Appareil.Numero = dr["NUMEROSERIE"].ToString();
                Appareil.Numero = Appareil.Numero.Replace("CODE 72", "CODE_72").Replace("CODE 52", "CODE_52"); ;
                Appareil.Fluide = dr["FLUIDE"].ToString();
                Appareil.TypeAppareil = Appareil.Fluide;
                Appareil.Unite = GetUniteByTypeAppareil(Appareil.TypeAppareil);
                Appareil.Emplacement = dr["EMPLACEMENT"].ToString();
            }
            catch { }

            return Appareil;
#else


            string Query = $@"SELECT pkcompteur, numeroserie, compteur.fkcritere, 
codeemplacement.libelle as emplacement, article.fksousfamille
FROM compteur, codeemplacement, article
WHERE compteur.fkarticle = article.pkarticle 
AND compteur.fkcodeemplacement = codeemplacement.pkcodeemplacement
AND pkcompteur= {PkCompteur} ";

            DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
            appareil Appareil = new appareil();
            try
            {
                Appareil.PkAppareil = Convert.ToInt32(dr["PKCOMPTEUR"]);
                Appareil.Numero = dr["NUMEROSERIE"].ToString();
                Appareil.Numero = Appareil.Numero.Replace("CODE 72", "CODE_72").Replace("CODE 52", "CODE_52"); ;
                Appareil.Fluide = GetNomFluideByPk(Convert.ToInt32(dr["FKCRITERE"]));
                if (Appareil.Fluide == "EC" || Appareil.Fluide == "EF")
                    Appareil.TypeAppareil = Appareil.Fluide;
                else
                    Appareil.TypeAppareil = GetTypeAppareilByPkSF(Convert.ToInt32(dr["FKSOUSFAMILLE"]));

                Appareil.Unite = GetUniteByTypeAppareil(Appareil.TypeAppareil);
                Appareil.Emplacement = dr["EMPLACEMENT"].ToString();

            }
            catch { }

            return Appareil;
#endif
        }

        /// <summary>
        ///  Retourne un objet représentant un compteur initialisé avec les informations rentrées en paramètre 
        /// </summary>
        /// <param name="DrCompteur">Ligne de données </param>
        /// <returns></returns>
        static public appareil GetAppareilByRow(DataRow DrCompteur)
        {
            appareil Appareil = new appareil
            {
                PkAppareil = Convert.ToInt32(DrCompteur["PKCOMPTEUR"]),
                Numero = DrCompteur["NUMEROSERIE"].ToString()
            };
            Appareil.Numero = Appareil.Numero.Replace("CODE 72", "CODE_72").Replace("CODE 52", "CODE_52"); ;
            Appareil.Fluide = DrCompteur["FLUIDE"].ToString();
            Appareil.TypeAppareil = Appareil.Fluide;
            Appareil.Unite = GetUniteByTypeAppareil(Appareil.TypeAppareil);
            Appareil.Emplacement = DrCompteur["EMPLACEMENT"].ToString();
            return Appareil;
        }

        /// <summary>
        /// Reformate les informations d'un appareil en fonction d'une ligne de données représentant un appareil 
        /// </summary>
        /// <param name="dr">Ligne de données représentant un appareil</param>
        /// <returns></returns>
        static public appareil GetAppareilByPk4Mongo(DataRow dr)
        {
            appareil Appareil = new appareil();
            try
            {
                Appareil.PkAppareil = Convert.ToInt32(dr["PKCOMPTEUR"]);
                Appareil.Numero = dr["NUMEROSERIE"].ToString();
                Appareil.Numero = Appareil.Numero.Replace("CODE 72", "CODE_72").Replace("CODE 52", "CODE_52"); ;
                Appareil.Fluide = GetNomFluideByPk(Convert.ToInt32(dr["FKCRITERE"]));
                if (Appareil.Fluide == "EC" || Appareil.Fluide == "EF")
                    Appareil.TypeAppareil = Appareil.Fluide;
                else
                    Appareil.TypeAppareil = GetTypeAppareilByPkSF(Convert.ToInt32(dr["FKSOUSFAMILLE"]));

                Appareil.Unite = GetUniteByTypeAppareil(Appareil.TypeAppareil);

                Appareil.Emplacement = dr["EMPLACEMENT"].ToString();

            }
            catch { }

            return Appareil;
        }
        /// <summary>
        /// Récupère la conso d'un logement de même type
        /// </summary>
        /// <param name="PkReleve">PK Relevé</param>
        /// <param name="TypeLogement">Type de logement</param>
        /// <param name="Fluides">Types de fluide
        /// Valeurs possibles :
        /// "EC"
        /// "EF"
        /// "REPART
        /// "CET"
        /// "CAPTEUR"
        /// ""</param>
        /// <returns></returns>
        public static decimal GetConsoMemeTypeLogement(int PkReleve, string TypeLogement, string Fluides)
        {
            //WEBTODO :
            // - indexconso remplace par web_indexconso
            // - compteur remplace par web_compteur
            // - logement remplace par web_logement

#if WS2
            string Query = $@"select sum(web_indexconso.conso), count(web_logement.pklogement)
                            from web_logement, web_compteur, web_indexconso
                            where web_compteur.fklogement = web_logement.pklogement
                            and web_indexconso.fkcompteur = web_compteur.pkcompteur
                            and web_indexconso.fkreleve = {PkReleve}
                            and web_compteur.typecompteur='D'";

            if (Fluides != "")
                Query += $@" AND {GetFluidesFilter(Fluides)} ";

            string TypeLogementFilter;
            if (string.IsNullOrEmpty(TypeLogement))
                TypeLogementFilter = $@" (web_logement.typelogement='' or web_logement.typelogement is null)";
            else
                TypeLogementFilter = $@" web_logement.typelogement = {TypeLogement.QuotedStr()} ";

            string QueryByType = $@" {Query} AND {TypeLogementFilter} ";

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(QueryByType);
            int NbLogt;
            decimal Conso;
            NbLogt = Convert.ToInt32(Dr["count(web_logement.pklogement)"]);

            if (NbLogt == 0) // pas de compteurs de ce type
                return -1;

            Conso = Convert.ToDecimal(Dr["sum(web_indexconso.conso)"]);

            if (NbLogt == 1) // pas d'autre logement de même type, alors on va envoyer conso de tous les types de logement
            {
                Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
                NbLogt = Convert.ToInt32(Dr["count(web_logement.pklogement)"]);
                Conso = Convert.ToDecimal(Dr["sum(web_indexconso.conso)"]);
            }

            return Conso / NbLogt;
#else
            string Query = $@"select sum(conso), count(LOGEMENT.PKLOGEMENT)
                            from IMMEUBLE, RELEVE, BATIMENT, LOGEMENT, COMPTEUR, INDEXCONSO
                            where BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
                            and RELEVE.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
                            and LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT
                            and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT
                            and INDEXCONSO.FKCOMPTEUR = COMPTEUR.PKCOMPTEUR
                            and INDEXCONSO.FKRELEVE = RELEVE.PKRELEVE
                            and COMPTEUR.TYPECOMPTEUR='D'
                            and RELEVE.PKRELEVE = {PkReleve} ";

            if (Fluides != "")
                Query += $@" AND {GetFluidesFilter(Fluides)} ";

            string TypeLogementFilter;
            if (string.IsNullOrEmpty(TypeLogement))
                TypeLogementFilter = $@" (logement.typelogement='' or logement.typelogement is null)";
            else
                TypeLogementFilter = $@" logement.typelogement = {TypeLogement.QuotedStr()} ";

            string QueryByType = $@" {Query} AND {TypeLogementFilter} ";

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(QueryByType);
            int NbLogt;
            decimal Conso;
            NbLogt = Convert.ToInt32(Dr["count(LOGEMENT.PKLOGEMENT)"]);

            if (NbLogt == 0) // pas de compteurs de ce type
                return -1;

            Conso = Convert.ToDecimal(Dr["sum(conso)"]);

            if (NbLogt == 1) // pas d'autre logement de même type, alors on va envoyer conso de tous les types de logement
            {
                Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
                NbLogt = Convert.ToInt32(Dr["count(LOGEMENT.PKLOGEMENT)"]);
                Conso = Convert.ToDecimal(Dr["sum(conso)"]);
            }

            return Conso / NbLogt;
#endif
        }

        /// <summary>
        /// Retourne les derniers relevés pour un immeuble et après une date, la liste est dans l'ordre croissante
        /// </summary>
        /// <param name="PkImmeuble">PK Immeuble</param>
        /// <param name="NbWanted">Nombre de relevés voulus (Si NbWanted = -1, on prend tout)</param>
        /// <param name="DateDebut">Date de début</param>
        /// <param name="DateFin">Date de fin</param>
        /// <param name="TypeAppareil">Filtre sur un type d'appareil
        /// Valeurs possibles :
        /// "EC" : Eau chaude
        /// "EF" : Eau froide
        /// "REPART" : Répartiteurs
        /// "CET" : CET
        /// "CAPTEUR" : capteurs
        /// "" : Tout appareil</param>
        /// <returns>Liste de relevés</returns>
        // 
        public static List<releve> GetLastRelevesImmeuble(int PkImmeuble, int NbWanted, DateTime DateDebut, DateTime DateFin, string TypeAppareil)
        {
            //WEBTODO :
            // - releve remplace par web_releve
#if WS2

            List<releve> Releves = new List<releve>();
            string Query =
                $@"SELECT datereleve, pkreleve, typeerc 
                    FROM web_releve
                    WHERE fkimmeuble = {PkImmeuble} 
                    AND datereleve between {DateDebut.QuotedStrDate()} AND {DateFin.QuotedStrDate()} 
                    AND datecloture IS NOT NULL";
            if (TypeAppareil != "")
                Query += $@" AND typeerc= {GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr()} ";

            Query += $@" order by datereleve ";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            //1998 1999 2000 2001
            try
            {
                int NbToRead;
                if (NbWanted > 0)
                    NbToRead = NbWanted;
                else
                    NbToRead = Drc.Count;

                if (NbToRead > Drc.Count)
                    NbToRead = Drc.Count;

                for (int Cpt = Drc.Count - NbToRead; Cpt < Drc.Count; Cpt++) //croissant
                {
                    releve Releve = new releve
                    {
                        PkReleve = Convert.ToInt32(Drc[Cpt]["PKRELEVE"]),
                        DateReleve = Convert.ToDateTime(Drc[Cpt]["DATERELEVE"]),
                        TypeERC = Drc[Cpt]["TYPEERC"].ToString()
                    };
                    Releves.Add(Releve);
                }
            }
            catch
            {
            }
            return Releves;
#else
            List<releve> Releves = new List<releve>();
            string Query =
                $@"SELECT datereleve, pkreleve, typeerc 
                    FROM releve
                    WHERE fkimmeuble = {PkImmeuble} 
                    AND datereleve between {DateDebut.QuotedStrDate()} AND {DateFin.QuotedStrDate()} 
                    AND datecloture IS NOT NULL";
            if (TypeAppareil != "")
                Query += $@" AND typeerc= {GetTypeERCByTypeAppareil(TypeAppareil).QuotedStr()} ";

            Query += $@" order by datereleve ";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            //1998 1999 2000 2001
            try
            {
                int NbToRead;
                if (NbWanted > 0)
                    NbToRead = NbWanted;
                else
                    NbToRead = Drc.Count;

                if (NbToRead > Drc.Count)
                    NbToRead = Drc.Count;

                for (int Cpt = Drc.Count - NbToRead; Cpt < Drc.Count; Cpt++) //croissant
                {
                    releve Releve = new releve
                    {
                        PkReleve = Convert.ToInt32(Drc[Cpt]["PKRELEVE"]),
                        DateReleve = Convert.ToDateTime(Drc[Cpt]["DATERELEVE"]),
                        TypeERC = Drc[Cpt]["TYPEERC"].ToString()
                    };
                    Releves.Add(Releve);
                }
            }
            catch
            {
            }
            return Releves;
#endif
        }

        /// <summary>
        /// Récupère les informations sur les appareils d'un logement (seulement EC et EF)
        /// Seulement utilisé dans TBlogement et appelWS de listeLogements
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk Logement</param>
        /// <param name="dateDebut">Date de début</param>
        /// <param name="dateFin">Date de fin</param>
        /// <param name="TypeAppareil">Filtre sur un type d'appareil
        /// Valeurs possibles :
        /// "EC" : Eau chaude
        /// "EF" : Eau froide</param>
        /// <param name="ParamsInfos">Infos additionnelles demandées (si vide, aucune info additionnelle n'est retournée)
        /// valeurs possibles cumulables (le séparateur est |)
        /// SERIECONSOS=O : on veut la série de consommation pour les appareils</param>
        /// <returns></returns>
        static public infosAppareilsEAU GetInfosAppareilsByLogementEAU(string SessionID, int PkUser, int PkLogement, DateTime dateDebut, DateTime dateFin, string TypeAppareil, string ParamsInfos)
        {
            infosAppareilsEAU InfosApps = new infosAppareilsEAU();
            if (TypeAppareil != "EC" && TypeAppareil != "EF")
            {
                InfosApps.Erreur = "Il faut passer TypeAppareil EC ou EF";
                return InfosApps;
            }
            //TODO check PkUser (autre qu'occupant) et logement/occupant
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosApps.Erreur = "incohérence de session";
                    return InfosApps;
                }
                else
                {
                    if (string.IsNullOrEmpty(ParamsInfos))
                        ParamsInfos = "";
                    ParamsString Pinfos = new ParamsString(ParamsInfos);

                    int PkImmeuble = GetPKImmeubleByPKLogement(PkLogement);
                    if (PkImmeuble == -1)
                    {
                        InfosApps.Erreur = "Erreur récupération PkImmeuble";
                        return InfosApps;
                    }

                    immeuble imm = GetImmeubleByPk(PkImmeuble);

                    DateTime DateDebut = dateDebut;
                    if (imm.DateActivationClient > dateDebut)
                        DateDebut = imm.DateActivationClient;

                    DateTime DateFin = dateFin;
                    if (imm.DateActivationClient > DateFin)
                        DateFin = imm.DateActivationClient;

                    bool HasTelereleve = false;
                    if (Pinfos.GetParam("SERIECONSOS") == "O")
                        HasTelereleve = imm.HasTelereleve; // juste pour avoir le HasTelereleve

                    // récupération des 5 derniers relevés du logement (= ceux de l'immeuble) ou de l'occupant (ceux de l'immeuble filtrés sur après date d'arrivée)
                    List<releve> Releves = GetLastRelevesImmeuble(PkImmeuble, 6, DateDebut, DateFin, TypeAppareil);
                    int NbReleves = Releves.Count;

                    // Entete infos appareils (utile pour tableau etc..)
                    if (Releves.Count > 5)
                        InfosApps.DateR6 = Releves[NbReleves - 6].DateReleve;
                    if (Releves.Count > 4)
                        InfosApps.DateR5 = Releves[NbReleves - 5].DateReleve;
                    if (Releves.Count > 3)
                        InfosApps.DateR4 = Releves[NbReleves - 4].DateReleve;
                    if (Releves.Count > 2)
                        InfosApps.DateR3 = Releves[NbReleves - 3].DateReleve;
                    if (Releves.Count > 1)
                        InfosApps.DateR2 = Releves[NbReleves - 2].DateReleve;
                    if (Releves.Count > 0)
                        InfosApps.DateR1 = Releves[NbReleves - 1].DateReleve;

                    DateTime LastDateIndex = getLastDateIndex();
                    //Appareils
                    List<appareil> Appareils = GetAppareilsByPkLogement(PkLogement, TypeAppareil);
                    foreach (appareil currApp in Appareils)
                    {
                        infosAppareilEAU InfosApp = new infosAppareilEAU();
                        currApp.Numero = currApp.Numero.Replace("-", " ");
                        InfosApp.Appareil = currApp;
                        if (Releves.Count > 5)
                            InfosApp.R6 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 6]);
                        if (Releves.Count > 4)
                            InfosApp.R5 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 5]);
                        if (Releves.Count > 3)
                            InfosApp.R4 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 4]);
                        if (Releves.Count > 2)
                            InfosApp.R3 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 3]);
                        if (Releves.Count > 1)
                            InfosApp.R2 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 2]);
                        if (Releves.Count > 0)
                            InfosApp.R1 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 1]);

                        // récup fuites
                        InfosApp.NbFuites = GetNbFlagsAlarme("PKAPPAREIL=" + currApp.PkAppareil.ToString(), "", "FUITECLIENT", LastDateIndex);
                        // récup anomalies
                        InfosApp.NbAnomalies = GetNbAnomalies("PKAPPAREIL=" + currApp.PkAppareil.ToString(), "");
                        // récup séries consos
                        if (Pinfos.GetParam("SERIECONSOS").ToUpper() == "O")
                        {
                            if (HasTelereleve)
                            {
                                InfosApp.SerieConsos = GetSerieIndexconsotch(SessionID, PkUser, "C", currApp.PkAppareil, "", DateDebut, DateFin);
                                InfosApp.SerieConsos.DefaultIntervalle = 30;//1 mois d'affichage à l'écran
                            }
                            else
                            {
                                InfosApp.SerieConsos = GetSerieConsosAppareil(SessionID, PkUser, currApp.PkAppareil, DateDebut, DateFin);
                                if (InfosApp.SerieConsos.DefaultIntervalle > 730)
                                    InfosApp.SerieConsos.DefaultIntervalle = 730;
                            }
                        }
                        InfosApps.ListeInfosAppareils.Add(InfosApp);
                    }
                }
            }
            catch (Exception Ex)
            {
                InfosApps.Erreur = Ex.Message;
            }
            return InfosApps;
        }
        /// <summary>
        /// Récupère les informations sur les appareils d'un logement (seulement Repart)
        /// Seulement utilisé dans TBlogement et appelWS de listeLogements
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk Logement</param>
        /// <param name="dateDebut">Date de début</param>
        /// <param name="dateFin">Date de fin</param>
        /// <param name="ParamsInfos">Infos additionnelles demandées (si vide, aucune info additionnelle n'est retournée)
        /// valeurs possibles cumulables (le séparateur est |)
        /// SERIECONSOS=O : on veut la série de consommation pour les appareils
        /// </param>
        /// <returns></returns>
        static public infosAppareilsRepart GetInfosAppareilsByLogementRepart(string SessionID, int PkUser, int PkLogement, DateTime dateDebut, DateTime dateFin, string ParamsInfos)
        {
            infosAppareilsRepart InfosApps = new infosAppareilsRepart();

            //TODO check PkUser (autre qu'occupant) et logement/occupant
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosApps.Erreur = "incohérence de session";
                    return InfosApps;
                }
                else
                {
                    if (string.IsNullOrEmpty(ParamsInfos))
                        ParamsInfos = "";
                    ParamsString Pinfos = new ParamsString(ParamsInfos);

                    int PkImmeuble = GetPKImmeubleByPKLogement(PkLogement);
                    if (PkImmeuble == -1)
                    {
                        InfosApps.Erreur = "Erreur récupération PkImmeuble";
                        return InfosApps;
                    }

                    immeuble imm = GetImmeubleByPk(PkImmeuble);

                    DateTime DateDebut = dateDebut;
                    if (imm.DateActivationClient > dateDebut)
                        DateDebut = imm.DateActivationClient;

                    DateTime DateFin = dateFin;
                    if (imm.DateActivationClient > DateFin)
                        DateFin = imm.DateActivationClient;

                    bool HasTelereleve = false;
                    if (Pinfos.GetParam("SERIECONSOS") == "O")
                        HasTelereleve = imm.HasTelereleve; // juste pour avoir le HasTelereleve

                    // récupération des 5 derniers relevés du logement (= ceux de l'immeuble) ou de l'occupant (ceux de l'immeuble filtrés sur après date d'arrivée)
                    List<releve> Releves = GetLastRelevesImmeuble(PkImmeuble, 6, DateDebut, DateFin, "REPART");
                    int NbReleves = Releves.Count;

                    // Entete infos appareils (utile pour tableau etc..)
                    if (Releves.Count > 5)
                        InfosApps.DateR6 = Releves[NbReleves - 6].DateReleve;
                    if (Releves.Count > 4)
                        InfosApps.DateR5 = Releves[NbReleves - 5].DateReleve;
                    if (Releves.Count > 3)
                        InfosApps.DateR4 = Releves[NbReleves - 4].DateReleve;
                    if (Releves.Count > 2)
                        InfosApps.DateR3 = Releves[NbReleves - 3].DateReleve;
                    if (Releves.Count > 1)
                        InfosApps.DateR2 = Releves[NbReleves - 2].DateReleve;
                    if (Releves.Count > 0)
                        InfosApps.DateR1 = Releves[NbReleves - 1].DateReleve;

                    //Appareils
                    List<appareil> Appareils = GetAppareilsByPkLogement(PkLogement, "REPART");
                    foreach (appareil currApp in Appareils)
                    {
                        infosAppareilRepart InfosApp = new infosAppareilRepart
                        {
                            Appareil = currApp
                        };
                        if (Releves.Count > 5)
                            InfosApp.R6 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 6]);
                        if (Releves.Count > 4)
                            InfosApp.R5 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 5]);
                        if (Releves.Count > 3)
                            InfosApp.R4 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 4]);
                        if (Releves.Count > 2)
                            InfosApp.R3 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 3]);
                        if (Releves.Count > 1)
                            InfosApp.R2 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 2]);
                        if (Releves.Count > 0)
                            InfosApp.R1 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 1]);

                        if (Pinfos.GetParam("SERIECONSOS").ToUpper() == "O")
                        {
                            int dju = 20;
                            InfosApp.SerieConsosDJU = GetSerieConsos15J("C", currApp.PkAppareil, "REPART", DateDebut, DateFin, dju);// retirer : on garde temporairement pour fidesio
                            if (InfosApp.SerieConsosDJU.DefaultIntervalle > 720)
                                InfosApp.SerieConsosDJU.DefaultIntervalle = 720;

                            //remplacé le 19/10/2018 par index brut de indexconsotch
                            InfosApp.SerieConsos = GetSommeSerieIndexconsotch(SessionID, PkUser, "C", currApp.PkAppareil, "REPART", DateDebut, DateFin);
                            InfosApp.SerieConsos.DefaultIntervalle = 30;//1 mois d'affichage à l'écran
                        }
                        //verrue pour changer libellé type d'appareil pour fidésio
                        InfosApp.Appareil.TypeAppareil = "Répartiteur";
                        InfosApps.ListeInfosAppareils.Add(InfosApp);
                    }
                }
            }
            catch (Exception Ex)
            {
                InfosApps.Erreur = Ex.Message;
            }
            return InfosApps;
        }
        /// <summary>
        /// Obtient les informations sur les appareils d'un logement (seulement CET (même code que répart (sauf string CET à la place de Repart)))
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk Logement</param>
        /// <param name="dateDebut">Date de débu</param>
        /// <param name="dateFin">Date de fin</param>
        /// <param name="ParamsInfos">Infos additionnelles demandées (si vide, aucune info additionnelle n'est retournée)
        /// /// valeurs possibles cumulables (le séparateur est |)
        /// SERIECONSOS=O : on veut la série de consommation pour les appareils</param>
        /// <returns></returns>
        static public infosAppareilsCET GetInfosAppareilsByLogementCET(string SessionID, int PkUser, int PkLogement, DateTime dateDebut, DateTime dateFin, string ParamsInfos)
        {
            infosAppareilsCET InfosApps = new infosAppareilsCET();

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosApps.Erreur = "incohérence de session";
                    return InfosApps;
                }
                else
                {
                    if (string.IsNullOrEmpty(ParamsInfos))
                        ParamsInfos = "";
                    ParamsString Pinfos = new ParamsString(ParamsInfos);

                    int PkImmeuble = GetPKImmeubleByPKLogement(PkLogement);
                    if (PkImmeuble == -1)
                    {
                        InfosApps.Erreur = "Erreur récupération PkImmeuble";
                        return InfosApps;
                    }

                    immeuble imm = GetImmeubleByPk(PkImmeuble);

                    DateTime DateDebut = dateDebut;
                    if (imm.DateActivationClient > dateDebut)
                        DateDebut = imm.DateActivationClient;

                    DateTime DateFin = dateFin;
                    if (imm.DateActivationClient > DateFin)
                        DateFin = imm.DateActivationClient;

                    bool HasTelereleve = false;
                    if (Pinfos.GetParam("SERIECONSOS") == "O")
                        HasTelereleve = imm.HasTelereleve; // juste pour avoir le HasTelereleve

                    // récupération des 5 derniers relevés du logement (= ceux de l'immeuble) ou de l'occupant (ceux de l'immeuble filtrés sur après date d'arrivée)
                    List<releve> Releves = GetLastRelevesImmeuble(PkImmeuble, 6, DateDebut, DateFin, "CET");
                    int NbReleves = Releves.Count;

                    // Entete infos appareils (utile pour tableau etc..)
                    if (Releves.Count > 5)
                        InfosApps.DateR6 = Releves[NbReleves - 6].DateReleve;
                    if (Releves.Count > 4)
                        InfosApps.DateR5 = Releves[NbReleves - 5].DateReleve;
                    if (Releves.Count > 3)
                        InfosApps.DateR4 = Releves[NbReleves - 4].DateReleve;
                    if (Releves.Count > 2)
                        InfosApps.DateR3 = Releves[NbReleves - 3].DateReleve;
                    if (Releves.Count > 1)
                        InfosApps.DateR2 = Releves[NbReleves - 2].DateReleve;
                    if (Releves.Count > 0)
                        InfosApps.DateR1 = Releves[NbReleves - 1].DateReleve;

                    //Appareils
                    List<appareil> Appareils = GetAppareilsByPkLogement(PkLogement, "CET");
                    foreach (appareil currApp in Appareils)
                    {
                        infosAppareilCET InfosApp = new infosAppareilCET
                        {
                            Appareil = currApp
                        };
                        if (Releves.Count > 5)
                            InfosApp.R6 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 6]);
                        if (Releves.Count > 4)
                            InfosApp.R5 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 5]);
                        if (Releves.Count > 3)
                            InfosApp.R4 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 4]);
                        if (Releves.Count > 2)
                            InfosApp.R3 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 3]);
                        if (Releves.Count > 1)
                            InfosApp.R2 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 2]);
                        if (Releves.Count > 0)
                            InfosApp.R1 = GetIndexReleve(currApp.PkAppareil, Releves[NbReleves - 1]);

                        //TODO : ?
                        if (Pinfos.GetParam("SERIECONSOS").ToUpper() == "O")
                        {
                            int dju = 20;
                            InfosApp.SerieConsosDJU = GetSerieConsos15J("C", currApp.PkAppareil, "CET", DateDebut, DateFin, dju);// retirer : on garde temporairement pour fidesio
                            if (InfosApp.SerieConsosDJU.DefaultIntervalle > 720)
                                InfosApp.SerieConsosDJU.DefaultIntervalle = 720;

                            //remplacé le 19/10/2018 par index brut de indexconsotch
                            InfosApp.SerieConsos = GetSommeSerieIndexconsotch(SessionID, PkUser, "C", currApp.PkAppareil, "CET", DateDebut, DateFin);
                            InfosApp.SerieConsos.DefaultIntervalle = 30;//1 mois d'affichage à l'écran

                        }
                        //verrue pour changer libellé type d'appareil pour fidésio
                        InfosApp.Appareil.TypeAppareil = "Compteur d'énergie";
                        InfosApps.ListeInfosAppareils.Add(InfosApp);
                    }
                }
            }
            catch (Exception Ex)
            {
                InfosApps.Erreur = Ex.Message;
            }
            return InfosApps;
        }
        /// <summary>
        /// Récupère les derniers relevés d'un immeuble
        /// </summary>
        /// <param name="pkImmeuble"></param>
        /// <param name="nbReleve"></param>
        /// <param name="date"></param>
        /// <param name="TypeAppareil">Filtre sur un type d'appareil</param>
        /// <returns></returns>
        public static List<Releve> GetLastReleves(int pkImmeuble, int nbReleve, DateTime date, string TypeAppareil = null)
        {
            List<Releve> Releves = new List<Releve>();
            string sQuery = $@"SELECT *
                                FROM (SELECT pkreleve, datereleve, typeerc
                                FROM releve
                                WHERE fkimmeuble = {pkImmeuble} 
                                AND datereleve <={date.QuotedStrDate()} 
                                {(string.IsNullOrEmpty(TypeAppareil) ? string.Empty : $@" AND TYPEERC= '{TypeAppareil}'")}
                                order by datereleve desc)
                                WHERE rownum <= {nbReleve}";

            DataRowCollection drcReleve = WS_DBUtils.utils_LER.DBSelectRows(sQuery);
            foreach (DataRow drReleve in drcReleve)
            {
                Releve actualReleve = new Releve
                {
                    pkReleve = drReleve["PKRELEVE"].ToString().ToInt32OrDefault(),
                    pkImmeuble = pkImmeuble,
                    dateReleve = Convert.ToDateTime(drReleve["DATERELEVE"].ToString()),
                    typeERC = drReleve["TYPEERC"].ToString()
                };
                Releves.Add(actualReleve);
            }

            return Releves;

        }
        /// <summary>
        /// Récupère un index pour un relevé donné (comprenant la date du relevé, l'index et la consommation)
        /// </summary>
        /// <param name="PkAppareil">Pk compteur</param>
        /// <param name="Releve">Relevé</param>
        /// <returns></returns>
        private static indexReleve GetIndexReleve(int PkAppareil, releve Releve)
        {
            //WEBTODO :
            // - indexconso remplace par web_indexconso
#if WS2
            indexReleve IndexReleve = new indexReleve();
            string Query =
                $@"SELECT theindexf, conso 
                FROM web_indexconso
                WHERE fkreleve= {Releve.PkReleve} 
                AND fkcompteur= {PkAppareil} ";


            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
            try
            {
                IndexReleve.Index = Convert.ToDecimal(Dr["THEINDEXF"]);
                IndexReleve.Conso = Convert.ToDecimal(Dr["CONSO"]);
                IndexReleve.DateReleve = Releve.DateReleve;
            }
            catch
            {
            }

            return IndexReleve;
#else
            indexReleve IndexReleve = new indexReleve();
            string Query =
                $@"SELECT theindexf, conso 
                FROM indexconso
                WHERE fkreleve= {Releve.PkReleve} 
                AND fkcompteur= {PkAppareil} ";


            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
            try
            {
                IndexReleve.Index = Convert.ToDecimal(Dr["THEINDEXF"]);
                IndexReleve.Conso = Convert.ToDecimal(Dr["CONSO"]);
                IndexReleve.DateReleve = Releve.DateReleve;
            }
            catch
            {
            }

            return IndexReleve;
#endif
        }
        #endregion

        #region Anomalies de consommation
        /// <summary>
        /// Récupère les informations sur les anomalies d'un immeuble  (logement, occupant, appareil, détail sur l'anomalie)
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble">PK de l'immeuble</param>
        /// <param name="ParamsFiltres">Filtre pour n'avoir que les immeubles ayant le bon critère (si vide : pas de filtre) (paires clef=valeur)
        ///  valeur clef possible : 
        ///  PKOCCUPANT
        ///  PKLOGEMENT
        ///  PKAPPAREIL
        /// </param>
        /// <returns></returns>
        static public infosAnomalies GetInfosAnomaliesByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres)
        {
            //WEBTODO :

#if WS2
            infosAnomalies InfosAnomalies = new infosAnomalies();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosAnomalies.Erreur = "incohérence de session";
                    return InfosAnomalies;
                }

                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    {
                        InfosAnomalies.Erreur = "incohérence User, Occupant";
                        return InfosAnomalies;
                    }
                }
                else
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosAnomalies.Erreur = "incohérence user / immeuble";
                        return InfosAnomalies;
                    }
                }

                string codes_ano = "('91')";
                string Query = $@"SELECT web_compteur.pkcompteur, web_logement.pklogement, 
                                    web_compteur.numeroserie, web_compteur.fluide, web_compteur.emplacement
                                    web_indexconso.theindexf, web_indexconso.conso, 
                                    web_indexconso.code1, web_indexconso.code2, web_indexconso.code3, web_indexconso.code4, 
                                    web_releve.datereleve, web_releve.typereleve, 
                                    web_logement.numbatiment, web_logement.adrbatiment, web_logement.numescalier, 
                                    web_logement.adresseesc AS adrescalier, web_logement.numetage, 
                                    web_logement.numordre, web_logement.typelogement, web_occupant.pkoccupant, 
                                    web_occupant.nom, web_occupant.codelogegestio,
                                    web_occupant.datearrivee,web_occupant.datedepart
                                FROM web_indexconso, web_compteur, web_logement, web_releve, web_article, web_occupant 
                                WHERE ((web_indexconso.code1 IN {codes_ano} 
                                    ) OR (web_indexconso.code2 IN {codes_ano} 
                                    ) OR (web_indexconso.code3 IN {codes_ano} 
                                    ) OR (web_indexconso.code4 IN {codes_ano} 
                                    ))
                                    
                                    AND web_releve.fkimmeuble = {PkImmeuble} 
                                    AND web_releve.pkreleve = web_indexconso.fkreleve 
                                    AND web_occupant.fklogement = web_logement.pklogement ";
                if (Pfiltres.GetParam("PKOCCUPANT") != "")//27/02/2015
                {
                    occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));

                    DateTime Date1 = Occupant.DateArrivee;
                    DateTime Date2 = Occupant.DateDepart;
                    releve Releve = GetLastReleve(PkImmeuble, Date1, Date2, "");
                    Query += " and web_releve.pkreleve=" + Releve.PkReleve;
                    // si on a pas passé le filtre sur logement, le rajouter depuis l'occupant
                    if (Pfiltres.GetParam("PKLOGEMENT").Trim() == "")
                        Query += " and web_logement.pklogement=" + GetPkLogementByPkOccupant(Occupant.PkOccupant);

                }
                else
                {
                    Query += $@" AND datereleve=(SELECT max(datereleve) FROM web_releve WHERE datecloture is not null AND releve.fkimmeuble = {PkImmeuble})";
                }
                Query += $@" AND web_releve.pkreleve = fkreleve
                            AND (web_indexconso.fkcompteur=compteur.pkcompteur)
                            AND (web_compteur.fklogement = web_logement.pklogement)
                            AND web_compteur.fkarticle = web_article.pkarticle 
                           ";

                //Gestion recherche
                string AddtionnalFilter = "";
                string PKLOGEMENT = Pfiltres.GetParam("PKLOGEMENT").Trim();
                if (PKLOGEMENT.ToUpper() != "")
                {
                    AddtionnalFilter += "AND web_compteur.fklogement=" + PKLOGEMENT;
                }
                string PKAPPAREIL = Pfiltres.GetParam("PKAPPAREIL").Trim();
                if (PKAPPAREIL.ToUpper() != "")
                {
                    AddtionnalFilter += $@" AND web_compteur.pkcompteur= {PKAPPAREIL}";
                }

                if (AddtionnalFilter.Trim() != "")
                    Query += " " + AddtionnalFilter;
                //

                DataRowCollection DrcAnos = WS_DBUtils.utils_LER.DBSelectRows(Query);
                foreach (DataRow DrAno in DrcAnos)
                {
                    infosAnomalie InfosAno = new infosAnomalie();

                    int PkCompteur = DrAno["PKCOMPTEUR"].ToString().ToInt32OrDefault();
                    int PkLogement = DrAno["PKLOGEMENT"].ToString().ToInt32OrDefault();
                    DateTime DateReleve = DrAno["DATERELEVE"].ToString().ToDateTime();

                    //TODO à optimiser si besoin
                    InfosAno.Logement = GetLogementByRow(DrAno);
                    InfosAno.Occupant = GetOccupantByRow(DrAno);
                    InfosAno.Appareil = GetAppareilByRow(DrAno);
                    //
                    InfosAno.Anomalie.Conso = Convert.ToDecimal(DrAno["CONSO"]);
                    InfosAno.Anomalie.Index = Convert.ToDecimal(DrAno["THEINDEXF"]);
                    InfosAno.Anomalie.Observations = GetIncidents2(DrAno["CODE1"].ToString(), DrAno["CODE2"].ToString(), DrAno["CODE3"].ToString(), DrAno["CODE4"].ToString(), DrAno["TYPERELEVE"].ToString(), DrAno["DATERELEVE"].ToString());
                    if (InfosAno.Anomalie.Observations.ToUpper() == "NULL")
                        InfosAno.Anomalie.Observations = "";
                    InfosAnomalies.ListeInfosAnomalies.Add(InfosAno);
                }
            }
            catch (Exception Ex)
            {
                InfosAnomalies.Erreur = Ex.Message;
            }
            return InfosAnomalies;
#else
            infosAnomalies InfosAnomalies = new infosAnomalies();
            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    InfosAnomalies.Erreur = "incohérence de session";
                    return InfosAnomalies;
                }

                user User = GetUserByPk(PkUser);
                if (User.UserType == "O")
                {
                    if (Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")) != User.FK)
                    {
                        InfosAnomalies.Erreur = "incohérence User, Occupant";
                        return InfosAnomalies;
                    }
                }
                else
                {
                    if (checkImmeuble(PkUser, PkImmeuble) == false)
                    {
                        InfosAnomalies.Erreur = "incohérence user / immeuble";
                        return InfosAnomalies;
                    }
                }

                string codes_ano = "('91')";
                string Query = $@"SELECT compteur.pkcompteur, compteur.fklogement, indexconso.theindexf, indexconso.conso
                                , typereleve, code1, code2, code3, code4, releve.datereleve
                                FROM indexconso, compteur, logement, batiment, releve
                                WHERE ((code1 in {codes_ano} 
                                ) or (code2 in {codes_ano} 
                                ) or (code3 in {codes_ano} 
                                ) or (code4 in {codes_ano} 
                                ))
                                AND releve.fkimmeuble = {PkImmeuble} 
                                AND releve.pkreleve = indexconso.fkreleve";
                if (Pfiltres.GetParam("PKOCCUPANT") != "")//27/02/2015
                {
                    occupant Occupant = GetOccupantByPk(Convert.ToInt32(Pfiltres.GetParam("PKOCCUPANT")));

                    DateTime Date1 = Occupant.DateArrivee;
                    DateTime Date2 = Occupant.DateDepart;
                    releve Releve = GetLastReleve(PkImmeuble, Date1, Date2, "");
                    Query += " and RELEVE.PKRELEVE=" + Releve.PkReleve;
                    // si on a pas passé le filtre sur logement, le rajouter depuis l'occupant
                    if (Pfiltres.GetParam("PKLOGEMENT").Trim() == "")
                        Query += " and LOGEMENT.PKLOGEMENT=" + GetPkLogementByPkOccupant(Occupant.PkOccupant);

                }
                else
                {
                    Query += $@" AND datereleve=(SELECT max(datereleve) FROM releve WHERE datecloture is not null AND releve.fkimmeuble = {PkImmeuble})";
                }
                Query += $@" AND releve.pkreleve = fkreleve
                            AND (indexconso.fkcompteur=compteur.pkcompteur)
                            AND (compteur.fklogement = logement.pklogement)
                            AND (logement.fkbatiment = batiment.pkbatiment)";

                //Gestion recherche
                string AddtionnalFilter = "";
                string PKLOGEMENT = Pfiltres.GetParam("PKLOGEMENT").Trim();
                if (PKLOGEMENT.ToUpper() != "")
                {
                    AddtionnalFilter += "and COMPTEUR.FKLOGEMENT=" + PKLOGEMENT;
                }
                string PKAPPAREIL = Pfiltres.GetParam("PKAPPAREIL").Trim();
                if (PKAPPAREIL.ToUpper() != "")
                {
                    AddtionnalFilter += $@" AND compteur.pkcompteur= {PKAPPAREIL}";
                }

                if (AddtionnalFilter.Trim() != "")
                    Query += " " + AddtionnalFilter;
                //

                DataRowCollection DrcAnos = WS_DBUtils.utils_LER.DBSelectRows(Query);
                foreach (DataRow DrAno in DrcAnos)
                {
                    infosAnomalie InfosAno = new infosAnomalie();

                    int PkCompteur = Convert.ToInt32(DrAno["PKCOMPTEUR"]);
                    int PkLogement = Convert.ToInt32(DrAno["FKLOGEMENT"]);
                    DateTime DateReleve = Convert.ToDateTime(DrAno["DATERELEVE"]);

                    //TODO à optimiser si besoin
                    InfosAno.Logement = GetLogementByPk(PkLogement);
                    InfosAno.Occupant = GetOccupantByPk(GetPkOccupantByPkLogement(PkLogement, DateReleve));
                    InfosAno.Appareil = GetAppareilByPk(PkCompteur);
                    //
                    InfosAno.Anomalie.Conso = Convert.ToDecimal(DrAno["CONSO"]);
                    InfosAno.Anomalie.Index = Convert.ToDecimal(DrAno["THEINDEXF"]);
                    InfosAno.Anomalie.Observations = GetIncidents(
                        DrAno["CODE1"].ToString(), 
                        DrAno["CODE2"].ToString(), 
                        DrAno["CODE3"].ToString(), 
                        DrAno["CODE4"].ToString(), 
                        DrAno["TYPERELEVE"].ToString(), 
                        DrAno["DATERELEVE"].ToString(),
                        PkCompteur);
                    if (InfosAno.Anomalie.Observations.ToUpper() == "NULL")
                        InfosAno.Anomalie.Observations = "";
                    InfosAnomalies.ListeInfosAnomalies.Add(InfosAno);
                }
            }
            catch (Exception Ex)
            {
                InfosAnomalies.Erreur = Ex.Message;
            }
            return InfosAnomalies;

#endif
        }

        #endregion

        #region Recherche
        /// <summary>
        /// Fonction de suppression des accents/// </summary>
        /// <param name="Texte">Texte à formatter</param>
        /// <returns></returns>
        static string ClearAccents(string Texte)
        {
            Texte = Texte.Replace("é", "e");
            Texte = Texte.Replace("è", "e");
            Texte = Texte.Replace("ê", "e");
            Texte = Texte.Replace("à", "a");
            Texte = Texte.Replace("â", "a");
            Texte = Texte.Replace("ù", "u");
            Texte = Texte.Replace("ç", "c");
            Texte = Texte.Replace("ô", "o");
            Texte = Texte.Replace("ö", "o");
            // normalement pas la peine car remplacements avant conversion en maj
            Texte = Texte.Replace("É", "e");
            Texte = Texte.Replace("È", "e");
            Texte = Texte.Replace("Ê", "e");
            Texte = Texte.Replace("Ë", "e");
            return Texte;
        }
        /// <summary>
        /// Obtient le filtre pour les requêtes SQL avec les champs (Fields) et les valeurs associées (TextToSearch)  
        /// </summary>
        /// <param name="Fields">Champs séparés par des '|'</param>
        /// <param name="TextToSearch">Texte de valeurs à mettre séparés par des ' ' </param>
        /// <returns></returns>
        static string GetFtxtFilter(string Fields, string TextToSearch)
        {
            // retraitement Texte
            TextToSearch = ClearAccents(TextToSearch);
            TextToSearch = TextToSearch.Trim();
            TextToSearch = TextToSearch.ToUpper();
            TextToSearch = TextToSearch.Replace("  ", " ");

            if (TextToSearch == "")
                return "";

            string[] tTermes = TextToSearch.Split(" ".ToCharArray());
            string[] tChamps = Fields.Split("|".ToCharArray());

            string Filtre = "(";


            for (int CptTerme = 0; CptTerme < tTermes.Length; CptTerme++)
            {
                Filtre += " (";

                for (int CptChamp = 0; CptChamp < tChamps.Length; CptChamp++)
                {
                    //if (tChamps[CptChamp] == "BATIMENT.ADRESSE") // gestion des accents (pas dans tous les champs sinon trop lent)
                    Filtre += " UPPER(utl_raw.cast_to_varchar2((nlssort(" + tChamps[CptChamp] + ", 'nls_sort=binary_ai')))) like " + ("%" + tTermes[CptTerme] + "%").QuotedStr();
                    if (CptChamp < (tChamps.Length - 1))
                        Filtre += " or ";
                }
                Filtre += ") ";
                if (CptTerme < (tTermes.Length - 1))
                    Filtre += " and ";
            }

            Filtre += ")";
            return Filtre.ToUpper(); ;
        }

        #endregion

        #region Divers
        /// <summary>
        /// Obtient la liste des utilisateurs BigData
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <returns></returns>
        public static usersBigData GetUsersBigData(string SuperLoginID, string SuperPassword)
        {
            int MaxImmeubles = 200;
            usersBigData UsersBigData = new usersBigData();
            if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
            {
                users Users = GetUsers(SuperLoginID, SuperPassword, "");
                foreach (user User in Users.ListeUsers)
                {
                    if (User.UserType != "O")
                    {
                        if (getNbImmeubles("U", User.PKUser) > MaxImmeubles)
                            UsersBigData.ListeUsersBigData.Add(User);
                    }
                }
            }
            return UsersBigData;
        }

        /// <summary>
        /// Download le fichier demandé 
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="FileName">Nom du fichier présent dans le "DataDirectory"</param>
        /// <returns></returns>
        public static Byte[] GetFile(string SuperLoginID, string SuperPassword, string FileName)
        {
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return null;

            string file = AppDomain.CurrentDomain.GetData("DataDirectory").ToString() + "\\" + FileName;
            MemoryStream inMemoryCopy = new MemoryStream(File.ReadAllBytes(file));
            return inMemoryCopy.ToArray();
        }

        #endregion

        #region Répartition

        public class infosRepartImm
        {
            public int PkRepartition = -1;
            public decimal Tot_URepart = -1;
            public decimal Tot_TantChauff = -1;
            public decimal PU_Tant = -1;
            public decimal Prix_URepart = -1;
            public decimal Prix_Abonn = -1;
            public decimal Mont_ARepartTant = -1;
            public decimal Part_RepartConsos = -1;
            public decimal CT_Combust = -1;
            public DateTime DateRepart;
            public DateTime DateDebut;
            public DateTime DateFin;
        }
        private class infosRepartLog
        {
            public decimal URepartLog = -1;
            public decimal TantLog = -1;
            public decimal Prix_ChauffTantLog = -1;
            public decimal CT_ChauffLog = -1;
        }
        /// <summary>
        /// Récupère le PK de la dernière répartition pour un immeuble donné
        /// </summary>
        /// <param name="PkImmeuble">PK de l'immeuble</param>
        /// <returns></returns>
        private static int GetLastPkRepartImmeuble(int PkImmeuble)
        {
            //WEBTODO :
#if WS2
            // - repartition remplace par web_repartition
            int Pk = -1;

            string Query = $@"SELECT pkrepartition FROM web_repartition
                            WHERE fkimmeuble= {PkImmeuble} 
                            order by datefin desc";
            try
            {
                Pk = WS_DBUtils.utils_LER.DBSelect(Query).ToInt32OrDefault();
            }
            catch
            { }
            return Pk;
#else
            int Pk = -1;

            string Query = $@"SELECT pkrepartition FROM repartition
                            WHERE NVL(actif, 'O')<>'N' AND status='IMPORTED' AND fkimmeuble= {PkImmeuble} 
                            order by datefin desc";
            try
            {
                Pk = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(Query));
            }
            catch
            { }
            return Pk;
#endif

        }
        /// <summary>
        /// Retourne les dernières répartition (dates) pour un immeuble et après une date, la liste est dans l'ordre décroissant
        /// </summary>
        /// <param name="PkImmeuble">PK Immeuble</param>
        /// <param name="NbWanted">Nombre de relevés voulus (Si NbWanted = -1, on prend tout)</param>
        /// <param name="Date">Date de la requête</param>
        /// <returns></returns>
        public static List<infosRepartImm> GetLastsPkRepartImmeuble(int PkImmeuble, int NbWanted, DateTime Date)
        {
            //WEBTODO :
            // - repartition remplace par web_repartition
#if WS2
            // Date = date entree occupant : on ne prend que répart >= entree occupant
            List<infosRepartImm> infos = new List<infosRepartImm>();
            string Query = $@"SELECT pkrepartition, datedebut 
                            FROM web_repartition 
                            WHERE fkimmeuble = {PkImmeuble}
                                AND datedebut >= {Date.QuotedStr()}
                            ORDER BY datedebut";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            //1998 1999 2000 2001
            try
            {
                int NbToRead;
                if (NbWanted > 0)
                    NbToRead = NbWanted;
                else
                    NbToRead = Drc.Count;

                if (NbToRead > Drc.Count)
                    NbToRead = Drc.Count;

                //for (int Cpt = Drc.Count - NbToRead; Cpt < Drc.Count; Cpt++) //croissant
                for (int Cpt = Drc.Count - 1; Cpt >= (Drc.Count - NbToRead); Cpt--) //décroissant
                {
                    int currPk = Drc[Cpt]["PKREPARTITION"].ToString().ToInt32OrDefault();
                    infos.Add(GetInfosRepartImmByPkRepart(currPk));
                }
            }
            catch
            {
            }
            return infos;
#else
            // Date = date entree occupant : on ne prend que répart >= entree occupant
            List<infosRepartImm> infos = new List<infosRepartImm>();
            string Query = "SELECT PKREPARTITION, DATEDEBUT from REPARTITION " +
                            " WHERE FKIMMEUBLE = " + PkImmeuble +
                            " and nvl(ACTIF, 'O')<>'N' and STATUS='IMPORTED'" +
                            " and DATEDEBUT >= " + Date.QuotedStr() +
                            " ORDER BY DATEDEBUT";

            DataRowCollection Drc = WS_DBUtils.utils_LER.DBSelectRows(Query);
            //1998 1999 2000 2001
            try
            {
                int NbToRead;
                if (NbWanted > 0)
                    NbToRead = NbWanted;
                else
                    NbToRead = Drc.Count;

                if (NbToRead > Drc.Count)
                    NbToRead = Drc.Count;

                //for (int Cpt = Drc.Count - NbToRead; Cpt < Drc.Count; Cpt++) //croissant
                for (int Cpt = Drc.Count - 1; Cpt >= (Drc.Count - NbToRead); Cpt--) //décroissant
                {
                    int currPk = Convert.ToInt32(Drc[Cpt]["PKREPARTITION"]);
                    infos.Add(GetInfosRepartImmByPkRepart(currPk));
                }
            }
            catch
            {
            }
            return infos;
#endif
        }
        /// <summary>
        /// Retourne les informations de répartition d'un immeuble par PK répartition
        /// </summary>
        /// <param name="PkRepartition">PK répartition</param>
        /// <returns></returns>
        private static infosRepartImm GetInfosRepartImmByPkRepart(int PkRepartition)
        {
            // - repartition remplace par web_repartition
#if WS2
            infosRepartImm infosRepart = new infosRepartImm();
            string Query = $@"SELECT * FROM web_repartition WHERE pkrepartition= {PkRepartition} ";

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);

            if (Dr != null)
            {

                infosRepart.PkRepartition = Dr["PKREPARTITION"].ToString().ToInt32OrDefault();
                infosRepart.Tot_URepart = Dr["NBUNITEFRAIS1"].ToString().ToDecimalOrDefault();
                infosRepart.Tot_TantChauff = Dr["NBUNITEFRAIS2"].ToString().ToDecimalOrDefault();
                infosRepart.PU_Tant = Dr["PRIXUFRAIS2"].ToString().ToDecimalOrDefault();
                infosRepart.Prix_URepart = Dr["PRIXUFRAIS1"].ToString().ToDecimalOrDefault();
                infosRepart.Prix_Abonn = Dr["MTFRAIS4"].ToString().ToDecimalOrDefault();
                infosRepart.Mont_ARepartTant = Dr["MTFRAIS2"].ToString().ToDecimalOrDefault();
                infosRepart.Part_RepartConsos = Dr["MTFRAIS1"].ToString().ToDecimalOrDefault();
                infosRepart.CT_Combust = Dr["MTFRAIS3"].ToString().ToDecimalOrDefault();

                infosRepart.DateRepart = Dr["DATEREPART"].ToString().ToDateTime();
                infosRepart.DateDebut = Dr["DATEDEBUT"].ToString().ToDateTime();
                infosRepart.DateFin = Dr["DATEFIN"].ToString().ToDateTime();
            }
            return infosRepart;
#else
            infosRepartImm infosRepart = new infosRepartImm();
            string Query = $@"SELECT * FROM repartition WHERE pkrepartition= {PkRepartition} ";

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);

            if (Dr != null)
            {

                infosRepart.PkRepartition = Convert.ToInt32(Dr["PKREPARTITION"]);
                infosRepart.Tot_URepart = Convert.ToDecimal(Dr["NBUNITEFRAIS1"]);
                infosRepart.Tot_TantChauff = Convert.ToDecimal(Dr["NBUNITEFRAIS2"]);
                infosRepart.PU_Tant = Convert.ToDecimal(Dr["PRIXUFRAIS2"]);
                infosRepart.Prix_URepart = Convert.ToDecimal(Dr["PRIXUFRAIS1"]);
                infosRepart.Prix_Abonn = Convert.ToDecimal(Dr["MTFRAIS4"]);
                infosRepart.Mont_ARepartTant = Convert.ToDecimal(Dr["MTFRAIS2"]);
                infosRepart.Part_RepartConsos = Convert.ToDecimal(Dr["MTFRAIS1"]);
                infosRepart.CT_Combust = Convert.ToDecimal(Dr["MTFRAIS3"]);

                infosRepart.DateRepart = Convert.ToDateTime(Dr["DATEREPART"]);
                infosRepart.DateDebut = Convert.ToDateTime(Dr["DATEDEBUT"]);
                infosRepart.DateFin = Convert.ToDateTime(Dr["DATEFIN"]);
            }
            return infosRepart;
#endif
        }
        /// <summary>
        /// Récupère les informations des répartition pour un logement
        /// </summary>
        /// <param name="PkImmeuble">PK de l'immeuble</param>
        /// <param name="PkLogement">PK du logement</param>
        /// <param name="PkOccupant">PK de l'occupant (si PkOccupant = -1 : tout le logement) </param>
        /// <returns></returns>
        private static infosRepartLog GetInfosLastRepartLogement(int PkImmeuble, int PkLogement, int PkOccupant)
        {
            //WEBTODO :
            // - repartition_lgt remplace par web_repartition_lgt

#if WS2
            infosRepartLog infosRepart = new infosRepartLog();
            int PkRepartImm = GetLastPkRepartImmeuble(PkImmeuble);
            string Query = $@"SELECT sum(nbunitefrais1), sum(nbunitefrais2), sum(prixtotfrais1), sum(prixtotfrais2), sum(prixtotfrais3), sum(prixtotfrais4)
                                FROM web_repartition_lgt
                                WHERE fklogement= {PkLogement} 
                                AND fkrepartition= {PkRepartImm} ";

            if (PkOccupant != -1)
                Query += $@" AND fkoccupant= {PkOccupant} ";

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
            try
            {
                if (Dr != null)
                {
                    infosRepart.URepartLog = Dr["sum(NBUNITEFRAIS1)"].ToString().ToDecimalOrDefault();
                    infosRepart.TantLog = Dr["sum(NBUNITEFRAIS2)"].ToString().ToDecimalOrDefault();
                    infosRepart.Prix_ChauffTantLog = Dr["sum(PRIXTOTFRAIS2)"].ToString().ToDecimalOrDefault();
                    infosRepart.CT_ChauffLog = Dr["sum(PRIXTOTFRAIS1)"].ToString().ToDecimalOrDefault()
                            + Dr["sum(PRIXTOTFRAIS2)"].ToString().ToDecimalOrDefault()
                            + Dr["sum(PRIXTOTFRAIS3)"].ToString().ToDecimalOrDefault()
                            + Dr["sum(PRIXTOTFRAIS4)"].ToString().ToDecimalOrDefault();
                }
            }
            catch
            {
            }
            return infosRepart;

#else

            infosRepartLog infosRepart = new infosRepartLog();
            int PkRepartImm = GetLastPkRepartImmeuble(PkImmeuble);
            string Query = $@"SELECT sum(nbunitefrais1), sum(nbunitefrais2), sum(prixtotfrais1), sum(prixtotfrais2), sum(prixtotfrais3), sum(prixtotfrais4)
                                FROM repartition_lgt
                                WHERE fklogement= {PkLogement} 
                                AND fkrepartition= {PkRepartImm} ";

            if (PkOccupant != -1)
                Query += $@" AND fkoccupant= {PkOccupant} ";

            DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(Query);
            try
            {
                if (Dr != null)
                {
                    infosRepart.URepartLog = Convert.ToDecimal(Dr["sum(NBUNITEFRAIS1)"]);
                    infosRepart.TantLog = Convert.ToDecimal(Dr["sum(NBUNITEFRAIS2)"]);
                    infosRepart.Prix_ChauffTantLog = Convert.ToDecimal(Dr["sum(PRIXTOTFRAIS2)"]);
                    infosRepart.CT_ChauffLog = Convert.ToDecimal(Dr["sum(PRIXTOTFRAIS1)"])
                            + Convert.ToDecimal(Dr["sum(PRIXTOTFRAIS2)"])
                            + Convert.ToDecimal(Dr["sum(PRIXTOTFRAIS3)"])
                            + Convert.ToDecimal(Dr["sum(PRIXTOTFRAIS4)"]);
                }
            }
            catch
            {
            }
            return infosRepart;
#endif
        }
        /// <summary>
        /// Retourne une série de consommation tous les 15 jours
        /// N'est prévu pour fonctionner qu'avec répartiteurs
        /// </summary>
        /// <param name="TypeConteneur">TypeConteneur : I ou L ou C</param>
        /// <param name="PkConteneur">Pk du User, sinon Pk d'un immeuble, logement, syndic</param>
        /// <param name="TypeAppareil">Type d'appareil
        /// Valeurs possibles :
        /// "EAU"
        /// "EC"
        /// "EF"
        /// "EC+EF"
        /// "EF+EC"
        /// "REPART"
        /// "CET"</param>
        /// <param name="dateDebut">Date de début</param>
        /// <param name="dateFin">Date de fin</param>
        /// <param name="dju">Degré jours unifiés</param>
        /// <returns></returns>
        //
        private static serie GetSerieConsos15J(string TypeConteneur, int PkConteneur, string TypeAppareil, DateTime dateDebut, DateTime dateFin, decimal dju)
        {
            dateDebut = dateDebut.Date;
            dateFin = dateFin.Date;
            serie Serie = new serie();
            string ValeursXYL = "";
            bool hasValeurs = false;

            #region Select

            var project = new BsonDocument
                {
                    {
                        "$project",
                        new BsonDocument
                        {
                            {"DATEINDEX","$" + "_id." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX },
                            {"SOMMEINDEX","$SOMMEINDEX" }
                        }
                    }
                };
            #endregion


            #region Where

            int pkImmeuble = -1;
            switch (TypeConteneur)
            {
                case "C":
                    pkImmeuble = GetPKImmeubleByPkAppareil(PkConteneur);
                    break;
                case "L":
                    pkImmeuble = GetPKImmeubleByPKLogement(PkConteneur);
                    break;
                case "I":
                    pkImmeuble = PkConteneur;
                    break;
                default:
                    break;
            }
            immeuble imm = GetImmeubleByPk(pkImmeuble);
            if (imm.DateActivationClient > dateDebut)
                dateDebut = imm.DateActivationClient;
            if (imm.DateActivationClient > dateFin)
                dateFin = imm.DateActivationClient;
            DateTime dateAvant = dateDebut.AddMonths(-1);// servira pour avoir première conso

            Dictionary<string, object> matchList = new Dictionary<string, object>()
            {
                {Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,  Mongo_DBUtils.Between(dateAvant,dateFin)},
            };

            List<int> appareils;
            switch (TypeConteneur)
            {
                case "C":
                    matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, PkConteneur);
                    break;
                case "L":
                    appareils = GetPkAppareilsByPkLogement(PkConteneur, TypeAppareil);
                    matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(appareils)));
                    break;
                case "I":
                    appareils = GetPkAppareilsByPkImmeuble(PkConteneur, TypeAppareil);
                    matchList.Add(Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK, new BsonDocument().Add("$in", new BsonArray().AddRange(appareils)));
                    break;
                default:
                    break;
            }

            var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

            #endregion

            #region Group

            var groupCount = new BsonDocument
                    {
                        {
                            "$group",
                            new BsonDocument().Add("_id", new BsonDocument().Add(Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,"$" + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX)) //Group By this
                                              .Add("SOMMEINDEX",new BsonDocument().Add("$sum","$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD)) //
                        }
                    };

            #endregion

            #region Sort
            Dictionary<string, int> sortDic = new Dictionary<string, int>
                {
                    {"_id." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, -1 }
                };

            var sort = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortDic);
            #endregion

            var pipeline = new[] { match, groupCount, project, sort };

            DataRowCollection Rows = WS_DBUtils.utils_Mongo.MongoAggregateRows(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline);
            //récup index par dates
            Dictionary<DateTime, decimal> IndexsByDates = new Dictionary<DateTime, decimal>();
            foreach (DataRow Dr in Rows)
            {
                decimal sommeindex;
                try
                {
                    sommeindex = Convert.ToDecimal(Dr["SOMMEINDEX"]);
                }
                catch
                {
                    sommeindex = 0;
                }
                IndexsByDates.Add(Convert.ToDateTime(Dr["DATEINDEX"]), sommeindex);
            }

            // remplissage index, conso par saut de 15 jours

            int Annee = dateDebut.Year;
            int Mois = dateDebut.Month;

            DateTime currDate = new DateTime(Annee, Mois, 1);

            decimal LastIndex = 0;

            // récupération index d'avant période pour première conso:            
            DateTime dt = new DateTime(2021, 02, 28);

            DateTime dateTest = new DateTime(dateAvant.Year, dateAvant.Month, DateTime.DaysInMonth(dateAvant.Year, dateAvant.Month));

            if (dateTest >= dt)
            {
            }

            if (IndexsByDates.ContainsKey(dateTest))
                LastIndex = IndexsByDates[dateTest];
            while (currDate <= dateFin)
            {
                // on ajoute index/conso à collection si 15 du mois ou dernier jour du mois
                // 15 du mois
                dateTest = new DateTime(currDate.Year, currDate.Month, 15);
                if (IndexsByDates.ContainsKey(dateTest))
                {
                    indexTeleReleve idx = new indexTeleReleve
                    {
                        DateReleve = dateTest.Date,
                        Index = IndexsByDates[dateTest]
                    };
                    if (idx.Index > 0)
                        hasValeurs = true;
                    idx.Conso = idx.Index - LastIndex;
                    if (dju > 0)
                        idx.Conso /= dju;
                    string Virt = "N";

                    if (idx.Conso < 0 && LastIndex > 0)// conso<0 = nouvelle répartition ou baisse relevé
                    {
                        //verrue 09/11/2017 : parfois baisse taux de relève fait baisser somme d'index
                        decimal ratioIndex = (idx.Index / LastIndex) * 100;
                        if (ratioIndex > 50)//baisse de taux de relève si nouvel index> 50% du précédent (si c'est plus c'est que remise à 0)
                        {
                            idx.Conso = 0;//conso = 0, le dernier index ok restera le précédent
                            Virt = "O";
                        }
                        else//on est en fin de répartition, les index sont revenus 0 ou un peu au dessus
                        {
                            idx.Conso = idx.Index;// la conso sera égale au nouvel index
                        }
                    }
                    else//cas normal
                    {
                        LastIndex = idx.Index;
                    }
                    ValeursXYL += dateTest.ToString("dd/MM") + "|" + idx.Conso + "|" + idx.Index + "|VIRTUAL=" + Virt + ";";
                }
                // même code pour dernier jour du mois //TODO méthode ou boucle
                dateTest = new DateTime(currDate.Year, currDate.Month, DateTime.DaysInMonth(currDate.Year, currDate.Month));
                if (IndexsByDates.ContainsKey(dateTest))
                {
                    indexTeleReleve idx = new indexTeleReleve
                    {
                        DateReleve = dateTest.Date,
                        Index = IndexsByDates[dateTest]
                    };
                    if (idx.Index > 0)
                        hasValeurs = true;
                    idx.Conso = idx.Index - LastIndex;
                    if (dju > 0)
                        idx.Conso /= dju;
                    string Virt = "N";

                    if (idx.Conso < 0 && LastIndex > 0)// conso<0 = nouvelle répartition ou baisse relevé
                    {
                        decimal ratioIndex = (idx.Index / LastIndex) * 100;
                        if (ratioIndex > 50)//baisse de taux de relève si nouvel index> 50% du précédent (si c'est plus c'est que remise à 0)
                        {
                            idx.Conso = 0;//conso = 0, le dernier index ok restera le précédent
                            Virt = "O";
                        }
                        else//on est en fin de répartition, les index sont revenus 0 ou un peu au dessus
                        {
                            idx.Conso = idx.Index;// la conso sera égale au nouvel index
                        }
                    }
                    else//cas normal
                    {
                        LastIndex = idx.Index;
                    }
                    ValeursXYL += dateTest.ToString("dd/MM") + "|" + idx.Conso + "|" + idx.Index + "|VIRTUAL=" + Virt + ";";
                }
                currDate = currDate.AddMonths(1);
            }

            if (hasValeurs == true) // si il y a au moins un index >0
            {
                ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
                Serie.ValeursXYL = ValeursXYL;

                TimeSpan difference = dateFin - dateDebut;
                Serie.DefaultIntervalle = difference.Days + 1;
            }
            int Year = dateFin.Year;
            Serie.Annee = Year.ToString();

            return Serie;
        }
        #endregion

        #region Capteurs
        /// <summary>
        /// Retourne l'index récapitualtif (Moyenne, maximum, minimum) pour un capteur 
        /// </summary>                                      
        /// <param name="TypeConteneur">Type de conteneur   
        /// L ou I</param>
        /// <param name="PkConteneur"> PK conteneur</param>
        /// <param name="Unite">Unité</param>
        /// <param name="date">Date de la requête</param>
        /// <returns></returns>
        public static indexRecapDate GetIndexRecapCapteur(string TypeConteneur, int PkConteneur, UnitesFk Unite, DateTime date)
        {
            date = date.Date;
            indexRecapDate indexRecap = new indexRecapDate
            {
                Date = DateTime.MinValue.Date,
                Max = -1,
                Min = -1,
                Moy = -1
            };
            try
            {

                #region GroupBy avec distinct

                var groupDistinct = new BsonDocument
                {
                    {
                        "$group",
                        new BsonDocument
                        {
                            {"_id", new BsonDocument().Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK,"$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK)},
                        }
                    }
                };
                #endregion

                #region Where pour la table Join

                Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                {
                    {Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,  date},
                    {Mongo_DBUtils.INDEXCONSOTCH.UNITE_FK,  (decimal)Unite}
                };
                #endregion

                #region Join 
                BsonDocument lookup4Join, unwind4Join, match4Join;

                string aliasJoinTable = "indexHisto";

                WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName
                                                , "_id." + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK
                                                , Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK
                                                , aliasJoinTable
                                                , matchList4Join, out lookup4Join, out unwind4Join, out match4Join);

                #endregion

                #region Where
                Dictionary<string, object> matchList = new Dictionary<string, object>
                {
                    {Mongo_DBUtils.STRUCTURE.ARTICLE_FKSOUSFAMILLE,  241},
                };

                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                #endregion

                #region GroupBy

                var group = new BsonDocument
                {
                    {
                        "$group",
                        new BsonDocument
                        {
                            {"_id", new BsonDocument().Add(Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,"$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX)},
                            {"MOY", new BsonDocument().Add("$avg", "$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD) }
                        }
                    }
                };
                #endregion

                #region Select

                Dictionary<string, object> projectDic = new Dictionary<string, object>
                {
                            {"MOY",1 }
                };
                var project = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);
                #endregion

                #region Calcul Moyenne
                Dictionary<string, object> matchList4Join2 = new Dictionary<string, object>
                {
                    {aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.INDEXTYPE_FK,  (decimal)IndexTypeFk.Average},
                };

                var match4Join2 = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4Join2);

                var pipeline = new[] { match, groupDistinct, lookup4Join, unwind4Join, match4Join, match4Join2, group, project };

                DataTable dtAggregate = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline);

                if (dtAggregate != null && dtAggregate.Rows.Count > 0)
                {
                    indexRecap.Moy = Math.Round(Convert.ToDecimal(dtAggregate.Rows[0]["MOY"]), 2);
                }
                #endregion

                #region Calcul Minimum
                Dictionary<string, object> matchList4Join3 = new Dictionary<string, object>
                {
                    {aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.INDEXTYPE_FK,  (decimal)IndexTypeFk.Min},
                };

                var match4Join3 = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4Join3);

                var pipeline2 = new[] { match, groupDistinct, lookup4Join, unwind4Join, match4Join, match4Join3, group, project };

                dtAggregate = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline2);
                if (dtAggregate != null && dtAggregate.Rows.Count > 0)
                {
                    indexRecap.Min = Math.Round(Convert.ToDecimal(dtAggregate.Rows[0]["MOY"]), 2);
                }
                #endregion

                #region Calcul Maximum
                Dictionary<string, object> matchList4Join4 = new Dictionary<string, object>
                {
                    {aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.INDEXTYPE_FK,  (decimal)IndexTypeFk.Max},
                };

                var match4Join4 = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList4Join4);
                var pipeline3 = new[] { match, groupDistinct, lookup4Join, unwind4Join, match4Join, match4Join4, group, project };

                dtAggregate = WS_DBUtils.utils_Mongo.MongoAggregate(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline3);
                if (dtAggregate != null && dtAggregate.Rows.Count > 0)
                {
                    indexRecap.Max = Math.Round(Convert.ToDecimal(dtAggregate.Rows[0]["MOY"]), 2);
                }
                #endregion

            }
            catch { }
            if (indexRecap.Moy != -1)
                indexRecap.Date = date;
            return indexRecap;
        }
        /// <summary>
        /// Retourne une série de consommation pour les capteurs d'un immeuble
        /// </summary>
        /// <param name="PkImmeuble">Pk de l'immeuble</param>
        /// <param name="FkUnite">PK de l'unité</param>
        /// <param name="date">Date de la demande</param>
        /// <returns></returns>
        public static serie GetSerieCapteurByImmeuble(int PkImmeuble, int FkUnite, DateTime date)
        {
            serie Serie = new serie();
            string ValeursXYL = "";
            date = date.Date;
            int annee = date.Year;
            DateTime datedeb = new DateTime(annee, 1, 1).Date;

            #region Where
            Dictionary<string, object> matchList = new Dictionary<string, object>
            {
                {Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK,  PkImmeuble},
                {Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,  new BsonDocument().Add ("$gte", datedeb)},
                {Mongo_DBUtils.INDEXCONSOTCH.UNITE_FK,   (decimal)FkUnite},
                {Mongo_DBUtils.INDEXCONSOTCH.INDEXTYPE_FK,   (decimal)1}
            };

            var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

            #endregion

            #region Select

            Dictionary<string, object> projectDic = new Dictionary<string, object>
            {
                        { "year", "$_id.year" },
                        { "month","$_id.month"},
                        { "MOY",1 }
            };
            var project = WS_DBUtils.utils_Mongo.Project2BsonDocument(projectDic);
            #endregion

            #region GroupBy

            var group = new BsonDocument
            {
                {
                    "$group",
                    new BsonDocument
                    {
                        {"_id", new BsonDocument().Add("year", new BsonDocument().Add("$year","$" + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX))
                                                    .Add("month", new BsonDocument().Add("$month","$" + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX))
                        },
                        {"MOY", new BsonDocument().Add("$avg", "$" + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD) }
                    }
                }
            };
            #endregion

            #region Sort
            Dictionary<string, int> sortDic = new Dictionary<string, int>
                {
                    {Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, 1 },
                };

            var sort = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortDic);
            #endregion

            Dictionary<string, indexMois> IndexsMois = new Dictionary<string, indexMois>();
            DateTime CurrDate = datedeb;

            for (int i = 1; i <= 12; i++)
            {
                string Key = CurrDate.Year.ToString() + "-" + CurrDate.Month.ToString().PadLeft(2, '0');
                IndexsMois.Add(Key, new indexMois { Key = Key, Annee = CurrDate.Year, Mois = CurrDate.Month, Virtual = false, Visible = false });
                CurrDate = CurrDate.AddMonths(1);
            }

            var pipeline = new[] { match, sort, group, project };

            DataRowCollection Rows = WS_DBUtils.utils_Mongo.MongoAggregateRows(Mongo_DBUtils.INDEXCONSOTCH.CollectionName, pipeline);

            foreach (DataRow Dr in Rows)
            {
                string moisFromDr = Dr["year"].ToString() + "-" + Dr["month"].ToString().PadLeft(2, '0');

                if (IndexsMois.ContainsKey(moisFromDr))
                {
                    IndexsMois[moisFromDr].Key = moisFromDr;
                    IndexsMois[moisFromDr].Index = Convert.ToDecimal(Dr["MOY"]);
                    IndexsMois[moisFromDr].Conso = Convert.ToDecimal(Dr["MOY"]);
                    IndexsMois[moisFromDr].Mois = Convert.ToInt32(moisFromDr.Substring(5, 2));
                    IndexsMois[moisFromDr].Virtual = false;
                    IndexsMois[moisFromDr].Visible = true;
                }
            }

            CurrDate = datedeb;
            for (int i = 1; i <= 12; i++)
            {
                string Key = CurrDate.Year.ToString() + "-" + CurrDate.Month.ToString().PadLeft(2, '0');
                indexMois idx = IndexsMois[Key];
                //string MoisFinal =
                string option = "VISIBLE=N";
                if (idx.Visible)
                    option = "VISIBLE=O";

                ValeursXYL += GetStringMois(idx.Mois) + "|" + idx.Conso.ToString().Replace(",", ".") +
                        "|" + idx.Index.ToString().Replace(",", ".") +
                        "|" + option + ";";
                CurrDate = CurrDate.AddMonths(1);
            }
            Serie.ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
            Serie.DefaultIntervalle = 12;
            Serie.Annee = annee.ToString();
            return Serie;
        }
        /// <summary>
        /// Retourne une série de consommation pour les capteurs d'un logement
        /// </summary>
        /// <param name="PkLogement">PK du logement</param>
        /// <param name="FkUnite">PK de l'unité</param>
        /// <param name="Date1">Date de début</param>
        /// <param name="Date2">Date de fin</param>
        /// <returns></returns>
        public static serie GetSerieCapteurByLogement(int PkLogement, int FkUnite, DateTime Date1, DateTime Date2)
        {
            Date1 = Date1.Date;
            Date2 = Date2.Date;
            serie SerieConsos = new serie();

            try
            {//on prend moyenne au cas où plusieurs capteurs dans logement

                #region GroupBy avec distinct

                var groupDistinct = new BsonDocument
                {
                    {
                        "$group",
                        new BsonDocument
                        {
                            {"_id", new BsonDocument().Add(Mongo_DBUtils.STRUCTURE.COMPTEUR_PK,"$" + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK)},
                        }
                    }
                };
                #endregion

                #region Where pour la table Join

                Dictionary<string, object> matchList4Join = new Dictionary<string, object>
                {
                    {Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,  Mongo_DBUtils.Between(Date1,Date2)},
                    {Mongo_DBUtils.INDEXCONSOTCH.UNITE_FK,   (decimal) FkUnite},
                    {Mongo_DBUtils.INDEXCONSOTCH.INDEXTYPE_FK,   (decimal) 1}
                };

                #endregion

                #region Join 

                string aliasJoinTable = "indexHisto";

                WS_DBUtils.utils_Mongo.MongoRightJoinOn(Mongo_DBUtils.INDEXCONSOTCH.CollectionName
                                                , "_id." + Mongo_DBUtils.STRUCTURE.COMPTEUR_PK
                                                , Mongo_DBUtils.INDEXCONSOTCH.COMPTEUR_FK
                                                , aliasJoinTable
                                                , matchList4Join, out BsonDocument lookup4Join, out BsonDocument unwind4Join, out BsonDocument match4Join);

                #endregion

                #region Where
                Dictionary<string, object> matchList = new Dictionary<string, object>
                {
                    {Mongo_DBUtils.STRUCTURE.LOGEMENT_FK,  PkLogement},
                };

                var match = WS_DBUtils.utils_Mongo.Match2BsonDocument(matchList);

                #endregion

                #region GroupBy

                var group = new BsonDocument
                {
                    {
                        "$group",
                        new BsonDocument
                        {
                            {"_id", new BsonDocument().Add(Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX,"$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX)},
                            {"MOYMOY", new BsonDocument().Add("$avg", "$" + aliasJoinTable + "." + Mongo_DBUtils.INDEXCONSOTCH.THEINDEXD) }
                        }
                    }
                };
                #endregion

                #region Select

                var project = new BsonDocument
                {
                    {
                        "$project",
                        new BsonDocument
                        {
                            {"DATEINDEX", "$_id." + Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX },
                            {"MOYMOY",1 }
                        }
                    }
                };
                #endregion

                #region Sort
                Dictionary<string, int> sortDic = new Dictionary<string, int>
                {
                    {"DATEINDEX", 1 },
                };

                var sort = WS_DBUtils.utils_Mongo.Sort2BSonDocument(sortDic);
                #endregion

                var pipeline = new[] { match, groupDistinct, lookup4Join, unwind4Join, match4Join, group, project, sort };

                DataRowCollection Drc = WS_DBUtils.utils_Mongo.MongoAggregateRows(Mongo_DBUtils.STRUCTURE.CollectionName, pipeline);

                string ValeursXYL = "";
                bool hasValeurs = false;

                // création des indexs non relevés (dans l'intervalle Date1 et Date2 et (aussi entre le plus petit et le plus grand index))
                DateTime DateIndexMin;
                DateTime DateIndexMax;
                int NbJours = 0;
                if (Drc.Count > 0)
                {
                    DateIndexMin = Convert.ToDateTime(Drc[0]["DATEINDEX"]);
                    DateIndexMax = Convert.ToDateTime(Drc[Drc.Count - 1]["DATEINDEX"]);
                    TimeSpan difference = DateIndexMax - DateIndexMin;
                    NbJours = difference.Days;
                }
                foreach (DataRow Dr in Drc)
                {
                    indexTeleReleve idx = new indexTeleReleve();
                    string option = "";
                    try
                    {
                        idx.DateReleve = Convert.ToDateTime(Dr["DATEINDEX"].ToString());
                        idx.Index = Convert.ToDecimal(Dr["MOYMOY"].ToString());
                        hasValeurs = true;
                    }
                    catch
                    {
                        option = "VISIBLE=N";
                    }

                    ValeursXYL += idx.DateReleve.ToString("dd/MM/yyyy") + "|" + idx.Index.ToString() + "|" + idx.Index.ToString() + option;
                    ValeursXYL += ";";
                }

                if (hasValeurs == true)
                {
                    ValeursXYL = ValeursXYL.Trim(";".ToCharArray());
                    SerieConsos.ValeursXYL = ValeursXYL;
                    SerieConsos.DefaultIntervalle = NbJours;
                }
            }
            catch (Exception Ex)
            {
                SerieConsos.Erreur = Ex.Message;
            }
            return SerieConsos;
        }

        #endregion

        #region Ticket Inter
        /// <summary>
        /// Retourne le nombre d'intervention pour un logement
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">PK Logement</param>
        /// <param name="ParamsFiltres">Filtres </param>
        /// <returns></returns>
        public static int GetNbTicketsInterByLogement(string SessionID, int PkUser, int PkLogement, string ParamsFiltres)
        {
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

        /// <summary>
        /// Retourne un ticket d'intervention initialisé avec les informations du logement
        /// à la création d'un ticket, permet de récupérer les données par logement 
        /// pour les afficher, par défaut, dans le formulaire
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk du logement</param>
        /// <returns></returns>
        public static ticketInterInit GetTicketInterInit(string SessionID, int PkUser, int PkLogement)
        {
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
#else
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
                    int PkOccupant = GetPkOccupantByPkLogement(PkLogement, DateTime.Now);
                    if (PkOccupant > 0)
                    {
                        string Query =
        $@"SELECT nom, telfixe, telmobile, email
FROM occupant
WHERE pkoccupant= {PkOccupant} ";

                        DataRow drOccupant = WS_DBUtils.utils_LER.DBSelectRow(Query);
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
#endif
        }
        /// <summary>
        /// Initialise le statut du ticket
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="CaseId">Id du case</param>
        /// <param name="StatutClient">Nouveau statut</param>
        /// <returns></returns>
        public static bool SetTicketStatut(string SessionID, int PkUser, string CaseId, string StatutClient)
        {
            if (session.checkSession(SessionID, PkUser) == false)
            {
                return false;
            }
            if (CheckTicket(SessionID, PkUser, CaseId) == false)
                return false;

            if (!string.IsNullOrEmpty(StatutClient))
            {
                WS_DBUtils.utils_SF.DBUpdate(
                    "Case", CaseId,
                    new { StatutClient__c = StatutClient });
                return true;
            }
            else
            {
                return false;
            }
        }
        /// <summary>
        /// Crée un ticket dans LER  + une requete SalesForce
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connect</param>
        /// <param name="PkLogement">Pk du logement</param>
        /// <param name="Objet">Objet du ticket</param>
        /// <param name="Nom">Nom</param>
        /// <param name="Email">Email</param>
        /// <param name="TelFixe">Téléphone fixe</param>
        /// <param name="TelMobile">Téléphone Mobile</param>
        /// <param name="MotifLibre">Motif</param>
        /// <param name="AttachmentName">Nom de la pièce jointe</param>
        /// <param name="AttachmentContent">Contenu de la pièce jointe</param>
        /// <returns>On retourne le nombre de ticket du logement ou -1 si erreur</returns>
        public static int CreateTicketInter(string SessionID, int PkUser, int PkLogement, string Objet, string Nom, string Email, string TelFixe, string TelMobile, string MotifLibre, string AttachmentName, Byte[] AttachmentContent)
        {
            int Nb = -1;//on retournera le nombre de ticket du logement ou -1 si erreur
            if (session.checkSession(SessionID, PkUser) == false)
            {
                Nb = -2;
            }
            //A retirer PkLogement quand PkLogement = -1 réglé.
            else if (PkLogement != -1 && !CheckLogement(PkUser, PkLogement))//check logement / user //new 07/05/2018
            {
                Nb = -3;
            }
            else if (IsUserDemo(GetUserByPk(PkUser)))//ne pas créér de ticket sur le vrai client depuis le compte de démo
            {
                Nb = -4;
            }
            else
            {
                user u = GetUserByPk(PkUser);
                if (u.UserType != "G" && u.UserType != "C")
                {
                    Nb = -5;
                }
                else
                {
                    //immeuble imm = GetImmeubleByPk(GetPKImmeubleByPKLogement(PkLogement));
                    string recordId = CreateTicketInter4SalesForce(SessionID, PkUser, PkLogement, Objet, Nom, Email, TelFixe, TelMobile, MotifLibre);
                    if (!string.IsNullOrEmpty(recordId))
                    {

                    }
                    else
                    {
                        Nb = -6;
                    }
                }
            }
            return Nb;
        }

        /// <summary>
        /// Crée un Case dans SF
        /// </summary>
        /// <param name="sessionID">Identificateur de session</param>
        /// <param name="pkUser">PK de l'utilisateur connecté</param>
        /// <param name="pkLogement"></param>
        /// <param name="objet">Objet du ticket</param>
        /// <param name="nom">Nom</param>
        /// <param name="email">Email</param>
        /// <param name="telFixe">Téléphone fixe</param>
        /// <param name="telMobile">Téléphone Mobile</param>
        /// <param name="motifLibre">Motif</param>
        /// <returns>retourne l'id du Case créé</returns>
        public static string CreateTicketInter4SalesForce(string sessionID, int pkUser, int pkLogement, string objet, string nom, string email, string telFixe, string telMobile, string motifLibre)
        {
            try
            {
                user userLogge = GetUserByPk(pkUser);
                DataRow dr = WS_DBUtils.utils_SF.DBSelectRow($@"SELECT id, immeuble__c FROM logement__c WHERE pkler__c = 'LOG_{pkLogement}'");
                string IdLogement = dr["_Id"].ToString();
                string IdImmeuble = dr["_Immeuble__c"].ToString();
                string Id = WS_DBUtils.utils_SF.DBInsert("Case",
                    new
                    {
                        Subject = objet,
                        SuppliedName = nom,
                        SuppliedEmail = email,
                        SuppliedPhone = (string.IsNullOrEmpty(telMobile) ? telFixe : telMobile),
                        Description = motifLibre,
                        Logement__c = IdLogement,
                        Immeuble__c = IdImmeuble,
                        Nom_demandeur__c = userLogge.UserName,
                        E_mail_demandeur__c = userLogge.EMail,
                        Pr_nom_demandeur__c = userLogge.FirstName,
                        R_le_demandeur__c = userLogge.UserRole,
                        T_l_phone_demandeur__c = userLogge.PhoneNumber,
                        Origin = "Web",
                        Type = "Intervention"
                    });
                string QueueId = WS_DBUtils.utils_SF.DBSelect("select Id From Group Where Name = 'Service client' and Type='Queue'");
                WS_DBUtils.utils_SF.DBUpdate("Case", Id, new { OwnerId = QueueId });
                return Id;
            }
            catch //(Exception ex)
            {
                return String.Empty;
            }
        }
        /// <summary>
        /// Retourne le nombre de tickets d'intervention pour un utilisateur donné
        /// </summary>
        /// <param name="sessionID">Identificateur de session</param>
        /// <param name="pkUser">PK de l'utilisateur</param>
        /// <returns></returns>
        internal static int GetNbTicketsIntersUser(string sessionID, int pkUser)
        {
            return GetTicketsIntersUser(sessionID, pkUser, "").ListeTicketsInter.Count();
        }

        /// <summary>
        /// Retourne la liste des tickets (statut mis à jour) d'un user
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connect</param>
        /// <param name="ParamsFiltres">Filtres (si vide : pas de filtre)
        /// SHOWALL : Tout afficher ('O' : oui ou 'N' : non)</param>
        /// <returns></returns>
        public static ticketsInter GetTicketsIntersUser(string SessionID, int PkUser, string ParamsFiltres)
        {
            ticketsInter tickets = new ticketsInter();

            if (session.checkSession(SessionID, PkUser) == false)
                return tickets;

            ParamsString Pfiltres = new ParamsString(ParamsFiltres);

            List<long> pksImmeubles = new List<long>();

            DataRowCollection drcImmGest = WS_DBUtils.utils_LER.DBSelectRows(GetQueryImmeubles("PKIMMEUBLE", "U", PkUser));
            string listImmeubles = string.Join(", ", drcImmGest.OfType<DataRow>().Select(r => ("IMM_" + r["PKIMMEUBLE"].ToString()).QuotedStr()));

            string showAll = Pfiltres.GetParam("SHOWALL");

            string filtres = "";
            if (string.IsNullOrEmpty(showAll) || showAll == "N")
            {
                filtres = " AND Case.StatutClient__c <> 'Clos' ";
            }

            if (drcImmGest != null && drcImmGest.Count > 0)
            {
                string query =
                    $@"select Id, CaseNumber, Subject, Description, SuppliedName,  SuppliedEmail, SuppliedPhone,
toLabel(Status), StatutClient__c, CreatedDate, LastModifiedDate,
immeuble__r.PKLER__c, immeuble__r.IdentifiantImmeuble__c, 
Logement__r.PKLER__c, Logement__r.CodeGestionnaire__c,
Nom_demandeur__c, E_mail_demandeur__c, Pr_nom_demandeur__c, R_le_demandeur__c, T_l_phone_demandeur__c,
(select WorkOrderNumber from workorders)
from Case
where Type = 'Intervention'
and Origin = 'Web'
and immeuble__r.PKLER__c in ({listImmeubles})
{filtres}";

                DataTable Cases = WS_DBUtils.utils_SF.DBSelectTable(query);

                foreach (DataRow Case in Cases.Rows)
                {
                    ticketInter ti = new ticketInter
                    {
                        Email = Case["_SuppliedEmail"].ToString()
                    };
                    if (Cases.Columns.Contains("_Logement__r_PKLER__c") && Case["_Logement__r_PKLER__c"] != DBNull.Value)
                        ti.FkLogement = Convert.ToInt32(Case["_Logement__r_PKLER__c"].ToString().Replace("LOG_", ""));
                    if (Cases.Columns.Contains("_Logement__r_CodeGestionnaire__c"))
                        ti.RefLogement = Case["_Logement__r_CodeGestionnaire__c"].ToString();
                    ti.MotifLibre = Case["_Description"].ToString();
                    ti.Nom = Case["_SuppliedName"].ToString();
                    ti.Statut = Case["_Status"].ToString();
                    ti.TelFixe = Case["_SuppliedPhone"].ToString();
                    ti.TicketDate = Convert.ToDateTime(Case["_CreatedDate"]);

                    if (Cases.Columns.Contains("_WorkOrders_records"))
                    {
                        DataTable workOrders = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(Case["_WorkOrders_records"].ToString());
                        if (workOrders.Rows.Count > 0)
                            ti.NumIntervention = workOrders.Rows[0]["_WORKORDERNUMBER"].ToString();
                    }
                    ti.ObjetRetour = Case["_Subject"].ToString();
                    ti.CaseNumber = Case["_CaseNumber"].ToString();
                    ti.CaseId = Case["_Id"].ToString();
                    ti.WebUser_Nom = Case["_Nom_demandeur__c"].ToString();
                    ti.WebUser_Prenom = Case["_Pr_nom_demandeur__c"].ToString();
                    ti.WebUser_Tel = Case["_T_l_phone_demandeur__c"].ToString();
                    ti.WebUser_Email = Case["_E_mail_demandeur__c"].ToString();
                    ti.Imm_Id = Case["_immeuble__r_IdentifiantImmeuble__c"].ToString();
                    if (Case["_immeuble__r_PKLER__c"] != DBNull.Value)
                        ti.FkImmeuble = Convert.ToInt32(Case["_immeuble__r_PKLER__c"].ToString().Replace("IMM_", ""));
                    ti.Statut_Client = Case["_StatutClient__c"].ToString();
                    ti.LastUpdateDate = Convert.ToDateTime(Case["_LastModifiedDate"]);
                    tickets.ListeTicketsInter.Add(ti);
                }
            }
            else
            {
                ticketInter tis = new ticketInter
                {
                    FkImmeuble = -1
                };
                tickets.ListeTicketsInter.Add(tis);
            }
            return tickets;
        }
        /// <summary>
        /// Vérifie si le client peut faire du E-ticketing 
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <returns></returns>
        public static bool CheckTicketsInterEnabled(string SessionID, int PkUser)
        {
            //WEBTODO :
            // - client remplace par web_client
#if WS2
            if (session.checkSession(SessionID, PkUser) == false)
            {
                return false;//ret="erreur incohérence user / session";
            }
            else
            {
                string Query = $@"SELECT web_client.espaceclient_ticketinter
                                FROM web_client, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
                                WHERE web_user.pkweb_user = {PkUser} 
                                    AND web_user.fkclient = web_client.pkclient";

                return WS_DBUtils.utils_LER.DBSelect(Query).ToBooleanOrDefault();
            }
#else
            bool enabled;
            if (session.checkSession(SessionID, PkUser) == false)
            {
                enabled = false;//ret="erreur incohérence user / session";
            }
            else
            {
                enabled = GetClientByPkUser(PkUser).TicketsInterEnabled;
            }
            return enabled;
#endif
        }
        /// <summary>
        /// Vérifie que l'utilisateur a bien le droit d'accéder à ce ticket
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="CaseId">Id du case</param>
        /// <returns></returns>
        private static bool CheckTicket(string SessionID, int PkUser, string CaseId)
        {
            if (session.checkSession(SessionID, PkUser) == false)
                return false;

            // on récupère l'immeuble du ticket
            int fkimmeuble = Convert.ToInt32(WS_DBUtils.utils_SF.DBSelect(
                $@"SELECT Immeuble__r.PKLER__c 
FROM Case
WHERE Id = {CaseId.QuotedStr()}").Replace("IMM_", ""));

            // on récupère tous les imm autorisés pour le user
            DataRowCollection drcImmGest = WS_DBUtils.utils_LER.DBSelectRows(GetQueryImmeubles("pkimmeuble", "U", PkUser));

            // l'immeuble doit faire partie des imm autorisés
            bool ok = false;
            foreach (DataRow r in drcImmGest)
                if (Convert.ToInt32(r["PKIMMEUBLE"].ToString()) == fkimmeuble)
                    ok = true;

            return ok;
        }

        #endregion

        #region Client

        /// <summary>
        /// Retourne un objet représentant un client initialisé avec les informations rentrées en paramètre 
        /// </summary>
        /// <param name="DrCli">Ligne de données </param>
        /// <returns></returns>
        private static client GetClientByRow(DataRow DrCli)
        {
            client Cli = new client
            {
                PkClient = Convert.ToInt32(DrCli["PKCLIENT"].ToString()),
                Nom = DrCli["NOM"].ToString(),
                ID = DrCli["ID"].ToString(),
                Adresse1 = DrCli["ADRESSE1"].ToString(),
                Adresse2 = DrCli["ADRESSE2"].ToString(),
                Adresse3 = DrCli["ADRESSE3"].ToString(),
                Cp = DrCli["CP"].ToString(),
                Ville = DrCli["VILLE"].ToString(),
                TicketsInterEnabled = DrCli["TICKETINTER"].ToBooleanOrDefault()
            };
            return Cli;
        }
        /// <summary>
        /// Retourne les informations d'un client en fonction de son PK
        /// </summary>
        /// <param name="PkClient">PK client</param>
        /// <returns></returns>
        private static client GetClientByPkClient(int PkClient)
        {
            //WEBTODO :
            // - client remplace par web_client
#if WS2
            client Cli;
            try
            {
                string Query = $@"SELECT web_client.pkclient, web_client.nom, web_client.id, web_client.adresse1, web_client.adresse2, web_client.adresse3, web_client.cp, web_client.ville, web_client.espaceclient_ticketinter AS ticketinter
                                FROM web_client
                                WHERE pkclient= {PkClient} ";

                DataRow DrCli = WS_DBUtils.utils_LER.DBSelectRow(Query);
                Cli = GetClientByRow(DrCli);
            }
            catch
            {
                Cli = new client();//Vide plutôt que pas instancié
            }
            return Cli;
#else
            client Cli;
            try
            {
                string Query = $@"SELECT pkclient, client.nom, client.id, client.adresse1, client.adresse2, client.adresse3, client.cp, client.ville, client.ticketinter
                                FROM client
                                WHERE pkclient= {PkClient} ";

                DataRow DrCli = WS_DBUtils.utils_LER.DBSelectRow(Query);
                Cli = GetClientByRow(DrCli);
            }
            catch
            {
                Cli = new client();//Vide plutôt que pas instancié
            }
            return Cli;
#endif
        }
        /// <summary>
        /// Retourne le client associé à l'utilisateur
        /// </summary>
        /// <param name="PkUser">Pk de l'utilisateur</param>
        /// <returns></returns>
        private static client GetClientByPkUser(int PkUser)
        {
            client Cli;
            try
            {
                Cli = GetClientByPkClient(GetUserByPk(PkUser).FKClient);//donc pour C = FkClient, G = FKPARENTUSER
            }
            catch
            {
                Cli = new client();//Vide plutôt que pas instancié
            }
            return Cli;
        }
        /// <summary>
        /// Retourne le pk du client parent
        /// </summary>
        /// <param name="PKClient">PK du client</param>
        /// <returns></returns>
        public static int GetPKClientTop(int PKClient)
        {
            //WEBTODO :
            // - client remplace par web_client
#if WS2
            string spk = WS_DBUtils.utils_LER.DBSelect($@"SELECT web_client.pkclient
                                                        FROM web_client
                                                        WHERE web_client.fkclient is null
                                                        start with web_client.pkclient = {PKClient} 
                                                        connect by prior web_client.fkclient = web_client.pkclient");
            if ((spk != "") && (spk.ToLower() != "null"))
                return Convert.ToInt32(spk);
            else return -1;
#else
            string spk = WS_DBUtils.utils_LER.DBSelect($@"SELECT pkclient
                                                        FROM client
                                                        WHERE client.fkclient is null
                                                        start with client.pkclient = {PKClient} 
                                                        connect by prior client.fkclient = pkclient");
            if ((spk != "") && (spk.ToLower() != "null"))
                return Convert.ToInt32(spk);
            else return -1;
#endif
        }

        #endregion

        #region factures
        /// <summary>
        /// Retourne la liste des factures pour un utilisateur
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <returns></returns>
        public static factures getFactures(string SessionID, int PkUser)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - client remplace par web_client
            // - facture remplace par web_facture

#if WS2
            factures facturesList = new factures();
            if (session.checkSession(SessionID, PkUser) == false) return facturesList;

            user u = GetUserByPk(PkUser);
            if (u.UserType != "C") return facturesList;

            int fkclient = u.FKClient;
            if (fkclient <= 0) return facturesList;

            string espaceclient_gestion = GetTypeGestion(fkclient, "C").ToLower();

            DataTable dtFact = WS_DBUtils.utils_LER.DBSelectTable(
            $@"SELECT f.pkfacture, f.numdecompte, f.dateedition, f.debutperiode, f.finperiode, f.ht, f.ttc, f.totalapayer,
NVL(idi, web_immeuble.id) as idimm,
NVL(adressei, web_immeuble.adresse) as adresseIMM,
NVL(cpi, web_immeuble.cp) as cpimm,
NVL(villei, web_immeuble.ville) as villeimm,
NVL(codegestioi, web_immeuble.codegestio) as codegestioimm
FROM (
SELECT web_facture.pkfacture, web_facture.numdecompte, web_facture.dateedition,
web_facture.debutperiode, web_facture.finperiode, web_facture.ht, web_facture.ttc, web_facture.totalapayer,
LISTAGG(web_immeuble.id, ';') WITHIN GROUP (ORDER BY web_immeuble.ID) as IDI,
LISTAGG(web_immeuble.codegestio, ';') WITHIN GROUP (ORDER BY web_immeuble.codegestio) as codegestioi, 
LISTAGG(web_immeuble.adresse, ';') WITHIN GROUP (ORDER BY web_immeuble.adresse) as adressei, 
LISTAGG(web_immeuble.cp, ';') WITHIN GROUP (ORDER BY web_immeuble.cp) as cpi, 
LISTAGG(web_immeuble.ville, ';') WITHIN GROUP (ORDER BY web_immeuble.ville) as villei, 
web_facture.fkimmeuble
FROM web_facture, web_immeuble, web_client, (select fkimmeuble, fkfacture FROM lignefacture GROUP BY fkfacture, fkimmeuble) l
WHERE web_facture.fkclienttop = {fkclient}
AND web_facture.fkclienttop = web_client.pkclient
{(espaceclient_gestion == "client" ? "AND web_client.espaceclient_showfactures='O'" : "AND web_immeuble.espaceclient_showfactures='O'")}
AND l.fkfacture(+) = pkfacture AND l.fkimmeuble = web_immeuble.pkimmeuble(+)
AND web_facture.dateedition > sysdate - 2*365
GROUP BY web_facture.pkfacture, web_facture.numdecompte, web_facture.dateedition, 
web_facture.fkimmeuble, web_facture.debutperiode, web_facture.finperiode, web_facture.ht, web_facture.ttc,
web_facture.totalapayer
ORDER BY pkfacture DESC) f, web_immeuble
WHERE  f.fkimmeuble = pkimmeuble(+)");

            foreach (DataRow rowFact in dtFact.Rows)
            {
                facture fact = new facture
                {
                    PKFacture = rowFact["PKFACTURE"].ToString().ToInt32OrDefault(),
                    NumFacture = rowFact["NUMDECOMPTE"].ToString(),
                    DateEdition = rowFact["DATEEDITION"].ToString().ToDateTime(),
                    DateDebut = rowFact["DEBUTPERIODE"].ToString().ToDateTime(),
                    DateFin = rowFact["FINPERIODE"].ToString().ToDateTime(),
                    MontantTotalHT = rowFact["HT"].ToString().ToDecimalOrDefault(),
                    MontantTotalTTC = rowFact["TTC"].ToString().ToDecimalOrDefault(),
                    MontantTotalAPayer = rowFact["TOTALAPAYER"].ToString().ToDecimalOrDefault(),
                    CodeGestio = rowFact["CODEGESTIOIMM"].ToString(),
                    Adresse = rowFact["ADRESSEIMM"].ToString(),
                    CP = rowFact["CPIMM"].ToString(),
                    Ville = rowFact["VILLEIMM"].ToString(),
                    IDImm = rowFact["IDIMM"].ToString()
                };

                facturesList.ListeFactures.Add(fact);
            }
            return facturesList;
#else
            factures facturesList = new factures();
            if (session.checkSession(SessionID, PkUser) == false) return facturesList;

            user u = GetUserByPk(PkUser);
            if (u.UserType != "C") return facturesList;

            int fkclient = u.FKClient;
            if (fkclient <= 0) return facturesList;

            string espaceclient_gestion = GetTypeGestion(fkclient, "C").ToLower();

            DataTable dtFact = WS_DBUtils.utils_LER.DBSelectTable(
            $@"SELECT f.pkfacture, f.numdecompte, f.dateedition, f.debutperiode, f.finperiode, f.ht, f.ttc, f.totalapayer,
NVL(idi, immeuble.id) as idimm,
NVL(adressei, immeuble.adresse) as adresseIMM,
NVL(cpi, immeuble.cp) as cpimm,
NVL(villei, immeuble.ville) as villeimm,
NVL(codegestioi, immeuble.codegestio) as codegestioimm
FROM (
SELECT facture.pkfacture, facture.numdecompte, facture.dateedition,facture.statut, facture.typeprestation, facture.usercreation,
facture.debutperiode, facture.finperiode, facture.ht, facture.ttc, facture.totalapayer,
LISTAGG(immeuble.id, ';') WITHIN GROUP (ORDER BY immeuble.ID) as IDI,
LISTAGG(immeuble.codegestio, ';') WITHIN GROUP (ORDER BY immeuble.codegestio) as codegestioi, 
LISTAGG(immeuble.adresse, ';') WITHIN GROUP (ORDER BY immeuble.adresse) as adressei, 
LISTAGG(immeuble.cp, ';') WITHIN GROUP (ORDER BY immeuble.cp) as cpi, 
LISTAGG(immeuble.ville, ';') WITHIN GROUP (ORDER BY immeuble.ville) as villei, 
facture.fkimmeuble
FROM facture, immeuble, client, (select fkimmeuble, fkfacture FROM lignefacture GROUP BY fkfacture, fkimmeuble) l
WHERE facture.fkclienttop = {fkclient}
AND facture.fkclienttop = client.pkclient
{(espaceclient_gestion == "client" ? "AND client.espaceclient_showfactures='O'" : "AND immeuble.espaceclient_showfactures='O'")}
AND l.fkfacture(+) = pkfacture AND l.fkimmeuble = immeuble.pkimmeuble(+)
AND facture.dateedition > sysdate - 2*365
GROUP BY facture.pkfacture, facture.numdecompte, facture.dateedition,facture.statut, 
facture.typeprestation, facture.usercreation, facture.fkimmeuble, facture.debutperiode, facture.finperiode, facture.ht, facture.ttc,
facture.totalapayer
ORDER BY pkfacture DESC) f, immeuble
WHERE  f.fkimmeuble = pkimmeuble(+)");

            foreach (DataRow rowFact in dtFact.Rows)
            {
                facture fact = new facture
                {
                    PKFacture = rowFact["PKFACTURE"].ToString().ToInt32OrDefault(),
                    NumFacture = rowFact["NUMDECOMPTE"].ToString(),
                    DateEdition = rowFact["DATEEDITION"].ToString().ToDateTime(),
                    DateDebut = rowFact["DEBUTPERIODE"].ToString().ToDateTime(),
                    DateFin = rowFact["FINPERIODE"].ToString().ToDateTime(),
                    MontantTotalHT = rowFact["HT"].ToString().ToDecimalOrDefault(),
                    MontantTotalTTC = rowFact["TTC"].ToString().ToDecimalOrDefault(),
                    MontantTotalAPayer = rowFact["TOTALAPAYER"].ToString().ToDecimalOrDefault(),
                    CodeGestio = rowFact["CODEGESTIOIMM"].ToString(),
                    Adresse = rowFact["ADRESSEIMM"].ToString(),
                    CP = rowFact["CPIMM"].ToString(),
                    Ville = rowFact["VILLEIMM"].ToString(),
                    IDImm = rowFact["IDIMM"].ToString()
                };

                facturesList.ListeFactures.Add(fact);
            }
            return facturesList;
#endif
        }
        #endregion

        /// <summary>
        /// Retourne un case SF
        /// select Id, Status, CaseNumber, SuppliedEmail,
        ///Subject, Type, Categorie__c, SousCategorie__c
        ///FROM Case
        ///WHERE(Type= 'Intervention')
        ///AND(Status= 'Attribue'
        ///or Status = 'InterventionPlanifiee'
        ///or Status = 'interventionareprogrammer'
        ///or Status = 'EnCoursDeTraitement'
        ///or Status = 'EnAttenteRetourDemandeur'
        ///or Status = 'EnAttenteDePlanification'
        ///or (IsClosed= true and ClosedDate>=LAST_N_MONTHS:6)
        ///)
        ///AND Id = { Id.QuotedStr() }
        ///AND SuppliedEmail = { Email.QuotedStr() }
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="Id">Id du case</param>
        /// <param name="Email">Email</param>
        /// <returns></returns>
        public static caseSF getCase(string SuperLoginID, string SuperPassword, string Id, string Email)
        {
            caseSF c = new caseSF();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
            {
                c.Erreur = "Identification incorrecte";
                return c;
            }

            DataRow rowCase;
            try
            {
                rowCase = WS_DBUtils.utils_SF.DBSelectRow(
                      $@"select Id, Status, CaseNumber, SuppliedEmail,
Subject, Type, Categorie__c, SousCategorie__c
FROM Case
WHERE (Type='Intervention')
AND (Status='Attribue' 
     or Status='InterventionPlanifiee'
     or Status='interventionareprogrammer'
     or Status='EnCoursDeTraitement' 
     or Status='EnAttenteRetourDemandeur' 
     or Status='EnAttenteDePlanification' 
     or (IsClosed=true and  ClosedDate>=LAST_N_MONTHS:6)
    )
AND Id = {Id.QuotedStr()}
AND SuppliedEmail = {Email.QuotedStr()} ");
            }
            catch
            {
                c.Erreur = "Identification incorrecte";
                return c;
            }

            if (rowCase == null)
            {
                c.Erreur = "Identification incorrecte";
                return c;
            }

            c.Id = rowCase["_Id"].ToString();
            c.CaseNumber = rowCase["_CaseNumber"].ToString();
            c.Statut = rowCase["_Status"].ToString();
            c.Categorie = rowCase["_Categorie__c"].ToString();
            c.SousCategorie = rowCase["_SousCategorie__c"].ToString();
            c.Subject = rowCase["_Subject"].ToString();
            c.Type = rowCase["_Type"].ToString();

            DataTable dtWO = WS_DBUtils.utils_SF.DBSelectTable(
                  $@"select Id, Status, WorkOrderNumber,
 (SELECT Id, tolabel(Status), SchedStartTime, Tech_ArrivalStartTime__c, Tech_ArrivalEndTime__c FROM ServiceAppointments),
 (SELECT Id, Asset.SerialNumber, tolabel(MotifExecution__c) MotifExecution__l, tolabel(MotifNonExecution__c) MotifNonExecution__l, WorkType.Name, Status FROM WorkOrderLineItems),
Immeuble__r.IdentifiantImmeuble__c, Immeuble__r.ReferenceGestionnaire__c,
Logement__r.PKLER__c, Logement__r.Name, Logement__r.CodeGestionnaire__c
 From WorkOrder
where Case.Id =  {Id.QuotedStr()}");

            foreach (DataRow rowWO in dtWO.Rows)
            {
                DataRow rowSA = null;
                DataTable dtSA = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(rowWO["_ServiceAppointments_records"].ToString());
                if (dtSA != null && dtSA.Rows.Count > 0)
                    rowSA = dtSA.Rows[0];
                workOrderSF wo = new workOrderSF
                {
                    WorkOrderNumber = rowWO["_WorkOrderNumber"].ToString(),
                    Statut = rowWO["_Status"].ToString()
                };
                if (rowSA != null && rowSA["_SchedStartTime"] != DBNull.Value)
                    wo.SchedStartTime = rowSA["_SchedStartTime"].ToString().ToDateTime();
                if (rowSA != null && rowSA["_Tech_ArrivalStartTime__c"] != DBNull.Value)
                    wo.Tech_ArrivalStartTime = rowSA["_Tech_ArrivalStartTime__c"].ToString();
                if (rowSA != null && rowSA["_Tech_ArrivalEndTime__c"] != DBNull.Value)
                    wo.Tech_ArrivalEndTime = rowSA["_Tech_ArrivalEndTime__c"].ToString();

                wo.IdImm = rowWO["_Immeuble__r_IdentifiantImmeuble__c"].ToString();
                wo.CodeGestioImm = rowWO["_Immeuble__r_ReferenceGestionnaire__c"].ToString();

                wo.Logement = GetLogementByPk(rowWO["_Logement__r_PKLER__c"].ToString().Replace("LOG_", "").ToInt32OrDefault());
                wo.Occupant = new occupant()
                {
                    Nom = rowWO["_Logement__r_Name"].ToString(),
                    Ref = rowWO["_Logement__r_CodeGestionnaire__c"].ToString()
                };
                c.ListeWorkOrderSF.Add(wo);
                DataTable dtWOLI = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(rowWO["_WorkOrderLineItems_records"].ToString());
                if (dtWOLI != null)
                    foreach (DataRow rowWOLI in dtWOLI.Rows)
                    {
                        workOrderLineItemSF woli = new workOrderLineItemSF
                        {
                            AssetSerialNumber = rowWOLI["_Asset_SerialNumber"].ToString(),
                            MotifExecution = rowWOLI["_MotifExecution__l"].ToString(),
                            MotifNonExecution = rowWOLI["_MotifNonExecution__l"].ToString(),
                            WorkType = rowWOLI["_WorkType_Name"].ToString(),
                            Statut = rowWOLI["_Status"].ToString()
                        };

                        wo.ListeWorkOrderLineItemSF.Add(woli);
                    }
            }
            return c;
        }


        #region Changements d'occupant

        /// <summary>
        /// Retourne la liste des changements d'occupants
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble">PK Immeuble</param>
        /// <param name="PkOccupant">PK Occupant</param>
        /// <param name="isNew"></param>
        /// <returns></returns>
        public static List<occupant4Chgt> getOccupants4Chgt(string SessionID, int PkUser,
            int PkImmeuble, int PkOccupant = -1, bool isNew = false)
        {
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
#else
            List<occupant4Chgt> occupants = new List<occupant4Chgt>();
            if (session.checkSession(SessionID, PkUser) == false) return occupants;

            user u = GetUserByPk(PkUser);
            if (u.UserType != "C") return occupants;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT immeuble.id as idimm, immeuble.codegestio, immeuble.adresse, immeuble.cp, immeuble.ville, batiment.id as numbat, batiment.adresse as adressebat,
escalier.numescalier as numesc, escalier.adresseesc, logement.numetage, logement.numordre, 
pkoccupant, occupant.nom, occupant.codelogegestio, occupant.datearrivee, occupant.email, occupant.telfixe, occupant.telmobile, occupant.numbail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newname, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newcodelogegestio, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newdatearrivee, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newemail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelfixe, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelmobile, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newnumbail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew

FROM 
occupant, logement, escalier, batiment, immeuble, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ
WHERE
occupant.fklogement = logement.pklogement
and (occupant.datedepart is null or occupant.datedepart > sysdate)
and logement.fkbatiment = batiment.pkbatiment
and escalier.fkbatiment = batiment.pkbatiment
and logement.fkescalier = escalier.pkescalier
and batiment.fkimmeuble = immeuble.pkimmeuble
{(PkImmeuble == -1 ? "" : " and immeuble.pkimmeuble=" + PkImmeuble + " ")}
{(PkOccupant == -1 ? "" : " and occupant.pkoccupant=" + PkOccupant + " ")}
and NVL(immeuble.ACTIF, 'O') <> 'N' 
and Immeuble.FKclient in (select PKCLIENT from CLIENT where NVL(CLIENT.ACTIF, 'O') <> 'N'  
                                           start with CLIENT.PKCLIENT =  {u.FKClient}
                                           connect by FKCLIENT= prior PKCLIENT )
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.fkoccupant(+) = pkoccupant
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew={isNew.QuotedStr()}
ORDER BY immeuble.codegestio,immeuble.id, numbat, escalier.numescalier, logement.numetage, logement.numordre");
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
#endif
        }
        /// <summary>
        /// Enregistre les changements d'occupants dans la base
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="occupants">Liste des occupants</param>
        /// <returns></returns>
        public static List<occupant4Chgt> setOccupants4Chgt(string SessionID, int PkUser,
            List<occupant4Chgt> occupants)
        {
            if (session.checkSession(SessionID, PkUser) == false) return occupants;

            user u = GetUserByPk(PkUser);
            //if (u.UserType != "C") return;

            // isnew = false --> tél + email

            foreach (occupant4Chgt o in occupants)
            {
                if (!checkImmeubleOccupant(u.PKUser, o.PkOccupant))
                {
                    o.Erreur += "Identification incorrecte" + Environment.NewLine;
                    continue;
                }

                DataRow chgtOcc = WS_DBUtils.utils_LER.DBSelectRow(
        $@"SELECT pkweb_chgt_occ 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ 
WHERE fkoccupant = {o.PkOccupant}
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew={o.isNew.QuotedStr()}
");

                if (o.isNew == false)
                {
                    // pas de vérif de données
                    if (chgtOcc == null)
                    {
                        //insert
                        string sql = $@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ
(fkoccupant, newemail, newtelmobile, isnew)
VALUES 
({o.PkOccupant}, {o.newEmail.QuotedStr2()}, {o.newTelmobile.QuotedStr2()}, {o.isNew.QuotedStr()})";
                        WS_DBUtils.utils_LER.DBExec(sql);
                    }
                    else
                    {
                        //update
                        WS_DBUtils.utils_LER.DBExec(
                            $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ set
newemail={o.newEmail.QuotedStr2()},
newtelmobile={o.newTelmobile.QuotedStr2()}
WHERE fkoccupant={o.PkOccupant}");
                    }
                }
                else
                {
                    if (o.newDateArrivee != DateTime.MinValue && o.newDateArrivee <= o.DateArrivee)
                    {
                        o.Erreur += "Nouvelle date d'arrivée incorrecte" + Environment.NewLine;
                        continue;
                    }
                    if (o.newDateArrivee <= o.DateArrivee && o.newNom == o.Nom)
                    {
                        o.Erreur += "Nouvel occupant incorrect" + Environment.NewLine;
                        continue;
                    }
                    if (o.newDateArrivee > DateTime.MinValue && o.newNom == "")
                    {
                        o.Erreur += "Nouveau nom manquant" + Environment.NewLine;
                        continue;
                    }
                    if (o.numbail != "" && o.newNumbail == "")
                    {
                        o.Erreur += "Nouveau n° de bail manquant" + Environment.NewLine;
                        continue;
                    }
                    if (chgtOcc == null)
                    {
                        //insert
                        string sql = $@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ
(fkoccupant, newcodelogegestio, newdatearrivee, newemail, newname, newnumbail, newtelfixe, newtelmobile, isnew)
VALUES 
({o.PkOccupant}, {o.newCodeLogeGestio.QuotedStr2()}, {o.newDateArrivee.QuotedStr()}, {o.newEmail.QuotedStr2()}, {o.newNom.QuotedStr2()}, 
{o.newNumbail.QuotedStr2()}, {o.newTelfixe.QuotedStr2()}, {o.newTelmobile.QuotedStr2()}, {o.isNew.QuotedStr()})";
                        WS_DBUtils.utils_LER.DBExec(sql);
                    }
                    else
                    {
                        //update
                        WS_DBUtils.utils_LER.DBExec(
                            $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ set
newcodelogegestio={o.newCodeLogeGestio.QuotedStr2()},
newdatearrivee={o.newDateArrivee.QuotedStr()},
newemail={o.newEmail.QuotedStr2()},
newname={o.newNom.QuotedStr2()},
newnumbail={o.newNumbail.QuotedStr2()},
newtelfixe={o.newTelfixe.QuotedStr2()},
newtelmobile={o.newTelmobile.QuotedStr2()}
WHERE fkoccupant={o.PkOccupant}");
                    }
                }
            }

            return occupants;
        }

        /// <summary>
        /// Retourne la liste de tous les changements d'occupants à traiter
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="showArchive"></param>
        /// <returns></returns>
        public static List<occupant4Chgt> getOccupants4Chgt4LER(string SuperLoginID, string SuperPassword,
            bool showArchive = false)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - logement remplace par web_logement
            // - occupant remplace par web_logement
#if WS2
            List<occupant4Chgt> occupants = new List<occupant4Chgt>();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return occupants;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT Web_immeuble.id AS idimm, Web_immeuble.codegestio, Web_immeuble.adresse, Web_immeuble.cp, Web_immeuble.ville, 
                    web_logement.numbatiment AS numbat, web_logement.adrbatiment AS adressebat,
                    web_logement.numescalier AS numesc, web_logement.adresseesc, web_logement.numetage, web_logement.numordre, 
                    web_occupant.pkoccupant, web_occupant.nom, web_occupant.codelogegestio, web_occupant.datearrivee, web_occupant.email, web_occupant.telfixe, web_occupant.telmobile, web_occupant.numbail,
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newname, 
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newcodelogegestio, 
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newdatearrivee, 
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newemail,
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelfixe, 
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelmobile, 
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newnumbail,
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew
                FROM 
                    web_logement, Web_immeuble, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ, web_occupant
                WHERE (web_occupant.datedepart is null or web_occupant.datedepart > sysdate)
                    AND web_logement.fkimmeuble = Web_immeuble.pkimmeuble
                    AND Web_immeuble.actif = 'O'
                    AND web_occupant.fklogement = web_logement.pklogement
                    AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.fkoccupant = web_occupant.pkoccupant
                    {(showArchive ? "" : $"and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.actif = 'O'")}
                ORDER BY Web_immeuble.codegestio,Web_immeuble.id, web_logement.numbatiment, web_logement.numescalier, web_logement.numetage, web_logement.numordre");
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
#else
            List<occupant4Chgt> occupants = new List<occupant4Chgt>();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return occupants;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT immeuble.id as idimm, immeuble.codegestio, immeuble.adresse, immeuble.cp, immeuble.ville, batiment.id as numbat, batiment.adresse as adressebat,
escalier.numescalier as numesc, escalier.adresseesc, logement.numetage, logement.numordre, 
pkoccupant, occupant.nom, occupant.codelogegestio, occupant.datearrivee, occupant.email, occupant.telfixe, occupant.telmobile, occupant.numbail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newname, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newcodelogegestio, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newdatearrivee, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newemail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelfixe, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newtelmobile, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.newnumbail,
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.isnew
FROM 
occupant, logement, escalier, batiment, immeuble, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ
WHERE
occupant.fklogement = logement.pklogement
and (occupant.datedepart is null or occupant.datedepart > sysdate)
and logement.fkbatiment = batiment.pkbatiment
and escalier.fkbatiment = batiment.pkbatiment
and logement.fkescalier = escalier.pkescalier
and batiment.fkimmeuble = immeuble.pkimmeuble
and immeuble.actif = 'O'
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.fkoccupant = pkoccupant
{(showArchive ? "" : $"and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ.actif = 'O'")}
ORDER BY immeuble.codegestio,immeuble.id, numbat, escalier.numescalier, logement.numetage, logement.numordre");
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
#endif
        }

        /// <summary>
        /// Permet d'archiver/tagger le chgt d'occupant
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="occupants">Liste des occupants</param>
        public static void setOccupants4Chgt4LER(string SuperLoginID, string SuperPassword, List<occupant4Chgt> occupants)
        {
            //WEBTODO :
            // - logement remplace par web_logement
            // - occupant remplace par web_logement
#if WS2
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return;

            foreach (occupant4Chgt o in occupants)
            {
                //update
                WS_DBUtils.utils_LER.DBExec(
        $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ SET
actif='N',
lerclosedate=sysdate
WHERE fkoccupant={o.PkOccupant}
AND isnew={o.isNew.QuotedStr()}
AND actif = 'O'");

                if (o.newPkOccupant == -1) continue;

                int fklogement = WS_DBUtils.utils_LER.DBSelect(
        $@"SELECT pklogement FROM web_logement, web_occupant 
            WHERE pkoccupant = {o.PkOccupant} 
                   AND web_occupant.fklogement = web_logement.pklogement ").ToInt32OrDefault(-1);
                // on MAJ l'ancien occupant pour le faire partir
                WS_DBUtils.utils_LER.DBUpdate(
        $@"UPDATE occupant SET 
datedepart={o.newDateArrivee.AddDays(-1).QuotedStrDate()}
WHERE pkoccupant = {o.PkOccupant}");
                WS_DBUtils.utils_LER.DBUpdate(
        $@"UPDATE web_occupant SET 
datedepart={o.newDateArrivee.AddDays(-1).QuotedStrDate()}
WHERE pkoccupant = {o.PkOccupant}");

                // on crée le nouvel occupant
                WS_DBUtils.utils_LER.DBExec(
                   $@"INSERT INTO occupant
(pkoccupant, fklogement, nom, datearrivee)
VALUES (
{o.newPkOccupant},
{fklogement},
{o.newNom},
{o.newDateArrivee})");

                // on crée le nouvel occupant
                WS_DBUtils.utils_LER.DBExec(
                   $@"INSERT INTO web_occupant
(pkoccupant, fklogement, nom, datearrivee)
VALUES (
{o.newPkOccupant},
{fklogement},
{o.newNom},
{o.newDateArrivee})");

            }
        }
#else
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return;

            foreach (occupant4Chgt o in occupants)
            {
                //update
                WS_DBUtils.utils_LER.DBExec(
        $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_chgt_occ SET
actif='N',
lerclosedate=sysdate
WHERE fkoccupant={o.PkOccupant}
AND isnew={o.isNew.QuotedStr()}
AND actif = 'O'");

                if (o.newPkOccupant == -1) continue;

                int fklogement = WS_DBUtils.utils_LER.DBSelect(
        $@"SELECT fklogement FROM occupant WHERE pkoccupant = {o.PkOccupant}").ToInt32OrDefault(-1);
                // on MAJ l'ancien occupant pour le faire partir
                WS_DBUtils.utils_LER.DBUpdate(
        $@"UPDATE occupant SET 
datedepart={o.newDateArrivee.AddDays(-1).QuotedStrDate()}
WHERE pkoccupant = {o.PkOccupant}");

                // on crée le nouvel occupant
                WS_DBUtils.utils_LER.DBExec(
                   $@"INSERT INTO occupant
(pkoccupant, fklogement, nom, datearrivee)
VALUES (
{o.newPkOccupant},
{fklogement},
{o.newNom},
{o.newDateArrivee})");

            }
        }
#endif
#endregion

        /// <summary>
        /// Envoi une demande de traitement des relevés
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="immeuble"></param>
        /// <param name="batiment"></param>
        /// <param name="escalier"></param>
        /// <param name="etage"></param>
        /// <param name="date_passage"></param>
        /// <param name="prenom"></param>
        /// <param name="nom"></param>
        /// <param name="adresse"></param>
        /// <param name="code_postal"></param>
        /// <param name="ville"></param>
        /// <param name="telephone"></param>
        /// <param name="email"></param>
        /// <param name="ef_cuisine"></param>
        /// <param name="ef_salle_de_bains"></param>
        /// <param name="ef_wc"></param>
        /// <param name="ef_autre"></param>
        /// <param name="ef_nomautre"></param>
        /// <param name="ec_cuisine"></param>
        /// <param name="ec_salle_de_bains"></param>
        /// <param name="ec_wc"></param>
        /// <param name="ec_autre"></param>
        /// <param name="ec_nomautre"></param>
        public static void setReleveOccupant(string SuperLoginID, string SuperPassword,
            string immeuble, string batiment, string escalier, string etage,
            string date_passage, string prenom, string nom, string adresse,
            string code_postal, string ville, string telephone, string email,
            string ef_cuisine, string ef_salle_de_bains, string ef_wc, string ef_autre,
            string ef_nomautre, string ec_cuisine, string ec_salle_de_bains, string ec_wc,
            string ec_autre, string ec_nomautre)
        {

            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return;

            string body = $@"
<p>Cher administrateur <br>
Vous avez re&ccedil;u une demande que vous devez traiter dans les meilleurs d&eacute;lais. <br><br>
<b>N&deg; : </b>{immeuble}<br>
<b>Batiment : </b>{batiment}<br>
<b>Escalier : </b>{escalier}<br>
<b>Etage : </b>{etage}<br>
<b>Date de passage en relev&eacute; : </b>{date_passage}<br>
<b>Pr&eacute;nom : </b>{prenom}<br>
<b>Nom : </b>{nom}<br>
<b>Adresse : </b>{adresse}<br>
<b>Code postal : </b>{code_postal}<br>
<b>Ville : </b>{ville}<br>
<b>T&eacute;l&eacute;phone : </b>{telephone}<br>
<b>Email : </b>{email}<br><br><br>
<b>Cuisine froide : </b>{ef_cuisine}<br>
<b>Salle de bains froide : </b>{ef_salle_de_bains}<br>
<b>WC froide : </b>{ef_wc}<br>
<b>Autre froide : </b>{ef_autre}<br>
<b>Nom Autre : </b>{ef_nomautre}<br>
<b>Cuisine chaude : </b>{ec_cuisine}<br><br><br>
<b>Salle de bains chaude : </b>{ec_salle_de_bains}<br>
<b>WC chaude : </b>{ec_wc}<br>
<b>Autre chaude : </b>{ec_autre}<br>
<b>Nom autre : </b>{ec_nomautre}<br>";
            string subject = "Transmettre vos relevés";
            //string to = "web-releve@techem.fr";
            string to = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "WEB_RELEVE");

            Utils_Mail.sendMailSmtp("espaceclient@techem.fr",
                             subject,
                             body,
                             to,
                             string.Empty, string.Empty,
                             string.Empty, true);
        }

        /// <summary>
        /// Retourne la liste des sous traitants
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <returns></returns>
        public static List<sousTraitant> GetSousTraitants(string SuperLoginID, string SuperPassword)
        {
            //WEBTODO :
#if WS2
            List<sousTraitant> sousTraitants = new List<sousTraitant>();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return sousTraitants;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT *
                    FROM web_soustraitant 
                    WHERE ACTIF='O'");

            foreach (DataRow row in dt.Rows)
            {
                sousTraitant s = new sousTraitant
                {
                    Nom = row["NOM"].ToString(),
                    Description = row["DESCRIPTION"].ToString(),
                    Territoires = row["TERRITOIRES"].ToString(),
                    Pays = row["PAYS"].ToString(),
                    Adresse = row["ADRESSE"].ToString(),
                    CP = row["CP"].ToString(),
                    Ville = row["VILLE"].ToString(),
                    Protection = row["PROTECTION"].ToString()
                };

                sousTraitants.Add(s);
            }
            return sousTraitants;

#else
            List<sousTraitant> sousTraitants = new List<sousTraitant>();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return sousTraitants;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT *
FROM soustraitant
WHERE actif = 'O'");

            foreach (DataRow row in dt.Rows)
            {
                sousTraitant s = new sousTraitant
                {
                    Nom = row["NOM"].ToString(),
                    Description = row["DESCRIPTION"].ToString(),
                    Territoires = row["TERRITOIRES"].ToString(),
                    Pays = row["PAYS"].ToString(),
                    Adresse = row["ADRESSE"].ToString(),
                    CP = row["CP"].ToString(),
                    Ville = row["VILLE"].ToString(),
                    Protection = row["PROTECTION"].ToString()
                };

                sousTraitants.Add(s);
            }
            return sousTraitants;
#endif
        }

        /// <summary>
        /// Retourne la liste des logs des occupants
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="idClient">Id Client</param>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <returns></returns>
        public static List<userLog> GetStatOccupants(string SuperLoginID, string SuperPassword, string idClient,
            string startDate, string endDate)
        {
            //WEBTODO :
            //WEBTODO TODO :
            // - immeuble remplace par web_immeuble
            // - client remplace par web_client
            // - logement remplace par web_logement
            // - occupant remplace par web_logement
#if WS2
            List<userLog> userLogs = new List<userLog>();

            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return null;

            if (startDate == "")
                startDate = DateTime.Today.AddYears(-1).ToShortDateString();
            else startDate = startDate.ToDateTime().ToShortDateString();
            if (endDate == "")
                endDate = DateTime.Today.ToShortDateString();
            else endDate = endDate.ToDateTime().ToShortDateString();
            if (endDate.ToDateTime() == DateTime.MinValue)
                endDate = DateTime.Today.ToShortDateString();
            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user,
     {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session, 
     web_logement, web_immeuble, web_occupant
WHERE 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = web_occupant.pkoccupant
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime BETWEEN {startDate.QuotedStr()} and {endDate.QuotedStr()}
AND web_logement.fkimmeuble = web_immeuble.pkimmeuble
AND web_occupant.fklogement = web_logement.pklogement
AND web_immeuble.fkclient IN (
    SELECT pkclient FROM web_client 
    START WITH web_client.id = {idClient.QuotedStr()} 
    CONNECT BY fkclient = PRIOR pkclient )  
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.FKWEB_USER = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user");
            foreach (DataRow r in dt.Rows)
            {
                userLog u = new userLog()
                {
                    loginId = r["LOGINID"].ToString(),
                    loginTime = r["LOGINTIME"].ToString().ToDateTime()
                };
                userLogs.Add(u);
            }

            return userLogs;
#else
            List<userLog> userLogs = new List<userLog>();

            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return null;

            if (startDate == "")
                startDate = DateTime.Today.AddYears(-1).ToShortDateString();
            else startDate = startDate.ToDateTime().ToShortDateString();
            if (endDate == "")
                endDate = DateTime.Today.ToShortDateString();
            else endDate = endDate.ToDateTime().ToShortDateString();
            if (endDate.ToDateTime() == DateTime.MinValue)
                endDate = DateTime.Today.ToShortDateString();
            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user,
     {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session, 
     occupant, logement, batiment, immeuble
WHERE 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = occupant.pkoccupant
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime BETWEEN {startDate.QuotedStr()} and {endDate.QuotedStr()}
AND occupant.fklogement = logement.pklogement
AND logement.fkbatiment = batiment.pkbatiment
AND batiment.fkimmeuble = immeuble.pkimmeuble
AND immeuble.fkclient IN (
    SELECT pkclient FROM client 
    WHERE client.actif = 'O'
    START WITH client.id = {idClient.QuotedStr()} 
    CONNECT BY fkclient = PRIOR pkclient )  
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.FKWEB_USER = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user");
            foreach (DataRow r in dt.Rows)
            {
                userLog u = new userLog()
                {
                    loginId = r["LOGINID"].ToString(),
                    loginTime = r["LOGINTIME"].ToString().ToDateTime()
                };
                userLogs.Add(u);
            }

            return userLogs;
#endif
        }

        public static List<GraphPoint> GetStatOccupantsGraph(string SessionID, int PkUser, string typeGraph, string startDate, string endDate)
        {
            List<GraphPoint> points = new List<GraphPoint>();
            if (session.checkSession(SessionID, PkUser) == false) return points;

            user currentUser = GetUserByPk(PkUser);
            if (currentUser.UserType != "C") return points;

            List<userLog> occs = GetStatOccupants(_SuperLoginID, _SuperPassword, currentUser.ClientID, startDate, endDate);
            List<userLog> listOccs = occs.ToList();


            if (typeGraph.ToUpper() == "CONNEXIONS_TOTALES")
            {
                //Nombre de connexions totales par mois
                var c = listOccs
                .GroupBy(u => new DateTime(u.loginTime.Year, u.loginTime.Month, 1))
                .Select(grp => new
                {
                    Month = grp.Key,
                    Total = grp.Count()
                })
                .ToList().OrderBy(u => u.Month);

                foreach (var p in c)
                    points.Add(new GraphPoint { date = p.Month, value = p.Total });
            }

            else if (typeGraph.ToUpper() == "CONNEXIONS_UNIQUES")
            {
                var c = listOccs
                        .GroupBy(u => new DateTime(u.loginTime.Year, u.loginTime.Month, 1))
                        .Select(grp => new
                        {
                            Month = grp.Key,
                            Total = grp.Select(x => x.loginId).Distinct().Count()
                        })
                        .ToList();

                foreach (var p in c)
                    points.Add(new GraphPoint { date = p.Month, value = p.Total });
            }


            return points;
        }
        /// <summary>
        /// Retourne la liste des logs des clients
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="idClient">Id Client</param>
        /// <returns></returns>
        public static List<userLog> GetStatClient(string SuperLoginID, string SuperPassword, string idClient)
        {
            //WEBTODO :
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
            List<userLog> userLogs = new List<userLog>();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return null;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime 
FROM 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session
WHERE 
    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype IN ('C')
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient IN (SELECT pkclient FROM web_client start with web_client.ID = {idClient.QuotedStr()} connect by FKCLIENT= prior PKCLIENT )  
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.FKWEB_USER = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user 

UNION

SELECT 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime 
FROM 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session
WHERE 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype in ('G')
AND ({Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.FKPARENTUSER IN (
    SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
    WHERE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient in (SELECT pkclient FROM web_client start with web_client.ID = {idClient.QuotedStr()} connect by FKCLIENT= prior PKCLIENT )))  
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.FKWEB_USER = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user 

ORDER BY logintime DESC");

            foreach (DataRow r in dt.Rows)
            {
                userLog u = new userLog()
                {
                    loginId = r["LOGINID"].ToString(),
                    loginTime = r["LOGINTIME"].ToString().ToDateTime()
                };
                userLogs.Add(u);
            }

            return userLogs;
#else
            List<userLog> userLogs = new List<userLog>();
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return null;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(
                $@"SELECT 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime 
FROM 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session
WHERE 
    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype IN ('C')
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient IN (SELECT pkclient FROM client WHERE NVL(CLIENT.ACTIF, 'O') <> 'N'  start with CLIENT.ID = {idClient.QuotedStr()} connect by FKCLIENT= prior PKCLIENT )  
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.FKWEB_USER = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user 

UNION

SELECT 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.logintime 
FROM 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_session
WHERE 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype in ('G')
AND ({Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.FKPARENTUSER IN (
    SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
    WHERE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient in (SELECT pkclient FROM client WHERE NVL(CLIENT.ACTIF, 'O') <> 'N'  start with CLIENT.ID = {idClient.QuotedStr()} connect by FKCLIENT= prior PKCLIENT )))  
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session.FKWEB_USER = {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user 

ORDER BY logintime DESC");

            foreach (DataRow r in dt.Rows)
            {
                userLog u = new userLog()
                {
                    loginId = r["LOGINID"].ToString(),
                    loginTime = r["LOGINTIME"].ToString().ToDateTime()
                };
                userLogs.Add(u);
            }

            return userLogs;
#endif
        }

        public static bool IsValidPassword(string password)
        {
            var hasNumber = new Regex(@"[0-9]+");
            var hasUpperChar = new Regex(@"[A-Z]+");
            var hasMinimum8Chars = new Regex(@".{8,}");

            return hasNumber.IsMatch(password) &&
                    hasUpperChar.IsMatch(password) &&
                    hasMinimum8Chars.IsMatch(password);

        }
        public static retour ResetPassword(string SuperLoginID, string SuperPassword,
            string TokenID, string Salt, string Password)
        {
            retour r = new retour();

            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return r;
            TokenID = TokenID.ToUpper();
            Salt = Salt.ToUpper();

            user u = session.GetPasswordReset(TokenID, Salt);
            if (u == null) return null;

            if (!IsValidPassword(Password))
                u.Erreur = "INVALID_PASSWORD";

            if (u.Erreur == "")
            {
                WS_DBUtils.utils_LER.DBExec(
        $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
SET password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW({Password.QuotedStr()}), 4)
WHERE pkweb_user = {u.PKUser}");

                WS_DBUtils.utils_LER.DBExec(
        $@"DELETE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_password_reset
WHERE fkweb_user = {u.PKUser}");
            }

            switch (u.Erreur)
            {
                case "INVALID_TOKEN": r.Erreur = ""; break;
                case "INVALID_CREATED_DATE": r.Erreur = ""; break;
                case "INVALID_EXPIRATION_DATE": r.Erreur = "RENEW_TOKEN"; break;//
                case "INVALID_SALT": r.Erreur = ""; break;
                case "LOGIN_EXPIRED": r.Erreur = "LOGIN_EXPIRED"; break;
                case "INVALID_PASSWORD": r.Erreur = "INVALID_PASSWORD"; break;
                case "PASSWORD_EXPIRED": r.Erreur = ""; break;
                default: r.Erreur = "OK"; break;
            }
            return r;
        }

        public static retour GetResetTokenIDValidation(string SuperLoginID, string SuperPassword,
            string TokenID, string Salt)
        {
            retour r = new retour();

            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return r;
            TokenID = TokenID.ToUpper();
            Salt = Salt.ToUpper();

            user u = session.GetPasswordReset(TokenID, Salt);
            if (u == null) return null;

            switch (u.Erreur)
            {
                case "INVALID_TOKEN": r.Erreur = "RENEW_TOKEN"; break;
                case "INVALID_CREATED_DATE": r.Erreur = "RENEW_TOKEN"; break;
                case "INVALID_EXPIRATION_DATE": r.Erreur = "RENEW_TOKEN"; break;//
                case "INVALID_SALT": r.Erreur = "RENEW_TOKEN"; break;
                default: r.Erreur = "OK"; break;
            }
            return r;
        }

        public static void UpdateExpirationDateOccupants(string SuperLoginID, string SuperPassword)
        {
            //WEBTODO :
            // - occupant remplace par web_logement
#if WS2
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return;
            WS_DBUtils.utils_LER.DBUpdate(
                $@"
update {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
set {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.expirationdate = 
 (SELECT web_occupant.datedepart+60 from web_occupant
  where {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = web_occupant.pkoccupant)
where {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.expirationdate is null
and exists (SELECT pkoccupant 
            from web_occupant
            where {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = web_occupant.pkoccupant
            and web_occupant.datedepart<=sysdate)");
#else
            if (!((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword)))
                return;
            WS_DBUtils.utils_LER.DBUpdate(
                $@"
update {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
set {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.expirationdate = 
 (SELECT occupant.datedepart+60 from occupant
  where {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = pkoccupant)
where {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.expirationdate is null
and exists (SELECT pkoccupant 
            from occupant
            where {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = pkoccupant
            and occupant.datedepart<=sysdate)");

#endif
        }

        public static void InsertAPICall(string APIName)
        {
            try
            {
                WS_DBUtils.utils_LER.DBExec(
        $@"INSERT INTO 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_apicall(apiname)
values({APIName.QuotedStr()})");
            }
            catch { }
        }

        public static void InsertAPICall(MethodBase methodBase, string action = "START")
        {
            string APIName = methodBase.Name;

            //string methodParams = "";
            //ParameterInfo[] parameters = methodBase.GetParameters();
            //foreach (ParameterInfo parameter in parameters)
            //    methodParams += parameter.GetObject().ToString();

            try
            {
                WS_DBUtils.utils_LER.DBExec(
        $@"INSERT INTO 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_apicall(apiname, action)
values({APIName.QuotedStr()}, {action.QuotedStr()})");
            }
            catch { }
        }
        public static string AnonymizeContactName(string Name)
        {
            if (!WS_EspaceClient.Properties.Settings.Default.Demo)
                return Name;
            else return "Demo";
        }

        public static string GetGuid()
        {
            // Chaine de session unique
            return Guid.NewGuid().ToString();
        }

        public static string InsertReportToken(string SessionID, string reportType, string param)
        {
            if (!(SessionID == _SuperSessionId))
                return null;

            string TokenId = GetGuid();
            WS_DBUtils.utils_LER.DBExec(
$@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_report_token
(tokenid, reporttype, params) 
VALUES ( {TokenId.QuotedStr()}, {reportType.QuotedStr()}, {param.QuotedStr()})");
            return TokenId;
        }

        public static byte[] GetReportByToken(string SessionID, string tokenid)
        {
            if (!(SessionID == _SuperSessionId))
                return null;

            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT pkweb_report_token, tokenid, reporttype, params, number_of_dl 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_report_token
WHERE tokenid = {tokenid.QuotedStr()}
AND expirationdate > SYSDATE");

            if (r == null) return null;

            WS_DBUtils.utils_LER.DBExec(
$@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_report_token
SET number_of_dl = number_of_dl + 1
WHERE pkweb_report_token = {r["PKWEB_REPORT_TOKEN"]}");

            return GetReport(
                SessionID,
                PkUser: -1,
                ReportType: r["REPORTTYPE"].ToString(),
                ParamsFiltres: r["PARAMS"].ToString());
        }

        public static void InsertTrace(string errorMessage)
        {
            WS_DBUtils.utils_LER.DBExec(
$@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_error
(errormessage) 
VALUES ( {errorMessage.QuotedStr()})");
        }

        public static int InsertPrintJobs(string jobType, string reportType,
            int pk, string param,
            object data1 = null,
            object data2 = null,
            string destination = "",
            string callbackurl = "",
            int priority = 100)
        {
            //if (LER_PrintPlugin.ler_DBUtils.IsTest)
            //    return -1;
            int pkRet = WS_DBUtils.utils_LER.GetPKToInt(
                $"{Properties.Settings.Default.LER_AUTH_SchemaName}.SQWEB_PRINTJOBS");

            LER_PrintPlugin.ler_DBUtils.DBExec(
$@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_printjobs
(pkweb_printjobs, jobtype, reporttype, pk, params, 
destination, callbackurl, priority)
VALUES (
{pkRet},
{jobType.QuotedStr()},
{reportType.QuotedStr()},
{pk},
{param.QuotedStr()},
{destination.QuotedStr()},
{callbackurl.QuotedStr()},
{priority.QuotedStr()})");

            if (data1 != null)
                LER_PrintPlugin.ler_DBUtils.DBUpdateObject(
                        $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_printjobs SET data1 = :data1 WHERE pkweb_printjobs=" + pkRet,
                        "data1",
                        data1,
                        OracleDbType.Clob);
            if (data2 != null)
                LER_PrintPlugin.ler_DBUtils.DBUpdateObject(
                        $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_printjobs SET data2 = :data2 WHERE pkweb_printjobs=" + pkRet,
                        "data2",
                        data2,
                        OracleDbType.Clob);
            return pkRet;
        }
    }

}
