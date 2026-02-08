<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { usePlayerStore } from '../stores/player'
import { Song } from '@scope/common'
import SongCard from '../components/SongCard.vue';

const user = ref(null)
const songs = ref<Song[]>([])

const userCache = ref<Record<string, string>>({})
const playerStore = usePlayerStore()

const pendingRequests = new Set<string>();

const resolveTraqId = async (uuid: string) => {
  if (userCache.value[uuid] || pendingRequests.has(uuid)) return;

  pendingRequests.add(uuid);

  try {
    const res = await fetch(`/api/users/${uuid}`);
    if (res.ok) {
      const data = await res.json();
      userCache.value[uuid] = data.name;
    }
  } catch (e) {
    console.error("Fetch error:", e);
  } finally {
    pendingRequests.delete(uuid);
  }
}

const fetchSongs = async () => {
  try {
    const res = await fetch('/api/songs', { credentials: 'include' })
    if (res.ok) {
      songs.value = await res.json()
      songs.value.forEach(song => resolveTraqId(song.uploaderId));
    }
  } catch (e) {
    console.error("Failed on Songs", e)
  }
}

const onPlayClick = (song: any) => {
  playerStore.handlePlayRequest(song)
}

const audioRef = ref<HTMLAudioElement | null>(null);

const onLoadedMetadata = () => {
  if (audioRef.value) {
    playerStore.duration = audioRef.value.duration
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    playerStore.currentTime = audioRef.value.currentTime
  }
}

const onSeek = (e: Event) => {
  const target = e.target as HTMLInputElement
  const time = parseFloat(target.value)
  if (audioRef.value) {
    audioRef.value.currentTime = time
    playerStore.currentTime = time
  }
}

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

watch(() => playerStore.isPlaying, (newisPlaying) => {
  if (!audioRef.value) return
  if (newisPlaying) {
    audioRef.value.play().catch(e => console.error("Playback failed:", e))
  } else {
    audioRef.value.pause()
  }
})

watch(() => playerStore.currentSongId, async () => {
  await nextTick()
  if (audioRef.value) {
    audioRef.value.load()
    if (playerStore.isPlaying) {
      audioRef.value.play()
    }
  }
})

const onEnded = () => {
  playerStore.isPlaying = false
  playerStore.currentTime = 0
}

onMounted(async () => {
  try {
    const res = await fetch('api/me')
    const data = await res.json()
    user.value = data
    fetchSongs()
  } catch (e) {
    user.value = null
  }
})

</script>

<template>
  <div v-if="!user" style="text-align: center; margin-top: 50px;">
    <a href="http://localhost:8000/api/auth/login" class="login-button">
      traQ でログインする
    </a>
  </div>
  <div v-else class="songs-container">
    <SongCard v-for="song in songs" :title="song.name" :composer="userCache[song.uploaderId] || song.uploaderId.substring(0, 8)" :image_url="`/api/users/${song.uploaderId}/icon`" :isPlaying="playerStore.currentSongId === song.id && playerStore.isPlaying" @play="onPlayClick(song)"/> 
    <p></p>
  </div>

  <div v-if="playerStore.currentSong" class="footer-player">
    <div class="player-content">
      <div class="player-left">
        <div class="song-info">
          <img :src="`/api/users/${playerStore.currentSong.uploaderId}/icon`" class="footer-icon">
          <div class="footer-text">
            <span class="footer-title">{{ playerStore.currentSong.name.replace(/\.[^/.]+$/, "") }}</span>
            <span class="footer-composer">{{ userCache[playerStore.currentSong.uploaderId] }}</span>
          </div>
        </div>
      </div>

      <div class="player-center">
        <div class="seek-bar-container">
          <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
          <input 
            type="range"
            class="seek-bar"
            min="0"
            :max="playerStore.duration"
            step="0.1"
            :value="playerStore.currentTime"
            @input="onSeek"
          >
          <span class="time">{{ formatTime(playerStore.duration) }}</span>
        </div>
      </div>

      <div class="player-right">
        <div class="footer-controls">
          <button class="control-btn" @click="playerStore.togglePlay()">
            {{ playerStore.isPlaying ? '⏸' : '▶' }}
          </button>
        </div>
      </div>
    </div>
  <audio 
    ref="audioRef"
    :src="`/api/stream/${playerStore.currentSongId}`"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @ended="onEnded"
    @play="playerStore.isPlaying = true" 
    @pause="playerStore.isPlaying = false"
  ></audio>
  </div>
</template>

<style scoped>
.songs-container {
  display: grid;
  
  grid-template-columns: repeat(2, 1fr);
  
  row-gap: 20px;

  width: 100%;
  max-width: 1000px; 
  margin: 0 auto;
  padding: 20px;
}

/* レスポンシブ対応（スマホで見るときに1列にしたい場合） */
@media (max-width: 1000px) {
  .songs-container {
    grid-template-columns: 1fr;
  }
}

.footer-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: #3B3B3B;
  z-index: 1000;
  display: flex;
  align-items: center;
}

.player-content {
  width: 100%;
  max-width: 1200;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-left {
  width: 25%;
  padding: 15px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon {
  width: 40px;
  height: 40px;
  background: white;
  object-fit: cover;
}

.footer-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.footer-title {
  display: block;
  font-size: 18px;
  color: white;
}

.footer-composer {
  font-size: 12px;
  color: #c7c7c7;
}
.player-center {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.seek-bar-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}
.seek-bar {
  flex: 1;
  cursor: pointer;
  accent-color: #ECA0AA;
  height: 4px;
}
.time {
  font-size: 12px;
  color: #fff;
}
.player-right {
  width: 25%;
  padding: 15px 26px;
}
</style>
