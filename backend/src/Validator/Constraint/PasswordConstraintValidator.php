<?php

namespace App\Validator\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Class PasswordConstraintValidator
 * @package App\Validator\Contstraint
 */
class PasswordConstraintValidator extends ConstraintValidator
{

    /**
     * Checks if the passed value is valid.
     *
     * @param mixed $value           The value that should be validated
     * @param Constraint $constraint The constraint for the validation
     *
     * @api
     */
    public function validate($value, Constraint $constraint): void
    {
        $valid = true;
        $valid &= preg_match('/[a-z]+/', $value);
        $valid &= preg_match('/[A-Z]+/', $value);
        $valid &= preg_match('/[0-9]+/', $value);

        if(!$valid) {
            /** @var ExecutionContextInterface $context */
            $context = $this->context;
            $context->buildViolation($constraint->message)
                ->atPath($context->getPropertyPath())
                ->addViolation()
            ;
        }
    }
}