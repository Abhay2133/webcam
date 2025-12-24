<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Mic, MicOff } from 'lucide-vue-next';

const props = defineProps({
  isMuted: Boolean,
  frequencyData: {
    type: Uint8Array,
    default: () => new Uint8Array(0)
  }
});

const emit = defineEmits(['toggle-mute']);

const canvas = ref(null);

watch(() => props.frequencyData, (data) => {
  drawVisualizer(data);
});

const drawVisualizer = (data) => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  const width = canvas.value.width;
  const height = canvas.value.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 32; // Button radius (approx) + padding

  ctx.clearRect(0, 0, width, height);

  if (data.length === 0) return;

  const barWidth = (Math.PI * 2) / data.length;
  
  ctx.save();
  ctx.translate(cx, cy);

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    // Scale bar length based on volume
    const barHeight = (value / 255) * 15; 
    
    // Circular layout
    ctx.rotate(barWidth);
    
    if (value > 10) { // Threshold silence
        ctx.fillStyle = `rgba(16, 163, 127, ${value / 255})`; // OpenAI Green
        ctx.beginPath();
        // Draw rounded pill/bar radiating outwards
        ctx.roundRect(-2, radius, 4, barHeight, 2);
        ctx.fill();
    }
  }
  
  ctx.restore();
};

</script>

<template>
  <div class="visualizer-btn-wrapper">
    <canvas ref="canvas" width="120" height="120" class="vis-canvas"></canvas>
    <button 
      class="vis-btn" 
      :class="{ muted: isMuted }"
      @click="$emit('toggle-mute')"
      title="Mute/Unmute"
    >
      <MicOff v-if="isMuted" :size="28" />
      <Mic v-else :size="28" />
    </button>
  </div>
</template>

<style scoped>
.visualizer-btn-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vis-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 120px;
  height: 120px;
}

.vis-btn {
  position: relative;
  z-index: 10;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent fixed bg on video */
  backdrop-filter: blur(4px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.vis-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.05);
}

.vis-btn.muted {
  background: var(--danger-color);
}

@media (max-width: 768px) {
  .visualizer-btn-wrapper {
    width: 60px;
    height: 60px;
  }
  
  .vis-canvas {
    width: 90px;
    height: 90px;
  }
  
  .vis-btn {
    width: 44px;
    height: 44px;
  }
  
  /* Need to adjust the JS radius if we want exact mapping, 
     but for now, CSS scaling will handle the visual shrink. */
}
</style>
