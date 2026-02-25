<?php

declare(strict_types=1);

namespace App\Repository\Dto\Operator;

final class GetOperatorOutputDto
{
    public function __construct(
        public readonly string $userName,
        public readonly string $email,
        public readonly string $userType,
        public readonly int $pkUser,
        public readonly string $adresse,
        public readonly string $cp,
        public readonly string $ville,
        public readonly int $fk,
        public readonly string $phoneNumber,
        public readonly string $firstName,
        public readonly string $userRole,
        public readonly string $clientName,
        public readonly string $clientId,
        public readonly string $cgu,
        public readonly int $fkClient,
        public readonly int $fkClientTop,
        public readonly int $nbImmeubles,
        public readonly int $seuilConsoEf,
        public readonly int $seuilConsoEc,
        public readonly int $seuilConsoRepart,
        public readonly int $seuilConsoCet,
        public readonly bool $seuilConsoActif,
        public readonly string $seuilConsoEmail,
        public readonly bool $showImmeublesArc,
        public readonly bool $showFactures,
        public readonly bool $showChgtOccupant,
        public readonly bool $showChantiers
    ) {}
}
