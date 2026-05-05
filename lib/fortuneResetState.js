/** Ana ekran / tüm modlar: tek noktadan `setState` temizleme. */
export function resetEntireSessionState(s) {
  s.setSelectedFortune(null);
  s.setAstroMode(null);
  s.setImages([]);
  s.setDreamText('');
  s.setBirthDateTime(null);
  s.setBirthCountryKey(null);
  s.setBirthCity(null);
  s.setAstrologyChart(null);
  s.setSelectedCards([]);
  s.setShuffledDeck([]);
  s.setCurrentCardIndex(0);
  s.setFortune(null);
  s.setChatMessages([]);
  s.setCurrentFalci(null);
  if (s.setFollowUpText) s.setFollowUpText('');
}
