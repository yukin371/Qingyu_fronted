# Plans Directory Migration Notice

This directory is a legacy redirect only.

## New Location

Frontend submodule planning and design files were moved to:

- `docs/plans/submodules/frontend/`

## Current State

- The historical duplicate plan files under `Qingyu_fronted/docs/plans/` have been removed from the submodule working area.
- This directory now keeps only this README as a redirect stub.
- If you need a historical frontend plan, read the parent repo index first:
  - `docs/plans/submodules/frontend/README.md`

## Topic Mapping

- `api-and-testing/`: API verification, unified error handling, E2E implementation plans
- `architecture/`: frontend architecture refactor, debt cleanup, execution tracking
- `reader-experience/`: browse page, reader Tailwind refactor, reader-facing UX plans
- `writer-workspace/`: editor layout, character graph, writer interaction planning
- `legacy/`: retired migration plans, old API design docs, archived verification reports

## Effective Rule

Starting from 2026-04-07:

- Do not add new plan/design files under `Qingyu_fronted/docs/plans/`.
- Add new plan/design files under `docs/plans/submodules/frontend/` in the parent repository.

## Why

This keeps plan/design governance centralized at parent repo level and avoids fragmented planning context across submodules.
