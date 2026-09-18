export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Function
    ? T[P]
    : T[P] extends object
      ? DeepReadonly<T[P]>
      : T[P];
};

export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;
