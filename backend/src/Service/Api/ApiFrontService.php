<?php

namespace App\Service\Api;

use App\Repository\Oracle\FrontRepository;


class ApiFrontService
{
    public function __construct(
        private readonly FrontRepository $frontRepository,
    ) {
    }

    public function getSousTraitants(int $pkUser)
    {
        return $this->frontRepository->getSousTraitants($pkUser);
    }
}

