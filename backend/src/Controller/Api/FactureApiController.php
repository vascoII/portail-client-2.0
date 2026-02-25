<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Api\ApiFactureService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;
use App\Service\FakeDataService;
/**
 * API Controller for Factures (Invoices)
 */
#[Route("/api/factures", name: "api_facture_", priority: 10)]
class FactureApiController extends AbstractApiController
{
  private ApiFactureService $apiFactureService;

  public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ?FakeDataService $fakeDataService = null, ApiFactureService $apiFactureService)
  {
    parent::__construct($client, $serializer, $securityService, $fakeDataService);
    $this->apiFactureService = $apiFactureService;
  }
  
  /**
   * Normalize a single invoice object/array to API format
   * 
   * @param mixed $facture Invoice object or array
   * @return array Normalized invoice data
   */
  private function normalizeFacture($facture): array
  {
    // Handle both object and array formats
    $factureData = is_array($facture) ? $facture : (array) $facture;

    // Handle nested Facture object/array
    if (isset($factureData['Facture'])) {
      $nestedFacture = $factureData['Facture'];
      $nestedArray = is_array($nestedFacture) ? $nestedFacture : (array) $nestedFacture;
      $factureData = array_merge($factureData, $nestedArray);
    }

    // Get values with fallback for different field names
    $pkFacture = $factureData['PKFacture'] ?? $factureData['pkFacture'] ?? null;
    $numero = $factureData['NumFacture'] ?? $factureData['Numero'] ?? $factureData['numero'] ?? null;
    $dateEdition = $factureData['DateEdition'] ?? $factureData['dateEdition'] ?? null;
    $montantHT = $factureData['MontantTotalHT'] ?? $factureData['montantTotalHT'] ?? null;
    $montantTTC = $factureData['MontantTotalTTC'] ?? $factureData['montantTotalTTC'] ?? null;
    $montantAPayer = $factureData['MontantTotalAPayer'] ?? $factureData['montantTotalAPayer'] ?? null;
    $codeGestio = $factureData['CodeGestio'] ?? $factureData['codeGestio'] ?? null;
    $adresse = $factureData['Adresse'] ?? $factureData['adresse'] ?? null;
    $ville = $factureData['Ville'] ?? $factureData['ville'] ?? null;
    $cp = $factureData['CP'] ?? $factureData['Cp'] ?? $factureData['cp'] ?? null;

    // Format date safely
    $dateEditionFormatted = null;
    $dateEditionISO = null;
    if ($dateEdition) {
      $timestamp = strtotime($dateEdition);
      if ($timestamp !== false) {
        $dateEditionISO = date('Y-m-d', $timestamp);
        $dateEditionFormatted = date('d/m/Y', $timestamp);
      }
    }

    return [
      'pkFacture' => $pkFacture !== null ? (string) $pkFacture : null,
      'numero' => $numero !== null ? (string) $numero : null,
      'dateEdition' => $dateEditionISO,
      'dateEditionFormatted' => $dateEditionFormatted,
      'montantTotalHT' => $montantHT !== null ? (float) $montantHT : null,
      'montantTotalHTFormatted' => $montantHT !== null
        ? number_format((float) $montantHT, 2, ',', ' ') . ' €'
        : null,
      'montantTotalTTC' => $montantTTC !== null ? (float) $montantTTC : null,
      'montantTotalTTCFormatted' => $montantTTC !== null
        ? number_format((float) $montantTTC, 2, ',', ' ') . ' €'
        : null,
      'montantTotalAPayer' => $montantAPayer !== null ? (float) $montantAPayer : null,
      'montantTotalAPayerFormatted' => $montantAPayer !== null
        ? number_format((float) $montantAPayer, 2, ',', ' ') . ' €'
        : null,
      'codeGestio' => $codeGestio !== null ? (string) $codeGestio : null,
      'adresse' => $adresse !== null ? (string) $adresse : null,
      'ville' => $ville !== null ? (string) $ville : null,
      'cp' => $cp !== null ? (string) $cp : null,
    ];
  }

  /**
   * Get list of invoices
   */
  #[Route("", name: "list", methods: ["GET"])]
  public function list(Request $request): JsonResponse
  {
    // Check if faker mode is enabled and return fake data (already formatted)
    if ($this->isFakerMode()) {
      try {
        $fakeData = $this->fakeDataService->get('api.factures', []);
        return new JsonResponse($fakeData);
      } catch (\Exception $e) {
        return $this->error('Fake data not available: ' . $e->getMessage(), 500);
      }
    }

    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      $factures = $client->getFactures();

      //$facturesOracle = $this->apiFactureService->getFactures($client->getPkUser());

      if (empty($factures)) {
        return $this->success([
          'factures' => [],
          'count' => 0,
        ], 'No invoices found');
      }

      $listFactures = (array) $factures->ListeFactures;
      if (isset($listFactures['facture'])) {
        $listFactures = $listFactures['facture'];
      }

      // Normalize data for API
      $normalizedFactures = [];
      foreach ($listFactures as $facture) {
        $normalizedFactures[] = $this->normalizeFacture($facture);
      }

      return $this->success([
        'factures' => $normalizedFactures,
        'count' => count($normalizedFactures),
      ]);
    } catch (\Exception $e) {
      return $this->error('Erreur lors de la récupération des factures: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get invoice details
   */
  #[Route("/{pkFacture}", name: "show", methods: ["GET"])]
  public function show(int $pkFacture, Request $request): JsonResponse
  {
    // Check if faker mode is enabled and return fake data
    if ($this->isFakerMode()) {
      try {
        $data = $this->fakeDataService->get('api.factures', []);
        $normalizedData = $this->normalize($data);

        // Extract factures array from data structure
        $facturesArray = $normalizedData['data']['factures'] ?? $normalizedData['factures'] ?? [];

        // Ensure facturesArray is an array
        if (!is_array($facturesArray)) {
          $facturesArray = [];
        }

        // Find the specific invoice by pkFacture
        $facture = null;
        foreach ($facturesArray as $f) {
          $fData = is_array($f) ? $f : (array) $f;
          $fPkFacture = $fData['pkFacture'] ?? $fData['PKFacture'] ?? null;
          if ($fPkFacture && (string) $fPkFacture === (string) $pkFacture) {
            $facture = $f;
            break;
          }
        }

        if (!$facture) {
          return $this->notFound('Invoice not found');
        }

        // Normalize the found invoice
        $normalizedFacture = $this->normalizeFacture($facture);
        
        // Return in the same format as the JSON file
        return new JsonResponse([
          'success' => true,
          'status' => 200,
          'data' => $normalizedFacture,
        ]);
      } catch (\Exception $e) {
        return $this->error('Fake data not available: ' . $e->getMessage(), 500);
      }
    }

    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      $factures = $client->getFactures();

      if (empty($factures)) {
        return $this->notFound('Facture non trouvée');
      }

      $listFactures = (array) $factures->ListeFactures;
      if (isset($listFactures['facture'])) {
        $listFactures = $listFactures['facture'];
      }

      // Find the specific invoice
      $facture = null;
      foreach ($listFactures as $f) {
        if (isset($f->PKFacture) && $f->PKFacture == $pkFacture) {
          $facture = $f;
          break;
        }
      }

      if (!$facture) {
        return $this->notFound('Facture non trouvée');
      }

      $normalizedFacture = [
        'pkFacture' => $facture->PKFacture ?? null,
        'numero' => $facture->Numero ?? null,
        'dateEdition' => isset($facture->DateEdition)
          ? date('Y-m-d', strtotime($facture->DateEdition))
          : null,
        'dateEditionFormatted' => isset($facture->DateEdition)
          ? date('d/m/Y', strtotime($facture->DateEdition))
          : null,
        'montantTotalHT' => $facture->MontantTotalHT ?? null,
        'montantTotalHTFormatted' => isset($facture->MontantTotalHT)
          ? number_format($facture->MontantTotalHT, 2, ',', ' ') . ' €'
          : null,
        'montantTotalTTC' => $facture->MontantTotalTTC ?? null,
        'montantTotalTTCFormatted' => isset($facture->MontantTotalTTC)
          ? number_format($facture->MontantTotalTTC, 2, ',', ' ') . ' €'
          : null,
        'montantTotalAPayer' => $facture->MontantTotalAPayer ?? null,
        'montantTotalAPayerFormatted' => isset($facture->MontantTotalAPayer)
          ? number_format($facture->MontantTotalAPayer, 2, ',', ' ') . ' €'
          : null,
      ];

      return $this->success($normalizedFacture);
    } catch (\Exception $e) {
      return $this->error('Erreur lors de la récupération de la facture: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Download invoice PDF
   */
  #[Route("/{pkFacture}/download", name: "download", methods: ["GET"])]
  public function download(int $pkFacture, Request $request): Response|JsonResponse
  {
    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      $report = $client->getReportFacture($pkFacture);

      $response = new Response($report);
      $response->headers->set('Content-Type', 'application/pdf');
      $response->headers->set('Content-Disposition', 'inline; filename=facture-' . $pkFacture . '-' . date('d-m-Y') . '.pdf');
      $response->headers->set('Content-Transfer-Encoding', 'binary');
      $response->headers->set('Expires', 0);
      $response->headers->set('Cache-Control', 'no-cache');
      $response->headers->set('Pragma', 'no-cache');
      $response->headers->set('Content-Length', strlen($report));

      return $response;
    } catch (\Exception $e) {
      return $this->error('Erreur lors du téléchargement de la facture: ' . $e->getMessage(), 500);
    }
  }
}
