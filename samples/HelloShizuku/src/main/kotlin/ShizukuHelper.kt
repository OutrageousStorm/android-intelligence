package com.outrageousstorm.hello_shizuku

import android.content.pm.IPackageManager
import android.os.Binder
import android.os.ParcelFileDescriptor
import android.os.Process
import android.util.Log
import rikka.shizuku.Shizuku
import rikka.shizuku.ShizukuProvider
import java.io.BufferedReader
import java.io.InputStreamReader

object ShizukuHelper {
    private const val TAG = "ShizukuHelper"

    fun checkPermission(): Boolean {
        return Shizuku.checkSelfPermission() == 0
    }

    fun requestPermission(listener: (Boolean) -> Unit) {
        Shizuku.requestPermission(Binder(), object : Shizuku.OnRequestPermissionResultListener {
            override fun onRequestPermissionResult(requestCode: Int, grantResult: Int) {
                listener(grantResult == 0)
            }
        })
    }

    fun executeShellCommand(cmd: String): String {
        return try {
            val result = Shizuku.newProcess(arrayOf("sh", "-c", cmd), null, null).inputStream
            BufferedReader(InputStreamReader(result)).use { it.readText() }
        } catch (e: Exception) {
            Log.e(TAG, "Shell exec failed: $cmd", e)
            ""
        }
    }

    fun listInstalledPackages(): List<String> {
        val output = executeShellCommand("pm list packages")
        return output.lines()
            .filter { it.startsWith("package:") }
            .map { it.substring(8) }
            .sorted()
    }

    fun getDeviceInfo(): Map<String, String> {
        return mapOf(
            "model" to executeShellCommand("getprop ro.product.model"),
            "android" to executeShellCommand("getprop ro.build.version.release"),
            "serial" to executeShellCommand("getprop ro.serialno"),
            "build" to executeShellCommand("getprop ro.build.fingerprint"),
        ).mapValues { it.value.trim() }
    }
}
