using DevExpress.Xpo.DB.Helpers;
using System;
using System.Data;
using System.IO;
using System.Net.Mail;
using System.Web.UI.WebControls;
using Tools;

namespace Techem.Webservices.WS_EspaceClient
{
    static public partial class WS_Common
    {
        //static public string _SuperLoginID = "JOHN DOE";
        //static public string _SuperPassword = "DF93RN9F-SLJ528F";
        //static public string _SuperSessionId = "36a58ab6-2cc0-4724-abc5-b55e447b9a3d";
        static public string _SuperLoginID = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "ESPACECLIENT_WS_SUPERLOGINID");
        static public string _SuperPassword = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "ESPACECLIENT_WS_SUPERPASSWORD");
        static public string _SuperSessionId = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "ESPACECLIENT_WS_SUPERSESSIONID");

        static public string tchUserPrefix = "tch-";

        /// <summary>
        /// Méthode qui permet d'affecter des droits (une liste de n° d'immeubles) à un USER (PkUserChild)
        /// </summary>
        ///<param name="SessionID">Identificateur de session</param>
        ///<param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="PkUserChild">PK de l'utilisateur à qui on souhaite affecter des droits</param>
        /// <param name="ListImmeubles">liste de n° d'immeubles séparés par le caractère "|"</param>
        /// <returns>Retourne un objet de type "retour" qui contient ou non un message d'erreur </returns>        
        static public retour SetImmeubles(string SessionID, int PkUser, int PkUserChild, string ListImmeubles)
        {
            //ajout des droits sur une liste d'immeubles à un USER (PKUserChild)
            //avec gestion d'authent

            retour r = new retour();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    r.Erreur = "incohérence de session";
                    return r;
                }

                else if ((PkUserChild != -1) && (!IsChildUser(PkUser, PkUserChild)))
                {
                    r.Erreur = "Impossible de modifier cet utilisateur";
                    return r;
                }
                else
                {
                    DeleteUser_Right(PkUserChild);
                    InsertUser_Right(PkUserChild, ListImmeubles);
                }

            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
                return r;
            }
            return r;
        }

        static private bool IsChildUser(int PkUser, int PkUserChild)
        {
            //renvoie vrai si PkUserChild est un enfant de PkUser
            //            if (PkUser == PkUserChild)
            //                return true;
            //            else
            //                return Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(
            //                    $@"SELECT FKPARENTUSER
            //FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER
            //WHERE PKWEB_USER= {PkUserChild} ")) == PkUser;
            if (PkUser == PkUserChild)
                return true;
            else
            {
                user u1 = GetUserByPk(PkUser);
                user u2 = GetUserByPk(PkUserChild);
                return (u1.UserType == "C" && u2.UserType == "G" && u1.FKClient == u2.FKClient);
            }
        }
        static private void DeleteUser_Right(int PkUserChild)
        {
            // suppression de tous les droits pour un USER
            WS_DBUtils.utils_LER.DBExec(
                $"DELETE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right WHERE fkweb_user = " + PkUserChild.ToString());
        }
        static private void InsertUser_Right(int PkUserChild, string ListImmeubles)
        {
            //ajout des droits sur une liste d'immeubles à un USER (PKUserChild)  

            int PkUserParent = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(
                $"SELECT fkparentuser FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user WHERE pkweb_user = " + PkUserChild.ToString()));

            //on récupére la liste des immeubles du PkUserParent 
            //pour vérifier que les éléments de listImmeubles en font bien partie
            DataRowCollection imms = GetRowsImmeublesByPKUser(_SuperLoginID, _SuperPassword, PkUserParent);
            string ListTousImmeubles = ";";
            foreach (DataRow im in imms)
                ListTousImmeubles += im["PKIMMEUBLE"].ToString() + ";";

            string[] pks = ListImmeubles.Split('|');
            foreach (string pk in pks)
            {
                if (ListTousImmeubles.IndexOf(";" + pk + ";") > -1)
                    AddUser_Right(PkUserChild, Convert.ToInt32(pk));
            }
        }
        static private void AddUser_Right(int PkUserChild, int pkImmeuble)
        {
            WS_DBUtils.utils_LER.DBExec(
                $@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT(PKWEB_USER_RIGHT, FK, TYPER, FKWEB_USER) VALUES( 
{WS_DBUtils.utils_LER.GetPK($"{Properties.Settings.Default.LER_AUTH_SchemaName}.SQWEB_USER_RIGHT")}, 
{pkImmeuble}, 'I', {PkUserChild})");
        }

        /// <summary>
        /// Méthode qui permet de renvoyer la liste des USER (gestionnaire ou occupant) gérés par un directeur
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="type">(ALL, G, O)</param>
        /// <returns>Retourne une liste de user</returns>
        static public users GetChildUsers(string SessionID, int PkUser, string type)
        {
#if WS2
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

            users Users = new users();
            user admin = GetUserByPk(PkUser);
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    Users.Erreur = "incohérence de session";
                    return Users;
                }
                string sql =
                    $@"SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.username, 
COUNT(pkweb_user_right) AS nbimmeubles 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right, web_immeuble 
WHERE 
(fkparentuser = {PkUser}{(admin.FKClient == -1 ? "" : $@" OR {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fkclient = " + admin.FKClient)})
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.fkweb_user(+) = pkweb_user
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.fk(+) = web_immeuble.pkimmeuble
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.typer(+) = 'I'
AND NVL(web_immeuble.actif(+), 'O') = 'O'
AND web_immeuble.pkimmeuble IN 
(
    SELECT pkimmeuble
    FROM web_immeuble
    WHERE fkclient IN (
        SELECT   pkclient
        FROM web_client
        WHERE NVL(web_client.ACTIF, 'O') <> 'N'
        START WITH web_client.pkclient = (select fkclient from {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER where pkWEB_USER={PkUser})
        CONNECT BY fkclient= prior pkclient )
    AND (SUBSTR(web_immeuble.ID, 1, 1) <> 'P' )
)
{(type != "ALL" ? " AND usertype = " + type.QuotedStr() : "")}
group by {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.username";

                DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(sql);
                foreach (DataRow Dr in rows)
                {
                    user u = new user
                    {
                        LoginID = Dr["LOGINID"].ToString(),
                        PKUser = Convert.ToInt32(Dr["PKWEB_USER"].ToString()),
                        UserName = Dr["USERNAME"].ToString(),
                        NbImmeubles = Dr["NBIMMEUBLES"].ToString().ToInt32OrDefault(-1)
                    };

                    Users.ListeUsers.Add(u);
                }
            }
            catch (Exception Ex)
            {
                Users.Erreur = Ex.Message;
            }
            return Users;

#else
            users Users = new users();
            user admin = GetUserByPk(PkUser);
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    Users.Erreur = "incohérence de session";
                    return Users;
                }
                string sql =
                    $@"SELECT {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER.PKWEB_USER, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER.LOGINID, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER.USERNAME, 
count(pkweb_user_right) AS NBIMMEUBLES 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right, immeuble 
WHERE 
(FKPARENTUSER = {PkUser}{(admin.FKClient == -1 ? "" : $@" or {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER.FKCLIENT = " + admin.FKClient)})
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.fkweb_user(+) = pkweb_user
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.fk(+) = immeuble.pkimmeuble
and {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user_right.typer(+) = 'I'
and nvl(immeuble.actif(+), 'O') = 'O'
and immeuble.pkimmeuble in 
(
    select pkimmeuble
    FROM IMMEUBLE
    WHERE FKCLIENT IN (
        select   PKCLIENT
        from CLIENT
        where NVL(CLIENT.ACTIF, 'O') <> 'N'
        start with CLIENT.PKCLIENT = (select fkclient from {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER where pkWEB_USER={PkUser})
        connect by FKCLIENT= prior PKCLIENT )
    AND (SUBSTR(IMMEUBLE.ID, 1, 1) <> 'P' )
)
{(type != "ALL" ? " AND USERTYPE = " + type.QuotedStr() : "")}
group by {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.loginid, 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.username";

                DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(sql);
                foreach (DataRow Dr in rows)
                {
                    user u = new user
                    {
                        LoginID = Dr["LOGINID"].ToString(),
                        PKUser = Convert.ToInt32(Dr["PKWEB_USER"].ToString()),
                        UserName = Dr["USERNAME"].ToString(),
                        NbImmeubles = Dr["NBIMMEUBLES"].ToString().ToInt32OrDefault(-1)
                    };

                    Users.ListeUsers.Add(u);
                }
            }
            catch (Exception Ex)
            {
                Users.Erreur = Ex.Message;
            }
            return Users;
#endif
        }

        /// <summary>
        /// Méthode qui permmet au super adminsitrateur de gérer l'ensemble des USER
        /// </summary>
        /// <param name="SuperLoginID"></param>
        /// <param name="SuperPassword"></param>
        /// <param name="ParamsFiltres"></param>
        /// <returns></returns>
        static public users GetUsers(string SuperLoginID, string SuperPassword, string ParamsFiltres)
        {
            //WEBTODO :
            // - client remplace par web_client

#if WS2
            users Users = new users();
            try
            {
                bool canConnect = false;
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    canConnect = true;
                }
                else if (SuperLoginID == "TECHNILOG")
                {
                    session s = session.Login(SuperLoginID, SuperPassword);
                    canConnect = s.Connected;
                    // on force PAramFiltres
                    //ParamsFiltres = "SHOWCLIENT=O|SHOWOCCUPANT=N";
                }

                if (canConnect)
                {
                    ParamsString Pfiltres = new ParamsString(ParamsFiltres);
                    int pkclient = Pfiltres.GetParam("PKCLIENT").ToInt32OrDefault(-1);

                    string sql =
                        $@"SELECT u1.pkweb_user, u1.loginid, u1.username, u1.firstname, u1.email, u1.userrole, u1.fkparentuser as FK, web_client.pkclient as fkclient, u1.usertype,
u1.phonenumber, u1.expirationdate, u1.cgu,
web_client.ID, web_client.NOM, web_client.adresse1 as adresse, web_client.cp, web_client.ville 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user u1, {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user u2, web_client
WHERE u1.usertype = 'G' AND u2.usertype = 'C'
AND u1.fkparentuser = u2.pkweb_user
AND u2.fkclient = web_client.pkclient
{(pkclient == -1 ? "" : "AND web_client.pkclient = " + pkclient)}
UNION
SELECT u3.pkweb_user, u3.loginid, u3.username, u3.firstname, u3.email, u3.userrole, u3.fkclient AS FK, u3.fkclient as fkclient, u3.usertype,
u3.phonenumber, u3.expirationdate, u3.cgu,
web_client.ID, web_client.NOM, web_client.adresse1 AS adresse, web_client.cp, web_client.ville
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user u3, web_client
WHERE u3.usertype = 'C'
AND u3.fkclient = web_client.pkclient
{(pkclient == -1 ? "" : "AND web_client.pkclient = " + pkclient)}";

                    DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(sql);
                    foreach (DataRow Dr in rows)
                    {
                        user u = new user
                        {
                            LoginID = Dr["LOGINID"].ToString(),
                            PKUser = Dr["PKWEB_USER"].ToString().ToInt32OrDefault(),
                            UserName = Dr["USERNAME"].ToString(),
                            FirstName = Dr["FIRSTNAME"].ToString(),
                            EMail = Dr["EMAIL"].ToString(),
                            UserRole = Dr["USERROLE"].ToString(),
                            FK = Dr["FK"].ToString().ToInt32OrDefault(-1),
                            FKClient = Dr["FKCLIENT"].ToString().ToInt32OrDefault(-1),
                            UserType = Dr["USERTYPE"].ToString(),
                            Adresse = Dr["ADRESSE"].ToString(),
                            CP = Dr["CP"].ToString(),
                            Ville = Dr["VILLE"].ToString(),
                            PhoneNumber = Dr["PHONENUMBER"].ToString(),
                            ClientID = Dr["ID"].ToString(),
                            ClientName = Dr["NOM"].ToString()
                        };
                        if (!Convert.IsDBNull(Dr["EXPIRATIONDATE"]))
                            u.ExpirationDate = Convert.ToDateTime(Dr["EXPIRATIONDATE"]);
                        u.CGU = Dr["CGU"].ToString();
                        //u.FKClientTop = GetPKClientTop(u.FKClient);
                        Users.ListeUsers.Add(u);
                    }
                }
            }
            catch (Exception Ex)
            {
                Users.Erreur = Ex.Message;
            }
            return Users;
#else
            users Users = new users();
            try
            {
                bool canConnect = false;
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    canConnect = true;
                }
                else if (SuperLoginID == "TECHNILOG")
                {
                    session s = session.Login(SuperLoginID, SuperPassword);
                    canConnect = s.Connected;
                    // on force PAramFiltres
                    //ParamsFiltres = "SHOWCLIENT=O|SHOWOCCUPANT=N";
                }

                if (canConnect)
                {
                    ParamsString Pfiltres = new ParamsString(ParamsFiltres);
                    int pkclient = Pfiltres.GetParam("PKCLIENT").ToInt32OrDefault(-1);

                    string sql =
                        $@"SELECT u1.pkweb_user, u1.loginid, u1.username, u1.firstname, u1.email, u1.userrole, u1.fkparentuser as FK, client.pkclient as FKCLIENT, u1.usertype,
u1.phonenumber, u1.expirationdate, u1.cgu,
CLIENT.ID, CLIENT.NOM, CLIENT.ADRESSE1 as ADRESSE, CLIENT.CP, CLIENT.VILLE 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER u1, {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER u2, CLIENT
where u1.USERTYPE = 'G' and u2.USERTYPE = 'C'
and u1.FKPARENTUSER = u2.PKWEB_USER
and u2.FKCLIENT = CLIENT.PKCLIENT
{(pkclient == -1 ? "" : "and CLIENT.PKCLIENT = " + pkclient)}
UNION
SELECT u3.pkweb_user, u3.loginid, u3.username, u3.firstname, u3.email, u3.userrole, u3.FKCLIENT as FK, u3.FKCLIENT as FKCLIENT, u3.usertype,
u3.phonenumber, u3.expirationdate, u3.cgu,
CLIENT.ID, CLIENT.NOM, CLIENT.ADRESSE1 as ADRESSE, CLIENT.CP, CLIENT.VILLE
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER u3, CLIENT
where u3.USERTYPE = 'C'
and u3.FKCLIENT = CLIENT.PKCLIENT
{(pkclient == -1 ? "" : "and CLIENT.PKCLIENT = " + pkclient)}";

                    DataRowCollection rows = WS_DBUtils.utils_LER.DBSelectRows(sql);
                    foreach (DataRow Dr in rows)
                    {
                        user u = new user
                        {
                            LoginID = Dr["LOGINID"].ToString(),
                            PKUser = Dr["PKWEB_USER"].ToString().ToInt32OrDefault(),
                            UserName = Dr["USERNAME"].ToString(),
                            FirstName = Dr["FIRSTNAME"].ToString(),
                            EMail = Dr["EMAIL"].ToString(),
                            UserRole = Dr["USERROLE"].ToString(),
                            FK = Dr["FK"].ToString().ToInt32OrDefault(-1),
                            FKClient = Dr["FKCLIENT"].ToString().ToInt32OrDefault(-1),
                            UserType = Dr["USERTYPE"].ToString(),
                            Adresse = Dr["ADRESSE"].ToString(),
                            CP = Dr["CP"].ToString(),
                            Ville = Dr["VILLE"].ToString(),
                            PhoneNumber = Dr["PHONENUMBER"].ToString(),
                            ClientID = Dr["ID"].ToString(),
                            ClientName = Dr["NOM"].ToString()
                        };
                        if (!Convert.IsDBNull(Dr["EXPIRATIONDATE"]))
                            u.ExpirationDate = Convert.ToDateTime(Dr["EXPIRATIONDATE"]);
                        u.CGU = Dr["CGU"].ToString();
                        //u.FKClientTop = GetPKClientTop(u.FKClient);
                        Users.ListeUsers.Add(u);
                    }
                }
            }
            catch (Exception Ex)
            {
                Users.Erreur = Ex.Message;
            }
            return Users;
#endif
        }
        static public user GetUser(string SessionID, int PkUser, int PkUserChild)
        {
            user u = new user();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    u.Erreur = "incohérence de session";
                    return u;
                }
                else if (!IsChildUser(PkUser, PkUserChild))
                {
                    u.Erreur = "Impossible d'obtenir cet utilisateur";
                    return u;
                }
                else
                {
                    return GetUserByPk(PkUserChild);
                }

            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user GetUserByPk(int PkUser)
        {
            //WEBTODO :
            // - client remplace par web_client
            // - occupant remplace par web_logement
#if WS2
            user User = new user();
            try
            {
                DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(
                            $@"SELECT * 
                            FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
                            WHERE pkweb_user = {PkUser}");
                User.PKUser = PkUser;
                if (Dr == null)
                    return User;

                User.LoginID = Dr["LOGINID"].ToString();
                User.UserName = Dr["USERNAME"].ToString();
                User.Password = Dr["PASSWORD"].ToString();
                User.EMail = Dr["EMAIL"].ToString();
                User.UserType = Dr["USERTYPE"].ToString();
                User.PhoneNumber = Dr["PHONENUMBER"].ToString();
                User.FirstName = Dr["FIRSTNAME"].ToString();
                User.UserRole = Dr["USERROLE"].ToString();
                if (!Convert.IsDBNull(Dr["PASSWORD_EXP_DATE"]))
                {
                    User.PasswordExpirationDate = Convert.ToDateTime(Dr["PASSWORD_EXP_DATE"]);
                    if (User.PasswordExpirationDate < DateTime.Today)
                        User.Info = "PASSWORD_EXPIRED";
                }
                if (!Convert.IsDBNull(Dr["EXPIRATIONDATE"]))
                {
                    User.ExpirationDate = Convert.ToDateTime(Dr["EXPIRATIONDATE"]);
                    if (User.ExpirationDate < DateTime.Today)
                        User.Erreur = "LOGIN_EXPIRED";
                }

                User.CGU = Dr["CGU"].ToString();

                try
                {
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_EF"]))
                        User.Seuil_Conso_EF = Convert.ToInt32(Dr["SEUIL_CONSO_EF"].ToString());
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_EC"]))
                        User.Seuil_Conso_EC = Convert.ToInt32(Dr["SEUIL_CONSO_EC"].ToString());
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_REPART"]))
                        User.Seuil_Conso_Repart = Convert.ToInt32(Dr["SEUIL_CONSO_REPART"].ToString());
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_CET"]))
                        User.Seuil_Conso_CET = Convert.ToInt32(Dr["SEUIL_CONSO_CET"].ToString());
                    User.Seuil_Conso_Actif = Dr["SEUIL_CONSO_ACTIF"].ToString() == "O";
                    User.Seuil_Conso_Email = Dr["SEUIL_CONSO_EMAIL"].ToString();

                    if (User.UserType == "C")
                    {
                        User.FK = Convert.ToInt32(Dr["FKCLIENT"].ToString());
                        User.FKClient = User.FK;
                        User.FKClientTop = GetPKClientTop(User.FKClient);

                        DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
                            $@"SELECT id, espaceclient_showimmeublesarc, espaceclient_showfactures, 
                            espaceclient_showchantiers,
                            chgt_occupant_type, espaceclient_gestion
                            FROM web_client 
                            WHERE pkclient = {User.FKClient}");

                        if (r != null)
                        {
                            User.ClientID = r["ID"].ToString();
                            if (r["ESPACECLIENT_GESTION"].ToString().ToLower() == "client")
                            {
                                User.showImmeublesArc = r["ESPACECLIENT_SHOWIMMEUBLESARC"].ToBooleanOrDefault(false);
                                User.showFactures = r["ESPACECLIENT_SHOWFACTURES"].ToBooleanOrDefault(false);
                                User.showChantiers = r["ESPACECLIENT_SHOWCHANTIERS"].ToBooleanOrDefault(false);
                                User.showChgtOccupant = r["CHGT_OCCUPANT_TYPE"].ToString() == "ESPACE_CLIENT";
                            }
                            else
                            {
                                User.showFactures = true;
                                User.showChantiers = true;
                            }

                        }
                    }
                    else if (User.UserType == "G")
                    {
                        User.FK = Convert.ToInt32(Dr["FKPARENTUSER"].ToString());
                        User.FKClient = GetUserByPk(User.FK).FKClient;//User.FK = parent user = C
                        User.FKClientTop = GetPKClientTop(User.FKClient);
                        DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
                            $@"SELECT id, espaceclient_showimmeublesarc, espaceclient_showfactures, 
                            espaceclient_showchantiers,
                            chgt_occupant_type, espaceclient_gestion
                            FROM web_client 
                            WHERE pkclient = {User.FKClient}");
                        if (r != null)
                        {
                            User.ClientID = r["ID"].ToString();
                            if (r["ESPACECLIENT_GESTION"].ToString().ToLower() == "client")
                            {
                                User.showImmeublesArc = r["ESPACECLIENT_SHOWIMMEUBLESARC"].ToBooleanOrDefault(false);
                                User.showFactures = r["ESPACECLIENT_SHOWFACTURES"].ToBooleanOrDefault(false);
                                User.showChantiers = r["ESPACECLIENT_SHOWCHANTIERS"].ToBooleanOrDefault(false);
                                User.showChgtOccupant = r["CHGT_OCCUPANT_TYPE"].ToString() == "ESPACE_CLIENT";
                            }
                            else
                            {
                                User.showChantiers = true;
                                User.showFactures = true;
                            }

                        }
                    }
                    else if (User.UserType == "O")
                    {
                        User.FK = Convert.ToInt32(Dr["FK"].ToString());
                        if (User.EMail == "")
                        {
                            User.EMail = WS_DBUtils.utils_LER.DBSelect(
                        $@"SELECT web_occupant.email
                        FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, web_occupant 
                        WHERE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user={PkUser}
                        AND   {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = web_occupant.pkoccupant");
                        }
                    }
                }
                catch { }
            }
            catch (Exception Ex)
            {
                User.Erreur = Ex.Message;
            }


            return User;
#else
            user User = new user();
            try
            {
                DataRow Dr = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT * 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
WHERE pkweb_user = {PkUser}");
                User.PKUser = PkUser;
                if (Dr == null)
                    return User;

                User.LoginID = Dr["LOGINID"].ToString();
                User.UserName = Dr["USERNAME"].ToString();
                User.Password = Dr["PASSWORD"].ToString();
                User.EMail = Dr["EMAIL"].ToString();
                User.UserType = Dr["USERTYPE"].ToString();
                User.PhoneNumber = Dr["PHONENUMBER"].ToString();
                User.FirstName = Dr["FIRSTNAME"].ToString();
                User.UserRole = Dr["USERROLE"].ToString();
                if (!Convert.IsDBNull(Dr["PASSWORD_EXP_DATE"]))
                {
                    User.PasswordExpirationDate = Convert.ToDateTime(Dr["PASSWORD_EXP_DATE"]);
                    if (User.PasswordExpirationDate < DateTime.Today)
                        User.Info = "PASSWORD_EXPIRED";
                }
                if (!Convert.IsDBNull(Dr["EXPIRATIONDATE"]))
                {
                    User.ExpirationDate = Convert.ToDateTime(Dr["EXPIRATIONDATE"]);
                    if (User.ExpirationDate < DateTime.Today)
                        User.Erreur = "LOGIN_EXPIRED";
                }

                User.CGU = Dr["CGU"].ToString();

                try
                {
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_EF"]))
                        User.Seuil_Conso_EF = Convert.ToInt32(Dr["SEUIL_CONSO_EF"].ToString());
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_EC"]))
                        User.Seuil_Conso_EC = Convert.ToInt32(Dr["SEUIL_CONSO_EC"].ToString());
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_REPART"]))
                        User.Seuil_Conso_Repart = Convert.ToInt32(Dr["SEUIL_CONSO_REPART"].ToString());
                    if (!Convert.IsDBNull(Dr["SEUIL_CONSO_CET"]))
                        User.Seuil_Conso_CET = Convert.ToInt32(Dr["SEUIL_CONSO_CET"].ToString());
                    User.Seuil_Conso_Actif = Dr["SEUIL_CONSO_ACTIF"].ToString() == "O";
                    User.Seuil_Conso_Email = Dr["SEUIL_CONSO_EMAIL"].ToString();

                    if (User.UserType == "C")
                    {
                        User.FK = Convert.ToInt32(Dr["FKCLIENT"].ToString());
                        User.FKClient = User.FK;
                        User.FKClientTop = GetPKClientTop(User.FKClient);

                        DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT id, espaceclient_showimmeublesarc, espaceclient_showfactures, 
espaceclient_showchantiers,
chgt_occupant_type, espaceclient_gestion
FROM client 
WHERE pkclient = {User.FKClient}");

                        if (r != null)
                        {
                            User.ClientID = r["ID"].ToString();
                            if (r["ESPACECLIENT_GESTION"].ToString().ToLower() == "client")
                            {
                                User.showImmeublesArc = r["ESPACECLIENT_SHOWIMMEUBLESARC"].ToBooleanOrDefault(false);
                                User.showFactures = r["ESPACECLIENT_SHOWFACTURES"].ToBooleanOrDefault(false);
                                User.showChantiers = r["ESPACECLIENT_SHOWCHANTIERS"].ToBooleanOrDefault(false);
                                User.showChgtOccupant = r["CHGT_OCCUPANT_TYPE"].ToString() == "ESPACE_CLIENT";
                            }
                            else
                            {
                                User.showFactures = true;
                                User.showChantiers = true;
                            }

                        }
                    }
                    else if (User.UserType == "G")
                    {
                        User.FK = Convert.ToInt32(Dr["FKPARENTUSER"].ToString());
                        User.FKClient = GetUserByPk(User.FK).FKClient;//User.FK = parent user = C
                        User.FKClientTop = GetPKClientTop(User.FKClient);
                        DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT id, espaceclient_showimmeublesarc, espaceclient_showfactures, 
espaceclient_showchantiers,
chgt_occupant_type, espaceclient_gestion
FROM client 
WHERE pkclient = {User.FKClient}");
                        if (r != null)
                        {
                            User.ClientID = r["ID"].ToString();
                            if (r["ESPACECLIENT_GESTION"].ToString().ToLower() == "client")
                            {
                                User.showImmeublesArc = r["ESPACECLIENT_SHOWIMMEUBLESARC"].ToBooleanOrDefault(false);
                                User.showFactures = r["ESPACECLIENT_SHOWFACTURES"].ToBooleanOrDefault(false);
                                User.showChantiers = r["ESPACECLIENT_SHOWCHANTIERS"].ToBooleanOrDefault(false);
                                User.showChgtOccupant = r["CHGT_OCCUPANT_TYPE"].ToString() == "ESPACE_CLIENT";
                            }
                            else
                            {
                                User.showChantiers = true;
                                User.showFactures = true;
                            }

                        }
                    }
                    else if (User.UserType == "O")
                    {
                        User.FK = Convert.ToInt32(Dr["FK"].ToString());
                        if (User.EMail == "")
                        {
                            User.EMail = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT occupant.email
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, occupant 
WHERE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.pkweb_user={PkUser}
AND   {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = occupant.pkoccupant");
                        }
                    }
                }
                catch { }
            }
            catch (Exception Ex)
            {
                User.Erreur = Ex.Message;
            }
            return User;
#endif
        }
        static public user GetUserByEmail(string SuperLoginID, string SuperPassword, string email)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
WHERE UPPER(email) = {email.ToUpper().QuotedStr()}");
                    if (dr != null)
                    {
                        int PKUser = Convert.ToInt32(dr["PKWEB_USER"]);
                        u = GetUserByPk(PKUser);
                        dr = null;
                    }
                    else
                    {
                        dr = WS_DBUtils.utils_LER.DBSelectRow(
$@"SELECT pkweb_user
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user, occupant 
WHERE 
{Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.usertype = 'O'
AND {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user.fk = occupant.pkoccupant
and occupant.datedepart > sysdate
AND UPPER(occupant.email) = {email.ToUpper().QuotedStr()}");
                        if (dr != null)
                        {
                            int PKUser = Convert.ToInt32(dr["PKWEB_USER"]);
                            u = GetUserByPk(PKUser);
                            dr = null;
                        }
                        else u.Erreur = "Impossible de trouver l'utilisateur";
                    }
                }
            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user GetUserByLogin(string SuperLoginID, string SuperPassword, string LoginID)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(
                        $"SELECT * FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE LOGINID = " + LoginID.QuotedStr());
                    if (dr != null)
                    {
                        int PKUser = Convert.ToInt32(dr["PKWEB_USER"]);
                        u = GetUserByPk(PKUser);
                        dr = null;
                    }
                    else u.Erreur = "Impossible de trouver l'utilisateur";
                }

            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user GetUserByPKOccupant(string SuperLoginID, string SuperPassword, int pkOccupant)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(
                        $"SELECT * FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE USERTYPE = 'O' AND FK = " + pkOccupant.ToString());
                    if (dr != null)
                    {
                        int PKUser = Convert.ToInt32(dr["PKWEB_USER"]);
                        u = GetUserByPk(PKUser);
                        dr = null;
                    }
                    else u.Erreur = "Impossible de trouver l'utilisateur";
                }

            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public retour DeleteUser(string SessionID, int PkUser, int PkUserChild)
        {
            retour r = new retour();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    r.Erreur = "incohérence de session";
                    return r;
                }
                else if (!IsChildUser(PkUser, PkUserChild))
                {
                    r.Erreur = "Impossible de supprimer cet utilisateur";
                    return r;
                }
                else
                {
                    WS_DBUtils.utils_LER.DBExec(
                        $"DELETE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER_RIGHT WHERE FKWEB_USER = " + PkUserChild.ToString());
                    WS_DBUtils.utils_LER.DBExec(
                        $"DELETE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE PKWEB_USER = " + PkUserChild.ToString());
                }

            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }
        static public retour UpdateUser(string SessionID, int PkUser, int PkUserChild,
            string UserName, string FirstName, string PhoneNumber, string Email, string UserRole)
        {
            retour r = new retour();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    r.Erreur = "incohérence de session";
                    return r;
                }
                else if (!IsChildUser(PkUser, PkUserChild))
                {
                    r.Erreur = "Impossible de mettre à jour cet utilisateur";
                    return r;
                }
                else
                {
                    return UpdateUser2(_SuperLoginID, _SuperPassword, PkUserChild, UserName, FirstName, PhoneNumber, Email, UserRole);
                }

            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }
        static public retour UpdateUser2(string SuperLoginID, string SuperPassword, int PkUser,
            string UserName, string FirstName, string PhoneNumber, string Email, string UserRole)
        {
            retour r = new retour();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    bool mailModif, mailExists;
                    user u = GetUserByPk(PkUser);
                    mailModif = u.EMail != Email;
                    mailExists = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
WHERE UPPER(email) = {Email.ToUpper().QuotedStr()}
AND pkweb_user <> {PkUser}") != "";

                    if (!mailModif || !mailExists)
                    {
                        WS_DBUtils.utils_LER.DBExec(
$@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user SET
username = {UserName.QuotedStr()},
firstname = {FirstName.QuotedStr()},
phonenumber = {PhoneNumber.QuotedStr()},
userrole = {UserRole.QuotedStr()},
{(u.UserType == "C" || u.UserType == "G" ? "loginid = " + Email.QuotedStr() : "")},
email = {Email.QuotedStr()} 
WHERE pkweb_user = {PkUser} ");
                        if (mailModif)
                            SendEmailToUser(_SuperLoginID, _SuperPassword, PkUser);
                    }
                    else
                    {
                        r.Erreur = "L'adresse email existe déjà";
                    }

                    return r;
                }
            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }
        static public retour UpdateUser3(string SuperLoginID, string SuperPassword, int PkUser, string LoginID,
            string UserName, string FirstName, int fk, string type, string PhoneNumber, string Email, string UserRole)
        {
            retour r = new retour();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    string fkFieldname = "FK";
                    if (type == "C")
                        fkFieldname = "FKCLIENT";

                    bool mailModif, mailExists;
                    user u = GetUserByPk(PkUser);
                    mailModif = u.EMail != Email;
                    mailExists = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user
WHERE UPPER(email) = {Email.ToUpper().QuotedStr()}
AND pkweb_user <> {PkUser}") != "";

                    if (!mailModif || !mailExists)
                    {
                        WS_DBUtils.utils_LER.DBExec(
$@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user SET
loginid = {(u.UserType == "C" || u.UserType == "G" ? Email.QuotedStr() : LoginID.QuotedStr())},
username = {UserName.QuotedStr()},
firstname = {FirstName.QuotedStr()}, 
{fkFieldname} = {fk.QuotedStr()},
usertype = {type.QuotedStr()},
phonenumber = {PhoneNumber.QuotedStr()},
userrole = {UserRole.QuotedStr()},
email = {Email.QuotedStr()} 
WHERE pkweb_user = {PkUser} ");
                        if (mailModif)
                            SendEmailToUser(_SuperLoginID, _SuperPassword, PkUser);
                    }
                    else
                    {
                        r.Erreur = "L'adresse email existe déjà";
                    }
                    return r;
                }

            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }
        public static retour UpdatePassword(string SessionID, int PkUser, int PkUserChild, string Password)
        {
            retour r = new retour();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    r.Erreur = "incohérence de session";
                    return r;
                }
                else if (!IsChildUser(PkUser, PkUserChild))
                {
                    r.Erreur = "Impossible de mettre à jour cet utilisateur";
                    return r;
                }
                else
                {
                    WS_DBUtils.utils_LER.DBExec(
                        $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET
PASSWORD_ENCRYPTED = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ( {Password.QuotedStr()}), 4)
WHERE PKWEB_USER = {PkUserChild} ");
                    return r;
                }

            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }
        static public user ResetPasswordFromEmail(string SessionID, int PkUser, string Email)
        {
            user r = new user();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    r.Erreur = "incohérence de session";
                    return r;
                }
                else
                    return ResetPasswordFromEmail(_SuperLoginID, _SuperPassword, Email);
            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }
        static public user ResetPasswordFromEmail(string SuperLoginID, string SuperPassword, string Email)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    u = GetUserByEmail(SuperLoginID, SuperPassword, Email);
                    if (u.PKUser != -1)
                        SendEmailToUser(_SuperLoginID, _SuperPassword, u.PKUser);
                    else u.Erreur = "Impossible de retrouver l'utilisateur";
                }
            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user ResetPasswordFromPKUser(string SuperLoginID, string SuperPassword, int PkUser)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(
                        $"SELECT * FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE PKWEB_USER = " + PkUser.ToString());
                    if (dr != null)
                    {
                        u.PKUser = PkUser;
                        u.UserName = dr["USERNAME"].ToString();
                        u.LoginID = dr["LOGINID"].ToString();
                        //u.Password = GeneratePwd();
                        u.UserType = dr["USERTYPE"].ToString();
                        dr = null;

                        WS_DBUtils.utils_LER.DBExec(
                            $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET
PASSWORD_ENCRYPTED = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ( {GeneratePwd().QuotedStr()}), 4)
WHERE PKWEB_USER= {u.PKUser} ");
                    }
                    else u.Erreur = "Impossible de retrouver l'utilisateur";
                }
            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user UpdateExpirationDateFromPKUser(string SuperLoginID, string SuperPassword, int PkUser, DateTime date)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(
                        $"SELECT * FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE PKWEB_USER = " + PkUser.ToString());
                    if (dr != null)
                    {
                        DateTime dtToCompare = new DateTime(2999, 12, 31);
                        if (date.Date >= dtToCompare.Date)
                        {
                            WS_DBUtils.utils_LER.DBExec(
                                $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET EXPIRATIONDATE = NULL WHERE PKWEB_USER=" + PkUser.ToString());
                        }
                        else
                        {
                            WS_DBUtils.utils_LER.DBExec(
                                $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET EXPIRATIONDATE = " + date.QuotedStr() + " WHERE PKWEB_USER=" + PkUser.ToString());
                        }
                        u = GetUserByPk(PkUser);
                        dr = null;
                    }
                    else u.Erreur = "Impossible de retrouver l'utilisateur";
                }

            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user UpdateCGUFromPKUser(string SuperLoginID, string SuperPassword, int PkUser, string CGU)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    DataRow dr = WS_DBUtils.utils_LER.DBSelectRow(
                        $"SELECT * FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE PKWEB_USER = " + PkUser.ToString());
                    if (dr != null)
                    {
                        WS_DBUtils.utils_LER.DBExec(
                            $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET CGU = " + CGU.QuotedStr() + " WHERE PKWEB_USER=" + PkUser.ToString());
                        u = GetUserByPk(PkUser);
                        dr = null;
                    }
                    else u.Erreur = "Impossible de retrouver l'utilisateur";
                }
            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        static public user UpdateEmailFromPKUser(string SuperLoginID, string SuperPassword, int PkUser, string Email)
        {
            user u = new user();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    bool mailModif, mailExists;
                    u = GetUserByPk(PkUser);
                    mailModif = u.EMail != Email;
                    mailExists = WS_DBUtils.utils_LER.DBSelect(
$@"SELECT pkweb_user 
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER
WHERE UPPER(email) = {Email.ToUpper().QuotedStr()}
AND pkweb_user <> {PkUser}") != "";

                    if (!mailModif || !mailExists)
                    {
                        WS_DBUtils.utils_LER.DBExec(
$@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user 
SET email = {Email.QuotedStr()}
WHERE pkweb_user={PkUser}");
                        u = GetUserByPk(PkUser);
                    }
                    else
                        u.Erreur = "L'adresse email existe déjà";
                }
            }
            catch (Exception Ex)
            {
                u.Erreur = Ex.Message;
            }
            return u;
        }
        public static bool IsLoginTechem(string LoginID)
        {
            if (LoginID.StartsWith(WS_Common.tchUserPrefix))
                return true;
            else
                return false;
        }
        public static bool IsUserDemo(user u)
        {
            if (u.LoginID.ToLower().StartsWith("demo") && !u.LoginID.Contains("@"))
                return true;
            else
                return false;
        }
        public static string GetTchWeekPwd(string SuperLoginID, string SuperPassword, DateTime Date)
        {
            string pwd = "";
            if ((SuperLoginID == WS_Common._SuperLoginID) && (SuperPassword == WS_Common._SuperPassword))
            {
                pwd = WS_Common.GetTchWeekPassword(Date);
            }
            return pwd;
        }
        public static retour SendEmailToUser(string SuperLoginID, string SuperPassword, int PKUser)
        {
            retour r = new retour();
            try
            {
                if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    user u = GetUserByPk(PKUser);

                    if (string.IsNullOrEmpty(u.EMail))
                    {
                        r.Erreur = "Pas d'email";
                        return r;
                    }
                    if (u.PKUser == -1)
                    {
                        r.Erreur = "Utilisateur incorrrect";
                        return r;
                    }
                    string password = GeneratePwd();
                    Tuple<string, string> val = session.GeneratePasswordResetTokenID(PKUser);
                    string TokenID = val.Item1;
                    string Salt = val.Item2;

                    WS_DBUtils.utils_LER.DBExec(
$@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.web_user SET
password_encrypted = DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW({password.QuotedStr()}), 4),
lastdateemail=SYSDATE
WHERE pkweb_user={PKUser} ");

                    #region body
                    string body =
$@"<html>              
    </head>              
    <body style=""font-family: 'Calibri',sans-serif;"" bgcolor=""#EFEFEF"" lang=FR link=blue vlink=purple style='word-wrap:break-word'>                          
        <div class=WordSection1>                                      
            <table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0 width=""100%"" style='width:100.0%;background:#EFEFEF;border-collapse:collapse'>                                                  
                <tr>                                                              
                    <td style='padding:0cm 0cm 0cm 0cm'>
                        <p class=MsoNormal style='line-height:0%'>
                            <span style='font-size:1.0pt;color:black'>&nbsp;</span>
                            <span style='font-size:1.0pt'><o:p></o:p></span>
                        </p>
                    </td>                                                           
                    <td style='width:480.0pt;'>                                                                                           
                        <p class=MsoNormal>                                                                                      
                            <span style='display:none'><o:p>&nbsp;</o:p></span>                                                                          
                        </p>                                                                                                   
                        <table  style=""background-color: #ffffff;"">
                            <tbody>
                                <tr>
                                    <td style='width:20pt;'></td>
                                    <td>
                                        <p>Madame, Monsieur,</p>
                                        <p>Votre adhésion à l'espace client Techem a été activée, vous pouvez dès à présent vous connecter à votre espace client à l'adresse suivante :</p>
                                        <p><a href=""https://client.techem.fr"" originalsrc=""https://client.techem.fr/"">https://client.techem.fr</a></p>
                                        <p>- Votre identifiant : 
                                        <strong>
                                                <span style=""font-family: 'Calibri',sans-serif;"">[LOGINID]</span>
                                        </strong>
                                        </p>
                                        <p>- Votre mot de passe :</p>
                                    </td>
                                    <td style='width:20pt;'></td>
                                </tr>
                                <tr>
                                    <td style='width:20pt;'></td>
                                    <td>
                                        <table style=""height: 38px; border-style: none; background-color: #ff0000;"" width=""270"">
                                            <tbody>
                                                <tr style=""height: 10px;"">
                                                    <td style=""width: 15.75px;"">&nbsp;</td>
                                                    <td style=""width: 223.922px;"">&nbsp;</td>
                                                    <td style=""width: 15.3281px;"">&nbsp;</td>
                                                </tr>
                                                <tr style=""height: 18px;"">
                                                    <td style=""width: 15.75px;"">&nbsp;</td>
                                                    <td style=""width: 223.922px; text-align: center;"">
                                                        <a style=""color: #ffffff; text-decoration: none;"" href=""[URL]"" target=""_blank"">Réinitialiser le mot de passe</a></td>
                                                    <td style=""width: 15.3281px;"">&nbsp;</td>
                                                </tr>
                                                <tr style=""height: 10px;"">
                                                    <td style=""width: 15.75px;"">&nbsp;</td>
                                                    <td style=""width: 223.922px;"">&nbsp;</td>
                                                    <td style=""width: 15.3281px;"">&nbsp;</td>
                                                </tr>
                                            </tbody>
                                        </table>                                        
                                    </td>
                                    <td style='width:20pt;'></td>
                                </tr>
                                <tr>
                                    <td style='width:20pt;'></td>
                                    <td>
                                        <p>&nbsp;</p>
                                        <p>Vous trouvez ci-joint notre guide administrateur pour vous accompagner.</p>                                        
                                        <p>Vous remerciant pour votre confiance et restant à votre disposition,</p>
                                        <p>Cordialement,</p>
                                        <p>L'équipe Techem</p>
                                        <p><img src=""https://client.techem.fr/images/logo_techem.png"" style=""width: 240px; height: 107px;""></p>
                                    </td>
                                    <td style='width:20pt;'></td>
                                </tr>
                            </tbody>
                        </table>                                                                        
                        </td>                                         
                        <td style='padding:0cm 0cm 0cm 0cm'>                                                 
                            <p class=MsoNormal style='line-height:0%'>                                                         
                            <span style='font-size:1.0pt;color:black'>&nbsp;</span>                                                         
                            <span style='font-size:1.0pt'><o:p></o:p></span>                                                 
                            </p>
                        </td>                                 
                    </tr>                         
                </table>                         
            <p class=MsoNormal><o:p>&nbsp;</o:p></p>                 
        </div>         
    </body>
</html>";

                    body = body.Replace("[LOGINID]", u.LoginID);
                    string url = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "ESPACECLIENT_RESETPASSWORDURL");
                    url = url.Replace("[TOKENID]", TokenID);
                    url = url.Replace("[SALT]", Salt);
                    body = body.Replace("[URL]", url);

                    //si l'utilisateur est un admin alors on envoie la piece jointe
                    string attchments = string.Empty;
                    bool isAdmin = (u.UserType != "O") && (u.UserType != "G");

                    if (isAdmin)
                    {
                        string fileName1 = AppDomain.CurrentDomain.GetData("DataDirectory").ToString() + "\\Fiche administrateur Espace Client.pdf";
                        if (File.Exists(fileName1))
                            attchments = fileName1;
                    }

                    #endregion
                    Utils_Mail.sendMailSmtp(
                        from: "espaceclient@techem.fr",
                        subject: "Accès à l’espace client Techem",
                        body: body,
                        to: u.EMail,
                        cc: string.Empty,
                        bcc: string.Empty,
                        attach: attchments,
                        isHtml: true);
                    return r;
                }
            }

            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }

        private static string GeneratePwd()
        {
            return System.Guid.NewGuid().ToString("N").Substring(0, 6);
        }
        static private int InsertUser(string LoginID, string UserName, string FirstName, string type,
            string fkParentUser, string fk, string PhoneNumber, string Email, string UserRole)
        {
            string[] WrongNames = new string[5] { "VIDE", "VIDE ORDURES", "POUBELLE", "KEBAB", "FEMME DE MENAGE" };
            if (Array.IndexOf(WrongNames, UserName) < 0)
            {
                int pk = Convert.ToInt32(WS_DBUtils.utils_LER.GetPK($"{Properties.Settings.Default.LER_AUTH_SchemaName}.SQWEB_USER"));

                //GESTIONCLIENT
                string FK = "-1";
                string fkClient = "-1";
                if (type == "C" || type == "G")
                    fkClient = fk;
                else
                    FK = fk;

                string password = GeneratePwd();
                WS_DBUtils.utils_LER.DBExec(
                    $@"INSERT INTO {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER(
PKWEB_USER, LOGINID, USERNAME, FIRSTNAME, PASSWORD, PASSWORD_ENCRYPTED, USERTYPE, FKPARENTUSER,
EXPIRATIONDATE, FK, FKCLIENT, EMAIL, PHONENUMBER, USERROLE) VALUES ( 
{pk}, {LoginID.QuotedStr()}, {UserName.QuotedStr()}, {FirstName.QuotedStr()}, {password.QuotedStr()},
DBMS_CRYPTO.hash(UTL_RAW.CAST_TO_RAW ({password.QuotedStr()}), 4), {type.QuotedStr()}, {fkParentUser}, 
NULL, {FK}, {fkClient}, {Email.QuotedStr()}, {PhoneNumber.QuotedStr()}, {UserRole.QuotedStr()})");

                return pk;
            }
            else return -1;
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
        static public bool CreateGestionnaire(string SessionID, int PkUser, string LoginID,
            string UserName, string FirstName, string PhoneNumber, string Email, string UserRole)
        {
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    return false;
                }
                else if (UserExists(LoginID))
                {
                    int pkUser = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(
                        $"SELECT PKWEB_USER from {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE LOGINID = " + LoginID.QuotedStr()));
                    //SendEmailToUser(_SuperLoginID, _SuperPassword, pkUser);
                    return false;
                }
                else
                {
                    user admin = GetUserByPk(PkUser);
                    int pkUser = InsertUser(LoginID, UserName, FirstName, "G", PkUser.ToString(), admin.FKClient.ToString(), PhoneNumber, Email, UserRole);
                    SendEmailToUser(_SuperLoginID, _SuperPassword, pkUser);
                    return true;
                }
            }
            catch
            {
                return false;
            }

        }
        static private bool UserExists(int pkOccupant)
        {
            //retourne si un USER existe déjà pour l'occupant
            return Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(
                $"SELECT count(*) from {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER WHERE USERTYPE='O' AND FK = " + pkOccupant.ToString())) >= 1;
        }
        static private bool UserExists(string LoginID)
        {
            //retourne si un USER existe déjà pour l'occupant
            return Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(
               $@"SELECT count(*)
from {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER
WHERE
(EXPIRATIONDATE < sysdate or EXPIRATIONDATE is null)
and upper(LOGINID) = {LoginID.ToUpper().QuotedStr()} ")) >= 1;
        }
        static private void ArchivePreviousUser(int pkOccupant)
        {
            //WEBTODO :
            // - occupant remplace par web_logement
#if WS2
            int pkLogement = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect("SELECT fklogement FROM web_occupant WHERE pkoccupant = " + pkOccupant.ToString()));
            DataRowCollection occupants = WS_DBUtils.utils_LER.DBSelectRows("SELECT pkoccupant, datedepart FROM web_occupant WHERE datedepart<=sysdate AND fklogement = " + pkLogement.ToString());
            foreach (DataRow o in occupants)
            {
                WS_DBUtils.utils_LER.DBExec(
                    $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET EXPIRATIONDATE = " + Convert.ToDateTime(o["DATEDEPART"].ToString()).QuotedStr() + " WHERE USERTYPE='O' AND FK = " + o["PKOCCUPANT"].ToString());
            }
#else
            int pkLogement = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect("SELECT FKLOGEMENT FROM OCCUPANT WHERE PKOCCUPANT = " + pkOccupant.ToString()));
            DataRowCollection occunpants = WS_DBUtils.utils_LER.DBSelectRows("SELECT PKOCCUPANT, DATEDEPART FROM OCCUPANT WHERE DATEDEPART<=sysdate AND FKLOGEMENT = " + pkLogement.ToString());
            foreach (DataRow o in occunpants)
            {
                WS_DBUtils.utils_LER.DBExec(
                    $"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET EXPIRATIONDATE = " + Convert.ToDateTime(o["DATEDEPART"].ToString()).QuotedStr() + " WHERE USERTYPE='O' AND FK = " + o["PKOCCUPANT"].ToString());
            }
#endif
        }

        /// <summary>
        /// Méthode qui permet à un utilisateur de créer les USER (occupants) d'un immeuble
        /// </summary>
        /// <param name="SessionID">Identificateur de session</param>
        /// <param name="PkUser">PK de l'utilisateur connecté</param>
        /// <param name="fkimmeuble">N° d'immeuble</param>
        /// <returns>Renvoie true si la création s'est bien passée</returns>                
        static public users CreateOccupants(string SessionID, int PkUser, int fkimmeuble)
        {
            //génére un ensemble d"utilisateurs pour le FK donné ( FKIMMEUBLE si type = I)

            users us = new users();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    us.Erreur = "incohérence de session";
                    return us;
                }
                else
                {
                    if (checkImmeuble(PkUser, fkimmeuble))
                    {
                        DataRowCollection occ;
                        occ = GetOccupantsByImmeuble(Convert.ToInt32(fkimmeuble));
                        foreach (DataRow o in occ)
                        {
                            if (!UserExists(Convert.ToInt32(o["PKOCCUPANT"].ToString())))
                            {
                                ArchivePreviousUser(Convert.ToInt32(o["PKOCCUPANT"].ToString()));
                                int pk = InsertUser(
                                    LoginID: o["CODELOGEGESTIO"].ToString() + "_" + o["PKOCCUPANT"].ToString(),
                                    UserName: o["NOM"].ToString().Trim(),
                                    FirstName: "",
                                    type: "O",
                                    PkUser.ToString(),
                                    fk: o["PKOCCUPANT"].ToString(),
                                    PhoneNumber: "",
                                    Email: o["EMAIL"].ToString().Trim(),
                                    UserRole: "");

                                user u = GetUserByPk(pk);
                                us.ListeUsers.Add(u);
                            }
                            else
                            {
                                user u = GetUserByPKOccupant(_SuperLoginID, _SuperPassword, Convert.ToInt32(o["PKOCCUPANT"].ToString()));
                                us.ListeUsers.Add(u);
                            }
                        }
                    }
                    else
                    {
                        us.Erreur = "incohérence de user / immeuble";
                        return us;
                    }
                }
            }
            catch (Exception Ex)
            {
                us.Erreur = Ex.Message;
                return us;
            }
            return us;
        }

        /// <summary>
        /// Méthode qui permet au super administrateur de créer un administrateur
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
        static public bool CreateDirecteur(string SuperLoginID, string SuperPassword, string LoginID,
            string UserName, string FirstName, int fk, string type, string PhoneNumber, string Email, string UserRole)
        {
            try
            {
                if (UserExists(LoginID))
                {
                    return false;
                }
                else if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    int pkUser = InsertUser(LoginID, UserName, FirstName, type, "NULL", fk.ToString(), PhoneNumber, Email, UserRole);
                    SendEmailToUser(_SuperLoginID, _SuperPassword, pkUser);
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        static public bool CreateOccupant(string SuperLoginID, string SuperPassword, string LoginID,
            string UserName, string FirstName, int fk, string PhoneNumber, string Email)
        {
            try
            {
                if (UserExists(LoginID))
                {
                    return false;
                }
                else if ((SuperLoginID == _SuperLoginID) && (SuperPassword == _SuperPassword))
                {
                    int pkUser = InsertUser(LoginID, UserName, FirstName, "O", "NULL", fk.ToString(), PhoneNumber, Email, "NULL");
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Retourne le pk du client
        /// </summary>
        /// <param name="clientID">Id du client</param>
        /// <returns></returns>
        static private int GetPKClient(string clientID)
        {
            string fk = WS_DBUtils.utils_LER.DBSelect($@"SELECT pkclient FROM client WHERE id = {clientID.QuotedStr()} ");

            if (fk != "")
                return Convert.ToInt32(fk);
            else return -1;
        }
        static public userExportParams GetExportParams(string SuperLoginID, string SuperPassword, string clientID)
        {
            int pkClient = GetPKClient(clientID);

            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(
                $@"SELECT EXPORT_ONLYNEW, EXPORT_COLUMNHEADERS
FROM {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER
WHERE USERTYPE ='C'
AND FK = {pkClient} ");

            userExportParams p = new userExportParams
            {
                exportAll = true
            };
            if ((r["EXPORT_ONLYNEW"] != DBNull.Value) && (r["EXPORT_ONLYNEW"].ToString() == "O"))
                p.exportAll = false;
            if (r["EXPORT_ONLYNEW"] != DBNull.Value)
                p.exportFormat = r["EXPORT_ONLYNEW"].ToString();

            return p;
        }

        static public retour SetSeuilConso(string SessionID, int PkUser, string ParamsFiltres)
        {
            retour r = new retour();
            try
            {
                if (session.checkSession(SessionID, PkUser) == false)
                {
                    r.Erreur = "incohérence de session";
                    return r;
                }
                else
                {
                    ParamsString Pfiltres = new ParamsString(ParamsFiltres);
                    int SEUIL_CONSO_EF = Pfiltres.GetParam("SEUIL_CONSO_EF").ToInt32OrDefault(-1);
                    int SEUIL_CONSO_EC = Pfiltres.GetParam("SEUIL_CONSO_EC").ToInt32OrDefault(-1);
                    int SEUIL_CONSO_REPART = Pfiltres.GetParam("SEUIL_CONSO_REPART").ToInt32OrDefault(-1);
                    int SEUIL_CONSO_CET = Pfiltres.GetParam("SEUIL_CONSO_CET").ToInt32OrDefault(-1);
                    bool SEUIL_CONSO_ACTIF = Pfiltres.GetParam("SEUIL_CONSO_ACTIF").ToBooleanOrDefault(true);
                    string SEUIL_CONSO_EMAIL = Pfiltres.GetParam("SEUIL_CONSO_EMAIL");

                    WS_DBUtils.utils_LER.DBExec(
                        $@"UPDATE {Properties.Settings.Default.LER_AUTH_SchemaName}.WEB_USER SET
SEUIL_CONSO_EF={(SEUIL_CONSO_EF == -1 ? "null" : SEUIL_CONSO_EF.ToString())},
SEUIL_CONSO_EC={(SEUIL_CONSO_EC == -1 ? "null" : SEUIL_CONSO_EC.ToString())},
SEUIL_CONSO_REPART={(SEUIL_CONSO_REPART == -1 ? "null" : SEUIL_CONSO_REPART.ToString())},
SEUIL_CONSO_CET={(SEUIL_CONSO_CET == -1 ? "null" : SEUIL_CONSO_CET.ToString())},
SEUIL_CONSO_ACTIF={SEUIL_CONSO_ACTIF.ToStringOrDefault().QuotedStr()},
SEUIL_CONSO_EMAIL={SEUIL_CONSO_EMAIL.QuotedStr()}
WHERE PKWEB_USER = {PkUser} ");
                }
            }
            catch (Exception Ex)
            {
                r.Erreur = Ex.Message;
            }
            return r;
        }


    }
}
