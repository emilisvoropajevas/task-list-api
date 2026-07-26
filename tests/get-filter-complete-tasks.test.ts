import { describe, it, vi, beforeEach, expect } from "vitest";
import { graphql } from "graphql";

const mockFindMany = vi.fn();

vi.mock("../src/builder", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../src/builder")>();
    return {
        ...actual,
        prisma: {
            task: { findMany: mockFindMany },
        } as unknown as typeof actual.prisma,
    };
});

const { schema } = await import("../src/schema");

describe("getFilterCompleteTasks query", () => {
    beforeEach(() => {
        mockFindMany.mockReset();
    });

    it("returns tasks filtered by taskListId and status", async () => {
        mockFindMany.mockResolvedValue([
            { id: 1, title: "finish docker compose", completed: true, tasklistId: 1, createdAt: new Date(), updatedAt: new Date() },
            { id: 2, title: "write readme", completed: true, tasklistId: 1, createdAt: new Date(), updatedAt: new Date() },
        ]);

        const result = await graphql({
            schema,
            source: `
                query {
                    getFilterCompleteTasks(taskListId: "1", completed: true, first: 10) {
                        edges {
                            node {
                                id
                                title
                                completed
                            }
                        }
                    }
                }
            `,
            contextValue: {},
        });

        const data = result.data as any;

        expect(result.errors).toBeUndefined();

        const nodes = data?.getFilterCompleteTasks?.edges.map((e: any) => e.node);
        expect(nodes).toEqual([
            { id: "1", title: "finish docker compose", completed: true },
            { id: "2", title: "write readme", completed: true },
        ]);

        expect(mockFindMany).toHaveBeenCalledTimes(1);
        expect(mockFindMany.mock.calls[0]![0]).toMatchObject({
            where: { tasklistId: 1, completed: true },
        });
    });

    it("omits the completed filter when not provided", async () => {
        mockFindMany.mockResolvedValue([]);

        const result = await graphql({
            schema,
            source: `
                query {
                    getFilterCompleteTasks(taskListId: "1", first: 10) {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            `,
            contextValue: {},
        });

        const data = result.data as any;

        expect(result.errors).toBeUndefined();
        expect(mockFindMany.mock.calls[0]![0].where).toEqual({ tasklistId: 1 });
    });

    it("returns a validation error for a non-numeric taskListId", async () => {
        const result = await graphql({
            schema,
            source: `
                query {
                    getFilterCompleteTasks(taskListId: "not-a-number", first: 10) {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            `,
            contextValue: {},
        });

        expect(result.errors).toBeDefined();
        expect(result.errors?.[0]?.extensions?.code).toBe("ValidationError");
        expect(mockFindMany).not.toHaveBeenCalled();
    });
});