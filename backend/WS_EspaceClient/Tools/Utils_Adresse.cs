using System;
using System.Data;

namespace Techem.Webservices.WS_EspaceClient
{
    public static class Utils_Adresse
    {
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

                if (tiersSize > twoTiersEnd.Length)
                    retChaine = firstTiers + twoTiersEnd;
                else
                {
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
            }
            else
            {
                retChaine = chaine;
            }
            return retChaine;
        }

        public static string getAdresseOccupant(int pkOccupant)
        {
            string sql = "SELECT  nvl(ESCALIER.ADRESSEESC, nvl(BATIMENT.ADRESSE, IMMEUBLE.ADRESSE)) as ADRESSE, " +
                "IMMEUBLE.CP, IMMEUBLE.VILLE, TRIM(OCCUPANT.NOM) AS NOM " +
                "FROM BATIMENT, IMMEUBLE, LOGEMENT, OCCUPANT, ESCALIER " +
                "WHERE BATIMENT.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE " +
                "and LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT " +
                "and ESCALIER.FKBATIMENT = BATIMENT.PKBATIMENT " +
                "and LOGEMENT.FKESCALIER = ESCALIER.PKESCALIER " +
                "and OCCUPANT.FKLOGEMENT = LOGEMENT.PKLOGEMENT " +
                "and OCCUPANT.PKOCCUPANT = " + pkOccupant.ToString();
            DataRow occRow = WS_DBUtils.utils_LER.DBSelectRow(sql);
            string adresseOcc = "";
            if (!string.IsNullOrEmpty(occRow["NOM"].ToString()))
                adresseOcc = occRow["NOM"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(occRow["ADRESSE"].ToString()))
                adresseOcc += occRow["ADRESSE"] + Environment.NewLine;

            adresseOcc += occRow["CP"] + " " + occRow["VILLE"];
            return adresseOcc;
        }
        public static string getAdresseImmeuble(int pkImmeuble)
        {
            DataRow immRow = WS_DBUtils.utils_LER.DBSelectRow(
                "SELECT PKIMMEUBLE, CODEGESTIO, ID, NOM, ADRESSE, ADRESSE2, ADRESSE3, CP, VILLE " +
                "FROM IMMEUBLE WHERE PKIMMEUBLE=" + pkImmeuble);

            // affichage adresse immeuble
            string adresseImm = "";
            if (!string.IsNullOrEmpty(immRow["NOM"].ToString()))
                adresseImm = immRow["NOM"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(immRow["ADRESSE"].ToString()))
                adresseImm += immRow["ADRESSE"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(immRow["ADRESSE2"].ToString()))
                adresseImm += immRow["ADRESSE2"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(immRow["ADRESSE3"].ToString()))
                adresseImm += immRow["ADRESSE3"] + Environment.NewLine;

            adresseImm += immRow["CP"] + " " + immRow["VILLE"];
            return adresseImm;
        }

        public static string getAdresseClient(int pkClient, bool AddPhoneNumber = false)
        {
            DataRow clientRow = WS_DBUtils.utils_LER.DBSelectRow("select PKCLIENT, ID, NOM, ADRESSE1, ADRESSE2, ADRESSE3, CP, VILLE, TEL from client where pkclient=" + pkClient);

            string adresseClient = "";
            if (!string.IsNullOrEmpty(clientRow["NOM"].ToString()))
                adresseClient += clientRow["NOM"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(clientRow["ADRESSE1"].ToString()))
                adresseClient += clientRow["ADRESSE1"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(clientRow["ADRESSE2"].ToString()))
                adresseClient += clientRow["ADRESSE2"] + Environment.NewLine;
            if (!string.IsNullOrEmpty(clientRow["ADRESSE3"].ToString()))
                adresseClient += clientRow["ADRESSE3"] + Environment.NewLine;
            adresseClient += clientRow["CP"] + " " + clientRow["VILLE"] + Environment.NewLine;

            if (AddPhoneNumber && !string.IsNullOrEmpty(clientRow["TEL"].ToString()))
                adresseClient += "Tél. : " + clientRow["TEL"];


            return adresseClient;
        }

    }
}
