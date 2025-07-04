**RunawayJellyfish** is a React function component that renders a 512×512 SVG jellyfish which flees from the cursor, shivers when hovered, blinks, breathes, sways its tentacles, and eases back to its origin.

---

### 1. Shapes & SVG Structure

- **Body circle**: `<path>` with a soft gradient fill, transform‑squish on motion or sinusoidal “breathing” when idle.
- **Inner white circle**: `<path>` representing the white of the eye, scales vertically on blink or flight.
- **People eye (iris)**: `<circle>` filled dark teal, offset along movement vector (12 px vs. 8 px) and squashes on blink.
- **Pupil circle**: `<circle>` white—follows iris angle, scales faster during flight.
- **Shine on eye**: small `<circle>` highlight with opacity tied to `isMoving`.
- **Tentacles**: six `<path>` shapes, each with its own `wave` offset and base `scale`; idle sway uses `sin(timestamp*0.008)`, flight uses `sin(timestamp*0.015)` for dramatic 20° rotations.
- **Emphasers (particles)**: three small `<circle>` elements rendered only while fleeing, with sine‑modulated opacity to simulate floating dust or bioluminescence.

---

### 2. State & Refs

- **position** & **originalPosition** (`{x,y}`): current vs. home coordinates.
- **mouse** (`{x,y}`): last cursor position in container.
- **isBlinking**, **isMoving**, **isReturning**: phase flags for blink, flee, and return.
- **movementDirection**: angle away from cursor (radians).
- **velocity** (`{x,y}`): per‑frame delta to compute body squish.
- **squishFactor**: 0.7–1.0 scale applied to body circle under load.
- **Refs**:

  - `containerRef` for bounding box.
  - `prevPositionRef` for previous coords.
  - `returnIntervalRef` for the easing‐back interval.

---

### 3. Mouse Interaction & Flee Logic

- On every `mousemove`:

  1. Compute `distance = √[(mouseX–x)² + (mouseY–y)²]`.
  2. If `<100 px`, cancel any return interval, set `isMoving=true`.
  3. Calculate `angle = atan2(y–mouseY, x–mouseX)`, then

     ```
     speed = max(120, 300–distance) * 0.2
     newX = x + cos(angle)*speed
     newY = y + sin(angle)*speed
     ```

  4. Clamp `newX,newY` within container minus 80 px padding.
  5. Compute `velocity = (newX, newY) – prevPosition`;
     `squishFactor = max(0.7, 1 – |velocity|*0.03)`.

- When cursor moves away (`distance ≥100 px`):

  - Clear `isMoving`, reset `squishFactor=1`.
  - If > 20 px from home, start `returnInterval`: each 16 ms,

    ```
    dx = homeX–x; dy = homeY–y;
    x += dx*0.08; y += dy*0.08;
    ```

    until within 8 px, then stop and clear flags.

---

### 4. Animations & Phases

- **Idle**

  - **Breathing**: `bodyScale = 1 + sin(time*0.003)*0.02`.
  - **Tentacle sway**: ±5° via `sin(time*0.008 + wave)`.

- **Flee**

  - **Movement**: body rotates ±15°, scales to 1.15×, drop‑shadow deepens.
  - **Tentacles**: ±20° waves.
  - **Particles**: three circles at fixed offsets, opacity `sin(time*freq)+0.5`.

- **Blink**

  - Every 1.5–3.5 s, `isBlinking=true` for 150 ms: eye white and iris scaleY→0.1.

- **Jitter (direct hover)**

  - When cursor lands exactly over the jellyfish, the `distance → 0` drives `speed→300`, then bounce back → distance increases → speed drops → repeats, causing rapid shivers (“panicked” oscillation).

---

### 5. Performance & Cleanup

- **Refs** prevent extra renders.
- Bounding‑box read once per mouse event.
- All event listeners and intervals cleared in cleanup functions.

---

### 6. Prop

- `scale` (default 1): uniform multiplier applied to all dimensions, transforms, and shadow offsets.
