/**
 * This file contains functionality that provides end users with the ability to enable
 * the new `formik.setFieldValue` function behavior - when called with an undefined value,
 * that value will not be removed from form.values.
 * This file is only needed for backward compatibility of versions and should be removed in
 * the next major release, and the new behavior of the setFieldValue function should be enabled
 * by default.
 *
 * @todo remove this file in next major release
 */

let isExplicitUndefinedValuesEnabledFlag: boolean = false;

function enableExplicitUndefinedValues() {
  isExplicitUndefinedValuesEnabledFlag = true;
}

function disableExplicitUndefinedValues() {
  isExplicitUndefinedValuesEnabledFlag = false;
}

function isExplicitUndefinedValuesEnabled() {
  return isExplicitUndefinedValuesEnabledFlag;
}

export {
  disableExplicitUndefinedValues,
  enableExplicitUndefinedValues,
  isExplicitUndefinedValuesEnabled,
};
