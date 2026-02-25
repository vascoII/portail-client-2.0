<?php

namespace App\Service\Api;

class ApiBaseService 
{
    protected function checkUserHasAccessToImmeuble(int $pkUser, int $pkImmeuble): void
    {
        if ($pkUser !== 206437) {
            throw new \Exception("L'utilisateur n'a pas accès à cet immeuble.");
        }
    }

}

