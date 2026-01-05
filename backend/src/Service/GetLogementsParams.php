<?php

namespace App\Service;

/**
 * Class GetLogementsParams
 * @package App\Service
 */
class GetLogementsParams extends GetParams
{
    public $FUITES = null;
    public $DEPANNAGES = null;
    public $DYSFONCTIONNEMENTS = null;
    public $ANOMALIES = null;
    public $FIELD_ALLFIELDS = null;
    public $FIELD_REFOCCUPANT = null;
    public $FIELD_ADRESSE_CP_VILLE = null;
    public $FIELD_NOM = null;

    public $NBCOMPTEURS = null;
    public $NBFUITES = null;
    public $NBDEPANNAGES = null;
    public $NBDYSFONCTIONNEMENTS = null;
    public $NBANOMALIES = null;
    public $IMMEUBLE = null;

    /**
     * @return GetLogementsParams
     */
    public static function createAllTrue()
    {
        $params = new GetLogementsParams();

        $params->FUITES = true;
        $params->DEPANNAGES = true;
        $params->DYSFONCTIONNEMENTS = true;
        $params->ANOMALIES = true;

        $params->NBCOMPTEURS = true;
        $params->NBFUITES = true;
        $params->NBDEPANNAGES = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBANOMALIES = true;

        return $params;
    }

    /**
     * @return string
     */
    public function toParamsFiltresString()
    {
        $keys = array(
            'FUITES',
            'DEPANNAGES',
            'DYSFONCTIONNEMENTS',
            'ANOMALIES'
        );

        $params = array();

        foreach ($keys as $key) {
            if(!is_null($this->{$key})) {
                $params[] = $key . '=' . ($this->{$key} ? 'O' : 'N');
            }
        }

        $value_keys = array(
            'FIELD_ALLFIELDS' => 'FIELD_ALLFIELDS',
            'FIELD_REFOCCUPANT' => 'FIELD_REFOCCUPANT',
            'FIELD_ADRESSE_CP_VILLE' => 'FIELD_ADRESSE-CP-VILLE',
            'FIELD_NOM' => 'FIELD_NOM',
        );

        foreach ($value_keys as $key => $realkey) {
            if(!is_null($this->{$key})) {
                $params[] = $realkey . '=' . $this->{$key};
            }
        }

        return implode('|', $params);
    }

    /**
     * @return string
     */
    public function toParamsInfosString()
    {
        $keys = array(
            'NBCOMPTEURS',
            'NBFUITES',
            'NBDEPANNAGES',
            'NBDYSFONCTIONNEMENTS',
            'NBANOMALIES',
            'IMMEUBLE',
        );

        $params = array();

        foreach ($keys as $key) {
            if(!is_null($this->{$key})) {
                $params[] = $key . '=' . ($this->{$key} ? 'O' : 'N');
            }
        }

        return implode('|', $params);
    }
}