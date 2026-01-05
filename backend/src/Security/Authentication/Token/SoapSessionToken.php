<?php

namespace App\Security\Authentication\Token;


use Symfony\Component\Security\Core\Authentication\Token\AbstractToken;

/**
 * Class SoapSessionToken
 */
class SoapSessionToken extends AbstractToken
{

    /**
     * Returns the user credentials.
     *
     * @return mixed The user credentials
     */
    public function getCredentials()
    {
        return null;
    }

    /**
     * Returns the token.
     *
     * @return $this
     */
    public function getToken()
    {
        return $this;
    }
}
