<?php

namespace App\Controller;

use App\Controller\AbstractTechemController;
use App\Service\Client;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;

/**
 * Class FrontController
 * @package App\Controller
 */
class FrontController extends  AbstractTechemController
{

    private $validator;

    public function __construct(ValidatorInterface $validator)
    {
        $this->validator = $validator;
    }


    public function indexAction()
    {
		if ($this->isGranted('ROLE_OCCUPANT')) {
            $url = $this->generateUrl('TechemCoreBundle_Occupant_show');
        } elseif ($this->isGranted('ROLE_GESTIONNAIRE')) {
            $url = $this->generateUrl('TechemCoreBundle_TableauBordClient_index');
        } else {
            $url = $this->generateUrl('app_login');
        }
       
		return $this->redirect($url);
    }

    //#[Route("/legal-notices", name: "TechemCoreBundle_Front_legal_notices")]
    public function legalNoticesAction()
    {
        $locals = array();
        $view = ":layout.html.twig";

        if ($this->isGranted('ROLE_OCCUPANT')) {
            $view = ":base_occupant.html.twig";
        } elseif ($this->isGranted('ROLE_GESTIONNAIRE')) {
            $view = ":base.html.twig";
        }
        $locals["view"] = $view;

        return $this->render('Front/legal_notices.html.twig', $locals);
    }

    //#[Route("/personal-datas", name: "TechemCoreBundle_Front_Personal_dadas")]
    public function personalDatasAction(Client $client)
    {
		$client = $this->getClient($client);
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }
		$soustraitants = $client->getSousTraitants();

		$locals = [
            'sousTraitants'  => $soustraitants,
        ];

        return $this->render('Front/personal_datas.html.twig', $locals);
    }

    //#[Route("/cgu", name: "TechemCoreBundle_Front_cgu_validate")]
    public function cguAction(\Symfony\Component\HttpFoundation\Request $request, Client $client)
    {
        $client = $this->getClient($client);
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }
        if ($request->isMethod('post')) {
            $email = $request->request->get('_email');
            $email_confirm = $request->request->get('_email_confirm');

            $emailConstraint = new Email();
            $emailConstraint->message = 'Invalid email address';

            $errors1 = $this->validator->validate($email, $emailConstraint);
            $errors2 = $this->validator->validate($email_confirm, $emailConstraint);
            if (!($email === $email_confirm)) {
                $this->addFlash('cgu_message', 'Les deux adresses mails ne correspondent pas.');
            } else {
                if (count($errors1) > 0 || count($errors2) > 0) {
                    $this->addFlash('cgu_message', 'L\'adresse email saisie n\'est pas valide.');
                } else {
                    if ($request->request->get('valid_cgu') == "on") {
                        try {
                            $result = $client->updateCGUFromPKUser("O");
                            $result_email = $client->updateEmailFromPKUser($email);
                            if ($result && $result_email) {
                                if ($request->getSession()->get("type_user") == "occupant") {
                                    $url = $this->generateUrl('TechemCoreBundle_Occupant_show');
                                } else {
                                    $url = $this->generateUrl('TechemCoreBundle_TableauBordClient_index');
                                }
                                return $this->redirect($url);
                            } else {
                                $this->addFlash('cgu_message', 'Une erreur s\'est produite. Veuillez réessayer!');
                            }
                        } catch (\Exception $e) {
                            $this->addFlash('cgu_message', 'Une erreur s\'est produite. Veuillez réessayer!');
                        }
                    } else {
                        $this->addFlash('cgu_message', 'Vous devez accepter les conditions générales d\'utilisation');
                    }
                }
            }
        }

        $type_user = $request->getSession()->get("type_user");
        if ($type_user == "occupant" || $type_user == "gestionnaire") {
            return $this->render('Front/cgu_page.html.twig', array("type_user" => $type_user));
        } else {
            return $this->redirect($this->generateUrl('app_login'));
        }
    }
}
