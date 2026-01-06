# Image Size Recommendations

## Optimal PNG Export Sizes

For images that fit cleanly both vertically and horizontally on mobile devices:

### Scene Images (Backgrounds)
**Recommended: 1080x1920px** (Portrait, 9:16 aspect ratio)

**Why this size:**
- Matches most modern phone screens (iPhone, Android)
- Will fill entire screen using `object-fit: cover`
- Works perfectly in portrait orientation
- Will crop appropriately on landscape devices
- No letterboxing or black bars

**Alternative sizes:**
- **1440x2560px** - For high-DPI displays (2x resolution)
- **750x1334px** - For older devices (iPhone 6/7/8)
- **1242x2208px** - For iPhone Plus models

### NPC Portraits
**Recommended: 800x1000px** (Portrait, 4:5 aspect ratio)

**Why this size:**
- Good balance of detail and file size
- Will be centered and scaled to fit
- Transparent background recommended

### Orientation Schedule
**Recommended: 600x800px** (Portrait, 3:4 aspect ratio)

**Why this size:**
- Document-style appearance
- Fits well in modal overlay
- Readable text size

## Export Settings

- **Format**: PNG-24 (supports transparency)
- **Color Mode**: RGB
- **Resolution**: 72 DPI (for web)
- **Transparency**: Enabled for NPC portraits
- **Compression**: None (for best quality)

## Aspect Ratio Reference

- **9:16** (Portrait) - Modern phones
- **16:9** (Landscape) - Tablets/landscape mode
- **4:5** (Portrait) - NPC portraits
- **3:4** (Portrait) - Documents

## File Size Optimization

- Use PNG compression tools (TinyPNG, ImageOptim)
- Keep file sizes under 500KB when possible
- Use JPEG for photos if transparency not needed
- Consider WebP format for modern browsers

