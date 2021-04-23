import React from "react";
import {
    FieldConfig,
    FieldAsProps,
    FieldComponentProps,
    Field,
    FieldAsComponentConfig,
    FieldAsStringConfig,
    FieldComponentConfig,
    FieldRenderFunction,
    FieldStringComponentConfig,
    FieldValue,
    SingleValue,
    createTypedField,
    NameOf,
    FieldRenderProps,
    FieldRenderConfig,
    FieldChildrenConfig,
    TypedAsField,
    TypedComponentField,
    MatchField,
    RecursivelyTupleKeys
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
}

type Person = BasePerson & {
  partner: BasePerson;
  friends: BasePerson[];
}

/**
 * FieldConfig Tests
 */
let configTest: FieldConfig<any, any, { what: true }> | undefined = undefined;
// AsString
const fieldAsString: FieldAsStringConfig<any, any, any> = {} as any;
fieldAsString.as = 'input';
fieldAsString.onInput = (event) => {};
configTest = {
  as: "input",
  name: '',
  onInput: (e) => {},
};
// AsComponent
const fieldAsConfig: FieldAsComponentConfig<any, any, { what: true }> = {} as any;
fieldAsConfig.as = (props) => props.what && null;
configTest = {
  as: fieldAsConfig.as,
  name: '',
  what: true,
};
// AsComponent + Extra
const fieldAsExtraConfig: FieldAsComponentConfig<any, any, { what: true }> = {} as any;
fieldAsExtraConfig.as = (props) => props.what && null;
configTest = {
  as: fieldAsExtraConfig.as,
  name: '',
  what: true,
};
// StringComponent
const fieldStringComponent: FieldStringComponentConfig<any, any> = {} as any;
fieldStringComponent.component = 'input';
fieldStringComponent.onInput = (event) => {};
configTest = {
  component: "input",
  name: '',
}
// ComponentComponent
const fieldComponentConfig: FieldComponentConfig<any, any, { what: true }> = {} as any;
fieldComponentConfig.component = (props) => props.what && props.field.value ? null : null;

// ComponentComponent
configTest = {
  component: fieldComponentConfig.component,
  name: '',
  what: true,
};

// ComponentComponent
const fieldComponentWithExtraConfig: FieldComponentConfig<any, any, { what: true }> = {} as any;
fieldComponentWithExtraConfig.component = (props) => props.what && props.field.value ? null : null;

const fieldComponentWithExtra: FieldComponentConfig<any, any, { what: true }> = {} as any;
fieldComponentWithExtra.component = (props) => props.what && null;
configTest = {
  component: fieldComponentWithExtra.component,
  name: '',
  what: true,
};

// RenderFunction
const fieldRenderConfig: FieldRenderConfig<any, any> = {} as any;
fieldRenderConfig.render = (props) => !!props.field.onChange && null;
configTest = {
  name: '',
  render: fieldRenderConfig.render,
};
// ChildrenFunction
const fieldChildrenConfig: FieldChildrenConfig<any, any> = {} as any;
fieldChildrenConfig.children = (props) => !!props.field.onChange && null
configTest = {
  name: '',
  children: fieldChildrenConfig.children,
};
// DefaultConfig
configTest = {
  name: '',
};

const TypedField = createTypedField<Person>();

const proplessComponent = () => null;
const propsAnyComponent = (props: any) => props ? null : null;
class PropsAnyClassComponent extends React.Component<any> {
  render() {
    return this.props.what ? null : null;
  }
}
const componentWithOnlyExtra = (props: { what: true }) => !!props.what ? null : null;
class ClassComponentWithOnlyExtra extends React.Component<{ what: true }> {
  render() {
    return this.props.what ? null : null;
  }
}

const asComponent = (props: FieldAsProps) => !!props.onChange && null;
const asComponentWithExtra =
  (props: FieldAsProps<any, any, any, { what: true }>) => !!props.onChange && null;

const componentComponent =
  (props: FieldComponentProps<any, any, any, {}>) => !!props.field.onChange && null;
const componentWithExtra =
  (props: FieldComponentProps<any, any, any, { what: true }>) =>
    !!props.field.onChange && null;

const renderFunction: FieldRenderFunction<any, any> =
  (props) => props.meta.value ? null : null;

const typedAsComponent: TypedAsField<number, {}> =
  (props) => props.value ? null : null;
const typedAsComponentWithExtra: TypedAsField<number, { what: true }> =
  (props) => !!props.onChange && null;
class AsComponentClass extends React.Component<FieldAsProps<number, any, any, {}>> {
  render() {
    return this.props.value ? null : null;
  }
}
class AsComponentClassWithExtra extends React.Component<
  FieldAsProps<number, any, any, { what: true }>
> {
  render() {
    return this.props.value && this.props.what ? null : null;
  }
}
const typedComponentComponent: TypedComponentField<number, {}> =
  (props) => props.field ? null : null;
const typedComponentWithExtra: TypedComponentField<number, { what: true }> =
  (props) => props.field ? null : null;
const componentOverlapping = (props: {name: string}) => props.name ? null : null;
const componentOverlappingWithExtra = (props: {name: string, what: true}) => props.name && props.what ? null : null;
class ClassComponent extends React.Component<FieldComponentProps<number, any, any, {}>> {
  render() {
    return this.props.value ? null : null;
  }
}
class ClassComponentWithExtra extends React.Component<
  FieldComponentProps<number, any, any, { what: true }>
> {
  render() {
    return this.props.value && this.props.what ? null : null;
  }
}
class ClassComponentOverlapping extends React.Component<{name: string}> {
  render() {
    return this.props.name ? null : null;
  }
}
class ClassComponentOverlappingExtra extends React.Component<{name: string, what: true}> {
  render() {
    return this.props.name ? null : null;
  }
}
const typedRenderFunction = <Values, Path extends NameOf<Values>>(
  props: FieldRenderProps<Values, Path>
) => props.meta.value ? null : null;

const fieldTests = (props: FieldConfig<Person, "age", {what: true}>) =>
  <>
    {/* Default */}
    <Field name="age" />
    <TypedField name="age" />
    <TypedField name="favoriteNumbers.0" format={value => {}} />
    <TypedField name="friends.0" format={value => {}} />
    <TypedField name="friends.0.name.first" />
    {/* @ts-expect-error name doesn't match NameOf<Values> */}
    <TypedField name="aeg" />
    {/* @ts-expect-error name doesn't match NameOf<Values> */}
    <TypedField name="bestFriends.NOPE.name.first" />

    <Field name="age" aria-required={true} />
    <TypedField name="age" aria-required={true} />
    <TypedField name="friends.0.name.first" aria-required={true} />

    {/* FieldAsString */}
    <Field name="age" as="select" />
    {/* @ts-expect-error elements don't have extraProps */}
    <Field name="age" as="select" what={true} />
    {/* @ts-expect-error elements don't have extraProps */}
    <TypedField name="age" as="select" what={true} />

    {/* FieldStringComponent */}
    <Field name="age" component="select" />
    <TypedField name="age" component="select" />
    {/* @ts-expect-error elements don't have extraProps */}
    <Field name="age" component="select" what={true} />
    {/* @ts-expect-error elements don't have extraProps */}
    <TypedField name="age" component="select" what={true} />

    {/* FieldAsComponent */}
    <Field name="age" as={proplessComponent} />
    <TypedField name="age" as={proplessComponent} />
    <Field name="age" as={propsAnyComponent} />
    <TypedField name="age" as={propsAnyComponent} />
    <Field name="age" as={propsAnyComponent} what={true} />
    <TypedField name="age" as={propsAnyComponent} what={true} />
    <Field name="age" as={PropsAnyClassComponent} />
    <TypedField name="age" as={PropsAnyClassComponent} />
    <Field name="age" as={componentOverlapping} />
    <TypedField name="age" as={componentOverlappingWithExtra} what={true} />
    <Field name="age" as={ClassComponentOverlapping} />
    <TypedField name="age" as={ClassComponentOverlapping} />
    <Field name="age" as={ClassComponentOverlappingExtra} what={true} />
    <TypedField name="age" as={ClassComponentOverlappingExtra} what={true} />
    <Field name="age" as={PropsAnyClassComponent} what={true} />
    <TypedField name="age" as={PropsAnyClassComponent} what={true} />
    <Field name="age" as={componentWithOnlyExtra} what={true} />
    <TypedField name="age" as={componentWithOnlyExtra} what={true} />
    <Field name="age" as={ClassComponentWithOnlyExtra} what={true} />
    <TypedField name="age" as={ClassComponentWithOnlyExtra} what={true} />

    <Field name="age" as={asComponent} />
    <Field name="age" as={typedAsComponent} />
    <TypedField name="age" as={typedAsComponent} />
    <Field name="age" as={asComponent}><div /></Field>
    <Field name="age" as={typedAsComponent}><div /></Field>
    <TypedField name="age" as={typedAsComponent}><div /></TypedField>
    <Field name="age" as={AsComponentClass} />
    <TypedField name="age" as={AsComponentClass} />
    <Field name="age" as={asComponentWithExtra} what={true} />
    <Field name="age" as={typedAsComponentWithExtra} what={true} />
    <TypedField name="age" as={typedAsComponentWithExtra} what={true} />
    <Field name="age" as={AsComponentClassWithExtra} what={true} />
    <TypedField name="age" as={AsComponentClassWithExtra} what={true} />

    {/* @ts-expect-error extraProps should match */}
    <Field name="age" as={asComponentWithExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <Field name="age" as={componentWithOnlyExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <TypedField name="age" as={asComponentWithExtra} what={false} />
    <TypedField name="motto" as={typedAsComponent} />
    {/* @ts-expect-error extraProps is required */}
    <TypedField name="age" as={typedAsComponentWithExtra} />
    {/* @ts-expect-error extraProps is required */}
    <TypedField name="age" as={TypedAsComponentClassWithExtra} />
    {/* @ts-expect-error extraProps is required */}
    <TypedField name="age" as={TypedAsComponentClassWithExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <TypedField name="age" as={asComponentWithOnlyExtra} what={false} />

    {/* FieldComponent */}
    <Field name="age" component={proplessComponent} />
    <TypedField name="age" component={proplessComponent} />
    <Field name="age" component={propsAnyComponent} />
    <TypedField name="age" component={propsAnyComponent} />
    <Field name="age" component={propsAnyComponent} what={true} />
    <TypedField name="age" component={propsAnyComponent} what={true} />
    <Field name="age" component={PropsAnyClassComponent} />
    <TypedField name="age" component={PropsAnyClassComponent} />
    <Field name="age" component={PropsAnyClassComponent} what={true} />
    <TypedField name="age" component={PropsAnyClassComponent} what={true} />
    <Field name="age" component={componentOverlapping} />
    <TypedField name="age" component={componentOverlappingWithExtra} what={true} />
    <Field name="age" component={ClassComponentOverlapping} />
    <TypedField name="age" component={ClassComponentOverlapping} />
    <Field name="age" component={ClassComponentOverlappingExtra} what={true} />
    <TypedField name="age" component={ClassComponentOverlappingExtra} what={true} />
    <Field name="age" component={componentWithOnlyExtra} what={true} />
    <TypedField name="age" component={componentWithOnlyExtra} what={true} />
    <Field name="age" component={ClassComponentWithOnlyExtra} what={true} />
    <TypedField name="age" component={ClassComponentWithOnlyExtra} what={true} />

    <Field name="age" component={componentComponent} />
    <Field name="age" component={typedComponentComponent} />
    <TypedField name="age" component={typedComponentComponent} />
    <Field name="age" component={componentComponent}><div /></Field>
    <Field name="age" component={typedComponentComponent}><div /></Field>
    <TypedField name="age" component={typedComponentComponent}><div /></TypedField>
    <Field name="age" component={ClassComponent} />
    <TypedField name="age" component={ClassComponent} />
    <Field name="age" component={componentWithExtra} what={true} />
    <Field name="age" component={typedComponentWithExtra} what={true} />
    <TypedField name="age" component={typedComponentWithExtra} what={true} />
    <Field name="age" component={ClassComponentWithExtra} what={true} />
    <TypedField name="age" component={ClassComponentWithExtra} what={true} />

    {/* @ts-expect-error extraProps should match */}
    <Field name="age" component={componentWithExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <Field name="age" component={componentWithOnlyExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <TypedField name="age" component={componentWithExtra} what={false} />
    {/* @ts-expect-error value type should match */}
    <TypedField name="motto" component={typedComponentComponent} />
    {/* @ts-expect-error extraProps is required */}
    <TypedField name="age" component={typedComponentComponentWithExtra} />
    {/* @ts-expect-error extraProps is required */}
    <TypedField name="age" component={TypedComponentClassWithExtra} />
    {/* @ts-expect-error extraProps should match */}
    <TypedField name="age" component={componentWithOnlyExtra} what={false} />

    {/* FieldRender */}
    <Field name="age" render={renderFunction} />
    {/* @ts-expect-error render function doesn't have child component */}
    <Field name="age" render={renderFunction}><div /></Field>

    {/* FieldChildren */}
    <Field name="age" children={renderFunction} />
    <Field name="age">{renderFunction}</Field>

    {/* Pass-Through Props */}
    <Field<any, any, {what: true}> {...props} />
    <Field {...props} />
    {/* @ts-expect-error extraProps should match */}
    <Field<any, any, {what: false}> {...props} />

    {/* FieldRender */}
    <TypedField name="age" render={typedRenderFunction} />
    {/* @ts-expect-error render function doesn't have child component */}
    <TypedField name="age" render={typedRenderFunction}><div /></TypedField>

    {/* FieldChildren */}
    <TypedField name="age" children={typedRenderFunction} />
    <TypedField name="age">{typedRenderFunction}</TypedField>

    {/* Pass-Through Props */}
    <TypedField<any, {what: true}> {...props} />
    <TypedField {...props} />
    {/* @ts-expect-error extraProps should match */}
    <TypedField<any, any, {what: false}> {...props} />
  </>

const featuresNotImplemented = () =>
  <>
    {/*
      * all the events below should be inferred,
      * but can't because of GenericInputHTMLAttributes
      */}
    <Field name="test" onInput={event => {}} />
    <Field name="test" as="select" onInput={event => {}} />
    <Field name="test" component="select" onInput={event => {}} />
    <TypedField name="age" onInput={event => {}} />
    <TypedField name="age" as="select" onInput={event => {}} />
    <TypedField name="age" component="select" onInput={event => {}} />

    {/*
      * haven't figured out how to enforce no extra props when they don't exist
      */}
    {/* @ts-expect-error elements shouldn't have extraProps */}
    <Field name="test" what={true} />
    {/* @ts-expect-error propless components don't have extraProps */}
    <Field name="test" as={proplessComponent} what={true} />
    {/* @ts-expect-error propless components don't have extraProps */}
    <Field name="test" component={proplessComponent} what={true} />
    {/* @ts-expect-error elements don't have extraProps */}
    <TypedField name="age" what={true} />
    {/* @ts-expect-error propless components don't have extraProps */}
    <TypedField name="age" as={proplessComponent} what={true} />
    {/* @ts-expect-error propless components don't have extraProps */}
    <TypedField name="age" component={proplessComponent} what={true} />

    {/* @ts-expect-error class component should match type */}
    <TypedField name="motto" as={AsComponentClass} />
    {/* @ts-expect-error class component should match type */}
    <TypedField name="motto" component={ClassComponent} />
  </>

const number: FieldValue<BasePerson, "age"> | undefined = undefined;
const numberArray: FieldValue<BasePerson, "favoriteNumbers"> | undefined = undefined;
const singleNumber: SingleValue<FieldValue<BasePerson, "favoriteNumbers">> | undefined = undefined;
const singleNumberInferrer = () =>
  <TypedField
    name="favoriteNumbers"
    component={(props) => null}
    // @ts-expect-error
    value=""
  />;

const basePerson: BasePerson = {
  name: {
    first: "",
    last: "",
  },
  motto: "",
  nicknames: [""],
  age: 21,
  favoriteNumbers: [1],
}

const person: Person = {
  ...basePerson,
  partner: basePerson,
  friends: [
    basePerson,
    basePerson
  ]
};

const str: FieldValue<Person, "motto"> = person.motto;
const strs: FieldValue<Person, "nicknames"> = person.nicknames;
const str1: FieldValue<Person, "nicknames.1"> = person.nicknames[1];
const num: FieldValue<Person, "age"> = person.age;
const nums: FieldValue<Person, "favoriteNumbers"> = person.favoriteNumbers;
const num1: FieldValue<Person, "favoriteNumbers.1"> = person.favoriteNumbers[1];
const obj: FieldValue<Person, "partner"> = person.partner;
const objstr: FieldValue<Person, "partner.motto"> = person.partner.motto;
const objstrs: FieldValue<Person, "partner.nicknames"> = person.partner.nicknames;
const objstr1: FieldValue<Person, "partner.nicknames.1"> = person.partner.nicknames[1];
const objnum: FieldValue<Person, "partner.age"> = person.partner.age;
const objnums: FieldValue<Person, "partner.favoriteNumbers"> = person.partner.favoriteNumbers;
const objnum1: FieldValue<Person, "partner.favoriteNumbers.1"> = person.partner.favoriteNumbers[1];
const obj1: FieldValue<Person, "friends.1"> = person.friends[1];
const obj1str: FieldValue<Person, "friends.1.motto"> = person.friends[1].motto;
const obj1num: FieldValue<Person, "friends.1.age"> = person.friends[1].age;
const obj1nums: FieldValue<Person, "friends.1.favoriteNumbers"> = person.friends[1].favoriteNumbers;
const obj1num1: FieldValue<Person, "friends.1.favoriteNumbers.1"> = person.friends[1].favoriteNumbers[1];

const namesOf: NameOf<Person> = "age";
const ageMatches: MatchField<Person, number> = "age";
const favoriteNumber0Matches: MatchField<Person, number> = "favoriteNumbers.0";
const partnerAgeMatches: MatchField<Person, number> = "partner.age";
const friend1AgeMatches: MatchField<Person, number> = "friends.1.age";

const recursivelyTupledKeys: RecursivelyTupleKeys<Person> = ["friends", 0, "favoriteNumbers"];
const hello: NameOf<Person> & `friends.${number}.favoriteNumbers` = "friends.1.favoriteNumbers";
type huh2 = `friends.${number}` extends NameOf<Person> ? true : false;