import { Prisma } from "../lib/prisma/client";
import { NotFoundError, ForeignKeyError, DatabaseError, type AppError} from "./errors";

export function mapPrismaError(e: unknown): AppError {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Prisma Record not found error
        if (e.code === 'P2025') return new NotFoundError('The requested record not found')
        // Foreign Key constaint error
        if (e.code === 'P2003') return new ForeignKeyError('Referenced record does not exist')
    }
    return new DatabaseError('An unexpected database error occurred', e)
}