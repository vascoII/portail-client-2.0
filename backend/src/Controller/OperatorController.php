<?php

namespace App\Controller;

use App\Controller\AbstractTechemController;
use Symfony\Component\Form\FormError;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Form\AccountType;
use App\Form\PasswordType;
use App\Model\Account;
use App\Service\GetImmeublesParams;
use Symfony\Component\Routing\Attribute\Route;

class OperatorController extends  AbstractTechemController
{

    //#[Route("/gestionnaire", name: "TechemCoreBundle_Operator_index")]
    public function indexAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $users = $client->getGestionnaires();

        $locals = array(
            'users' => $users,
        );

        $params = new GetImmeublesParams();
        $params->NBANOMALIES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES = true;
        $params->NBCOMPTEURS = true;

        //foreach ($users as $user) {

        //$user->NbAppareils = 0;
        //$user->NbImmeubles = 0;
        //$mesimmeubles = 0;
        //$immeubles = $client->getImmeubles($user->PKUser, $params, false);
        //$user->NbImmeubles = (count($immeubles));
        //foreach ($immeubles as $immeuble) {
        //    $user->NbAppareils += $immeuble->NbAppareils;
        //	$mesimmeubles = $mesimmeubles +1;
        //	$user->NbImmeubles = $mesimmeubles;
        //}


        // }


        return $this->render('Operator/index.html.twig', $locals);
    }

    //#[Route("/gestionnaire/nouveau", name: "TechemCoreBundle_Operator_create")]
    public function createAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $form = $this->createForm(AccountType::class);

        $success = null;

        if ($request->isMethod('post')) {
            $form->handleRequest($request);
            if ($form->isValid()) {
                $account = $form->getData();
                try {
                    $success = $client->createGestionnaire($account);
                    if ($success) {
                        return $this->redirect($this->generateUrl('TechemCoreBundle_Operator_index'));
                    }
                } catch (\Exception $e) {
                    $form->addError(new FormError($e->getMessage()));
                    $success = false;
                }
            }
        }

        $locals = array(
            'success' => $success,
            'form' => $form->createView(),
        );

        return $this->render('Operator/create.html.twig', $locals);
    }
	
	//#[Route("/gestionnaire/statistiques", name: "TechemCoreBundle_Operator_statsoccupants")]
    public function otatsoccupantsAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }
       
        $StatCoOccupants = $client->getStatOccupants();
		
	
        $locals = array(
			'Stats' => $StatCoOccupants,
        );

        return $this->render('Operator/stats.html.twig', $locals);

    }

    //#[Route("/gestionnaire/{id}", name: "TechemCoreBundle_Operator_view")]
    public function viewAction(Request $request, $id)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $params = new GetImmeublesParams();
        $params->NBANOMALIES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES = true;
        $params->NBCOMPTEURS = true;

        $user = $client->getUser($id);
        $myImmeubles = $client->getMyImmeubles4gestio($params);
        $immeubles = $client->getImmeubles4gestio($id, $params, false);
        $diffImmeubles = array_filter($myImmeubles, function ($immeuble) use ($immeubles) {
            return !in_array($immeuble, $immeubles);
        });

        $locals = array(
            'diffImmeubles' => $diffImmeubles,
            'immeubles' => $immeubles,
            'user' => $user,
        );

        return $this->render('Operator/view.html.twig', $locals);
    }

    //#[Route("/gestionnaire/{id}/edit", name: "TechemCoreBundle_Operator_edit")]
    public function editAction(Request $request, $id)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user = $client->getUser($id);

        $account = new Account();
        if (isset($user->UserName)) {
            $account->lastname = $user->UserName;
        }
        if (isset($user->FirstName)) {
            $account->firstname = $user->FirstName;
        }
        if (isset($user->EMail)) {
            $account->email = $user->EMail;
        }
        if (isset($user->PhoneNumber)) {
            $account->phone = $user->PhoneNumber;
        }
        if (isset($user->UserRole)) {
            $account->job = $user->UserRole;
        }

        $form = $this->createForm(AccountType::class, $account);
        $success = false;

        if ($request->isMethod('post')) {
            $form->handleRequest($request);
            if ($form->isValid()) {
                $account = $form->getData();

                try {
                    $client->updateGestionnaire($id, $account);
                    $success = true;
                } catch (\Exception $e) {
                    $form->addError(new FormError($e->getMessage()));
                }
            }
        }

        $locals = array(
            'success' => $success,
            'form' => $form->createView(),
            'user' => $user,
        );

        return $this->render('Operator/edit.html.twig', $locals);
    }

    //#[Route("/gestionnaire/{id}/password", name: "TechemCoreBundle_Operator_password")]
    public function editPasswordAction(Request $request, $id)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user = $client->getUser($id);
        $form = $this->createForm(PasswordType::class);
        $success = false;

        if ($request->isMethod('post')) {
            $form->handleRequest($request);
            if ($form->isValid()) {
                $data = $form->getData();

                try {
                    $client->updatePassword($id, $data['password']);
                    $success = true;
                } catch (\Exception $e) {
                    $form->addError(new FormError($e->getMessage()));
                }
            }
        }

        $locals = array(
            'success' => $success,
            'form' => $form->createView(),
            'user' => $user,
        );

        return $this->render('Operator/editPassword.html.twig', $locals);
    }

    //#[Route("/gestionnaire/{id}/immeuble/ajouter", name: "TechemCoreBundle_Operator_add_building")]
    public function addBuildingAction(Request $request, $id)
    {
        if (!$request->isXmlHttpRequest()) {
            throw new NotFoundHttpException();
        }

        $client = $this->getClient();
        if (is_null($client)) {
            throw new NotFoundHttpException();
        }

        $user = $client->getUser($id);

        $params = new GetImmeublesParams();
        $params->NBANOMALIES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES = true;
        $params->NBCOMPTEURS = true;

        $assignedImmeubles = $client->getImmeubles($id, $params, false);
        $listImmeubles = array();

        if ($request->get('all', '0') === '1') {
            $availableImmeubles = $client->getMyImmeubles($params);
            foreach ($availableImmeubles as $immeuble) {
                $listImmeubles[] = $immeuble->Immeuble->PkImmeuble;
            }
        } else {

            foreach ($assignedImmeubles as $immeuble) {
                $listImmeubles[] = $immeuble->Immeuble->PkImmeuble;
            }

            $newImmeubles = json_decode($request->get('immeubles', '[]'), true);
            $listImmeubles = array_unique(array_merge($listImmeubles, $newImmeubles));
        }

        $result = $client->setImmeubles($id, implode('|', $listImmeubles));
        // $client->clearUserCache($id);

        $response = new Response();
        if (isset($result->Erreur) && !empty($result->Erreur)) {
            $response->setContent($result->Erreur);
            $response->setStatusCode(500);
        } else {
            $result = $client->getImmeubles($id, $params, false);
            $response->setContent($this->renderView('Operator/_remove_building.html.twig', array(
                'immeubles' => $result,
                'user' => $user
            )));
        }

        return $response;
    }

    //#[Route("/gestionnaire/{id}/immeuble/supprimer", name: "TechemCoreBundle_Operator_remove_building")]
    public function removeBuildingAction(Request $request, $id)
    {
        if (!$request->isXmlHttpRequest()) {
            throw new NotFoundHttpException();
        }

        $client = $this->getClient();
        if (is_null($client)) {
            throw new NotFoundHttpException();
        }

        $user = $client->getUser($id);

        $params = new GetImmeublesParams();
        $params->NBANOMALIES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES = true;
        $params->NBCOMPTEURS = true;

        $availableImmeubles = $client->getMyImmeubles($params);
        $assignedImmeubles = $client->getImmeubles($id, $params, false);
        $listImmeubles = array();

        if ($request->get('all', '0') === '1') {
        } else {

            foreach ($assignedImmeubles as $immeuble) {
                $listImmeubles[] = $immeuble->Immeuble->PkImmeuble;
            }

            $removeImmeubles = json_decode($request->get('immeubles', '[]'), true);

            foreach ($removeImmeubles as $immeuble) {
                if (($key = array_search($immeuble, $listImmeubles)) !== false) {
                    unset($listImmeubles[$key]);
                }
            }
        }

        $result = $client->setImmeubles($id, implode('|', $listImmeubles));

        $response = new Response();
        if (isset($result->Erreur) && !empty($result->Erreur)) {
            $response->setContent($result->Erreur);
            $response->setStatusCode(500);
        } else {
            $result = $client->getImmeubles($id, $params, false);
            $diffImmeubles = array_filter($availableImmeubles, function ($immeuble) use ($result) {
                return !in_array($immeuble, $result);
            });
            $response->setContent($this->renderView('Operator/_add_building.html.twig', array(
                'diffImmeubles' => $diffImmeubles,
                'user' => $user
            )));
        }

        return $response;
    }

    //#[Route("/gestionnaire/{id}/supprimer", name: "TechemCoreBundle_Operator_delete")]
    public function deleteAction(Request $request, $id)
    {
        // if (!$request->isXmlHttpRequest()) {
        // throw new NotFoundHttpException();
        // }

        $client = $this->getClient();
        if (is_null($client)) {
            throw new NotFoundHttpException();
        }

        $id = $request->get('id');
        $result = $client->deleteUser($id);
        // $client->clearUserCache($id);

        $response = new Response();
        if (isset($result->Erreur) && !empty($result->Erreur)) {
            $response->setStatusCode('500');
            $response->setContent($result->Erreur);
        } else {
            $response->setStatusCode('200');
            $response->setContent('Ok');
        }

        return $response;
    }
	

	
	
}
