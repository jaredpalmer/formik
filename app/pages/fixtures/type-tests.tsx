import {
    CustomField,
    Field,
    FieldAsProps,
    FieldComponentClass,
    FieldComponentProps,
    FieldConfig,
    FieldRenderFunction,
    FieldRenderProps,
    Form,
    Formik,
    TypedAsField,
    TypedComponentField,
    useCustomField,
    useTypedField
  } from "formik";
  import * as React from "react";

  type BasePerson = {
    name: {
      first: string;
      last: string;
    };
    motto: string;
    nicknames: string[];
    age: number;
    favoriteNumbers: number[];
  };

  type Person = BasePerson & {
    partner: BasePerson;
    friends: BasePerson[];
  };

  const basePerson: BasePerson = {
    name: {
      first: "",
      last: ""
    },
    motto: "",
    nicknames: [],
    age: 1,
    favoriteNumbers: []
  };

  const person: Person = {
    ...basePerson,
    partner: basePerson,
    friends: []
  };

  const proplessFC = () => null;
  const propsAnyFC = (props: any) => null;
  const partialPropsFC = (props: { name: string }) => null;
  const asAnyFC = (props: FieldAsProps<any, any>) => null;
  const asNumberFC: TypedAsField<number> = (props) => null;
  const asStringFC: TypedAsField<string> = (props) => null;
  const componentAnyFC = (props: FieldComponentProps<any, any>) => null;
  const componentNumberFC: TypedComponentField<number> = (props) => null;
  const renderAnyFn: FieldRenderFunction<any, any> = (props) => null;
  const renderNumberFN = <Value, Values>(
    props: FieldRenderProps<Value, Values>
  ) => null;

  class PropsAnyClass extends React.Component<any> {
    render() {
      return null;
    }
  }
  class PartialPropsClass extends React.Component<{ name: string }> {
    render() {
      return null;
    }
  }
  class AsNumberClass<Values> extends React.Component<
    FieldAsProps<number, Values>
  > {
    render() {
      return null;
    }
  }
  class ComponentNumberClass extends FieldComponentClass<number> {
    render() {
      return null;
    }
  }

  const CustomNumberFC: CustomField<number> = <Values extends any>(
    props: FieldConfig<number, Values>
  ) => {
    const InnerTypedField = useTypedField<Values>();

    return (
      <>
        <InnerTypedField name={props.name} format={(value) => {}} />
        <InnerTypedField name={props.name} as={asNumberFC} />
        <InnerTypedField name={props.name} as={asAnyFC} />
        <InnerTypedField
          name={props.name}
          /** @ts-expect-error value must match `number` */
          as={asStringFC}
        />
      </>
    );
  };

export const FieldTests = (props: FieldConfig<number, Person>) => {
    const TypedField = useTypedField<Person>();
    const TypedNumberFC = useCustomField<Person>()(CustomNumberFC);

    return (
      <Formik initialValues={person} onSubmit={() => {}}>
        <Form>
          {/* Default */}
          <Field name="age" />
          <TypedField name="age" />
          <TypedField name="friends.0.name.first" />

          <Field name="aeg" />
          {/* @ts-expect-error name doesn't match PathOf<Values> */}
          <TypedField name="aeg" />
          {/* @ts-expect-error name doesn't match PathOf<Values> */}
          <TypedField name="friends.NOPE.name.first" />

          <Field name="age" format={(value: string) => {}} />
          <TypedField name="age" format={(value: number) => {}} />
          {/* @ts-expect-error TypedField must match value */}
          <TypedField name="age" format={(value: string) => {}} />

          <Field name="age" aria-required={true} />
          <TypedField name="age" aria-required={true} />
          <TypedField name="friends.0.name.first" aria-required={true} />

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
          <Field name="age" as={asAnyFC}>
            <div />
          </Field>
          <Field name="age" as={asNumberFC}>
            <div />
          </Field>
          <TypedField name="age" as={asNumberFC}>
            <div />
          </TypedField>
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
          <Field name="age" component={componentAnyFC}>
            <div />
          </Field>
          <Field name="age" component={componentNumberFC}>
            <div />
          </Field>
          <TypedField name="age" component={componentNumberFC}>
            <div />
          </TypedField>
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
          <Field name="age" render={renderAnyFn}>
            <div />
          </Field>

          {/* FieldChildren */}
          <Field name="age" children={renderAnyFn} />
          <Field name="age">{renderAnyFn}</Field>

          {/* Pass-Through Props */}
          <Field<any, any> {...props} />
          <Field {...props} />

          {/* FieldRender */}
          <TypedField name="age" render={renderNumberFN} />
          {/* @ts-expect-error render function doesn't have child component */}
          <TypedField name="age" render={renderNumberFN}>
            <div />
          </TypedField>

          {/* FieldChildren */}
          <TypedField name="age" children={renderNumberFN} />
          <TypedField name="age">{renderNumberFN}</TypedField>

          {/* Pass-Through Props */}
          <TypedField {...props} />

          {/* Custom Fields */}
          {/* Untyped Custom Fields can have anything */}
          <CustomNumberFC name="age" format={(value) => {}} />
          <TypedNumberFC name="age" format={(value) => {}} />
          <CustomNumberFC name="motto" />
          {/* @ts-expect-error field value should match */}
          <TypedNumberFC name="motto" />

          {/* @ts-expect-error should match number */}
          <TypedField name="partner.age" value="" />

          {/* array inference doesn't currently work */}
          {/* @ts-expect-error should match number */}
          <TypedField name="favoriteNumbers.0" value="" />
          {/* @ts-expect-error should match string */}
          <TypedField name="friends.0.name" value={1} />
        </Form>
      </Formik>
    );
  };
