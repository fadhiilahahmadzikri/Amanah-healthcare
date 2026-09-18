declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type TokenString = Brand<string, 'TokenString'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type RoleCode = Brand<string, 'RoleCode'>;

export function asUserId(id: string): UserId {
  return id as UserId;
}

export function asTokenString(token: string): TokenString {
  return token as TokenString;
}

export function asEmailAddress(email: string): EmailAddress {
  return email.toLowerCase().trim() as EmailAddress;
}
