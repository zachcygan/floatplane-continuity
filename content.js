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
        const videoTime = document.querySelector('.vjs-tech')

        if (videoTime.currentTime === 10) {
            videoTime.currentTime = 5;
        }


        chrome.storage.local.get(storageKey, (data) => {
            const savedData = data[storageKey];
            console.log(savedData)

            let currentVideoProgress = document.querySelector('.vjs-tech').currentTime;
            if (!savedData || savedData.currentVideoId !== currentVideoId || currentVideoProgress > savedData.currentVideoProgress || savedData.currentVideoProgress === 'NaN') {
                const progressData = { currentVideoId, currentVideoProgress };
                chrome.storage.local.set({ [storageKey]: progressData }, () => {
                    console.log('Video progress saved:', progressData);
                });
            }
        });
    }
}

const intervalId = setInterval(saveVideoProgress, 1000);

function restoreVideoProgress() {
    const video = document.querySelector(videoSelector);
    if (video) {
        chrome.storage.local.get(storageKey, (data) => {
            let currentLink = window.location.href;
            let currentLinkId = currentLink.split('/');
            currentLinkId = currentLinkId[currentLinkId.length - 1]

            const progressData = data[storageKey];
            const videoId = progressData.currentVideoId
            const videoPostion = progressData.currentVideoProgress;

            if (currentLinkId === videoId) {
                console.log('IDS MATCH')
                console.log(videoPostion)
                let videoPlayer = document.querySelector('.vjs-tech');
                videoPlayer.currentTime = videoPostion;
            }
        });
    }
}

let playing = false;
let restoreInProgress = false;
const observer = new MutationObserver((mutations) => {
    const video = document.querySelector(videoSelector)
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const oldClass = mutation.oldValue;
            const newClass = video.getAttribute('class');
            const hasStartedClassName = 'vjs-has-started';

            if (newClass.includes(hasStartedClassName) && !oldClass.includes(hasStartedClassName)) {
                console.log('Class "vjs-has-started" added to the element');
                
                playing = true;
            }
        }
    })

    if (!restoreInProgress) {
        restoreInProgress = true;
        restoreVideoProgress();
    }
})


window.onload = (event) => {
    setTimeout(() => {
        const video = document.querySelector(videoSelector);
        let progressBar = document.querySelector('.vjs-progress-holder');

        observer.observe(video, { attributes: true, attributeOldValue: true });
    }, 1000);
};