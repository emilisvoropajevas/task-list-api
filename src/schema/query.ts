import { builder, prisma } from "../builder";

builder.queryType({
    fields: (t) => ({
        taskList: t.prismaField({
            type: ['TaskList'],
            resolve: async (query, root, args, ctx) => {
                return prisma.taskList.findMany({
                    ...query
                })
            }
        })

    })
})