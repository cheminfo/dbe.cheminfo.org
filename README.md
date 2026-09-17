# dbe.cheminfo.org

Read the degree of unsaturation off a molecular formula, count it off a
structure you draw, and compare the two. Everything is computed in the page:
nothing is uploaded, and there is no service behind the site.

DBE — degree of unsaturation, double bond equivalent — is rings plus pi bonds.
From a formula it has to be **assumed**: the textbook sum counts sulfur as
divalent and phosphorus as trivalent. A sulfoxide, a sulfone and a phosphate all
break that assumption, so the formula and the drawing then give different
numbers. The calculator shows both side by side, and `/learn` says which one is
right and why.

It replaces two views of the old cheminfo visualizer — _DBE from a molecular
formula_ and _DBE from a structure_ — which lived behind a hash-routed page
nobody could link into.

## The addresses it understands

| Address            | What it opens                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `/`                | the calculator: a formula and a structure, each with its DBE, side by side                  |
| `/learn`           | what a DBE counts, element by element, and where S(II/IV/VI) and P(III/V) break the formula |
| `/learn/<section>` | one section of the explanation                                                              |
| `/exercises`       | questions in both directions, and a seeded series to hand out as a problem set              |
| `/exercises/<id>`  | one question                                                                                |
| `/reference`       | the printable cheatsheet: the contribution table and the valence rules                      |
| `/about`           | what it is built on, how to cite it, and where to report a problem                          |

### What a link can carry

| Parameter   | Page          | Meaning                                                                      |
| ----------- | ------------- | ---------------------------------------------------------------------------- |
| `mf`        | `/`, `/learn` | the formula to load — `?mf=C2H6OS`                                           |
| `smiles`    | `/`, `/learn` | the structure to load — `?smiles=CS(C)%3DO`                                  |
| `valence`   | `/`, `/learn` | the valences in force — `?valence=S6,P5`, or `table` / `expanded`            |
| `flags`     | `/`, `/learn` | which layers are drawn; `?flags=none` turns them all off                     |
| `seed`      | `/exercises`  | the seed a generated series is drawn from, so one link gives one problem set |
| `count`     | `/exercises`  | how many questions the series holds, clamped                                 |
| `level`     | `/exercises`  | `beginner`, `intermediate`, `advanced` or `mixed`                            |
| `direction` | `/exercises`  | `formula`, `structure` or `both`                                             |
| `embed`     | every page    | drop the header, the page bar and the footer — `?embed` or `?embed=1`        |
| `hide`      | every page    | comma-separated parts to leave out — `?hide=list,series`                     |

`hide` names a part positively: `intro`, `tabs`, `formula`, `breakdown`,
`valences`, `editor`, `structure`, `compare`, `examples`, `steps`, `text`,
`demos`, `list`, `series`, `hints`, `solution`. The Share button in the header
lists them, and `src/share/parts.ts` owns the names.

An unknown `hide` key is ignored, a malformed number falls back to its default
and every number is clamped, so a link written years ago still opens. **Hidden
means hidden, not disabled**: a hidden control still applies whatever the link
carries, which is how you preset a valence a student cannot switch back.

### Embedding

```html
<iframe
  src="https://dbe.cheminfo.org/exercises?embed=1&seed=4271&count=6&level=beginner&direction=both&hide=series"
  width="100%"
  height="720"
  style="border: 1px solid #ddd; border-radius: 8px"
  title="dbe.cheminfo.org — Exercises"
></iframe>
```

The calculator, preset on the sulfoxide a lecture is about:

```html
<iframe
  src="https://dbe.cheminfo.org/?embed=1&mf=C2H6OS&smiles=CS(C)%3DO&valence=S6"
  width="100%"
  height="640"
  style="border: 1px solid #ddd; border-radius: 8px"
  title="dbe.cheminfo.org — Calculator"
></iframe>
```

## Development

```sh
npm install
npm run dev        # http://localhost:10650
npm run test       # unit tests, types, tokens, deploy contract, lint, format
npm run test-e2e   # Playwright, against the built site
npm run build      # dist/, one HTML file per address, plus robots.txt and sitemap.xml
npm run og-image   # redraw public/og.png from the site record
```

The port is **10650**. It is picked rather than derived from the creation date:
that date gives 10917, which `symmetry.cheminfo.org` took the same day, and the
106xx block the family falls back to is packed tight enough that the next
derived candidate was already listening. One number for the dev server and for
compose alike — there is no backend to leave room for, and never Vite's stock 5173.

`react-cheminfo` is linked from the checkout next door
(`file:../../react-cheminfo`): this site's record is not in a published version
of it yet, so a range cannot resolve. Until it is published, a `docker build .`
needs that package resolvable inside the build context.

## Where the site is served

The build carries no mount path — every asset is written relative — so one
image and one tag serve `https://dbe.cheminfo.org/` and a path of a shared host.

- `BASE_PATH` is stamped into the `<base href>` of every page when the container
  starts, and is what resolves the assets and the links at run time.
- `SITE_URL` is a **build-time** argument: what the canonical link, the social
  card, `robots.txt` and `sitemap.xml` name, so a mirror still points a crawler
  back at the published address.

```sh
docker build --build-arg SITE_URL=https://www.cheminfo.org/dbe/ .
```

## Deployment

```sh
cp .env.example .env
# uncomment exactly one COMPOSE_FILE line
docker compose up -d
```

| Mode              | `COMPOSE_FILE`               | Exposure                                    |
| ----------------- | ---------------------------- | ------------------------------------------- |
| Port-published    | `compose.yaml` (the default) | publishes `PORT` on the host                |
| Traefik           | `compose.traefik.yaml`       | behind the reverse proxy, no published port |
| Cloudflare Tunnel | `compose.cloudflared.yaml`   | behind the tunnel, no published port        |

Never deploy by hand with `git pull && docker compose up -d --build`: the build
overwrites the running tag in place while `git pull` moves the source underneath
it, leaving neither an image nor a commit to go back to. The server's own
`deploy.sh` tags each build immutably, probes `/health` and rolls back. It is a
global script on the server, and there is no deploy command in this repository.

## Environment

| Variable          | Where                 | Meaning                                                                                                                                                         |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPOSE_FILE`    | `.env`                | which deployment mode is in force                                                                                                                               |
| `IMAGE_NAME`      | `.env`                | the image every compose file runs — `ghcr.io/cheminfo/dbe.cheminfo.org`                                                                                         |
| `IMAGE_TAG`       | `.env`                | the tag deployed; rewritten by `deploy.sh`, never by hand                                                                                                       |
| `PORT`            | `.env`, `npm run dev` | the host port, and the dev server's own                                                                                                                         |
| `BASE_PATH`       | container             | where this deployment is mounted; unset means `/`                                                                                                               |
| `TRACKING_SCRIPT` | container             | the analytics snippet, verbatim, injected at the end of `<head>` of every page the container serves. Unset, nothing is loaded, which is what `npm run dev` gets |
| `TUNNEL_TOKEN`    | `.env`                | the Cloudflare Tunnel token, for that mode only                                                                                                                 |
| `SITE_URL`        | build argument        | the published address the head and the sitemap are written from                                                                                                 |

## How to cite

`/about` carries the citation entries, in the formats the Cite button copies.

## Licence

MIT. `CHANGELOG.md` says what changed and when.
