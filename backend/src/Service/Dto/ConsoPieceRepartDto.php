<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ConsoPieceRepartDto
{
    public function __construct(
        public readonly ?string $emplacement,
        public readonly ?IndexReleveDto $r1,
        public readonly ?IndexReleveDto $r2
    ) {}
}
