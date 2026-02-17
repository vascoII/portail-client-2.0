<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Ticket;

use App\Oracle\OciFacade;
use App\Service\Dto\TicketInterDto;
class TicketInterRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
