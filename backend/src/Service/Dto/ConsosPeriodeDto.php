<?php

declare(strict_types=1);

namespace App\Service\Dto;

use App\Service\Dto\IndexReleveDto;

final class ConsosPeriodeDto
{
    public function __construct(
        public readonly ?float $conso,
        public readonly ?\DateTimeImmutable $dateDeb,
        public readonly ?\DateTimeImmutable $dateFin,
        public readonly ?IndexReleveDto $r5,
        public readonly ?IndexReleveDto $r4,
        public readonly ?IndexReleveDto $r3,
        public readonly ?IndexReleveDto $r2,
        public readonly ?IndexReleveDto $r1,
        public readonly ?float $var4,
        public readonly ?float $var3,
        public readonly ?float $var2,
        public readonly ?float $var1,
        public readonly ?int $degresVar4,
        public readonly ?int $degresVar3,
        public readonly ?int $degresVar2,
        public readonly ?int $degresVar1
    ) {}
}
