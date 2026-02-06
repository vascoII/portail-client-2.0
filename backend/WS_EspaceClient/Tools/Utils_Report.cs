using DevExpress.CodeParser;
using DevExpress.Pdf;
using DevExpress.Utils.CommonDialogs.Internal;
using DevExpress.XtraEditors;
using DevExpress.XtraPrinting;
using DevExpress.XtraPrinting.Export.Pdf;
using DevExpress.XtraReports.UI;
using DevExpress.XtraRichEdit;
using DevExpress.XtraRichEdit.API.Native;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Techem.LER.LER_PrintPlugin;
using Techem.Webservices.WS_EspaceClient.Reports;
using Tools;

namespace Techem.Webservices.WS_EspaceClient.Tools
{
    public static class Utils_Report
    {
        
        public static XtraReport CombineReports(XtraReport r1, XtraReport r2)
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
        public static XtraReport CombineReports(List<XtraReport> listReport)
        {
            if (listReport == null)
                return null;

            XtraReport mainReport = null;

            foreach (XtraReport actualReport in listReport)
                mainReport = CombineReports(mainReport, actualReport);
            return mainReport;
        }
        public static string CompileAdresse(string nom, string adr1 = "", string adr2 = "", string adr3 = "", string CP = "", string ville = "", string separator = "")
        {
            if (separator == "")
                separator = Environment.NewLine;
            string adr = "";
            if (!string.IsNullOrEmpty(nom))
                adr += nom + separator;
            if (!string.IsNullOrEmpty(adr1))
                adr += adr1 + separator;
            if (!string.IsNullOrEmpty(adr2))
                adr += adr2 + separator;
            if (!string.IsNullOrEmpty(adr3))
                adr += adr3 + separator;
            if (!string.IsNullOrEmpty(CP + ville))
                adr += CP + " " + ville;

            return adr.Trim();
        }

        /// <summary>
        /// permet de remplacer oldText par newText dans tous 
        /// les XRLabel et les XRRichText d'un report
        /// </summary>
        /// <param name="report"></param>
        /// <param name="oldText">le texte à remplacer</param>
        /// <param name="newText">le texte à insérer</param>
        public static void ReplaceText(XtraReport report, string oldText, string newText)
        {
            foreach (XRLabel label in report.AllControls<XRLabel>())
                label.Text = label.Text.Replace(oldText, newText);

            foreach (XRRichText richText in report.AllControls<XRRichText>())
            {
                RichEditDocumentServer richEditDocumentServer = new RichEditDocumentServer
                {
                    RtfText = richText.Rtf
                };
                richEditDocumentServer.Document.ReplaceAll(oldText, newText, DevExpress.XtraRichEdit.API.Native.SearchOptions.None);
                richText.Rtf = richEditDocumentServer.RtfText;
            }
        }

        public static List<string> GetParametersInText(string text)
        {
            string pattern = @"\[.*?\]";
            string input = text;
            RegexOptions options = RegexOptions.IgnoreCase;

            List<string> r = new List<string>();
            foreach (System.Text.RegularExpressions.Match m in Regex.Matches(input, pattern, options))
                r.Add(m.Value);
            return r;
        }

        public static void ReplaceParametersInLabel(XRLabel label, string codeEnt)
        {
            List<string> parameters = GetParametersInText(label.Text);
            foreach (string fieldName in parameters)
            {
                label.Text = label.Text.Replace(fieldName, Utils_Entreprise.GetFieldValue(codeEnt, fieldName));
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
                        Utils_Entreprise.GetFieldValue(codeEnt, fieldName),
                        DevExpress.XtraRichEdit.API.Native.SearchOptions.None);
                    richText.Rtf = richEditDocumentServer.RtfText;
                }
            }

        }
}
}
