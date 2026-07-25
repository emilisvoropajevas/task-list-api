import { builder } from "../builder";

import '../types/task'
import '../types/task-list'
import '../schema/mutation'
import '../schema/query'

export const schema = builder.toSchema();