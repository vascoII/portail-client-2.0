<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Service\Api\ApiDatabaseService;


/**
 * API Controller for Oracle Checks
 * 
 * 
 * */
#[Route("/api/oracle", name: "api_oracle_")]
class OracleApiController extends AbstractController
{
    public function __construct(    
        private readonly ApiDatabaseService $apiDatabaseService
    ) {
    }

    #[Route("/{schema}/{table}", name: "explorer", methods: ["GET"])]
    public function schemaTableExplorer(Request $request, $schema, $table): JsonResponse
    {
        try {
            $res = $this->apiDatabaseService->getSchemaTable($schema, $table);   
            
            $response = [
                'success' => true,
                'status' => is_array($res) && !isset($res['status']) ? 200 : $res['status'],
                'data' => is_array($res) ? $res : [],
            ];

            return $this->json($response);

        } catch (\Throwable $e) {
            return $this->json([
                'status' => 'error',
                'oracle_error' => $e->getMessage(),
            ], 500);
        }
    }

    #[Route("/{schema}/{table}/{column}/{value}", name: "finder", methods: ["GET"])]
    public function schemaTableFinder(Request $request, $schema, $table, $column, $value): JsonResponse
    {
        try {
            $res = $this->apiDatabaseService->getData($schema, $table, $column, $value);   
            
            $response = [
                'success' => true,
                'status' => is_array($res) && !isset($res['status']) ? 200 : $res['status'],
                'data' => is_array($res) ? $res : [],
            ];

            return $this->json($response);

        } catch (\Throwable $e) {
            return $this->json([
                'status' => 'error',
                'oracle_error' => $e->getMessage(),
            ], 500);
        }
    }

}
