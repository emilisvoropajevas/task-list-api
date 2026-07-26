export class ValidationError extends Error {
    readonly _tag = 'ValidationError'
    constructor(message: string, public readonly issues: string[]) {
        super(message)
    }
}

export class NotFoundError extends Error {
    readonly _tag = 'NotFoundError'
    constructor(message: string) {
        super(message)
    }
}

export class ForeignKeyError extends Error {
    readonly _tag = 'ForeignKeyError'
    constructor(message: string) {
        super(message)
    }
}

export class DatabaseError extends Error {
    readonly _tag = 'DatabaseError'
    constructor(message: string, public readonly cause: unknown) {
        super(message)
    }
}

export type AppError = ValidationError | NotFoundError | ForeignKeyError | DatabaseError