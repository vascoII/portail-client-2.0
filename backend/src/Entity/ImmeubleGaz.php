<?php

declare(strict_types=1);

namespace App\Entity;

final class ImmeubleGaz
{
    /**
     * @param Releve[] $listeReleves
     */
    public function __construct(
        public ?int $nbCompteursARelever = null,
        public ?int $nbCompteursReleves = null,
        public ?Chantier $chantier = null,
        public ?TopConsos $topConsos = null,
        public ?array $listeReleves = null
    ) {}
}
