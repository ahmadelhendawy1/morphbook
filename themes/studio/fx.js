(function () {
  'use strict';

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mounted = new WeakMap();

  function confetti(book, button) {
    var root = book.root, area = root.getBoundingClientRect(), origin = button.getBoundingClientRect();
    var canvas = document.createElement('canvas'), px = Math.min(devicePixelRatio || 1, 2);
    canvas.className = 'studio-confetti';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = Math.round(area.width * px);
    canvas.height = Math.round(area.height * px);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(px, px);
    root.appendChild(canvas);

    var palette = getComputedStyle(root);
    var colors = ['--coral', '--mint', '--grape', '--lemon', '--sun'].map(function (name) {
      return palette.getPropertyValue(name).trim();
    });
    var x = origin.left + origin.width / 2 - area.left, y = origin.top - area.top;
    var pieces = Array.from({ length: 40 }, function (_, i) {
      return {
        dx: (Math.random() - .5) * 420, dy: -(100 + Math.random() * 230),
        angle: Math.random() * Math.PI, spin: (Math.random() - .5) * 11,
        size: 4 + Math.random() * 6, color: colors[i % colors.length]
      };
    });
    var start = performance.now();
    function draw(now) {
      var time = (now - start) / 1200;
      if (time >= 1 || motion.matches || book.state === 'drag' || !root.isConnected) {
        canvas.remove();
        return;
      }
      ctx.clearRect(0, 0, area.width, area.height);
      ctx.globalAlpha = Math.min(1, (1 - time) * 2.5);
      pieces.forEach(function (piece) {
        ctx.save();
        ctx.translate(x + piece.dx * time, y + piece.dy * time + 450 * time * time);
        ctx.rotate(piece.angle + piece.spin * time);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * .66);
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  window.MorphBookTheme = {
    onPage: function (_, book) {
      var root = book.root;
      if (root.dataset.theme !== 'studio') return;
      if (!mounted.has(book)) {
        root.addEventListener('click', function (event) {
          var button = event.target.closest('.mb-qopt');
          if (!button || button.matches('.right,.wrong,:disabled') || motion.matches || book.state === 'drag') return;
          requestAnimationFrame(function () {
            if (button.isConnected && button.classList.contains('right') && !motion.matches && book.state !== 'drag') {
              confetti(book, button);
            }
          });
        }, true);
        mounted.set(book, book.pos);
        return;
      }
      var moved = mounted.get(book) !== book.pos;
      mounted.set(book, book.pos);
      if (!moved || motion.matches || book.state === 'drag') return;
      root.querySelectorAll('.mb-slot > .mb-page').forEach(function (page) {
        page.classList.add('studio-settle');
      });
    }
  };
})();
