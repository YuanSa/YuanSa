# Self-hosted Lyricue

The Projects page links directly to `/projects/lyricue/`. The complete playground
is hosted here: HTML, JavaScript, CSS, Qianyin artwork, and the maintainer-provided
demo audio. Lyrics are bundled into JavaScript. No GitHub Pages, CDN, npm, or
external font requests are needed to use it. GitHub remains an optional source link.

`website/projects/lyricue/` contains generated release artifacts, not a second
implementation. Maintain the editor and playground in the
[Lyricue repository](https://github.com/qianyinshi/lyricue).
The MIT license is included as `LICENSE.txt`; `release.json` records provenance.

## Update

1. Set the version and full upstream commit SHA in `scripts/lyricue-release.json`.
2. With Node.js 24, npm, Git, and tar installed, run `make sync-lyricue`.
3. Run `make dev` and check the Projects page and `/projects/lyricue/` on desktop
   and mobile, including loading demo music, keyboard timing, and LRC export.
4. Deploy with the site's existing `make deploy-website` command when approved.

The update builds a clean export of the pinned upstream commit in a temporary
directory. For a locally available Git checkout, run
`node scripts/sync-lyricue.mjs /path/to/lyricue` instead. This still exports only
the pinned commit and ignores local modifications and old builds. Visitors and
normal site deployments do not require the upstream checkout, Node, or npm.

Keep the generated assets in Git so the static site's deployment stays unchanged.
Do not edit minified artifacts directly. The Projects screenshot lives separately
at `website/assets/projects/lyricue-preview.jpg` and can be refreshed after UI changes.

Lyricue uses localStorage and IndexedDB on this site's origin. Existing work on
the GitHub Pages origin does not transfer automatically; visitors can import LRC
and their audio to continue here.
