#!/bin/bash
# device-monitor.sh -- Real-time Android device stats monitor
# Usage: ./device-monitor.sh [interval_seconds]
# Shows: CPU, memory, battery, thermals, network

INTERVAL=${1:-2}
BOLD='\033[1m'; RESET='\033[0m'

while true; do
    clear
    echo -e "${BOLD}📱 Android Device Monitor${RESET}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Model & Android
    MODEL=$(adb shell getprop ro.product.model)
    ANDROID=$(adb shell getprop ro.build.version.release)
    echo "Device: $MODEL (Android $ANDROID)"
    echo ""
    
    # CPU
    echo "CPU:"
    FREQ=$(adb shell cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq 2>/dev/null | awk '{print $1/1000000 " GHz"}')
    LOAD=$(adb shell cat /proc/loadavg | awk '{print $1, $2, $3}')
    echo "  Frequency: $FREQ"
    echo "  Load avg:  $LOAD"
    
    # Memory
    echo ""
    echo "Memory:"
    MEM=$(adb shell cat /proc/meminfo | head -3)
    echo "$MEM" | sed 's/^/  /'
    
    # Battery
    echo ""
    echo "Battery:"
    BAT=$(adb shell dumpsys battery | grep -E 'level|temp|voltage')
    echo "$BAT" | sed 's/^/  /'
    
    # Temperature
    echo ""
    echo "Thermal:"
    TEMP=$(adb shell cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null)
    if [[ -n "$TEMP" ]]; then
        echo "  Zone 0: $((TEMP/1000))°C"
    else
        echo "  N/A (no thermal data)"
    fi
    
    # Network
    echo ""
    echo "Network:"
    NET=$(adb shell ip addr show wlan0 2>/dev/null | grep "inet " | awk '{print $2}')
    echo "  IP: ${NET:-offline}"
    
    echo ""
    echo "Press Ctrl+C to stop (refresh every ${INTERVAL}s)"
    sleep "$INTERVAL"
done
