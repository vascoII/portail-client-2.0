<?php

namespace App\Controller\Api\v1;

use App\Security\Authentication\Token\SoapSessionToken;
use App\Security\Authentication\User\SoapSessionUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;

/**
 * API Controller for Security (Authentication, Password management)
 */
#[Route("/api/v1/security", name: "api_v1_security_")]
class SecurityApiController extends AbstractApiController
{
    /**
     * Login via API (returns JSON instead of redirect)
     * Stateless: returns session_id and pk_user to be sent in headers for subsequent requests
     */
    #[Route("/login", name: "login", methods: ["POST"])]
    public function login(Request $request): JsonResponse
    {

        $data = json_decode($request->getContent(), true);

        $username = (string) $data['username'] ?? null;
        $password = (string) $data['password'] ?? null;

        if (empty($username) || empty($password)) {
            return $this->error('Un nom d\'utilisateur et un mot de passe sont requis.', 400);
        }

        try {
            $client = $this->client;
            $loginData = $client->loginForApi($username, $password);

            if (!$loginData) {
                return $this->error('Identifiants invalides', 401);
            }

            //Get client's Tickets permissions
            $hasTicketPermission = $client->checkTicketsInterEnabled(
                $loginData['pk_user'],
                $loginData['session_id']
            );

            $loginData['user']->Password = "";
            $loginData['user']->PasswordExpirationDate = "";
            $loginData['user']->ExpirationDate = "";

            $currentUser = $loginData['user'];
            $roles = ['ROLE_USER'];

            if (isset($currentUser->UserType)) {
                switch ($currentUser->UserType) {
                    case 'O':
                        $roles[] = 'ROLE_OCCUPANT';
                        break;
                    case 'M':
                    case 'A':
                    case 'S':
                    case 'C':
                        $roles[] = 'ROLE_CLIENT';
                        break;
                    case 'G':
                        $roles[] = 'ROLE_GESTIONNAIRE';
                        break;
                    default:
                        $roles[] = 'ROLE_CLIENT';
                        break;
                }
            }

            $currentUserNormalized = $this->normalize($currentUser);

            //Get client's Tickets permissions
            $hasTicketPermission = $client->checkTicketsInterEnabled(
                $loginData['pk_user'],
                $loginData['session_id']
            );
            $currentUserNormalized['hasTicketPermission'] = $hasTicketPermission;

            // Return session_id and pk_user for stateless API
            // Frontend will send these in headers for subsequent requests
            return $this->success([
                'user' => $currentUserNormalized,
                'roles' => $roles,
                'has_ticket_permission' => $hasTicketPermission,
                'session_id' => $loginData['session_id'],
                'pk_user' => $loginData['pk_user'],
            ], 'Connexion réussie');
        } catch (\Exception $e) {
            return $this->error('La connexion a échoué: ' . $e->getMessage(), 401);
        }
    }
    /**
     * Login via parameter (for special login links)
     */
    #[Route("/login/{param}", name: "login_from_param", methods: ["GET"])]
    public function loginFromParam(string $param, SessionInterface $session): JsonResponse
    {
        try {
            $client = $this->client;
            $success = $client->loginFromParam($param);

            if (!$success) {
                return $this->error('La connexion a échoué', 401);
            }

            $roles = ['ROLE_USER'];
            $currentUser = $client->getCurrentUser();

            if (isset($currentUser->UserType)) {
                switch ($currentUser->UserType) {
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

            $newToken = new SoapSessionToken($roles);
            $user = new SoapSessionUser($client);

            $newToken->setUser($user);
            $newToken->setAttribute('soap.session_id', $client->getSessionId());
            $newToken->setAttribute('soap.pk_user', $client->getPkUser());
            $newToken->setAttribute('soap.user', $currentUser);
            $this->container->get('security.token_storage')->setToken($newToken);

            return $this->success([
                'user' => $this->normalize($currentUser),
                'roles' => $roles,
                'session_id' => $client->getSessionId(),
            ], 'Connexion réussie');
        } catch (RuntimeException $e) {
            return $this->error('La connexion a échoué: ' . $e->getMessage(), 401);
        } catch (\Exception $e) {
            return $this->error('La connexion a échoué: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Logout current user
     */
    #[Route("/logout", name: "logout", methods: ["POST"])]
    public function logout(Request $request): JsonResponse
    {
        /** @var SoapSessionToken|null $token */
        $token = $this->container->get('security.token_storage')->getToken();

        try {
            if ($token && $token instanceof SoapSessionToken) {
                if ($token->hasAttribute('soap.session_id') && $token->hasAttribute('soap.pk_user')) {
                    $this->client->retrieveSession(
                        $token->getAttribute('soap.session_id'),
                        $token->getAttribute('soap.pk_user')
                    );
                    $this->client->logout(
                        $token->getAttribute('soap.session_id'),
                        $token->getAttribute('soap.pk_user')
                    );
                }
            }
        } catch (\Exception $e) {
            // Continue with logout even if SOAP logout fails
        }

        $this->container->get('security.token_storage')->setToken(null);
        $request->getSession()->invalidate();

        return $this->success(null, 'Déconnexion réussie');
    }

    /**
     * Reset password from email
     */
    #[Route("/reset-password", name: "reset_password", methods: ["POST"])]
    public function resetPassword(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || empty($data['email'])) {
            return $this->error('L\'e-mail est requis', 400);
        }

        $email = $data['email'];

        // Validate email format
        $emailConstraint = new EmailConstraint();
        $errors = $validator->validate($email, $emailConstraint);
        if (count($errors) > 0) {
            return $this->error('Adresse e-mail invalide', 400);
        }

        try {
            $this->client->resetPasswordFromEmail($email);
            return $this->success(null, 'Email de réinitialisation du mot de passe envoyé avec succès');
        } catch (\Exception $e) {
            return $this->error('Une erreur s\'est produite lors de l\'envoi de l\'e-mail de réinitialisation du mot de passe.', 500);
        }
    }

    /**
     * Update password for authenticated user
     */
    #[Route("/update-password", name: "update_password", methods: ["PUT", "PATCH"])]
    public function updatePassword(Request $request): JsonResponse
    {
        /** @var SoapSessionToken|null $token */
        $token = $this->container->get('security.token_storage')->getToken();

        if (!$token || !$token instanceof SoapSessionToken) {
            return $this->unauthorized('Non authentifié');
        }

        if (!$token->hasAttribute('soap.session_id') || !$token->hasAttribute('soap.pk_user')) {
            return $this->unauthorized('Informations de session manquantes');
        }

        if (!$token->hasAttribute('soap.user')) {
            return $this->unauthorized('Informations utilisateur manquantes');
        }

        try {
            $this->client->retrieveSession(
                $token->getAttribute('soap.session_id'),
                $token->getAttribute('soap.pk_user')
            );

            $user = $token->getAttribute('soap.user');
            $data = json_decode($request->getContent(), true);

            if (!$data || empty($data['password'])) {
                return $this->error('Mot de passe requis', 400);
            }

            // Handle password confirmation
            $password = null;
            if (is_array($data['password'])) {
                if (isset($data['password']['first']) && isset($data['password']['second'])) {
                    if ($data['password']['first'] !== $data['password']['second']) {
                        return $this->error('Les mots de passe ne correspondent pas', 400);
                    }
                    $password = $data['password']['first'];
                } else {
                    $password = $data['password']['first'] ?? $data['password'][0] ?? null;
                }
            } else {
                $password = $data['password'];
            }

            if (empty($password)) {
                return $this->error('Mot de passe requis', 400);
            }

            // Validate password length
            if (strlen($password) < 8) {
                return $this->error('Le mot de passe doit contenir au moins 8 caractères', 400);
            }

            $this->client->updatePassword($user->PKUser, $password);
            return $this->success(null, 'Mot de passe mis à jour avec succès');
        } catch (\Exception $e) {
            return $this->error('Impossible de mettre à jour le mot de passe. Veuillez réessayer plus tard', 500);
        }
    }

    /**
     * Get current user information
     */
    #[Route("/me", name: "me", methods: ["GET"])]
    public function me(): JsonResponse
    {
        /** @var SoapSessionToken|null $token */
        $token = $this->container->get('security.token_storage')->getToken();

        if (!$token || !$token instanceof SoapSessionToken) {
            return $this->unauthorized('Non authentifié');
        }

        if (!$token->hasAttribute('soap.user')) {
            return $this->unauthorized('Informations utilisateur manquantes');
        }

        $user = $token->getAttribute('soap.user');
        $roles = $token->getRoleNames();

        return $this->success([
            'user' => $this->normalize($user),
            'roles' => $roles,
        ]);
    }
}
