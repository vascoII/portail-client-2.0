<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TableauDeBordImmeubleDto
{
    public function __construct(
        public readonly ?ImmeubleDto $immeuble,
        public readonly ?int $nbLogements,
        public readonly ?int $nbAppareils,
        public readonly ?int $nbDepannages,
        public readonly ?int $nbDepannagesTotal,
        public readonly ?int $degresDepannages,
        public readonly ?int $nbDysfonctionnements,
        public readonly ?int $degresDysfonctionnements,
        public readonly ?bool $hasTelereleve,
        public readonly ?int $nbCompteursEc,
        public readonly ?int $nbCompteursEf,
        public readonly ?int $nbCompteursRepart,
        public readonly ?int $nbCompteursCet,
        public readonly ?int $nbCompteursCapteur,
        public readonly ?int $nbCompteursElect,
        public readonly ?int $nbCompteursGaz,
        public readonly ?int $nbCompteursTelereveleTotal,
        public readonly ?int $nbCompteursTelereveleOk,
        public readonly ?bool $hasTransfertFichiers,
        public readonly ?ImmeubleEAUDto $immeubleEc,
        public readonly ?ImmeubleEAUDto $immeubleEf,
        public readonly ?ImmeubleRepartDto $immeubleRepart,
        public readonly ?ImmeubleCETDto $immeubleCet,
        public readonly ?ImmeubleCapteurDto $immeubleCapteur,
        public readonly ?ImmeubleElectDto $immeubleElect,
        public readonly ?ImmeubleGazDto $immeubleGaz,
        public readonly ?SerieDto $serieConsosEau,
        public readonly ?SerieDto $serieConsosCompteurGeneral
    ) {}
}
