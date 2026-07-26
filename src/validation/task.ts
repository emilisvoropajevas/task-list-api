import { z } from "zod";
import { idSchema } from "./common";

export const TaskIdInput = z.object({
    taskId: idSchema,
})

export const GetFilterCompleteTaskInput = z.object({
    taskListId: idSchema,
    completed: z.boolean().optional().nullable(),
})

export const AddTaskInput = z.object({
    tasklistId: idSchema,
    title: z.string().trim().min(1, 'Title cannot be empty').max(200, 'Title is too long'),
})

export const UpdateTaskNameInput = z.object({
    taskId: idSchema,
    title: z.string().trim().min(1, 'Title cannot be empty').max(200, 'Title is too long'),
})

export const UpdateTaskStatusInput = z.object({
    taskId: idSchema,
    completed: z.boolean(),
})