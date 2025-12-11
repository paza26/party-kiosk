# GitHub Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 🧪 CI (`ci.yml`)

**Triggers:** Push or PR to `main` or `develop`

**Jobs:**
- **Test & Build** - Run all 495 tests with coverage
- **Code Quality** - TypeScript type checking and build verification

**Matrix:** Node.js 20.x

**Steps:**
1. Checkout code
2. Setup Node.js with npm cache
3. Install dependencies (`npm ci`)
4. TypeScript type check
5. Run tests with coverage
6. Upload coverage to Codecov
7. Build web export

### 🚀 Release (`release.yml`)

**Triggers:** Push tag matching `v*` (e.g., `v1.0.0`)

**Jobs:**
- Run tests
- Build production web bundle
- Generate changelog from commits
- Create GitHub Release with notes
- Upload web build artifact

**Usage:**
```bash
npm version patch  # 1.0.0 -> 1.0.1
git push origin v1.0.1
```

### 📱 Expo Build (`expo-build.yml`)

**Triggers:**
- Push tag matching `v*`
- Manual workflow dispatch

**Platforms:** iOS, Android, Web

**Requirements:**
- `EXPO_TOKEN` secret (for Expo builds)

**Jobs:**
- Build Android APK/AAB
- Build iOS IPA
- Build web bundle
- Upload artifacts

**Manual Trigger:**
```
GitHub Actions → Expo Build → Run workflow → Select platform
```

## Secrets Required

Configure these in repository settings:

| Secret | Purpose | Required For |
|--------|---------|--------------|
| `EXPO_TOKEN` | Expo authentication | Expo builds |
| `GITHUB_TOKEN` | Automatic (provided by GitHub) | Releases |

## Branch Protection

Recommended settings for `main` branch:

- ✅ Require pull request reviews (1+)
- ✅ Require status checks: `Test & Build`, `Code Quality`
- ✅ Require branches up to date
- ✅ Require linear history
- ❌ Allow force pushes
- ❌ Allow deletions

## Workflow Status Badges

Add to main README.md:

```markdown
![CI](https://github.com/yourusername/party-kiosk/workflows/CI/badge.svg)
![Release](https://github.com/yourusername/party-kiosk/workflows/Release/badge.svg)
```
