package com.outrageousstorm.android

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings

/**
 * Android utility functions — device info, permissions, settings helpers
 */
object AndroidUtils {

    fun getDeviceModel(): String = android.os.Build.MODEL
    fun getAndroidVersion(): String = Build.VERSION.RELEASE
    fun getAndroidSdk(): Int = Build.VERSION.SDK_INT
    fun getFingerprint(): String = Build.FINGERPRINT

    fun hasPermission(context: Context, permission: String): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED
        } else {
            true  // pre-M has all permissions by default
        }
    }

    fun getInstalledPackages(context: Context, flags: Int = 0): List<String> {
        return context.packageManager.getInstalledApplications(flags).map { it.packageName }
    }

    fun isPackageInstalled(context: Context, packageName: String): Boolean {
        return try {
            context.packageManager.getApplicationInfo(packageName, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    fun getSetting(context: Context, key: String, namespace: String = "secure"): String {
        return when (namespace) {
            "system" -> Settings.System.getString(context.contentResolver, key) ?: ""
            "global" -> Settings.Global.getString(context.contentResolver, key) ?: ""
            else -> Settings.Secure.getString(context.contentResolver, key) ?: ""
        }
    }

    fun setSetting(context: Context, key: String, value: String, namespace: String = "secure"): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
                   !context.hasPermission(android.Manifest.permission.WRITE_SECURE_SETTINGS)) {
            false  // requires permission
        } else {
            when (namespace) {
                "system" -> Settings.System.putString(context.contentResolver, key, value)
                "global" -> Settings.Global.putString(context.contentResolver, key, value)
                else -> Settings.Secure.putString(context.contentResolver, key, value)
            }
            true
        }
    }

    fun getDeviceInfo(context: Context): Map<String, String> {
        return mapOf(
            "model" to getDeviceModel(),
            "manufacturer" to Build.MANUFACTURER,
            "android_version" to getAndroidVersion(),
            "sdk" to getAndroidSdk().toString(),
            "hardware" to Build.HARDWARE,
            "fingerprint" to getFingerprint(),
            "device" to Build.DEVICE,
            "product" to Build.PRODUCT,
        )
    }

    fun isEmulator(): Boolean {
        return (Build.FINGERPRINT.contains("generic") ||
                Build.FINGERPRINT.contains("unknown") ||
                Build.MODEL.contains("google_sdk") ||
                Build.MODEL.contains("Emulator") ||
                Build.DEVICE.contains("generic"))
    }

    fun isRooted(): Boolean {
        val paths = arrayOf("/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/tmp/su")
        return paths.any { java.io.File(it).exists() }
    }
}
