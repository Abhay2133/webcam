<script setup>
import { computed } from 'vue';
import { 
  Camera, 
  CameraOff, 
  Circle, 
  Square, 
  Download, 
  RefreshCw,
  FlipHorizontal
} from 'lucide-vue-next';

const props = defineProps({
  isRecording: Boolean,
  recordedBlobUrl: String,
  streamReady: Boolean,
  isMirrored: Boolean
});

const emit = defineEmits([
  'start', 
  'stop', 
  'download', 
  'reset', 
  'toggle-mirror'
]);

</script>

<template>
  <div class="controls-overlay">
    <div class="controls-pill">
      <!-- Camera Flip -->
      <button 
        v-if="!recordedBlobUrl"
        @click="$emit('toggle-mirror')" 
        class="ctrl-btn secondary" 
        :class="{ active: isMirrored }"
        title="Mirror Camera"
      >
        <FlipHorizontal :size="24" />
        <span class="label">Mirror</span>
      </button>

      <!-- Recording Controls -->
      <button 
        v-if="!isRecording && !recordedBlobUrl" 
        @click="$emit('start')" 
        class="ctrl-btn primary"
        :disabled="!streamReady"
      >
        <Circle :size="24" fill="currentColor" />
        <span class="label">Record</span>
      </button>

      <button 
        v-if="isRecording" 
        @click="$emit('stop')" 
        class="ctrl-btn danger"
      >
        <Square :size="24" fill="currentColor" />
        <span class="label">Stop</span>
      </button>

      <!-- Post-Recording Actions -->
      <button 
        v-if="recordedBlobUrl" 
        @click="$emit('download')" 
        class="ctrl-btn primary"
      >
        <Download :size="24" />
        <span class="label">Save</span>
      </button>

      <button 
        v-if="recordedBlobUrl" 
        @click="$emit('reset')" 
        class="ctrl-btn secondary"
      >
        <RefreshCw :size="24" />
        <span class="label">New</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.controls-overlay {
  width: 100%;
  padding-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none; /* Let clicks pass through overlay area */
}

/* Controls Container */
.controls-pill {
  pointer-events: auto; /* Re-enable clicks */
  background: var(--surface-color);
  padding: 0.5rem;
  border-radius: 9999px;
  display: flex;
  gap: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0,0,0,0.05);
  transition: transform 0.2s;
  align-items: center;
}

/* Base Button Style */
.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0; /* No padding, rely on flex centering */
  border-radius: 50%;
  background: transparent;
  color: var(--text-color);
  border: none;
  cursor: pointer;
  position: relative; /* For tooltip positioning */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tooltip Styling (using .label) */
.ctrl-btn .label {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  margin-bottom: 8px;
  background: #000;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  font-weight: 500;
  z-index: 50;
}

.ctrl-btn:hover .label {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Hover States */
.ctrl-btn:hover {
  background: rgba(0,0,0,0.05);
  transform: scale(1.05);
}

/* Variants */
.ctrl-btn.primary {
  background: var(--text-color);
  color: var(--bg-color);
}
.ctrl-btn.primary:hover {
  background: var(--text-color);
  opacity: 0.9;
}

.ctrl-btn.danger {
  background: var(--danger-color);
  color: white;
}
.ctrl-btn.danger:hover {
  opacity: 0.9;
}

.ctrl-btn.secondary {
  color: var(--text-color);
}

/* Visualizer Wrapper */
.mic-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visualizer-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: transform 0.1s linear, opacity 0.1s linear;
}

@media (max-width: 768px) {
  .controls-overlay {
    padding-bottom: 1rem;
  }
  
  .controls-pill {
    padding: 0.35rem;
    gap: 0.35rem;
  }
  
  .ctrl-btn {
    width: 40px;
    height: 40px;
  }
  
  .ctrl-btn :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

/* Dark Mode Adjustments */
@media (prefers-color-scheme: dark) {
  .ctrl-btn:hover {
    background: rgba(255,255,255,0.1);
  }
}
</style>
