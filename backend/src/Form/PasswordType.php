<?php

namespace App\Form;

use App\Validator\Constraint\PasswordConstraint;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType as SymfonyPasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;

class PasswordType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('password', RepeatedType::class, [
                'type' => SymfonyPasswordType::class,
                'options' => [
                    'constraints' => [
                        new PasswordConstraint(),
                        new Length([
                            'min' => 8,
                        ]),
                    ],
                    'required' => true,
                ],
                'first_options' => [
                    'attr' => [
                        'class' => 'form-control',
                        'placeholder' => 'Mot de passe*',
                    ],
                ],
                'second_options' => [
                    'attr' => [
                        'class' => 'form-control',
                        'placeholder' => 'Confirmation Mot de passe*',
                    ],
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'translation_domain' => 'validators',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'password';
    }
}