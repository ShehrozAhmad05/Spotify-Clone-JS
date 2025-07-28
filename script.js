
let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/SpotifyClone/${folder}/`)
    // console.log('Fetching songs from:', a);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let links = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1]); //it will split the song and give the second part  
        }
    }
    // console.log('Song found:', songs);

    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // Clear the existing list
    for (const song of songs) {
        const remExtension = song.replaceAll(".mp3", "");
        const cleanedSong = remExtension.replaceAll("%20", " ")
        let artist = currFolder.split("/").slice(-1)[0]; 
        let artistName = artist.replaceAll("%20", " ");
        songUl.innerHTML += `<li>
                                <img src="images/music.svg" alt="">
                                <div class="info">
                                    <h3 class="song-name">${cleanedSong}</h3>
                                    <h3 class="artist-name">${artistName}</h3>
                                </div>
                                <div class="playnow">
                                    <img src="images/play.svg" alt="">
                                </div>
                            </li>`
    }
    // console.log('Songs list updated:', songUl.innerHTML);
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            playSong(element.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });
    return songs;
}

const playSong = (song, pause = false) => {
    currentSong.src = `/SpotifyClone/${currFolder}/${song}.mp3`;
    // console.log('Playing song:', currentSong.src);

    if (!pause) {
        currentSong.play();
        let playImg = document.getElementById("play-song");
        playImg.src = "images/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = song;
    document.querySelector(".song-progress").innerHTML = "00:00 / 00:00";
}



async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/SpotifyClone/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");

    let links = Array.from(anchor);
    for (let index = 0; index < links.length; index++) {
        const element = links[index];

        if (element.href.includes("/songs")) {
            let folder = element.href.split("/").slice(-2)[0];
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/SpotifyClone/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <img src="images/play.svg" alt="">
                        </div>
                        <img id="song-thumbnail"
                            src="songs/${folder}/cover.jpg"
                            alt="song-thumbnail">
                        <h2>${response.name}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Listen for playlist card click to change songs folder
    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playSong(songs[0].replaceAll(".mp3", "").replaceAll("%20", " ")); // Play the first song by default
        })
    })

}

async function main() {
    await getSongs("/songs/Karan%20Aujla");
    playSong(songs[0].replaceAll(".mp3", "").replaceAll("%20", " "), true); // Play the first song by default

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

    //Display all albums on the page
    await displayAlbums()


    // Listen for previous song button click
    let previmg = document.getElementById("prev-song");
    previmg.addEventListener("click", () => {
        let src = currentSong.src.split(`${currFolder}/`)[1];
        console.log('Previous song src:', src);
        
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

    })

    // Listen for next song button click
    let nextimg = document.getElementById("next-song");
    nextimg.addEventListener("click", () => {

        let src = currentSong.src.split(`${currFolder}/`)[1];


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

    // document.querySelector(".volumeImg").addEventListener("click", () => {
    //     let volumeRange = document.querySelector(".volume-range");
    //     if (volumeRange.style.display === "none" || volumeRange.style.display === "") {
    //         volumeRange.style.display = "block";
    //     } else {
    //         volumeRange.style.display = "none";
    //     }
    // })

    document.querySelector(".volume-range").addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;

    })

    // Listen for volume button to mute/unmute
    document.querySelector(".volumeImg").addEventListener("click", (e) => {

        console.log('Volume button clicked:', e.target.src);

        if (e.target.src.endsWith("volume.svg")) {
            currentSong.volume = 0;
            document.querySelector(".volume-range").value = 0; // Set volume range to 0
            // document.querySelector(".volume-range").style.display = "none"; // Hide volume range
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");

        } else {
            currentSong.volume = 0.5;
            // document.querySelector(".volume-range").style.display = "block"; // Show volume range
            document.querySelector(".volume-range").value = 50; // Set volume range to 0
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        }
    });


}





main()