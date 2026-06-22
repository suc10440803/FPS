# Agent Notes

## Project Testing Preference

- This is a Three.js FPS prototype, and hands-on weapon/gameplay verification is difficult for agents because pointer lock, fast combat, and first-person weapon positioning are not reliably testable through automation.
- After code changes, do not automatically run browser gameplay tests or try to manually play the FPS unless the user explicitly asks for it.
- Prefer code inspection and narrowly scoped edits. Run build/static checks only when they are clearly useful or explicitly requested, and keep the user informed if a change was not playtested.
- For visual weapon placement, make conservative coordinate adjustments based on the user's screenshot and avoid extended automated play sessions.
