import { ref } from 'vue';

export function useCamera() {
  const stream = ref(null);
  const error = ref(null);
  const isMirrored = ref(true); // Default to mirrored for webcam as requested
  const isMuted = ref(false);

  const initCamera = async () => {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      error.value = null;
      // Sync mute state
      updateMuteState();
    } catch (err) {
      console.error('Error accessing media devices:', err);
      // More friendy error messages
      if (err.name === 'NotAllowedError') {
        error.value = 'Camera/Microphone access denied. Please grant permissions and reload.';
      } else if (err.name === 'NotFoundError') {
        error.value = 'No camera or microphone found.';
      } else {
        error.value = `Error accessing devices: ${err.message}`;
      }
    }
  };

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop());
      stream.value = null;
    }
  };

  const toggleMirror = () => {
    isMirrored.value = !isMirrored.value;
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    updateMuteState();
  };

  const updateMuteState = () => {
    if (stream.value) {
      stream.value.getAudioTracks().forEach(track => {
        track.enabled = !isMuted.value;
      });
    }
  };

  return {
    stream,
    error,
    isMirrored,
    isMuted,
    initCamera,
    stopCamera,
    toggleMirror,
    toggleMute
  };
}
