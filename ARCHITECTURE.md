# Code Architecture

This project follows a domain-based architecture to maintain separation of concerns and improve code organization.

## Directory Structure

```
src/
├── constants/             # All constants organized by domain
│   ├── global/            # Global application constants
│   │   └── global.js      # Core application constants
│   ├── contents/          # Contents-specific constants
│   │   ├── animation.js   # Animation constants for Contents
│   │   ├── config.js      # Configuration constants for Contents
│   │   └── layout.js      # Layout constants for Contents
│   └── magazines/         # Magazine-specific constants
│       ├── animation.js   # Animation constants for Magazines
│       └── layout.js      # Layout constants for Magazines
├── helpers/               # Helper functions organized by domain
│   ├── global/            # Global utility functions
│   │   ├── animation.js   # Animation utility functions
│   │   ├── device.js      # Device detection utilities
│   │   └── throttle.js    # Performance optimization utilities
│   ├── contents/          # Contents-specific helpers
│   │   ├── position.js    # Position calculation for Contents
│   │   └── utils.js       # Utility functions for Contents
│   └── magazines/         # Magazine-specific helpers
│       ├── interaction.js # Interaction handlers for Magazines
│       └── position.js    # Position calculation for Magazines
├── state/                 # State management
│   └── atoms/             # Jotai atoms organized by domain
│       ├── global.js      # Global application state
│       ├── contents.js    # Contents-specific state
│       └── magazines.js   # Magazine-specific state
└── components/            # UI components
    ├── canvas/            # 3D components using Three.js/R3F
    └── dom/               # Regular React components
```

## Import Conventions

For simplified imports, each domain directory includes an index.js file that exports all its members. This allows for clean imports:

```javascript
// Import from domain level
import { ANIMATION, LAYOUT } from '@/constants/contents';
import { calculateStackPositions } from '@/helpers/contents';
import { focusedMagazineAtom } from '@/state/atoms/magazines';

// Import everything 
import * as Constants from '@/constants';
import * as Helpers from '@/helpers';
import * as Atoms from '@/state/atoms';
```

## Domain Separation

The codebase is organized around two main domains:

### Contents Domain

The Contents domain manages the interactive skill visualization, including:
- Skill stacks and text elements
- Animation and positioning logic
- Interaction handling

### Magazines Domain

The Magazines domain handles the interactive magazines, including:
- Magazine carousel and pages
- Page turning animations
- Focus and interaction states

## Shared Global Utilities

Global utilities and constants that are used across multiple domains are placed in the `global` directories. These include:

- Device detection and responsive layout utilities
- Performance optimization (throttle, debounce)
- Common animation utilities 
- Color and style constants

## State Management

State is managed using Jotai atoms, organized by domain:

- `global.js`: Application-level state (loading, navigation)
- `contents.js`: State specific to the Contents visualization
- `magazines.js`: State specific to the Magazine carousel

This organization makes it easy to understand which atoms affect which parts of the application, and prevents unnecessary re-renders by isolating state changes to specific domains.

## Benefits of This Architecture

1. **Maintainability**: Related code is grouped together, making it easier to understand and modify.
2. **Discoverability**: New developers can quickly locate code by understanding the domain structure.
3. **Scalability**: New features can be added to existing domains or as new domains without refactoring.
4. **Testability**: Domain separation facilitates more focused unit tests.
5. **Performance**: Better code organization leads to more efficient bundling and loading.