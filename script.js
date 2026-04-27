const tracks = [
  { title: "Midnight Drive",    artist: "Neon Pulse",    duration: "3:42", emoji: "🌙", color: "#1a0a2e" },
  { title: "Ocean Breath",      artist: "Blue Meridian", duration: "4:15", emoji: "🌊", color: "#0a1a2e" },
  { title: "Golden Hours",      artist: "Solaris",       duration: "3:58", emoji: "☀️", color: "#2e1a00" },
  { title: "Electric Storm",    artist: "Voltage",       duration: "3:21", emoji: "⚡", color: "#0a1e0a" },
  { title: "Desert Wind",       artist: "Sandstone",     duration: "5:04", emoji: "🏜️", color: "#2e1800" },
  { title: "Neon Skyline",      artist: "Cyberdrift",    duration: "3:33", emoji: "🌆", color: "#0e0020" },
  { title: "Beneath the Stars", artist: "Crestfall",     duration: "4:47", emoji: "✨", color: "#00101e" },
  { title: "Iron Bloom",        artist: "Parallax",      duration: "3:09", emoji: "🌸", color: "#1e0010" },
  { title: "Deep Current",      artist: "Undertow",      duration: "4:28", emoji: "🎸", color: "#001a10" },
  { title: "Frozen Moment",     artist: "Stillwater",    duration: "3:55", emoji: "❄️", color: "#001828" },
];

// ── State ──
let currentIndex   = 0;
let isPlaying      = false;
let progressInterval = null;
let totalSeconds   = 0;
let elapsedSeconds = 0;

// ── DOM refs ──
const playBtn       = document.getElementById('playBtn');
const playIcon      = document.getElementById('playIcon');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const progressFill  = document.getElementById('progressFill');
const progressBar   = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');
const songTitle     = document.getElementById('songTitle');
const songArtist    = document.getElementById('songArtist');
const albumArt      = document.getElementById('albumArt');
const albumEmoji    = document.getElementById('albumEmoji');
const volumeSlider  = document.getElementById('volumeSlider');
const viz           = document.getElementById('viz');
const playlistEl    = document.getElementById('playlist');
const trackCountEl  = document.getElementById('trackCount');

// ── Helpers ──
function parseDuration(dur) {
  const [m, s] = dur.split(':').map(Number);
  return m * 60 + s;
}

function formatTime(s) {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Core Functions ──
function loadTrack(index, autoplay = false) {
  const t        = tracks[index];
  currentIndex   = index;
  elapsedSeconds = 0;
  totalSeconds   = parseDuration(t.duration);

  songTitle.textContent  = t.title;
  songArtist.textContent = t.artist;
  albumEmoji.textContent = t.emoji;
  albumArt.style.background = `linear-gradient(135deg, ${t.color}, #0d1020)`;

  progressFill.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent   = formatTime(totalSeconds);

  // Highlight active track in list
  document.querySelectorAll('.track-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  clearInterval(progressInterval);

  if (autoplay && isPlaying) {
    startProgress();
  } else if (!autoplay) {
    stopProgress();
  }
}

function startProgress() {
  clearInterval(progressInterval);
  albumArt.classList.add('playing');
  viz.classList.add('active');

  progressInterval = setInterval(() => {
    elapsedSeconds++;

    if (elapsedSeconds >= totalSeconds) {
      nextTrack();
      return;
    }

    const pct = (elapsedSeconds / totalSeconds) * 100;
    progressFill.style.width = pct + '%';
    currentTimeEl.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function stopProgress() {
  clearInterval(progressInterval);
  albumArt.classList.remove('playing');
  viz.classList.remove('active');
}

function togglePlay() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    startProgress();
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    stopProgress();
  }
}

function nextTrack() {
  loadTrack((currentIndex + 1) % tracks.length, isPlaying);
  if (isPlaying) startProgress();
}

function prevTrack() {
  // If more than 3s in, restart current track; otherwise go to previous
  if (elapsedSeconds > 3) {
    elapsedSeconds = 0;
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    if (isPlaying) { clearInterval(progressInterval); startProgress(); }
    return;
  }
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length, isPlaying);
  if (isPlaying) startProgress();
}

// ── Event Listeners ──
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Click to seek
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  elapsedSeconds = Math.floor(pct * totalSeconds);
  progressFill.style.width = (pct * 100) + '%';
  currentTimeEl.textContent = formatTime(elapsedSeconds);
});

// Volume slider visual fill
volumeSlider.addEventListener('input', () => {
  const v = parseFloat(volumeSlider.value);
  volumeSlider.style.background =
    `linear-gradient(to right, var(--accent) ${v * 100}%, rgba(255,255,255,0.1) ${v * 100}%)`;
});
volumeSlider.dispatchEvent(new Event('input')); // init fill

// ── Build Playlist ──
tracks.forEach((t, i) => {
  const item = document.createElement('div');
  item.className = 'track-item' + (i === 0 ? ' active' : '');
  item.innerHTML = `
    <span class="track-num">${(i + 1).toString().padStart(2, '0')}</span>
    <div class="track-meta">
      <div class="track-name">${t.emoji} ${t.title}</div>
      <div class="track-by">${t.artist}</div>
    </div>
    <span class="track-dur">${t.duration}</span>
  `;
  item.addEventListener('click', () => {
    const wasPlaying = isPlaying;
    loadTrack(i, wasPlaying);
    if (wasPlaying) startProgress();
  });
  playlistEl.appendChild(item);
});

trackCountEl.textContent = `${tracks.length} tracks`;

// ── Build Waveform Decoration ──
const waveEl = document.getElementById('waveformDeco');
for (let i = 0; i < 60; i++) {
  const seg = document.createElement('div');
  seg.className = 'wave-seg';
  const h = 5 + Math.sin(i * 0.4) * 15 + Math.sin(i * 0.9) * 10 + Math.random() * 8;
  seg.style.height = Math.max(4, h) + 'px';
  waveEl.appendChild(seg);
}

// ── Init ──
loadTrack(0);
