const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// creating elements object to store references to DOM elements
const elements = {
  form: document.getElementById("search-form"),
  input: document.getElementById("word-input"),
  status: document.getElementById("status"),
  result: document.getElementById("result"),
  word: document.getElementById("result-word"),
  phonetic: document.getElementById("result-phonetic"),
  meanings: document.getElementById("meanings"),
  source: document.getElementById("source"),
  audioBtn: document.getElementById("audio-btn"),
  saveBtn: document.getElementById("save-btn"),
  themeBtn: document.getElementById("theme-toggle"),
  savedList: document.getElementById("saved-list"),
  savedEmpty: document.getElementById("saved-empty")
};

let currentWord = null;
let currentAudio = "";
let savedWords = load("wordly-saved", []);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage can be blocked; the app still works without it 
  }
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

async function searchWord(word) {
  const term = word.trim().toLowerCase();
  if (!term) {
    setStatus("Type a word first.");
    return;
  }

  setStatus(`Looking up "${term}"...`);
  elements.result.hidden = true;

  try {
    const response = await fetch(API_URL + encodeURIComponent(term));

    if (response.status === 404) {
      setStatus(`No definition found for "${term}". Check the spelling or try another word.`, true);
      return;
    }
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    putEntry(data[0]);
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Could not reach the dictionary service. Check your connection and try again.", true);
  }
}

function putEntry(entry) {
  currentWord = entry.word.toLowerCase();
  elements.word.textContent = entry.word;

  const phonetic = entry.phonetic ||
    (entry.phonetics.find((p) => p.text) || {}).text || "";
  elements.phonetic.textContent = phonetic;

  const withAudio = entry.phonetics.find((p) => p.audio);
  currentAudio = withAudio ? withAudio.audio : "";
  elements.audioBtn.hidden = !currentAudio;

  elements.meanings.innerHTML = "";
  entry.meanings.forEach((meaning) => {
    elements.meanings.appendChild(buildMeaning(meaning));
  });

  const url = (entry.sourceUrls && entry.sourceUrls[0]) || "";
  elements.source.textContent = "";
  if (url) {
    elements.source.append("Source: ");
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = url;
    elements.source.appendChild(link);
  }

  updateSaveState();
  elements.result.hidden = false;
}

function buildMeaning(meaning) {
  const block = document.createElement("div");
  block.className = "meaning";

  const heading = document.createElement("h3");
  heading.textContent = meaning.partOfSpeech;
  block.appendChild(heading);

  const list = document.createElement("ol");
  meaning.definitions.slice(0, 4).forEach((def) => {
    const item = document.createElement("li");
    item.textContent = def.definition;
    if (def.example) {
      const ex = document.createElement("p");
      ex.className = "example";
      ex.textContent = `"${def.example}"`;
      item.appendChild(ex);
    }
    list.appendChild(item);
  });
  block.appendChild(list);

  const synonyms = (meaning.synonyms || []).slice(0, 6);
  if (synonyms.length) {
    const line = document.createElement("p");
    line.className = "synonyms";
    line.append("Synonyms: ");
    synonyms.forEach((syn, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = syn;
      btn.addEventListener("click", () => {
        elements.input.value = syn;
        searchWord(syn);
      });
      line.appendChild(btn);
      if (i < synonyms.length - 1) line.append(", ");
    });
    block.appendChild(line);
  }
  return block;
}

//Saved words 
function updateSaveState() {
  const saved = savedWords.includes(currentWord);
  elements.saveBtn.textContent = saved ? "Remove from saved" : "Save word";
  elements.result.classList.toggle("is-saved", saved);
}

function makeSaved() {
  elements.savedList.innerHTML = "";
  elements.savedEmpty.hidden = savedWords.length > 0;

  savedWords.forEach((word) => {
    const li = document.createElement("li");

    const open = document.createElement("button");
    open.type = "button";
    open.textContent = word;
    open.addEventListener("click", () => {
      elements.input.value = word;
      searchWord(word);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${word}`);
    remove.addEventListener("click", () => {
      savedWords = savedWords.filter((w) => w !== word);
      store("wordly-saved", savedWords);
      renderSaved();
      updateSaveState();
    });

    li.append(open, remove);
    elements.savedList.appendChild(li);
  });
}

function toggleSaved() {
  if (!currentWord) return;
  if (savedWords.includes(currentWord)) {
    savedWords = savedWords.filter((w) => w !== currentWord);
  } else {
    savedWords.push(currentWord);
  }
  store("wordly-saved", savedWords);
  renderSaved();
  updateSaveState();
}

// Theme 
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  elements.themeBtn.textContent = dark ? "Light theme" : "Dark theme";
  elements.themeBtn.setAttribute("aria-pressed", String(dark));
  store("wordly-dark", dark);
}

// Event listeners
elements.form.addEventListener("submit", (e) => {
  e.preventDefault();
  searchWord(elements.input.value);
});

elements.saveBtn.addEventListener("click", toggleSaved);

elements.audioBtn.addEventListener("click", () => {
  if (!currentAudio) return;
  new Audio(currentAudio).play().catch(() => {
    setStatus("The pronunciation audio could not be played.", true);
  });
});

elements.themeBtn.addEventListener("click", () => {
  applyTheme(!document.body.classList.contains("dark"));
});

//Startup 
applyTheme(load("wordly-dark", window.matchMedia("(prefers-color-scheme: dark)").matches));
renderSaved();