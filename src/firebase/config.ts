// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/*
 * INSTRUCCIONES CORREGIDAS PARA GENERAR APK DESDE LÍNEA DE COMANDOS:
 * 
 * SOLUCIÓN AL ERROR DE JAVA 8:
 * 
 * 1. Instalar Java 11 o superior:
 *    - Descarga desde: https://adoptium.net/ (Eclipse Temurin JDK)
 *    - O ejecuta: winget install EclipseAdoptium.Temurin.11.JDK (en Windows)
 * 
 * 2. Configurar JAVA_HOME temporalmente para esta sesión:
 *    - Windows PowerShell: $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx"
 *    - No olvides ajustar la ruta correcta a tu instalación de Java 11
 * 
 * 3. Verificar la versión de Java:
 *    java -version
 *    (Debe mostrar una versión 11 o superior)
 * 
 * 4. SECUENCIA CORRECTA DE COMANDOS:
 *    # Desde la carpeta raíz del proyecto (E:\GitHub - Repositorios\app)
 *    npm run build
 *    npx cap sync android
 *    cd android
 *    # Ya dentro de android NO intentes hacer cd android otra vez
 *    ./gradlew assembleDebug
 *
 * 5. Si ./gradlew no funciona en PowerShell, usa:
 *    .\gradlew assembleDebug
 *    o
 *    gradlew.bat assembleDebug
 *
 * OPCIONAL: Configurar Java en gradle.properties
 * - Edita el archivo android/gradle.properties
 * - Añade la línea: org.gradle.java.home=C:\\ruta\\a\\tu\\jdk-11
 * 
 * INSTRUCCIONES ORIGINALES:
 * 
 * 1. Compilar la aplicación web:
 *    npm run build
 * 
 * 2. Añadir la plataforma Android (si es la primera vez):
 *    npm install @capacitor/android
 *    npx cap add android
 * 
 * 3. Sincronizar los archivos web con la plataforma nativa:
 *    npx cap sync android
 * 
 * 4. Generar APK de depuración:
 *    cd android
 *    ./gradlew assembleDebug
 *    (En Windows usa: gradlew.bat assembleDebug)
 * 
 * 5. El APK se generará en:
 *    android/app/build/outputs/apk/debug/app-debug.apk
 * 
 * Para generar APK firmado de producción:
 *    cd android
 *    ./gradlew assembleRelease
 *    (El APK estará en: android/app/build/outputs/apk/release/app-release-unsigned.apk)
 * 
 * Para firmar el APK de producción manualmente:
 *    1. Crear keystore (una sola vez):
 *       keytool -genkey -v -keystore shopapp-key.keystore -alias shopapp -keyalg RSA -keysize 2048 -validity 10000
 *    
 *    2. Firmar APK:
 *       jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore shopapp-key.keystore 
 *       android/app/build/outputs/apk/release/app-release-unsigned.apk shopapp
 *    
 *    3. Optimizar APK (requiere zipalign de Android SDK):
 *       zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk shopapp.apk
 */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMIZZmHLlSJyTQP_hvCCfp2dIaIxCgVyw",
  authDomain: "app-334.firebaseapp.com",
  projectId: "app-334",
  storageBucket: "app-334.firebasestorage.app",
  messagingSenderId: "512446977355",
  appId: "1:512446977355:web:4769f6cf58c46b8b2c44ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
