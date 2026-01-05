<?php

namespace App\Security\Authentication\User;

use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Minimal user implementation for faker mode
 * This avoids creating SoapSessionUser which may trigger cache calls
 */
class FakerUser implements UserInterface
{
    private string $loginId;
    private int $pkUser;
    private string $userType;
    private array $roles;

    public function __construct(string $loginId, int $pkUser, string $userType = 'G')
    {
        $this->loginId = $loginId;
        $this->pkUser = $pkUser;
        $this->userType = $userType;
        
        // Set roles based on user type
        $this->roles = ['ROLE_USER'];
        switch ($userType) {
            case 'O':
                $this->roles[] = 'ROLE_OCCUPANT';
                break;
            case 'M':
                $this->roles[] = 'ROLE_MAISONMERE';
                break;
            case 'A':
                $this->roles[] = 'ROLE_AGENCE';
                break;
            case 'S':
            case 'C':
                $this->roles[] = 'ROLE_SYNDICAT';
                break;
            case 'G':
            default:
                $this->roles[] = 'ROLE_GESTIONNAIRE';
                break;
        }
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // No credentials to erase
    }

    public function getUserIdentifier(): string
    {
        return $this->loginId;
    }

    public function getPkUser(): int
    {
        return $this->pkUser;
    }

    public function getUserType(): string
    {
        return $this->userType;
    }
}

