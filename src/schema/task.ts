import { builder, prisma } from "../builder";

builder.prismaObject('Task', {
    fields: (t) => ({
        id: t.exposeID('id'),
        title: t.exposeString('title'),
        completed: t.exposeBoolean('completed'),
        createdAt: t.expose('createdAt', {
            type: 'DateTime'
        }),
        updatedAt: t.expose('updatedAt', {
            type: 'DateTime'
        }),
        tasklist: t.relation('tasklist'),
    })
})

builder.queryFields((t) => ({

}))

builder.mutationFields((t) => ({
    // Add a single task
    addTask: t.prismaField({
        type: 'Task',
        args: {
            tasklistId: t.arg.id({ required: true}),
            title: t.arg.string({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.create({
                ...query,
                data: {
                    tasklistId: parseInt(args.tasklistId),
                    title: args.title,
                }
            })
        }
    }),
    // Update Task Title
    updateTaskName: t.prismaField({
        type: 'Task',
        args: {
            id: t.arg.id({ required: true }),
            title: t.arg.string({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.update({
                ...query,
                where: {
                    id: parseInt(args.id),
                },
                data: {
                    title: args.title,
                },
            })
        }
    }),
    // Update Task Status
    updateTaskStatus: t.prismaField({
        type: 'Task',
        args: {
            id: t.arg.id({ required: true }),
            completed: t.arg.boolean({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.update({
                ...query,
                where: {
                    id: parseInt(args.id),
                },
                data: {
                    completed: args.completed,
                }
            })
        }
    }),
    // Delete Task
    deleteTask: t.prismaField({
        type: 'Task',
        args: {
            id: t.arg.id({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.delete({
                ...query,
                where: {
                    id: parseInt(args.id),
                }
            })
        }
    })
}))