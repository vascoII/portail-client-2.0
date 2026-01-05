<?php

namespace App\DependencyInjection\Security\Factory;


use Symfony\Bundle\SecurityBundle\DependencyInjection\Security\Factory\FormLoginFactory as SymfonyFormLoginFactory;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;

class FormLoginFactory extends SymfonyFormLoginFactory
{

    public function getKey(): string
    {
        dd('okll');
        return 'form-login';
    }

    public function createAuthenticator(ContainerBuilder $container, $id, $config, $userProviderId): string
    {
        dd('okll2');
        $provider = 'security.authentication.provider.soap.' . $id;
        $container
            ->setDefinition(
                $provider,
                new Definition('App\Security\Authentication\Provider\SoapAuthenticationProvider')
            )
            ->replaceArgument(1, $id);

        return $provider;
    }
}
