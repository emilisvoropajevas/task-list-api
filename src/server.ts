import 'dotenv/config'
import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";

import { schema } from "./schema/index"

const yoga = createYoga({
    schema
})

export const server = createServer(yoga)