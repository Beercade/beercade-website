# Holding page

A standalone "Back shortly." page for `beercade.com.au` while the old Squarespace
site comes down and the new site is finished. One self-contained file
(`index.html`) — embedded logo, brand palette, Archivo via Google Fonts,
`noindex`. Not part of the Next app build; it lives here only for version control.

## Deploy

Its own Vercel project, separate from the main site:

- **Root Directory:** `holding`
- **Framework Preset:** Other (no build command — it just serves `index.html`)

CLI equivalent, from the repo root:

```bash
vercel deploy --prod --yes --cwd holding
```

## DNS (at Netregistry)

DNS for `beercade.com.au` is managed at Netregistry (`ns1/2/3.netregistry.net`).
The domain currently points at Squarespace; repoint the **website** records to
Vercel. Leave email records (`MX`, and any SPF/DKIM/DMARC `TXT`) untouched.

| Type  | Name / Host | Value                            | Replaces (Squarespace)                                   |
| ----- | ----------- | -------------------------------- | -------------------------------------------------------- |
| A     | `@` (root)  | `76.76.21.21`                    | `198.185.159.144/145`, `198.49.23.144/145` (delete all)  |
| CNAME | `www`       | `cname.vercel-dns.com`           | `ext-cust.squarespace.com`                               |

Notes:

- Use whatever values the Vercel project's **Settings → Domains** screen shows for
  this domain if they differ from the above — that screen is authoritative.
- Lower the **TTL** on these two records to **300s** a few hours before the switch
  so it propagates quickly.
- Vercel auto-issues the HTTPS certificate within a few minutes once the records
  resolve to it.

## At launch

Move `beercade.com.au` (and `www`) off this holding project and onto the main
site project in Vercel. No registrar changes needed — the DNS already points at
Vercel.
