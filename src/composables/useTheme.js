import { ref, onMounted } from 'vue';

export function useTheme() {
    const isDark = ref(true); // Default to dark

    const toggleTheme = () => {
        isDark.value = !isDark.value;
        updateTheme();
    };

    const updateTheme = () => {
        const theme = isDark.value ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('webcam-theme', theme);
    };

    onMounted(() => {
        const savedTheme = localStorage.getItem('webcam-theme');
        if (savedTheme) {
            isDark.value = savedTheme === 'dark';
        } else {
            // Check system preference
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        updateTheme();
    });

    return {
        isDark,
        toggleTheme
    };
}
