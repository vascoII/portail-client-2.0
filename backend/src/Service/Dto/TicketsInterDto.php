<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TicketsInterDto
{
    /**
     * @param TicketInterDto[] $listeTicketsInter
     */
    public function __construct(
        public readonly array $listeTicketsInter
    ) {}
}
