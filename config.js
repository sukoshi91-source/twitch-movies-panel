var saved = localStorage.getItem('tmdb_config');
if (saved) {
  try {
    var cfg = JSON.parse(saved);
    if (cfg.streamerName)    document.getElementById('input-name').value = cfg.streamerName;
    if (cfg.apiKey)          document.getElementById('input-apikey').value = cfg.apiKey;
    if (cfg.listFilms)       document.getElementById('input-films').value = cfg.listFilms;
    if (cfg.listSeries)      document.getElementById('input-series').value = cfg.listSeries;
    if (cfg.listWatchFilms)  document.getElementById('input-watchfilms').value = cfg.listWatchFilms;
    if (cfg.listWatchSeries) document.getElementById('input-watchseries').value = cfg.listWatchSeries;
    document.getElementById('status').textContent = 'Configuration already saved.';
    document.getElementById('status').className = 'status ok';
  } catch(e) {}
}

document.getElementById('save-btn').addEventListener('click', function() { saveConfig(); });

function saveConfig() {
  var cfg = {
    streamerName:    document.getElementById('input-name').value.trim(),
    apiKey:          document.getElementById('input-apikey').value.trim(),
    listFilms:       document.getElementById('input-films').value.trim(),
    listSeries:      document.getElementById('input-series').value.trim(),
    listWatchFilms:  document.getElementById('input-watchfilms').value.trim(),
    listWatchSeries: document.getElementById('input-watchseries').value.trim()
  };

  var btn = document.getElementById('save-btn');
  var status = document.getElementById('status');

  if (!cfg.apiKey) { status.textContent = 'API key is required.'; status.className = 'status err'; return; }
  if (!cfg.listFilms || !cfg.listSeries || !cfg.listWatchFilms || !cfg.listWatchSeries) {
    status.textContent = 'All 4 list IDs are required.'; status.className = 'status err'; return;
  }

  btn.disabled = true;
  btn.textContent = 'Verifying...';
  status.textContent = '';

  fetch('https://api.themoviedb.org/3/list/' + encodeURIComponent(cfg.listFilms) + '?api_key=' + encodeURIComponent(cfg.apiKey) + '&language=en-US')
    .then(function(res) {
      if (!res.ok) throw new Error('Invalid API key or list ID (HTTP ' + res.status + ')');
      return res.json();
    })
    .then(function() {
      localStorage.setItem('tmdb_config', JSON.stringify(cfg));
      status.textContent = 'Saved! Viewers will now see your Watch List.';
      status.className = 'status ok';
    })
    .catch(function(e) {
      status.textContent = e.message;
      status.className = 'status err';
    })
    .finally(function() {
      btn.disabled = false;
      btn.textContent = 'Save & Verify';
    });
}
