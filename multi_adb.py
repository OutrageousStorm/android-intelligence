#!/usr/bin/env python3
"""multi_adb.py -- Run ADB command on all connected devices in parallel"""
import subprocess, threading, sys, time

def get_devices():
    r = subprocess.run("adb devices", shell=True, capture_output=True, text=True)
    return [l.split()[0] for l in r.stdout.splitlines()[1:] if l.strip() and "device" in l]

def run_on_device(serial, cmd, results):
    r = subprocess.run(f"adb -s {serial} shell {cmd}", shell=True, capture_output=True, text=True)
    results[serial] = r.stdout.strip()

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 multi_adb.py <adb command>")
        print("Example: python3 multi_adb.py 'getprop ro.build.version.release'")
        sys.exit(1)

    cmd = " ".join(sys.argv[1:])
    devices = get_devices()
    if not devices:
        print("No devices connected.")
        return

    print(f"Running on {len(devices)} device(s): {cmd}\n")
    results = {}
    threads = [threading.Thread(target=run_on_device, args=(d, cmd, results)) for d in devices]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    for serial in devices:
        print(f"[{serial}]")
        print(f"  {results.get(serial, '(timeout)')}")

if __name__ == "__main__":
    main()
