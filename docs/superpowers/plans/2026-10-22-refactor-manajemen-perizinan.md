# Refactor Arsitektur & UI Manajemen Perizinan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghilangkan redundansi kalkulasi payroll dan tab filter di modul Manajemen Perizinan, menyamakan paradigma toolbar & filter facets dengan Jadwal Dokter, mengimplementasikan custom hook filter dan search engine mobile, serta menyelaraskan surface card dan detail sheet dengan standar Staff Management & Jadwal Dokter.

**Architecture:** Menerapkan Clean Architecture dan Separation of Concerns pada modul `manajemen-perizinan`. Memisahkan filter state management ke dalam `useLeaveFilters` yang tersinkronisasi dengan query params (`nuqs`) dan TanStack Query, mengisolasi presentasi filter ke komponen desktop `LeaveManagementFilters` dan mobile `LeaveMobileFilterToolbar`, mengintegrasikan peluang pengganti melalui dedicated action button dan modal, serta menyederhanakan hierarki surface card dan detail drawer dengan utilitas format tanggal resmi klinik (`date-format.ts`).

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, TanStack Query, `nuqs`, Tailwind CSS, Radix UI, GSAP.

**Spec:** User Specification & Engineering Rules (Refactor Manajemen Perizinan 25-Point Requirement Table).

## Global Constraints
- Runtime & Package Manager: `bun` mandatory di `kolaborasihealthcare`.
- Zero Hardcoding & Single Source of Truth: Gunakan backend data contract dari `/api/v1/leaves/all` dan `/api/v1/replacements`.
- Tanggal & Waktu: Wajib menggunakan utilitas SSOT `@/lib/date-format` (`formatClinicDate`, `formatClinicDateTime`).
- Minimalis: Tanpa warna-warni berlebih, tanpa pemaksaan huruf besar (`uppercase`), dan tanpa separator titik redundan (misal "Dokter • Dokter Umum" diubah menjadi hanya profesi "Dokter Umum").
- Hapus duplikasi: Tidak boleh ada modal kalkulasi payroll di Manajemen Perizinan karena sudah tersedia di Manajemen Penggajian (`/dashboard/payroll`).

---

### Task 1: Pembersihan Header Halaman & Redundansi Payroll Modal

**Files:**
- Modify: `kolaborasihealthcare/src/app/dashboard/manajemen-perizinan/page.tsx:6-18`
- Delete: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-payroll-modal.tsx`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/index.ts:1-15`

**Interfaces:**
- Page title diubah dari "Manajemen Perizinan & Cuti" menjadi "Manajemen Perizinan".
- `LeavePayrollModal` dihapus secara tuntas dari ekspor modul.

- [ ] **Step 1: Update metadata dan judul halaman pada page.tsx**
  Ubah metadata dan `PageContainer` `pageTitle` menjadi `"Manajemen Perizinan"` serta deskripsi `"Kelola permohonan izin staf dan peluang dinas pengganti klinik."`.

- [ ] **Step 2: Hapus berkas leave-payroll-modal.tsx**
  Hapus berkas `leave-payroll-modal.tsx` karena fitur kalkulasi payroll sudah tersentralisasi di modul Manajemen Penggajian (`src/features/payroll`).

- [ ] **Step 3: Bersihkan ekspor di index.ts**
  Hapus baris `export * from './components/leave-payroll-modal';` dari `src/features/manajemen-perizinan/index.ts`.

- [ ] **Step 4: Jalankan verifikasi statis typecheck**
  Jalankan `bun run typecheck` di `kolaborasihealthcare` untuk memastikan tidak ada import dangling ke `leave-payroll-modal`.

---

### Task 2: Pembuatan Core Filter Hook (`useLeaveFilters.ts`)

**Files:**
- Create: `kolaborasihealthcare/src/features/manajemen-perizinan/model/useLeaveFilters.ts`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/model/index.ts`

**Interfaces:**
- Produces: `useLeaveFilters({ leaves: LeaveRequestItem[] })`
  - Returns:
    - `searchQuery: string`
    - `statusFilter: string[]`
    - `staffTypeFilter: string[]`
    - `leaveTypeFilter: string[]`
    - `filteredLeaves: LeaveRequestItem[]`
    - `hasActiveFilters: boolean`
    - `actions: { changeSearch, changeStatusFilter, changeStaffTypeFilter, changeLeaveTypeFilter, resetFilters }`

- [ ] **Step 1: Implementasikan hook useLeaveFilters dengan nuqs query states**
  Buat `src/features/manajemen-perizinan/model/useLeaveFilters.ts` yang mengelola:
  - `search`: teks pencarian (nama staf, id, alasan)
  - `status`: multi-value status (`pending`, `approved`, `rejected`, `cancelled`)
  - `staffType`: multi-value jenis staf (`doctor`, `midwife`, `worker`)
  - `leaveType`: multi-value tipe izin (`annual_leave`, `sick_leave`, `seminar_symposium`, `family_matter`, `external_assignment`, `other`)
  - Filtering komputasi memoisasi yang aman dan deterministik.

- [ ] **Step 2: Ekspor useLeaveFilters dari model/index.ts**
  Tambahkan `export * from './useLeaveFilters';` pada `src/features/manajemen-perizinan/model/index.ts`.

- [ ] **Step 3: Jalankan verifikasi typecheck**
  Jalankan `bun run typecheck` di `kolaborasihealthcare`.

---

### Task 3: Komponen Filter Desktop (`LeaveManagementFilters.tsx`)

**Files:**
- Create: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-management-filters.tsx`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/index.ts`

**Interfaces:**
- Mengadopsi paradigma `DoctorScheduleFilters`:
  - `SearchInput` dari `@/shared/ui/search-input` (placeholder: "Cari permohonan izin...")
  - `FacetedFilter` Status (`title="Status"`, icon: `Icons.activity`, options: Menunggu, Disetujui, Ditolak, Dibatalkan)
  - `FacetedFilter` Kategori Staf (`title="Kategori"`, icon: `Icons.users`, options: Dokter, Bidan, Staf Operasional)
  - `FacetedFilter` Tipe Izin (`title="Tipe Izin"`, icon: `Icons.calendar`, options: Cuti Tahunan, Izin Sakit, Seminar/Simposium, Keperluan Keluarga, Tugas Luar, Lainnya)
  - Tombol `Reset` filter bergaris putus-putus (`border border-dashed border-border`).

- [ ] **Step 1: Buat berkas leave-management-filters.tsx**
  Implementasikan komponen filter desktop menggunakan shared atom `SearchInput` dan `FacetedFilter` dengan debounce pencarian 250ms.

- [ ] **Step 2: Ekspor leave-management-filters di index.ts**
  Daftarkan komponen ke dalam `src/features/manajemen-perizinan/index.ts`.

- [ ] **Step 3: Verifikasi typecheck**
  Jalankan `bun run typecheck`.

---

### Task 4: Modal & Integrasi Peluang Pengganti (`ReplacementOpportunitiesModal.tsx`)

**Files:**
- Create: `kolaborasihealthcare/src/features/manajemen-perizinan/components/replacement-opportunities-modal.tsx`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/index.ts`

**Interfaces:**
- Modal dialog untuk menampilkan daftar sesi dinas pengganti yang terbuka/terklaim bagi Admin.
- Menampilkan kartu peluang dinas dengan status pill, tanggal dinas terformat, nama staf izin, dan nama staf pengganti (jika sudah diklaim).
- Memungkinkan Admin memeriksa detail atau melakukan aksi terkait replacement.

- [ ] **Step 1: Buat berkas replacement-opportunities-modal.tsx**
  Implementasikan modal responsif menggunakan `ModalWrapper` (`maxWidth="w-full sm:max-w-3xl lg:max-w-4xl"`), dengan header minimalis, filter status peluang dinas (`all`, `open`, `claimed`, `completed`), dan daftar kartu peluang pengganti.

- [ ] **Step 2: Ekspor modal di index.ts**
  Tambahkan ekspor `replacement-opportunities-modal` pada `src/features/manajemen-perizinan/index.ts`.

- [ ] **Step 3: Verifikasi typecheck**
  Jalankan `bun run typecheck`.

---

### Task 5: Komponen Mobile Filter Toolbar Dock (`LeaveMobileFilterToolbar.tsx`)

**Files:**
- Create: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-mobile-filter-toolbar.tsx`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/index.ts`

**Interfaces:**
- Mengadopsi pola `DoctorScheduleMobileFilterToolbar`:
  - `useStateSearchEngine`, `SearchEngineTrigger`, `SearchEngineDialog` terintegrasi dengan data izin dan nama staf.
  - Drawer filter mobile untuk Status, Kategori Staf, dan Tipe Izin.
  - Tombol aksi Peluang Pengganti dan Pengaturan Kebijakan.

- [ ] **Step 1: Buat berkas leave-mobile-filter-toolbar.tsx**
  Bangun toolbar mobile dengan index items dari daftar pemohon izin untuk pencarian cepat, tombol trigger filter drawer, dan tombol aksi replacement.

- [ ] **Step 2: Ekspor leave-mobile-filter-toolbar di index.ts**
  Tambahkan ekspor pada `src/features/manajemen-perizinan/index.ts`.

- [ ] **Step 3: Verifikasi typecheck**
  Jalankan `bun run typecheck`.

---

### Task 6: Refactor Surface Card (`LeaveCard.tsx`) & Detail Sheet (`LeaveDetailSheet.tsx`)

**Files:**
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-card.tsx`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-detail-sheet.tsx`

**Interfaces:**
- `LeaveCard`:
  - Subtitle: HANYA jenis profesi staf (contoh: "Dokter Umum", "Bidan KIA", "Staf Administrasi"), tanpa pemisah titik seperti "Dokter • Dokter Umum".
  - Hilangkan badge tipe cuti ("Cuti Tahunan") dari permukaan kartu (cukup di detail sheet).
  - Format tanggal: `formatClinicDate(leave.startDate, { style: 'human_medium' })`.
- `LeaveDetailSheet`:
  - Mengikuti pola tata letak `staff-detail-edit-modal.tsx` / `doctor-schedule-detail-sheet.tsx`:
  - Header bersih dengan avatar, nama staf, subtitle profesi, dan `LeaveStatusBadge`.
  - Format waktu dan tanggal menggunakan `formatClinicDate` dan `formatClinicDateTime`.
  - Hapus pemaksaan huruf besar (`uppercase`) pada judul seksi.
  - Aksi peninjauan persetujuan Admin yang terisolasi dan jelas.

- [ ] **Step 1: Refactor leave-card.tsx**
  Perbarui `leave-card.tsx` untuk menampilkan subtitle bersih, tanggal terformat, dan konten minimalis.

- [ ] **Step 2: Refactor leave-detail-sheet.tsx**
  Perbarui `leave-detail-sheet.tsx` dengan helper `date-format.ts`, hapus force-uppercase, dan sejajarkan elemen informasi.

- [ ] **Step 3: Verifikasi typecheck**
  Jalankan `bun run typecheck`.

---

### Task 7: Penyatuan View & Eliminasi Tabs Filter (`LeaveManagementView.tsx`)

**Files:**
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/model/useLeaveManagementPresenter.ts`
- Modify: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-management-view.tsx`
- Delete: `kolaborasihealthcare/src/features/manajemen-perizinan/components/leave-management-toolbar.tsx` (digantikan oleh `LeaveManagementFilters` & action buttons terpadu)

**Interfaces:**
- Hapus `TabsList` bawah ("Semua Izin", "Dokter & Bidan", "Staf Operasional", "Peluang Pengganti").
- Desktop toolbar: `LeaveManagementFilters` di kiri, tombol aksi `Peluang Pengganti` dan `LeaveSettingsButton` di kanan.
- Mobile dock: `LeaveMobileFilterToolbar`.
- Tampilan langsung merender grid kartu perizinan staf (`filteredLeaves`).
- Modal `ReplacementOpportunitiesModal` terhubung ke tombol aksi `Peluang Pengganti`.

- [x] **Step 1: Perbarui useLeaveManagementPresenter.ts**
  Integrasikan `useLeaveFilters`, kelola modal peluang pengganti (`isReplacementOpportunitiesOpen`), hapus modal kalkulasi payroll.

- [x] **Step 2: Perbarui leave-management-view.tsx**
  Hapus komponen Tabs bawah, pasang `LeaveManagementFilters` dan action buttons, integrasikan mobile toolbar dock, dan sambungkan `ReplacementOpportunitiesModal`.

- [x] **Step 3: Hapus toolbar lama leave-management-toolbar.tsx**
  Hapus berkas dan ekspornya di `index.ts`.

- [x] **Step 4: Jalankan verifikasi menyeluruh**
  Jalankan `bun run typecheck` dan `bun run build` pada `kolaborasihealthcare`.
