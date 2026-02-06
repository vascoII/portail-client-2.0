using MongoDB.Bson;
using System;
using System.Collections;
using System.Data;
using Techem.DBUtils.Mongo;
using Tools;

namespace Techem.Webservices.WS_EspaceClient
{
    static public partial class WS_Common
    {
        #region tools
        private static string Crypte(string input)
        {
            string output = "";
            int pos = 0;
            string enc;
            foreach (char c in input)
            {
                if ((pos % 2) == 0)

                    enc = Convert.ToString(((int)c), 16) + "J";
                else
                    enc = Convert.ToString(((int)c), 8) + "J";

                output += enc;
                pos++;
            }
            return output.Trim("J".ToCharArray());
        }

        public static string Decrypte(string input)
        {
            string output = "";
            try
            {
                int pos = 0;
                if (input == "")
                    return "";

                string dec = "";
                string[] tab = input.Split("J".ToCharArray());
                foreach (string s in tab)
                {
                    if ((pos % 2) == 0)
                        dec = Convert.ToChar(Convert.ToInt32(s, 16)).ToString();
                    else
                    {
                        dec = Convert.ToChar(Convert.ToInt32(s, 8)).ToString();
                    }

                    output += dec;
                    pos++;
                }
            }
            catch { }

            return output;
        }
        public static string GetTchWeekPassword(DateTime Date)
        {
            //int numSem = Date.num
            string pwd = "";
            int numSem = GetIso8601WeekOfYear(Date);
            int numAnnee = Date.Year;
            int numMois = Date.Month;
            int numDay = Date.Day;

            if (numMois == 1 && numDay < 8)// pour éviter pwd qui change en cours de semaine 1er janvier
                numAnnee = numAnnee - 1;

            string annee = numAnnee.ToString().Substring(2, 2);
            string sem = numSem.ToString().PadLeft(2, '0');
            string source;
            if ((numSem % 2) == 0)
                source = annee + sem;
            else
                source = sem + annee;

            //source = annee + numsemaine ou inverse

            int startAlpha = 99 + (numSem % 4); // code ascii 99 (lettre c)
            foreach (char c in source)
            {
                int asc = Convert.ToInt32(c.ToString());
                pwd += Convert.ToChar(startAlpha + asc);
            }
            pwd += ((numSem * 3) % 99).ToString().PadLeft(2, '0');
            return pwd;
        }

        // This presumes that weeks start with Monday.
        // Week 1 is the 1st week of the year with a Thursday in it.
        public static int GetIso8601WeekOfYear(DateTime time)
        {
            // Seriously cheat.  If its Monday, Tuesday or Wednesday, then it'll 
            // be the same week# as whatever Thursday, Friday or Saturday are,
            // and we always get those right
            DayOfWeek day = System.Globalization.CultureInfo.InvariantCulture.Calendar.GetDayOfWeek(time);
            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }

            // Return the week of our adjusted day
            return System.Globalization.CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }

        #endregion       

        #region METIER

        public enum IndexTypeFk //fkindextype
        {
            Default = 0,
            Average = 1,
            Min = 2,
            Max = 3
        }

        public enum UnitesFk //fkUnite
        {
            Temperature = 9,
            Humidite = 10
        }

        public static string GetNomFluideByPk(int PkCritere)
        {
            switch (PkCritere)
            {
                case 1: return "EC";
                case 2: return "EF";
                default: return "Autre fluide";
            }
        }
        public static string GetFluidesFilter(string Fluides)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur
#if WS2
            if (Fluides == "")
                return "";

            Fluides = "+" + Fluides.ToUpper().Trim() + "+";
            string Filter = " web_compteur.fluide in (";

            if (Fluides.IndexOf("+EC+") >= 0)
                Filter += "'EC',";

            if (Fluides.IndexOf("+EF+") >= 0)
                Filter += "'EF',";

            Filter = Filter.Trim(",".ToCharArray());
            Filter += ")";

            return Filter;
#else
            if (Fluides == "")
                return "";

            Fluides = "+" + Fluides.ToUpper().Trim() + "+";
            string Filter = " COMPTEUR.FKCRITERE in (";

            if (Fluides.IndexOf("+EC+") >= 0)
                Filter += "'1',";

            if (Fluides.IndexOf("+EF+") >= 0)
                Filter += "'2',";

            Filter = Filter.Trim(",".ToCharArray());
            Filter += ")";

            return Filter;
#endif
        }

        /// <summary>
        /// Obtient le filtre de fluide en fonction du type rentré en paramètre
        /// </summary>
        /// <param name="Fluides">Types de fluide</param>
        /// <returns></returns>
        public static FilterCriterias GetFluidesFilter4Mongo(string Fluides)
        {
            if (Fluides == string.Empty)
                return new FilterCriterias(string.Empty, null);

            Fluides = "+" + Fluides.ToUpper().Trim() + "+";

            if (Fluides.Contains("+EC+"))
                if (Fluides.Contains("+EF+"))
                    return new FilterCriterias(Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE, new BsonDocument("$in", new BsonArray() { 1, 2 }));
                else
                    return new FilterCriterias(Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE, 1);
            else
                if (Fluides.Contains("+EF+"))
                return new FilterCriterias(Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE, 2);
            else
                return new FilterCriterias(string.Empty, null);
        }

        public static string GetTypeAppareilFilter(string TypeAppareil)
        {
            //WEBTODO :
            // - compteur remplace par web_compteur
#if WS2
            if (TypeAppareil == "")
                return "";
            if (TypeAppareil == "EC")
                return " and Web_compteur.FLUIDE= 'EC' ";
            if (TypeAppareil == "EF")
                return " and Web_compteur.FLUIDE= 'EF' ";
            if (TypeAppareil == "REPART")
                return " and Web_compteur.FLUIDE = 'CET' ";
            if (TypeAppareil == "CET")
                return " and Web_compteur.FLUIDE = 'CET' ";
            if (TypeAppareil == "CAPTEUR")
                return " and Web_compteur.FLUIDE='CAPTEUR' ";
            return "";
#else
            if (TypeAppareil == "")
                return "";
            if (TypeAppareil == "EC")
                return " and COMPTEUR.FKCRITERE=1";
            if (TypeAppareil == "EF")
                return " and COMPTEUR.FKCRITERE=2";
            if (TypeAppareil == "REPART")
                return " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil(TypeAppareil);
            if (TypeAppareil == "CET")
                return " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil(TypeAppareil);
            if (TypeAppareil == "CAPTEUR")
                return " and ARTICLE.FKSOUSFAMILLE=" + GetPkSousFamilleByTypeAppareil(TypeAppareil);
            return "";

#endif
        }

        public struct FilterCriterias
        {
            public string key;
            public object criteria;

            public FilterCriterias(string key, object criteria)
            {
                this.key = key;
                this.criteria = criteria;
            }
        }

        public static string GetTypeERCByTypeAppareil(string TypeAppareil)
        {

            if (TypeAppareil.ToUpper() == "EAU")
                return "EAU";
            else if (TypeAppareil.ToUpper() == "EC")
                return "EAU";
            else if (TypeAppareil.ToUpper() == "EF")
                return "EAU";
            else if (TypeAppareil.ToUpper() == "EC+EF")
                return "EAU";
            else if (TypeAppareil.ToUpper() == "EF+EC")
                return "EAU";
            else if (TypeAppareil.ToUpper() == "REPART")
                return "REPARTITEUR";
            else if (TypeAppareil.ToUpper() == "CET")
                return "CET";
            else
                return "inconnu";
        }

        public static string GetTypeAppareilByPkSF(int pkSousFamille)
        {
            if (pkSousFamille == 185)
                return "Repart";
            if (pkSousFamille == 86)
                return "CET";
            if (pkSousFamille == 241)
                return "CAPTEUR";
            return "inconnu";
        }

        public static int GetPkSousFamilleByTypeAppareil(string TypeAppareil)
        {
            if (TypeAppareil.ToUpper() == "REPART")
                return 185;
            if (TypeAppareil.ToUpper() == "CET")
                return 86;
            if (TypeAppareil.ToUpper() == "CAPTEUR")
                return 241;


            return -1;
        }

        public static string GetUniteByTypeAppareil(string TypeAppareil)
        {
            if (TypeAppareil.ToUpper() == "EC")
                return "m3";
            else if (TypeAppareil.ToUpper() == "EF")
                return "m3";
            else if (TypeAppareil.ToUpper() == "REPART")
                return "U";
            else if (TypeAppareil.ToUpper() == "CET")
                return "U";
            else if (TypeAppareil.ToUpper() == "CAPTEUR")
                return "% ou C°";
            return "";
        }
        #endregion

    }
}
