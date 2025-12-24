import { ref } from 'vue';

export function useCamera() {
  const stream = ref(null);
  const error = ref(null);
  const isMirrored = ref(true); // Default to mirrored for webcam as requested
  const isMuted = ref(false);
  const isRetrying = ref(false);
  let retryTimer = null;

  const initCamera = async () => {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      error.value = null;
      stopRetry();
      // Sync mute state
      updateMuteState();
    } catch (err) {
      console.error('Error accessing media devices:', err);

      // Handle the specific case where the camera is busy/occupied
      const isBusy = err.name === 'NotReadableError' || err.name === 'AbortError' || err.message?.includes('Could not start video source');

      if (isBusy) {
        error.value = 'Camera is occupied by another tab. Retrying automatically...';
        startRetry();
      } else if (err.name === 'NotAllowedError') {
        error.value = 'Camera/Microphone access denied. Please grant permissions and reload.';
        stopRetry();
      } else if (err.name === 'NotFoundError') {
        error.value = 'No camera or microphone found.';
        stopRetry();
      } else {
        error.value = `Error accessing devices: ${err.message}`;
        stopRetry();
      }
    }
  };

  const startRetry = () => {
    if (retryTimer || isRetrying.value) return;
    isRetrying.value = true;
    retryTimer = setInterval(() => {
      console.log('Retrying camera access...');
      initCamera();
    }, 2000); // Retry every 2 seconds
  };

  const stopRetry = () => {
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    isRetrying.value = false;
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

  const takeSnapshot = (videoElement) => {
    if (!videoElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    if (isMirrored.value) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  };

  return {
    stream,
    error,
    isMirrored,
    isMuted,
    isRetrying,
    initCamera,
    stopCamera,
    toggleMirror,
    toggleMute,
    takeSnapshot
  };
}
