# Arrow Escape — Android Production Release & Play Store Guide

This guide details the exact steps to generate a signed Android App Bundle (`.aab`) and publish **Arrow Escape** on Google Play Console.

---

## 1. Keystore Generation (Production Signing)

Generate a cryptographically secure upload keystore using the standard Java `keytool`:

```bash
keytool -genkeypair -v -keystore arrow-escape-release.keystore \
  -alias arrow-escape-key -keyalg RSA -keysize 2048 -validity 10000
```

Keep your keystore file and passwords secure and **never commit `.keystore` files to public git repositories**.

---

## 2. Configure Gradle Signing Credentials

In `android/gradle.properties` (or user `~/.gradle/gradle.properties`):

```properties
MYAPP_UPLOAD_STORE_FILE=arrow-escape-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=arrow-escape-key
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

In `android/app/build.gradle`:

```groovy
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 3. Build Production Android App Bundle (.aab)

Run the Gradle bundle command:

```bash
cd android
./gradlew bundleRelease
```

The compiled release bundle will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. Google Play Console Submission Checklist

### A. App Setup
- [ ] **App Name:** `Arrow Escape: Logic Puzzle` (from `docs/STORE_LISTING.md`)
- [ ] **Short Description:** Included from `docs/STORE_LISTING.md`
- [ ] **Full Description:** Formatted copy from `docs/STORE_LISTING.md`
- [ ] **App Category:** Puzzle / Casual

### B. Graphic Assets
- [ ] **App Icon:** High-res $512 \times 512$ PNG (`src/assets/branding/app_icon.jpg`)
- [ ] **Feature Graphic:** $1024 \times 500$ PNG (`src/assets/branding/feature_graphic.jpg`)
- [ ] **Screenshots:** At least 4 phone screenshots (minimum $1080 \times 1920$)

### C. Policy & Compliance
- [ ] **Privacy Policy:** Link hosted URL pointing to `docs/PRIVACY_POLICY.md`
- [ ] **Ads Declaration:** Declare "Yes, my app contains ads" (Google AdMob)
- [ ] **Data Safety:** Complete declaration according to `docs/STORE_LISTING.md` (No personal data, device IDs for AdMob)
- [ ] **Target Audience:** Target age 13+ (or complete Families Policy requirements if including younger players)

### D. Release Track
- [ ] Create release in **Closed Testing** or **Internal Testing** track first.
- [ ] Upload signed `app-release.aab`.
- [ ] Verify Google automated Pre-launch Report has 0 crashes and 0 performance errors.
- [ ] Promote to **Production** track!
