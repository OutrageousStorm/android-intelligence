#!/bin/bash
# batch_install.sh -- Install multiple APKs from a directory
# Usage: ./batch_install.sh [path] [--background]

set -e
CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

APK_DIR="${1:-.}"
BACKGROUND="${2:-}"

if [[ ! -d "$APK_DIR" ]]; then
    echo "Directory not found: $APK_DIR"
    exit 1
fi

APK_COUNT=$(find "$APK_DIR" -maxdepth 1 -name "*.apk" | wc -l)
echo -e "${CYAN}📦 Batch APK Installer${NC}"
echo "Directory: $APK_DIR"
echo "APKs found: $APK_COUNT"
echo ""

if [[ $APK_COUNT -eq 0 ]]; then
    echo "No APKs found."
    exit 1
fi

if ! adb devices | grep -q "device$"; then
    echo -e "${RED}❌ No device connected${NC}"
    exit 1
fi

success=0; fail=0
for apk in "$APK_DIR"/*.apk; do
    [[ -f "$apk" ]] || continue
    name=$(basename "$apk")
    
    # Extract package name from APK
    pkg=$(unzip -p "$apk" AndroidManifest.xml 2>/dev/null | strings | grep "^package=" | head -1 | cut -d= -f2)
    [[ -z "$pkg" ]] && pkg="${name%.apk}"
    
    # Install
    result=$(adb install -r "$apk" 2>&1)
    if echo "$result" | grep -q "Success"; then
        echo -e "  ${GREEN}✓${NC} $name"
        ((success++))
    else
        echo -e "  ${RED}✗${NC} $name"
        ((fail++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Installed: ${GREEN}$success${NC}  Failed: ${RED}$fail${NC}"
