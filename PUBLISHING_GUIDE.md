# Publishing Guide for Napi Vers

## 📱 App Store Listings

### App Name
**Napi Vers** (Daily Poem)

### Short Description
Minden nap egy új magyar vers - József Attila, Petőfi Sándor, Ady Endre és más klasszikusok

### Full Description (Hungarian)

📖 **Napi Vers - Fedezd fel a magyar költészet gyönyörű világát!**

Minden éjfélkor egy új, véletlenszerűen kiválasztott klasszikus magyar vers vár rád. Olvass, tanulj, és mélyülj el a magyar irodalom remekműveiben!

✨ **Funkciók:**
• 📅 Naponta új magyar vers
• 👨‍🎨 Részletes életrajzok a költőkről
• 📜 A versek történetei és keletkezésük körülményei
• 💬 Interaktív chat - kérdezz bármit a versekről és költőkről
• 🎨 Gyönyörű, olvasható kézírásos betűtípus
• 👵 Nagy betűméret az idősebb olvasóknak is

**Költők a gyűjteményben:**
József Attila, Petőfi Sándor, Ady Endre, Arany János, Kosztolányi Dezső, Radnóti Miklós, Babits Mihály, Juhász Gyula, Tompa Mihály és még sokan mások!

Tökéletes mindenkinek, aki szereti a magyar irodalmat, tanul, vagy egyszerűen csak szép versekkel szeretné indítani a napját.

---

### Keywords
magyar, vers, költészet, irodalom, napi, poetry, Hungarian, klasszikus, József Attila, Petőfi, Ady Endre

### Category
- Primary: Books
- Secondary: Education

### Age Rating
4+ (Everyone)

---

## 🚀 Step-by-Step Publishing Process

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
Create a free account at expo.dev if you don't have one.

### Step 3: Configure EAS Build
```bash
eas build:configure
```
This will link your project to EAS.

### Step 4: Build for Android
```bash
# For Google Play (AAB format)
eas build --platform android --profile production

# For direct install testing (APK format)
eas build --platform android --profile preview
```

### Step 5: Build for iOS
```bash
eas build --platform ios --profile production
```
Note: You need an Apple Developer account ($99/year) for this.

### Step 6: Download Your Builds
After the build completes, you'll get a link to download:
- Android: `.aab` file (for Google Play) or `.apk` (for testing)
- iOS: `.ipa` file (for App Store)

---

## 📱 Google Play Store Submission

### Prerequisites
1. **Google Play Developer Account**: $25 one-time fee
   - Register at: https://play.google.com/console
   
2. **Privacy Policy**: Required by Google
   - Use a free generator: https://www.freeprivacypolicy.com/
   - Host it somewhere (GitHub Pages, your website, etc.)

### Submission Steps
1. Go to Google Play Console
2. Click "Create App"
3. Fill in:
   - App name: **Napi Vers**
   - Default language: Hungarian
   - App category: Books & Reference or Education
   - Free/Paid: Free
4. Complete all required sections:
   - Store listing (description, screenshots, icon)
   - Content rating questionnaire
   - Target audience
   - Privacy policy URL
5. Upload your `.aab` file in "Production" track
6. Review and publish

**Screenshots needed:**
- At least 2 phone screenshots
- Optional: Tablet screenshots

---

## 🍎 Apple App Store Submission

### Prerequisites
1. **Apple Developer Account**: $99/year
   - Enroll at: https://developer.apple.com
   
2. **App Store Connect Access**
3. **Privacy Policy URL**

### Submission Steps
1. Go to App Store Connect
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: **Napi Vers**
   - Primary Language: Hungarian
   - Bundle ID: com.napiversek.app
   - SKU: napivers001
4. Complete app information:
   - Subtitle: "Magyar versek minden nap"
   - Description (use text above)
   - Keywords
   - Screenshots (multiple sizes required)
   - App icon
   - Privacy policy URL
5. Upload your `.ipa` file using Transporter app or EAS
6. Submit for review

**Screenshots needed:**
- 6.5" Display (iPhone 14 Pro Max)
- 5.5" Display (iPhone 8 Plus)
- iPad Pro 12.9"

---

## 📸 Taking Screenshots

### Quick Method:
1. Run app in Expo Go
2. Take screenshots on your phone
3. Use online tools to add device frames:
   - https://www.appure.io/
   - https://mockuphone.com/

### Professional Method:
1. Use iOS Simulator / Android Emulator
2. Take screenshots at required sizes
3. Add to store listings

---

## 🔐 Privacy Policy Template

Your app collects minimal data. Here's what to include:

**Data Collection:**
- No personal data is collected
- No user accounts required
- No analytics or tracking
- App uses OpenAI API and Serper API for content generation
- No data is stored on our servers

**Third-party Services:**
- OpenAI (GPT-4) - for generating content about poems and poets
- Serper - for searching additional information
- Expo - for app infrastructure

Generate a full policy at: https://www.freeprivacypolicy.com/

---

## ✅ Pre-Launch Checklist

- [ ] Test app thoroughly on multiple devices
- [ ] Verify all poems display correctly
- [ ] Test chat functionality
- [ ] Test loading states
- [ ] Check app icon looks good
- [ ] Prepare 3-5 screenshots
- [ ] Write store descriptions
- [ ] Create privacy policy and host it
- [ ] Register for developer accounts
- [ ] Build with EAS
- [ ] Test the built APK/IPA before submitting
- [ ] Submit to stores!

---

## 💡 Tips for Approval

### Google Play:
- Usually approved within 1-3 days
- Make sure privacy policy is accessible
- Provide clear screenshots showing app functionality
- Describe clearly that it's an educational/cultural app

### App Store:
- Usually 1-7 days for first review
- Be very clear about data usage
- Ensure app doesn't crash
- All features must work as described
- Consider adding parental gate if targeting children

---

## 📊 After Launch

1. **Monitor Reviews**: Respond to user feedback
2. **Track Downloads**: Use Google/Apple analytics
3. **Plan Updates**: 
   - Add more poems
   - Fix any bugs
   - Add new features users request
4. **Marketing**:
   - Share on social media
   - Contact Hungarian literature blogs
   - Share in Hungarian cultural groups

---

## 🆘 Getting Help

- Expo Forums: https://forums.expo.dev/
- Expo Discord: https://chat.expo.dev/
- Stack Overflow: Tag `expo` and `react-native`

Good luck with your launch! 🎉
