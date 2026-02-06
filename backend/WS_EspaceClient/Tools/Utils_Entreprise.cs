using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Drawing;

namespace Techem.Webservices.WS_EspaceClient.Tools
{
    public static class Utils_Entreprise
    {
        public static DataTable entreprises = WS_DBUtils.utils_LER.DBSelectTable("SELECT * FROM entreprise");

        public static string GetCodeEntClient(int fkclient)
        {
            return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT client.codeent 
FROM client 
WHERE client.pkclient = {fkclient}");
        }

        public static string GetCodeEntIDClient(string idclient)
        {
            return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT client.codeent 
FROM client 
WHERE client.id = {idclient}");
        }

        public static string GetCodeEntImmeuble(int fkimmeuble)
        {
            return WS_DBUtils.utils_LER.DBSelect(
$@"SELECT client.codeent 
FROM IMMEUBLE, CLIENT 
WHERE pkimmeuble ={fkimmeuble}
AND client.pkclient = immeuble.fkclient");
        }

        public static string GetCodeEntChantier(int pkchantier)
        {
            return WS_DBUtils.utils_LER.DBSelect(
            $@"SELECT client.codeent
            FROM CHANTIER, immeuble, client
            WHERE chantier.pkchantier = {pkchantier}
                and chantier.fkimmeuble = immeuble.pkimmeuble
                and immeuble.fkclient=client.pkclient");
        }

        public static string GetFieldValue(string CodeENT, string FieldName)
        {
            FieldName = FieldName.ToUpper();
            FieldName = FieldName.
                Replace("ENTREPRISE.", "").
                Replace("[", "").
                Replace("]", "");

            if (CodeENT == "") CodeENT = "TCH";
            DataRow ent = entreprises.AsEnumerable().Where(myRow => myRow.Field<string>("CODEENT") == CodeENT).First();
            if (ent.Table.Columns.IndexOf(FieldName) == -1) return "";
            return ent[FieldName].ToString();
        }
        public static string GetNom(string CodeENT)
        {
            return GetFieldValue(CodeENT, "LIBELLE");
        }
        public static string GetSIRET(string CodeENT)
        {
            return GetFieldValue(CodeENT, "SIRET").Replace(" ", "");
        }
        public static string GetSIREN(string CodeENT)
        {
            return GetFieldValue(CodeENT, "SIREN").Replace(" ", "");
        }
        public static string GetNumTVA(string CodeENT)
        {
            return GetFieldValue(CodeENT, "NUM_TVA_INTRACOM").Replace(" ", "");
        }
        public static string GetAdresse1(string CodeENT)
        {
            return GetFieldValue(CodeENT, "ADRESSE1");
        }
        public static string GetAdresse2(string CodeENT)
        {
            return GetFieldValue(CodeENT, "ADRESSE2");
        }
        public static string GetAdresse3(string CodeENT)
        {
            return GetFieldValue(CodeENT, "ADRESSE3");
        }
        public static string GetCodePostal(string CodeENT)
        {
            return GetFieldValue(CodeENT, "CP");
        }
        public static string GetVille(string CodeENT)
        {
            return GetFieldValue(CodeENT, "VILLE");
        }
        public static Image GetLogo1(string CodeENT)
        {
            if (CodeENT == "") CodeENT = "TCH";
            DataRow ent = entreprises.AsEnumerable().Where(myRow => myRow.Field<string>("CODEENT") == CodeENT).First();
            byte[] logo = ent["LOGO1"] as byte[];
            if (logo == null) return null;
            return Image.FromStream(new System.IO.MemoryStream(logo));
        }
        public static Image GetLogo2(string CodeENT)
        {
            if (CodeENT == "") CodeENT = "TCH";
            DataRow ent = entreprises.AsEnumerable().Where(myRow => myRow.Field<string>("CODEENT") == CodeENT).First();
            byte[] logo = ent["LOGO2"] as byte[];
            if (logo == null) return null;
            return Image.FromStream(new System.IO.MemoryStream(logo));
        }
        public static string GetEntete(string CodeENT)
        {
            return GetFieldValue(CodeENT, "DOCUMENT_ENTETE");
        }
        public static string GetPiedDePage(string CodeENT)
        {
            return GetFieldValue(CodeENT, "DOCUMENT_PIED");
        }
        public static string GetPiedDePage2(string CodeENT)
        {
            return GetFieldValue(CodeENT, "DOCUMENT_PIED2");
        }
        public static string GetFacturePiedDePage(string CodeENT)
        {
            return GetFieldValue(CodeENT, "FACTURE_PIED");
        }
        public static string GetFactureModeRegl(string CodeENT)
        {
            return GetFieldValue(CodeENT, "FACTURE_MODEREGL");
        }
        public static Color GetColor(string CodeENT)
        {
            return ColorTranslator.FromHtml(GetFieldValue(CodeENT, "HTMLCOLOR"));
        }
        public static string GetWebsite(string CodeENT)
        {
            return GetFieldValue(CodeENT, "WEBSITE");
        }
        public static bool GetEspaceClientActif(string CodeENT)
        {
            return GetFieldValue(CodeENT, "ESPACECLIENT_ACTIF") == "O";
        }
        public static bool GetReleveEntete(string CodeENT)
        {
            return GetFieldValue(CodeENT, "RELEVE_ENTETE") == "O";
        }
        public static bool GetReleveHistogramme(string CodeENT)
        {
            return GetFieldValue(CodeENT, "RELEVE_HISTOGRAMME") == "O";
        }
        public static bool GetReleveListing(string CodeENT)
        {
            return GetFieldValue(CodeENT, "RELEVE_LISTING") == "O";
        }


    }
}