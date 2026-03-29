#!/usr/bin/env node
/**
 * android-intelligence CLI -- Quick Android device commands
 * Usage: node cli.js device-info
 *        node cli.js list-apps
 *        node cli.js kill <package>
 *        node cli.js screen <0-255>
 */

const { execSync } = require('child_process');

function adb(cmd) {
    try {
        return execSync(`adb shell ${cmd}`, { encoding: 'utf-8' }).trim();
    } catch(e) {
        return '';
    }
}

const commands = {
    'device-info': () => {
        console.log('\n📱 Device Info:');
        console.log(`  Model:      ${adb('getprop ro.product.model')}`);
        console.log(`  Android:    ${adb('getprop ro.build.version.release')}`);
        console.log(`  RAM:        ${adb('cat /proc/meminfo | grep MemTotal')}`);
        console.log(`  Storage:    ${adb('df -h /data | tail -1')}`);
        console.log(`  Battery:    ${adb('dumpsys battery | grep level').split(':')[1]?.trim()}%\n`);
    },

    'list-apps': () => {
        console.log('\n📦 Installed user apps:');
        const apps = adb('pm list packages -3').split('\n').map(l => l.replace('package:', ''));
        apps.forEach((a, i) => {
            if (i < 20) console.log(`  ${i+1}. ${a}`);
        });
        console.log(`  ... ${apps.length} total\n`);
    },

    'top-battery': () => {
        console.log('\n🔋 Top battery hogs:');
        const output = adb('dumpsys batterystats | grep "uid=" | head -10');
        output.split('\n').forEach(line => {
            if (line.includes('uid=')) console.log(`  ${line.substring(0, 60)}`);
        });
        console.log();
    },

    'network': () => {
        console.log('\n🌐 Network info:');
        console.log(`  IP:         ${adb("ip route | grep src | awk '{print $NF}' | head -1")}`);
        console.log(`  Hostname:   ${adb('getprop net.hostname')}`);
        const dns = adb('getprop net.dns1');
        console.log(`  DNS:        ${dns}\n`);
    },

    'kill': (pkg) => {
        if (!pkg) return console.log('Usage: node cli.js kill <package>');
        adb(`am force-stop ${pkg}`);
        console.log(`✓ Killed ${pkg}\n`);
    },

    'screen': (level) => {
        level = parseInt(level) || 150;
        if (level < 0 || level > 255) return console.log('Brightness: 0-255');
        adb(`settings put system screen_brightness ${level}`);
        console.log(`✓ Screen brightness: ${level}\n`);
    },

    'help': () => {
        console.log(`
Android Intelligence CLI

Commands:
  device-info      Show device details
  list-apps        List installed apps
  top-battery      Top battery drain culprits
  network          Network info
  kill <package>   Force-stop an app
  screen <0-255>   Set brightness
  help             Show this menu
`);
    }
};

const [cmd, arg] = process.argv.slice(2);
if (!cmd || !commands[cmd]) {
    commands.help();
} else {
    commands[cmd](arg);
}
