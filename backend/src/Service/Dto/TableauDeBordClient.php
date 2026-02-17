<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TableauDeBordClient
{
    public function __construct(
        public readonly ?int $nbImmeubles,
        public readonly ?int $nbImmeublesTelereleve,
        public readonly ?int $nbImmeublesTransfertFichiers,
        public readonly ?int $nbCompteursARelever,
        public readonly ?int $nbCompteursReleves,
        public readonly ?int $nbLogements,
        public readonly ?int $nbCompteurs,
        public readonly ?int $nbCompteursEc,
        public readonly ?int $nbCompteursEf,
        public readonly ?int $nbCompteursRepart,
        public readonly ?int $nbCompteursCet,
        public readonly ?int $nbCompteursCapteur,
        public readonly ?int $nbCompteursElect,
        public readonly ?int $nbCompteursGaz,
        public readonly ?int $nbFuites,
        public readonly ?int $degresFuites,
        public readonly ?int $nbDepannages,
        public readonly ?int $degresDepannages,
        public readonly ?int $nbDysfonctionnements,
        public readonly ?int $degresDysfonctionnements,
        public readonly ?int $nbAnomalies,
        public readonly ?int $degresAnomalies,
        public readonly ?int $nbChantiers,
        public readonly ?int $nbCompteursPoses,
        public readonly ?int $nbCompteursCommandes
    ) {}
}
