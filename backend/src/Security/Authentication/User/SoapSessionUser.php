<?php

namespace App\Security\Authentication\User;

use App\Service\Client;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class SoapSessionUser
 */
class SoapSessionUser implements UserInterface
{
    private $Erreur;
    private $LoginID;
    private $UserName;
    private $Password;
    private $EMail;
    private $UserType;
    private $PKUser;
    private $Adresse;
    private $CP;
    private $Ville;
    private $FK;
    private $PhoneNumber;
    private $FirstName;
    private $UserRole;
    private $ClientName;
    private $ClientID;
    private $ExpirationDate;
    private $CGU;
    private $FKClient;
    private $FKClientTop;
    private $NbImmeubles;
    private $Seuil_Conso_EF;
    private $Seuil_Conso_EC;
    private $Seuil_Conso_Repart;
    private $Seuil_Conso_CET;
    private $Seuil_Conso_Actif;
    private $Seuil_Conso_Email;
    protected $soapClient;

    public function __construct(Client $soapClient)
    {
        $this->soapClient = $soapClient;
        $soapUser = ($this->soapClient->getCurrentUser());
        if ($soapUser !== null) {
            $this->Erreur = $soapUser->Erreur;
            $this->LoginID = $soapUser->LoginID;
            $this->UserName = $soapUser->UserName;
            $this->Password = $soapUser->Password;
            $this->EMail = $soapUser->EMail;
            $this->UserType = $soapUser->UserType;
            $this->PKUser = $soapUser->PKUser;
            $this->Adresse = $soapUser->Adresse;
            $this->CP = $soapUser->CP;
            $this->Ville = $soapUser->Ville;
            $this->FK = $soapUser->FK;
            $this->PhoneNumber = $soapUser->PhoneNumber;
            $this->FirstName = $soapUser->FirstName;
            $this->UserRole = $soapUser->UserRole;
            $this->ClientName = $soapUser->ClientName;
            $this->ClientID = $soapUser->ClientID;
            $this->ExpirationDate = $soapUser->ExpirationDate;
            $this->CGU = $soapUser->CGU;
            $this->FKClient = $soapUser->FKClient;
            $this->FKClientTop = $soapUser->FKClientTop;
            $this->NbImmeubles = $soapUser->NbImmeubles;
            $this->Seuil_Conso_EF = $soapUser->Seuil_Conso_EF;
            $this->Seuil_Conso_EC = $soapUser->Seuil_Conso_EC;
            $this->Seuil_Conso_Repart = $soapUser->Seuil_Conso_Repart;
            $this->Seuil_Conso_CET = $soapUser->Seuil_Conso_CET;
            $this->Seuil_Conso_Actif = $soapUser->Seuil_Conso_Actif;
            $this->Seuil_Conso_Email = $soapUser->Seuil_Conso_Email;
        }
    }

    public function getSoapUser()
    {
        return $this;
    }

    public function getErreur(): ?string
    {
        return $this->Erreur;
    }

    public function getLoginID(): ?string
    {
        return $this->LoginID;
    }

    public function getUserName(): ?string
    {
        return $this->UserName;
    }

    public function getPassword(): ?string
    {
        return $this->Password;
    }

    public function getEmail(): ?string
    {
        return $this->EMail;
    }

    public function getUserType(): ?string
    {
        return $this->UserType;
    }

    public function getPKUser(): int
    {
        return $this->PKUser;
    }

    public function getAdresse(): ?string
    {
        return $this->Adresse;
    }

    public function getCP(): ?string
    {
        return $this->CP;
    }

    public function getVille(): ?string
    {
        return $this->Ville;
    }

    public function getFK(): int
    {
        return $this->FK;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->PhoneNumber;
    }

    public function getFirstName(): ?string
    {
        return $this->FirstName;
    }

    public function getUserRole(): ?string
    {
        return $this->UserRole;
    }

    public function getClientName(): ?string
    {
        return $this->ClientName;
    }

    public function getClientID(): ?string
    {
        return $this->ClientID;
    }

    public function getExpirationDate(): ?string
    {
        return $this->ExpirationDate;
    }

    public function getCGU(): ?string
    {
        return $this->CGU;
    }

    public function getFKClient(): int
    {
        return $this->FKClient;
    }

    public function getFKClientTop(): int
    {
        return $this->FKClientTop;
    }

    public function getNbImmeubles(): int
    {
        return $this->NbImmeubles;
    }

    public function getSeuil_Conso_EF(): int
    {
        return $this->Seuil_Conso_EF;
    }

    public function getSeuil_Conso_EC(): int
    {
        return $this->Seuil_Conso_EC;
    }

    public function getSeuil_Conso_Repart(): int
    {
        return $this->Seuil_Conso_Repart;
    }

    public function getSeuil_Conso_CET(): int
    {
        return $this->Seuil_Conso_CET;
    }

    public function getSeuil_Conso_Actif(): bool
    {
        return $this->Seuil_Conso_Actif;
    }

    public function getSeuil_Conso_Email(): ?string
    {
        return $this->Seuil_Conso_Email;
    }

    public function getRoles(): array
    {
        $roles = ['ROLE_USER'];

        switch ($this->getUserType()) {
            case 'O':
                $roles[] = 'ROLE_OCCUPANT';
                break;
            case 'M':
                $roles[] = 'ROLE_MAISONMERE';
                break;
            case 'A':
                $roles[] = 'ROLE_AGENCE';
                break;
            case 'S':
            case 'C':
                $roles[] = 'ROLE_SYNDICAT';
                break;
            case 'G':
            default:
                $roles[] = 'ROLE_GESTIONNAIRE';
                break;
        }

        return $roles;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // Otherwise, this method may be left blank
    }

    public function getUserIdentifier(): string
    {
        return $this->getLoginID();
    }
}
