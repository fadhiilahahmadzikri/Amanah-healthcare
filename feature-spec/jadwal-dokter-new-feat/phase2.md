Oh iya, sama plan saya yang ketiga itu begini. Jadi setiap hal yang memang merubah state itu harusnya di-announce di toaster. Jadi toaster itu punya satu aksi namanya. Contoh kayak misalkan saya lagi menambah jadwal gitu, contoh ya. Ini contoh aja. Atau mengedit atau mendelete gitu. Nah kebetulan tuh ada drawer daripada sheet ya. Nah kondisinya sekarang itu drawer itu ada kalanya atau sheet itu ada kalanya tertutup gitu. Padahal saya lagi mau menambahkan sesuatu gitu kan. Jadi saya bingung langsung. Fokusnya langsung berubah, otak saya langsung berubah. Akan lebih mudah kalau ada toaster, kemudian ada aksi, lihat perubahan atau apa lah, lihat jadwal yang baru saja ditambahkan gitu kan. Atau lihat baru saja yang diedit gitu. Nah ketika di-click, itu langsung direct ke hal yang memang benar-benar terjadi gitu mutasinya gitu. Itu akan lebih mudah gitu. Jadi saya tahu, oh ini yang terjadi. Oke udah berubah nih, mantap, kayak gitu kan. Tanpa saya nge-perform dari awal lagi gitu. Jadi sistem udah otomatis ngarahin dia ke hal yang memang berubah gitu.
Iya, ini justru memperjelas bahwa **dua fitur tersebut bukan membuat UI baru dari nol**. Keduanya menjadi dua **menu entry baru pada popup/action menu yang sudah ada**, lalu menggunakan **modal/wizard signature yang sudah menjadi standar aplikasi**.

Saya akan revisi planning sebelumnya menjadi seperti ini.

# 4. Appointment Assignment Actions — Doctor & Room

## Objective

Extend the existing appointment popup/action menu with two new actions:

```text
Appointment Actions
├── Existing actions...
├── Change Doctor
└── Change Room
```

Kedua action membuka **existing modal/wizard pattern**.

Tidak membuat modal baru dengan behavior atau layout yang berbeda.

---

## 4.1 Change Doctor

### Entry Point

```text
Appointment Popup
        ↓
Change Doctor
        ↓
Existing Modal / Wizard
```

Wizard digunakan untuk memilih dokter pengganti.

---

## 4.2 Doctor List Must Be Backend-Driven

Frontend **tidak menentukan dokter mana yang valid**.

Frontend hanya menerima:

```text
availableDoctors[]
```

dan melakukan rendering.

```text
Backend
   ↓
Resolve eligible doctors
   ↓
API response
   ↓
Frontend renders doctors
```

Tidak boleh ada:

```ts
if (doctor.specialization === 'general') ...
```

atau:

```ts
const doctors = generalDoctors.filter(...)
```

di frontend.

---

# 4.3 Doctor Category Is Not a Hard Boundary

Ini penting.

Jangan membuat rule:

```text
General service → only general doctors
Midwife service → only midwives
```

karena dalam sistem Anda **specialization/category bukan hard capability boundary**.

Seorang dokter/bidan dapat menangani service di luar kategori/spesialisasi utamanya apabila memang scheduling domain mengizinkannya.

Jadi UI juga **tidak perlu membuat dua kategori hardcoded**:

```text
Poli Umum
Bidan
```

Sebaliknya, jika backend memang menyediakan grouping/category metadata, UI cukup merender grouping tersebut secara dinamis.

```text
Backend
   ↓
Doctor groups/categories
   ↓
Frontend
   ↓
Render tabs/groups dynamically
```

Jika terdapat 2 kategori → render 2 tab.

Jika nanti terdapat 3 atau 5 kategori → frontend tidak perlu diubah.

---

# 4.4 What Doctors Should Be Shown?

Filter kandidat dilakukan **di backend**.

Frontend menerima dokter yang memang sudah dianggap eligible.

Untuk appointment:

```text
Patient
Service
Date
Time
Current Doctor
Room
```

backend menentukan dokter kandidat berdasarkan scheduling state.

Candidate doctor harus memenuhi kondisi yang relevan:

### Condition A — Not already occupied

Doctor tidak boleh sudah memiliki pasien pada consultation slot yang sama.

```text
Doctor B
11:00–11:30
Existing Patient
        ↓
Not eligible
```

### Condition B — Existing schedule with no patient

```text
Doctor B
11:00–11:30
Schedule exists
No patient
        ↓
Eligible
```

### Condition C — No schedule at the requested time

```text
Doctor B
11:00–11:30
No schedule
        ↓
Eligible
```

Dengan catatan, ketika dipilih, backend akan menggunakan **schedule resolver/factory** yang sudah dibahas sebelumnya untuk memastikan Doctor B mempunyai schedule yang valid.

### Condition D — Current doctor

Current doctor sebaiknya tidak ditampilkan sebagai candidate perubahan.

```text
Current Doctor X
        ↓
Exclude
```

Karena tidak ada perubahan jika user memilih dokter yang sama.

---

# 4.5 Doctor Candidate Query

Secara konseptual backend harus menjawab:

> "For this appointment's date and consultation time, which doctors can accept this patient without creating a scheduling collision?"

Bukan:

> "Which doctors belong to the same category as this service?"

Ini perbedaan yang sangat penting.

```text
❌ Service Category
      ↓
   Filter Doctor Category

✅ Appointment Context
      ↓
   Scheduling Availability
      ↓
   Collision Check
      ↓
   Eligible Doctors
```

---

# 4.6 Recommended Response

Backend dapat mengembalikan data yang sudah siap dirender:

```json
{
  "groups": [
    {
      "id": "category-a",
      "name": "...",
      "doctors": [
        {
          "id": "...",
          "name": "...",
          "availability": "AVAILABLE"
        }
      ]
    }
  ]
}
```

Tetapi jangan memaksakan struktur `groups` kalau existing API architecture sudah mempunyai DTO/shape yang lebih sesuai.

Yang penting:

> **Backend mengirim candidate set. Frontend hanya render.**

---

# 4.7 Wizard Behavior

Wizard tidak perlu menjadi wizard yang kompleks.

Conceptually:

```text
Change Doctor

[ Category A ] [ Category B ] [ ... ]

Doctor A
Doctor B
Doctor C
Doctor D

                         [Cancel] [Assign]
```

Category/tab dibuat dinamis dari response.

Bottom action:

```text
Assign
```

akan mengirim:

```http
PATCH /appointments/:appointmentId/doctor
```

dengan target doctor.

---

# 4.8 Assign Flow

```text
Select Doctor
      ↓
Assign
      ↓
Backend
      ↓
Validate candidate again
      ↓
Resolve/create schedule
      ↓
Validate collision
      ↓
Update appointment
      ↓
Resolve room
      ↓
Update old schedule lifecycle
      ↓
COMMIT
      ↓
Return canonical appointment
      ↓
Close modal
      ↓
Show toast
      ↓
[View appointment]
```

**Backend tetap melakukan final validation.**

Walaupun dokter sudah difilter ketika modal dibuka, kondisi dapat berubah sebelum user menekan `Assign`.

Contoh:

```text
10:00
Doctor B appears available

10:02
Another appointment takes Doctor B

10:03
Admin clicks Assign
```

Backend harus tetap melakukan collision check.

Frontend candidate list **bukan security/business-rule boundary**.

---

# 5. Change Room

Entry point:

```text
Appointment Popup
        ↓
Change Room
        ↓
Existing Modal / Wizard
```

Tidak perlu membuat modal khusus.

---

## 5.1 Room Candidate Rules

Backend menyediakan:

```text
availableRooms[]
```

Frontend hanya render.

Room harus tersedia untuk appointment tersebut:

```text
same date
same consultation time
same relevant schedule context
no conflicting patient
```

Jika:

```text
Room 1
11:00–11:30
Patient A
```

maka Room 1 tidak boleh ditawarkan sebagai target untuk appointment lain pada slot yang sama.

---

# 5.2 Room UI

Conceptually:

```text
Change Room

Room 1
Room 2
Room 3
Room 4

                    [Cancel] [Assign]
```

Tidak perlu frontend melakukan:

```ts
rooms.filter(...)
```

berdasarkan appointment collision.

Backend sudah mengembalikan candidate list.

---

# 5.3 Room Assignment

```text
Select Room
      ↓
Assign
      ↓
PATCH /appointments/:appointmentId/room
      ↓
Backend validates again
      ↓
Collision check
      ↓
Update room
      ↓
COMMIT
      ↓
Canonical response
      ↓
Toast
      ↓
[View appointment]
```

---

# 6. Important Distinction: Candidate Filtering vs Assignment Rules

Ini harus ditulis jelas untuk agent.

### Candidate filtering

Digunakan untuk menentukan **apa yang ditampilkan di modal**.

```text
Who can currently be selected?
```

### Assignment rules

Digunakan ketika **mutasi benar-benar dilakukan**.

```text
Can this assignment actually be committed?
```

Keduanya harus berasal dari domain/backend yang sama.

Jangan membuat:

```text
Candidate Filter A
```

yang berbeda dengan:

```text
Assignment Rule B
```

Karena nanti bisa terjadi:

```text
UI says available
        ↓
Assign
        ↓
Backend says invalid
```

kecuali memang terjadi race condition antara fetching candidate dan mutation. Untuk race condition, backend tetap wajib menjadi final authority.

---

# 7. Dynamic Category Tabs

Untuk dokter, saya setuju dengan paradigma Anda:

**Jangan hardcode dua poli.**

Jangan:

```ts
const tabs = ['POLI_UMUM', 'BIDAN'];
```

Lebih baik:

```text
Backend
   ↓
available doctor groups
   ↓
UI dynamically renders tabs
```

Misalnya hari ini:

```text
Umum
Bidan
```

Besok database mempunyai:

```text
Umum
Bidan
Gigi
KIA
```

UI otomatis:

```text
[Umum] [Bidan] [Gigi] [KIA]
```

Tanpa perubahan source code frontend.

Namun sekali lagi, **grouping ini hanya presentation/filtering**, bukan business rule utama.

Eligibility tetap berasal dari scheduling domain.

---

# 8. No Hardcoded Specialization Boundary

Agent harus memahami ini secara eksplisit:

> Doctor specialization/category is descriptive metadata, not an absolute assignment boundary.

Jangan membuat:

```text
general service → general doctor only
midwife service → midwife only
```

kecuali backend/domain secara eksplisit menyatakan demikian.

Dalam current scheduling model:

```text
Doctor A
specialization = General
```

tetap mungkin menjadi candidate untuk service tertentu yang secara nominal berada di kategori lain.

Sebaliknya:

```text
Doctor B
specialization = Midwife
```

juga dapat menangani service umum jika scheduling domain menganggapnya valid.

---

# 9. Combined Candidate Architecture

Akhirnya architecture-nya menjadi:

```text
                   Appointment
                        │
                        ▼
              Candidate Resolver
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
    Doctor Candidates          Room Candidates
          │                           │
          ▼                           ▼
     Backend DTO                  Backend DTO
          │                           │
          ▼                           ▼
    Existing Wizard              Existing Wizard
          │                           │
          ▼                           ▼
       Assign                       Assign
          │                           │
          └─────────────┬─────────────┘
                        ▼
                 Backend Use Case
                        │
                        ▼
                Collision Validation
                        │
                        ▼
                  Database SSOT
                        │
                       COMMIT
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
            Toast              WebSocket
              │                   │
              ▼                   ▼
        View Mutation        Client Sync
```

## Final UX

Jadi pengalaman admin nantinya sangat sederhana:

```text
Appointment
   ↓
[Actions]
   ├── Change Doctor
   │      ↓
   │   Existing Wizard
   │      ↓
   │   Dynamic doctor groups
   │      ↓
   │   Select doctor
   │      ↓
   │   Assign
   │
   └── Change Room
          ↓
       Existing Wizard
          ↓
       Available rooms
          ↓
       Select room
          ↓
       Assign
```

Kemudian setelah berhasil:

```text
┌─────────────────────────────────────┐
│ ✓ Doctor assignment updated         │
│                                     │
│                    [View appointment]│
└─────────────────────────────────────┘
```

atau:

```text
┌─────────────────────────────────────┐
│ ✓ Room assignment updated           │
│                                     │
│                    [View appointment]│
└─────────────────────────────────────┘
```

Dengan begitu **UI tetap tipis**, wizard tetap menggunakan design pattern yang sudah ada, filtering kandidat menjadi tanggung jawab backend, scheduling/collision menjadi domain SSOT, dan setelah mutation user langsung bisa kembali ke resource yang baru saja berubah.