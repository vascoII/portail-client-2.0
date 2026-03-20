<?php

declare(strict_types=1);

namespace App\Service\Dto;

use App\Service\Dto\Immeuble\ImmeubleDto;
use App\Service\Dto\Logement\LogementDto;
use App\Service\Dto\Logement\LogementEAUDto;
use App\Service\Dto\Logement\LogementRepartDto;
use App\Service\Dto\Logement\LogementCETDto;
use App\Service\Dto\Logement\LogementCapteurDto;
use App\Service\Dto\Logement\LogementElectDto;
use App\Service\Dto\Logement\LogementGazDto;

final class TableauDeBordLogementDto
{
    public function __construct(
        public readonly ?ImmeubleDto $immeuble,
        public readonly ?LogementDto $logement,
        public readonly ?OccupantDto $occupant,
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
        public readonly ?LogementEAUDto $logementEc,
        public readonly ?LogementEAUDto $logementEf,
        public readonly ?LogementRepartDto $logementRepart,
        public readonly ?LogementCETDto $logementCet,
        public readonly ?LogementCapteurDto $logementCapteur,
        public readonly ?LogementElectDto $logementElect,
        public readonly ?LogementGazDto $logementGaz
    ) {}
}
