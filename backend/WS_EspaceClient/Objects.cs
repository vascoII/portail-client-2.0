using OfficeOpenXml.FormulaParsing.Excel.Functions.RefAndLookup;
using System;
using System.Collections.Generic;
using System.Data;
using Techem.Tools.EncryptionDecryption;
using Tools;

namespace Techem.Webservices.WS_EspaceClient
{
    /// <summary>
    /// gestion d'erreur
    /// </summary>
    public class retour
    {
        /// <summary>
        /// message d'erreur
        /// </summary>
        public string Erreur = "";
        public string Info = "";
    }

    public class Releve
    {
        public int pkReleve = -1;
        public int pkImmeuble = -1;
        public DateTime dateReleve = new DateTime();
        public string typeERC;
    }

    /// <summary>
    /// ensemble d'immeubles
    /// </summary>
    public class infosImmeubles : retour
    {
        public List<infosImmeuble> ListeInfosImmeubles = new List<infosImmeuble>();
        public infosImmeubles()
        {
        }
    }

    public class immeubles : retour
    {
        public List<immeuble> ListeImmeubles = new List<immeuble>();
        public immeubles()
        {
        }
    }

    public class infosImmeuble
    {
        public immeuble Immeuble = new immeuble();

        public int NbLogements = -1;
        public int NbAppareils = -1;
        public int NbCompteursEC = -1;
        public int NbCompteursEF = -1;
        public int NbCompteursRepart = -1;
        public int NbCompteursCET = -1;
        public int NbCompteursCapteur = -1;
        //public int NbCompteursElect = -1;
        //public int NbCompteursGaz = -1;
        public int NbFuites = -1;
        public int NbDepannages = -1;
        public int NbDysfonctionnements = -1;
        public int NbAnomalies = -1;
        public int NbChantiers = -1;
    }
    public class immeuble
    {
        public int PkImmeuble = -1;
        public string Nom;
        public string Numero;
        public string Ref;
        public string Adresse1;
        public string Adresse2;
        public string Adresse3;
        public string Cp;
        public string Ville;
        public bool HasTelereleve = false;
        public int FkClientTop = -1;
        public bool Actif;
        public DateTime DateActivationClient;
        public DateTime DateActivationOccupant;

        public bool HasNoteOccupant = false;
        public bool HasDecompteOccupant = false;
        public bool HasFactures = false;
        public bool HasChantiers = false;

        public immeuble()
        {
        }
    }



    #region Auth
    public class session : retour
    {
        public bool Connected;
        public string SessionID;
        readonly DateTime LoginDatetime;
        public user User;

        public session()
        {

        }

        public session(string LoginID, string Password, bool passwordFromParam)
        {
            int PkUser = checkAuthent(LoginID, Password, passwordFromParam); // dans cette méthode on check si user commercial techem ou pas

            if (PkUser != -1)
            {
                User = WS_Common.GetUserByPk(PkUser);
                if (WS_Common.IsLoginTechem(LoginID))
                {
                    User.CGU = "O"; // pour un commercial techem, on ne doit pas demander les CGU (O = déjà accepté)
                    User.UserName = "(Techem) " + User.UserName;
                }

                DateTime ExpirationDate = new DateTime(2999, 1, 1);
                if (User.ExpirationDate.Year > 1980) // pour être correcte, une date d'expiration de login doit être >1980 (vide = 0001)
                    ExpirationDate = User.ExpirationDate;
                DateTime PasswordExpirationDate = new DateTime(2999, 1, 1);
                if (User.PasswordExpirationDate.Year > 1980) // pour être correcte, une date d'expiration de login doit être >1980 (vide = 0001)
                    PasswordExpirationDate = User.PasswordExpirationDate;
                if (DateTime.Now.Date > ExpirationDate)
                {
                    //Erreur = "Date d'expiration du user dépassée";
                    Connected = false;
                }
                else if (DateTime.Now.Date > PasswordExpirationDate)
                {
                    //Erreur = "Date d'expiration du password dépassée";
                    SessionID = GenerateSessionID(PkUser);
                    Connected = false;
                }
                else
                {
                    SessionID = GenerateSessionID(PkUser);
                    Connected = true;
                    LoginDatetime = DateTime.Now;
                }
            }
            else
            {
                SessionID = "";
                Connected = false;
                LoginDatetime = DateTime.MinValue;
                //Erreur = "Utilisateur ou mot de passe incorrect";
            }
        }

        public session(string token)
        {
            int PkUser = checkToken(token);
            if (PkUser != -1)
            {
                User = WS_Common.GetUserByPk(PkUser);
                SessionID = GenerateSessionID(PkUser);
                Connected = true;
            }
        }



        private static void InsertSessionID(int PkUser, string ID)
        {
            WS_DBUtils.utils_LER.DBExec(
                $@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_SESSION
(PKWEB_SESSION, FKWEB_USER, SESSIONID) 
VALUES ( 
{Properties.Settings.Default.LER_AUTH_SchemaName}.SQWEB_SESSION.NEXTVAL, 
{PkUser}, 
{ID.QuotedStr()})");
        }

        private static string GenerateSessionID(int PkUser)
        {
            // génére une chaine de session unique
            // et l'enregistre dans la BD

            string ID = WS_Common.GetGuid();
            InsertSessionID(PkUser, ID);
            return ID;
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="PkUser"></param>
        /// <param name="TokenId"></param>
        /// <returns>return tokenId + salt</returns>
        private static Tuple<string, string> InsertPasswordResetID(int PkUser, string TokenId)
        {
            user u = WS_Common.GetUserByPk(PkUser);

            string salt = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT 
RAWTOHEX(
    DBMS_CRYPTO.HASH(
        UTL_RAW.CAST_TO_RAW({u.EMail.ToUpper().QuotedStr()}), 4)) 
                   FROM DUAL");

            int pk_wpr = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkweb_password_reset 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_password_reset 
WHERE fkweb_user={PkUser}").ToInt32OrDefault(-1);

            if (pk_wpr == -1)
            {
                WS_DBUtils.utils_LER.DBExec(
$@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_password_reset
(pkweb_password_reset, fkweb_user, tokenid, email) 
VALUES ( 
{WS_DBUtils.utils_LER.GetPK($"{Properties.Settings.Default.LER_AUTH_SchemaName}.SQWEB_PASSWORD_RESET")}, 
{PkUser}, 
{TokenId.ToUpper().QuotedStr()},
{u.EMail.ToUpper().QuotedStr()})");
            }
            else
            {
                TokenId = WS_DBUtils.utils_LER.DBSelect($@"SELECT tokenId 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_password_reset 
WHERE pkweb_password_reset={pk_wpr}");

                WS_DBUtils.utils_LER.DBUpdate(
$@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_password_reset
SET EXPIRATIONDATE = sysdate+7
WHERE pkweb_password_reset={pk_wpr}");
            }
            return new Tuple<string, string>(TokenId, salt);
        }

        private static string InsertLoginToken(int PkUser)
        {
            //user u = WS_Common.GetUserByPk(PkUser);
            string TokenId = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkweb_login_token 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_login_token 
WHERE fkweb_user={PkUser}
AND expirationdate > SYSDATE");

            if (TokenId == "")
            {
                TokenId = WS_Common.GetGuid();
                WS_DBUtils.utils_LER.DBExec(
$@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.web_login_token
(pkweb_login_token, fkweb_user, tokenid) 
VALUES ( 
{WS_DBUtils.utils_LER.GetPK($"{Properties.Settings.Default.LER_AUTH_SchemaName}.SQweb_login_token")}, 
{PkUser}, 
{TokenId.ToUpper().QuotedStr()})");
            }

            return TokenId;
        }

        public static Tuple<string, string> GeneratePasswordResetTokenID(int PkUser)
        {
            string TokenId = WS_Common.GetGuid();
            return InsertPasswordResetID(PkUser, TokenId);
        }        
        public static user GetPasswordReset(string TokenID, string Salt)
        {
            user u = new user();
            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
                $@"SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_PASSWORD_RESET.*,
RAWTOHEX(
    DBMS_CRYPTO.HASH(
        UTL_RAW.CAST_TO_RAW(EMAIL), 4)) AS salt
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_PASSWORD_RESET
WHERE upper(tokenid) = upper({TokenID.QuotedStr()})");

            if (r == null)
                u.Erreur = "INVALID_TOKEN";
            else if (r["CREATEDDATE"].ToString().ToDateTime() > DateTime.Now)
                u.Erreur = "INVALID_CREATED_DATE";
            else if (r["EXPIRATIONDATE"].ToString().ToDateTime() < DateTime.Now)
                u.Erreur = "INVALID_EXPIRATION_DATE";
            else if (r["SALT"].ToString().ToUpper() != Salt.ToUpper())
                u.Erreur = "INVALID_SALT";
            else
                u = WS_Common.GetUserByPk(r["FKWEB_USER"].ToString().ToInt32OrDefault(-1));

            return u;
        }
        private static int checkAuthent(string LoginID, string Password, bool passwordFromParam)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - immeuble_stats remplace par web_immeuble
            // - client remplace par web_client
            // - logement remplace par web_logement
            // - occupant remplace par web_logement
#if WS2
            if (LoginID.Trim() == "")
                return -1;
            string query;
            if (WS_Common.IsLoginTechem(LoginID)) // user commercial techem (utilisera login derrière préfix)
            {
                string passWeek = WS_Common.GetTchWeekPassword(DateTime.Now);
                if (Password != passWeek)
                    return -1;

                query =
                    $@"SELECT pkweb_user 
                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
                    WHERE UPPER(loginid) = {LoginID.Substring(WS_Common.tchUserPrefix.Length).ToUpper().QuotedStr()} ";
            }
            else if (passwordFromParam)
            {
                query =
                    $@"SELECT pkweb_user 
                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
                    WHERE loginid = {LoginID.QuotedStr()} 
                    AND password = {Password.QuotedStr()} ";
            }

            else
            {
                // recherche par login dans WEB_USER
                query =
                    $@"SELECT pkweb_user 
                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
                    WHERE UPPER(loginid) = {LoginID.ToUpper().QuotedStr()}
                    AND ((password_encrypted IS NULL AND password = {Password.QuotedStr()} ) 
                      OR (password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({Password.QuotedStr()}), 4)))";
                DataTable dtUsers = WS_DBUtils.utils_LER.DBSelectTable(query);
                if (dtUsers.Rows.Count == 1)
                    return Convert.ToInt32(dtUsers.Rows[0]["PKWEB_USER"]);

                // recherche par email dans WEB_USER
                query =
                    $@"SELECT pkweb_user
                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
                    WHERE UPPER(email) = {LoginID.ToUpper().QuotedStr()}
                    AND ((password_encrypted IS NULL AND password = {Password.QuotedStr()} ) 
                      OR (password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({Password.QuotedStr()}), 4)))";
                dtUsers = WS_DBUtils.utils_LER.DBSelectTable(query);
                if (dtUsers.Rows.Count == 1)
                    return Convert.ToInt32(dtUsers.Rows[0]["PKWEB_USER"]);

                // recherche par email dans OCCUPANT
                query =
                    $@"SELECT web_user.pkweb_user
                    FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, web_occupant 
                    WHERE 
                    {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
                    AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = web_occupant.pkoccupant
                    and web_occupant.datedepart > sysdate
                    AND UPPER(web_occupant.email) = {LoginID.ToUpper().QuotedStr()}
                    AND ((web_user.password_encrypted IS NULL AND web_user.password = {Password.QuotedStr()} ) 
                      OR (web_user.password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({Password.QuotedStr()}), 4)))";
                dtUsers = WS_DBUtils.utils_LER.DBSelectTable(query);
                if (dtUsers.Rows.Count == 1)
                    return Convert.ToInt32(dtUsers.Rows[0]["PKWEB_USER"]);

            }

            string spk = WS_DBUtils.utils_LER.DBSelect(query);
            if (spk != "")
                return Convert.ToInt32(spk);
            else return -1;
#else
            if (LoginID.Trim() == "")
                return -1;
            string query;
            if (WS_Common.IsLoginTechem(LoginID)) // user commercial techem (utilisera login derrière préfix)
            {
                string passWeek = WS_Common.GetTchWeekPassword(DateTime.Now);
                if (Password != passWeek)
                    return -1;

                query =
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
WHERE UPPER(loginid) = {LoginID.Substring(WS_Common.tchUserPrefix.Length).ToUpper().QuotedStr()} ";
            }
            else if (passwordFromParam)
            {
                query =
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
WHERE loginid = {LoginID.QuotedStr()} 
AND password = {Password.QuotedStr()} ";
            }

            else
            {
                // recherche par login dans WEB_USER
                query =
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
WHERE UPPER(loginid) = {LoginID.ToUpper().QuotedStr()}
AND ((password_encrypted IS NULL AND password = {Password.QuotedStr()} ) 
  OR (password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({Password.QuotedStr()}), 4)))";
                DataTable dtUsers = WS_DBUtils.utils_LER.DBSelectTable(query);
                if (dtUsers.Rows.Count == 1)
                    return Convert.ToInt32(dtUsers.Rows[0]["PKWEB_USER"]);

                // recherche par email dans WEB_USER
                query =
$@"SELECT pkweb_user
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
WHERE UPPER(email) = {LoginID.ToUpper().QuotedStr()}
AND ((password_encrypted IS NULL AND password = {Password.QuotedStr()} ) 
  OR (password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({Password.QuotedStr()}), 4)))";
                dtUsers = WS_DBUtils.utils_LER.DBSelectTable(query);
                if (dtUsers.Rows.Count == 1)
                    return Convert.ToInt32(dtUsers.Rows[0]["PKWEB_USER"]);

                // recherche par email dans OCCUPANT
                query =
$@"SELECT pkweb_user
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, occupant 
WHERE 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = occupant.pkoccupant
and occupant.datedepart > sysdate
AND UPPER(occupant.email) = {LoginID.ToUpper().QuotedStr()}
AND ((password_encrypted IS NULL AND password = {Password.QuotedStr()} ) 
  OR (password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({Password.QuotedStr()}), 4)))";
                dtUsers = WS_DBUtils.utils_LER.DBSelectTable(query);
                if (dtUsers.Rows.Count == 1)
                    return Convert.ToInt32(dtUsers.Rows[0]["PKWEB_USER"]);

            }

            string spk = WS_DBUtils.utils_LER.DBSelect(query);
            if (spk != "")
                return Convert.ToInt32(spk);
            else return -1;
#endif
        }
        private static int checkToken(string TokenID)
        {
            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_LOGIN_TOKEN.*
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_LOGIN_TOKEN
WHERE upper(tokenid) = upper({TokenID.QuotedStr()})
AND EXPIRATIONDATE >= sysdate");
            if (r == null)
                return -1;
            else return r["FKWEB_USER"].ToString().ToInt32OrDefault(-1);
        }
        public static bool checkSession(string SessionID, int PkUser)
        {
            if (SessionID == WS_Common._SuperSessionId)
                return true;
            else return Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(
                $@"SELECT count(*) FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_session 
                               WHERE SessionID = {SessionID.QuotedStr()}
                               AND fkweb_user = {PkUser}")) > 0;
        }
        public static session Login(string LoginID, string Password)
        {
            //WS_DBUtils.utils_SF.DBOpen(true);
            session Session;
            try
            {
                Session = new session(LoginID, Password, false);
            }
            catch (Exception Ex)
            {
                Session = new session
                {
                    Erreur = Ex.Message
                };
            }
            return Session;
        }
        public static session LoginFromParam(string SuperLoginID, string SuperPassword, string Param)
        {
            //WS_DBUtils.utils_SF.DBOpen(true);
            session Session = new session();
            try
            {
                if ((SuperLoginID == WS_Common._SuperLoginID) && (SuperPassword == WS_Common._SuperPassword))
                {
                    string ParamDecrypte = WS_Common.Decrypte(Param);

                    ParamDecrypte = ParamDecrypte.Replace("&login=", "|login=");
                    ParamDecrypte = ParamDecrypte.Replace("&Login=", "|login=");
                    ParamDecrypte = ParamDecrypte.Replace("&LOGIN=", "|login=");
                    ParamDecrypte = ParamDecrypte.Replace("&password=", "|password=");
                    ParamDecrypte = ParamDecrypte.Replace("&Password=", "|password=");
                    ParamDecrypte = ParamDecrypte.Replace("&PASSWORD=", "|password=");
                    ParamDecrypte = ParamDecrypte.Replace("&date=", "|date=");
                    ParamDecrypte = ParamDecrypte.Replace("&Date=", "|date=");
                    ParamDecrypte = ParamDecrypte.Replace("&DATE=", "|date=");
                    ParamsString hParams = new ParamsString(ParamDecrypte);

                    if (hParams.GetParam("TOKEN") != "")
                    {
                        return new session(hParams.GetParam("TOKEN"));
                    }

                    if (hParams.GetParam("DATE") != "" &&
                        hParams.GetParam("DATE") != DateTime.Now.ToString("dd/MM/yyyy"))
                    {
                        Session.Erreur = "cette url n'est plus valide";
                        return Session;
                    }

                    return new session(hParams.GetParam("LOGIN"), hParams.GetParam("PASSWORD"), true);
                }
            }
            catch (Exception Ex)
            {
                Session.Erreur = Ex.Message;
            }
            return Session;
        }

        public static string GetLoginToken(string SuperLoginID, string SuperPassword, int PkUser)
        {
            //WS_DBUtils.utils_SF.DBOpen(true);
            try
            {
                if ((SuperLoginID == WS_Common._SuperLoginID) && (SuperPassword == WS_Common._SuperPassword))
                    return InsertLoginToken(PkUser);
            }
            catch //(Exception Ex)
            {
            }
            return "";
        }


        public static bool Logout(string SessionID, int PkUser)
        {
            try
            {
                WS_DBUtils.utils_LER.DBExec(
                    $@"DELETE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_SESSION
WHERE SessionID = {SessionID.QuotedStr()} 
AND FKWEB_USER = {PkUser} ");
                return true;
            }
            catch
            {
                return false;
            }
        }
        //public static bool LogoutAll(string LoginID, string Password)
        //{
        //    // supprime toutes les connexions en cours
        //    try
        //    {
        //        if ((LoginID == "JOHN DOE") && (Password == "0815"))
        //        {
        //            WS_DBUtils.utils_LER.DBExec($"DELETE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_SESSION ");
        //            return true;
        //        }
        //        else
        //            return false;
        //    }
        //    catch
        //    {
        //        return false;
        //    }
        //}
    }
    #endregion


    #region Utilisateurs
    public class user : retour
    {
        public string LoginID = "";
        public string UserName = "";
        public string Password = "";
        public string EMail = "";
        public string UserType = "";
        public int PKUser = -1;
        public string Adresse = "";
        public string CP = "";
        public string Ville = "";
        public int FK = -1;
        public string PhoneNumber = "";
        public string FirstName = "";
        public string UserRole = "";
        public string ClientName = "";
        public string ClientID = "";
        public DateTime ExpirationDate; // Expiration date of the user
        public DateTime PasswordExpirationDate; // Expiration date of the password
        public string CGU = "";
        public int FKClient = -1;
        public int FKClientTop = -1;
        public int NbImmeubles = -1;

        public int Seuil_Conso_EF = -1;
        public int Seuil_Conso_EC = -1;
        public int Seuil_Conso_Repart = -1;
        public int Seuil_Conso_CET = -1;
        public bool Seuil_Conso_Actif = false;
        public string Seuil_Conso_Email = "";

        public bool showImmeublesArc = false;
        public bool showFactures = false;
        public bool showChgtOccupant = false;
        public bool showChantiers = false;

    }

    public class users : retour
    {
        public List<user> ListeUsers = new List<user>();
        public users()
        {
        }
    }

    public class usersBigData : retour
    {
        public List<user> ListeUsersBigData = new List<user>();
        public usersBigData()
        {
        }
    }

    public class userExportParams : retour
    {
        public bool exportAll = true;
        public string exportFormat = "";
    }
    #endregion

    #region client

    public class client : retour
    {
        public int PkClient = -1;
        public string Nom;
        public string ID;
        public string Adresse1;
        public string Adresse2;
        public string Adresse3;
        public string Cp;
        public string Ville;
        public bool TicketsInterEnabled;
    }

    public class clients : retour
    {
        public List<client> ListeClients = new List<client>();
        public clients()
        {
        }
    }
    #endregion

    #region Tableaux de bord

    public class tableauDeBordClient : retour
    {

        public int NbImmeubles = -1;

        public int NbImmeublesTelereleve = -1;
        public int NbImmeublesTransfertFichiers = -1;
        
        // TO DO
        public int NbCompteursARelever = -1;
        public int NbCompteursReleves = -1;
        public int NbLogements = -1;
        public int NbCompteurs = -1;
        public int NbCompteursEC = -1;
        public int NbCompteursEF = -1;
        public int NbCompteursRepart = -1;
        public int NbCompteursCET = -1;
        public int NbCompteursCapteur = -1;
        //public int NbCompteursElect = -1;
        //public int NbCompteursGaz = -1;
        public int NbFuites = -1;
        public int NbDepannages = -1;
        public int NbDysfonctionnements = -1;
        public int NbAnomalies = -1;
        //public List<chantier> ListeChantiers = new List<chantier>();
        public int NbChantiers = -1;
        public int NbCompteursPoses = -1;
        public int NbCompteursCommandes = -1;
    }
    public class tableauDeBordImmeuble : retour
    {
        public immeuble Immeuble = new immeuble();
        public int NbLogements = -1;
        public int NbAppareils = -1;
        public int NbDepannages = -1;
        public int NbDepannagesTotal = -1;
        public int NbDysfonctionnements = -1;
        public bool HasTelereleve; // même infos que dans objet immeuble (gardé dans TB car déjà intégré par fidésio)
        public int NbCompteursEC = -1;
        public int NbCompteursEF = -1;
        public int NbCompteursRepart = -1;
        public int NbCompteursCET = -1;
        public int NbCompteursCapteur = -1;
        //public int NbCompteursElect = -1;
        //public int NbCompteursGaz = -1;
        public int NbCompteursTelereveleTotal = -1;
        public int NbCompteursTelereveleOK = -1;
        public bool HasTransfertFichiers;
        public immeubleEAU ImmeubleEC = new immeubleEAU();
        public immeubleEAU ImmeubleEF = new immeubleEAU();
        public immeubleRepart ImmeubleRepart = new immeubleRepart();
        public immeubleCET ImmeubleCET = new immeubleCET();
        public immeubleCapteur ImmeubleCapteur = new immeubleCapteur();
        //public immeubleElect ImmeubleElect = new immeubleElect();
        //public immeubleGaz ImmeubleGaz = new immeubleGaz();
        public serie SerieConsosEAU = new serie();
        public serie SerieConsosCompteurGeneral = new serie();
        //public List<Device> Devices;
    }
    public class immeubleEAU
    {
        public int NbCompteursARelever = -1;
        public int NbCompteursReleves = -1;

        public int NbFuites = -1;

        public int NbAnomalies = -1;

        public chantier Chantier = new chantier();

        public topConsos TopConsos = new topConsos();
        public serie SerieConsos1 = new serie();
        public serie SerieConsos2 = new serie();
        public List<releve> ListeReleves = new List<releve>();
    }
    public class immeubleRepart
    {
        public int NbCompteursARelever = -1;
        public int NbCompteursReleves = -1;

        public chantier Chantier = new chantier();

        public topConsos TopConsos = new topConsos();
        public serie SerieConsos = new serie();
        public List<releve> ListeReleves = new List<releve>();

        public decimal Tot_URepart = -1;
        public decimal Tot_TantChauff = -1;
        public decimal PU_Tant = -1;
        public decimal Prix_URepart = -1;
        public decimal Prix_Abonn = -1;
        public decimal Mont_ARepartTant = -1;
        public decimal Part_RepartConsos = -1;
        public decimal CT_Combust = -1;
        public serie SerieConsosTotale1 = new serie();
        public serie SerieConsosTotale2 = new serie();
        public serie SerieConsosDJU = new serie();
    }
    public class immeubleCET
    {
        public int NbCompteursARelever = -1;
        public int NbCompteursReleves = -1;

        public chantier Chantier = new chantier();

        public topConsos TopConsos = new topConsos();
        public serie SerieConsos = new serie();
        public List<releve> ListeReleves = new List<releve>();

        public decimal Tot_URepart = -1;
        public decimal Tot_TantChauff = -1;
        public decimal PU_Tant = -1;
        public decimal Prix_URepart = -1;
        public decimal Prix_Abonn = -1;
        public decimal Mont_ARepartTant = -1;
        public decimal Part_RepartConsos = -1;
        public decimal CT_Combust = -1;
        public serie SerieConsosTotale1 = new serie();
        public serie SerieConsosTotale2 = new serie();
        public serie SerieConsosDJU = new serie();
    }
    public class immeubleCapteur
    {
        public indexRecapDate IndexRecapTemperature = new indexRecapDate();
        public indexRecapDate IndexRecapHumidite = new indexRecapDate();
        public serie SerieConsosTemperature = new serie();
        public serie SerieConsosHumidite = new serie();
    }
    //public class immeubleElect
    //{
    //    //public int NbCompteursARelever = -1;
    //    //public int NbCompteursReleves = -1;

    //    public chantier Chantier = new chantier();

    //    public topConsos TopConsos = new topConsos();
    //    public List<releve> ListeReleves = new List<releve>();
    //}
    //public class immeubleGaz
    //{
    //    //public int NbCompteursARelever = -1;
    //    //public int NbCompteursReleves = -1;

    //    public chantier Chantier = new chantier();

    //    public topConsos TopConsos = new topConsos();
    //    public List<releve> ListeReleves = new List<releve>();
    //}
    public class chantier
    {
        public int PkChantier = -1;
        public int PkDevis = -1;
        public int PkImmeuble = -1;
        public DateTime DateEntreeChantier;
        public int NbCompteursPoses = -1;
        public int NbCompteursCommandes = -1;
    }
#endregion

    #region Messages
    public class message
    {
        public string MessageData = "";
        public string MessageType = "";
        public string Status = "";
        public int PKMessage;
    }

    public class messages : retour
    {
        public List<message> listeMessages = new List<message>();
        public messages()
        {
        }
    }
    #endregion

    #region Consos

    public class topConsos : retour
    {
        public DateTime DateReleve;
        public List<conso> consosGrandes = new List<conso>();
        public List<conso> consosPetites = new List<conso>();
    }

    public class conso
    {
        //public string NumCpteur;
        public int PkLogement = -1;
        public string NomOcc;
        public string RefOcc;
        public int Fluide = -1;
        //public decimal Index;
        public decimal Conso;
    }

    // Sert pour les graphs
    public class serie : retour
    {
        // l'intervalle servira à définir le nombre de valeurs à afficher (nombre de jours pour initialiser les 2 calendriers (now-Intervalle et now))
        public int DefaultIntervalle = 365;
        // format : x|y|label|InfosOptionnelles;x|y|label|InfosOptionnelles (le séparateur d'infos optionnelles est \)
        // exemple : (sans paramètre qui contient infos optionnelles)
        //format: date|conso|index
        //utilisation: 10/12/2013|10|123;10/01/2014|09|132
        // exemple : (avec paramètre qui contient infos optionnelles)
        //format: date|conso|index|FUITE=O
        //utilisation: 10/12/2013|10|123|FUITE=O;10/01/2014|09|132|FUITE=O
        public string ValeursXYL = "";
        public string Annee = "";
    }
    public class multiSeries : retour
    {
        public serie Serie1 = new serie();
        public serie Serie2 = new serie();
        public serie SerieDebug = new serie();
    }

    #endregion

    #region Logements / Occupants / Compteurs

    public class infosLogements : retour
    {
        public List<infosLogement> ListeInfosLogements = new List<infosLogement>();
        public infosLogements()
        {
        }
    }

    public class infosLogement
    {
        public immeuble Immeuble = new immeuble();
        public logement Logement = new logement();
        public occupant Occupant = new occupant();

        public int NbAppareils = -1;
        public int NbCompteursEC = -1;
        public int NbCompteursEF = -1;
        public int NbCompteursRepart = -1;
        public int NbCompteursCET = -1;
        public int NbCompteursCapteur = -1;
        //public int NbCompteursElect = -1;
        //public int NbCompteursGaz = -1;
        public int NbFuites = -1;
        public int NbDepannages = -1;
        public int NbDysfonctionnements = -1;
        public int NbAnomalies = -1;
        public int NbTicketsInter = -1;
        public bool TicketsInterEnabled;

        public List<appareil> ListeAppareils = new List<appareil>();
        public infosLogement()
        {
        }
    }

    public class logement
    {
        public int PkLogement = -1;
        public string NumBatiment;
        public string AdrBatiment;
        public string NumEscalier;
        public string AdrEscalier;
        public string NumEtage;
        public string NumOrdre;
        public string Type;
        public logement()
        {
        }
    }

    public class infosAppareilsEAU : retour // tous les appareils de ListeInfosAppareils ont les mêmes dates de relevés
    { // utilisé pour EC et EF
        public List<infosAppareilEAU> ListeInfosAppareils = new List<infosAppareilEAU>();
        public DateTime DateR6 = new DateTime();
        public DateTime DateR5 = new DateTime();
        public DateTime DateR4 = new DateTime();
        public DateTime DateR3 = new DateTime();
        public DateTime DateR2 = new DateTime();
        public DateTime DateR1 = new DateTime();
        public infosAppareilsEAU()
        {
        }
    }
    public class infosAppareilsRepart : retour
    {
        public List<infosAppareilRepart> ListeInfosAppareils = new List<infosAppareilRepart>();
        public DateTime DateR6 = new DateTime();
        public DateTime DateR5 = new DateTime();
        public DateTime DateR4 = new DateTime();
        public DateTime DateR3 = new DateTime();
        public DateTime DateR2 = new DateTime();
        public DateTime DateR1 = new DateTime();
        public infosAppareilsRepart()
        {
        }
    }
    public class infosAppareilsCET : retour
    {
        public List<infosAppareilCET> ListeInfosAppareils = new List<infosAppareilCET>();
        public DateTime DateR6 = new DateTime();
        public DateTime DateR5 = new DateTime();
        public DateTime DateR4 = new DateTime();
        public DateTime DateR3 = new DateTime();
        public DateTime DateR2 = new DateTime();
        public DateTime DateR1 = new DateTime();
        public infosAppareilsCET()
        {
        }
    }
    //public class infosAppareilsElect : retour
    //{
    //    public List<infosAppareilElect> ListeInfosAppareils = new List<infosAppareilElect>();
    //    public infosAppareilsElect()
    //    {
    //    }
    //}
    //public class infosAppareilsGaz : retour
    //{
    //    public List<infosAppareilGaz> ListeInfosAppareils = new List<infosAppareilGaz>();
    //    public infosAppareilsGaz()
    //    {
    //    }
    //}

    public class infosAppareilEAU // utilisé pour EC et EF
    {
        public appareil Appareil = new appareil();
        public serie SerieConsos = new serie();
        public indexReleve R6 = new indexReleve();
        public indexReleve R5 = new indexReleve();
        public indexReleve R4 = new indexReleve();
        public indexReleve R3 = new indexReleve();
        public indexReleve R2 = new indexReleve();
        public indexReleve R1 = new indexReleve();
        public int NbFuites = 0;
        public int NbDepannages = 0;
        public int NbDysfonctionnements = -1;
        public int NbAnomalies = 0;
    }

    public class infosAppareilRepart
    {
        public appareil Appareil = new appareil();
        public serie SerieConsosDJU = new serie();
        public serie SerieConsos = new serie();
        public indexReleve R6 = new indexReleve();
        public indexReleve R5 = new indexReleve();
        public indexReleve R4 = new indexReleve();
        public indexReleve R3 = new indexReleve();
        public indexReleve R2 = new indexReleve();
        public indexReleve R1 = new indexReleve();
    }
    public class infosAppareilCET
    {
        public appareil Appareil = new appareil();
        public serie SerieConsosDJU = new serie();
        public serie SerieConsos = new serie();
        public indexReleve R6 = new indexReleve();
        public indexReleve R5 = new indexReleve();
        public indexReleve R4 = new indexReleve();
        public indexReleve R3 = new indexReleve();
        public indexReleve R2 = new indexReleve();
        public indexReleve R1 = new indexReleve();
    }
    //public class infosAppareilElect
    //{
    //    public appareil Appareil = new appareil();
    //    //TODO compléter
    //}
    //public class infosAppareilGaz
    //{
    //    public appareil Appareil = new appareil();
    //    //TODO compléter
    //}
    // utilisé dans un logement pour les fluides
    public class consosPeriode
    {
        public decimal Conso = 0;
        public DateTime DateDeb;
        public DateTime DateFin;
        public indexReleve R5 = new indexReleve();
        public indexReleve R4 = new indexReleve();
        public indexReleve R3 = new indexReleve();
        public indexReleve R2 = new indexReleve();
        public indexReleve R1 = new indexReleve();
        public decimal VAR4;
        public decimal VAR3;
        public decimal VAR2;
        public decimal VAR1;
        public int DegresVAR4 = -1;
        public int DegresVAR3 = -1;
        public int DegresVAR2 = -1;
        public int DegresVAR1 = -1;
    }

    public class releve
    {
        public int PkReleve = -1;
        public DateTime DateReleve = new DateTime();
        public string TypeERC;
    }

    public class indexReleve
    {
        public DateTime DateReleve;
        public decimal Index = 0;
        public decimal Conso = 0;
    }
    public class indexTeleReleve
    {
        public DateTime DateReleve;
        public decimal Index = 0;
        public decimal Conso = 0;
        public bool Releve = true; // indique si index "virtuel" pour graphs ou si vraiment relevé
        public bool Fuite = false;
    }
    public class indexMois
    {
        public string Key;
        public int Annee;
        public int Mois;
        public decimal Index = -1;
        public decimal Conso = -1;
        public bool Virtual = false;//true= marquer dans graph comme "calculé"
        public bool Visible = false;//false=ne pas afficher

    }
    public class indexRecapDate
    {
        public DateTime Date;
        public decimal Moy = -1;
        public decimal Max = -1;
        public decimal Min = -1;
    }

    public class appareil
    {
        public int PkAppareil = -1;
        public string Numero;
        public string Emplacement;
        public string Fluide;
        public string TypeAppareil;
        public string Unite;
    }

    public class occupant
    {
        public int PkOccupant = -1;
        public string Nom;
        public string Ref;
        public DateTime DateArrivee;
        public DateTime DateDepart;

        public occupant()
        {
        }

    }

    public class occupant4Chgt
    {
        public int PkOccupant = -1;
        public string Nom = "";
        public string CodeLogeGestio = "";
        public DateTime DateArrivee = DateTime.MinValue;
        public string email = "";
        public string telfixe = "";
        public string telmobile = "";
        public string numbail = "";

        public string idIMM = "";
        public string codegestioIMM = "";
        public string adresseIMM = "";
        public string cpIMM = "";
        public string villeIMM = "";
        public string numBAT = "";
        public string adresseBAT = "";
        public string numESC = "";
        public string adresseESC = "";
        public string numetage = "";
        public string numordre = "";

        public int newPkOccupant = -1; // utilisé au retour de LER
        public string newNom = "";
        public string newCodeLogeGestio = "";
        public DateTime newDateArrivee = DateTime.MinValue;
        public string newEmail = "";
        public string newTelfixe = "";
        public string newTelmobile = "";
        public string newNumbail = "";

        public bool isNew = false;

        public string Erreur;
    }

    public class tableauDeBordLogement : retour
    {
        // recup infos utiles de l'immeuble
        public immeuble Immeuble = new immeuble();
        public logement Logement = new logement();
        public occupant Occupant = new occupant();

        public int NbAppareils = -1;
        public int NbCompteursEC = -1;
        public int NbCompteursEF = -1;
        public int NbCompteursRepart = -1;
        public int NbCompteursCET = -1;
        public int NbCompteursCapteur = -1;
        //public int NbCompteursElect = -1;
        //public int NbCompteursGaz = -1;

        public int NbDepannages = -1;
        public int NbDepannagesTotal = -1;
        public int NbDysfonctionnements = -1;
        public int NbTicketsInter = -1;
        public bool TicketsInterEnabled;

        public logementEAU LogementEC = new logementEAU();
        public logementEAU LogementEF = new logementEAU();
        public logementRepart LogementRepart = new logementRepart();
        public logementCET LogementCET = new logementCET();
        public logementCapteur LogementCapteur = new logementCapteur();
        //public logementElect LogementElect = new logementElect();
        //public logementGaz LogementGaz = new logementGaz();

    }

    public class logementEAU
    {
        public int NbFuites = -1;
        public int NbAnomalies = -1;
        public consosPeriode ConsoPeriode = new consosPeriode();
        public List<infosAppareilEAU> ListeInfosAppareils = new List<infosAppareilEAU>();
        public serie SerieConsos = new serie();
        public decimal ConsoMemeTypeLogement = -1; //conso de référence du même fluide pour même type de logement
    }

    public class logementRepart
    {
        public List<infosAppareilRepart> ListeInfosAppareils = new List<infosAppareilRepart>();
        public decimal Tot_URepart = -1;
        public decimal Tot_TantChauff = -1;
        public decimal PU_Tant = -1;
        public decimal Prix_URepart = -1;
        public decimal Prix_Abonn = -1;
        public decimal Mont_ARepartTant = -1;
        public decimal Part_RepartConsos = -1;
        public decimal CT_Combust = -1;

        public decimal URepartLog = -1;
        public decimal TantLog = -1;
        public decimal Prix_ChauffTantLog = -1;
        public decimal CT_ChauffLog = -1;

        public serie SerieConsosDJU = new serie();
        public List<consoPieceRepart> ConsosPieces = new List<consoPieceRepart>();
    }

    public class consoPieceRepart
    {
        public string Emplacement;
        public indexReleve R1 = new indexReleve();
        public indexReleve R2 = new indexReleve();
    }

    public class logementCET
    {
        public List<infosAppareilCET> ListeInfosAppareils = new List<infosAppareilCET>();
        public decimal Tot_URepart = -1;
        public decimal Tot_TantChauff = -1;
        public decimal PU_Tant = -1;
        public decimal Prix_URepart = -1;
        public decimal Prix_Abonn = -1;
        public decimal Mont_ARepartTant = -1;
        public decimal Part_RepartConsos = -1;
        public decimal CT_Combust = -1;

        public decimal URepartLog = -1;
        public decimal TantLog = -1;
        public decimal Prix_ChauffTantLog = -1;
        public decimal CT_ChauffLog = -1;

        public serie SerieConsosDJU = new serie();
        //public List<consoPieceRepart> ConsosPieces = new List<consoPieceRepart>();
    }

    public class logementCapteur
    {
        public indexRecapDate IndexRecapTemperature = new indexRecapDate();
        public indexRecapDate IndexRecapHumidite = new indexRecapDate();

        public serie SerieConsosTemperature = new serie();
        public serie SerieConsosHumidite = new serie();
    }

    //public class logementElect
    //{
    //    public List<infosAppareilElect> ListeInfosAppareils = new List<infosAppareilElect>();
    //    //TODO suite
    //}
    //public class logementGaz
    //{
    //    public List<infosAppareilGaz> ListeInfosAppareils = new List<infosAppareilGaz>();
    //    //TODO suite
    //}


    #endregion

    #region fuites

    public class infosFuites : retour
    {
        public List<infosFuite> ListeInfosFuites = new List<infosFuite>();
        public infosFuites()
        {
        }
    }

    public class infosFuite
    {
        public logement Logement = new logement();
        public occupant Occupant = new occupant();
        public appareil Appareil = new appareil();
        public fuite Fuite = new fuite();
        public infosFuite()
        {
        }
    }

    public class fuite
    {
        public int Duree = -1;
        public DateTime DateDebut;
        public decimal IndexDebut = -1;
        public decimal Conso = -1;
    }

    #endregion

    #region Dysfonctionnements


    public class infosDysfonctionnements : retour
    {
        public List<infosDysfonctionnement> ListeInfosDysfonctionnements = new List<infosDysfonctionnement>();
        public infosDysfonctionnements()
        {
        }
    }
    public class infosDysfonctionnement
    {
        public logement Logement = new logement();
        public occupant Occupant = new occupant();
        public appareil Appareil = new appareil();
        public dysfonctionnement Dysfonctionnement = new dysfonctionnement();
        public infosDysfonctionnement()
        {
        }
    }

    public class dysfonctionnement
    {
        public int Duree = -1;
        public DateTime DateDebut;
        public decimal IndexDebut = -1;
        public decimal Conso = -1;
        public string Type;
    }

    #endregion

    #region Anomalies de conso

    public class infosAnomalies : retour
    {
        public List<infosAnomalie> ListeInfosAnomalies = new List<infosAnomalie>();
        public infosAnomalies()
        {
        }
    }

    public class infosAnomalie
    {
        public logement Logement = new logement();
        public occupant Occupant = new occupant();
        public appareil Appareil = new appareil();
        public anomalie Anomalie = new anomalie();
        public infosAnomalie()
        {
        }
    }

    public class anomalie
    {
        public decimal Index = -1;
        public decimal Conso = -1;
        public string Observations;
    }


    #endregion

    #region dépannages

    public class infosDepannages : retour
    {
        public List<infosDepannage> ListeInfosDepannages = new List<infosDepannage>();
        public infosDepannages()
        {
        }
    }

    public class infosDepannage
    {
        public logement Logement = new logement();
        public occupant Occupant = new occupant();
        public depannage Depannage = new depannage();
        public infosDepannage()
        {
        }
    }

    public class depannage
    {
        public string WorkOrderNumber;
        public string Numero;
        public string Statut;
        public string StatutAbrege;
        public DateTime Date;
        public string Motif;
        public string MotifAbrege;
        public string CompteRendu;
    }

    public class detailsDepannage : retour
    {
        public infosDepannage InfosDepannage = new infosDepannage();
        public List<depannage> ListeDepannagesOccupant = new List<depannage>();
    }

    #endregion

    #region Tickets inter

    public class ticketInterInit : retour
    {
        public int FkLogement;
        public string Nom;
        public string Email;
        public string TelFixe;
        public string TelMobile;
    }
    public class ticketInter
    {
        //public int PkTicketInter = -1;
        public string Nom;
        public string Email;
        public string TelFixe;
        public string TelMobile;
        public DateTime TicketDate;
        public string MotifLibre;
        public string Statut;
        public string ObjetRetour;
        public int FkLogement;
        public string RefLogement;
        public string NumIntervention;
        public string FkIntervention;
        public string WebUser_Nom;
        public string WebUser_Prenom;
        public string WebUser_Tel;
        public string WebUser_Email;
        public string WebUser_UserType;
        public string Imm_Id;
        public int FkImmeuble;
        //public string RecordID;
        public string Statut_Client;
        public string CaseNumber;
        public string CaseId;
        public string AttachmentName;
        public DateTime LastUpdateDate;
    }
    public class ticketsInter : retour
    {
        public List<ticketInter> ListeTicketsInter = new List<ticketInter>();
    }

    public class AttachmentFile
    {
        public string Name;
        public Byte[] content;
    }

    #endregion


    public class facture
    {
        public int PKFacture;
        public string NumFacture = "";
        public DateTime DateEdition;
        public DateTime DateDebut;
        public DateTime DateFin;
        public decimal MontantTotalHT;
        public decimal MontantTotalTTC;
        public decimal MontantTotalAPayer;

        public string IDImm;
        public string CodeGestio;
        public string CP;
        public string Adresse;
        public string Ville;

    }
    public class factures : retour
    {
        public List<facture> ListeFactures = new List<facture>();
        public factures()
        {
        }
    }

    public class workOrderLineItemSF
    {
        //public string Id;
        public string AssetSerialNumber;
        public string WorkType;
        public string MotifExecution;
        public string MotifNonExecution;
        public string Statut;
    }
    public class workOrderSF
    {
        //public string Id;
        public string WorkOrderNumber;
        public string Statut;
        public DateTime SchedStartTime;
        public string Tech_ArrivalStartTime;
        public string Tech_ArrivalEndTime;
        public string IdImm;
        public string CodeGestioImm;
        public logement Logement;
        public occupant Occupant;
        public List<workOrderLineItemSF> ListeWorkOrderLineItemSF = new List<workOrderLineItemSF>();
    }
    public class caseSF : retour
    {
        public string Id;
        public string Statut;
        public string CaseNumber;
        public string Categorie;
        public string SousCategorie;
        public string Subject;
        public string Type;

        public List<workOrderSF> ListeWorkOrderSF = new List<workOrderSF>();
    }
    public class casesSF : retour
    {
        public List<caseSF> ListeCasesSF = new List<caseSF>();
        public casesSF()
        {
        }
    }

    public class sousTraitant
    {
        public string Nom;
        public string Description;
        public string Territoires;
        public string Pays;
        public string Adresse;
        public string CP;
        public string Ville;
        public string Protection;
    }

    public class userLog
    {
        public string loginId;
        public DateTime loginTime;
    }

    public class GraphPoint
    {
        public DateTime date;
        public decimal value;
    }
}
