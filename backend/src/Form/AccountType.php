<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AccountType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            // Uncomment the following lines if you want to use the choice field for gender
            // ->add('gender', ChoiceType::class, [
            //     'choices' => [
            //         'Mlle.',
            //         'Mme.',
            //         'M.',
            //     ],
            //     'expanded' => true,
            // ])
            ->add('job', TextType::class, [
				'required' => True,
                'attr' => [
                    'class' => 'form-control',
                    'placeholder' => 'Fonction*',
                ],
            ])
            ->add('lastname', TextType::class, [
                'required' => true,
                'attr' => [
                    'class' => 'form-control',
                    'placeholder' => 'Nom*',
                ],
            ])
            ->add('firstname', TextType::class, [
                'required' => true,
                'attr' => [
                    'class' => 'form-control',
                    'placeholder' => 'Prénom*',
                ],
            ])
            ->add('phone', TextType::class, [
                'required' => true,
                'attr' => [
                    'class' => 'form-control',
                    'placeholder' => 'Téléphone*',
                ],
            ])
            ->add('email', RepeatedType::class, [
                'type' => EmailType::class,
                'options' => [
                    'required' => true,
                ],
                'first_options' => [
                    'attr' => [
                        'class' => 'form-control',
                        'placeholder' => 'Email*',
                    ],
                ],
                'second_options' => [
                    'attr' => [
                        'class' => 'form-control',
                        'placeholder' => 'Confirmation Email*',
                    ],
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => 'App\Model\Account',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'account';
    }
}