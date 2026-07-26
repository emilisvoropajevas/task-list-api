import { builder, prisma } from "../builder";
import { GraphQLError } from "graphql";
import { ResultAsync } from "neverthrow";
import { validate } from "../validation/validate";
import { CreateTaskListInput } from "../validation/task-list";
import { DatabaseError } from "../errors/errors";
import { mapPrismaError } from "../errors/prisma-error";

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
            const result = await validate(CreateTaskListInput, { name: args.name })
            .asyncAndThen((input) => 
                ResultAsync.fromPromise(
                    prisma.taskList.create( {
                        ...query,
                        data: {
                            name: input.name
                        }
                    }),
                    mapPrismaError
                )
            )

            return result.match(
                (taskList) => taskList,
                (error) => {
                    const extensions: Record<string, unknown> = { code: error._tag }

                    if (error._tag === 'ValidationError') {
                        extensions.issues = error.message
                    }

                    throw new GraphQLError(error.message, { extensions })
                }
            )
        }
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