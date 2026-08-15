import dotenv from 'dotenv';
dotenv.config();

console.log('ENV KEYS PRESENT:', Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('ELECTRON_')));
