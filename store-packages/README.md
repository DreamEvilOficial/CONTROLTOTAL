PWA Store Packaging - assets and instructions

This folder contains templates and configuration to prepare packages for Google Play (Android TWA) and Apple App Store (iOS via Capacitor).

What you'll find here:

- `twa/bubblewrap-config.json` - Bubblewrap configuration template for generating an Android TWA (Trusted Web Activity). Replace placeholders and run `npx @bubblewrap/cli init` / `npx @bubblewrap/cli build` on a machine with Node and Bubblewrap installed.
- `ios/README.md` - Steps to create an iOS wrapper using Capacitor and build with Xcode on a Mac.
- `.well-known` templates - `assetlinks.json.template` and `apple-app-site-association.template` for Digital Asset Links / Universal Links. Fill with your package name and app IDs.

Steps (summary):
1. Provide your Android package name (e.g. `com.tudominio.cargarfichasya`) and SHA256 fingerprint (if you sign with your keystore) and update `twa/bubblewrap-config.json` and `public/.well-known/assetlinks.json.template`.
2. Generate Android AAB with Bubblewrap and sign with your keystore.
3. For iOS, follow `ios/README.md`: use Capacitor to scaffold an Xcode project, configure Associated Domains and upload through Xcode/Transporter.
4. Replace placeholder store links in `app/install/page.tsx` with your actual Play/App Store links.

Note: I can prepare these packages and configurations, but publishing requires access to your Google Play and Apple Developer accounts for final signing and upload. For security, I recommend I prepare artifacts and you upload them through your accounts.
