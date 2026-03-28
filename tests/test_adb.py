#!/usr/bin/env python3
"""
test_adb.py -- Test basic ADB connectivity and commands
Run: python3 -m pytest tests/test_adb.py
"""
import subprocess
import pytest

def adb(cmd):
    r = subprocess.run(f"adb shell {cmd}", shell=True, capture_output=True, text=True)
    return r.stdout.strip()

def test_device_connected():
    r = subprocess.run("adb devices", shell=True, capture_output=True, text=True)
    assert "device" in r.stdout, "No device connected"

def test_get_model():
    model = adb("getprop ro.product.model")
    assert len(model) > 0, "Could not get model"

def test_get_android_version():
    ver = adb("getprop ro.build.version.release")
    assert ver.isdigit() or '.' in ver, "Invalid version"

def test_list_packages():
    out = adb("pm list packages")
    packages = [l.split(':')[1] for l in out.split('\n') if l.startswith('package:')]
    assert len(packages) > 0, "No packages found"

def test_battery_info():
    out = adb("dumpsys battery")
    assert "level:" in out.lower(), "Battery info not found"

def test_settings_read():
    brightness = adb("settings get system screen_brightness")
    assert brightness, "Could not read screen_brightness"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
