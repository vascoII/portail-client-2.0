<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TicketsInter
{
    /**
     * @param TicketInter[] $listeTicketsInter
     */
    public function __construct(
        public readonly array $listeTicketsInter
    ) {}
}
