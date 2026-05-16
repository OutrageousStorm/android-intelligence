#!/usr/bin/env node
/**
 * Android Intelligence CLI — Unified command-line tool for Android automation
 * Usage: android-intelligence <command> [args]
 *
 * Commands:
 *   info              Show device info
 *   apps              List installed apps
 *   perms <pkg>       Show permissions for app
 *   screen            Take screenshot
 *   battery           Get battery status
 *   monkey <count>    Stress test with random taps
 *   logcat [filter]   Stream logcat with optional filter
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cmd = process.argv[2];
const args = process.argv.slice(3);

function adb(command) {
  try {
    return execSync(`adb shell ${command}`, { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error(`❌ ADB Error: ${e.message.split('\n')[0]}`);
    process.exit(1);
  }
}

function adbExec(command) {
  try {
    execSync(`adb shell ${command}`);
  } catch (e) {
    console.error(`❌ Error: ${e.message.split('\n')[0]}`);
  }
}

const commands = {
  info() {
    console.log('\n📱 Device Information\n');
    const model = adb('getprop ro.product.model');
    const android = adb('getprop ro.build.version.release');
    const api = adb('getprop ro.build.version.sdk');
    const serial = adb('getprop ro.serialno');
    const cpu = adb('getprop ro.product.cpu.abi');
    const battery = adb('dumpsys battery | grep -E "(level|status|temp)"');
    
    console.log(`Model:         ${model}`);
    console.log(`Android:       ${android} (API ${api})`);
    console.log(`Serial:        ${serial}`);
    console.log(`CPU:           ${cpu}`);
    console.log(`\nBattery:`);
    console.log(battery.split('\n').map(l => '  ' + l).join('\n'));
  },

  apps() {
    console.log('\n📦 Installed User Apps\n');
    const apps = adb('pm list packages -3').split('\n');
    apps.forEach((app, i) => {
      if (app) console.log(`  ${i+1}. ${app.replace('package:', '')}`);
    });
    console.log(`\nTotal: ${apps.length} apps\n`);
  },

  perms() {
    const pkg = args[0];
    if (!pkg) { console.error('Usage: android-intelligence perms <package>'); return; }
    console.log(`\n🔐 Permissions for ${pkg}\n`);
    const perms = adb(`dumpsys package ${pkg} | grep android.permission`);
    if (perms) {
      console.log(perms);
    } else {
      console.log('  (none)');
    }
    console.log();
  },

  screen() {
    const file = `screenshot_${Date.now()}.png`;
    try {
      execSync(`adb exec-out screencap -p > ${file}`);
      console.log(`✅ Screenshot saved: ${file}`);
    } catch (e) {
      console.error('❌ Failed to capture screenshot');
    }
  },

  battery() {
    console.log('\n🔋 Battery Status\n');
    const info = adb('dumpsys battery');
    const level = info.match(/level: (\d+)/)?.[1] || '?';
    const status = info.match(/status: (\w+)/)?.[1] || '?';
    const temp = info.match(/temperature: (\d+)/)?.[1] || '?';
    const health = info.match(/health: (\w+)/)?.[1] || '?';
    
    console.log(`Level:       ${level}%`);
    console.log(`Status:      ${status}`);
    console.log(`Temp:        ${temp}°C`);
    console.log(`Health:      ${health}\n`);
  },

  monkey() {
    const count = args[0] || 100;
    console.log(`🐵 Monkey stress test (${count} events)`);
    adbExec(`monkey -p com.example -v ${count} 2>/dev/null || true`);
    console.log('✅ Done');
  },

  logcat() {
    const filter = args[0] || '*:V';
    console.log(`📋 Logcat (${filter}) — press Ctrl+C to stop\n`);
    try {
      execSync(`adb logcat ${filter}`, { stdio: 'inherit' });
    } catch (e) {
      // Ctrl+C
    }
  },

  help() {
    console.log(`
🤖 Android Intelligence CLI

Usage: android-intelligence <command> [args]

Commands:
  info              Show full device information
  apps              List all installed user apps
  perms <pkg>       Show permissions for app
  screen            Take screenshot
  battery           Show battery status
  monkey [count]    Stress test with random taps (default 100)
  logcat [filter]   Stream device logs (default: all)
  help              This message
`);
  }
};

if (commands[cmd]) {
  commands[cmd]();
} else {
  console.error(`❌ Unknown command: ${cmd}`);
  commands.help();
  process.exit(1);
}
