import { z } from "zod";
import { Result, ok, err } from "neverthrow";
import { ValidationError } from "../errors/errors";

export function validate<T extends z.ZodTypeAny>(
    schema: T,
    input: unknown
): Result<z.infer<T>, ValidationError> {
    // safe parse to get back a plain result object of either zod error or success
    const result = schema.safeParse(input)
    if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
        return err(new ValidationError('Validation failed', issues))
    }
    return ok(result.data)
}