<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;
use App\Oracle\OciUpdateHandler;
use App\Service\Dto\ImmeubleDto;
use App\Service\Dto\TableauDeBordImmeubleDto;
use App\Repository\Dto\Shared\SuccessOutputDto;
use App\Repository\Dto\Immeuble\GetImmeubleOutputDto;

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
        // Implémentation Oracle "phase 1" du tableau de bord immeuble,
        // en s'inspirant de WS_Common.GetTableauBordImmeuble (branche WS2).
        //
        // On commence par les métriques principales (immeuble + compteurs + logements + dépannages + dysfonctionnements),
        // les blocs détaillés (EAU/REPART/CET, séries de consos, capteurs, etc.) pourront être complétés ensuite.

        $sql = <<<SQL
SELECT
    i.PKIMMEUBLE,
    i.NOM,
    i.NUMERO,
    i.ID,
    i.ADRESSE    AS ADRESSE1,
    i.ADRESSE2,
    i.ADRESSE3,
    i.CP,
    i.VILLE,
    i.NBLOGEMENT,
    i.NBDEPANNAGES,
    i.NBSUSFRAUDCLI,
    i.NBEC,
    i.NBEF,
    i.NBREPART,
    i.NBCET,
    i.NBCAPTEUR,
    i.TELERELEVE
FROM WEB_IMMEUBLE i
WHERE i.PKIMMEUBLE = :pkImmeuble
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkImmeuble' => $pkImmeuble]);
        if ($rows === []) {
            // On renvoie un DTO vide cohérent plutôt qu'un tableau brut.
            return new TableauDeBordImmeubleDto(
                immeuble: null,
                nbLogements: null,
                nbAppareils: null,
                nbDepannages: null,
                nbDepannagesTotal: null,
                degresDepannages: null,
                nbDysfonctionnements: null,
                degresDysfonctionnements: null,
                hasTelereleve: null,
                nbCompteursEc: null,
                nbCompteursEf: null,
                nbCompteursRepart: null,
                nbCompteursCet: null,
                nbCompteursCapteur: null,
                nbCompteursElect: null,
                nbCompteursGaz: null,
                nbCompteursTelereveleTotal: null,
                nbCompteursTelereveleOk: null,
                hasTransfertFichiers: null,
                immeubleEc: null,
                immeubleEf: null,
                immeubleRepart: null,
                immeubleCet: null,
                immeubleCapteur: null,
                immeubleElect: null,
                immeubleGaz: null,
                serieConsosEau: null,
                serieConsosCompteurGeneral: null,
            );
        }

        $row = $rows[0];

        $immeubleDto = new ImmeubleDto(
            pkImmeuble: isset($row['PKIMMEUBLE']) ? (int) $row['PKIMMEUBLE'] : null,
            nom: $row['NOM'] ?? null,
            numero: $row['NUMERO'] ?? null,
            ref: $row['ID'] ?? null,
            adresse1: $row['ADRESSE1'] ?? null,
            adresse2: $row['ADRESSE2'] ?? null,
            adresse3: $row['ADRESSE3'] ?? null,
            cp: $row['CP'] ?? null,
            ville: $row['VILLE'] ?? null,
        );

        $nbCompteursEc = isset($row['NBEC']) ? (int) $row['NBEC'] : 0;
        $nbCompteursEf = isset($row['NBEF']) ? (int) $row['NBEF'] : 0;
        $nbCompteursRepart = isset($row['NBREPART']) ? (int) $row['NBREPART'] : 0;
        $nbCompteursCet = isset($row['NBCET']) ? (int) $row['NBCET'] : 0;

        $nbAppareils = $nbCompteursEc + $nbCompteursEf + $nbCompteursRepart + $nbCompteursCet;

        return new TableauDeBordImmeubleDto(
            immeuble: $immeubleDto,
            nbLogements: isset($row['NBLOGEMENT']) ? (int) $row['NBLOGEMENT'] : null,
            nbAppareils: $nbAppareils,
            nbDepannages: isset($row['NBDEPANNAGES']) ? (int) $row['NBDEPANNAGES'] : null,
            nbDepannagesTotal: null,
            degresDepannages: null,
            nbDysfonctionnements: isset($row['NBSUSFRAUDCLI']) ? (int) $row['NBSUSFRAUDCLI'] : null,
            degresDysfonctionnements: null,
            hasTelereleve: isset($row['TELERELEVE']) ? ($row['TELERELEVE'] === 'O') : null,
            nbCompteursEc: $nbCompteursEc,
            nbCompteursEf: $nbCompteursEf,
            nbCompteursRepart: $nbCompteursRepart,
            nbCompteursCet: $nbCompteursCet,
            nbCompteursCapteur: isset($row['NBCAPTEUR']) ? (int) $row['NBCAPTEUR'] : null,
            nbCompteursElect: null,
            nbCompteursGaz: null,
            nbCompteursTelereveleTotal: null,
            nbCompteursTelereveleOk: null,
            hasTransfertFichiers: null,
            // Blocs détaillés à implémenter dans une phase suivante
            immeubleEc: null,
            immeubleEf: null,
            immeubleRepart: null,
            immeubleCet: null,
            immeubleCapteur: null,
            immeubleElect: null,
            immeubleGaz: null,
            serieConsosEau: null,
            serieConsosCompteurGeneral: null,
        );
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
    public function getImmeuble(int $pkUser, int pkImmeuble)
    {
        return [];
    }
    
    public function getImmeubleEc(int $pkUser, int pkImmeuble)
    {
        return [];
    }
    
    public function getImmeubleEf(int $pkUser, int pkImmeuble)
    {
        return [];
    }

    public function getImmeubleRepart(int $pkUser, int pkImmeuble)
    {
        return [];
    }
    
    public function getImmeubleCet(int $pkUser, int pkImmeuble)
    {
        return [];
    }
    
    public function getImmeubleCapteur(int $pkUser, int pkImmeuble)
    {
        return [];
    }

    public function getImmeubleElect(int $pkUser, int pkImmeuble)
    {
        return [];
    }

    public function getImmeubleGaz(int $pkUser, int pkImmeuble)
    {
        return [];
    }
    
    public function etImmeubleSerieConsosEau(int $pkUser, int pkImmeuble)
    {
        return [];
    }

    public function getImmeubleSerieConsosCompteurGeneral(int $pkUser, int pkImmeuble)
    {
        return [];
    }
    
}
