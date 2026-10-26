# Wordly Dictionary
 
 live site https://mutungaclaudia5-dot.github.io/wordly_spa/

A single page app for looking up English words. You type a word, and the page shows how to say it, what it means, how it's used and where the information came from, all without reloading. I built it as the final project for the second module of my software engineering course, using plain HTML, CSS and JavaScript with no frameworks or build tools.

# What it does

- Searches for a word through an HTML form (press Enter or click Search).
- Shows the phonetic spelling and a button to play the audio pronunciation when the API has a recording.
- Lists definitions grouped by part of speech, with an example sentence where one exists. I cap it at four definitions per part of speech so the page doesn't turn into a wall of text.
- Shows synonyms. Clicking one runs a new search for it.
- Links to the source page the API reports for the word.
- Lets you save words. 
- Has a light and dark theme. 
- Shows an error message when a word isn't found or when the request fails.

# Running it

There's nothing to install.

1. Download or clone the repository.
2. Open `index.html` in a browser.

You need an internet connection because the definitions come from an online API.

# Files

| File | Purpose |
| `index.html` | Page structure: the form, the result area and the saved words list |
| `style.css` | Layout, colors, both themes and the highlight for saved words |
| `script.js` | Fetching, rendering, saving words, theme switching and error handling |

# The API

Data comes from the [Free Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/). No key is needed. A lookup is a GET request to:

```
https://api.dictionaryapi.dev/api/v2/entries/en/<word>
```

The response is an array of entries. Each entry has `phonetics` (text and audio), `meanings` (part of speech, definitions, examples, synonyms) and `sourceUrls`.

# How the code is organised

`searchWord()` handles the request. `putEntry()` and `buildMeaning()` turn the response into page elements. Everything that comes from the API is inserted with `textContent` rather than `innerHTML`, so odd characters in a response can't break the page or inject markup.

Error handling covers two separate cases:

- **Word not found.** The API answers with a 404, and the page says no definition was found and suggests checking the spelling.
- **Request fails.** Network trouble or any other bad status ends up in the `catch` block, and the page tells the user it couldn't reach the service.

Saved words and the theme choice are kept in `localStorage`. Reads and writes are wrapped in `try/catch` because some browsers block storage in private mode, and the app should keep working if that happens.

The CSS changes through JavaScript in two places: a `dark` class on `<body>` swaps the color variables for the whole page, and an `is-saved` class on the result card adds the highlight when the current word is in the saved list.

# Testing I did

- Common words: `book`, `run`, `light`.
- A word with no audio, to check the play button hides itself.
- A nonsense word (`asdfghj`) for the not-found message.
- Turning off wifi and searching, for the connection error.
- Empty and whitespace-only input.
- Saving, removing, refreshing the page and checking the saved list is still there.
- Switching themes and reloading.
- Resizing the window down to phone width.

# limitations

- English only.
- Only the first entry returned for a word is shown, so words with several separate entries (like homographs) lose the others.
- Some words have no example sentences, synonyms or audio. 

