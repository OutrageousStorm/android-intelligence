package main

import (
    "bufio"
    "flag"
    "fmt"
    "os"
    "os/exec"
    "strings"
)

func adb(args ...string) (string, error) {
    cmd := exec.Command("adb", args...)
    out, err := cmd.CombinedOutput()
    return string(out), err
}

func main() {
    devInfo := flag.Bool("info", false, "Get device info")
    pkgList := flag.Bool("packages", false, "List all packages")
    revoke := flag.String("revoke", "", "Revoke permission from package")
    debloat := flag.String("debloat", "", "Debloat from list file")
    monitor := flag.Bool("monitor", false, "Monitor notifications")

    flag.Parse()

    if *devInfo {
        model, _ := adb("shell", "getprop", "ro.product.model")
        android, _ := adb("shell", "getprop", "ro.build.version.release")
        ram, _ := adb("shell", "cat", "/proc/meminfo")
        fmt.Println("Model:", strings.TrimSpace(model))
        fmt.Println("Android:", strings.TrimSpace(android))
        fmt.Println("Memory:", strings.Fields(ram)[1], "KB")
    }

    if *pkgList {
        out, _ := adb("shell", "pm", "list", "packages", "-3")
        fmt.Print(out)
    }

    if *revoke != "" {
        parts := strings.Split(*revoke, ":")
        if len(parts) == 2 {
            pkg, perm := parts[0], parts[1]
            adb("shell", "pm", "revoke", pkg, "android.permission."+perm)
            fmt.Printf("Revoked %s from %s\n", perm, pkg)
        }
    }

    if *debloat != "" {
        file, _ := os.Open(*debloat)
        defer file.Close()
        scanner := bufio.NewScanner(file)
        for scanner.Scan() {
            pkg := strings.TrimSpace(scanner.Text())
            if pkg == "" || strings.HasPrefix(pkg, "#") {
                continue
            }
            out, _ := adb("shell", "pm", "uninstall", "-k", "--user", "0", pkg)
            if strings.Contains(out, "Success") {
                fmt.Println("✓", pkg)
            } else {
                fmt.Println("✗", pkg)
            }
        }
    }

    if *monitor {
        fmt.Println("Monitoring notifications (Ctrl+C to stop)")
        adb("logcat", "NotificationManager:D", "*:S")
    }
}
