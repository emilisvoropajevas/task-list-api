import { builder, prisma } from "../builder";

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

builder.queryFields((t) => ({
    taskLists: t.prismaField({
        type: ['TaskList'],
        resolve: async (query, root, args, ctx) => {
            return prisma.taskList.findMany({
                ...query
            })
        }
    })
}))

builder.mutationFields((t) => ({
    createTaskList: t.prismaField({
        type: 'TaskList',
        args: {
            name: t.arg.string({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.taskList.create({
                ...query,
                data: {
                    name: args.name
                }
            })
        }
    })
}))