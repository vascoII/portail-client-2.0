<?php

namespace App\Validator\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Class PasswordConstraint
 * @package App\Validator\Contstraint
 */
class PasswordConstraint extends Constraint
{

    public $message = 'This string should contain an uppercase, a lowercase and a number.';

    /**
     * Returns the name of the class that validates this constraint
     *
     * By default, this is the fully qualified name of the constraint class
     * suffixed with "Validator". You can override this method to change that
     * behaviour.
     *
     * @return string
     *
     * @api
     */
    public function validatedBy(): string
    {
        return get_class($this) . 'Validator';
    }
}