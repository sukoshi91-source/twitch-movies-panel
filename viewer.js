var IMG_BASE = 'https://image.tmdb.org/t/p/w92';
var allData = { films: [], series: [], watchfilms: [], watchseries: [] };
var currentTab = 'films';
var config = {};

document.getElementById('tab-films').addEventListener('click', function() { switchTab('films'); });
document.getElementById('tab-series').addEventListener('click', function() { switchTab('series'); });
document.getElementById('tab-watchfilms').addEventListener('click', function() { switchTab('watchfilms'); });
document.getElementById('tab-watchseries').addEventListener('click', function() { switchTab('watchseries'); });

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  renderList();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderList() {
  var container = document.getElementById('list-container');
  var items = allData[currentTab];
  var labels = {
    films:       'No films in this list yet.',
    series:      'No series in this list yet.',
    watchfilms:  'No films in the watchlist yet.',
    watchseries: 'No series in the watchlist yet.'
  };
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="empty"><span class="empty-icon">🎬</span>' + labels[currentTab] + '</div>';
    return;
  }
  var html = '<div class="list">';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var title = escHtml(item.title || item.name || 'Untitled');
    var date = item.release_date || item.first_air_date || '';
    var year = date ? date.substring(0, 4) : '';
    var img = item.poster_path
      ? '<img class="cover" src="' + IMG_BASE + item.poster_path + '" alt="" loading="lazy">'
      : '<div class="cover-placeholder">🎬</div>';
    html += '<div class="card">' + img + '<div class="info"><div class="title">' + title + '</div>';
    if (year) html += '<div class="year">' + year + '</div>';
    html += '</div></div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function fetchList(listId, callback) {
  fetch('https://api.themoviedb.org/3/list/' + listId + '?api_key=' + config.apiKey + '&language=en-US')
    .then(function(res) {
      if (!res.ok) throw new Error('Could not load list (HTTP ' + res.status + ')');
      return res.json();
    })
    .then(function(data) { callback(null, data.items || []); })
    .catch(function(e) { callback(e, []); });
}

function setCount(tab, n) {
  document.getElementById('count-' + tab).textContent = n;
}

function loadAll() {
  var container = document.getElementById('list-container');
  container.innerHTML = '<div class="loading"><span class="spinner"></span>Loading...</div>';

  var keys = ['films', 'series', 'watchfilms', 'watchseries'];
  var listMap = {
    films:       config.listFilms,
    series:      config.listSeries,
    watchfilms:  config.listWatchFilms,
    watchseries: config.listWatchSeries
  };
  var done = 0;
  var errors = [];

  keys.forEach(function(key) {
    fetchList(listMap[key], function(err, items) {
      done++;
      if (err) {
        errors.push(err.message);
      } else {
        allData[key] = items;
        setCount(key, items.length);
      }
      if (done === keys.length) {
        if (errors.length === keys.length) {
          container.innerHTML = '<div class="error">&#9888; ' + escHtml(errors[0]) + '</div>';
        } else {
          renderList();
        }
      }
    });
  });
}

function showNotConfigured() {
  document.getElementById('streamer-name').textContent = 'Not configured';
  document.getElementById('list-container').innerHTML =
    '<div class="not-configured">&#128249; This streamer hasn\'t configured their Watch List yet.</div>';
}

function init() {
  var raw = localStorage.getItem('tmdb_config');
  if (!raw) { showNotConfigured(); return; }
  try { config = JSON.parse(raw); } catch(e) { showNotConfigured(); return; }
  if (!config.apiKey || !config.listFilms || !config.listSeries || !config.listWatchFilms || !config.listWatchSeries) {
    showNotConfigured(); return;
  }
  document.getElementById('streamer-name').textContent = config.streamerName || 'Watch List';
  loadAll();
}

init();
