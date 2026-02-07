import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // 状態 (State)
  const currentSongId = ref<string | null>(null)
  const isPlaying = ref(false)
  const currentSong = ref<any>(null)

  // アクション (Actions)
  const playNewSong = (song: any) => {
    currentSongId.value = song.id
    currentSong.value = song
    isPlaying.value = true
    // ここで実際に audio.play() を呼ぶロジックと連動させます
  }

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const pause = () => {
    isPlaying.value = false
  }

  return {
    currentSongId,
    isPlaying,
    currentSong,
    playNewSong,
    togglePlay,
    pause
  }
})