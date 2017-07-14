import * as tslib_1 from "tslib";
import * as React from 'react';
var hoistNonReactStatics = require('hoist-non-react-statics');
/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors(yupError) {
    var errors = {};
    for (var _i = 0, _a = yupError.inner; _i < _a.length; _i++) {
        var err = _a[_i];
        if (!errors[err.path]) {
            errors[err.path] = err.message;
        }
    }
    return errors;
}
/**
 * Given an object, map keys to boolean
 */
export function touchAllFields(fields) {
    var touched = {};
    for (var _i = 0, _a = Object.keys(fields); _i < _a.length; _i++) {
        var k = _a[_i];
        touched[k] = true;
    }
    return touched;
}
/**
 * Validate a yup schema.
 */
export function validateFormData(data, schema) {
    var validateData = {};
    for (var k in data) {
        if (data.hasOwnProperty(k)) {
            var key = String(k);
            validateData[key] =
                data[key] !== '' ? data[key] : undefined;
        }
    }
    return schema.validate(validateData, { abortEarly: false });
}
export function Formik(_a) {
    var displayName = _a.displayName, _b = _a.mapPropsToValues, mapPropsToValues = _b === void 0 ? function (vanillaProps) {
        var values = {};
        for (var k in vanillaProps) {
            if (vanillaProps.hasOwnProperty(k) &&
                typeof vanillaProps[k] !== 'function') {
                values[k] = vanillaProps[k];
            }
        }
        return values;
    } : _b, _c = _a.mapValuesToPayload, mapValuesToPayload = _c === void 0 ? function (values) {
        // in this case Values and Payload are the same.
        var payload = values;
        return payload;
    } : _c, validationSchema = _a.validationSchema, handleSubmit = _a.handleSubmit;
    return function wrapWithFormik(WrappedComponent) {
        var Formik = (function (_super) {
            tslib_1.__extends(Formik, _super);
            function Formik(props) {
                var _this = _super.call(this, props) || this;
                _this.setErrors = function (errors) {
                    _this.setState({ errors: errors });
                };
                _this.setTouched = function (touched) {
                    _this.setState({ touched: touched });
                };
                _this.setValues = function (values) {
                    _this.setState({ values: values });
                };
                _this.setError = function (error) {
                    _this.setState({ error: error });
                };
                _this.setSubmitting = function (isSubmitting) {
                    _this.setState({ isSubmitting: isSubmitting });
                };
                _this.handleChange = function (e) {
                    e.persist();
                    var _a = e.target, type = _a.type, name = _a.name, id = _a.id, value = _a.value, checked = _a.checked;
                    var field = name ? name : id;
                    var val = /number|range/.test(type)
                        ? parseFloat(value)
                        : /checkbox/.test(type) ? checked : value;
                    var values = _this.state.values;
                    // Set form fields by name
                    _this.setState(function (state) {
                        return (tslib_1.__assign({}, state, { values: tslib_1.__assign({}, values, (_a = {}, _a[field] = val, _a)) }));
                        var _a;
                    });
                    // Validate against schema
                    validateFormData(tslib_1.__assign({}, values, (_b = {}, _b[field] = val, _b)), validationSchema).then(function () { return _this.setState({ errors: {} }); }, function (err) { return _this.setState({ errors: yupToFormErrors(err) }); });
                    var _b;
                };
                _this.handleSubmit = function (e) {
                    e.preventDefault();
                    // setTouched();
                    // setSubmitting(true);
                    _this.setState({
                        touched: touchAllFields(_this.state.values),
                        isSubmitting: true,
                    });
                    var values = _this.state.values;
                    // Validate against schema
                    validateFormData(values, validationSchema).then(function () {
                        _this.setState({ errors: {} });
                        handleSubmit(mapValuesToPayload(_this.state.values), {
                            setTouched: _this.setTouched,
                            setErrors: _this.setErrors,
                            setError: _this.setError,
                            setSubmitting: _this.setSubmitting,
                            setValues: _this.setValues,
                            resetForm: _this.resetForm,
                            props: _this.props,
                        });
                    }, function (err) {
                        return _this.setState({ isSubmitting: false, errors: yupToFormErrors(err) });
                    });
                };
                _this.handleBlur = function (e) {
                    e.persist();
                    var _a = e.target, name = _a.name, id = _a.id;
                    var field = name ? name : id;
                    var touched = _this.state.touched;
                    _this.setTouched(tslib_1.__assign({}, touched, (_b = {}, _b[field] = true, _b)));
                    var _b;
                };
                _this.handleChangeValue = function (field, value) {
                    var _a = _this.state, touched = _a.touched, values = _a.values;
                    // Set touched and form fields by name
                    _this.setState(function (state) {
                        return (tslib_1.__assign({}, state, { values: tslib_1.__assign({}, values, (_a = {}, _a[field] = value, _a)), touched: tslib_1.__assign({}, touched, (_b = {}, _b[field] = true, _b)) }));
                        var _a, _b;
                    });
                    // Validate against schema
                    validateFormData(tslib_1.__assign({}, values, (_b = {}, _b[field] = value, _b)), validationSchema).then(function () { return _this.setState({ errors: {} }); }, function (err) { return _this.setState({ errors: yupToFormErrors(err) }); });
                    var _b;
                };
                _this.resetForm = function (nextProps) {
                    _this.setState({
                        isSubmitting: false,
                        errors: {},
                        touched: {},
                        error: undefined,
                        values: nextProps
                            ? mapPropsToValues(nextProps)
                            : mapPropsToValues(_this.props),
                    });
                };
                _this.handleReset = function () {
                    _this.setState({
                        isSubmitting: false,
                        errors: {},
                        touched: {},
                        error: undefined,
                        values: mapPropsToValues(_this.props),
                    });
                };
                _this.state = {
                    values: mapPropsToValues(props),
                    errors: {},
                    touched: {},
                    isSubmitting: false,
                };
                return _this;
            }
            Formik.prototype.render = function () {
                return (React.createElement(WrappedComponent, tslib_1.__assign({}, this.props, this.state, { setError: this.setError, setErrors: this.setErrors, setSubmitting: this.setSubmitting, setTouched: this.setTouched, setValues: this.setValues, resetForm: this.resetForm, handleReset: this.handleReset, handleSubmit: this.handleSubmit, handleChange: this.handleChange, handleBlur: this.handleBlur, handleChangeValue: this.handleChangeValue })));
            };
            Formik.displayName = "Formik(" + (displayName ||
                WrappedComponent.displayName ||
                WrappedComponent.name ||
                'Component') + ")";
            Formik.WrappedComponent = WrappedComponent;
            return Formik;
        }(React.Component));
        // Make sure we preserve any custom statics on the original component.
        // @see https://github.com/apollographql/react-apollo/blob/master/src/graphql.tsx
        return hoistNonReactStatics(Formik, WrappedComponent);
    };
}
