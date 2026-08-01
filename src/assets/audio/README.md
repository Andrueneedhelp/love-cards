# Music Player Audio Directory

Place your `.mp3` song files in this directory!

Once you have placed your files here (for example, `song.mp3`), open `src/assets/js/index.js` and update the `src` attribute inside the `SONGS` playlist array to point to your new file:

```javascript
const SONGS = [
    { title: 'Your Song Title', artist: 'Artist Name', art: 'images/image_05.jpg', src: 'assets/audio/song.mp3' },
    // ...
];
```
