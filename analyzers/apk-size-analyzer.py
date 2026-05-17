#!/usr/bin/env python3
"""
apk-size-analyzer.py -- Analyze APK structure and find what's making it bloated
Shows: classes.dex size, resources, native libs, total breakdown by percentage
Usage: python3 apk-size-analyzer.py app.apk
"""
import zipfile, sys, json
from collections import defaultdict

def analyze_apk(apk_path):
    try:
        z = zipfile.ZipFile(apk_path, 'r')
    except Exception as e:
        print(f"Error: {e}"); sys.exit(1)

    sizes = defaultdict(int)
    for info in z.infolist():
        path = info.filename
        size = info.file_size
        
        if path.endswith('.dex'):
            sizes['dex'] += size
        elif path.startswith('lib/'):
            arch = path.split('/')[1] if len(path.split('/')) > 1 else 'unknown'
            sizes[f'lib_{arch}'] += size
        elif path.startswith('resources.arsc') or path.startswith('res/'):
            sizes['resources'] += size
        elif path.endswith('.so'):
            sizes['native'] += size
        elif path.startswith('assets/'):
            sizes['assets'] += size
        elif path == 'AndroidManifest.xml':
            sizes['manifest'] += size
        else:
            sizes['other'] += size

    total = sum(sizes.values())
    print(f"\n📦 APK Size Analysis: {apk_path}")
    print(f"Total: {total / 1024 / 1024:.1f} MB\n")
    print(f"{'Component':<20} {'Size':<15} {'%':<8}")
    print("─" * 45)
    
    for key in sorted(sizes.keys(), key=lambda k: sizes[k], reverse=True):
        size = sizes[key]
        pct = (size / total * 100) if total > 0 else 0
        size_str = f"{size / 1024 / 1024:.1f} MB" if size > 1024*1024 else f"{size / 1024:.0f} KB"
        print(f"{key:<20} {size_str:<15} {pct:>6.1f}%")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 apk-size-analyzer.py <app.apk>")
        sys.exit(1)
    analyze_apk(sys.argv[1])
