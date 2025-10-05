# Quick Start - Publishing to Google Play

## Commands to Run (in order):

### 1. Login to Expo
```bash
eas login
```
Enter your username: **Mdort**
Enter your password when prompted

### 2. Configure EAS Build
```bash
eas build:configure
```
- Select: **Android**
- Accept defaults

### 3. Build Preview APK (for testing on your phone)
```bash
eas build --platform android --profile preview
```
This will take 10-15 minutes. You'll get a download link.

### 4. Test the APK thoroughly on your phone

### 5. Build Production AAB (for Google Play)
```bash
eas build --platform android --profile production
```

### 6. Download your AAB file and submit to Google Play!

---

## Next: Open your terminal and run these commands one by one!

Start with: `eas login`

