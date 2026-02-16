iOS (Capacitor) packaging steps

1. On a Mac, install Capacitor and initialize:

```bash
npx create-react-app temp && cd temp
npm install @capacitor/core @capacitor/cli
npx cap init CargarFichasYA com.example.cargarfichasya
```

2. Copy your web build into the `www` folder (or configure `capacitor.config.json` to point to your Next.js export). Then:

```bash
npx cap add ios
npx cap open ios
```

3. In Xcode configure Signing & Capabilities, Associated Domains (add `applinks:YOUR_DOMAIN`) and build/archive the app. Upload with Xcode or Transporter.

Notes:
- You need an Apple Developer account, provisioning profile and certificates to sign and upload.
- Associated Domains requires the `apple-app-site-association` file served at `https://YOUR_DOMAIN/.well-known/apple-app-site-association`.
