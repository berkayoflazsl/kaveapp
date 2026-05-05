import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MAX_IMAGES } from '../../constants/config';

/**
 * Kahve / tarot / rüya sohbet alanı: mesajlar, moda özel girdi, takip, yeni fal.
 * API ve state üst bileşendedir.
 */
export default function FortuneChatPanel({
  styles,
  themeColors,
  t,
  selectedFortune,
  chatMessages,
  loading,
  currentFalci,
  fortune,
  images,
  pickImage,
  takePhoto,
  removeImage,
  getFortune,
  selectedCards,
  drawNextCard,
  getTarotReading,
  dreamText,
  setDreamText,
  interpretDream,
  followUpText,
  setFollowUpText,
  sendFollowUp,
  onNewFortune,
}) {
  return (
    <>
      <View style={styles.chatMessages}>
        {chatMessages.map((msg) => (
          <View key={msg.id} style={[styles.chatBubbleWrap, msg.role === 'user' && styles.chatBubbleUser]}>
            <View
              style={[
                styles.chatBubble,
                msg.role === 'user'
                  ? [styles.chatBubbleRight, { backgroundColor: themeColors.text || '#8B4513' }]
                  : [styles.chatBubbleLeft, { backgroundColor: themeColors.card }],
              ]}
            >
              {msg.type === 'images' && msg.images?.length > 0 && (
                <View style={styles.chatImages}>
                  {msg.images.slice(0, 4).map((uri, i) => (
                    <Image key={i} source={{ uri }} style={styles.chatThumb} />
                  ))}
                  {msg.images.length > 4 && (
                    <Text style={[styles.chatMore, { color: themeColors.text }]}>+{msg.images.length - 4}</Text>
                  )}
                </View>
              )}
              {msg.type === 'cards' && msg.cards?.length > 0 && (
                <View style={styles.chatCardsRow}>
                  {msg.cards.map((c, i) => (
                    <View key={i} style={[styles.chatCardBubble, { backgroundColor: themeColors.background }]}>
                      <Text style={styles.chatCardEmoji}>{c.emoji}</Text>
                      <Text style={[styles.chatCardName, { color: themeColors.text }]}>{t(`tarot.c${c.id}`)}</Text>
                      <Text style={[styles.chatCardPos, { color: themeColors.textSecondary }]}>
                        {i === 0 ? t('app.posPast') : i === 1 ? t('app.posPresent') : t('app.posFuture')}
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
                {currentFalci ? t('app.reviewingBy', { name: currentFalci.name }) : t('app.reviewing')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {!fortune && selectedFortune === 'kahve' && (
        <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
          {images.length === 0 ? (
            <View style={styles.chatActions}>
              <TouchableOpacity
                style={[styles.chatActionBtn, { backgroundColor: themeColors.card }]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Text style={styles.chatActionIcon}>📷</Text>
                <Text style={[styles.chatActionText, { color: themeColors.text }]}>{t('app.gallery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chatActionBtn, { backgroundColor: themeColors.card }]}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.chatActionIcon}>📸</Text>
                <Text style={[styles.chatActionText, { color: themeColors.text }]}>{t('app.camera')}</Text>
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
                {images.length < MAX_IMAGES && (
                  <TouchableOpacity
                    style={[styles.chatAddImg, { borderColor: themeColors.textSecondary }]}
                    onPress={pickImage}
                  >
                    <Text style={[styles.chatAddIcon, { color: themeColors.textSecondary }]}>+</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              <TouchableOpacity
                style={[styles.chatSendBtn, { backgroundColor: themeColors.text }]}
                onPress={getFortune}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.chatSendText}>{t('app.readMyFortune')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {!fortune && selectedFortune === 'tarot' && (
        <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
          <View style={[styles.tarotContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.tarotTitle, { color: themeColors.text }]}>{t('app.pickThreeCards')}</Text>
            {selectedCards.length > 0 && (
              <View style={styles.selectedCardsContainer}>
                <View style={styles.selectedCardsRow}>
                  {selectedCards.map((card, index) => (
                    <View key={card.id} style={[styles.selectedCard, { backgroundColor: themeColors.background }]}>
                      <Text style={styles.selectedCardEmoji}>{card.emoji}</Text>
                      <Text style={[styles.selectedCardName, { color: themeColors.text }]}>{t(`tarot.c${card.id}`)}</Text>
                      <Text style={[styles.selectedCardPos, { color: themeColors.textSecondary }]}>
                        {index === 0 ? t('app.posPast') : index === 1 ? t('app.posPresent') : t('app.posFuture')}
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
                  <Text style={[styles.topCardText, { color: themeColors.text }]}>{t('app.drawCard')}</Text>
                </View>
              </TouchableOpacity>
            )}
            {selectedCards.length === 3 && (
              <TouchableOpacity
                style={[styles.readButton, { backgroundColor: themeColors.text }]}
                onPress={getTarotReading}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={themeColors.background} />
                ) : (
                  <Text style={[styles.readButtonText, { color: themeColors.background }]}>{t('app.interpretCards')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!fortune && selectedFortune === 'ruya' && (
        <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
          <View style={[styles.dreamInputContainer, { backgroundColor: themeColors.card }]}>
            <TextInput
              style={[
                styles.dreamInput,
                { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.textSecondary },
              ]}
              placeholder={t('app.dreamPlaceholder')}
              placeholderTextColor={themeColors.textSecondary}
              value={dreamText}
              onChangeText={setDreamText}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[
                styles.dreamButton,
                { backgroundColor: themeColors.text, opacity: dreamText.trim().length < 20 ? 0.5 : 1 },
              ]}
              onPress={interpretDream}
              disabled={loading || dreamText.trim().length < 20}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.background} />
              ) : (
                <Text style={[styles.dreamButtonText, { color: themeColors.background }]}>{t('app.interpretDream')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {fortune && (
        <View style={[styles.chatInputArea, { backgroundColor: themeColors.background }]}>
          <View style={[styles.followUpRow, { backgroundColor: themeColors.card, borderColor: themeColors.textSecondary }]}>
            <TextInput
              style={[styles.followUpInput, { backgroundColor: themeColors.background, color: themeColors.text }]}
              placeholder={t('app.followUpPlaceholder')}
              placeholderTextColor={themeColors.textSecondary}
              value={followUpText}
              onChangeText={setFollowUpText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.followUpSend,
                { backgroundColor: themeColors.text, opacity: followUpText.trim() && !loading ? 1 : 0.5 },
              ]}
              onPress={sendFollowUp}
              disabled={!followUpText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={themeColors.background} />
              ) : (
                <Text style={[styles.followUpSendText, { color: themeColors.background }]}>{t('app.sendFollowUp')}</Text>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.newFortuneButton, { backgroundColor: themeColors.text }]}
            onPress={onNewFortune}
          >
            <Text style={[styles.newFortuneButtonText, { color: themeColors.background }]}>{t('app.newFortune')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
