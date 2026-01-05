<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use App\Security\Authentication\Token\SoapSessionToken;
use App\Security\Authentication\User\SoapSessionUser;
use App\Service\Client;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;


class AppCustomAuthenticator extends AbstractAuthenticator
{
    private $soapClient;
    protected $router;
    protected $security;

    private const LOGIN_ROUTE = 'app_login';


    public function __construct(
        Client $soapClient,
        RouterInterface $router,
        Security $security
    ) {
        $this->soapClient = $soapClient;
        $this->router = $router;
        $this->security = $security;
    }

    public function supports(Request $request): bool
    {
        // Don't authenticate OPTIONS requests (CORS preflight)
        if ($request->getMethod() === 'OPTIONS') {
            return false;
        }
        
        return self::LOGIN_ROUTE === $request->attributes->get('_route')
        && $request->isMethod($request::METHOD_POST);
    }

    public function authenticate(Request $request): Passport
    {

        $username = $request->request->get('_username');
        $password = $request->request->get('_password');

        $success = $this->soapClient->login($username, $password);
        if (!$success) {
            throw new AuthenticationException('The SOAP authentication failed.');
        }
		
        $roles = ['ROLE_USER'];
        if (isset($this->soapClient->getCurrentUser()->UserType)) {
            switch ($this->soapClient->getCurrentUser()->UserType) {
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
        }

        $attributes = [
            'soap.session_id' =>  $this->soapClient->getSessionId(),
            'soap.pk_user' => $this->soapClient->getPkUser(),
            'soap.user' => $this->soapClient->getCurrentUser(),
        ];
        return new SelfValidatingPassport(new UserBadge($username, null, $attributes));
    }

    public function createToken(Passport $passport, string $firewallName): TokenInterface
    {
        // Retrieve the user from the Passport
        $user = $passport->getUser();

        $newToken = new UsernamePasswordToken($user, $firewallName, $passport->getUser()->getRoles());

        // Set any additional attributes to the token if needed
        $newToken->setAttribute('soap.session_id', $this->soapClient->getSessionId());
        $newToken->setAttribute('soap.pk_user', $this->soapClient->getPkUser());
        $newToken->setAttribute('soap.user', $this->soapClient->getCurrentUser());
        return $newToken;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {

        $url = null;

        if ($this->security->isGranted('ROLE_GESTIONNAIRE')) {
            $url = $request->getSession()->get('_security.front_area.target_path');
        }
        if (is_null($url)) {
            if ($this->security->isGranted('ROLE_OCCUPANT')) {
                $url = $this->router->generate('TechemCoreBundle_Occupant_show');
            } else {
                /****Gestion de la langue vers la redirection vers la page trableau de bord****/
                // $language = $request->getSession()->get('_locale');
                $language = 'fr';
                if ($language == null) {
                    $url = $this->router->generate('TechemCoreBundle_TableauBordClient_index');
                } else {
                    $url = $this->router->generate(
                        'TechemCoreBundle_TableauBordClient_index',
                        array('_locale' =>
                        $language)
                    );
                }
            }
        }
        $user = $token->getAttribute('soap.user');
        if (empty($user->CGU)) {
            if ($user->UserType == "O") {
                $request->getSession()->set("type_user", "occupant");
            } else {
                $request->getSession()->set("type_user", "gestionnaire");
            }

            $url = $this->router->generate('TechemCoreBundle_Front_cgu_validate');
        }
        return new RedirectResponse($url);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        $request->getSession()->set("error", true);
        /****Gestion de la langue vers la redirection vers la page tableau de bord****/
        $language = $request->getSession()->get('_locale');
        if ($language == null) {
            $url = $this->router->generate('app_login');
        } else {
            $url = $this->router->generate('app_login', array('_locale' => $language));
        }

        return new RedirectResponse($url);
    }
}
