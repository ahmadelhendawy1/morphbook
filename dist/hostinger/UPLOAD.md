# Upload MorphBook Studio to ai4edutech.com

One file, no PHP, no database, no API keys.

| From this folder | To Hostinger |
|---|---|
| `public_html/apps/morphbook/index.html` | `public_html/apps/morphbook/index.html` |

1. hPanel → **Files → File Manager**.
2. Open `public_html/apps`. Create the folder `morphbook` if it is not there.
3. Upload `index.html` into it (replace the old one when updating).
4. Open https://ai4edutech.com/apps/morphbook/

The page loads the site navbar from `/assets/ai4-shell.css` and `/assets/ai4-shell.js`.

## What teachers do

1. **✨ Book with AI** tab: answer the interview by clicking (topic, subject, stage, objectives, language, length, storytelling, interactive pages, quiz size, video link).
2. **Write and copy the prompt** → paste it into ChatGPT, Gemini or Claude.
3. Paste the AI's whole reply into step 5 → **Build the book**. Small slips are fixed automatically; real mistakes are listed with a ready **fix message** to send back to the AI.
4. Turn the pages, add pictures on picture pages, choose a theme, then **download one HTML file** (works offline, fonts included).

The **📄 From a PDF** tab turns a PDF or page images into a flipbook without any AI.

Nothing is uploaded to the server: the PDF, the AI reply and the book stay in the teacher's browser.

## Rebuild after changing the engine or the Studio

```
python tools/build_studio.py --hosting
```
