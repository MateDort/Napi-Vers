/**
 * AI Accuracy Testing Script for Napi Vers
 * 
 * This script tests the poem selection and content generation quality
 * Run with: node test-ai-accuracy.js
 */

const axios = require('axios');
const { hungarianPoems } = require('./hungarianPoems');

const OPENAI_API_KEY = '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';
const SERPER_API_KEY = '4c05eab623aba7e8c8eede5ea9d34ea8a3a128d3';

// Test dates with known significance
const testDates = [
  { date: '2024-04-11', name: 'József Attila születésnapja (1905)', expected: 'József Attila' },
  { date: '2024-03-15', name: '1848-as forradalom', expected: 'Petőfi Sándor' },
  { date: '2024-01-01', name: 'Újév', expected: null },
  { date: '2024-06-04', name: 'Trianon napja', expected: null },
  { date: '2024-08-20', name: 'Szent István napja', expected: null },
  { date: '2024-10-23', name: '1956-os forradalom', expected: null },
  { date: '2024-11-01', name: 'Halottak napja', expected: null },
  { date: '2024-12-25', name: 'Karácsony', expected: null },
  { date: '2024-05-09', name: 'Radnóti Miklós halála (1944)', expected: 'Radnóti Miklós' },
  { date: '2024-07-31', name: 'Petőfi Sándor halála (1849)', expected: 'Petőfi Sándor' }
];

async function testPoemSelection(dateInfo) {
  try {
    const date = new Date(dateInfo.date);
    const dateString = `${date.getFullYear()}. ${date.toLocaleString('hu-HU', { month: 'long' })} ${date.getDate()}.`;
    const dayOfWeek = date.toLocaleString('hu-HU', { weekday: 'long' });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📅 Testing: ${dateInfo.name} (${dateString})`);
    console.log(`${'='.repeat(80)}\n`);

    // Search with Serper
    const serperResponse = await axios.post(
      'https://google.serper.dev/search',
      {
        q: `magyar költő születésnap ${date.getMonth() + 1} ${date.getDate()} OR magyar vers írva ${date.getMonth() + 1} ${date.getDate()} történelmi esemény`,
        gl: 'hu',
        hl: 'hu',
        num: 5
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const searchResults = serperResponse.data.organic?.slice(0, 5).map(r => r.snippet).join('\n') || 'Nincs különleges esemény ma.';
    
    console.log('🔍 Serper Results:');
    console.log(searchResults.substring(0, 300) + '...\n');

    // Get available poems list
    const availablePoems = hungarianPoems.map(p => `"${p.title}" - ${p.author}`).join(', ');

    // Ask GPT to choose
      const gptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Te egy magyar irodalmi szakértő vagy. A feladatod, hogy minden nap kiválaszd a legmegfelelőbb verset a következő listából.

⚠️ KRITIKUS: CSAK az alábbi versek közül válaszd ki AZ EGYIKET - nem találhatsz ki új verset!

ELÉRHETŐ VERSEK:
${availablePoems}

PRIORITÁSI SORREND:
1. Ha ma költő születésnapja vagy halálozása → MINDIG azt a költőt válaszd (a fenti listából)
2. Ha ma történelmi ünnep (március 15, október 23) → válaszd a kapcsolódó verset (pl. "Nemzeti dal")
3. Ha szezonális kapcsolat van → válaszd a tematikusan illő verset
4. Ha normál nap → válassz egy szép, jelentős verset rotálva

INDOKLÁS SZABÁLYOK:
- Pontosan 50-150 karakter hosszú legyen (számolj karaktereket!)
- Példa jó hosszúság: "Ma Petőfi születésnapja, aki hőse volt a forradalomnak."

VÁLASZ FORMÁTUM (CSAK JSON):
{"title": "pontos vers címe a listából", "author": "pontos költő neve", "reason": "50-150 karakter indoklás"}`
            },
            {
              role: 'user',
              content: `Mai dátum: ${dateString} (${dayOfWeek})

Releváns információk a mai napról:
${searchResults}

Melyik verset válaszd ki ma és miért? Válaszolj JSON formátumban.`
            }
          ],
          temperature: 0.7,
          max_tokens: 400
        },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const selection = JSON.parse(gptResponse.data.choices[0].message.content);
    
    console.log('🤖 GPT Selection:');
    console.log(`   Title: "${selection.title}"`);
    console.log(`   Author: ${selection.author}`);
    console.log(`   Reason: ${selection.reason}\n`);

    // Evaluate
    let score = 0;
    let evaluation = [];

    // Check if poem exists (20 points)
    const poemExists = hungarianPoems.find(p => p.title === selection.title && p.author === selection.author);
    if (poemExists) {
      score += 20;
      evaluation.push('✅ Poem exists in collection (+20)');
    } else {
      evaluation.push('❌ Poem NOT found in collection (0)');
    }

    // Check if expected author matches (30 points if applicable)
    if (dateInfo.expected) {
      if (selection.author === dateInfo.expected) {
        score += 30;
        evaluation.push(`✅ Correct author for this date (+30)`);
      } else {
        evaluation.push(`❌ Expected ${dateInfo.expected}, got ${selection.author} (0)`);
      }
    } else {
      score += 15; // Neutral date, any choice is okay
      evaluation.push('➖ No specific expectation, reasonable choice (+15)');
    }

    // Check reason quality (30 points)
    const reasonLength = selection.reason.length;
    const hasDate = selection.reason.includes(date.getDate().toString()) || 
                    selection.reason.toLowerCase().includes('ma') ||
                    selection.reason.toLowerCase().includes('május') ||
                    selection.reason.toLowerCase().includes('április');
    
    if (reasonLength > 30 && reasonLength < 200) {
      score += 15;
      evaluation.push('✅ Reason length appropriate (+15)');
    } else {
      evaluation.push('⚠️  Reason too short or too long (+5)');
      score += 5;
    }

    if (hasDate || dateInfo.name.toLowerCase().includes(selection.author.toLowerCase())) {
      score += 15;
      evaluation.push('✅ Reason mentions relevance to date (+15)');
    } else {
      evaluation.push('⚠️  Reason lacks specific date connection (+5)');
      score += 5;
    }

    // Relevance to Hungarian literature (20 points)
    if (selection.author && poemExists) {
      score += 20;
      evaluation.push('✅ Famous Hungarian poet (+20)');
    }

    console.log('📊 EVALUATION:');
    evaluation.forEach(e => console.log(`   ${e}`));
    console.log(`\n   🎯 TOTAL SCORE: ${score}/100`);

    return { date: dateInfo.name, score, selection, evaluation };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { date: dateInfo.name, score: 0, error: error.message };
  }
}

async function testAuthorInfo(poet) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`👨‍🎨 Testing Author Info: ${poet}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Search
    const serperResponse = await axios.post(
      'https://google.serper.dev/search',
      {
        q: `${poet} magyar költő életrajz`,
        gl: 'hu',
        hl: 'hu',
        num: 3
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const searchResults = serperResponse.data.organic?.slice(0, 3).map(r => r.snippet).join('\n') || '';

    // Generate bio
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Te egy magyar irodalmi szakértő vagy. Írj érdekes, részletes életrajzot magyar költőkről, amely magával ragadó és informatív.'
          },
          {
            role: 'user',
            content: `Írj egy érdekes és részletes életrajzot ${poet} költőről.

KÖTELEZŐ elemek (mind szerepeljen):
1. Születési és halálozási dátum (konkrét dátumok)
2. Életének főbb eseményei (gyerekkor, tanulmányok, felnőttkor)
3. Költői stílusa (szimbolizmus, realizmus, modernizmus stb.) - FONTOS!
4. Legismertebb művei (legalább 2-3 vers címe)
5. 1-2 érdekes tény vagy anekdota

További információ: ${searchResults}

Írj 2-3 bekezdésben, közérthető magyarsággal.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const bio = gptResponse.data.choices[0].message.content;
    console.log('📝 Generated Bio:');
    console.log(bio.substring(0, 500) + '...\n');

    // Evaluate
    let score = 0;
    let evaluation = [];

    // Check for dates (20 points)
    const hasYears = /\d{4}/.test(bio);
    if (hasYears) {
      score += 20;
      evaluation.push('✅ Contains birth/death dates (+20)');
    } else {
      evaluation.push('❌ Missing dates (0)');
    }

    // Check length (20 points)
    if (bio.length > 300 && bio.length < 1500) {
      score += 20;
      evaluation.push('✅ Good length (+20)');
    } else {
      score += 10;
      evaluation.push('⚠️  Length could be better (+10)');
    }

    // Check for key info (30 points)
    const lowerBio = bio.toLowerCase();
    const hasWorks = lowerBio.includes('vers') || lowerBio.includes('költ') || lowerBio.includes('írt');
    const hasStyle = lowerBio.includes('stílus') || lowerBio.includes('modern') || lowerBio.includes('kifejez');
    const hasLife = lowerBio.includes('élet') || lowerBio.includes('szület') || lowerBio.includes('halt');

    if (hasWorks) score += 10;
    if (hasStyle) score += 10;
    if (hasLife) score += 10;

    evaluation.push(`${hasWorks ? '✅' : '❌'} Mentions works (${hasWorks ? '+10' : '0'})`);
    evaluation.push(`${hasStyle ? '✅' : '❌'} Mentions style (${hasStyle ? '+10' : '0'})`);
    evaluation.push(`${hasLife ? '✅' : '❌'} Mentions life events (${hasLife ? '+10' : '0'})`);

    // Check for Hungarian context (30 points)
    const hasMagyar = lowerBio.includes('magyar') || lowerBio.includes('budapest') || lowerBio.includes('irodalom');
    if (hasMagyar) {
      score += 30;
      evaluation.push('✅ Hungarian context present (+30)');
    } else {
      evaluation.push('❌ Missing Hungarian context (0)');
    }

    console.log('📊 EVALUATION:');
    evaluation.forEach(e => console.log(`   ${e}`));
    console.log(`\n   🎯 TOTAL SCORE: ${score}/100`);

    return { poet, score, evaluation };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { poet, score: 0, error: error.message };
  }
}

async function runTests() {
  console.log('\n🧪 NAPI VERS AI ACCURACY TEST\n');
  console.log('Testing poem selection across 10 significant dates...\n');

  const results = [];

  // Test poem selections
  for (const testDate of testDates) {
    const result = await testPoemSelection(testDate);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
  }

  // Test author info for 3 poets
  console.log('\n\n🎨 Testing Author Information Generation...\n');
  const poets = ['József Attila', 'Petőfi Sándor', 'Ady Endre'];
  const authorResults = [];

  for (const poet of poets) {
    const result = await testAuthorInfo(poet);
    authorResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(80) + '\n');

  console.log('POEM SELECTION SCORES:');
  let totalPoemScore = 0;
  results.forEach(r => {
    console.log(`   ${r.date}: ${r.score}/100`);
    totalPoemScore += r.score;
  });
  const avgPoemScore = Math.round(totalPoemScore / results.length);
  console.log(`\n   Average: ${avgPoemScore}/100`);

  console.log('\nAUTHOR INFO SCORES:');
  let totalAuthorScore = 0;
  authorResults.forEach(r => {
    console.log(`   ${r.poet}: ${r.score}/100`);
    totalAuthorScore += r.score;
  });
  const avgAuthorScore = Math.round(totalAuthorScore / authorResults.length);
  console.log(`\n   Average: ${avgAuthorScore}/100`);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎯 OVERALL AI ACCURACY: ${Math.round((avgPoemScore + avgAuthorScore) / 2)}/100`);
  console.log('='.repeat(80) + '\n');

  // Interpretation
  const overallScore = Math.round((avgPoemScore + avgAuthorScore) / 2);
  if (overallScore >= 85) {
    console.log('✅ EXCELLENT: AI is performing very accurately!');
  } else if (overallScore >= 70) {
    console.log('👍 GOOD: AI is mostly accurate with room for improvement.');
  } else if (overallScore >= 50) {
    console.log('⚠️  FAIR: AI needs prompt improvements.');
  } else {
    console.log('❌ POOR: Prompts need significant revision.');
  }
}

// Run the tests
runTests().catch(console.error);

