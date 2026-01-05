<?php

namespace App\Controller;

use App\Controller\AbstractTechemController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * @package App\Controller
 */
class TranslationController extends  AbstractTechemController
{

    //#[Route('/change/locale/{language}', name: 'TechemCoreBundle_Translation_set_locale')]
    public function changeLocaleAction($language, Request $request)
    {
        //  Custom function for patch internal error
        $refererRoute = $this->getRefererRouteAction($request, $language);
        $request->setLocale($language);
        $request->getSession()->set('_locale', $language);

        return $this->redirect($refererRoute);
    }

    /**
     * @param Request                                   $request
     * @param                                           $language
     *
     * @return mixed
     */
    public function getRefererRouteAction(Request $request, $language)
    {
        $referer = $request->headers->get('referer');
        $referer = str_replace('/' . $request->getLocale() . '/', '/' . $language . '/', $referer);

        return $referer;
    }
}
