document.addEventListener("DOMContentLoaded", function() {
  window.requestAnimationFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
      return function (callback, element) {
        let lastTime = element.__lastTime || 0;
        let currTime = Date.now();
        let timeToCall = Math.max(1, 33 - (currTime - lastTime));
        window.setTimeout(callback, timeToCall);
        element.__lastTime = currTime + timeToCall;
      };
    })();

  window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test((navigator.userAgent || navigator.vendor || window.opera).toLowerCase()));

  let heartAnimationFrame = null;

  function initHeartAnimation() {
    let mobile = window.isDevice;
    let koef = mobile ? 0.5 : 1;
    const canvas = document.getElementById('heart');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = koef * window.innerWidth;
    let height = canvas.height = koef * window.innerHeight;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    window.addEventListener('resize', function () {
      width = canvas.width = koef * window.innerWidth;
      height = canvas.height = koef * window.innerHeight;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, width, height);
    });

    const heartPosition = function (rad) {
      return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };
    const scaleAndTranslate = function (pos, sx, sy, dx, dy) {
      return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    const traceCount = mobile ? 20 : 50;
    const pointsOrigin = [];
    const dr = mobile ? 0.3 : 0.1;
    for (let i = 0; i < Math.PI * 2; i += dr) 
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += dr) 
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += dr) 
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    const heartPointsCount = pointsOrigin.length;

    const targetPoints = [];
    const pulse = function (kx, ky) {
      for (let i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [];
        targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
        targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
      }
    };

    const particles = [];
    for (let i = 0; i < heartPointsCount; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      particles[i] = {
        vx: 0,
        vy: 0,
        speed: Math.random() + 5,
        q: Math.floor(Math.random() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * Math.random() + 0.7,
        f: "hsla(0," + Math.floor(40 * Math.random() + 60) + "%," + Math.floor(60 * Math.random() + 20) + "%,.3)",
        trace: []
      };
      for (let k = 0; k < traceCount; k++) {
        particles[i].trace[k] = { x: x, y: y };
      }
    }
    const config = {
      traceK: 0.4,
      timeDelta: 0.01
    };

    function loop() {
      pulse(1, 1);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        const target = targetPoints[p.q];
        const dx = p.trace[0].x - target[0];
        const dy = p.trace[0].y - target[1];
        const distSq = dx * dx + dy * dy;
        if (distSq < 100) {
          if (Math.random() > 0.95) {
            p.q = Math.floor(Math.random() * heartPointsCount);
          } else {
            if (Math.random() > 0.99) {
              p.D *= -1;
            }
            p.q = (p.q + p.D + heartPointsCount) % heartPointsCount;
          }
        }
        const len = Math.sqrt(distSq) || 1;
        p.vx += (-dx / len) * p.speed;
        p.vy += (-dy / len) * p.speed;
        p.trace[0].x += p.vx;
        p.trace[0].y += p.vy;
        p.vx *= p.force;
        p.vy *= p.force;

        for (let k = 0; k < p.trace.length - 1; k++) {
          p.trace[k + 1].x -= config.traceK * (p.trace[k + 1].x - p.trace[k].x);
          p.trace[k + 1].y -= config.traceK * (p.trace[k + 1].y - p.trace[k].y);
        }

        ctx.fillStyle = p.f;
        ctx.beginPath();
        for (let k = 0; k < p.trace.length; k++) {
          ctx.rect(p.trace[k].x, p.trace[k].y, 1, 1);
        }
        ctx.fill();
      }
      heartAnimationFrame = window.requestAnimationFrame(loop);
    }
    loop();
  }

  initHeartAnimation();
//change path to photos and title for them. you can add as many pictures and captions as you want. but keep the object's structure
  const photos = [
    { photo: "src/photo/1.jpg", title: "cute title for first photo" },
    { photo: "src/photo/2.jpg", title: "something else" },
    { photo: "src/photo/3.jpg", title: "new words" }
  ];

  let currentSlide = 0;
  const slideInterval = 3000;

  let slideTimer;
  const introDiv = document.getElementById("intro");
  const introImg = document.getElementById("introImg");
  const captionDiv = document.getElementById("caption");

  function showSlide(index) {
    const item = photos[index];
    introImg.classList.add("fade-out");
    captionDiv.classList.add("fade-out");

    setTimeout(() => {
      introImg.src = item.photo;
      captionDiv.textContent = item.title;
      introImg.classList.remove("fade-out");
      captionDiv.classList.remove("fade-out");
      introImg.classList.add("fade-in");
      captionDiv.classList.add("fade-in");
      setTimeout(() => {
        introImg.classList.remove("fade-in");
        captionDiv.classList.remove("fade-in");
      }, 1000);
    }, 1000);
  }

  function startSlider() {
    currentSlide = 0;
    showSlide(currentSlide);
    slideTimer = setInterval(() => {
      currentSlide++;
      if (currentSlide < photos.length) {
        showSlide(currentSlide);
      } else {
        endSlider();
      }
    }, slideInterval);
  }

  function endSlider() {
    clearInterval(slideTimer);
    introDiv.style.transition = "opacity 1s";
    introDiv.style.opacity = 0;
    setTimeout(() => {
      introDiv.style.display = "none";
      document.getElementById("inscription").style.display = "block";
      document.getElementById("heart").style.display = "block";
      document.getElementById("controls").style.display = "block";
      initHeartAnimation();
    }, 1000);
  }

  const viewPhotosBtn = document.getElementById("viewPhotosBtn");
  viewPhotosBtn.addEventListener("click", () => {
    cancelAnimationFrame(heartAnimationFrame);
    document.getElementById("inscription").style.display = "none";
    document.getElementById("heart").style.display = "none";
    document.getElementById("controls").style.display = "none";
    introDiv.style.display = "block";
    introDiv.style.opacity = 1;
    startSlider();
  });

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    clearInterval(slideTimer);
    introDiv.style.display = "none";
    document.getElementById("inscription").style.display = "block";
    document.getElementById("heart").style.display = "block";
    document.getElementById("controls").style.display = "block";
    initHeartAnimation();
  });

  // music for playing on background. you can add many tracks to an array
  //change path to your track
  const musicPlaylist = [
    'src/music/her favorite songs.mp3'
  ];
  let currentSong = 0;
  const bgMusic = document.getElementById('backgroundMusic');
  bgMusic.src = musicPlaylist[currentSong];
  
  bgMusic.addEventListener('ended', () => {
    currentSong = (currentSong + 1) % musicPlaylist.length;
    bgMusic.src = musicPlaylist[currentSong];
    bgMusic.play();
  });

  const viewVideoBtn = document.getElementById("viewVideoBtn");
  const videoContainer = document.getElementById("videoContainer");
  const youtubePlayer = document.getElementById("videoPlayer");
  const backVideoBtn = document.getElementById("backVideoBtn");

  viewVideoBtn.addEventListener("click", () => {
    bgMusic.pause();
    cancelAnimationFrame(heartAnimationFrame);
    document.getElementById("inscription").style.display = "none";
    document.getElementById("heart").style.display = "none";
    document.getElementById("controls").style.display = "none";
    videoContainer.style.display = "block";
    // change URL to URL your video on YouTube:
    youtubePlayer.src = "https://www.youtube.com/embed/dQw4w9WgXcQ"
  });

  backVideoBtn.addEventListener("click", () => {
    youtubePlayer.src = youtubePlayer.src;
    bgMusic.play().catch(e => console.log("Error:", e));
    videoContainer.style.display = "none";
    document.getElementById("inscription").style.display = "block";
    document.getElementById("heart").style.display = "block";
    document.getElementById("controls").style.display = "block";
    initHeartAnimation();
  });


  const startMusicBtn = document.getElementById("startMusicBtn");
  const volumeControl = document.getElementById("volumeControl");

  startMusicBtn.addEventListener("click", () => {
    bgMusic.play().catch(e => console.log("Error:", e));
    startMusicBtn.style.display = "none";
    volumeControl.style.display = ""
    bgMusic.volume = volumeControl.value;
  });

  volumeControl.addEventListener("input", () => {
    bgMusic.volume = volumeControl.value;
  });
  
});
