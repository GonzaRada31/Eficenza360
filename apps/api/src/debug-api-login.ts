async function main() {
  console.log('--- API Login Check ---');
  const email = 'admin@eficenza.com';
  const password = 'admin123';

  try {
    console.log('Sending login request to http://localhost:3000/iam/login...');
    const response = await fetch('http://localhost:3000/iam/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log(`Response Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Successful!');
      console.log('Token received:', data.access_token ? 'Yes' : 'No');
    } else {
      console.error('❌ Login Failed via API.');
      const error = await response.text();
      console.error('Error Body:', error);
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
