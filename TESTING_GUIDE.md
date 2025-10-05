# AI Accuracy Testing Guide

## 🧪 How to Test Your App's AI

### Method 1: Automated Script

Run the testing script:
```bash
cd "/Users/matedort/vers app"
node test-ai-accuracy.js
```

This will test:
- ✅ 10 poem selections across different dates
- ✅ 3 author biographies
- ✅ Accuracy scores for each
- ✅ Overall AI performance rating

**Expected Output:**
- Individual scores for each test (0-100)
- Average scores
- Overall AI accuracy rating
- Recommendations

---

### Method 2: Manual Testing in App

#### Test Poem Selection:

1. Open the app
2. Clear app data (Settings → Apps → Napi Vers → Clear Storage)
3. Reopen app
4. Check the poem and reason badge

**Evaluation Criteria (0-100):**

| Criteria | Points | Check |
|----------|--------|-------|
| Poem exists in collection | 20 | ✓ Verify poem is real |
| Relevant to date | 30 | ✓ Makes sense for today? |
| Reason quality | 30 | ✓ Well-written explanation |
| Historical accuracy | 20 | ✓ Facts are correct |

#### Test Author Info:

1. Tap "A költő" button
2. Read the biography

**Evaluation Criteria (0-100):**

| Criteria | Points | Check |
|----------|--------|-------|
| Contains dates | 20 | ✓ Birth/death years present |
| Good length | 20 | ✓ 300-1500 characters |
| Mentions works | 10 | ✓ Lists poems/writings |
| Mentions style | 10 | ✓ Describes artistic style |
| Life events | 10 | ✓ Key biographical facts |
| Hungarian context | 30 | ✓ Cultural references |

#### Test Poem Backstory:

1. Tap "A vers mögött" button
2. Read the backstory

**Evaluation Criteria (0-100):**

| Criteria | Points | Check |
|----------|--------|-------|
| Creation context | 30 | ✓ When/why written |
| Literary analysis | 25 | ✓ Meaning explained |
| Historical impact | 20 | ✓ Significance discussed |
| Good length | 15 | ✓ Comprehensive |
| Engaging style | 10 | ✓ Interesting to read |

---

## 📊 Expected Scores

### Excellent Performance: 85-100
- Poem selections are highly relevant
- Author bios are comprehensive and accurate
- Backstories are well-researched
- ✅ Ready for publication!

### Good Performance: 70-84
- Most selections make sense
- Generally accurate information
- Minor improvements possible
- ✅ Acceptable for launch

### Fair Performance: 50-69
- Some questionable selections
- Information quality varies
- ⚠️ Consider prompt improvements

### Poor Performance: Below 50
- Frequent incorrect selections
- Inaccurate or incomplete info
- ❌ Prompts need revision

---

## 🔍 What to Look For

### Red Flags:
- ❌ Poem doesn't exist in collection
- ❌ Completely wrong dates
- ❌ Factual errors about poets
- ❌ Generic non-Hungarian content
- ❌ Reasons don't match dates

### Green Flags:
- ✅ Contextually appropriate poems
- ✅ Accurate historical dates
- ✅ Rich, detailed biographies
- ✅ Cultural authenticity
- ✅ Engaging, informative content

---

## 🛠️ Improving Scores

If scores are low, you can:

1. **Adjust temperature** in prompts (lower = more factual)
2. **Add more context** to system prompts
3. **Increase max_tokens** for longer responses
4. **Add validation** checks in code
5. **Expand poem collection** for better matching

---

## 📝 Testing Log Template

Use this to track your tests:

```
Date: _____________
Test Type: Poem Selection / Author Info / Backstory

Selection/Content:
_________________________________

Accuracy Score: ____/100

Issues Found:
- 
- 

Strengths:
- 
- 

Overall Rating: Excellent / Good / Fair / Poor
```

---

## 🎯 Quality Benchmarks

### Poem Selection (Historical Dates)
- **April 11**: Should select József Attila (his birthday)
- **March 15**: Should select Petőfi (1848 Revolution)
- **Random days**: Any meaningful selection with good reason

### Author Biographies Should Include:
- Birth/death years (e.g., "1905-1937")
- Major life events
- Literary style description
- Famous works mentioned
- Hungarian cultural context

### Poem Backstories Should Include:
- When written
- Why written (context)
- Literary significance
- Historical impact
- Interesting anecdotes

---

Run the automated test now to get your baseline scores!

