<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleCET
{
    /**
     * @param Releve[] $listeReleves
     */
    public function __construct(
        public ?int $nbCompteursARelever = null,
        public ?int $nbCompteursReleves = null,
        public ?Chantier $chantier = null,
        public ?TopConsos $topConsos = null,
        public ?Serie $serieConsos = null,
        public ?array $listeReleves = null,
        public ?float $totURepart = null,
        public ?float $totTantChauff = null,
        public ?float $puTant = null,
        public ?float $prixURepart = null,
        public ?float $prixAbonn = null,
        public ?float $montARepartTant = null,
        public ?float $partRepartConsos = null,
        public ?float $ctCombust = null,
        public ?Serie $serieConsosTotale1 = null,
        public ?Serie $serieConsosTotale2 = null,
        public ?Serie $serieConsosDJU = null
    ) {}
}
