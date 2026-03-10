<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class TicketingRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getMyTableauBordClient(int $pkUser)
    {
        return [];
    }

    public function getTicketsIntersUser(int $pkUser)
    {
        return [];
    }

    public function getTicketsInterEnabled(int $pkUser): bool
    {
        return true;
    }

    public function getNbTicketsInterUser(int $pkUser): int
    {
        return 123;
    }

    public function getAttachmentTicketInter(int $pkUser, int $pkTicket)
    {
        return [];
    }

    public function getTicketOwnerInter(int $pkUser, int $pkLogement)
    {
        return [];
    }
    
}
