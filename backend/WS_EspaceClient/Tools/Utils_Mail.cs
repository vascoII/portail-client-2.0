using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;


namespace Techem.Webservices.WS_EspaceClient
{
    public static class Utils_Mail
    {
        public static string sendMailSmtp(string from, string subject, string body, string to, string cc, string bcc, string attach, bool isHtml)
        {
            string smtpHost = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "SMTP_HOST");
            string smtpPort = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "SMTP_PORT");
            string smtpUser = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "SMTP_LOGIN");
            string smtpPassword = WS_DBUtils.utils_LER.GetParam("PARAM_GEN_LER", "SMTP_PASSWORD");

            if (string.IsNullOrEmpty(to))
                return "Erreur : pas de destinataires";

            System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage();

            if (!string.IsNullOrEmpty(to))
            {
                to = to.Replace("\n", ";");
                string[] tto = to.Split(";".ToCharArray());
                foreach (string t in tto)
                {
                    if (t.Trim() != "")
                        message.To.Add(t.Trim());
                }
            }

            if (!string.IsNullOrEmpty(cc))
            {
                cc = cc.Replace("\n", ";");
                string[] tcc = cc.Split(";".ToCharArray());
                foreach (string c in tcc)
                {
                    if (c.Trim() != "")
                        message.CC.Add(c.Trim());
                }
            }

            if (!string.IsNullOrEmpty(bcc))
            {
                bcc = bcc.Replace("\n", ";");
                string[] tbcc = bcc.Split(";".ToCharArray());
                foreach (string bc in tbcc)
                {
                    if (bc.Trim() != "")
                        message.Bcc.Add(bc.Trim());
                }
            }

            if (!string.IsNullOrEmpty(attach))
            {
                string[] tattach = attach.Split("|".ToCharArray());
                foreach (string att in tattach)
                {
                    if (att.Trim() != "")
                        message.Attachments.Add(new System.Net.Mail.Attachment(att.Trim()));
                }
            }

            try
            {
                message.Subject = subject;
                message.Body = body;
                message.From = new System.Net.Mail.MailAddress(from);
                message.IsBodyHtml = isHtml;

                System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient(smtpHost, int.Parse(smtpPort.Trim()));
                smtp.Credentials = new NetworkCredential(smtpUser, smtpPassword);

                smtp.Send(message);
                message.Dispose();
                smtp = null;
            }
            catch (System.Exception ex)
            {
                return ex.Message;
            }
            return "";
        }

        public static bool IsValidEmail(string email)
        {
            // Vérification du format de l'adresse Email
            try
            {
                if (email.IndexOfAny(new char[] { '/', ' ', ',' }) > -1)
                    return false;
                else if (email.Length >= 1)
                    new MailAddress(email);
                return true;
            }
            catch //(FormatException)
            {
                //MessageBox.Show("Veuillez vérifier le format de l'adresse mail.", "", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
        }

        public static bool IsValidEmails(string emails)
        {
            bool isValid = true;
            string[] tabEmails = emails.Split(';');
            foreach (string email in tabEmails)
                isValid = isValid && IsValidEmail(email);

            return isValid;
        }

    }
}
