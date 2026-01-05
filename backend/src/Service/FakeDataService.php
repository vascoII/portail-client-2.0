<?php

namespace App\Service;

/**
 * Service for managing fake data in development mode
 * Reads JSON files from public/data/api/ when API_CALL_FAKER=true
 */
class FakeDataService
{
    private string $dataDir;
    private bool $enabled;
    
    public function __construct(string $projectDir)
    {
        $this->dataDir = $projectDir . '/public/data/api/';
        $this->enabled = ($_ENV['API_CALL_FAKER'] ?? getenv('API_CALL_FAKER') ?? 'false') === 'true';
    }
    
    /**
     * Check if faker mode is enabled
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }
    
    /**
     * Get fake data for an endpoint
     * 
     * @param string $endpoint Endpoint identifier (e.g., 'dashboard', 'factures-list')
     * @param array $params Parameters for dynamic endpoints (e.g., ['pkImmeuble' => 12345])
     * @return array|object Fake data as array or object
     * @throws \Exception If file not found
     */
    public function get(string $endpoint, array $params = [])
    {
        $filePath = $this->resolveFilePath($endpoint, $params);
        
        if (!file_exists($filePath)) {
            throw new \Exception("Fake data file not found: {$filePath}. Please create the file or disable API_CALL_FAKER.");
        }
        
        $json = file_get_contents($filePath);
        $data = json_decode($json, false); // Return as object to match SOAP response structure
        
        // Apply parameter-based transformations if needed
        return $this->transformData($data, $params);
    }
    
    /**
     * Resolve file path from endpoint and parameters
     */
    private function resolveFilePath(string $endpoint, array $params): string
    {
        // Replace dynamic parameters in endpoint name
        $fileName = $endpoint;
        foreach ($params as $key => $value) {
            $fileName = str_replace('{' . $key . '}', (string)$value, $fileName);
        }
        
        // Fallback: if file with params doesn't exist, try generic file with 'example'
        $filePath = $this->dataDir . $fileName . '.json';
        if (!file_exists($filePath) && !empty($params)) {
            // Try generic file (e.g., immeubles-example.json)
            $genericPath = $this->dataDir . str_replace('{' . array_key_first($params) . '}', 'example', $fileName) . '.json';
            if (file_exists($genericPath)) {
                return $genericPath;
            }
        }
        
        return $filePath;
    }
    
    /**
     * Transform data based on parameters (optional)
     * Example: if data is an object with keys matching params, return specific item
     */
    private function transformData($data, array $params)
    {
        // Example: if data is an object with keys matching params, return specific item
        if (is_object($data) && !empty($params)) {
            $pkKey = 'pkImmeuble' ?? 'pkLogement' ?? 'pkFacture' ?? array_key_first($params);
            if (isset($params[$pkKey]) && isset($data->{$params[$pkKey]})) {
                return $data->{$params[$pkKey]};
            }
        }
        
        return $data;
    }
}

