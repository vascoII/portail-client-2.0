<?php

namespace App\Security\Authentication\Provider;

use App\Service\Client;
use App\Security\Authentication\User\SoapSessionUser;
use App\Security\Authentication\User\FakerUser;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

final class UserProvider implements UserProviderInterface
{

    private $soapClient;

    public function __construct(Client $soapClient)
    {
        $this->soapClient = $soapClient;
    }


    /**
     * {@inheritDoc}
     */
    public function loadUserByIdentifier(string $username): UserInterface
    {
        $userData = $this->soapClient->getCurrentUser();

        if (!$userData) {
            throw new \InvalidArgumentException(sprintf('No user found for identifier "%s"', $username));
        }
        return new SoapSessionUser($this->soapClient);
    }


    /**
     * {@inheritDoc}
     */
    public function refreshUser(UserInterface $user): UserInterface
    {
        return $user;
    }

    /**
     * {@inheritDoc}
     */
    public function supportsClass($class): bool
    {
        return SoapSessionUser::class === $class || FakerUser::class === $class;
    }
}
