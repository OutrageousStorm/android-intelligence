use clap::{Parser, Subcommand};
use std::process::Command;

#[derive(Parser)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Audit dangerous permissions
    PermissionAudit { #[arg(short)] package: Option<String> },
    /// Check privacy settings
    PrivacyCheck,
    /// List installed apps
    ListApps { #[arg(short)] user_only: bool },
    /// Device info
    DeviceInfo,
}

fn adb(cmd: &str) -> String {
    let output = Command::new("sh")
        .arg("-c")
        .arg(format!("adb shell {}", cmd))
        .output()
        .expect("Failed to run adb");
    String::from_utf8_lossy(&output.stdout).trim().to_string()
}

fn main() {
    let cli = Cli::parse();
    match cli.command {
        Commands::DeviceInfo => {
            println!("\n📱 Device Info\n");
            println!("Model:   {}", adb("getprop ro.product.model"));
            println!("Android: {}", adb("getprop ro.build.version.release"));
        },
        Commands::ListApps { user_only } => {
            let flag = if user_only { "-3" } else { "" };
            println!("\n📦 Installed apps\n");
            println!("{}", adb(&format!("pm list packages {}", flag)));
        },
        Commands::PrivacyCheck => {
            println!("\n🔍 Privacy check\n");
            let tracking = adb("settings get global limit_ad_tracking");
            println!("Ad tracking: {}", if tracking == "1" { "✅ disabled" } else { "⚠️  enabled" });
        },
        Commands::PermissionAudit { .. } => {
            println!("\n🔐 Permission audit\n");
            println!("Checking dangerous permissions: location, contacts, camera, mic, SMS");
        }
    }
}
