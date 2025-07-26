// --- ELEMENTOS DO DOM ---
const body = document.body;
const appContent = document.getElementById('app-content');
const timerDisplay = document.getElementById('timer-display'), realTimeDisplay = document.getElementById('real-time-display');
const hoursEl = document.getElementById('hours'), minutesEl = document.getElementById('minutes'), secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn'), pauseBtn = document.getElementById('pauseBtn'), resetBtn = document.getElementById('resetBtn'), toggleClockBtn = document.getElementById('toggleClockBtn');
const rtHoursEl = document.getElementById('real-time-hours'), rtMinutesEl = document.getElementById('real-time-minutes'), rtSecondsEl = document.getElementById('real-time-seconds');
const widgetRealTime = document.getElementById('widget-real-time'), widgetTimer = document.getElementById('widget-timer');
const widgetRealTimeTime = document.getElementById('widget-real-time-time'), widgetTimerTime = document.getElementById('widget-timer-time');
const settingsBtn = document.getElementById('settingsBtn'), fullscreenBtn = document.getElementById('fullscreenBtn'), settingsModal = document.getElementById('settingsModal'), closeBtn = document.querySelector('.close-btn');
const themeRadios = document.querySelectorAll('input[name="theme"]');
const presetsList = document.getElementById('presets-list'), showPresetFormBtn = document.getElementById('show-preset-form-btn'), presetForm = document.getElementById('preset-form');
const presetIdInput = document.getElementById('preset-id'), presetNameInput = document.getElementById('preset-name'), presetHoursInput = document.getElementById('preset-hours'), presetMinutesInput = document.getElementById('preset-minutes');
const cancelPresetBtn = document.getElementById('cancel-preset-btn');
const customTooltip = document.getElementById('custom-tooltip');
const tooltipButtons = document.querySelectorAll('.has-tooltip');

// --- VARIÁVEIS DE ESTADO ---
let timerInterval, totalSeconds = 25 * 60, remainingSeconds = totalSeconds, isPaused = true, presets = [];

// --- LÓGICA DO TIMER DE FOCO ---
function updateTimerDisplay() {
    const h = Math.floor(remainingSeconds / 3600), m = Math.floor((remainingSeconds % 3600) / 60), s = remainingSeconds % 60;
    const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    hoursEl.textContent = String(h).padStart(2, '0'); minutesEl.textContent = String(m).padStart(2, '0'); secondsEl.textContent = String(s).padStart(2, '0');
    widgetTimerTime.textContent = timeString;
}
function startTimer() { if (isPaused && remainingSeconds > 0) { isPaused = false; timerInterval = setInterval(() => { remainingSeconds--; updateTimerDisplay(); if (remainingSeconds <= 0) { clearInterval(timerInterval); document.title = "Fim!"; alert("O tempo acabou!"); } else { document.title = `${hoursEl.textContent}:${minutesEl.textContent}:${secondsEl.textContent}`; } }, 1000); } }
function pauseTimer() { isPaused = true; clearInterval(timerInterval); }
function resetTimer() { isPaused = true; clearInterval(timerInterval); remainingSeconds = totalSeconds; updateTimerDisplay(); document.title = "Relógio de Foco"; }

// --- LÓGICA DO RELÓGIO EM TEMPO REAL ---
function updateRealTimeClock() {
    const now = new Date();
    rtHoursEl.textContent = String(now.getHours()).padStart(2, '0'); rtMinutesEl.textContent = String(now.getMinutes()).padStart(2, '0'); rtSecondsEl.textContent = String(now.getSeconds()).padStart(2, '0');
    widgetRealTimeTime.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// --- LÓGICA DE UI (ANIMAÇÃO, TEMA, WIDGET) ---
function toggleClockView() { timerDisplay.classList.toggle('active-clock'); realTimeDisplay.classList.toggle('active-clock'); widgetTimer.classList.toggle('hidden'); widgetRealTime.classList.toggle('hidden');}
function applyTheme(theme) { body.dataset.theme = theme; localStorage.setItem('focus-clock-theme', theme); document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true; }
function loadTheme() { applyTheme(localStorage.getItem('focus-clock-theme') || 'dark'); }
function toggleFullscreen() { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); } else { document.exitFullscreen(); } }

// --- FUNÇÕES DO MODAL (COM A LÓGICA DE BLUR) ---
function openSettingsModal() {
    renderPresets();
    settingsModal.style.display = 'block';
    setTimeout(() => {
        appContent.classList.add('blurred');
        settingsModal.classList.add('active');
    }, 10);
}
function closeSettingsModal() {
    appContent.classList.remove('blurred');
    settingsModal.classList.remove('active');
    setTimeout(() => {
        settingsModal.style.display = 'none';
        hidePresetForm();
    }, 300);
}

// --- GERENCIADOR DE CRONÔMETROS ---
function renderPresets() {
    presetsList.innerHTML = '';
    if (presets.length === 0) { presetsList.innerHTML = '<p class="empty-list" style="text-align:center; font-size:0.9em; color: var(--widget-text-color);">Nenhum cronômetro salvo.</p>'; return; }
    presets.forEach(p => {
        const li = document.createElement('li');
        li.dataset.id = p.id;
        li.innerHTML = `
            <div class="preset-info">
                <div class="name">${p.name}</div>
                <div class="time">${p.hours}h ${p.minutes}m</div>
            </div>
            <div class="preset-actions">
                <button class="has-tooltip" data-tooltip="Carregar"><i class="fas fa-play-circle"></i></button>
                <button class="has-tooltip" data-tooltip="Editar"><i class="fas fa-pencil-alt"></i></button>
                <button class="has-tooltip" data-tooltip="Excluir"><i class="fas fa-trash"></i></button>
            </div>
        `;
        presetsList.appendChild(li);
    });
}
function handlePresetActions(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const id = Number(target.closest('li').dataset.id);
    if (target.classList.contains('load-btn')) { totalSeconds = presets.find(p=>p.id===id).hours*3600 + presets.find(p=>p.id===id).minutes*60; resetTimer(); closeSettingsModal(); }
    if (target.classList.contains('edit-btn')) { const p = presets.find(p=>p.id===id); presetIdInput.value = p.id; presetNameInput.value = p.name; presetHoursInput.value = p.hours; presetMinutesInput.value = p.minutes; showPresetForm(); }
    if (target.classList.contains('delete-btn')) { if (confirm('Tem certeza?')) { presets = presets.filter(p => p.id !== id); saveAndRenderPresets(); }}
}
function savePreset(e) {
    e.preventDefault();
    const id = Number(presetIdInput.value);
    const newPreset = { name: presetNameInput.value || 'Sem nome', hours: Number(presetHoursInput.value) || 0, minutes: Number(presetMinutesInput.value) || 0 };
    if (id) { presets = presets.map(p => p.id === id ? { ...p, ...newPreset } : p); } 
    else { presets.push({ id: Date.now(), ...newPreset }); }
    saveAndRenderPresets();
    hidePresetForm();
}
function showPresetForm() { presetForm.classList.remove('hidden'); showPresetFormBtn.classList.add('hidden'); }
function hidePresetForm() { presetForm.classList.add('hidden'); showPresetFormBtn.classList.remove('hidden'); presetForm.reset(); presetIdInput.value = ''; }
function saveAndRenderPresets() { renderPresets(); localStorage.setItem('focus-clock-presets', JSON.stringify(presets)); }
function loadPresets() { presets = JSON.parse(localStorage.getItem('focus-clock-presets')) || []; }

// --- LÓGICA DO TOOLTIP CUSTOMIZADO ---
document.body.addEventListener('mouseenter', (e) => {
    if (!e.target.matches('.has-tooltip')) return;
    const button = e.target.closest('.has-tooltip');
    const tooltipText = button.getAttribute('data-tooltip');
    if (!tooltipText) return;

    customTooltip.textContent = tooltipText;
    customTooltip.classList.add('visible');
    const btnRect = button.getBoundingClientRect();
    customTooltip.style.top = `${btnRect.bottom + 8}px`; 
    customTooltip.style.left = `${btnRect.left + (btnRect.width / 2) - (customTooltip.offsetWidth / 2)}px`;
}, true);
document.body.addEventListener('mouseleave', (e) => {
    if (e.target.matches('.has-tooltip')) {
        customTooltip.classList.remove('visible');
    }
}, true);


// --- EVENT LISTENERS ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
toggleClockBtn.addEventListener('click', toggleClockView);
fullscreenBtn.addEventListener('click', toggleFullscreen);
settingsBtn.addEventListener('click', openSettingsModal);
closeBtn.addEventListener('click', closeSettingsModal);
themeRadios.forEach(radio => radio.addEventListener('change', (e) => applyTheme(e.target.value)));
presetsList.addEventListener('click', handlePresetActions);
presetForm.addEventListener('submit', savePreset);
showPresetFormBtn.addEventListener('click', showPresetForm);
cancelPresetBtn.addEventListener('click', hidePresetForm);

// --- INICIALIZAÇÃO ---
loadTheme();
loadPresets();
updateTimerDisplay();
updateRealTimeClock();
setInterval(updateRealTimeClock, 1000);
