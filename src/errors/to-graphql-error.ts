import { GraphQLError } from "graphql";
import type { AppError } from "./errors";

export function toGraphQLError(error: AppError): GraphQLError {
    // Record type - Specifies objects whose keys and values have explicit types
    const extensions: Record<string, unknown> = { code: error._tag }

    if (error._tag === 'ValidationError') {
        extensions.issues = error.issues
    }

    return new GraphQLError(error.message, { extensions })
}