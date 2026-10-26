# Three Doors

A showcase site for three artists: Ceralie, Julius Wren and halfsaid. Each song opens with a short story scene. Then the music swells in.

## Run it

1. Serve the folder that holds `site/` and the `Songs/` folder. `site/sound.js` loads audio from `../../Songs/...`.
2. Open `site/` in the browser, for example `http://localhost:8765/<path>/site/`.
3. After any edit, bump `?v=N` on every asset in `site/index.html`. The browser caches old scripts.

Routes: `#/` doors, `#/<artist>` room, `#/<artist>/<nn>` song scene. Artist ids: `ceralie`, `julius`, `halfsaid`.

Scene media: the site tries `site/assets/scenes/<id>.mp4`, then `<id>.jpg`, then the old loop, then the album cover. `<id>` looks like `halfsaid-03`.

## Deploy

A push to `main` deploys `site/` to GitHub Pages. Pull requests only build. In the repo settings, set Pages source to **GitHub Actions**.

Vercel also deploys the site. `vercel.json` sets the output folder to `site/`. Each pull request gets its own preview URL.

The audio files are not in this repo. Until they have a host, songs do not play online.
