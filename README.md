# Demo Side Panel Extension

A Chrome Extension demo showcasing Side Panel API with tab management and page inspection features.

## Features

- **Side Panel Interface** - Three-tab layout (Home, About, Settings)
- **Tab Management** - Open/switch tabs with automatic grouping
- **Page Inspector** - Capture screenshots and extract page metadata
- **Persistent Settings** - Toggle switches with local storage

## Project Structure

```
chrome-ext/
├── README.md
├── src/                    # Extension source code
│   ├── manifest.json       # Extension configuration
│   ├── background.js       # Service worker
│   ├── sidepanel.html      # Side panel UI
│   ├── sidepanel.css       # Side panel styles
│   ├── sidepanel.js        # Side panel logic
│   ├── internal-page.html  # Built-in demo page
│   └── internal-page.js    # Demo page scripts
└── intent/                 # Task documentation
    └── task_intent.md      # Requirements & specifications
```

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `src/` directory

## Usage

1. Click the extension icon in the toolbar
2. The side panel will open on the right
3. Use the three buttons on Home tab:
   - **Open Team Portal** - Opens team.arcblock.io (reuses existing tab)
   - **Internal Demo Page** - Opens built-in demo page
   - **Current Tab Info** - Shows screenshot and page metadata

## Development

- All new tabs are automatically grouped under "demo" (blue)
- Tab queries are scoped to current window only
- Screenshots require `<all_urls>` host permission

## Tech Stack

- Chrome Extension Manifest V3
- Side Panel API
- Tab Groups API
- Scripting API for page inspection

## License

MIT
