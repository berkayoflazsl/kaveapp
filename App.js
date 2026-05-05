import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AstroSection from './components/AstroSection';
import { useTokens } from './contexts/TokenContext';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { API_URL, MAX_IMAGES, MIN_IMAGES } from './constants/config';
import { authHeaders, saveReading } from './lib/api';
import { birthWallTimeToIso } from './lib/birthWallTimeToIso';
import { resetEntireSessionState } from './lib/fortuneResetState';
import { TAROT_CARDS } from './lib/tarotConstants';
import { FORTUNE_TYPE, ASTRO_MODE } from './lib/fortuneAstroTypes';
import { styles } from './styles/homeScreenStyles';
import AppHeader from './components/home/AppHeader';
import FortuneTypeGrid from './components/home/FortuneTypeGrid';
import FortuneChatPanel from './components/home/FortuneChatPanel';
import { useDatePickerLocale } from './hooks/useDatePickerLocale';
import { useRandomFalci } from './hooks/useRandomFalci';

export default function App() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const rastgeleFalci = useRandomFalci();
  const datePickerLocale = useDatePickerLocale(i18n);
  const { session, signOut } = useAuth();
  const { tokens, setFromServer, refreshBalance } = useTokens();
  const { isDarkMode, toggleTheme, themeColors } = useTheme();

  const persistReading = (type, content, metadata = {}) => {
    if (session && content) {
      saveReading(session, { type, content, metadata }).catch(() => {});
    }
  };

  const [selectedFortune, setSelectedFortune] = useState(null); // 'kahve' or 'tarot' or 'ruya' or 'astroloji'
  const [images, setImages] = useState([]);
  const [dreamText, setDreamText] = useState('');
  const [birthDateTime, setBirthDateTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [birthCountryKey, setBirthCountryKey] = useState(null);
  const [birthCity, setBirthCity] = useState(null);
  const [astrologyChart, setAstrologyChart] = useState(null);
  /** null = mod hub, natal|transit|synastry = ilgili akış */
  const [astroMode, setAstroMode] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermissionInfo, requestCameraPermission] = useCameraPermissions();
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // Tarot states
  const [selectedCards, setSelectedCards] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Chat messages: { id, role: 'user'|'assistant', type, content?, images?, cards? }
  const [chatMessages, setChatMessages] = useState([]);
  const [followUpText, setFollowUpText] = useState('');
  const [currentFalci, setCurrentFalci] = useState(null); // { name, trait } - aynı konuşmada sabit

  // Tarot seçilince otomatik karıştır
  useEffect(() => {
    if (selectedFortune === 'tarot' && shuffledDeck.length === 0) {
      shuffleAndDrawCards();
    }
  }, [selectedFortune]);

  // Chat welcome mesajı - falcı profili oluştur
  useEffect(() => {
    if (selectedFortune && ['kahve', 'tarot', 'ruya'].includes(selectedFortune)) {
      const falci = rastgeleFalci();
      setCurrentFalci(falci);
      const msgs = {
        kahve: t('app.welcomeKahve', { name: falci.name }),
        tarot: t('app.welcomeTarot', { name: falci.name }),
        ruya: t('app.welcomeRuya', { name: falci.name }),
      };
      setChatMessages([{ id: 'welcome', role: 'assistant', type: 'text', content: msgs[selectedFortune] }]);
    } else {
      setChatMessages([]);
      setCurrentFalci(null);
    }
  }, [selectedFortune, t, i18n.language, rastgeleFalci]);

  const ensureCameraPermission = async () => {
    if (cameraPermissionInfo?.granted) return true;
    const result = await requestCameraPermission();
    return result?.granted ?? false;
  };

  const takePhoto = async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
      Alert.alert(t('app.permissionCameraTitle'), t('app.permissionCameraBody'));
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
      setFortune(null);
      animateButton();
    }
  };

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(t('app.maxPhotosTitle'), t('app.maxPhotosBody', { max: MAX_IMAGES }));
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('app.permissionGalleryTitle'), t('app.permissionGalleryBody'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES - images.length,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages([...images, ...newImages]);
        setFortune(null);
        animateButton();
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert(t('common.error'), t('app.galleryErrorBody'));
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const getFortune = async () => {
    if (images.length < MIN_IMAGES) {
      Alert.alert(t('app.minPhotosTitle'), t('app.minPhotosBody', { min: MIN_IMAGES }));
      return;
    }
    
    if (tokens < 1) {
      Alert.alert(
        t('app.diamondTitleEmoji'),
        t('app.diamondBodyLong'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.getDiamonds'), onPress: () => router.push('/tokens') }
        ]
      );
      return;
    }

    setLoading(true);
    setFortune(null);

    try {
      const formData = new FormData();
      images.forEach((uri, index) => {
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: `fortune_${index}.jpg`,
        });
      });
      if (currentFalci) formData.append('persona', JSON.stringify(currentFalci));

      const response = await fetch(`${API_URL}/api/fortune`, {
        method: 'POST',
        headers: { ...authHeaders(session) },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut();
          router.replace('/login');
          return;
        }
        if (response.status === 402) {
          const j = await response.json().catch(() => ({}));
          if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
          else refreshBalance();
          Alert.alert(t('app.diamondTitleEmoji'), t('app.fortuneInsufficientShort'));
          return;
        }
        throw new Error(t('app.apiError'));
      }

      const data = await response.json();
      if (typeof data.diamonds === 'number') setFromServer(data.diamonds);
      const userMsg = { id: Date.now().toString(), role: 'user', type: 'images', images: [...images] };
      const astMsg = { id: (Date.now() + 1).toString(), role: 'assistant', type: 'text', content: data.fortune };
      setChatMessages(prev => [...prev.filter(m => m.id !== 'welcome'), userMsg, astMsg]);
      setFortune(data.fortune);
      setAstrologyChart(null);
      persistReading('kahve', data.fortune, { images: images.length });
      animateButton();
    } catch (error) {
      console.error('Fortune error:', error);
      Alert.alert(t('common.error'), t('app.fortuneReadError'));
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // chatMessages → API messages formatı (OpenAI {role, content})
  const chatMessagesToApiMessages = (msgs) => {
    return msgs
      .filter(m => m.id !== 'welcome')
      .map(m => {
        if (m.role === 'user') {
          if (m.type === 'cards' && m.cards?.length) {
            const cardList = m.cards.map((c, i) => `${i + 1}. ${t(`tarot.c${c.id}`)} (${c.name})`).join('\n');
            return { role: 'user', content: t('app.userCardPrompt', { list: cardList }) };
          }
          if (m.type === 'images') {
            return { role: 'user', content: t('app.userCoffeeUpload') };
          }
          if (m.type === 'text' && m.content && String(m.content).trim()) return { role: 'user', content: String(m.content).trim() };
        }
        if (m.role === 'assistant' && m.content && String(m.content).trim()) return { role: 'assistant', content: String(m.content).trim() };
        return null;
      })
      .filter(Boolean);
  };

  const sendFollowUp = async () => {
    const text = followUpText.trim();
    if (!text || loading) return;
    if (tokens < 1) {
      Alert.alert(t('app.followUpTitle'), t('app.followUpBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.getDiamonds'), onPress: () => router.push('/tokens') }
      ]);
      return;
    }

    const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    const streamMsgId = (Date.now() + 1).toString();
    const astMsg = { id: streamMsgId, role: 'assistant', type: 'text', content: '' };
    setChatMessages(prev => [...prev, userMsg, astMsg]);
    setFollowUpText('');
    setLoading(true);

    const apiMessages = [...chatMessagesToApiMessages(chatMessages), { role: 'user', content: text }];

    try {
      if (selectedFortune === 'tarot') {
        let fullContent = '';
        const response = await fetch(`${API_URL}/api/tarot/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders(session) },
          body: JSON.stringify({ messages: apiMessages, persona: currentFalci }),
        });
        if (response.status === 401) {
          await signOut();
          router.replace('/login');
          return;
        }
        if (response.status === 402) {
          const j = await response.json().catch(() => ({}));
          if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
          else refreshBalance();
          Alert.alert(t('app.followUpTitle'), t('app.followUpBody'));
          return;
        }
        if (!response.ok) {
          const errBody = await response.text();
          let errMsg = t('app.apiError');
          try { const j = JSON.parse(errBody); errMsg = j.message || j.error || errMsg; } catch (_) {}
          throw new Error(`${errMsg} (${response.status})`);
        }
        const reader = response.body?.getReader?.();
        if (reader) {
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.diamonds != null) setFromServer(parsed.diamonds);
                  if (parsed.content) { fullContent += parsed.content; setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: fullContent } : m)); }
                  if (parsed.error) throw new Error(parsed.error);
                } catch (e) { if (!(e instanceof SyntaxError)) throw e; }
              }
            }
          }
        } else {
          const respText = await response.text();
          const lines = respText.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.diamonds != null) setFromServer(parsed.diamonds);
                if (parsed.content) fullContent += parsed.content;
              } catch (_) {}
            }
          }
          setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: fullContent } : m));
        }
        setFortune(fullContent);
        persistReading('tarot', fullContent, { followUp: true });
      } else if (selectedFortune === 'ruya') {
        const res = await fetch(`${API_URL}/api/dream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders(session) },
          body: JSON.stringify({ messages: apiMessages, persona: currentFalci }),
        });
        if (res.status === 401) { await signOut(); router.replace('/login'); return; }
        if (res.status === 402) {
          const j = await res.json().catch(() => ({}));
          if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
          else refreshBalance();
          Alert.alert(t('app.followUpTitle'), t('app.followUpBody'));
          return;
        }
        if (!res.ok) {
          const errBody = await res.text();
          let errMsg = t('app.apiError');
          try { const j = JSON.parse(errBody); errMsg = j.message || j.error || errMsg; } catch (_) {}
          throw new Error(`${errMsg} (${res.status})`);
        }
        const data = await res.json();
        if (typeof data.diamonds === 'number') setFromServer(data.diamonds);
        setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: data.interpretation } : m));
        setFortune(data.interpretation);
        persistReading('ruya', data.interpretation, { followUp: true });
      } else if (selectedFortune === 'kahve') {
        const res = await fetch(`${API_URL}/api/fortune/continue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders(session) },
          body: JSON.stringify({ messages: apiMessages, persona: currentFalci }),
        });
        if (res.status === 401) { await signOut(); router.replace('/login'); return; }
        if (res.status === 402) {
          const j = await res.json().catch(() => ({}));
          if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
          else refreshBalance();
          Alert.alert(t('app.followUpTitle'), t('app.followUpBody'));
          return;
        }
        if (!res.ok) {
          const errBody = await res.text();
          let errMsg = t('app.apiError');
          try { const j = JSON.parse(errBody); errMsg = j.message || j.error || errMsg; } catch (_) {}
          throw new Error(`${errMsg} (${res.status})`);
        }
        const data = await res.json();
        if (typeof data.diamonds === 'number') setFromServer(data.diamonds);
        setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: data.fortune } : m));
        setFortune(data.fortune);
        persistReading('kahve', data.fortune, { followUp: true });
      }
    } catch (e) {
      console.error('Follow-up error:', e);
      setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: t('app.streamMessageFail') } : m));
      Alert.alert(t('common.error'), e.message || t('app.followUpError'));
    } finally {
      setLoading(false);
    }
  };

  const shuffleAndDrawCards = () => {
    setSelectedCards([]);
    setCurrentCardIndex(0);
    
    // Kartları karıştır ve hemen göster
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    setShuffledDeck(shuffled);
  };

  const drawNextCard = () => {
    if (currentCardIndex >= shuffledDeck.length) {
      Alert.alert(t('common.warning'), t('app.tarotAllDrawn'));
      return;
    }

    if (selectedCards.length >= 3) {
      Alert.alert(t('common.ok'), t('app.tarotThreeReady'));
      return;
    }

    const drawnCard = shuffledDeck[currentCardIndex];
    setSelectedCards([...selectedCards, drawnCard]);
    setCurrentCardIndex(currentCardIndex + 1);
  };

  const getTarotReading = async () => {
    if (selectedCards.length !== 3) {
      Alert.alert(t('common.warning'), t('app.tarotNeedShuffle'));
      return;
    }

    if (tokens < 1) {
      Alert.alert(
        t('app.diamondTitleEmoji'),
        t('app.tarotDiamondBody'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.getDiamonds'), onPress: () => router.push('/tokens') }
        ]
      );
      return;
    }

    setLoading(true);
    const userMsg = { id: Date.now().toString(), role: 'user', type: 'cards', cards: [...selectedCards] };
    const streamMsgId = (Date.now() + 1).toString();
    const astMsg = { id: streamMsgId, role: 'assistant', type: 'text', content: '' };
    setChatMessages(prev => [...prev.filter(m => m.id !== 'welcome'), userMsg, astMsg]);
    let fullContent = '';

    try {
      const response = await fetch(`${API_URL}/api/tarot/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(session) },
        body: JSON.stringify({
          cards: selectedCards.map(c => ({ name: c.name, nameTr: t(`tarot.c${c.id}`) })),
          persona: currentFalci,
        }),
      });
      if (response.status === 401) { await signOut(); router.replace('/login'); return; }
      if (response.status === 402) {
        const j = await response.json().catch(() => ({}));
        if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
        else refreshBalance();
        Alert.alert(t('app.diamondTitleEmoji'), t('app.tarotInsufficientShort'));
        return;
      }
      if (!response.ok) throw new Error(t('app.apiError'));

      const reader = response.body?.getReader?.();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.diamonds != null) setFromServer(parsed.diamonds);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setChatMessages(prev =>
                    prev.map(m => (m.id === streamMsgId ? { ...m, content: fullContent } : m))
                  );
                }
                if (parsed.error) throw new Error(parsed.error);
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
            }
          }
        }
      } else {
        const text = await response.text();
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.diamonds != null) setFromServer(parsed.diamonds);
              if (parsed.content) fullContent += parsed.content;
              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              if (!(e instanceof SyntaxError)) throw e;
            }
          }
        }
        setChatMessages(prev =>
          prev.map(m => (m.id === streamMsgId ? { ...m, content: fullContent } : m))
        );
      }

      setFortune(fullContent);
      setAstrologyChart(null);
      const cardNames = selectedCards.map(c => t(`tarot.c${c.id}`)).join(', ');
      persistReading('tarot', fullContent, { cards: cardNames });
    } catch (error) {
      console.error('Tarot error:', error);
      setChatMessages(prev =>
        prev.map(m =>
          m.id === streamMsgId ? { ...m, content: fullContent || t('app.tarotStreamFail') } : m
        )
      );
      if (!fullContent) Alert.alert(t('common.error'), t('app.tarotReadError'));
    } finally {
      setLoading(false);
    }
  };

  const getAstrologyReading = async () => {
    if (!birthDateTime || !birthCity) {
      Alert.alert(t('common.warning'), t('app.astrologyFill'));
      return;
    }
    let datetime;
    try {
      datetime = birthWallTimeToIso(birthDateTime, birthCity.ianaTz || 'Europe/Istanbul');
    } catch (e) {
      Alert.alert(t('common.error'), t('app.chartError'));
      return;
    }

    if (tokens < 1) {
      Alert.alert(
        t('app.diamondTitleEmoji'),
        t('app.astrologyDiamondBody'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.getDiamonds'), onPress: () => router.push('/tokens') }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/astrology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(session) },
        body: JSON.stringify({
          datetime,
          latitude: birthCity.lat,
          longitude: birthCity.lon,
          timezone: birthCity.ianaTz || 'Europe/Istanbul',
        }),
      });
      if (response.status === 401) { await signOut(); router.replace('/login'); return; }
      if (response.status === 402) {
        const j = await response.json().catch(() => ({}));
        if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
        else refreshBalance();
        Alert.alert(t('app.diamondTitleEmoji'), t('app.astrologyInsufficientShort'));
        return;
      }
      if (!response.ok) throw new Error(t('app.apiError'));
      const data = await response.json();
      if (typeof data.diamonds === 'number') setFromServer(data.diamonds);
      setFortune(data.interpretation);
      setAstrologyChart(data.chart || null);
      persistReading(FORTUNE_TYPE.ASTRO, data.interpretation, { city: birthCity ? t(`cities.${birthCity.key}`) : undefined });
    } catch (error) {
      console.error('Astrology error:', error);
      Alert.alert(t('common.error'), t('app.chartError'));
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderBack = useCallback(() => {
    if (selectedFortune === FORTUNE_TYPE.ASTRO && fortune) {
      setFortune(null);
      setAstrologyChart(null);
      setAstroMode(ASTRO_MODE.NATAL);
      return;
    }
    if (selectedFortune === FORTUNE_TYPE.ASTRO && !fortune && astroMode) {
      setAstroMode(ASTRO_MODE.HUB);
      return;
    }
    resetEntireSessionState({
      setSelectedFortune,
      setAstroMode,
      setImages,
      setDreamText,
      setBirthDateTime,
      setBirthCountryKey,
      setBirthCity,
      setAstrologyChart,
      setSelectedCards,
      setShuffledDeck,
      setCurrentCardIndex,
      setFortune,
      setChatMessages,
      setCurrentFalci,
    });
  }, [selectedFortune, fortune, astroMode]);

  const interpretDream = async () => {
    if (dreamText.trim().length < 20) {
      Alert.alert(t('common.warning'), t('app.dreamMinChars'));
      return;
    }
    if (tokens < 1) {
      Alert.alert(t('app.dreamDiamondTitle'), '', [
        { text: t('common.cancel') },
        { text: t('common.getDiamonds'), onPress: () => router.push('/tokens') },
      ]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(session) },
        body: JSON.stringify({ dream: dreamText, persona: currentFalci }),
      });
      if (res.status === 401) {
        await signOut();
        router.replace('/login');
        return;
      }
      if (res.status === 402) {
        const j = await res.json().catch(() => ({}));
        if (typeof j.diamonds === 'number') setFromServer(j.diamonds);
        else refreshBalance();
        Alert.alert(t('app.followUpTitle'), t('app.dreamInsufficient'));
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (typeof data.diamonds === 'number') setFromServer(data.diamonds);
      const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: dreamText.trim() };
      const astMsg = { id: (Date.now() + 1).toString(), role: 'assistant', type: 'text', content: data.interpretation };
      setChatMessages((prev) => [...prev.filter((m) => m.id !== 'welcome'), userMsg, astMsg]);
      setFortune(data.interpretation);
      persistReading('ruya', data.interpretation, { length: dreamText.trim().length });
    } catch (e) {
      Alert.alert(t('common.error'), t('app.retry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <AppHeader
        styles={styles}
        themeColors={themeColors}
        t={t}
        tokens={tokens}
        selectedFortune={selectedFortune}
        onBack={handleHeaderBack}
        onHistory={() => router.push('/history')}
        onSettings={() => router.push('/settings')}
        onTokens={() => router.push('/tokens')}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {!selectedFortune && (
          <FortuneTypeGrid
            styles={styles}
            themeColors={themeColors}
            t={t}
            onSelectKahve={() => setSelectedFortune('kahve')}
            onSelectTarot={() => setSelectedFortune('tarot')}
            onSelectRuya={() => setSelectedFortune('ruya')}
            onSelectAstro={() => {
              setAstroMode(ASTRO_MODE.HUB);
              setSelectedFortune(FORTUNE_TYPE.ASTRO);
            }}
          />
        )}

        {selectedFortune && ['kahve', 'tarot', 'ruya'].includes(selectedFortune) && (
          <FortuneChatPanel
            styles={styles}
            themeColors={themeColors}
            t={t}
            selectedFortune={selectedFortune}
            chatMessages={chatMessages}
            loading={loading}
            currentFalci={currentFalci}
            fortune={fortune}
            images={images}
            pickImage={pickImage}
            takePhoto={takePhoto}
            removeImage={removeImage}
            getFortune={getFortune}
            selectedCards={selectedCards}
            drawNextCard={drawNextCard}
            getTarotReading={getTarotReading}
            dreamText={dreamText}
            setDreamText={setDreamText}
            interpretDream={interpretDream}
            followUpText={followUpText}
            setFollowUpText={setFollowUpText}
            sendFollowUp={sendFollowUp}
            onNewFortune={() => {
              resetEntireSessionState({
                setSelectedFortune,
                setAstroMode,
                setImages,
                setDreamText,
                setBirthDateTime,
                setBirthCountryKey,
                setBirthCity,
                setAstrologyChart,
                setSelectedCards,
                setShuffledDeck,
                setCurrentCardIndex,
                setFortune,
                setChatMessages,
                setCurrentFalci,
                setFollowUpText,
              });
            }}
          />
        )}

        {selectedFortune === FORTUNE_TYPE.ASTRO && (
          <AstroSection
            styles={styles}
            t={t}
            themeColors={themeColors}
            fortune={fortune}
            astroMode={astroMode}
            setAstroMode={setAstroMode}
            birthDateTime={birthDateTime}
            setBirthDateTime={setBirthDateTime}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            showTimePicker={showTimePicker}
            setShowTimePicker={setShowTimePicker}
            birthCountryKey={birthCountryKey}
            setBirthCountryKey={setBirthCountryKey}
            birthCity={birthCity}
            setBirthCity={setBirthCity}
            datePickerLocale={datePickerLocale}
            getAstrologyReading={getAstrologyReading}
            loading={loading}
            astrologyChart={astrologyChart}
            setFortune={setFortune}
            setAstrologyChart={setAstrologyChart}
          />
        )}

      </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Theme Toggle Button */}
      <TouchableOpacity
        style={[styles.floatingThemeButton, { backgroundColor: themeColors.card }]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <Text style={styles.themeButtonIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
