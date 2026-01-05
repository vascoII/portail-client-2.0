<?php

namespace App\Service;

/**
 * Class Anomalie
 * @package App\Service
 */
class Anomalie
{

    /**
     * @param $anomalies
     * @return array
     */
    public function extractFiltersValues($anomalies) {
        $filters = array(
            'batiment' => array(),
            'escalier' => array(),
            'etage' => array(),
        );

        foreach($anomalies as $anomalie)
        {
            if(isset($anomalie->Logement->NumBatiment)) {
                $filters['batiment'][] = $anomalie->Logement->NumBatiment;
            }
            if(isset($anomalie->Logement->NumEscalier)) {
                $filters['escalier'][] = $anomalie->Logement->NumEscalier;
            }
            if(isset($anomalie->Logement->NumEtage)) {
                $filters['etage'][] = $anomalie->Logement->NumEtage;
            }
        }

        array_walk($filters, function(&$filter){
            $filter = array_unique($filter);
            natsort($filter);
            return $filter;
        });

        return $filters;
    }

    /**
     * @param $anomalies
     * @return array
     */
    public function export($anomalies)
    {
        $data = array();

        $headers = array(
            'Bât.',
            'Esc.',
            'Réf. client',
            'Etage',
            'Logt',
            'Nom occupant',
            'Empl.',
            'Fluide',
            'N° de compteur',
            'Index',
            'Conso.',
            'Observations',
        );
        $data[] = $headers;

        foreach($anomalies as $anomalie) {
            $row = array (
                'Bât.' => (isset($anomalie->Logement) && isset($anomalie->Logement->NumBatiment)) ? $anomalie->Logement->NumBatiment : null,
                'Esc.' => (isset($anomalie->Logement) && isset($anomalie->Logement->NumEscalier)) ? $anomalie->Logement->NumEscalier : null,
                'Réf. client' => (isset($anomalie->Occupant) && isset($anomalie->Occupant->Ref)) ? $anomalie->Occupant->Ref : null,
                'Etage'  => (isset($anomalie->Logement) && isset($anomalie->Logement->NumEtage)) ? $anomalie->Logement->NumEtage : null,
                'Logt'  => (isset($anomalie->Logement) && isset($anomalie->Logement->NumOrdre)) ? $anomalie->Logement->NumOrdre : null,
                'Nom occupant'  => (isset($anomalie->Occupant) && isset($anomalie->Occupant->Nom)) ? $anomalie->Occupant->Nom : null,
                'Empl.'  => (isset($anomalie->Appareil) && isset($anomalie->Appareil->Emplacement)) ? $anomalie->Appareil->Emplacement : null,
                'Fluide'  => (isset($anomalie->Appareil) && isset($anomalie->Appareil->Fluide)) ? $anomalie->Appareil->Fluide : null,
                'N° de compteur' => (isset($anomalie->Appareil) && isset($anomalie->Appareil->Numero)) ? $anomalie->Appareil->Numero : null,
                'Index' => (isset($anomalie->Anomalie) && isset($anomalie->Anomalie->Index)) ? $anomalie->Anomalie->Index : null,
                'Conso.' => (isset($anomalie->Anomalie) && isset($anomalie->Anomalie->Conso)) ? $anomalie->Anomalie->Conso : null,
                'Observations' => (isset($anomalie->Anomalie) && isset($anomalie->Anomalie->Observations)) ? $anomalie->Anomalie->Observations : null,
            );
            $data[] = $row;
        }

        return $data;
    }
}