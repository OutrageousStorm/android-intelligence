#!/bin/bash
# install.sh -- Install Android Intelligence tools
# Downloads and sets up the toolkit

set -e
TOOLS_DIR="${1:-.}/android-tools"
mkdir -p "$TOOLS_DIR"

echo "📥 Android Intelligence Setup"
echo "Installing to: $TOOLS_DIR"

# Clone main repos
repos=(
    "android-toolkit-scripts"
    "android-adb-cheatsheet"
    "android-forensics-guide"
    "frida-scripts-android"
    "apk-patcher"
)

for repo in "${repos[@]}"; do
    url="https://github.com/OutrageousStorm/$repo.git"
    if [[ ! -d "$TOOLS_DIR/$repo" ]]; then
        echo "  Cloning $repo..."
        git clone --depth=1 "$url" "$TOOLS_DIR/$repo" 2>/dev/null || true
    fi
done

echo "
✅ Installation complete!

Next steps:
  cd $TOOLS_DIR
  python3 android-toolkit-scripts/device_info.py

Get started:
  - Device info:      android-toolkit-scripts/device_info.py
  - Permission audit: android-toolkit-scripts/permission_audit.py
  - APK analysis:     frida-scripts-android/
  - ADB cheatsheet:   cat android-adb-cheatsheet/README.md
" | tee "$TOOLS_DIR/SETUP_COMPLETE.txt"
