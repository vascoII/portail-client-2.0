<?php

declare(strict_types=1);

namespace App\Entity;

final class TicketInterInit
{
    public function __construct(
        public readonly ?int $fkLogement,
        public readonly ?string $nom,
        public readonly ?string $email,
        public readonly ?string $telFixe,
        public readonly ?string $telMobile
    ) {}
}
