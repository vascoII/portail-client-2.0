<?php

namespace App\Service;

/**
 * Class CsvHelper
 * @package App\Service
 */
class CsvHelper
{
    private $enclosure;
    private $delimiter;
    private $breakline;

    /**
     * @param string $delimiter
     * @param string $enclosure
     * @param string $breakline
     */
    function __construct($delimiter = ';', $enclosure = '"', $breakline = "\n")
    {
        $this->delimiter = $delimiter;
        $this->enclosure = $enclosure;
        $this->breakline = $breakline;
    }

    /**
     * @param resource $handle
     * @param array $rows
     * @param bool $force_enclosure
     */
    public function write($handle, array $rows, $force_enclosure = true)
    {
        foreach ($rows as $row) {
            $this->writeLine($handle, $row, $force_enclosure);
        }
    }

    /**
     * @param $handle
     * @param $row
     * @param bool $force_enclosure
     */
    public function writeLine($handle, $row, $force_enclosure = true)
    {
        if ($force_enclosure) {
            $content = $this->format($row);
            fwrite($handle, $content . $this->breakline);
        } else {
            fputcsv($handle, $row, $this->delimiter, $this->enclosure);
        }
    }

    /**
     * @param $data
     * @return string
     */
    public function format($data)
    {
        $enclosure = $this->enclosure;
        $data = array_map(function ($value) use ($enclosure) {
            return '=' . $enclosure . str_replace($enclosure, '"'.$enclosure, utf8_decode($value)) . $enclosure;
        }, $data);

        return implode($this->delimiter, $data);
    }
}