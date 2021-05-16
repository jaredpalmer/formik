/**
 * Legacy Path Helpers that use simple string / any correlation for old TypeScript versions.
 *
 * TypeScript >=4.1 will use `path-helpers.ts`. See that file for actual documentation of these methods.
 */

export type PathOf<Values> = object extends Values
 ? any
 : string;

// @ts-ignore none of these are used
export type ValueMatchingPath<Values, Path extends string> =
  any;

// @ts-ignore none of these are used
export type PathMatchingValue<Value, Values> =
  object extends Values
    ? any
    // infer individual paths
    : string;
