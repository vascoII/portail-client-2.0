<?php

namespace App\Service\Api;

use App\Repository\Oracle\TicketingRepository;

class ApiTicketingService
{
    public function __construct(
        private readonly TicketingRepository $ticketingRepository,
    ) {
    }

    public function getTicketsIntersUser(int $pkUser)
    {
        return $this->ticketingRepository->getTicketsIntersUser($pkUser);
    }

    public function getTicketsInterEnabled(int $pkUser): bool
    {
        return $this->ticketingRepository->getTicketsInterEnabled($pkUser);
    }

    public function getNbTicketsInterUser(int $pkUser): int
    {
        return $this->ticketingRepository->getNbTicketsInterUser($pkUser);
    }

    public function getAttachmentTicketInter(int $pkUser, int $pkTicket)
    {
        return $this->ticketingRepository->getAttachmentTicketInter($pkUser, $pkTicket);
    }

    public function getTicketOwnerInter(int $pkUser, int $pkLogement)
    {
        return $this->ticketingRepository->getTicketOwnerInter($pkUser, $pkLogement);
    }
}
