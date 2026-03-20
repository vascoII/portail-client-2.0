<?php

namespace App\Repository\Oracle\Techem;

use App\Oracle\OciFacade;
use App\Repository\Oracle\Techem\UserRepository;

class TableauBordClientRepository
{
    public function __construct(
        private readonly OciFacade $oci,
        private readonly UserRepository $userRepository,
    ) {}

    /**
     * Version SQL (WS2) du tableau de bord client, inspirée de
     * WS_Common.GetTableauBordClient (branche #if WS2).
     *
     * L'objectif est surtout pédagogique : montrer comment traduire la logique
     * C# / DataTable en agrégations SQL Oracle via OciFacade.
     *
     * @return array<string, mixed>
     */
    public function getMyTableauBordClient(int $pkUser, string $sessionId): array
    {
        // 1) Récupérer la "liste des immeubles" visibles pour cet utilisateur,
        // en SQL, en s'inspirant de GetQueryImmeubles(Fields, "U", User.PKUser) (branche WS2).

        [
            $sqlImmeubles,
            $paramsImmeubles,
        ] = $this->buildImmeublesQueryForUser(
            fields: <<<'SQL'
web_immeuble.pkimmeuble,
web_immeuble.telereleve,
web_immeuble.nbec,
web_immeuble.nbef,
web_immeuble.nbrepart,
web_immeuble.nbcet,
web_immeuble.nbcapteur,
web_immeuble.nblogement,
web_immeuble.nbdepannages,
web_immeuble.nbfuites,
web_immeuble.nbfuites_ec,
web_immeuble.nbfuites_ef,
web_immeuble.nbalarms,
web_immeuble.nbsusfraudcli,
web_immeuble.nbano_ec,
web_immeuble.nbano_ef,
web_immeuble.nbchantiers
SQL,
            pkUser: $pkUser,
        );

        $immeubles = $this->oci->fetchAllAssoc($sqlImmeubles, $paramsImmeubles);

        if ($immeubles === []) {
            return [
                'Erreur' => null,
                'NbImmeubles' => 0,
                'NbImmeublesTelereleve' => 0,
                'NbCompteursARelever' => 0,
                'NbCompteursReleves' => 0,
                'NbLogements' => 0,
                'NbChantiers' => 0,
                'NbCompteursPoses' => 0,
                'NbCompteursCommandes' => 0,
                'NbCompteursEC' => 0,
                'NbCompteursEF' => 0,
                'NbCompteursRepart' => 0,
                'NbCompteursCET' => 0,
                'NbCompteursCapteur' => 0,
                'NbCompteurs' => 0,
                'NbFuites' => 0,
                'NbDepannages' => 0,
                'NbDysfonctionnements' => 0,
                'NbAnomalies' => 0,
            ];
        }

        $nbImmeubles = \count($immeubles);
        $nbImmeublesTelereleve = 0;
        $nbLogements = 0;
        $nbCompteursEC = 0;
        $nbCompteursEF = 0;
        $nbCompteursRepart = 0;
        $nbCompteursCET = 0;
        $nbCompteursCapteur = 0;
        $nbFuites = 0;
        $nbDepannages = 0;
        $nbDysfonctionnements = 0;
        $nbAnomalies = 0;
        $nbChantiers = 0;

        foreach ($immeubles as $imm) {
            if (($imm['TELERELEVE'] ?? null) === 'O') {
                $nbImmeublesTelereleve++;
            }

            $nbLogements += (int)($imm['NBLOGEMENT'] ?? 0);
            $nbCompteursEC += (int)($imm['NBEC'] ?? 0);
            $nbCompteursEF += (int)($imm['NBEF'] ?? 0);
            $nbCompteursRepart += (int)($imm['NBREPART'] ?? 0);
            $nbCompteursCET += (int)($imm['NBCET'] ?? 0);
            $nbCompteursCapteur += (int)($imm['NBCAPTEUR'] ?? 0);

            // Fuites: NBFUITES_EC + NBFUITES_EF
            $nbFuites += (int)($imm['NBFUITES_EC'] ?? 0);
            $nbFuites += (int)($imm['NBFUITES_EF'] ?? 0);

            $nbDepannages += (int)($imm['NBDEPANNAGES'] ?? 0);
            $nbDysfonctionnements += (int)($imm['NBSUSFRAUDCLI'] ?? 0);

            // Anomalies: NBANO_EC + NBANO_EF
            $nbAnomalies += (int)($imm['NBANO_EC'] ?? 0);
            $nbAnomalies += (int)($imm['NBANO_EF'] ?? 0);

            $nbChantiers += (int)($imm['NBCHANTIERS'] ?? 0);
        }

        $nbCompteursTotal = $nbCompteursEC + $nbCompteursEF + $nbCompteursRepart + $nbCompteursCET;

        // 2) Reproduire la logique GetInfosRatioReleveImmeubles("U", User.PKUser, "")
        //
        // SQL WS2 :
        //   SELECT SUM(nbcompteursreleves), SUM(nbcompteursarelever)
        //   FROM (
        //     SELECT ..., RANK() OVER(PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) rnk
        //     FROM web_releve
        //     WHERE fkimmeuble in (GetQueryImmeubles("PKIMMEUBLE", TypeConteneur, PkConteneur))
        //       AND (filtre éventuel sur typeERC)
        //   )
        //   WHERE rnk = 1;

        // On réutilise ici tous les pkimmeuble de la requête précédente.
        $pkImmeubles = array_column($immeubles, 'PKIMMEUBLE');
        $pkImmeubles = array_values(array_filter($pkImmeubles, static fn ($v) => $v !== null));

        $nbCompteursARelever = 0;
        $nbCompteursReleves = 0;

        if ($pkImmeubles !== []) {
            $placeholders = [];
            $params = [];
            foreach ($pkImmeubles as $idx => $pk) {
                $paramName = ':imm' . $idx;
                $placeholders[] = $paramName;
                $params[$paramName] = (int)$pk;
            }

            $inClause = implode(',', $placeholders);

            $sqlRatio = <<<SQL
SELECT
    SUM(nbcompteursreleves) AS NBCOMPTEURSRELEVES,
    SUM(nbcompteursarelever) AS NBCOMPTEURSARELEVER
FROM (
    SELECT
        pkreleve,
        nbcompteursreleves,
        nbcompteursarelever,
        RANK() OVER (PARTITION BY fkimmeuble, typeerc ORDER BY datereleve DESC) AS rnk
    FROM web_releve
    WHERE fkimmeuble IN ($inClause)
)
WHERE rnk = 1
SQL;

            $rowsRatio = $this->oci->fetchAllAssoc($sqlRatio, $params);
            if ($rowsRatio !== [] && isset($rowsRatio[0])) {
                $row = $rowsRatio[0];
                $nbCompteursARelever = (int)($row['NBCOMPTEURSARELEVER'] ?? 0);
                $nbCompteursReleves = (int)($row['NBCOMPTEURSRELEVES'] ?? 0);
            }
        }

        // 3) Retourner une structure proche de tableauDeBordClient

        return [
            'Erreur' => null,
            'NbImmeubles' => $nbImmeubles,
            'NbImmeublesTelereleve' => $nbImmeublesTelereleve,
            'NbCompteursARelever' => $nbCompteursARelever,
            'NbCompteursReleves' => $nbCompteursReleves,
            'NbLogements' => $nbLogements,
            // Approximation : NbChantiers / posés / commandés à affiner plus tard
            'NbChantiers' => $nbChantiers,
            'NbCompteursPoses' => 0,
            'NbCompteursCommandes' => 0,
            'NbCompteursEC' => $nbCompteursEC,
            'NbCompteursEF' => $nbCompteursEF,
            'NbCompteursRepart' => $nbCompteursRepart,
            'NbCompteursCET' => $nbCompteursCET,
            'NbCompteursCapteur' => $nbCompteursCapteur,
            'NbCompteurs' => $nbCompteursTotal,
            'NbFuites' => $nbFuites,
            'NbDepannages' => $nbDepannages,
            'NbDysfonctionnements' => $nbDysfonctionnements,
            'NbAnomalies' => $nbAnomalies,
        ];
    }

    /**
     * Approximation PHP de GetQueryImmeubles(Fields, "U", PkUser) (branche WS2),
     * limitée au cas où l'utilisateur est rattaché à un client (type "C" ou "G").
     *
     * On s'appuie sur UserRepository::getFkClientForUser pour remonter au FKCLIENT
     * et on reproduit le connect by sur la hiérarchie web_client.
     *
     * @return array{0: string, 1: array<string, mixed>} [sql, params]
     */
    private function buildImmeublesQueryForUser(string $fields, int $pkUser): array
    {
        $fkClient = $this->userRepository->getFkClientForUser($pkUser);

        // Si on ne parvient pas à déterminer un client, on retombe sur
        // tous les immeubles non "P" (comportement dégradé mais simple).
        if ($fkClient === null) {
            $sql = <<<SQL
SELECT
    {$fields}
FROM web_immeuble
WHERE SUBSTR(web_immeuble.id, 1, 1) <> 'P'
SQL;

            return [$sql, []];
        }

        // Cas principal : user client (ou gestionnaire relié à un client),
        // équivalent au "type == C" de GetQueryImmeubles WS2.
        $sql = <<<SQL
SELECT
    {$fields}
FROM web_immeuble
WHERE
    web_immeuble.fkclient IN (
        SELECT web_client.pkclient
        FROM web_client
        START WITH web_client.pkclient = :fkClient
        CONNECT BY web_client.fkclient = PRIOR web_client.pkclient
    )
    AND SUBSTR(web_immeuble.id, 1, 1) <> 'P'
SQL;

        return [$sql, ['fkClient' => $fkClient]];
    }
}
