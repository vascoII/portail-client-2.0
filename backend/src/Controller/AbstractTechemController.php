<?php

namespace App\Controller;

use App\Security\Authentication\Token\SoapSessionToken;
use App\Service\Client;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;

class AbstractTechemController extends AbstractController
{
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    protected function getClient(?Client $client = null)
    {

        /** @var SoapSessionToken $token */
        $token = $this->container->get('security.token_storage')->getToken();

        // Check if token is null (e.g., when security is disabled in faker mode)
        if (!$token) {
            throw new RuntimeException('WS missing token');
        }

        // if (!$token || !$token instanceof SoapSessionToken) {
        //     throw new RuntimeException('WS missing token');
        // }

        if (!$token->hasAttribute('soap.session_id') || !$token->hasAttribute('soap.pk_user')) {
            throw new RuntimeException('WS missing tosession_id/pk_user');
        }

        if (!$token->hasAttribute('soap.user')) {
            return null;
        }
        if ($this->client) {
            $client = $this->client;
        }
        $client->retrieveSession($token->getAttribute('soap.session_id'), $token->getAttribute('soap.pk_user'));

        return $client;
    }

    /**
     * @param      $timezone
     * @param null $format
     *
     * @return string
     */
    protected function convertTimezoneToDate($timezone, $format = null)
    {
        $datetime = new \DateTime();
        return $datetime->format($format ? $format : "d/m/Y");
    }
}
