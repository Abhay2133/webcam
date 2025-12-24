import { ref, onUnmounted } from 'vue';

export function useRecorder(stream) {
    const mediaRecorder = ref(null);
    const recordedChunks = ref([]);
    const isRecording = ref(false);
    const recordedBlobUrl = ref(null);
    const recordingTime = ref(0);
    let timerInterval = null;

    const startRecording = () => {
        if (!stream.value) return;

        recordedChunks.value = [];
        recordingTime.value = 0;

        try {
            // Prioritize modern codecs
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            mediaRecorder.value = new MediaRecorder(stream.value, { mimeType });

            mediaRecorder.value.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.value.push(event.data);
                }
            };

            mediaRecorder.value.onstop = () => {
                const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
                recordedBlobUrl.value = URL.createObjectURL(blob);
            };

            mediaRecorder.value.start();
            isRecording.value = true;
            startTimer();
        } catch (err) {
            console.error('Failed to start recording:', err);
            // Could export an error state if needed
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.value && isRecording.value) {
            mediaRecorder.value.stop();
            isRecording.value = false;
            stopTimer();
        }
    };

    const downloadRecording = () => {
        if (!recordedBlobUrl.value) return;

        const a = document.createElement('a');
        a.href = recordedBlobUrl.value;
        a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const resetRecording = () => {
        if (recordedBlobUrl.value) {
            URL.revokeObjectURL(recordedBlobUrl.value);
            recordedBlobUrl.value = null;
        }
        recordedChunks.value = [];
        recordingTime.value = 0;
    };

    // Timer logic
    const startTimer = () => {
        timerInterval = setInterval(() => {
            recordingTime.value++;
        }, 1000);
    };

    const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    onUnmounted(() => {
        stopTimer();
        if (recordedBlobUrl.value) {
            URL.revokeObjectURL(recordedBlobUrl.value);
        }
    });

    return {
        isRecording,
        recordedBlobUrl,
        recordingTime,
        formatTime,
        startRecording,
        stopRecording,
        downloadRecording,
        resetRecording,
        recordedChunks
    };
}
