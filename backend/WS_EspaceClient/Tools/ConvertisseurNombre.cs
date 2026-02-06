using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;


namespace Techem.Webservices.WS_EspaceClient.Tools
{
    public class ConvertisseurNombre
    {
        /// <summary>
        /// Converti une valeur en euros
        /// </summary>
        /// <param name="valeur">
        /// La valeur à convertir</param>
        /// <returns>Une chaine correspondant au nombre</returns>
        /// <remarks>format xxx euro et yyy cent(s)</remarks>
        public static string ConvertirEuro(decimal valeur)
        {
            return Convertir(Math.Abs(valeur), 2, " euros", " cents", " et ");
        }

        /// <summary>
        /// Conversion d'une valeur decimal en lettres
        /// </summary>
        /// <param name="valeur">Valeur à convertir</param>
        /// <param name="nbDecimales"> Nombre de décimale à conserver</param>
        /// <returns>Une chaine correspondant au nombre</returns>
        /// <remarks>Pas d'unités, séparateur = ","</remarks>
        public static string Convertir(decimal valeur, int nbDecimales)
        {
            return Convertir(valeur, nbDecimales, "", "", ",");
        }

        /// <summary>
        /// Conversion d'une valeur decimal en lettres
        /// </summary>
        /// <param name="valeur">La valeur à convertir</param>
        /// <param name="nbDecimales">
        /// Le nombre de decimales à conserver</param>
        /// <param name="uniteEntiere">
        /// Le nom des unités de la partie entière</param>
        /// <param name="uniteDecimale">
        /// Le nom des unité de la partie décimale</param>
        /// <param name="separateur">le séparateur entre les parties</param>
        /// <returns>Une chaine correspondant au nombre</returns>
        public static string Convertir(decimal valeur,
          int nbDecimales,
          string uniteEntiere,
          string uniteDecimale,
          string separateur)
        {
            valeur = Math.Round(valeur, nbDecimales);

            int val = (int)Math.Floor((double)valeur);
            string ret = Convertir(val) + uniteEntiere;

            valeur = valeur - val;
            valeur = valeur * (int)(Math.Pow(10, nbDecimales));
            val = (int)Math.Floor((double)valeur);
            if (val > 0)
                ret += separateur + Convertir(val) + uniteDecimale;

            return ret;
        }

        /// <summary>
        /// Conversion d'un entier en lettre
        /// </summary>
        /// <param name="nombre">
        /// L'entier à convertir</param>
        /// <returns>Une chaine correspondant au nombre</returns>
        public static string Convertir(int nombre)
        {
            StringBuilder lettre = new StringBuilder();
            int centaine, dizaine, unite, reste, y;
            reste = nombre;

            for (int i = 1000000000; i >= 1; i /= 1000)
            {
                y = reste / i;
                if (y != 0)
                {
                    centaine = y / 100;
                    dizaine = (y - centaine * 100) / 10;
                    unite = y - (centaine * 100) - (dizaine * 10);
                    switch (centaine)
                    {
                        case 0:
                            break;
                        case 1:
                            lettre.Append(Convert(centaine * 100));
                            lettre.Append(" ");
                            break;
                        default:
                            lettre.Append(Convert(centaine));
                            lettre.Append(" ");
                            lettre.Append(Convert(100));
                            if ((dizaine == 0) && (unite == 0)) lettre.Append("s ");
                            else lettre.Append(" ");
                            break;
                    }

                    switch (dizaine)
                    {
                        case 0:
                            if (unite != 1 || (unite == 1 && i != 1000))
                            {
                                lettre.Append(Convert(unite));
                                if (unite != 0) lettre.Append(" ");
                            }
                            break;
                        case 1:
                            lettre.Append(Convert(dizaine * 10 + unite));
                            lettre.Append(" ");
                            break;
                        case 7:
                            goto case 1;
                        case 9:
                            goto case 1;
                        default:
                            lettre.Append(Convert(dizaine * 10));
                            if (unite == 1 && dizaine != 8) lettre.Append("-et-");
                            else lettre.Append(" ");
                            lettre.Append(Convert(unite));
                            lettre.Append(" ");
                            break;

                    }
                    switch (i)
                    {
                        case 1000000000:
                            if (y > 1) lettre.Append("milliards ");
                            else lettre.Append("milliard ");
                            break;
                        case 1000000:
                            if (y > 1) lettre.Append("millions ");
                            else lettre.Append("million ");
                            break;
                        case 1000:
                            lettre.Append("mille ");
                            break;
                    }
                }
                reste -= y * i;
            } // end for
            if (lettre.Length == 0) return "zero";

            return lettre.ToString().Trim();
        }

        private static string Convert(int nb)
        {
            switch (nb)
            {
                case 0: return "";
                case 1: return "un";
                case 2: return "deux";
                case 3: return "trois";
                case 4: return "quatre";
                case 5: return "cinq";
                case 6: return "six";
                case 7: return "sept";
                case 8: return "huit";
                case 9: return "neuf";
                case 10: return "dix";
                case 11: return "onze";
                case 12: return "douze";
                case 13: return "treize";
                case 14: return "quatorze";
                case 15: return "quinze";
                case 16: return "seize";
                case 17: return "dix-sept";
                case 18: return "dix-huit";
                case 19: return "dix-neuf";
                case 20: return "vingt";
                case 30: return "trente";
                case 40: return "quarante";
                case 50: return "cinquante";
                case 60: return "soixante";
                case 70: return "soixante-dix";
                case 71: return "soixante-onze";
                case 72: return "soixante-douze";
                case 73: return "soixante-treize";
                case 74: return "soixante-quatorze";
                case 75: return "soixante-quinze";
                case 76: return "soixante-seize";
                case 77: return "soixante-dix-sept";
                case 78: return "soixante-dix-huit";
                case 79: return "soixante-dix-neuf";
                case 80: return "quatre-vingt";
                case 90: return "quatre-vingt-dix";
                case 91: return "quatre-vingt-onze";
                case 92: return "quatre-vingt-douze";
                case 93: return "quatre-vingt-treize";
                case 94: return "quatre-vingt-quatorze";
                case 95: return "quatre-vingt-quinze";
                case 96: return "quatre-vingt-seize";
                case 97: return "quatre-vingt-dix-sept";
                case 98: return "quatre-vingt-dix-huit";
                case 99: return "quatre-vingt-dix-neuf";
                case 100: return "cent";
                case 1000: return "mille";
            }
            return "";
        }
    }
}