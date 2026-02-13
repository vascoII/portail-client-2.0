<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\IndexReleve;

final class ConsosPeriode
{
    public function __construct(
        public readonly ?float $conso,
        public readonly ?\DateTimeImmutable $dateDeb,
        public readonly ?\DateTimeImmutable $dateFin,
        public readonly ?IndexReleve $r5,
        public readonly ?IndexReleve $r4,
        public readonly ?IndexReleve $r3,
        public readonly ?IndexReleve $r2,
        public readonly ?IndexReleve $r1,
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
