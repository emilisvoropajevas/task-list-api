import { z } from "zod";

export const CreateTaskListInput = z.object({
    name: z.string().trim().min(1, 'Name cannot be empty').max(100, 'Name it too long'),
})