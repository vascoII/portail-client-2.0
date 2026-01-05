<?php
/**
 * Created by PhpStorm.
 * User: Alexis
 * Date: 10/05/2017
 * Time: 10:13
 */

namespace App\Service;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\DataType;

class ExcelHelper
{
    public function __construct()
    {

    }

    public function write($path, $rows)
    {

	    $spreadsheet = new Spreadsheet();
	    $sheet = $spreadsheet->getActiveSheet();
	    $line = 1;

	    foreach ($rows as $columns) {
		    $letter = 'A';
		    foreach ($columns as $value) {
			    // Use setCellValue with explicit type
			    $sheet->setCellValueExplicit($letter . $line, trim($value), DataType::TYPE_STRING);
			    $sheet->getColumnDimension($letter)->setAutoSize(true);
			    $letter++;
		    }
		    $line++;
	    }

// Create a new Writer object and save the file
	    $writer = new Xlsx($spreadsheet);
	    $writer->save($path);
    }
}
