# Upload MorphBook Studio to ai4edutech.com

Two files. No database and no API keys.

| From this folder | To Hostinger | What it is |
|---|---|---|
| `public_html/apps/morphbook/index.html` | `public_html/apps/morphbook/index.html` | the Studio, and the reader for shared links |
| `public_html/api/morphbook_api.php` | `public_html/api/morphbook_api.php` | publishing: saves a book and gives its link |

1. hPanel → **Files → File Manager**.
2. Open `public_html/apps`, create the folder `morphbook`, upload `index.html` into it.
3. Open `public_html/api`, upload `morphbook_api.php` into it.
4. Open https://ai4edutech.com/apps/morphbook/

Published books are saved as small JSON files in a folder **above** `public_html` (`morphbook_books`), created automatically the first time a teacher publishes. Nobody can open that folder from the web; books are read only through the API, and the Studio cleans every book again before showing it. Limits: 8 MB per book, 30 publishes per hour per visitor. A shared link looks like `https://ai4edutech.com/apps/morphbook/?b=k3j9x0p2qa`.

The page loads the site navbar from `/assets/ai4-shell.css` and `/assets/ai4-shell.js`.

## What teachers do

1. **✨ Book with AI** tab: answer the interview by clicking (topic, subject, stage, objectives, language, length, storytelling, interactive pages, quiz size, video link).
2. **Write and copy the prompt** → paste it into ChatGPT, Gemini or Claude.
3. Paste the AI's whole reply into step 5 → **Build the book**. Small slips are fixed automatically; real mistakes are listed with a ready **fix message** to send back to the AI.
4. Turn the pages, add pictures on picture pages, choose a theme, then **download one HTML file** (works offline, fonts included).

The **📄 From a PDF** tab turns a PDF or page images into a flipbook without any AI.

Nothing goes to the server until the teacher presses **🔗 Publish and get a link**: then only the finished book (its pages and pictures) is saved. Publishing again from the same browser updates the same link.

## Rebuild after changing the engine or the Studio

```
python tools/build_studio.py --hosting
```
