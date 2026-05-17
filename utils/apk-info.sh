#!/bin/bash
# apk-info.sh -- Detailed APK information extractor
# Usage: ./apk-info.sh com.example.app

if [[ -z "$1" ]]; then
    echo "Usage: $0 <package_name>"
    echo ""
    echo "Examples:"
    echo "  $0 com.google.android.apps.messaging"
    echo "  $0 com.example.app"
    exit 1
fi

PKG="$1"

echo ""
echo "📦 APK Information: $PKG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Basic info
echo ""
echo "Basic Info:"
adb shell dumpsys package "$PKG" 2>/dev/null | grep -E "Package \[|versionName|versionCode|codePath" | head -5 | sed 's/^/  /'

# Permissions
echo ""
echo "Permissions Granted:"
adb shell dumpsys package "$PKG" 2>/dev/null | grep -A 50 "granted permissions:" | head -20 | sed 's/^/  /'

# Installation details
echo ""
echo "Install Details:"
adb shell dumpsys package "$PKG" 2>/dev/null | grep -E "userId=|install=|update=" | head -5 | sed 's/^/  /'

# Size
echo ""
echo "Size:"
SIZE=$(adb shell du -sh "/data/app/$(adb shell pm path "$PKG" | head -1 | sed 's/package://' | sed 's|/.*||')" 2>/dev/null)
echo "  $SIZE" | sed 's/^/  /'

# Activities
echo ""
echo "Main Activities:"
adb shell dumpsys package "$PKG" 2>/dev/null | grep "android.intent.action.MAIN" -B 3 | grep " " | head -3 | sed 's/^/  /'

echo ""
