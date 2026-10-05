Nah, paradigma seperti ini perlu LLM fami, supaya dia membangun abstraction layer, sehingga ada single source of truth di backend gitu. Dan endpoint-nya pun juga ada dibuat gitu loh. Jadi dia berbasiskan modul kayak gitu. Sebenarnya sih basis kode saya udah ada, cuman ya itu tadilah ya, perlu apa ya, kayak penambahan atau apa lah, mungkin diperbaiki, eh sorry. Karena ini endpoint baru ya, jadi kiranya dia ada file baru lagi dan paradigma baru lagi gitu kan. Sehingga dia reusable gitu. Dia berbasis komponen gitu kan. Komponen backend ya, maksudnya dia sebagai utilitas juga ada, ada helper-nya juga ada. Pokoknya saya pakai NestJS sih sebenarnya. Jadi kira-kira begitu. Pokoknya tuh nggak boleh hardcoding, single source of truth. Nanti baru kemudian di backend bagaimana. Sebenarnya saya tuh punya ini sih, saya itu punya notification juga. Jadi nanti kalau kiranya berubah, otomatis nanti di client pasien juga otomatis berubah gitu loh. Ada notifikasi real-time-nya juga sih sekarang. Saya pakai Redis pub/sub kalau nggak salah sebagai real-time mechanism websocket-nya kayak gitu. Jadi kira-kira tambahkanlah bobot itu.Betul. Dengan kondisi codebase Anda yang sudah punya domain scheduling, appointment, dan Redis Pub/Sub/WebSocket, planning-nya sebaiknya **bukan sekadar “buat dua endpoint”**. Yang dibangun adalah **backend capability/module untuk appointment reassignment**, dengan domain rules yang reusable dan satu sumber kebenaran.
# AI Agent Hardening Rules

## 1. Scope Discipline

This task is limited to the features currently being implemented:

* Change assigned doctor for an existing patient appointment.
* Change assigned room for an existing patient appointment.
* Existing appointment action popup/menu integration.
* Existing modal/wizard integration.
* Backend-driven candidate resolution.
* Scheduling and collision handling required by these mutations.
* Mutation feedback through toast with contextual navigation.
* Existing Redis Pub/Sub and WebSocket synchronization related to the resulting state change.

Do not use this task as an excuse to redesign unrelated legacy modules, rewrite unrelated code, or perform broad repository cleanup.

If an existing legacy area is not directly required for the current feature, leave it untouched.

---

# 2. Immediate Understanding, Then Action

You must understand the relevant implementation before editing, but understanding must remain proportional to the task.

Do not spend an excessive amount of time reading unrelated files, exploring the entire repository, or constructing a hypothetical architecture before making the first relevant change.

The required execution pattern is:

```text
Understand relevant context
        ↓
Identify canonical implementation
        ↓
Identify exact change boundary
        ↓
Implement the smallest correct change
        ↓
Run essential validation
        ↓
Inspect result
        ↓
Continue/refine if necessary
```

If the problem is already sufficiently understood, act.

Do not continue researching merely because more information could theoretically be discovered.

Reading more code is not progress when the relevant problem is already understood and no implementation is being changed.

Do not optimize for the appearance of thoroughness.

Optimize for a correct working implementation.

---

# 3. No Hallucinated Architecture

Never assume that a required abstraction does not exist.

Before creating a new abstraction, search the relevant module for an existing equivalent.

For example, before creating:

```text
ScheduleResolver
CollisionService
RoomAvailabilityService
AssignmentService
```

determine whether an equivalent capability already exists.

If it exists:

```text
Reuse
Extend
Refactor minimally if necessary
```

Do not create a parallel implementation merely because the existing implementation has a different name.

The objective is to establish a canonical implementation, not to multiply abstractions.

---

# 4. Single Source of Truth

The backend and database are the canonical source of scheduling state.

The following must remain backend-driven and, where applicable, DB-driven:

* doctors;
* doctor availability;
* doctor specialization/category metadata;
* services;
* service metadata;
* rooms;
* room availability;
* schedules;
* shifts;
* consultation intervals;
* appointment occupancy;
* schedule status;
* collision rules;
* appointment assignment;
* schedule lifecycle.

Frontend code must not recreate backend scheduling rules.

The frontend renders the state provided by the backend.

Conceptually:

```text
Database
   ↓
Backend Domain
   ↓
API
   ↓
Frontend
```

Not:

```text
Database
   ↓
Backend
   ↓
Frontend
   ↓
Frontend invents missing rules
```

If backend data is wrong, the frontend must not compensate with artificial logic.

Fix the backend source of truth.

---

# 5. No Hardcoding

Do not hardcode dynamic domain data.

Examples of forbidden behavior:

```ts
const doctors = [...]
```

```ts
const rooms = [...]
```

```ts
const shifts = ['pagi', 'siang', 'malam']
```

```ts
const interval = 30
```

```ts
const doctorId = 'doctor-123'
```

```ts
const roomId = 'room-001'
```

Do not hardcode IDs, doctor names, room names, service categories, shifts, schedules, availability, or other database-owned values.

If the data can change tomorrow, it is dynamic.

If the implementation assumes the data will remain permanently fixed, verify that assumption against the actual domain before encoding it.

---

# 6. Dynamic vs Static

Understand the distinction explicitly.

Dynamic means the value may change according to database state, configuration, operational data, future expansion, or user administration.

Examples:

```text
Doctors
Rooms
Services
Categories
Schedules
Shifts
Availability
Appointments
```

Static means the value is genuinely structural and is not expected to vary as operational data.

Do not call something "dynamic" merely because it is rendered by a loop.

A hardcoded array rendered with `.map()` is still hardcoded.

For example:

```ts
const categories = ['General', 'Midwife'];
```

is not dynamic.

The data must originate from the appropriate backend/domain source.

---

# 7. Doctor Assignment Rules

Do not hardcode service-category boundaries into the frontend.

Doctor specialization/category is not automatically an absolute assignment boundary.

The candidate list must be determined by the backend scheduling domain.

For the current appointment context, the backend should determine which doctors are valid candidates based on actual scheduling state.

At minimum, the candidate resolution must account for:

```text
Current appointment
Current date
Current consultation time
Current doctor
Doctor availability
Existing schedule
Existing patient/appointment occupancy
Relevant scheduling constraints
```

The frontend receives the eligible candidates and renders them.

The frontend does not independently filter doctors according to invented rules.

---

# 8. Doctor Candidate Resolution

The Change Doctor wizard must display backend-provided candidates.

A doctor may be eligible when:

```text
The doctor has a valid schedule for the requested time
AND
the relevant slot has no conflicting patient
```

or:

```text
The doctor does not currently have a schedule covering that time
AND
the backend scheduling domain can validly create/activate the required schedule
```

The current doctor should not be presented as a meaningful replacement candidate.

The final assignment must always be validated again by the backend.

Candidate availability is only a UI representation of current state.

It is not the final authority.

---

# 9. Room Candidate Resolution

The Change Room wizard must receive its candidate rooms from the backend.

The frontend must not determine room availability by querying unrelated data and reconstructing collision rules.

The backend determines:

```text
Which rooms are available for this appointment
```

The frontend renders:

```text
availableRooms[]
```

and submits the selected room.

The backend performs the final collision validation again before committing the mutation.

---

# 10. Existing Modal/Wizard Must Be Reused

Do not create a new visual pattern for Change Doctor or Change Room.

The application already has an established modal/wizard signature.

Reuse it.

The implementation should add the two new action entries to the existing appointment popup/action menu:

```text
Change Doctor
Change Room
```

Then open the existing modal/wizard pattern.

Do not duplicate:

* modal shell;
* wizard state model;
* stepper;
* button layout;
* validation presentation;
* loading behavior;
* existing design-system components.

Reuse the existing component abstraction.

---

# 11. Backend Is the Assignment Authority

The client expresses intent:

```text
Change Doctor → doctorId
Change Room → roomId
```

The backend decides whether the mutation is valid.

The backend owns:

```text
Validation
Availability
Collision detection
Schedule resolution
Schedule creation/activation
Assignment
Lifecycle transitions
Persistence
```

Do not move these responsibilities into the frontend merely to make the UI appear functional.

A UI that displays the expected result while the database remains unchanged is considered a failed implementation.

---

# 12. No Artificial Success

Never create fake data, dummy responses, mock IDs, temporary in-memory state, or frontend-only mutations to make the feature appear complete.

Forbidden:

```text
User clicks Assign
        ↓
Frontend manually changes displayed doctor
        ↓
No backend mutation
```

Also forbidden:

```text
API unavailable
        ↓
Frontend fabricates successful response
```

The success state must correspond to a real persisted backend state.

The minimum definition of a successful mutation is:

```text
Database state changed correctly
        ↓
Backend returns canonical result
        ↓
Client reflects canonical result
```

---

# 13. No Fake Backend

Do not implement an endpoint that merely returns artificially constructed data without performing the intended domain operation.

An endpoint is not complete because it returns:

```json
{
  "success": true
}
```

The implementation must actually perform the required mutation.

The result must be traceable to real persistence.

If a feature cannot yet be persisted correctly, report the blocking dependency instead of simulating success.

---

# 14. Reuse Before Abstraction

When implementing the feature:

```text
Existing correct abstraction
        ↓
Reuse it
```

If the existing abstraction is incomplete:

```text
Existing abstraction
        ↓
Extend/refactor it
```

Only create a new abstraction when there is a real responsibility that does not already have a canonical home.

Do not create abstractions merely because they sound architecturally sophisticated.

---

# 15. Do Not Repeat Yourself

Do not duplicate the same scheduling logic in:

```text
Initial booking
Change Doctor
Change Room
Schedule management
Frontend
Backend
WebSocket handler
```

If collision logic already exists, reuse it.

If schedule resolution already exists, reuse it.

If room availability logic already exists, reuse it.

If appointment assignment logic already exists, reuse or extract it appropriately.

The goal is:

```text
One rule
One canonical implementation
Many consumers
```

Not:

```text
Same rule
Five slightly different implementations
```

---

# 16. Avoid Redundant Conditions

Do not write defensive branches merely because multiple possibilities can theoretically exist.

If the domain guarantees one canonical representation, use that representation.

Avoid patterns such as:

```ts
if (A || B || C || D) {
   ...
}
```

when investigation shows that A and B are actually aliases of the same domain state.

Avoid:

```text
Option A
Option B
Fallback A
Fallback B
Legacy A
Legacy B
```

when multiple branches resolve to the same outcome.

Redundancy increases ambiguity and makes the implementation harder to reason about.

Before adding a fallback, determine why the primary path can actually fail.

---

# 17. Fallbacks Must Have a Proven Reason

Do not add fallbacks simply to prevent an error from appearing.

Every fallback must answer:

```text
What legitimate domain state causes this fallback?
Why is the fallback correct?
Why does the canonical path not cover it?
```

If these questions cannot be answered from the existing architecture, do not add the fallback.

Never use a fallback to conceal a missing backend implementation.

---

# 18. Naming Discipline

Names must describe responsibility, not implementation philosophy.

Do not add names such as:

```text
SSOTScheduleService
SSOTDoctorResolver
DynamicScheduleHelper
FallbackScheduleResolver
UniversalScheduleUtil
```

merely to communicate that the implementation follows SSOT or dynamic principles.

SSOT is an architectural property.

It is not a domain name.

Prefer representative names:

```text
ScheduleResolver
ScheduleFactory
CollisionValidator
DoctorAssignmentService
RoomAvailabilityService
AppointmentAssignmentService
```

The code should manifest the architectural principle without naming every implementation after the principle.

---

# 19. Helpers Must Represent Real Responsibilities

Do not create generic utility files containing unrelated logic:

```text
utils.ts
helpers.ts
common.ts
misc.ts
```

with scheduling behavior dumped into them.

A reusable component should have a coherent responsibility.

For example:

```text
ScheduleResolver
```

should resolve schedules.

```text
CollisionValidator
```

should validate scheduling conflicts.

```text
RoomAvailabilityService
```

should determine room availability.

Do not create a "utility" merely to move code into another file.

---

# 20. Module-Oriented Complexity

Complexity should be divided according to responsibility.

Conceptually:

```text
Appointment Assignment
├── Doctor Resolution
├── Schedule Resolution
├── Collision Validation
├── Room Resolution
├── Persistence
└── Event Publication
```

A module should consume another module's capability instead of copying its implementation.

For example:

```text
Appointment Assignment
        ↓
Schedule Resolver
```

not:

```text
Appointment Assignment
        ↓
copies schedule generation logic
```

---

# 21. 500 LOC Hard Limit

No new implementation file should reach 500 lines of code.

If a relevant file is already above 500 LOC and the current feature requires modifying that file, refactor the relevant responsibility into smaller modules before continuing.

Do not create a 700-line service because the existing file was already large.

Do not simply move 500 lines into another file without improving responsibility boundaries.

The goal is:

```text
Small cohesive modules
        ↓
Composable capabilities
        ↓
Clear dependencies
```

not arbitrary fragmentation.

---

# 22. Comments

Do not add explanatory comments to compensate for unclear architecture.

Prefer clear:

```text
names
types
interfaces
module boundaries
functions
```

over long comments explaining what the code is doing.

Do not add comments such as:

```text
// This is the SSOT implementation
```

or:

```text
// This dynamically gets doctors from backend
```

when the code already makes this obvious.

No unnecessary comments.

---

# 23. Testing Discipline

Testing must validate the implementation that was actually changed.

Do not run or create tests merely to create the appearance of activity.

The correct sequence is:

```text
Inspect
        ↓
Edit
        ↓
Run targeted tests for the edit
        ↓
Inspect result
        ↓
Fix
        ↓
Run again
```

Do not spend the entire task running tests before implementing the required feature.

---

# 24. Do Not Trust Previous Tests Blindly

Existing tests may describe an older implementation.

Do not assume that previous tests remain sufficient after architectural or behavioral changes.

When the mechanism changes:

```text
Previous behavior
        ↓
Changed behavior
        ↓
Previous tests may be incomplete
```

Review whether the existing tests still represent the current contract.

Do not preserve obsolete behavior merely because an old test expects it.

The current domain contract takes precedence.

---

# 25. Essential Tests Only

Do not create an enormous test suite for hypothetical scenarios before the mechanism exists.

After implementing the feature, create focused tests for the actual new behavior.

### Backend — Change Doctor

Essential cases:

```text
Existing patient appointment
        ↓
Valid target doctor
        ↓
Assignment succeeds
```

```text
Target doctor already has conflicting patient
        ↓
Assignment rejected
```

```text
Target doctor has no schedule
        ↓
Required schedule is resolved/created
        ↓
Assignment succeeds
```

```text
Invalid target doctor
        ↓
Assignment rejected
```

```text
Failed mutation
        ↓
No partial database state
```

### Backend — Change Room

```text
Available room
        ↓
Assignment succeeds
```

```text
Room occupied at same relevant slot
        ↓
Assignment rejected
```

```text
Failed mutation
        ↓
No partial database state
```

### Event behavior

```text
Successful mutation
        ↓
Real-time event emitted
```

```text
Failed mutation
        ↓
No success event emitted
```

---

# 26. Frontend Essential Tests

Test the behavior introduced by the current feature.

### Change Doctor

```text
Appointment action menu
        ↓
Change Doctor exists
```

```text
Change Doctor
        ↓
Existing wizard opens
```

```text
Wizard
        ↓
Renders backend-provided doctor candidates
```

```text
Select doctor
        ↓
Assign
        ↓
Mutation invoked with selected doctor
```

```text
Mutation success
        ↓
Toast displayed
        ↓
Contextual action available
```

### Change Room

```text
Appointment action menu
        ↓
Change Room exists
```

```text
Change Room
        ↓
Existing wizard opens
```

```text
Wizard
        ↓
Renders backend-provided available rooms
```

```text
Assign
        ↓
Mutation invoked with selected room
```

Do not test artificial hardcoded candidates.

The test should verify that the UI consumes backend-provided data.

---

# 27. Mutation Toast Tests

For a successful mutation:

```text
Mutation succeeds
        ↓
Toast appears
        ↓
Toast contains contextual action
        ↓
Action targets the mutated resource
```

For deletion:

```text
Deletion succeeds
        ↓
Toast appears
        ↓
Action navigates to valid parent/list context
```

Do not navigate to a deleted resource.

---

# 28. Real-Time Tests

The initiating client should not display duplicate feedback merely because it also receives the WebSocket event.

Expected:

```text
HTTP mutation success
        ↓
One mutation toast
```

WebSocket:

```text
State synchronization
```

not:

```text
Another identical success toast
```

Other connected clients should receive the state update through the existing Redis Pub/Sub → WebSocket mechanism.

---

# 29. Test the Actual Mechanism, Not a Mocked Fantasy

A test that only verifies:

```text
mock API returns success
        ↓
UI displays success
```

is insufficient if the actual feature depends on:

```text
database mutation
schedule resolution
collision detection
event publication
```

Test the important domain boundaries at the appropriate layer.

Do not fake the entire backend behavior and then claim that the feature is integrated.

Unit tests and integration tests have different purposes.

Use the smallest test level that proves the changed behavior correctly.

---

# 30. Verification Principle

The strongest evidence is:

```text
Input
   ↓
Real application path
   ↓
Real mutation
   ↓
Database state
   ↓
Canonical response
   ↓
Client state
   ↓
Notification/event
```

A visual result alone is not proof.

If the UI says:

```text
Doctor B
```

but the database still contains:

```text
Doctor A
```

the feature is broken.

If the toast says:

```text
Schedule created
```

but no schedule exists in the database, the feature is broken.

If WebSocket says:

```text
updated
```

but the persisted state is unchanged, the feature is broken.

---

# 31. Definition of Done

The implementation is complete only when all of the following are true:

* Backend owns scheduling and collision rules.
* Database remains the source of persistent truth.
* Frontend does not hardcode dynamic data.
* Doctor candidates come from backend resolution.
* Room candidates come from backend resolution.
* Existing modal/wizard is reused.
* Existing appointment popup receives the two new actions.
* Doctor reassignment is persisted.
* Room reassignment is persisted.
* Schedule resolution is reusable.
* Collision validation is reusable.
* Existing Redis Pub/Sub mechanism is reused.
* WebSocket state synchronization works after successful mutation.
* Mutation toast is shown after successful persistence.
* Toast provides contextual navigation.
* No fake data exists.
* No dummy IDs exist.
* No frontend-only successful mutation exists.
* No unnecessary fallback exists.
* No duplicated domain logic exists.
* No new file exceeds 500 LOC.
* Tests are written specifically for the implementation that was changed.
* Existing tests are not blindly trusted when their assumptions no longer match the current behavior.
* Essential backend and frontend tests pass.
* The actual database state confirms the mutation.
* The implementation does not modify unrelated legacy behavior.

---

# 32. Final Agent Mental Model

Follow this mental model throughout the implementation:

```text
Do I already have this capability?
        │
        ├── YES → reuse it
        │
        └── NO
             ↓
        Where does this responsibility belong?
             ↓
        Create the smallest cohesive abstraction
             ↓
        Make it reusable
```

And:

```text
Is this data dynamic?
        ↓
Backend / DB

Is this a domain rule?
        ↓
Backend

Is this presentation?
        ↓
Frontend

Is this state-changing?
        ↓
Persist it first

Did state actually change?
        ↓
Return canonical result

Did the mutation succeed?
        ↓
Toast + contextual action

Do other clients need the change?
        ↓
Existing real-time event mechanism
```

Most importantly:

> **Do not optimize for making the interface appear correct. Optimize for making the underlying system actually correct.**

A feature is not complete because the user sees the expected result. It is complete when the **domain state, database state, API response, client state, and real-time state are consistent with one another.**

Berikut versi planning yang sudah saya naikkan levelnya untuk diberikan ke LLM coding agent.

# Schedule Management — Backend Architecture & Feature Plan

## 1. Architectural Objective

Implement two new appointment-management capabilities:

1. **Change Assigned Doctor**
2. **Change Assigned Room**

Keduanya harus dibangun sebagai **reusable backend capabilities**, bukan sebagai logic yang ditanam langsung di controller atau endpoint.

Core principle:

> **The backend is the single source of truth for scheduling, availability, collision detection, assignment, and state transitions.**

Frontend/mobile/web clients only express an **intent** and consume the resulting canonical state.

```text
Client
   │
   │ Change Doctor / Change Room
   ▼
Controller
   │
   ▼
Application Use Case
   │
   ├── Assignment Rules
   ├── Schedule Resolver
   ├── Collision Validator
   ├── Room Resolver
   └── Schedule Lifecycle
   │
   ▼
Persistence
   │
   ▼
Canonical Appointment State
   │
   ▼
Domain Event / Notification
   │
   ▼
Redis Pub/Sub
   │
   ▼
WebSocket
   │
   ├── Patient Client
   ├── Admin Dashboard
   └── Other Relevant Clients
```

---

# 2. Do Not Implement This as Endpoint-Specific Logic

Avoid this architecture:

```text
change-doctor.controller.ts
    ↓
find schedule
    ↓
check collision
    ↓
create schedule
    ↓
update appointment
```

and then separately:

```text
change-room.controller.ts
    ↓
find schedule
    ↓
check collision
    ↓
update appointment
```

That would duplicate domain rules.

Instead, create reusable backend components.

```text
Appointment Assignment
        │
        ├── Doctor Assignment Resolver
        ├── Schedule Resolver
        ├── Collision Validator
        ├── Room Resolver
        ├── Schedule Lifecycle Manager
        └── Assignment State Updater
```

The two endpoints become **consumers of these capabilities**.

---

# 3. Proposed Backend Module

Adapt this structure to the existing project structure rather than blindly creating a parallel architecture.

```text
src/
└── modules/
    └── appointment-assignment/
        ├── application/
        │   ├── use-cases/
        │   │   ├── change-appointment-doctor.use-case.ts
        │   │   └── change-appointment-room.use-case.ts
        │   │
        │   └── services/
        │       └── appointment-assignment.service.ts
        │
        ├── domain/
        │   ├── rules/
        │   │   ├── doctor-assignment.rules.ts
        │   │   ├── room-assignment.rules.ts
        │   │   └── collision.rules.ts
        │   │
        │   ├── resolvers/
        │   │   ├── doctor-schedule.resolver.ts
        │   │   └── room.resolver.ts
        │   │
        │   └── errors/
        │       ├── appointment-assignment.errors.ts
        │       └── schedule-collision.errors.ts
        │
        ├── infrastructure/
        │   └── ...
        │
        ├── dto/
        │   ├── change-appointment-doctor.dto.ts
        │   └── change-appointment-room.dto.ts
        │
        ├── controllers/
        │   └── appointment-assignment.controller.ts
        │
        └── appointment-assignment.module.ts
```

**Catatan:** nama folder harus mengikuti convention codebase yang sudah ada. Jangan membuat struktur baru jika repository sudah memiliki abstraction yang ekuivalen.

Tujuannya bukan menambah folder sebanyak mungkin.

Tujuannya adalah:

> **One domain capability → reusable abstractions → multiple consumers.**

---

# 4. Single Source of Truth

Semua nilai berikut harus tetap berasal dari backend/database/domain configuration:

* shift;
* consultation interval;
* schedule status;
* doctor category;
* service category;
* room;
* doctor availability;
* appointment occupancy;
* schedule lifecycle;
* collision rules.

Tidak boleh ada:

```ts
const INTERVAL = 30;
```

di frontend.

Tidak boleh:

```ts
if (shift === 'malam') { ... }
```

jika nilai tersebut sebenarnya berasal dari database/domain.

Tidak boleh:

```ts
const availableRooms = ...
```

di frontend dengan query/filter business rules sendiri.

Client hanya menerima:

```text
canonical backend state
```

---

# 5. Reusable Schedule Resolver

Buat abstraction yang dapat menjawab:

> Given doctor + date + consultation time, what schedule should represent this appointment?

Contoh conceptual interface:

```ts
resolveDoctorSchedule({
  doctorId,
  date,
  startTime,
  endTime,
})
```

Resolver bertanggung jawab menentukan:

```text
Existing valid schedule
        ↓
reuse

No schedule
        ↓
create/activate through existing schedule factory

Invalid schedule
        ↓
reject
```

Ini penting karena logic tersebut nantinya tidak hanya digunakan oleh `Change Doctor`.

Potensial consumer lainnya:

```text
Initial appointment assignment
Change doctor
Reschedule appointment
Admin manual assignment
Future scheduling workflows
```

Jadi jangan membuat:

```ts
changeDoctorAndCreateSchedule()
```

yang terlalu spesifik.

Lebih baik:

```text
ScheduleResolver
ScheduleFactory
ScheduleAvailabilityService
```

yang dapat digunakan banyak use case.

---

# 6. Reusable Collision Validator

Collision detection juga harus menjadi abstraction tersendiri.

Conceptually:

```ts
validateDoctorAvailability(...)
validateRoomAvailability(...)
validateAppointmentCollision(...)
```

Atau satu abstraction yang lebih domain-oriented:

```text
SchedulingConflictService
```

yang dapat digunakan oleh:

```text
Initial booking
Change doctor
Change room
Reschedule
Admin override
Future scheduling operations
```

Tujuannya:

> **There must be exactly one canonical implementation of scheduling collision rules.**

Jangan sampai:

```text
Booking collision logic
        ≠
Change doctor collision logic
        ≠
Change room collision logic
```

karena pada akhirnya ketiga flow tersebut akan menghasilkan behavior berbeda.

---

# 7. Doctor Reassignment Use Case

Endpoint:

```http
PATCH /appointments/:appointmentId/doctor
```

Request:

```json
{
  "doctorId": "target-doctor-id"
}
```

Controller hanya bertugas:

```text
HTTP request
    ↓
DTO validation
    ↓
Use case
    ↓
Response
```

Controller **tidak boleh mengetahui scheduling algorithm**.

---

## Use Case Flow

```text
ChangeAppointmentDoctor
        │
        ▼
Load Appointment
        │
        ▼
Validate Appointment State
        │
        ├── no appointment → reject
        └── no patient → reject
        │
        ▼
Validate Target Doctor
        │
        ▼
Validate Service/Doctor Compatibility
        │
        ▼
Resolve Target Schedule
        │
        ├── existing schedule
        │
        └── no schedule
               ↓
          Schedule Factory
        │
        ▼
Validate Doctor Collision
        │
        ├── collision → reject
        └── available
        │
        ▼
Resolve Target Room
        │
        ▼
Update Appointment Assignment
        │
        ▼
Evaluate Previous Schedule Lifecycle
        │
        ▼
Commit Transaction
        │
        ▼
Publish Appointment Assignment Changed Event
```

---

# 8. Important: Schedule Factory

If Doctor B has no schedule, do **not** create a special schedule directly inside the doctor reassignment use case.

Instead:

```text
ChangeAppointmentDoctor
        ↓
ScheduleResolver
        ↓
ScheduleFactory
        ↓
canonical schedule creation
```

This guarantees that schedule creation follows exactly the same rules as normal schedule creation.

For example:

```text
30-minute interval
shift
date
doctor
room
schedule status
```

must be resolved through the existing scheduling abstraction.

---

# 9. Room Resolution

Doctor reassignment may require room resolution.

The use case should not manually decide:

```ts
roomId = oldAppointment.roomId;
```

or:

```ts
roomId = targetDoctor.defaultRoomId;
```

without checking domain rules.

Instead:

```text
Target Doctor
      ↓
Target Schedule
      ↓
Canonical Room
      ↓
Appointment Assignment
```

The room should be determined by the **canonical target scheduling state**.

---

# 10. Room Reassignment Use Case

Endpoint:

```http
PATCH /appointments/:appointmentId/room
```

Request:

```json
{
  "roomId": "target-room-id"
}
```

Flow:

```text
Load Appointment
      ↓
Validate patient/appointment state
      ↓
Validate target room
      ↓
Validate room availability
      ↓
Validate collision
      ↓
Update room assignment
      ↓
Commit transaction
      ↓
Publish event
```

The following must remain unchanged:

```text
patient
service
doctor
date
consultation time
shift
```

Only the room assignment changes.

---

# 11. Transaction Boundary

Doctor reassignment especially must be atomic.

```text
BEGIN
   │
   ├── Load appointment
   ├── Validate target doctor
   ├── Resolve schedule
   ├── Create schedule if required
   ├── Validate collisions
   ├── Resolve room
   ├── Update appointment
   ├── Update old schedule lifecycle
   │
COMMIT
```

If anything fails:

```text
ROLLBACK
```

No partial state should reach the database.

---

# 12. Real-Time Notification Integration

This is an important part of the feature because you already have a real-time mechanism using **Redis Pub/Sub + WebSocket**.

Do not make the frontend responsible for detecting that an assignment changed.

After a successful transaction:

```text
Database transaction
        ↓
Commit
        ↓
AppointmentAssignmentChanged
        ↓
Redis Pub/Sub
        ↓
WebSocket Gateway
        ↓
Connected clients
```

Example event conceptually:

```json
{
  "type": "appointment.assignment.changed",
  "appointmentId": "...",
  "changes": {
    "doctor": "...",
    "room": "..."
  },
  "version": 12
}
```

The exact event contract should follow the existing event architecture.

---

# 13. Event Must Be Published After Successful Persistence

Do **not** do:

```text
Redis event
    ↓
database update
```

because clients could receive a state that was never committed.

Prefer:

```text
BEGIN
   ↓
DB changes
   ↓
COMMIT
   ↓
Publish event
```

If the existing architecture has an outbox/event mechanism, use that instead of introducing another mechanism.

The new feature should **integrate with the existing notification infrastructure**, not create a second notification system.

---

# 14. Client Synchronization

When Doctor X changes to Doctor B:

```text
Admin
   │
   │ PATCH
   ▼
Backend
   │
   ├── update DB
   └── publish event
           │
           ▼
       Redis Pub/Sub
           │
           ▼
        WebSocket
        /       \
       /         \
Patient Client   Admin Dashboard
```

Patient should automatically receive the updated canonical appointment state.

Therefore, avoid implementing:

```text
Admin changes doctor
    ↓
Frontend manually guesses new state
```

Instead:

```text
Backend changes state
    ↓
Backend broadcasts state change
    ↓
Clients synchronize
```

---

# 15. Event Payload Should Be Domain-Oriented

Avoid events like:

```text
doctor_changed = true
```

with incomplete information.

Prefer an event that allows clients to synchronize the relevant resource.

For example:

```json
{
  "event": "appointment.assignment.updated",
  "appointmentId": "...",
  "appointment": {
    "doctor": {},
    "room": {},
    "schedule": {},
    "time": {}
  }
}
```

Again, follow the existing WebSocket/event contract if one already exists.

---

# 16. Backend Components to Reuse or Introduce

Before coding, inspect the existing codebase for equivalents of:

```text
ScheduleFactory
ScheduleResolver
ScheduleAvailabilityService
CollisionValidator
RoomAvailabilityService
AppointmentAssignmentService
NotificationService
EventPublisher
RedisPubSubService
WebSocketGateway
```

If an equivalent already exists:

> **Extend/refactor it instead of creating a duplicate.**

If it does not exist, introduce the smallest reusable abstraction that can become the canonical implementation.

---

# 17. Anti-Pattern Checklist

The implementation must avoid:

```text
❌ Hardcoded 30-minute interval
❌ Hardcoded shift names
❌ Hardcoded doctor categories
❌ Frontend collision calculation
❌ Controller containing business rules
❌ Duplicate collision algorithms
❌ Direct schedule creation inside controller
❌ Direct Redis publishing from controller
❌ Updating DB and WebSocket state separately
❌ Generic CRUD endpoint with hidden scheduling behavior
❌ Copying schedule data into unrelated appointment fields
❌ Creating a second scheduling abstraction when one already exists
```

---

# 18. Implementation Sequence for Tomorrow

## Step 1 — Repository Audit

Before writing code:

```text
Find:
- Appointment module
- Schedule module
- Doctor/service relationship
- Room module
- Existing schedule factory
- Existing availability checks
- Existing collision checks
- Existing appointment assignment logic
- Redis Pub/Sub abstraction
- WebSocket event architecture
- Existing notification/event contracts
```

Do not assume these components are missing.

---

## Step 2 — Identify Existing Canonical Rules

Map:

```text
Where is interval defined?
Where is shift defined?
Where is schedule generated?
Where is availability determined?
Where is collision determined?
Where is appointment assigned?
Where is room assigned?
Where are WebSocket events published?
```

The result becomes the **architecture map** for this feature.

---

## Step 3 — Extract/Refactor Shared Abstractions

Only extract abstractions where existing code demonstrates duplicated or reusable behavior.

Target:

```text
Schedule Resolver
Schedule Factory
Collision Validator
Room Resolver
Appointment Assignment Service
```

Do not over-engineer speculative abstractions.

---

## Step 4 — Implement Doctor Reassignment

```text
PATCH /appointments/:id/doctor
```

Implement as an application use case backed by reusable scheduling components.

---

## Step 5 — Implement Room Reassignment

```text
PATCH /appointments/:id/room
```

Reuse the same collision/availability infrastructure.

---

## Step 6 — Integrate Real-Time Events

After successful state mutation:

```text
Appointment Assignment Updated
        ↓
Existing Redis Pub/Sub
        ↓
Existing WebSocket
        ↓
Patient + Admin clients
```

No parallel notification mechanism.

---

## Step 7 — Test Domain Behavior

Test the **use cases**, not merely the controllers.

Especially:

```text
Doctor has schedule
Doctor has no schedule
Doctor has schedule in another room
Doctor has appointment collision
Doctor belongs to wrong service category
Room available
Room occupied
Old schedule becomes unused
Transaction failure
WebSocket event after successful update
No event after failed transaction
```

---

# 19. Final Architecture Principle

The desired architecture is essentially:

```text
                    ┌─────────────────────┐
                    │     Controllers     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Application      │
                    │      Use Cases      │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
      │  Schedule   │   │  Collision  │   │    Room     │
      │  Resolver   │   │  Validator  │   │   Resolver  │
      └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Domain / DB SSOT  │
                    └──────────┬──────────┘
                               │
                            COMMIT
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Domain Event /     │
                    │  Notification       │
                    └──────────┬──────────┘
                               │
                               ▼
                       Redis Pub/Sub
                               │
                               ▼
                          WebSocket
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
          Patient Client              Admin Dashboard
```

**Intinya:** besok jangan mulai dari UI atau dari endpoint. Mulai dari **audit domain yang sudah ada → identifikasi SSOT → reuse/refactor scheduling abstractions → buat dua use case → expose endpoint → transactional persistence → publish existing real-time event → baru sambungkan client**.

Dengan pola ini, `Change Doctor` dan `Change Room` bukan menjadi dua fitur yang masing-masing punya logika sendiri, tetapi menjadi **dua consumer dari satu scheduling/assignment domain yang canonical dan reusable**.
