# Android Shell Command Reference

Essential `adb shell` commands for power users.

## Quick Commands

```bash
adb shell pm list packages              # All packages
adb shell pm list packages -3           # User-installed only
adb shell dumpsys battery               # Battery info
adb shell dumpsys power                 # Power manager state
adb shell wm size                       # Screen resolution
adb shell cat /proc/meminfo             # Memory
adb shell cat /proc/cpuinfo             # CPU
adb shell settings list secure          # All secure settings
adb shell getprop ro.build.fingerprint  # Build info
```

## Useful Pipes

```bash
# Find packages by keyword
adb shell pm list packages | grep -i telegram

# Count installed apps
adb shell pm list packages -3 | wc -l

# List all permissions granted to an app
adb shell dumpsys package com.example.app | grep -i "permission"

# Get running services
adb shell service list | head -20

# Find process by name
adb shell ps -A | grep -i chrome

# Real-time process monitor
adb shell top -n 1
```

## Settings Reference

| Namespace | Key | Values | Example |
|-----------|-----|--------|---------|
| system | screen_brightness | 0-255 | `adb shell settings put system screen_brightness 200` |
| global | airplane_mode_on | 0/1 | `adb shell settings put global airplane_mode_on 1` |
| secure | location_mode | 0/1/2/3 | `adb shell settings put secure location_mode 0` |
| global | wifi_on | 0/1 | `adb shell settings put global wifi_on 1` |
| global | bluetooth_on | 0/1 | `adb shell settings put global bluetooth_on 0` |

## Profile Dumping

```bash
# Full device dump
adb shell dumpsys > device_dump.txt

# Just battery info
adb shell dumpsys battery

# Notification log
adb shell dumpsys notification

# Recent apps
adb shell dumpsys recent | head -30
```
