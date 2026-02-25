<?php

namespace App\Controller\Api;

use App\Model\Account;
use App\Service\GetImmeublesParams;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Service\Api\ApiOperatorService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;
use App\Service\FakeDataService;
/**
 * API Controller for Operators (Gestionnaires)
 */
#[Route("/api/operators", name: "api_operator_")]
class OperatorApiController extends AbstractApiController
{
    private ApiOperatorService $apiOperatorService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ?FakeDataService $fakeDataService = null, ApiOperatorService $apiOperatorService)
    {
        parent::__construct($client, $serializer, $securityService, $fakeDataService);
        $this->apiOperatorService = $apiOperatorService;
    }

    /**
     * Get list of all operators (gestionnaires)
     */
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        $fakeResponse = $this->sendFakeData('api.operators');
        if ($fakeResponse !== null) {
            return $fakeResponse;
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $users = $client->getGestionnaires();

            $usersOracle = $this->apiOperatorService->getGestionnaires($client->getPkUser());

            return $this->success([
                'users' => $this->normalize($users),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des gestionnaires: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a new operator
     */
    #[Route("", name: "create", methods: ["POST"])]
    public function create(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->error('Données JSON invalides', 400);
        }

        // Validate required fields
        $requiredFields = ['job', 'lastname', 'firstname', 'phone', 'email'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return $this->error("Champ obligatoire manquant: $field", 400);
            }
        }

        // Validate email confirmation
        if (isset($data['email']['first']) && isset($data['email']['second'])) {
            if ($data['email']['first'] !== $data['email']['second']) {
                return $this->error('Les adresses e-mail ne correspondent pas', 400);
            }
            $email = $data['email']['first'];
        } elseif (isset($data['email'])) {
            $email = is_array($data['email']) ? ($data['email']['first'] ?? $data['email'][0] ?? null) : $data['email'];
        } else {
            return $this->error('E-mail est requis', 400);
        }

        try {
            $account = new Account();
            $account->job = $data['job'];
            $account->lastname = $data['lastname'];
            $account->firstname = $data['firstname'];
            $account->phone = $data['phone'];
            $account->email = $email;

            $errors = $validator->validate($account);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->error('Échec de la validation', 400, $errorMessages);
            }

            $success = $client->createGestionnaire($account);
            if ($success) {
                return $this->success(null, 'Gestionnaire créé avec succès', 201);
            } else {
                return $this->error('Échec de la création du gestionnaire', 500);
            }
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la création du gestionnaire: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get operator statistics
     */
    #[Route("/statistiques", name: "stats_occupants", methods: ["GET"])]
    public function statsOccupants(Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        $fakeResponse = $this->sendFakeData('api.operators.statistiques');
        if ($fakeResponse !== null) {
            return $fakeResponse;
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $statCoOccupants = $client->getStatOccupants();

            $statCoOccupantsOracle = $this->apiOperatorService->getStatOccupants($client->getPkUser());
            
            return $this->success([
                'stats' => $this->normalize($statCoOccupants),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des statistiques: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get operator details
     */
    #[Route("/{id}", name: "view", methods: ["GET"])]
    public function view(int $id, Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        $fakeResponse = $this->sendFakeData('api.operators.id');
        if ($fakeResponse !== null) {
            return $fakeResponse;
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $params = new GetImmeublesParams();
            $params->NBANOMALIES = true;
            $params->NBDEPANNAGES = true;
            $params->NBDYSFONCTIONNEMENTS = true;
            $params->NBFUITES = true;
            $params->NBCOMPTEURS = true;

            $user = $client->getUser($id);
            if (!$user) {
                return $this->notFound('Gestionnaire non trouvé');
            }

            $myImmeubles = $client->getMyImmeubles4gestio($params);
            $immeubles = $client->getImmeubles4gestio($id, $params, false);

            $myImmeublesOracle = $this->apiOperatorService->getMyImmeubles4gestio($client->getPkUser(), $params);
            $immeublesOracle = $this->apiOperatorService->getImmeubles4gestio($id, $params, false);

            $diffImmeubles = array_filter($myImmeubles, function ($immeuble) use ($immeubles) {
                return !in_array($immeuble, $immeubles);
            });

            return $this->success([
                'user' => $this->normalize($user),
                'immeubles' => $this->normalize($immeubles),
                'diffImmeubles' => $this->normalize($diffImmeubles),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du gestionnaire: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update operator
     */
    #[Route("/{id}", name: "edit", methods: ["PUT", "PATCH"])]
    public function edit(int $id, Request $request, ValidatorInterface $validator): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->error('Données JSON invalides', 400);
        }

        try {
            $user = $client->getUser($id);
            if (!$user) {
                return $this->notFound('Gestionnaire non trouvé');
            }

            $account = new Account();
            $account->job = $data['job'] ?? $user->UserRole ?? null;
            $account->lastname = $data['lastname'] ?? $user->UserName ?? null;
            $account->firstname = $data['firstname'] ?? $user->FirstName ?? null;
            $account->phone = $data['phone'] ?? $user->PhoneNumber ?? null;

            // Handle email (can be string or array with first/second)
            if (isset($data['email'])) {
                if (is_array($data['email'])) {
                    if (isset($data['email']['first']) && isset($data['email']['second'])) {
                        if ($data['email']['first'] !== $data['email']['second']) {
                            return $this->error('Email addresses do not match', 400);
                        }
                        $account->email = $data['email']['first'];
                    } else {
                        $account->email = $data['email']['first'] ?? $data['email'][0] ?? $user->EMail ?? null;
                    }
                } else {
                    $account->email = $data['email'];
                }
            } else {
                $account->email = $user->EMail ?? null;
            }

            $errors = $validator->validate($account);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->error('Échec de la validation', 400, $errorMessages);
            }

            $client->updateGestionnaire($id, $account);
            return $this->success(null, 'Gestionnaire mis à jour avec succès');
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la mise à jour du gestionnaire: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update operator password
     */
    #[Route("/{id}/password", name: "password", methods: ["PUT", "PATCH"])]
    public function editPassword(int $id, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->error('Données JSON invalides', 400);
        }

        if (empty($data['password'])) {
            return $this->error('Le mot de passe est requis', 400);
        }

        // Handle password confirmation
        $password = null;
        if (is_array($data['password'])) {
            if (isset($data['password']['first']) && isset($data['password']['second'])) {
                if ($data['password']['first'] !== $data['password']['second']) {
                    return $this->error('Passwords do not match', 400);
                }
                $password = $data['password']['first'];
            } else {
                $password = $data['password']['first'] ?? $data['password'][0] ?? null;
            }
        } else {
            $password = $data['password'];
        }

        if (empty($password)) {
            return $this->error('Le mot de passe est requis', 400);
        }

        // Validate password length
        if (strlen($password) < 8) {
            return $this->error('Le mot de passe doit comporter au moins 8 caractères', 400);
        }

        try {
            $user = $client->getUser($id);
            if (!$user) {
                return $this->notFound('Gestionnaire non trouvé');
            }

            $client->updatePassword($id, $password);
            return $this->success(null, 'Mot de passe mis à jour avec succès');
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la mise à jour du mot de passe: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Add buildings to operator
     */
    #[Route("/{id}/immeubles", name: "add_buildings", methods: ["POST"])]
    public function addBuildings(int $id, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $user = $client->getUser($id);
            if (!$user) {
                return $this->notFound('Gestionnaire non trouvé');
            }

            $params = new GetImmeublesParams();
            $params->NBANOMALIES = true;
            $params->NBDEPANNAGES = true;
            $params->NBDYSFONCTIONNEMENTS = true;
            $params->NBFUITES = true;
            $params->NBCOMPTEURS = true;

            $availableImmeublesNumbers = [];
            $availableImmeubles = $client->getMyImmeubles($params);
            foreach ($availableImmeubles as $immeuble) {
                $availableImmeublesNumbers[] = $immeuble->Immeuble->PkImmeuble;
            }
            
            $assignedImmeublesNumbers = [];
            $assignedImmeubles = $client->getImmeubles($id, $params, false);
            foreach ($assignedImmeubles as $immeuble) {
                $assignedImmeublesNumbers[] = $immeuble->Immeuble->PkImmeuble;
            }

            $data = json_decode($request->getContent(), true);
            $dataImmeubles = (string) $data['immeubles'] ?? null;
            $desiredImmeubles = json_decode($dataImmeubles, true);
            $desiredImmeubles = array_map('intval', $desiredImmeubles);
       
            // To be added and remove duplicates
            $listImmeubles = array_unique(array_merge($desiredImmeubles, $assignedImmeublesNumbers));
           
            $result = $client->setImmeubles($id, implode('|', $listImmeubles));

            if (isset($result->Erreur) && !empty($result->Erreur)) {
                return $this->error($result->Erreur, 500);
            }

            $result = $client->getImmeubles($id, $params, false);
            return $this->success([
                'immeubles' => $this->normalize($result),
            ], 'Bâtiments ajoutés avec succès');
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l ajout des bâtiments: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove buildings from operator
     */
    #[Route("/{id}/immeubles", name: "remove_buildings", methods: ["DELETE"])]
    public function removeBuildings(int $id, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $user = $client->getUser($id);
            if (!$user) {
                return $this->notFound('Gestionnaire non trouvé');
            }

            $params = new GetImmeublesParams();
            $params->NBANOMALIES = true;
            $params->NBDEPANNAGES = true;
            $params->NBDYSFONCTIONNEMENTS = true;
            $params->NBFUITES = true;
            $params->NBCOMPTEURS = true;

            $assignedImmeublesNumbers = [];
            $assignedImmeubles = $client->getImmeubles($id, $params, false);
            foreach ($assignedImmeubles as $immeuble) {
                $assignedImmeublesNumbers[] = $immeuble->Immeuble->PkImmeuble;
            }

            $data = json_decode($request->getContent(), true);
            $dataImmeubles = (string) $data['immeubles'] ?? null;
            $undesiredImmeubles = json_decode($dataImmeubles, true);
            $undesiredImmeubles = array_map('intval', $undesiredImmeubles);

            // Step 1 : We remove those who have already been assigned
            $listImmeubles = array_diff($assignedImmeublesNumbers, $undesiredImmeubles);

            $result = $client->setImmeubles($id, implode('|', $listImmeubles));

            if (isset($result->Erreur) && !empty($result->Erreur)) {
                return $this->error($result->Erreur, 500);
            }

            $result = $client->getImmeubles($id, $params, false);
            return $this->success([
                'immeubles' => $this->normalize($result),
                'diffImmeubles' => "", 
            ], 'Bâtiments supprimés avec succès');
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la suppression des bâtiments: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete operator
     */
    #[Route("/{id}", name: "delete", methods: ["DELETE"])]
    public function delete(int $id, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $result = $client->deleteUser($id);

            if (isset($result->Erreur) && !empty($result->Erreur)) {
                return $this->error($result->Erreur, 500);
            }

            return $this->success(['message' => 'Gestionnaire supprimé avec succès'], 'Gestionnaire supprimé avec succès');
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la suppression du gestionnaire: ' . $e->getMessage(), 500);
        }
    }
}
