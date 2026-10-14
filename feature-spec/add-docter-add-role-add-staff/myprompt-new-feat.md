
Jadi di sini kamu harus respect enumerasi, enum, kemudian jangan membuat yang aneh-aneh dulu sekarang. Saya tuh mau maintain scope pengerjaan kamu sebenarnya. Yang esensial, kalau yang saya bilang esensial, simple esensial aja. Jangan menambahkan yang aneh-aneh dulu, oke? Kalau masalah fitur penambahan itu gampang itu nanti, gitu, oke?
# Feature: Staff Management, Secure Invitations, Dynamic Rosters, and Profile Onboarding
## 1. Objective and Engineering Priorities
Jadi nanti kamu tes cycle hardening-nya ya. Jadi maksud saya itu gini, nanti kamu tes aja menggunakan PowerShell script ya, connectkan ke Meltpit, lihat dari PowerShell script aja ya. Kemudian tes penambahan dokter melalui hal seperti itu. Oke, jadi penambahan dokter itu nanti dia apa saja yang perlu diisinya gitu, kayak nama, kemudian nanti untuk form yang perlu diisi oleh dia sebagai inisial data gitu ya. Untuk dokter ya polinya apa gitu ya. Nggak boleh hardcoding, udah ada di database, please banget gitu loh. nggak boleh. Kita tuh backend itu cuma sesimpel ngeluarin data di backend dan keluarin gitu, sesimpel itu sih di expose. Apa pun yang ada di database di expose kayak gitu. Oke, di-krik-krik gitu, dites cycle-nya end-to-end-nya gitu. Jadi gitu. Gitulah, sesimpel itu sih sebenarnya. tidak ada test spec atau test code, test hanya dibatasi oleh test endpoint ps1 script, 
Implement the foundational staff-management and invitation workflows in the existing healthcare application, while bringing the doctor-management process into a consistent, database-driven architecture.

The immediate priority is the **admin-side implementation and the backend capabilities required to support it**. Do not implement Flutter screens, QR attendance, or QR-based presence tracking in this phase.

The application currently relies heavily on seeded accounts and doctor-specific workflows. This is insufficient for the intended long-term architecture, where administrators can invite doctors and staff, manage their profiles and work schedules, and eventually extend the system with additional clinics, services, and schedule block types.

Build the essential domain and infrastructure first. Keep the implementation straightforward, modular, and aligned with the existing codebase. Do not introduce unnecessary abstractions or implement unrelated features.

## 2. Inspect the Existing Architecture First

Before modifying the code, inspect the current implementation to understand:

- The existing doctor-management module and its domain model.
- Existing staff-related modules or stubs, if any.
- Authentication, authorization, roles, and account lifecycle management.
- Existing invitation or account-registration mechanisms.
- The email delivery infrastructure, including the current Mailpit setup.
- Existing doctor and staff roster/schedule mechanisms.
- The database schema, migrations, repositories, services, controllers, and API contracts.
- The existing regular patient/profile form in the frontend, which should serve as a reference for essential demographic fields.
- Existing frontend design-system components, form utilities, validation, and notification mechanisms.

Reuse existing working implementations wherever appropriate. Follow the project's established coding conventions, module boundaries, and dependency-injection patterns rather than introducing a parallel implementation.

Existing stubs may already provide useful architectural foundations. Extend them where appropriate instead of duplicating their responsibilities.

## 3. Admin-Side Doctor and Staff Invitations

The administrator must be able to create doctor and staff accounts through two distinct entry points:

- **Add Doctor**
- **Add Staff**

Each entry point should follow its corresponding domain workflow, even if the underlying invitation infrastructure is shared.

### Invitation Workflow

The workflow should be as simple as possible:

1. The administrator selects Add Doctor or Add Staff.
2. The administrator enters the invitee's email address.
3. The frontend submits the invitation request to the backend.
4. The backend determines the intended account type from the authorized invitation operation, not from an untrusted role supplied by the client.
5. The backend validates the request and checks whether the email address is already associated with an account or conflicting invitation.
6. The backend creates the appropriate invitation and account lifecycle state according to the existing authentication architecture.
7. The backend generates a cryptographically secure, temporary initial credential or uses an equivalent secure invitation mechanism supported by the existing system.
8. The invitation is delivered through the application's existing email infrastructure.
9. The invitee can authenticate through the supported onboarding flow and is required to establish a permanent password before using the application normally.

The critical requirement is that **only appropriately invited accounts receive doctor or staff access**. Users must not be able to grant themselves these roles by selecting a role in the client application or modifying a request.

### Email Delivery Is a Core Requirement

The current development environment uses Mailpit. Use the existing configuration and verify that the invitation email can actually be generated and delivered to the development mail server.

Verify the full workflow, not just the email service's unit tests:

- The administrator submits a valid invitation.
- The backend creates the correct invitation/account state.
- The email is dispatched through the existing email infrastructure.
- The expected email appears in Mailpit.
- The intended account type and onboarding instructions are correct.
- Invalid requests and email delivery failures are handled predictably.

Reuse the existing mail module, templates, and delivery abstractions where available. Do not hardcode SMTP credentials, introduce duplicate mail clients, or claim an invitation succeeded merely because an API returned a success response before the required operation completed.

Define and implement the appropriate failure-handling strategy for invitation creation and email delivery. Avoid leaving users with unusable accounts or falsely marked successful invitations when delivery fails.

### Password Security

Do not use reversible encryption for passwords.

If the existing design uses a temporary initial password, generate it securely on the backend, store only its salted adaptive password hash, and require the user to replace it during the first-login onboarding process. Use the project's existing password-hashing implementation if it meets current security requirements; otherwise, use an appropriate established algorithm such as Argon2id or bcrypt.

Never expose plaintext passwords through API responses, application logs, database records, or frontend state beyond what is strictly necessary for the intended secure delivery workflow. If the existing authentication architecture supports secure, one-time invitation links, evaluate whether they provide a safer onboarding mechanism without unnecessarily diverging from the application's established conventions.

The client application must not generate initial passwords or decide the invitee's role.

## 4. Staff Management and Roster

Staff must become a first-class domain within the application. Staff are not doctors with a different display name, nor should their existence depend exclusively on database seeders.

### Staff Profile

Provide a dedicated staff-management workflow and data model, using the existing architecture and avoiding unnecessary duplication of doctor-specific business logic.

The initial staff profile should contain the essential fields required by the application's existing demographic-form conventions:

- Full name.
- Place of birth.
- Date of birth.
- National identification number (NIK).
- Gender.
- Email or account association, where appropriate.

Use the existing regular form as the reference for field definitions, validation, formatting, and applicable constraints. Reuse existing profile schemas or shared field components where doing so preserves a clear domain boundary.

Do not add unrelated demographic fields such as blood group without an explicit product requirement.

The backend must validate and persist these attributes. They must not exist only as local frontend state or dummy data.

### Staff Roster

Staff must have a roster that administrators can manage, following the established scheduling patterns used for doctors wherever the underlying domain rules genuinely overlap.

The essential capabilities are:

- Retrieve the staff roster.
- View staff working hours.
- Create a working schedule.
- Edit an existing working schedule.
- Remove a working schedule when permitted.
- Retrieve the appropriate roster for the selected staff member.
- Validate schedule data and enforce the relevant domain constraints.

The staff roster should focus on working hours and scheduling. Do not assign staff to doctor-specific medical specialties, consultation services, or polyclinic roles unless a separate, explicit domain requirement calls for it.

Reuse shared scheduling capabilities when possible, but keep staff and doctor responsibilities clear. Avoid copying an entire doctor module and maintaining two redundant implementations.

The administrator must be able to manage staff schedules from the admin interface without requiring direct database manipulation or seeding.

## 5. Doctor Management and Essential Profile Data

Doctor management has been the primary focus of the existing implementation. Preserve its working behavior while filling the gaps in profile data and making its configuration dynamic.

### Essential Doctor Profile

Inspect the existing doctor schema and determine which demographic fields are already available.

Expose and edit the required fields through the admin interface using the existing regular form's layout and validation conventions where appropriate. Do not create a second, inconsistent definition of the same demographic data.

The backend and database remain the authoritative source of truth. Do not introduce dummy profile data, hardcoded frontend defaults, or separate duplicated profile fields.

### Dynamic Polyclinic Assignment

Administrators must be able to assign a doctor to the appropriate polyclinic through a database-backed selection.

The initial application may contain polyclinics such as:

- General Practice (*Poli Umum*).
- Maternal and Child Health (*Poli KIA*).

However, these options must not be hardcoded into the backend or frontend as permanent business rules.

Retrieve the available options from the existing database-backed configuration or catalog APIs. Persist the appropriate relationship using the existing domain model or a properly migrated schema.

The selection must reflect the polyclinics that actually exist in the database. It must not rely on frontend constants, manually maintained arrays, or duplicated configuration.

The design must also support the future addition of polyclinics through the admin interface without requiring developers to modify application code for every new entry.

## 6. Database-Driven Configuration

The longer-term system must allow administrators to manage three types of configuration:

- Polyclinics.
- Services.
- Schedule block types.

Although the administration screens for managing these catalogs are outside the immediate scope unless existing functionality makes them essential, the new doctor and staff workflows must not prevent that future extension.

Inspect the current database schema and reuse existing catalog tables, relationships, and APIs where appropriate. Introduce migrations only where the existing model cannot represent the required behavior.

**Do not hardcode business options in the backend.** The application must derive selectable polyclinics and other applicable configuration from authoritative persisted records.

A new polyclinic or service should not require changes to frontend constants, backend conditionals, or hardcoded enum lists merely to become selectable.

This does not prohibit technical enums for genuinely fixed system states. It prohibits representing administrator-managed business configuration as fixed application code.

## 7. First-Login Profile Completion

Invited staff members must eventually complete their essential profile information before accessing the normal staff dashboard.

The intended lifecycle is:

1. The administrator invites a staff member.
2. The staff member receives the invitation email.
3. The staff member authenticates using the supported onboarding mechanism.
4. The staff member establishes a permanent password when required.
5. The backend determines whether mandatory profile information is complete.
6. If mandatory information is missing, the user must complete onboarding before receiving normal dashboard access.
7. Once the required information has been saved and validated, the user can proceed to the normal application experience.

The same principle should be applied to doctors where the product requires doctor profile completion, while preserving any role-specific requirements.

Profile-completion status and access restrictions must be enforced by the backend, not merely by hiding a button or redirecting through frontend logic. Protected APIs must not remain accessible to an incompletely onboarded user simply because that user bypasses the frontend.

For this phase, implement the necessary backend endpoint or endpoints, persistence, and authorization rules. Flutter UI development and the corresponding mobile onboarding screens are explicitly deferred.

Inspect the existing authentication and onboarding infrastructure before choosing endpoint shapes or introducing a new account-state mechanism.

## 8. Authentication and Removal of Role Selection

The current Flutter experience asks users to choose whether they are a doctor or a staff member. This is not an acceptable authorization mechanism.

The eventual mobile application must derive the user's role from the authenticated account and backend authorization context.

The backend must determine account type and permissions from trusted persisted state. A user must not obtain elevated access by modifying a frontend selection, request payload, URL, or locally stored role.

This phase establishes the backend foundation. Do not implement or redesign the Flutter interface now.

Existing seeded accounts may still be needed for development and testing, but the application must no longer depend on seeders as the only way to provision doctors and staff. Preserve necessary development fixtures while making invitation-based provisioning a supported, repeatable workflow.

## 9. Admin Frontend Requirements

Prioritize the administration interface and reuse the existing frontend architecture and design system.

The immediate interface must support:

- Inviting a doctor by email.
- Inviting a staff member by email.
- Viewing the existing doctor and staff records appropriate to the administrator's permissions.
- Editing essential profile data.
- Assigning a doctor to a database-backed polyclinic.
- Managing staff working hours through the staff roster.
- Displaying meaningful success and error feedback for mutations.

Reuse existing form layouts, modal or wizard patterns, API clients, query utilities, and toast notifications wherever appropriate.

Mutations must update the relevant frontend data correctly using the project's existing state-management or query-invalidation conventions. Do not require a manual page refresh for successful changes when the existing frontend architecture supports immediate synchronization.

Do not introduce dummy records, hardcoded dropdown options, frontend-generated identifiers, or business logic that duplicates backend decisions.

## 10. Architecture and Engineering Standards

Implement this feature in accordance with the project's existing modular architecture.

- Follow separation of concerns, SOLID, DRY, and single-source-of-truth principles.
- Keep doctor management, staff management, invitation processing, authentication, email delivery, and roster management responsibilities clearly defined.
- Reuse shared domain capabilities without creating tightly coupled or duplicated modules.
- Keep validation and business rules in their authoritative backend layers.
- Keep the database as the source of truth for profiles, roles, polyclinics, schedules, and persisted invitation state.
- Keep the frontend responsible for presentation, form interaction, and API consumption rather than reconstructing domain rules.
- Reuse existing module stubs and established contracts.
- Avoid speculative abstractions, unrelated refactoring, and unnecessary infrastructure.
- Add database migrations and update API contracts where required.
- Keep the implementation consistent with existing logging, exception handling, authorization, and dependency-injection conventions.

Before integrating the frontend with a new backend capability, define and verify the relevant API contract, including request schemas, successful responses, validation failures, authorization failures, and delivery-related errors.

## 11. Required Tests

Prioritize tests that establish correct persisted data, correct authorization, and successful real workflows.

### Invitation and Email

Verify that an authorized administrator can invite a doctor or staff member by email, that the correct account type is established, and that the invitation email reaches Mailpit.

Test duplicate email addresses, conflicting invitations, malformed email addresses, unauthorized callers, and email delivery failures.

Verify that password hashing is non-reversible, that plaintext credentials are never persisted or logged, and that any required first-login password change is enforced.

### Staff and Doctor Profiles

Verify profile creation, retrieval, and updates against actual backend persistence.

Ensure staff records do not accidentally acquire doctor-specific attributes and that doctor profiles can be assigned to valid database-backed polyclinics.

Test invalid field values, missing required information, duplicate identifiers where applicable, and unauthorized mutations.

### Rosters

Test the creation, retrieval, editing, and deletion of staff schedules, including relevant validation and persistence rules.

Verify that staff roster operations do not inadvertently modify doctor rosters or introduce cross-user data leakage.

### First-Login Onboarding and Security

Test incomplete and complete profile states, password-change requirements, backend access restrictions, and role-based authorization.

Verify that a user cannot register themselves as a doctor or staff member, bypass mandatory profile completion through a direct API request, or access another user's profile or schedule without permission.

### Regression

Rerun affected authentication, doctor-management, scheduling, and email tests after the changes. Do not rely on test results collected before the relevant implementation changed.

Use the project's existing automated testing infrastructure and established end-to-end test conventions.

## 12. Explicitly Out of Scope

Do not implement the following as part of this task:

- Flutter UI for staff onboarding or profile completion.
- QR attendance or QR-based presence tracking.
- New QR-specific attendance rules.
- Unrelated appointment or notification changes.
- Premature redesign of the entire scheduling architecture.
- Large-scale refactoring of unrelated modules.

The goal is to establish the prerequisites that make those future features straightforward, secure, and consistent with the domain model.

## 13. Definition of Done

The foundational implementation is complete when:

1. An administrator can invite a doctor or staff member using an email address.
2. Invitation processing uses a secure backend-controlled account lifecycle.
3. The appropriate invitation email can be verified in Mailpit.
4. Credentials are stored securely, and required password changes are enforced.
5. Staff exists as a distinct, persisted domain with essential demographic profile fields.
6. Administrators can manage staff working hours through a database-backed roster.
7. Doctor profiles expose their required demographic fields and support database-backed polyclinic assignment.
8. Selectable polyclinics are not hardcoded and can support future admin-managed additions.
9. The backend provides the necessary profile-completion capabilities for future Flutter onboarding.
10. Role selection in the frontend cannot grant unauthorized privileges.
11. Existing doctor-management and authentication behavior remains functional.
12. Automated tests demonstrate persisted-data correctness, invitation delivery, authorization enforcement, and roster behavior.

## Final Direction

Build the fundamentals first: invitation-based provisioning, secure authentication, persisted doctor and staff profiles, dynamic polyclinic configuration, and staff roster management.

Do not proceed to Flutter or QR attendance until these foundations are reliable. Do not introduce unnecessary complexity or attempt to implement every future administrative feature in this iteration.

Use the existing implementation as the reference, make the smallest coherent architectural changes that satisfy the requirements, and verify the actual behavior before declaring the work complete.# Engineering Specification: Secure Doctor and Staff Lifecycle Management

## 1. Core Objective

Build a secure, maintainable, and database-driven foundation for managing doctors and staff in the healthcare application.

The primary goal is to establish the complete **user lifecycle, from administrator invitation to account activation, first login, mandatory profile completion, routine account management, and eventual deactivation or deletion**.

This is not simply a request to add a staff form or another CRUD module. The application currently relies too heavily on seeded accounts and doctor-centric workflows. We need to evolve that implementation into a proper domain model where doctors and staff have distinct responsibilities, independent profile requirements, and explicitly enforced authorization rules.

The implementation must be designed for future extensions without requiring fundamental architectural changes every time a new staff type, polyclinic, service, or schedule block type is introduced.

**Priorities:**

1. Define and implement the correct user flows.
2. Establish secure authentication, authorization, and account lifecycle management.
3. Separate doctor and staff domain responsibilities.
4. Build reusable, dependency-injected infrastructure for password generation and email delivery.
5. Introduce database migrations and preserve existing data.
6. Verify whether appointment and schedule endpoints are properly secured, and harden any gaps found.
7. Validate the actual end-to-end behavior before declaring the work complete.

Do not implement Flutter onboarding or QR attendance in this phase. The immediate focus is the backend foundation and the admin frontend.

## 2. Expected User Flows

The following workflows are the intended product behavior. Inspect the current implementation first, reuse existing capabilities where appropriate, and implement the missing parts without creating parallel systems.

### Flow A — Administrator Invites a Doctor or Staff Member

<CodeBlock language="mermaid">flowchart TD
    A["Administrator opens management page"] --> B{"Choose account type"}
    B -->|Doctor| C["Add Doctor"]
    B -->|Staff| D["Add Staff"]
    C --> E["Enter email address"]
    D --> E
    E --> F["Backend authenticates administrator"]
    F --> G["RBAC authorizes invitation"]
    G --> H["Validate email and account conflicts"]
    H --> I["Create pending invitation"]
    I --> J["Generate secure invitation credential"]
    J --> K["Persist invitation and credential hash"]
    K --> L["Send invitation through email interface"]
    L --> M{"Delivery accepted?"}
    M -->|Yes| N["Report invitation status"]
    M -->|No| O["Record delivery failure and recovery state"]
    G -->|Denied| P["Reject with authorization error"]
    H -->|Invalid| Q["Return validation error"]</CodeBlock>

The administrator should only need to select the account type and enter an email address for the initial invitation. Additional profile data can be collected during onboarding.

The backend must determine the account type from the authorized operation. The client must never be trusted to grant itself a role by submitting a modified request.

Invitation processing must handle duplicate email addresses, conflicting invitations, unauthorized callers, database failures, and email delivery failures without creating inconsistent account states.

Use a transactional or otherwise recoverable workflow appropriate to the existing architecture. An email delivery failure must not silently leave the administrator believing that a usable invitation was sent.

### Flow B — Invitee Receives the Invitation and Logs In for the First Time

<CodeBlock language="mermaid">flowchart TD
    A["Invitee receives email"] --> B["Open invitation or use initial credential"]
    B --> C["Backend validates invitation"]
    C --> D{"Invitation valid and usable?"}
    D -->|No| E["Reject, expired, revoked, or already used"]
    D -->|Yes| F["Establish authorized account"]
    F --> G["Require password change when applicable"]
    G --> H["Authenticate with permanent credentials"]
    H --> I["Backend checks account and profile status"]
    I --> J{"Mandatory profile complete?"}
    J -->|No| K["Restrict normal application access"]
    K --> L["Collect required profile information"]
    L --> M["Validate and persist profile"]
    M --> I
    J -->|Yes| N["Allow access to authorized dashboard"]
</CodeBlock>

The backend must determine whether the account has completed onboarding and whether it is permitted to access normal application functionality.

The frontend may redirect the user to the onboarding screen, but frontend routing alone is not a security boundary. Protected backend endpoints must enforce account status, role, and onboarding restrictions as applicable.

The eventual Flutter client will use this same backend contract. Flutter implementation is deferred, but the required backend capabilities must be established now.

### Flow C — Administrator Manages Staff After Invitation

<CodeBlock language="mermaid">flowchart TD
    A["Administrator opens Staff Management"] --> B["Retrieve authorized staff records"]
    B --> C{"Select staff member"}
    C --> D["View profile and account status"]
    D --> E{"Choose action"}
    E -->|Edit| F["Update permitted profile fields"]
    E -->|Deactivate| G["Disable account access"]
    E -->|Reactivate| H["Validate and restore access"]
    E -->|Delete| I["Apply permitted deletion policy"]
    E -->|Manage roster| J["Manage staff working hours"]
    F --> K["Backend validates and persists changes"]
    G --> L["Invalidate access according to session policy"]
    H --> M["Recheck account eligibility and permissions"]
    I --> N["Preserve required audit and relational integrity"]
    J --> O["Validate and persist staff roster"]
</CodeBlock>

Staff management must cover more than creation and retrieval. Authorized administrators need to edit staff information, deactivate accounts, reactivate eligible accounts, and manage working schedules. Deletion must follow an explicit lifecycle policy that preserves required audit records and referential integrity.

The same principle applies to doctor management, but the domain-specific profile and roster rules must remain distinct.

## 3. Doctors and Staff Are Different Domains

Do not force doctors and staff into a single oversized domain model simply because both have login credentials.

They share infrastructure, but they do not have identical business responsibilities.

### Shared capabilities

Both account types may use shared mechanisms for:

- Authentication and password verification.
- Invitation and initial account provisioning.
- Email delivery.
- Account activation and deactivation.
- Profile-completion checks where applicable.
- Audit logging.
- Common demographic fields where the existing domain model supports them.
- Authorization infrastructure and shared API conventions.

### Doctor-specific capabilities

Doctors have doctor-specific information and relationships, including their applicable professional profile, polyclinic assignment, and doctor roster or scheduling rules.

Doctor workflows must retrieve selectable polyclinics from database-backed configuration rather than hardcoded frontend arrays or backend conditionals.

### Staff-specific capabilities

Staff require a dedicated staff domain and their own profile and roster-management workflows.

The essential profile should follow the existing regular demographic form, including full name, place of birth, date of birth, NIK, and gender where required by the established contract. Do not collect unrelated medical attributes such as blood group merely because they exist on another form.

Staff working hours must be manageable without incorrectly assigning staff to doctor-only responsibilities such as medical specialties or consultation services.

**Architectural principle:** Share infrastructure and genuinely common behavior, but keep domain-specific rules encapsulated in their respective modules.

Do not duplicate the entire doctor implementation to produce staff functionality. Equally, do not introduce a universal employee service that becomes responsible for every doctor and staff business rule.

## 4. Define the Domain Model and Required Migrations

A database migration will likely be required to establish the correct distinction between staff, doctors, invitations, account status, and profile-completion state. Confirm the actual schema before deciding which tables or columns need to change.

Do not assume that creating a separate staff domain necessarily requires duplicating the authentication user table. Inspect the existing model and choose the smallest coherent schema that preserves shared identity while representing the distinct doctor and staff relationships correctly.

Depending on the existing architecture, the migration may require:

- Explicit doctor and staff domain records or relationships.
- The appropriate foreign-key constraints and uniqueness rules.
- Invitation lifecycle and expiration metadata.
- Secure credential or invitation-token hashes.
- Account activation and deactivation state.
- Profile-completion state, derived from persisted requirements where feasible.
- Staff roster relationships and their required scheduling attributes.
- Database-backed references to polyclinics and other configurable business entities.

These are candidate requirements, not permission to create duplicate tables for data that already exists.

### Migration requirements

1. Inspect the current production-relevant schema and existing migrations.
2. Identify how current seeded doctor accounts and other users are represented.
3. Design a backward-compatible migration strategy where feasible.
4. Preserve valid existing records and their relationships.
5. Define how existing seeded or incomplete accounts should be mapped to the new lifecycle model.
6. Add appropriate constraints and indexes.
7. Define rollback behavior where safely possible.
8. Apply the migration in a controlled development/test environment.
9. Test both migrated existing records and newly invited accounts.

Never resolve a migration problem by silently deleting existing records, dropping populated tables, or reseeding the database with replacement data.

Do not treat seeders as the permanent account-provisioning mechanism. Existing seeders may remain useful for development and automated tests, but invitation-based provisioning must work independently.

## 5. Password Generation Must Be an Independent Service

Password generation must be a standalone, reusable capability, not logic embedded in a controller, invitation handler, doctor service, staff service, or email template.

Define an appropriate abstraction, such as an `IPasswordGenerator` interface, with a concrete implementation registered through dependency injection.

The service must encapsulate the details of secure initial-password generation. Any module that legitimately requires this capability should depend on the interface rather than a concrete implementation.

Requirements:

- Use a cryptographically secure source of randomness.
- Apply an appropriate, documented credential-generation policy.
- Keep credential generation independent from email transport and role-specific business rules.
- Do not generate credentials in the frontend.
- Do not hardcode initial passwords, predictable secrets, or default production credentials.
- Do not use reversible encryption to store passwords.
- Persist only the appropriate salted adaptive password hash for credentials used as account passwords.
- Ensure temporary credentials or invitation tokens have limited validity and the lifecycle rules defined by the authentication design.

A password generator should not be responsible for deciding which role an account receives, persisting users, sending email, or granting access.

Where a secure, single-use invitation-link mechanism already exists or is clearly preferable, use that established pattern rather than introducing a temporary password solely for consistency with an older flow.

## 6. Email Delivery Must Also Be an Independent Service

Email delivery must be technology-agnostic and reusable by every module that needs to send email.

Define an appropriate interface, such as `IEmailService`, `IEmailSender`, or the project's existing equivalent, and supply its implementation through dependency injection.

The invitation workflow should depend on this abstraction rather than directly instantiating an SMTP client or referencing Mailpit-specific behavior.

Responsibilities must remain separated:

- **Invitation service:** Coordinates invitation lifecycle and domain rules.
- **Credential or token service:** Generates and validates appropriate initial credentials or invitation tokens.
- **Password hashing/authentication service:** Hashes credentials and verifies authentication according to the existing security architecture.
- **Email service:** Delivers messages through the configured transport.
- **Template or rendering component:** Builds the email content using appropriate inputs.
- **Repositories/persistence layer:** Manages persisted records and transactional state.

These responsibilities should reuse existing project modules when available; do not create duplicate abstractions simply to match these example names.

Mailpit is the development email destination, not the domain's email-delivery interface. The same invitation workflow should be able to use another configured email provider without rewriting doctor or staff business logic.

Verify actual delivery in Mailpit. A mocked email sender passing a unit test is not sufficient proof of integration.

## 7. Enforce RBAC and Account Lifecycle Security

Perform a dedicated security review of the relevant authentication and authorization paths.

At minimum, determine and enforce which permissions apply to:

- Viewing doctor records.
- Inviting doctors.
- Editing doctor profiles.
- Assigning doctors to polyclinics.
- Managing doctor schedules.
- Viewing staff records.
- Inviting staff.
- Editing staff profiles.
- Deactivating, reactivating, or deleting staff.
- Managing staff rosters.
- Viewing and mutating appointments.
- Accessing patient information and patient schedules.

Use the application's established role and permission architecture. If the system has a permission-based model, preserve it rather than introducing scattered hardcoded role checks in every controller.

Do not rely on frontend route guards, hidden buttons, or navigation restrictions as authorization mechanisms.

Every protected backend operation must enforce the appropriate authorization policy. For patient-specific and staff-specific resources, verify resource ownership, tenant or clinic scope where applicable, and the caller's permission to access the requested record.

### Account deactivation

Deactivation must prevent further authorized use of the account according to the application's authentication design. Determine whether existing access tokens, refresh tokens, sessions, and real-time connections need to be revoked, invalidated, or revalidated.

Do not assume that setting a database field to `inactive` automatically invalidates already-issued credentials.

### Deletion

Define a deliberate deletion policy based on existing database relationships, privacy requirements, and audit obligations.

Where historical appointments, schedules, or clinical records must remain associated with the original account, use an appropriate deactivation or soft-deletion strategy instead of cascading deletion that destroys required history.

Only permanently delete records when the applicable domain and retention rules permit it. Restrict deletion privileges and preserve relevant audit information.

### Invitation abuse and credential protection

Validate invitation expiration, single-use behavior where applicable, replay resistance, duplicate requests, and unauthorized role assignment.

Do not reveal sensitive account-existence information unnecessarily. Rate-limit invitation and authentication endpoints using the existing infrastructure where appropriate.

Never log passwords, raw invitation tokens, authentication headers, or unnecessary patient information.

## 8. Conduct a Dedicated Audit of Appointment and Schedule Security

The current authorization status of appointment and schedule endpoints is unknown. **Do not assume these modules are protected simply because the application already has login or RBAC functionality.**

Inspect the actual route registration, global guards, controller-level guards, service authorization, and database access patterns.

For each appointment and schedule endpoint, establish:

- Whether authentication is required.
- Which roles and permissions are allowed.
- Whether read and write operations have different access policies.
- Whether users can access another patient's appointment or another employee's roster by changing an identifier.
- Whether administrators can access only the records permitted by the applicable clinic or organizational scope.
- Whether state-changing operations enforce the relevant domain rules.
- Whether realtime events and subscriptions enforce the same access boundaries.
- Whether any endpoints rely exclusively on frontend restrictions.
- Whether background jobs, internal routes, and alternate API paths bypass the intended protections.

Build a route-by-route authorization matrix documenting the expected policy and the actual implementation.

At minimum, tests must prove that unauthenticated callers cannot access protected operations, insufficiently privileged users cannot perform administrative mutations, and authorized users cannot access unrelated records simply by manipulating resource identifiers.

Use the application's actual role names and access rules rather than inventing a new authorization model without inspecting the codebase.

If the audit finds vulnerabilities, fix them as part of the security-hardening scope. Preserve legitimate existing workflows and verify that appropriate authorized requests continue to work.

## 9. Roster Management Must Remain Database-Driven

Staff rosters and doctor schedules should reuse existing scheduling infrastructure when their underlying responsibilities genuinely overlap.

However, staff working hours must remain distinct from doctor-specific appointment availability and medical-service scheduling rules.

Inspect the existing roster and schedule modules before implementing changes. Determine which rules are shared, which entities already exist, and which migrations are required.

Do not hardcode polyclinic names, services, schedule block types, or other administrator-managed business options in application code.

The data model must accommodate future administrator-managed configuration for:

- Polyclinics.
- Services.
- Schedule block types.

The ability to build these future administration screens does not mean implementing those screens now. The current requirement is to establish a compatible schema and API contract where necessary so future additions do not require replacing domain rules with new hardcoded conditionals.

## 10. Engineering Standards and Module Boundaries

Apply the existing project's engineering standards consistently.

### Encapsulation and cohesion

Use well-defined interfaces and dependency injection for shared infrastructure. Each service or module must have a clear responsibility and should not reach into another module's internal implementation.

For example, the staff-invitation workflow should orchestrate the required capabilities through their contracts rather than taking responsibility for generating passwords, communicating with SMTP, deciding all account permissions, and manipulating every database entity itself.

### Maintainability

- Keep modules and service files below approximately 500 lines of code.
- Treat 500 lines as a maintainability warning boundary, not a reason to create meaningless abstractions or arbitrarily split tightly related logic.
- Follow SOLID, SRP, DRY, and single-source-of-truth principles.
- Reuse existing helpers, validators, factories, interfaces, and domain services.
- Avoid duplicate utilities, hardcoded business rules, magic strings, and redundant persistence models.
- Avoid circular dependencies and oversized services.
- Preserve explicit module boundaries and established naming conventions.
- Keep frontend domain logic out of the presentation layer.
- Keep backend contracts authoritative for persisted data and business decisions.

Do not refactor unrelated modules merely for stylistic consistency. Make the smallest coherent set of changes required to establish the intended architecture and security properties.

## 11. API Contracts and Frontend Integration

Before connecting new frontend flows, establish the backend contracts for invitation management, account status management, profile completion, profile updates, and roster management.

Document request payloads, response schemas, validation failures, authorization failures, relevant resource identifiers, and email-delivery or invitation-state outcomes.

The frontend should consume these APIs through the existing API client and data-fetching architecture.

Do not implement schedule calculations, account-status derivation, role assignment, credential generation, or business configuration defaults independently in the frontend.

Admin mutations must synchronize the relevant UI state using the established frontend query invalidation, mutation, or real-time update mechanisms.

Use existing form components, modal patterns, loading states, toast notifications, and error-handling utilities. Do not introduce a separate design system or redundant API abstraction.

## 12. Required Testing Strategy

Testing must establish that the actual persisted data, authorization rules, and user lifecycle behave correctly. A collection of tests that only mocks service calls is insufficient.

### Invitation and account lifecycle

Verify the following end to end:

1. An authorized administrator invites a doctor or staff member by email.
2. The correct account type and pending invitation state are persisted.
3. The invitation is delivered to Mailpit through the existing email infrastructure.
4. Valid invitation credentials can be used according to the defined onboarding flow.
5. Expired, revoked, replayed, or invalid invitations are rejected.
6. The invitee establishes a permanent credential when required.
7. Mandatory profile completion is enforced by the backend.
8. An incomplete account cannot bypass onboarding by directly calling a protected API.
9. Invitation delivery failures produce a recoverable and accurately reported state.

### Staff and doctor management

Verify creation or provisioning, retrieval, profile updates, deactivation, permitted reactivation, and deletion policy.

Confirm that staff and doctor relationships remain distinct, shared infrastructure works correctly, and doctor-specific information is not accidentally applied to staff records.

### RBAC and resource isolation

Verify allowed and denied actions across all relevant roles.

Include direct requests to protected endpoints, manipulated resource identifiers, attempts to change account roles, and attempts to access unrelated patient or staff records.

### Appointment and schedule authorization

Validate the route-by-route security matrix using actual API requests.

Test unauthenticated access, insufficient permissions, resource-level isolation, authorized mutations, and appropriate clinic or organizational scoping where applicable.

### Roster and configuration

Verify that roster mutations persist correctly and that dynamic options originate from the database. Confirm that invalid or unavailable references are rejected by the backend.

After any relevant code change, rerun the affected tests and the complete regression suite for the impacted modules. Do not treat earlier test results as evidence for code that has since changed.

## 13. Implementation Sequence

Execute the work in this order:

**Phase 1 — Audit and design.** Inspect the current authentication system, doctor and staff models, invitation infrastructure, email modules, schema, migration history, schedule modules, appointment endpoints, and authorization guards.

**Phase 2 — Harden the architecture.** Establish the necessary domain boundaries, interfaces, dependency-injection registrations, and database migration plan. Identify existing shared services that can be reused.

**Phase 3 — Implement invitation provisioning.** Complete the administrator's Add Doctor and Add Staff flows, secure initial credential or invitation handling, account lifecycle transitions, and real email delivery through Mailpit.

**Phase 4 — Implement account and profile management.** Complete the essential doctor and staff profile workflows, account deactivation/reactivation, the applicable deletion strategy, and mandatory profile-completion capabilities.

**Phase 5 — Implement staff roster management.** Add the required persisted roster operations while reusing genuinely shared scheduling infrastructure and preserving doctor-specific rules.

**Phase 6 — Harden authorization.** Audit appointment and schedule endpoints, correct missing or inconsistent guards, validate resource-level permissions, and enforce the resulting access policies.

**Phase 7 — Verify integration and regressions.** Run migrations against an appropriately isolated database, exercise the real email and API workflows, run the authorization matrix and lifecycle tests, and validate existing doctor, appointment, schedule, and authentication behavior.

Do not proceed to Flutter onboarding or QR attendance as part of this implementation.

## 14. Definition of Done

The implementation is complete when the administrator can invite and manage doctors and staff; invitees follow a secure onboarding process; doctor and staff profiles and rosters are persisted correctly; password generation and email delivery are reusable, dependency-injected services; schema migrations preserve existing data; and the applicable appointment and schedule routes enforce the intended authorization rules.

The final report must include:

- The user flows implemented.
- The actual schema changes and migrations applied or prepared.
- The modules, interfaces, and services changed.
- How invitation credentials and email delivery work.
- The RBAC and account-lifecycle decisions.
- The appointment and schedule authorization audit findings.
- The automated tests executed and their actual results.
- Any remaining gaps or blocked scenarios.

**Final engineering principle:** Establish a secure, coherent domain model first. Share infrastructure through interfaces, preserve the distinction between doctors and staff, make business configuration database-driven, and verify the real authorization boundaries before expanding into Flutter and QR attendance. Do not declare completion based solely on successful compilation, mocked tests, or a frontend that appears to work.

