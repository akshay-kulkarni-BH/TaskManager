#!/bin/bash

SRC="$(dirname "$0")/release/win-unpacked"

# Detect WSL (/mnt/d/) vs Git Bash (/d/)
if grep -qi microsoft /proc/version 2>/dev/null; then
  DEST="/mnt/d/Installations/Rabbit Task Manager"
else
  DEST="/d/Installations/Rabbit Task Manager"
fi

echo "Source: $SRC"
echo "Destination: $DEST"

if [ ! -d "$SRC" ]; then
  echo "ERROR: Source directory not found: $SRC"
  exit 1
fi

mkdir -p "$DEST"
if [ $? -ne 0 ]; then
  echo "ERROR: Failed to create destination directory."
  exit 1
fi

cp -r "$SRC/." "$DEST"
if [ $? -ne 0 ]; then
  echo "ERROR: Copy failed."
  exit 1
fi

echo "SUCCESS: Copied win-unpacked contents to '$DEST'"
