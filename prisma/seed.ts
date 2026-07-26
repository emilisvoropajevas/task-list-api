import "dotenv/config";
import { PrismaClient } from "../src/lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding database...");

    await prisma.task.deleteMany();
    await prisma.taskList.deleteMany();

    const groceries = await prisma.taskList.create({
        data: {
            name: "Groceries",
            tasks: {
                create: [
                    { title: "Buy milk", completed: false },
                    { title: "Buy eggs", completed: false },
                    { title: "Buy bread", completed: true },
                ],
            },
        },
    });

    const chores = await prisma.taskList.create({
        data: {
            name: "Household chores",
            tasks: {
                create: [
                    { title: "Vacuum living room", completed: true },
                    { title: "Do laundry", completed: false },
                ],
            },
        },
    });

    const dockerSetup = await prisma.taskList.create({
        data: {
            name: "Docker & Database Setup",
            tasks: {
                create: [
                    { title: "Add Dockerfile for the API service", completed: true },
                    { title: "Add docker-compose.yml with db + api services", completed: true },
                    { title: "Add .dockerignore", completed: true },
                    { title: "Fix Prisma generator output paths to match src/lib imports", completed: true },
                    { title: "Fix prisma generate failing at build time (missing DATABASE_URL)", completed: true },
                    { title: "Fix Postgres initdb failing on non-empty volume (set PGDATA subdirectory)", completed: true },
                    { title: "Confirm app boots cleanly in Docker", completed: true },
                    { title: "Add prisma/seed.ts", completed: true },
                    { title: "Wire up seed command in prisma.config.ts", completed: true },
                ],
            },
        },
    });

    console.log(`Seeded task lists: "${groceries.name}", "${chores.name}", "${dockerSetup.name}"`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });