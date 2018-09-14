import './story.css';
import { action, storiesOf, module } from '@storybook/react';
import React from 'react';
import { FormikConsumer } from 'formik';
import AsyncValidation from '../examples/AsyncValidation';
import Arrays from '../examples/Arrays';
import Basic from '../examples/Basic.js';
import CustomInputs from '../examples/CustomInputs';
import ErrorMessage from '../examples/ErrorMessage';
import MultistepWizard from '../examples/MultistepWizard';
import SchemaValidation from '../examples/SchemaValidation';
import SyncValidation from '../examples/SyncValidation';
import FieldLevelValidation from '../examples/FieldLevelValidation';
import CombinedValidations from '../examples/CombinedValidations';

const AsyncValidationCode = require('!raw-loader!../examples/AsyncValidation');
const ArraysCode = require('!raw-loader!../examples/Arrays');
const BasicCode = require('!raw-loader!../examples/Basic.js');
const CustomInputsCode = require('!raw-loader!../examples/CustomInputs');
const ErrorMessageCode = require('!raw-loader!../examples/ErrorMessage');
const MultistepWizardCode = require('!raw-loader!../examples/MultistepWizard');
const SchemaValidationCode = require('!raw-loader!../examples/SchemaValidation');
const SyncValidationCode = require('!raw-loader!../examples/SyncValidation');
const FieldLevelValidationCode = require('!raw-loader!../examples/FieldLevelValidation');
const CombinedValidationsCode = require('!raw-loader!../examples/CombinedValidations');

function cleanExample(str) {
  return str
    .replace(`import { Debug } from './Debug';`, '')
    .replace(`<Debug />`, '');
}

const Code = props => (
  <div
    style={{
      margin: '0 12px',
      borderRadius: 4,
      background: '#f6f8fa',
      boxShadow: '0 0 1px  #eee inset',
    }}
  >
    <div
      style={{
        textTransform: 'uppercase',
        fontSize: 11,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        fontWeight: 500,
        padding: '.5rem',
        background: '#555',
        color: '#fff',
        letterSpacing: '1px',
      }}
    >
      Example Code
    </div>
    <pre
      style={{
        overflowX: 'scroll',
        fontSize: 11,
        padding: '.5rem',
        boxSizing: 'border-box',
      }}
      {...props}
    />
  </div>
);

storiesOf('Example', module)
  .add('Basic', () => {
    return (
      <div className="formik-example">
        <main>
          <Basic />
        </main>
        <Code>{cleanExample(BasicCode)}</Code>
      </div>
    );
  })
  .add('Arrays', () => {
    return (
      <div className="formik-example">
        <main>
          <Arrays />
        </main>
        <Code>{cleanExample(ArraysCode)}</Code>
      </div>
    );
  })
  .add('Async Validation', () => {
    return (
      <div className="formik-example">
        <main>
          <AsyncValidation />
        </main>
        <Code>{cleanExample(AsyncValidationCode)}</Code>
      </div>
    );
  })
  .add('Custom Inputs', () => {
    return (
      <div className="formik-example">
        <main>
          <CustomInputs />
        </main>
        <Code>{cleanExample(CustomInputsCode)}</Code>
      </div>
    );
  })
  .add('Using <ErrorMessage />', () => {
    return (
      <div className="formik-example">
        <main>
          <ErrorMessage />
        </main>
        <Code>{cleanExample(ErrorMessageCode)}</Code>
      </div>
    );
  })
  .add('Multistep Wizard', () => {
    return (
      <div className="formik-example">
        <main>
          <MultistepWizard />
        </main>
        <Code>{cleanExample(MultistepWizardCode)}</Code>
      </div>
    );
  })
  .add('Yup Schema Validation', () => {
    return (
      <div className="formik-example">
        <main>
          <SchemaValidation />
        </main>
        <Code>{cleanExample(SchemaValidationCode)}</Code>
      </div>
    );
  })
  .add('Sync Validation', () => {
    return (
      <div className="formik-example">
        <main>
          <SyncValidation />
        </main>
        <Code>{cleanExample(SyncValidationCode)}</Code>
      </div>
    );
  })
  .add('Field-level Validation', () => {
    return (
      <div className="formik-example">
        <main>
          <FieldLevelValidation />
        </main>
        <Code>{cleanExample(FieldLevelValidationCode)}</Code>
      </div>
    );
  })
  .add('Combined Validations', () => {
    return (
      <div className="formik-example">
        <main>
          <CombinedValidations />
        </main>
        <Code>{cleanExample(CombinedValidationsCode)}</Code>
      </div>
    );
  });
