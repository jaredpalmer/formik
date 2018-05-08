import { configure} from '@storybook/react';

function loadStories() {
  require('./example.stories');
}

configure(loadStories, module);
