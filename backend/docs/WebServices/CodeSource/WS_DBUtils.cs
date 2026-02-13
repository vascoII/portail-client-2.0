using Techem.DBUtils.LER;
using Techem.DBUtils.Mongo;
using Techem.DBUtils.SF;
using Techem.Tools.EncryptionDecryption;

namespace Techem.Webservices.WS_EspaceClient
{
    static public class WS_DBUtils
    {
        public readonly static string privateKey =
        @"<RSAKeyValue><Modulus>wPcVV96oskH6ZNNwx+LeWZvOGPTWiviF5BcRLIG0tYqVkYnW2aENW3aN6S0/56s7aRbs8wS1hXnrwGI3/GGQqhkIy4e6UkkZm3Y661QRhqYpV9vu72s9zZTBRtbEuiHSrv7IAIPfZcCVBdMrHmJu25rtVH2ppl87HOO5b7uHBfzUXLi1piU06jMQeGz8p/2z+Cr0pf+yRLNo3IXVIwEz4rWK5V2rdrek4mzuU1HQEKOSx+0zHz2321e+amCtxAq+gdI2myauisNKip69OzjiejxV4dr7Qf52B7U/axMzEu1wxEb7ZX5GpaulQCoV4ruXJKUApywVl2UUyQofYQZ6QQ==</Modulus><Exponent>AQAB</Exponent><P>7U6KyE3TiBpLXQ74lJPvka0FVdajErdfDIwdFFbWXz380zX4QlgNxkYtjNh3URB54/Y3g5BgA6x84/2kuA/PYuSbM+F6tKm41FbwkIlNZG6s8aWaqPR9PJwOHbn7GPCboJ5HTkYuEC0DXKqBOVnIKXX5A1DiGDmkcibLXe5S5P8=</P><Q>0CpccnzTr6wSqvqKunzAWcEwB/v8kHzjyy9ZWhCqv/x4KQfXeikG9Kjb3eVHhyni8SFeaRowjkGEVs9ep3BjrBPemjPXV6801aaN3/igXvS1tpae76ctt6hYJCy51Vu10HuNAV08aLalf/MXka4cMCtCQhBs9yfxTlkm7b6yYL8=</Q><DP>C/0u18XOzQ5/BjmOZ3s93D9AiMCqRnTLMYgWpANrGy63ijgszbVDJORAwt/gz1Ckx9aVoWj24NijCqWy37W0xYtFKA7ZMy1r8BZgWv0E0vEgfajfMm//r8M2l1vhCraFNk0ozxSOmTSc+d6HXs1hZm7WYMuCULUA0N+S4LD8sSM=</DP><DQ>Jxmt37ter8Kshv0kjb7dCn7lHLrSR/mNeB7es7IpwIIVt+9HJCUMr2wAUH++nb7aZ9yStT88G5xm1T+CUgUkU7Avwds2+btpOzBbudQjm3Jvp2pHVFCcn8C5PaJBDbh6QDzU0YrHzAtyrsPki3KezNVzTqFzNkGEa+kHDOUi8FU=</DQ><InverseQ>J7Bhe6P4/u1NoVsUUUh0+TXGTlsI1lzE3WGxy5XQbfiQyuspdauYn31L+9V0Ls7cLFP6MUx/VbeQ/wVzALsCGmoUa7cy1KbW0LpD/JRzOI96mmDHAFZnbLuqKR5n7rRjE8jyBlhb/yr+X3osMiuyIlxyvB+VRX+ZCLyGwn7Q14U=</InverseQ><D>EIAQTyc2/acuphh+eFkp8jekc/Xbsp51tH9UdJ3SugNTrtI+kPV4ku2cTOgVotW9isrvEAjDDNrUEetUJjyhhioF2oGMqSSfD/AYMa9KoFztBBpGYCqnakDiFhCfWdsyjMw0hfbAz46cL5dTBJIeMKEa0jK8owFZqKrAXJGIhjZmSqzK+KHZV4sL4ZARy/JWx5U8hG6eWyWFA3Kxsi7NlWWPzTwRxudbYfiMc+nRT31VExMjby6vI5BWSMqFur9ivzfUGD2KcQB3bhno9Z861VVfx9349YgGfJDwlLUK5IDKZ+TOUxYmbgSW62/JGtV06RvNa7fupANKjcV/0NCZkQ==</D></RSAKeyValue>";
        
        //pour la prod sur le serveur
        //public static LER_DBUtils2 utils_LER = new LER_DBUtils2(WS_EspaceClient.Properties.Settings.Default.baseTest, true);
        // pour débogage en local
        public static LER_DBUtils2 utils_LER = getLER_DBUtils2();
        public static Mongo_DBUtils utils_Mongo = getMongo_DBUtils();
        public static SF_DBUtils utils_SF = getSF_DBUtils();

        private static SF_DBUtils getSF_DBUtils()
        {
            bool isBaseTest = WS_EspaceClient.Properties.Settings.Default.baseTest;
            string Client_id, Client_secret, Username, Password, TokenRequestEndpointURL;

            if (!isBaseTest)
            {
                Client_id = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.Client_idPROD, privateKey);
                Client_secret = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.Client_secretPROD, privateKey);
                Username = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.UsernamePROD, privateKey);
                Password = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.PasswordPROD, privateKey);
                TokenRequestEndpointURL = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.TokenRequestEndpointURLPROD, privateKey);
            }
            else
            {
                Client_id = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.Client_idUAT, privateKey);
                Client_secret = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.Client_secretUAT, privateKey);
                Username = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.UsernameUAT, privateKey);
                Password = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.PasswordUAT, privateKey);
                TokenRequestEndpointURL = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.TokenRequestEndpointURLUAT, privateKey);
            }
            return new SF_DBUtils(Client_id, Client_secret, Username, Password, TokenRequestEndpointURL);

        }
        private static LER_DBUtils2 getLER_DBUtils2()
        {
            bool isBaseTest = WS_EspaceClient.Properties.Settings.Default.baseTest;
            string LERConnectionString;
            if (!isBaseTest)
            {
                LERConnectionString = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.LERConnectionStringEncrypted, privateKey);
            }
            else
            {
                LERConnectionString = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.LERTESTConnectionStringEncrypted, privateKey);
            }
            return new LER_DBUtils2(isBaseTest, LERConnectionString);
        }
        private static Mongo_DBUtils getMongo_DBUtils()
        {
            bool isBaseTest = WS_EspaceClient.Properties.Settings.Default.baseTest;

            string MongoConnectionString;
            if (!isBaseTest)
            {
                MongoConnectionString = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.MongoConnectionStringEncrypted, privateKey);
            }
            else
            {
                MongoConnectionString = AsymetricEncryptionManager.Decrypt(Properties.Settings.Default.MongoTESTConnectionStringEncrypted, privateKey);
            }
            return new Mongo_DBUtils(MongoConnectionString);
        }
    }
}
