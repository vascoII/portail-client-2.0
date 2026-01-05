<?php

namespace App\Service;


/**
 * Class Immeuble
 */
class Immeuble
{

    /**
     * @param $immeuble
     * @param array $available_tabs
     * @return array
     */
    public function generateEvolutionChartsDataByTab($immeuble, $available_tabs)
    {
        $evolution_charts_js = array();
        foreach($available_tabs as $tabkey => $info) {
            $evolution_charts_js[$info['id']] = array(
                'options' => array(),
                'data' => array(),
            );

            foreach ($immeuble->{$tabkey . 'Values'} as $key => $value) {
                $evolution_charts_js[$info['id']]['data'][$key] = array(
                    'label' => $value[0],
                    'value' => $value[1],
                );
            }

            // Couleur de la série
            if(!empty($info['serieColor'])) {
                $evolution_charts_js[$info['id']]['options']['series'][] = array(
                    'color' => $info['serieColor'],
                );
            } else {
                $evolution_charts_js[$info['id']]['options']['series'][] = array(
                    'color' => '#3366CC', // Bleu, couleur par défaut
                );
            }
            $evolution_charts_js[$info['id']]['options']['intervalle'] = $immeuble->{$tabkey}->DefaultIntervalle;
        }

        return $evolution_charts_js;
    }

    /**
     * @param $immeuble
     * @return array
     */
    public function generateComparativeChartData($immeuble)
    {
        $comparative_chart_js = array(
            'options' => array(),
            'data' => array(),
        );

        foreach($immeuble->SerieConsosEFValues as $data) {
            $date = $data[0];
            if(!isset($comparative_chart_js['data'][$date]['SerieConsosEF'])) {
                $comparative_chart_js['data'][$date]['SerieConsosEF'] = 0;
            }

            $comparative_chart_js['data'][$date]['SerieConsosEF'] += $data[1];
        }

        foreach($immeuble->SerieConsosECValues as $data) {
            $date = $data[0];
            if(!isset($comparative_chart_js['data'][$date]['SerieConsosEC'])) {
                $comparative_chart_js['data'][$date]['SerieConsosEC'] = 0;
            }

            $comparative_chart_js['data'][$date]['SerieConsosEC'] += $data[1];
        }

        if(isset($immeuble->SerieConsosCompteurGeneral) && isset($immeuble->SerieConsosCompteurGeneral->ValeursXYL)) {
            $comparative_chart_js['options']['SerieConsosCompteurGeneral'] = true;
            foreach($immeuble->SerieConsosCompteurGeneralValues as $data) {
                $date = $data[0];
                if(!isset($comparative_chart_js['data'][$date]['SerieConsosCompteurGeneral'])) {
                    $comparative_chart_js['data'][$date]['SerieConsosCompteurGeneral'] = 0;
                }

                $comparative_chart_js['data'][$date]['SerieConsosCompteurGeneral'] += $data[1];
            }
        } else {
            $comparative_chart_js['options']['SerieConsosCompteurGeneral'] = false;
        }


        foreach($comparative_chart_js['data'] as &$consos) {
            if(!isset($consos['SommeSerieConsos'])) {
                $consos['SommeSerieConsos'] = 0;
            }
            if(!isset($consos['EcartSerieConsos'])) {
               $consos['EcartSerieConsos'] = 0;
            }
            if(!isset($consos['SerieConsosEF'])) {
                $consos['SerieConsosEF'] = 0;
            }
            if(!isset($consos['SerieConsosEC'])) {
               $consos['SerieConsosEC'] = 0;
            }

            $consos['SommeSerieConsos'] += $consos['SerieConsosEF'] + $consos['SerieConsosEC'];
            if(!isset($consos['SerieConsosCompteurGeneral']) || $consos['SerieConsosCompteurGeneral'] === 0) {
                $consos['EcartSerieConsos'] = -100;
            } else {
                $consos['EcartSerieConsos'] = round((1 - $consos['SommeSerieConsos'] / $consos['SerieConsosCompteurGeneral']) * 100, 2);
            }
        }

        return $comparative_chart_js;
    }

    /**
     * @param $immeuble
     * @return array
     */
    public function generateTabTopConsos($immeuble)
    {
        $tabs_top_consos = array(
            'TopConsosEF' => array(
                'label' => 'Eau froide',
                'id' => 'top-consos-coldw',
                'classes' => '',
            ),
            'TopConsosEC' => array(
                'label' => 'Eau chaude',
                'id' => 'top-consos-hotw',
                'classes' => '',
            ),
            'TopConsosRepart' => array(
                'label' => 'Répartiteur',
                'id' => 'top-consos-repartiteur',
                'classes' => '',
            ),
            'TopConsosEnergie' => array(
                'label' => 'Compteur d\'énergie',
                'id' => 'top-consos-compteur',
                'classes' => '',
            ),
            'TopConsosElect' => array(
                'label' => 'Electricité',
                'id' => 'top-consos-elect',
                'classes' => '',
            ),
            'TopConsosGaz' => array(
                'label' => 'Gaz',
                'id' => 'top-consos-gaz',
                'classes' => '',
            ),
        );

        $active_top_consos = false;
        foreach($tabs_top_consos as $key => $value) {
            $immeuble->{'Has' . $key} = isset($immeuble->{$key}) && ((isset($immeuble->{$key}->consosPetites) && isset($immeuble->{$key}->consosPetites->conso)) || (isset($immeuble->{$key}->consosGrandes) && isset($immeuble->{$key}->consosGrandes->conso)));

            if(!$active_top_consos && $immeuble->{'Has' . $key}) {
                $immeuble->{$key . 'Classes'} = ' active ';
                $tabs_top_consos[$key]['classes'] = ' active ';
                $active_top_consos = true;
            } else {
                $immeuble->{$key . 'Classes'} = '';
            }

            if(!$immeuble->{'Has' . $key}) {
                unset($tabs_top_consos[$key]);
            }
        }

        return $tabs_top_consos;
    }

    /**
     * @param $immeuble
     * @return array
     */
    public function generateTabEvoConsos($immeuble)
    {
        $tabs_evo_consos = array(
            'SerieConsosEAU' => array(
                'label' => 'Eau',
                'id' => 'evo-consos-coldw',
                'classes' => '',
                'serieColor' => '#bae2f0',
            ),
            'SerieConsosCompteurGeneral' => array(
                'label' => 'Eau',
                'id' => 'evo-consos-gen',
                'classes' => '',
                'serieColor' => '#bae2f0',
            ),
            'SerieConsosRepart' => array(
                'label' => 'Répartiteur',
                'id' => 'evo-consos-repartiteur',
                'classes' => '',
                'serieColor' => '',
            ),
            'SerieConsosEnergie' => array(
                'label' => 'Compteur d\'énergie',
                'id' => 'evo-consos-compteur',
                'classes' => '',
                'serieColor' => '',
            ),
            'SerieConsosElect' => array(
                'label' => 'Electrique',
                'id' => 'evo-consos-elect',
                'classes' => '',
                'serieColor' => '',
            ),
            'SerieConsosGaz' => array(
                'label' => 'Gaz',
                'id' => 'evo-consos-gaz',
                'classes' => '',
                'serieColor' => '',
            ),
        );

        $active_evo_consos = false;
        foreach($tabs_evo_consos as $key => $value) {
            $immeuble->{'Has' . $key} = isset($immeuble->{$key}) && isset($immeuble->{$key}->ValeursXYL);

            if(!$active_evo_consos && $immeuble->{'Has' . $key}) {
                $immeuble->{$key . 'Classes'} = ' active ';
                $tabs_evo_consos[$key]['classes'] = ' active ';
                $active_evo_consos = true;
            } else {
                $immeuble->{$key . 'Classes'} = '';
            }

            if(!$immeuble->{'Has' . $key}) {
                unset($tabs_evo_consos[$key]);
            }
        }

        return $tabs_evo_consos;
    }
	
	public function getGPSCoordinates($address) {
		// Encodage de l'adresse pour l'inclure dans l'URL
		$encodedAddress = urlencode($address);
		$url = "https://api-adresse.data.gouv.fr/search/?q={$encodedAddress}&limit=1";

		// Appel de l'API avec file_get_contents
		$response = file_get_contents($url);

		if ($response === FALSE) {

			return [
				'x' => '2.256336', // Longitude
				'y' => '48.765683'  // Latitude
			];
		}

		$data = json_decode($response, true);

		if (isset($data['features'][0]['geometry']['coordinates'])) {
			$coordinates = $data['features'][0]['geometry']['coordinates'];
			return [
				'x' => $coordinates[0], // Longitude
				'y' => $coordinates[1]  // Latitude
			];
		}

		return [
				'x' => '2.256336', // Longitude
				'y' => '48.765683'  // Latitude
			];
	}
	
} 