#!/usr/bin/env sh

set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
GIT_DIR="$ROOT_DIR/.git"
HOOKS_SOURCE_DIR="$ROOT_DIR/scripts/git-hooks"
HOOKS_TARGET_DIR="$GIT_DIR/hooks"

echo "Installing custom git hooks..."

if [ ! -d "$GIT_DIR" ]; then
  echo "This script must be run from within a git repository."
  exit 1
fi

mkdir -p "$HOOKS_TARGET_DIR"

for hook in pre-commit pre-push commit-msg; do
  SRC="$HOOKS_SOURCE_DIR/$hook"
  DEST="$HOOKS_TARGET_DIR/$hook"

  if [ -f "$SRC" ]; then
    # Remove existing file/symlink to avoid “File exists” errors
    if [ -e "$DEST" ] || [ -L "$DEST" ]; then
      rm -f "$DEST"
    fi

    ln -s "$SRC" "$DEST"
    chmod +x "$SRC"

    echo "✅ Installed hook: $hook"
  fi
done

echo "Git hooks installation completed successfully."
