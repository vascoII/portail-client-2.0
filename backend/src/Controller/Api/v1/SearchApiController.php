<?php

namespace App\Controller\Api\v1;

use App\Service\GetImmeublesParams;
use App\Service\GetLogementsParams;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API Controller for Search
 */
#[Route("/api/v1/search", name: "api_v1_search_")]
class SearchApiController extends AbstractApiController
{
    /**
     * Search for immeubles or occupants
     *
     * Now expects a POST request with a JSON body:
     * {
     *   "type": "immeuble" | "occupant",
     *   "ref": "...",
     *   "ref_numero": "...",
     *   "nom": "...",
     *   "tout": "...",
     *   "adresse": "...",
     *   "pkImmeuble": 123 // (optionnel, pour occupant)
     * }
     */
    #[Route("", name: "index", methods: ["POST"])]
    public function index(Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        // Read "type" from JSON body, fallback to query if needed
        $type = $request->query->get('type', null);
        if ($type === null || $type === '') {
            try {
                $data = $request->toArray();
            } catch (\JsonException $e) {
                $data = [];
            }
            $type = $data['type'] ?? null;
        }

        try {
            if ($type == 'immeuble') {
                return $this->searchImmeubles($request, $client);
            } elseif ($type == 'occupant') {
                return $this->searchOccupants($request, $client);
            } else {
                // Return dashboard if no type specified
                $board = $client->getMyTableauBordClientNoCache();
                return $this->success([
                    'board' => $this->normalize($board),
                    'message' => 'Aucun type de recherche spécifié. Utilisez ?type=immeuble ou ?type=occupant',
                ]);
            }
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la recherche: ' . $e->getMessage(), 500);
        }
    }


    private function searchImmeubles(Request $request, $client): JsonResponse
    {
        $filtersMin3 = $this->getValidFilters($request, ['nom', 'tout', 'adresse'], 3);
        $filtersMin1 = $this->getValidFilters($request, ['ref', 'ref_numero'], 1);

        $params = new GetImmeublesParams();
        $params->NBANOMALIES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES = true;
        $params->NBCOMPTEURS = true;

        // Apply filters
        if (isset($filtersMin1['ref'])) {
            $params->FIELD_REF = $filtersMin1['ref'];
        }
        if (isset($filtersMin1['ref_numero'])) {
            $params->FIELD_REF_NUMERO = $filtersMin1['ref_numero'];
        }
        if (isset($filtersMin3['nom'])) {
            $params->FIELD_NOM = $filtersMin3['nom'];
        }
        if (isset($filtersMin3['tout'])) {
            $params->FIELD_ALLFIELDS = $filtersMin3['tout'];
        }
        if (isset($filtersMin3['adresse'])) {
            $params->FIELD_ADRESSE_CP_VILLE = $filtersMin3['adresse'];
        }

        // Check if we have at least one filter
        $hasFilters = !empty($filtersMin1) || !empty($filtersMin3);

        if ($hasFilters) {
            $immeubles = $client->getMyImmeubles($params, false);
        } else {
            // If no valid filters, return empty result
            $immeubles = [];
        }

        return $this->success([
            'immeubles' => $this->normalize($immeubles),
        ]);
    }


    private function searchOccupants(Request $request, $client): JsonResponse
    {
        $filtersMin3 = $this->getValidFilters($request, ['nom', 'tout', 'adresse'], 3);
        $filtersMin1 = $this->getValidFilters($request, ['ref', 'ref_numero'], 1);

        $params = new GetLogementsParams();
        $params->NBANOMALIES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES = true;
        $params->NBCOMPTEURS = true;

        // Get pkImmeuble from request if provided (JSON body or query)
        $pkImmeuble = $request->query->get('pkImmeuble', null);
        if ($pkImmeuble === null) {
            try {
                $data = $request->toArray();
            } catch (\JsonException $e) {
                $data = [];
            }
            $pkImmeuble = $data['pkImmeuble'] ?? -1;
        }

        // Apply filters
        if (isset($filtersMin1['ref'])) {
            $params->FIELD_REFOCCUPANT = $filtersMin1['ref'];
        }
        if (isset($filtersMin1['ref_numero'])) {
            $params->FIELD_REFOCCUPANT = $filtersMin1['ref_numero'];
        }
        if (isset($filtersMin3['nom'])) {
            $params->FIELD_NOM = $filtersMin3['nom'];
        }
        if (isset($filtersMin3['tout'])) {
            $params->FIELD_ALLFIELDS = $filtersMin3['tout'];
        }
        if (isset($filtersMin3['adresse'])) {
            $params->FIELD_ADRESSE_CP_VILLE = $filtersMin3['adresse'];
        }

        // Check if we have at least one filter
        $hasFilters = !empty($filtersMin1) || !empty($filtersMin3);

        if ($hasFilters) {
            $logements = $client->getLogements($pkImmeuble, $params);
        } else {
            // If no valid filters, return empty result
            $logements = [];
        }

        return $this->success([
            'logement' => $this->normalize($logements),
            
        ]);
    }


    private function getValidFilters(Request $request, array $filters, int $minLength): array
    {
        $validFilters = [];

        // Prefer JSON body (POST), but keep query support as fallback
        try {
            $body = $request->toArray();
        } catch (\JsonException $e) {
            $body = [];
        }

        foreach ($filters as $filter) {
            $rawValue = null;

            if ($request->isMethod('POST')) {
                if (array_key_exists($filter, $body)) {
                    $rawValue = $body[$filter];
                }
            }

            if ($rawValue === null) {
                $rawValue = $request->query->get($filter, '');
            }

            $value = trim((string) $rawValue);
            if (strlen($value) >= $minLength) {
                $validFilters[$filter] = $value;
            }
        }

        return $validFilters;
    }
}
