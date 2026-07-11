# PacAbacus

PacAbacus is a responsive React learning game that combines soroban practice, word play,
times tables, and mental math with maze and number-rain game modes.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run lint
npm run build
```

Player profiles and settings are stored locally in the browser. Progress uses per-world
`worldLevels` and `worldStars` fields; the older adventure/counting fields remain only for
backward-compatible save migration.
