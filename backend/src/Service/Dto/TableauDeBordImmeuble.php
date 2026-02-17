<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TableauDeBordImmeuble
{
    public function __construct(
        public readonly ?Immeuble $immeuble,
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
        public readonly ?ImmeubleEAU $immeubleEc,
        public readonly ?ImmeubleEAU $immeubleEf,
        public readonly ?ImmeubleRepart $immeubleRepart,
        public readonly ?ImmeubleCET $immeubleCet,
        public readonly ?ImmeubleCapteur $immeubleCapteur,
        public readonly ?ImmeubleElect $immeubleElect,
        public readonly ?ImmeubleGaz $immeubleGaz,
        public readonly ?Serie $serieConsosEau,
        public readonly ?Serie $serieConsosCompteurGeneral
    ) {}
}
