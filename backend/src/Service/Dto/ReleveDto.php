<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ReleveDto
{
    public function __construct(
        public readonly ?int $pkReleve,
        public readonly ?\DateTimeImmutable $dateReleve,
        public readonly ?string $typeErc
    ) {}
}
