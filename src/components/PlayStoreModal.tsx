import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  ShoppingBag, 
  Cloud, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  Award, 
  ChevronRight,
  Download,
  Smartphone,
  Check,
  Flame,
  Wind,
  Mountain,
  Heart,
  Moon,
  Waves,
  Compass
} from 'lucide-react';
import { SaveData, PlayAchievement } from '../types/game';
import { 
  PlayStoreManager, 
  COSMETIC_CATALOG, 
  CosmeticItem 
} from '../game/playstore/PlayStoreManager';

interface PlayStoreModalProps {
  currentSave: SaveData | null;
  onSaveUpdated: (updatedSave: SaveData) => void;
  onClose: () => void;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({
  currentSave,
  onSaveUpdated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'achievements' | 'bazaar' | 'cloud'>('store');
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('The shifting mountains and living forest blew my mind! Best mobile adventure game.');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<string | null>(null);

  const achievements: PlayAchievement[] = PlayStoreManager.getAchievements(currentSave);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXpEarned = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xpReward, 0);
  const maxPossibleXp = achievements.reduce((acc, a) => acc + a.xpReward, 0);

  const unlockedCosmeticIds = PlayStoreManager.getUnlockedCosmetics(currentSave);
  const shardsAvailable = currentSave?.playerStats.shiftingShards ?? 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRateSubmit = () => {
    if (!currentSave) {
      showToast('Start or load an expedition first to collect rewards!');
      return;
    }
    if (currentSave.playStoreRated) {
      showToast('You have already submitted a review. Thank you!');
      return;
    }
    const success = PlayStoreManager.submitStoreReview(currentSave);
    if (success) {
      onSaveUpdated({ ...currentSave });
      showToast('★★★★★ Review submitted! +100 Shifting Shards added to your satchel!');
    }
  };

  const handleBuyCosmetic = (cosmetic: CosmeticItem) => {
    if (!currentSave) {
      showToast('Load an expedition to purchase items.');
      return;
    }
    const success = PlayStoreManager.unlockCosmetic(currentSave, cosmetic.id);
    if (success) {
      onSaveUpdated({ ...currentSave });
      showToast(`Unlocked and equipped ${cosmetic.name}!`);
    } else {
      showToast(`Not enough Shifting Shards! You need ${cosmetic.costShards} shards.`);
    }
  };

  const handleEquipCosmetic = (cosmetic: CosmeticItem) => {
    if (!currentSave) return;
    PlayStoreManager.equipCosmetic(currentSave, cosmetic.id);
    onSaveUpdated({ ...currentSave });
    showToast(`Equipped ${cosmetic.name}!`);
  };

  const handleCloudBackup = () => {
    if (!currentSave) {
      showToast('No active expedition to sync.');
      return;
    }
    const res = PlayStoreManager.syncToCloud(currentSave);
    if (res.success) {
      setCloudStatus('Cloud Sync verified • Backup saved to Google Play account');
      showToast('Expedition backed up to Google Play Games Cloud!');
    }
  };

  const handleCloudRestore = () => {
    const restored = PlayStoreManager.restoreFromCloud(currentSave ? currentSave.slot : 1);
    if (restored) {
      onSaveUpdated(restored);
      showToast('Expedition successfully restored from Google Play Cloud!');
    } else {
      showToast('No cloud backup found on this Google Play profile.');
    }
  };

  const handleShareApp = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Play Store share link copied to clipboard!');
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'mountain': return <Mountain className="w-5 h-5 text-indigo-400" />;
      case 'compass': return <Compass className="w-5 h-5 text-amber-400" />;
      case 'heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'wind': return <Wind className="w-5 h-5 text-sky-400" />;
      case 'waves': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'moon': return <Moon className="w-5 h-5 text-amber-300" />;
      case 'award': return <Award className="w-5 h-5 text-yellow-400" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[740px] rounded-3xl overflow-hidden border border-slate-700 bg-slate-950/95 shadow-2xl flex flex-col text-slate-100 font-sans">
        
        {/* Google Play Store Top Navigation Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Google Play 4-Color Triangle Logo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner shrink-0 p-1.5">
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path d="M3.6 1.8L14.4 12.6L3.6 23.4C3.2 23 3 22.4 3 21.6V3.6C3 2.8 3.2 2.2 3.6 1.8Z" fill="#20A05A" />
                <path d="M17.9 9.1L4.8 1.6C4.4 1.3 4 1.2 3.6 1.3L14.4 12.1L17.9 9.1Z" fill="#EA4335" />
                <path d="M17.9 15.1L14.4 12.1L3.6 22.9C4 23 4.4 22.9 4.8 22.6L17.9 15.1Z" fill="#4285F4" />
                <path d="M21.5 12.1L17.9 9.1L14.4 12.1L17.9 15.1L21.5 12.1C22.1 11.7 22.1 12.5 21.5 12.1Z" fill="#FBBC04" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base tracking-wide text-white">
                  Google Play
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono-tech flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Play Protect Verified</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Gamer ID: <strong className="text-slate-200">Wanderer#8921</strong></span>
                <span>•</span>
                <span>Level 24 ({totalXpEarned} XP)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareApp}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Share Game"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/30 px-3 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
          {/* TAB 1: Store Page */}
          <button
            onClick={() => setActiveTab('store')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'store'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Play Store Listing</span>
          </button>

          {/* TAB 2: Achievements */}
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Play Games Achievements ({unlockedCount}/{achievements.length})</span>
          </button>

          {/* TAB 3: Shard Bazaar */}
          <button
            onClick={() => setActiveTab('bazaar')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'bazaar'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Explorer Bazaar ({shardsAvailable} Shards)</span>
          </button>

          {/* TAB 4: Cloud Save */}
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Google Play Cloud</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 inset-x-0 mx-auto w-fit max-w-md px-4 py-2 rounded-full bg-emerald-600/95 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-950" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* ======================================================== */}
          {/* TAB 1: PLAY STORE LISTING                                */}
          {/* ======================================================== */}
          {activeTab === 'store' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* App Overview Header Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-5 rounded-3xl bg-slate-900/60 border border-slate-800">
                {/* App Icon */}
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-700 via-emerald-800 to-indigo-900 border-2 border-amber-400/40 shadow-xl flex items-center justify-center text-4xl shrink-0">
                  🏔️
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h3 className="font-cinzel text-xl sm:text-2xl font-black text-amber-100">
                      The World That Moves
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Editor's Choice
                    </span>
                  </div>

                  <p className="text-xs text-emerald-400 font-semibold mb-2">
                    Celestial Horizon Studios • Adventure / Exploration
                  </p>

                  {/* Play Store Metrics */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-300 border-t border-slate-800 pt-2.5">
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="font-bold text-sm text-amber-300 flex items-center gap-1">
                        4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </span>
                      <span className="text-[10px] text-slate-500">34.2K reviews</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="font-bold text-sm text-slate-100">500K+</span>
                      <span className="text-[10px] text-slate-500">Downloads</span>
                    </div>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="font-bold text-sm text-slate-100">Everyone 10+</span>
                      <span className="text-[10px] text-slate-500">Fantasy Themes</span>
                    </div>
                  </div>
                </div>

                {/* Status Button */}
                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                  <span className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Installed (v1.2.0)</span>
                  </span>
                  <span className="text-[10px] font-mono-tech text-slate-400">
                    60 FPS Performance Mode
                  </span>
                </div>
              </div>

              {/* Interactive Rate & Review Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-600/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <h4 className="font-bold text-sm text-amber-200">
                      Rate on Google Play & Claim 100 Shards
                    </h4>
                  </div>
                  {currentSave?.playStoreRated && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                      ✓ Reward Claimed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  Enjoying the shifting world? Rate your expedition to support independent mobile game development and receive <strong>100 Shifting Shards</strong> in your in-game satchel!
                </p>

                {/* Star Rating Selector */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-amber-300 font-mono-tech ml-2 font-bold">
                    {userRating}.0 Stars Selected
                  </span>
                </div>

                {/* Review Text */}
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share what you think of the living world..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={handleRateSubmit}
                  disabled={currentSave?.playStoreRated}
                  className={`py-2 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    currentSave?.playStoreRated
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-95'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {currentSave?.playStoreRated ? 'Review Submitted (+100 Shards Claimed)' : 'Submit Google Play Rating'}
                  </span>
                </button>
              </div>

              {/* What's New in v1.2.0 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-200">
                    What's New in Version 1.2.0
                  </h4>
                  <span className="text-[10px] font-mono-tech text-slate-400">
                    Updated Sept 2026
                  </span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li><strong>World Observations Shift Log:</strong> The journal now records exact meter displacements whenever mountains and forests migrate.</li>
                  <li><strong>Zero-Lag Engine Optimization:</strong> Hardware-accelerated canvas rendering, decoupled HUD state, and 0ms virtual joystick responsiveness.</li>
                  <li><strong>Starlight Vault Nocturnal Portal:</strong> Ancient sanctums that dissolve only under direct moonlight.</li>
                  <li><strong>Kip's Spirit Pulse:</strong> Faster stun reaction time and visual clues during tectonic tremors.</li>
                </ul>
              </div>

              {/* Real Community Reviews */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-200">Featured Reviews</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Kiran S.</span>
                      <div className="flex text-amber-400">★★★★★</div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      "I looked up at Mount Solis and realized it had shifted 140 meters to the East. The memory-based discovery map is brilliant."
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Elena V.</span>
                      <div className="flex text-amber-400">★★★★★</div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      "Finally a mobile adventure with zero pay-to-win, offline save slots, and a companion you actually care about. Runs at silky 60 FPS."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PLAY GAMES ACHIEVEMENTS                           */}
          {/* ======================================================== */}
          {activeTab === 'achievements' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              {/* Play Games Level Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-yellow-950/40 via-slate-900 to-amber-950/40 border border-yellow-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-yellow-200">
                      Google Play Games Achievements
                    </h3>
                    <p className="text-xs text-slate-400">
                      Syncs automatically with your exploration discoveries and boss triumphs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono-tech">
                  <div className="text-right">
                    <span className="text-yellow-300 font-bold text-sm block">
                      {totalXpEarned} / {maxPossibleXp} XP
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {unlockedCount} of {achievements.length} Unlocked
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-yellow-500/60 flex items-center justify-center bg-slate-950 text-xs font-bold text-yellow-300">
                    {Math.round((unlockedCount / achievements.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      ach.unlocked
                        ? 'bg-slate-900/80 border-yellow-500/40 shadow-lg'
                        : 'bg-slate-900/30 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          ach.unlocked
                            ? 'bg-yellow-950/80 border-yellow-500/60 text-yellow-300 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {getAchievementIcon(ach.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-slate-100 truncate">
                            {ach.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full font-bold ${
                              ach.unlocked
                                ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            +{ach.xpReward} XP
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                          {ach.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-500">
                          <span>
                            {ach.unlocked ? `Unlocked: ${ach.unlockedDate}` : 'Locked in Expedition'}
                          </span>
                          {ach.unlocked && (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Play Games Synced
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: EXPLORER'S BAZAAR (IN-GAME COSMETICS)             */}
          {/* ======================================================== */}
          {activeTab === 'bazaar' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              {/* Bazaar Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40 border border-amber-500/40 shadow-xl flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-amber-200">
                    Explorer's Cosmetic Bazaar
                  </h3>
                  <p className="text-xs text-slate-300">
                    Strictly zero pay-to-win. Outfits and companion forms unlocked purely with in-game Shifting Shards.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/60 px-3.5 py-1.5 rounded-2xl text-amber-300 font-mono-tech font-bold text-sm shadow-md">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{shardsAvailable} Shards</span>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COSMETIC_CATALOG.map((item) => {
                  const isUnlocked = unlockedCosmeticIds.includes(item.id);
                  const isEquipped =
                    (item.type === 'scarf' && currentSave?.equippedCosmetics?.scarf === item.id) ||
                    (item.type === 'companion' && currentSave?.equippedCosmetics?.companion === item.id) ||
                    (item.type === 'staff' && currentSave?.equippedCosmetics?.staff === item.id) ||
                    (!currentSave?.equippedCosmetics && item.unlockedByDefault);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isEquipped
                          ? 'bg-amber-950/40 border-amber-500 shadow-xl'
                          : isUnlocked
                          ? 'bg-slate-900/80 border-slate-700'
                          : 'bg-slate-900/40 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Swatch Preview */}
                        <div
                          className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-md"
                          style={{
                            backgroundColor: item.colorPreview,
                            borderColor: isEquipped ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                          }}
                        >
                          {item.type === 'companion' ? '🦊' : item.type === 'scarf' ? '🧣' : '🪄'}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-cinzel font-bold text-sm text-slate-100">
                              {item.name}
                            </h4>
                            <span className="text-[10px] font-mono-tech uppercase text-slate-400">
                              {item.type}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {item.description}
                          </p>

                          {/* Action Button */}
                          <div className="flex items-center justify-between">
                            {isEquipped ? (
                              <span className="text-xs font-bold text-amber-300 flex items-center gap-1 font-mono-tech">
                                <Check className="w-3.5 h-3.5 text-amber-400" /> Currently Equipped
                              </span>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => handleEquipCosmetic(item)}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition-all active:scale-95"
                              >
                                Equip Outfit
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBuyCosmetic(item)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                                <span>Unlock ({item.costShards} Shards)</span>
                              </button>
                            )}

                            {!isUnlocked && (
                              <span className="text-xs font-mono-tech text-amber-400/90 font-bold">
                                {item.costShards} Shards
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: GOOGLE PLAY CLOUD SAVE                            */}
          {/* ======================================================== */}
          {activeTab === 'cloud' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-cyan-950/50 to-slate-900 border border-cyan-500/40 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 mx-auto shadow-lg">
                  <Cloud className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-cinzel text-lg font-bold text-cyan-200">
                    Google Play Games Cloud Sync
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                    Keep your living world discoveries, shifting map surveys, and relics synchronized across your Android phones, tablets, and browser sessions.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-mono-tech text-slate-300 flex items-center justify-between">
                  <span>Google Account Profile:</span>
                  <span className="text-cyan-400 font-bold">Wanderer#8921 (Active)</span>
                </div>

                {cloudStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono-tech">
                    {cloudStatus}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleCloudBackup}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Cloud className="w-4 h-4 fill-slate-950" />
                    <span>Backup Expedition to Cloud</span>
                  </button>

                  <button
                    onClick={handleCloudRestore}
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Restore from Cloud</span>
                  </button>
                </div>
              </div>

              {/* Privacy and Policy Notice */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-200 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Google Play Compliance & Privacy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  No tracking or advertising identifiers are collected. Save data is stored locally with end-to-end user-controlled cloud sync. Zero pay-to-win mechanisms or loot boxes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
