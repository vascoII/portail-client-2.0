<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;

/**
 * Accès aux informations utilisateur (web_user) côté Oracle,
 * pour reproduire la logique de GetUserByPk (C#) au niveau FKCLIENT.
 */
class UserRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {
    }

    /**
     * Retourne le FKCLIENT associé à un utilisateur (PKWEB_USER),
     * en gérant les cas:
     *  - C: FKCLIENT lu directement
     *  - G: remonte au parent (FKPARENTUSER) puis FKCLIENT
     *
     * @return int|null
     */
    public function getFkClientForUser(int $pkUser): ?int
    {
        $visited = [];

        while (true) {
            // Protection boucle infinie
            if (\in_array($pkUser, $visited, true)) {
                return null;
            }
            $visited[] = $pkUser;

            $rows = $this->oci->fetchAllAssoc(
                'SELECT PKWEB_USER, USERTYPE, FKCLIENT, FKPARENTUSER FROM LER_AUTH_DEV.WEB_USER WHERE PKWEB_USER = :pkUser',
                ['pkUser' => $pkUser]
            );

            if (empty($rows)) {
                return null;
            }

            $row = $rows[0];
            $userType = $row['USERTYPE'] ?? null;

            if ($userType === 'C') {
                return isset($row['FKCLIENT']) ? (int) $row['FKCLIENT'] : null;
            }

            if ($userType === 'G') {
                if (!isset($row['FKPARENTUSER'])) {
                    return null;
                }

                // On remonte au parent user (qui est un C)
                $pkUser = (int) $row['FKPARENTUSER'];
                continue;
            }

            // Pour les autres types (O, etc.), on ne gère pas ici
            return null;
        }
    }
}

