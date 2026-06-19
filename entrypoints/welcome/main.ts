import { mount } from 'svelte';
import Welcome from './Welcome.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('#app mount point missing in welcome/index.html');

const app = mount(Welcome, { target });

export default app;
