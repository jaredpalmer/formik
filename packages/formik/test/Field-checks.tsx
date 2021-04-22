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
    TypedComponentField
} from "../src";

type PersonValues = {
  name: {
    first: string,
    last: string,
  },
  motto: string,
  age: number,
  favoriteNumbers: number[];
}

type PersonWithFriendValues = PersonValues & {
  bestFriend: PersonValues;
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
 const proplessComponent = () => null;
 const propsAnyComponent = (props: any) => props ? null : null;
 const componentWithOnlyExtra = (props: { what: true }) => !!props.what ? null : null;
 const asComponent = (props: FieldAsProps) => !!props.onChange && null;
 const asComponentWithExtra = (props: FieldAsProps<any, any, any, { what: true }>) => !!props.onChange && null;
 const componentComponent = (props: FieldComponentProps<any, any, any, {}>) => !!props.field.onChange && null;
 const componentWithExtra = (props: FieldComponentProps<any, any, any, { what: true }>) => !!props.field.onChange && null;
 const renderFunction: FieldRenderFunction<any, any> = (props) => props.meta.value ? null : null;

 const fieldTests = (props: FieldConfig<PersonWithFriendValues, "age", {what: true}>) =>
  <>
    {/*
      * all the events below should be inferred,
      * but can't because of GenericInputHTMLAttributes
      */}
    <input onInput={event => {}} />

    {/* Default */}
    <Field name="test" onInput={event => {}} />
    {/* @ts-expect-error elements don't have extraProps */}
    <Field name="test" what={true} />

    {/* FieldAsString */}
    <Field name="test" as="select" onInput={event => {}} />
    {/* @ts-expect-error elements don't have extraProps */}
    <Field name="test" as="select" what={true} />

    {/* FieldStringComponent */}
    <Field name="test" component="select" onInput={event => {}} />
    {/* @ts-expect-error elements don't have extraProps */}
    <Field name="test" component="select" what={true} />

    {/* FieldAsComponent */}
    <Field name="test" as={proplessComponent} />
    <Field name="test" as={propsAnyComponent} />
    <Field name="test" as={propsAnyComponent} what={true} />
    <Field name="test" as={asComponent} />
    <Field name="test" as={asComponent}><div /></Field>
    <Field name="test" as={asComponentWithExtra} what={true} />
    <Field name="test" as={componentWithOnlyExtra} what={true} />

    {/* @ts-expect-error propless components don't have extraProps */}
    <Field name="test" as={proplessComponent} what={true} />
    {/* @ts-expect-error extraProps should match */}
    <Field name="test" as={asComponentWithExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <Field name="test" as={asComponentWithOnlyExtra} what={false} />

    {/* FieldComponent */}
    <Field name="test" component={proplessComponent} />
    <Field name="test" component={propsAnyComponent} />
    <Field name="test" component={propsAnyComponent} what={true} />
    <Field name="test" component={componentComponent} />
    <Field name="test" component={componentWithExtra} what={true} />
    <Field name="test" component={componentWithOnlyExtra} what={true} />

    {/* @ts-expect-error propless components don't have extraProps */}
    <Field name="test" component={proplessComponent} what={true} />
    {/* @ts-expect-error extraProps should match */}
    <Field name="test" component={componentWithExtra} what={false} />
    {/* @ts-expect-error extraProps should match */}
    <Field name="test" component={componentWithOnlyExtra} what={false} />

    {/* FieldRender */}
    <Field name="test" render={renderFunction} />
    {/* @ts-expect-error render function doesn't have child component */}
    <Field name="test" render={renderFunction}><div /></Field>

    {/* FieldChildren */}
    <Field name="test" children={renderFunction} />
    <Field name="test">{renderFunction}</Field>

    {/* Pass-Through Props */}
    <Field<any, any, {what: true}> {...props} />
    <Field {...props} />
    {/* @ts-expect-error extraProps should match */}
    <Field<any, any, {what: false}> {...props} />
  </>

const TypedField = createTypedField<PersonWithFriendValues>();
class TypedAsComponentClass extends React.Component<FieldAsProps<number, any, any, {}>> {
  render() {
    return this.props.value ? null : null;
  }
}
const typedAsComponent: TypedAsField<number, {}> = (props) => props.value ? null : null;
const typedAsComponentWithExtra: TypedAsField<number, { what: true }> = (props) => !!props.onChange && null;
class TypedAsComponentClassWithExtra extends React.Component<FieldAsProps<number, any, any, { what: true }>> {
  render() {
    return this.props.value && this.props.what ? null : null;
  }
}
const typedComponentComponent: TypedComponentField<number, {}> = (props) => !!props.field.onChange && null;
const typedComponentWithExtra: TypedComponentField<number, { what: true }> = (props) => !!props.field.onChange && null;
const typedRenderFunction = <Values, Path extends NameOf<Values>>(props: FieldRenderProps<Values, Path>) => props.meta.value ? null : null;

const fieldTests = (props: FieldConfig<PersonWithFriendValues, "age", {what: true}>) =>
 <>
   {/*
     * all the events below should be inferred,
     * but can't because of GenericInputHTMLAttributes
     */}
   <input onInput={event => {}} />

   {/* Default */}
   <TypedField name="age" onInput={event => {}} />
   {/* @ts-expect-error elements don't have extraProps */}
   <TypedField name="age" what={true} />

   {/* FieldAsString */}
   <TypedField name="age" as="select" onInput={event => {}} />
   {/* @ts-expect-error elements don't have extraProps */}
   <TypedField name="age" as="select" what={true} />

   {/* FieldStringComponent */}
   <TypedField name="age" component="select" onInput={event => {}} />
   {/* @ts-expect-error elements don't have extraProps */}
   <TypedField name="age" component="select" what={true} />

   {/* FieldAsComponent */}
   <TypedField name="age" as={proplessComponent} />
   <TypedField name="age" as={propsAnyComponent} />
   <TypedField name="age" as={propsAnyComponent} what={true} />
   <TypedField<"age", {}> name="age" as={typedAsComponent} />
   <TypedField name="age" as={typedAsComponent} />
   <TypedField name="age" as={TypedAsComponentClass} />
   <TypedField name="age" as={typedAsComponent}><div /></TypedField>
   <TypedField name="age" as={typedAsComponentWithExtra} what={true} />
   <TypedField name="age" as={TypedAsComponentClassWithExtra} what={true} />
   <TypedField name="age" as={componentWithOnlyExtra} what={true} />

   {/* @ts-expect-error propless components don't have extraProps */}
   <TypedField name="age" as={proplessComponent} what={true} />
   {/* @ts-expect-error value type should match */}
   <TypedField name="motto" as={typedAsComponent} />
   {/* @ts-expect-error value type should match */}
   <TypedField name="motto" as={TypedAsComponentClass} />
   {/* @ts-expect-error extraProps is required */}
   <TypedField name="age" as={typedAsComponentWithExtra} />
   {/* @ts-expect-error extraProps is required */}
   <TypedField name="age" as={TypedAsComponentClassWithExtra} />
   {/* @ts-expect-error extraProps should match */}
   <TypedField name="age" as={asComponentWithExtra} what={false} />
   {/* @ts-expect-error extraProps is required */}
   <TypedField name="age" as={TypedAsComponentClassWithExtra} what={false} />
   {/* @ts-expect-error extraProps should match */}
   <TypedField name="age" as={asComponentWithOnlyExtra} what={false} />

   {/* FieldComponent */}
   <TypedField name="age" component={proplessComponent} />
   <TypedField name="age" component={propsAnyComponent} />
   <TypedField name="age" component={propsAnyComponent} what={true} />
   <TypedField name="age" component={typedComponentComponent} />
   <TypedField name="age" component={typedComponentWithExtra} what={true} />
   <TypedField name="age" component={componentWithOnlyExtra} what={true} />

   {/* @ts-expect-error propless components don't have extraProps */}
   <TypedField name="age" component={proplessComponent} what={true} />
   {/* @ts-expect-error extraProps should match */}
   <TypedField name="age" component={componentWithExtra} what={false} />
   {/* @ts-expect-error extraProps should match */}
   <TypedField name="age" component={componentWithOnlyExtra} what={false} />

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

const number: FieldValue<PersonValues, "age"> | undefined = undefined;
const numberArray: FieldValue<PersonValues, "favoriteNumbers"> | undefined = undefined;
const singleNumber: SingleValue<FieldValue<PersonValues, "favoriteNumbers">> | undefined = undefined;
const singleNumberInferrer = () =>
  <TypedField
    name="favoriteNumbers"
    component={(props) => null}
    // @ts-expect-error
    value=""
  />;

const namesOf: NameOf<PersonWithFriendValues> = "age";
