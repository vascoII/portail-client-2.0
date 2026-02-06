using OfficeOpenXml.Style;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Web;
using static System.Net.Mime.MediaTypeNames;
using Techem.DBUtils.Mongo;
using System.IO;
using DevExpress.CodeParser;
using Tools;
using DevExpress.ClipboardSource.SpreadsheetML;

namespace Techem.Webservices.WS_EspaceClient.Tools
{
    public static class Utils_Releve
    {
        private static DataTable codesIncidents = WS_DBUtils.utils_LER.DBSelectTable(
            "SELECT CODE, LIBELLE FROM CODEINCIDENT WHERE NVL(ACTIF, 'O') <>'N' ORDER BY CODE");
        private class ReleveLigne1
        {
            public string type = "1";
            public string refInterne = "";
            public DateTime dateReleve = DateTime.MinValue;
            public DateTime dateReleveM1 = DateTime.MinValue;
            public DateTime dateReleveM2 = DateTime.MinValue;
            public DateTime dateReleveM3 = DateTime.MinValue;
            public DateTime dateReleveM4 = DateTime.MinValue;
            public string refClientImm = "";

        }
        private class ReleveLigne2
        {
            public string type = "2";
            public string refInterne = "";
            public double indexReleve = -999999;
            public string codeForfait = "";
            public string codeObs = "";
            public string codeObsM1 = "";
            public string codeObsM2 = "";
            public double consoReleve = -999999;
            public string codeFluide = "";
            public double indexReleveM1 = -999999;
            public string codeForfaitM1 = "";
            public double indexReleveM2 = -999999;
            public string codeForfaitM2 = "";
            public double indexReleveM3 = -999999;
            public string codeForfaitM3 = "";
            public double indexReleveM4 = -999999;
            public string codeForfaitM4 = "";
            public string numeroSerie = "";
            public string codeEmplacement = "";
            public DateTime dateDepose = DateTime.MinValue;
            public string topChgtOcc = "";
            public string refClientLgt = "";
            public string refClientImm = "";

            public string numBat = "";
            public string numEsc = "";
            public string numEtage = "";
            public string numeroPorte = "";
            public string nomOcc = "";
            public string libelleObs = "";

            public List<ReleveLigne4> lignes4;

            public ReleveLigne2()
            {
                lignes4 = new List<ReleveLigne4>();
            }

            private double CalcConso(DataRow h0, DataRow h1)
            {
                try
                {
                    if (h1 == null)
                        return Convert.ToDouble(h0["THEINDEXF"].ToString());
                    else return Convert.ToDouble(h0["THEINDEXF"].ToString()) - Convert.ToDouble(h1["THEINDEXF"].ToString());
                }
                catch
                { return Convert.ToDouble(h0["CONSO"].ToString()); }

            }

            public ReleveLigne2(DataRow indexconso, bool exportDepose)
            {
                lignes4 = new List<ReleveLigne4>();

                int fkcompteur = Convert.ToInt32(indexconso["PKCOMPTEUR"].ToString());
                refInterne = GetRefInterne(indexconso);
                if (indexconso["THEINDEXF"] != DBNull.Value)
                    indexReleve = Convert.ToDouble(indexconso["THEINDEXF"].ToString());
                else indexReleve = 0;
                codeForfait = GetTypecalc(indexconso["TYPECALCUL"].ToString());
                codeObs = indexconso["CODE1"].ToString();
                try
                {
                    libelleObs = codesIncidents.Select("CODE=" + indexconso["CODE1"].ToString()).First()["LIBELLE"].ToString();
                }
                catch { }
                DataRow h1 = GetIndexconso(fkcompteur, Convert.ToInt32(PKRELEVEHistoReleve[1]));
                DataRow h2 = GetIndexconso(fkcompteur, Convert.ToInt32(PKRELEVEHistoReleve[2]));
                DataRow h3 = GetIndexconso(fkcompteur, Convert.ToInt32(PKRELEVEHistoReleve[3]));
                DataRow h4 = GetIndexconso(fkcompteur, Convert.ToInt32(PKRELEVEHistoReleve[4]));

                if (h1 != null)
                {
                    codeObsM1 = h1["CODE1"].ToString();
                    if (h1["THEINDEXF"] != DBNull.Value)
                        indexReleveM1 = Convert.ToDouble(h1["THEINDEXF"].ToString());
                    else indexReleveM1 = 0;
                    codeForfaitM1 = GetTypecalc(h1["TYPECALCUL"].ToString());
                }
                else
                {
                    codeObsM1 = "";
                    indexReleveM1 = 0;
                    codeForfaitM1 = "";
                }
                if (h2 != null)
                {
                    codeObsM2 = h2["CODE1"].ToString();
                    if (h2["THEINDEXF"] != DBNull.Value)
                        indexReleveM2 = Convert.ToDouble(h2["THEINDEXF"].ToString());
                    else indexReleveM2 = 0;
                    codeForfaitM2 = GetTypecalc(h2["TYPECALCUL"].ToString());
                }
                else
                {
                    codeObsM2 = "";
                    indexReleveM2 = 0;
                    codeForfaitM2 = "";
                }
                if (h3 != null)
                {
                    if (h3["THEINDEXF"] != DBNull.Value)
                        indexReleveM3 = Convert.ToDouble(h3["THEINDEXF"].ToString());
                    else indexReleveM3 = 0;
                    codeForfaitM3 = GetTypecalc(h3["TYPECALCUL"].ToString());
                }
                else
                {
                    indexReleveM3 = 0;
                    codeForfaitM3 = "";
                }
                if (h4 != null)
                {
                    if (h4["THEINDEXF"] != DBNull.Value)
                        indexReleveM4 = Convert.ToDouble(h4["THEINDEXF"].ToString());
                    else indexReleveM4 = 0;
                    codeForfaitM4 = GetTypecalc(h4["TYPECALCUL"].ToString());
                }
                else
                {
                    indexReleveM4 = 0;
                    codeForfaitM4 = "";
                }
                if (((exportDepose) && (indexconso["DATEDEPOSE"] != DBNull.Value)) ||
                    ((indexconso["DATEDEPOSE"] != DBNull.Value) &&
                     (Convert.ToDateTime(indexconso["DATEDEPOSE"].ToString()).ToShortDateString() != "31/12/2999") &&
                     (Convert.ToDateTime(indexconso["DATEDEPOSE"].ToString()) < DateHistoReleve[0])))
                    dateDepose = Convert.ToDateTime(indexconso["DATEDEPOSE"].ToString());
                if (indexconso["CONSO"] != DBNull.Value)
                    consoReleve = CalcConso(indexconso, h1);
                if (consoReleve < 0)
                    consoReleve = 0;
                codeFluide = ConvertFluide(indexconso["fluide"].ToString());
                numeroSerie = indexconso["NUMEROSERIE"].ToString();
                codeEmplacement = indexconso["CODEEMP"].ToString();
                //r2.topChgtOcc = "";  // TODO : topChgtOcc
                if (indexconso["CODELOGEGESTIO"].ToString().ToLower() != "null")
                    refClientLgt = indexconso["CODELOGEGESTIO"].ToString();
                if (indexconso["CODEGESTIO"].ToString().ToLower() != "null")
                    refClientImm = indexconso["CODEGESTIO"].ToString();

                numBat = indexconso["NUMBAT"].ToString();
                numEsc = indexconso["NUMESCALIER"].ToString();
                numEtage = indexconso["NUMETAGE"].ToString();
                numeroPorte = indexconso["NUMORDRE"].ToString();
                nomOcc = indexconso["NOM"].ToString();

            }
        }
        private class ReleveLigne4
        {
            public string type = "4";
            public string refInterne = "";
            public double indexReleve = -999999;
            public string codeForfait = "";
            public string codeObs = "";
            public double consoReleve = -999999;
            public string codeFluide = "";
            public double indexPose = 0;
            public string numeroSerie = "";
            public DateTime dateDepose = DateTime.MinValue;
            public string refClientLgt = "";
            public string refClientImm = "";

            public string libelleObs = "";

            public ReleveLigne4(DataRow indexconso_histo, bool IndexZero)
            {
                refInterne = GetRefInterne(indexconso_histo);

                if (IndexZero)
                {
                    indexReleve = 0;
                    codeForfait = "";
                    codeObs = "";
                    consoReleve = 0;
                }
                else
                {
                    if (indexconso_histo["THEINDEXF"] != DBNull.Value)
                        indexReleve = Convert.ToDouble(indexconso_histo["THEINDEXF"].ToString());
                    else indexReleve = 0;
                    codeForfait = GetTypecalc(indexconso_histo["TYPECALCUL"].ToString());
                    codeObs = indexconso_histo["CODE1"].ToString();
                    try
                    {
                        libelleObs = codesIncidents.Select("CODE=" + indexconso_histo["CODE1"].ToString()).First()["LIBELLE"].ToString();
                    }
                    catch { }
                    consoReleve = Convert.ToDouble(indexconso_histo["CONSO"].ToString());
                }
                codeFluide = ConvertFluide(indexconso_histo["fluide"].ToString());
                numeroSerie = indexconso_histo["NUMEROSERIE"].ToString();
                if ((indexconso_histo["DATEDEPOSE"] != DBNull.Value) && (Convert.ToDateTime(indexconso_histo["DATEDEPOSE"].ToString()).ToShortDateString() != "31/12/2999"))
                    dateDepose = Convert.ToDateTime(indexconso_histo["DATEDEPOSE"].ToString());
                if (indexconso_histo["CODELOGEGESTIO"].ToString().ToLower() != "null")
                    refClientLgt = indexconso_histo["CODELOGEGESTIO"].ToString();
                if (indexconso_histo["CODEGESTIO"].ToString().ToLower() != "null")
                    refClientImm = indexconso_histo["CODEGESTIO"].ToString();
            }
        }
        private class Releve
        {
            public ReleveLigne1 ligne1;
            public List<ReleveLigne2> lignes2;
            public string errrors;

            public Releve()
            {
                lignes2 = new List<ReleveLigne2>();
            }
        }

        private static DateTime[] DateHistoReleve = new DateTime[5];
        private static double[] PKRELEVEHistoReleve = new double[5];
        private static void SetDateHistoReleve(int fkimmeuble, DateTime date, string typeERC, int NCumul = 1)
        {
            //WEBTODO :
            // - releve remplace par web_releve
#if WS2
            string query =
            $@"SELECT datereleve, pkreleve 
            FROM web_releve
            WHERE fkimmeuble = {fkimmeuble} 
                AND datereleve <= {date.QuotedStr()} 
                AND datecloture IS NOT NULL ";

            if (typeERC != "")
                query += "AND typeerc=" + typeERC.QuotedStr();

            query += " ORDER BY datereleve DESC";
            DataRowCollection releves = WS_DBUtils.utils_LER.DBSelectRows(query);

            int i = 0;
            while ((i < releves.Count) && (i < 5))
            {
                DateHistoReleve[i] = DateTime.MinValue;
                PKRELEVEHistoReleve[i] = -1;
                i++;
            }

            i = 0;
            int j = 0;
            //int k = 0;
            while ((i < releves.Count) && (j < 5))
            {
                if ((i + NCumul) % NCumul == 0)
                {
                    DateHistoReleve[j] = Convert.ToDateTime(releves[i]["DATERELEVE"].ToString());
                    PKRELEVEHistoReleve[j] = Convert.ToDouble(releves[i]["PKRELEVE"].ToString());
                    j++;
                }
                i++;
            }

#else
            string query =
$@"SELECT DATERELEVE, PKRELEVE 
FROM RELEVE
WHERE FKIMMEUBLE = {fkimmeuble} 
AND DATERELEVE <= {date.QuotedStr()} 
AND DATECLOTURE IS NOT NULL ";

            if (typeERC != "")
                query += "AND TYPEERC=" + typeERC.QuotedStr();

            query += " ORDER BY DATERELEVE DESC";
            DataRowCollection releves = WS_DBUtils.utils_LER.DBSelectRows(query);

            int i = 0;
            while ((i < releves.Count) && (i < 5))
            {
                DateHistoReleve[i] = DateTime.MinValue;
                PKRELEVEHistoReleve[i] = -1;
                i++;
            }

            i = 0;
            int j = 0;
            //int k = 0;
            while ((i < releves.Count) && (j < 5))
            {
                if ((i + NCumul) % NCumul == 0)
                {
                    DateHistoReleve[j] = Convert.ToDateTime(releves[i]["DATERELEVE"].ToString());
                    PKRELEVEHistoReleve[j] = Convert.ToDouble(releves[i]["PKRELEVE"].ToString());
                    j++;
                }
                i++;
            }

#endif
        }
        private static void SetDateHistoReleve(int pkreleve, int NCumul = 1)
        {
            //WEBTODO :
            // - releve remplace par web_releve
#if WS2
            int fkimmeuble;
            DateTime date;
            string typeERC;
            DataRow r = WS_DBUtils.utils_LER.DBSelectRow($@"SELECT * FROM web_releve WHERE pkreleve = {pkreleve}");
            fkimmeuble = Convert.ToInt32(r["FKIMMEUBLE"].ToString());
            date = Convert.ToDateTime(r["DATERELEVE"].ToString());
            typeERC = r["TYPEERC"].ToString();

            SetDateHistoReleve(fkimmeuble, date, typeERC, NCumul);
#else
            int fkimmeuble;
            DateTime date;
            string typeERC;
            DataRow r = WS_DBUtils.utils_LER.DBSelectRow("SELECT * FROM RELEVE WHERE PKRELEVE = " + pkreleve.ToString());
            fkimmeuble = Convert.ToInt32(r["FKIMMEUBLE"].ToString());
            date = Convert.ToDateTime(r["DATERELEVE"].ToString());
            typeERC = r["TYPEERC"].ToString();

            SetDateHistoReleve(fkimmeuble, date, typeERC, NCumul); 
#endif
        }
        private static string GetTypecalc(string typeCalcul)
        {
            if ((typeCalcul == "S") || (typeCalcul == "E") || (typeCalcul == "F"))
                return "F";
            else return "";
        }
        private static DataRow GetIndexconso(int fkcompteur, int pkreleve)
        {
            //WEBTODO :
            // - indexconso remplace par web_indexconso
            // - compteur remplace par web_compteur
#if WS2
            // on recherche le compteur dans le relevé             
            string sql =
                $@"SELECT NVL(web_indexconso.theindexf, web_indexconso.theindex) AS theindexf, web_indexconso.conso, web_indexconso.typecalcul, web_indexconso.code1 
                FROM web_indexconso
                WHERE web_indexconso.fkcompteur = {fkcompteur}
                    AND web_indexconso.fkreleve = 
            {pkreleve}";

            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(sql);

            if (r != null)
                // le compteur a bien été relevé dans CE relevé
                return r;
            else
            {
                // on recherche un compteur du meme lgt et ayant le meme n° d"ordre 
                sql = $@"SELECT NVL(web_indexconso.theindexf, web_indexconso.theindex) AS THEINDEXF, web_indexconso.CONSO, web_indexconso.TYPECALCUL, web_indexconso.CODE1
                        FROM web_indexconso, web_compteur c1, web_compteur c2
                        WHERE fkcompteur = c1.pkcompteur
                            AND c1.pkcompteur = {fkcompteur}
                            AND c1.fklogement = c2.fklogement
                            AND c1.numcompteur = c2.numcompteur
                            AND c1.pkcompteur<> c2.pkcompteur
                            AND web_indexconso.fkreleve = {pkreleve}";
                r = WS_DBUtils.utils_LER.DBSelectRow(sql);
                return r;
            }
#else
            // on recherche le compteur dans le relevé             
            string sql =
$@"select NVL(THEINDEXF, THEINDEX) AS THEINDEXF, CONSO, TYPECALCUL, CODE1 from INDEXCONSO
where FKCOMPTEUR = {fkcompteur}
and FKRELEVE = 
            {pkreleve}";

            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(sql);

            if (r != null)
                // le compteur a bien été relevé dans CE relevé
                return r;
            else
            {
                // on recherche un compteur du meme lgt et ayant le meme n° d"ordre 
                sql = $@"select NVL(THEINDEXF, THEINDEX) AS THEINDEXF, CONSO, TYPECALCUL, CODE1
from INDEXCONSO, COMPTEUR c1, COMPTEUR c2
where FKCOMPTEUR = c1.PKCOMPTEUR
and c1.PKCOMPTEUR = {fkcompteur}
and c1.FKLOGEMENT = c2.FKLOGEMENT
and c1.NUMCOMPTEUR = c2.NUMCOMPTEUR
and c1.PKCOMPTEUR<> c2.PKCOMPTEUR
and FKRELEVE = {pkreleve}";
                r = WS_DBUtils.utils_LER.DBSelectRow(sql);
                return r;
            }
#endif

        }
        private static string ConvertFluide(int fkcritere)
        {
            switch (fkcritere)
            {
                case 1: return "C";
                case 2: return "F";
                case 8:
                    return "T";
                default: return "";
            }
        }

        private static string ConvertFluide(string fluide)
        {
            switch (fluide)
            {
                case "EC": return "C";
                case "EF": return "F";
                case "CET":
                case "REPART":
                    return "T";
                default: return "";
            }
        }

        private static bool CompteurChange(DataRow r)
        {
            return ((r["CODE1"].ToString() == "27") || (r["CODE2"].ToString() == "27") || (r["CODE3"].ToString() == "27") || (r["CODE4"].ToString() == "27") ||
                (Convert.ToDateTime(r["DATEINSTALL"].ToString()) > DateHistoReleve[1]));
        }
        public static ExcelPackage ExportReleveImmeubleToExcel(int pkImmeuble, string typeERC)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - logement remplace par web_logement
            // - compteur remplace par web_compteur
            // - indexconso remplace par web_indexconso
            // - releve remplace par web_releve
#if WS2
            releve Releve = WS_Common.GetLastReleve(pkImmeuble, DateTime.Today.AddYears(-5), DateTime.Today, typeERC);

            if (Releve == null)
            {
                return null;
            }
            int pkReleve = Releve.PkReleve;

            string sql =
$@"SELECT web_immeuble.fkclienttop, web_immeuble.id, web_immeuble.codegestio, web_logement.numbatiment AS numbat, web_logement.numescalier,
    web_logement.numetage, web_logement.numordre, web_occupant.nom, web_occupant.codelogegestio,
    web_compteur.numcompteur, web_compteur.numeroserie, web_compteur.fluide, web_compteur.pkcompteur,
    web_compteur.refpointcomptage, web_compteur.dateinstall, web_compteur.codeemp AS codeemp, web_compteur.datedepose,
    nvl(web_indexconso.theindexf, web_indexconso.theindex) AS theindexf, web_indexconso.conso, web_indexconso.typecalcul,
    web_indexconso.code1, web_indexconso.code2, web_indexconso.code3, web_indexconso.code4, web_logement.pklogement,
    web_releve.datereleve, 
    CASE WHEN (web_indexconso.code1 = '91' OR web_indexconso.code2 = '91' OR web_indexconso.code3 = '91' OR web_indexconso.code4 = '91')
        THEN 'ANOMALIE' ELSE '' END AS alerte
FROM web_indexconso, web_releve, web_immeuble, web_compteur, web_logement, web_occupant
WHERE web_indexconso.fkreleve = web_releve.pkreleve
    AND web_releve.fkimmeuble = web_immeuble.pkimmeuble
    AND web_indexconso.fkcompteur = web_compteur.pkcompteur
    AND web_compteur.fklogement = web_logement.pklogement
    AND web_occupant.fklogement = web_logement.pklogement
    AND web_releve.datereleve between web_occupant.datearrivee and web_occupant.datedepart
    AND web_logement.fkimmeuble =  web_immeuble.pkimmeuble
    AND web_releve.pkreleve = {pkReleve}
ORDER BY web_logement.numbatiment, web_logement.numescalier, web_logement.numetage, web_logement.numordre,
web_compteur.numcompteur";
            DataTable dtIndexconsos = WS_DBUtils.utils_LER.DBSelectTable(sql);

            // FUITES
            #region Where
            Dictionary<string, object> matchList4Fuites = new Dictionary<string, object>
                            {
                                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, DateTime.Today.AddDays(-1) },
                                { Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT, "O" },
                                { Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK, pkImmeuble }
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

            foreach (DataRow drFuite in dtFuites.Rows)
            {
                DataRow[] arrayIndexConsos = dtIndexconsos.Select("PKCOMPTEUR=" + drFuite["FKCOMPTEUR"].ToString());
                if (arrayIndexConsos.Length > 0)
                {
                    if (arrayIndexConsos[0]["ALERTE"].ToString() != "")
                        arrayIndexConsos[0]["ALERTE"] += Environment.NewLine + "FUITE";
                    else
                        arrayIndexConsos[0]["ALERTE"] = "FUITE";
                }

            }

            ExcelPackage excel = new ExcelPackage();

            ExcelWorksheet ws = excel.Workbook.Worksheets.Add("INDEX");

            int rowPosition = 1;


            #region Entête
            ws.Cells["A" + rowPosition].Value = "N° bât.";
            ws.Cells["B" + rowPosition].Value = "N° esc.";
            ws.Cells["C" + rowPosition].Value = "Etage";
            ws.Cells["D" + rowPosition].Value = "N° porte";
            ws.Cells["E" + rowPosition].Value = "Réf. logement";
            ws.Cells["F" + rowPosition].Value = "Nom occupant";
            ws.Cells["G" + rowPosition].Value = "Emplacement";
            ws.Cells["H" + rowPosition].Value = "Numéro de série";
            ws.Cells["I" + rowPosition].Value = "Fluide";
            ws.Cells["J" + rowPosition].Value = "Index au " + dtIndexconsos.Rows[0]["DATERELEVE"].ToString().ToDateTime().ToShortDateString();
            ws.Cells["K" + rowPosition].Value = "Forfait ?";
            ws.Cells["L" + rowPosition].Value = "Conso relevé";
            ws.Cells["M" + rowPosition].Value = "Observations";

            string headerRange = "A1:U1";
            ws.Cells[headerRange].Style.Font.Size = 11;
            ws.Cells[headerRange].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[headerRange].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            ws.Cells[headerRange].Style.Font.Color.SetColor(Color.Black);
            ws.Cells[headerRange].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Cells[headerRange].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            rowPosition++;


            #endregion

            #region Data
            foreach (DataRow drIndexConso in dtIndexconsos.Rows)
            {
                ws.Cells["A" + rowPosition].Value = drIndexConso["NUMBAT"].ToString(); //l2.numBat;
                ws.Cells["B" + rowPosition].Value = drIndexConso["NUMESCALIER"].ToString(); //l2.numEsc;
                ws.Cells["C" + rowPosition].Value = drIndexConso["NUMETAGE"].ToString(); //l2.numEtage;
                ws.Cells["D" + rowPosition].Value = drIndexConso["NUMORDRE"].ToString(); //l2.numeroPorte;
                ws.Cells["E" + rowPosition].Value = drIndexConso["CODELOGEGESTIO"].ToString(); //l2.refClientLgt;
                ws.Cells["F" + rowPosition].Value = drIndexConso["NOM"].ToString(); //l2.nomOcc;
                ws.Cells["G" + rowPosition].Value = drIndexConso["CODEEMP"].ToString(); //l2.codeEmplacement;
                ws.Cells["H" + rowPosition].Value = drIndexConso["NUMEROSERIE"].ToString(); //l2.numeroSerie;
                ws.Cells["I" + rowPosition].Value = ConvertFluide(drIndexConso["fluide"].ToString()); //l2.codeFluide;
                double indexReleve = -999999;
                if (drIndexConso["THEINDEXF"] != DBNull.Value)
                    indexReleve = drIndexConso["THEINDEXF"].ToString().ToDoubleOrDefault(0);
                else indexReleve = 0;
                ws.Cells["J" + rowPosition].Value = indexReleve; //l2.indexReleve;
                ws.Cells["K" + rowPosition].Value = GetTypecalc(drIndexConso["TYPECALCUL"].ToString());

                if (drIndexConso["CONSO"] != DBNull.Value)
                    ws.Cells["L" + rowPosition].Value = drIndexConso["CONSO"].ToString().ToDoubleOrDefault(0);
                else
                    ws.Cells["L" + rowPosition].Value = 0;
                ws.Cells["M" + rowPosition].Value = drIndexConso["ALERTE"].ToString();
                rowPosition++;

            }
            #endregion

            string modelRange = "A1:U" + (rowPosition - 1).ToString();
            var modelTable = ws.Cells[modelRange];
            // Assign borders
            modelTable.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            ws.Columns.AutoFit();
            excel.Save();
            return excel;
#else

            releve Releve = WS_Common.GetLastReleve(pkImmeuble, DateTime.Today.AddYears(-5), DateTime.Today, typeERC);

            if (Releve == null)
            {
                return null;
            }
            int pkReleve = Releve.PkReleve;

            string sql =
$@"SELECT IMMEUBLE.FKCLIENTTOP, IMMEUBLE.ID, IMMEUBLE.CODEGESTIO, BATIMENT.ID as NUMBAT, ESCALIER.NUMESCALIER,
LOGEMENT.NUMETAGE, LOGEMENT.NUMORDRE, OCCUPANT.NOM, OCCUPANT.CODELOGEGESTIO,
COMPTEUR.NUMCOMPTEUR, COMPTEUR.NUMEROSERIE, NVL(COMPTEUR.FKCRITERE, 2) AS FKCRITERE, COMPTEUR.PKCOMPTEUR,
COMPTEUR.REFPOINTCOMPTAGE, COMPTEUR.DATEINSTALL, CODEEMPLACEMENT.CODE as CODEEMP, COMPTEUR.DATEDEPOSE,
NVL(INDEXCONSO.THEINDEXF, INDEXCONSO.THEINDEX) AS THEINDEXF, INDEXCONSO.CONSO, INDEXCONSO.TYPECALCUL,
INDEXCONSO.CODE1, INDEXCONSO.CODE2, INDEXCONSO.CODE3, INDEXCONSO.CODE4, LOGEMENT.PKLOGEMENT,
COMPTEUR.CODECRGESTIO, RELEVE.DATERELEVE, 
CASE WHEN (INDEXCONSO.CODE1 = '91' OR INDEXCONSO.CODE2 = '91' OR INDEXCONSO.CODE3 = '91' OR INDEXCONSO.CODE4 = '91')
    THEN 'ANOMALIE' ELSE '' END AS ALERTE
FROM INDEXCONSO, RELEVE, IMMEUBLE, COMPTEUR, LOGEMENT, ESCALIER, BATIMENT,
OCCUPANT, CODEEMPLACEMENT
where INDEXCONSO.FKRELEVE = RELEVE.PKRELEVE
and RELEVE.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
and INDEXCONSO.FKCOMPTEUR = COMPTEUR.PKCOMPTEUR
and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and OCCUPANT.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and RELEVE.DATERELEVE between OCCUPANT.DATEARRIVEE and OCCUPANT.DATEDEPART
and LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT
and LOGEMENT.FKESCALIER = ESCALIER.PKESCALIER
and ESCALIER.FKBATIMENT = BATIMENT.PKBATIMENT
and COMPTEUR.FKCODEEMPLACEMENT = CODEEMPLACEMENT.PKCODEEMPLACEMENT 
and RELEVE.PKRELEVE = {pkReleve}
ORDER BY BATIMENT.ID, ESCALIER.NUMESCALIER, LOGEMENT.NUMETAGE, LOGEMENT.NUMORDRE,
COMPTEUR.NUMCOMPTEUR";
            DataTable dtIndexconsos = WS_DBUtils.utils_LER.DBSelectTable(sql);

            //dtIndexconsos.Columns.Add("ALERTE");

            // FUITES
            #region Where
            Dictionary<string, object> matchList4Fuites = new Dictionary<string, object>
                            {
                                { Mongo_DBUtils.INDEXCONSOTCH.DATEINDEX, DateTime.Today.AddDays(-1) },
                                { Mongo_DBUtils.INDEXCONSOTCH.FUITECLIENT, "O" },
                                { Mongo_DBUtils.INDEXCONSOTCH.IMMEUBLE_FK, pkImmeuble }
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

            foreach (DataRow drFuite in dtFuites.Rows)
            {
                DataRow[] arrayIndexConsos = dtIndexconsos.Select("PKCOMPTEUR=" + drFuite["FKCOMPTEUR"].ToString());
                if (arrayIndexConsos.Length > 0)
                {
                    if (arrayIndexConsos[0]["ALERTE"].ToString() != "")
                        arrayIndexConsos[0]["ALERTE"] += Environment.NewLine + "FUITE";
                    else
                        arrayIndexConsos[0]["ALERTE"] = "FUITE";
                }

            }

            ExcelPackage excel = new ExcelPackage();

            ExcelWorksheet ws = excel.Workbook.Worksheets.Add("INDEX");

            int rowPosition = 1;


            #region Entête
            ws.Cells["A" + rowPosition].Value = "N° bât.";
            ws.Cells["B" + rowPosition].Value = "N° esc.";
            ws.Cells["C" + rowPosition].Value = "Etage";
            ws.Cells["D" + rowPosition].Value = "N° porte";
            ws.Cells["E" + rowPosition].Value = "Réf. logement";
            ws.Cells["F" + rowPosition].Value = "Nom occupant";
            ws.Cells["G" + rowPosition].Value = "Emplacement";
            ws.Cells["H" + rowPosition].Value = "Numéro de série";
            ws.Cells["I" + rowPosition].Value = "Fluide";
            ws.Cells["J" + rowPosition].Value = "Index au " + dtIndexconsos.Rows[0]["DATERELEVE"].ToString().ToDateTime().ToShortDateString();
            ws.Cells["K" + rowPosition].Value = "Forfait ?";
            ws.Cells["L" + rowPosition].Value = "Conso relevé";
            ws.Cells["M" + rowPosition].Value = "Observations";

            string headerRange = "A1:U1";
            ws.Cells[headerRange].Style.Font.Size = 11;
            ws.Cells[headerRange].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[headerRange].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            ws.Cells[headerRange].Style.Font.Color.SetColor(Color.Black);
            ws.Cells[headerRange].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Cells[headerRange].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            rowPosition++;


            #endregion

            #region Data
            foreach (DataRow drIndexConso in dtIndexconsos.Rows)
            {
                ws.Cells["A" + rowPosition].Value = drIndexConso["NUMBAT"].ToString(); //l2.numBat;
                ws.Cells["B" + rowPosition].Value = drIndexConso["NUMESCALIER"].ToString(); //l2.numEsc;
                ws.Cells["C" + rowPosition].Value = drIndexConso["NUMETAGE"].ToString(); //l2.numEtage;
                ws.Cells["D" + rowPosition].Value = drIndexConso["NUMORDRE"].ToString(); //l2.numeroPorte;
                ws.Cells["E" + rowPosition].Value = drIndexConso["CODELOGEGESTIO"].ToString(); //l2.refClientLgt;
                ws.Cells["F" + rowPosition].Value = drIndexConso["NOM"].ToString(); //l2.nomOcc;
                ws.Cells["G" + rowPosition].Value = drIndexConso["NUMBAT"].ToString(); //l2.codeEmplacement;
                ws.Cells["H" + rowPosition].Value = drIndexConso["NUMEROSERIE"].ToString(); //l2.numeroSerie;
                ws.Cells["I" + rowPosition].Value = ConvertFluide(Convert.ToInt32(drIndexConso["FKCRITERE"].ToString())); //l2.codeFluide;
                double indexReleve = -999999;
                if (drIndexConso["THEINDEXF"] != DBNull.Value)
                    indexReleve = drIndexConso["THEINDEXF"].ToString().ToDoubleOrDefault(0);
                else indexReleve = 0;
                ws.Cells["J" + rowPosition].Value = indexReleve; //l2.indexReleve;
                ws.Cells["K" + rowPosition].Value = GetTypecalc(drIndexConso["TYPECALCUL"].ToString());

                if (drIndexConso["CONSO"] != DBNull.Value)
                    ws.Cells["L" + rowPosition].Value = drIndexConso["CONSO"].ToString().ToDoubleOrDefault(0);
                else
                    ws.Cells["L" + rowPosition].Value = 0;
                ws.Cells["M" + rowPosition].Value = drIndexConso["ALERTE"].ToString();
                rowPosition++;

            }
            #endregion

            string modelRange = "A1:U" + (rowPosition - 1).ToString();
            var modelTable = ws.Cells[modelRange];
            // Assign borders
            modelTable.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            ws.Columns.AutoFit();
            excel.Save();
            return excel;

#endif
        }

        public static ExcelPackage ExportReleveToExcel(int pkReleve)
        {
            Releve r = GetReleve(pkReleve, 1);

            ExcelPackage excel = new ExcelPackage();

            ExcelWorksheet ws = excel.Workbook.Worksheets.Add("INDEX");

            int rowPosition = 1;

            #region Ligne 1
            ws.Cells["A" + rowPosition].Value = "N° bât.";
            ws.Cells["B" + rowPosition].Value = "N° esc.";
            ws.Cells["C" + rowPosition].Value = "Etage";
            ws.Cells["D" + rowPosition].Value = "N° porte";
            ws.Cells["E" + rowPosition].Value = "Réf. logement";
            ws.Cells["F" + rowPosition].Value = "Nom occupant";
            ws.Cells["G" + rowPosition].Value = "Emplacement";
            ws.Cells["H" + rowPosition].Value = "Numéro de série";
            ws.Cells["I" + rowPosition].Value = "Fluide";
            ws.Cells["J" + rowPosition].Value = "Index au " + r.ligne1.dateReleveM4.ToShortDateString();
            ws.Cells["K" + rowPosition].Value = "Forfait ?";
            ws.Cells["L" + rowPosition].Value = "Index au " + r.ligne1.dateReleveM3.ToShortDateString();
            ws.Cells["M" + rowPosition].Value = "Forfait ?";
            ws.Cells["N" + rowPosition].Value = "Index au " + r.ligne1.dateReleveM2.ToShortDateString();
            ws.Cells["O" + rowPosition].Value = "Forfait ?";
            ws.Cells["P" + rowPosition].Value = "Index au " + r.ligne1.dateReleveM1.ToShortDateString();
            ws.Cells["Q" + rowPosition].Value = "Forfait ?";
            ws.Cells["R" + rowPosition].Value = "Index au " + r.ligne1.dateReleve.ToShortDateString();
            ws.Cells["S" + rowPosition].Value = "Forfait ?";
            ws.Cells["T" + rowPosition].Value = "Conso relevé";
            ws.Cells["U" + rowPosition].Value = "Observations";

            #region design Header
            string headerRange = "A1:U1";
            ws.Cells[headerRange].Style.Font.Size = 11;
            ws.Cells[headerRange].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[headerRange].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
            ws.Cells[headerRange].Style.Font.Color.SetColor(Color.Black);
            ws.Cells[headerRange].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            ws.Cells[headerRange].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            #endregion

            rowPosition++;

            #endregion

            #region Lignes 2
            foreach (ReleveLigne2 l2 in r.lignes2)
            {
                ws.Cells["A" + rowPosition].Value = l2.numBat;
                ws.Cells["B" + rowPosition].Value = l2.numEsc;
                ws.Cells["C" + rowPosition].Value = l2.numEtage;
                ws.Cells["D" + rowPosition].Value = l2.numeroPorte;
                ws.Cells["E" + rowPosition].Value = l2.refClientLgt;
                ws.Cells["F" + rowPosition].Value = l2.nomOcc;
                ws.Cells["G" + rowPosition].Value = l2.codeEmplacement;
                ws.Cells["H" + rowPosition].Value = l2.numeroSerie;
                ws.Cells["I" + rowPosition].Value = l2.codeFluide;
                ws.Cells["J" + rowPosition].Value = l2.indexReleveM4;
                ws.Cells["K" + rowPosition].Value = l2.codeForfaitM4;
                ws.Cells["L" + rowPosition].Value = l2.indexReleveM3;
                ws.Cells["M" + rowPosition].Value = l2.codeForfaitM3;
                ws.Cells["N" + rowPosition].Value = l2.indexReleveM2;
                ws.Cells["O" + rowPosition].Value = l2.codeForfaitM2;
                ws.Cells["P" + rowPosition].Value = l2.indexReleveM1;
                ws.Cells["Q" + rowPosition].Value = l2.codeForfaitM1;
                ws.Cells["R" + rowPosition].Value = l2.indexReleve;
                ws.Cells["S" + rowPosition].Value = l2.codeForfait;
                ws.Cells["T" + rowPosition].Value = l2.consoReleve;
                ws.Cells["U" + rowPosition].Value = l2.libelleObs;
                rowPosition++;

                #region Lignes 4
                foreach (ReleveLigne4 l4 in l2.lignes4)
                {
                    ws.Cells["A" + rowPosition].Value = l2.numBat;
                    ws.Cells["B" + rowPosition].Value = l2.numEsc;
                    ws.Cells["C" + rowPosition].Value = l2.numEtage;
                    ws.Cells["D" + rowPosition].Value = l2.numeroPorte;
                    ws.Cells["E" + rowPosition].Value = l2.refClientLgt;
                    ws.Cells["F" + rowPosition].Value = l2.nomOcc;
                    ws.Cells["G" + rowPosition].Value = l2.codeEmplacement;
                    ws.Cells["H" + rowPosition].Value = l4.numeroSerie;
                    ws.Cells["I" + rowPosition].Value = l4.codeFluide;
                    ws.Cells["R" + rowPosition].Value = l4.indexReleve;
                    ws.Cells["S" + rowPosition].Value = l4.codeForfait;
                    ws.Cells["T" + rowPosition].Value = l4.consoReleve;
                    ws.Cells["U" + rowPosition].Value = l4.libelleObs;
                }
                #endregion
            }
            #endregion

            string modelRange = "A1:U" + (rowPosition - 1).ToString();
            var modelTable = ws.Cells[modelRange];
            // Assign borders
            modelTable.Style.Border.Top.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Left.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            modelTable.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            ws.Columns.AutoFit();
            excel.Save();
            return excel;
        }
        private static string GetRefInterne(DataRow r)
        {
            if ((r["REFPOINTCOMPTAGE"] != DBNull.Value) && (r["REFPOINTCOMPTAGE"].ToString() != ""))
                return r["REFPOINTCOMPTAGE"].ToString();

            //IIIIIIBBSSEELLLCC
            string f = "IIIIIIBBSSEELLLCC";

            //Immeuble // toujours sur 6 car
            f = f.Replace("IIIIII", r["ID"].ToString().Substring(0, 6));

            //batiment 
            string b = f.Substring(f.IndexOf("B"), 1 + f.LastIndexOf("B") - f.IndexOf("B"));
            string nb = Convert.ToInt32(r["NUMBAT"].ToString()).ToString(b.Replace("B", "0"));
            if (nb.Length > b.Length)
                nb = nb.Substring(nb.Length - b.Length);
            f = f.Replace(b, nb);
            //string b = f.Substring(f.IndexOf("B"), 1 + f.LastIndexOf("B") - f.IndexOf("B"));
            //f = f.Replace(b, Convert.ToInt32(r["NUMBAT"].ToString()).ToString(b.Replace("B", "0")));

            //escalier 
            string s = f.Substring(f.IndexOf("S"), 1 + f.LastIndexOf("S") - f.IndexOf("S"));
            f = f.Replace(s, Convert.ToInt32(r["NUMESCALIER"].ToString()).ToString(s.Replace("S", "0")));

            //Etage
            string e = f.Substring(f.IndexOf("E"), 1 + f.LastIndexOf("E") - f.IndexOf("E"));
            if (Convert.ToInt32(r["NUMETAGE"].ToString()) >= 0)
                f = f.Replace(e, Convert.ToInt32(r["NUMETAGE"].ToString()).ToString(e.Replace("E", "0")));
            else
                f = f.Replace(e, "S" + (-Convert.ToInt32(r["NUMETAGE"].ToString())).ToString(e.Replace("E", "0").Substring(1)));
            //Logement
            string l = f.Substring(f.IndexOf("L"), 1 + f.LastIndexOf("L") - f.IndexOf("L"));
            string nl = Convert.ToInt32(r["NUMORDRE"].ToString()).ToString(l.Replace("L", "0"));
            if (nl.Length > l.Length)
                nl = nl.Substring(nl.Length - l.Length);
            f = f.Replace(l, nl);

            if (r["NUMCOMPTEUR"] == DBNull.Value)
                r["NUMCOMPTEUR"] = 1;
            string c = f.Substring(f.IndexOf("C"), 1 + f.LastIndexOf("C") - f.IndexOf("C"));
            f = f.Replace(c, Convert.ToInt32(r["NUMCOMPTEUR"].ToString()).ToString(c.Replace("C", "0")));

            //Fluide
            if (f.IndexOf("F") > 0)
            {
                string fluide = f.Substring(f.IndexOf("F"), 1 + f.LastIndexOf("F") - f.IndexOf("F"));
                f = f.Replace(fluide, ConvertFluide(r["fluide"].ToString()));
            }

            return f;
        }
        private static Releve GetReleve(int pkreleve, int NCumul)
        {
            //WEBTODO :
            // - immeuble remplace par web_immeuble
            // - releve remplace par web_releve
            // - occupant remplace par web_occupant
            // - compteur remplace par web_compteur

            Releve r = new Releve();
#if WS2
            #region Lignes 1
            SetDateHistoReleve(pkreleve, NCumul);

            DataRow relimm = WS_DBUtils.utils_LER.DBSelectRow("SELECT web_immeuble.id, web_immeuble.codegestio FROM web_releve, web_immeuble WHERE web_releve.fkimmeuble = web_immeuble.pkimmeuble AND web_releve.pkreleve = " + pkreleve.ToString());
            r.ligne1 = new ReleveLigne1
            {
                refInterne = relimm["ID"].ToString(),
                dateReleve = DateHistoReleve[0],
                dateReleveM1 = DateHistoReleve[1],
                dateReleveM2 = DateHistoReleve[2],
                dateReleveM3 = DateHistoReleve[3],
                dateReleveM4 = DateHistoReleve[4],
                refClientImm = relimm["CODEGESTIO"].ToString()
            };
            #endregion

            #region Lignes 2
            string sql =
$@"SELECT web_immeuble.fkclienttop, web_immeuble.ID, web_immeuble.codegestio, web_logement.numbatiment AS numbat, web_logement.numescalier,
    web_logement.numetage, web_logement.numordre, web_occupant.nom, web_occupant.codelogegestio,
    web_compteur.numcompteur, web_compteur.numeroserie, web_compteur.fluide, web_compteur.pkcompteur,
    web_compteur.refpointcomptage, web_compteur.dateinstall, web_compteur.codeemp, web_compteur.datedepose,
    NVL(web_indexconso.theindexf, web_indexconso.theindex) AS theindexf, web_indexconso.conso, web_indexconso.typecalcul,
    web_indexconso.code1, web_indexconso.code2, web_indexconso.code3, web_indexconso.code4, web_logement.pklogement
FROM web_indexconso, web_releve, web_immeuble, web_compteur, web_logement, web_occupant
WHERE web_indexconso.fkreleve = web_releve.pkreleve
    AND web_releve.fkimmeuble = web_immeuble.pkimmeuble
    AND web_indexconso.fkcompteur = web_compteur.pkcompteur
    AND web_compteur.fklogement = web_logement.pklogement
    AND web_occupant.fklogement = web_logement.pklogement
    AND web_releve.datereleve BETWEEN web_occupant.datearrivee AND web_occupant.datedepart
    AND web_logement.fkimmeuble = web_immeuble.pkimmeuble
    AND NVL(web_compteur.typecompteur, 'D') <> 'G' 
    AND web_releve.pkreleve = {pkreleve}
ORDER BY web_logement.numbatiment, web_logement.numescalier, web_logement.numetage, web_logement.numordre,
    web_compteur.numcompteur";
            DataRowCollection indexconsos = WS_DBUtils.utils_LER.DBSelectRows(sql);

            //int prevPKLOGEMENT = 0;

            foreach (DataRow indexconso in indexconsos)
            {
                try
                {
                    // le compteur n'a pas été remplacé depuis le dernier relevé --> on fait juste une ligne 2
                    if (!CompteurChange(indexconso))
                    {
                        ReleveLigne2 r2 = new ReleveLigne2(indexconso, false);
                        r.lignes2.Add(r2);
                    }

                    // le compteur a été remplacé depuis le dernier relevé --> on fait une ligne 2 sur l'ancien compteur puis une (des) ligne 4 sur le nv compteur
                    else
                    {
                        int fkcompteur = Convert.ToInt32(indexconso["PKCOMPTEUR"].ToString());
                        //on retrouve tout l'historique de changement depuis le dernier relevé
                        string sql2 = 
$@"SELECT NVL(theindexf, theindex) AS theindexf, NVL(conso, 0) AS conso, typecalcul, code1, code2, code3, code4, c2.refpointcomptage,
    web_immeuble.ID, web_immeuble.fkclienttop, web_logement.numbatiment AS numbat, web_logement.numescalier, c2.dateinstall, c2.datedepose,
    web_logement.numetage, web_logement.numordre, c2.numcompteur, web_releveinter.datereleve,
    web_immeuble.codegestio, web_occupant.nom, web_occupant.codelogegestio, c2.fluide, c2.numeroserie,
    c2.pkcompteur, c2.codeemp
FROM web_releveinter, web_compteur c1, web_compteur c2, web_immeuble, web_logement, web_occupant
WHERE web_releveinter.fkcompteur = c2.pkcompteur
    AND c1.pkcompteur = {fkcompteur}
    AND c1.fklogement = c2.fklogement
    AND c1.numcompteur = c2.numcompteur
    AND c1.pkcompteur<> c2.pkcompteur
    AND web_releveinter.datereleve BETWEEN {DateHistoReleve[1].QuotedStr()} AND {DateHistoReleve[0].QuotedStr()}
    AND web_occupant.fklogement = web_logement.pklogement
    AND web_releveinter.datereleve BETWEEN web_occupant.datearrivee AND web_occupant.datedepart
    AND c2.fklogement = web_logement.pklogement
    AND web_logement.fkimmeuble = web_immeuble.pkimmeuble
ORDER BY web_releveinter.datereleve";
                        DataRowCollection indexconsos_histo = WS_DBUtils.utils_LER.DBSelectRows(sql2);

                        if (indexconsos_histo.Count == 0)
                        {
                            // on a un nouveau compteur (posé depuis le relevé précédent, mais qui n'est pas issu d'un remplacement
                            // on crée juste une ligne 2
                            ReleveLigne2 r2 = new ReleveLigne2(indexconso, false);
                            r.lignes2.Add(r2);
                        }
                        else
                        {
                            // si on a des lignes 2, 4, 2, 4 
                            bool first = true;
                            ReleveLigne2 r2 = null;
                            foreach (DataRow indexconso_histo in indexconsos_histo)
                            {
                                if (CompteurChange(indexconso_histo))
                                {
                                    if (first)
                                    {
                                        first = false;
                                        r2 = new ReleveLigne2(indexconso_histo, false);
                                        r.lignes2.Add(r2);
                                    }
                                    else
                                    {
                                        ReleveLigne4 r42 = new ReleveLigne4(indexconso_histo, false);
                                        r2.lignes4.Add(r42);
                                    }
                                }
                            }

                            if (r2 != null)
                            {
                                ReleveLigne4 r4 = new ReleveLigne4(indexconso, false);
                                r2.lignes4.Add(r4);
                            }
                            else
                            {
                                r2 = new ReleveLigne2(indexconso, false);
                                r.lignes2.Add(r2);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    r.errrors += indexconso["NOM"] + "/" + indexconso["NUMEROSERIE"] + " : " + ex.Message + Environment.NewLine;
                }
            }

            #endregion
            return r;
#else
            #region Lignes 1
            SetDateHistoReleve(pkreleve, NCumul);
            DataRow relimm = WS_DBUtils.utils_LER.DBSelectRow("Select IMMEUBLE.ID, IMMEUBLE.CODEGESTIO from RELEVE, IMMEUBLE WHERE FKIMMEUBLE = PKIMMEUBLE and PKRELEVE = " + pkreleve.ToString());
            r.ligne1 = new ReleveLigne1();
            r.ligne1.refInterne = relimm["ID"].ToString();
            r.ligne1.dateReleve = DateHistoReleve[0];
            r.ligne1.dateReleveM1 = DateHistoReleve[1];
            r.ligne1.dateReleveM2 = DateHistoReleve[2];
            r.ligne1.dateReleveM3 = DateHistoReleve[3];
            r.ligne1.dateReleveM4 = DateHistoReleve[4];
            r.ligne1.refClientImm = relimm["CODEGESTIO"].ToString();
            #endregion

            #region Lignes 2
            string sql =
$@"SELECT IMMEUBLE.FKCLIENTTOP, IMMEUBLE.ID, IMMEUBLE.CODEGESTIO, BATIMENT.ID as NUMBAT, ESCALIER.NUMESCALIER,
LOGEMENT.NUMETAGE, LOGEMENT.NUMORDRE, OCCUPANT.NOM, OCCUPANT.CODELOGEGESTIO,
COMPTEUR.NUMCOMPTEUR, COMPTEUR.NUMEROSERIE, NVL(COMPTEUR.FKCRITERE, 2) AS FKCRITERE, COMPTEUR.PKCOMPTEUR,
COMPTEUR.REFPOINTCOMPTAGE, COMPTEUR.DATEINSTALL, CODEEMPLACEMENT.CODE as CODEEMP, COMPTEUR.DATEDEPOSE,
NVL(INDEXCONSO.THEINDEXF, INDEXCONSO.THEINDEX) AS THEINDEXF, INDEXCONSO.CONSO, INDEXCONSO.TYPECALCUL,
INDEXCONSO.CODE1, INDEXCONSO.CODE2, INDEXCONSO.CODE3, INDEXCONSO.CODE4, LOGEMENT.PKLOGEMENT,
COMPTEUR.CODECRGESTIO
FROM INDEXCONSO, RELEVE, IMMEUBLE, COMPTEUR, LOGEMENT, ESCALIER, BATIMENT,
OCCUPANT, CODEEMPLACEMENT
where INDEXCONSO.FKRELEVE = RELEVE.PKRELEVE
and RELEVE.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
and INDEXCONSO.FKCOMPTEUR = COMPTEUR.PKCOMPTEUR
and COMPTEUR.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and OCCUPANT.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and RELEVE.DATERELEVE between OCCUPANT.DATEARRIVEE and OCCUPANT.DATEDEPART
and LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT
and LOGEMENT.FKESCALIER = ESCALIER.PKESCALIER
and ESCALIER.FKBATIMENT = BATIMENT.PKBATIMENT
and COMPTEUR.FKCODEEMPLACEMENT = CODEEMPLACEMENT.PKCODEEMPLACEMENT 
and NVL(COMPTEUR.TYPECOMPTEUR, 'D') <> 'G' 
and RELEVE.PKRELEVE = {pkreleve}
ORDER BY BATIMENT.ID, ESCALIER.NUMESCALIER, LOGEMENT.NUMETAGE, LOGEMENT.NUMORDRE,
COMPTEUR.NUMCOMPTEUR";
            DataRowCollection indexconsos = WS_DBUtils.utils_LER.DBSelectRows(sql);

            int prevPKLOGEMENT = 0;

            foreach (DataRow indexconso in indexconsos)
            {
                try
                {
                    //pour SEQENS, on exporte les n° de compteur différement
                    //if (m.distinctNUMCOMPTEURCF)
                    //{
                    //    if (Convert.ToInt32(indexconso["PKLOGEMENT"].ToString()) != prevPKLOGEMENT)
                    //    {
                    //        NumCompteurC = 50;
                    //        NumCompteurF = 0;
                    //    }
                    //    prevPKLOGEMENT = Convert.ToInt32(indexconso["PKLOGEMENT"].ToString());
                    //    if (Convert.ToInt32(indexconso["FKCRITERE"].ToString()) == 1)
                    //        NumCompteurC++;
                    //    else NumCompteurF++;
                    //}
                    //// si on exporte pas les codes 72, on avance...
                    //if ((m.exportCode72 == false) && (indexconso["NUMEROSERIE"].ToString().ToUpper().Replace(" ", "") == "CODE72"))
                    //    continue;

                    // le compteur n'a pas été remplacé depuis le dernier relevé --> on fait juste une ligne 2
                    if (!CompteurChange(indexconso))
                    {
                        ReleveLigne2 r2 = new ReleveLigne2(indexconso, false);
                        r.lignes2.Add(r2);
                    }

                    // le compteur a été remplacé depuis le dernier relevé --> on fait une ligne 2 sur l'ancien compteur puis une (des) ligne 4 sur le nv compteur
                    else
                    {
                        int fkcompteur = Convert.ToInt32(indexconso["PKCOMPTEUR"].ToString());
                        //on retrouve tout l'historique de changement depuis le dernier relevé
                        string sql2 = $@"select NVL(THEINDEXF, THEINDEX) AS THEINDEXF, NVL(CONSO, 0) AS CONSO, TYPECALCUL, CODE1, CODE2, CODE3, CODE4, c2.REFPOINTCOMPTAGE,
IMMEUBLE.ID, IMMEUBLE.FKCLIENTTOP, BATIMENT.ID as NUMBAT, ESCALIER.NUMESCALIER, c2.DATEINSTALL, c2.DATEDEPOSE,
LOGEMENT.NUMETAGE, LOGEMENT.NUMORDRE, c2.NUMCOMPTEUR, RELEVEINTER.DATERELEVE,
IMMEUBLE.CODEGESTIO, OCCUPANT.NOM, OCCUPANT.CODELOGEGESTIO, NVL(c2.FKCRITERE, 2) AS FKCRITERE, c2.NUMEROSERIE,
c2.PKCOMPTEUR, CODEEMPLACEMENT.CODE as CODEEMP, c2.CODECRGESTIO
from RELEVEINTER, COMPTEUR c1, COMPTEUR c2, IMMEUBLE, LOGEMENT, ESCALIER, BATIMENT, OCCUPANT, CODEEMPLACEMENT
where RELEVEINTER.FKCOMPTEUR = c2.PKCOMPTEUR
and c1.PKCOMPTEUR = {fkcompteur}
and c1.FKLOGEMENT = c2.FKLOGEMENT
and c1.NUMCOMPTEUR = c2.NUMCOMPTEUR
and c1.PKCOMPTEUR<> c2.PKCOMPTEUR
and RELEVEINTER.DATERELEVE between {DateHistoReleve[1].QuotedStr()} and {DateHistoReleve[0].QuotedStr()}
and OCCUPANT.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and RELEVEINTER.DATERELEVE between OCCUPANT.DATEARRIVEE and OCCUPANT.DATEDEPART
and c2.FKLOGEMENT = LOGEMENT.PKLOGEMENT
and LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT
and LOGEMENT.FKESCALIER = ESCALIER.PKESCALIER
and ESCALIER.FKBATIMENT = BATIMENT.PKBATIMENT
and BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE
and c2.FKCODEEMPLACEMENT = CODEEMPLACEMENT.PKCODEEMPLACEMENT
order by RELEVEINTER.DATERELEVE";
                        DataRowCollection indexconsos_histo = WS_DBUtils.utils_LER.DBSelectRows(sql2);

                        if (indexconsos_histo.Count == 0)
                        {
                            // on a un nouveau compteur (posé depuis le relevé précédent, mais qui n'est pas issu d'un remplacement
                            // on crée juste une ligne 2
                            ReleveLigne2 r2 = new ReleveLigne2(indexconso, false);
                            r.lignes2.Add(r2);
                        }
                        else
                        //else if (m.lignes24format)
                        {
                            // si on a des lignes 2, 4, 2, 4 
                            bool first = true;
                            ReleveLigne2 r2 = null;
                            foreach (DataRow indexconso_histo in indexconsos_histo)
                            {
                                //if ((m.exportCode72 == false) && (indexconso_histo["NUMEROSERIE"].ToString().ToUpper().Replace(" ", "") == "CODE72"))
                                //    continue;

                                // si on est en mode de gestion des export de déposes, 
                                // on exporte pas les déposes qui ont déjà été exporté
                                //if (m.exportDepose)
                                //{
                                //    if (CompteurAExporte(indexconso_histo))
                                //        ExporteCompteur(indexconso_histo);
                                //    else continue;
                                //}

                                // on vérifie à nouveau si on est bien sur un compteur changé 
                                //car on pourrait récupérer des RI "normaux"
                                if (CompteurChange(indexconso_histo))
                                {
                                    if (first)
                                    {
                                        first = false;
                                        r2 = new ReleveLigne2(indexconso_histo, false);
                                        r.lignes2.Add(r2);
                                    }
                                    else
                                    {
                                        ReleveLigne4 r42 = new ReleveLigne4(indexconso_histo, false);
                                        r2.lignes4.Add(r42);
                                    }
                                }
                            }

                            if (r2 != null)
                            {
                                ReleveLigne4 r4 = new ReleveLigne4(indexconso, false);
                                r2.lignes4.Add(r4);
                            }
                            else
                            {
                                r2 = new ReleveLigne2(indexconso, false);
                                r.lignes2.Add(r2);
                            }
                        }
                        //else
                        //{
                        //    // si on a des lignes 2, 4, 2, 2, 4, 2
                        //    bool first = true;
                        //    ReleveLigne2 r2 = null;
                        //    foreach (DataRow indexconso_histo in indexconsos_histo)
                        //    {
                        //        if ((m.exportCode72 == false) && (indexconso_histo["NUMEROSERIE"].ToString().ToUpper().Replace(" ", "") == "CODE72"))
                        //            continue;

                        //        // si on est en mode de gestion des export de déposes, 
                        //        // on exporte pas les déposes qui ont déjà été exporté
                        //        if (m.exportDepose)
                        //        {
                        //            if (CompteurAExporte(indexconso_histo))
                        //                ExporteCompteur(indexconso_histo);
                        //            else continue;
                        //        }

                        //        // on vérifie à nouveau si on est bien sur un compteur changé 
                        //        //car on pourrait récupérer des RI "normaux"
                        //        if (CompteurChange(indexconso_histo))
                        //        {
                        //            if (first)
                        //            {
                        //                first = false;
                        //                r2 = new ReleveLigne2(indexconso_histo, m, false);
                        //                r.lignes2.Add(r2);
                        //            }
                        //            else
                        //            {
                        //                ReleveLigne4 r42 = new ReleveLigne4(indexconso_histo, m, true);
                        //                r2.lignes4.Add(r42);
                        //            }
                        //        }
                        //    }

                        //    ReleveLigne4 r4 = new ReleveLigne4(indexconso, m, true);
                        //    r2.lignes4.Add(r4);

                        //    r2 = new ReleveLigne2(indexconso, m, false);
                        //    r.lignes2.Add(r2);
                        //}

                    }
                }
                catch (Exception ex)
                {
                    r.errrors += indexconso["NOM"] + "/" + indexconso["NUMEROSERIE"] + " : " + ex.Message + Environment.NewLine;
                }
            }

            #endregion
            return r;
#endif
        }
        private static double CalcConso(DataRow h0, DataRow h1)
        {
            try
            {
                if (h1 == null)
                    return Convert.ToDouble(h0["THEINDEXF"].ToString());
                else return Convert.ToDouble(h0["THEINDEXF"].ToString()) - Convert.ToDouble(h1["THEINDEXF"].ToString());
            }
            catch
            { return Convert.ToDouble(h0["CONSO"].ToString()); }

        }
        public static string GetTypeERC(int fk, string fkType, bool chauffage = false)
        {
            DataRowCollection rows = null;
            if (fkType == "I")
            {
                rows = WS_DBUtils.utils_LER.DBSelectRows(
                    $@"SELECT conditionpart.typeerc
                    FROM commande_immeuble, commande, conditionpart
                    WHERE conditionpart.fk = commande_immeuble.fkcommande AND conditionpart.type = 'C'
                    and commande.pkcommande = commande_immeuble.fkcommande
                    and commande.actif='O'
                    AND conditionpart.typeerc || 'z' <> 'z'
                    {(chauffage ? "AND conditionpart.typeerc in ('REPARTITEUR', 'CET', 'REPARTITEUR_SANS_RAZ') " : "")}
                    AND commande_immeuble.fkimmeuble = {fk} ");
            }

            else if (fkType == "C")
            {
                rows = WS_DBUtils.utils_LER.DBSelectRows(
                    $@"SELECT conditionpart.typeerc
                    FROM commande, conditionpart
                    WHERE conditionpart.FK = commande.pkcommande 
                    AND conditionpart.type = 'C'
                    AND commande.actif='O'
                    AND conditionpart.typeerc || 'z' <> 'z'
                    {(chauffage ? "AND conditionpart.typeerc in ('REPARTITEUR', 'CET', 'REPARTITEUR_SANS_RAZ') " : "")}
                    AND commande.pkcommande = {fk} ");
            }

            else if (fkType == "O")
            {
                rows = WS_DBUtils.utils_LER.DBSelectRows(
                    $@"select decode(ARTICLE.fksousfamille, 
                    86, 'CET', 
                    185, 'REPARTITEUR',
                    82, 'EAU',
                    181, 'EAU') as TYPEERC
                    from v_crsimm, article
                    where 
                    pkoccupant = {fk}
                    and ARTICLE.pkarticle = v_crsimm.fkarticle
                    {(chauffage ? "AND ARTICLE.fksousfamille in (86, 185) " : "")}
                    group by fksousfamille
                    order by count(*) desc
                    fetch first 1 rows only");
            }

            if (rows == null) return "";
            if (rows.Count == 0)
                return "EAU";
            else if (rows.Count > 1)
                return "";
            else if (rows[0]["TYPEERC"].ToString() == "")
                return "EAU";
            else return rows[0]["TYPEERC"].ToString();
        }
    }

}