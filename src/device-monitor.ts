/**
 * device-monitor.ts - Monitor Android device metrics in real-time
 * Compile: tsc
 * Run: node dist/device-monitor.js
 */

import { execSync } from 'child_process';

interface DeviceMetrics {
  model: string;
  battery: number;
  temperature: number;
  cpu: string;
  memory: string;
  timestamp: Date;
}

class AndroidMonitor {
  private interval: NodeJS.Timer | null = null;

  private exec(cmd: string): string {
    try {
      return execSync(`adb shell ${cmd}`, { encoding: 'utf-8' }).trim();
    } catch (e) {
      return 'ERROR';
    }
  }

  async getMetrics(): Promise<DeviceMetrics> {
    return {
      model: this.exec("getprop ro.product.model"),
      battery: parseInt(this.exec("dumpsys battery | grep level | head -1").match(/\d+/)?.[0] || "0"),
      temperature: parseInt(this.exec("dumpsys battery | grep temperature | head -1").match(/\d+/)?.[0] || "0"),
      cpu: this.exec("top -n 1 | head -3 | tail -1"),
      memory: this.exec("cat /proc/meminfo | grep MemAvailable | awk '{print $2}'"),
      timestamp: new Date(),
    };
  }

  start(callback: (metrics: DeviceMetrics) => void): void {
    this.interval = setInterval(async () => {
      const metrics = await this.getMetrics();
      callback(metrics);
    }, 3000);
    console.log('Monitor started...');
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
    console.log('Monitor stopped.');
  }
}

const monitor = new AndroidMonitor();
monitor.start((m) => {
  console.log(`[${m.timestamp.toLocaleTimeString()}] Battery: ${m.battery}% | Temp: ${m.temperature}°C`);
});

process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});
