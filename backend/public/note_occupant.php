<?php
date_default_timezone_set('Europe/Paris');
$error = false;
$earliest_year = '1950'; 
$latest_year = date("Y"); 

echo '<!DOCTYPE html>
<html class="no-js no-touch" lang="fr"><!--<![endif]--><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">


<title>Note Information Mensuelle</title>
<meta name="generator" content="manu">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,minimal-ui">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">


<link rel="stylesheet" type="text/css" href="./bundles/techemcore/noteoccupant/techem.css" media="all">
<link rel="stylesheet" type="text/css" href="./bundles/techemcore/noteoccupant/techem-print.css" media="print" title="High contrast">


<meta name="DCTERMS.title" content="Transmettre vos relevés">
<meta name="description" content="">
<meta name="DCTERMS.description" content="">
<meta name="keywords" content="">
<meta name="DCTERMS.subject" content="">
<meta name="robots" content="index,follow">
<meta name="google-site-verification" content="wVbRuDUChB3TjRgX5V2fr_dp7Ny0Hl36NIeU6AhhOwQ">
<meta property="og:site_name" content="Techem">
<meta property="og:title" content="Transmettre vos relevés">
<meta property="og:type" content="article">





<link href="./bundles/techemcore/noteoccupant/widget.module.min.js.téléchargement" rel="preload" as="script">
<link href="./bundles/techemcore/noteoccupant/dependencies.js.téléchargement" rel="preload" as="script">
<link href="./bundles/techemcore/noteoccupant/bootstrap.js.téléchargement" rel="preload" as="script">
<link href="./bundles/techemcore/noteoccupant/techem.js.téléchargement" rel="preload" as="script">
<link href="./bundles/techemcore/noteoccupant/formhandler.js.téléchargement" rel="preload" as="script">
<link href="./bundles/techemcore/noteoccupant/ytpe.js.téléchargement" rel="preload" as="script">

<style type="text/css"> 
.h4{-webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    box-sizing: border-box;
    outline: none !important;
    font-weight: 500;
    font-family: "lucida_sansdemibold",Arial,sans-serif;
    margin: 0;
    color: #000;
    line-height: 1.4;
    font-size: 14px;
    margin-bottom: 4px;}
</style>
<style type="text/css" id="CookieConsentStateDisplayStyles">.cookieconsent-optin-preferences,.cookieconsent-optin-statistics,.cookieconsent-optin-marketing,.cookieconsent-optin{display:none;}.cookieconsent-optout-preferences,.cookieconsent-optout-statistics,.cookieconsent-optout-marketing,.cookieconsent-optout{display:block;display:initial;}</style>

</head>
<body id="p5642" class="content-page no-header" >

<div class="techem-bar" name="top"></div>
<div class="container header-container">
    <header>
        <div class="row">
            <div class="col-sm-12">
                <div class="col-sm-2"></div>
                <div class="col-sm-10">
                    <div class="bar"></div>
                </div>
            </div>
            <div class="col-sm-12 meta-navi-container">
                <div class="logo">
                    <img src="https://client.techem.fr/bundles/techemcore/images/fidesio/logo.svg" width="180" ></img>
                </div>
                <nav class="header meta-navi" role="header">
                </nav>
            </div>
        </div>
    </header>
</div>
	<div class="content-container">
		<div class="container main-stage"><br ><br >
			<img src="./bundles/techemcore/noteoccupant/overview_frau-laptop-couch.jpg" width="1450" height="420" alt="techem">
			<img src="./bundles/techemcore/noteoccupant/csm_overview_frau-laptop-couch_mobile_27aa3b214d.jpg" width="980" height="510" class="mobile-alternate" alt="techem">
		</div>
		<div class="container main-content" class="col-sm-09" >
			<div class="row" class="col-sm-09" >
				<div class="col-sm-09" >
					<div class="image-text multiple " style="overflow: hidden">
						<div class="text">
							<h1>Techem - Note d\'information mensuelle</h1>';

if (isset($_POST['immid'])){
	
	$idimm = strip_tags($_POST['immid']);
	$crsid = strip_tags($_POST['crsid']);
	$occupyear = strip_tags($_POST['year']);
	$params = "IDIMMEUBLE=".$idimm."|NUMEROSERIE=".$crsid."|PASSWORD=".$occupyear;

		$curl = curl_init();

		curl_setopt_array($curl, array(
		  CURLOPT_URL => 'http://techn5292.eu.techem.corp:8080/Main.asmx',
		  CURLOPT_SSL_VERIFYHOST => 0,
		  CURLOPT_SSL_VERIFYPEER => 0,
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'POST',
		  CURLOPT_POSTFIELDS =>'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
		  <soap:Body>
			<GetNoteInfo xmlns="http://tempuri.org/">
			  <SuperLoginID>WEBUI_TCH_USER</SuperLoginID>
			  <SuperPassword>0V728JQY-dBM1zWA</SuperPassword>
			  <Params>'.$params.'</Params>
			</GetNoteInfo>
		  </soap:Body>
		</soap:Envelope>',
		  CURLOPT_HTTPHEADER => array(
			'Content-Type: text/xml'
		  ),
		));
		
		try {
			
			$response = curl_exec($curl);
			curl_close($curl);
			preg_match('~<getnoteinforesult>([^{]*)</getnoteinforesult>~i', $response, $match);	
			if (!isset($match[1])){$error = true;}
		} catch (Throwable $t) {
			$error = true;
		}
		
		if ($error == false){
				$pdf = true;
				echo '<br /><br /><br />';
				echo '<p>Vous trouverez ci-dessous la note d\'information mensuelle pour votre logement. Vous pouvez télécharger ou imprimer cette dernière à l\'aide des boutons situés au-dessus du document.</p>';
				echo '<p align="center"><embed src="data:application/pdf;base64,'.$match[1].'" width="100%" height="500"></p>';
				echo '</div>
						<div class="figure-wrap">
							
						</div>
					</div>
					<div class="image-text size33 left ">
						<div class="figure-wrap">
							
						</div>
					</div>';
				
		}
	
}
if (!isset($_POST['immid']) or ($error == true ) )
{
	

	if ($error ==true){
		
		echo '<p><bold style="color:red">Nous n\'avons pas reconnu votre logement ou vous n\'êtes pas éligible au service. <br />La note d\'information n\'est disponible que pour des compteurs d\'eau chaude ou de chauffage en télérelevé. Si vous le souhaitez, 
		vous pouvez corriger les informations saisies et relancer la visualisation ci dessous :<br /><br /></bold></p>';

		
	}else{
	echo '
		<p>Afin de télécharger votre note d information mensuelle, merci de bien vouloir remplir le formulaire ci dessous <br /><br /><br /></p>';
	} 
echo '					<div class="Tx-Formhandler" >

	<form action="" method="post" class="form-horizontal bv-form" id="transmettre" style="font-family:lucida_sansdemibold,Arial,sans-serif">
		<div class="form-group has-error">
			<label for="immid" class="col-sm-4 col-xs-12 control-label" style="text-align:left">Numéro de l\'immeuble :</label>
			<input type="text" id="immid" name="immid" value="';
			echo ($error==true)?$idimm:"";
			echo '">
		</div>
		<div class="form-group has-error">
			<label for="crsid" class="col-sm-4 col-xs-12 control-label" style="text-align:left">Numéro de compteur :</label>
			<input type="text" id="crsid" name="crsid" value="';
			echo ($error==true)?$crsid:"";
			echo '">
		</div>
		<div class="form-group has-error">
			<label for="year" class="col-sm-4 col-xs-12 control-label" style="text-align:left">Occupant depuis :</label>
			<select id="year" name="year">';
		print '<option value="-"'.(!isset($occupyear) ? ' selected="selected" ' : '').'>---</option>';
		foreach ( range( $latest_year, $earliest_year ) as $i ) {
			print '<option value="'.$i.'"';
			if (isset($occupyear) and $i == intval($occupyear)){print ' selected="selected" ';}
			print '>'.$i.'</option>';
		}
			echo '</select>
		</div>
		<div class="button" >
			<button type="submit" class="btn btn-default pull-right btn-primary submit ">Voir la note mensuelle</button>
		</div>
	</form>
						<p style="color: red;" id="erreur"></p>
					</div>
';
}

echo '				</div>
			</div>

			<p>
				Vous disposez d’un droit d’accès, de rectification ou d’effacement, de limitation du traitement de vos données, d’un droit d’opposition, d’un droit à la portabilité
				de vos données, d’un droit de définir des instructions concernant la conservation, l\'effacement et la communication de vos informations à caractère personnel après votre décès.
			</p>
			<p>
				Vous pouvez exercer ces droits à tout moment en contactant votre bailleur ou votre syndic ou en contactant notre Délégué à la protection des données par courrier
				électronique à l’adresse data@techem.fr. Vous disposez également du droit d\'introduire une réclamation auprès de la Commission Nationale de l’Informatique et des libertés.
			</p>
			<p>
				Pour en savoir plus sur la manière dont sont traitées vos données à caractère personnel, veuillez consulter notre <a href="https://www.techem.fr/politique-de-confidentialite.html">Politique de confidentialité</a>.
			</p>

		</div>
	
	</div>
<aside>
    <div class="col-sm-3">
		<div class="image-text size100 ">
			<div class="text">
			</div>
		</div>
    </div>
</aside>

</div>
</div>
</div>




    <div class="footer-navi-container">
        <div class="techem-bar"></div>
        <div class="container bar-container">
            <div class="row">
                <div class="col-sm-12">
                    <div class="col-sm-2"></div>
                    <div class="col-sm-10">
                        <div class="bar"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>


<div class="footer-meta-navi-container">
    <div class="container footer-navigation">
        <footer>
            <div class="row">
                <div class="col-sm-12">
                    <ul class="footer-navigation">
						<li><a href="https://www.techem.fr/mentions-legales.html">Mentions légales</a></li>
						<li><a href="https://www.techem.fr/politique-de-confidentialite.html">Politique de confidentialité</a></li>
						<li><a href="https://www.techem.fr/configuration-de-vos-cookies.html">Configuration de vos cookies</a></li>
						
                    </ul>
                </div>
            </div>
        </footer>
    </div>
</div>



</body></html>';
?>