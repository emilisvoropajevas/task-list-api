import { builder } from "./builder";

builder.queryType({
    fields: (t) => ({
        hello: t.string({
            resolve: () => 'Hello from Pothos!',
        }),
    }),
})

export const schema = builder.toSchema()