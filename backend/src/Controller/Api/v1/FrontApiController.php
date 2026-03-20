<?php

namespace App\Controller\Api\v1;

use App\Service\Client;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Service\Api\ApiFrontService;
use App\Service\Api\ApiSecurityService as SecurityService;

/**
 * API Controller for Front/General endpoints
 */
#[Route("/api", name: "api_v1_front_")]
class FrontApiController extends AbstractApiController
{
  private ValidatorInterface $validator;
  private ApiFrontService $apiFrontService;

  public function __construct(
    Client $client, 
    \Symfony\Component\Serializer\SerializerInterface $serializer, 
    SecurityService $securityService,
    ValidatorInterface $validator,
    ApiFrontService $apiFrontService)
  {
    parent::__construct($client, $serializer, $securityService);
    $this->validator = $validator;
    $this->apiFrontService = $apiFrontService;
  }

  /**
   * Get current user information and dashboard URL
   */
  #[Route("/me", name: "me", methods: ["GET"])]
  public function me(Request $request): JsonResponse
  {
    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      /** @var \App\Security\Authentication\Token\SoapSessionToken $token */
      $token = $this->container->get('security.token_storage')->getToken();

      if (!$token || !$token->hasAttribute('soap.user')) {
        return $this->unauthorized('Informations utilisateur non disponibles');
      }

      $user = $token->getAttribute('soap.user');
      $roles = $token->getRoleNames();

      // Determine dashboard URL based on role
      $dashboardUrl = null;
      if (in_array('ROLE_OCCUPANT', $roles)) {
        $dashboardUrl = '/api/occupants/me';
      } elseif (in_array('ROLE_GESTIONNAIRE', $roles)) {
        $dashboardUrl = '/api/dashboard';
      }

      $userData = [
        'pkUser' => $user->PKUser ?? null,
        'loginID' => $user->LoginID ?? null,
        'email' => $user->Email ?? null,
        'userType' => $user->UserType ?? null,
        'roles' => $roles,
        'dashboardUrl' => $dashboardUrl,
      ];

      return $this->success([
        'user' => $userData,
      ]);
    } catch (\Exception $e) {
      return $this->error('Erreur lors de la récupération des informations utilisateur: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get legal notices
   */
  #[Route("/legal-notices", name: "legal_notices", methods: ["GET"])]
  public function legalNotices(): JsonResponse
  {
    // Legal notices are typically static content
    // You can store this in a file, database, or return static content
    $legalNotices = [
      'title' => 'Mentions légales',
      'content' => 'Contenu des mentions légales...',
      'lastUpdated' => date('Y-m-d'),
    ];

    return $this->success([
      'legalNotices' => $legalNotices,
    ]);
  }

  /**
   * Get personal data (subcontractors)
   */
  #[Route("/personal-datas", name: "personal_datas", methods: ["GET"])]
  public function personalDatas(Request $request): JsonResponse
  {
    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      $soustraitants = $client->getSousTraitants();

      // Normalize subcontractors data
      $normalizedSoustraitants = [];
      if (is_array($soustraitants)) {
        foreach ($soustraitants as $soustraitant) {
          $normalizedSoustraitants[] = $this->normalize($soustraitant);
        }
      } elseif (is_object($soustraitants)) {
        $normalizedSoustraitants = $this->normalize($soustraitants);
      }

      return $this->success([
        'sousTraitants' => $normalizedSoustraitants,
      ]);
    } catch (\Exception $e) {
      return $this->error('Erreur lors de la récupération des données personnelles: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get CGU (Terms and Conditions) status
   */
  #[Route("/cgu/status", name: "cgu_status", methods: ["GET"])]
  public function cguStatus(Request $request): JsonResponse
  {
    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      /** @var \App\Security\Authentication\Token\SoapSessionToken $token */
      $token = $this->container->get('security.token_storage')->getToken();

      if (!$token || !$token->hasAttribute('soap.user')) {
        return $this->unauthorized('Informations utilisateur non disponibles');
      }

      $user = $token->getAttribute('soap.user');
      $typeUser = null;

      if (isset($user->UserType)) {
        switch ($user->UserType) {
          case 'O':
            $typeUser = 'occupant';
            break;
          case 'G':
          case 'M':
          case 'A':
          case 'S':
          case 'C':
            $typeUser = 'gestionnaire';
            break;
        }
      }

      return $this->success([
        'typeUser' => $typeUser,
        'cguAccepted' => isset($user->CGU) && $user->CGU === 'O',
        'email' => $user->Email ?? null,
      ]);
    } catch (\Exception $e) {
      return $this->error('Erreur lors de la récupération du statut des CGU: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Accept CGU and update email
   */
  #[Route("/cgu/accept", name: "cgu_accept", methods: ["POST"])]
  public function acceptCgu(Request $request): JsonResponse
  {
    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      $data = json_decode($request->getContent(), true);

      if (!$data) {
        $data = $request->request->all();
      }

      $email = $data['email'] ?? null;
      $emailConfirm = $data['email_confirm'] ?? null;
      $validCgu = $data['valid_cgu'] ?? false;

      // Validate email
      if (empty($email)) {
        return $this->error('E-mail requis', 400, ['email' => 'E-mail requis']);
      }

      if ($email !== $emailConfirm) {
        return $this->error('Les deux adresses mails ne correspondent pas.', 400, [
          'email' => 'Les deux adresses mails ne correspondent pas.',
        ]);
      }

      $emailConstraint = new Email();
      $emailConstraint->message = 'Adresse e-mail invalide';

      $errors = $this->validator->validate($email, $emailConstraint);
      if (count($errors) > 0) {
        $errorMessages = [];
        foreach ($errors as $error) {
          $errorMessages[] = $error->getMessage();
        }
        return $this->error('L\'adresse email saisie n\'est pas valide.', 400, [
          'email' => $errorMessages,
        ]);
      }

      if (!$validCgu) {
        return $this->error('Vous devez accepter les conditions générales d\'utilisation', 400, [
          'valid_cgu' => 'Vous devez accepter les conditions générales d\'utilisation',
        ]);
      }

      // Update CGU and email
      $resultCgu = $client->updateCGUFromPKUser("O");
      $resultEmail = $client->updateEmailFromPKUser($email);

      if ($resultCgu && $resultEmail) {
        return $this->success([
          'message' => 'CGU acceptées et email mis à jour avec succès',
          'email' => $email,
        ], 'CGU acceptées et email mis à jour avec succès', 200);
      } else {
        return $this->error('Une erreur s\'est produite lors de la mise à jour. Veuillez réessayer!', 500);
      }
    } catch (\Exception $e) {
      return $this->error('Une erreur s\'est produite: ' . $e->getMessage(), 500);
    }
  }

  /**
   * Get dashboard information
   */
  #[Route("/dashboard", name: "dashboard", methods: ["GET"])]
  public function dashboard(Request $request): JsonResponse
  {
    $client = $this->getAuthenticatedClientFromHeaders($request);
    if ($client instanceof JsonResponse) {
      return $client;
    }

    try {
      /** @var \App\Security\Authentication\Token\SoapSessionToken $token */
      $token = $this->container->get('security.token_storage')->getToken();

      if (!$token || !$token->hasAttribute('soap.user')) {
        return $this->unauthorized('Informations utilisateur non disponibles');
      }

      $user = $token->getAttribute('soap.user');
      $roles = $token->getRoleNames();

      $dashboard = null;

      if (in_array('ROLE_OCCUPANT', $roles)) {
        // Get occupant dashboard
        $dashboard = $client->getTableauBordOccupant($user->FK ?? null);
      } elseif (in_array('ROLE_GESTIONNAIRE', $roles)) {
        // Get gestionnaire dashboard
        $dashboard = $client->getMyTableauBordClient();
      }

      return $this->success([
        'dashboard' => $this->normalize($dashboard),
      ]);
    } catch (\Exception $e) {
      return $this->error('Erreur lors de la récupération du tableau de bord: ' . $e->getMessage(), 500);
    }
  }
}
