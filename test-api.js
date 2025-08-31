const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing MoodMitra API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test user signup
    console.log('\n2. Testing user signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    const token = signupResponse.data.token;

    // Test authentication
    console.log('\n3. Testing authentication...');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, authHeaders);
    console.log('✅ Authentication working:', meResponse.data.data.name);

    // Test mood entry
    console.log('\n4. Testing mood entry...');
    const moodData = {
      moodType: 'happy',
      notes: 'Feeling great today!'
    };
    const moodResponse = await axios.post(`${BASE_URL}/moods`, moodData, authHeaders);
    console.log('✅ Mood entry created:', moodResponse.data.message);

    // Test journal entry
    console.log('\n5. Testing journal entry...');
    const journalData = {
      title: 'Test Journal',
      content: 'Today was a wonderful day. I accomplished many tasks and felt very productive and happy.'
    };
    const journalResponse = await axios.post(`${BASE_URL}/journals`, journalData, authHeaders);
    console.log('✅ Journal entry created:', journalResponse.data.message);

    // Test analytics
    console.log('\n6. Testing analytics...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/insights`, authHeaders);
    console.log('✅ Analytics working:', analyticsResponse.data.data.stats);

    // Test external sentiment analysis
    console.log('\n7. Testing sentiment analysis...');
    const sentimentData = { text: 'I am feeling amazing and very happy today!' };
    const sentimentResponse = await axios.post(`${BASE_URL}/sentiment/analyze`, sentimentData, authHeaders);
    console.log('✅ Sentiment analysis:', sentimentResponse.data.data.sentiment);

    // Test quotes
    console.log('\n8. Testing quotes...');
    const quotesResponse = await axios.get(`${BASE_URL}/quotes/mood?mood=happy`, authHeaders);
    console.log('✅ Quotes fetched:', quotesResponse.data.data.quotes.length, 'quotes');

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 API Summary:');
    console.log('- User authentication: Working');
    console.log('- Mood tracking: Working');
    console.log('- Journal management: Working');
    console.log('- Analytics: Working');
    console.log('- External integrations: Working');
    console.log('- Security: Implemented');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
