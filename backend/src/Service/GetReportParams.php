<?php

namespace App\Service;

/**
 * Class GetReportParams
 * @package App\Service
 */
class GetReportParams extends GetParams
{
    /**
     * @var bool|int
     */
    public $PKIMMEUBLE = false;
    /**
     * @var bool|int
     */
    public $PKLOGEMENT = false;
    /**
     * @var bool|int
     */
    public $PKOCCUPANT = false;
    /**
     * @var bool|int
     */
    public $PKINTERVENTION = false;
    /**
     * @var string
     */
    public $WORKORDERNUMBER = false;
    /**
     * @var string
     */
    public $DATE = false;
    /**
     * @var string
     */
    public $DATE1 = false;
    /**
     * @var string
     */
    public $DATE2 = false;
    /**
     * @var string
     */
    public $PKUSER = false;
    /**
     * @var string
     */
    public $PKFACTURE = false;

    /**
     * @return string
     */
    public function toParamsFiltresString()
    {
        $keys = [
            'PKIMMEUBLE',
            'PKLOGEMENT',
            'PKOCCUPANT',
            'PKINTERVENTION',
            'WORKORDERNUMBER',
            'DATE',
            'PKUSER',
            'DATE1',
            'DATE2',
            'PKFACTURE'
        ];

        $params = [];

        foreach ($keys as $key) {
            if ($this->{$key} !== false) {
                $params[] = $key . '=' . $this->{$key};
            }
        }

//        $this->dd(implode('|', $params));
        return implode('|', $params);
    }
}
