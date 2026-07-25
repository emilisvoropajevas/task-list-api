import { builder, prisma } from "../builder";

builder.mutationType({
    fields: (t) => ({
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
    })
})