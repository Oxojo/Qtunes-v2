<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player'
import { Song } from '@scope/common'
import SongCard from '../components/SongCard.vue';
import FooterPlayer from '../components/FooterPlayer.vue';

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

    <FooterPlayer :composer-name="playerStore.currentSong ? userCache[playerStore.currentSong.uploaderId] : ''" />
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

@media (max-width: 1000px) {
  .songs-container {
    grid-template-columns: 1fr;
  }
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
