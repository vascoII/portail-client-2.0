<?php
/**
 * Created by PhpStorm.
 * User: fidesio
 * Date: 23/05/2018
 * Time: 10:51
 */

namespace App\Service;


class EmailHelper
{
    private $mailer;
    private $mailerFrom;
    private $mailerTo;
    private $twig;

    public function __construct($mailer, $mailerFrom, $mailerTo, $twig)
    {
        $this->mailer     = $mailer;
        $this->mailerFrom = $mailerFrom;
        $this->mailerTo   = $mailerTo;
        $this->twig       = $twig;
    }

    public function sendEmail($data)
    {
        $message = (\Swift_Message::newInstance())
            ->setFrom($this->mailerFrom)
            ->setTo($this->mailerTo)
            ->setBody(
                $this->twig
                    ->render(
                        'Email:intervention.html.twig',
                        ['data' => $data]
                    ),
                'text/html'
            );

        $this->mailer->send($message);
    }

    public function dd($var)
    {
        echo '<pre style="background-color: #2B333F; color: #fff8f8;padding: 15px;" >';
        var_dump($var);
        echo '</pre>';
        die;
    }
}