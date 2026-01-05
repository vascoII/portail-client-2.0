<?php

namespace App\Controller;

use App\Controller\AbstractTechemController;
use App\Form\InterventionType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Class TicketingController
 * @package App\Controller
 */
class TicketingController extends  AbstractTechemController
{
    //#[Route('/tickets', name: 'TechemCoreBundle_Ticket_List')]
    public function ticketListAction(Request $request)
    {
        $client = $this->getClient();
        if(is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $pkLogement = -1;

        $dataForm = [
            'pkLogement' => $pkLogement,

        ];


        $interventionForm = $this->createForm(
            InterventionType::class,
            $dataForm,
            [
                'action' => $this->generateUrl(
                    'TechemCoreBundle_Create_Ticket_Show', [
                        'pkLogement' => $pkLogement,
                    ]
                ),

            ]
        );


        $showAll = $request->query->get('showAll');

        $locals = [
            'board'   => $client->getMyTableauBordClient(),
            'filters' => [],
            'interventionForm' => $interventionForm->createView(),
            'showAll' => $showAll
        ];

        return $this->render('Ticketing/index-tickets.html.twig', $locals);
    }

    /**
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return string
     */
    public function tableTicketingAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }
		if (file_exists('./../demo.txt') or file_exists('./../preview.txt')){ // mode demo activé
			$jsondemo = "
						{

						\"Erreur\": \"\",
						\"Info\": \"\",
						\"ListeTicketsInter\": {
							\"ticketInter\": [
								{
									\"Nom\": \"M. Gethi\",
									\"Email\": \"test@techem.com\",
									\"TelFixe\": \"06.11.11.11.11\",
									\"TicketDate\": \"2025-05-20T19:22:34\",
									\"MotifLibre\": \"Pouvez-vous faire vérifier le compteur, nous avons un écart avec l'index indiqué par l'occupant ?\",
									\"Statut\": \"Nouveau\",
									\"ObjetRetour\": \"Pouvez-vous faire vérifier le compteur, nous avons un écart avec l'index indiqué par l'occupant ?\",
									\"FkLogement\": \"1165420\",
									\"RefLogement\": \"001095P0901\",
									\"NumIntervention\": \"00142990\",
									\"WebUser_Nom\": \"Demo\",
									\"WebUser_Prenom\": \"Client\",
									\"WebUser_Tel\": \"0102030405\",
									\"WebUser_Email\": \"noreply@techem.fr\",
									\"Imm_Id\": \"070038\",
									\"FkImmeuble\": \"2108\",
									\"Statut_Client\": \"\",
									\"CaseNumber\": \"00105598\",
									\"CaseId\": \"5003X00002CuohYQAR\",
									\"LastUpdateDate\": \"2025-05-21T14:23:51\"
								},
								{
									\"Nom\": \"Mme Uajiau\",
									\"Email\": \"occupant2@techem.fr\",
									\"TelFixe\": \"06.02.03.04.05\",
									\"TicketDate\": \"2025-04-17T16:45:22\",
									\"MotifLibre\": \"Bonjour, je vous remercie de fixer un rendez-vous au locataire afin d'effectuer la pose d'un compteur d'eau. Cordialement\",
									\"Statut\": \"En cours de traitement\",
									\"ObjetRetour\": \"Pose d'un nouveau compteur\",
									\"FkLogement\": \"1165453\",
									\"RefLogement\": \"001095H0040\",
									\"NumIntervention\": \"00142990\",
									\"WebUser_Nom\": \"Demo\",
									\"WebUser_Prenom\": \"Client\",
									\"WebUser_Tel\": \"0102030405\",
									\"WebUser_Email\": \"noreply@techem.fr\",
									\"Imm_Id\": \"070038\",
									\"FkImmeuble\": \"2108\",
									\"Statut_Client\": \"\",
									\"CaseNumber\": \"00147278\",
									\"CaseId\": \"5003X00002QC8hOQAT\",
									\"LastUpdateDate\": \"2025-05-20T13:26:13\"
								},
								{
									\"Nom\": \"M. Osuor\",
									\"Email\": \"occupant@techem.fr\",
									\"TelFixe\": \"0102030405\",
									\"TicketDate\": \"2025-02-01T12:15:08\",
									\"MotifLibre\": \"DEMANDE DE POSE D'UN COMPTEUR D EAU FROIDE\",
									\"Statut\": \"Clos - Demande traitée\",
									\"ObjetRetour\": \"POSE DE COMPTEUR D EAU FROIDE\",
									\"FkLogement\": \"1269966\",
									\"RefLogement\": \"074238H0006\",
									\"NumIntervention\": \"00142990\",
									\"WebUser_Nom\": \"Demo\",
									\"WebUser_Prenom\": \"Client\",
									\"WebUser_Tel\": \"0102030405\",
									\"WebUser_Email\": \"noreply@techem.fr\",
									\"Imm_Id\": \"070038\",
									\"FkImmeuble\": \"2108\",
									\"Statut_Client\": \"\",
									\"CaseNumber\": \"00203282\",
									\"CaseId\": \"5003X00002hzdw2QAA\",
									\"LastUpdateDate\": \"2025-03-22T10:41:27\"
								},
								{
									\"Nom\": \"M. Demo\",
									\"Email\": \"occupant@techem.fr\",
									\"TelFixe\": \"0102030405\",
									\"TicketDate\": \"2024-09-02T12:15:08\",
									\"MotifLibre\": \"Demande de pose de Répartiteur\",
									\"Statut\": \"Clos - Demande traitée\",
									\"ObjetRetour\": \"Bonjour, Pouvez-vous poser les répartiteur dans ce logement ?\",
									\"FkLogement\": \"1594353\",
									\"RefLogement\": \"Log 18\",
									\"NumIntervention\": \"00142990\",
									\"WebUser_Nom\": \"Demo\",
									\"WebUser_Prenom\": \"Client\",
									\"WebUser_Tel\": \"0102030405\",
									\"WebUser_Email\": \"noreply@techem.fr\",
									\"Imm_Id\": \"064272\",
									\"FkImmeuble\": \"340523\",
									\"Statut_Client\": \"\",
									\"CaseNumber\": \"00203282\",
									\"CaseId\": \"5003X00002hzdw2QAA\",
									\"LastUpdateDate\": \"2025-03-22T10:41:27\"
								}
							]
							}
						}
						";
			$tickets_array = json_decode($jsondemo,true);
		}else{
			$tickets = $client->getTicketsIntersUser(null);
			$tickets_array = json_decode(json_encode($tickets),true);
		}
		
		
		
        $ticket = array();
		
		$locals['vide']='na';
		$locals['tickets']=array();
        

		
		foreach ($tickets_array['ListeTicketsInter'] as $ticket) {
            $locals['tickets'] =  $ticket;
        }


//        affiche liste des tickets stdClass

//        $client->dd($locals);

		
		
//        affiche liste des tickets stdClass

//        $client->dd($locals);

		

        return $this->render('Ticketing/list-tickets.html.twig', $locals);
    }

	public function object_to_array($obj) {
		//only process if it's an object or array being passed to the function
		if(is_object($obj) || is_array($obj)) {
			$ret = (array) $obj;
			foreach($ret as &$item) {
				//recursively process EACH element regardless of type
				$item = $this->object_to_array($item);
			}
			return $ret;
		}
		//otherwise (i.e. for scalar values) return without modification
		else {
			return $obj;
		}
	}
	
	
	
    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function menuTicketAction()
    {
        $client = $this->getClient();
        if(is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $locals = [
            'isTicketInterEnabled' => $client->getTicketsInterEnabled(),
            'getNbTicketsInterUser'=> $client->getNbTicketsInterUser()

        ];


        return $this->render('Ticketing/add_menu_tickets.html.twig', $locals);
    }

    //#[Route('/tickets/close/{pkTicket}', name: 'TechemCoreBundle_Ticket_Close')]
    public function closeTicketAction(Request $request, $pkTicket)
    {
        if ($request->isXMLHttpRequest()) {
            $statut = 'Clos';

            $client = $this->getClient();

            $ticketResponse = $client->setTicketStatutClient($pkTicket, $statut);


//            $logger->info('Ticket Reponse: '. print_r($ticketResponse, true));

            return new JsonResponse('ok' , 200);
        }

        return new JsonResponse('Error ajax!', 400);


    }

    /**
     * @param $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function createTicketAction($pkLogement)
    {
        $client = $this->getClient();

        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $ticketOwner      = $client->getTicketInterInit($pkLogement);

        $dataForm = [
            'pkLogement' => (int) $pkLogement,
            'name'       => $ticketOwner->Nom,
            'email'      => $ticketOwner->Email,
            'phone'      => $ticketOwner->TelFixe,
            'mobile'     => $ticketOwner->TelMobile,
        ];

        $interventionForm = $this->createForm(
            InterventionType::class,
            $dataForm,
            [
                'action' => $this->generateUrl(
                    'TechemCoreBundle_Create_Ticket_Show', [
                        'pkLogement' => $pkLogement,
                    ]
                ),

            ]
        );

        $locals = [
            'interventionForm' => $interventionForm->createView(),
        ];

        return $this->render('Ticketing/create-ticket.html.twig', $locals);
    }

    //#[Route('/tickets/attachment/{pkTicket}', name: 'TechemCoreBundle:Ticketing:attachmentTicket')]
    public function attachmentTicketAction(Request $request)
    {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(['message' => 'wrong request'], 400);
        }
        $client = $this->getClient();

        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logger = $this->container->get('logger');

        $pkTicket  = $request->request->get('pkTicket');
        $attachment = $client->getAttachmentTicketInter($pkTicket);

        $imageName = $attachment->Name;
        $imageContent = $attachment->content;

        $logger->info('Image name : '. print_r($imageName, true));
        $logger->info('Image content : '. print_r($imageContent, true));

        $attachmentGet = [
            'attachmentName' => $imageName,
            'attachmentContent'=> $imageContent

        ];

        $logger->info('Attachment : '. print_r($attachmentGet, true));

        return new JsonResponse($attachmentGet, 200);
    }

    private function utf8_encode_deep(&$input) {
        if (is_string($input)) {
            $input = utf8_encode($input);
        } else if (is_array($input)) {
            foreach ($input as &$value) {
                $this->utf8_encode_deep($value);
            }

            unset($value);
        } else if (is_object($input)) {
            $vars = array_keys(get_object_vars($input));

            foreach ($vars as $var) {
                $this->utf8_encode_deep($input->$var);
            }
        }
    }


}