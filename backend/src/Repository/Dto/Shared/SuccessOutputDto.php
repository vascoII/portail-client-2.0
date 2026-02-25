<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

/**
 *
 */
final class SuccessOutputDto
{
    /**
     * @param null $data
     */
    private function __construct(
        public readonly bool $isSuccess,
        public readonly mixed $data = null,
        public readonly ?string $error = null,
    ) {}

    /**
     * @template U
     * @param U $data
     * @return SuccessOutputDto<U>
     */
    public static function ok(mixed $data = null): self
    {
        return new self(true, $data, null);
    }

    /**
     * @return SuccessOutputDto<null>
     */
    public static function error(string $error): self
    {
        return new self(false, null, $error);
    }
}