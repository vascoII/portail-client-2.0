using DevExpress.XtraReports.Wizards;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Reflection;
using System.Web.Services;
using Techem.LER.LER_PrintPlugin;
using Tools;

namespace Techem.Webservices.WS_EspaceClient
{
    /// <summary>
    /// Description résumée de Service1
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [ToolboxItem(false)]
    // Pour autoriser l'appel de ce service Web depuis un script à l'aide d'ASP.NET AJAX, supprimez les marques de commentaire de la ligne suivante. 
    // [System.Web.Script.Services.ScriptService]
    public class Main : System.Web.Services.WebService
    {

        [WebMethod]
        public string GetHello()
        {
            try
            {
                WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
                return "Hello !";
            }
            catch (Exception ex)
            {
                if (Properties.Settings.Default.Debug)
                    WS_Common.InsertTrace(ex.Message);
                return "";
            }
        }
        #region UTILISE PAR LE WS 
        /// <summary>
        /// </summary>
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
        /// UTILISE PAR LE WS 
        [WebMethod]
        public infosImmeubles GetInfosImmeubles(string SessionID, int PkUser, int PkUserChild, string ParamsFiltres, string ParamsInfos)
        {
            try
            {
                WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
                infosImmeubles r = WS_Common.GetInfosImmeubles(SessionID, PkUser, PkUserChild, ParamsFiltres, ParamsInfos);
                WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
                return r;
            }
            catch (Exception ex)
            {
                if (Properties.Settings.Default.Debug)
                    WS_Common.InsertTrace(ex.Message);
                return new infosImmeubles();
            }
        }

        /// <summary>
        /// Méthode qui permet d'affecter des droits (une liste de n° d'immeubles) à un USER (PkUserChild)
        /// </summary>
        ///<param name="SessionID">Identificateur de session</param>
        ///<param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkUserChild">PK de l'utilisateur à qui on souhaite affecter des droits</param>
        /// <param name="ListImmeubles">liste de n° d'immeubles séparés par le caractère "|"</param>
        /// <returns>Retourne un objet de type "retour" qui contient ou non un message d'erreur </returns>
        /// /// UTILISE PAR LE WS
        [WebMethod]
        public retour SetImmeubles(string SessionID, int PkUser, int PkUserChild, string ListImmeubles)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.SetImmeubles(SessionID, PkUser, PkUserChild, ListImmeubles);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet de s'authentifier
        /// </summary>
        /// <param name="LoginID">Login de l'utilisateur qui souhaite se connecter</param>
        /// <param name="Password">Mot de passe de l'utilisateur qui souhaite se connecter</param>
        /// <returns>Retourne un objet de type "session"</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public session Login(string LoginID, string Password)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            session r = session.Login(LoginID, Password);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public session LoginFromParam(string SuperLoginID, string SuperPassword, string Param)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            session r = session.LoginFromParam(SuperLoginID, SuperPassword, Param);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet de se déconnecter
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <returns>Renvoie true si la déconnexion s'est bien passée</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public bool Logout(string SessionID, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            bool r = session.Logout(SessionID, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }
        /// <summary>
        /// Méthode qui permet à un administrateur de créer un USER (gestionnaire)
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="LoginID">Login de l'utilisateur à créer</param>
        /// <param name="UserName">Nom  de l'utilisateur à créer</param>
        /// <param name="FirstName">Prénom</param>
        /// <param name="PhoneNumber">N° de téléphone</param>
        /// <param name="Email">Email de l'utilisateur à créer</param>
        /// <param name="UserRole"></param>
        /// <returns>Renvoie true si la création s'est bien passée</returns> 
        /// UTILISE PAR LE WS
        [WebMethod]
        public bool CreateGestionnaire(string SessionID, int PkUser, string LoginID,
            string UserName, string FirstName, string PhoneNumber, string Email, string UserRole)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            bool r = WS_Common.CreateGestionnaire(SessionID, PkUser, LoginID, UserName, FirstName, PhoneNumber, Email, UserRole);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet de renvoyer la liste des USER (gestionnaire ou occupant) gérés par un directeur
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="type">(ALL, G, O)</param>
        /// <returns>Retourne une liste de user</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public users GetChildUsers(string SessionID, int PkUser, string type)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            users r = WS_Common.GetChildUsers(SessionID, PkUser, type);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        //UTILISE PAR LE WS
        [WebMethod]
        public retour DeleteUser(string SessionID, int PkUser, int PkUserChild)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.DeleteUser(SessionID, PkUser, PkUserChild);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        ///UTILISE PAR LE WS
        [WebMethod]
        public user GetUser(string SessionID, int PkUser, int PkUserChild)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.GetUser(SessionID, PkUser, PkUserChild);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Update password pour un utilisateur
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkUserChild">=-1 --> renvoie la liste des immeubles du PKUser, 
        /// != -1 --> renvoie la liste des immeubles du PKUserChild</param>
        /// <param name="Password">Mot de passe de l'utilisateur qui souhaite se connecter</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public retour UpdatePassword(string SessionID, int PkUser, int PkUserChild, string Password)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.UpdatePassword(SessionID, PkUser, PkUserChild, Password);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public retour UpdateUser(string SessionID, int PkUser, int PkUserChild,
            string UserName, string FirstName, string PhoneNumber, string Email, string UserRole)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.UpdateUser(SessionID, PkUser, PkUserChild, UserName, FirstName, PhoneNumber, Email, UserRole);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public List<GraphPoint> GetStatOccupantsGraph(string SessionID, int PkUser, string typeGraph, string startDate, string endDate)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<GraphPoint> r = WS_Common.GetStatOccupantsGraph(SessionID, PkUser, typeGraph, startDate, endDate);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne la liste des sous traitants
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public List<sousTraitant> GetSousTraitants(string SuperLoginID, string SuperPassword)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<sousTraitant> r = WS_Common.GetSousTraitants(SuperLoginID, SuperPassword);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne la liste des logs des occupants
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="idClient">Id Client</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        public List<userLog> GetStatOccupants(string SuperLoginID, string SuperPassword, string idClient)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<userLog> r = WS_Common.GetStatOccupants(SuperLoginID, SuperPassword, idClient, "", "");
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Obtient la liste des utilisateurs BigData
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public usersBigData GetUsersBigData(string SuperLoginID, string SuperPassword)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            usersBigData r = WS_Common.GetUsersBigData(SuperLoginID, SuperPassword);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public user ResetPasswordFromEmail(string SessionID, int PkUser, string Email)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.ResetPasswordFromEmail(SessionID, PkUser, Email);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public user ResetPasswordFromPKUser(string SuperLoginID, string SuperPassword, int PKUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.ResetPasswordFromPKUser(SuperLoginID, SuperPassword, PKUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public user UpdateCGUFromPKUser(string SuperLoginID, string SuperPassword, int PKUser, string CGU)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.UpdateCGUFromPKUser(SuperLoginID, SuperPassword, PKUser, CGU);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public user UpdateEmailFromPKUser(string SuperLoginID, string SuperPassword, int PKUser, string Email)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.UpdateEmailFromPKUser(SuperLoginID, SuperPassword, PKUser, Email);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// pour un client, récupère la liste de ses factures
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public factures getFactures(string SessionID, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            factures r = WS_Common.getFactures(SessionID, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// pour un client, récupère la liste des occupants de son patrimoine
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="PkImmeuble"></param>
        /// <param name="PkOccupant"></param>
        /// <param name="isNew"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public List<occupant4Chgt> getOccupants4Chgt(string SessionID, int PkUser, int PkImmeuble,
            int PkOccupant = -1, bool isNew = false)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<occupant4Chgt> r = WS_Common.getOccupants4Chgt(SessionID, PkUser, PkImmeuble, PkOccupant, isNew);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// enregistre les changements d'occupants dans la base
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="occupants"></param>
        /// <param name="isNew"></param>
        /// UTILISE PAR LE WS
        [WebMethod]
        public List<occupant4Chgt> setOccupants4Chgt(string SessionID, int PkUser,
            List<occupant4Chgt> occupants, bool isNew)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<occupant4Chgt> r = WS_Common.setOccupants4Chgt(SessionID, PkUser, occupants);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet de renvoyer un tableau de bord pour l'immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkImmeuble">N° d'immeuble</param>
        /// <returns>Retourne un tableau de bord pour l'immeuble</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public tableauDeBordImmeuble GetTableauBordImmeuble(string SessionID, int PkUser, int PkImmeuble)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            tableauDeBordImmeuble r = WS_Common.GetTableauBordImmeuble(SessionID, PkUser, PkImmeuble);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet de renvoyer un tableau de bord pour le client
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <returns>Retourne un tableau de bord client</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public tableauDeBordClient GetTableauBordClient(string SessionID, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            tableauDeBordClient r = WS_Common.GetTableauBordClient(SessionID, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Permet de télécharger un report
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="ReportType"></param>
        /// <param name="ParamsFiltres"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public Byte[] GetReport(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            LER_PrintPlugin.Init(WS_DBUtils.utils_LER, WS_DBUtils.utils_SF, WS_DBUtils.utils_Mongo);
            Byte[] r = WS_Common.GetReport(SessionID, PkUser, ReportType, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Permet de télécharger un fichier Excel
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="ReportType"></param>
        /// <param name="ParamsFiltres"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public Byte[] GetExcel(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            Byte[] r = WS_Common.GetExcel(SessionID, PkUser, ReportType, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Download le fichier demandé 
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="FileName">Nom du fichier présent dans le "DataDirectory"</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public Byte[] GetFile(string SuperLoginID, string SuperPassword, string FileName)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            Byte[] r = WS_Common.GetFile(SuperLoginID, SuperPassword, FileName);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Récupère les informations des logements pour tous les immeubles 
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté </param>
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
        /// UTILISE PAR LE WS
        [WebMethod]
        public infosLogements GetInfosLogements(string SessionID, int PkUser, string ParamsFiltres, string ParamsInfos)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            infosLogements r = WS_Common.GetInfosLogements(SessionID, PkUser, -1, ParamsFiltres, ParamsInfos);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

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
        /// UTILISE PAR LE WS
        [WebMethod]
        public infosLogements GetInfosLogementsByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres, string ParamsInfos)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            infosLogements r = WS_Common.GetInfosLogements(SessionID, PkUser, PkImmeuble, ParamsFiltres, ParamsInfos);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Récupère les informations necessaires pour générer le tableau de bord d'un logement
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkLogement">Pk du logement</param>
        /// <param name="PkOccupant">PK Occupant</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public tableauDeBordLogement GetTableauBordLogement(string SessionID, int PkUser, int PkLogement, int PkOccupant)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            tableauDeBordLogement r = WS_Common.GetTableauBordLogement(SessionID, PkUser, PkLogement, PkOccupant);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne le nombre de transfert de fichier pour un client donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <returns>Retourne un tableau de bord client</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public int GetNbTransfertFichiersClient(string SessionID, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            int r = WS_Common.GetNbTransfertFichiersClient(SessionID, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne le nombre de transfert de fichier pour un immeuble donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkImmeuble">N° d'immeuble</param>
        /// <returns>Retourne un tableau de bord pour l'immeuble</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public int GetNbTransfertFichiersImmeuble(string SessionID, int PkUser, int PkImmeuble)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            int r = WS_Common.GetNbTransfertFichiersImmeuble(SessionID, PkUser, PkImmeuble);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }
        /// <summary>
        /// Récupère le détail sur les dépannage d'un workorder
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="WorkOrderNumber">Numéro du workorder</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public detailsDepannage GetDetailsDepannage(string SessionID, int PkUser, string WorkOrderNumber)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            detailsDepannage r = WS_Common.GetDetailsDepannage(SessionID, PkUser, WorkOrderNumber);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
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
        /// UTILISE PAR LE WS
        [WebMethod]
        public infosDepannages GetInfosDepannagesByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            infosDepannages r = WS_Common.GetInfosDepannagesByImmeuble(SessionID, PkUser, PkImmeuble, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Récupère mes disfonctionnement pour un immeuble et un utilisateur donné
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur</param>
        /// <param name="PkImmeuble"></param>
        /// <param name="ParamsFiltres">Filtres pour pouvoir filtrer sur un occupant, compteur, immeuble, logement ou/et utilisateur</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public infosDysfonctionnements GetInfosDysfonctionnementsByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            infosDysfonctionnements r = WS_Common.GetInfosDysfonctionnementsByImmeuble(SessionID, PkUser, PkImmeuble, WS_Common.getLastDateIndex(), ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LE WS
        [WebMethod]
        public infosFuites GetInfosFuitesByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            infosFuites r = WS_Common.GetInfosFuitesByImmeuble(SessionID, PkUser, PkImmeuble, WS_Common.getLastDateIndex(), ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

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
        /// UTILISE PAR LE WS
        [WebMethod]
        public infosAnomalies GetInfosAnomaliesByImmeuble(string SessionID, int PkUser, int PkImmeuble, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            infosAnomalies r = WS_Common.GetInfosAnomaliesByImmeuble(SessionID, PkUser, PkImmeuble, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// permet de vérifier si le client peut faire du E-ticketing
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public bool CheckTicketsInterEnabled(string SessionID, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            bool r = WS_Common.CheckTicketsInterEnabled(SessionID, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkLogement"></param>
        /// <param name="ParamsFiltres">STATUT</param>
        /// <returns></returns>
        /// </summary>
        /// UTILISE PAR LE WS
        [WebMethod]
        public int GetNbTicketsInterByLogement(string SessionID, int PkUser, int PkLogement, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            int r = WS_Common.GetNbTicketsInterByLogement(SessionID, PkUser, PkLogement, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// A la création d'un ticket, permet de récupérer les données par logement 
        /// pour les afficher, par défaut, dans le formulaire
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkLogement"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public ticketInterInit GetTicketInterInit(string SessionID, int PkUser, int PkLogement)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            ticketInterInit r = WS_Common.GetTicketInterInit(SessionID, PkUser, PkLogement);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// permet de cloturer une requête (champ StatuClient)
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="CaseId"></param>
        /// <param name="statut"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public bool SetTicketStatus(string SessionID, int PkUser, string CaseId, string statut)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            bool r = WS_Common.SetTicketStatut(SessionID, PkUser, CaseId, statut);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// A partir du formulaire, permet de créer un ticket
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkLogement">-1 si pas de logement</param>
        /// <param name="Objet"></param>
        /// <param name="Nom"></param>
        /// <param name="Email"></param>
        /// <param name="TelFixe"></param>
        /// <param name="TelMobile"></param>
        /// <param name="MotifLibre"></param>
        /// <param name="AttachmentName">Attachment File Name</param>
        /// <param name="AttachmentContent">Attachment</param>
        /// <returns>On retourne le nombre de ticket du logement ou -1 si erreur</returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public int CreateTicketInter(string SessionID, int PkUser, int PkLogement, string Objet, string Nom, string Email, string TelFixe, string TelMobile, string MotifLibre, string AttachmentName, Byte[] AttachmentContent)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            int r = WS_Common.CreateTicketInter(SessionID, PkUser, PkLogement, Objet, Nom, Email, TelFixe, TelMobile, MotifLibre, AttachmentName, AttachmentContent);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Permet de récupérer la liste des tickets (statut mis à jour) d'un user
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="ParamsFiltres">Filtres ou paramètre en plus</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public ticketsInter GetTicketsIntersUser(string SessionID, int PkUser, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            ticketsInter r = WS_Common.GetTicketsIntersUser(SessionID, PkUser, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne le nombre de tickets ouvert
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public int GetNbTicketsIntersUser(string SessionID, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            int r = WS_Common.GetNbTicketsIntersUser(SessionID, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Permet d'affecter les seuils d'alarme de consommation
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="ParamsFiltres"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public retour SetSeuilConso(string SessionID, int PkUser, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.SetSeuilConso(SessionID, PkUser, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Permet d'insérer un job d'impression de report
        /// </summary>
        /// <param name="SessionID"></param>
        /// <param name="PkUser"></param>
        /// <param name="ReportType"></param>
        /// <param name="ParamsFiltres"></param>
        /// <returns></returns>
        /// UTILISE PAR LE WS
        [WebMethod]
        public int InsertPrintJobs(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            LER_PrintPlugin.Init(WS_DBUtils.utils_LER, WS_DBUtils.utils_SF, WS_DBUtils.utils_Mongo);
            int r = WS_Common.InsertPrintJobs(SessionID, PkUser, ReportType, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }


        #endregion

        #region UTILISE DANS LER
        /// <summary>
        /// Retourne la liste des immeubles par utilisateur
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="PkUser">Pk utilisateur</param>
        /// <returns></returns>
        /// UTILISE DANS LER
        [WebMethod]
        public immeubles GetImmeublesByPKUser(string SuperLoginID, string SuperPassword, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            immeubles imms = new immeubles();
            try
            {
                DataRowCollection rows = WS_Common.GetRowsImmeublesByPKUser(SuperLoginID, SuperPassword, PkUser);
                foreach (DataRow row in rows)
                {
                    immeuble i = new immeuble
                    {
                        Numero = row["ID"].ToString(),
                        Adresse1 = row["ADRESSE"].ToString(),
                        Adresse2 = row["ADRESSE2"].ToString(),
                        Cp = row["CP"].ToString(),
                        Ville = row["VILLE"].ToString(),
                        PkImmeuble = Convert.ToInt32(row["PKIMMEUBLE"].ToString()),
                        Actif = (row["ACTIF"].ToString() == "O")
                    };
                    imms.ListeImmeubles.Add(i);
                }
            }
            catch (Exception Ex)
            {
                imms.Erreur = Ex.Message;
            }

            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return imms;
        }

        /// UTILISE DANS LER
        [WebMethod]
        public string GetLoginToken(string SuperLoginID, string SuperPassword, int PkUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            string r = session.GetLoginToken(SuperLoginID, SuperPassword, PkUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        ///// <summary>
        ///// Méthode qui permet au super administrateur de déconnecter toutes les sessions
        ///// </summary>
        ///// <param name="SuperLoginID">Login du super admin</param>
        ///// <param name="SuperPassword">Mot de passe du super admin</param>
        ///// <returns>Renvoie true si la déconnexion s'est bien passée</returns>
        //[WebMethod]
        //public bool LogoutAll(string SuperLoginID, string SuperPassword)
        //{
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
        //    bool r = session.LogoutAll(SuperLoginID, SuperPassword);
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        //    return r;
        //}

        /// <summary>
        /// Méthode qui permet à un utilisateur de créer les USER (occupants) d'un immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="fk">N° d'immeuble</param>
        /// <param name="type">Doit être égal à "I"</param>
        /// <returns>Renvoie true si la création s'est bien passée</returns>   
        /// UTILISE DANS LER     
        [WebMethod]
        public users CreateOccupants(string SessionID, int PkUser, int fk, string type)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            users r = WS_Common.CreateOccupants(SessionID, PkUser, fk);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet au super  administrateur de créer un administrateur
        /// </summary>
        /// <param name="SuperLoginID">Login du super admin</param>
        /// <param name="SuperPassword">Mot de passe du super admin</param>
        /// <param name="LoginID">Login de l'utilisateur à créer</param>
        /// <param name="UserName">Nom  de l'utilisateur à créer</param>
        /// <param name="FirstName">Prénom</param>
        /// <param name="fk">N° du client auquel doit être rattaché l'administrateur</param>
        /// <param name="type">Syndic-->S, Agence-->A, Maison mère-->M</param>
        /// <param name="PhoneNumber">N° de téléphone</param>
        /// <param name="Email">Email de l'utilisateur à créer</param>
        /// <param name="UserRole"></param>
        /// <returns>Retourne true si la création s'est bien passée</returns>        
        /// UTILISE DANS LER
        [WebMethod]
        public bool CreateDirecteur(string SuperLoginID, string SuperPassword, string LoginID,
            string UserName, string FirstName, int fk, string type, string PhoneNumber, string Email,
            string UserRole)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            bool r = WS_Common.CreateDirecteur(SuperLoginID, SuperPassword, LoginID, UserName, FirstName, fk, type, PhoneNumber, Email, UserRole);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE PAR LER
        [WebMethod]
        public bool CreateOccupant(string SuperLoginID, string SuperPassword, string LoginID,
            string UserName, string FirstName, int fk, string PhoneNumber, string Email)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            bool r = WS_Common.CreateOccupant(SuperLoginID, SuperPassword, LoginID, UserName, FirstName, fk, PhoneNumber, Email);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne les utilisateurs
        /// </summary>
        /// <param name="SuperLoginID">Login du super admin</param>
        /// <param name="SuperPassword">Mot de passe du super admin</param>
        /// <param name="ParamsFiltres"></param>
        /// <returns></returns>
        /// UTILISE PAR LE LER
        [WebMethod]
        public users GetUsers(string SuperLoginID, string SuperPassword, string ParamsFiltres)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            users r = WS_Common.GetUsers(SuperLoginID, SuperPassword, ParamsFiltres);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }
        
        /// UTILISE PAR LER
        [WebMethod]
        public user GetUserByLogin(string SuperLoginID, string SuperPassword, string LoginID)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.GetUserByLogin(SuperLoginID, SuperPassword, LoginID);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }
        
        /// UTILISE DANS LER
        [WebMethod]
        public retour UpdateUser3(string SuperLoginID, string SuperPassword, int PkUser, string LoginID,
            string UserName, string FirstName, int fk, string type, string PhoneNumber, string Email,
            string UserRole)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.UpdateUser3(SuperLoginID, SuperPassword, PkUser, LoginID, UserName, FirstName, fk, type, PhoneNumber, Email, UserRole);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE DANS LER
        [WebMethod]
        public retour SendEmailToUser(string SuperLoginID, string SuperPassword, int PKUser)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.SendEmailToUser(SuperLoginID, SuperPassword, PKUser);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE DANS LER
        [WebMethod]
        public user UpdateExpirationDateFromPKUser(string SuperLoginID, string SuperPassword, int PKUser, DateTime date)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.UpdateExpirationDateFromPKUser(SuperLoginID, SuperPassword, PKUser, date);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }
        
        /// UTILISE DANS LER
        [WebMethod]
        public string GetTchWeekPwd(string SuperLoginID, string SuperPassword, DateTime Date)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            string r = WS_Common.GetTchWeekPwd(SuperLoginID, SuperPassword, Date);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        ///// <summary>
        ///// Permet d'obtenir un report par email
        ///// </summary>
        ///// <param name="SessionID"></param>
        ///// <param name="PkUser"></param>
        ///// <param name="ReportType"></param>
        ///// <param name="ParamsFiltres"></param>
        //[WebMethod]
        //public void GetReportByEmail(string SessionID, int PkUser, string ReportType, string ParamsFiltres)
        //{
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
        //    WS_Common.GetReportByEmail(SessionID, PkUser, ReportType, ParamsFiltres);
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        //}

        ///// <summary>
        ///// Permet au middleware de récupérer les paramètres des reports à envoyer
        ///// Le middleware fait ensuite l'envoi par email
        ///// </summary>
        ///// <param name="SuperLoginID"></param>
        ///// <param name="SuperPassword"></param>
        //[WebMethod]
        //public void GetReportTokens(string SuperLoginID, string SuperPassword)
        //{
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
        //    //Byte[] r = WS_Common.GetReportByToken(SuperLoginID, SuperPassword, TokenID);
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        //    //return r;
        //}

        /// <summary>
        /// Retourne la note d'info mensuelle
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
        /// <param name="Params"></param>
        /// <returns></returns>
        /// UTILISE DANS LER
        [WebMethod]
        public Byte[] GetNoteInfo(string SuperLoginID, string SuperPassword, string Params)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            Byte[] r = WS_Common.GetNoteInfo(SuperLoginID, SuperPassword, Params);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// pour LER, récupère la liste de tous les changements d'occupants à traiter
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
        /// <param name="showArchive"></param>
        /// <returns></returns>
        /// UTILISE DANS LER
        [WebMethod]
        public List<occupant4Chgt> getOccupants4Chgt4LER(string SuperLoginID, string SuperPassword, bool showArchive)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<occupant4Chgt> r = WS_Common.getOccupants4Chgt4LER(SuperLoginID, SuperPassword, showArchive);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// pour LER, permet d'archiver/tagger le chgt d'occupant
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
        /// <param name="occupants"></param>
        /// UTILISE DANS LER
        [WebMethod]
        public void setOccupants4Chgt4LER(string SuperLoginID, string SuperPassword, List<occupant4Chgt> occupants)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            WS_Common.setOccupants4Chgt4LER(SuperLoginID, SuperPassword, occupants);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        }

        /// UTILISE DANS LER
        [WebMethod]
        public List<userLog> GetStatOccupants2(string SuperLoginID, string SuperPassword, string idClient, string startDate, string endDate)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<userLog> r = WS_Common.GetStatOccupants(SuperLoginID, SuperPassword, idClient, startDate, endDate);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Retourne la liste des logs des clients
        /// </summary>
        /// <param name="SuperLoginID">Login</param>
        /// <param name="SuperPassword">Mot de passe</param>
        /// <param name="idClient">Id Client</param>
        /// <returns></returns>
        /// UTILISE DANS LER
        [WebMethod]
        public List<userLog> GetStatClient(string SuperLoginID, string SuperPassword, string idClient)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            List<userLog> r = WS_Common.GetStatClient(SuperLoginID, SuperPassword, idClient);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Méthode qui permet à l'utilisateur de réinitialiser son mot de passe
        /// à partir d'un email qu'il aura reçu de notre part
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
        /// <param name="TokenID">Token envoyé dans le mail</param>
        /// <param name="Salt">Crypted string envoyée dans le mail</param>
        /// <param name="Password">Nouveau password</param>
        /// <returns>OK if password has been set otherwise an error message</returns>
        /// UTILISE DANS LER/MAIL
        [WebMethod]
        public retour ResetPassword(string SuperLoginID, string SuperPassword,
            string TokenID, string Salt, string Password)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.ResetPassword(SuperLoginID, SuperPassword, TokenID, Salt, Password);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        /// Met à jour la date d'expiration des accès occupants
        /// en fonction de la date de départ des occupants
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
        /// UTILISE DANS LER
        [WebMethod]
        public void UpdateExpirationDateOccupants(string SuperLoginID, string SuperPassword)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            WS_Common.UpdateExpirationDateOccupants(SuperLoginID, SuperPassword);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        }

        /// UTILISE DANS LER/MAIL
        [WebMethod]
        public string InsertReportToken(string SessionID, string reportType, string param)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            string r = WS_Common.InsertReportToken(SessionID, reportType, param);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// UTILISE DANS LER/MAIL
        [WebMethod]
        public byte[] GetReportByToken(string SessionID, string tokenid)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            LER_PrintPlugin.Init(WS_DBUtils.utils_LER, WS_DBUtils.utils_SF, WS_DBUtils.utils_Mongo);
            byte[] r = WS_Common.GetReportByToken(SessionID, tokenid);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        #endregion region

        #region PAS UTILISE
        /// PAS UTILISE
        [WebMethod]
        public retour UpdateUser2(string SuperLoginID, string SuperPassword, int PkUser,
            string UserName, string FirstName, string PhoneNumber, string Email, string UserRole)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.UpdateUser2(SuperLoginID, SuperPassword, PkUser, UserName, FirstName, PhoneNumber, Email, UserRole);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public retour GetResetTokenIDValidation(string SuperLoginID, string SuperPassword,
            string TokenID, string Salt)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            retour r = WS_Common.GetResetTokenIDValidation(SuperLoginID, SuperPassword, TokenID, Salt);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public user ResetPasswordFromEmail2(string SuperLoginID, string SuperPassword, string Email)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            user r = WS_Common.ResetPasswordFromEmail(SuperLoginID, SuperPassword, Email);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public userExportParams GetExportParams(string SuperLoginID, string SuperPassword, string clientName)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            userExportParams r = WS_Common.GetExportParams(SuperLoginID, SuperPassword, clientName);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// <summary>
        ///  Retourne le top des consommations d'un immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">Pk utilisateur</param>
        /// <param name="PkImmeuble">PK immeuble</param>
        /// <param name="type">Type d'appareil</param>
        /// <param name="nbTop">Nombre de conso top</param>
        /// <returns></returns>
        /// PAS UTILISE
        [WebMethod]
        public topConsos GetConsoImmeuble(string SessionID, int PkUser, int PkImmeuble, string type, int nbTop = 5)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            topConsos r = WS_Common.GetTopConsosByImmeuble(SessionID, PkUser, PkImmeuble, type, nbTop);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public infosAppareilsEAU GetInfosAppareilsByLogementEC(string SessionID, int PkUser, int PkLogement, string ParamsInfos)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            DateTime DateDebut = DateTime.Now.AddYears(-5); // on ramène max 5 ans de relevés (sauf si on veut ceux de l'occupant)
            DateTime DateFin = DateTime.Now;
            infosAppareilsEAU r = WS_Common.GetInfosAppareilsByLogementEAU(SessionID, PkUser, PkLogement, DateDebut, DateFin, "EC", ParamsInfos);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public infosAppareilsEAU GetInfosAppareilsByLogementEF(string SessionID, int PkUser, int PkLogement, string ParamsInfos)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            DateTime DateDebut = DateTime.Now.AddYears(-5); // on ramène max 5 ans de relevés (sauf si on veut ceux de l'occupant)
            DateTime DateFin = DateTime.Now;
            infosAppareilsEAU r = WS_Common.GetInfosAppareilsByLogementEAU(SessionID, PkUser, PkLogement, DateDebut, DateFin, "EF", ParamsInfos);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public infosAppareilsRepart GetInfosAppareilsByLogementRepart(string SessionID, int PkUser, int PkLogement, string ParamsInfos)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            DateTime DateDebut = DateTime.Now.AddYears(-5); // on ramène max 5 ans de relevés (sauf si on veut ceux de l'occupant)
            DateTime DateFin = DateTime.Now;
            infosAppareilsRepart r = WS_Common.GetInfosAppareilsByLogementRepart(SessionID, PkUser, PkLogement, DateDebut, DateFin, ParamsInfos);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        /// PAS UTILISE
        [WebMethod]
        public infosAppareilsCET GetInfosAppareilsByLogementCET(string SessionID, int PkUser, int PkLogement, string ParamsInfos)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            DateTime DateDebut = DateTime.Now.AddYears(-5); // on ramène max 5 ans de relevés (sauf si on veut ceux de l'occupant)
            DateTime DateFin = DateTime.Now;
            infosAppareilsCET r = WS_Common.GetInfosAppareilsByLogementCET(SessionID, PkUser, PkLogement, DateDebut, DateFin, ParamsInfos);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        // PAS UTILISE
        //[WebMethod]
        //public infosAppareilsElect GetInfosAppareilsByLogementElect(string SessionID, int PkUser, int PkLogement, string ParamsInfos)
        //{
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
        //    infosAppareilsElect r = new infosAppareilsElect();
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        //    return r;
        //}

        ///// PAS UTILISE
        //[WebMethod]
        //public infosAppareilsGaz GetInfosAppareilsByLogementGaz(string SessionID, int PkUser, int PkLogement, string ParamsInfos)
        //{
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
        //    infosAppareilsGaz r = new infosAppareilsGaz();
        //    WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        //    return r;
        //}

        #endregion PAS UTILISE

        #region UTILISE DANS PORTAIL PUBLIC
        /// <summary>
        /// Envoi une demande de traitement des relevés
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
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
        /// UTILISE DANS PORTAIL PUBLIC
        [WebMethod]
        public void setReleveOccupant(string SuperLoginID, string SuperPassword,
            string immeuble, string batiment, string escalier, string etage,
            string date_passage, string prenom, string nom, string adresse,
            string code_postal, string ville, string telephone, string email,
            string ef_cuisine, string ef_salle_de_bains, string ef_wc, string ef_autre,
            string ef_nomautre, string ec_cuisine, string ec_salle_de_bains, string ec_wc,
            string ec_autre, string ec_nomautre)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            WS_Common.setReleveOccupant(SuperLoginID, SuperPassword,
                immeuble, batiment, escalier, etage, date_passage, prenom, nom, adresse,
             code_postal, ville, telephone, email, ef_cuisine, ef_salle_de_bains, ef_wc,
             ef_autre, ef_nomautre, ec_cuisine, ec_salle_de_bains, ec_wc, ec_autre, ec_nomautre);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
        }

        #endregion UTILISE DANS PORTAIL PUBLIC

        #region UTILISE par SF
        /// <summary>
        /// Retourne un case SF
        /// select Id, Status, CaseNumber, SuppliedEmail,
        /// Subject, Type, Categorie__c, SousCategorie__c
        /// FROM Case
        /// WHERE(Type= 'Intervention')
        /// AND(Status= 'Attribue'
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
        /// UTILISE par SF
        [WebMethod]
        public caseSF getCase(string SuperLoginID, string SuperPassword, string Id, string Email)
        {
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod());
            caseSF r = WS_Common.getCase(SuperLoginID, SuperPassword, Id, Email);
            WS_Common.InsertAPICall(MethodBase.GetCurrentMethod(), "END");
            return r;
        }

        #endregion UTILISE par SF
    }
}
