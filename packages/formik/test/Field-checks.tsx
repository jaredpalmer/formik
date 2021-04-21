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
    FieldStringComponentConfig
} from "../src";

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
 const asComponent = (props: FieldAsProps<any, any>) => !!props.onChange && null;
 const asComponentWithExtra = (props: FieldAsProps<any, any, { what: true }>) => !!props.onChange && null;
 const asComponentWithOnlyExtra = (props: { what: true }) => !!props.what ? null : null;
 const componentComponent = (props: FieldComponentProps<any, any>) => !!props.field.onChange && null;
 const componentWithExtra = (props: FieldComponentProps<any, any, { what: true }>) => !!props.field.onChange && null;
 const componentWithOnlyExtra = (props: { what: true }) => !!props.what ? null : null;
 const renderFunction: FieldRenderFunction<any, any> = (props) => props.meta.value ? null : null;

 const formTests = (props: FieldConfig<any, any, {what: true}>) =>
   <>
     <input onInput={event => {}} />
     {/* FieldAsString */}
     <Field name="test" as="select" onInput={event => {}} />
     {/* FieldAsComponent */}
     <Field name="test" as={proplessComponent} />
     <Field name="test" as={propsAnyComponent} />
     <Field name="test" as={propsAnyComponent} what={true} />
     {/* @ts-expect-error */}
     <Field name="test" as={proplessComponent} what={true} />
     <Field name="test" as={asComponent} />
     <Field name="test" as={asComponentWithExtra} what={true} />
     {/* @ts-expect-error */}
     <Field name="test" as={asComponentWithExtra} what={false} />
     <Field name="test" as={asComponentWithOnlyExtra} what={true} />
     {/* @ts-expect-error */}
     <Field name="test" as={asComponentWithOnlyExtra} what={false} />
     {/* FieldStringComponent */}
     <Field name="test" component="select" what={true} onInput={event => {}} />
     {/* FieldComponent */}
     <Field name="test" component={proplessComponent} />
     <Field name="test" component={propsAnyComponent} />
     <Field name="test" component={propsAnyComponent} what={true} />
     {/* @ts-expect-error */}
     <Field name="test" component={proplessComponent} what={true} />
     <Field name="test" component={componentComponent} />
     <Field name="test" component={componentWithExtra} what={true} />
     {/* @ts-expect-error */}
     <Field name="test" component={componentWithExtra} what={false} />
     <Field name="test" component={componentWithOnlyExtra} what={true} />
     {/* @ts-expect-error */}
     <Field name="test" component={componentWithOnlyExtra} what={false} />
     {/* FieldRender */}
     <Field name="test" render={renderFunction} />
     {/* FieldChildren */}
     <Field name="test" children={renderFunction} />
     <Field name="test">{renderFunction}</Field>
     {/* Default */}
     <Field name="test" onInput={event => {}} />

     {/* Pass-Through Props */}
     <Field<any, any, {what: true}> {...props} />
     <Field {...props} />
     {/* @ts-expect-error */}
     <Field<any, any, {what: false}> {...props} />
   </>