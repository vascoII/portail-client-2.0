<?php

namespace App\Service;

/**
 * Class Logement
 */
class Logement
{
    /**
     * @param $logement
     * @return array
     */
    public function generateTabConsos($logement)
    {
        $tabs = array(
            'EF' => array(
                'id' => 'coldw',
                'label' => 'Eau froide',
                'serieColor' => '#bae2f0',
                'serie' => 'SerieConsos',
                'infosAppareil' => 'infosAppareilEAU',
            ),
            'EC' => array(
                'id' => 'hotw',
                'label' => 'Eau chaude',
                'serieColor' => '#f0baba',
                'serie' => 'SerieConsos',
                'infosAppareil' => 'infosAppareilEAU',
            ),
            'Repart' => array(
                'id' => 'repartiteur',
                'label' => 'Répartiteur',
                'serieColor' => '',
                'serie' => 'SerieConsosDJU',
                'infosAppareil' => 'infosAppareilRepart',
            ),
            'CET' => array(
                'id' => 'compteur',
                'label' => 'Compteur d\'énergie',
                'serieColor' => '',
                'serie' => 'SerieConsosDJU',
                'infosAppareil' => 'infosAppareilCET',
            ),
            'Elect' => array(
                'id' => 'elect',
                'label' => 'Electricité',
                'serieColor' => '',
                'serie' => 'SerieConsos',
                'infosAppareil' => 'infosAppareilElect',
            ),
            'Gaz' => array(
                'id' => 'gaz',
                'label' => 'Gaz',
                'serieColor' => '',
                'serie' => 'SerieConsos',
                'infosAppareil' => 'infosAppareilGaz',
            ),
            'Capteur' => array(
                'id' => 'capteur',
                'label' => 'Capteur',
                'serieColor' => '',
                'serie' => '',
                'infosAppareil' => '',
            ),
        );

        foreach ($tabs as $key => &$defaultTab) {
            if (isset($logement->{'Logement' . $key}->ConsoPeriode)) {
                $defaultTab['ConsoPeriode'] = $logement->{'Logement' . $key}->ConsoPeriode;
            }
            if (isset($logement->{'Logement' . $key}->ConsoMemeTypeLogement)) {
                $defaultTab['ConsoMemeTypeLogement'] = round($logement->{'Logement' . $key}->ConsoMemeTypeLogement, 2);
            } else {
                $defaultTab['ConsoMemeTypeLogement'] = 0;
            }

            $defaultTab['NbCompteurs'] = $logement->{'NbCompteurs' . $key};
            if (isset($logement->{'Logement' . $key}->ListeInfosAppareils)) {
                if (!isset($logement->{'Logement' . $key}->ListeInfosAppareils->{$defaultTab['infosAppareil']})) {
                    $logement->{'Logement' . $key}->ListeInfosAppareils->{$defaultTab['infosAppareil']} = array();
                }

                if (!is_array($logement->{'Logement' . $key}->ListeInfosAppareils->{$defaultTab['infosAppareil']})) {
                    $logement->{'Logement' . $key}->ListeInfosAppareils->{$defaultTab['infosAppareil']} = array($logement->{'Logement' . $key}->ListeInfosAppareils->{$defaultTab['infosAppareil']});
                }

                $defaultTab['ListeInfosAppareils'] = $logement->{'Logement' . $key}->ListeInfosAppareils;
            }

            $defaultTab['EvolutionChartData'] = $this->generateEvolutionChartData($logement, 'Logement' . $key, $defaultTab);

            if ($logement->{'NbCompteurs' . $key} < 1) {
                unset($tabs[$key]);
            }
        }

        return $tabs;
    }

    /**
     * @param $logement
     * @param string $serie
     * @param $tab
     * @return array
     */
    public function generateEvolutionChartData($logement, $serie, $tab)
    {
        $evolution_charts_js = array(
            'chartControl' => array(
                'state' => array(
                    'lowValue' => 0,
                    'highValue' => 0
                ),
            ),
            'options' => array(),
            'data' => array(),
        );

        if ($serie === 'LogementCapteur') {
            return $this->generateCapteurChartData($logement->{$serie});
        }

        $high_value = null;
        $first_date = null;
        $last_date = null;
        if (!isset($logement->{$serie . 'Values'})) {
            return $evolution_charts_js;
        }
        foreach ($logement->{$serie . 'Values'} as $key => $value) {
            $date = date_create_from_format('d/m/Y', $value[0]);
            if (is_null($last_date) || $date > $last_date) {
                $last_date = $date;
                $high_value = $date->getTimestamp();
            }
            if(is_null($first_date) || $date < $first_date) {
                $first_date = $date;
            }
            $evolution_charts_js['data'][$key] = array(
                'label' => $date->getTimestamp() * 1000,
                'consoRaw' => $value[1],
                'conso' => str_replace(',', '.', $value[1]),
                'indexRaw' => $value[2],
                'index' => str_replace(',', '.', $value[2]),
            );

            if(!empty($value[3])) {
                $evolution_charts_js['data'][$key]['params'] = $this->getSerieParams($value[3]);
            } else {
                $evolution_charts_js['data'][$key]['params'] = array();
            }
        }

        if (!is_null($high_value)) {
            $low_date = new \DateTime('@'.($high_value - (3600 * 24 * $logement->{$serie}->{$tab['serie']}->DefaultIntervalle)));
            $high_date =  new \DateTime('@'.$high_value);
            $evolution_charts_js['chartControl']['state']['lowValue'] = $high_value * 1000 - (3600 * 24 * $logement->{$serie}->{$tab['serie']}->DefaultIntervalle * 1000);
            $evolution_charts_js['chartControl']['state']['lowDate'] = $low_date->format('d/m/Y');
            $evolution_charts_js['chartControl']['state']['highValue'] = $high_value * 1000;
            $evolution_charts_js['chartControl']['state']['highDate'] = $high_date->format('d/m/Y');;
        }

        if(!is_null($first_date)) {
            $evolution_charts_js['chartControl']['state']['endDate'] = $last_date->format('d/m/Y');
            $evolution_charts_js['chartControl']['state']['startDate'] = $first_date->format('d/m/Y');
        }


        if (!empty($tab['serieColor'])) {
            $evolution_charts_js['options']['series'][] = array(
                'color' => $tab['serieColor'],
            );
        } else {
            $evolution_charts_js['options']['series'][] = array(
                'color' => '#8b959f', // gris
            );
        }

        return $evolution_charts_js;
    }


    /**
     * @param $capteurData
     * @return array
     */
    public function generateCapteurChartData($capteurData)
    {
        $charts = [];
        $series = [];
        if (!empty($capteurData->SerieConsosTemperature->ValeursXYL)) {
            $series['temp'] = $this->getChartFormattedData($capteurData->SerieConsosTemperature->ValeursXYL);
        }
        if (!empty($capteurData->SerieConsosHumidite->ValeursXYL)) {
            $series['hum'] = $this->getChartFormattedData($capteurData->SerieConsosHumidite->ValeursXYL);
        }
        foreach ($series as $type => $data) {
            $evolution_charts_js = array(
                'chartControl' => array(
                    'state' => array(
                        'lowValue' => 0,
                        'highValue' => 0
                    ),
                ),
                'options' => array(),
                'data' => array(),
            );

            $high_value = null;
            $first_date = null;
            $last_date = null;

            foreach ($data as $key => $value) {
                $date = date_create_from_format('d/m/Y', $value[0]);
                if (is_null($last_date) || $date > $last_date) {
                    $last_date = $date;
                    $high_value = $date->getTimestamp();
                }
                if(is_null($first_date) || $date < $first_date) {
                    $first_date = $date;
                }
                $evolution_charts_js['data'][$key] = array(
                    'label' => $date->getTimestamp() * 1000,
                    'consoRaw' => $value[1],
                    'conso' => str_replace(',', '.', $value[1]),
                    'indexRaw' => $value[2],
                    'index' => str_replace(',', '.', $value[2]),
                );

                if(!empty($value[3])) {
                    $evolution_charts_js['data'][$key]['params'] = $this->getSerieParams($value[3]);
                } else {
                    $evolution_charts_js['data'][$key]['params'] = array();
                }
            }

            if (!is_null($high_value)) {
                $low_date = new \DateTime('@'.($high_value - (3600 * 24 * 30)));
                $high_date =  new \DateTime('@'.$high_value);
                $evolution_charts_js['chartControl']['state']['lowValue'] = $high_value * 1000 - (3600 * 24 * 30 * 1000);
                $evolution_charts_js['chartControl']['state']['lowDate'] = $low_date->format('d/m/Y');
                $evolution_charts_js['chartControl']['state']['highValue'] = $high_value * 1000;
                $evolution_charts_js['chartControl']['state']['highDate'] = $high_date->format('d/m/Y');;
            }

            if(!is_null($first_date)) {
                $evolution_charts_js['chartControl']['state']['endDate'] = $last_date->format('d/m/Y');
                $evolution_charts_js['chartControl']['state']['startDate'] = $first_date->format('d/m/Y');
            }
            $charts[$type] = $evolution_charts_js;
        }
        return $charts;
    }

    /**
     * @param $values
     * @return array
     */
    public function getChartFormattedData($values)
    {
        $data = [];
        foreach (explode(';', $values) as $item) {
            $data[] = explode('|',$item);
        }
        return $data;
    }


    /**
     * @param string $params
     * @param string $separator
     * @return string
     */
    public function getSerieParams($params, $separator = '\\')
    {
        $keys = array(
            'FUITE=O' => 'FUITE',
            'VISIBLE=N' => 'NOVISIBLE',
        );

        $data = array();
        foreach(explode($separator, $params) as $param) {
            //$filter = explode('=', $param);
            //$key = $filter[0];
            //if(in_array($key, $keys) && $filter[1] == 'O') {
            //    $data[] = $key;
            //}
            if (isset($keys[$param])) {
                $data[] = $keys[$param];
            }
        }
        return $data;
    }

    /**
     * @param $logements
     * @return array
     */
    public function extractFiltersValues($logements)
    {
        $filters = array(
            'batiment' => array(),
            'escalier' => array(),
            'etage' => array(),
        );

        foreach ($logements as $logement) {
            if (isset($logement->Logement->NumBatiment)) {
                $filters['batiment'][] = $logement->Logement->NumBatiment;
            }
            if (isset($logement->Logement->NumEscalier)) {
                $filters['escalier'][] = $logement->Logement->NumEscalier;
            }
            if (isset($logement->Logement->NumEtage)) {
                $filters['etage'][] = $logement->Logement->NumEtage;
            }
        }

        array_walk($filters, function (&$filter) {
            $filter = array_unique($filter);
            natsort($filter);

            return $filter;
        });

        return $filters;
    }

    /**
     * Compte les compteurs regrouper par type
     * @param array $appareils
     * @return array
     */
    public function extractDeviceTypeCount($appareils)
    {
        $count = array();

        foreach ($appareils as $appareil) {
            if (isset($appareil->Fluide)) {
                if (!isset($count[$appareil->Fluide])) {
                    $count[$appareil->Fluide]['count'] = 1;
                    $count[$appareil->Fluide]['label'] = $this->getDeviceLabel($appareil->Fluide);
                } else {
                    $count[$appareil->Fluide]['count']++;
                }
            }
        }

        return $count;
    }

    /**
     * @param $type
     * @return string
     */
    public function getDeviceLabel($type)
    {
        switch ($type) {
            case 'EF':
                $label = 'Eau froide';
                break;
            case 'EC':
                $label = 'Eau chaude';
                break;
            case 'Repart':
                $label = 'Répartiteur';
                break;
            case 'Energie':
                $label = 'Compteur d\'énergie';
                break;
            case 'Elect':
                $label = 'Electricité';
                break;
            case 'Gaz':
                $label = 'Gaz';
                break;
            default:
                $label = $type;
                break;
        }

        return $label;
    }
}