<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class InterventionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('pkLogement', HiddenType::class, [
                'required' => true,
            ])
            ->add('name', TextType::class, [
                'required' => true,
                'attr' => [
                    'placeholder' => 'Nom',
                ],
            ])
            ->add('email', EmailType::class, [
                'required' => true,
                'attr' => [
                    'placeholder' => 'Email',
                ],
            ])
            ->add('phone', TextType::class, [
                'required' => false,
                'attr' => [
                    'placeholder' => 'Téléphone fixe',
                    'class' => 'phone-group',
                ],
            ])
            ->add('mobile', TextType::class, [
                'required' => false,
                'attr' => [
                    'placeholder' => 'Téléphone mobile',
                    'class' => 'phone-group',
                ],
            ])
            ->add('objet', TextType::class, [
                'required' => true,
                'attr' => [
                    'placeholder' => 'Objet',
                ],
            ])
            ->add('message', TextareaType::class, [
                'required' => true,
                'attr' => [
                    'placeholder' => 'Demande',
                    'cols' => 30,
                    'rows' => 5,
                ],
            ])
            ->add('attachment', FileType::class, [
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'attr' => ['id' => 'interventionForm'],
        ]);
    }
}