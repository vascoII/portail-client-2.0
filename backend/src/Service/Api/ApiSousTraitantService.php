<?php

declare(strict_types=1);

namespace App\Service\Api;

use App\Repository\Oracle\SousTraitant\SousTraitantRepository;
use App\Service\Dto\SousTraitantDto;

class ApiSousTraitantService
{
    public function __construct(
        private readonly SousTraitantRepository $sousTraitantRepository,
    ) {
    }

    /**
     * Liste tous les sous-traitants actifs.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllSousTraitants(): array
    {
        return $this->sousTraitantRepository->findAll();
    }

    /**
     * Retourne un sous-traitant par identifiant.
     *
     * @return array<string, mixed>|null
     */
    public function getSousTraitant(int $pkSousTraitant): ?array
    {
        return $this->sousTraitantRepository->findOneById($pkSousTraitant);
    }

    public function createSousTraitant(SousTraitantDto $dto): void
    {
        $this->sousTraitantRepository->create($dto);
    }

    public function updateSousTraitant(int $pkSousTraitant, SousTraitantDto $dto): void
    {
        $this->sousTraitantRepository->update($pkSousTraitant, $dto);
    }

    public function deleteSousTraitant(int $pkSousTraitant): void
    {
        $this->sousTraitantRepository->delete($pkSousTraitant);
    }
}

