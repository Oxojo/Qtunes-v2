<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Song } from '@scope/common'

const user = ref(null)
const songs = ref<Song[]>([])

const fetchSongs = async () => {
  try {
    const res = await fetch('/api/songs', { credentials: 'include' })
    if (res.ok) {
      songs.value = await res.json()
    }
  } catch (e) {
    console.error("Failed on Songs", e)
  }
}

const currentSong = ref<Song | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

const playSong = (song: Song) => {
  currentSong.value = song
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
    <div v-for="song in songs" :key="song.id" class="song-item">
      <div class="details">
        <div class="name">{{ song.name }}</div>
        <div class="meta">
          {{ new Date(song.createdAt).toLocaleDateString() }}
          / ID: {{ song.uploaderId.substring(0, 8) }}
        </div>
      </div>
      <button @click="playSong(song)">
        {{ currentSong?.id === song.id && isPlaying ? '⏸' : '▶' }}
      </button>
    </div>
    <div v-if="currentSong" class="player-bar">
      <div class="player-info">
        <span class="now-playing">再生中: {{ currentSong.name }}</span>
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
  max-width: 800px; margin: 0 auto; padding: 20px;
}

</style>
