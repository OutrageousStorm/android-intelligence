#!/usr/bin/env python3
"""
android-intelligence CLI -- Master entry point
Usage: android-cli <command> [options]
"""
import sys, argparse, subprocess

COMMANDS = {
    "audit": "Run permission audit",
    "backup": "Backup device",
    "restore": "Restore from backup",
    "debloat": "Interactive debloater",
    "harden": "Privacy hardening",
    "monitor": "System monitor",
}

def main():
    parser = argparse.ArgumentParser(prog="android-cli")
    parser.add_argument("command", choices=list(COMMANDS.keys()), help="Command to run")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    # Route to appropriate tool
    mapping = {
        "audit": "python3 ../android-permission-auditor/permission_audit.py",
        "backup": "bash ../android-backup-vault/backup.sh",
        "restore": "bash ../android-backup-vault/restore.sh",
        "debloat": "bash ../android-toolkit-scripts/smart_debloat.sh",
        "harden": "python3 ../android-privacy-hardener/harden.py",
        "monitor": "python3 ../android-toolkit-scripts/network_monitor.py",
    }
    
    cmd = mapping.get(args.command)
    if cmd:
        subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    main()
