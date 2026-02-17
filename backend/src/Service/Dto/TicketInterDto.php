<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TicketInterDto
{
    public function __construct(
        public readonly ?string $nom,
        public readonly ?string $email,
        public readonly ?string $telFixe,
        public readonly ?string $telMobile,
        public readonly ?\DateTimeImmutable $ticketDate,
        public readonly ?string $motifLibre,
        public readonly ?string $statut,
        public readonly ?string $objetRetour,
        public readonly ?int $fkLogement,
        public readonly ?string $refLogement,
        public readonly ?string $numIntervention,
        public readonly ?string $fkIntervention,
        public readonly ?string $webUserNom,
        public readonly ?string $webUserPrenom,
        public readonly ?string $webUserTel,
        public readonly ?string $webUserEmail,
        public readonly ?string $webUserUserType,
        public readonly ?string $immId,
        public readonly ?int $fkImmeuble,
        public readonly ?string $statutClient,
        public readonly ?string $caseNumber,
        public readonly ?string $caseId,
        public readonly ?string $attachmentName,
        public readonly ?\DateTimeImmutable $lastUpdateDate
    ) {}
}
