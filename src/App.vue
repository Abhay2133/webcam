<script setup>
import WebcamStage from './components/WebcamStage.vue'
import ThemeToggle from './components/ThemeToggle.vue'
</script>

<template>
  <div class="app-layout">
    <header>
      <div class="logo">
        <h1>Webcam</h1>
      </div>
      <div class="actions">
        <ThemeToggle />
      </div>
    </header>

    <main>
      <WebcamStage />
    </main>
  </div>
</template>

<style>
/* Import Global Styles */
@import './assets/main.css';

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  z-index: 50;
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

main {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  padding: 0; /* Remove padding around main stage */
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 768px) {
  header {
    padding: 0.05rem 1rem;
  }
  
  .logo h1 {
    font-size: 0.9rem;
  }
}
</style>
