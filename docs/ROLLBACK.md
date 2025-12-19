# Rollback Procedure - Frontend Modernization

If critical issues are discovered after the modernization, follow this guide to roll back changes.

## Quick Full Rollback

### Option 1: Use Backup Branch (Recommended)
```bash
# Switch to backup branch (created before modernization)
git checkout backup/pre-modernization

# Create new branch for deployment
git checkout -b hotfix/rollback-modernization

# Deploy this branch
```

### Option 2: Revert Feature Branch
```bash
# Get the merge commit hash
git log --oneline | grep "Modernize React frontend"

# Revert the merge
git revert -m 1 <merge-commit-hash>

# Deploy
```

## Partial Rollback

If only specific changes need reverting:

### Revert React 19 → React 17
```bash
# Edit package.json
"react": "17.0.2",
"react-dom": "17.0.2",
"@types/react": "17.0.30",
"@types/react-dom": "17.0.9"

# Revert main.tsx
git checkout HEAD~1 apps/starship-mayflower-frontend/src/main.tsx

# Reinstall
yarn install

# Test
yarn build
```

### Revert Nx 20 → Nx 13
```bash
# Edit package.json - restore @nrwl packages
"@nrwl/cli": "13.2.3",
"@nrwl/cypress": "13.3.0",
"@nrwl/jest": "13.2.3",
# ... (all other @nrwl packages)

# Remove @nx packages
# Remove: "@nx/workspace", "@nx/react", etc.

# Restore old configs
git checkout HEAD~1 nx.json
git checkout HEAD~1 apps/starship-mayflower-frontend/project.json
git checkout HEAD~1 apps/starship-mayflower-frontend/.babelrc

# Remove new webpack config
rm apps/starship-mayflower-frontend/webpack.config.js

# Reinstall
yarn install

# Test
yarn build
```

### Revert ESLint 9 → ESLint 7
```bash
# Edit package.json
"eslint": "7.32.0",
"@typescript-eslint/eslint-plugin": "~4.33.0",
"@typescript-eslint/parser": "~4.33.0"

# Remove new packages
# Remove: "@eslint/js", "@eslint/eslintrc", "typescript-eslint"

# Restore old config, remove new one
git checkout HEAD~1 .eslintrc.json
rm eslint.config.mjs

# Reinstall
yarn install

# Test
yarn lint
```

### Revert TypeScript 5.7 → 4.4
```bash
# Edit package.json
"typescript": "~4.4.3",
"@types/node": "14.14.33"

# Restore old tsconfig
git checkout HEAD~1 tsconfig.base.json

# Reinstall
yarn install

# Test type checking
yarn type-check
```

## Testing After Partial Rollback

After any partial rollback, run these tests:

```bash
# 1. Clean install
rm -rf node_modules yarn.lock
yarn install

# 2. Type check
yarn type-check

# 3. Lint (if ESLint still works)
yarn lint

# 4. Build
yarn build

# 5. Start dev server
yarn start
```

## Common Rollback Scenarios

### Scenario 1: Build Fails After Deployment
**Symptoms**: Production build fails, errors in webpack/babel

**Solution**:
```bash
# Quick rollback to backup branch
git checkout backup/pre-modernization
git checkout -b hotfix/build-fix
# Deploy immediately
```

### Scenario 2: Runtime Errors in Production
**Symptoms**: App loads but crashes, React errors in console

**Solution**:
```bash
# Revert only React 19 changes
git checkout HEAD~1 apps/starship-mayflower-frontend/src/main.tsx
git checkout HEAD~1 apps/starship-mayflower-frontend/src/app/app.tsx

# Update package.json to React 17
# Commit and deploy
```

### Scenario 3: TypeScript Errors Everywhere
**Symptoms**: Too many TypeScript errors, can't fix quickly

**Solution**:
```bash
# Revert TypeScript upgrade only
git checkout HEAD~1 tsconfig.base.json
# Edit package.json: typescript@~4.4.3
yarn install
yarn build
```

### Scenario 4: ESLint Blocking Development
**Symptoms**: ESLint errors everywhere, team blocked

**Solution**:
```bash
# Quick fix: Disable ESLint temporarily
echo "export default [];" > eslint.config.mjs

# Or revert ESLint completely (see above)
```

## Emergency Procedures

### If Git History is Lost
1. Check if `pre-upgrade-dependencies.txt` exists in root
2. Use those versions to manually restore package.json
3. Reinstall and rebuild

### If Backup Branch is Missing
1. Look for tags: `git tag -l`
2. Check remote: `git branch -r | grep backup`
3. Use git reflog to find old commits: `git reflog`

### If All Else Fails
1. Clone fresh repository from remote
2. Checkout last known-good commit
3. Deploy that version
4. Investigate modernization issues separately

## Verification Checklist

After rollback, verify these work:

- [ ] `yarn install` completes without errors
- [ ] `yarn build` produces valid bundle
- [ ] App starts without errors (`yarn start`)
- [ ] Can navigate between routes
- [ ] WebSocket connects successfully
- [ ] Redux state updates correctly
- [ ] No console errors in browser

## Prevention for Future

To avoid needing rollback:

1. **Always create backup branch first**
2. **Test in staging before production**
3. **Deploy during low-traffic hours**
4. **Have monitoring/alerts ready**
5. **Keep backup branch for at least 1 week**

## Contact & Support

If rollback fails or issues persist:

1. Check GitHub issues: https://github.com/feibeck/StarshipMayflower/issues
2. Review this documentation
3. Contact team lead

## Rollback Decision Matrix

| Issue Severity | Recommended Action | Timeline |
|---------------|-------------------|----------|
| Critical (app down) | Full rollback (Option 1) | Immediate |
| High (major features broken) | Full rollback or partial | Within 1 hour |
| Medium (minor issues) | Partial rollback or fix forward | Within 4 hours |
| Low (cosmetic/non-blocking) | Fix forward | Next sprint |

---

**Last Updated**: December 19, 2024
**Document Version**: 1.0
