<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class LogementRepart
{
    /**
     * @param InfosAppareilRepart[] $listeInfosAppareils
     * @param ConsoPieceRepart[]    $consosPieces
     */
    public function __construct(
        public ?array $listeInfosAppareils = null, // InfosAppareilRepart[]
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
        public ?Serie $serieConsosDJU = null,
        public ?array $consosPieces = null // ConsoPieceRepart[]
    ) {}
}
