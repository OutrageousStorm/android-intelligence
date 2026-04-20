#!/usr/bin/env python3
"""
device-identifier.py -- Unique device identification via ADB
Generates device fingerprint using multiple hardware identifiers.
Usage: python3 device-identifier.py [--save fingerprint.json]
"""
import subprocess, json, hashlib, argparse
from datetime import datetime

def adb(cmd):
    r = subprocess.run(f"adb shell {cmd}", shell=True, capture_output=True, text=True)
    return r.stdout.strip()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--save", help="Save fingerprint to file")
    args = parser.parse_args()

    print("\n📱 Device Identifier — Generating unique fingerprint...
")

    # Collect identifiers
    serial = adb("getprop ro.serialno")
    imei = adb("dumpsys iphonesubinfo | grep 'Device ID'").split(":")[-1].strip()
    build_id = adb("getprop ro.build.id")
    hardware_serial = adb("getprop ro.serialno")
    android_id = adb("settings get secure android_id")
    product = adb("getprop ro.product.model")
    manufacturer = adb("getprop ro.manufacturer")
    baseband = adb("getprop gsm.version.baseband")
    hwc_version = adb("getprop ro.hwui.drop_shadow_cache_size")

    identifiers = {
        "serial": serial,
        "imei": imei,
        "build_id": build_id,
        "android_id": android_id,
        "product": product,
        "manufacturer": manufacturer,
        "baseband": baseband,
        "timestamp": datetime.now().isoformat(),
    }

    # Generate unique hash
    combined = "".join(str(v) for v in identifiers.values())
    fingerprint_hash = hashlib.sha256(combined.encode()).hexdigest()

    print("Device Identifiers:")
    print(f"  Serial:      {serial}")
    print(f"  IMEI:        {imei[:8]}****{imei[-4:] if imei else 'N/A'}")
    print(f"  Build ID:    {build_id}")
    print(f"  Android ID:  {android_id}")
    print(f"  Model:       {product}")
    print(f"  Manufacturer:{manufacturer}")

    print(f"
Generated Fingerprint:")
    print(f"  {fingerprint_hash}")

    if args.save:
        with open(args.save, 'w') as f:
            json.dump({
                "fingerprint": fingerprint_hash,
                "identifiers": identifiers,
                "generated": datetime.now().isoformat(),
            }, f, indent=2)
        print(f"\n✅ Saved to {args.save}")

if __name__ == "__main__":
    main()
