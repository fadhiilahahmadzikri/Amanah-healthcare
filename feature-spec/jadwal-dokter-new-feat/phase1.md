Oke. Jadi buatkan planning saya untuk besok ya untuk membuat fitur ini. Jadi saya punya schedule management gitu di klinik ya. Jadi pertama, itu kan secara initial ya, maksudnya secara default itu pasien yang mau nge-booking service atau layanan, itu kan bakalan di-assign ke dokter terkait ya. Misalkan saya mau service-nya itu adalah, karena di klinik itu ada dua ya, ada poli umum dan bidan. Maka kalau misalkan saya pilih yang umum atau yang bidan gitu ya, maka dia nanti bakalan milih dokter yang terkait dalam bidang itu gitu yang termasuk dengan kategori umum kayak gitu atau bidan gitu ya. Nah itu secara initial udah di-assign otomatis. Nah masalahnya ini ada semacam edge cases ya, edge cases, di mana dokter yang udah di-assign secara otomatis itu ada trouble lah atau ada something lah gitu kan. Kita nggak bisa memprediksi masa depan lah ya. Nah kadang kala admin yang sebagai operator di klinik itu harus mengupdate gitu dokternya, dokter yang di-assign secara otomatis itu. Jadi secara otomatis memang ya, secara behavior otomatisnya itu dokter tersebut harus terbebas dari collision. Nah karakter rules dari collision itu adalah, pertama dia harusnya free ya. Free dalam arti kata dia punya jadwal dan ya jam tertentu itu dia memang pasti ada. Jadi saya tarik lagi ke belakang ya. Jadi sebenarnya sistem itu udah ngepecahnya jadi 30 menit. 30 menit itu bukan datang dari mana-mana, datang dari database karena intervalnya 30 menit gitu. Nah untuk sesi shift-nya itu adalah empat sesi: dini hari, malam, pagi dan siang kayak gitu kan. Nah jadi memang kalau saya tarik lagi gitu ya, dokter tersebut tuh membuat schedule ya di ruangan apa dan di jam berapa gitu. Jadi nanti otomatis dia interval konsultasinya itu 30 menit. Misalkan 11 ke 11.30, 11.30 menjadi ke 12, kayak gitu kan. Kayak gitu seterusnya. Nah saya tarik lagi balik ke yang sebelumnya itu collision-nya. Ya udah, dia secara default tuh ya udah terbebas dari collision. Artinya memang di-assign ke dokter yang memang benar-benar membuat jadwal dan untuk jamnya itu secara default udah dipilihin oleh sistem. Ya sekali lagi ya, jamnya dan dokternya udah dipilihin otomatis gitu loh. Udah di-assign gitu loh. Nah dan mempertingbangkan ruangan ya, ruangan yang masih kosong kayak gitu. Nah kira-kira gitu. Itu behavior-nya gitu yang sekarang. Nah tapi karena berkaitan dengan penambahan fitur ngedit atau merubah dokter yang udah di-assign secara otomatis itu ke pasien. Misalkan pasien melihatnya dokter X misalkan. Ternyata dokter X itu dia ada masalah gitu atau mungkin ada hal yang mendadak gitu kan sehingga dia tidak bisa gitu. Ya udah sesimpel admin itu mengedit gitu loh. Misalkan ke dokter B misalkan. Nah itu pun mempertimbangkan juga dokter B ini ada apa enggak. Ada apa enggak jadwalnya. Kalau memang ada ya udah. Nah namun begini kasusnya. Bagaimana kalau dia tidak ada jadwalnya? Atau dia belum ada bahkan sama sekali jadwalnya. Ya sesimpel dia dibuatkan jadwalnya gitu. Maksudnya bakalan otomatis terjadwalkan secara otomatis gitu loh. Secara otomatis. Nah untuk ruangannya ya ruangannya yang nggak ada masalah. Kan yang kita pertimbangkan itu sebenarnya dokternya gitu kan. Bukan ruangannya. Ruangan kan masih sama gitu. Jadi nggak ada intervensi lagi, nggak ada pusing-pusing lagi, ya cuma sesimpel dokter tersebut yang bakalan diganti. Nah masalahnya begini apa yang terjadi ketika dokter yang awalnya itu di-assign sehingga diupdate gitu kan? Sesimpel jadwal yang sedang aktif, maksudnya jadwal yang udah dibuat oleh dia, sesimpel ditutup. Tutup itu statusnya jadi tutup gitu. Nah terus kemudian nasib dari dokter yang di-assign tadi, dokter B tadi itu bagaimana? Kalau dua kondisi ya sesimpel pasiennya aja yang dipindahkan gitu. Pasiennya aja yang dipindahkan kalau memang dia punya schedule di jam tersebut gitu. Jamnya tetap sama, tapi cuma dokternya aja yang pindah gitu loh. Kalau memang dia dokter B ini ternyata ada jam yang sama gitu ya. Tapi anehnya tuh nggak mungkin lah. Kalau memang dia ada jadwalnya itu, maksudnya secara sadar dokter B ini ada jadwalnya gitu ya. Kan nggak mungkin juga di ruangan yang sama kan gitu. Nah itu dia tadi. saya tuh pusingnya di situ gitu kan. Nah enaknya kasus yang kedua, kalau dia memang betul-betul nggak ada sama sekali jadwalnya gitu loh. Jadi bisa di-replace gitu loh ibaratnya gitu. Replace dokter yang X tadi menjadi dokter B karena memang dokter B ini belum ada schedule sama sekali. Dia tinggal kayak gantian orang aja gitu loh. Nah cuman kalau misalkan target dokternya ini ternyata ada target dokternya ini ternyata di jam yang sama tapi beda ruangan. Nah itu gimana tuh? Dalam kondisi dia memang benar-benar tidak ada pasien yang udah nge-booking dia gitu. Ya sesimpel kayak update aja ruangannya gitu kan menjadi ruangan yang sekarang gitu. Kayak gitu. Jadi memang benar-benar di-assign ke yang memang ada schedule-nya gitu loh. Nah jadi kira-kira gitu. Jadi banyak yang di-update sebenarnya. Nah jadi tolong Anda buatkan planning saya besok ya secara mendetail menggunakan markdown ya Anda jelaskan edge cases-nya itu menggunakan bahasa Inggris ya. Nanti bakalan saya kasih ke AI agent sih sebenarnya. Nah itu planning saya yang pertama. Yang kedua adalah ya fitur merubah ruangan gitu. Nah fitur merubah ruangan ini ya sekali lagi yang dirubah cuman ruangannya doang gitu. Nah dengan collision-collision itu tadi yang dicek-cek gitu. Sesimpel itu. Nah dua fitur ini itu bisa dipakai apabila memang udah ada pasiennya gitu. Udah ada dulu pasiennya baru bisa di-perform dua fitur ini gitu. Kalau memang belum ada sama sekali atau belum ada pasien yang nge-booking dia ya ngapain ada gitu.
# Schedule Management — Planning for Tomorrow

## 1. Scope

Besok fokus pada **dua fitur schedule management yang hanya tersedia ketika sudah ada booking/pasien**:

1. **Change Assigned Doctor** — mengubah dokter yang sudah otomatis di-assign kepada pasien.
2. **Change Assigned Room** — mengubah ruangan yang digunakan untuk appointment tersebut.

Keduanya **bukan fitur untuk membuat appointment baru**. Fitur hanya muncul/aktif ketika sudah terdapat pasien yang melakukan booking.

---

# 2. Existing Scheduling Model

Sebelum mengerjakan fitur, jadikan behavior yang sudah ada sebagai **source of truth**.

### Shift

Sistem memiliki empat shift:

* `DINI_HARI`
* `PAGI`
* `SIANG`
* `MALAM`

### Consultation Interval

Interval consultation berasal dari database dan bernilai **30 menit**.

Contoh:

```text
11:00 → 11:30
11:30 → 12:00
12:00 → 12:30
...
```

Jadi frontend **tidak boleh menghitung atau membuat sendiri interval tersebut**.

### Existing Auto Assignment

Ketika pasien melakukan booking:

```text
Patient
   ↓
Service
   ↓
Service Category
   ↓
Available Doctor
   ↓
Available Schedule
   ↓
30-minute consultation slot
   ↓
Room
   ↓
Appointment
```

Untuk service:

* **Poli Umum** → dokter yang termasuk kategori/poli umum.
* **Bidan** → dokter/bidan yang termasuk kategori bidan.

Sistem memilih dokter dan waktu secara otomatis berdasarkan availability dan collision rules yang sudah berlaku.

---

# 3. Feature A — Change Assigned Doctor

## Goal

Allow an admin/operator to replace the doctor that was automatically assigned to an existing patient appointment.

Example:

```text
Current:
Patient A
Doctor X
11:00–11:30
Room 1

↓

Admin changes doctor

↓

Target:
Patient A
Doctor B
11:00–11:30
Room 1
```

### Important Rule

**The consultation time does not change.**

The operation changes the doctor assignment, not the patient's booking time.

```text
TIME       : unchanged
PATIENT    : unchanged
SERVICE    : unchanged
ROOM       : normally preserved
DOCTOR     : changed
```

---

# 4. Doctor Change — Collision Rules

The target doctor must be validated against the **same consultation time**.

The system must determine whether the target doctor:

1. already has a schedule covering that time;
2. has no schedule at all;
3. has a schedule at the same time but in another room;
4. already has a patient/appointment collision.

## Edge Case 1 — Target Doctor Already Has the Same Schedule

### Scenario

```text
Patient A
Current Doctor: Doctor X
Time: 11:00–11:30
Room: Room 1

Target Doctor: Doctor B

Doctor B:
11:00–11:30
Room 2
```

If Doctor B already has a valid schedule covering `11:00–11:30`, the patient's time remains:

```text
11:00–11:30
```

The system should **reuse Doctor B's existing schedule** rather than creating another schedule.

The room becomes the room associated with the target schedule **if that schedule is the canonical schedule for Doctor B at that time**.

However, the system must first validate whether Doctor B already has another patient occupying the same consultation slot.

### Required validation

```text
Target doctor exists
        ↓
Target schedule exists
        ↓
Schedule covers appointment time
        ↓
Check patient/appointment collision
        ↓
If available → reassign
```

---

# 5. Edge Case 2 — Target Doctor Has No Schedule

### Scenario

```text
Patient A
Doctor X
11:00–11:30
Room 1

Target Doctor: Doctor B

Doctor B:
No schedule for this time
```

Doctor B must not simply become the assigned doctor while remaining outside the scheduling model.

Instead, the system should **create/activate the required schedule for Doctor B automatically**, based on the existing scheduling rules.

Conceptually:

```text
Patient Appointment
       ↓
Change Doctor → Doctor B
       ↓
Doctor B has no schedule
       ↓
Create required schedule
       ↓
11:00–11:30 becomes covered
       ↓
Assign patient to Doctor B
```

The newly created schedule must use the existing backend schedule factory/rules.

Do **not** implement a separate frontend-generated schedule.

---

# 6. Edge Case 3 — Target Doctor Has a Schedule at the Same Time but Another Room

### Scenario

```text
Doctor B
11:00–11:30
Room 2
```

Patient currently:

```text
Doctor X
11:00–11:30
Room 1
```

If Doctor B is otherwise available and has no patient collision, the system should be able to reassign the patient to Doctor B.

The important distinction is:

> **Room availability is not the primary collision rule for doctor reassignment. Doctor availability and patient occupancy must be evaluated first.**

If Doctor B's existing schedule is valid for the requested time, the system should reuse it.

The appointment therefore becomes:

```text
Doctor B
11:00–11:30
Room 2
```

unless the product rule explicitly requires preserving the original room.

---

# 7. Edge Case 4 — Target Doctor Has a Schedule but Already Has a Patient

This is a hard collision.

Example:

```text
Doctor B
11:00–11:30
Room 2

Patient C
Doctor B
11:00–11:30
```

Admin attempts:

```text
Patient A → Doctor B
```

The operation must be rejected.

```text
Doctor B
   ↓
Existing schedule
   ↓
Existing appointment
   ↓
COLLISION
   ↓
Do not reassign
```

The system must **not silently move Patient C**, overwrite the appointment, or create duplicate occupancy.

---

# 8. Edge Case 5 — Current Doctor's Existing Schedule

When changing:

```text
Doctor X → Doctor B
```

the system must determine what happens to Doctor X's schedule.

The important rule is:

> The appointment is being moved; the old doctor's schedule must not remain incorrectly represented as an active occupied schedule if it no longer has any valid purpose.

If Doctor X's schedule exists solely for the moved appointment and becomes empty after the reassignment, the backend should evaluate whether that schedule should be closed/deactivated according to the existing schedule lifecycle.

It should **not blindly delete historical scheduling data**.

The schedule status should follow the existing domain rules.

---

# 9. Edge Case 6 — Current Schedule Must Be Closed

There is a specific scenario where the existing schedule is no longer supposed to remain active.

Example:

```text
Doctor X
11:00–11:30
Patient A

Admin changes:
Doctor X → Doctor B
```

After the transfer:

```text
Doctor X
11:00–11:30
→ no longer required for this appointment
```

If the schedule was created specifically for this active appointment and the business rule requires it to be closed, then:

```text
Schedule X
ACTIVE
   ↓
CLOSED
```

But this must be done **through the backend scheduling domain**, not by directly manipulating status from the frontend.

---

# 10. Doctor Reassignment Decision Flow

```text
Admin selects "Change Doctor"
            ↓
Select target doctor
            ↓
Backend validates doctor/service compatibility
            ↓
Find target doctor's schedule
            ↓
Does schedule cover appointment time?
        /                 \
      YES                  NO
       ↓                    ↓
Check appointment      Create/activate
collision              required schedule
       ↓                    ↓
Collision?             Validate schedule
 /     \
YES     NO
 ↓       ↓
Reject   Reassign appointment
             ↓
       Keep appointment time
             ↓
       Resolve room according
       to target schedule
             ↓
       Re-evaluate old schedule
             ↓
            DONE
```

---

# 11. Feature B — Change Assigned Room

The second feature is intentionally simpler.

## Goal

Allow an admin/operator to change **only the room** assigned to an existing patient appointment.

Example:

```text
Patient A
Doctor B
11:00–11:30
Room 1

↓

Change Room → Room 3

↓

Patient A
Doctor B
11:00–11:30
Room 3
```

Doctor and consultation time remain unchanged.

```text
PATIENT    : unchanged
SERVICE    : unchanged
DOCTOR     : unchanged
TIME       : unchanged
ROOM       : changed
```

---

# 12. Room Change Collision Rules

When changing the room, the system must validate whether the target room can accommodate the appointment at that exact time.

Example:

```text
Appointment A
11:00–11:30
Room 1

Admin selects Room 2
```

Backend checks:

```text
Room 2
+
11:00–11:30
+
existing schedules/appointments
```

If there is no collision:

```text
Room 1 → Room 2
```

If there is a collision:

```text
Reject room change
```

The frontend should not determine whether a room is free.

---

# 13. Room Change — Important Constraint

Changing the room **must not trigger doctor reassignment**.

For example:

```text
Doctor B
11:00–11:30
Room 1

↓

Change Room

↓

Doctor B
11:00–11:30
Room 3
```

Doctor B remains the same.

Likewise, changing the room must not change:

* service;
* patient;
* consultation time;
* shift;
* doctor assignment.

Only the room relationship changes.

---

# 14. Shared Preconditions

Both features have the same fundamental precondition:

```text
Appointment must already exist
AND
Appointment must have a patient
```

Therefore:

### No patient

```text
Schedule
Doctor B
11:00–11:30
Room 1
No patient
```

There is no reason to expose:

* Change Doctor
* Change Room

### Existing patient

```text
Schedule
Doctor B
11:00–11:30
Room 1
Patient A
```

Then:

```text
Change Doctor ✓
Change Room  ✓
```

This keeps the features scoped to **appointment management**, not generic schedule configuration.

---

# 15. Backend as the Source of Truth

Both features should be implemented as **backend domain operations**.

Frontend should only send the intent:

```text
Change Doctor
appointmentId
targetDoctorId
```

or:

```text
Change Room
appointmentId
targetRoomId
```

The backend determines:

* whether the appointment exists;
* whether it has a patient;
* whether the doctor is compatible with the service;
* whether the target doctor is available;
* whether a schedule exists;
* whether a schedule needs to be created;
* whether an appointment collision exists;
* whether the room is available;
* whether the old schedule needs lifecycle transition;
* what the final canonical assignment should be.

**Do not reproduce these rules in Next.js/Flutter.**

---

# 16. Recommended API-Level Operations

Keep the operations explicit rather than treating them as generic CRUD.

### Change Doctor

```http
PATCH /appointments/{appointmentId}/doctor
```

Request:

```json
{
  "doctorId": "..."
}
```

Backend response should return the **final canonical appointment state**, including at minimum:

```json
{
  "appointment": {
    "id": "...",
    "doctor": {},
    "room": {},
    "schedule": {},
    "time": {}
  }
}
```

### Change Room

```http
PATCH /appointments/{appointmentId}/room
```

Request:

```json
{
  "roomId": "..."
}
```

Again, the backend returns the resulting canonical state.

---

# 17. Transaction Boundary

Doctor reassignment is potentially a **multi-entity operation**, so it should be transactional.

Conceptually:

```text
BEGIN TRANSACTION

1. Load appointment
2. Validate patient
3. Validate target doctor
4. Resolve/create target schedule
5. Validate collision
6. Resolve target room
7. Update appointment
8. Transition old schedule if required
9. Persist audit/history if applicable

COMMIT
```

If any validation fails:

```text
ROLLBACK
```

The system must not end up in a partially updated state such as:

```text
Doctor updated
but
schedule not created
```

or:

```text
appointment moved
but
old schedule incorrectly remains active
```

---

# 18. Tomorrow's Implementation Order

## Phase 1 — Understand Existing Domain

Before touching UI:

* inspect appointment model;
* inspect doctor/service relationship;
* inspect schedule model;
* inspect schedule status;
* inspect room relationship;
* inspect 30-minute interval generation;
* inspect shift generation;
* inspect existing collision detection;
* identify the existing schedule factory;
* identify existing appointment assignment logic.

**Do not create another scheduling algorithm.**

---

## Phase 2 — Define Backend Use Cases

Create explicit domain/use-case operations:

```text
ChangeAppointmentDoctor
ChangeAppointmentRoom
```

Keep their responsibilities separate.

### `ChangeAppointmentDoctor`

Responsible for:

* validating appointment;
* validating target doctor;
* resolving target schedule;
* creating schedule when required;
* collision validation;
* appointment reassignment;
* old schedule lifecycle.

### `ChangeAppointmentRoom`

Responsible for:

* validating appointment;
* validating target room;
* collision validation;
* room reassignment.

---

## Phase 3 — Write API Contract First

Document:

```text
Purpose
Endpoint
Request
Validation
Success response
Conflict response
Not-found response
Invalid-state response
```

before implementing the frontend.

---

## Phase 4 — Backend Tests

Minimum test matrix:

| Case                                           | Expected                                |
| ---------------------------------------------- | --------------------------------------- |
| No patient                                     | Reject                                  |
| Change to valid doctor                         | Success                                 |
| Wrong doctor category                          | Reject                                  |
| Target doctor has matching schedule            | Reuse                                   |
| Target doctor has no schedule                  | Create/activate required schedule       |
| Target doctor has another patient at same time | Reject                                  |
| Target doctor schedule is another room         | Resolve according to canonical schedule |
| Old schedule becomes unused                    | Apply lifecycle rule                    |
| Change to available room                       | Success                                 |
| Target room occupied                           | Reject                                  |
| Room change changes doctor                     | Must never happen                       |
| Room change changes time                       | Must never happen                       |

---

# 19. Frontend Implementation

Only after backend behavior is stable.

### Appointment Detail

When appointment has a patient:

```text
Doctor
[ Doctor B ]     [Change]

Room
[ Room 1 ]       [Change]
```

When there is no patient:

```text
Doctor
Doctor B

Room
Room 1
```

No change actions.

### Change Doctor Modal

The UI should show only doctors that are valid candidates according to backend-provided data.

Do not calculate eligibility in the frontend.

### Change Room Modal

Same principle:

```text
Available rooms
```

should come from backend state.

The frontend should not calculate:

```text
roomBusy = ...
```

itself.

---

# 20. Definition of Done

The feature is considered complete when:

### Doctor reassignment

* [ ] Admin can change the assigned doctor of an existing patient appointment.
* [ ] Consultation time remains unchanged.
* [ ] Service remains unchanged.
* [ ] Doctor/service compatibility is validated.
* [ ] Existing target schedule is reused when appropriate.
* [ ] Missing target schedule can be created through the existing scheduling domain.
* [ ] Doctor collision is rejected.
* [ ] Room resolution follows the canonical schedule.
* [ ] Old schedule lifecycle is handled correctly.
* [ ] Operation is transactional.
* [ ] Backend is the source of truth.

### Room reassignment

* [ ] Admin can change the room of an existing patient appointment.
* [ ] Doctor remains unchanged.
* [ ] Consultation time remains unchanged.
* [ ] Service remains unchanged.
* [ ] Room collision is validated by backend.
* [ ] Occupied room cannot be assigned.
* [ ] Operation is transactional.

### Shared

* [ ] Both features require an existing patient/appointment.
* [ ] No frontend schedule calculation.
* [ ] No duplicated collision logic.
* [ ] No hardcoded shift/interval values.
* [ ] Existing schedule factory is reused.
* [ ] Existing schedule status lifecycle is reused.
* [ ] Existing DB values remain the canonical source.