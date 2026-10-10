# Contributing & Pull Request Guidelines

Thank you for contributing to **Arrow Escape**!

To maintain high code quality and zero regressions across our headless engine and mobile architecture, all contributions must follow this guide.

---

## 🌿 Branching Strategy

- `main`: Production-ready, stable codebase. Direct commits to `main` are restricted.
- `feature/<feature-name>`: New gameplay mechanics, visual improvements, or service additions.
- `fix/<bug-name>`: Bug fixes and patches.
- `docs/<doc-name>`: Documentation and store listing updates.

---

## 🛠️ Development Workflow

1. **Create a branch from `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Run tests before making changes**:
   ```bash
   npm test
   ```

3. **Follow the Architectural Principles**:
   - **Headless Core Engine (`src/engine/`):** Must remain 100% pure TypeScript. No DOM, React Native, or UI imports.
   - **Level Solvability:** Any newly added levels in `src/data/levels/` must be mathematically solvable. Run `npm run validate:levels` to verify.
   - **Ad & Monetization Policy:** Strictly preserve the player-first pacing rules defined in `docs/MONETIZATION_AND_SERVICES.md`. Never trigger unexpected interstitials during gameplay.

---

## ✅ Pre-Merge PR Checklist

Before submitting a Pull Request to merge into `main`, verify the following passes:

```bash
# 1. Verify unit tests pass
npm test

# 2. Verify all level designs solve
npm run validate:levels

# 3. Verify TypeScript compiles without type errors
npm run build

# 4. Verify web production build succeeds
npm run build:web
```

---

## 📝 Commit Message Convention

Follow standard Conventional Commits:
- `feat(engine): add diagonal raycasting support`
- `fix(board): fix arrow token coordinate padding offset`
- `docs(readme): add quick start commands`
- `style(arrows): upgrade 3D candy bevel highlights`
- `test(solver): add cyclic dependency timeout regression test`
