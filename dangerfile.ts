import { danger } from 'danger';

// The Danger DSL can be a bit verbose, so let's rename
const modified = danger.git.modified_files;
const newFiles = danger.git.created_files;

// Have there actually been changes to our app code vs just README changes
const modifiedAppFiles = modified.filter(p => p.includes('src/'));

console.log(modifiedAppFiles);
