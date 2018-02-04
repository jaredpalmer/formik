import { configure} from '@storybook/react';

function loadStories() {
  require('../example/example.stories');
}

configure(loadStories, module);
