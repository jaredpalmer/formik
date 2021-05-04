/**
 * Gets any path of a given Values object. Given:
 *
 * `Values = { name: { first: string } }`,
 *
 * `PathOf<Values> = "name" | "name.first"`
 */
export type PathOf<Values> = object extends Values
  ? any
  : FlattenPathTuples<RecursivelyTuplePaths<Values>> & string;

/**
 * Gets the Value at a nested Path. Given:
 *
 * `Values = { name: { first: string } }`,
 *
 * `ValueMatchingPath<Values, "name.first"> = string`
 */
export type ValueMatchingPath<Values, Path extends PathOf<Values>> =
  string extends Path
    // if Path is any or never, return that as value
    ? any
    : object extends Values
      // if Values is any, return any
      ? any
      : Values extends readonly (infer SingleValue)[]
        ? Path extends `${number}.${infer NextPath}`
          ? NextPath extends PathOf<Values[number]>
            ? ValueMatchingPath<Values[number], NextPath>
            : never
          : SingleValue
        : Path extends keyof Values
          ? Values[Path]
          : Path extends `${infer Key}.${infer NextPath}`
            ? Key extends keyof Values
              ? NextPath extends PathOf<Values[Key]>
                ? ValueMatchingPath<Values[Key], NextPath>
                : never
              : never
            : never;

/**
 * Gets PathOf<Values> which match the requested type. Given:
 *
 * `Values = { name: { first: string, last: string } }`,
 *
 * `PathMatchingValue<Values, string> = "name.first" | "name.last"`
 */
export type PathMatchingValue<Value, Values> =
  object extends Values
    ? any
    // infer individual paths
    : StringOnlyPathOf<Values> extends (infer Path)
      // reapply constraint
      ? Path extends StringOnlyPathOf<Values>
        ? ValueMatchingPath<Values, Path> extends Value
          ? RenumerateTemplate<Path> & PathOf<Values>
          : never
        : never
      : never;

/**
 * Recursively convert objects to tuples, like:
 *
 * `{ name: { first: string } }` -> `['name'] | ['name', 'first']`
 */
type RecursivelyTuplePaths<Values> = Values extends (infer SingleValue)[]
  ?
    // we'll add a special case for numbers, so we can rebuild them with 0s
    | ["0"]
    | ["0", ...RecursivelyTuplePaths<SingleValue>]
    | [number]
    | [number, ...RecursivelyTuplePaths<SingleValue>]
  : Values extends Record<string, any>
    ?
      | [keyof Values]
      | {
          [Key in keyof Values]: [Key, ...RecursivelyTuplePaths<Values[Key]>]
        }[Extract<keyof Values, string>]
    : [];

/**
 * Flatten tuples created by RecursivelyTupleKeys into a union of paths, like:
 *
 * `['name'] | ['name', 'first' ] -> 'name' | 'name.first'`
 */
type FlattenPathTuples<
  PathTuples extends any[], ValidSubtypes extends string | number = string | number
> = PathTuples extends []
  ? never
  : PathTuples extends [infer SinglePath]
    ? SinglePath extends ValidSubtypes
      ? `${SinglePath}`
      : never
    : PathTuples extends [infer Prefix, ...infer Rest]
      ? Prefix extends ValidSubtypes
        ? `${Prefix}.${FlattenPathTuples<Extract<Rest, ValidSubtypes[]>>}`
        : never
      : string;

/**
 * Get Paths of a given `Values` WITHOUT template literals like `path.${number}`
 *
 * @see https://github.com/microsoft/TypeScript/issues/43907
 */
type StringOnlyPathOf<Values> = object extends Values
  ? any
  : FlattenPathTuples<RecursivelyTuplePaths<Values>, string> & PathOf<Values>;

/**
 * Replace `StringOnlyPathOf<Values>` with template literals where necessary.
 *
 * We can remove this when the PR listed below lands.
 *
 * @see https://github.com/microsoft/TypeScript/issues/43907
 */
type RenumerateTemplate<Path extends string> = string extends Path
  ? any
  : Path extends `0.${infer NextPath}`
    ? `${number}.${RenumerateTemplate<NextPath>}`
    : Path extends `${infer Prefix}.${infer NextPath}`
      ? `${Prefix}.${RenumerateTemplate<NextPath>}`
      : Path extends `0`
        ? `${number}`
        : Path;
