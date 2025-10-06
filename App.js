import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// Removed hardcoded poems - GPT generates from knowledge
import * as NavigationBar from 'expo-navigation-bar';
import { useFonts, DancingScript_400Regular } from '@expo-google-fonts/dancing-script';

const OPENAI_API_KEY = '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';
const SERPER_API_KEY = '4c05eab623aba7e8c8eede5ea9d34ea8a3a128d3';

export default function App() {
  const [currentPoem, setCurrentPoem] = useState(null);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showPoemModal, setShowPoemModal] = useState(false);
  const [authorInfo, setAuthorInfo] = useState('');
  const [poemInfo, setPoemInfo] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  
  // Chat states
  const [showAuthorChat, setShowAuthorChat] = useState(false);
  const [showPoemChat, setShowPoemChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [authorChatMessages, setAuthorChatMessages] = useState([]);
  const [poemChatMessages, setPoemChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isSelectingPoem, setIsSelectingPoem] = useState(false);
  const scrollViewRef = useRef();

  // Load custom font for Android
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });

  useEffect(() => {
    loadTodaysPoem();
    
    // Set Android navigation bar color to butter
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#F5DEB3');
      NavigationBar.setButtonStyleAsync('dark');
    }
    
    // Check for midnight and update poem
    const interval = setInterval(() => {
      checkAndUpdatePoem();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const loadTodaysPoem = async () => {
    try {
      const todayDate = getTodayDateString();
      const storedDate = await AsyncStorage.getItem('poemDate');
      const storedPoemData = await AsyncStorage.getItem('poemData');

      console.log('📅 Today:', todayDate, '| Stored:', storedDate, '| Has data:', !!storedPoemData);

      if (storedDate === todayDate && storedPoemData) {
        // Use stored poem for today
        console.log('📖 Loading cached poem for today');
        const poem = JSON.parse(storedPoemData);
        setCurrentPoem(poem);
      } else {
        // Select new poem with GPT
        console.log('🔄 Generating new poem for:', todayDate, '(stored date was:', storedDate, ')');
        await selectNewPoem();
      }
    } catch (error) {
      console.error('Error loading poem:', error);
      // Don't retry immediately to avoid rate limits
      Alert.alert(
        'Hiba',
        'Nem sikerült betölteni a verset. Kérlek, próbáld újra később.',
        [{ text: 'OK' }]
      );
    }
  };

  const selectNewPoem = async () => {
    // Prevent multiple simultaneous calls
    if (isSelectingPoem) {
      console.log('⏳ Already selecting a poem, skipping...');
      return;
    }
    
    setIsSelectingPoem(true);
    
    try {
      // Get today's date information
      const today = new Date();
      const dateString = `${today.getFullYear()}. ${today.toLocaleString('hu-HU', { month: 'long' })} ${today.getDate()}.`;
      const dayOfWeek = today.toLocaleString('hu-HU', { weekday: 'long' });
      
      // Use Serper to find relevant historical events, author birthdays, etc.
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

      // Ask GPT to choose a relevant Hungarian poem from its knowledge and write it out
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
      
      // Create poem object with GPT-generated data
      const poem = {
        title: poemData.title,
        author: poemData.author,
        text: poemData.text,
        dailyReason: poemData.reason
      };

      // Set the current poem
      setCurrentPoem(poem);
      
      // Save poem data to AsyncStorage
      await AsyncStorage.setItem('poemData', JSON.stringify(poem));
      await AsyncStorage.setItem('poemDate', getTodayDateString());
      
      console.log('✅ Poem selected:', poemData.title, 'by', poemData.author);
      
    } catch (error) {
      console.error('Error selecting poem:', error);
      
      // Keep using the old cached poem if generation fails
      const storedPoemData = await AsyncStorage.getItem('poemData');
      if (storedPoemData) {
        console.log('⚠️ API failed, using cached poem as fallback');
        const poem = JSON.parse(storedPoemData);
        setCurrentPoem(poem);
      } else {
        // Show error to user with rate limit handling
        const errorMessage = error.response?.status === 429 
          ? 'Túl sok kérés. Kérlek, várj néhány másodpercet és próbáld újra.'
          : 'Nem sikerült betölteni a mai verset. Kérlek, ellenőrizd az internetkapcsolatot és próbáld újra.';
        
        Alert.alert(
          'Hiba',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSelectingPoem(false);
    }
  };

  const checkAndUpdatePoem = async () => {
    const todayDate = getTodayDateString();
    const storedDate = await AsyncStorage.getItem('poemDate');
    
    if (storedDate !== todayDate) {
      console.log('🌙 Midnight passed! New day detected. Generating new poem...');
      console.log('Previous date:', storedDate, '→ Today:', todayDate);
      await selectNewPoem();
    }
  };

  const showLoadingSteps = async () => {
    setShowLoadingModal(true);
    setLoadingMessage('Gondolkodom...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoadingMessage('Keresem az információt...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingMessage('Feldolgozom...');
  };

  const fetchAuthorInfo = async () => {
    if (authorInfo) {
      setShowAuthorModal(true);
      return;
    }

    await showLoadingSteps();
    
    try {
      // First, get additional info from Serper
      const serperResponse = await axios.post(
        'https://google.serper.dev/search',
        {
          q: `${currentPoem.author} magyar költő életrajz`,
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

      // Use GPT to create a comprehensive author bio
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
              content: `Írj egy érdekes és részletes életrajzot ${currentPoem.author} költőről.

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

      const info = gptResponse.data.choices[0].message.content;
      setAuthorInfo(info);
      setShowLoadingModal(false);
      setShowAuthorModal(true);
    } catch (error) {
      console.error('Error fetching author info:', error);
      setAuthorInfo('Sajnos most nem sikerült betölteni a költő információit. Kérlek, próbáld újra később.');
      setShowLoadingModal(false);
      setShowAuthorModal(true);
    }
  };

  const fetchPoemInfo = async () => {
    if (poemInfo) {
      setShowPoemModal(true);
      return;
    }

    await showLoadingSteps();
    
    try {
      // Get info about the poem from Serper
      const serperResponse = await axios.post(
        'https://google.serper.dev/search',
        {
          q: `"${currentPoem.title}" ${currentPoem.author} elemzés`,
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

      // Use GPT to create interesting facts about the poem
      const gptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Te egy magyar irodalmi szakértő vagy. Mesélj érdekes történeteket és tényeket magyar versekről, beleértve a keletkezésük körülményeit és jelentésüket.'
            },
            {
              role: 'user',
              content: `Mesélj érdekes történeteket és tényeket "${currentPoem.title}" című versről, amit ${currentPoem.author} írt. Írd le, mikor és milyen körülmények között született, mit fejez ki, milyen hatása volt, és más érdekes részleteket. Itt van néhány információ: ${searchResults}`
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

      const info = gptResponse.data.choices[0].message.content;
      setPoemInfo(info);
      setShowLoadingModal(false);
      setShowPoemModal(true);
    } catch (error) {
      console.error('Error fetching poem info:', error);
      setPoemInfo('Sajnos most nem sikerült betölteni a vers történetét. Kérlek, próbáld újra később.');
      setShowLoadingModal(false);
      setShowPoemModal(true);
    }
  };

  const handleChatSend = async (isAuthor) => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    const setMessages = isAuthor ? setAuthorChatMessages : setPoemChatMessages;
    const currentMessages = isAuthor ? authorChatMessages : poemChatMessages;
    
    setChatInput('');
    setChatLoading(true);
    
    // Add user message immediately to UI
    setMessages(prev => [...prev, userMessage]);

    try {
      const context = isAuthor ? 
        `A költő neve: ${currentPoem.author}. Amit eddig tudunk róla: ${authorInfo}` :
        `A vers címe: "${currentPoem.title}", írta: ${currentPoem.author}. Amit eddig tudunk róla: ${poemInfo}`;

      // Build complete message history for GPT (excluding initial greeting for cleaner context)
      const conversationHistory = currentMessages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes('Mit szeretnél'))
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      const gptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Te egy magyar irodalmi szakértő vagy. ${context}. Válaszolj a felhasználó kérdéseire magyarul, szakértő módon de barátságosan.`
            },
            ...conversationHistory,
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiMessage = {
        role: 'assistant',
        content: gptResponse.data.choices[0].message.content
      };
      
      // Add AI response to current messages
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sajnos hiba történt. Próbáld újra!'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Wait for fonts to load on Android
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!currentPoem) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F5DEB3"
        translucent={true}
      />
      
      <View style={styles.poemContainer}>
        {currentPoem.dailyReason && (
          <View style={styles.reasonBadge}>
            <Text style={styles.reasonText}>💡 {currentPoem.dailyReason}</Text>
          </View>
        )}
        <ScrollView 
          style={styles.poemScrollView}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
        >
          <Text style={styles.poemText}>
            "{currentPoem.text}"
          </Text>
          <Text style={styles.authorText}>
            — {currentPoem.author}
          </Text>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchAuthorInfo}
        >
          <Text style={styles.buttonText}>A költő</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchPoemInfo}
        >
          <Text style={styles.buttonText}>A vers mögött</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <Modal
        visible={showLoadingModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingModalOverlay}>
          <View style={styles.loadingModalContent}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>

      {/* Author Modal */}
      <Modal
        visible={showAuthorModal}
        animationType="slide"
        onRequestClose={() => {
          setShowAuthorModal(false);
          setShowAuthorChat(false);
        }}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView 
          style={{flex: 1}} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor="#F5DEB3"
            translucent={true}
          />
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScroll} ref={scrollViewRef}>
              <Text style={styles.modalTitle}>{currentPoem.author}</Text>
              <Text style={styles.modalText}>{authorInfo}</Text>
              
              {showAuthorChat && (
                <View style={styles.chatContainer}>
                  {authorChatMessages.map((msg, index) => (
                    <View 
                      key={index} 
                      style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}
                    >
                      <Text style={msg.role === 'user' ? styles.userMessageText : styles.aiMessageText}>
                        {msg.content}
                      </Text>
                    </View>
                  ))}
                  {chatLoading && (
                    <View style={styles.aiMessage}>
                      <ActivityIndicator size="small" color="#000" />
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
            
            {showAuthorChat && (
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Írj ide..."
                  placeholderTextColor="#666"
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={() => handleChatSend(true)}
                  disabled={chatLoading}
                >
                  <Text style={styles.sendButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                  setShowAuthorModal(false);
                  setShowAuthorChat(false);
                }}
              >
                <Text style={styles.closeButtonText}>Bezár</Text>
              </TouchableOpacity>
            </View>

            {!showAuthorChat && (
              <TouchableOpacity 
                style={styles.chatFloatingButton}
                onPress={() => {
                  setShowAuthorChat(true);
                  if (authorChatMessages.length === 0) {
                    setAuthorChatMessages([{
                      role: 'assistant',
                      content: `Mit szeretnél még tudni ${currentPoem.author}-ről?`
                    }]);
                  }
                }}
              >
                <Text style={styles.chatFloatingButtonText}>💬</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Poem Info Modal */}
      <Modal
        visible={showPoemModal}
        animationType="slide"
        onRequestClose={() => {
          setShowPoemModal(false);
          setShowPoemChat(false);
        }}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView 
          style={{flex: 1}} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar 
            barStyle="dark-content" 
            backgroundColor="#F5DEB3"
            translucent={true}
          />
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScroll} ref={scrollViewRef}>
              <Text style={styles.modalTitle}>"{currentPoem.title}"</Text>
              <Text style={styles.modalText}>{poemInfo}</Text>
              
              {showPoemChat && (
                <View style={styles.chatContainer}>
                  {poemChatMessages.map((msg, index) => (
                    <View 
                      key={index} 
                      style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}
                    >
                      <Text style={msg.role === 'user' ? styles.userMessageText : styles.aiMessageText}>
                        {msg.content}
                      </Text>
                    </View>
                  ))}
                  {chatLoading && (
                    <View style={styles.aiMessage}>
                      <ActivityIndicator size="small" color="#000" />
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
            
            {showPoemChat && (
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Írj ide..."
                  placeholderTextColor="#666"
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={() => handleChatSend(false)}
                  disabled={chatLoading}
                >
                  <Text style={styles.sendButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                  setShowPoemModal(false);
                  setShowPoemChat(false);
                }}
              >
                <Text style={styles.closeButtonText}>Bezár</Text>
              </TouchableOpacity>
            </View>

            {!showPoemChat && (
              <TouchableOpacity 
                style={styles.chatFloatingButton}
                onPress={() => {
                  setShowPoemChat(true);
                  if (poemChatMessages.length === 0) {
                    setPoemChatMessages([{
                      role: 'assistant',
                      content: `Mit szeretnél még tudni "${currentPoem.title}" című versről?`
                    }]);
                  }
                }}
              >
                <Text style={styles.chatFloatingButtonText}>💬</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5DEB3',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: Platform.OS === 'android' ? 20 : 40,
    paddingHorizontal: 20,
  },
  poemContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  poemScrollView: {
    flex: 1,
  },
  reasonBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 20,
    maxWidth: '90%',
  },
  reasonText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  poemText: {
    fontSize: Platform.OS === 'android' ? 24 : 40,
    color: '#000',
    textAlign: 'left',
    fontStyle: 'italic',
    lineHeight: Platform.OS === 'android' ? 36 : 56,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'DancingScript-Regular',
    fontWeight: Platform.OS === 'android' ? '400' : 'normal',
    letterSpacing: 0.5,
    marginBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
  },
  authorText: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    color: '#000',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: 'serif',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: Platform.OS === 'android' ? 30 : 0,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5DEB3',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModalContent: {
    backgroundColor: '#F5DEB3',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 250,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5DEB3',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: Platform.OS === 'android' ? 20 : 20,
    paddingHorizontal: 20,
  },
  modalScroll: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 26,
    fontFamily: 'serif',
    textAlign: 'justify',
    marginBottom: 20,
  },
  modalButtonRow: {
    marginTop: 10,
    marginBottom: 0,
  },
  closeButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#F5DEB3',
    fontSize: 16,
    fontWeight: '600',
  },
  chatFloatingButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'android' ? 110 : 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  chatFloatingButtonText: {
    fontSize: 28,
  },
  chatContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  userMessage: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  aiMessage: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#F5DEB3',
    fontSize: 15,
  },
  aiMessageText: {
    color: '#000',
    fontSize: 15,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    paddingBottom: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#F5DEB3',
    fontSize: 24,
    fontWeight: 'bold',
  },
});