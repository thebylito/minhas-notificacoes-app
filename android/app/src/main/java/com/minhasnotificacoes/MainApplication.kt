package com.thebylito.minhasnotificacoes

import com.facebook.react.PackageList
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.reactnativenavigation.NavigationApplication
import com.reactnativenavigation.react.NavigationReactNativeHost

class MainApplication : NavigationApplication() {

  override val reactNativeHost: ReactNativeHost =
    object : NavigationReactNativeHost(this) {

      override fun getJSMainModuleName(): String = "index"

      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

      override fun getPackages(): List<ReactPackage> =
        PackageList(this).packages.apply {
          // add(NavigationPackage())
        }

      override val isHermesEnabled: Boolean
        get() = BuildConfig.IS_HERMES_ENABLED

      override val isNewArchEnabled: Boolean
        get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
    }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(this, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
  }
}
