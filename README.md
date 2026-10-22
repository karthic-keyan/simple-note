# Simple Note — Windows Notes App (Offline-First)

An elegant, offline-first Windows desktop note-taking application, crafted with Electron, React, TypeScript, Tailwind CSS, Tiptap (ProseMirror), SQLite (with FTS5 full-text search), Zustand, and Zod.

---

## 🌟 Key Features

### 1. Core Note Management
- **Local Persistence**: Zero cloud dependency; stored 100% locally in SQLite with WAL (Write-Ahead Logging) and foreign key integrity.
- **Smart Autosave**: Debounced ~500ms auto-saving directly through typed IPC with live visual status indicators (`Saving...`, `All changes saved`, `Error with retry`).
- **Zero Data Loss on Switch**: Pending edits are automatically flushed transactionally before switching notes or closing the application.
- **Pinning & Favorites**: Pin critical notes to the top of list views; access favorite notes in a dedicated sidebar section.
- **Organization Views**: All Notes, Favorites, Notebooks, Tags, and Trash with restore and permanent purge capabilities.

### 2. Rich-Text Editor (Tiptap & ProseMirror)
- **Authoritative JSON format**: Stores clean ProseMirror structured JSON in the database and plain-text for indexing and card previews.
- **Rich formatting**: Headings (H1, H2, H3), Paragraphs, Bold, Italic, Underline, Strikethrough, Blockquotes, Inline Code, and Code Blocks.
- **Lists & Checklists**: Interactive task checklists with checkable boxes, ordered numbered lists, and bulleted lists.
- **Hyperlinks**: Insert, edit, and click external hyperlinks with safe external browser navigation via Electron's `shell.openExternal`.
- **Statistics**: Word count, character count, and estimated reading time.
- **Configurable Typography**: User-selectable editor font sizes (Small, Medium, Large, Extra Large).

### 3. Hierarchical Notebooks
- **Nested Structure**: Create root notebooks and unlimited sub-notebooks with recursive tree navigation.
- **Safe Deletion Strategies**: Prevent accidental data loss with deletion rules:
  1. *Keep notes as Uncategorized* (retains notes in All Notes).
  2. *Move notes to parent notebook* (moves directly to container).
  3. *Move all notes inside to Trash*.
- **Note Movement**: Seamlessly move notes between notebooks from the editor header, note card menu, or keyboard shortcut.

### 4. Tagging System
- **Custom Tag Colors**: Curated vibrant and pastel accent color palette.
- **Multi-Tagging**: Assign multiple tags to any note with interactive tag chips.
- **Tag Filtering**: Filter the entire note collection by clicking any tag in the sidebar.

### 5. SQLite FTS5 Full-Text Search
- **Instant Search**: Prefix matching across titles and note bodies (`tokenize = 'unicode61 remove_diacritics 2'`).
- **BM25 Relevance Ranking**: Most relevant notes automatically bubble to the top.
- **Snippet Excerpts**: Search result previews with highlighted search matches.
- **Automatic Sync**: SQLite triggers on `INSERT`, `UPDATE`, and `DELETE` keep the virtual FTS table strictly synchronized.

### 6. Themes & User Preferences
- **Themes**: Light Mode, Dark Mode, and automatic Windows System Theme detection (`prefers-color-scheme`).
- **Resizable 3-Pane Layout**: Draggable dividers between Sidebar, Notes List, and Editor, with widths persistently remembered in SQLite settings.
- **Windows 11 Custom Title Bar**: Frameless design with custom Windows window controls (Minimize, Maximize/Restore, Close).

### 7. Backup & Restore
- **Validated JSON Export**: Export all notes, notebooks, tags, relations, and preferences.
- **Safe Import**: Validate files with Zod schemas before importing.
- **Merge or Replace Modes**: Choose to merge backup data into current workspace or replace local data cleanly.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + N` | Create a new note |
| `Ctrl + Shift + N` | Create a new notebook |
| `Ctrl + F` | Focus search bar |
| `Ctrl + \` | Toggle navigation sidebar |
| `Ctrl + S` | Force immediate save |
| `Ctrl + Shift + P` | Toggle pin on active note |
| `Ctrl + Shift + F` | Toggle favorite on active note |
| `Ctrl + ,` | Open Preferences / Settings |
| `Ctrl + B / I / U` | Bold, Italic, Underline |
| `Ctrl + Z / Y` | Undo / Redo |

---

## 🛠️ Project Architecture

```
notes-app/
├── package.json
├── electron-builder.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tailwind.config.js
├── src/
│   ├── shared/                 # Shared contracts (safe across processes)
│   │   ├── types/              # Note, Notebook, Tag, Settings, Search, IPC types
│   │   ├── schemas/            # Zod validation schemas
│   │   └── constants/          # IPC channel names & default settings
│   ├── main/                   # Electron Main Process (Node.js)
│   │   ├── index.ts            # Window creation, security policies & lifecycle
│   │   ├── database/           # SQLite connection, WAL pragmas, migrations
│   │   │   ├── connection.ts
│   │   │   ├── migrations/     # Versioned schema migrations & FTS triggers
│   │   │   └── repositories/   # Note, Notebook, Tag, Search, Settings repositories
│   │   ├── services/           # Backup export and import service
│   │   └── ipc/                # Zod-validated IPC request handlers
│   ├── preload/                # Context isolation bridge
│   │   └── index.ts            # Typed window.electronAPI via contextBridge
│   └── renderer/               # React 18 & Tailwind UI (Vite)
│       ├── App.tsx             # Root component & global shortcut listeners
│       ├── main.tsx            # React DOM mounting
│       ├── styles/             # Tailwind & Tiptap prose formatting
│       ├── stores/             # Zustand stores (Notes, Notebooks, Tags, Settings, UI)
│       └── components/
│           ├── layout/         # TitleBar, ThreePaneLayout, Resizer, Toast
│           ├── sidebar/        # All Notes, Favorites, Trash, NotebooksTree, TagsList
│           ├── notes-list/     # NotesHeader, NoteCard, SortMenu, NotesList
│           ├── editor/         # RichEditor, EditorToolbar, EditorHeader, NoteTagSelector
│           └── modals/         # Settings, Notebook, Tag, MoveNote, BackupRestore, ConfirmDelete
└── tests/
    └── unit/                   # Vitest unit & integration test suites
```

---

## 🚀 Development & Testing

### Prerequisites
- Node.js >= 18 (Node 22 recommended)
- Windows 10 or Windows 11

### Running Locally
```bash
# Start Vite development server and Electron
npm run dev
```

### Running Tests
```bash
# Execute unit and integration tests (Vitest)
npm test
```

### Building for Production
```bash
# Type check and build Vite and Electron bundles
npm run build
```

### Packaging for Windows & Microsoft Store
```bash
# Rebuild native modules and package as NSIS installer and AppX package
npm run package
```
The output installers will be generated in the `release/` directory:
- `Simple Note-Setup-1.0.0.exe` (NSIS installer)
- `Simple Note-Setup-1.0.0.appx` (Windows Store MSIX/AppX package)

---

## 🔒 Security Measures
- **Context Isolation**: `contextIsolation: true` is strictly enforced.
- **Node Integration**: `nodeIntegration: false` disabled in renderer.
- **Input Validation**: All incoming IPC payloads are parsed and validated via Zod schemas in the main process before invoking SQLite queries.
- **External Links**: All external URLs open safely in the user's default browser via `shell.openExternal`.
- **Database Safety**: Prepared statements parameterized everywhere to prevent SQL injection.
