<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class LogementCETDto
{
    /**
     * @param InfosAppareilCETDto[] $listeInfosAppareils
     */
    public function __construct(
        public ?array $listeInfosAppareils = null, // InfosAppareilCETDto[]
        public ?float $totURepart = null,
        public ?float $totTantChauff = null,
        public ?float $puTant = null,
        public ?float $prixURepart = null,
        public ?float $prixAbonn = null,
        public ?float $montARepartTant = null,
        public ?float $partRepartConsos = null,
        public ?float $ctCombust = null,
        public ?float $uRepartLog = null,
        public ?float $tantLog = null,
        public ?float $prixChauffTantLog = null,
        public ?float $ctChauffLog = null,
        public ?SerieDto $serieConsosDJU = null
    ) {}
}
