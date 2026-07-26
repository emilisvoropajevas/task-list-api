# Task List API
A GraphQL API for managing task lists and their tasks. Built with GraphQL Yoga, Pothos, Prisma and Zod.


## Tech Stack
- Node.js / TypeScript
- GraphQL Yoga
- Pothos GraphQL
- Prisma
- Zod
- Neverthrow
- Vitest
- Docker

## Setup Instructions
Docker Desktop installed and running.

```bash
git clone https://github.com/emilisvoropajevas/task-list-api.git
cd task-list-api
docker compose up --build
```
This command will:

1. Build the API image and generate the Prisma client.
2. Pull and run Postgres 18, will wait until healthy.
2. Run all db migrations with prisma.
3. Seed database with sample data from ```./prisma/seed.ts```
4. Start GraphQL server at **http://localhost:4000/graphql**

## Project Structure
```
.
├── docker-compose.yml
├── Dockerfile
├── LICENSE
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations 
│   ├── schema.prisma
│   └── seed.ts (Seed Data)
├── prisma.config.ts
├── README.md
├── src
│   ├── builder.ts
│   ├── errors
│   │   ├── errors.ts
│   │   ├── prisma-error.ts
│   │   └── to-graphql-error.ts
│   ├── main.ts
│   ├── schema
│   │   ├── index.ts
│   │   ├── task-list.ts
│   │   └── task.ts
│   ├── server.ts
│   └── validation
│       ├── common.ts
│       ├── task-list.ts
│       ├── task.ts
│       └── validate.ts
├── tests
│   ├── create-task-list.test.ts
│   └── get-filter-complete-tasks.test.ts (Also tests cursor)
├── tsconfig.json
└── vitest.config.ts
```
## Data Model

Two models: `TaskList` and `Task`.

```prisma
model TaskList {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id         Int      @id @default(autoincrement())
  title      String
  completed  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  tasklistId Int
  tasklist   TaskList @relation(fields: [tasklistId], references: [id])
}
```
Given a tasklist can have many tasks and a unique task in this scope can only belong to a single taskList. This is modelled as a one to many relationship with taskListId being the foreign key relation between the two tables.

### GraphQL Schema

### Queries


| Field | Description |
|---|---|
| `getTaskLists` | Returns all task lists |
| `getSingleTask(taskId)` | Returns a single task by ID |
| `getFilterCompleteTasks(taskListId, completed?, first, after)` | Cursor-paginated, filterable tasks for a list |

### Mutations

| Field | Description |
|---|---|
| `createTaskList(name)` | Creates a new task list |
| `deleteTaskList(id)` | Deletes a task list |
| `addTask(tasklistId, title)` | Adds a task to a list |
| `updateTaskName(taskId, title)` | Renames a task |
| `updateTaskStatus(taskId, completed)` | Marks a task complete/incomplete |
| `deleteTask(taskId)` | Deletes a task |

### Example queries

```graphql
mutation {
  createTaskList(name: "Groceries") {
    id
    name
  }
}

mutation {
  addTask(tasklistId: "1", title: "Buy milk") {
    id
    title
    completed
  }
}

query {
  getFilterCompleteTasks(taskListId: "1", completed: false, first: 10) {
    edges {
      node {
        id
        title
        completed
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```
## Avoiding N+1 Queries
For a one to many relationship where tasklist can hold many tasks. Resolving a GraphQL query for several task lists and their tasks would mean one query to fetch the the task lists followed by a separate query per task list to fetch it's tasks. For N task lists, that's N+1 queries total which becomes problematic at scale. 

Pothos avoids this by spreading a ```query``` object directly into the Prisma call: ```prisma.taskList.findMany({ ...query })```. If the client asked for each task list's task, the requirement gets folded into the query as a Prisma ```include```, so the tasks get loaded in the same call as the task lists, resulting in one query.

Example (Resolves in one query):

```graphql
query {
  getTaskLists {
    name
    tasks { title }
  }
}
```

## Error handling
Errors are modelled as a **typed union of custom classes**, not generic thrown errors:

```typescript
export type AppError = ValidationError | NotFoundError | ForeignKeyError | DatabaseError
```

Each carries a `_tag` discriminant and a human-readable `message`. The flow is:

1. **Zod validation** (`validate()`) returns a `Result<T, ValidationError>` via `neverthrow`

2. **Prisma calls** are wrapped in `ResultAsync.fromPromise(promise, mapPrismaError)`, which converts a rejected promise into a typed `Result` instead of an exception. `mapPrismaError` inspects Prisma's error codes (e.g. `P2025` → `NotFoundError`, `P2003` → `ForeignKeyError`) and falls back to a generic `DatabaseError` otherwise.

3. Resolvers chain these with `.asyncAndThen(...)` and finish with `result.match(success, error => { throw toGraphQLError(error) })` — the *only* place a real exception is thrown is at the GraphQL boundary, converting the typed error into a `GraphQLError` with a machine-readable `extensions.code` (matching the `_tag`) plus the human message.

Try/Catch can also be used if you centralise the mapping into a shared function. But ```neverthrow ``` is used to make failure part of the function's type signature and the compiler is forced on every call to handle both outcomes and check that the output type matches either the error types or the success types. Try / catch blocks does not guarentee the same outcome. For example if a return type T is declared, but is thrown instead and nothing in the signature tells the caller that.

## Pagination Strategy - Cursor

`getFilterCompleteTasks` uses Pothos's `prismaConnection` (Relay-style cursor pagination), not offset-based pagination.

Task Lists are a good example of continuously mutating data where users add and complete tasks in real time. Offset pagination identifies a page by *position*, so if a task is inserted or removed between two page fetches, every subsequent offset shifts would result in the client seeing duplicate or missed rows. Offset also results in poorer performance at sclae where more time is spent scanning and discarding rows. Those are the reasons where I saw more beenfit to use cursor based pagination, where a page is identified by a stable reference point (the last seen row's `id`). At scale cursor based can use an index directly regardless of how deep into the collection of data you are.

### BONUS - Testing
Tests are **unit tests for GraphQL resolvers**, executed through the real GraphQL execution engine (`graphql()` from the `graphql` package against the real `schema`) with the Prisma client mocked at the `builder.ts` module boundary via `vi.mock`.

**What's real:** schema construction, GraphQL parsing/validation/execution, resolver logic, Zod validation, error mapping.
**What's mocked:** the Prisma client itself. No in memory or prod database used for tests.

I chose to test two very straight forward resolvers: `createTaskList` and `getFilterCompleteTasks`. The unit tests are for one query and one mutation, which should test the basic logic and error handling for each type of resolver. This stops at the unit level and integration tests are not implemented. With more time I'd include full test coverage (see Decisions section)

## Decisions

- **One-to-many `TaskList` → `Task`** relationship, enforced via foreign key.
- **Cursor-based pagination** over offset, for consistency under concurrent writes and better query performance at scale.
- **Typed error handling with `neverthrow`** over throw/catch, to make failure paths explicit in resolver type signatures and centralize error-shape formatting at a single GraphQL boundary.
- **N+1 avoidance via Pothos's `query` argument spreading** since Pothos's Prisma plugin already solves this at the query level for Prisma-backed fields.
- **Dockerized Postgres via Compose**, with the API container running migrations and seeding automatically on startup, so the project runs identically on any machine with just `docker compose up --build`.

## What I'd Do Differently / Add With More Time

- I would implement full unit test coverage against all resolvers and queries to make sure each function and error handling performs as normal. I would love to implement bash scripts that would run on startup before docker container initialises, for one, to health check and ping the database before to check health and connection, secondly to run the full test coverage. I would also exapnd and add integration tests for a production / in memory database.
- I found a great example of the error handling being implemented in the following repo with great zod validation and class structures: https://github.com/parlez-vous/server, due to time constaints and struggle, I used alot of the same patterns and I would want to revisist these to fully understand the full reasoning behind evaluating success and error type classes. I've read this is a good standard to follow.
- I spent about 4 days, working very hard to learn the entire web stack so I would love to get more practise and add more functionality like the bulk style mutation and to be honest, redo the project again and again to make sure I get the full practise and re-read the docs for all the components of the web stack to get very good :D.