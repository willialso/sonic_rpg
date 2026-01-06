# Sonic for Hire: Console University - V4

## Modern Mobile-First Text Adventure Game

A complete redesign with a modern iPad/iPhone interface featuring:
- **Large scene images** taking up most of the screen
- **Touch-based action buttons** for navigation and interactions
- **Speech bubbles** for character dialogue
- **Action bubbles** for comic-style event notifications
- **Typeable dialogue** input for conversations
- **Clean, professional design** inspired by modern mobile games

## Features

### UI/UX
- **Floating Action Menu** - Clean, modern action button system (bottom-right)
- **Comic-style Speech Bubbles** - Top-left (characters) and top-right (user)
- **Full-screen Background Images** - Images fill entire screen
- **Modal Overlays** - For important content like orientation schedule
- **Smooth Animations** - Slide-in effects, bounce animations
- **Touch-optimized** - Large tap targets, responsive design
- **Comic Fonts** - Comic Neue/Comic Sans MS for authentic comic book feel

### Gameplay
- Start screen with enrollment
- Dean's Office introduction
- Name input via dialogue
- Orientation message
- Quad exploration
- Earthworm Jim conversation with puzzle
- Multiple locations to explore

## Quick Start

### Local Development

```bash
cd sonic-rpg-v4
python3 -m http.server 8000
```

Then open: http://localhost:8000

### Using Node.js

```bash
cd sonic-rpg-v4
npx http-server
```

## File Structure

```
sonic-rpg-v4/
├── index.html          # Main HTML structure
├── style.css           # Modern mobile-first styling
├── script.js           # Game engine and logic
├── manifest.json       # PWA manifest
├── data/
│   └── game.json       # Game data (locations, NPCs, dialogue)
└── assets/
    └── images/         # Scene images (add your PNGs here)
```

## Adding Images

Place your scene images in `assets/images/` with these filenames:

### Scene Images (Full Screen Backgrounds)
- `console_university_sign.png` - Start screen (shown behind welcome screen)
- `dean_office.png` - Dean's Office scene
- `quad.png` - Quad scene
- `cafeteria.png` - Cafeteria scene
- `frat.png` - Frat House scene
- `classrooms.png` - Classrooms scene
- `dorms.png` - Dorms scene
- `stadium.png` - Stadium scene

### NPC Portraits (Shown when talking to NPCs)
- `dean_cain.png` - Dean Cain portrait (shown when talking in Dean's Office)
- `earthworm_jim.png` - Earthworm Jim portrait (shown when talking in Quad)

### Other Images
- `orientation_schedule.png` - Orientation schedule document (shown in modal)

**Image Specifications:**
- **Scene Images**: **1080x1920px** (portrait, 9:16 aspect ratio) - Recommended for full-screen mobile
  - Will fill entire screen using `object-fit: cover`
  - Works perfectly on iPhone and iPad portrait mode
  - Will crop appropriately on landscape devices
- **NPC Portraits**: **800x1000px** (portrait, 4:5 aspect ratio)
  - Shown as overlay when talking to NPCs
  - Centered and scaled to fit
  - Transparent background recommended
- **Orientation Schedule**: **600x800px** (portrait, 3:4 aspect ratio)
  - Document-style image shown in modal
- **Format**: PNG with transparent backgrounds where appropriate

## Game Flow

1. **Start Screen**: "Congratulations on your acceptance to Console University"
2. **Dean's Office**: Name input, orientation message
3. **Quad**: Explore campus, talk to Jim
4. **Jim's Puzzle**: Answer "315" for the sorority pillow fight time
5. **Exploration**: Visit other locations

## Customization

### Adding New Locations

Edit `data/game.json` and add to `locations`:

```json
{
  "id": "new_location",
  "name": "New Location",
  "image": "assets/images/new_location.png",
  "description": "Description here",
  "exits": ["quad"]
}
```

### Adding New NPCs

Edit `data/game.json` and add to `npcs`:

```json
{
  "id": "new_npc",
  "name": "NPC Name",
  "greeting": "Hello!",
  "responses": {
    "key": "Response text"
  }
}
```

## Technical Details

- **Pure JavaScript** - No frameworks required
- **CSS Grid/Flexbox** - Modern layout
- **Mobile-first** - Optimized for touch
- **PWA Ready** - Can be installed as app
- **Responsive** - Works on all screen sizes

## Browser Support

- Safari (iOS 12+)
- Chrome (Android/iOS)
- Firefox
- Edge

## Notes

- Images should be optimized for mobile (recommended: 1200x1600px for iPad)
- Dialogue system supports natural language processing
- Game state persists during session
- All interactions are touch-optimized

