# OpenAir Website

This is the official website for [OpenAir](https://github.com/OpenAir-Podcast/OpenAir), a free, open-source, cross-platform podcast player.

Built with [Angular 21](https://angular.dev/). Serves as the public-facing site with download links, documentation, blog, privacy policy, and contribution guides.

## Development

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app auto-reloads on source changes.

## Build

```bash
ng build
```

Build artifacts go to `dist/`. Production builds are optimized for performance.

## Test

```bash
ng test
```

Unit tests run via [Vitest](https://vitest.dev/).

## Deploy

Pushes to `main` automatically build and deploy to GitHub Pages via GitHub Actions.
