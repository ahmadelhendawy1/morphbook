/* Studio toolbar icons.
   Source of truth: Figma file "MorphBook · Studio Theme", page "Icons", components icon/<name>
   (https://www.figma.com/design/CkhTqgIlQA2ms6glhpr5Cg). 24x24 viewBox, stroke 2.2, round caps and joins;
   the engine's CSS sets stroke width and colour, so only the shapes live here.
   Loaded after fx.js; the engine reads them from the mount options (opts.icons), per book. */
(function () {
  'use strict';
  var theme = window.MorphBookTheme = window.MorphBookTheme || {};
  theme.icons = {
    menu: '<path d="M5 7h14M5 12h14M5 17h9"/>',
    sound: '<path d="M4.5 9.5v5a1 1 0 0 0 1 1H8l4.2 3.4a.8.8 0 0 0 1.3-.6V5.7a.8.8 0 0 0-1.3-.6L8 8.5H5.5a1 1 0 0 0-1 1z"/><path d="M16.5 9a4 4 0 0 1 0 6M18.8 6.5a7.5 7.5 0 0 1 0 11"/>',
    mute: '<path d="M4.5 9.5v5a1 1 0 0 0 1 1H8l4.2 3.4a.8.8 0 0 0 1.3-.6V5.7a.8.8 0 0 0-1.3-.6L8 8.5H5.5a1 1 0 0 0-1 1z"/><path d="M17 9.5l4 5M21 9.5l-4 5"/>',
    read: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3M9 20.5h6"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="3"/>',
    moon: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/><path d="M17 3.5v3M15.5 5h3"/>',
    full: '<path d="M4.5 9V6.5a2 2 0 0 1 2-2H9M15 4.5h2.5a2 2 0 0 1 2 2V9M19.5 15v2.5a2 2 0 0 1-2 2H15M9 19.5H6.5a2 2 0 0 1-2-2V15"/>',
    print: '<path d="M7 9V5.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V9"/><rect x="3.5" y="9" width="17" height="7.5" rx="2.5"/><rect x="7" y="13.5" width="10" height="6.5" rx="1.5"/>',
    quiz: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0v-5zM8 6.5H5.5a2.5 2.5 0 0 0 2.6 3.6M16 6.5h2.5a2.5 2.5 0 0 1-2.6 3.6M12 13.5V17M8.5 20h7M10 17h4"/>',
    left: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    right: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>'
  };
})();
