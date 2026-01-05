<?php

namespace App\Service;

/**
 * Class Depannage
 * @package App\Service
 */
class Depannage
{

    /**
     * @param $depannages
     * @return array
     */
    public function extractFiltersValues($depannages) {
        $filters = array(
            'motif-abrege' => array(),
            'statut' => array(),
            'batiment' => array(),
            'escalier' => array(),
            'etage' => array(),
        );

        foreach($depannages as $depannage)
        {
            if(isset($depannage->Depannage->MotifAbrege)) {
                $filters['motif-abrege'][] = $depannage->Depannage->MotifAbrege;
            }
            if(isset($depannage->Depannage->Statut)) {
                $filters['statut'][] = $depannage->Depannage->Statut;
            }
            if(isset($depannage->Logement->NumBatiment)) {
                $filters['batiment'][] = $depannage->Logement->NumBatiment;
            }
            if(isset($depannage->Logement->NumEscalier)) {
                $filters['escalier'][] = $depannage->Logement->NumEscalier;
            }
            if(isset($depannage->Logement->NumEtage)) {
                $filters['etage'][] = $depannage->Logement->NumEtage;
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
     * @param $depannages
     * @return array
     */
    public function export($depannages)
    {
        $data = array();

        $headers = array(
            'Bât.',
            'Esc.',
            'Réf. client',
            'Etage',
            'Logt',
            'Nom occupant',
            'N° dépannage',
            'Statut',
            'Date',
            'Motif',
            'Compte Rendu',
        );
        $data[] = $headers;

        foreach($depannages as $depannage) {
            $row = array (
                'Bât.' => (isset($depannage->Logement) && isset($depannage->Logement->NumBatiment)) ? $depannage->Logement->NumBatiment : null,
                'Esc.' => (isset($depannage->Logement) && isset($depannage->Logement->NumEscalier)) ? $depannage->Logement->NumEscalier : null,
                'Réf. client' => (isset($depannage->Occupant) && isset($depannage->Occupant->Ref)) ? $depannage->Occupant->Ref : null,
                'Etage'  => (isset($depannage->Logement) && isset($depannage->Logement->NumEtage)) ? $depannage->Logement->NumEtage : null,
                'Logt'  => (isset($depannage->Logement) && isset($depannage->Logement->NumOrdre)) ? $depannage->Logement->NumOrdre : null,
                'Nom occupant'  => (isset($depannage->Occupant) && isset($depannage->Occupant->Nom)) ? $depannage->Occupant->Nom : null,
                'N° dépannage' => (isset($depannage->Depannage) && isset($depannage->Depannage->Numero)) ? $depannage->Depannage->Numero : null,
                'Statut' => (isset($depannage->Depannage) && isset($depannage->Depannage->Statut)) ? $depannage->Depannage->Statut : null,
                'Date' => (isset($depannage->Depannage) && isset($depannage->Depannage->Date)) ? date_create($depannage->Depannage->Date)->format('d/m/Y H:i:s') : null,
                'Motif' => (isset($depannage->Depannage) && isset($depannage->Depannage->Motif)) ? $depannage->Depannage->Motif : null,
                'CompteRendu' => (isset($depannage->Depannage) && isset($depannage->Depannage->CompteRendu)) ? $depannage->Depannage->CompteRendu : null,
            );
            $data[] = $row;
        }

        return $data;
    }
}