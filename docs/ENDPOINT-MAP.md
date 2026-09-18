# ENDPOINT-MAP.md — Installed Endpoint Ledger

> One row per installed endpoint. Appended at **Step 13** of the protocol in [`AGENTS.md`](../AGENTS.md) §9.
> An endpoint that is not in this table is **not installed**, regardless of whether code exists.

## Legend

| Column | Meaning |
|---|---|
| **Key** | Constant name in `src/server/api/endpoints.ts` |
| **Upstream** | NestJS method + path |
| **Controller** | NestJS controller.method (contract owner) |
| **Repo method** | `src/server/repositories/*.repository.ts` |
| **Use case** | `.query.ts` (read) or `.command.ts` (write) |
| **Port** | Loader (read) or Action (write) |
| **Cache** | Policy + tag, or `—` for writes |
| **Invalidates** | Tags/paths revalidated by a write |
| **Auth** | `public` · `session` · `role:<name>` |
| **Owner** | CODEOWNERS team |

---

## Reads

| Key | Upstream | Controller | Repo method | Use case | Port | Cache | Auth | Owner |
|---|---|---|---|---|---|---|---|---|
| `AUTH_ME` | `GET /api/v1/auth/me` | `AuthController.me` | `AuthRepository.getMe` | `get-current-user.query` | `loadCurrentUser` | `NO_STORE` | `session` | `@team/identity` |
| `BETTER_AUTH_GET_SESSION` | `GET /api/auth/get-session` | `BetterAuthController.getSession` | `AuthRepository.getBetterAuthSession` | `get-better-auth-session.query` | `loadBetterAuthSession` | `NO_STORE` | `session` | `@team/identity` |

## Writes

| Key | Upstream | Controller | Repo method | Use case | Port | Invalidates | Idempotent | Auth | Owner |
|---|---|---|---|---|---|---|---|---|---|
| `AUTH_LOGIN` | `POST /api/v1/auth/email/login` | `AuthController.login` | `AuthRepository.loginWithEmail` | `login.command` | `loginAction` | `—` | no | `public` | `@team/identity` |
| `AUTH_REFRESH` | `POST /api/v1/auth/refresh` | `AuthController.refresh` | `AuthRepository.refreshToken` | `refresh-token.command` | `refreshTokenAction` | `—` | no | `session` | `@team/identity` |
| `AUTH_FORGOT_PASSWORD` | `POST /api/v1/auth/forgot/password` | `AuthController.forgotPassword` | `AuthRepository.forgotPassword` | `forgot-password.command` | `forgotPasswordAction` | `—` | key optional | `public` | `@team/identity` |
| `AUTH_LOGOUT` | `POST /api/v1/auth/logout` | `AuthController.logout` | `AuthRepository.logout` | `logout.command` | `logoutAction` | `auth:me` | yes | `session` | `@team/identity` |
| `BETTER_AUTH_SIGN_IN` | `POST /api/auth/sign-in/email` | `BetterAuthController.signInEmail` | `AuthRepository.betterAuthSignIn` | `better-auth-sign-in.command` | `betterAuthSignInAction` | `—` | no | `public` | `@team/identity` |
| `BETTER_AUTH_SIGN_OUT` | `POST /api/auth/sign-out` | `BetterAuthController.signOut` | `AuthRepository.betterAuthSignOut` | `better-auth-sign-out.command` | `betterAuthSignOutAction` | `session` | yes | `session` | `@team/identity` |
| `BETTER_AUTH_FORGET_PASSWORD` | `POST /api/auth/forget-password` | `BetterAuthController.forgetPassword` | `AuthRepository.betterAuthForgetPassword` | `better-auth-forget-password.command` | `betterAuthForgetPasswordAction` | `—` | no | `public` | `@team/identity` |
| `BETTER_AUTH_RESET_PASSWORD` | `POST /api/auth/reset-password` | `BetterAuthController.resetPassword` | `AuthRepository.betterAuthResetPassword` | `better-auth-reset-password.command` | `betterAuthResetPasswordAction` | `session` | no | `public` | `@team/identity` |
| `BETTER_AUTH_ADMIN_LIST_USERS` | `POST /api/auth/admin/list-users` | `BetterAuthController.listUsers` | `AuthRepository.betterAuthAdminListUsers` | `better-auth-admin-list-users.command` | `betterAuthAdminListUsersAction` | `—` | yes | `role:admin` | `@team/identity` |
| `BETTER_AUTH_ADMIN_SET_ROLE` | `POST /api/auth/admin/set-role` | `BetterAuthController.setRole` | `AuthRepository.betterAuthAdminSetRole` | `better-auth-admin-set-role.command` | `betterAuthAdminSetRoleAction` | `user:detail` | yes | `role:admin` | `@team/identity` |
| `BETTER_AUTH_ADMIN_BAN_USER` | `POST /api/auth/admin/ban-user` | `BetterAuthController.banUser` | `AuthRepository.betterAuthAdminBanUser` | `better-auth-admin-ban-user.command` | `betterAuthAdminBanUserAction` | `user:detail` | yes | `role:admin` | `@team/identity` |
| `BETTER_AUTH_ADMIN_IMPERSONATE_USER` | `POST /api/auth/admin/impersonate-user` | `BetterAuthController.impersonateUser` | `AuthRepository.betterAuthAdminImpersonateUser` | `better-auth-admin-impersonate.command` | `betterAuthAdminImpersonateAction` | `session` | no | `role:admin` | `@team/identity` |

---

## Pending / not yet installed (Upstream Stubs)

| Upstream | Reason not installed | Blocker | Target |
|---|---|---|---|
| `POST /api/v1/auth/email/register` | Upstream method is stub (HTTP 204, no DB write to `users` / `auth_accounts`) | Backend service implementation | Sprint Next |
| `POST /api/v1/auth/reset/password` | Upstream method is stub (HTTP 204, no password update) | Backend service implementation | Sprint Next |
| `POST /api/v1/auth/email/confirm` | Upstream method is stub (HTTP 204, no DB write) | Backend service implementation | Sprint Next |
| `POST /api/v1/auth/email/confirm/new` | Upstream method is stub (HTTP 204, no DB write) | Backend service implementation | Sprint Next |
| `PATCH /api/v1/auth/me` | Upstream method is stub (returns null, no DB write) | Backend service implementation | Sprint Next |
| `DELETE /api/v1/auth/me` | Upstream method is stub (HTTP 204, no DB soft-delete) | Backend service implementation | Sprint Next |

## Deprecated

| Key | Replaced by | Removal date | ADR |
|---|---|---|---|
| | | | |
