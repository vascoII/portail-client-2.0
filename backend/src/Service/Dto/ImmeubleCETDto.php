<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleCETDto
{
    /**
     * @param ReleveDto[] $listeReleves
     */
    public function __construct(
        public ?int $NbCompteursARelever = null,
        public ?int $NbCompteursReleves = null,
        public ?ChantierDto $Chantier = null,
        public ?TopConsosDto $TopConsos = null,
        public ?SerieDto $SerieConsos = null,
        public ?array $ListeReleves = null,
        public ?float $TotURepart = null,
        public ?float $TotTantChauff = null,
        public ?float $PuTant = null,
        public ?float $PrixURepart = null,
        public ?float $PrixAbonn = null,
        public ?float $MontARepartTant = null,
        public ?float $PartRepartConsos = null,
        public ?float $CtCombust = null,
        public ?SerieDto $SerieConsosTotale1 = null,
        public ?SerieDto $SerieConsosTotale2 = null,
        public ?SerieDto $SerieConsosDJU = null
    ) {}
}
