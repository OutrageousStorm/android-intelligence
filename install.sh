#!/bin/bash
# install.sh -- Quick install script for all Android Intelligence tools
# Usage: bash install.sh
set -e
echo "🤖 Android Intelligence — Tool Installer"
echo "=========================================="
echo ""
which adb > /dev/null || { echo "❌ adb not found in PATH"; exit 1; }
which python3 > /dev/null || { echo "❌ python3 not found"; exit 1; }
echo "✓ Dependencies found"
echo ""
DEST="${HOME}/.android-intel"
mkdir -p "$DEST"
echo "Installing to: $DEST"
for tool in *.py *.sh; do
    [[ -f "$tool" ]] && cp "$tool" "$DEST/" && chmod +x "$DEST/$tool" && echo "  ✓ $tool"
done
echo ""
echo "✅ Done! Add to PATH:"
echo "   export PATH=\$PATH:$DEST"
echo "   # Then run: device-info, app-audit, debloat, etc."
