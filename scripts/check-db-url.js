import 'dotenv/config';

const url = process.env.DATABASE_URL || '';
if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.log('Connected to: LOCALHOST');
} else if (url.includes('supabase')) {
    console.log('Connected to: SUPABASE');
} else {
    console.log('Connected to: OTHER (' + url.substring(0, 15) + '...)');
}
