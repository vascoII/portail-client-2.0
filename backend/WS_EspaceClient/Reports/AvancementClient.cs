using System;
using System.Collections.Generic;
using System.Data;
using Tools;

namespace Techem.Webservices.WS_EspaceClient.Reports
{

    public static class AvancementClient
    {

        /// <summary>
        /// Retourne un chaine de caractère ayant cinq lignes
        /// </summary>
        /// <param name="chaine">Chaine de caractères à traiter</param>
        /// <returns></returns>
        public static string FiveLignes(this string chaine)
        {
            int index = -1;
            int count = 0;
            while (-1 != (index = chaine.IndexOf(Environment.NewLine, index + 1)))
            {
                count++;
            }

            if (count < 4) // 5 lignes dans la string
            {
                int currentIndex = 0;
                for (currentIndex = 0; currentIndex < (4 - count); currentIndex++)
                {
                    chaine += Environment.NewLine;
                }
            }

            return chaine;
        }

        /// <summary>
        /// Coupe une chaine de caractères en deux lignes
        /// </summary>
        /// <param name="chaine"></param>
        /// <returns></returns>
        public static string SplitTwoLignes(this string chaine)
        {
            int middleSize = chaine.Length / 2;
            string retChaine = "";
            int SpaceCarPosition = chaine.IndexOf(" ", middleSize);

            if ((SpaceCarPosition != -1)
                && (SpaceCarPosition < chaine.Length))
            {
                retChaine = chaine.Substring(0, SpaceCarPosition) + Environment.NewLine + chaine.Substring(SpaceCarPosition + 1, chaine.Length - SpaceCarPosition - 1);
            }
            else
            {
                retChaine = chaine;
            }
            return retChaine;
        }

        /// <summary>
        /// Coupe une chaine de caractères en trois lignes
        /// </summary>
        /// <param name="chaine"></param>
        /// <returns></returns>
        public static string SplitTreeLignes(this string chaine)
        {
            int tiersSize = chaine.Length / 3;
            string retChaine = "";
            int SpaceCarPosition = chaine.IndexOf(" ", tiersSize);

            if ((SpaceCarPosition != -1)
                && (SpaceCarPosition < chaine.Length))
            {
                string firstTiers = chaine.Substring(0, SpaceCarPosition) + Environment.NewLine;
                string twoTiersEnd = chaine.Substring(SpaceCarPosition + 1, chaine.Length - SpaceCarPosition - 1);

                int SpaceCarPosition2 = twoTiersEnd.IndexOf(" ", tiersSize);
                if ((SpaceCarPosition2 != -1)
                    && (SpaceCarPosition2 < chaine.Length))
                {
                    retChaine = firstTiers +
                        twoTiersEnd.Substring(0, SpaceCarPosition2) + Environment.NewLine + twoTiersEnd.Substring(SpaceCarPosition2 + 1, twoTiersEnd.Length - SpaceCarPosition2 - 1);
                }
                else
                {
                    retChaine = firstTiers + twoTiersEnd;
                }
            }
            else
            {
                retChaine = chaine;
            }
            return retChaine;
        }


        /// <summary>
        /// Récupère la datatable pour l'initialisation de la grid control
        /// </summary>
        /// <param name="fk">Clef primaire de l'immeuble ou client (en fonction du paramètre destinationType)</param>
        /// <param name="dateDebut">Date de début de la période à analyser</param>
        /// <param name="dateFin">Date de fin de la période à analyser</param>
        /// <param name="destinationType">Type de destination client (RD_CLIENT) ou immeuble (RD_IMMEUBLE)</param>
        public static DataTable GetDataSource(long fk, 
            DateTime dateDebut, 
            DateTime dateFin, 
            string destinationType)
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
            //*** ESPACE CLIENT ***
            int pkUser = (int)fk;
            if (destinationType == "GESTIONNAIRE")
            {
                //fk = pkUser du site client : on récupère le client du user gestionnaire
                user uClient = WS_Common.GetUserByPk(WS_Common.GetUserByPk(Convert.ToInt32(fk)).FK);
                fk = (long)uClient.FK;
            }
            //*** ***

            WS_DBUtils.utils_LER.DBExec("alter session set nls_date_format='DD/MM/YYYY'");
            string query = "";

            if (destinationType == "CLIENT" ||
                destinationType == "GESTIONNAIRE")//*** ESPACE CLIENT ***//
            {
                query = "";
                query = "SELECT "
                                + "IMMEUBLE.PKIMMEUBLE, "//*** AJOUTE ESPACE CLIENT //***
                                + "INTERVENTION.TEMPOCCUPANT AS NOM "
                                + ", INTERVENTION.FKLOGEMENT"
                                + ", INTERVENTION.IDIMMEUBLE AS REFIMM  "
                                + ", INTERVENTION.BAT AS BATIMENT "
                                + ", INTERVENTION.ESC AS ESCALIER "
                                + ", INTERVENTION.ETG AS ETAGE "
                                //+ ", INTERVENTION.BAT "
                                //+ ", INTERVENTION.ESC "
                                //+ ", INTERVENTION.ETG "
                                + ", INTERVENTION.TELFIXE as \"TELEPHONEFIXE\""
                                + ", INTERVENTION.TELMOBILE as \"TELEPHONEMOBILE\""
                                + ", INTERVENTION.NUMINTERVENTION as \"NINTERVENTION\""
                                + ", NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) as \"DATE\""
                                + ", INTERVENTION_CR_TECH.MOTIFINTER_CL as \"MOTIF\""
                                + ", INTERVENTION.STATUT as \"ETAT\" "
                                + ", INTERVENTION_CR_TECH.CRINTER_CL "
                                + ", INTERVENTION_CR_TECH.MOTIFINTER "
                                + "FROM INTERVENTION, IMMEUBLE, INTERVENTION_CR_TECH "
                                + "WHERE INTERVENTION.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE  "
                                + "AND INTERVENTION.PKINTERVENTION = INTERVENTION_CR_TECH.FKINTERVENTION  "
                                + "AND ((INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer'))  "
                                + "     AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN')  "
                                //+ "	 AND (IMMEUBLE.FKCLIENT = :FKCLIENT)  "
                                + "	 AND (IMMEUBLE.FKCLIENT IN (SELECT PKCLIENT FROM CLIENT start with CLIENT.PKCLIENT = :FKCLIENT connect BY FKCLIENT = prior PKCLIENT))  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 OR (INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer')) "
                                + "	 AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN') "
                                + "	 AND (IMMEUBLE.FKCLIENT = :FKCLIENT)  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 AND EXISTS  "
                                + "	     (SELECT PKHISTOINTERVENTION "
                                + "		  FROM HISTOINTERVENTION "
                                + "		  WHERE (INTERVENTION.PKINTERVENTION = FKINTERVENTION) AND (STATUT LIKE 'Clôturé%')) "
                                + "    ) "
                                + "and not (INTERVENTION.STATUT in ('Demande reçue', 'A reprogrammer', 'En attente de planification', 'En attente de qualification') and INTERVENTION.ORIGINEINTERVENTION in ('Relevé', 'Service Relevé') ) " //ADA 2018-12-21
                                + "ORDER BY "
                                + "INTERVENTION.TEMPOCCUPANT, INTERVENTION.NUMINTERVENTION, INTERVENTION_CR_TECH.MOTIFINTER ";

                query = query.Replace(":FKCLIENT", fk.ToString());
            }
            else if (destinationType == "IMMEUBLE")
            {
                query = "SELECT "
                                + "IMMEUBLE.PKIMMEUBLE, "//*** AJOUTE ESPACE CLIENT //***
                                + "INTERVENTION.TEMPOCCUPANT AS NOM "
                                + ", INTERVENTION.IDIMMEUBLE AS REFIMM  "
                                + ", INTERVENTION.FKLOGEMENT "
                                + ", INTERVENTION.BAT AS BATIMENT "
                                + ", INTERVENTION.ESC AS ESCALIER "
                                + ", INTERVENTION.ETG AS ETAGE "
                                + ", INTERVENTION.TELFIXE as \"TELEPHONEFIXE\""
                                + ", INTERVENTION.TELMOBILE as \"TELEPHONEMOBILE\""
                                + ", INTERVENTION.NUMINTERVENTION as \"NINTERVENTION\""
                                + ", NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) as \"DATE\""
                                + ", INTERVENTION_CR_TECH.MOTIFINTER_CL as \"MOTIF\""
                                + ", INTERVENTION.STATUT as \"ETAT\" "
                                + ", INTERVENTION_CR_TECH.CRINTER_CL "
                                + ", INTERVENTION_CR_TECH.MOTIFINTER "
                                + "FROM INTERVENTION, IMMEUBLE, INTERVENTION_CR_TECH "
                                + "WHERE INTERVENTION.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE  "
                                + "AND INTERVENTION.PKINTERVENTION = INTERVENTION_CR_TECH.FKINTERVENTION  "
                                + "AND ((INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer'))  "
                                + "     AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN')  "
                                + "	 AND (IMMEUBLE.PKIMMEUBLE = :PKIMMEUBLE)  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 OR (INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer')) "
                                + "	 AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN') "
                                + "	 AND (IMMEUBLE.PKIMMEUBLE = :PKIMMEUBLE)  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 AND EXISTS  "
                                + "	     (SELECT PKHISTOINTERVENTION "
                                + "		  FROM HISTOINTERVENTION "
                                + "		  WHERE (INTERVENTION.PKINTERVENTION = FKINTERVENTION) AND (STATUT LIKE 'Clôturé%')) "
                                + "    ) "
                                + "and not (INTERVENTION.STATUT in ('Demande reçue', 'A reprogrammer', 'En attente de planification', 'En attente de qualification') and INTERVENTION.ORIGINEINTERVENTION in ('Relevé', 'Service Relevé') ) " //ADA 2018-12-21
                                + "ORDER BY "
                                + "INTERVENTION.TEMPOCCUPANT, INTERVENTION.NUMINTERVENTION, INTERVENTION_CR_TECH.MOTIFINTER ";

                query = query.Replace(":PKIMMEUBLE", fk.ToString());
            }

            query = query
                .Replace(":DATE_DEBUT", dateDebut.ToString("dd/MM/yyyy"))
                .Replace(":DATE_FIN", dateFin.ToString("dd/MM/yyyy"))
                ;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable2(query);

            //*** ESPACE CLIENT *** : on ne garde que les rows immeubles du gestionnaire
            if (destinationType == "GESTIONNAIRE")
            {
                DataRowCollection drcImmGest = WS_DBUtils.utils_LER.DBSelectRows(WS_Common.GetQueryImmeubles("pkimmeuble", "U", pkUser));
                HashSet<long> pksGestionnaire = new HashSet<long>();
                foreach (DataRow drImmeuble in drcImmGest)
                    pksGestionnaire.Add(Convert.ToInt64(drImmeuble["pkimmeuble"].ToString()));

                DataTable dt2 = dt.Clone();
                foreach (DataRow dr in dt.Rows)
                {
                    if (pksGestionnaire.Contains(Convert.ToInt64(dr["PKIMMEUBLE"].ToString())))
                        dt2.ImportRow(dr);
                }
                dt = dt2;
            }
            //*** ***

            dt.Columns.Add("BAT", typeof(string));
            dt.Columns.Add("ESC", typeof(string));
            dt.Columns.Add("ETG", typeof(string));
            dt.Columns.Add("PASSAGELE", typeof(string));
            dt.Columns.Add("REFLOGEMENT");
            dt.Columns.Add("FLUIDE");
            dt.Columns.Add("NCOMPTEUR");
            dt.Columns.Add("COMPTERENDU");
            dt.Columns.Add("NUMBEROSA");
            //dt.Columns.Add("REFIMM");

            for (int index = 0; index < dt.Rows.Count; index++)
            {
                if (!string.IsNullOrEmpty(dt.Rows[index]["FKLOGEMENT"].ToString()))
                {
                    dt.Rows[index]["REFLOGEMENT"] = GetCodeGestionnaireFromLogement(dt.Rows[index]["FKLOGEMENT"].ToString());
                }

                if (dt.Rows[index]["MOTIF"].ToString().ToLower().Contains("eau chaude"))
                {
                    dt.Rows[index]["FLUIDE"] = "CHAUD";
                }
                else if (dt.Rows[index]["MOTIF"].ToString().ToLower().Contains("eau froide"))
                {
                    dt.Rows[index]["FLUIDE"] = "FROID";
                }

                dt.Rows[index]["BAT"] = dt.Rows[index]["BATIMENT"].ToString();
                dt.Rows[index]["ESC"] = dt.Rows[index]["ESCALIER"].ToString();
                dt.Rows[index]["ETG"] = dt.Rows[index]["ETAGE"].ToString();
                dt.Rows[index]["PASSAGELE"] = Convert.ToDateTime(dt.Rows[index]["DATE"].ToString()).ToString("dd/MM/yyyy");

                string[] input = dt.Rows[index]["MOTIFINTER"].ToString().Split(' ');
                if (input.Length > 9)
                {
                    if (input[8] == ":")
                    {
                        dt.Rows[index]["NCOMPTEUR"] = input[7].Replace("(", "").Replace(")", "") + " CODE 72";
                    }
                    else if (input[7] == ":")
                    {
                        dt.Rows[index]["NCOMPTEUR"] = input[6].Replace("(", "").Replace(")", "")
                            + " " + input[3];
                    }
                    else
                    {
                        dt.Rows[index]["NCOMPTEUR"] = "";
                    }
                }

                string statut = dt.Rows[index]["ETAT"].ToString();
                if ((statut == "Clôturée - Achevée")
                    || (statut == "Facturée")
                    )
                {
                    statut = "Réalisée";
                }
                else if ((statut.Length > "Clôturée - ".Length)
                    && (statut.Substring(0, "Clôturée - ".Length) == "Clôturée - "))
                {
                    statut = statut.Replace("Clôturée - ", "");
                }
                dt.Rows[index]["ETAT"] = statut.Replace("Pb ", "Problème ");

                string compteRendu = "";
                if (dt.Rows[index]["ETAT"].ToString().Trim() == "Planifiée")
                {
                    compteRendu = "Passage prévu le " + Convert.ToDateTime(dt.Rows[index]["PASSAGELE"].ToString()).ToString("dd/MM/yyyy");
                }
                else
                {
                    DataRow trad = WS_DBUtils.utils_LER.DBSelectRow("SELECT RESULTAT " +
                        " FROM INTERVENTION_STATUT " +
                        " WHERE STATUTINTER = " + dt.Rows[index]["ETAT"].ToString().QuotedStr());
                    if ((trad != null)
                        && (trad["RESULTAT"].ToString() != ""))
                    {
                        compteRendu = trad["RESULTAT"].ToString();
                    }
                    else
                    {
                        compteRendu = dt.Rows[index]["CRINTER_CL"].ToString();
                    }
                }
                dt.Rows[index]["COMPTERENDU"] = compteRendu;

            }
            dt.Columns.Remove("FKLOGEMENT");

            //*** ESPACE CLIENT***
            dt.Columns["REFLOGEMENT"].SetOrdinal(0);
            dt.Columns["REFLOGEMENT"].ColumnName = "REF";

            dt.Columns["NOM"].SetOrdinal(1);
            dt.Columns["BAT"].SetOrdinal(2);
            dt.Columns["ESC"].SetOrdinal(3);
            dt.Columns["ETG"].SetOrdinal(4);

            dt.Columns["TELEPHONEFIXE"].SetOrdinal(5);
            dt.Columns["TELEPHONEFIXE"].ColumnName = "TEL FIXE";

            dt.Columns["TELEPHONEMOBILE"].SetOrdinal(6);
            dt.Columns["TELEPHONEMOBILE"].ColumnName = "TEL MOBILE";

            dt.Columns["NINTERVENTION"].SetOrdinal(7);
            dt.Columns["NINTERVENTION"].ColumnName = "INTERVENTION";

            dt.Columns["ETAT"].SetOrdinal(8);
            dt.Columns["ETAT"].ColumnName = "STATUT";

            dt.Columns["PASSAGELE"].SetOrdinal(9);
            dt.Columns["PASSAGELE"].ColumnName = "PASSAGE LE";

            dt.Columns["MOTIF"].SetOrdinal(10);

            dt.Columns.Add("ETAT");
            dt.Columns["ETAT"].SetOrdinal(11);

            dt.Columns["NCOMPTEUR"].SetOrdinal(12);
            dt.Columns["NCOMPTEUR"].ColumnName = "N° COMPTEUR";

            dt.Columns["FLUIDE"].SetOrdinal(13);

            dt.Columns["COMPTERENDU"].SetOrdinal(14);
            dt.Columns["COMPTERENDU"].ColumnName = "COMPTE RENDU";

            dt.Columns["NUMBEROSA"].SetOrdinal(15);
            dt.Columns["NUMBEROSA"].ColumnName = "N° RDV SERVICE";

            dt.Columns["REFIMM"].SetOrdinal(16);

            dt.Columns.Remove("CRINTER_CL");
            dt.Columns.Remove("MOTIFINTER");
            dt.Columns.Remove("PKIMMEUBLE");
            dt.Columns.Remove("BATIMENT");
            dt.Columns.Remove("ESCALIER");
            dt.Columns.Remove("ETAGE");
            dt.Columns.Remove("DATE");

            if (dt.Rows.Count == 0)//pour avoir l'entete si pas de rows
            {
                var emptyData = new DataTable();

                foreach (DataColumn column in dt.Columns)
                {
                    emptyData.Columns.Add(new DataColumn(column.ColumnName));
                }
                emptyData.Rows.Add(emptyData.NewRow());
                dt = emptyData;
            }
            //*** ***

            return dt;
#else
            //*** ESPACE CLIENT ***
            int pkUser = (int)fk;
            if (destinationType == "GESTIONNAIRE")
            {
                //fk = pkUser du site client : on récupère le client du user gestionnaire
                user uClient = WS_Common.GetUserByPk(WS_Common.GetUserByPk(Convert.ToInt32(fk)).FK);
                fk = (long)uClient.FK;
            }
            //*** ***

            WS_DBUtils.utils_LER.DBExec("alter session set nls_date_format='DD/MM/YYYY'");
            string query = "";

            if (destinationType == "CLIENT" ||
                destinationType == "GESTIONNAIRE")//*** ESPACE CLIENT ***//
            {
                query = "";
                query = "SELECT "
                                + "IMMEUBLE.PKIMMEUBLE, "//*** AJOUTE ESPACE CLIENT //***
                                + "INTERVENTION.TEMPOCCUPANT AS NOM "
                                + ", INTERVENTION.FKLOGEMENT"
                                + ", INTERVENTION.IDIMMEUBLE AS REFIMM  "
                                + ", INTERVENTION.BAT AS BATIMENT "
                                + ", INTERVENTION.ESC AS ESCALIER "
                                + ", INTERVENTION.ETG AS ETAGE "
                                //+ ", INTERVENTION.BAT "
                                //+ ", INTERVENTION.ESC "
                                //+ ", INTERVENTION.ETG "
                                + ", INTERVENTION.TELFIXE as \"TELEPHONEFIXE\""
                                + ", INTERVENTION.TELMOBILE as \"TELEPHONEMOBILE\""
                                + ", INTERVENTION.NUMINTERVENTION as \"NINTERVENTION\""
                                + ", NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) as \"DATE\""
                                + ", INTERVENTION_CR_TECH.MOTIFINTER_CL as \"MOTIF\""
                                + ", INTERVENTION.STATUT as \"ETAT\" "
                                + ", INTERVENTION_CR_TECH.CRINTER_CL "
                                + ", INTERVENTION_CR_TECH.MOTIFINTER "
                                + "FROM INTERVENTION, IMMEUBLE, INTERVENTION_CR_TECH "
                                + "WHERE INTERVENTION.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE  "
                                + "AND INTERVENTION.PKINTERVENTION = INTERVENTION_CR_TECH.FKINTERVENTION  "
                                + "AND ((INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer'))  "
                                + "     AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN')  "
                                //+ "	 AND (IMMEUBLE.FKCLIENT = :FKCLIENT)  "
                                + "	 AND (IMMEUBLE.FKCLIENT IN (SELECT PKCLIENT FROM CLIENT WHERE      NVL(CLIENT.ACTIF, 'O') <> 'N' start with CLIENT.PKCLIENT = :FKCLIENT connect BY FKCLIENT = prior PKCLIENT))  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 OR (INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer')) "
                                + "	 AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN') "
                                + "	 AND (IMMEUBLE.FKCLIENT = :FKCLIENT)  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 AND EXISTS  "
                                + "	     (SELECT PKHISTOINTERVENTION "
                                + "		  FROM HISTOINTERVENTION "
                                + "		  WHERE (INTERVENTION.PKINTERVENTION = FKINTERVENTION) AND (STATUT LIKE 'Clôturé%')) "
                                + "    ) "
                                + "and not (INTERVENTION.STATUT in ('Demande reçue', 'A reprogrammer', 'En attente de planification', 'En attente de qualification') and INTERVENTION.ORIGINEINTERVENTION in ('Relevé', 'Service Relevé') ) " //ADA 2018-12-21
                                + "ORDER BY "
                                + "INTERVENTION.TEMPOCCUPANT, INTERVENTION.NUMINTERVENTION, INTERVENTION_CR_TECH.MOTIFINTER ";

                query = query.Replace(":FKCLIENT", fk.ToString());
            }
            else if (destinationType == "IMMEUBLE")
            {
                query = "SELECT "
                                + "IMMEUBLE.PKIMMEUBLE, "//*** AJOUTE ESPACE CLIENT //***
                                + "INTERVENTION.TEMPOCCUPANT AS NOM "
                                + ", INTERVENTION.IDIMMEUBLE AS REFIMM  "
                                + ", INTERVENTION.FKLOGEMENT "
                                + ", INTERVENTION.BAT AS BATIMENT "
                                + ", INTERVENTION.ESC AS ESCALIER "
                                + ", INTERVENTION.ETG AS ETAGE "
                                + ", INTERVENTION.TELFIXE as \"TELEPHONEFIXE\""
                                + ", INTERVENTION.TELMOBILE as \"TELEPHONEMOBILE\""
                                + ", INTERVENTION.NUMINTERVENTION as \"NINTERVENTION\""
                                + ", NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) as \"DATE\""
                                + ", INTERVENTION_CR_TECH.MOTIFINTER_CL as \"MOTIF\""
                                + ", INTERVENTION.STATUT as \"ETAT\" "
                                + ", INTERVENTION_CR_TECH.CRINTER_CL "
                                + ", INTERVENTION_CR_TECH.MOTIFINTER "
                                + "FROM INTERVENTION, IMMEUBLE, INTERVENTION_CR_TECH "
                                + "WHERE INTERVENTION.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE  "
                                + "AND INTERVENTION.PKINTERVENTION = INTERVENTION_CR_TECH.FKINTERVENTION  "
                                + "AND ((INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer'))  "
                                + "     AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN')  "
                                + "	 AND (IMMEUBLE.PKIMMEUBLE = :PKIMMEUBLE)  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 OR (INTERVENTION.STATUT NOT IN ('Annulé', 'A reprogrammer')) "
                                + "	 AND (NVL(INTERVENTION.DATE3, NVL(INTERVENTION.DATE2, INTERVENTION.DATE1)) BETWEEN ':DATE_DEBUT' AND ':DATE_FIN') "
                                + "	 AND (IMMEUBLE.PKIMMEUBLE = :PKIMMEUBLE)  "
                                + "	 AND (INTERVENTION.DATECOURRIER >= '01/06/2016')  "
                                + "	 AND EXISTS  "
                                + "	     (SELECT PKHISTOINTERVENTION "
                                + "		  FROM HISTOINTERVENTION "
                                + "		  WHERE (INTERVENTION.PKINTERVENTION = FKINTERVENTION) AND (STATUT LIKE 'Clôturé%')) "
                                + "    ) "
                                + "and not (INTERVENTION.STATUT in ('Demande reçue', 'A reprogrammer', 'En attente de planification', 'En attente de qualification') and INTERVENTION.ORIGINEINTERVENTION in ('Relevé', 'Service Relevé') ) " //ADA 2018-12-21
                                + "ORDER BY "
                                + "INTERVENTION.TEMPOCCUPANT, INTERVENTION.NUMINTERVENTION, INTERVENTION_CR_TECH.MOTIFINTER ";

                query = query.Replace(":PKIMMEUBLE", fk.ToString());
            }

            query = query
                .Replace(":DATE_DEBUT", dateDebut.ToString("dd/MM/yyyy"))
                .Replace(":DATE_FIN", dateFin.ToString("dd/MM/yyyy"))
                ;

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable2(query);

            //*** ESPACE CLIENT *** : on ne garde que les rows immeubles du gestionnaire
            if (destinationType == "GESTIONNAIRE")
            {
                DataRowCollection drcImmGest = WS_DBUtils.utils_LER.DBSelectRows(WS_Common.GetQueryImmeubles("pkimmeuble", "U", pkUser));
                HashSet<long> pksGestionnaire = new HashSet<long>();
                foreach (DataRow drImmeuble in drcImmGest)
                    pksGestionnaire.Add(Convert.ToInt64(drImmeuble["pkimmeuble"].ToString()));

                DataTable dt2 = dt.Clone();
                foreach (DataRow dr in dt.Rows)
                {
                    if (pksGestionnaire.Contains(Convert.ToInt64(dr["PKIMMEUBLE"].ToString())))
                        dt2.ImportRow(dr);
                }
                dt = dt2;
            }
            //*** ***

            dt.Columns.Add("BAT", typeof(string));
            dt.Columns.Add("ESC", typeof(string));
            dt.Columns.Add("ETG", typeof(string));
            dt.Columns.Add("PASSAGELE", typeof(string));
            dt.Columns.Add("REFLOGEMENT");
            dt.Columns.Add("FLUIDE");
            dt.Columns.Add("NCOMPTEUR");
            dt.Columns.Add("COMPTERENDU");
            dt.Columns.Add("NUMBEROSA");
            //dt.Columns.Add("REFIMM");

            for (int index = 0; index < dt.Rows.Count; index++)
            {
                if (!string.IsNullOrEmpty(dt.Rows[index]["FKLOGEMENT"].ToString()))
                {
                    dt.Rows[index]["REFLOGEMENT"] = GetCodeGestionnaireFromLogement(dt.Rows[index]["FKLOGEMENT"].ToString());
                }

                if (dt.Rows[index]["MOTIF"].ToString().ToLower().Contains("eau chaude"))
                {
                    dt.Rows[index]["FLUIDE"] = "CHAUD";
                }
                else if (dt.Rows[index]["MOTIF"].ToString().ToLower().Contains("eau froide"))
                {
                    dt.Rows[index]["FLUIDE"] = "FROID";
                }

                dt.Rows[index]["BAT"] = dt.Rows[index]["BATIMENT"].ToString();
                dt.Rows[index]["ESC"] = dt.Rows[index]["ESCALIER"].ToString();
                dt.Rows[index]["ETG"] = dt.Rows[index]["ETAGE"].ToString();
                dt.Rows[index]["PASSAGELE"] = Convert.ToDateTime(dt.Rows[index]["DATE"].ToString()).ToString("dd/MM/yyyy");

                string[] input = dt.Rows[index]["MOTIFINTER"].ToString().Split(' ');
                if (input.Length > 9)
                {
                    if (input[8] == ":")
                    {
                        dt.Rows[index]["NCOMPTEUR"] = input[7].Replace("(", "").Replace(")", "") + " CODE 72";
                    }
                    else if (input[7] == ":")
                    {
                        dt.Rows[index]["NCOMPTEUR"] = input[6].Replace("(", "").Replace(")", "")
                            + " " + input[3];
                    }
                    else
                    {
                        dt.Rows[index]["NCOMPTEUR"] = "";
                    }
                }

                string statut = dt.Rows[index]["ETAT"].ToString();
                if ((statut == "Clôturée - Achevée")
                    || (statut == "Facturée")
                    )
                {
                    statut = "Réalisée";
                }
                else if ((statut.Length > "Clôturée - ".Length)
                    && (statut.Substring(0, "Clôturée - ".Length) == "Clôturée - "))
                {
                    statut = statut.Replace("Clôturée - ", "");
                }
                dt.Rows[index]["ETAT"] = statut.Replace("Pb ", "Problème ");

                string compteRendu = "";
                if (dt.Rows[index]["ETAT"].ToString().Trim() == "Planifiée")
                {
                    compteRendu = "Passage prévu le " + Convert.ToDateTime(dt.Rows[index]["PASSAGELE"].ToString()).ToString("dd/MM/yyyy");
                }
                else
                {
                    DataRow trad = WS_DBUtils.utils_LER.DBSelectRow("SELECT RESULTAT " +
                        " FROM INTERVENTION_STATUT " +
                        " WHERE STATUTINTER = " + dt.Rows[index]["ETAT"].ToString().QuotedStr());
                    if ((trad != null)
                        && (trad["RESULTAT"].ToString() != ""))
                    {
                        compteRendu = trad["RESULTAT"].ToString();
                    }
                    else
                    {
                        compteRendu = dt.Rows[index]["CRINTER_CL"].ToString();
                    }
                }
                dt.Rows[index]["COMPTERENDU"] = compteRendu;

            }
            dt.Columns.Remove("FKLOGEMENT");

            //*** ESPACE CLIENT***
            dt.Columns["REFLOGEMENT"].SetOrdinal(0);
            dt.Columns["REFLOGEMENT"].ColumnName = "REF";

            dt.Columns["NOM"].SetOrdinal(1);
            dt.Columns["BAT"].SetOrdinal(2);
            dt.Columns["ESC"].SetOrdinal(3);
            dt.Columns["ETG"].SetOrdinal(4);

            dt.Columns["TELEPHONEFIXE"].SetOrdinal(5);
            dt.Columns["TELEPHONEFIXE"].ColumnName = "TEL FIXE";

            dt.Columns["TELEPHONEMOBILE"].SetOrdinal(6);
            dt.Columns["TELEPHONEMOBILE"].ColumnName = "TEL MOBILE";

            dt.Columns["NINTERVENTION"].SetOrdinal(7);
            dt.Columns["NINTERVENTION"].ColumnName = "INTERVENTION";

            dt.Columns["ETAT"].SetOrdinal(8);
            dt.Columns["ETAT"].ColumnName = "STATUT";

            dt.Columns["PASSAGELE"].SetOrdinal(9);
            dt.Columns["PASSAGELE"].ColumnName = "PASSAGE LE";

            dt.Columns["MOTIF"].SetOrdinal(10);

            dt.Columns.Add("ETAT");
            dt.Columns["ETAT"].SetOrdinal(11);

            dt.Columns["NCOMPTEUR"].SetOrdinal(12);
            dt.Columns["NCOMPTEUR"].ColumnName = "N° COMPTEUR";

            dt.Columns["FLUIDE"].SetOrdinal(13);

            dt.Columns["COMPTERENDU"].SetOrdinal(14);
            dt.Columns["COMPTERENDU"].ColumnName = "COMPTE RENDU";

            dt.Columns["NUMBEROSA"].SetOrdinal(15);
            dt.Columns["NUMBEROSA"].ColumnName = "N° RDV SERVICE";

            dt.Columns["REFIMM"].SetOrdinal(16);

            dt.Columns.Remove("CRINTER_CL");
            dt.Columns.Remove("MOTIFINTER");
            dt.Columns.Remove("PKIMMEUBLE");
            dt.Columns.Remove("BATIMENT");
            dt.Columns.Remove("ESCALIER");
            dt.Columns.Remove("ETAGE");
            dt.Columns.Remove("DATE");

            if (dt.Rows.Count == 0)//pour avoir l'entete si pas de rows
            {
                var emptyData = new DataTable();

                foreach (DataColumn column in dt.Columns)
                {
                    emptyData.Columns.Add(new DataColumn(column.ColumnName));
                }
                emptyData.Rows.Add(emptyData.NewRow());
                dt = emptyData;
            }
            //*** ***

            return dt;
#endif
        }

        /// <summary>
        /// Récupère le code getionnaire à partir du logement
        /// </summary>
        /// <param name="fkLogement">Clef pour le logement</param>
        /// <returns>Le code gestionnaire</returns>
        public static string GetCodeGestionnaireFromLogement(string fkLogement)
        {
            string sqlQueryInfo = "SELECT nvl(CODELOGEGESTIO,' ') CODELOGEGESTIO "
                    + "FROM OCCUPANT WHERE FKLOGEMENT = " + fkLogement + " "
                    + "AND ROWNUM=1 "  // la première ligne
                    + "ORDER BY DATEARRIVEE desc"
                    ;
            return WS_DBUtils.utils_LER.DBSelect(sqlQueryInfo).Trim();
        }
    }

    public class AvancementClients
    {
        internal long pkImmeuble = -1;
        internal int nbInterventionsRealisees = 0;
        internal int nbInterventionsEnCours = 0;
        internal int nbInterventionsActionclient = 0;

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            AvancementClients objAsPart = obj as AvancementClients;
            return (this.pkImmeuble == objAsPart.pkImmeuble);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
    public class ImmeublesInterventionsList
    {
        private List<AvancementClients> immeublesInterventions_ = new List<AvancementClients>();

        public void Clear()
        {
            immeublesInterventions_.Clear();
        }

        public List<AvancementClients> GetList()
        {
            return immeublesInterventions_;
        }

        internal void AddInterventionsRealisees(long pkImmeuble, int p)
        {
            AvancementClients item = new AvancementClients();
            item.pkImmeuble = pkImmeuble;
            int indexImmeuble = immeublesInterventions_.IndexOf(item);
            if (indexImmeuble == -1)
            {
                item.nbInterventionsRealisees = p;
                immeublesInterventions_.Add(item);
            }
            else
            {
                immeublesInterventions_[indexImmeuble].nbInterventionsRealisees += p;
            }
        }

        internal void AddInterventionsEnCours(long pkImmeuble, int p)
        {
            AvancementClients item = new AvancementClients();
            item.pkImmeuble = pkImmeuble;
            int indexImmeuble = immeublesInterventions_.IndexOf(item);
            if (indexImmeuble == -1)
            {
                item.nbInterventionsEnCours = p;
                immeublesInterventions_.Add(item);
            }
            else
            {
                immeublesInterventions_[indexImmeuble].nbInterventionsEnCours += p;
            }
        }

        internal void AddInterventionsActionclient(long pkImmeuble, int p)
        {
            AvancementClients item = new AvancementClients();
            item.pkImmeuble = pkImmeuble;
            int indexImmeuble = immeublesInterventions_.IndexOf(item);
            if (indexImmeuble == -1)
            {
                item.nbInterventionsActionclient = p;
                immeublesInterventions_.Add(item);
            }
            else
            {
                immeublesInterventions_[indexImmeuble].nbInterventionsActionclient += p;
            }
        }

        internal string GetInterventionsRealisees()
        {
            int nbInterventionsRealisees = 0;
            foreach (AvancementClients immeublesIntervention_ in immeublesInterventions_)
            {
                nbInterventionsRealisees += immeublesIntervention_.nbInterventionsRealisees;
            }
            return nbInterventionsRealisees.ToString();
        }

        internal string GetInterventionsEnCours()
        {
            int nbInterventionsEnCours = 0;
            foreach (AvancementClients immeublesIntervention_ in immeublesInterventions_)
            {
                nbInterventionsEnCours += immeublesIntervention_.nbInterventionsEnCours;
            }
            return nbInterventionsEnCours.ToString();
        }

        internal string GetInterventionsActionclient()
        {
            int nbInterventionsActionclient = 0;
            foreach (AvancementClients immeublesIntervention_ in immeublesInterventions_)
            {
                nbInterventionsActionclient += immeublesIntervention_.nbInterventionsActionclient;
            }
            return nbInterventionsActionclient.ToString();
        }
    }
}
