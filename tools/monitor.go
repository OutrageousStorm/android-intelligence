package main

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"time"
)

// Monitor Android device via ADB logcat
// Usage: go run monitor.go --filter "ANR|CRASH|error" --tail 100

func adb(args ...string) []string {
	cmd := exec.Command("adb", args...)
	out, _ := cmd.StdoutPipe()
	cmd.Start()

	var lines []string
	scanner := bufio.NewScanner(out)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	cmd.Wait()
	return lines
}

func main() {
	filter := flag.String("filter", ".*", "Regex filter")
	tail := flag.Int("tail", 50, "Lines to show")
	follow := flag.Bool("f", false, "Follow mode (live)")
	flag.Parse()

	regex := regexp.MustCompile(*filter)

	if *follow {
		fmt.Println("🔍 Android Monitor (live, Ctrl+C to stop)")
		fmt.Println("Filter: " + *filter + "
")

		cmd := exec.Command("adb", "logcat")
		out, _ := cmd.StdoutPipe()
		cmd.Start()

		scanner := bufio.NewScanner(out)
		for scanner.Scan() {
			line := scanner.Text()
			if regex.MatchString(line) {
				fmt.Println(line)
			}
		}
		cmd.Wait()
	} else {
		lines := adb("logcat", "-d")
		count := 0
		for _, line := range lines {
			if regex.MatchString(line) && count < *tail {
				fmt.Println(line)
				count++
			}
		}
		fmt.Printf("
%d lines matched
", count)
	}
}
