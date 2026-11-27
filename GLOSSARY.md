# Glossary

Domain language for the Quiet Rumble Machine. The app embeds a step sequencer
*inside* a QR code: the same grid of cells is read both as QR modules and as
sequencer controls.

## Core concepts

- **Grid** — the single square of cells rendered into `#container`. Every cell
  is a QR module at `(row, col)`; the cells inside the sequencer block are also
  sequencer controls.
- **QR node** — one QR module ("pixel"), on or off. Rendered as
  `.qr-brick-on` / `.qr-brick-off`.
- **Sequencer** — the drum grid embedded in the QR. Addressed by `(track, step)`.
- **Track** — one row of the sequencer; one instrument (kick, snare, hihat,
  clap). There are `tracks` of them.
- **Step** — one column position within a track; on means the instrument fires
  on that beat. There are `steps` of them, split into two halves either side of
  the spacer.
- **Spacer** — the QR's central blank column, which reads as the gap in the
  middle of the sequencer block.
- **Border** — the frame drawn around the sequencer block (`.sequencer-border`).
- **Playhead** — the lit column that tracks the current step during playback.

## Modules (seams)

- **Grid geometry** (`gridGeometry.js`, `GridGeometry`) — the single owner of
  the map between `(row, col)` and `(track, step)`. Given the QR size and the
  sequencer dimensions, it answers `cellKind`, `toCell`, `toStep`, and
  `columnForStep`. Pure; no DOM. This is the deep module the geometry magic
  numbers (7, 8, 9, 10, 11, 18, 37) used to be smeared across.
- **State codec** (`stateCodec.js`, `StateCodec`) — serializes sequencer state
  to and from the hex string in the URL hash. Owns the dimension contract
  (`{ tracks, steps }`), so `encode` and `decode` always agree. Pure; round
  trip is the test surface.
- **URL manager** (`urlManager.js`) — keeps the browser hash in sync with state
  and owns URL assembly (`getCurrentUrl`). Uses an injected state codec.
- **Sequencer state** (`sequencer.js`) — the in-memory `tracks x steps` grid of
  booleans and its validation.
- **Grid renderer** (`userInterface.js`) — renders QR nodes, steps, and the
  playhead, driven entirely by an injected grid geometry.
- **Audio engine** (`audio.js`) — Tone.js instruments and the playback loop.
  Reports the current step over an `onStep` seam; never touches the DOM.
