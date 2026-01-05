<?php

namespace App\Service;

/**
 * Class Fuite
 * @package App\Service
 */
class Fuite
{

    /**
     * @param $fuites
     *
     * @return array
     */
    public function extractFiltersValues($fuites)
    {
        $filters = [
            'fluide'   => [],
            'batiment' => [],
            'escalier' => [],
            'etage'    => [],
        ];

        foreach ($fuites as $fuite) {
            if (isset($fuite->Logement->NumBatiment)) {
                $filters['batiment'][] = $fuite->Logement->NumBatiment;
            }
            if (isset($fuite->Logement->NumEscalier)) {
                $filters['escalier'][] = $fuite->Logement->NumEscalier;
            }
            if (isset($fuite->Logement->NumEtage)) {
                $filters['etage'][] = $fuite->Logement->NumEtage;
            }
            if (isset($fuite->Appareil->Fluide)) {
                $filters['fluide'][] = $fuite->Appareil->Fluide;
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
     * @param $fuites
     *
     * @return array
     */
    public function export($fuites)
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
            'NB de jours',
        ];
        $data[]  = $headers;

        foreach ($fuites as $fuite) {
            $row    = [
                'Bât.'           => (isset($fuite->Logement) && isset($fuite->Logement->NumBatiment)) ? $fuite->Logement->NumBatiment : null,
                'Esc.'           => (isset($fuite->Logement) && isset($fuite->Logement->NumEscalier)) ? $fuite->Logement->NumEscalier : null,
                'Réf. client'    => (isset($fuite->Occupant) && isset($fuite->Occupant->Ref)) ? $fuite->Occupant->Ref : null,
                'Etage'          => (isset($fuite->Logement) && isset($fuite->Logement->NumEtage)) ? $fuite->Logement->NumEtage : null,
                'Logt'           => (isset($fuite->Logement) && isset($fuite->Logement->NumOrdre)) ? $fuite->Logement->NumOrdre : null,
                'Nom occupant'   => (isset($fuite->Occupant) && isset($fuite->Occupant->Nom)) ? $fuite->Occupant->Nom : null,
                'Empl.'          => (isset($fuite->Appareil) && isset($fuite->Appareil->Emplacement)) ? $fuite->Appareil->Emplacement : null,
                'Fluide'         => (isset($fuite->Appareil) && isset($fuite->Appareil->Fluide)) ? $fuite->Appareil->Fluide : null,
                'N° de compteur' => (isset($fuite->Appareil) && isset($fuite->Appareil->Numero)) ? $fuite->Appareil->Numero : null,
                'NB de jours'    => (isset($fuite->Fuite) && isset($fuite->Fuite->Duree)) ? $fuite->Fuite->Duree : null,
            ];
            $data[] = $row;
        }

        return $data;
    }
}