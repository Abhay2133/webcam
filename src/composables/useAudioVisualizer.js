import { ref, watch, onUnmounted } from 'vue';

export function useAudioVisualizer(stream, isEnabled) {
    const volume = ref(0); // 0 to 1
    const frequencyData = ref(new Uint8Array(0)); // Reactive data for fancy visualizers
    let audioContext = null;
    let analyser = null;
    let source = null;
    let animationFrame = null;

    const startVisualizer = () => {
        if (!stream.value) return;

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (!analyser) {
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64; // Small FFT for bar visualizer (gives 32 bins)
            analyser.smoothingTimeConstant = 0.5; // Responsive but not jittery
        }

        // Connect source
        if (source) {
            source.disconnect();
        }
        source = audioContext.createMediaStreamSource(stream.value);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
            if (!isEnabled.value) {
                volume.value = 0;
                frequencyData.value = new Uint8Array(bufferLength).fill(0);
                return;
            }

            analyser.getByteFrequencyData(dataArray);

            // Update reactive data (cloning to trigger reactivity)
            frequencyData.value = new Uint8Array(dataArray);

            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            volume.value = Math.min((sum / bufferLength) / 128, 1);

            animationFrame = requestAnimationFrame(update);
        };

        update();
    };

    const stopVisualizer = () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        volume.value = 0;
        if (analyser) {
            frequencyData.value = new Uint8Array(analyser.frequencyBinCount).fill(0);
        }
    };

    // Watch for enable/disable
    watch(isEnabled, (newVal) => {
        if (newVal) {
            startVisualizer();
        } else {
            stopVisualizer();
        }
    });

    onUnmounted(() => {
        stopVisualizer();
        if (audioContext) {
            audioContext.close();
        }
    });

    return {
        volume,
        frequencyData
    };
}
