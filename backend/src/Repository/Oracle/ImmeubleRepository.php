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
            'hasTransfertFichiers' => false
        ];
    }
    
    public function getImmeubleEc(int $pkUser, int $pkImmeuble): ImmeubleEAUDto
    {
        return new ImmeubleEAUDto(
            nbCompteursARelever: null,
            nbCompteursReleves: 0,
            nbFuites: null,
            degresFuites: null,
            nbAnomalies: null,
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
        return new ImmeubleEAUDto(
            nbCompteursARelever: null,
            nbCompteursReleves: 0,
            nbFuites: null,
            degresFuites: null,
            nbAnomalies: null,
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
        return new ImmeubleRepartDto(
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
        return new ImmeubleCETDto(
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
