<?php

namespace App\Security;

use App\Service\Client;
use App\Security\Authentication\User\SoapSessionUser;
use App\Security\Authentication\User\FakerUser;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

/**
 * Authenticator for API routes using X-Session-ID and X-Pk-User headers
 * 
 * This authenticator reads the session ID and user PK from request headers
 * and creates an authenticated token for stateless API requests.
 */
class ApiHeaderAuthenticator extends AbstractAuthenticator
{
    private Client $soapClient;

    public function __construct(Client $soapClient)
    {
        $this->soapClient = $soapClient;
    }

    /**
     * Check if this authenticator should handle the request
     * Only handles API routes (starting with /api) except login/logout
     */
    public function supports(Request $request): ?bool
    {
        // Don't authenticate OPTIONS requests (CORS preflight)
        if ($request->getMethod() === 'OPTIONS') {
            return false;
        }

        $pathInfo = $request->getPathInfo();
        
        // Only handle API routes
        if (strpos($pathInfo, '/api') !== 0) {
            return false;
        }

        // Don't handle login/logout endpoints (they use different authentication)
        if (strpos($pathInfo, '/api/security/login') === 0 || 
            strpos($pathInfo, '/api/security/logout') === 0) {
            return false;
        }

        // In faker mode, we still need to authenticate to pass Symfony Security
        // but we'll create a minimal token without calling SOAP
        $isFakerMode = ($_ENV['API_CALL_FAKER'] ?? getenv('API_CALL_FAKER') ?? 'false') === 'true';
        if ($isFakerMode) {
            // Check if headers are present (even in faker mode, we need them for the token)
            $sessionId = $request->headers->get('X-Session-ID');
            $pkUser = $request->headers->get('X-Pk-User');
            return !empty($sessionId) && !empty($pkUser);
        }

        // Check if headers are present
        $sessionId = $request->headers->get('X-Session-ID');
        $pkUser = $request->headers->get('X-Pk-User');

        return !empty($sessionId) && !empty($pkUser);
    }

    /**
     * Authenticate the request using headers
     */
    public function authenticate(Request $request): Passport
    {
        $sessionId = $request->headers->get('X-Session-ID');
        $pkUser = $request->headers->get('X-Pk-User');

        if (empty($sessionId) || empty($pkUser)) {
            throw new AuthenticationException('Missing authentication headers (X-Session-ID and X-Pk-User required)');
        }

        // Check if faker mode is enabled
        $isFakerMode = ($_ENV['API_CALL_FAKER'] ?? getenv('API_CALL_FAKER') ?? 'false') === 'true';

        if ($isFakerMode) {
            // In faker mode, create a minimal user without calling SOAP or using cache
            // Use FakerUser instead of SoapSessionUser to avoid any cache calls
            $user = new FakerUser('faker@example.com', (int)$pkUser, 'G');
            
            $attributes = [
                'soap.session_id' => $sessionId,
                'soap.pk_user' => (int)$pkUser,
                'soap.user' => null, // No SOAP user in faker mode
            ];

            return new SelfValidatingPassport(
                new UserBadge($sessionId, function () use ($user) {
                    return $user;
                }, $attributes)
            );
        }

        try {
            // Retrieve session using the headers
            $this->soapClient->retrieveSession($sessionId, (int)$pkUser);
            
            // Get current user from the client
            $currentUser = $this->soapClient->getCurrentUser();
            
            if (!$currentUser) {
                throw new AuthenticationException('Invalid session: user not found');
            }

            // Create user object
            $user = new SoapSessionUser($this->soapClient);
            
            // Get roles from user
            $roles = $user->getRoles();

            // Create passport with user badge
            $attributes = [
                'soap.session_id' => $sessionId,
                'soap.pk_user' => (int)$pkUser,
                'soap.user' => $currentUser,
            ];

            return new SelfValidatingPassport(
                new UserBadge($user->getUserIdentifier(), function () use ($user) {
                    return $user;
                }, $attributes)
            );
        } catch (\Exception $e) {
            throw new AuthenticationException('Invalid session: ' . $e->getMessage());
        }
    }

    /**
     * Create authentication token
     */
    public function createToken(Passport $passport, string $firewallName): TokenInterface
    {
        $user = $passport->getUser();
        $roles = $user->getRoles();

        $token = new UsernamePasswordToken($user, $firewallName, $roles);

        // Set attributes from passport
        $badge = $passport->getBadge(UserBadge::class);
        if ($badge) {
            $attributes = $badge->getAttributes();
            if (isset($attributes['soap.session_id'])) {
                $token->setAttribute('soap.session_id', $attributes['soap.session_id']);
            }
            if (isset($attributes['soap.pk_user'])) {
                $token->setAttribute('soap.pk_user', $attributes['soap.pk_user']);
            }
            if (isset($attributes['soap.user'])) {
                $token->setAttribute('soap.user', $attributes['soap.user']);
            }
        }

        return $token;
    }

    /**
     * Handle authentication success (no redirect needed for API)
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // For API requests, we don't need to redirect
        // The controller will handle the response
        return null;
    }

    /**
     * Handle authentication failure
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        // Return null to let Symfony handle the 401 response
        // The controller can also handle this via access_control
        return null;
    }
}

