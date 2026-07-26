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

/// Get all tasks
builder.queryFields((t) => ({
    getTaskLists: t.prismaField({
        type: ['TaskList'],
        resolve: async (query, root, args, ctx) => {
            return prisma.taskList.findMany({
                ...query
            })
        }
    })
}))

builder.mutationFields((t) => ({
    // Add TaskList
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
        },
    }),
    // Delete TaskList
    deleteTaskList: t.prismaField({
        type: 'TaskList',
        args: {
            id: t.arg.id({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.taskList.delete({
                ...query,
                where: {
                    id: parseInt(args.id)
                }
            })
        }
    })
}))