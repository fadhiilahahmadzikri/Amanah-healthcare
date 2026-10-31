import { execSync } from 'node:child_process';

export class DbInspector {
  private container = 'backend-postgres-1';
  private dbUser = 'amanah';
  private dbName = 'amanah_healthcare';

  /**
   * Safely execute a read-only SQL query against the Postgres container.
   * STRICT INVARIANT: Only SELECT and \d statements are permitted.
   */
  query(sql: string): string {
    const trimmed = sql.trim().toLowerCase();
    if (!trimmed.startsWith('select') && !trimmed.startsWith('\\d')) {
      throw new Error(`SECURITY VIOLATION: DbInspector only permits SELECT queries. Attempted: ${sql}`);
    }

    const sanitized = sql.replace(/"/g, '\\"');
    const cmd = `docker exec -i ${this.container} psql -U ${this.dbUser} -d ${this.dbName} -t -A -c "${sanitized}"`;
    try {
      return execSync(cmd, { encoding: 'utf-8' }).trim();
    } catch (err: any) {
      throw new Error(`DbInspector query failed: ${err.message}`);
    }
  }

  async findRoleById(id: string): Promise<{ id: string; code: string; name: string; audience: string; tier: string } | null> {
    const output = this.query(`SELECT id, code, name, audience, tier FROM roles WHERE id = '${id}';`);
    if (!output) return null;
    const [roleId, code, name, audience, tier] = output.split('|');
    return { id: roleId, code, name, audience, tier };
  }

  async countRolesById(id: string): Promise<number> {
    const output = this.query(`SELECT COUNT(*) FROM roles WHERE id = '${id}';`);
    return parseInt(output, 10) || 0;
  }

  async countRolesByCode(code: string): Promise<number> {
    const output = this.query(`SELECT COUNT(*) FROM roles WHERE code = '${code}';`);
    return parseInt(output, 10) || 0;
  }

  async findUserRoleAudience(email: string): Promise<string | null> {
    const output = this.query(
      `SELECT r.audience FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.email = '${email}' LIMIT 1;`
    );
    return output || null;
  }

  async countUsersByEmail(email: string): Promise<number> {
    const output = this.query(`SELECT COUNT(*) FROM users WHERE email = '${email}';`);
    return parseInt(output, 10) || 0;
  }

  /**
   * Safe teardown helper to purge ephemeral test artifacts created during E2E runs.
   * Strictly scoped to test identifiers (e.g. email like '%e2e%' or role code like 'pasien_e2e_%').
   */
  cleanupE2EArtifacts(params?: { emailLike?: string; roleCodeLike?: string; roleId?: string }): void {
    const emailPattern = params?.emailLike || 'pasien.e2e%';
    const rolePattern = params?.roleCodeLike || 'pasien_e2e_%';
    const roleIdClause = params?.roleId ? `OR id = '${params.roleId}'` : '';
    const roleIdFkClause = params?.roleId ? `OR role_id = '${params.roleId}'` : '';

    const sql = `
      DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '${emailPattern}');
      DELETE FROM auth_accounts WHERE user_id IN (SELECT id FROM users WHERE email LIKE '${emailPattern}');
      DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '${emailPattern}');
      DELETE FROM users WHERE email LIKE '${emailPattern}';
      DELETE FROM session WHERE "userId" IN (SELECT id FROM "user" WHERE email LIKE '${emailPattern}');
      DELETE FROM account WHERE "userId" IN (SELECT id FROM "user" WHERE email LIKE '${emailPattern}');
      DELETE FROM "user" WHERE email LIKE '${emailPattern}';
      DELETE FROM verification WHERE identifier LIKE '${emailPattern}';
      DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE code LIKE '${rolePattern}' ${roleIdClause});
      DELETE FROM user_roles WHERE role_id IN (SELECT id FROM roles WHERE code LIKE '${rolePattern}' ${roleIdClause});
      DELETE FROM roles WHERE code LIKE '${rolePattern}' ${roleIdClause};
    `;

    try {
      execSync(`docker exec -i ${this.container} psql -U ${this.dbUser} -d ${this.dbName}`, {
        input: sql,
        encoding: 'utf-8',
      });
    } catch (err: any) {
      console.warn(`[DbInspector] Warning: cleanupE2EArtifacts encountered an issue: ${err.message}`);
    }
  }
}
