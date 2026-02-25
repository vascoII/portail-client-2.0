<?php

namespace App\Service\Api;

use App\Repository\Dto\External\GeneratedDocumentOutputDto;
use App\Repository\Dto\External\GetReportByTokenDataSourceOutputDto;
use App\Repository\Dto\External\GetReportByTokenOutputDto;
use App\Repository\Dto\External\StoredDocumentOutputDto;


use Symfony\Component\HttpFoundation\Request;

/**
 * Service métier pour les services externes côté API.
 *
 */
class ApiExternalService
{
    private array $data;

    public function generateReportByTokenPdf(int $pkUser)
    {
        return ['status' => 'success'];
    }

    public function createDocumentContent(int $pkUser, int $pkFacture)
    {
        return ['status' => 'success'];
    }

    public function storeDocumentReportService(array $data)
    {
        return ['status' => 'success'];
    }

}

