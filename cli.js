#!/usr/bin/env node
/**
 * Android Intelligence CLI
 * Query device info, manage apps, and run ADB commands interactively
 * Usage: node cli.js [command] [args...]
 */

const { execSync } = require('child_process');
const readline = require('readline');

const adb = (cmd) => {
    try {
        return execSync(`adb shell ${cmd}`, { encoding: 'utf8' }).trim();
    } catch (e) {
        return '';
    }
};

const commands = {
    'device-info': () => {
        console.log('\n📱 Device Info');
        console.log('Model:', adb('getprop ro.product.model'));
        console.log('Android:', adb('getprop ro.build.version.release'));
        console.log('API:', adb('getprop ro.build.version.sdk'));
        console.log('RAM:', adb('cat /proc/meminfo | grep MemTotal'));
        console.log('CPU:', adb('nproc'), 'cores');
        console.log('');
    },
    
    'list-apps': () => {
        const out = adb('pm list packages -3');
        const apps = out.split('\n').map(l => l.replace('package:', '')).filter(x => x);
        console.log(`\n📦 ${apps.length} user-installed apps`);
        apps.forEach(app => console.log('  ' + app));
        console.log('');
    },
    
    'wifi': () => {
        console.log('\n📡 Network');
        const ssid = adb('dumpsys wifi | grep -oP "mWifiInfo.*?SSID: \K[^,]+"');
        console.log('Wi-Fi:', ssid || 'disconnected');
        const ip = adb('ip route | grep src | awk "{print $NF}" | head -1');
        console.log('IP:', ip);
        console.log('');
    },
    
    'battery': () => {
        const level = adb('dumpsys battery | grep level').match(/\d+/);
        const temp = adb('dumpsys battery | grep temperature').match(/\d+/);
        const status = adb('dumpsys battery | grep status').replace(/.*?: /, '');
        console.log('\n🔋 Battery');
        console.log('Level:', (level ? level[0] : '?') + '%');
        console.log('Temperature:', (temp ? (temp[0] / 10).toFixed(1) : '?') + '°C');
        console.log('Status:', status.trim() || 'unknown');
        console.log('');
    },
    
    'help': () => {
        console.log(`
Android Intelligence CLI

Commands:
  device-info     Show device model, Android version, RAM, CPU
  list-apps       List all user-installed apps
  wifi            Show Wi-Fi SSID and IP address
  battery         Show battery level, temperature, status
  interactive     Open interactive shell (type 'exit' to quit)
  help            Show this message

Examples:
  node cli.js device-info
  node cli.js list-apps | grep facebook
  node cli.js interactive
        `);
    },
    
    'interactive': () => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        
        const prompt = () => {
            rl.question('adb> ', (cmd) => {
                if (cmd === 'exit') {
                    rl.close();
                    return;
                }
                const result = adb(cmd);
                if (result) console.log(result);
                prompt();
            });
        };
        
        console.log('\n🔧 Interactive ADB Shell (type "exit" to quit)');
        prompt();
    },
};

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

if (commands[cmd]) {
    commands[cmd]();
} else {
    console.log(`Unknown command: ${cmd}`);
    commands['help']();
}
