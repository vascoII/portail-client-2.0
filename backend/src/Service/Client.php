<?php

namespace App\Service;

use App\Model\Account;
use App\Service\BaseClient;
use Symfony\Component\DependencyInjection\Exception\RuntimeException;

/**
 * Class Client
 */
class Client extends BaseClient
{

    /**
     * Récupère la liste d'immeuble d'un utilisateur
     *
     * @param int                $pkUser
     * @param GetImmeublesParams $params
     * @param bool               $use_cache
     *
     * @return array
     */
    public
    function getImmeubles($pkUser, ?GetImmeublesParams $params = null, $use_cache = true)
    {
        if (!$params) {
            $params              = new GetImmeublesParams();
            $params->NBLOGEMENTS = true;
        }

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkUserChild'   => (int) $pkUser,
            'ParamsFiltres' => $params->toParamsFiltresString(),
            'ParamsInfos'   => $params->toParamsInfosString(),
        ];

        $result = $this->sendRequest('GetInfosImmeubles', $request, $use_cache);

        if (!isset($result->ListeInfosImmeubles) || !isset($result->ListeInfosImmeubles->infosImmeuble)) {
            return [];
        }

        if (!is_array($result->ListeInfosImmeubles->infosImmeuble)) {
            $result->ListeInfosImmeubles->infosImmeuble = [$result->ListeInfosImmeubles->infosImmeuble];
        }

        return $result->ListeInfosImmeubles->infosImmeuble;
    }


    public
    function getImmeubles4gestio($pkUser, ?GetImmeublesParams $params = null, $use_cache = true)
    {
        if (!$params) {
            $params              = new GetImmeublesParams();
            $params->NBLOGEMENTS = true;
        }

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkUserChild'   => (int) $pkUser,
            'ParamsFiltres' => $params->toParamsFiltresString(),
            'ParamsInfos'   => $params->toParamsInfosString(),
        ];

        $result = $this->sendRequest('GetInfosImmeubles', $request, $use_cache);

        if (!isset($result->ListeInfosImmeubles) || !isset($result->ListeInfosImmeubles->infosImmeuble)) {
            return [];
        }

        if (!is_array($result->ListeInfosImmeubles->infosImmeuble)) {
            $result->ListeInfosImmeubles->infosImmeuble = [$result->ListeInfosImmeubles->infosImmeuble];
        }

        return $result->ListeInfosImmeubles->infosImmeuble;
    }

    /**
     * Récupère la liste des immeubles rattachés
     *
     * @param GetImmeublesParams|null $params
     *
     * @return array
     */
    public
    function getMyImmeubles(?GetImmeublesParams $params = null)
    {
        return $this->getImmeubles(-1, $params);
    }

    /**
     * Récupère la liste des immeubles rattachés
     *
     * @param GetImmeublesParams|null $params
     *
     * @return array
     */
    public
    function getMyImmeubles4gestio(?GetImmeublesParams $params = null)
    {
        return $this->getImmeubles4gestio(-1, $params);
    }


    /**
     * Récupère le tableau de bord de l'immeuble
     *
     * @param $pkImmeuble
     *
     * @throws RuntimeException
     * @return object
     */
    public function getTableauBordImmeuble($pkImmeuble)
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkImmeuble' => (int) $pkImmeuble,
        ];

        $result = $this->sendRequest('GetTableauBordImmeuble', $request);

        $keys = [
            'SerieConsosEC',
            'SerieConsosEF',
            'SerieConsosEAU',
            'SerieConsosRepart',
            'SerieConsosEnergie',
            'SerieConsosElect',
            'SerieConsosGaz',
            'SerieConsosCompteurGeneral',
        ];

        foreach ($keys as $key) {
            $result->{$key . 'Values'} = [];
            if (isset($result->Erreur) && empty($result->Erreur) && isset($result->{$key}->ValeursXYL)) {
                $result->{$key . 'Values'} = $this->parseSerie($result->{$key}->ValeursXYL);
            }
        }
        //TODO
        if ($result->ImmeubleEC->NbCompteursARelever > 0) {
            $result->PcCompteursTelereveleOK = round(($result->ImmeubleEC->NbCompteursReleves / $result->ImmeubleEC->NbCompteursARelever) * 100, 2);
        } else {
            $result->PcCompteursTelereveleOK = 100;
        }
        $this->setRatioCompteurs($result);

        return $result;
    }

    /**
     * @param $result
     */
    private function setRatioCompteurs($result)
    {
        $keys = [
            'NbDepannages',
            'NbDysfonctionnements',
            //            'NbFuites',
            //            'NbAnomalies',
        ];

        foreach ($keys as $key) {
            if ($result->{$key} > 0) {
                if ($result->NbAppareils > 0) {
                    $result->{'Ratio' . $key} = $result->{$key} / $result->NbAppareils;
                } else {
                    $result->{'Ratio' . $key} = 1;
                }
            } else {
                $result->{'Ratio' . $key} = 0;
            }
        }
    }

    /**
     * @return object
     */
    public function getMyTableauBordClient()
    {
        return $this->getTableauBordClient($this->getSessionId(), $this->getPkUser());
    }

    /**
     * @param $pkUser
     *
     * @return object
     */
    public function getTableauBordClientAsAdmin($pkUser)
    {
        return $this->getTableauBordClient($this->adminSessionId, $pkUser);
    }

    /**
     * Récupère le tableau de bord du parc pour un utilisateur
     *
     * @param $sessionId
     * @param $pkUser
     *
     * @return object
     */
    public function getTableauBordClient($sessionId, $pkUser)
    {
        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser'    => (int) $pkUser,
        ];

        $board = $this->sendRequest('GetTableauBordClient', $request);

        if ($board->NbCompteursARelever > 0) {
            $PcImmeublesTelereleve = (100 * $board->NbCompteursReleves) / $board->NbCompteursARelever;
        } else {
            $PcImmeublesTelereleve = 100;
        }

        if ($board->NbImmeubles > 0) {
            $PcImmeublesTransfertFichiers = (100 * $board->NbImmeublesTransfertFichiers) / $board->NbImmeubles;
        } else {
            $PcImmeublesTransfertFichiers = 100;
        }

        $board->PcImmeublesTelereleve        = number_format($PcImmeublesTelereleve);
        $board->PcImmeublesTransfertFichiers = number_format($PcImmeublesTransfertFichiers);

        return $board;
    }

    /**
     * Récupère la liste des logements rattachés à un immeuble
     *
     * @param                                                     $pkImmeuble
     * @param \App\Service\GetLogementsParams $params
     *
     * @return mixed
     */
    public function getLogements($pkImmeuble, ?GetLogementsParams $params = null)
    {
        if (!$params) {
            $params = new GetLogementsParams();
        }

        $request = [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ParamsFiltres' => $params->toParamsFiltresString(),
            'ParamsInfos'   => $params->toParamsInfosString(),
        ];

        if ($pkImmeuble !== -1) {
            $request['PkImmeuble'] = (int) $pkImmeuble;
            $result                = $this->sendRequest('GetInfosLogementsByImmeuble', (object) $request, false);
        } else {
            $result = $this->sendRequest('GetInfosLogements', (object) $request);
        }

        if (!isset($result->ListeInfosLogements) || !isset($result->ListeInfosLogements->infosLogement)) {
            $result->ListeInfosLogements = (object) [
                'infosLogement' => [],
            ];
        }

        if (!is_array($result->ListeInfosLogements->infosLogement)) {
            $result->ListeInfosLogements->infosLogement = [$result->ListeInfosLogements->infosLogement];
        }

        foreach ($result->ListeInfosLogements->infosLogement as $logement) {
            if (!isset($logement->ListeAppareils) || !isset($logement->ListeAppareils->appareil)) {
                $logement->ListeAppareils = (object) [
                    'appareil' => [],
                ];
            }

            if (isset($logement->ListeAppareils->appareil) && !is_array($logement->ListeAppareils->appareil)) {
                $logement->ListeAppareils->appareil = [$logement->ListeAppareils->appareil];
            }
        }

        return $result->ListeInfosLogements->infosLogement;
    }

    /**
     * @param $pkLogement
     *
     * @return mixed
     */
    public function getTableauBordLogement($pkLogement)
    {
        return $this->getTableauBordLogementOccupant($pkLogement, -1);
    }

    /**
     * @param $pkOccupant
     *
     * @return mixed
     */
    public function getTableauBordOccupant($pkOccupant)
    {
        return $this->getTableauBordLogementOccupant(-1, $pkOccupant);
    }

    /**
     * Récupère le tableau de bord du logement
     *
     * @param $pkLogement
     * @param $pkOccupant
     *
     * @return mixed
     */
    public function getTableauBordLogementOccupant($pkLogement, $pkOccupant)
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement' => (int) $pkLogement,
            'PkOccupant' => (int) $pkOccupant,
        ];

        $result = $this->sendRequest('GetTableauBordLogement', $request);

        $keys = [
            'LogementEC'     => 'SerieConsos',
            'LogementEF'     => 'SerieConsos',
            'LogementRepart' => 'SerieConsosDJU',
            'LogementCET'    => 'SerieConsosDJU',
            'LogementElect'  => 'SerieConsos',
            'LogementGaz'    => 'SerieConsos',
        ];

        foreach ($keys as $key => $value) {
            $result->{$key . 'Values'} = [];
            if (isset($result->Erreur) && empty($result->Erreur) && isset($result->{$key}) && isset($result->{$key}->{$value}->ValeursXYL)) {
                $result->{$key . 'Values'} = $this->parseSerie($result->{$key}->{$value}->ValeursXYL);
            }
        }

        $this->setRatioCompteurs($result);

        return $result;
    }

    /**
     * @param      $data
     * @param null $key
     *
     * @return array[]|array
     */
    private function parseSerie($data, $key = null)
    {
        if (empty($data)) {
            return [];
        }

        $result = [];

        $series = explode(';', $data);

        foreach ($series as $serie) {
            if (is_null($key)) {
                $result[] = explode('|', $serie);
            } else {
                $result[$key] = explode('|', $serie);
            }
        }

        return $result;
    }

    /**
     * Récupère les relevés d'un immeuble
     *
     * @param                                                       $pkImmeuble
     * @param null|\App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getReportImmeuble($pkImmeuble, $type, $energie, $pkReleve, ?GetReportParams $params = null)
    {
        if (is_null($params)) {
            $params = new GetReportParams();
        }

        $params->PKRELEVE   = $pkReleve;

        $reportType = !is_null($type) ? $type . '_' : '';
        $reportType .= !is_null($energie) ? $energie . '_' : '';
        $reportType .= 'IMMEUBLE';

        if ($type == 'NOTE') {
            $reportType = 'NOTE_INFO_MENSUELLE';
            $params = new GetReportParams();
            if ($energie == 'EAU') {
                $params->PKIMMEUBLE = $pkImmeuble;
            }
            if ($energie == 'CHAUFFAGE') {
                $params->PKIMMEUBLE = $pkImmeuble . '|NOTEEC=N';
            }
        }


        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ReportType'    => $reportType,
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];
        $result = $this->sendRequest('GetReport', $request, false);

        return $result;
    }

    /**
     * Récupère les relevés d'un immeuble
     *
     * @param                                                       $pkImmeuble
     * @param null|\App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getReportImmeubleExcel($pkImmeuble, $type, $energie, $pkReleve, ?GetReportParams $params = null)
    {
        if (is_null($params)) {
            $params = new GetReportParams();
        }

        $params->PKRELEVE   = $pkReleve;

        $reportType = !is_null($type) ? $type . '_' : '';
        $reportType .= !is_null($energie) ? $energie . '_' : '';
        $reportType .= 'IMMEUBLE';

        if ($type == 'NOTE') {
            $reportType = 'NOTE_INFO_MENSUELLE';
            $params = new GetReportParams();
            if ($energie == 'EAU') {
                $params->PKIMMEUBLE = $pkImmeuble;
            }
            if ($energie == 'CHAUFFAGE') {
                $params->PKIMMEUBLE = $pkImmeuble . '|NOTEEC=N';
            }
        }


        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ReportType'    => "RELEVE",
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];
        $result = $this->sendRequest('GetExcel', $request, false);

        return $result;
    }

    /**
     * Récupère un fichier
     *
     * @param $file
     *
     * @return mixed
     */
    public function getFile($file)
    {

        $request = (object) [
            'superLoginID'  => $this->superLoginID,
            'superPassword' => $this->superPassword,
            'FileName'      => $file,
        ];

        $result = $this->sendRequest('GetFile', $request, false);

        return $result;
    }

    /**
     * Récupère un relevé
     *
     * @param \App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getReport($type, GetReportParams $params)
    {
        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) ($this->getPkUser()),
            'ReportType'    => $type,
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];

        return $this->sendRequest('GetReport', $request, false);
    }

    /**
     * Récupère un relevé
     *
     * @param \App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getExcel($type, GetReportParams $params)
    {
        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ReportType'    => $type,
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];

        $result = $this->sendRequest('GetExcel', $request, false);

        return $result;
    }


    /**
     * Récupère le relevé d'un occupant
     *
     * @param                                                       $pkOccupant
     * @param null|\App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getReportOccupant($pkImmeuble, $pkOccupant, $type, ?GetReportParams $params = null)
    {
        if (is_null($params)) {
            $params = new GetReportParams();
        }
        $params->PKOCCUPANT = $pkOccupant;
        if ($type == 'REPART') {
            $params->PKIMMEUBLE = $pkImmeuble;
        }

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ReportType'    => $type . '_OCCUPANT',
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];

        $result = $this->sendRequest('GetReport', $request, false);

        return $result;
    }

    /**
     * Récupère le relevé d'un occupant
     *
     * @param                                                       $pkImmeuble
     * @param                                                       $pkLogement
     * @param null|\App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getReportLogement($pkImmeuble, $pkLogement, $type, ?GetReportParams $params = null)
    {
        if (is_null($params)) {
            $params = new GetReportParams();
        }
        $params->PKIMMEUBLE = $pkImmeuble;
        $params->PKOCCUPANT = $pkLogement;

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ReportType'    => $type . '_LOGEMENT',
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];

        $result = $this->sendRequest('GetReport', $request, false);

        return $result;
    }

    /**
     * Récupère le relevé d'un dépannage
     *
     * @param                                                       $pkDepannage
     * @param null|\App\Service\GetReportParams $params
     *
     * @return mixed
     */
    public function getReportDepannage($pkDepannage, ?GetReportParams $params = null)
    {

        if (is_null($params)) {
            $params = new GetReportParams();
        }
        $params->WORKORDERNUMBER = $pkDepannage;

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'ReportType'    => 'INTERVENTION',
            'ParamsFiltres' => $params->toParamsFiltresString(),
        ];

        $result = $this->sendRequest('GetReport', $request, false);

        return $result;
    }

    /**
     * Récupère la liste des dépannages d'un immeuble
     *
     * @param      $pkImmeuble
     * @param null $pkLogement
     * @param null $pkOccupant
     *
     * @return mixed
     */
    public function getInterventionsImmeuble($pkImmeuble, $pkLogement = null, $pkOccupant = null)
    {
        $paramsFiltres = [];

        if (!is_null($pkLogement)) {
            $paramsFiltres['PKLOGEMENT'] = $pkLogement;
            if (!is_null($pkOccupant)) {
                $paramsFiltres['PKOCCUPANT'] = $pkOccupant;
            }
        }

        $params = new GetParams();

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkImmeuble'    => (int) $pkImmeuble,
            'ParamsFiltres' => $params->convertParamsArrayToParamsFiltresString($paramsFiltres),
        ];

        $result = $this->sendRequest('GetInfosDepannagesByImmeuble', $request);

        if (!isset($result->ListeInfosDepannages) || !isset($result->ListeInfosDepannages->infosDepannage)) {
            return [];
        }

        if (!is_array($result->ListeInfosDepannages->infosDepannage)) {
            $result->ListeInfosDepannages->infosDepannage = [$result->ListeInfosDepannages->infosDepannage];
        }

        return $result->ListeInfosDepannages->infosDepannage;
    }

    /**
     * Détail d'un dépannage
     *
     * @param $pkDepannage
     *
     * @return mixed
     */
    public function getDetailDepannage($pkDepannage)
    {
        $request = (object) [
            'SessionID'   => $this->getSessionId(),
            'PkUser'      => (int) $this->getPkUser(),
            'WorkOrderNumber' => (string) $pkDepannage,
        ];

        $result = $this->sendRequest('GetDetailsDepannage', $request, false);

        if (!isset($result->ListeDepannagesOccupant) || !isset($result->ListeDepannagesOccupant->depannage)) {
            $result->ListeDepannagesOccupant = (object) [
                'depannage' => [],
            ];
        }

        if (!is_array($result->ListeDepannagesOccupant->depannage)) {
            $result->ListeDepannagesOccupant->depannage = [$result->ListeDepannagesOccupant->depannage];
        }

        return $result;
    }

    /**
     * Récupère les fuites d'un immeuble
     *
     * @param      $pkImmeuble
     * @param      $pkLogement
     * @param null $pkAppareil
     * @param null $pkOccupant
     *
     * @return array
     */
    public function getFuitesImmeuble($pkImmeuble, $pkLogement = null, $pkAppareil = null, $pkOccupant = null)
    {
        $paramsFiltres = [];

        if (!is_null($pkLogement)) {
            $paramsFiltres['PKLOGEMENT'] = $pkLogement;
            if (!is_null($pkOccupant)) {
                $paramsFiltres['PKOCCUPANT'] = $pkOccupant;
            }
        }
        if (!is_null($pkAppareil)) {
            $paramsFiltres['PKappareil'] = $pkAppareil;
        }

        $params = new GetParams();

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkImmeuble'    => (int) $pkImmeuble,
            'ParamsFiltres' => $params->convertParamsArrayToParamsFiltresString($paramsFiltres),
        ];

        $result = $this->sendRequest('GetInfosFuitesByImmeuble', $request);

        if (!isset($result->ListeInfosFuites) || !isset($result->ListeInfosFuites->infosFuite)) {
            return [];
        }

        if (!is_array($result->ListeInfosFuites->infosFuite)) {
            $result->ListeInfosFuites->infosFuite = [$result->ListeInfosFuites->infosFuite];
        }

        foreach ($result->ListeInfosFuites->infosFuite as $fuite) {
            $fuite->degree = 'gray'; // Gravité de la fuite
            //            $fuite->degree = 'red';
            //            $fuite->degree = 'black';
        }

        return $result->ListeInfosFuites->infosFuite;
    }

    /**
     * Récupère les appareils du logement / occupant
     *
     * @param $pkLogement
     * @param $pkOccupant
     *
     * @return array
     */
    public function getInfosAppareils($pkLogement, $type, $typeAppareil, $pkOccupant = -1)
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement' => (int) $pkLogement,
        ];

        $result = $this->sendRequest('GetInfosAppareilsByLogement' . $type, $request);

        if (!isset($result->ListeInfosAppareils) || !isset($result->ListeInfosAppareils->{'infosAppareil' . $typeAppareil})) {
            $result->ListeInfosAppareils = (object) [
                'infosAppareil' . $typeAppareil => [],
            ];
        }

        if (!is_array($result->ListeInfosAppareils->{'infosAppareil' . $typeAppareil})) {
            $result->ListeInfosAppareils->{'infosAppareil' . $typeAppareil} = [$result->ListeInfosAppareils->{'infosAppareil' . $typeAppareil}];
        }

        return $result;
    }

    /**
     * Récupère les appareils Eau du logement / occupant
     *
     * @param $pkLogement
     * @param $pkOccupant
     *
     * @return array
     */
    public function getInfosAppareilsType($pkLogement, $types, $pkOccupant = -1)
    {

        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement' => (int) $pkLogement,
        ];

        $appareils = [];

        foreach ($types as $type => $name) {

            $infoAppareil = 'infosAppareil' . $name;

            $result = $this->sendRequest('GetInfosAppareilsByLogement' . $type, $request);

            if (!isset($result->ListeInfosAppareils) || !isset($result->ListeInfosAppareils->{$infoAppareil})) {
                continue;
            }

            if (is_array($result->ListeInfosAppareils->{$infoAppareil})) {
                foreach ($result->ListeInfosAppareils->{$infoAppareil} as $appareil) {
                    $appareils[] = $appareil;
                }
            } else {
                $appareils[] = $result->ListeInfosAppareils->{$infoAppareil};
            }
        }

        return $appareils;
    }

    /**
     * Récupère l'utilisateur
     *
     * @param $pkUser
     *
     * @return mixed
     */
    public function getUser($pkUser)
    {
        $request = (object) [
            'SessionID'   => $this->getSessionId(),
            'PkUser'      => (int) $this->getPkUser(),
            'PkUserChild' => (int) $pkUser,
        ];

        $result = $this->sendRequest('GetUser', $request, false);

        return $result;
    }

    /**
     * Liste des gestionnaires ?
     * @return mixed
     */
    public function getUsers()
    {
        $request = (object) [
            //            'superLoginID' => '',
            //            'superPassword' => '',
            'ParamsFiltres' => '',
        ];

        $result = $this->sendRequest('GetUsers', $request, false);

        if (!isset($result->ListeUsers) || !isset($result->ListeUsers->user)) {
            return [];
        }

        if (!is_array($result->ListeUsers->user)) {
            $result->ListeUsers->user = [$result->ListeUsers->user];
        }

        return $result->ListeUsers->user;
    }

    /**
     * Liste des gestionnaires
     */
    public function getGestionnaires()
    {
        $request = (object) [
            'SessionID' => $this->getSessionId(),
            'PkUser'    => (int) $this->getPkUser(),
            'type'      => 'G',
        ];

        $result = $this->sendRequest('GetChildUsers', $request, false);

        if (!isset($result->ListeUsers) || !isset($result->ListeUsers->user)) {
            return [];
        }

        if (!is_array($result->ListeUsers->user)) {
            $result->ListeUsers->user = [$result->ListeUsers->user];
        }

        return $result->ListeUsers->user;
    }

    /**
     * Création d'un gestionnaire
     *
     * @param \App\Model\Account $account
     *
     * @return mixed
     */
    public function createGestionnaire(Account $account)
    {
        $request = (object) [
            'SessionID'   => $this->getSessionId(),
            'PkUser'      => (int) $this->getPkUser(),
            'LoginID'     => $account->email,
            'UserName'    => $account->lastname,
            'FirstName'   => $account->firstname,
            'PhoneNumber' => $account->phone,
            'Email'       => $account->email,
            'UserRole'    => $account->job,
        ];

        $result = $this->sendRequest('CreateGestionnaire', $request, false);

        return $result;
    }

    /**
     * @param                                        $pkUser
     * @param \App\Model\Account $account
     *
     * @return mixed
     */
    public function updateGestionnaire($pkUser, Account $account)
    {
        $request = (object) [
            'SessionID'   => $this->getSessionId(),
            'PkUser'      => (int) $this->getPkUser(),
            'PkUserChild' => (int) $pkUser,
            'LoginID'     => $account->email,
            'UserName'    => $account->lastname,
            'FirstName'   => $account->firstname,
            'PhoneNumber' => $account->phone,
            'Email'       => $account->email,
            'UserRole'    => $account->job,
        ];

        $result = $this->sendRequest('UpdateUser', $request, false);

        return $result;
    }

    /**
     * @param $pkUser
     * @param $password
     *
     * @return mixed
     */
    public function updatePassword($pkUser, $password)
    {
        $request = (object) [
            'SessionID'   => $this->getSessionId(),
            'PkUser'      => (int) $this->getPkUser(),
            'PkUserChild' => (int) $pkUser,
            'Password'    => $password,
        ];

        $result = $this->sendRequest('UpdatePassword', $request, false);

        return $result;
    }

    /**
     * Suppression d'un utilisateur
     *
     * @param $pkUser
     *
     * @return mixed
     */
    public function deleteUser($pkUser)
    {
        $request = (object) [
            'SessionID'   => $this->getSessionId(),
            'PkUser'      => (int) $this->getPkUser(),
            'PkUserChild' => (int) $pkUser,
        ];

        $result = $this->sendRequest('DeleteUser', $request, false);

        return $result;
    }

    /**
     * Affectation d'immeubles
     *
     * @param $pkUserChild
     * @param $listImmeubles
     *
     * @return mixed
     */
    public function setImmeubles($pkUserChild, $listImmeubles)
    {
        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkUserChild'   => (int) $pkUserChild,
            'ListImmeubles' => $listImmeubles,
        ];

        $result = $this->sendRequest('SetImmeubles', $request, false);

        return $result;
    }

    /**
     * @param $email
     *
     * @return mixed
     */
    public function resetPasswordFromEmail($email)
    {
        $request = (object) [
            'SessionID' => $this->adminSessionId,
            'PkUser'    => -1,
            'Email'     => $email,
        ];

        $result = $this->sendRequest('ResetPasswordFromEmail', $request, false);

        return $result;
    }

    /**
     * @param $pkUser
     *
     * @return mixed
     */
    public function resetPasswordFromUser($pkUser)
    {
        $request = (object) [
            //            'superLoginID' => '',
            //            'superPassword' => '',
            'PKUser' => (int) $pkUser,
        ];

        $result = $this->sendRequest('ResetPasswordFromPKUser', $request, false);

        return $result;
    }

    /**
     * @param      $pkImmeuble
     * @param null $pkLogement
     * @param null $pkAppareil
     * @param null $pkOccupant
     *
     * @return mixed
     */
    public function getAnomaliesImmeuble($pkImmeuble, $pkLogement = null, $pkAppareil = null, $pkOccupant = null)
    {
        $paramsFiltres = [];

        if (!is_null($pkLogement)) {
            $paramsFiltres['PKLOGEMENT'] = $pkLogement;
            if (!is_null($pkOccupant)) {
                $paramsFiltres['PKOCCUPANT'] = $pkOccupant;
            }
        }
        if (!is_null($pkAppareil)) {
            $paramsFiltres['PKappareil'] = $pkAppareil;
        }

        $params = new GetParams();

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkImmeuble'    => (int) $pkImmeuble,
            'ParamsFiltres' => $params->convertParamsArrayToParamsFiltresString($paramsFiltres),
        ];

        $result = $this->sendRequest('GetInfosAnomaliesByImmeuble', $request);

        if (!isset($result->ListeInfosAnomalies) || !isset($result->ListeInfosAnomalies->infosAnomalie)) {
            return [];
        }

        if (!is_array($result->ListeInfosAnomalies->infosAnomalie)) {
            $result->ListeInfosAnomalies->infosAnomalie = [$result->ListeInfosAnomalies->infosAnomalie];
        }

        return $result->ListeInfosAnomalies->infosAnomalie;
    }

    /**
     * @TODO - méthode api fonctionnelle
     *
     * @param      $pkImmeuble
     * @param null $pkLogement
     * @param null $pkOccupant
     *
     * @return mixed
     */
    public function getDysfonctionnementsImmeuble($pkImmeuble, $pkLogement = null, $pkOccupant = null)
    {
        //return array();
        $paramsFiltres = [];

        if (!is_null($pkLogement)) {
            $paramsFiltres['PKLOGEMENT'] = $pkLogement;
            if (!is_null($pkOccupant)) {
                $paramsFiltres['PKOCCUPANT'] = $pkOccupant;
            }
        }

        $params = new GetParams();

        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser(),
            'PkImmeuble'    => (int) $pkImmeuble,
            'ParamsFiltres' => $params->convertParamsArrayToParamsFiltresString($paramsFiltres),
        ];

        $result = $this->sendRequest('GetInfosDysfonctionnementsByImmeuble', $request);

        if (!isset($result->ListeInfosDysfonctionnements) || !isset($result->ListeInfosDysfonctionnements->infosDysfonctionnement)) {
            return [];
        }

        if (!is_array($result->ListeInfosDysfonctionnements->infosDysfonctionnement)) {
            $result->ListeInfosDysfonctionnements->infosDysfonctionnement = [$result->ListeInfosDysfonctionnements->infosDysfonctionnement];
        }

        return $result->ListeInfosDysfonctionnements->infosDysfonctionnement;
    }

    /**
     * @return mixed
     */
    public function getUsersBigData()
    {
        $request = (object) [
            //'SessionID' => $this->adminSessionId,
            'superLoginID'  => $this->superLoginID,
            'superPassword' => $this->superPassword,
        ];

        $result = $this->sendRequest('GetUsersBigData', $request, false);

        if (!isset($result->ListeUsersBigData) || !isset($result->ListeUsersBigData->user)) {
            $result->ListeUsersBigData = (object) [
                'user' => [],
            ];
        }

        if (!is_array($result->ListeUsersBigData->user)) {
            $result->ListeUsersBigData->user = [$result->ListeUsersBigData->user];
        }

        return $result;
    }

    /**
     * @param $pkLogement
     *
     * @return mixed
     */
    public function getTicketInterInit($pkLogement)
    {
        //        $params = new GetParams();

        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement' => (int) $pkLogement,
        ];

        $result = $this->sendRequest('GetTicketInterInit', $request);

        return $result;
    }

    /**
     * @param data
     *
     * @return mixed
     */
    public function createTicketInter($data)
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement' => (int) $data['pkLogement'],
            'Nom'        => $data['name'],
            'Email'      => $data['email'],
            'TelFixe'    => $data['phone'],
            'TelMobile'  => $data['mobile'],
            'Objet'      => $data['objet'],
            'MotifLibre' => $data['message'],
        ];

        $result = $this->sendRequest('CreateTicketInter', $request);

        return $result;
    }

    /**
     * @param        $pkLogement
     * @param string $paramsFilters
     *
     * @return mixed
     */
    public function getNbTicketsInterByLogement($pkLogement, $paramsFilters = 'STATUT_CLIENT=!ouvert')
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement'     => $pkLogement,
            'ParamsFiltres' => $paramsFilters,
        ];

        $result = $this->sendRequest('GetNbTicketsInterByLogement', $request, false);

        return $result;
    }

    public function dd($var)
    {
        echo '<pre style="background-color: #2B333F; color: #fff8f8;padding: 15px;" >';
        var_dump($var);
        echo '</pre>';
        die;
    }

    public function checkTicketsInterEnabled(string $pkUser, string $sessionId)
    {
        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser'    => (int) $pkUser,
        ];

        return $this->sendRequest('CheckTicketsInterEnabled', $request);
    }

    public function getTicketsInterEnabled()
    {

        $sessionId = $this->getSessionId();
        $pkUser = $this->getPkUser();


        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser'    => (int) $pkUser,
        ];

        $board = $this->sendRequest('CheckTicketsInterEnabled', $request);

        return $board;
    }

    public function getNbTicketsInterUser()
    {

        $sessionId = $this->getSessionId();
        $pkUser = $this->getPkUser();


        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser'    => (int) $pkUser,

        ];



        $board = $this->sendRequest('GetNbTicketsIntersUser', $request, $use_cache = false);

        return $board;
    }

    public function getTicketsIntersUser($paramsFilters)
    {

        $sessionId = $this->getSessionId();
        $pkUser = $this->getPkUser();


        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser'    => (int) $pkUser,
            'ParamsFiltres' => "SHOWALL = $paramsFilters"

        ];


        $board = $this->sendRequest('GetTicketsIntersUser', $request, $use_cache = false);

        return $board;
    }

    public function setTicketStatutClient(string $caseId, string $statut)
    {
        $sessionId = $this->getSessionId();
        $pkUser = (int) $this->getPkUser();

        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser'    => $pkUser,
            'CaseId'    => $caseId,
            'statut'    => $statut
        ];

        return $this->sendRequest('SetTicketStatus', $request, false, false);
    }

    /**
     * @param $data
     * @param $attachment
     * @return mixed
     */
    public function createTicketInterAttachment($data, $attachment)
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkLogement' => (int) $data['pkLogement'],
            'Nom'        => $data['name'],
            'Email'      => $data['email'],
            'TelFixe'    => $data['phone'],
            'TelMobile'  => $data['mobile'],
            'Objet'      => $data['objet'],
            'MotifLibre' => $data['message'],
            'AttachmentName' => $attachment['name'],
            'AttachmentContent' => $attachment['content'],
        ];

        $result = $this->sendRequest('CreateTicketInter', $request);

        return $result;
    }

    /**
     * @param $PkTicketInter
     * @return mixed
     */
    public function getAttachmentTicketInter($PkTicketInter)
    {
        $request = (object) [
            'SessionID'  => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkTicketInter' => (int) $PkTicketInter,

        ];

        $result = $this->sendRequest('GetAttachment', $request);

        return $result;
    }


    /**
     * Récupère tous les factures
     * @return mixed
     */
    public function getFactures()
    {
        $request = (object) [
            'SessionID'     => $this->getSessionId(),
            'PkUser'        => (int) $this->getPkUser()
        ];
        return $this->sendRequest('getFactures', $request, false);
    }

    /**
     * download report for facture
     * @return mixed
     */
    public function getReportFacture($pkFacture)
    {
        $params = new GetReportParams();
        $params->PKFACTURE = $pkFacture;

        return $this->getReport('FACTURE', $params);
    }


    /**
     * Envoie un relevé occupant (formulaire public)
     *
     * Cette méthode reproduit le comportement du script legacy
     * public/submit_contact.php en appelant directement le
     * webservice SOAP setReleveOccupant avec les identifiants
     * SuperLoginID / SuperPassword.
     *
     * @param array $data Données issues du formulaire
     * @return mixed
     */
    public function setReleveOccupant(array $data)
    {
        // Construction des paramètres attendus par le webservice SOAP
        $request = [
            'SuperLoginID'  => $this->superLoginID,
            'SuperPassword' => $this->superPassword,
            'immeuble'      => $data['immeuble'] ?? '',
            'batiment'      => $data['batiment'] ?? '',
            'escalier'      => $data['escalier'] ?? '',
            'etage'         => $data['etage'] ?? '',
            'date_passage'  => $data['date_passage']  ?? '',
            'prenom'        => $data['prenom'] ?? '',
            'nom'           => $data['nom'] ?? '',
            'adresse'       => $data['adresse'] ?? '',
            'code_postal'   =>  $data['code_postal']   ?? '',
            'ville'         => $data['ville']         ?? '',
            'telephone'     => $data['telephone']     ?? '',
            'email'         => $data['email']         ?? '',
            // Eau froide
            'ef_cuisine'         => 'Numéro de compteur : ' . $data['ef_cuisine_num'] ?? ''        . ' - Index : ' . $data['ef_cuisine'] ?? '',
            'ef_salle_de_bains'  => 'Numéro de compteur : ' . $data['ef_salle_de_bains_num'] ?? '' . ' - Index : ' . $data['ef_salle_de_bains'] ?? '',
            'ef_wc'              => 'Numéro de compteur : ' . $data['ef_wc_num'] ?? ''             . ' - Index : ' . $data['ef_wc'] ?? '',
            'ef_autre'           => 'Numéro de compteur : ' . $data['ef_autre_num'] ?? ''          . ' - Index : ' . $data['ef_autre'] ?? '',
            'ef_nomautre'        => $data['ef_nomautre'] ?? '',
            // Eau chaude
            'ec_cuisine'         => 'Numéro de compteur : ' . $data['ec_cuisine_num'] ?? ''        . ' - Index : ' . $data['ec_cuisine'] ?? '',
            'ec_salle_de_bains'  => 'Numéro de compteur : ' . $data['ec_salle_de_bains_num'] ?? '' . ' - Index : ' . $data['ec_salle_de_bains'] ?? '',
            'ec_wc'              => 'Numéro de compteur : ' . $data['ec_wc_num'] ?? ''             . ' - Index : ' . $data['ec_wc'] ?? '',
            'ec_autre'           => 'Numéro de compteur : ' . $data['ec_autre_num'] ?? ''          . ' - Index : ' . $data['ec_autre'] ?? '',
            'ec_nomautre'        => $data['ec_nomautre'] ?? ''
        ];

        // Appel du webservice SOAP setReleveOccupant
        return $this->sendRequest('setReleveOccupant', $request, false, false);
    }


    /**
     * setOccupants4Chgt
     *
     * @param object $occupant The occupant want to update.
     *
     * @return mixed
     */
    public function setOccupants4Chgt($PkOccupant, $data, $IsNew)
    {
        if (isset($data['email'])) {
            $newEmail = $data['email'];
            $occupantToUpdate = [
                'PkOccupant' => (int)$PkOccupant,
                'newEmail'     => $newEmail,
                'isNew'        => $IsNew
            ];
        }

        if (isset($data['phone'])) {
            $occupantToUpdate['newTelmobile'] = $data['phone'];
        }

        if (isset($data['numbail'])) {
            $occupantToUpdate['newNumbail'] = $data['numbail'];
        }

        if (isset($data['dataArrivee'])) {
            $occupantToUpdate['newDateArrivee'] = $data['dataArrivee'];
        } else {
            $occupantToUpdate['newDateArrivee'] = date('Y-m-d\TH:i:s');
        }

        if (isset($data['name'])) {
            $occupantToUpdate['newNom'] = $data['name'];
        }

        $listOccupant = (object)[
            'occupant4Chgt' => (object)$occupantToUpdate,
        ];

        $request = (object)[
            'SessionID' => $this->getSessionId(),
            'PkUser' => (int)$this->getPkUser(),
            'occupants' => $listOccupant,
            'isNew'         => $IsNew,
        ];

        return $this->sendRequest('setOccupants4Chgt', $request, false, true);
    }


    /**
     * Récupère l'occupant
     *
     * @param int $pkImmeuble
     *
     * @return array
     */
    public function getOccupants($pkImmeuble, $pkOccupant, $IsNew)
    {
        $request = [
            'SessionID'     => $this->getSessionId(),
            'PkUser'     => (int) $this->getPkUser(),
            'PkImmeuble' => (int) $pkImmeuble,
            'PkOccupant' => (int) $pkOccupant,
            'isNew'         => $IsNew,
        ];
        return $this->sendRequest('getOccupants4Chgt', $request, false, true);
    }

    public function setSeuilConso($params)
    {
        $sessionId = $this->getSessionId();
        $pkUser = $this->getPkUser();
        $paramsFiltres = sprintf(
            'SEUIL_CONSO_EF=%d|SEUIL_CONSO_EC=%d|SEUIL_CONSO_ACTIF=%s|SEUIL_CONSO_EMAIL=%s',
            $params['SEUIL_CONSO_EF'],
            $params['SEUIL_CONSO_EC'],
            $params['SEUIL_CONSO_ACTIF'],
            $params['SEUIL_CONSO_EMAIL']
        );

        $request = (object) [
            'SessionID' => $sessionId,
            'PkUser' => (int)$pkUser,
            'ParamsFiltres' => $paramsFiltres,
        ];

        return $this->sendRequest('SetSeuilConso', $request);
    }

    public function getSousTraitants($params = null, $use_cache = false)
    {

        $request =  [
            //'SessionID' => $this->adminSessionId,
            'SuperLoginID'  => $this->superLoginID,
            'SuperPassword' => $this->superPassword,
        ];
        if (isset($result->Erreur) && !empty($result->Erreur)) {
            return false;
        }

        return $this->sendRequest('GetSousTraitants',  $request, false);
    }

    public function getStatOccupants($params = null, $use_cache = false)
    {
        $modelgraph = 'CONNEXIONS_UNIQUES';
        //$modelgraph = 'CONNEXIONS_TOTALES';

        $request = [
            'SessionID'     => $this->getSessionId(),
            'PkUser'         => (int) $this->getPkUser(),
            'typeGraph'     => $modelgraph,
            'startDate'     => '',
            'endDate'        => '',
        ];

        return $this->sendRequest('GetStatOccupantsGraph', $request, false);
    }

    /**
     * Récupère les relevés par token
     *
     * @param $tokenId
     * @return mixed
     */
    public function getReportByToken($tokenId)
    {
        $request = (object) [
            'SessionID' => $this->adminSessionId,
            'tokenid'   => $tokenId,
        ];

        return $this->sendRequest('GetReportByToken', $request, false, false);

        //        $request = (object) [
        //            'SessionID'     => "54ea1174-b2f9-4472-bfb6-93ebe19d596b",
        //            'PkUser'        => 1043,
        //            'ReportType'    => "RELEVE_EAU_IMMEUBLE",
        //            'ParamsFiltres' => "PKRELEVE=1395235",
        //        ];
        //        return  $this->sendRequest('GetReport', $request, false, false);
    }
}
