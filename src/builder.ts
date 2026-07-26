import SchemaBuilder from "@pothos/core";
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay'

import { PrismaClient } from "./lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DateTimeResolver } from "graphql-scalars";

import type PrismaTypes from "./lib/pothos-prisma-types";
import { getDatamodel } from "./lib/pothos-prisma-types";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter });

export const builder = new SchemaBuilder<{
    PrismaTypes: PrismaTypes;
    Scalars: {
        DateTime: {
            Input: Date;
            Output: Date;
        }
    }
}>({
    plugins: [PrismaPlugin, RelayPlugin],
    relay: {
        idFieldName: 'id',
        clientMutationId: 'omit',
        cursorType: 'String',
    },
    prisma: {
        client: prisma,
        dmmf: getDatamodel(),
        exposeDescriptions: true,
        filterConnectionTotalCount: true,
        onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
    },
})

builder.addScalarType('DateTime', DateTimeResolver, {})