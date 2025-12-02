const ep = require('embedded-postgres');
console.log('Exports:', ep);
console.log('Type:', typeof ep);
if (typeof ep === 'object') {
    console.log('Keys:', Object.keys(ep));
}
