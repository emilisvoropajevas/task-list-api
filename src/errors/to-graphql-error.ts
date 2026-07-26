import { GraphQLError } from "graphql";
import type { AppError } from "./errors";

export function toGraphQLError(error: AppError): GraphQLError {
    const extensions: Record<string, unknown> = { code: error._tag }

    if (error._tag === 'ValidationError') {
        extensions.issues = error.issues
    }

    return new GraphQLError(error.message, { extensions })
}