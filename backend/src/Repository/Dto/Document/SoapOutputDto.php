<?php

declare(strict_types=1);

namespace App\Repository\Dto\Document;

final class SoapOutputDto
{
    public function __construct(
        public readonly int $id
    ) {}
}
