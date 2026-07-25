import { builder } from "../builder";

builder.prismaObject('TaskList', {
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        createdAt: t.expose('createdAt', {
            type: 'DateTime',
        }),
        tasks: t.relation('tasks')
    })
})