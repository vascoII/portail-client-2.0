<?php

declare(strict_types=1);

namespace App\Repository\Dto\Operator;

final class ListOperatorsOutputDto
{
    /** @param UserDto[] $userDto */
    public function __construct(
        public readonly array $userDto
    ) {}
}
