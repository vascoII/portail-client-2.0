<?php

namespace App\Service;

/**
 * Class Dysfonctionnement
 * @package App\Service
 */
class Dysfonctionnement
{

    /**
     * @param $dysfonctionnements
     *
     * @return array
     */
    public function extractFiltersValues($dysfonctionnements)
    {
        $filters = [
            'type'   => [],
            'batiment' => [],
            'escalier' => [],
            'etage'    => [],
        ];
        foreach ($dysfonctionnements as $dysfonctionnement) {
            if (isset($dysfonctionnement->Logement->NumBatiment)) {
                $filters['batiment'][] = $dysfonctionnement->Logement->NumBatiment;
            }
            if (isset($dysfonctionnement->Logement->NumEscalier)) {
                $filters['escalier'][] = $dysfonctionnement->Logement->NumEscalier;
            }
            if (isset($dysfonctionnement->Logement->NumEtage)) {
                $filters['etage'][] = $dysfonctionnement->Logement->NumEtage;
            }
            if (isset($dysfonctionnement->Appareil->Fluide)) {
                $filters['type'][] = $dysfonctionnement->Dysfonctionnement->Type;
            }
        }

        array_walk(
            $filters, function (&$filter) {
            $filter = array_unique($filter);
            natsort($filter);
            return $filter;
        }
        );

        return $filters;
    }

    /**
     * @todo
     *
     * @param $anomalies
     *
     * @return array
     */
    public function export($anomalies)
    {
        $data = [];

        $headers = [
            'Bât.',
            'Esc.',
            'Réf. client',
            'Etage',
            'Logt',
            'Nom occupant',
            'Empl.',
            'Fluide',
            'N° de compteur',
            'Type d\'alarme',
            'NB de jours',
        ];
        $data[]  = $headers;
//        echo '<pre>';
//        var_dump($anomalies);
//        echo '</pre>';
//        die;
        foreach ($anomalies as $anomalie) {
            $row    = [
                'Bât.'           => (isset($anomalie->Logement) && isset($anomalie->Logement->NumBatiment)) ? $anomalie->Logement->NumBatiment : null,
                'Esc.'           => (isset($anomalie->Logement) && isset($anomalie->Logement->NumEscalier)) ? $anomalie->Logement->NumEscalier : null,
                'Réf. client'    => (isset($anomalie->Occupant) && isset($anomalie->Occupant->Ref)) ? $anomalie->Occupant->Ref : null,
                'Etage'          => (isset($anomalie->Logement) && isset($anomalie->Logement->NumEtage)) ? $anomalie->Logement->NumEtage : null,
                'Logt'           => (isset($anomalie->Logement) && isset($anomalie->Logement->NumOrdre)) ? $anomalie->Logement->NumOrdre : null,
                'Nom occupant'   => (isset($anomalie->Occupant) && isset($anomalie->Occupant->Nom)) ? $anomalie->Occupant->Nom : null,
                'Empl.'          => (isset($anomalie->Appareil) && isset($anomalie->Appareil->Emplacement)) ? $anomalie->Appareil->Emplacement : null,
                'Fluide'         => (isset($anomalie->Appareil) && isset($anomalie->Appareil->Fluide)) ? $anomalie->Appareil->Fluide : null,
                'N° de compteur' => (isset($anomalie->Appareil) && isset($anomalie->Appareil->Numero)) ? $anomalie->Appareil->Numero : null,
                'Type d\'alarme' => (isset($anomalie->Dysfonctionnement) && isset($anomalie->Dysfonctionnement->Type)) ? $anomalie->Dysfonctionnement->Type : null,
                'NB de jours'    => (isset($anomalie->Dysfonctionnement) && isset($anomalie->Dysfonctionnement->Duree)) ? $anomalie->Dysfonctionnement->Duree : null,
            ];
            $data[] = $row;
        }

        return $data;
    }

}