package main

import (
	"encoding/xml"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"sort"
	"strings"
)

// Manifest represents AndroidManifest.xml structure
type Manifest struct {
	XMLName     xml.Name     `xml:"manifest"`
	Package     string       `xml:"package,attr"`
	Permissions []Permission `xml:"uses-permission"`
	Activities  []Activity   `xml:"application>activity"`
	Services    []Service    `xml:"application>service"`
	Receivers   []Receiver   `xml:"application>receiver"`
	Providers   []Provider   `xml:"application>provider"`
}

type Permission struct {
	Name string `xml:"name,attr"`
}

type Activity struct {
	Name string `xml:"name,attr"`
}

type Service struct {
	Name string `xml:"name,attr"`
}

type Receiver struct {
	Name string `xml:"name,attr"`
}

type Provider struct {
	Name string `xml:"name,attr"`
}

var dangerousPermissions = map[string]bool{
	"android.permission.READ_PHONE_STATE":     true,
	"android.permission.READ_CONTACTS":        true,
	"android.permission.READ_SMS":             true,
	"android.permission.SEND_SMS":             true,
	"android.permission.RECORD_AUDIO":         true,
	"android.permission.CAMERA":               true,
	"android.permission.ACCESS_FINE_LOCATION": true,
	"android.permission.ACCESS_COARSE_LOCATION": true,
	"android.permission.READ_CALENDAR":        true,
	"android.permission.WRITE_CALENDAR":       true,
}

func main() {
	manifestFile := flag.String("manifest", "", "Path to AndroidManifest.xml")
	flag.Parse()

	if *manifestFile == "" {
		fmt.Println("Usage: android-manifest-analyzer -manifest <path/to/AndroidManifest.xml>")
		os.Exit(1)
	}

	data, err := ioutil.ReadFile(*manifestFile)
	if err != nil {
		log.Fatalf("Error reading file: %v", err)
	}

	var manifest Manifest
	if err := xml.Unmarshal(data, &manifest); err != nil {
		log.Fatalf("Error parsing XML: %v", err)
	}

	analyzeManifest(&manifest)
}

func analyzeManifest(m *Manifest) {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("📦 Android Manifest Analysis")
	fmt.Println(strings.Repeat("=", 70))

	fmt.Printf("\n📱 Package: %s\n", m.Package)

	// Analyze permissions
	fmt.Printf("\n🔐 Permissions (%d total):\n", len(m.Permissions))
	dangerous := []string{}
	for _, perm := range m.Permissions {
		if dangerousPermissions[perm.Name] {
			fmt.Printf("  🚨 %s\n", perm.Name)
			dangerous = append(dangerous, perm.Name)
		} else {
			fmt.Printf("  ✓ %s\n", perm.Name)
		}
	}

	if len(dangerous) > 0 {
		fmt.Printf("\n⚠️  Found %d dangerous permissions\n", len(dangerous))
	}

	// Analyze components
	fmt.Printf("\n🎯 Components:\n")
	fmt.Printf("  Activities: %d\n", len(m.Activities))
	for _, a := range m.Activities {
		fmt.Printf("    • %s\n", a.Name)
	}

	fmt.Printf("  Services: %d\n", len(m.Services))
	for _, s := range m.Services {
		fmt.Printf("    • %s\n", s.Name)
	}

	fmt.Printf("  Receivers: %d\n", len(m.Receivers))
	for _, r := range m.Receivers {
		fmt.Printf("    • %s\n", r.Name)
	}

	fmt.Printf("  Providers: %d\n", len(m.Providers))
	for _, p := range m.Providers {
		fmt.Printf("    • %s\n", p.Name)
	}

	// Generate security score
	score := calculateSecurityScore(m, dangerous)
	fmt.Printf("\n🔒 Security Score: %d/100\n", score)

	if score < 50 {
		fmt.Println("  ❌ High risk — consider requesting minimal permissions")
	} else if score < 75 {
		fmt.Println("  ⚠️  Medium risk — some permissions are concerning")
	} else {
		fmt.Println("  ✅ Good — permissions appear reasonable")
	}

	fmt.Println()
}

func calculateSecurityScore(m *Manifest, dangerous []string) int {
	score := 100
	
	// Deduct for dangerous permissions
	score -= len(dangerous) * 15
	
	// Deduct for excessive components
	if len(m.Activities) > 5 {
		score -= 10
	}
	if len(m.Services) > 3 {
		score -= 10
	}
	if len(m.Receivers) > 2 {
		score -= 5
	}
	if len(m.Providers) > 1 {
		score -= 5
	}

	if score < 0 {
		score = 0
	}

	return score
}
