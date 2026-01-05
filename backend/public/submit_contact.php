<?php


if(!empty($_POST['immeuble']) && !empty($_POST["date_passage"]) 
 && !empty($_POST["prenom"]) && !empty($_POST["nom"]) && !empty($_POST["adresse"]) && !empty($_POST["code_postal"]) && !empty($_POST["ville"])
 && !empty($_POST["telephone"]) && !empty($_POST["email"])){

		$immeuble = strip_tags($_POST["immeuble"]);
		$batiment = strip_tags($_POST["batiment"]);
		$escalier = strip_tags($_POST["escalier"]);
		$etage = strip_tags($_POST["etage"]);
		$date_passage = strip_tags($_POST["date_passage"]);
		$prenom = strip_tags($_POST["prenom"]);
		$nom = strip_tags($_POST["nom"]);
		$adresse = strip_tags($_POST["adresse"]);
		$code_postal = strip_tags($_POST["code_postal"]);
		$ville = strip_tags($_POST["ville"]);
		$telephone = strip_tags($_POST["telephone"]);
		$email = strip_tags($_POST["email"]);
		$ef_cuisine = strip_tags($_POST["ef_cuisine"]);
		$ef_salle_de_bains = strip_tags($_POST["ef_salle_de_bains"]);
		$ef_wc = strip_tags($_POST["ef_wc"]);
		$ef_autre = strip_tags($_POST["ef_autre"]);
		$ef_nomautre = strip_tags($_POST["ef_nomautre"]);
		$ec_cuisine = strip_tags($_POST["ec_cuisine"]);
		$ec_salle_de_bains = strip_tags($_POST["ec_salle_de_bains"]);
		$ec_wc = strip_tags($_POST["ec_wc"]);
		$ec_autre = strip_tags($_POST["ec_autre"]);
		$ec_nomautre = strip_tags($_POST["ec_nomautre"]);
		
		$ef_cuisine_num = strip_tags($_POST["ef_cuisine_num"]);
		$ef_salle_de_bains_num = strip_tags($_POST["ef_salle_de_bains_num"]);
		$ef_wc_num = strip_tags($_POST["ef_wc_num"]);
		$ef_autre_num = strip_tags($_POST["ef_autre_num"]);
		$ec_cuisine_num = strip_tags($_POST["ec_cuisine_num"]);
		$ec_salle_de_bains_num = strip_tags($_POST["ec_salle_de_bains_num"]);
		$ec_wc_num = strip_tags($_POST["ec_wc_num"]);
		$ec_autre_num = strip_tags($_POST["ec_autre_num"]);

		
		$client = new SoapClient("http://techn5292.eu.techem.corp:8080/Main.asmx?wsdl", array('trace' => 1, 'cache_wsdl'=> 0 ));


		$params = array(
			"SuperLoginID"		 	=> "WEBUI_TCH_USER",
			"SuperPassword"		 	=> "0V728JQY-dBM1zWA",
			"immeuble"				 => $immeuble,
			"batiment"			 	=> $batiment,
			"escalier"			 	=> $escalier,
			"etage"			 	 	=> $etage,
			"date_passage"		 	=> $date_passage,
			"prenom"			 	 => $prenom,
			"nom"					 => $nom,
			"adresse"				 => $adresse,
			"code_postal"			 => $code_postal,
			"ville"					 => $ville,
			"telephone"				 => $telephone,
			"email"					 => $email,
			"ef_cuisine"			 => 'Numéro de compteur : '.$ef_cuisine_num .' - Index : '.$ef_cuisine,
			"ef_salle_de_bains"		 => 'Numéro de compteur : '.$ef_salle_de_bains_num.' - Index : '.$ef_salle_de_bains,
			"ef_wc"					 => 'Numéro de compteur : '.$ef_wc_num .' - Index : '.$ef_wc,
			"ef_autre"				 => 'Numéro de compteur : '.$ef_autre_num .' - Index : '.$ef_autre,
			"ef_nomautre"			 => $ef_nomautre,
			"ec_cuisine"			 => 'Numéro de compteur : '.$ec_cuisine_num .' - Index : '.$ec_cuisine,
			"ec_salle_de_bains"		 => 'Numéro de compteur : '.$ec_salle_de_bains_num .' - Index : '.$ec_salle_de_bains,
			"ec_wc"					 => 'Numéro de compteur : '.$ec_wc_num .' - Index : '.$ec_wc,
			"ec_autre"				 => 'Numéro de compteur : '.$ec_autre_num .' - Index : '.$ec_autre,
			"ec_nomautre"			 => $ec_nomautre
		);

		try 
		{
			
			$response = $client->__soapCall("setReleveOccupant",array($params));
			//$response = $client->__soapCall("GetHelloSalesForce",array($params));
			//$response = $client->__soapCall("Login", array($params));
			
		}
		catch(SoapFault $e)
		{
			$response = $client->__getLastRequest();
			$response2 = $client->__getLastResponse();
			echo "<br />";
		}		



} else {
	$message = "ERREUR : tous les champs ne sont pas renseign&eacute;s.";
	//echo $message;
	//$SendEmail = MailMe($destinataire, $subject, $message);
  
}


?>

<!DOCTYPE html>
<!-- saved from url=(0050)https://www.techem.fr/transmettre-vos-releves.html -->
<html class="no-js no-touch" lang="fr"><!--<![endif]--><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">


<!-- 
	This website is powered by TYPO3 - inspiring people to share!
	TYPO3 is a free open source Content Management Framework initially created by Kasper Skaarhoj and licensed under GNU/GPL.
	TYPO3 is copyright 1998-2020 of Kasper Skaarhoj. Extensions are copyright of their respective owners.
	Information and contribution at https://typo3.org/
-->


<link rel="shortcut icon" href="https://www.techem.fr/typo3conf/Resources/Public/img/favicon.ico" type="image/png">
<title>Transmettre vos relevés | Techem France</title>
<meta name="generator" content="TYPO3 CMS">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,minimal-ui">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">


<link rel="stylesheet" type="text/css" href="./Transmettre vos relevés _ Techem France_files/techem.css" media="all">
<link rel="stylesheet" type="text/css" href="./Transmettre vos relevés _ Techem France_files/techem-print.css" media="print" title="High contrast">







<script type="text/javascript" charset="UTF-8" src="./Transmettre vos relevés _ Techem France_files/configuration.js.téléchargement"></script><script id="Cookiebot" src="./Transmettre vos relevés _ Techem France_files/uc.js.téléchargement" data-culture="FR" data-cbid="c0dba321-de60-4408-9940-fdaada5a2a8d" data-blockingmode="auto" type="text/javascript"></script>
<meta name="DCTERMS.title" content="Transmettre vos relevés">
<meta name="description" content="Le releveur s’est présenté à votre résidence mais n’a pas pu accéder à votre logement pour le relevé de vos compteurs d’eau. Vous avez la possibilité de relever et nous transmettre via un formulaire votre consommation d&#39;eau.">
<meta name="DCTERMS.description" content="Le releveur s’est présenté à votre résidence mais n’a pas pu accéder à votre logement pour le relevé de vos compteurs d’eau. Vous avez la possibilité de relever et nous transmettre via un formulaire votre consommation d&#39;eau.">
<meta name="keywords" content="lire compteur eau index chauffage radiateur">
<meta name="DCTERMS.subject" content="lire compteur eau index chauffage radiateur">
<meta name="date" content="2021-04-28T14:14:18+02:00">
<meta name="DCTERMS.date" content="2021-04-28T14:14:18+02:00">
<meta name="robots" content="index,follow">
<meta name="google-site-verification" content="wVbRuDUChB3TjRgX5V2fr_dp7Ny0Hl36NIeU6AhhOwQ">
<meta property="og:site_name" content="Techem">
<meta property="og:title" content="Transmettre vos relevés">
<meta property="og:type" content="article">





<link href="./Transmettre vos relevés _ Techem France_files/widget.module.min.js.téléchargement" rel="preload" as="script"><link href="./Transmettre vos relevés _ Techem France_files/dependencies.js.téléchargement" rel="preload" as="script"><link href="./Transmettre vos relevés _ Techem France_files/bootstrap.js.téléchargement" rel="preload" as="script"><link href="./Transmettre vos relevés _ Techem France_files/techem.js.téléchargement" rel="preload" as="script"><link href="./Transmettre vos relevés _ Techem France_files/formhandler.js.téléchargement" rel="preload" as="script"><link href="./Transmettre vos relevés _ Techem France_files/ytpe.js.téléchargement" rel="preload" as="script">

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
<body id="p5642" class="content-page no-header" data-translation-no-mobile-table="Die Tabelle kann auf dem Smartphone nicht dargestellt werden. Rufen Sie die Seite bitte im Desktop Modus auf oder besuchen sie diese vom Tablet/Desktop Computer.">



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
                    <img src="/bundles/techemcore/images/fidesio/logo.png" width='180' ></img>
                </div>

                <nav class="header meta-navi" role="header">
                </nav>
            </div>
        </div>
    </header>
</div>






<div class="content-container">

    
    <div class="container main-stage"><br ><br >
        <img src="./Transmettre vos relevés _ Techem France_files/overview_frau-laptop-couch.jpg" width="1450" height="420" alt="envoyer relevé index techem">
        <img src="./Transmettre vos relevés _ Techem France_files/csm_overview_frau-laptop-couch_mobile_27aa3b214d.jpg" width="980" height="510" class="mobile-alternate" alt="envoyer relevé index techem">
    </div>


    <div class="container main-content">
        <div class="row">
            
    <div class="col-sm-9">
    
<div class="image-text multiple ">

    
        
    
        <div class="text">
            
            <h2>Merci de votre participation</h2>

<p>Votre relève a bien été envoyé <br /> Pour revenir sur le site <a href="www.techem.fr">www.techem.fr</a><br /><br /><br /></p>
        </div>
    

    


    
</div>






<div class="image-text size33 left ">

    


    
        
    
    

    
</div>




	
</div>
<aside>
        

    




<div class="breadcrumb-navi-container">
    <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <div class="col-sm-10"><a href="https://www.techem.fr/"><span class="icomoon icon-home2"></span></a><span class="icomoon icon-arw_right"></span>Transmettre vos relevés</div>
            </div>
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
						<li><a href="https://www.techem.fr/politique-de-confidentialite.html">Politique de confidentialité</a></li><li><a href="https://www.techem.fr/configuration-de-vos-cookies.html">Configuration de vos cookies</a></li><li><a href="https://forms.gle/aiUbqWHeWVPFMJzeA">Donnez votre avis sur le site</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    </div>
</div>
















<!-- Cached page generated 28-10-21 14:49. Expires 28-10-21 17:36 -->
<!-- Parsetime: 0ms --><iframe tabindex="-1" role="presentation" aria-hidden="true" title="Blank" src="./Transmettre vos relevés _ Techem France_files/bc-v3.min.html" style="position: absolute; width: 1px; height: 1px; top: -9999px;"></iframe></body></html>

