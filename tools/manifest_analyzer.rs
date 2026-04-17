// manifest_analyzer.rs -- Quick Android manifest parser (Rust)
// Build: cargo build --release
// Usage: ./manifest_analyzer <package.apk>

use std::env;
use std::process::Command;
use std::fs;
use std::path::Path;

fn extract_apk(apk_path: &str) -> Result<String, String> {
    let temp_dir = "/tmp/apk_extract";
    let _ = Command::new("mkdir").arg("-p").arg(temp_dir).output();
    Command::new("unzip")
        .arg("-q").arg(apk_path)
        .arg("-d").arg(temp_dir)
        .output()
        .map_err(|e| format!("Failed to extract APK: {}", e))?;
    Ok(temp_dir.to_string())
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <package.apk>", args[0]);
        std::process::exit(1);
    }

    let apk_path = &args[1];
    if !Path::new(apk_path).exists() {
        eprintln!("APK not found: {}", apk_path);
        std::process::exit(1);
    }

    match extract_apk(apk_path) {
        Ok(temp_dir) => {
            let manifest = format!("{}/AndroidManifest.xml", temp_dir);
            if Path::new(&manifest).exists() {
                match fs::read_to_string(&manifest) {
                    Ok(content) => {
                        println!("📦 Android Manifest Analysis");
                        println!("═══════════════════════════════\n");
                        
                        // Extract package name
                        if let Some(pkg_start) = content.find("package=") {
                            if let Some(quote_start) = content[pkg_start..].find('"') {
                                let pkg_begin = pkg_start + quote_start + 1;
                                if let Some(quote_end) = content[pkg_begin..].find('"') {
                                    let package = &content[pkg_begin..pkg_begin + quote_end];
                                    println!("Package: {}", package);
                                }
                            }
                        }

                        // Count activities
                        let activities = content.matches("<activity").count();
                        let services = content.matches("<service").count();
                        let receivers = content.matches("<receiver").count();
                        let providers = content.matches("<provider").count();
                        let perms = content.matches("<uses-permission").count();

                        println!("Activities:  {}", activities);
                        println!("Services:    {}", services);
                        println!("Receivers:   {}", receivers);
                        println!("Providers:   {}", providers);
                        println!("Permissions: {}", perms);
                        println!("\n✅ Analysis complete.");
                    }
                    Err(e) => eprintln!("Error reading manifest: {}", e),
                }
            } else {
                eprintln!("AndroidManifest.xml not found in APK");
            }

            // Cleanup
            let _ = Command::new("rm").arg("-rf").arg(temp_dir).output();
        }
        Err(e) => eprintln!("Error: {}", e),
    }
}
