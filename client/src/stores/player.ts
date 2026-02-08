// src/stores/player.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<any>(null)
  const isPlaying = ref(false)

  const currentSongId = computed(() => currentSong.value?.id || null)

  const handlePlayRequest = (song: any) => {
    if (currentSongId.value === song.id) {
      togglePlay()
    } else {
      playNewSong(song)
    }
  }

  const playNewSong = (song: any) => {
    currentSong.value = song
    isPlaying.value = true
  }

  const togglePlay = () => {
    if (!currentSong.value) return
    isPlaying.value = !isPlaying.value
  }

  const pause = () => {
    isPlaying.value = false
  }

  return { 
    currentSong, 
    isPlaying, 
    currentSongId, 
    handlePlayRequest, 
    playNewSong, 
    togglePlay, 
    pause 
  }
})