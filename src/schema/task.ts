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
    // Return single task
    getSingleTask: t.prismaField({
        type: 'Task',
        args: {
            taskId: t.arg.id({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.findUniqueOrThrow({
                ...query,
                where: {
                    id: parseInt(args.taskId)
                }
            })
        }
    }),
    // Return Tasks Filtered by Completion
    getFilterCompleteTasks: t.prismaField({
        type: ['Task'],
        args: {
            taskListId: t.arg.id({ required: true }),
            completed: t.arg.boolean({ required: false }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.findMany({
                ...query,
                where: {
                    tasklistId: parseInt(args.taskListId),
                    ...(args.completed !== undefined && args.completed !== null
                        ? { completed: args.completed }
                        : {}
                     ),
                }
            })
        }

    })

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
            taskId: t.arg.id({ required: true }),
            title: t.arg.string({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.update({
                ...query,
                where: {
                    id: parseInt(args.taskId),
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
            taskId: t.arg.id({ required: true }),
            completed: t.arg.boolean({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.update({
                ...query,
                where: {
                    id: parseInt(args.taskId),
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
            taskId: t.arg.id({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            return prisma.task.delete({
                ...query,
                where: {
                    id: parseInt(args.taskId),
                }
            })
        }
    })
}))