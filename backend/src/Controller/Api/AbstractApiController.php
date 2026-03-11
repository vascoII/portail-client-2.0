<?php

namespace App\Controller\Api;

use App\Controller\AbstractTechemController;
use App\Service\Client;
use App\Service\FakeDataService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Abstract API Controller
 * Base class for all API controllers
 */
abstract class AbstractApiController extends AbstractTechemController
{
    protected SerializerInterface $serializer;
    protected ?FakeDataService $fakeDataService;
    protected SecurityService $securityService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ?FakeDataService $fakeDataService = null)
    {
        parent::__construct($client);
        $this->serializer = $serializer;
        $this->securityService = $securityService;
        $this->fakeDataService = $fakeDataService;
    }

    /**
     * Returns a JSON response with data
     *
     * @param mixed $data
     * @param int $statusCode
     * @param array $headers
     * @return JsonResponse
     */
    protected function jsonResponse($data, int $statusCode = 200, array $headers = []): JsonResponse
    {
        $json = $this->serializer->serialize($data, 'json', [
            'json_encode_options' => JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
        ]);

        // CORS headers are handled by CorsListener
        // Don't override them here to avoid conflicts

        return new JsonResponse($json, $statusCode, $headers, true);
    }

    /**
     * Returns a success JSON response
     *
     * @param mixed $data
     * @param string|null $message
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function success($data = null, ?string $message = null, int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => $statusCode,
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return $this->jsonResponse($response, $statusCode);
    }

    /**
     * Returns an error JSON response
     *
     * @param string $message
     * @param int $statusCode
     * @param array $errors
     * @return JsonResponse
     */
    protected function error(string $message, int $statusCode = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => $statusCode,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return $this->jsonResponse($response, $statusCode);
    }

    /**
     * Returns a 404 Not Found JSON response
     *
     * @param string $message
     * @return JsonResponse
     */
    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * Returns a 401 Unauthorized JSON response
     *
     * @param string $message
     * @return JsonResponse
     */
    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->error($message, 401);
    }

    /**
     * Returns a 403 Forbidden JSON response
     *
     * @param string $message
     * @return JsonResponse
     */
    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * Get authenticated client from headers (stateless API)
     * Reads X-Session-ID and X-Pk-User from request headers
     *
     * @param Request $request
     * @return Client|JsonResponse
     */
    protected function getAuthenticatedClientFromHeaders(Request $request)
    {
        // Read sessionId and pkUser from headers
        $sessionId = $request->headers->get('X-Session-ID');
        $pkUser = $request->headers->get('X-Pk-User');

        if (!$sessionId || !$pkUser) {
            return $this->unauthorized('Missing authentication headers (X-Session-ID and X-Pk-User required)');
        }

        try {
            // Use retrieveSession() to set sessionId and pkUser in the client
            $this->client->retrieveSession($sessionId, (int)$pkUser);
            return $this->client;
        } catch (\Exception $e) {
            return $this->unauthorized('Invalid session: ' . $e->getMessage());
        }
    }

    /**
     * Get authenticated client or return error
     * Legacy method using Symfony token storage (for backward compatibility)
     *
     * @param Client|null $client
     * @return Client|JsonResponse
     */
    protected function getAuthenticatedClient(?Client $client = null)
    {
        try {
            $client = $this->getClient($client);
            if (is_null($client)) {
                return $this->unauthorized('Session expired or invalid');
            }
            return $client;
        } catch (RuntimeException $e) {
            return $this->unauthorized($e->getMessage());
        }
    }

    /**
     * Normalize data for API response
     * Converts objects to arrays recursively
     *
     * @param mixed $data
     * @return mixed
     */
    protected function normalize($data)
    {
        if (is_object($data)) {
            if (method_exists($data, 'toArray')) {
                return $data->toArray();
            }
            $data = (array) $data;
        }

        if (is_array($data)) {
            return array_map([$this, 'normalize'], $data);
        }

        return $data;
    }

    /**
     * Check if faker mode is enabled
     * 
     * @return bool
     */
    protected function isFakerMode(): bool
    {
        return $this->fakeDataService !== null && $this->fakeDataService->isEnabled();
    }

    /**
     * Send fake data response for an endpoint
     * 
     * This method should be called at the beginning of each endpoint method
     * if you want to use fake data instead of SOAP calls.
     * 
     * @param string $endpoint Endpoint identifier (e.g., 'dashboard', 'factures-list')
     * @param array $params Optional parameters for dynamic endpoints (e.g., ['pkImmeuble' => 12345])
     * @param string|null $message Optional success message
     * @return JsonResponse|null Returns JsonResponse if faker mode is enabled, null otherwise
     */
    protected function sendFakeData(string $endpoint, array $params = [], ?string $message = null): ?JsonResponse
    {
        if (!$this->isFakerMode()) {
            return null;
        }

        try {
            $data = $this->fakeDataService->get($endpoint, $params);
            
            // Normalize the data to match API response format
            $normalizedData = $this->normalize($data);
            
            return $this->success($normalizedData, $message);
        } catch (\Exception $e) {
            // If fake data file doesn't exist, return error or continue with SOAP
            // You can choose to throw an exception or return null to continue with SOAP
            return $this->error('Fake data not available: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Get authenticated client or return error
     * Legacy method using Symfony token storage (for backward compatibility)
     *
     * @param Client|null $client
     * @return bool
     */
    protected function validateToken(?Client $client = null)
    {
        try {
            if (is_null($client)) {
                return $this->unauthorized('Session expired or invalid');
            }
            
            $pkUser = $client->getPkUser();
            $sessionId = $client->getSessionId();
            
            return $this->securityService->validateToken($sessionId, $pkUser);
        } catch (RuntimeException $e) {
            return $this->unauthorized($e->getMessage());
        }
    }

    protected function validateClientOracle(Request $request): bool
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return false;
        }
        /** Only lhazard TBD */
        if ($client->getPkUser() !== 206437) {
            return false;
        }

        return true;
    }
}
