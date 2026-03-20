<?php

declare(strict_types=1);

namespace App\Service\Dto\Immeuble;

use App\Service\Dto\ChantierDto;
use App\Service\Dto\TopConsosDto;
use App\Service\Dto\ReleveDto;

final class ImmeubleElectDto
{
    /**
     * @param ReleveDto[] $listeReleves
     */
    public function __construct(
        public ?int $NbCompteursARelever = null,
        public ?int $NbCompteursReleves = null,
        public ?ChantierDto $Chantier = null,
        public ?TopConsosDto $TopConsos = null,
        public ?array $ListeReleves = null
    ) {}
}
