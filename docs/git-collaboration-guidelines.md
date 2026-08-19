# 🤝 Panduan Kolaborasi Git (Git Collaboration Guidelines)
**Project:** Amanah Healthcare Dashboard

Dokumen ini berisi panduan standar alur kerja tim agar proses kolaborasi berjalan lancar tanpa kehilangan pekerjaan (*uncommitted changes*) atau bentrok (*merge conflict*).

---

## 📌 1. Cara Sync Perubahan Terbaru Saat Punya Perubahan Lokal

Jika rekan tim mengirim pembaruan ke remote (`main`) sementara kamu masih memiliki pekerjaan lokal yang belum di-commit, **jangan langsung `git pull` biasa** karena Git bisa menolaknya. Gunakan salah satu metode berikut:

### Skenario A: Metode Paling Praktis (`git stash`) ⭐ *(Direkomendasikan)*
Metode ini menyimpan sementara perubahan lokal ke memori penyimpanan Git (*stash*), menarik kode terbaru, lalu menerapkan kembali perubahanmu.

```bash
# 1. Simpan perubahan lokal ke stash
git stash

# 2. Tarik update terbaru dari repository
git pull origin main

# 3. Kembalikan perubahan lokalmu
git stash pop
```

---

### Skenario B: Metode Commit Lokal Dulu (`git pull --rebase`)
Jika perubahan lokalmu sudah cukup banyak dan ingin dijadikan commit terlebih dahulu:

```bash
# 1. Simpan semua perubahan lokal ke commit
git add -A
git commit -m "wip: simpan progres kerjaan sementara"

# 2. Tarik update terbaru dengan rebase agar riwayat commit rapi
git pull --rebase origin main
```

---

### Skenario C: Menggunakan Branch Fitur Sendiri *(Best Practice Tim)*
Untuk fitur baru, sangat disarankan bekerja di branch terpisah agar tidak bentrok dengan `main`:

```bash
# 1. Buat dan pindah ke branch baru
git checkout -b feat/nama-fitur-kamu

# 2. Lakukan perubahan dan commit
git add -A
git commit -m "feat(module): deskripsi perubahan"

# 3. Jika ingin mengambil update dari main ke branch kamu:
git checkout main
git pull origin main
git checkout feat/nama-fitur-kamu
git merge main
```

---

## ⚠️ 2. Menangani Merge Conflict (Jika Terjadi)

Jika file dan baris yang sama diedit oleh dua orang secara bersamaan, Git akan menandai konflik pada file terkait:

```text
<<<<<<< Updated upstream (Kode dari repo)
... kode dari main ...
=======
... kode lokal kamu ...
>>>>>>> Stashed changes / commit kamu
```

**Langkah penyelesaian:**
1. Buka file yang berkonflik di VS Code.
2. Pilih salah satu opsi:
   - *Accept Current Change*
   - *Accept Incoming Change*
   - *Accept Both Changes*
3. Simpan file.
4. Lakukan staging dan commit:
   ```bash
   git add <nama-file>
   git commit -m "fix: resolve merge conflict"
   ```

---

## 🧭 3. Struktur Menu Amanah Admin yang Tersedia

Struktur navigasi sidebar sudah disiapkan di `src/config/nav-config.ts` di dalam section **Manage > Amanah Admin**:

1. **Dashboard**
2. **Appointment Pasien**
3. **Data Pasien**
4. **Jadwal Dokter**
5. **Chat Pasien**
6. **Kehadiran Pegawai**

Untuk menambahkan halaman atau mengubah URL rute, kamu cukup mengedit properti `url` pada file `src/config/nav-config.ts` dan menambahkan komponen halaman terkait di folder `src/app/dashboard/...`.

---

## 📝 4. Format Pesan Commit (Conventional Commits)

Gunakan format pesan commit yang jelas dan konsisten:

- `feat:` Menambahkan fitur atau halaman baru (contoh: `feat(pasien): tambah form registrasi pasien baru`)
- `fix:` Memperbaiki bug atau error (contoh: `fix(auth): perbaiki redirect login`)
- `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas (contoh: `refactor(sidebar): rapihkan tipe data nav`)
- `chore:` Perubahan konfigurasi, dependencies, atau dokumentasi (contoh: `chore(docs): tambah panduan kolaborasi`)
- `style:` Perubahan tampilan/styling CSS/Tailwind (contoh: `style(dialog): sesuaikan warna modal`)

---

## 🚀 5. Ringkasan Perintah Harian (Cheatsheet)

| Kebutuhan | Perintah |
|---|---|
| Cek status perubahan | `git status` |
| Simpan sementara & update | `git stash` ➔ `git pull origin main` ➔ `git stash pop` |
| Buat branch baru | `git checkout -b feat/fitur-baru` |
| Jalankan dev server lokal | `npm run dev` atau `bun dev` |
