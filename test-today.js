const axios = require('axios');
// No longer using hardcoded poems - GPT generates from knowledge!

const OPENAI_API_KEY = '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';
const SERPER_API_KEY = '4c05eab623aba7e8c8eede5ea9d34ea8a3a128d3';

async function testTodayPoem() {
  console.log('\n🧪 TESTING TODAY\'S POEM SELECTION');
  console.log('=' .repeat(80));
  
  // Get today's date
  const today = new Date();
  const dateString = `${today.getFullYear()}. ${today.toLocaleString('hu-HU', { month: 'long' })} ${today.getDate()}.`;
  const dayOfWeek = today.toLocaleString('hu-HU', { weekday: 'long' });
  
  console.log(`\n📅 Mai dátum: ${dateString} (${dayOfWeek})`);
  console.log('\n');

  try {
    // Step 1: Serper search
    console.log('🔍 SERPER KERESÉS...\n');
    const monthName = today.toLocaleString('hu-HU', { month: 'long' });
    const serperResponse = await axios.post(
      'https://google.serper.dev/search',
      {
        q: `${monthName} ${today.getDate()} magyar költő születésnap halálozás évforduló történelmi esemény nemzeti ünnep`,
        gl: 'hu',
        hl: 'hu',
        num: 8
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const searchResults = serperResponse.data.organic?.slice(0, 8).map(r => r.snippet).join('\n') || 'Nincs különleges esemény ma.';
    console.log('Serper találatok:');
    console.log('-'.repeat(80));
    console.log(searchResults.substring(0, 500) + '...\n');

    // Step 2: GPT selection & generation
    console.log('🤖 GPT-4 VERS VÁLASZTÁS ÉS GENERÁLÁS...\n');
    
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Te egy magyar irodalmi szakértő vagy és ismersz minden klasszikus magyar verset. 

A feladatod:
1. Válassz egy VALÓDI, létező klasszikus magyar verset a mai naphoz
2. Írd le a teljes vers szövegét PONTOSAN (ne találj ki semmit!)

⚠️ KRITIKUS PRIORITÁSI SORREND:
1. Ha ma KÖLTŐ vagy ÍRÓ születésnapja/halálozása → AKKOR ANNAK A KÖLTŐNEK/ÍRÓNAK válassz egy versét!
   - Példa: Ha ma Szabó Magda születésnapja → válassz Szabó Magda verset
   - Példa: Ha ma Weöres Sándor halála → válassz Weöres Sándor verset
   - NE válassz másik költőt, még ha van is kapcsolat! A születésnapos/elhunyt személy MINDIG PRIORITÁS!

2. Ha ma történelmi ünnep (március 15, október 23, június 4, augusztus 20) → válassz tematikusan kapcsolódó verset

3. Ha szezonális kapcsolat (ősz, tél, karácsony, stb) → válassz tematikus verset

4. Ha normál nap → válassz egy szép, jelentős klasszikus verset

FONTOS KÖLTŐK/ÍRÓK (akik verseket is írtak): 
Petőfi Sándor, József Attila, Ady Endre, Radnóti Miklós, Arany János, Kosztolányi Dezső, Juhász Gyula, Babits Mihály, Weöres Sándor, Szabó Lőrinc, Dsida Jenő, Reményik Sándor, Szabó Magda, Pilinszky János, Nemes Nagy Ágnes

INDOKLÁS SZABÁLY:
- MAXIMUM 120 karakter! (NE írj többet!)
- Rövid, lényegre törő
- Példa: "Ma Szabó Magda születésnapja, aki József Attila-díjas író és költő volt." (79 kar)

VÁLASZ FORMÁTUM (CSAK VALID JSON):
{
  "title": "Vers címe",
  "author": "Költő neve",
  "text": "A teljes vers szövege\\nÚjsor karakterrel\\nminden sortörésre",
  "reason": "50-150 karakter indoklás"
}`
          },
          {
            role: 'user',
            content: `Mai dátum: ${dateString} (${dayOfWeek})

Releváns információk a mai napról:
${searchResults}

Válassz egy megfelelő klasszikus magyar verset és írd le a teljes szövegét! Válaszolj CSAK JSON formátumban.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const poemData = JSON.parse(gptResponse.data.choices[0].message.content);
    
    console.log('GPT választás és generálás:');
    console.log('=' .repeat(80));
    console.log(`📖 Vers: "${poemData.title}"`);
    console.log(`✍️  Költő: ${poemData.author}`);
    console.log(`💡 Indoklás: ${poemData.reason}`);
    console.log(`📏 Indoklás hossza: ${poemData.reason.length} karakter`);
    console.log('=' .repeat(80));

    // Display the generated poem
    console.log('\n📜 GPT ÁLTAL GENERÁLT VERS SZÖVEGE:');
    console.log('-'.repeat(80));
    console.log(poemData.text);
    console.log('-'.repeat(80));

    // Evaluation
    console.log('\n📊 ÉRTÉKELÉS:');
    console.log('-'.repeat(80));
    let score = 0;
    
    // Check if poem text is present and reasonable
    if (poemData.text && poemData.text.length > 50) {
      console.log(`✅ Vers szövege generálva (${poemData.text.length} karakter) (+20 pont)`);
      score += 20;
    } else {
      console.log('❌ Vers szövege hiányzik vagy túl rövid (0 pont)');
    }

    // Check title and author are present
    if (poemData.title && poemData.author) {
      console.log(`✅ Cím és szerző kitöltve (+10 pont)`);
      score += 10;
    } else {
      console.log('❌ Cím vagy szerző hiányzik (0 pont)');
    }

    if (poemData.reason.length >= 50 && poemData.reason.length <= 150) {
      console.log(`✅ Indoklás hossza megfelelő: ${poemData.reason.length} karakter (+15 pont)`);
      score += 15;
    } else {
      console.log(`⚠️  Indoklás hossza nem megfelelő: ${poemData.reason.length} karakter (+5 pont)`);
      score += 5;
    }

    if (poemData.reason.toLowerCase().includes('ma') || 
        poemData.reason.toLowerCase().includes('október') ||
        poemData.reason.toLowerCase().includes(today.getDate().toString())) {
      console.log('✅ Dátumra hivatkozik (+5 pont)');
      score += 5;
    } else {
      console.log('⚠️  Nem hivatkozik a dátumra (+0 pont)');
    }

    console.log('-'.repeat(80));
    console.log(`🎯 ÖSSZPONTSZÁM: ${score}/50`);
    console.log('\n💡 MEGJEGYZÉS: A vers valódiságát manuálisan ellenőrizd!\n');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n❌ HIBA TÖRTÉNT:');
    console.error(error.response?.data || error.message);
  }
}

testTodayPoem();

