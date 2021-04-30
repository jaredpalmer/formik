import React from "react";
import {
    FieldAsProps,
    FieldComponentProps,
    Field,
    FieldRenderFunction,
    FieldRenderProps,
    TypedAsField,
    TypedComponentField,
    PathMatchingValue,
    RecursivelyTuplePaths,
    FieldComponentClass,
    FieldConfig,
    CustomField,
    useTypedField,
    useCustomField,
    ValueMatchingPath,
    AllPaths,
    PathOf,
    StringOnlyPathOf
} from "../src";

type BasePerson = {
  name: {
    first: string,
    last: string,
  },
  motto: string,
  nicknames: string[],
  age: number,
  favoriteNumbers: number[];
  rootStrPath: "rootStrValue";
  arrayStrPath: ("arrayStrValue")[];
}

type Person = BasePerson & {
  partner: BasePerson;
  friends: BasePerson[];
}

const proplessFC = () => null;
const propsAnyFC = (props: any) => props ? null : null;
class PropsAnyClass extends React.Component<any> {
  render() {
    return this.props.what ? null : null;
  }
}
const asAnyFC = (props: FieldAsProps<any, any>) => !!props.onChange && null;
const componentAnyFC =
  (props: FieldComponentProps<any, any>) => !!props.field.onChange && null;

const renderAnyFn: FieldRenderFunction<any, any> =
  (props) => props.meta.value ? null : null;

const asNumberFC: TypedAsField<number> =
  (props) => props.value ? null : null;

const asStringFC: TypedAsField<string> =
  (props) => props.value ? null : null;

class AsNumberClass<Values> extends React.Component<FieldAsProps<number, Values>> {
  render() {
    return this.props.value ? null : null;
  }
}
const componentNumberFC: TypedComponentField<number> =
  (props) => props.field ? null : null;
const partialPropsFC = (props: {name: string}) => props.name ? null : null;
class ComponentNumberClass extends FieldComponentClass<number> {
  render() {
    return this.props.value ? null : null;
  }
}
class PartialPropsClass extends React.Component<{name: string}> {
  render() {
    return this.props.name ? null : null;
  }
}
const renderNumberFN = <Value, Values>(
  props: FieldRenderProps<Value, Values>
) => props.meta.value ? null : null;

const CustomNumberFC: CustomField<number> = <Values,>(
  props: FieldConfig<number, Values>
) => {
  const InnerTypedField = useTypedField<Values>();

  return <>
    <InnerTypedField name={props.name} format={value => {}} />
    <InnerTypedField
      name={props.name}
      as={asNumberFC}
    />
    <InnerTypedField
      name={props.name}
      as={asAnyFC}
    />
    <InnerTypedField
      name={props.name}
      /** @ts-expect-error value must match `number` */
      as={asStringFC}
    />
  </>
}

const fieldTests = (props: FieldConfig<"age", Person>) => {
  const TypedField = useTypedField<Person>();
  const TypedNumberFC = useCustomField<Person>()(CustomNumberFC);

  return <>
    {/* Default */}
    <Field name="age" />
    <TypedField name="age" />
    <TypedField name="favoriteNumbers.0" value={0} />
    <TypedField name="friends.0.name.first" />

    <Field name="aeg" />
    {/* @ts-expect-error name doesn't match PathOf<Values> */}
    <TypedField name="aeg" />
    {/* @ts-expect-error name doesn't match PathOf<Values> */}
    <TypedField name="bestFriends.NOPE.name.first" />

    <Field name="age" format={(value: string) => {}} />
    <TypedField name="age" format={(value: number) => {}} />
    {/* @ts-expect-error TypedField must match value */}
    <TypedField name="age" format={(value: string) => {}} />

    <Field name="age" aria-required={true} />
    <TypedField name="age" aria-required={true} />
    <TypedField name="friends.0.name.first" aria-required={true} />

    {/* @ts-expect-error name doesn't match PathOf<Values> */}
    <TypedField name="friends.0.age" aria-required={true} value="" />

    {/* FieldAsString */}
    <Field name="age" as="select" />

    {/* FieldStringComponent */}
    <Field name="age" component="select" />
    <TypedField name="age" component="select" />

    {/* FieldAsComponent */}
    <Field name="age" as={proplessFC} />
    <TypedField name="age" as={proplessFC} />
    <Field name="age" as={propsAnyFC} />
    <TypedField name="age" as={propsAnyFC} />
    <Field name="age" as={PropsAnyClass} />
    <Field name="age" as={partialPropsFC} />
    <Field name="age" as={PartialPropsClass} />

    <Field name="age" as={asAnyFC} />
    <Field name="age" as={asNumberFC} />
    <TypedField name="age" as={asNumberFC} />
    <Field name="age" as={asAnyFC}><div /></Field>
    <Field name="age" as={asNumberFC}><div /></Field>
    <TypedField name="age" as={asNumberFC}><div /></TypedField>
    <Field name="age" as={AsNumberClass} />
    <TypedField name="age" as={AsNumberClass} />

    <TypedField name="age" as={PropsAnyClass} />
    <TypedField name="age" as={PartialPropsClass} />

    {/* @ts-expect-error field value should match */}
    <TypedField name="motto" as={asNumberFC} />
    {/* @ts-expect-error field value should match */}
    <TypedField name="motto" as={AsNumberClass} />

    {/* FieldComponent */}
    <Field name="age" component={proplessFC} />
    <TypedField name="age" component={proplessFC} />
    <Field name="age" component={propsAnyFC} />
    <TypedField name="age" component={propsAnyFC} />
    <Field name="age" component={PropsAnyClass} />
    <Field name="age" component={partialPropsFC} />
    <Field name="age" component={PartialPropsClass} />
    <Field name="age" component={componentAnyFC} />
    <Field name="age" component={componentNumberFC} />
    <TypedField name="age" component={componentNumberFC} />
    <Field name="age" component={componentAnyFC}><div /></Field>
    <Field name="age" component={componentNumberFC}><div /></Field>
    <TypedField name="age" component={componentNumberFC}><div /></TypedField>
    <TypedField name="age" component={PropsAnyClass} />
    <TypedField name="age" component={PartialPropsClass} />
    <Field name="age" component={ComponentNumberClass} />
    <TypedField name="age" component={ComponentNumberClass} />

    {/* @ts-expect-error field value should match */}
    <TypedField name="motto" component={componentNumberFC} />
    {/* @ts-expect-error field value should match */}
    <TypedField name="motto" component={ComponentNumberClass} />

    {/* FieldRender */}
    <Field name="age" render={renderAnyFn} />
    {/* @ts-expect-error render function doesn't have child component */}
    <Field name="age" render={renderAnyFn}><div /></Field>

    {/* FieldChildren */}
    <Field name="age" children={renderAnyFn} />
    <Field name="age">{renderAnyFn}</Field>

    {/* Pass-Through Props */}
    <Field<any, any> {...props} />
    <Field {...props} />

    {/* FieldRender */}
    <TypedField name="age" render={renderNumberFN} />
    {/* @ts-expect-error render function doesn't have child component */}
    <TypedField name="age" render={renderNumberFN}><div /></TypedField>

    {/* FieldChildren */}
    <TypedField name="age" children={renderNumberFN} />
    <TypedField name="age">{renderNumberFN}</TypedField>

    {/* Pass-Through Props */}
    <TypedField {...props} />

    {/* Custom Fields */}
    {/* Untyped Custom Fields can have anything */}
    <CustomNumberFC name="age" format={value => {}} />
    <TypedNumberFC name="age" format={value => {}} />
    <CustomNumberFC name="motto" />
    {/* @ts-expect-error field value should match */}
    <TypedNumberFC name="motto" />
  </>
}

// Not implemented
//
// class ClassComponentWithOnlyExtra extends React.Component<{ what: true }> {
//   render() {
//     return this.props.what ? null : null;
//   }
// }
// const componentNumberFCWithExtra: TypedComponentField<number> =
// (props) => props.field ? null : null;
// const overlappingPropsFCWithExtra = (props: {name: string, what: true}) => props.name && props.what ? null : null;
// class ComponentNumberClassWithExtra<Values> extends React.Component<
//   FieldComponentProps<number, Values>
// > {
//   render() {
//     return this.props.value ? null : null;
//   }
// }
// class OverlappingPropsClassWithExtra extends React.Component<{name: string, what: true}> {
//   render() {
//     return this.props.name ? null : null;
//   }
// }
// const featuresNotImplemented = () =>
//   <>
//     {/*
//       * all the events below should be inferred,
//       * but can't because of GenericInputHTMLAttributes
//       */}
//     <Field name="test" onInput={event => {}} />
//     <Field name="test" as="select" onInput={event => {}} />
//     <Field name="test" component="select" onInput={event => {}} />
//     <TypedField name="age" onInput={event => {}} />
//     <TypedField name="age" as="select" onInput={event => {}} />
//     <TypedField name="age" component="select" onInput={event => {}} />

//     {/*
//       * haven't figured out how to enforce no extra props when they don't exist
//       */}
//     {/* @ts-expect-error elements shouldn't have extraProps */}
//     <Field name="test" what={true} />
//     {/* @ts-expect-error propless components don't have extraProps */}
//     <Field name="test" as={proplessFC} what={true} />
//     {/* @ts-expect-error propless components don't have extraProps */}
//     <Field name="test" component={proplessFC} what={true} />
//     {/* @ts-expect-error elements don't have extraProps */}
//     <TypedField name="age" what={true} />
//     {/* @ts-expect-error propless components don't have extraProps */}
//     <TypedField name="age" as={proplessFC} what={true} />
//     {/* @ts-expect-error propless components don't have extraProps */}
//     <TypedField name="age" component={proplessFC} what={true} />


//     {/*
//       * Gave up on ExtraProps for now
//       */}
//     {/* @ts-expect-error elements don't have extraProps */}
//     <Field name="age" as="select" what={true} />
//     {/* @ts-expect-error elements don't have extraProps */}
//     <TypedField name="age" as="select" what={true} />
//     {/* @ts-expect-error elements don't have extraProps */}
//     <Field name="age" component="select" what={true} />
//     {/* @ts-expect-error elements don't have extraProps */}
//     <TypedField name="age" component="select" what={true} />
//     <Field name="age" as={propsAnyFC} what={true} />
//     <TypedField name="age" as={propsAnyFC} what={true} />
//     <TypedField name="age" as={overlappingPropsFCWithExtra} what={true} />
//     <Field name="age" as={OverlappingPropsClassWithExtra} what={true} />
//     <TypedField name="age" as={OverlappingPropsClassWithExtra} what={true} />
//     <Field name="age" as={PropsAnyClass} what={true} />
//     <TypedField name="age" as={PropsAnyClass} what={true} />
//     <Field name="age" as={componentWithOnlyExtra} what={true} />
//     <TypedField name="age" as={componentWithOnlyExtra} what={true} />
//     <Field name="age" as={ClassComponentWithOnlyExtra} what={true} />
//     <TypedField name="age" as={ClassComponentWithOnlyExtra} what={true} />
//     <Field name="age" as={asComponentWithExtra} what={true} />
//     <Field name="age" as={typedAsComponentWithExtra} what={true} />
//     <TypedField name="age" as={typedAsComponentWithExtra} what={true} />
//     <Field name="age" as={AsComponentClassWithExtra} what={true} />
//     <TypedField name="age" as={AsComponentClassWithExtra} what={true} />

//     {/* @ts-expect-error extraProps should match */}
//     <Field name="age" as={asComponentWithExtra} what={false} />
//     {/* @ts-expect-error extraProps should match */}
//     <Field name="age" as={componentWithOnlyExtra} what={false} />
//     {/* @ts-expect-error extraProps should match */}
//     <TypedField name="age" as={asComponentWithExtra} what={false} />
//     {/* @ts-expect-error extraProps is required */}
//     <TypedField name="age" as={typedAsComponentWithExtra} />
//     {/* @ts-expect-error extraProps is required */}
//     <TypedField name="age" as={TypedAsComponentClassWithExtra} />
//     {/* @ts-expect-error extraProps is required */}
//     <TypedField name="age" as={TypedAsComponentClassWithExtra} what={false} />
//     {/* @ts-expect-error extraProps should match */}
//     <TypedField name="age" as={asComponentWithOnlyExtra} what={false} />

//     <Field name="age" component={propsAnyFC} what={true} />
//     <TypedField name="age" component={propsAnyFC} what={true} />
//     <Field name="age" component={PropsAnyClass} what={true} />
//     <TypedField name="age" component={PropsAnyClass} what={true} />
//     <TypedField name="age" component={overlappingPropsFCWithExtra} what={true} />
//     <Field name="age" component={OverlappingPropsClassWithExtra} what={true} />
//     <TypedField name="age" component={OverlappingPropsClassWithExtra} what={true} />
//     <Field name="age" component={componentWithOnlyExtra} what={true} />
//     <TypedField name="age" component={componentWithOnlyExtra} what={true} />
//     <Field name="age" component={ClassComponentWithOnlyExtra} what={true} />
//     <TypedField name="age" component={ClassComponentWithOnlyExtra} what={true} />
//     <Field name="age" component={componentWithExtra} what={true} />
//     <Field name="age" component={componentNumberFCWithExtra} what={true} />
//     <TypedField name="age" component={componentNumberFCWithExtra} what={true} />
//     <Field name="age" component={ComponentNumberClassWithExtra} what={true} />
//     <TypedField name="age" component={ComponentNumberClassWithExtra} what={true} />
//     {/* @ts-expect-error extraProps is required */}
//     <TypedField name="age" component={typedComponentComponentWithExtra} />
//     {/* @ts-expect-error extraProps is required */}
//     <TypedField name="age" component={TypedComponentClassWithExtra} />
//     {/* @ts-expect-error extraProps should match */}
//     <Field name="age" component={componentWithExtra} what={false} />
//     {/* @ts-expect-error extraProps should match */}
//     <Field name="age" component={componentWithOnlyExtra} what={false} />
//     {/* @ts-expect-error extraProps should match */}
//     <TypedField name="age" component={componentWithExtra} what={false} />
//     {/* @ts-expect-error extraProps should match */}
//     <TypedField name="age" component={componentWithOnlyExtra} what={false} />

//     {/* @ts-expect-error extraProps should match */}
//     <Field<any, any, {what: false}> {...props} />
//     {/* @ts-expect-error extraProps should match */}
//     <TypedField<any, any, {what: false}> {...props} />
//   </>

const basePerson: BasePerson = {
  name: {
    first: "",
    last: "",
  },
  motto: "",
  nicknames: [""],
  age: 21,
  favoriteNumbers: [1],
  rootStrPath: "rootStrValue",
  arrayStrPath: ["arrayStrValue"],
}

const person: Person = {
  ...basePerson,
  partner: basePerson,
  friends: [
    basePerson,
    basePerson
  ]
};

const strMatches: PathMatchingValue<string, Person> = "motto";
const strsMatches: PathMatchingValue<string[], Person> = "nicknames";
const str1Matches: PathMatchingValue<string, Person> = "nicknames.1";
const numMatches: PathMatchingValue<number, Person> = "age";
const numsMatches: PathMatchingValue<number[], Person> = "favoriteNumbers";
const num1Matches: PathMatchingValue<number, Person> = "favoriteNumbers.1";
const objMatches: PathMatchingValue<BasePerson, Person> = "partner";
const objstrMatches: PathMatchingValue<string, Person> = "partner.motto";
const objstrsMatches: PathMatchingValue<string[], Person> = "partner.nicknames";
const objstr1Matches: PathMatchingValue<string, Person> = "partner.nicknames.1";
const objnumMatches: PathMatchingValue<number, Person> = "partner.age";
const objnumsMatches: PathMatchingValue<number[], Person> = "partner.favoriteNumbers";
const objnum1Matches: PathMatchingValue<number, Person> = "partner.favoriteNumbers.1";
const obj1Matches: PathMatchingValue<BasePerson, Person> = "friends.1";
const obj1strMatches: PathMatchingValue<string, Person> = "friends.1.motto";
const obj1numMatches: PathMatchingValue<number, Person> = "friends.1.age";
const obj1numsMatches: PathMatchingValue<number[], Person> = "friends.1.favoriteNumbers";
const obj1num1Matches: PathMatchingValue<number, Person> = "friends.1.favoriteNumbers.1";

// @ts-expect-error
const strFails: PathMatchingValue<number, Person> = "motto";
// @ts-expect-error
const strsFails: PathMatchingValue<number, Person[]> = "nicknames";

// @ts-expect-error paths aren't assignable to values that don't exist
const invalidValueFails: PathMatchingValue<"notARealValue", Person> = "partner.age";
// @ts-expect-error unexpected paths aren't assignable to invalid values
const invalidPathFailsForInvalidValue: PathMatchingValue<"notARealValue", Person> = "notARealPath";
// @ts-expect-error unexpected paths aren't assignable to invalid values
const invalidArrayPathFailsForInvalidValue: PathMatchingValue<"notARealValue", Person> = "friends.1";

// @ts-expect-error
const str1Fails: PathMatchingValue<number, Person> = "nicknames.1";
// @ts-expect-error
const numFails: PathMatchingValue<string, Person> = "age";
// @ts-expect-error
const numsFails: PathMatchingValue<string[], Person> = "favoriteNumbers";
// @ts-expect-error
const num1Fails: PathMatchingValue<string, Person> = "favoriteNumbers.1";
// @ts-expect-error
const objFails: PathMatchingValue<Person, Person> = "partner";
// @ts-expect-error
const objstrFails: PathMatchingValue<number, Person> = "partner.motto";
// @ts-expect-error
const objstrsFails: PathMatchingValue<number, Person[]> = "partner.nicknames";
// @ts-expect-error
const objstr1Fails: PathMatchingValue<number, Person> = "partner.nicknames.1";
// @ts-expect-error
const objnumFails: PathMatchingValue<string, Person> = "partner.age";
// @ts-expect-error
const objnumsFails: PathMatchingValue<string[], Person> = "partner.favoriteNumbers";
// @ts-expect-error
const objnum1Fails: PathMatchingValue<string, Person> = "partner.favoriteNumbers.1";
// @ts-expect-error
const obj1Fails: PathMatchingValue<Person, Person> = "friends.1";
// @ts-expect-error
const obj1strFails: PathMatchingValue<number, Person> = "friends.1.motto";
// @ts-expect-error
const obj1numFails: PathMatchingValue<string, Person> = "friends.1.age";
// @ts-expect-error
const obj1numsFails: PathMatchingValue<string[], Person> = "friends.1.favoriteNumbers";
// @ts-expect-error
const obj1num1Fails: PathMatchingValue<string, Person> = "friends.1.favoriteNumbers.1";

type TinyTest = {
  favoriteNumbers: number[];
}

const recursivelyTupledKeys: RecursivelyTuplePaths<TinyTest>[] = [
  ["favoriteNumbers"],
  ["favoriteNumbers", "0"],
  ["favoriteNumbers", 0],
];

// simple path
let allTuples: RecursivelyTuplePaths<TinyTest> | undefined;
let pathOf: PathOf<TinyTest> | undefined;
let pathOfS: StringOnlyPathOf<TinyTest> | undefined;
let allPaths: AllPaths<TinyTest> | undefined;
let allValues: ValueMatchingPath<TinyTest, AllPaths<TinyTest>>;
let strongValue: ValueMatchingPath<Person, "rootStrPath"> | undefined;
let rootStrPath: PathMatchingValue<"rootStrValue", Person> | undefined;
let arrayStrPath: PathMatchingValue<"arrayStrValue", Person> | undefined = "arrayStrPath.1";
// @ts-expect-error
let arrayStrPathFails: PathMatchingValue<"arrayStrValue", Person> | undefined = "friends.1";
let arrayRootValue: ValueMatchingPath<Person['arrayStrPath'], '1'> | undefined;

// @ts-expect-error
const strongFails: PathMatchingValue<"valid", Person> = "weak";
// @ts-expect-error array values aren't assignable to unexpected paths
const invalidPathFails: PathMatchingValue<"notARealValue", Person> = "partner.nicknames.1";
