# Napi Vers - Magyar Versek Applikáció

📖 **Napi Vers** - Minden nap egy új magyar vers

Fedezd fel a magyar költészet legszebb darabjait! Minden éjfélkor egy új, véletlenszerűen kiválasztott vers vár rád.

## ✨ Funkciók

- 📅 Naponta új magyar vers (éjfélkor változik)
- 👨‍🎨 Részletes életrajzok a költőkről (AI-generált, Serper kutatással)
- 📜 A versek történetei és keletkezésük körülményei
- 💬 Interaktív chat - kérdezz bármit a versekről és költőkről
- 🎨 Gyönyörű, olvasható kézírásos betűtípus
- 👵 Nagy betűméret (40px) az idősebb olvasóknak is

## 🎭 Költők a gyűjteményben

József Attila, Petőfi Sándor, Ady Endre, Arany János, Kosztolányi Dezső, Radnóti Miklós, Babits Mihály, Juhász Gyula, Tompa Mihály és még sokan mások!

## 🛠️ Technológia

- **React Native** + **Expo** (SDK 54)
- **OpenAI GPT-4** - Költő életrajzok és vers háttérinformációk generálása
- **Serper API** - További kutatás és kontextus
- **AsyncStorage** - Napi vers tárolása

## 🚀 Fejlesztés

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása
npm start

# Expo Go-val tesztelés telefonon
# Szkenneld be a QR kódot!
```

## 📱 Build & Deploy

```bash
# EAS Build konfiguráció
eas build:configure

# Android build
eas build --platform android --profile preview

# Éles verzió Google Play-hez
eas build --platform android --profile production
```

## 📄 Licensz

MIT License

## 👨‍💻 Fejlesztő

Készítette: MateDort
GitHub: https://github.com/MateDort
