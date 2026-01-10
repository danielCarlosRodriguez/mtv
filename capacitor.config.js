/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.mtv.app',
  appName: 'MTV',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // En desarrollo, puedes apuntar a tu servidor local
    // url: 'http://192.168.1.xxx:5173', // Reemplaza con tu IP local
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
  },
};

export default config;
