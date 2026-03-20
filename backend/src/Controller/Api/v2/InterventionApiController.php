<?php

namespace App\Controller\Api\v2;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;

require_once './tech/fpdf/fpdf.php';

/**
 * API Controller for Interventions (Depannages)
 */
#[Route("/api/v2/interventions", name: "api_v2_intervention_")]
class InterventionApiController extends AbstractApiController
{
    /**
     * Download intervention report PDF
     */
    #[Route("/{pkDepannage}/report", name: "report", methods: ["GET"])]
    public function report(string $pkDepannage, Request $request): Response|JsonResponse
    {

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $report = $client->getReportDepannage($pkDepannage);

            if (empty($report)) {
                $pdf = new \FPDF();
                $pdf->AddPage();
                $pdf->SetFont('Helvetica', '', 14);

                // Centrer le texte sur la page
                $message = "Aucun rapport disponible pour la période sélectionnée.";
                $pdf->SetXY(10, 10); // Position approximativement verticale au centre
                $pdf->Cell(190, 10, mb_convert_encoding($message, 'ISO-8859-1', 'UTF-8'), 0, 1, 'C'); // FPDF attend ISO-8859-1 par défaut

                $pdfOutput = $pdf->Output('', 'S');

                $response = new Response($pdfOutput, Response::HTTP_OK, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="rapport-vide.pdf"',
                    'Content-Length' => strlen($pdfOutput),
                ]);

                return $response;
            }

            $response = new Response($report);
            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('Content-Disposition', 'inline; filename=relevé-' . date('d-m-Y') . '.pdf');
            $response->headers->set('Content-Transfer-Encoding', 'binary');
            $response->headers->set('Expires', 0);
            $response->headers->set('Cache-Control', 'no-cache');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Content-Length', strlen($report));

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la génération du rapport d\'intervention: ' . $e->getMessage(), 500);
        }
    }
}
