import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import NatalChartWheel from './components/NatalChartWheel';
import { useTokens } from './contexts/TokenContext';
import { useTheme } from './contexts/ThemeContext';

const API_URL = 'http://192.168.1.106:3000';
const { width } = Dimensions.get('window');

// Tarot Major Arcana (22 kart)
const TAROT_CARDS = [
  { id: 0, name: 'The Fool', nameTr: 'Deli', emoji: '🃏' },
  { id: 1, name: 'The Magician', nameTr: 'Sihirbaz', emoji: '🎩' },
  { id: 2, name: 'The High Priestess', nameTr: 'Baş Rahibe', emoji: '👸' },
  { id: 3, name: 'The Empress', nameTr: 'İmparatoriçe', emoji: '👑' },
  { id: 4, name: 'The Emperor', nameTr: 'İmparator', emoji: '🤴' },
  { id: 5, name: 'The Hierophant', nameTr: 'Aziz', emoji: '⛪' },
  { id: 6, name: 'The Lovers', nameTr: 'Âşıklar', emoji: '💑' },
  { id: 7, name: 'The Chariot', nameTr: 'Savaş Arabası', emoji: '🏇' },
  { id: 8, name: 'Strength', nameTr: 'Güç', emoji: '💪' },
  { id: 9, name: 'The Hermit', nameTr: 'Ermiş', emoji: '🧙' },
  { id: 10, name: 'Wheel of Fortune', nameTr: 'Kader Çarkı', emoji: '🎡' },
  { id: 11, name: 'Justice', nameTr: 'Adalet', emoji: '⚖️' },
  { id: 12, name: 'The Hanged Man', nameTr: 'Asılan Adam', emoji: '🙃' },
  { id: 13, name: 'Death', nameTr: 'Ölüm', emoji: '💀' },
  { id: 14, name: 'Temperance', nameTr: 'Denge', emoji: '☯️' },
  { id: 15, name: 'The Devil', nameTr: 'Şeytan', emoji: '😈' },
  { id: 16, name: 'The Tower', nameTr: 'Kule', emoji: '🗼' },
  { id: 17, name: 'The Star', nameTr: 'Yıldız', emoji: '⭐' },
  { id: 18, name: 'The Moon', nameTr: 'Ay', emoji: '🌙' },
  { id: 19, name: 'The Sun', nameTr: 'Güneş', emoji: '☀️' },
  { id: 20, name: 'Judgement', nameTr: 'Yargı', emoji: '⚡' },
  { id: 21, name: 'The World', nameTr: 'Dünya', emoji: '🌍' },
];

// Falcı profilleri - her yeni konuşmada rastgele biri seçilir
const FALCI_PROFILLERI = [
  { name: 'Zeynep', trait: 'Kadıköy\'de 30 yıldır fal bakan, anneannesinden öğrendiği gelenekle. Sıcak ve sezgisel.' },
  { name: 'Ayşe', trait: 'Eminönü\'nde küçük dükkanında 25 yıldır kahve falı bakan. Samimi, doğrudan konuşur.' },
  { name: 'Fatma', trait: 'İstanbul\'da büyümüş, rüya tabirini dedesinden öğrenmiş. Empatik ve içten.' },
  { name: 'Emine', trait: 'Üsküdar\'da 20 yıldır tarot ve kahve falı bakan. Jung\'a meraklı, derin yorumlar yapar.' },
  { name: 'Hatice', trait: 'Beşiktaş\'ta falcılık yapan, geleneksel sembollere hakim. Sakin ve bilge bir üslubu var.' },
  { name: 'Elif', trait: 'Anadolu\'dan İstanbul\'a gelmiş, ailesinden kalan fal geleneğini sürdürüyor. Sıcak ve güven verici.' },
  { name: 'Meryem', trait: 'Kartları ve rüyaları 15 yıldır yorumlayan. Nazik, düşünceli konuşur.' },
  { name: 'Zehra', trait: 'Kadıköy Çarşı\'nda küçük bir dükkanda fal bakan. Espri anlayışı var, rahatlatıcı.' },
  { name: 'Esma', trait: 'İbn-i Sirin geleneğine bağlı rüya yorumcusu. Ciddi ama sıcak bir üslup.' },
  { name: 'Hanife', trait: 'Tarot uzmanı, 18 yıllık tecrübe. Psikolojik derinlik katmayı sever.' },
];

const rastgeleFalci = () => FALCI_PROFILLERI[Math.floor(Math.random() * FALCI_PROFILLERI.length)];

const CITIES = [
  { name: 'İstanbul', lat: 41.0082, lon: 28.9784, tz: '+03:00' },
  { name: 'Ankara', lat: 39.9334, lon: 32.8597, tz: '+03:00' },
  { name: 'İzmir', lat: 38.4237, lon: 27.1428, tz: '+03:00' },
  { name: 'Bursa', lat: 40.1885, lon: 29.0610, tz: '+03:00' },
  { name: 'Antalya', lat: 36.8969, lon: 30.7133, tz: '+03:00' },
  { name: 'Adana', lat: 37.0000, lon: 35.3213, tz: '+03:00' },
  { name: 'Konya', lat: 37.8746, lon: 32.4932, tz: '+03:00' },
  { name: 'Gaziantep', lat: 37.0662, lon: 37.3833, tz: '+03:00' },
  { name: 'Mersin', lat: 36.8121, lon: 34.6415, tz: '+03:00' },
  { name: 'Diyarbakır', lat: 37.9144, lon: 40.2306, tz: '+03:00' },
  { name: 'London', lat: 51.5074, lon: -0.1278, tz: '+00:00' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, tz: '-05:00' },
];

export default function App() {
  const router = useRouter();
  const { tokens, useToken } = useTokens();
  const { isDarkMode, toggleTheme, themeColors } = useTheme();
  
  const [selectedFortune, setSelectedFortune] = useState(null); // 'kahve' or 'tarot' or 'ruya' or 'astroloji'
  const [images, setImages] = useState([]);
  const [dreamText, setDreamText] = useState('');
  const [birthDateTime, setBirthDateTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [birthCity, setBirthCity] = useState(null);
  const [astrologyChart, setAstrologyChart] = useState(null);
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
        kahve: `Merhaba! Ben ${falci.name}. ☕ Fincan fotoğrafını yükle, falını okuyayım.`,
        tarot: `Merhaba! Ben ${falci.name}. 🔮 Geçmiş, şimdi ve gelecek için 3 kart seç.`,
        ruya: `Merhaba! Ben ${falci.name}. 💭 Rüyanı anlat, yorumlayalım (en az 20 karakter).`,
      };
      setChatMessages([{ id: 'welcome', role: 'assistant', type: 'text', content: msgs[selectedFortune] }]);
    } else {
      setChatMessages([]);
      setCurrentFalci(null);
    }
  }, [selectedFortune]);

  const ensureCameraPermission = async () => {
    if (cameraPermissionInfo?.granted) return true;
    const result = await requestCameraPermission();
    return result?.granted ?? false;
  };

  const takePhoto = async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
      Alert.alert('İzin Gerekli', 'Kamera izni gerekli');
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
    if (images.length >= 5) {
      Alert.alert('Maksimum', 'En fazla 5 fotoğraf seçebilirsin');
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye erişim izni gerekli');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages([...images, ...newImages]);
        setFortune(null);
        animateButton();
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert('Hata', 'Galeriden fotoğraf seçilemedi');
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const getFortune = async () => {
    if (images.length === 0) {
      Alert.alert('Uyarı', 'En az 1 fotoğraf seç');
      return;
    }
    
    if (tokens < 1) {
      Alert.alert(
        '💎 Elmas Yetersiz',
        'Falını okumak için elmasın yok. Reklam izleyerek veya satın alarak elmas kazanabilirsin!',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Elmas Al', onPress: () => router.push('/tokens') }
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
        body: formData,
      });

      if (!response.ok) throw new Error('API isteği başarısız');

      const data = await response.json();
      const userMsg = { id: Date.now().toString(), role: 'user', type: 'images', images: [...images] };
      const astMsg = { id: (Date.now() + 1).toString(), role: 'assistant', type: 'text', content: data.fortune };
      setChatMessages(prev => [...prev.filter(m => m.id !== 'welcome'), userMsg, astMsg]);
      setFortune(data.fortune);
      setAstrologyChart(null);
      useToken();
      animateButton();
    } catch (error) {
      console.error('Fortune error:', error);
      Alert.alert('Hata', 'Falın okunamadı. Lütfen tekrar dene.');
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
            const cardList = m.cards.map((c, i) => `${i + 1}. ${c.nameTr} (${c.name})`).join('\n');
            return { role: 'user', content: `Bu kartlar önüme geldi:\n\n${cardList}\n\nŞimdi bu kartları bütünsel olarak yorumla.` };
          }
          if (m.type === 'images') {
            return { role: 'user', content: 'Kahve falı fotoğraflarımı yükledim, lütfen yorumla.' };
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
      Alert.alert('Elmas Yetersiz', 'Takip sorusu için 1 elmas gerekir.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Elmas Al', onPress: () => router.push('/tokens') }
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
        const response = await fetch(`${API_URL}/api/tarot/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, persona: currentFalci }),
        });
        if (!response.ok) {
          const errBody = await response.text();
          let errMsg = 'API hatası';
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
                if (parsed.content) fullContent += parsed.content;
              } catch (_) {}
            }
          }
          setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: fullContent } : m));
        }
        setFortune(fullContent);
      } else if (selectedFortune === 'ruya') {
        const res = await fetch(`${API_URL}/api/dream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, persona: currentFalci }),
        });
        if (!res.ok) {
          const errBody = await res.text();
          let errMsg = 'API hatası';
          try { const j = JSON.parse(errBody); errMsg = j.message || j.error || errMsg; } catch (_) {}
          throw new Error(`${errMsg} (${res.status})`);
        }
        const data = await res.json();
        setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: data.interpretation } : m));
        setFortune(data.interpretation);
      } else if (selectedFortune === 'kahve') {
        const res = await fetch(`${API_URL}/api/fortune/continue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, persona: currentFalci }),
        });
        if (!res.ok) {
          const errBody = await res.text();
          let errMsg = 'API hatası';
          try { const j = JSON.parse(errBody); errMsg = j.message || j.error || errMsg; } catch (_) {}
          throw new Error(`${errMsg} (${res.status})`);
        }
        const data = await res.json();
        setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: data.fortune } : m));
        setFortune(data.fortune);
      }
      useToken();
    } catch (e) {
      console.error('Follow-up error:', e);
      setChatMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: 'Yanıt alınamadı. Lütfen tekrar dene.' } : m));
      Alert.alert('Hata', e.message || 'Takip sorusu gönderilemedi.');
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
      Alert.alert('Uyarı', 'Tüm kartlar çekildi, tekrar karıştır');
      return;
    }

    if (selectedCards.length >= 3) {
      Alert.alert('Tamam', '3 kartını seçtin, artık yorumlayabilirsin!');
      return;
    }

    const drawnCard = shuffledDeck[currentCardIndex];
    setSelectedCards([...selectedCards, drawnCard]);
    setCurrentCardIndex(currentCardIndex + 1);
  };

  const getTarotReading = async () => {
    if (selectedCards.length !== 3) {
      Alert.alert('Uyarı', 'Önce kartları karıştır');
      return;
    }

    if (tokens < 1) {
      Alert.alert(
        '💎 Elmas Yetersiz',
        'Tarot falını okumak için elmasın yok. Reklam izleyerek veya satın alarak elmas kazanabilirsin!',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Elmas Al', onPress: () => router.push('/tokens') }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: selectedCards.map(c => ({ name: c.name, nameTr: c.nameTr })),
          persona: currentFalci,
        }),
      });

      if (!response.ok) throw new Error('API isteği başarısız');

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
      useToken();
    } catch (error) {
      console.error('Tarot error:', error);
      setChatMessages(prev =>
        prev.map(m =>
          m.id === streamMsgId ? { ...m, content: fullContent || 'Yorum yüklenemedi. Lütfen tekrar dene.' } : m
        )
      );
      if (!fullContent) Alert.alert('Hata', 'Tarot falı okunamadı. Lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  const getAstrologyReading = async () => {
    if (!birthDateTime || !birthCity) {
      Alert.alert('Uyarı', 'Lütfen doğum tarihi, saati ve doğum yerini seç');
      return;
    }
    const d = birthDateTime;
    const pad = (n) => String(n).padStart(2, '0');
    const tz = birthCity.tz || '+03:00';
    const datetime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${tz}`;

    if (tokens < 1) {
      Alert.alert(
        '💎 Elmas Yetersiz',
        'Yıldız haritası için elmasın yok. Reklam izleyerek veya satın alarak elmas kazanabilirsin!',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Elmas Al', onPress: () => router.push('/tokens') }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/astrology`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datetime,
          latitude: birthCity.lat,
          longitude: birthCity.lon,
          timezone: 'Europe/Istanbul',
        }),
      });
      if (!response.ok) throw new Error('API isteği başarısız');
      const data = await response.json();
      setFortune(data.interpretation);
      setAstrologyChart(data.chart || null);
      useToken();
    } catch (error) {
      console.error('Astrology error:', error);
      Alert.alert('Hata', 'Yıldız haritası hesaplanamadı. Lütfen tekrar dene.');
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
      {/* Header with Logo & Coins */}
      <View style={[styles.header, { backgroundColor: themeColors.background }]}>
        {/* Sol taraf - Geri butonu veya boş alan */}
        {selectedFortune ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedFortune(null);
              setImages([]);
              setDreamText('');
              setBirthDateTime(null);
              setBirthCity(null);
              setAstrologyChart(null);
              setSelectedCards([]);
              setShuffledDeck([]);
              setCurrentCardIndex(0);
              setFortune(null);
              setChatMessages([]);
              setCurrentFalci(null);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.backIcon, { color: themeColors.text }]}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        
        {/* Orta - Logo */}
        <Text style={[styles.logoText, { color: themeColors.text }]}>kahvefali</Text>
        
        {/* Sağ - Her zaman elmas */}
        <TouchableOpacity
          style={[styles.coinBadge, { backgroundColor: themeColors.buttonBg }]}
          onPress={() => router.push('/tokens')}
        >
          <Text style={styles.coinIcon}>💎</Text>
          <Text style={[styles.coinText, { color: themeColors.text }]}>{tokens}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* ANA SAYFA - Üç Fal Seçeneği */}
        {!selectedFortune && (
          <>
            <View style={styles.fortuneTypesContainer}>
              <TouchableOpacity 
                style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
                onPress={() => setSelectedFortune('kahve')}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600' }}
                  style={styles.fortuneTypeImage}
                  imageStyle={styles.fortuneTypeImageStyle}
                >
                  <View style={styles.fortuneTypeOverlay}>
                    <Text style={styles.fortuneTypeEmoji}>☕</Text>
                    <Text style={styles.fortuneTypeTitle}>Kahve Falı</Text>
                    <Text style={styles.fortuneTypeDesc}>Fincan fotoğrafından geleceğini keşfet</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
                onPress={() => {
                  setSelectedFortune('tarot');
                }}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600' }}
                  style={styles.fortuneTypeImage}
                  imageStyle={styles.fortuneTypeImageStyle}
                >
                  <View style={styles.fortuneTypeOverlay}>
                    <Text style={styles.fortuneTypeEmoji}>🔮</Text>
                    <Text style={styles.fortuneTypeTitle}>Tarot Falı</Text>
                    <Text style={styles.fortuneTypeDesc}>Kartlardan mesajını al</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.fortuneTypeCard, { backgroundColor: themeColors.card }]}
                onPress={() => setSelectedFortune('ruya')}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600' }}
                  style={styles.fortuneTypeImage}
                  imageStyle={styles.fortuneTypeImageStyle}
                >
                  <View style={styles.fortuneTypeOverlay}>
                    <Text style={styles.fortuneTypeEmoji}>💭</Text>
                    <Text style={styles.fortuneTypeTitle}>Rüya Tabiri</Text>
                    <Text style={styles.fortuneTypeDesc}>Rüyanı anlat, yorumlayalım</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <View style={[styles.fortuneTypeCard, styles.fortuneTypeCardDisabled, { backgroundColor: themeColors.card }]}>
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600' }}
                  style={styles.fortuneTypeImage}
                  imageStyle={styles.fortuneTypeImageStyle}
                >
                  <View style={[styles.fortuneTypeOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Text style={styles.fortuneTypeEmoji}>⭐</Text>
                    <Text style={styles.fortuneTypeTitle}>Yıldız Haritası</Text>
                    <Text style={[styles.fortuneTypeDesc, { fontSize: 13 }]}>Yakında aktif olacak</Text>
                  </View>
                </ImageBackground>
              </View>
            </View>
          </>
        )}

        {/* CHAT EKRANI - Kahve, Tarot, Rüya */}
        {selectedFortune && ['kahve', 'tarot', 'ruya'].includes(selectedFortune) && (
          <>
            {/* Chat mesajları */}
            <View style={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <View key={msg.id} style={[styles.chatBubbleWrap, msg.role === 'user' && styles.chatBubbleUser]}>
                  <View style={[
                    styles.chatBubble,
                    msg.role === 'user' 
                      ? [styles.chatBubbleRight, { backgroundColor: themeColors.text || '#8B4513' }] 
                      : [styles.chatBubbleLeft, { backgroundColor: themeColors.card }]
                  ]}>
                    {msg.type === 'images' && msg.images?.length > 0 && (
                      <View style={styles.chatImages}>
                        {msg.images.slice(0, 4).map((uri, i) => (
                          <Image key={i} source={{ uri }} style={styles.chatThumb} />
                        ))}
                        {msg.images.length > 4 && <Text style={[styles.chatMore, { color: themeColors.text }]}>+{msg.images.length - 4}</Text>}
                      </View>
                    )}
                    {msg.type === 'cards' && msg.cards?.length > 0 && (
                      <View style={styles.chatCardsRow}>
                        {msg.cards.map((c, i) => (
                          <View key={i} style={[styles.chatCardBubble, { backgroundColor: themeColors.background }]}>
                            <Text style={styles.chatCardEmoji}>{c.emoji}</Text>
                            <Text style={[styles.chatCardName, { color: themeColors.text }]}>{c.nameTr}</Text>
                            <Text style={[styles.chatCardPos, { color: themeColors.textSecondary }]}>
                              {i === 0 ? 'Geçmiş' : i === 1 ? 'Şimdi' : 'Gelecek'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {msg.type === 'text' && msg.content && (
                      <Text style={[styles.chatText, { color: msg.role === 'user' ? '#fff' : themeColors.text }]}>{msg.content}</Text>
                    )}
                  </View>
                </View>
              ))}
              {loading && (
                <View style={[styles.chatBubbleWrap, styles.chatBubbleLeft]}>
                  <View style={[styles.chatBubble, styles.chatBubbleLeft, { backgroundColor: themeColors.card }]}>
                    <ActivityIndicator size="small" color={themeColors.text} />
                    <Text style={[styles.chatText, { color: themeColors.textSecondary, marginLeft: 8 }]}>
                      {currentFalci ? `${currentFalci.name} yorumluyor...` : 'Yorumlanıyor...'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Input alanı - fortune yoksa göster */}
            {!fortune && selectedFortune === 'kahve' && (
              <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
                {images.length === 0 ? (
                  <View style={styles.chatActions}>
                    <TouchableOpacity style={[styles.chatActionBtn, { backgroundColor: themeColors.card }]} onPress={pickImage} activeOpacity={0.8}>
                      <Text style={styles.chatActionIcon}>📷</Text>
                      <Text style={[styles.chatActionText, { color: themeColors.text }]}>Galeri</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.chatActionBtn, { backgroundColor: themeColors.card }]} onPress={takePhoto} activeOpacity={0.8}>
                      <Text style={styles.chatActionIcon}>📸</Text>
                      <Text style={[styles.chatActionText, { color: themeColors.text }]}>Kamera</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.chatComposer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chatImageStrip}>
                      {images.map((uri, i) => (
                        <View key={i} style={styles.chatImageWrap}>
                          <Image source={{ uri }} style={styles.chatComposerThumb} />
                          <TouchableOpacity style={styles.chatRemoveImg} onPress={() => removeImage(i)}>
                            <Text style={styles.chatRemoveIcon}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {images.length < 5 && (
                        <TouchableOpacity style={[styles.chatAddImg, { borderColor: themeColors.textSecondary }]} onPress={pickImage}>
                          <Text style={[styles.chatAddIcon, { color: themeColors.textSecondary }]}>+</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                    <TouchableOpacity style={[styles.chatSendBtn, { backgroundColor: themeColors.text }]} onPress={getFortune} disabled={loading}>
                      {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.chatSendText}>🔮 Falımı Oku  💎1</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {!fortune && selectedFortune === 'tarot' && (
              <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
                <View style={[styles.tarotContainer, { backgroundColor: themeColors.card }]}>
                  <Text style={[styles.tarotTitle, { color: themeColors.text }]}>3 Kart Seç</Text>
                  {selectedCards.length > 0 && (
                    <View style={styles.selectedCardsContainer}>
                      <View style={styles.selectedCardsRow}>
                        {selectedCards.map((card, index) => (
                          <View key={card.id} style={[styles.selectedCard, { backgroundColor: themeColors.background }]}>
                            <Text style={styles.selectedCardEmoji}>{card.emoji}</Text>
                            <Text style={[styles.selectedCardName, { color: themeColors.text }]}>{card.nameTr}</Text>
                            <Text style={[styles.selectedCardPos, { color: themeColors.textSecondary }]}>
                              {index === 0 ? 'Geçmiş' : index === 1 ? 'Şimdi' : 'Gelecek'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {selectedCards.length < 3 && (
                    <TouchableOpacity style={styles.cardStack} onPress={drawNextCard} activeOpacity={0.9}>
                      <View style={[styles.stackedCard, styles.stackedCard3, { backgroundColor: themeColors.background }]} />
                      <View style={[styles.stackedCard, styles.stackedCard2, { backgroundColor: themeColors.background }]} />
                      <View style={[styles.topCard, { backgroundColor: themeColors.background, borderColor: themeColors.text }]}>
                        <Text style={styles.topCardIcon}>🎴</Text>
                        <Text style={[styles.topCardText, { color: themeColors.text }]}>Kartı Çek</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  {selectedCards.length === 3 && (
                    <TouchableOpacity style={[styles.readButton, { backgroundColor: themeColors.text }]} onPress={getTarotReading} disabled={loading}>
                      {loading ? <ActivityIndicator color={themeColors.background} /> : <Text style={[styles.readButtonText, { color: themeColors.background }]}>🔮 Kartları Yorumla  💎1</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {!fortune && selectedFortune === 'ruya' && (
              <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
                <View style={[styles.dreamInputContainer, { backgroundColor: themeColors.card }]}>
                  <TextInput
                    style={[styles.dreamInput, { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.textSecondary }]}
                    placeholder="Rüyanı anlat..."
                    placeholderTextColor={themeColors.textSecondary}
                    value={dreamText}
                    onChangeText={setDreamText}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity
                    style={[styles.dreamButton, { backgroundColor: themeColors.text, opacity: dreamText.trim().length < 20 ? 0.5 : 1 }]}
                    onPress={async () => {
                      if (dreamText.trim().length < 20) { Alert.alert('Uyarı', 'En az 20 karakter yaz'); return; }
                      if (tokens < 1) { Alert.alert('Elmas Yetersiz', '', [{ text: 'İptal' }, { text: 'Elmas Al', onPress: () => router.push('/tokens') }]); return; }
                      setLoading(true);
                      try {
                        const res = await fetch(`${API_URL}/api/dream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dream: dreamText, persona: currentFalci }) });
                        if (!res.ok) throw new Error();
                        const data = await res.json();
                        const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: dreamText.trim() };
                        const astMsg = { id: (Date.now() + 1).toString(), role: 'assistant', type: 'text', content: data.interpretation };
                        setChatMessages(prev => [...prev.filter(m => m.id !== 'welcome'), userMsg, astMsg]);
                        setFortune(data.interpretation);
                        useToken();
                      } catch (e) { Alert.alert('Hata', 'Tekrar dene'); } finally { setLoading(false); }
                    }}
                    disabled={loading || dreamText.trim().length < 20}
                  >
                    {loading ? <ActivityIndicator color={themeColors.background} /> : <Text style={[styles.dreamButtonText, { color: themeColors.background }]}>💭 Rüyamı Yorumla  💎1</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {fortune && (
              <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
                <View style={[styles.followUpRow, { backgroundColor: themeColors.card, borderColor: themeColors.textSecondary }]}>
                  <TextInput
                    style={[styles.followUpInput, { backgroundColor: themeColors.background, color: themeColors.text }]}
                    placeholder="Takip sorusu sor..."
                    placeholderTextColor={themeColors.textSecondary}
                    value={followUpText}
                    onChangeText={setFollowUpText}
                    multiline
                    maxLength={500}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={[styles.followUpSend, { backgroundColor: themeColors.text, opacity: followUpText.trim() && !loading ? 1 : 0.5 }]}
                    onPress={sendFollowUp}
                    disabled={!followUpText.trim() || loading}
                  >
                    {loading ? <ActivityIndicator size="small" color={themeColors.background} /> : <Text style={[styles.followUpSendText, { color: themeColors.background }]}>Gönder 💎1</Text>}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.newFortuneButton, { backgroundColor: themeColors.text }]}
                  onPress={() => { setSelectedFortune(null); setImages([]); setDreamText(''); setBirthDateTime(null); setBirthCity(null); setSelectedCards([]); setShuffledDeck([]); setCurrentCardIndex(0); setFortune(null); setChatMessages([]); setFollowUpText(''); setCurrentFalci(null); setAstrologyChart(null); }}
                >
                  <Text style={[styles.newFortuneButtonText, { color: themeColors.background }]}>✨ Yeni Fal Çektir</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* YILDIZ HARİTASI SAYFASI - pasif */}
        {selectedFortune === 'astroloji' && !fortune && (
          <>
            <View style={[styles.dreamInputContainer, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>⭐ Doğum Bilgilerin</Text>
              <Text style={[styles.inputHint, { color: themeColors.textSecondary }]}>
                Yıldız haritan Swiss Ephemeris ile hesaplanır.
              </Text>
              
              <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary }]}>Doğum Tarihi</Text>
              <TouchableOpacity
                style={[styles.astrologyInput, styles.astrologyPickerButton, { backgroundColor: themeColors.background, borderColor: themeColors.textSecondary }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.astrologyPickerText, { color: birthDateTime ? themeColors.text : themeColors.textSecondary }]}>
                  {birthDateTime
                    ? `${String(birthDateTime.getDate()).padStart(2, '0')}.${String(birthDateTime.getMonth() + 1).padStart(2, '0')}.${birthDateTime.getFullYear()}`
                    : 'Tarih seç 📅'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDateTime || new Date(1990, 4, 15)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      const prev = birthDateTime || new Date(1990, 4, 15, 12, 0);
                      setBirthDateTime(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), prev.getHours(), prev.getMinutes()));
                    }
                  }}
                  locale="tr-TR"
                />
              )}

              <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary }]}>Doğum Saati</Text>
              <TouchableOpacity
                style={[styles.astrologyInput, styles.astrologyPickerButton, { backgroundColor: themeColors.background, borderColor: themeColors.textSecondary }]}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.astrologyPickerText, { color: birthDateTime ? themeColors.text : themeColors.textSecondary }]}>
                  {birthDateTime
                    ? `${String(birthDateTime.getHours()).padStart(2, '0')}:${String(birthDateTime.getMinutes()).padStart(2, '0')}`
                    : 'Saat seç ⏰'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={birthDateTime || new Date(1990, 4, 15, 12, 0)}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  is24Hour={true}
                  onChange={(_, selectedTime) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selectedTime) {
                      const prev = birthDateTime || new Date(1990, 4, 15, 12, 0);
                      setBirthDateTime(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), selectedTime.getHours(), selectedTime.getMinutes()));
                    }
                  }}
                  locale="tr-TR"
                />
              )}
              
              <Text style={[styles.astrologyLabel, { color: themeColors.textSecondary }]}>Doğum Yeri</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city.name}
                    style={[
                      styles.cityChip,
                      { backgroundColor: birthCity?.name === city.name ? themeColors.text : themeColors.buttonBg, borderColor: themeColors.text }
                    ]}
                    onPress={() => setBirthCity(city)}
                  >
                    <Text style={[styles.cityChipText, { color: birthCity?.name === city.name ? themeColors.background : themeColors.text }]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                style={[styles.dreamButton, { backgroundColor: themeColors.text, opacity: (!birthDateTime || !birthCity) ? 0.5 : 1 }]}
                onPress={getAstrologyReading}
                disabled={loading || !birthDateTime || !birthCity}
              >
                {loading ? (
                  <ActivityIndicator color={themeColors.background} />
                ) : (
                  <>
                    <Text style={[styles.dreamButtonText, { color: themeColors.background }]}>
                      ⭐ Yıldız Haritamı Çıkar
                    </Text>
                    <Text style={[styles.dreamButtonCost, { color: themeColors.background }]}>
                      💎 1 Elmas
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '400',
  },
  coinBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  coinIcon: {
    fontSize: 18,
  },
  coinText: {
    fontSize: 16,
    fontWeight: '700',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  fortuneTypesContainer: {
    gap: 16,
    paddingHorizontal: 0,
  },
  fortuneTypeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 0,
  },
  fortuneTypeImage: {
    height: 200,
    width: '100%',
    justifyContent: 'center',
  },
  fortuneTypeImageStyle: {
    borderRadius: 20,
  },
  fortuneTypeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fortuneTypeEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  fortuneTypeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  fortuneTypeDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  fortuneTypeCardDisabled: {
    opacity: 0.7,
  },
  chatMessages: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    minHeight: 120,
  },
  chatBubbleWrap: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  chatBubbleUser: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  chatText: {
    fontSize: 15,
    lineHeight: 22,
  },
  chatImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chatThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  chatMore: {
    fontSize: 12,
    alignSelf: 'center',
  },
  chatCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chatCardBubble: {
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 70,
  },
  chatCardEmoji: { fontSize: 24, marginBottom: 4 },
  chatCardName: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  chatCardPos: { fontSize: 10 },
  chatInputArea: {
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  chatActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  chatActionIcon: { fontSize: 22 },
  chatActionText: { fontSize: 15, fontWeight: '700' },
  chatComposer: { gap: 12 },
  chatImageStrip: { marginBottom: 8, maxHeight: 90 },
  chatImageWrap: { position: 'relative', marginRight: 8 },
  chatComposerThumb: { width: 70, height: 70, borderRadius: 12 },
  chatRemoveImg: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e74c3c',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatRemoveIcon: { color: '#fff', fontSize: 12, fontWeight: '800' },
  chatAddImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAddIcon: { fontSize: 28 },
  chatSendBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatSendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  heroSection: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  heroCTA: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaPrimary: {
    backgroundColor: '#8B4513',
  },
  ctaSecondary: {
    
  },
  ctaIcon: {
    fontSize: 18,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  features: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 15,
  },
  dreamInputContainer: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputHint: {
    fontSize: 13,
    marginBottom: 16,
    opacity: 0.9,
  },
  astrologyLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  astrologyInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  astrologyPickerButton: {
    minHeight: 52,
    justifyContent: 'center',
  },
  astrologyPickerText: {
    fontSize: 16,
  },
  cityScroll: {
    marginVertical: 12,
    maxHeight: 50,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 2,
  },
  cityChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dreamInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 160,
    borderWidth: 1,
    marginBottom: 16,
  },
  dreamButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dreamButtonText: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  dreamButtonCost: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.9,
  },
  tarotContainer: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  tarotTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  tarotSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  shuffleContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  shuffleEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  shuffleButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  shuffleButtonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  tarotCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardPosition: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  readButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  readButtonText: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  readButtonCost: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.9,
  },
  reshuffleButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  reshuffleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  selectedCardsContainer: {
    marginBottom: 20,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  selectedCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedCardEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  selectedCardName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedCardPos: {
    fontSize: 10,
    fontWeight: '600',
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  deckCard: {
    width: (width - 90) / 4,
    height: (width - 90) / 4 * 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
    marginBottom: 4,
  },
  deckCardEmoji: {
    fontSize: 28,
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 16,
    fontWeight: '900',
  },
  // Deck Animation Styles
  deckContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  deckInfo: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  cardStack: {
    width: 200,
    height: 280,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedCard: {
    position: 'absolute',
    width: 180,
    height: 260,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  stackedCard2: {
    bottom: 8,
    left: 8,
    transform: [{ rotate: '-2deg' }],
  },
  stackedCard3: {
    bottom: 16,
    left: 16,
    transform: [{ rotate: '-4deg' }],
  },
  topCard: {
    width: 180,
    height: 260,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topCardIcon: {
    fontSize: 80,
    marginBottom: 12,
  },
  topCardText: {
    fontSize: 18,
    fontWeight: '600',
  },
  deckCount: {
    fontSize: 14,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  section: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionBadge: {
    fontSize: 15,
    fontWeight: '700',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageCard: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#e74c3c',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  addImageCard: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 36,
    fontWeight: '300',
  },
  fortuneButton: {
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fortuneButtonText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  fortuneButtonCost: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.9,
  },
  fortuneCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
  },
  fortuneHeader: {
    marginBottom: 20,
  },
  fortuneTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  fortuneText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: 24,
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  followUpInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  followUpSend: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 44,
  },
  followUpSendText: {
    fontSize: 15,
    fontWeight: '700',
  },
  newFortuneButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  newFortuneButtonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  infoSection: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  steps: {
    gap: 16,
  },
  stepCard: {
    alignItems: 'center',
    gap: 8,
  },
  floatingThemeButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  themeButtonIcon: {
    fontSize: 28,
  },
});
