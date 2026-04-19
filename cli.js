#!/usr/bin/env node
/**
 * Android Intelligence CLI — Query device info, apps, permissions from command line
 * Usage: node cli.js device info
 *        node cli.js apps list [--filter keyword]
 *        node cli.js perms check com.example.app
 *        node cli.js settings get system screen_brightness
 */

const { execSync } = require("child_process");
const fs = require("fs");

function adb(cmd) {
    try {
        return execSync(`adb shell ${cmd}`, { encoding: "utf-8", stdio: ["pipe", "pipe", "devnull"] }).trim();
    } catch (e) {
        console.error(`[ADB Error] ${cmd}`);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
const [cmd1, cmd2, ...rest] = args;

if (!cmd1) {
    console.log(`
📱 Android Intelligence CLI
Usage:
  device info          Get device info (model, Android version, CPU, RAM)
  apps list            List installed apps
  apps list --filter X Filter apps by keyword
  perms check <pkg>    Check permissions granted to app
  settings get <ns> <key>    Get system setting (namespace: system/secure/global)
  settings put <ns> <key> <val> Set system setting
  battery              Get battery status
  network              Get network info (IP, Wi-Fi SSID)
  cpu                  Get CPU info
    `);
    process.exit(0);
}

switch (cmd1) {
    case "device": {
        if (cmd2 === "info") {
            const info = {
                model: adb("getprop ro.product.model"),
                android: adb("getprop ro.build.version.release"),
                api: adb("getprop ro.build.version.sdk"),
                cpu: adb("getprop ro.product.cpu.abi"),
                serial: adb("getprop ro.serialno"),
                build: adb("getprop ro.build.fingerprint"),
            };
            console.log("
📱 Device Info:");
            Object.entries(info).forEach(([k, v]) => {
                console.log(`  ${k.padEnd(12)} ${v}`);
            });
        }
        break;
    }

    case "apps": {
        if (cmd2 === "list") {
            let apps = adb("pm list packages -3").split("
");
            apps = apps.map(l => l.replace("package:", ""));
            const filter = rest[0] === "--filter" ? rest[1] : null;
            if (filter) {
                apps = apps.filter(a => a.includes(filter));
            }
            console.log(`\n📦 Apps (${apps.length}):`);
            apps.forEach(a => console.log(`  ${a}`));
        }
        break;
    }

    case "perms": {
        if (cmd2 === "check") {
            const pkg = rest[0];
            const out = adb(`dumpsys package ${pkg}`);
            const granted = [];
            out.split("\n").forEach(line => {
                if (line.includes("granted=true")) {
                    const m = line.match(/android\.permission\.\w+/g);
                    if (m) granted.push(...m);
                }
            });
            const unique = [...new Set(granted)];
            console.log(`\n🔐 ${pkg} — ${unique.length} permissions granted:`);
            unique.forEach(p => console.log(`  ${p}`));
        }
        break;
    }

    case "settings": {
        if (cmd2 === "get") {
            const ns = rest[0];
            const key = rest[1];
            const val = adb(`settings get ${ns} ${key}`);
            console.log(`${ns}/${key} = ${val}`);
        } else if (cmd2 === "put") {
            const ns = rest[0];
            const key = rest[1];
            const val = rest[2];
            adb(`settings put ${ns} ${key} ${val}`);
            console.log(`✓ ${ns}/${key} = ${val}`);
        }
        break;
    }

    case "battery": {
        const battery = adb("dumpsys battery");
        const lines = battery.split("\n");
        console.log("\n🔋 Battery:");
        ["level", "status", "health", "temperature", "voltage"].forEach(k => {
            const line = lines.find(l => l.includes(k));
            if (line) console.log(`  ${line.trim()}`);
        });
        break;
    }

    case "network": {
        const ip = adb("ip route | grep src | awk '{print $NF}' | head -1");
        const ssid = adb("dumpsys wifi | grep -oP 'SSID: \K[^,]+'");
        console.log("\n📡 Network:");
        console.log(`  IP: ${ip}`);
        console.log(`  Wi-Fi: ${ssid || "N/A"}`);
        break;
    }

    case "cpu": {
        const cores = adb("nproc");
        const freq = adb("cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq 2>/dev/null || echo N/A");
        const abi = adb("getprop ro.product.cpu.abi");
        console.log("\n⚙️  CPU:");
        console.log(`  ABI: ${abi}`);
        console.log(`  Cores: ${cores}`);
        console.log(`  Current freq: ${freq} Hz`);
        break;
    }

    default:
        console.error(`Unknown command: ${cmd1}`);
        process.exit(1);
}
