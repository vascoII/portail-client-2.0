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

    protected function getHtml()
    {
        return 
    $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Pas de données</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
      display: grid;
      min-height: 100svh;
      place-items: center;
      background: #f6f7f9;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px 28px;
      box-shadow: 0 6px 24px rgba(0,0,0,.08);
      max-width: 720px;
      margin: 24px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: clamp(20px, 3.5vw, 28px);
    }
    p {
      margin: 0;
      color: #555;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0e0f12; }
      .card { background: #181a1f; box-shadow: none; }
      p { color: #bbb; }
    }
  </style>
</head>
<body>
  <main class="card" role="main" aria-labelledby="titre">
    <h1 id="titre">Pas de données pour la période sélectionnée</h1>
    <p>Essayez de modifier les filtres (dates, périmètre, etc.).</p>
  </main>
</body>
</html>
HTML;

    }	
	
}
