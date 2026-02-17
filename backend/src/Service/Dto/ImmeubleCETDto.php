<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleCETDto
{
    /**
     * @param ReleveDto[] $listeReleves
     */
    public function __construct(
        public ?int $nbCompteursARelever = null,
        public ?int $nbCompteursReleves = null,
        public ?ChantierDto $chantier = null,
        public ?TopConsosDto $topConsos = null,
        public ?SerieDto $serieConsos = null,
        public ?array $listeReleves = null,
        public ?float $totURepart = null,
        public ?float $totTantChauff = null,
        public ?float $puTant = null,
        public ?float $prixURepart = null,
        public ?float $prixAbonn = null,
        public ?float $montARepartTant = null,
        public ?float $partRepartConsos = null,
        public ?float $ctCombust = null,
        public ?SerieDto $serieConsosTotale1 = null,
        public ?SerieDto $serieConsosTotale2 = null,
        public ?SerieDto $serieConsosDJU = null
    ) {}
}
