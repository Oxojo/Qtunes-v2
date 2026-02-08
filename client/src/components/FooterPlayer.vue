<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { usePlayerStore } from '../stores/player'

defineProps<{
    composerName?: string
}>()

const playerStore = usePlayerStore()

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

</script>

<template>
    <div v-if="playerStore.currentSong" class="footer-player">
        <div class="player-content">
        <div class="player-left">
            <div class="song-info">
            <img :src="`/api/users/${playerStore.currentSong.uploaderId}/icon`" class="footer-icon">
            <div class="footer-text">
                <span class="footer-title">{{ playerStore.currentSong.name.replace(/\.[^/.]+$/, "") }}</span>
                <span class="footer-composer">{{ composerName }}</span>
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
</template>

<style scoped>
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
