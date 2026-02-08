// src/stores/player.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<any>(null)
  const isPlaying = ref(false)

  const currentSongId = computed(() => currentSong.value?.id || null)

  const currentTime = ref(0)
  const duration = ref(0)

  const progressPercent = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

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
    currentTime,
    duration, 
    currentSongId,
    progressPercent, 
    handlePlayRequest, 
    playNewSong, 
    togglePlay, 
    pause 
  }
})