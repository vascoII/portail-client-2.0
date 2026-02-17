<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class Immeuble
{
    public function __construct(
        public readonly ?int $pkImmeuble,
        public readonly ?string $nom,
        public readonly ?string $numero,
        public readonly ?string $ref,
        public readonly ?string $adresse1,
        public readonly ?string $adresse2,
        public readonly ?string $adresse3,
        public readonly ?string $cp,
        public readonly ?string $ville,
        public readonly ?bool $hasTelereleve,
        public readonly ?int $fkClientTop,
        public readonly ?bool $actif,
        public readonly ?\DateTimeImmutable $dateActivationClient,
        public readonly ?\DateTimeImmutable $dateActivationOccupant,
        public readonly ?bool $hasNoteOccupant,
        public readonly ?bool $hasDecompteOccupant,
        public readonly ?bool $hasFactures,
        public readonly ?bool $hasChantiers,
        public readonly ?int $nbLogements,
        public readonly ?int $nbAppareils,
        public readonly ?int $nbDepannages,
        public readonly ?int $nbDepannagesTotal,
        public readonly ?int $degresDepannages,
        public readonly ?int $nbDysfonctionnements,
        public readonly ?int $degresDysfonctionnements,
        public readonly ?int $nbCompteursEC,
        public readonly ?int $nbCompteursEF,
        public readonly ?int $nbCompteursRepart,
        public readonly ?int $nbCompteursCET,
        public readonly ?int $nbCompteursCapteur,
        public readonly ?int $nbCompteursElect,
        public readonly ?int $nbCompteursGaz,
        public readonly ?int $nbCompteursTelereveleTotal,
        public readonly ?int $nbCompteursTelereveleOK,
        public readonly ?bool $hasTransfertFichiers,
        public readonly ?int $nbFuites,
        public readonly ?int $nbAnomalies,
        public readonly ?int $nbChantiers
    ) {}
}
