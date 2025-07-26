console.log('Spotify Clone script loaded');
let currentSong = new Audio();
let songs;

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/SpotifyClone/songs/")
    // let a = await fetch("http://127.0.0.1:5500/SpotifyClone/songs/")
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let links = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]); //it will split the song and give the second part
        }
    }
    return songs;
}

const playSong = (song, pause = false) => {
    currentSong.src = `songs/${song}.mp3`;
    if (!pause) {
        currentSong.play();
        let playImg = document.getElementById("play-song");
        playImg.src = "images/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = song;
    document.querySelector(".song-progress").innerHTML = "00:00 / 00:00";
}



async function main() {
    songs = await getSongs();
    // console.log('Songs fetched:', songs);
    playSong(songs[0].replaceAll(".mp3", "").replaceAll("%20", " "), true); // Play the first song by default

    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    for (const song of songs) {
        const remExtension = song.replaceAll(".mp3", "");
        const cleanedSong = remExtension.replaceAll("%20", " ")
        songUl.innerHTML += `<li>
                                <img src="images/music.svg" alt="">
                                <div class="info">
                                    <h3 class="song-name">${cleanedSong}</h3>
                                    <h3 class="artist-name">Karan Aujla</h3>
                                </div>
                                <div class="playnow">
                                    <img src="images/play.svg" alt="">
                                </div>
                            </li>`
    }

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            // console.log(element.querySelector(".info").firstElementChild.innerHTML);
            playSong(element.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });

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

    // Listen for previous song button click
    let previmg = document.getElementById("prev-song");
    previmg.addEventListener("click", () => {
        let src = currentSong.src.split("songs/")[1];
        // console.log('Current song src:', src);

        for (let i = 0; i < songs.length; i++) {
            if (songs[i] === src) {
                src = songs[i - 1];
                break;
            }
        }
        if (!src) {
            src = songs[songs.length - 1];
        }
        playSong(src.replaceAll(".mp3", "").replaceAll("%20", " "));
        // console.log('Previous song src:', src);

    })

    // Listen for next song button click
    let nextimg = document.getElementById("next-song");
    nextimg.addEventListener("click", () => {
        let src = currentSong.src.split("songs/")[1];
        // console.log('Current song src:', src);

        for (let i = 0; i < songs.length; i++) {
            if (songs[i] === src) {
                src = songs[i + 1];
                break;
            }
        }
        if (!src) {
            src = songs[0];
        }
        playSong(src.replaceAll(".mp3", "").replaceAll("%20", " "));
        // console.log('Previous song src:', src);

    })

    //Listen for time update event to update song progress
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = Math.floor(currentSong.currentTime);
        let duration = Math.floor(currentSong.duration);
        let currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = currentTime % 60;
        let durationMinutes = Math.floor(duration / 60);
        let durationSeconds = duration % 60;
        
        if(isNaN(durationMinutes) || isNaN(durationSeconds)) {
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
        console.log(e.offsetX, e.target.getBoundingClientRect().width);
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

    document.querySelector(".volumeImg").addEventListener("click", ()=>{
        let volumeRange = document.querySelector(".volume-range");
        // console.log('Volume range:', volumeRange);
        if (volumeRange.style.display === "none" || volumeRange.style.display === "") {
            volumeRange.style.display = "block";
        } else {
            volumeRange.style.display = "none";
        } 
    })

    document.querySelector(".volume-range").addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
        
    })

}





main()