using System;
using System.Data;
using Tools;

namespace Techem.Webservices.WS_EspaceClient.Tools
{

    public class REPARTITIONDataTable : DataTable
    {
        public REPARTITIONDataTable()
        {
            Columns.Add("PKREPARTITION", typeof(Decimal));
            Columns.Add("FKIMMEUBLE", typeof(Decimal));
            Columns.Add("DATEREPART", typeof(DateTime));
            Columns.Add("MTFRAIS1", typeof(Decimal));
            Columns.Add("MTFRAIS2", typeof(Decimal));
            Columns.Add("MTFRAIS3", typeof(Decimal));
            Columns.Add("MTFRAIS4", typeof(Decimal));
            Columns.Add("STATUS");
            Columns.Add("DATEDEBUT", typeof(DateTime));
            Columns.Add("DATEFIN", typeof(DateTime));
            Columns.Add("PCTFRAIS1", typeof(Decimal));
            Columns.Add("PCTFRAIS2", typeof(Decimal));
            Columns.Add("PCTFRAIS3", typeof(Decimal));
            Columns.Add("PCTFRAIS4", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS1", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS2", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS3", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS4", typeof(Decimal));
            Columns.Add("PRIXUFRAIS1", typeof(Decimal));
            Columns.Add("PRIXUFRAIS2", typeof(Decimal));
            Columns.Add("PRIXUFRAIS3", typeof(Decimal));
            Columns.Add("PRIXUFRAIS4", typeof(Decimal));
            Columns.Add("ACTIF");
            Columns.Add("ADRESSE");
            Columns.Add("CP");
            Columns.Add("VILLE");
            Columns.Add("ID");
            Columns.Add("CODEGESTIO");
        }

        public void Fill(int pkRepartition)
        {
            string sql =
                @"SELECT        REPARTITION.PKREPARTITION, REPARTITION.FKIMMEUBLE, REPARTITION.DATEREPART, 
                REPARTITION.STATUS, REPARTITION.DATEDEBUT, REPARTITION.DATEFIN, 
                REPARTITION.MTFRAIS1, REPARTITION.MTFRAIS2, REPARTITION.MTFRAIS3, REPARTITION.MTFRAIS4, 
                REPARTITION.PCTFRAIS1, REPARTITION.PCTFRAIS2, REPARTITION.PCTFRAIS3, REPARTITION.PCTFRAIS4, 
                REPARTITION.NBUNITEFRAIS1, REPARTITION.NBUNITEFRAIS2, REPARTITION.NBUNITEFRAIS3, REPARTITION.NBUNITEFRAIS4, 
                REPARTITION.PRIXUFRAIS1, REPARTITION.PRIXUFRAIS2, REPARTITION.PRIXUFRAIS3, REPARTITION.PRIXUFRAIS4, 
                REPARTITION.ACTIF, IMMEUBLE.ADRESSE, IMMEUBLE.CP, IMMEUBLE.VILLE, IMMEUBLE.ID, IMMEUBLE.CODEGESTIO
                FROM            REPARTITION, IMMEUBLE
                WHERE        REPARTITION.FKIMMEUBLE = IMMEUBLE.PKIMMEUBLE AND (REPARTITION.PKREPARTITION = :PKREPARTITION)";
            sql = sql.Replace(":PKREPARTITION", pkRepartition.ToString());
            DataTable t = WS_DBUtils.utils_LER.DBSelectTable(sql);
            this.Rows.Clear();
            foreach (DataRow r in t.Rows)
                this.ImportRow(r);
        }

    }
    public class REPARTITION_LGTDataTable : DataTable
    {
        public REPARTITION_LGTDataTable()
        {
            this.TableName = "REPARTITION_LGT";
            Columns.Add("PKREPARTITION_LGT", typeof(Decimal));
            Columns.Add("FKREPARTITION", typeof(Decimal));
            Columns.Add("FKLOGEMENT", typeof(Decimal));
            Columns.Add("FKOCCUPANT", typeof(Decimal));
            Columns.Add("DATEARRIVEE", typeof(DateTime));
            Columns.Add("DATEDEPART", typeof(DateTime));
            Columns.Add("NUMETAGE");
            Columns.Add("NUMEROPORTE");
            Columns.Add("NUMESCALIER", typeof(Decimal));
            Columns.Add("LIBELLE");
            Columns.Add("NUMERO");
            Columns.Add("NOM");
            Columns.Add("ADRESSE");
            Columns.Add("NUMBAT", typeof(Decimal));
            Columns.Add("NOMOCC");
            Columns.Add("CODELOGEGESTIO");
            Columns.Add("NUMORDRE", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS1", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS2", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS3", typeof(Decimal));
            Columns.Add("NBUNITEFRAIS4", typeof(Decimal));
            Columns.Add("PRIXUFRAIS1", typeof(Decimal));
            Columns.Add("PRIXUFRAIS2", typeof(Decimal));
            Columns.Add("PRIXUFRAIS3", typeof(Decimal));
            Columns.Add("PRIXUFRAIS4", typeof(Decimal));
            Columns.Add("PRIXTOTFRAIS1", typeof(Decimal));
            Columns.Add("PRIXTOTFRAIS2", typeof(Decimal));
            Columns.Add("PRIXTOTFRAIS3", typeof(Decimal));
            Columns.Add("PRIXTOTFRAIS4", typeof(Decimal));
            Columns.Add("LIBELLEREPART1");
            Columns.Add("LIBELLEREPART2");
            Columns.Add("LIBELLEREPART3");
            Columns.Add("LIBELLEREPART4");
            Columns.Add("REPART_COEF", typeof(Decimal));
            Columns.Add("NUMBAIL");
            Columns.Add("ACCOMPTE", typeof(Decimal));
        }

        public void Fill(int pkRepartition, int pkOccupant = -1)
        {
            string sql =
                $@"SELECT     REPARTITION_LGT.PKREPARTITION_LGT, REPARTITION_LGT.FKLOGEMENT, 
                round(REPARTITION_LGT.NBUNITEFRAIS1, 1) as NBUNITEFRAIS1, REPARTITION_LGT.NBUNITEFRAIS2, REPARTITION_LGT.NBUNITEFRAIS3, REPARTITION_LGT.NBUNITEFRAIS4, 
                REPARTITION_LGT.PRIXUFRAIS1, REPARTITION_LGT.PRIXUFRAIS2, REPARTITION_LGT.PRIXUFRAIS3, REPARTITION_LGT.PRIXUFRAIS4, 
                REPARTITION_LGT.PRIXTOTFRAIS1, REPARTITION_LGT.PRIXTOTFRAIS2, REPARTITION_LGT.PRIXTOTFRAIS3, REPARTITION_LGT.PRIXTOTFRAIS4, 
                REPARTITION_LGT.FKREPARTITION, LOGEMENT.NUMETAGE, LOGEMENT.NUMEROPORTE, ESCALIER.NUMESCALIER, ESCALIER.LIBELLE, BATIMENT.NUMERO, 
                BATIMENT.NOM, BATIMENT.ADRESSE, BATIMENT.ID AS NUMBAT, OCCUPANT.NOM AS NOMOCC, 
                OCCUPANT.CODELOGEGESTIO, LOGEMENT.NUMORDRE, OCCUPANT.NUMBAIL, 
                'Part variable pour le combustible selon les relevés' AS LibelleRepart1, 
                'Part fixe pour le combustible selon les tantièmes' AS LibelleRepart2, 
                'Coût du chauffage hors combustible selon les tantièmes' AS LibelleRepart3, 
                'Coût du service selon le nombre de répartiteurs' AS LibelleRepart4, 
                OCCUPANT.DATEARRIVEE, LOGEMENT.REPART_COEF, REPARTITION_LGT.FKOCCUPANT, OCCUPANT.DATEDEPART, 
                NVL(REPARTITION_LGT.ACCOMPTE, 0) AS ACCOMPTE
                FROM        LOGEMENT, BATIMENT, ESCALIER, OCCUPANT, REPARTITION_LGT
                WHERE     LOGEMENT.FKBATIMENT = BATIMENT.PKBATIMENT AND BATIMENT.PKBATIMENT = ESCALIER.FKBATIMENT 
                AND LOGEMENT.FKESCALIER = ESCALIER.PKESCALIER AND LOGEMENT.PKLOGEMENT = OCCUPANT.FKLOGEMENT 
                AND LOGEMENT.PKLOGEMENT = REPARTITION_LGT.FKLOGEMENT AND OCCUPANT.PKOCCUPANT = REPARTITION_LGT.FKOCCUPANT 
                AND (REPARTITION_LGT.FKREPARTITION = {pkRepartition})
{(pkOccupant == -1 ? "" : "AND REPARTITION_LGT.FKOCCUPANT=" + pkOccupant)}
                ORDER BY NUMBAT, ESCALIER.NUMESCALIER, LOGEMENT.NUMETAGE, LOGEMENT.NUMORDRE, OCCUPANT.DATEARRIVEE";

            DataTable t = WS_DBUtils.utils_LER.DBSelectTable(sql);
            this.Rows.Clear();
            foreach (DataRow r in t.Rows)
                this.ImportRow(r);
        }

    }
    public class REPARTITION_CPTDataTable : DataTable
    {
        public REPARTITION_CPTDataTable()
        {
            this.TableName = "REPARTITION_CPT";
            Columns.Add("PKREPARTITION_CPT", typeof(Decimal));
            Columns.Add("FKREPARTITION_LGT", typeof(Decimal));
            Columns.Add("FKCOMPTEUR", typeof(Decimal));
            Columns.Add("FKLOGEMENT", typeof(Decimal));
            Columns.Add("NB", typeof(Decimal));
            Columns.Add("PRIXU", typeof(Decimal));
            Columns.Add("PRIXTOT", typeof(Decimal));
            Columns.Add("NUMCOMPTEUR", typeof(Decimal));
            Columns.Add("NUMEROSERIE");
            Columns.Add("CODEEMPLACEMENT");
            Columns.Add("LIBELLE");
            Columns.Add("TYPERELEVE");
            Columns.Add("OBS");
        }

        public void Fill(int pkRepartition)
        {
            string sql =
                @"
                SELECT        REPARTITION_CPT.PKREPARTITION_CPT, REPARTITION_CPT.NB, REPARTITION_CPT.PRIXU, REPARTITION_CPT.PRIXTOT, COMPTEUR.NUMCOMPTEUR, 
                COMPTEUR.NUMEROSERIE, COMPTEUR.CODEEMPLACEMENT, REPARTITION_CPT.FKCOMPTEUR, COMPTEUR.FKLOGEMENT, REPARTITION_CPT.LIBELLE, 
                REPARTITION_CPT.TYPERELEVE, REPARTITION_CPT.OBS, REPARTITION_CPT.FKREPARTITION_LGT
                FROM            COMPTEUR, REPARTITION_CPT
                WHERE        COMPTEUR.PKCOMPTEUR = REPARTITION_CPT.FKCOMPTEUR 
                AND (REPARTITION_CPT.FKREPARTITION = :PKREPARTITION)
                ORDER BY COMPTEUR.NUMCOMPTEUR";
            sql = sql.Replace(":PKREPARTITION", pkRepartition.ToString());
            DataTable t = WS_DBUtils.utils_LER.DBSelectTable(sql);
            this.Rows.Clear();
            foreach (DataRow r in t.Rows)
                this.ImportRow(r);
        }

    }

}
