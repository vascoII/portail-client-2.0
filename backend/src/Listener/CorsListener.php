<?php

namespace App\Listener;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * CORS Listener
 * Handles Cross-Origin Resource Sharing (CORS) headers for API requests
 */
class CorsListener implements EventSubscriberInterface
{
    /**
     * Allowed origins for CORS
     * In production, replace with your actual frontend domain
     */
    private array $allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ];

    /**
     * Allowed HTTP methods
     */
    private array $allowedMethods = [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
    ];

    /**
     * Allowed headers
     */
    private array $allowedHeaders = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Session-ID',
        'X-Pk-User',
    ];

    public static function getSubscribedEvents(): array
    {
        return [
            // Handle preflight OPTIONS requests BEFORE security check (highest priority)
            KernelEvents::REQUEST => ['onKernelRequest', 10000],
            // Add CORS headers to all API responses (including 404 errors)
            KernelEvents::RESPONSE => ['onKernelResponse', 9999],
            // Handle exceptions (404, etc.) for API routes
            KernelEvents::EXCEPTION => ['onKernelException', 10],
        ];
    }

    /**
     * Handle preflight OPTIONS requests
     * This must run BEFORE security checks to allow preflight requests
     */
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Only handle API routes
        $pathInfo = $request->getPathInfo();
        if (strpos($pathInfo, '/api') !== 0) {
            return;
        }

        // Prevent HTTPS redirect for API routes in development
        // If the request is HTTP but the server tries to redirect to HTTPS, prevent it
        if (!$request->isSecure() && $request->getScheme() === 'http') {
            // Force the request to be treated as HTTP (not HTTPS)
            $request->server->set('HTTPS', 'off');
            $request->server->set('SERVER_PORT', '8000');
        }

        // Handle preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $origin = $request->headers->get('Origin');
            
            $response = new Response();
            $response->setStatusCode(200);
            $response->setContent('');

            // Set CORS headers for preflight
            // In development, allow all localhost origins
            if ($origin && (
                in_array($origin, $this->allowedOrigins, true) ||
                strpos($origin, 'http://localhost:') === 0 ||
                strpos($origin, 'http://127.0.0.1:') === 0
            )) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            } elseif (!$origin) {
                // If no origin header, allow all (for development)
                $response->headers->set('Access-Control-Allow-Origin', '*');
            } else {
                // Origin not in whitelist, but allow it anyway for development
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
            $response->headers->set('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods));
            $response->headers->set('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders));
            $response->headers->set('Access-Control-Max-Age', '3600');

            $event->setResponse($response);
            $event->stopPropagation();
        }
    }

    /**
     * Add CORS headers to all API responses (including redirects)
     */
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $response = $event->getResponse();

        // Only handle API routes
        $pathInfo = $request->getPathInfo();
        if (strpos($pathInfo, '/api') !== 0) {
            return;
        }

        // Intercept HTTPS redirects for API routes and convert them to HTTP
        // This prevents CORS errors when the server tries to redirect HTTP to HTTPS
        if ($response->isRedirection() && $response->headers->has('Location')) {
            $location = $response->headers->get('Location');
            // If redirecting to HTTPS, change to HTTP for API routes
            if (strpos($location, 'https://') === 0) {
                // Extract the path from the location
                $parsedUrl = parse_url($location);
                if (isset($parsedUrl['path']) && strpos($parsedUrl['path'], '/api') === 0) {
                    // Rebuild URL with HTTP
                    $newLocation = 'http://' . ($parsedUrl['host'] ?? 'localhost');
                    if (isset($parsedUrl['port'])) {
                        $newLocation .= ':' . $parsedUrl['port'];
                    }
                    $newLocation .= $parsedUrl['path'];
                    if (isset($parsedUrl['query'])) {
                        $newLocation .= '?' . $parsedUrl['query'];
                    }
                    $response->headers->set('Location', $newLocation);
                }
            }
        }

        // Skip if response already has CORS headers (from preflight)
        if ($response->headers->has('Access-Control-Allow-Origin')) {
            return;
        }

        // Get the origin from the request
        $origin = $request->headers->get('Origin');

        // Check if origin is allowed
        // In development, allow all localhost origins
        if ($origin && (
            in_array($origin, $this->allowedOrigins, true) ||
            strpos($origin, 'http://localhost:') === 0 ||
            strpos($origin, 'http://127.0.0.1:') === 0
        )) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        } elseif (in_array('*', $this->allowedOrigins, true)) {
            // Allow all origins (only for development!)
            $response->headers->set('Access-Control-Allow-Origin', '*');
        } elseif ($origin) {
            // Origin not in whitelist, but allow it anyway for development
            // In production, you might want to reject it
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        // Set CORS headers (only if not already set above)
        if (!$response->headers->has('Access-Control-Allow-Credentials')) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
        $response->headers->set('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods));
        $response->headers->set('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders));
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
        $response->headers->set('Access-Control-Max-Age', '3600');
    }

    /**
     * Handle exceptions (like 404) for API routes and add CORS headers
     */
    public function onKernelException(ExceptionEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $exception = $event->getThrowable();

        // Only handle API routes
        $pathInfo = $request->getPathInfo();
        if (strpos($pathInfo, '/api') !== 0) {
            return;
        }

        // Get the response from the exception
        $response = $event->getResponse();
        if (!$response) {
            // If no response yet, create one for 404
            if ($exception instanceof NotFoundHttpException) {
                $response = new Response('Not Found', 404);
                $event->setResponse($response);
            } else {
                return;
            }
        }

        // Add CORS headers to error responses
        $origin = $request->headers->get('Origin');
        
        // In development, allow all localhost origins
        if ($origin && (
            in_array($origin, $this->allowedOrigins, true) ||
            strpos($origin, 'http://localhost:') === 0 ||
            strpos($origin, 'http://127.0.0.1:') === 0
        )) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        } elseif ($origin) {
            // Allow origin anyway for development
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        $response->headers->set('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods));
        $response->headers->set('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders));
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
        $response->headers->set('Access-Control-Max-Age', '3600');
    }
}

