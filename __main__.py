#!/usr/bin/env python3
"""Android Intelligence - Unified entry point"""
import sys

TOOLS = {
    'device': 'Check device info',
    'packages': 'List installed packages',
    'permissions': 'Audit app permissions',
    'debloat': 'Remove unwanted packages',
}

def main():
    if len(sys.argv) < 2:
        print("Android Intelligence Tools")
        print("Usage: python3 -m android_intelligence <tool>")
        print("Available tools:")
        for k, v in TOOLS.items():
            print(f"  {k:<15} {v}")
        sys.exit(0)
    tool = sys.argv[1]
    print(f"Loading {tool}...")

if __name__ == "__main__":
    main()
