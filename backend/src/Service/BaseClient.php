<?php

namespace App\Service;

use Exception;
use SimpleXMLElement;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Stopwatch\Stopwatch;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class BaseClient
{
    private $kernel;
    private $client;
    protected $adminSessionId;
    protected $superLoginID;
    protected $superPassword;
    private $cache;
    private $cacheNamespace;
    private $sessionId;
    private $pkUser;
    private $user;
    private $LoginState;
    private $stopwatch;
    protected $wsdlUrl;

    public function __construct(KernelInterface $kernel, $wsdlUrl, $adminSessionId, CacheInterface $cache, $cacheNamespace, $superLoginID, $superPassword, ?Stopwatch $stopwatch = null)
    {
        $this->kernel = $kernel;
        $this->adminSessionId = $adminSessionId;
        $this->cache = $cache;
        $this->cacheNamespace = $cacheNamespace;
        $this->superLoginID = $superLoginID;
        $this->superPassword = $superPassword;
        $this->stopwatch = $stopwatch;
	    $this->wsdlUrl = $wsdlUrl;

        if (empty($wsdlUrl)) {
            throw new RuntimeException('Missing argument 1.');
        }

        if (parse_url($wsdlUrl) === false) {
            throw new RuntimeException('Argument 1 must be a URL.');
        }

        // Don't create SoapClient in constructor if faker mode is enabled
        // It will be created lazily in getClient() if needed
        $isFakerMode = ($_ENV['API_CALL_FAKER'] ?? getenv('API_CALL_FAKER') ?? 'false') === 'true';
        if (!$isFakerMode) {
            $this->stopwatchStart('\App\Service\BaseClient::__construct wsdl');
            $this->client = new \SoapClient($wsdlUrl, [
                'trace' => 1,
                // 'stream_context' => stream_context_create([
                //     'ssl' => [
                //         'verify_peer'       => false,
                //         'verify_peer_name'  => false,
                //         'allow_self_signed' => true,
                //     ],
                // ]),
                'exception' => true,
            ]);
            $this->stopwatchStop('\App\Service\BaseClient::__construct wsdl');
        }
    }

    protected function stopwatchStart($name)
    {
        if ($this->stopwatch) {
            $this->stopwatch->start($name);
        }
    }

    protected function stopwatchStop($name)
    {
        if ($this->stopwatch) {
            $this->stopwatch->stop($name);
        }
    }

    public function login($username, $password)
    {
        $result = $this->sendRequest('Login', (object) [
            'LoginID' => $username,
            'Password' => $password,
        ], false);

        if (isset($result->Erreur) && !empty($result->Erreur)) {
            throw new RuntimeException($result->Erreur);
        }

        if (empty($result->SessionID)) {
            return false;
        }

        $this->sessionId = $result->SessionID;
        $this->user = $result->User;
        $this->pkUser = $this->user->PKUser;
        $this->LoginState = $this->user->Info;

        return true;
    }

    /**
     * Login for API (stateless) - returns data instead of storing in instance
     * Used for stateless API authentication where sessionId and pkUser are sent via headers
     *
     * @param string $username
     * @param string $password
     * @return array|null Returns array with session_id, pk_user, and user, or null on failure
     * @throws RuntimeException
     */
    public function loginForApi($username, $password)
    {
        $result = $this->sendRequest('Login', (object) [
            'LoginID' => $username,
            'Password' => $password,
        ], false);

        if (isset($result->Erreur) && !empty($result->Erreur)) {
            throw new RuntimeException($result->Erreur);
        }

        if (empty($result->SessionID)) {
            return null;
        }

        // Return data instead of storing in instance
        return [
            'session_id' => $result->SessionID,
            'pk_user' => $result->User->PKUser,
            'user' => $result->User,
        ];
    }

    public function loginFromParam($param)
    {
        $result = $this->sendRequest('LoginFromParam', (object) [
            'SuperLoginID'  => $this->superLoginID,
            'SuperPassword' => $this->superPassword,
            'Param'         => $param,
        ], false);

        if (isset($result->Erreur) && !empty($result->Erreur)) {
            throw new RuntimeException($result->Erreur);
        }

        if (empty($result->SessionID)) {
            return false;
        }

        $this->sessionId = $result->SessionID;
        $this->user = $result->User;
        $this->pkUser = $this->user->PKUser;

        return true;
    }

    public function retrieveSession($sessionId, $userPk)
    {
        $this->sessionId = $sessionId;
        $this->pkUser = $userPk;
    }

    public function logout()
    {
        $result = $this->sendRequest('Logout', (object) [
            'SessionId' => $this->sessionId,
            'PkUser' => $this->pkUser,
        ], false);

        return $result;
    }

    protected function getClient()
    {
        // Check if faker mode is enabled - if so, don't create SoapClient
        $isFakerMode = ($_ENV['API_CALL_FAKER'] ?? getenv('API_CALL_FAKER') ?? 'false') === 'true';
        if ($isFakerMode) {
            throw new RuntimeException('SoapClient cannot be used when API_CALL_FAKER is enabled. Use fake data instead.');
        }

        // Lazy initialization: create SoapClient if not already created
        if ($this->client === null) {
            $this->stopwatchStart('\App\Service\BaseClient::getClient wsdl');
            $this->client = new \SoapClient($this->wsdlUrl, [
                'trace' => 1,
                'exception' => true,
            ]);
            $this->stopwatchStop('\App\Service\BaseClient::getClient wsdl');
        }

        return $this->client;
    }

    public function getSessionId()
    {
        return $this->sessionId;
    }

    public function getPkUser()
    {
        return $this->pkUser;
    }

	
    public function getCurrentUser()
    {
        return $this->user;
    }

    protected function sendRequest($name, $request, $useCache = true, $useCurl = false)
    {
        $this->stopwatchStart('\App\Service\BaseClient::sendRequest');

        $params = [$request];
        $response = null;
        if ($this->kernel->isDebug() && !in_array($name, ['GetReport', 'GetFile'])) {
            // echo '<!-- SOAP '.$name.' : '.json_encode($params).'-->'.chr(10);
        }
        if ($useCache) {
            $requestCache = clone $request;
            unset($requestCache->SessionID);
            
            // Build cache key with namespace
            $namespace = $this->cacheNamespace;
            if (isset($request->PkUser)) {
                $namespace = $this->cacheNamespace . '-' . $request->PkUser;
            }
            
            $key = $namespace . '_' . md5($name . json_encode($requestCache));
            
            // Use Symfony Cache get() method with callback
            $response = $this->cache->get($key, function (ItemInterface $item) use ($name, $params) {
                $item->expiresAfter(86400); // 24 hours TTL
                $soapResponse = $this->getClient()->__soapCall($name, $params);
                return json_encode($soapResponse);
            });
            
            if (is_string($response)) {
                $response = json_decode($response);
            }
        }

        if (is_null($response)) {
            if ($useCurl) {
                if ($name == 'getOccupants4Chgt') {
					if ($request['isNew'] == false){
										$isnew = 'false';
					}else{
						$isnew = true;
					}
                    $body = '<getOccupants4Chgt xmlns="http://tempuri.org/">
                                <SessionID>' .$request['SessionID'] .'</SessionID>
                                <PkUser>' .$request['PkUser'] .'</PkUser>
                                <PkImmeuble>' .$request['PkImmeuble'] .'</PkImmeuble>
                                <PkOccupant>' .$request['PkOccupant'] .'</PkOccupant>
                                <isNew>' .$isnew.'</isNew>
                            </getOccupants4Chgt>';
                } else {
					if ($request->isNew == false){
										$isnew = 'false';
					}else{
						$isnew = true;
					}
                    $occupantsXml =
                        '<occupant4Chgt>' .
                            '<PkOccupant>' . $request->occupants->occupant4Chgt->PkOccupant . '</PkOccupant>' .
                            '<newEmail>' . $request->occupants->occupant4Chgt->newEmail . '</newEmail>';
						if (isset($request->occupants->occupant4Chgt->newTelmobile)){
                            $occupantsXml = $occupantsXml . '<newTelmobile>' . $request->occupants->occupant4Chgt->newTelmobile . '</newTelmobile>' ;
						}
						if (isset($request->occupants->occupant4Chgt->newDateArrivee)){
                            $occupantsXml = $occupantsXml .'<newDateArrivee>' . $request->occupants->occupant4Chgt->newDateArrivee . '</newDateArrivee>';
						}
						if (isset($request->occupants->occupant4Chgt->newNom)){
                            $occupantsXml = $occupantsXml .'<newNom>' . htmlspecialchars($request->occupants->occupant4Chgt->newNom) . '</newNom>' ;
						}
						$occupantsXml = $occupantsXml .'<isNew>' . $isnew . '</isNew>'.
                        '</occupant4Chgt>';
						
                    $body = '<setOccupants4Chgt xmlns="http://tempuri.org/">
                                <SessionID>' .$request->SessionID .'</SessionID>
                                <PkUser>' .$request->PkUser .'</PkUser>
                                <occupants>' .$occupantsXml .'</occupants>
                                <isNew>' .$isnew.'</isNew>
                            </setOccupants4Chgt>';
                }
				
				
                $curl = curl_init();
                curl_setopt_array($curl, array(
                  CURLOPT_URL => $this->wsdlUrl,
                  CURLOPT_RETURNTRANSFER => true,
                  CURLOPT_ENCODING => '',
                  CURLOPT_MAXREDIRS => 10,
                  CURLOPT_TIMEOUT => 0,
                  CURLOPT_FOLLOWLOCATION => true,
                  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                  CURLOPT_CUSTOMREQUEST => 'POST',
                  CURLOPT_POSTFIELDS =>'<?xml version="1.0" encoding="utf-8"?>
                    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Body>
                            '. $body .'
                        </soap:Body>
                    </soap:Envelope>',
                  CURLOPT_HTTPHEADER => array(
                    'Content-Type: text/xml',
                    'Cookie: TS01a97c06=01b6789f767663ca1fd8e59ef4f32dca2d46c439fac0e0fef02cd4e0f6b00e48444a63d59139963f06de8138ff06d9cd1eab1e0ff7'
                  ),
                ));
                $response = curl_exec($curl);
                curl_close($curl);

					$xml = new SimpleXMLElement($response);

					$namespaces = $xml->getNamespaces(true);
					$xml->registerXPathNamespace('d', $namespaces['']);
					if ($name == 'getOccupants4Chgt') {
						$result = $xml->xpath('//d:getOccupants4ChgtResult');
					} else {
						$result = $xml->xpath('//d:setOccupants4ChgtResult');
					}
					
					if (!empty($result[0])){
					$occupants = $this->simpleXmlToArray(
						$result[0]->occupant4Chgt
					);
					$this->stopwatchStop('\App\Service\BaseClient::sendRequest');
					return $occupants;
					}else{
						
						return ;
					}
					
            } else {
				$response = $this->getClient()->__soapCall($name, $params);
            }
        }

        $resultName = $name . 'Result';
		
        if ($name == "setReleveOccupant") {
            return true;
        }

        if (!isset($response->{$resultName})) {
			throw new RuntimeException($name . ' fail.'.$response);
        }

        $result = $response->{$resultName};

        if (isset($result->Erreur) && !empty($result->Erreur)) {
            if (in_array($this->kernel->getEnvironment(), ['dev', 'test'])) {
                throw new RuntimeException($result->Erreur . ' ::: ' . print_r($request, true));
            } else {
                throw new RuntimeException($result->Erreur);
            }
        }

        $this->stopwatchStop('\App\Service\BaseClient::sendRequest');

        return $result;
    }

    private function simpleXmlToArray($xmlElement) {
        $array = [];
        foreach ($xmlElement->children() as $node) {
            $value = $node->count() ? $this->simpleXmlToArray($node) : trim((string)$node);
            if ($value === "") {
                $value = "";
            }
            $array[$node->getName()] = $value;
        }
        return $array;
    }

    private function handleError($fault)
    {
        $errorMessage = $fault->getMessage();
        echo "<script>
                if (window.confirm('SOAP Fault: $errorMessage')) {
                    window.close();
                }
            </script>";

    }

    public function clearUserCache($pkUser)
    {
        // Symfony Cache doesn't support namespace clearing directly
        // We clear the entire cache as a workaround
        // Note: For better performance, consider using TagAwareCacheAdapter
        // which allows clearing by tags for more granular cache management
        if (method_exists($this->cache, 'clear')) {
            $this->cache->clear();
        }
    }

    public function updateCGUFromPKUser($cgu = '')
    {
        $request = (object) [
            'SuperLoginID' => $this->superLoginID,
            'SuperPassword' => $this->superPassword,
            'PKUser' => $this->getPkUser(),
            'CGU' => $cgu,
        ];

        $result = $this->sendRequest('UpdateCGUFromPKUser', $request, false);

        if (isset($result->Erreur) && !empty($result->Erreur)) {
            return false;
        }
        return true;
    }


    public function updateEmailFromPKUser($email = '')
    {
        $request = (object) [
            'SuperLoginID' => $this->superLoginID,
            'SuperPassword' => $this->superPassword,
            'PKUser' => $this->getPkUser(),
            'Email' => $email,
        ];

        $result = $this->sendRequest('UpdateEmailFromPKUser', $request, false);

        if (isset($result->Erreur) && !empty($result->Erreur)) {
            return false;
        }
        return true;
    }
}
