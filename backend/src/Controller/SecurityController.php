<?php

namespace App\Controller;

use Symfony\Component\Form\FormError;
use Symfony\Component\HttpFoundation\Request;
use App\Form\PasswordType;
use App\Form\ResetPasswordType;
use App\Security\Authentication\Token\SoapSessionToken;
use App\Security\Authentication\User\SoapSessionUser;
use App\Service\Client;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class SecurityController extends  AbstractController
{


    private $client;
    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function loginAction(Request $request, SessionInterface $session)
    {
        $language = $request->get('_locale', 'fr');
        $request->setLocale($language);
        $session->set('_locale', $language);
		$locals['message'] = '';
		if (file_exists('./../demo.txt')){ // mode demo activé

			$locals['message'] = '<marquee style="font-size:20px;color:green">Information Techem</marquee><br />
				<p style="font-size:14px">Vous allez vous connecter au portail de Démonstration<br />Le portail est présenté avec toutes les options disponibles.</p>';
        }
		if (file_exists('./../preview.txt')){// mode preview activé
			$locals['message'] = '<marquee style="font-size:20px;color:ORANGE"> !!!  PREVIEW   !!!</marquee><br />
			<p style="font-size:14px">Vous allez vous connecter au portail de Démonstration<br />Le portail est présenté avec toutes les options disponibles.</p>';
		}
		
		return $this->render('Security/login.html.twig', $locals);
    }


    public function loginFromParamAction($param)
    {
        try {
            $success = $this->client->loginFromParam($param);
        } catch (RuntimeException $e) {
            $this->container->get('session')->set("error", true);
            $url = $this->generateUrl('app_login');
            return $this->redirect($url);
        }

        if ($success) {
            $roles = array('ROLE_USER');
            if (isset($this->client->getCurrentUser()->UserType)) {
                switch ($this->client->getCurrentUser()->UserType) {
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
                        $roles[] = 'ROLE_SYNDICAT';
                        break;
                    case 'C':
                        $roles[] = 'ROLE_SYNDICAT';
                        break;
                    case 'G':
                    default:
                        $roles[] = 'ROLE_GESTIONNAIRE';
                        break;
                }
            }
            $newToken = new SoapSessionToken($roles);
			$user = new SoapSessionUser($this->client);

            $newToken->setUser($user);
            // $newToken->setAuthenticated(true);
            $newToken->setAttribute('soap.session_id', $this->client->getSessionId());
            $newToken->setAttribute('soap.pk_user', $this->client->getPkUser());
            $newToken->setAttribute('soap.user', $this->client->getCurrentUser());
            $this->container->get('security.token_storage')->setToken($newToken);

            $url = $this->generateUrl('front');
            return $this->redirect($url);
        } else {
            $url = $this->generateUrl('app_login');
            return $this->redirect($url);
        }
    }

    public function logoutAction(Request $request)
    {
        /** @var SoapSessionToken $token */
        $token = $this->container->get('security.token_storage')->getToken();

        try {
            if (!$token || !$token instanceof SoapSessionToken) {
                throw new RuntimeException('WS missing token');
            }

            if (!$token->hasAttribute('soap.session_id') || !$token->hasAttribute('soap.pk_user')) {
                throw new RuntimeException('WS missing tosession_id/pk_user');
            }

            $this->client->retrieveSession($token->getAttribute('soap.session_id'), $token->getAttribute('soap.pk_user'));
            $this->client->logout($token->getAttribute('soap.session_id'), $token->getAttribute('soap.pk_user'));
        } catch (\Exception $e) {
        }

        $this->container->get('security.token_storage')->setToken(null);
        $request->getSession()->invalidate();
        return $this->redirect($this->generateUrl('app_login'));
    }

    //#[Route('/reset-password', name: 'reset_password')]
    public function resetPasswordAction(Request $request)
    {
		


        $form = $this->createForm(ResetPasswordType::class);
        $success = false;

        if ($request->isMethod('post')) {
            $form->handleRequest($request);
            $data = $form->getData();
            try {
                $this->client->resetPasswordFromEmail($data['email']);
                $success = true;
            } catch (\Exception $e) {
                $form->addError(new FormError('Une erreur est survenue'));
            }
        }

        $locals = array(
            'form' => $form->createView(),
            'success' => $success,
        );

        return $this->render('Security/reset-password.html.twig', $locals);
    }

    //#[Route('/update-password', name: 'update_password')]
    public function updatePasswordAction(Request $request, AuthorizationCheckerInterface $authorizationChecker)
    {
        /** @var SoapSessionToken $token */
        $token = $this->container->get('security.token_storage')->getToken();

        if (!$token->hasAttribute('soap.session_id') || !$token->hasAttribute('soap.pk_user')) {
            throw new RuntimeException('WS missing tosession_id/pk_user');
        }
        if (!$token->hasAttribute('soap.user')) {
            return null;
        }
        $this->client->retrieveSession($token->getAttribute('soap.session_id'), $token->getAttribute('soap.pk_user'));

        if (is_null($this->client)) {
            return $this->forward('logout');
        }

        $user = $token->getAttribute('soap.user');
        $form = $this->createForm(PasswordType::class);
        $success = false;

        if ($request->isMethod('post')) {
            $form->handleRequest($request);
            if ($form->isValid()) {
                $data = $form->getData();
                try {
                    $this->client->updatePassword($user->PKUser, $data['password']);
                    $success = true;
                } catch (\Exception $e) {
                    $form->addError(new FormError("Impossible de modifier le mot de passe. Réessayez plus tard"));
                }
            }
        }

        $locals = array(
            'success' => $success,
            'form' => $form->createView(),
            'user' => $user,
        );
        if ($authorizationChecker->isGranted('ROLE_OCCUPANT')) {
            $logement = $this->client->getTableauBordOccupant($user->FK);
            $locals['logement'] = $logement;
            return $this->render('Occupant/updatePassword.html.twig', $locals);
        } elseif ($authorizationChecker->isGranted('ROLE_GESTIONNAIRE')) {
			if (file_exists('./../demo.txt')){
				$locals['demo'] = 'demo';
			}
            return $this->render('Operator/updatePassword.html.twig', $locals);
        } else {
            return $this->redirect($this->generateUrl('app_login'));
        }
    }

    //#[Route('/create', name: 'create')]
    public function createAction(Request $request)
    {
        if ($request->isMethod('post')) {
        }

        return $this->render('Security/create.html.twig');
    }

    //#[Route('/reset-or-create', name: 'reset_or_create')]
    public function resetOrCreateAction()
    {
        return $this->render('Security/reset-or-create.html.twig');
    }
}
