#!/bin/bash
# toolkit.sh — All-in-one ADB toolkit
set -e

adb devices | grep -q "device$" || { echo "❌ No device"; exit 1; }

cmd="${1:-help}"
case "$cmd" in
  help) echo "Commands: install, screenshot, logcat, battery, reboot, launch" ;;
  install) adb install -r "$2" && echo "✅ Installed" ;;
  screenshot) adb exec-out screencap -p > screenshot.png && echo "✅ Saved" ;;
  logcat) adb logcat -v time ${2:-"*:D"} ;;
  battery) adb shell dumpsys battery ;;
  reboot) adb reboot ${2:-system} && echo "✅ Rebooting" ;;
  launch) adb shell monkey -p "$2" -c android.intent.category.LAUNCHER 1 2>/dev/null && echo "✅ Launched" ;;
  *) echo "Unknown: $cmd" ;;
esac
