#!/bin/bash
# device-classifier.sh -- Auto-detect Android device capabilities and recommend ROM
# Usage: ./device-classifier.sh
# Analyzes device and suggests optimal custom ROM based on hardware

set -e

echo "🔍 Android Device Classifier"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Gather device info
MODEL=$(adb shell getprop ro.product.model)
BRAND=$(adb shell getprop ro.product.brand)
ANDROID=$(adb shell getprop ro.build.version.release)
SDK=$(adb shell getprop ro.build.version.sdk)
ARCH=$(adb shell getprop ro.product.cpu.abi)
RAM=$(adb shell cat /proc/meminfo | grep MemTotal | awk '{print int($2/1024/1024)}')
STORAGE=$(adb shell df /data | tail -1 | awk '{print $2}')
TREBLE=$(adb shell getprop ro.treble.enabled)
FASTBOOT_CAPABLE=$(adb shell cat /proc/cmdline | grep -q "fastboot" && echo "yes" || echo "no")

echo "Device: $BRAND $MODEL"
echo "Android: $ANDROID (API $SDK)"
echo "CPU: $ARCH | RAM: ${RAM}GB | Storage: ~${STORAGE}GB"
echo "Treble: $TREBLE | A/B partitions: $FASTBOOT_CAPABLE"
echo ""

# Score device for ROM recommendations
SCORE=0
RECOMMENDATIONS=()

# High-end devices (>6GB RAM, <2 years old)
if [[ $RAM -ge 6 ]] && [[ $SDK -ge 31 ]]; then
    SCORE=$((SCORE + 10))
    RECOMMENDATIONS+=("✅ LineageOS (latest, full feature set)")
    RECOMMENDATIONS+=("✅ Evolution X (feature-rich, customizable)")
    RECOMMENDATIONS+=("✅ crDroid (heavily modded, heavy customization)")
    if [[ $BRAND == "Google" ]]; then
        RECOMMENDATIONS+=("✅ GrapheneOS (Pixel only, maximum security)")
    fi
fi

# Mid-range devices (3-6GB RAM, active support)
if [[ $RAM -ge 3 ]] && [[ $RAM -lt 6 ]] && [[ $SDK -ge 28 ]]; then
    SCORE=$((SCORE + 7))
    RECOMMENDATIONS+=("✅ LineageOS (stable, efficient)")
    RECOMMENDATIONS+=("✅ CalyxOS (privacy-focused, lighter)")
    RECOMMENDATIONS+=("⚠️  Pixel Experience (may be heavy)")
fi

# Budget devices (<3GB RAM)
if [[ $RAM -lt 3 ]]; then
    SCORE=$((SCORE + 5))
    RECOMMENDATIONS+=("✅ LineageOS (lightweight, proven)")
    RECOMMENDATIONS+=("✅ /e/OS (minimal, privacy-focused)")
    RECOMMENDATIONS+=("❌ Evolution X (too heavy)")
fi

# Check device support
DEVICE_CODENAME=$(adb shell getprop ro.product.device)
echo "Device codename: $DEVICE_CODENAME"
echo ""

if [[ $TREBLE == "true" ]]; then
    echo "✅ Project Treble supported — can flash GSI"
else
    echo "⚠️  No Project Treble — must use device-specific ROM"
fi

if [[ "$FASTBOOT_CAPABLE" == "yes" ]]; then
    echo "✅ A/B partitions detected — OTA survival possible"
fi

echo ""
echo "📱 Recommended ROMs:"
for rec in "${RECOMMENDATIONS[@]}"; do
    echo "  $rec"
done

echo ""
echo "Search for: '$DEVICE_CODENAME' on:"
echo "  • https://wiki.lineageos.org"
echo "  • https://github.com/Evolution-X-Devices"
echo "  • https://romhaven.wikioasis.org"
