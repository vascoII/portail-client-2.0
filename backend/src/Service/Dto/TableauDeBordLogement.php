<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TableauDeBordLogement
{
    public function __construct(
        public readonly ?Immeuble $immeuble,
        public readonly ?Logement $logement,
        public readonly ?Occupant $occupant,
        public readonly ?int $nbAppareils,
        public readonly ?int $nbCompteursEc,
        public readonly ?int $nbCompteursEf,
        public readonly ?int $nbCompteursRepart,
        public readonly ?int $nbCompteursCet,
        public readonly ?int $nbCompteursCapteur,
        public readonly ?int $nbCompteursElect,
        public readonly ?int $nbCompteursGaz,
        public readonly ?int $nbDepannages,
        public readonly ?int $nbDepannagesTotal,
        public readonly ?int $nbDysfonctionnements,
        public readonly ?int $nbTicketsInter,
        public readonly ?bool $ticketsInterEnabled,
        public readonly ?LogementEAU $logementEc,
        public readonly ?LogementEAU $logementEf,
        public readonly ?LogementRepart $logementRepart,
        public readonly ?LogementCET $logementCet,
        public readonly ?LogementCapteur $logementCapteur,
        public readonly ?LogementElect $logementElect,
        public readonly ?LogementGaz $logementGaz
    ) {}
}
