<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;
use App\Oracle\OciUpdateHandler;
use App\Repository\Dto\Shared\SuccessOutputDto;
use App\Repository\Dto\Immeuble\GetImmeubleOutputDto;
use App\Service\Dto\ImmeubleDto;
use App\Service\Dto\ImmeubleEAUDto;
use App\Service\Dto\ImmeubleRepartDto;
use App\Service\Dto\ImmeubleCETDto;
use App\Service\Dto\ImmeubleCapteurDto;
use App\Service\Dto\ImmeubleElectDto;
use App\Service\Dto\ImmeubleGazDto;
use App\Service\Dto\SerieDto;
use App\Service\Dto\ChantierDto;
use App\Service\Dto\TopConsosDto;
use App\Service\Dto\IndexRecapDateDto;

class ImmeubleRepository
{
    public function __construct(
        private readonly OciFacade $oci,
        private readonly OciUpdateHandler $ociUpdate,
    ) {}

    public function getMyImmeubles($pkUser, $params = [])
    {
        return [];
    }

    public function getMyTableauBordClient($pkUser, $params = [])
    {
        return [];
    }

    public function getTableauBordImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getInterventionsImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getFuitesImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getAnomaliesImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getDysfonctionnementsImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getDetailDepannage($pkUser, $pkIntervention)
    {
        return [];
    }

    /** 
     *
     * @param integer $pkImmeuble
     * @param string $adresse2
     * @param string $adresse3
     * @return SuccessOutputDto
     */
    public function updateAddress2And3(int $pkImmeuble, string $adresse2, string $adresse3): SuccessOutputDto
    {
        $sql = "UPDATE IMMEUBLE SET ADRESSE2 = :adresse2, ADRESSE3 = :adresse3 WHERE PKIMMEUBLE = :pkImmeuble";

        $params = [
            'pkImmeuble'   => $pkImmeuble,
            'adresse2' => $adresse2,
            'adresse3' => $adresse3,
        ];

        // Renvoie le nombre de lignes modifiées
        return $this->ociUpdate->update($sql, $params) > 0 ? SuccessOutputDto::ok() : SuccessOutputDto::error("Failed to update address");
    }

    public function findByPkImmeuble(int $pkImmeuble): ?GetImmeubleOutputDto
    {
        $sql = "SELECT PKIMMEUBLE, NOM, NUMERO, REF, ADRESSE1, ADRESSE2, ADRESSE3, CP, VILLE FROM IMMEUBLE WHERE PKIMMEUBLE = :pkImmeuble";
        $params = ['pkImmeuble' => $pkImmeuble];
        $result = $this->oci->fetchAllAssoc($sql, $params);
        return $result ? new GetImmeubleOutputDto(...$result[0]) : null;
    }

    //////////////////////////////////////////////////////////////////////////////////////
    public function getImmeuble(int $pkUser, int $pkImmeuble): ?ImmeubleDto
    {
        $sql = "SELECT PKIMMEUBLE, NOM, NUMERO, REF, ADRESSE1, ADRESSE2, ADRESSE3, CP, VILLE FROM IMMEUBLE WHERE PKIMMEUBLE = :pkImmeuble";
        $params = ['pkImmeuble' => $pkImmeuble];
        $result = $this->oci->fetchAllAssoc($sql, $params);
        
        return $result ? new ImmeubleDto(
            pkImmeuble: $pkImmeuble,
            nom: $result[0]['nom'] ?? null,
            numero: $result[0]['numero'] ?? null,
            ref: $result[0]['ref'] ?? null,
            adresse1: $result[0]['adresse1'] ?? null,
            adresse2: $result[0]['adresse2'] ?? null,
            adresse3: $result[0]['adresse3'] ?? null,
            cp: $result[0]['cp'] ?? null,
            ville: $result[0]['ville'] ?? null
        ) : null;
    }
    
    public function getImmeubleCount(int $pkUser, int $pkImmeuble): array
    {
        // Implémentation inspirée de WS_Common.GetTableauBordImmeuble (branche WS2),
        // qui lit les agrégats directement dans WEB_IMMEUBLE.

        $sql = <<<SQL
SELECT
    NVL(NBLOGEMENT, 0)      AS NBLOGEMENT,
    NVL(NBDEPANNAGES, 0)    AS NBDEPANNAGES,
    NVL(NBSUSFRAUDCLI, 0)   AS NBSUSFRAUDCLI,
    NVL(NBEC, 0)            AS NBEC,
    NVL(NBEF, 0)            AS NBEF,
    NVL(NBREPART, 0)        AS NBREPART,
    NVL(NBCET, 0)           AS NBCET,
    NVL(NBCAPTEUR, 0)       AS NBCAPTEUR,
    TELERELEVE
FROM WEB_IMMEUBLE
WHERE PKIMMEUBLE = :pkImmeuble
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkImmeuble' => $pkImmeuble]);

        if ($rows === []) {
            return [
                'nbLogements' => 0,
                'nbAppareils' => 0,
                'nbDepannages' => 0,
                'nbDepannagesTotal' => 0,
                'degresDepannages' => 0,
                'nbDysfonctionnements' => 0,
                'degresDysfonctionnements' => 0,
                'hasTelereleve' => false,
                'nbCompteursEc' => 0,
                'nbCompteursEf' => 0,
                'nbCompteursRepart' => 0,
                'nbCompteursCet' => 0,
                'nbCompteursCapteur' => 0,
                'nbCompteursElect' => 0,
                'nbCompteursGaz' => 0,
                'nbCompteursTelereveleTotal' => 0,
                'nbCompteursTelereveleOk' => 0,
                'hasTransfertFichiers' => false,
            ];
        }

        $row = $rows[0];

        $nbCompteursEc     = (int) ($row['NBEC'] ?? 0);
        $nbCompteursEf     = (int) ($row['NBEF'] ?? 0);
        $nbCompteursRepart = (int) ($row['NBREPART'] ?? 0);
        $nbCompteursCet    = (int) ($row['NBCET'] ?? 0);
        $nbCompteursCapteur= (int) ($row['NBCAPTEUR'] ?? 0);

        $nbAppareils = $nbCompteursEc + $nbCompteursEf + $nbCompteursRepart + $nbCompteursCet;

        return [
            'nbLogements' => (int) ($row['NBLOGEMENT'] ?? 0),
            'nbAppareils' => $nbAppareils,
            'nbDepannages' => (int) ($row['NBDEPANNAGES'] ?? 0),
            // Nombre total de dépannages : non exposé directement en WS2 pour ce cas, laissé à 0 pour l'instant
            'nbDepannagesTotal' => 0,
            // "degrés" non présents dans GetTableauBordImmeuble WS2 : initialisés à 0
            'degresDepannages' => 0,
            'nbDysfonctionnements' => (int) ($row['NBSUSFRAUDCLI'] ?? 0),
            'degresDysfonctionnements' => 0,
            'hasTelereleve' => ($row['TELERELEVE'] ?? '') === 'O',
            'nbCompteursEc' => $nbCompteursEc,
            'nbCompteursEf' => $nbCompteursEf,
            'nbCompteursRepart' => $nbCompteursRepart,
            'nbCompteursCet' => $nbCompteursCet,
            'nbCompteursCapteur' => $nbCompteursCapteur,
            // Compteurs électricité / gaz non exposés dans WEB_IMMEUBLE (WS2)
            'nbCompteursElect' => 0,
            'nbCompteursGaz' => 0,
            // Statut télérélevé détaillé (total / OK) non implémenté dans WS2 : initialisés à 0
            'nbCompteursTelereveleTotal' => 0,
            'nbCompteursTelereveleOk' => 0,
            // HasTransfertFichiers est géré uniquement dans la branche legacy (non WS2) : false ici
            'hasTransfertFichiers' => false,
        ];
    }
    
    public function getImmeubleEc(int $pkUser, int $pkImmeuble): ImmeubleEAUDto
    {
        // Implémentation inspirée du bloc "EC" de
        // WS_Common.GetTableauBordImmeuble (branche WS2).

        // 1) Récupérer les compteurs / fuites / anomalies EC sur WEB_IMMEUBLE
        $sql = <<<SQL
SELECT
    NVL(NBFUITES_EC, 0) AS NBFUITES_EC,
    NVL(NBANO_EC, 0)    AS NBANO_EC
FROM WEB_IMMEUBLE
WHERE PKIMMEUBLE = :pkImmeuble
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkImmeuble' => $pkImmeuble]);

        $nbFuitesEc = 0;
        $nbAnomaliesEc = 0;

        if ($rows !== []) {
            $row = $rows[0];
            $nbFuitesEc = (int) ($row['NBFUITES_EC'] ?? 0);
            $nbAnomaliesEc = (int) ($row['NBANO_EC'] ?? 0);
        }

        // 2) Reproduire GetInfosRatioReleveImmeubles("I", PkImmeuble, "EAU")
        // pour obtenir NbCompteursARelever / NbCompteursReleves.

        $sqlRatio = <<<SQL
SELECT
    SUM(nbcompteursreleves)   AS NBCOMPTEURSRELEVES,
    SUM(nbcompteursarelever)  AS NBCOMPTEURSARELEVER
FROM (
    SELECT
        pkreleve,
        nbcompteursreleves,
        nbcompteursarelever,
        RANK() OVER (PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) AS rnk
    FROM web_releve
    WHERE fkimmeuble = :pkImmeuble
      AND substr(upper(typeERC), 1, 11) = 'EAU'
)
WHERE rnk = 1
SQL;

        $rowsRatio = $this->oci->fetchAllAssoc($sqlRatio, ['pkImmeuble' => $pkImmeuble]);

        $nbCompteursARelever = null;
        $nbCompteursReleves  = null;

        if ($rowsRatio !== [] && isset($rowsRatio[0])) {
            $r = $rowsRatio[0];
            $nbCompteursARelever = isset($r['NBCOMPTEURSARELEVER']) ? (int) $r['NBCOMPTEURSARELEVER'] : null;
            $nbCompteursReleves  = isset($r['NBCOMPTEURSRELEVES']) ? (int) $r['NBCOMPTEURSRELEVES'] : null;
        }

        // 3) Construire un ImmeubleEAUDto avec les données Oracle.
        // Les éléments plus avancés (chantier, top consos, séries, listeReleves)
        // seront complétés dans une phase ultérieure.

        return new ImmeubleEAUDto(
            nbCompteursARelever: $nbCompteursARelever,
            nbCompteursReleves: $nbCompteursReleves,
            nbFuites: $nbFuitesEc,
            degresFuites: null,
            nbAnomalies: $nbAnomaliesEc,
            degresAnomalies: null,
            chantier: new ChantierDto(
                pkChantier: null,
                pkDevis: null,
                pkImmeuble: $pkImmeuble,
                dateEntreeChantier: null,
                nbCompteursPoses: null,
                nbCompteursCommandes: null
            ),
            topConsos: new TopConsosDto(
                dateReleve: null,
                consosGrandes: [],
                consosPetites: []
            ),
            serieConsos1: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsos2: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            listeReleves: []
        );
    }
    
    public function getImmeubleEf(int $pkUser, int $pkImmeuble): ImmeubleEAUDto
    {
        // Implémentation inspirée du bloc "EF" de
        // WS_Common.GetTableauBordImmeuble (branche WS2).

        // 1) Récupérer les fuites / anomalies EF sur WEB_IMMEUBLE
        $sql = <<<SQL
SELECT
    NVL(NBFUITES_EF, 0) AS NBFUITES_EF,
    NVL(NBANO_EF, 0)    AS NBANO_EF
FROM WEB_IMMEUBLE
WHERE PKIMMEUBLE = :pkImmeuble
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkImmeuble' => $pkImmeuble]);

        $nbFuitesEf = 0;
        $nbAnomaliesEf = 0;

        if ($rows !== []) {
            $row = $rows[0];
            $nbFuitesEf = (int) ($row['NBFUITES_EF'] ?? 0);
            $nbAnomaliesEf = (int) ($row['NBANO_EF'] ?? 0);
        }

        // 2) Reproduire GetInfosRatioReleveImmeubles("I", PkImmeuble, "EAU")
        // pour obtenir NbCompteursARelever / NbCompteursReleves (même logique qu'en EC).

        $sqlRatio = <<<SQL
SELECT
    SUM(nbcompteursreleves)   AS NBCOMPTEURSRELEVES,
    SUM(nbcompteursarelever)  AS NBCOMPTEURSARELEVER
FROM (
    SELECT
        pkreleve,
        nbcompteursreleves,
        nbcompteursarelever,
        RANK() OVER (PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) AS rnk
    FROM web_releve
    WHERE fkimmeuble = :pkImmeuble
      AND substr(upper(typeERC), 1, 11) = 'EAU'
)
WHERE rnk = 1
SQL;

        $rowsRatio = $this->oci->fetchAllAssoc($sqlRatio, ['pkImmeuble' => $pkImmeuble]);

        $nbCompteursARelever = null;
        $nbCompteursReleves  = null;

        if ($rowsRatio !== [] && isset($rowsRatio[0])) {
            $r = $rowsRatio[0];
            $nbCompteursARelever = isset($r['NBCOMPTEURSARELEVER']) ? (int) $r['NBCOMPTEURSARELEVER'] : null;
            $nbCompteursReleves  = isset($r['NBCOMPTEURSRELEVES']) ? (int) $r['NBCOMPTEURSRELEVES'] : null;
        }

        // 3) Construire un ImmeubleEAUDto avec les données Oracle.

        return new ImmeubleEAUDto(
            nbCompteursARelever: $nbCompteursARelever,
            nbCompteursReleves: $nbCompteursReleves,
            nbFuites: $nbFuitesEf,
            degresFuites: null,
            nbAnomalies: $nbAnomaliesEf,
            degresAnomalies: null,
            chantier: new ChantierDto(
                pkChantier: null,
                pkDevis: null,
                pkImmeuble: $pkImmeuble,
                dateEntreeChantier: null,
                nbCompteursPoses: null,
                nbCompteursCommandes: null
            ),
            topConsos: new TopConsosDto(
                dateReleve: null,
                consosGrandes: [],
                consosPetites: []
            ),
            serieConsos1: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsos2: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            listeReleves: []
        );
    }

    public function getImmeubleRepart(int $pkUser, int $pkImmeuble): ImmeubleRepartDto
    {
        // Implémentation inspirée du bloc "ImmeubleRepart" de
        // WS_Common.GetTableauBordImmeuble (branche WS2).
        //
        // On commence par reproduire le ratio relevés / à relever :
        //   GetInfosRatioReleveImmeubles("I", PkImmeuble, "REPARTITEUR", ...)

        $sqlRatio = <<<SQL
SELECT
    SUM(nbcompteursreleves)   AS NBCOMPTEURSRELEVES,
    SUM(nbcompteursarelever)  AS NBCOMPTEURSARELEVER
FROM (
    SELECT
        pkreleve,
        nbcompteursreleves,
        nbcompteursarelever,
        RANK() OVER (PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) AS rnk
    FROM web_releve
    WHERE fkimmeuble = :pkImmeuble
      AND substr(upper(typeERC), 1, 11) = 'REPARTITEUR'
)
WHERE rnk = 1
SQL;

        $rowsRatio = $this->oci->fetchAllAssoc($sqlRatio, ['pkImmeuble' => $pkImmeuble]);

        $nbCompteursARelever = null;
        $nbCompteursReleves  = null;

        if ($rowsRatio !== [] && isset($rowsRatio[0])) {
            $r = $rowsRatio[0];
            $nbCompteursARelever = isset($r['NBCOMPTEURSARELEVER']) ? (int) $r['NBCOMPTEURSARELEVER'] : null;
            $nbCompteursReleves  = isset($r['NBCOMPTEURSRELEVES']) ? (int) $r['NBCOMPTEURSRELEVES'] : null;
        }

        // Les autres champs (chantier, top consos, données de répartition détaillées, séries)
        // restent initialisés comme avant et seront complétés plus tard.

        return new ImmeubleRepartDto(
            nbCompteursARelever: $nbCompteursARelever,
            nbCompteursReleves: $nbCompteursReleves,
            chantier: new ChantierDto(
                pkChantier: null,
                pkDevis: null,
                pkImmeuble: $pkImmeuble,
                dateEntreeChantier: null,
                nbCompteursPoses: null,
                nbCompteursCommandes: null
            ),
            topConsos: new TopConsosDto(
                dateReleve: null,
                consosGrandes: [],
                consosPetites: []
            ),
            serieConsos: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            listeReleves: [],
            totURepart: null,
            totTantChauff: null,
            puTant: null,
            prixURepart: null,
            prixAbonn: null,
            montARepartTant: null,
            partRepartConsos: null,
            ctCombust: null,
            serieConsosTotale1: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsosTotale2: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsosDJU: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            )
        );
    }
    
    public function getImmeubleCet(int $pkUser, int $pkImmeuble): ImmeubleCETDto
    {
        // Implémentation inspirée du bloc "ImmeubleCET" de
        // WS_Common.GetTableauBordImmeuble (branche WS2).
        //
        // On commence par reproduire le ratio relevés / à relever :
        //   GetInfosRatioReleveImmeubles("I", PkImmeuble, "CET", ...)

        $sqlRatio = <<<SQL
SELECT
    SUM(nbcompteursreleves)   AS NBCOMPTEURSRELEVES,
    SUM(nbcompteursarelever)  AS NBCOMPTEURSARELEVER
FROM (
    SELECT
        pkreleve,
        nbcompteursreleves,
        nbcompteursarelever,
        RANK() OVER (PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) AS rnk
    FROM web_releve
    WHERE fkimmeuble = :pkImmeuble
      AND substr(upper(typeERC), 1, 3) = 'CET'
)
WHERE rnk = 1
SQL;

        $rowsRatio = $this->oci->fetchAllAssoc($sqlRatio, ['pkImmeuble' => $pkImmeuble]);

        $nbCompteursARelever = null;
        $nbCompteursReleves  = null;

        if ($rowsRatio !== [] && isset($rowsRatio[0])) {
            $r = $rowsRatio[0];
            $nbCompteursARelever = isset($r['NBCOMPTEURSARELEVER']) ? (int) $r['NBCOMPTEURSARELEVER'] : null;
            $nbCompteursReleves  = isset($r['NBCOMPTEURSRELEVES']) ? (int) $r['NBCOMPTEURSRELEVES'] : null;
        }

        return new ImmeubleCETDto(
            nbCompteursARelever: $nbCompteursARelever,
            nbCompteursReleves: $nbCompteursReleves,
            chantier: new ChantierDto(
                pkChantier: null,
                pkDevis: null,
                pkImmeuble: $pkImmeuble,
                dateEntreeChantier: null,
                nbCompteursPoses: null,
                nbCompteursCommandes: null
            ),
            topConsos: new TopConsosDto(
                dateReleve: null,
                consosGrandes: [],
                consosPetites: []
            ),
            serieConsos: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            listeReleves: null,
            totURepart: null,
            totTantChauff: null,
            puTant: null,
            prixURepart: null,
            prixAbonn: null,
            montARepartTant: null,
            partRepartConsos: null,
            ctCombust: null,
            serieConsosTotale1: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsosTotale2: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsosDJU: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            )
        );
    }
    
    public function getImmeubleCapteur(int $pkUser, int $pkImmeuble): ImmeubleCapteurDto
    {
        return new ImmeubleCapteurDto(
            indexRecapTemperature: new IndexRecapDateDto(
                date: null,
                moy: null,
                max: null,
                min: null
            ),
            indexRecapHumidite: new IndexRecapDateDto(
                date: null,
                moy: null,
                max: null,
                min: null
            ),
            serieConsosTemperature: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            ),
            serieConsosHumidite: new SerieDto(
                defaultIntervalle: null,
                valeursXyl: null,
                annee: null
            )
        );
    }

    public function getImmeubleElect(int $pkUser, int $pkImmeuble): ImmeubleElectDto
    {
        return new ImmeubleElectDto(
            nbCompteursARelever: null,
            nbCompteursReleves: null,
            chantier: new ChantierDto(
                pkChantier: null,
                pkDevis: null,
                pkImmeuble: $pkImmeuble,
                dateEntreeChantier: null,
                nbCompteursPoses: null,
                nbCompteursCommandes: null
            ),
            topConsos: new TopConsosDto(
                dateReleve: null,
                consosGrandes: [],
                consosPetites: []
            ),
            listeReleves: []
        );
    }

    public function getImmeubleGaz(int $pkUser, int $pkImmeuble): ImmeubleGazDto
    {
        return new ImmeubleGazDto(
            nbCompteursARelever: null,
            nbCompteursReleves: null,
            chantier: new ChantierDto(
                pkChantier: null,
                pkDevis: null,
                pkImmeuble: $pkImmeuble,
                dateEntreeChantier: null,
                nbCompteursPoses: null,
                nbCompteursCommandes: null
            ),
            topConsos: new TopConsosDto(
                dateReleve: null,
                consosGrandes: [],
                consosPetites: []
            ),
            listeReleves: []
        );
    }
    
    public function getImmeubleSerieConsosEau(int $pkUser, int $pkImmeuble): SerieDto
    {
        return new SerieDto(
            defaultIntervalle: null,
            valeursXyl: null,
            annee: null
        );
    }

    public function getImmeubleSerieConsosCompteurGeneral(int $pkUser, int $pkImmeuble): SerieDto
    {
        return new SerieDto(
            defaultIntervalle: null,
            valeursXyl: null,
            annee: null
        );
    }
    
}
