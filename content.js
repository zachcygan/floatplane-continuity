const videoSelector = '.video-js'; // Update this if the video element selector changes on the website
const storageKey = 'floatplane_video_progress';

let currentVideo;
let currentVideoId;


function saveVideoProgress() {
    const video = document.querySelector(videoSelector);
    if (video) {
        currentVideo = window.location.href;
        currentVideoId = currentVideo.split('/');
        currentVideoId = currentVideoId[currentVideoId.length - 1];

        

        chrome.storage.local.get(storageKey, (data) => {
            const savedData = data[storageKey];
            console.log(savedData)

            let currentVideoProgress = document.querySelector('.vjs-progress-holder').getAttribute('aria-valuenow');
            if (!savedData || savedData.currentVideoId !== currentVideoId || currentVideoProgress > savedData.currentVideoProgress || savedData.currentVideoProgress === 'NaN') {
                const progressData = { currentVideoId, currentVideoProgress };
                chrome.storage.local.set({ [storageKey]: progressData }, () => {
                    console.log('Video progress saved:', progressData);
                });
            }
        });
    }
}

// const intervalId = setInterval(saveVideoProgress, 1000);

function restoreVideoProgress() {
    const video = document.querySelector(videoSelector);
    if (video) {
        console.log('INSIDE RESTORE')
        chrome.storage.local.get(storageKey, (data) => {
            let currentLink = window.location.href;
            let currentLinkId = currentLink.split('/');
            currentLinkId = currentLinkId[currentLinkId.length - 1]
            
            const progressData = data[storageKey];
            const videoId = progressData.currentVideoId
            let videoPostion = progressData.currentVideoProgress; 

            console.log(progressData)
            if (currentLinkId === videoId) {
                console.log('THE LINKS MATCH')
                var progressBar = document.querySelector('.vjs-progress-holder');
                progressBar.setAttribute('aria-valuenow', videoPostion);
            }

            // if (progressData && progressData.currentSrc === video.currentSrc) {
            //     video.currentTime = progressData.currentTime;
            //     console.log('Video progress restored:', progressData);
            // }
        });
    }
}

window.onload = (event) => {
    setTimeout(() => {
        restoreVideoProgress();
        const video = document.querySelector(videoSelector);
        if (video) {
            video.addEventListener('timeupdate', saveVideoProgress);
        }
    }, 2000);
};

// document.addEventListener('DOMContentLoaded', () => {
//     restoreVideoProgress();
//     const video = document.querySelector(videoSelector);
//     if (video) {
//         video.addEventListener('timeupdate', saveVideoProgress);
//     }
// });
