package com.outrageousstorm.examples

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import java.io.File

/**
 * Simple example: analyze device and installed packages
 * This is educational — shows how to use Android APIs to inspect system state
 */
class SimpleDeviceAnalyzer(private val context: Context) {

    data class DeviceInfo(
        val manufacturer: String,
        val model: String,
        val androidVersion: String,
        val apiLevel: Int,
        val cpuAbi: String,
        val isRoot: Boolean,
    )

    data class AppInfo(
        val packageName: String,
        val label: String,
        val isSystemApp: Boolean,
        val installTime: Long,
        val permissions: List<String>,
    )

    fun getDeviceInfo(): DeviceInfo {
        return DeviceInfo(
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
            androidVersion = Build.VERSION.RELEASE,
            apiLevel = Build.VERSION.SDK_INT,
            cpuAbi = Build.CPU_ABI,
            isRoot = detectRoot(),
        )
    }

    fun getInstalledApps(): List<AppInfo> {
        val pm = context.packageManager
        val packages = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
        return packages.map { pkg ->
            val appInfo = pm.getApplicationInfo(pkg.packageName, 0)
            val label = pm.getApplicationLabel(appInfo).toString()
            val isSystem = (appInfo.flags and android.app.ApplicationInfo.FLAG_SYSTEM) != 0
            AppInfo(
                packageName = pkg.packageName,
                label = label,
                isSystemApp = isSystem,
                installTime = pkg.firstInstallTime,
                permissions = pkg.requestedPermissions?.toList() ?: emptyList(),
            )
        }
    }

    fun getAppPermissions(packageName: String): List<String> {
        val pm = context.packageManager
        val pkg = pm.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
        return pkg.requestedPermissions?.toList() ?: emptyList()
    }

    fun hasGrantedPermission(packageName: String, permission: String): Boolean {
        return context.checkPermission(permission, -1, -1) == PackageManager.PERMISSION_GRANTED
    }

    private fun detectRoot(): Boolean {
        val su = listOf(
            "/system/bin/su",
            "/system/xbin/su",
            "/sbin/su",
            "/data/local/tmp/su",
        ).any { File(it).exists() }

        val magisk = File("/sbin/.magisk").exists() || File("/data/adb/magisk").exists()

        return su || magisk
    }
}

// Usage example:
// val analyzer = SimpleDeviceAnalyzer(context)
// val device = analyzer.getDeviceInfo()
// val apps = analyzer.getInstalledApps()
// val permissions = analyzer.getAppPermissions("com.example.app")
