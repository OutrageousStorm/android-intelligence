# Android Intelligence — Quick Start

Quick reference for top scripts.

## Setup
```bash
git clone https://github.com/OutrageousStorm/android-intelligence
cd android-intelligence
pip install rich
```

## Top Scripts

**Device Info**
```bash
python3 device_info.py
```

**Permission Audit**
```bash
python3 permission_audit.py --csv audit.csv
```

**Smart Debloat**
```bash
python3 smart_debloat.py lists/samsung.txt
```

**Network Monitor**
```bash
python3 network_monitor.py
```

**APK Backup**
```bash
python3 app_extractor.py --output ./apks
```

## Quick Commands

Model: `adb shell getprop ro.product.model`

Packages: `adb shell pm list packages`

Grant location: `adb shell pm grant com.example.app android.permission.ACCESS_FINE_LOCATION`

Screenshot: `adb exec-out screencap -p > screen.png`

Record: `adb shell screenrecord --time-limit 30 /sdcard/video.mp4`
