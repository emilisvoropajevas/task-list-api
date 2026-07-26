import { describe, it, vi, beforeEach, expect } from "vitest";
import { graphql } from "graphql"

const mockCreate = vi.fn();

vi.mock("../src/builder", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../src/builder")>();
    return {
        ...actual,
        prisma: {
            taskList: { create: mockCreate },
        } as unknown as typeof actual.prisma,
    }
})

const { schema } = await import("../src/schema");

describe("createTaskList mutation", () => {
    beforeEach(() => {
        mockCreate.mockReset()
    })

    it("creates a task list when the name is valid", async () => {
        mockCreate.mockResolvedValue({ id: 1, name: "task-list-api", createdAt: new Date() })

        const result = await graphql({
            schema,
            source: `
                mutation {
                    createTaskList(name: "task-list-api") {
                        id
                        name
                    }
                }
            `,
            contextValue: {},
        })

        expect(result.errors).toBeUndefined()
        expect(result.data?.createTaskList).toEqual({ id: "1", name: "task-list-api" })

        expect(mockCreate).toHaveBeenCalledTimes(1)
        expect(mockCreate.mock.calls[0]![0]).toMatchObject({
            data: { name: "task-list-api" },
        })
    })
})