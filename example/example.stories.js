import {action, storiesOf, module} from '@storybook/react'
import * as React from 'react'
import Index from './index'


storiesOf('Example', module)
  .add('Index', () => {
    return (
      <div style={{}}>
        <Index />
      </div>
    )
  })