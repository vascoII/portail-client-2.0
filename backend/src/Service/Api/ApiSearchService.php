<?php

namespace App\Service\Api;

use App\Repository\Oracle\SearchRepository;

class ApiSearchService
{
    public function __construct(
        private readonly SearchRepository $searchRepository,
    ) {
    }
}

