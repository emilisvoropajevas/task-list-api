import { builder, prisma } from "../builder";
import { ResultAsync } from "neverthrow";
import { validate } from "../validation/validate";
import { 
    TaskIdInput, 
    GetFilterCompleteTaskInput, 
    AddTaskInput,
    UpdateTaskNameInput,
    UpdateTaskStatusInput,
} from "../validation/task";
import { mapPrismaError } from "../errors/prisma-error";
import { toGraphQLError } from "../errors/to-graphql-error";

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
            const result = await validate(TaskIdInput, { taskId: args.taskId })
                .asyncAndThen((input) =>
                    ResultAsync.fromPromise(
                        prisma.task.findFirstOrThrow({
                            ...query,
                            where: {
                                id: input.taskId
                            }
                        }),
                        mapPrismaError
                    )
                )
            return result.match(
                (task) => task,
                (error) => { throw toGraphQLError(error) }
            ) 
        }
    }),
    // Return Tasks Filtered by Completion
    getFilterCompleteTasks: t.prismaConnection({
        type: 'Task',
        cursor: 'id',
        args: {
            taskListId: t.arg.id({ required: true }),
            completed: t.arg.boolean({ required: false }),
        },
        resolve: async (query, root, args, ctx) => {
            const validated = validate(GetFilterCompleteTaskInput, {
                taskListIdL: args.taskListId,
                completed: args.completed,
            })

            if (validated.isErr()) {
                throw toGraphQLError(validated.error)
            }
            const input = validated.value

            const result = await ResultAsync.fromPromise(
                prisma.task.findMany({
                    ...query,
                    where: {
                        tasklistId: input.taskListId,
                        ...(input.completed !== undefined && input.completed !== null
                            ? { completed: input.completed }
                            : {}),
                    }
                }),
                mapPrismaError
            )
            return result.match(
                (tasks) => tasks,
                (error) => { throw toGraphQLError(error)}
            )
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
            const result = await validate(AddTaskInput, { tasklistId: args.tasklistId, title: args.title })
                .asyncAndThen((input) =>
                    ResultAsync.fromPromise(
                        prisma.task.create({
                            ...query,
                            data: {
                                tasklistId: input.tasklistId,
                                title: input.title,
                            }
                        }),
                        mapPrismaError
                    )
                )
            return result.match(
                (task) => task,
                (error) => { throw toGraphQLError(error) }
            )
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
             const result = await validate(UpdateTaskNameInput, { taskId: args.taskId, title: args.title })
                .asyncAndThen((input) =>
                    ResultAsync.fromPromise(
                        prisma.task.update({
                            ...query,
                            where: {
                                id: input.taskId,
                            },
                            data: {
                                title: input.title,
                            },
                        }),
                        mapPrismaError
                    )
                )
            return result.match(
                (task) => task,
                (error) => { throw toGraphQLError(error) }
            )
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
              const result = await validate(UpdateTaskStatusInput, { taskId: args.taskId, completed: args.completed })
                .asyncAndThen((input) =>
                    ResultAsync.fromPromise(
                        prisma.task.update({
                            ...query,
                            where: {
                                id: input.taskId,
                            },
                            data: {
                                completed: input.completed,
                            }
                        }),
                        mapPrismaError
                    )
                )
            return result.match(
                (task) => task,
                (error) => { throw toGraphQLError(error) }
            )
        }
    }),
    // Delete Task
    deleteTask: t.prismaField({
        type: 'Task',
        args: {
            taskId: t.arg.id({ required: true }),
        },
        resolve: async (query, root, args, ctx) => {
            const result = await validate(TaskIdInput, { taskId: args.taskId })
                .asyncAndThen((input) =>
                    ResultAsync.fromPromise(
                        prisma.task.delete({
                            ...query,
                            where: {
                                id: input.taskId,
                            }
                        }),
                        mapPrismaError
                    )
                )
            return result.match(
                (task) => task,
                (error) => { throw toGraphQLError(error) }
            )
        }
    })
}))