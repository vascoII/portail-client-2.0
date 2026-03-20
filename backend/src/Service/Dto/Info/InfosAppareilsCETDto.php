<?php

declare(strict_types=1);

namespace App\Service\Dto\Info;

final class InfosAppareilsCETDto
{
    /**
     * @param InfosAppareilCETDto[] $listeInfosAppareils
     */
    public function __construct(
        public ?array $listeInfosAppareils = null, // InfosAppareilCET[]
        public ?\DateTimeImmutable $dateR6 = null,
        public ?\DateTimeImmutable $dateR5 = null,
        public ?\DateTimeImmutable $dateR4 = null,
        public ?\DateTimeImmutable $dateR3 = null,
        public ?\DateTimeImmutable $dateR2 = null,
        public ?\DateTimeImmutable $dateR1 = null
    ) {}
}
