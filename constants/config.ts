// API Configuration
export const API_URL = __DEV__ 
  ? 'http://192.168.1.106:3000' 
  : 'https://your-production-api.com';

// Token System
export const INITIAL_TOKENS = 3;
export const AD_REWARD_TOKENS = 2;

// Token Packages
export const TOKEN_PACKAGES = [
  { amount: 10, price: '₺29.99', icon: '💎' },
  { amount: 25, price: '₺59.99', icon: '💎', popular: true },
  { amount: 50, price: '₺99.99', icon: '💎' },
];

// Image Limits
export const MAX_IMAGES = 5;
export const MIN_IMAGES = 1;

// UI Text
export const TEXTS = {
  appTitle: 'KahveFalı',
  fortuneTellers: 'Falcılarımız',
  readFortune: 'Falına Bak',
  addPhoto: 'Fotoğraf Ekle',
  takePhoto: 'Fotoğraf Çek',
  selectFromGallery: 'Galeriden Seç',
  tokenInsufficient: 'Jeton Yetersiz',
  tokenInsufficientMessage: 'Falını okumak için jetonun yok. Reklam izleyerek veya satın alarak jeton kazanabilirsin!',
  buyTokens: 'Jeton Al',
  watchAd: 'Reklam İzle',
  adReward: 'Ücretsiz 2 jeton kazan',
  congratulations: '🎉 Tebrikler!',
  tokensEarned: '2 jeton kazandın!',
  purchaseSuccess: '✅ Başarılı!',
  
  // Daily Message
  dailyMessageTitle: '☕️ Günün Mesajı',
  dailyMessage: 'Kahve falı, Türk kültürünün vazgeçilmez bir parçasıdır. Binlerce yıldır süren bu gelenek, fincanınızdaki şekillerin size özel mesajlar taşıdığına inanır.',
  
  // How It Works
  howItWorksTitle: '🔮 Nasıl Çalışır?',
  howItWorksSteps: [
    {
      icon: '📸',
      title: 'Fotoğraf Çek',
      description: 'Kahve fincanınızın fotoğrafını çekin'
    },
    {
      icon: '🤖',
      title: 'Falcılarımız İnceler',
      description: 'Uzman falcılarımız fincanınızı analiz eder'
    },
    {
      icon: '✨',
      title: 'Sonuç Hazır',
      description: 'Size özel falınız hazır!'
    }
  ],
  
  // Stats
  statsTitle: '📊 İstatistikler',
  stats: [
    { icon: '👥', value: '10,000+', label: 'Mutlu Kullanıcı' },
    { icon: '☕', value: '50,000+', label: 'Fal Bakıldı' },
    { icon: '⭐', value: '4.8', label: 'Ortalama Puan' }
  ]
};

// Animation Durations
export const ANIMATION_DURATION = 200;
export const AD_MOCK_DURATION = 1500;
