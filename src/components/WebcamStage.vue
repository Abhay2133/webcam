<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCamera } from '../composables/useCamera';
import { useRecorder } from '../composables/useRecorder';
import { useAudioVisualizer } from '../composables/useAudioVisualizer';
import ControlsOverlay from './ControlsOverlay.vue';
import VisualizerButton from './VisualizerButton.vue';

const videoElement = ref(null);
const { 
  stream, 
  error: cameraError, 
  initCamera, 
  isMirrored, 
  toggleMirror,
  isMuted,
  toggleMute
} = useCamera();

const {
  isRecording,
  recordedChunks,
  startRecording,
  stopRecording,
  downloadRecording,
  recordedBlobUrl
} = useRecorder(stream);

const streamReady = computed(() => !!stream.value);
const showError = ref(true);

// Visualizer logic (active when stream is ready)
const { volume, frequencyData } = useAudioVisualizer(stream, streamReady);

onMounted(async () => {
  await initCamera();
});

// Watch stream to attach to video element
watch(stream, (newStream) => {
  if (videoElement.value) {
    videoElement.value.srcObject = newStream;
  }
});

const handleReset = () => {
  resetRecording();
};

const dismissError = () => {
  showError.value = false;
};
</script>

<template>
  <div class="stage-container">
    <div v-if="cameraError && showError" class="error-message">
      {{ cameraError }}
      <button @click="dismissError" class="dismiss-btn">×</button>
    </div>

    <!-- Main Video Stage -->
    <div class="video-wrapper">
      <video
        ref="videoElement"
        autoplay
        muted
        playsinline
        :class="{ mirrored: isMirrored, hidden: recordedBlobUrl }"
      ></video>

      <!-- Playback Video -->
      <video 
        v-if="recordedBlobUrl"
        :src="recordedBlobUrl" 
        controls 
        class="playback-video"
      ></video>

      <!-- Corner Visualizer / Mute Toggle -->
      <div class="corner-viz" v-if="!recordedBlobUrl">
        <VisualizerButton 
          :is-muted="isMuted"
          :frequency-data="frequencyData"
          @toggle-mute="toggleMute"
        />
      </div>

      <!-- Controls Overlay -->
      <ControlsOverlay
        class="overlay-position"
        :is-recording="isRecording"
        :recorded-blob-url="recordedBlobUrl"
        :stream-ready="streamReady"
        :is-mirrored="isMirrored"
        @start="startRecording"
        @stop="stopRecording"
        @download="downloadRecording"
        @reset="handleReset"
        @toggle-mirror="toggleMirror"
      />
    </div>
  </div>
</template>

<style scoped>
.stage-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem; /* Slightly reduced padding */
  background: var(--bg-color);
  box-sizing: border-box;
}

/* Create the rounded card look */
.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 100%;
  max-height: 90vh;
  background: black;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mirrored {
  transform: scaleX(-1);
}

.hidden {
  display: none;
}

.error-message {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: var(--danger-color);
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  z-index: 100;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1.2rem;
  line-height: 1;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.playback-video {
  width: 100%;
  height: 100%;
}

/* Corner Placement */
.corner-viz {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 40;
}

/* Bottom Controls Placement */
.overlay-position {
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 100%;
  z-index: 30;
  padding-bottom: 2rem;
}

@media (max-width: 768px) {
  .stage-container {
    padding: 0.5rem;
  }
  
  .video-wrapper {
    height: auto;
    aspect-ratio: 9/16; /* Portrait for mobile */
    max-height: 85vh;
    border-radius: 16px;
  }
  
  .corner-viz {
    bottom: 1rem;
    right: 1rem;
  }
  
  .overlay-position {
    padding-bottom: 1rem;
  }
}
</style>
