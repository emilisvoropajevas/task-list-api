import SchemaBuilder from "@pothos/core";
import { PrismaClient } from "../lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import PrismaPlugin from '@pothos/plugin-prisma'

import type PrismaTypes from "../lib/pothos-prisma-types";
import { getDatamodel } from "../lib/pothos-prisma-types";

// Define new config file for these?
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter });

export const builder = new SchemaBuilder<{
    PrismaTypes: PrismaTypes;
}>({
    plugins: [PrismaPlugin],
    prisma: {
        client: prisma,
        dmmf: getDatamodel(),
        exposeDescriptions: true,
        filterConnectionTotalCount: true,
        onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
    },
})