#!/usr/bin/env python3
"""
device_classifier.py -- Classify Android device by hardware capabilities
Reports: GPU vendor, RAM tier, storage speed, thermal capability, battery capacity
Usage: python3 device_classifier.py
"""
import subprocess, re

def adb(cmd):
    r = subprocess.run(f"adb shell {cmd}", shell=True, capture_output=True, text=True)
    return r.stdout.strip()

def classify():
    print("\n📊 Android Device Classifier\n")

    # Basic specs
    model = adb("getprop ro.product.model")
    cpu_abi = adb("getprop ro.product.cpu.abi")
    ram_total = int(adb("cat /proc/meminfo | grep MemTotal | awk '{print $2}'") or "0")
    ram_gb = ram_total // 1024 // 1024

    print(f"Device: {model}")
    print(f"CPU: {cpu_abi}")
    print(f"RAM: {ram_gb} GB")

    # GPU classification
    gpu_vendor = "Unknown"
    gpu_info = adb("dumpsys SurfaceFlinger | grep -i 'gpu\\|adreno\\|mali\\|powervr' | head -1")
    if "adreno" in gpu_info.lower():
        gpu_vendor = "Qualcomm Adreno"
    elif "mali" in gpu_info.lower():
        gpu_vendor = "ARM Mali"
    elif "powervr" in gpu_info.lower():
        gpu_vendor = "PowerVR"

    print(f"GPU: {gpu_vendor}")

    # Storage speed (quick estimate via dd)
    storage_speed = adb(
        "dd if=/dev/zero of=/data/test.bin bs=1M count=10 2>&1 | grep 'bytes' | awk '{print $6}'"
    )
    print(f"Storage write speed: {storage_speed or 'N/A'}")

    # Battery capacity
    battery = adb("dumpsys battery | grep 'charge counter'")
    print(f"Battery capacity: {battery or 'N/A'}")

    # Thermal info
    temps = adb("cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | awk '{s+=$1} END {print int(s/NR/1000)}'")
    if temps:
        print(f"Current temp: {temps}°C")

    # Performance tier
    print("\nPerformance Tier: ", end="")
    if ram_gb >= 12:
        tier = "🔥 Flagship"
    elif ram_gb >= 8:
        tier = "⚡ High-end"
    elif ram_gb >= 6:
        tier = "✅ Mid-range"
    else:
        tier = "📱 Budget"
    print(tier)

    # Gaming capability
    print("\nGaming suitability:")
    if "adreno" in gpu_info.lower() and ram_gb >= 8:
        print("  ✅ Excellent for modern games")
    elif ram_gb >= 6:
        print("  ✅ Good for most games")
    else:
        print("  ⚠️  Best for casual games")

    # Cleanup
    adb("rm /data/test.bin 2>/dev/null")

if __name__ == "__main__":
    classify()
