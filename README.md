# Breamdown of Task

## Tech Stack
NodeJS
TypeScript
YogaGQL
Pothos GQL
Prisma
Zod
Vitest

### Requirements :

### Data Model
---
Define two related models, stored via Prisma :

TaskList {
    id
    name
    createdAt
    Has many tasks
}

Task {
    id
    title
    completed
    createdAt
    updatedAt
    Belongs to a task list
}

IMPORTANT - PostgreSQL via DOCKER COMPOSE

### GraphQL Schema
---
Queries :
- taskList - return all task lists
- tasks: return tasks for a given list with:
Filtering by completion status
Pagination (offset or cursor - EXPLAIN WHY)
- task - return a single task

Mutations :
- addTaskList
- addTask
- updateTask - partial updates (e.g title and or completed)
- deleteTask

All query and mutation inputs MUST be validated using Zod

### Error handling
 - Requests for records that don't exist - should fall in a consistent deliberate way
 - Errors returned to client include a machine readable code alongside human readable message
 - Explain how structured internally (custom error classes, result types or otherwise)

### BONUS - Testing
 - Write tetst using Vitest for at least two resolvers of your choice
 - Choose what to test and what level (unit vs integration)

# Include
 - Setup instructions with docker
 - Decisions section
 - A brief note on what ou would do differently or add with more time

 ### Bonus 
 Pick two :
  - Avoiding N+1 queries when resolving tasks within task lists (Data Loader)
  - Explicit error modelling with typed results (Neverthrow)
  - Linting and formatting setup with a config you'd defend (e.g Biome) ideally enforced via a git hook
  - A completeAllTasks style bulk mutation with sensible Semantics