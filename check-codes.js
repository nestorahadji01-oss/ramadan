// Quick script to check activation_codes table in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hdtqmwrzbgdtkkurwktx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdHFtd3J6YmdkdGtrdXJ3a3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTEzMTcsImV4cCI6MjA4NDc4NzMxN30.z6sHeWJETUqudYy9Il7Dk7-xeDMaaXv7GeP2-rssrVs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCodes() {
    console.log('Checking activation_codes table...\n');

    const { data, error } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('❌ No activation codes found in the database!');
        console.log('\nThis means either:');
        console.log('1. The webhook URL was not configured in Chariow');
        console.log('2. Chariow is not sending the correct event type');
        console.log('3. There is an error in the webhook function');
        return;
    }

    console.log(`✅ Found ${data.length} activation code(s):\n`);
    data.forEach((code, i) => {
        console.log(`${i + 1}. Phone: ${code.phone}`);
        console.log(`   Order ID: ${code.order_id}`);
        console.log(`   Customer: ${code.customer_name || 'N/A'}`);
        console.log(`   Used: ${code.used}`);
        console.log(`   Created: ${code.created_at}`);
        console.log('');
    });
}

checkCodes();
