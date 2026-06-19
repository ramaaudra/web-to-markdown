import { mount } from 'svelte';
import Options from './Options.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('#app mount point missing in options/index.html');

const app = mount(Options, { target });

export default app;
