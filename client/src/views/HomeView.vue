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
    <div v-if="playerStore.currentSong" class="player-bar">
      <div class="player-info">
        <span class="now-playing">再生中: {{ playerStore.currentSong.name.replace(/\.[^/.]+$/, "") }}</span>
      </div>

      <audio 
        ref="audioRef" 
        :src="`/api/stream/${playerStore.currentSongId}`"
        @play="playerStore.isPlaying = true" 
        @pause="playerStore.isPlaying = false"
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
