package com.cosmicfocus

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.*

class DeepFocusModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    companion object {
        private const val TAG = "DeepFocusModule"
        private const val OVERLAY_PERMISSION_REQUEST_CODE = 1234
        private const val USAGE_STATS_PERMISSION_REQUEST_CODE = 5678
        private const val BATTERY_OPTIMIZATION_REQUEST_CODE = 9012
    }
    
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private val handler = Handler(Looper.getMainLooper())
    private var appCheckRunnable: Runnable? = null
    private var isDeepFocusActive = false
    private val currentPackageName: String = reactContext.packageName

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "DeepFocusModule"

    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        try {
            val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), 
                reactApplicationContext.packageName
            )
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun canDrawOverlays(promise: Promise) {
        try {
            val canDraw = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactApplicationContext)
            } else {
                true
            }
            promise.resolve(canDraw)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactApplicationContext.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactApplicationContext.startActivity(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isBatteryOptimizationIgnored(promise: Promise) {
        try {
            val isIgnoring = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
                powerManager.isIgnoringBatteryOptimizations(reactApplicationContext.packageName)
            } else {
                true
            }
            promise.resolve(isIgnoring)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimization(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${reactApplicationContext.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactApplicationContext.startActivity(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun startDeepFocus(promise: Promise) {
        try {
            isDeepFocusActive = true
            startAppMonitoring()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopDeepFocus(promise: Promise) {
        try {
            isDeepFocusActive = false
            stopAppMonitoring()
            hideOverlay()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun onAppBackground() {
        if (isDeepFocusActive) {
            //when app goes to background
            handler.postDelayed({ checkCurrentApp() }, 1000)
        }
    }

    private fun startAppMonitoring() {
        if (appCheckRunnable == null) {
            appCheckRunnable = object : Runnable {
                override fun run() {
                    checkCurrentApp()
                    if (isDeepFocusActive) {
                        handler.postDelayed(this, 2000)
                    }
                }
            }
        }
        appCheckRunnable?.let { handler.post(it) }
    }

    private fun stopAppMonitoring() {
        appCheckRunnable?.let { handler.removeCallbacks(it) }
    }

    private fun checkCurrentApp() {
        val currentApp = getCurrentForegroundApp()
        when {
            currentApp != null && currentApp != currentPackageName && !isSystemApp(currentApp) -> {
                // when another app is in foreground and its not system app
                showOverlay(currentApp)
            }
            currentApp != null && (currentApp == currentPackageName || isSystemApp(currentApp)) -> {
                // when our app is in foreground or a system app is active
                hideOverlay()
            }
        }
    }

    private fun isSystemApp(packageName: String): Boolean {
        // list of system apps and launchers to ignore
        val systemApps = setOf(
            "com.android.launcher3",
            "com.google.android.apps.nexuslauncher", 
            "com.samsung.android.app.launcher",
            "com.sec.android.app.launcher",
            "com.android.launcher",
            "com.samsung.android.home",
            "com.oneplus.launcher",
            "com.miui.home",
            "com.huawei.android.launcher",
            "com.oppo.launcher",
            "com.vivo.launcher",
            "com.samsung.android.oneui.home",
            
            "com.android.systemui",
            "android",
            "com.android.settings",
            
            "com.android.keyguard",
            "com.samsung.android.keyguard",
            "com.android.inputmethod.latin",
            "com.samsung.android.honeyboard",
            "com.google.android.inputmethod.latin",
            
            "com.android.systemui.recents",
            "com.samsung.android.app.taskedge",
            
            "com.google.android.packageinstaller",
            "com.android.packageinstaller",
            "com.android.vending",
        )
        
        // apps that should not be filtered
        val allowedSystemApps = setOf(
            // communication apps
            "com.android.phone",
            "com.samsung.android.dialer",
            "com.google.android.dialer",
            "com.android.mms",
            "com.samsung.android.messaging",
            "com.google.android.apps.messaging",
            
            // google apps
            "com.android.chrome",
            "com.google.android.youtube",
            "com.google.android.gm", // Gmail
            "com.google.android.apps.meet",
            "com.google.android.apps.photos",
            
            // camera, gallery
            "com.android.camera2",
            "com.samsung.android.camera",
            "com.android.gallery3d",
            "com.samsung.android.gallery3d",
            "com.google.android.apps.photos",
            
            // other common system apps 
            "com.android.contacts",
            "com.samsung.android.contacts",
            "com.android.calendar",
            "com.samsung.android.calendar"
        )
        
        // if it's explicitly allowed, don't filter it
        if (allowedSystemApps.contains(packageName)) {
            Log.d(TAG, "App $packageName is in allowed list, showing overlay")
            return false
        }
        
        // check if it's in our system apps blacklist
        if (systemApps.contains(packageName)) {
            Log.d(TAG, "App $packageName is in system blacklist, filtering out")
            return true
        }
        
        // for other apps, only filter out if they're core system apps without user interaction
        return try {
            val packageManager = reactApplicationContext.packageManager
            val applicationInfo = packageManager.getApplicationInfo(packageName, 0)
            
            // only filter out apps that are system apps and don't have a launcher icon
            val isSystemApp = (applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            val hasLauncherIcon = packageManager.getLaunchIntentForPackage(packageName) != null
            
            val shouldFilter = isSystemApp && !hasLauncherIcon
            
            Log.d(TAG, "App $packageName - isSystem: $isSystemApp, hasLauncher: $hasLauncherIcon, filtering: $shouldFilter")
            
            shouldFilter
        } catch (e: Exception) {
            Log.w(TAG, "Could not get app info for $packageName", e)
            false
        }
    }

    private fun getCurrentForegroundApp(): String? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            try {
                val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
                val time = System.currentTimeMillis()
                val appList = usageStatsManager.queryUsageStats(
                    UsageStatsManager.INTERVAL_DAILY, 
                    time - 1000 * 1000, 
                    time
                )
                
                if (!appList.isNullOrEmpty()) {
                    val sortedMap = TreeMap<Long, UsageStats>()
                    for (usageStats in appList) {
                        sortedMap[usageStats.lastTimeUsed] = usageStats
                    }
                    sortedMap[sortedMap.lastKey()]?.packageName
                } else {
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error getting current foreground app", e)
                null
            }
        } else {
            null
        }
    }

    private fun showOverlay(appPackageName: String) {
        if (overlayView != null) {
            return
        }

        try {
            windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            
            val inflater = LayoutInflater.from(reactApplicationContext)
            overlayView = inflater.inflate(R.layout.overlay_layout, null)

            val messageText = overlayView?.findViewById<TextView>(R.id.message_text)
            val returnButton = overlayView?.findViewById<Button>(R.id.return_button)
            
            val appName = getAppName(appPackageName)
            messageText?.text = "Is $appName distracting you?"
            
            returnButton?.setOnClickListener {
                hideOverlay()
                bringAppToFront()
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT, 
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) 
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                else 
                    WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_INSET_DECOR,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.CENTER
                x = 0
                y = 0
            }

            overlayView?.let { windowManager?.addView(it, params) }
        } catch (e: Exception) {
            Log.e(TAG, "Error showing overlay", e)
        }
    }

    private fun hideOverlay() {
        overlayView?.let { view ->
            try {
                windowManager?.removeView(view)
                overlayView = null
            } catch (e: Exception) {
                Log.e(TAG, "Error hiding overlay", e)
            }
        }
    }

    private fun bringAppToFront() {
        try {
            val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(currentPackageName)
            intent?.let {
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                reactApplicationContext.startActivity(it)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error bringing app to front", e)
        }
    }

    private fun getAppName(packageName: String): String {
        return try {
            val pm = reactApplicationContext.packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    override fun onActivityResult(activity: android.app.Activity, requestCode: Int, resultCode: Int, data: Intent?) {
   
    }

    override fun onNewIntent(intent: Intent) {

    }
}