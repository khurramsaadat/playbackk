# CHANGELOG.md

## 2024-06-09
- Created DOCS folder and initialized PROGRESS.md, CHANGELOG.md, and INPUTS.md.
- Ran `npm install` to ensure all dependencies are present.
- Ran `npx tsc --noEmit` to verify type safety (no errors found).
- Noted recurring issue: 'next' not recognized as a command; resolved by using `npx next dev`.
- Directory structure:
  - DOCS/
    - PROGRESS.md
    - CHANGELOG.md
    - INPUTS.md
  - src/
  - public/
  - package.json
  - ...
- Added public/_redirects for Netlify SPA fallback.
- Added MIT LICENSE file.
- Updated README.md with Netlify deployment instructions and badge placeholder.
- Updated playback controls in src/app/page.tsx to use icons with tooltips for Start, Play, Pause, Stop, and End (ForwardIcon).
- Styled icons with Tailwind for size/color consistency.
- Added tooltips for accessibility and UX.
- Fixed all TypeScript and linting errors in src/components/WaveSurferComponent.tsx (removed any, used unknown for plugin types, removed unused variables).
- Ready for Netlify deployment and GitHub push. 

## 2024-06-14
- Merged Play and Pause buttons into a single toggle button for improved UX.
- Improved error handling for `AbortError` in `WaveSurferComponent` to only suppress expected aborts and log unexpected errors.
- Explained the cause of the recurring `AbortError` when loading new video/audio and provided a global suppression solution.
- Updated codebase per user requests and best practices.
- Directory structure:
  - DOCS/
    - PROGRESS.md
    - CHANGELOG.md
    - INPUTS.md
  - src/
    - app/
      - page.tsx
    - components/
      - WaveSurferComponent.tsx
      - ui/
        - button.tsx
        - card.tsx
        - slider.tsx
  - public/
    - favicon.svg
    - _redirects
    - ...
  - package.json
  - package-lock.json
  - README.md
  - LICENSE
  - .gitignore
  - next.config.ts
  - postcss.config.mjs
  - tsconfig.json
  - netlify.toml
  - eslint.config.mjs
  - components.json
  - .eslintignore
- Added a bold, centered red 'p' favicon (favicon.svg) to public/ for app branding.
- Cleaned up all ESLint errors in source code; added .eslintignore to exclude .next from linting.
- Removed all unused props, variables, and functions (including scrollable, marker refs, and marker drag logic) from WaveSurferComponent and page.tsx.
- Fixed useEffect dependency warnings in page.tsx.
- Confirmed type safety with `npx tsc --noEmit` (no errors).
- Committed and pushed all changes to GitHub for Netlify redeploy. 

## 2024-06-16
- Switched git remote to new repo: https://github.com/khurramsaadat/palyback4.git
- Fixed critical TypeScript and runtime issues with ffmpeg.wasm dynamic import in video-cutter-microapp/app.tsx
- Resolved casing issue with App.tsx/app.tsx for cross-platform compatibility
- Confirmed type check passes with npx tsc --noEmit
- Folder structure and static serving for micro-app verified and corrected
- All commands and changes tracked as per khurram-rules. 

## [2024-03-13]

### Dependency Fixes
- Fixed package version conflicts:
  - Locked lucide-react to v0.294.0
  - Updated Next.js to v14.0.4
  - Fixed React version to 18.2.0
  - Updated all dependencies to compatible versions
  - Added --legacy-peer-deps flag to build command
  - Set explicit Node.js and npm versions in build environment

### Build Configuration Updates
- Added Node.js version management:
  - Created `.nvmrc` file specifying Node.js v20.11.1 (LTS)
  - Added `.mise.toml` for explicit version file configuration
  - Fixed mise deprecation warnings in build process

### Deployment Fixes
- Fixed Netlify deployment configuration:
  - Updated build output directory to `.next`
  - Added proper Next.js static export configuration
  - Updated dependencies to compatible versions
  - Added Netlify configuration file
  - Fixed build and export settings

### ESLint Fixes
- Removed unused imports and functions:
  - Removed unused icon imports
  - Removed redundant handlePlayPause function
- Improved state management:
  - Used isPlaying state to disable controls during playback
  - Added proper type safety for video controls
  - Enhanced user experience with disabled states

### Project Structure
```
palyback4/
├── DOCS/
│   ├── CHANGELOG.md
│   ├── INPUTS.md
│   └── PROGRESS.md
├── video-cutter-microapp/
│   ├── app.tsx
│   ├── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .nvmrc
├── .mise.toml
├── netlify.toml
├── next.config.js
├── package.json
└── README.md
```

### Video Processing Improvements
- Implemented new single-pass cutting method with enhanced features:
  - Added keyframe analysis for optimal cut points
  - Used accurate seeking for precise cuts
  - Implemented fragmented MP4 output
  - Added audio resampling with async compensation
  - Optimized buffer sizes and bitrates
  - Improved audio/video synchronization
  - Enhanced compatibility with media players

### TypeScript Fixes
- Fixed type error in blob creation by properly handling ArrayBuffer conversion
- Improved type safety in video data handling

### UI Improvements
- Removed redundant play/pause and start/end buttons since video player's native controls provide the same functionality
- Simplified the main controls to focus on essential features (Clear A/B and Cut & Download)
- Improved UI clarity and reduced interface clutter
- Added proper disabled states for controls during video playback

### Time Format Improvements
- Updated the downloaded file naming format to use human-readable time formats:
  - For clips less than a minute: "30s"
  - For clips less than an hour: "10m30s"
  - For clips over an hour: "1h05m30s"
- Example: "video-240-246.mp4" → "video-4m00s-4m06s.mp4"

### Bug Fixes
- Fixed SharedArrayBuffer support for video processing
- Improved error handling and progress tracking during video cutting
- Added proper cleanup of temporary files after processing
- Fixed ESLint errors preventing successful build 

## 2025-06-16
### Changes
- Project state saved and prepared for GitHub repository push
- Repository URL set to: https://github.com/khurramsaadat/playbackk.git

### Current Project Structure
```
├── .cursor/
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .mise.toml
├── .next/
├── .nvmrc
├── DOCS/
│   ├── CHANGELOG.md
│   ├── INPUTS.md
│   └── PROGRESS.md
├── LICENSE
├── README.md
├── To add functionality for cutting video and download.md
├── components.json
├── netlify.toml
├── next-env.d.ts
├── next.config.js
├── next.config.ts
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.js
├── postcss.config.mjs
├── public/
├── src/
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── video-cutter-microapp/
``` 

## 2024-03-26
### Added
- Integrated stagewise toolbar for AI-powered editing capabilities
  - Installed @stagewise/toolbar-next and @stagewise-plugins/react packages
  - Added StagewiseToolbar component to root layout with development mode check
  - Created .vscode/extensions.json with stagewise extension recommendation
### Changed
- Updated package.json with latest stagewise dependencies
- Modified src/app/layout.tsx to properly handle stagewise toolbar in development mode
### Fixed
- Improved stagewise integration with proper SSR handling and development mode check 

## [2024-01-09]

### Changed
- Further optimized FFmpeg video encoding settings for faster processing:
  - Changed preset from 'veryfast' to 'ultrafast' for maximum speed
  - Added 'fastdecode' and 'zerolatency' tuning
  - Increased CRF to 28 for better compression
  - Reduced audio bitrate to 96k
  - Lowered audio sample rate to 44.1kHz
  - Using baseline profile for maximum compatibility
  - Added level 3.0 for better device support
  - Force MP4 format output

### Fixed
- Improved video processing speed significantly
- Reduced output file size while maintaining acceptable quality
- Enhanced compatibility across different devices
- Fixed slow download issues in deployed app

### Technical Details
- FFmpeg Command Changes:
  ```diff
  - '-preset', 'veryfast'
  - '-crf', '23'
  - '-profile:v', 'main'
  + '-preset', 'ultrafast'
  + '-crf', '28'
  + '-tune', 'fastdecode,zerolatency'
  + '-profile:v', 'baseline'
  + '-level', '3.0'
  + '-ar', '44100'
  ```

## [2024-03-27]
### Fixed
- Fixed video cutting functionality in production:
  - Updated FFmpeg core URL to use jsDelivr CDN consistently across all files
  - Added proper Content-Security-Policy headers in netlify.toml to allow jsDelivr CDN
  - Fixed CORS and SharedArrayBuffer support in video-cutter component
  - Removed crossOrigin attribute from iframe to fix React warning
  - Added sandbox permissions for video-cutter iframe

## [2024-03-28]
### Development Environment
- Fixed CORS issues in development:
  - Added CORS headers to Vite development server
  - Updated Next.js development server CORS configuration
  - Configured proper headers for video-cutter assets
  - Added development-specific security headers

### Security
- Fixed CORS configuration for video-cutter assets:
  - Added specific CORS headers for /video-cutter/assets/*
  - Configured proper Access-Control-Allow-Origin headers
  - Maintained security headers for SharedArrayBuffer support
  - Updated Content-Security-Policy for asset access

- Fixed iframe sandbox configuration:
  - Removed potentially unsafe allow-same-origin permission
  - Added allow-popups for download functionality
  - Maintained necessary permissions for video processing
  - Enhanced overall iframe security while preserving functionality

### UI Improvements
- Enhanced button aesthetics:
  - Increased border radius from rounded-xl (12px) to rounded-2xl (16px)
  - Applied consistent rounding to all button sizes (default, sm, lg, icon)
  - Updated icon buttons to match the new rounded style
  - Maintained consistent styling across all button variants

## [2025-06-17]

### Fixed
- Fixed file input functionality in the video player component:
  - Removed disabled state from file input that was preventing file selection during playback
  - Added proper cleanup of video/audio URLs to prevent memory leaks
  - Added onEnded event listener to properly reset isPlaying state
  - Improved state reset when selecting new files
  - Added visual feedback for file input button during playback instead of disabling it
  - Enhanced error handling and state management for file selection

### Changed
- Updated file input UI to show opacity change instead of disabling during playback
- Improved state management for video playback
- Enhanced cleanup of resources when unmounting or changing files