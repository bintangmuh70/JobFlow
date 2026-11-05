<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- JobFlow is a single-route mobile app: screens are switched via an in-memory stack in `src/jobflow/store.tsx` (no backend, data resets on reload) because the brief requires dummy in-memory state.
- The app renders client-only (mounted flag in `src/routes/index.tsx`) because dummy schedules are relative to the current time.
- Kanban search/filter is view-only state in `kanban.tsx` using the pure `filterApps` in `data.ts`, so filtering never mutates application data or interferes with drag-and-drop.
- Only the Kanban screen widens on tablet/desktop (shell + BottomNav `wide`); other screens keep the phone-width layout they were designed for.
