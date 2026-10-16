// Compatibility entrypoint: start the full preview, including the contact API.
import './scripts/sites-env.mjs';
import {spawn} from 'node:child_process';
const child=spawn(process.execPath,['scripts/run-framework.mjs','dev'],{stdio:'inherit',env:process.env});
child.on('exit',code=>process.exit(code??1));
process.on('SIGINT',()=>child.kill('SIGINT'));
