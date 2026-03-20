<?php

declare(strict_types=1);

namespace App\Service\Dto\Immeuble;

use DateTime;

final class ImmeubleDto
{
    public function __construct(
        public readonly ?int $PkImmeuble,
        public readonly ?string $Nom,
        public readonly ?string $Numero,
        public readonly ?string $Ref,
        public readonly ?string $Adresse1,
        public readonly ?string $Adresse2,
        public readonly ?string $Adresse3,
        public readonly ?string $Cp,
        public readonly ?string $Ville,
        public readonly ?bool $Telereleve,
        public readonly ?string $FkClientTop,
        public readonly ?bool $Actif = false,
        public readonly ?\DateTime $DateActivationClient,
        public readonly ?\DateTime $DateActivationOccupant,
        public readonly ?bool $HasNoteOccupant = false,
        public readonly ?bool $HasDecompteOccupant = false,
        public readonly ?bool $HasFactures = false,
        public readonly ?bool $HasChantiers = false
    ) {}
}
