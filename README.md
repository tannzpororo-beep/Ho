# STICKMAN ARENA — Offline 1v1 Fight

Game fighting stickman original, single-player melawan CPU. Tidak memakai Supabase, database online, login, atau backend Node.js. Progress tersimpan lokal pada perangkat menggunakan `localStorage`.

## Fitur
- PWA installable dan dapat dimainkan offline setelah pertama kali dibuka.
- Landscape-first responsive layout untuk Android dan desktop.
- Lobby, Play, Fighter Shop, 8 skin, coin reward dan local save.
- 1v1 melawan CPU dengan 4 tingkat kesulitan: Easy, Normal, Hard, Expert.
- Joystick touch, Attack, Block, Skill 1 Dash, Skill 2 Blast, Skill 3 Ultimate.
- Keyboard desktop: A/D atau ←/→ untuk bergerak, Space untuk attack, 1/2/3 untuk skill, J untuk block.
- Efek suara original sintetis dan 4 background arena.
- Tidak perlu koneksi internet untuk gameplay setelah aset ter-cache.

## Jalankan di komputer
Paling mudah: buka `index.html` lewat local static server. Contoh jika Python tersedia:
`python -m http.server 8080`
Lalu buka `http://localhost:8080`. Tidak ada dependency npm.

## Install sebagai PWA di Android
1. Upload folder ini ke hosting HTTPS statis (atau jalankan di LAN untuk testing).
2. Buka URL di Chrome Android, tunggu cache service worker selesai.
3. Menu Chrome ⋮ → Install app / Add to Home screen.
4. Setelah berhasil di-install dan dibuka sekali, game dapat berjalan offline.

> PWA perlu dibuka melalui HTTPS atau localhost agar Service Worker aktif. Membuka index.html langsung dari file manager tidak mengaktifkan instalasi offline.

## Membuat APK Android (opsional)
PWA bukan APK. Untuk APK native wrapper gunakan Capacitor pada komputer dengan Node.js + Android Studio:
1. `npm init -y`
2. `npm install @capacitor/core @capacitor/cli @capacitor/android`
3. Buat `capacitor.config.json` dengan `{"appId":"com.stickmanarena.offline","appName":"Stickman Arena","webDir":"."}`
4. `npx cap add android`
5. `npx cap sync android`
6. `npx cap open android`, lalu Build > Build APK di Android Studio.

Gameplay tetap offline karena semua file game lokal. Node.js hanya diperlukan saat proses build APK, bukan saat game dimainkan. Jika tidak ingin memasang Node.js, gunakan versi PWA.

## Catatan ukuran
Folder project berisi artwork arena resolusi tinggi, icon, dan audio lokal. Ukuran APK final bergantung pada Android wrapper, ABI, dan konfigurasi build; target minimal 5 MB tidak dapat dijamin hanya dari source web ZIP. Jangan menambahkan file kosong/padding untuk mengejar ukuran—gunakan aset game yang benar-benar dipakai.

## Struktur
- `index.html` — UI dan halaman game
- `style.css` — premium dark neon UI + landscape/mobile layout
- `game.js` — gameplay, AI, combat, shop, save
- `sw.js` — offline cache
- `manifest.webmanifest` — metadata PWA
- `assets/backgrounds/` — arena art
- `assets/audio/` — original SFX
- `assets/icons/` — PWA icons

## Troubleshooting
- Jika offline tidak aktif, jalankan dari HTTPS/localhost, bukan `file://`.
- Jika perubahan game tidak muncul, clear site data/cache atau naikkan nama cache pada `sw.js`.
- Data shop tersimpan per browser/perangkat. Menghapus data browser dapat menghapus save.
