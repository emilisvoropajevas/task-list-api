import { z } from "zod";

// Id args arrive as strings. This functions converts any id args and rejects anything that isnt a whole positive number
export const idSchema = z.coerce.number().int().positive()