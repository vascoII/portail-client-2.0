<?php

namespace App\Controller\Api;

use App\Service\GetImmeublesParams;
use App\Service\GetLogementsParams;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API Controller for Search
 */
#[Route("/api/search", name: "api_search_")]
class SearchApiController extends AbstractApiController
{
    /**
     * Search for immeubles or occupants
     */
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        $fakeResponse = $this->sendFakeData('api.search');
        if ($fakeResponse !== null) {
            return $fakeResponse;
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $type = $request->query->get('type');

        try {
            if ($type == 'immeuble') {
                return $this->searchImmeubles($request, $client);
            } elseif ($type == 'occupant') {
                return $this->searchOccupants($request, $client);
            } else {
                // Return dashboard if no type specified
                $board = $client->getMyTableauBordClient();
                return $this->success([
                    'board' => $this->normalize($board),
                    'message' => 'No search type specified. Use ?type=immeuble or ?type=occupant',
                ]);
            }
        } catch (\Exception $e) {
            return $this->error('Error performing search: ' . $e->getMessage(), 500);
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
            $immeubles = $client->getMyImmeubles($params);
        } else {
            // If no valid filters, return empty result
            $immeubles = [];
        }

        return $this->success([
            'type' => 'immeuble',
            'filters' => array_merge($filtersMin1, $filtersMin3),
            'results' => $this->normalize($immeubles),
            'count' => count($immeubles),
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

        // Get pkImmeuble from request if provided
        $pkImmeuble = $request->query->get('pkImmeuble', -1);

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
            'type' => 'occupant',
            'filters' => array_merge($filtersMin1, $filtersMin3),
            'results' => $this->normalize($logements),
            'count' => count($logements),
        ]);
    }


    private function getValidFilters(Request $request, array $filters, int $minLength): array
    {
        $validFilters = [];

        foreach ($filters as $filter) {
            $value = trim($request->query->get($filter, ''));
            if (strlen($value) >= $minLength) {
                $validFilters[$filter] = $value;
            }
        }

        return $validFilters;
    }
}
