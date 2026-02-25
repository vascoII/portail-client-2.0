<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

use App\Domain\Entity\Session;

final class SessionDto
{
    public function __construct(
        public readonly Session $session
    ) {}
}
