import { builder } from "../builder";

import '../schema/task-list'
import '../schema/task'

builder.queryType({})
builder.mutationType({})

export const schema = builder.toSchema();