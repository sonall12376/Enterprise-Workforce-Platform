# Git Workflow & GitHub Collaboration Guide

This guide details the branching, code review, merging, and release processes for the 4-developer engineering team.

---

## 1. Branch Strategy

We use a modified Git Flow strategy focusing on isolated feature branches and a shared integration branch:

```text
  main (Protected)     -------------------------------------------- [Releases]
                         ▲
                         │ (Pull Request via Admin)
  develop (Default)    -------------------------------------------- [Integration]
                         ▲               ▲
                         │ (Pull Req)    │ (Pull Req)
  feature branches     --[feature/...]----[feature/...]------------ [Dev Work]
```

### Core Branches
- **`main`**: Production code. Direct pushes are disabled. This branch contains stable releases and must compile without errors at all times.
- **`develop`**: Integration branch. All features must be merged into `develop` before production release.

---

## 2. Feature & Bugfix Branches

Developers create isolated branches for code modifications:
- **Feature Branches:** Created for new feature cards. Name format: `feature/[developer-initials]-[feature-name]` (e.g. `feature/am-leave-balances`).
- **Bugfix Branches:** Created for defects found in `develop`. Name format: `bugfix/[developer-initials]-[issue-desc]` (e.g. `bugfix/jd-token-expiry`).

### Step-by-Step Flow:
1. Fetch latest changes from remote:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Create and checkout a new branch:
   ```bash
   git checkout -b feature/am-leave-balances
   ```

---

## 3. The Pull Request (PR) Process

Once development and local testing are complete:
1. Push branch to GitHub:
   ```bash
   git push origin feature/am-leave-balances
   ```
2. Open a Pull Request on GitHub targeting the `develop` branch.
3. Complete the PR template, listing the features added and verification tests performed.
4. Assign at least one reviewer from the development team.

---

## 4. Code Review Guidelines

- **Requirements:** Every PR requires at least **one approved review** from a team member prior to merging.
- **Reviewer Tasks:**
  - Verify code matches project [Coding Guidelines](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/coding-guidelines.md).
  - Look for potential bugs, logical issues, security flaws, or typing errors.
  - Reviewers can comment on lines and select `Approve` or `Request Changes`.
- **Addressing Feedback:** If changes are requested, the author commits updates directly to the feature branch. The PR will automatically update.

---

## 5. Merging & Protected Branches

### Branch Protection Rules (GitHub Settings)
- The `main` and `develop` branches are protected.
- Require pull request reviews before merging.
- Require status checks to pass before merging (e.g., CI compile checks).
- Restrict pushes (no developer can push directly to `main` or `develop`).

### Merge Method
- We use **Squash and Merge** when integrating feature branches into `develop`. This groups all commit histories of the feature branch into a single clean commit on `develop`, keeping git logs clean.
- Delete the feature branch from remote after a successful merge.

---

## 6. Conflict Resolution

If a merge conflict occurs:
1. Do **not** attempt to resolve conflicts inside the GitHub web UI.
2. Pull the target branch locally:
   ```bash
   git checkout develop
   git pull origin develop
   ```
3. Checkout your feature branch and merge `develop` into it:
   ```bash
   git checkout feature/am-leave-balances
   git merge develop
   ```
4. Open the conflicting files in your editor, search for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), resolve the conflict, save, and stage:
   ```bash
   git add resolved_file.ts
   ```
5. Commit and push the conflict resolution update:
   ```bash
   git commit -m "chore: resolve merge conflicts with develop"
   git push origin feature/am-leave-balances
   ```

---

## 7. Release Strategy

1. When `develop` is stable and ready for release, Developer A (Core Lead) initiates a PR from `develop` into `main`.
2. Once the PR is approved and merged, a Git release tag is created following semantic versioning:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
3. The release tag triggers the automated deployment pipeline for production hosting.
