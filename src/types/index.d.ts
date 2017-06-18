declare module 'yup' {

}

declare module 'hoist-non-react-statics' {
  /**
   * Copies any static properties present on `source` to `target`, excluding those that are specific
   * to React.
   *
   * Returns the target component.
   */
  function hoistNonReactStatics(
    targetComponent: any,
    sourceComponent: any,
    customStatics: { [name: string]: boolean }
  ): any;
  namespace hoistNonReactStatics {

  }
  export = hoistNonReactStatics;
}
