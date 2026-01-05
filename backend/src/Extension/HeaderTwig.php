<?php

namespace App\Extension;

use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class HeaderTwig extends AbstractExtension
{
    /**
     * @var RequestStack
     */
    private $request;

    /**
     * HeaderTwig constructor.
     *
     * @param RequestStack $request
     */
    public function __construct(RequestStack $request)
    {
        $this->request = $request->getCurrentRequest();
    }

    /**
     * @return array|TwigFunction[]
     */
    public function getFunctions()
    {
        return [
            new TwigFunction('occupant_no_header', [$this, 'occupantNoHeader'], [
                'is_safe' => ['html'],
            ]),
        ];
    }

    /**
     * @return mixed
     */
    public function occupantNoHeader()
    {
        return $this->request->getSession()->get('HideTop', null);
    }
}
