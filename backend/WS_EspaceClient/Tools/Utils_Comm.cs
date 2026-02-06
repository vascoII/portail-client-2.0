using DevExpress.Office.Utils;
using DevExpress.XtraEditors;
using DevExpress.XtraReports.UI;
using DevExpress.XtraRichEdit.Model;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Tools;

namespace Techem.Webservices.WS_EspaceClient.Tools
{
    public static class Utils_Comm
    {
        public class LigneArticle
        {
            public bool hasValue = false;
            public string erreur;
            public bool obligatoire = false;
            public string designation;
            public string designationComm;
            public decimal tva;
            public string tva_s;
            public int quantite;
            public decimal u_HT;
            public string u_HT_s;
            public decimal u_TTC;
            public string u_TTC_s;
            public decimal total_HT;
            //public string total_HT_s;
            public decimal total_TTC;
            //public string total_TTC_s;
        }

        public static decimal GetMontantContrat(int fkdevis, int fkimmeuble = -1)
        {
            string r = WS_DBUtils.utils_LER.DBSelect(
                $@"SELECT SUM(NVL(PRIXU, 0)*NVL(NBCOMPTEURS, 0)) as HT
FROM LIGNES
WHERE FK = {fkdevis} 
AND TYPELIGNE = 'D'
AND TYPEPRESTATION IN ('L', 'E', 'R')
{(fkimmeuble == -1 ? "" : $@"AND FKIMM = {fkimmeuble}")}");

            return r.ToDecimalOrDefault(0);
        }

        public static decimal GetMontantPose(int fkdevis, int fkimmeuble = -1)
        {
            string r = WS_DBUtils.utils_LER.DBSelect(
                $@"SELECT SUM(NVL(PRIXU, 0)*NVL(NBCOMPTEURS, 0)) as HT
FROM LIGNES
WHERE FK = {fkdevis} 
AND TYPELIGNE = 'D'
AND TYPEPRESTATION IN ('P')
{(fkimmeuble == -1 ? "" : $@"AND FKIMM = {fkimmeuble}")}");

            return r.ToDecimalOrDefault(0);
        }

        public static void AddRowCell(XRTableRow row, string value, int width, string image, string style, int rowHeight, Color foreColor)
        {
            XRTableCell cell = new XRTableCell();
            cell.Text = value;
            cell.Width = width;
            cell.Height = rowHeight;
            cell.CanGrow = true;

            if (!string.IsNullOrEmpty(image))
            {
                XRLabel label = new XRLabel();
                //label.CanGrow = true;
                label.Text = value;

                label.Padding = new DevExpress.XtraPrinting.PaddingInfo(30, 30, 0, 0);
                label.Height = rowHeight;
                label.Borders = DevExpress.XtraPrinting.BorderSide.None;
                label.Width = width - 60;
                label.Multiline = true;
                cell.Controls.Add(label);

                //XRPictureBox p = new XRPictureBox();
                //if (image == "COCHE")
                //    p.Image = imageCoche;
                //else
                //    p.Image = imageDeCoche;

                //p.Width = 20;
                //p.Height = 16;
                //p.BorderWidth = 1;
                //p.Sizing = DevExpress.XtraPrinting.ImageSizeMode.StretchImage;
                //p.Left = 4;
                //p.Top = 12;
                //cell.Controls.Add(p);

                XRLabel xrLabel = new XRLabel()
                {
                    //Text = (image == "COCHE"? "✓" : ""),
                    Text = (image == "COCHE" ? "x" : ""),
                    CanGrow = false,
                    BorderColor = System.Drawing.Color.Red,
                    Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) | DevExpress.XtraPrinting.BorderSide.Right) | DevExpress.XtraPrinting.BorderSide.Bottom))),
                    BorderWidth = 2F,
                    Dpi = 254F,
                    Font = new System.Drawing.Font("Arial Narrow", 14.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0))),
                    ForeColor = System.Drawing.Color.Red,
                    Left = 4,
                    Top = 12,
                    Multiline = true,
                    Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0, 254F),
                    SizeF = new System.Drawing.SizeF(50F, 50F),
                    TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter
                };
                cell.Controls.Add(xrLabel);

                cell.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;

            }
            else
                cell.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;

            if (style == "ENTETE")
                cell.Font = new Font(cell.Font.FontFamily, cell.Font.Size, FontStyle.Bold);

            if (style == "TOTAL")
            {
                cell.Font = new Font("Arial", 10, FontStyle.Bold, GraphicsUnit.Point);
                cell.ForeColor = foreColor;// Color.Red;
            }
            if (style == "GRAS")
                cell.Font = new Font("Arial", 10, FontStyle.Bold, GraphicsUnit.Point);


            if (style == "DEBUT OPTIONS")
            {
                cell.Font = new Font("Arial", 10, FontStyle.Bold, GraphicsUnit.Point);
                cell.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
                cell.BackColor = Color.Gainsboro;
            }

            row.Cells.Add(cell);

        }
        public static void AddTableRow(XRTable table, LigneArticle ligne, int rowHeight)
        {
            if (!ligne.hasValue)
                return;
            XRTableRow row0 = table.Rows[0];
            XRTableRow row = new XRTableRow();
            string coche;
            if (ligne.obligatoire)
                coche = "COCHE";
            else
                coche = "DECOCHE";
            AddRowCell(row, ligne.designationComm, row0.Cells[0].Width, coche, "", rowHeight, Color.Black);
            AddRowCell(row, ligne.tva_s, row0.Cells[1].Width, "", "", rowHeight, Color.Black);
            AddRowCell(row, ligne.quantite.ToString(), row0.Cells[2].Width, "", "", rowHeight, Color.Black);

            string prix;
            if (ligne.u_HT == 0)
                prix = "Offert";
            else
                prix = ligne.u_HT_s;
            AddRowCell(row, prix, row0.Cells[3].Width, "", "", rowHeight, Color.Black);

            if (ligne.u_TTC == 0)
                prix = "Offert";
            else
                prix = ligne.u_TTC_s;
            AddRowCell(row, prix, row0.Cells[4].Width, "", "", rowHeight, Color.Black);

            if (row0.Cells.Count > 4)
            {
                if (ligne.u_HT == 0)
                    prix = "Offert";
                else
                    prix = (ligne.quantite * ligne.u_HT).ToString("0.00 €");
                AddRowCell(row, prix, row0.Cells[5].Width, "", "", rowHeight, Color.Black);
            }
            if (row0.Cells.Count > 5)
            {
                if (ligne.u_TTC == 0)
                    prix = "Offert";
                else
                    prix = (ligne.quantite * ligne.u_TTC).ToString("0.00 €");
                AddRowCell(row, prix, row0.Cells[6].Width, "", "", rowHeight, Color.Black);
            }
            row.Height = rowHeight;
            table.Rows.Add(row);
        }

        public static int getIntFieldLigne(int pkDevis, int pkImmeuble, int fkArticle, string typePrestation, string field)
        {
            int res = -1;
            try
            {
                string query = string.Format("select {0} from LIGNES where TYPELIGNE='D' and TYPEPRESTATION='{1}' and FKARTICLE={2} and FK={3} and FKIMM={4}",
                    field, typePrestation, fkArticle, pkDevis, pkImmeuble);
                res = Convert.ToInt32(WS_DBUtils.utils_LER.DBSelect(query));
            }
            catch
            {
            }
            return res;
        }
        public static decimal appliqueTVA(decimal pu, int nb, decimal tva)
        {
            decimal v;
            v = Math.Round(Convert.ToDecimal(pu) * nb * (1 + Convert.ToDecimal(tva) / 100), 2, MidpointRounding.AwayFromZero);
            return v;
        }

        public static LigneArticle getLigneArticle(int pkDevis, int pkImmeuble, int fkArticle, string typePrestation)
        {
            LigneArticle ligne = new LigneArticle();

            ligne.tva = getDecFieldLigne(pkDevis, pkImmeuble, fkArticle, typePrestation, "TVA");
            ligne.tva_s = string.Format("{0:0.0}", ligne.tva) + " %";

            ligne.u_HT = getDecFieldLigne(pkDevis, pkImmeuble, fkArticle, typePrestation, "PRIXU");
            ligne.u_HT_s = string.Format("{0:0.00}", ligne.u_HT) + " €";

            ligne.u_TTC = appliqueTVA(ligne.u_HT, 1, ligne.tva);
            ligne.u_TTC_s = string.Format("{0:0.00}", ligne.u_TTC) + " €";
            return ligne;
        }

        public static LigneArticle getLigneArticleCET(int pkDevis, int pkImmeuble, string typePrestation)
        {
            LigneArticle ligne = new LigneArticle();

            string sql = $@"
SELECT TVA, PRIXU, NBCOMPTEURS
FROM lignes, article 
WHERE 
typeligne='D' 
AND TYPEPRESTATION={typePrestation.QuotedStr()}
AND FKARTICLE= pkarticle
AND article.fksousfamille = 86
AND FK={pkDevis} 
AND FKIMM={pkImmeuble}";

            DataRow r = WS_DBUtils.utils_LER.DBSelectRow(sql);
            ligne.tva = r["TVA"].ToString().ToDecimalOrDefault();
            ligne.tva_s = string.Format("{0:0.0}", ligne.tva) + " %";

            ligne.u_HT = r["PRIXU"].ToString().ToDecimalOrDefault();
            ligne.u_HT_s = string.Format("{0:0.00}", ligne.u_HT) + " €";

            ligne.u_TTC = appliqueTVA(ligne.u_HT, 1, ligne.tva);
            ligne.u_TTC_s = string.Format("{0:0.00}", ligne.u_TTC) + " €";

            ligne.quantite = r["NBCOMPTEURS"].ToString().ToInt32OrDefault(0);
            return ligne;
        }

        public static List<LigneArticle> GetLigneArticlePoseCET(int pkDevis, int pkImmeuble)
        {
            List<LigneArticle> res = new List<LigneArticle>();

            string sql = $@"
SELECT lignes.nbcompteurs, pkarticle, codearticle, fksousfamille, article.designation, article.designationcomm, 
lignes.prixu, lignes.tva, lignes.isoption
FROM lignes, article 
WHERE 
typeligne='D' 
AND typeprestation='P' 
AND fkarticle= pkarticle
AND fk={pkDevis} 
AND fkimm={pkImmeuble}
AND article.fksousfamille <> 221
ORDER BY DECODE(fksousfamille, 86, 1, 80, 2, 3)";

            DataTable dt = WS_DBUtils.utils_LER.DBSelectTable(sql);

            foreach (DataRow dr in dt.Rows)
            {
                LigneArticle ligne = new LigneArticle();
                ligne.hasValue = true;
                ligne.tva = dr["TVA"].ToString().ToDecimalOrDefault();
                ligne.tva_s = string.Format("{0:0.0}", ligne.tva) + " %";
                ligne.quantite = dr["NBCOMPTEURS"].ToString().ToInt32OrDefault();

                if (dr["FKSOUSFAMILLE"].ToString().ToInt32OrDefault() == 86) // CET
                {
                    ligne.designation = "Pose de " + dr["DESIGNATION"].ToString().Trim();
                    ligne.designationComm = "Pose de " + dr["DESIGNATIONCOMM"].ToString().Trim();
                }
                else
                {
                    ligne.designation = dr["DESIGNATION"].ToString().Trim();
                    ligne.designationComm = dr["DESIGNATIONCOMM"].ToString().Trim();
                }
                if (string.IsNullOrEmpty(ligne.designationComm) || (ligne.designationComm == "Pose de "))
                    ligne.designationComm = ligne.designation;
                if (dr["PKARTICLE"].ToString().ToInt32OrDefault() == 1589) // CET
                {
                    ligne.designation += "**";
                    ligne.designationComm += "**";
                }

                ligne.obligatoire = !dr["ISOPTION"].ToString().ToBooleanOrDefault(false);
                ligne.u_HT = dr["PRIXU"].ToString().ToDecimalOrDefault();
                ligne.u_HT_s = string.Format("{0:0.00}", ligne.u_HT) + " €";
                ligne.u_TTC = appliqueTVA(ligne.u_HT, 1, ligne.tva);
                ligne.u_TTC_s = string.Format("{0:0.00}", ligne.u_TTC) + " €";
                ligne.total_HT = ligne.quantite * ligne.u_HT;
                ligne.total_TTC = ligne.quantite * ligne.u_TTC;
                res.Add(ligne);
            }

            return res;
        }

        public static LigneArticle GetLigneArticleEau(int pkDevis, int pkImmeuble, string typePrestation, string codeArticle, string fluideArticle, int quantite, string fluideLigne)
        {
            LigneArticle ligne = new LigneArticle();
            string query = string.Format("select DISTINCT PKARTICLE, NBCOMPTEURS, DESIGNATION, DESIGNATIONCOMM, ISOPTION from LIGNES, ARTICLE " +
                " where TYPELIGNE='D' and TYPEPRESTATION='{0}' and CODEARTICLE='{1}' and LIGNES.FK={2} and FKIMM={3}" +
                " and LIGNES.FKARTICLE = ARTICLE.PKARTICLE", typePrestation, codeArticle, pkDevis, pkImmeuble);

            if (!string.IsNullOrEmpty(fluideArticle))
            {
                if (fluideArticle == "EC")
                    query += " and fkcritere=1";
                else
                    query += " and fkcritere=2";
            }
            if (!string.IsNullOrEmpty(fluideLigne))
            {
                if (fluideLigne == "EC")
                    query += " and fkcritereL=1";
                else
                    query += " and fkcritereL=2";
            }
            DataRowCollection drc = WS_DBUtils.utils_LER.DBSelectRows(query);
            if (drc.Count == 0)
                return ligne;
            else if (drc.Count > 1)
            {
                ligne.erreur = "plusieurs lignes trouvées pour : " + codeArticle;
                return ligne;
            }
            else
            {
                ligne.hasValue = true;
                int fkArticle = drc[0]["PKARTICLE"].ToString().ToInt32OrDefault();
                ligne.tva = getDecFieldLigne(pkDevis, pkImmeuble, fkArticle, typePrestation, "TVA");
                ligne.tva_s = string.Format("{0:0.0}", ligne.tva) + " %";

                if (quantite >= 0)
                    ligne.quantite = quantite;
                else
                    ligne.quantite = Convert.ToInt32(drc[0]["NBCOMPTEURS"].ToString());

                ligne.designation = drc[0]["DESIGNATION"].ToString().Trim();
                ligne.designationComm = drc[0]["DESIGNATIONCOMM"].ToString().Trim();
                if (string.IsNullOrEmpty(ligne.designationComm))
                    ligne.designationComm = ligne.designation;

                if (drc[0]["ISOPTION"].ToString().ToBooleanOrDefault(false))
                    ligne.obligatoire = false;
                else
                    ligne.obligatoire = true;


                ligne.u_HT = getDecFieldLigne(pkDevis, pkImmeuble, fkArticle, typePrestation, "PRIXU");
                ligne.u_HT_s = string.Format("{0:0.00}", ligne.u_HT) + " €";

                ligne.u_TTC = appliqueTVA(ligne.u_HT, 1, ligne.tva);
                ligne.u_TTC_s = string.Format("{0:0.00}", ligne.u_TTC) + " €";

                ligne.total_HT = ligne.quantite * ligne.u_HT;
                //ligne.total_HT_s = string.Format("{0:0.00}", ligne.total_HT) + " €";

                ligne.total_TTC = ligne.quantite * ligne.u_TTC;
                //ligne.total_TTC_s = string.Format("{0:0.00}", ligne.total_TTC) + " €";

            }

            return ligne;
        }

        public static decimal getDecFieldLigne(int pkDevis, int pkImmeuble, int fkArticle, string typePrestation, string field)
        {
            decimal res = (decimal)-1;
            try
            {
                string query = string.Format("select {0} from LIGNES where TYPELIGNE='D' and TYPEPRESTATION='{1}' and FKARTICLE={2} and FK={3} and FKIMM={4}",
                    field, typePrestation, fkArticle, pkDevis, pkImmeuble);

                res = Convert.ToDecimal(WS_DBUtils.utils_LER.DBSelect(query));
            }
            catch
            {
            }
            return res;
        }

    }
}
