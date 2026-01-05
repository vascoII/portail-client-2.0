<?php

namespace App\Service;

/**
 * Class GetParams
 * @package App\Service
 */
class GetParams
{

    /**
     * @param array $params
     * @return string
     */
    public function convertParamsArrayToParamsFiltresString(array $params)
    {
        $data = array();
        foreach ($params as $key => $value) {
            $data[] = $key . '=' . $value;
        }

        return implode('|', $data);
    }
}