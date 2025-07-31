let currentSong = new Audio();
let songs;
let currFolder;
let songsManifest;

// Load the songs manifest
async function loadManifest() {
    try {
        let response = await fetch('songs-manifest.json');
        songsManifest = await response.json();
        return songsManifest;
    } catch (error) {
        console.error('Error loading manifest:', error);
        return null;
    }
}

async function getSongs(folder) {
    currFolder = folder;
    
    // Find the album in manifest
    const album = songsManifest.albums.find(album => `songs/${album.folder}` === folder);
    
    if (!album) {
        console.error('Album not found in manifest:', folder);
        return [];
    }
    
    songs = album.songs;
    
    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // Clear the existing list
    
    for (const song of songs) {
        const remExtension = song.replaceAll(".mp3", "");
        const cleanedSong = remExtension.replaceAll("%20", " ");
        let artist = album.name; // Use album name from manifest
        
        songUl.innerHTML += `<li>
                                <img src="images/music.svg" alt="">
                                <div class="info">
                                    <h3 class="song-name">${cleanedSong}</h3>
                                    <h3 class="artist-name">${artist}</h3>
                                </div>
                                <div class="playnow">
                                    <img src="images/play.svg" alt="">
                                </div>
                            </li>`
    }
    
    // Add click listeners to songs
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            let songName = element.querySelector(".info").firstElementChild.innerHTML.trim();
            playSong(songName);
        })
    });
    
    return songs;
}

const playSong = (song, pause = false) => {
    let cleanSongName = song.replaceAll("%20", " ");
    let songFilename = cleanSongName + ".mp3";
    
    currentSong.src = `${currFolder}/${songFilename}`;
    
    // Store the current song filename for navigation
    currentSong.currentSongFile = songFilename;

    if (!pause) {
        currentSong.play();
        let playImg = document.getElementById("play-song");
        playImg.src = "images/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = cleanSongName;
    document.querySelector(".song-progress").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    if (!songsManifest) {
        console.error('Songs manifest not loaded');
        return;
    }
    
    let cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = ""; // Clear existing content
    
    for (const album of songsManifest.albums) {
        cardContainer.innerHTML += `<div data-folder="${album.folder}" class="card">
                        <div class="play-button">
                            <img src="images/play.svg" alt="">
                        </div>
                        <img id="song-thumbnail"
                            src="${album.cover}"
                            alt="song-thumbnail">
                        <h2>${album.name}</h2>
                        <p>${album.description}</p>
                    </div>`
    }

    // Listen for playlist card click to change songs folder
    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
                playSong(songs[0].replaceAll(".mp3", "").replaceAll("%20", " ")); // Play the first song by default
            }
        })
    })
}

async function main() {
    // Load the manifest first
    await loadManifest();
    
    if (!songsManifest || songsManifest.albums.length === 0) {
        console.error('No songs found in manifest');
        return;
    }
    
    // Load the first album by default
    await getSongs(`songs/${songsManifest.albums[0].folder}`);
    if (songs.length > 0) {
        playSong(songs[0].replaceAll(".mp3", "").replaceAll("%20", " "), true); // Play the first song by default
    }

    // Listen for play song button click
    let playImg = document.getElementById("play-song");
    playImg.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playImg.src = "images/pause.svg";
        } else {
            currentSong.pause();
            playImg.src = "images/play.svg";
        }
    })

    // Display all albums on the page
    await displayAlbums()

    // Listen for previous song button click
    let previmg = document.getElementById("prev-song");
    previmg.addEventListener("click", () => {
        if (!songs || songs.length === 0) {
            console.log('No songs available');
            return;
        }
        
        let currentSongFile = currentSong.currentSongFile;
        // console.log('Current song file:', currentSongFile);
        // console.log('Available songs:', songs);
        
        // Find current song index in the songs array
        let currentIndex = songs.findIndex(song => song === currentSongFile);
        // console.log('Current index:', currentIndex);
        
        // If current song not found, default to first song
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        // Get previous song index
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = songs.length - 1; // Loop to last song
        }
        
        let prevSong = songs[prevIndex];
        // console.log('Previous song file:', prevSong);
        
        // Remove .mp3 extension for playSong function
        let songName = prevSong.replace('.mp3', '');
        playSong(songName);
    })

    // Listen for next song button click
    let nextimg = document.getElementById("next-song");
    nextimg.addEventListener("click", () => {
        if (!songs || songs.length === 0) {
            console.log('No songs available');
            return;
        }
        
        let currentSongFile = currentSong.currentSongFile;
        // console.log('Current song file:', currentSongFile);
        // console.log('Available songs:', songs);
        
        // Find current song index in the songs array
        let currentIndex = songs.findIndex(song => song === currentSongFile);
        // console.log('Current index:', currentIndex);
        
        // If current song not found, default to first song
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        // Get next song index
        let nextIndex = currentIndex + 1;
        if (nextIndex >= songs.length) {
            nextIndex = 0; // Loop to first song
        }
        
        let nextSong = songs[nextIndex];
        // console.log('Next song file:', nextSong);
        
        // Remove .mp3 extension for playSong function
        let songName = nextSong.replace('.mp3', '');
        playSong(songName);
    })

    // Listen for time update event to update song progress
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = Math.floor(currentSong.currentTime);
        let duration = Math.floor(currentSong.duration);
        let currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = currentTime % 60;
        let durationMinutes = Math.floor(duration / 60);
        let durationSeconds = duration % 60;

        if (isNaN(durationMinutes) || isNaN(durationSeconds)) {
            durationMinutes = "0";
            durationSeconds = "0";
        }

        if (currentSeconds < 10) {
            currentSeconds = "0" + currentSeconds;
        }
        if (durationSeconds < 10) {
            durationSeconds = "0" + durationSeconds;
        }

        document.querySelector(".song-progress").innerHTML = `${currentMinutes}:${currentSeconds} / ${durationMinutes}:${durationSeconds}`;
        document.querySelector(".circle").style.left = `${(currentTime / duration) * 98}%`;
    });

    // Listen for seekbar click to change song time
    document.querySelector(".seekbar").addEventListener('click', (e) => {
        let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percentage}%`;
        currentSong.currentTime = (currentSong.duration * (percentage / 100));
    })

    // Listen for hamburger menu click to toggle sidebar
    let hamburger = document.querySelector(".hamburger");
    hamburger.addEventListener("click", () => {
        let leftBox = document.querySelector(".left");
        leftBox.style.left = "0";
    })

    // Listen for close button click to hide sidebar
    let close = document.querySelector(".close");
    close.addEventListener("click", () => {
        let leftBox = document.querySelector(".left");
        leftBox.style.left = "-100%";
    })

    document.querySelector(".volume-range").addEventListener("input", (e) => {
        let volume = e.target.value / 100;
        currentSong.volume = volume;
        
        // Update volume icon based on volume level
        let volumeImg = document.querySelector(".volumeImg");
        if (volume === 0) {
            volumeImg.src = volumeImg.src.replace("volume.svg", "mute.svg");
        } else {
            volumeImg.src = volumeImg.src.replace("mute.svg", "volume.svg");
        }
        
        // console.log('Volume set to:', volume);
    })

    document.querySelector(".volumeImg").addEventListener("click", (e) => {
        // console.log('Volume button clicked:', e.target.src);

        if (e.target.src.includes("volume.svg")) {
            currentSong.volume = 0;
            document.querySelector(".volume-range").value = 0;
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        } else if (e.target.src.includes("mute.svg")) {
            currentSong.volume = 0.5;
            document.querySelector(".volume-range").value = 50;
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        }
        
    });
}

main()