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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { hungarianPoems } from './hungarianPoems';

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
  const scrollViewRef = useRef();

  useEffect(() => {
    loadTodaysPoem();
    
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
      const storedPoemIndex = await AsyncStorage.getItem('poemIndex');

      if (storedDate === todayDate && storedPoemIndex !== null) {
        // Use stored poem for today
        setCurrentPoem(hungarianPoems[parseInt(storedPoemIndex)]);
      } else {
        // Select new random poem
        selectNewPoem();
      }
    } catch (error) {
      console.error('Error loading poem:', error);
      selectNewPoem();
    }
  };

  const selectNewPoem = async () => {
    const randomIndex = Math.floor(Math.random() * hungarianPoems.length);
    setCurrentPoem(hungarianPoems[randomIndex]);
    
    try {
      await AsyncStorage.setItem('poemIndex', randomIndex.toString());
      await AsyncStorage.setItem('poemDate', getTodayDateString());
    } catch (error) {
      console.error('Error saving poem:', error);
    }
  };

  const checkAndUpdatePoem = async () => {
    const todayDate = getTodayDateString();
    const storedDate = await AsyncStorage.getItem('poemDate');
    
    if (storedDate !== todayDate) {
      selectNewPoem();
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
              content: `Írj egy érdekes és részletes életrajzot ${currentPoem.author} költőről. Foglald bele a születési és halálozási dátumot, az életének főbb eseményeit, művészi stílusát, és néhány érdekes tényt róla. Itt van néhány információ: ${searchResults}`
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

  if (!currentPoem) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.poemContainer}>
        <Text style={styles.poemText}>
          "{currentPoem.text}"
        </Text>
        <Text style={styles.authorText}>
          — {currentPoem.author}
        </Text>
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
      >
        <KeyboardAvoidingView 
          style={{flex: 1}} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
      >
        <KeyboardAvoidingView 
          style={{flex: 1}} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  poemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  poemText: {
    fontSize: 40,
    color: '#000',
    textAlign: 'left',
    fontStyle: 'italic',
    lineHeight: 56,
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
    letterSpacing: 0.5,
    marginBottom: 30,
    paddingLeft: 20,
  },
  authorText: {
    fontSize: 18,
    color: '#000',
    fontStyle: 'italic',
    marginTop: 10,
    fontFamily: 'serif',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
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
    paddingTop: 60,
    paddingBottom: 20,
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
    bottom: 90,
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