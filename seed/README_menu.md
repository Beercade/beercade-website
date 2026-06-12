# Menu seed

`menu.ndjson` is the printed bar menu transcribed from the laminated sheets
(drinks/cocktails side and how-to-play/jugs side), modelled as `menuSection`
documents. Import it once; after that the studio is the source of truth.

```bash
pnpm sanity dataset import seed/menu.ndjson production --replace
```

`--replace` overwrites the six `menuSection-*` documents if they already
exist, so re-running the import resets the menu to this file. Edits made in
the studio after import are not reflected back here.
