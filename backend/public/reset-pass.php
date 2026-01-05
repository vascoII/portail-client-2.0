<?php
date_default_timezone_set('Europe/Paris');

$error = false;
$success = false;
$tokenError = false;
$loginError = false;
$errorMessages = [];

$SuperLoginID = "WEBUI_TCH_USER";
$SuperPassword = "0V728JQY-dBM1zWA";
//$WS_URL = "https://webservice.techem.fr/Main.asmx";
$WS_URL = "http://techn5292.eu.techem.corp/Main.asmx";

function renderHeader() {
	
    echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>TECHEM - Espace client</title>
    <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Noto+Sans:400,700,400italic">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn3.devexpress.com/jslib/23.1.4/css/dx.light.css">
    <link rel="stylesheet" href="/bundles/techemcore/js/jquery-ui/css/no-theme/jquery-ui-1.10.3.custom.min.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/font-icons/entypo/css/entypo.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/bootstrap.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/neon-core.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/neon-theme.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/neon-forms.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/skins/white.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/font-icons/fontello/css/fontello.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/custom.css"/>
    <link rel="stylesheet" href="/bundles/techemcore/css/main.css"/>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="description" content="Techem - Espace client"/>
    <meta name="author" content="Fidesio http://www.fidesio.com/"/>
    <script type="text/javascript" src="/bundles/techemcore/js/jquery-1.11.0.min.js"></script>
</head>
<body class="page-body login-page">
    <div class="loader"></div>
    <header></header>
    <div class="main-content">
        <a href="/fr/parc" class="logo">
            <img src="/bundles/techemcore/images/fidesio/logo.svg"/>
        </a>
   <form action="/reset-pass.php" method="post" class="form">';

		
}

function renderFooter() {
	
    echo '
			</form>

	</div>
    <nav id="footer" class="navbar footer">
        <ul>
            <li>
                <a href="https://www.techem.fr/mentions-legales.html" target="_blank">Mentions légales</a> -
                <a href="https://www.techem.fr/politique-de-confidentialite.html" target="_blank">Politique de confidentialité</a>
            </li>
        </ul>
        <ul class="flags">
            <li style="padding-top: 0">
                <a href="/login">
                    <img style="max-width: 40px; margin-left: 10px;" src="/bundles/techemcore/images/flags/flag-fr.png"/>
                </a>
                <a href="/login?_locale=en">
                    <img style="max-width: 40px; margin-left: 10px;" src="/bundles/techemcore/images/flags/flag-gb.png"/>
                </a>
            </li>
        </ul>
    </nav>
    <script type="text/javascript" src="//projets.preview-app.net/injection.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/gsap/main-gsap.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/jquery-ui/js/jquery-ui-1.10.3.minimal.min.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/bootstrap.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/joinable.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/neon-api.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/resizeable.custom.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/custom.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/neon-custom.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/bootstrap-datepicker-release/js/bootstrap-datepicker.js"></script>
    <script type="text/javascript" src="/bundles/techemcore/js/bootstrap-datepicker-release/js/locales/bootstrap-datepicker.fr.js"></script>
    <link rel="stylesheet" type="text/css" href="https://cdn3.devexpress.com/jslib/23.1.5/css/dx.light.css"/>
    <script type="text/javascript" src="https://cdn3.devexpress.com/jslib/23.1.5/js/dx.all.js"></script>
    <script type="text/javascript" src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en,Intl.~locale.de,Intl.~locale.ru"></script>
    <script type="text/javascript" src="https://cdn3.devexpress.com/jslib/23.1.5/js/localization/dx.messages.de.js"></script>
    <script type="text/javascript" src="https://cdn3.devexpress.com/jslib/23.1.5/js/localization/dx.messages.ru.js"></script>
</body>
</html>';

}

function renderForm($tokenID = '', $salt = '') {
	
    echo '<h2 class="title" style="font-family:Lucida Grande, Arial, Verdana, sans-serif;">Créer son mot de passe</h2>
        <input type="hidden" name="tokenID" value="' . htmlspecialchars($tokenID, ENT_QUOTES, 'UTF-8') . '" />
        <input type="hidden" name="salt" value="' . htmlspecialchars($salt, ENT_QUOTES, 'UTF-8') . '" />
        <div class="form-group">
            <input type="password" class="user" name="_pass1" placeholder="Mot de passe" />
        </div>
        <div class="form-group">
            <input type="password" class="user" name="_pass2" placeholder="Confirmation du mot de passe" />
        </div>
        <input type="submit" name="save" value="ENREGISTRER" class="submit" />
    ';
	
}

function renderErrorMessages($messages) {
	
    if (!empty($messages)) {
		
		echo '';
		
        foreach ($messages as $message) {
            echo  $message ;
        }
		
        echo '';
		
    }
	
}

function renderSuccessMessage() {
	
    echo '<div style="background-color: green; color: white; font-weight: bold; padding: 10px; border-radius: 5px;">';
	
    echo '<p>Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.<br /><br />';
    echo '<a href="/login" style="color: white; font-weight: bold;">Aller à la page de connexion</a></p>';
	
    echo '</div>';
	
}

function isPasswordComplex($password) {
    return preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/', $password);
}

function validateToken($WS_URL, $SuperLoginID, $SuperPassword, $tokenID, $salt) {
	
    $curl = curl_init();
	
    curl_setopt_array($curl, [
        CURLOPT_URL => $WS_URL,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_SSL_VERIFYPEER => 0,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetResetTokenIDValidation xmlns="http://tempuri.org/">
      <SuperLoginID>' . htmlspecialchars($SuperLoginID, ENT_QUOTES, 'UTF-8') . '</SuperLoginID>
      <SuperPassword>' . htmlspecialchars($SuperPassword, ENT_QUOTES, 'UTF-8') . '</SuperPassword>
      <TokenID>' . htmlspecialchars($tokenID, ENT_QUOTES, 'UTF-8') . '</TokenID>
      <Salt>' . htmlspecialchars($salt, ENT_QUOTES, 'UTF-8') . '</Salt>
    </GetResetTokenIDValidation>
  </soap:Body>
</soap:Envelope>',
        CURLOPT_HTTPHEADER => [
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "http://tempuri.org/GetResetTokenIDValidation"'
        ],
    ]);

    try {
		
        $response = curl_exec($curl);
		
        curl_close($curl);

        if ($response === false) {
            throw new Exception('Erreur de communication avec le webservice ou manque du tokenID ou du Salt.');
        }

        $xml = new SimpleXMLElement($response);
        $namespaces = $xml->getNamespaces(true);
        $body = $xml->children($namespaces['soap'])->Body;
        $response = $body->children($namespaces[''])->GetResetTokenIDValidationResponse;
        $result = $response->GetResetTokenIDValidationResult;

        return (string)$result->Erreur === 'OK';
		
    } catch (Throwable $t) {
		
        global $errorMessages;
        $errorMessages[] = $t->getMessage();
		
        return false;
		
    }
}

function resetPassword($WS_URL, $SuperLoginID, $SuperPassword, $tokenID, $salt, $pass) {
	
    $curl = curl_init();
	
    curl_setopt_array($curl, [
        CURLOPT_URL => $WS_URL,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_SSL_VERIFYPEER => 0,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ResetPassword xmlns="http://tempuri.org/">
      <SuperLoginID>' . htmlspecialchars($SuperLoginID, ENT_QUOTES, 'UTF-8') . '</SuperLoginID>
      <SuperPassword>' . htmlspecialchars($SuperPassword, ENT_QUOTES, 'UTF-8') . '</SuperPassword>
      <TokenID>' . htmlspecialchars($tokenID, ENT_QUOTES, 'UTF-8') . '</TokenID>
      <Salt>' . htmlspecialchars($salt, ENT_QUOTES, 'UTF-8') . '</Salt>
      <Password>' . htmlspecialchars($pass, ENT_QUOTES, 'UTF-8') . '</Password>
    </ResetPassword>
  </soap:Body>
</soap:Envelope>',
        CURLOPT_HTTPHEADER => [
            'Content-Type: text/xml; charset=utf-8',
            'SOAPAction: "http://tempuri.org/ResetPassword"'
        ],
    ]);

    try {
		
        $response = curl_exec($curl);
		
        curl_close($curl);

        if ($response === false) {
            throw new Exception('Erreur de communication avec le webservice ou manque du tokenID ou du Salt.');
        }

        $xml = new SimpleXMLElement($response);
        $namespaces = $xml->getNamespaces(true);
        $body = $xml->children($namespaces['soap'])->Body;
        $response = $body->children($namespaces[''])->ResetPasswordResponse;
        $result = $response->ResetPasswordResult;

        return (string)$result->Erreur === 'OK';
		
    } catch (Throwable $t) {
		
        global $errorMessages;
        $errorMessages[] = $t->getMessage();
		
        return false;
    }
}

##############################################################################################################################################################################
##############################################################################################################################################################################
##############################################################################################################################################################################

renderHeader();

$tokenID = $_GET['resetpasswordid'] ?? $_POST['tokenID'] ?? null;
$salt = $_GET['salt'] ?? $_POST['salt'] ?? null;

if (!$tokenID || !$salt) {
    $tokenError = true;
} else {
    $tokenError = !validateToken($WS_URL, $SuperLoginID, $SuperPassword, $tokenID, $salt);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$tokenError) {
	
    $pass1 = $_POST['_pass1'] ?? '';
    $pass2 = $_POST['_pass2'] ?? '';

    if ($pass1 !== $pass2 && !empty($pass1) && !empty($pass2)) {
		
        $error = true;
        $errorMessages[] = '<div style="background-color: red; color: white; font-weight: bold; padding: 10px; border-radius: 5px;"><ul><li>Les mots de passe ne correspondent pas.</li></ul></div>';
		
    } elseif (!isPasswordComplex($pass2)) {
		
        $error = true;
        $errorMessages[] = '<div style="background-color: red; color: white; font-weight: bold; padding: 10px; border-radius: 5px;"><ul><li>Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.</li></ul></div>';
		
    } else {
		
        $success = resetPassword($WS_URL, $SuperLoginID, $SuperPassword, $tokenID, $salt, $pass2);
		
        if (!$success) {
            $errorMessages[] = '<div style="background-color: red; color: white; font-weight: bold; padding: 10px; border-radius: 5px;"><ul><li>Erreur lors de la réinitialisation du mot de passe.</li><ul></div>';
        }
		
    }
}

if ($success) {
    renderSuccessMessage();
} else {
	
    if ($tokenError || $loginError) {
		
        $errorMessages[] = '<div style="background-color: red; color: white; font-weight: bold; padding: 10px; border-radius: 5px;"><ul><li>Ce lien est expiré ou invalide, ou votre utilisateur n\'est plus actif !</li></ul></div>
		<a href="./reset-password"><b><input type="button" class="submit" style="text-align: center;" value="Nouvelle demande" onclick="jsresetpass()"></input></b></a>
		<script>function jsresetpass(){windows.location.href="./reset-password";}</script>';
		
        renderErrorMessages($errorMessages);


		
    } else {
		
        renderErrorMessages($errorMessages);
        renderForm($tokenID, $salt);
		
    }
	
}

renderFooter();

?>