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
        <img :src="image_url" class="card-illustration" alt="artwork">
        <div class="card-contents">
            <div class="card-text">
                <div>{{ title.replace(/\.[^/.]+$/, "") }}</div>
                <div>{{ composer }}</div>
            </div>
            <button class="play-button" @click.stop="$emit('play')">
                <span v-if="isPlaying && isActive">⏸</span>
                <span v-else>▶</span>
            </button>
        </div>
    </div>
</template>
<style>
.card-illustration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* --- ここが前回のポイント --- */
  object-fit: cover;        /* アスペクト比を維持して埋める */
  object-position: center;  /* 中央を表示 */
  
  z-index: 0;
  opacity: 0.3;             /* 背景のグラデーションを透かす場合 */
}
.SongCard {
    position: relative;
    width: 500px;  /* 必要に応じて最大幅を制限 */
    height: 160px;     /* カードの高さ */
    border-radius: 12px;
    overflow: hidden;  /* はみ出たイラストをカット */
  
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.card-text {
    position: relative;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.card-contents {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.play-button {
  align-self: flex-end;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #333;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 10px;
}

.play-button:hover {
  transform: scale(1.1);
  background: #fff;
}
</style>