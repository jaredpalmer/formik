import {action, storiesOf, module} from '@storybook/react'
import * as React from 'react'
import AsyncValidation from '../examples/AsyncValidation'
import Arrays from '../examples/Arrays'
import Basic from '../examples/Basic.js'
import CustomImputs from '../examples/CustomInputs'
import MultistepWizard from '../examples/MultistepWizard'
import SchemaValidation from '../examples/SchemaValidation'
import SyncValidation from '../examples/SyncValidation'

storiesOf('Example', module)
  .add('Basic', () => {
    return (
      <div style={{}}>
        <Basic />
      </div>
    )
  })
  .add('Arrays', () => {
    return (
      <div style={{}}>
        <Arrays />
      </div>
    )
  })
  .add('AsyncValidation', () => {
    return (
      <div style={{}}>
        <AsyncValidation />
      </div>
    )
  })
  .add('CustomImputs', () => {
    return (
      <div style={{}}>
        <CustomImputs />
      </div>
    )
  })
  .add('MultistepWizard', () => {
    return (
      <div style={{}}>
        <MultistepWizard />
      </div>
    )
  })
  .add('SchemaValidation', () => {
    return (
      <div style={{}}>
        <SchemaValidation />
      </div>
    )
  })
  .add('SyncValidation', () => {
    return (
      <div style={{}}>
        <SyncValidation />
      </div>
    )
  })
