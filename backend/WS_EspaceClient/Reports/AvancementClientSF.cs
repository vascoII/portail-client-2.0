using System;
using System.Collections.Generic;
using System.Data;

namespace Techem.Webservices.WS_EspaceClient.Reports
{

    public static class AvancementClientSF
    {
        //private const string INTER_STATUT_CLOT_PB_TECH = "Probleme technique";
        //private const string INTER_STATUT_PLANIF = "Planifie";
        //private const string INTER_STATUT_ATTENTEPLANIF = "planification";
        //private const string INTER_STATUT_ATTR = "Attribue";
        //private const string INTER_STATUT_REALI = "Realise";
        //private const string INTER_STATUT_REALI = "Réalisé";
        /// <summary>
        /// Rcupère la datatable pour l'initialisation de la grid control
        /// </summary>
        /// <param name="fk">Clef primaire de l'immeuble ou client (en fonction du paramètre destinationType)</param>
        /// <param name="dateDebut">Date de début de la période à analyser</param>
        /// <param name="dateFin">Date de fin de la période à analyser</param>
        /// <param name="destinationType">Type de destination client (RD_CLIENT) ou immeuble (RD_IMMEUBLE)</param>
        public static DataTable GetDataSource(long fk, 
            DateTime dateDebut, DateTime dateFin, 
            string destinationType)
        {
            //WEBTODO :
            // - client remplace par web_client
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

            string sqlFilter = string.Empty;

            switch (destinationType)
            {
                case "CLIENT":

                    DataTable sousClients = WS_DBUtils.utils_LER.DBSelectTable(
                    $@"SELECT pkclient 
                    FROM web_client 
                    START WITH web_client.pkclient = {fk.ToString()}
                    CONNECT BY web_client.fkclient = PRIOR pkclient");

                    sqlFilter = " ((Account.PKler__c = 'CLI_" + fk.ToString() + "') ";
                    foreach (DataRow r in sousClients.Rows)
                        sqlFilter += $@"or (Account.PKler__c = 'CLI_{r["PKCLIENT"].ToString()}') ";
                    sqlFilter += ") ";

                    break;
                case "IMMEUBLE":
                    sqlFilter = $@" Immeuble__r.PKLer__c = 'IMM_{fk.ToString()}' ";
                    break;

                case "GESTIONNAIRE":

                    string sql = WS_Common.GetQueryImmeubles("PKIMMEUBLE", "U", pkUser);
                    DataRowCollection drcImmeubles = WS_DBUtils.utils_LER.DBSelectRows(sql);
                    string pkImmeubles = string.Empty;
                    foreach (DataRow drImmeuble in drcImmeubles)
                    {
                        pkImmeubles += "'IMM_" + drImmeuble["PKIMMEUBLE"].ToString() + "', ";
                    }

                    pkImmeubles = pkImmeubles.Substring(0, pkImmeubles.Length - 2);

                    sqlFilter = " Immeuble__r.PKLer__c IN (" + pkImmeubles + ")";
                    break;
                default:
                    break;
            }
            string soql = "Select Id, WorkOrderNumber, Status, CompteRenduIntervention__c, CompteRenduDetaille__c , Immeuble__r.PKLer__c, Immeuble__r.IdentifiantImmeuble__c, " +
                "  Contact.Name, Contact.MobilePhone, Contact.Phone, " +
                " logement__r.Pkler__c, Logement__r.CodeGestionnaire__c, logement__r.Batiment__r.Numero__c, " +
                " logement__r.Escalier__c, logement__r.Etage__c,  " +
                " (Select Id, AppointmentNumber, tolabel(Status), SchedEndTime, SchedStartTime, DueDate FRom ServiceAppointments ), " +
                " (Select tolabel(Status), WorkType.Name, Emplacement__c, Asset.Pkler__c, Asset.TypeFluide__c, tolabel(MotifExecution__c), tolabel(MotifNonExecution__c), Asset.SerialNumber FROM WorkOrderLineItems) " +
                " FROM WorkOrder " +
                " WHERE " + sqlFilter +
                " AND WorkOrder.CreatedDate >=" + dateDebut.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") + " " +
                " AND WorkOrder.CreatedDate <=" + dateFin.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") + " " +
                " AND workorder.Maintenance__c = true " +
                " AND Immeuble__r.PKLer__c != null " +
                " order by Immeuble__r.IdentifiantImmeuble__c, logement__r.Pkler__c, Contact.Name";

            DataTable dt = new DataTable();
            dt.Columns.Add("NUMINTERVENTION");
            dt.Columns.Add("NUMBEROSA");
            dt.Columns.Add("TEMPOCCUPANT");
            dt.Columns.Add("TELEPHONEFIXE");
            dt.Columns.Add("TELEPHONEMOBILE");
            dt.Columns.Add("FKIMMEUBLE");
            dt.Columns.Add("REFIMM");
            dt.Columns.Add("BAT", typeof(string));
            dt.Columns.Add("ESC", typeof(string));
            dt.Columns.Add("ETG", typeof(string));
            dt.Columns.Add("FKLOGEMENT");
            dt.Columns.Add("STATUT");
            dt.Columns.Add("MOTIF");
            dt.Columns.Add("CRINTER");
            dt.Columns.Add("NUMEROSERIE");
            dt.Columns.Add("TYPEFLUIDE");
            dt.Columns.Add("EMP");
            dt.Columns.Add("CODEGESTIO");
            dt.Columns.Add("DATES");
            dt.Columns.Add("ETAT");

            DataTable workOrders = WS_DBUtils.utils_SF.DBSelectTable(soql);

            foreach (DataRow workOrder in workOrders.Rows)
            {

                string dates = "";
                string saNumber = "";
                string statut = "";
                DataTable sapps = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(workOrder["_ServiceAppointments_records"].ToString());
                foreach (DataRow sapp in sapps.Rows)
                {
                    //if (workOrder["_Status"].ToString() == INTER_STATUT_PLANIF || workOrder["_Status"].ToString() == INTER_STATUT_ATTR)
                    //{
                    if ((sapp["_SchedStartTime"] != DBNull.Value) && (sapp["_SchedStartTime"].ToString() != ""))
                        dates +=
                            Environment.NewLine + Convert.ToDateTime(sapp["_SchedStartTime"].ToString()).ToShortDateString(); /*+ " : " + */
                    //}
                    //else
                    //{
                    //dates = sapp["_Status"].ToString();
                    //}
                    statut = sapp["_Status"].ToString();
                    saNumber = sapp["_AppointmentNumber"].ToString();
                }
                if (dates.StartsWith(Environment.NewLine))
                    dates = dates.TrimStart('\r', '\n');

                DataTable workOrderLineItems = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(workOrder["_WorkOrderLineItems_records"].ToString());
                foreach (DataRow workOrderLineItem in workOrderLineItems.Rows)
                {
                    DataRow nr = dt.NewRow();
                    nr["NUMINTERVENTION"] = workOrder["_WorkOrderNumber"].ToString();
                    if (workOrders.Columns.IndexOf("_Contact_Name") > -1)
                        nr["TEMPOCCUPANT"] = WS_Common.AnonymizeContactName(workOrder["_Contact_Name"].ToString());
                    if (nr["TEMPOCCUPANT"].ToString() == "")
                        nr["TEMPOCCUPANT"] = " ";
                    nr["FKIMMEUBLE"] = workOrder["_Immeuble__r_PKLer__c"].ToString().Replace("IMM_", "");
                    nr["REFIMM"] = workOrder["_Immeuble__r_IdentifiantImmeuble__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Batiment__r_Numero__c") > -1)
                        nr["BAT"] = workOrder["_logement__r_Batiment__r_Numero__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Escalier__c") > -1)
                        nr["ESC"] = workOrder["_logement__r_Escalier__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Etage__c") > -1)
                        nr["ETG"] = workOrder["_logement__r_Etage__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Pkler__c") > -1)
                        nr["FKLOGEMENT"] = workOrder["_logement__r_Pkler__c"].ToString().Replace("LOG_", "");

                    string serialNumber = string.Empty;
                    if (workOrderLineItems.Columns.IndexOf("_Asset_SerialNumber") > -1)
                        serialNumber = workOrderLineItem["_Asset_SerialNumber"].ToString();
                    nr["MOTIF"] = workOrderLineItem["_WorkType_Name"].ToString() + "(" + serialNumber + ")";

                    nr["ETAT"] = workOrderLineItem["_Status"].ToString() + " : ";
                    nr["ETAT"] += Environment.NewLine + workOrderLineItem["_MotifNonExecution__c"].ToString() + workOrderLineItem["_MotifExecution__c"].ToString();
                    nr["CRINTER"] = workOrder["_CompteRenduIntervention__c"].ToString();
                    //nr["CRINTER"] = workOrderLineItem["_MotifExecution__c"].ToString();
                    if (workOrderLineItems.Columns.IndexOf("_Asset_TypeFluide__c") > -1)
                        nr["TYPEFLUIDE"] = workOrderLineItem["_Asset_TypeFluide__c"].ToString();
                    else
                        nr["TYPEFLUIDE"] = " ";
                    //nr["CRINTER"] = workOrderLineItem["_MotifExecution__c"].ToString();
                    //if (nr["STATUT"].ToString() != INTER_STATUT_REALI)
                    //    nr["CRINTER"] = workOrderLineItem["_MotifNonExecution__c"].ToString();
                    nr["NUMEROSERIE"] = serialNumber;
                    nr["EMP"] = workOrderLineItem["_Emplacement__c"].ToString();
                    if (workOrders.Columns.IndexOf("_Logement__r_CodeGestionnaire__c") > -1)
                        nr["CODEGESTIO"] = workOrder["_Logement__r_CodeGestionnaire__c"].ToString();
                    if (nr["CODEGESTIO"].ToString() == "")
                        nr["CODEGESTIO"] = " ";
                    nr["DATES"] = dates;
                    nr["NUMBEROSA"] = saNumber;
                    nr["STATUT"] = statut;
                    dt.Rows.Add(nr);
                }
            }

            //dt.Columns.Add("REFLOGEMENT");
            dt.Columns.Add("FLUIDE");
            //dt.Columns.Add("NCOMPTEUR");
            dt.Columns.Add("COMPTERENDU");

            dt.Columns["TEMPOCCUPANT"].ColumnName = "NOM";
            //dt.Columns["STATUT"].ColumnName = "ETAT";
            dt.Columns["CRINTER"].ColumnName = "CRINTER_CL";
            dt.Columns["MOTIF"].ColumnName = "MOTIF";

            for (int index = 0; index < dt.Rows.Count; index++)
            {
                //if (!string.IsNullOrEmpty(dt.Rows[index]["FKLOGEMENT"].ToString()))
                //{
                //    dt.Rows[index]["REFLOGEMENT"] = GetCodeGestionnaireFromLogement(dt.Rows[index]["FKLOGEMENT"].ToString());
                //}

                if (dt.Rows[index]["TYPEFLUIDE"].ToString().ToLower().Contains("eau chaude"))
                {
                    dt.Rows[index]["FLUIDE"] = "CHAUD";
                }
                else if (dt.Rows[index]["TYPEFLUIDE"].ToString().ToLower().Contains("eau froide"))
                {
                    dt.Rows[index]["FLUIDE"] = "FROID";
                }

                //dt.Rows[index]["NCOMPTEUR"] = dt.Rows[index]["NUMEROSERIE"].ToString();

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

                string compteRendu;
                if (dt.Rows[index]["ETAT"].ToString().Trim() == "Planifiée")
                {
                    compteRendu = "Passage prévu le " + Convert.ToDateTime(dt.Rows[index]["PASSAGELE"].ToString()).ToString("dd/MM/yyyy");
                }
                else
                {
                    compteRendu = dt.Rows[index]["CRINTER_CL"].ToString();
                }
                dt.Rows[index]["COMPTERENDU"] = compteRendu;

            }
            dt.Columns.Remove("FKLOGEMENT");
            dt.Columns.Remove("EMP");
            dt.Columns.Remove("FKIMMEUBLE");
            dt.Columns.Remove("TYPEFLUIDE");

            //*** ESPACE CLIENT***
            dt.Columns["CODEGESTIO"].SetOrdinal(0);
            dt.Columns["CODEGESTIO"].ColumnName = "REF";

            dt.Columns["NOM"].SetOrdinal(1);
            dt.Columns["BAT"].SetOrdinal(2);
            dt.Columns["ESC"].SetOrdinal(3);
            dt.Columns["ETG"].SetOrdinal(4);

            dt.Columns["TELEPHONEFIXE"].SetOrdinal(5);
            dt.Columns["TELEPHONEFIXE"].ColumnName = "TEL FIXE";

            dt.Columns["TELEPHONEMOBILE"].SetOrdinal(6);
            dt.Columns["TELEPHONEMOBILE"].ColumnName = "TEL MOBILE";

            dt.Columns["NUMINTERVENTION"].SetOrdinal(7);
            dt.Columns["NUMINTERVENTION"].ColumnName = "INTERVENTION";

            dt.Columns["STATUT"].SetOrdinal(8);

            dt.Columns["DATES"].SetOrdinal(9);
            dt.Columns["DATES"].ColumnName = "PASSAGE LE";

            dt.Columns["MOTIF"].SetOrdinal(10);

            dt.Columns["ETAT"].SetOrdinal(11);

            dt.Columns["NUMEROSERIE"].SetOrdinal(12);
            dt.Columns["NUMEROSERIE"].ColumnName = "N° COMPTEUR";

            dt.Columns["FLUIDE"].SetOrdinal(13);

            dt.Columns["COMPTERENDU"].SetOrdinal(14);
            dt.Columns["COMPTERENDU"].ColumnName = "COMPTE RENDU";

            dt.Columns["NUMBEROSA"].SetOrdinal(15);
            dt.Columns["NUMBEROSA"].ColumnName = "N° RDV SERVICE";

            dt.Columns["REFIMM"].SetOrdinal(16);

            dt.Columns.Remove("CRINTER_CL");
            //dt.Columns.Remove("MOTIFINTER");

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

            string sqlFilter = string.Empty;

            switch (destinationType)
            {
                case "CLIENT":

                    DataTable sousClients = WS_DBUtils.utils_LER.DBSelectTable(
                    "SELECT PKCLIENT FROM CLIENT " +
                    " START WITH CLIENT.PKCLIENT = " + fk.ToString() + " " +
                    " CONNECT BY CLIENT.FKCLIENT = PRIOR PKCLIENT");

                    sqlFilter = " ((Account.PKler__c = 'CLI_" + fk.ToString() + "') ";
                    foreach (DataRow r in sousClients.Rows)
                        sqlFilter += "or (Account.PKler__c = 'CLI_" + r["PKCLIENT"].ToString() + "') ";
                    sqlFilter += ") ";

                    break;
                case "RD_IMMEUBLE":
                    sqlFilter = " Immeuble__r.PKLer__c = 'IMM_" + fk.ToString() + "' ";
                    break;

                case "GESTIONNAIRE":

                    string sql = WS_Common.GetQueryImmeubles("PKIMMEUBLE", "U", pkUser);
                    DataRowCollection drcImmeubles = WS_DBUtils.utils_LER.DBSelectRows(sql);
                    string pkImmeubles = string.Empty;
                    foreach (DataRow drImmeuble in drcImmeubles)
                    {
                        pkImmeubles += "'IMM_" + drImmeuble["PKIMMEUBLE"].ToString() + "', ";
                    }

                    pkImmeubles = pkImmeubles.Substring(0, pkImmeubles.Length - 2);

                    sqlFilter = " Immeuble__r.PKLer__c IN (" + pkImmeubles + ")";
                    break;
                default:
                    break;
            }
            string soql = "Select Id, WorkOrderNumber, Status, CompteRenduIntervention__c, CompteRenduDetaille__c , Immeuble__r.PKLer__c, Immeuble__r.IdentifiantImmeuble__c, " +
                "  Contact.Name, Contact.MobilePhone, Contact.Phone, " +
                " logement__r.Pkler__c, Logement__r.CodeGestionnaire__c, logement__r.Batiment__r.Numero__c, " +
                " logement__r.Escalier__c, logement__r.Etage__c,  " +
                " (Select Id, AppointmentNumber, tolabel(Status), SchedEndTime, SchedStartTime, DueDate FRom ServiceAppointments ), " +
                " (Select tolabel(Status), WorkType.Name, Emplacement__c, Asset.Pkler__c, Asset.TypeFluide__c, tolabel(MotifExecution__c), tolabel(MotifNonExecution__c), Asset.SerialNumber FROM WorkOrderLineItems) " +
                " FROM WorkOrder " +
                " WHERE " + sqlFilter +
                " AND WorkOrder.CreatedDate >=" + dateDebut.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") + " " +
                " AND WorkOrder.CreatedDate <=" + dateFin.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") + " " +
                " AND workorder.Maintenance__c = true " +
                " AND Immeuble__r.PKLer__c != null " +
                " order by Immeuble__r.IdentifiantImmeuble__c, logement__r.Pkler__c, Contact.Name";

            DataTable dt = new DataTable();
            dt.Columns.Add("NUMINTERVENTION");
            dt.Columns.Add("NUMBEROSA");
            dt.Columns.Add("TEMPOCCUPANT");
            dt.Columns.Add("TELEPHONEFIXE");
            dt.Columns.Add("TELEPHONEMOBILE");
            dt.Columns.Add("FKIMMEUBLE");
            dt.Columns.Add("REFIMM");
            dt.Columns.Add("BAT", typeof(string));
            dt.Columns.Add("ESC", typeof(string));
            dt.Columns.Add("ETG", typeof(string));
            dt.Columns.Add("FKLOGEMENT");
            dt.Columns.Add("STATUT");
            dt.Columns.Add("MOTIF");
            dt.Columns.Add("CRINTER");
            dt.Columns.Add("NUMEROSERIE");
            dt.Columns.Add("TYPEFLUIDE");
            dt.Columns.Add("EMP");
            dt.Columns.Add("CODEGESTIO");
            dt.Columns.Add("DATES");
            dt.Columns.Add("ETAT");

            DataTable workOrders = WS_DBUtils.utils_SF.DBSelectTable(soql);

            foreach (DataRow workOrder in workOrders.Rows)
            {

                string dates = "";
                string saNumber = "";
                string statut = "";
                DataTable sapps = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(workOrder["_ServiceAppointments_records"].ToString());
                foreach (DataRow sapp in sapps.Rows)
                {
                    //if (workOrder["_Status"].ToString() == INTER_STATUT_PLANIF || workOrder["_Status"].ToString() == INTER_STATUT_ATTR)
                    //{
                    if ((sapp["_SchedStartTime"] != DBNull.Value) && (sapp["_SchedStartTime"].ToString() != ""))
                        dates +=
                            Environment.NewLine + Convert.ToDateTime(sapp["_SchedStartTime"].ToString()).ToShortDateString(); /*+ " : " + */
                    //}
                    //else
                    //{
                    //dates = sapp["_Status"].ToString();
                    //}
                    statut = sapp["_Status"].ToString();
                    saNumber = sapp["_AppointmentNumber"].ToString();
                }
                if (dates.StartsWith(Environment.NewLine))
                    dates = dates.TrimStart('\r', '\n');

                DataTable workOrderLineItems = WS_DBUtils.utils_SF.JSONColumnValueToDatatable(workOrder["_WorkOrderLineItems_records"].ToString());
                foreach (DataRow workOrderLineItem in workOrderLineItems.Rows)
                {
                    DataRow nr = dt.NewRow();
                    nr["NUMINTERVENTION"] = workOrder["_WorkOrderNumber"].ToString();
                    if (workOrders.Columns.IndexOf("_Contact_Name") > -1)
                        nr["TEMPOCCUPANT"] = WS_Common.AnonymizeContactName(workOrder["_Contact_Name"].ToString());
                    if (nr["TEMPOCCUPANT"].ToString() == "")
                        nr["TEMPOCCUPANT"] = " ";
                    nr["FKIMMEUBLE"] = workOrder["_Immeuble__r_PKLer__c"].ToString().Replace("IMM_", "");
                    nr["REFIMM"] = workOrder["_Immeuble__r_IdentifiantImmeuble__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Batiment__r_Numero__c") > -1)
                        nr["BAT"] = workOrder["_logement__r_Batiment__r_Numero__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Escalier__c") > -1)
                        nr["ESC"] = workOrder["_logement__r_Escalier__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Etage__c") > -1)
                        nr["ETG"] = workOrder["_logement__r_Etage__c"].ToString();
                    if (workOrders.Columns.IndexOf("_logement__r_Pkler__c") > -1)
                        nr["FKLOGEMENT"] = workOrder["_logement__r_Pkler__c"].ToString().Replace("LOG_", "");

                    string serialNumber = string.Empty;
                    if (workOrderLineItems.Columns.IndexOf("_Asset_SerialNumber") > -1)
                        serialNumber = workOrderLineItem["_Asset_SerialNumber"].ToString();
                    nr["MOTIF"] = workOrderLineItem["_WorkType_Name"].ToString() + "(" + serialNumber + ")";

                    nr["ETAT"] = workOrderLineItem["_Status"].ToString() + " : ";
                    nr["ETAT"] += Environment.NewLine + workOrderLineItem["_MotifNonExecution__c"].ToString() + workOrderLineItem["_MotifExecution__c"].ToString();
                    nr["CRINTER"] = workOrder["_CompteRenduIntervention__c"].ToString();
                    //nr["CRINTER"] = workOrderLineItem["_MotifExecution__c"].ToString();
                    if (workOrderLineItems.Columns.IndexOf("_Asset_TypeFluide__c") > -1)
                        nr["TYPEFLUIDE"] = workOrderLineItem["_Asset_TypeFluide__c"].ToString();
                    else
                        nr["TYPEFLUIDE"] = " ";
                    //nr["CRINTER"] = workOrderLineItem["_MotifExecution__c"].ToString();
                    //if (nr["STATUT"].ToString() != INTER_STATUT_REALI)
                    //    nr["CRINTER"] = workOrderLineItem["_MotifNonExecution__c"].ToString();
                    nr["NUMEROSERIE"] = serialNumber;
                    nr["EMP"] = workOrderLineItem["_Emplacement__c"].ToString();
                    if (workOrders.Columns.IndexOf("_Logement__r_CodeGestionnaire__c") > -1)
                        nr["CODEGESTIO"] = workOrder["_Logement__r_CodeGestionnaire__c"].ToString();
                    if (nr["CODEGESTIO"].ToString() == "")
                        nr["CODEGESTIO"] = " ";
                    nr["DATES"] = dates;
                    nr["NUMBEROSA"] = saNumber;
                    nr["STATUT"] = statut;
                    dt.Rows.Add(nr);
                }
            }

            //dt.Columns.Add("REFLOGEMENT");
            dt.Columns.Add("FLUIDE");
            //dt.Columns.Add("NCOMPTEUR");
            dt.Columns.Add("COMPTERENDU");

            dt.Columns["TEMPOCCUPANT"].ColumnName = "NOM";
            //dt.Columns["STATUT"].ColumnName = "ETAT";
            dt.Columns["CRINTER"].ColumnName = "CRINTER_CL";
            dt.Columns["MOTIF"].ColumnName = "MOTIF";

            for (int index = 0; index < dt.Rows.Count; index++)
            {
                //if (!string.IsNullOrEmpty(dt.Rows[index]["FKLOGEMENT"].ToString()))
                //{
                //    dt.Rows[index]["REFLOGEMENT"] = GetCodeGestionnaireFromLogement(dt.Rows[index]["FKLOGEMENT"].ToString());
                //}

                if (dt.Rows[index]["TYPEFLUIDE"].ToString().ToLower().Contains("eau chaude"))
                {
                    dt.Rows[index]["FLUIDE"] = "CHAUD";
                }
                else if (dt.Rows[index]["TYPEFLUIDE"].ToString().ToLower().Contains("eau froide"))
                {
                    dt.Rows[index]["FLUIDE"] = "FROID";
                }

                //dt.Rows[index]["NCOMPTEUR"] = dt.Rows[index]["NUMEROSERIE"].ToString();

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

                string compteRendu;
                if (dt.Rows[index]["ETAT"].ToString().Trim() == "Planifiée")
                {
                    compteRendu = "Passage prévu le " + Convert.ToDateTime(dt.Rows[index]["PASSAGELE"].ToString()).ToString("dd/MM/yyyy");
                }
                else
                {
                    compteRendu = dt.Rows[index]["CRINTER_CL"].ToString();
                }
                dt.Rows[index]["COMPTERENDU"] = compteRendu;

            }
            dt.Columns.Remove("FKLOGEMENT");
            dt.Columns.Remove("EMP");
            dt.Columns.Remove("FKIMMEUBLE");
            dt.Columns.Remove("TYPEFLUIDE");

            //*** ESPACE CLIENT***
            dt.Columns["CODEGESTIO"].SetOrdinal(0);
            dt.Columns["CODEGESTIO"].ColumnName = "REF";

            dt.Columns["NOM"].SetOrdinal(1);
            dt.Columns["BAT"].SetOrdinal(2);
            dt.Columns["ESC"].SetOrdinal(3);
            dt.Columns["ETG"].SetOrdinal(4);

            dt.Columns["TELEPHONEFIXE"].SetOrdinal(5);
            dt.Columns["TELEPHONEFIXE"].ColumnName = "TEL FIXE";

            dt.Columns["TELEPHONEMOBILE"].SetOrdinal(6);
            dt.Columns["TELEPHONEMOBILE"].ColumnName = "TEL MOBILE";

            dt.Columns["NUMINTERVENTION"].SetOrdinal(7);
            dt.Columns["NUMINTERVENTION"].ColumnName = "INTERVENTION";

            dt.Columns["STATUT"].SetOrdinal(8);

            dt.Columns["DATES"].SetOrdinal(9);
            dt.Columns["DATES"].ColumnName = "PASSAGE LE";

            dt.Columns["MOTIF"].SetOrdinal(10);

            dt.Columns["ETAT"].SetOrdinal(11);

            dt.Columns["NUMEROSERIE"].SetOrdinal(12);
            dt.Columns["NUMEROSERIE"].ColumnName = "N° COMPTEUR";

            dt.Columns["FLUIDE"].SetOrdinal(13);

            dt.Columns["COMPTERENDU"].SetOrdinal(14);
            dt.Columns["COMPTERENDU"].ColumnName = "COMPTE RENDU";

            dt.Columns["NUMBEROSA"].SetOrdinal(15);
            dt.Columns["NUMBEROSA"].ColumnName = "N° RDV SERVICE";

            dt.Columns["REFIMM"].SetOrdinal(16);

            dt.Columns.Remove("CRINTER_CL");
            //dt.Columns.Remove("MOTIFINTER");

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

    public class AvancementClientsSF
    {
        internal long pkImmeuble = -1;
        internal int nbInterventionsRealisees = 0;
        internal int nbInterventionsEnCours = 0;
        internal int nbInterventionsActionclient = 0;

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            AvancementClientsSF objAsPart = obj as AvancementClientsSF;
            return (this.pkImmeuble == objAsPart.pkImmeuble);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }
    public class ImmeublesInterventionsListSF
    {
        private List<AvancementClientsSF> immeublesInterventions_ = new List<AvancementClientsSF>();

        public void Clear()
        {
            immeublesInterventions_.Clear();
        }

        public List<AvancementClientsSF> GetList()
        {
            return immeublesInterventions_;
        }

        internal void AddInterventionsRealisees(long pkImmeuble, int p)
        {
            AvancementClientsSF item = new AvancementClientsSF();
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
            AvancementClientsSF item = new AvancementClientsSF();
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
            AvancementClientsSF item = new AvancementClientsSF();
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
            foreach (AvancementClientsSF immeublesIntervention_ in immeublesInterventions_)
            {
                nbInterventionsRealisees += immeublesIntervention_.nbInterventionsRealisees;
            }
            return nbInterventionsRealisees.ToString();
        }

        internal string GetInterventionsEnCours()
        {
            int nbInterventionsEnCours = 0;
            foreach (AvancementClientsSF immeublesIntervention_ in immeublesInterventions_)
            {
                nbInterventionsEnCours += immeublesIntervention_.nbInterventionsEnCours;
            }
            return nbInterventionsEnCours.ToString();
        }

        internal string GetInterventionsActionclient()
        {
            int nbInterventionsActionclient = 0;
            foreach (AvancementClientsSF immeublesIntervention_ in immeublesInterventions_)
            {
                nbInterventionsActionclient += immeublesIntervention_.nbInterventionsActionclient;
            }
            return nbInterventionsActionclient.ToString();
        }
    }
}
