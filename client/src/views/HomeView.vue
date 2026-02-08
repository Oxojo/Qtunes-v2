<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { usePlayerStore } from '../stores/players'
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

const currentSong = ref<Song | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

const playSong = async (song: Song) => {
  currentSong.value = song

  await nextTick();

  isPlaying.value = true

  if (audioRef.value) {
    audioRef.value.src = `/api/stream/${song.id}`
    audioRef.value.play()
  }
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const handlePlay = (song: any) => {
  if (playerStore.currentSongId === song.id && playerStore.isPlaying) {
    // 同じ曲なら一時停止
    playerStore.pause();
  } else {
    // 別の曲、または停止中なら再生
    playSong(song); // 前に実装した再生関数
  }
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
    <SongCard v-for="song in songs" :title="song.name" :composer="userCache[song.uploaderId] || song.uploaderId.substring(0, 8)" :image_url="`/api/users/${song.uploaderId}/icon`" :is-playing="playerStore.isPlaying" @play="handlePlay(song)"/> 
    <p></p>
    <div v-if="currentSong" class="player-bar">
      <div class="player-info">
        <span class="now-playing">再生中: {{ currentSong.name.replace(/\.[^/.]+$/, "") }}</span>
      </div>
      
      <div class="controls">
        <button @click="togglePlay">{{ isPlaying ? 'PAUSE' : 'PLAY' }}</button>
      </div>

      <audio 
        ref="audioRef" 
        @play="isPlaying = true" 
        @pause="isPlaying = false"
        controls
      ></audio>
      </div>
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

</style>
