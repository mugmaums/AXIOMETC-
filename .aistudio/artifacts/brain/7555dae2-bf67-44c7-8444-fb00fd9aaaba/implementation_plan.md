# Implementation Plan - GameX Arcade & Dedicated GameX Canvas

## Proposed Changes

### 1. Backend Route (`server.ts`)
- Add `POST /api/gamex/generate`: Uses Gemini 3.8 Flash (`gemini-3.8-flash`) to generate complete, self-contained, interactive HTML5 Canvas games (with game loops, controls, retro audio effects, and score tracking) based on user game search queries.

### 2. GameX Workspace & Dedicated GameX Canvas (`src/components/gamex/GameXContainer.tsx`)
- Build a dedicated GameX environment featuring two core tabs:
  - **`🔍 Search & Synthesize`**: Search bubble for games (Poki, CrazyGames, Funox catalog synthesis) that generates live playable games using Gemini 3.8 Flash.
  - **`🕹️ Dedicated GameX Canvas`**: A dedicated arcade canvas workspace storing installed games in an interactive arcade cabinet grid layout with high-score tracking, launch/play modes, and persistent storage (localStorage & Firestore).

### 3. Navigation & App Integration (`Navbar.tsx`, `App.tsx`)
- Register `'gamex'` view in `App.tsx` and add a `🎮 GameX Arcade & Canvas` entry in `Navbar.tsx`.

## Verification Plan
- **Automated Tests**:
  - Run `lint_applet` and `compile_applet` to verify zero TypeScript or compilation errors.
- **Manual Verification**:
  - Search for games in the search bubble and verify instant generation.
  - Test installing games onto the dedicated GameX Canvas and playing them in the fullscreen arcade cabinet player.
