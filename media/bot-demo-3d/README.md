# Flebo One bot demo (3D, 60 s)

Three.js scene rendered frame by frame in headless Chromium and encoded with ffmpeg.

    npm i three@0.170.0 playwright-core@1.55.0
    python3 -m http.server 8765 --bind 127.0.0.1 &
    node capture.mjs video ../flebo-bot-demo.mp4 30 4 60   # from 4 s: the city intro is cut
    node capture.mjs stills /tmp 12.5 29 44   # preview frames

`capture.mjs` has the Chromium and ffmpeg paths of the cloud container; change them to run elsewhere.
