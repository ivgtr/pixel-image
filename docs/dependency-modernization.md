# Dependency Modernization Notes

This branch tracks investigation and planning for updating the project dependencies and removing Vercel deployment blockers around native image processing.

Initial focus areas:

- Runtime and framework support windows for Node.js, Next.js, React, and Vercel.
- Native `canvas` dependency risks and viable replacements.
- Security and maintenance status of installed runtime libraries.
- Migration plan that avoids a simple blind version bump.
