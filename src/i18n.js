'use strict';
(() => {
  const messages = {
    en: {
      motionOn: 'Motion on', motionOff: 'Motion off',
      motionTitle: 'Turn scroll animations on or off',
      reducedTitle: 'Reduced motion is enabled in your device settings.',
      allWork: 'all work', filterStatus: 'Showing {count} projects: {label}.',
      background: 'Background: {name}.',
      slideshowPaused: 'Slideshow paused', resume: 'Resume slideshow', pause: 'Pause slideshow'
    },
    tr: {
      motionOn: 'Hareket açık', motionOff: 'Hareket kapalı',
      motionTitle: 'Kaydırma animasyonlarını aç veya kapat',
      reducedTitle: 'Cihaz ayarlarınızda azaltılmış hareket etkin.',
      allWork: 'tüm projeler', filterStatus: '{label}: {count} proje gösteriliyor.',
      background: 'Arka plan: {name}.',
      slideshowPaused: 'Slayt gösterisi duraklatıldı', resume: 'Slayt gösterisini sürdür', pause: 'Slayt gösterisini duraklat'
    },
    ru: {
      motionOn: 'Анимация вкл.', motionOff: 'Анимация выкл.',
      motionTitle: 'Включить или выключить анимацию при прокрутке',
      reducedTitle: 'В настройках устройства включено уменьшение движения.',
      allWork: 'все проекты', filterStatus: 'Показано проектов: {count}. Категория: {label}.',
      background: 'Фон: {name}.',
      slideshowPaused: 'Слайд-шоу приостановлено', resume: 'Продолжить слайд-шоу', pause: 'Приостановить слайд-шоу'
    }
  };
  let language = Object.hasOwn(messages, document.documentElement.lang) ? document.documentElement.lang : 'en';
  window.AMB_I18N = {
    get language() { return language; },
    setLanguage(next) {
      if (Object.hasOwn(messages, next)) language = next;
    },
    text(key, values = {}) {
      return (messages[language][key] || messages.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
    }
  };
})();
