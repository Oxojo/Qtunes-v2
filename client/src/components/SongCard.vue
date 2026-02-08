<script setup lang="ts">
defineProps<{
  title: string
  composer: string
  image_url: string
  isPlaying: boolean
}>()

const emit = defineEmits(['play'])
</script>
<template>
    <div class="SongCard">
        <div class="card-background"></div>
        <img :src="image_url" class="card-illustration" alt="artwork">
        <div class="info-side">
            <div class="card-text">
                <div class="card-title">{{ title.replace(/\.[^/.]+$/, "") }}</div>
                <div class="card-composer">{{ composer }}</div>
            </div>
        </div>
        <button class="play-button" @click.stop="$emit('play')">
            <span v-if="isPlaying">⏸</span>
            <span v-else>▶</span>
        </button>
    </div>
</template>
<style>
.SongCard {
    position: relative;
    width: 396px;  /* 必要に応じて最大幅を制限 */
    height: 150px;     /* カードの高さ */
    border-radius: 10px;
    overflow: hidden;  /* はみ出たイラストをカット */
    border: 1px solid;
    background: white;
}
.card-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}
.card-illustration {
  position: absolute;
  top: 0;
  right: 0;
  width: 75%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: 1;
  opacity: 0.5;
}
.info-side {
    position: absolute;
    top: 0;
    left: 0;
    width: 60%;
    height: 100%;
    background: #fff9f9;
    z-index: 2;
    clip-path: polygon(0 0, 100% 0, 60% 100%, 0 100%);
    display: flex;
    align-items: center;
    padding-left: 20px;
}
.card-text {
    display: flex;
    flex-direction: column;
    gap: 40px;
    text-align: left;
}
.card-title {
    font-size: 20px;
    font-weight: bold;
    color: #000;
}
.card-composer {
  font-size: 14px;
  color: #333;
}
.play-button {
  position: absolute;
  bottom: 16px; /* はみ出さないように余白を確保 */
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button:hover {
  transform: scale(1.1);
  background: #fff;
}
</style>