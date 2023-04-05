const videoSelector = '.video-js';
const storageKey = 'floatplane_video_progress';
let videoProgressRestored = false;

function getCurrentVideoId() {
    const currentVideo = window.location.href;
    const currentVideoId = currentVideo.split('/');
    return currentVideoId[currentVideoId.length - 1];
}

async function saveVideoProgress() {
    const video = document.querySelector(videoSelector);
    if (video) {
        const currentVideoId = getCurrentVideoId();
        const savedData = await new Promise((resolve) => {
            chrome.storage.local.get(storageKey, (data) => {
                resolve(data[storageKey] || {});
            });
        });
        const videoPlayer = document.querySelector('.vjs-tech');
        const currentVideoProgress = document.querySelector('.vjs-tech').currentTime;
        const videoDuration = videoPlayer.duration;

        if (currentVideoProgress >= videoDuration) {
            // Remove the video progress from the saved data if currentTime is equal to or greater than the video duration
            if (savedData[currentVideoId]) {
                delete savedData[currentVideoId];
                chrome.storage.local.set({ [storageKey]: savedData }, () => {
                    console.log('Video progress reset:', currentVideoId);
                });
            }
        } else if (!savedData[currentVideoId] || currentVideoProgress > savedData[currentVideoId].currentTime) {
            savedData[currentVideoId] = { currentTime: currentVideoProgress };
            chrome.storage.local.set({ [storageKey]: savedData }, () => {
                console.log('Video progress saved:', currentVideoId, currentVideoProgress);
            });
        }
    }
}

const savePostion = setInterval(saveVideoProgress, 1000);

async function restoreVideoProgress() {
    const video = document.querySelector(videoSelector);
    if (video) {
        const currentVideoId = getCurrentVideoId();
        const progressData = await new Promise((resolve) => {
            chrome.storage.local.get(storageKey, (data) => {
                resolve(data[storageKey] || {});
            });
        });

        if (progressData[currentVideoId]) {
            const videoPlayer = document.querySelector('.vjs-tech');
            videoPlayer.currentTime = progressData[currentVideoId].currentTime;
        }
    }
}

let previousUrl = window.location.href;

async function checkUrlChange() {
    const currentUrl = window.location.href;

    if (currentUrl !== previousUrl) {
        videoProgressRestored = false;
        previousUrl = currentUrl;
    }

    if (!videoProgressRestored) {
        const videoId = getCurrentVideoId();
        const progressData = await new Promise((resolve) => {
            chrome.storage.local.get(storageKey, (data) => {
                resolve(data[storageKey] || {});
            });
        });

        if (progressData.hasOwnProperty(videoId)) {
            const videoPlayer = document.querySelector('.vjs-tech');
            if (videoPlayer) { // Make sure videoPlayer is not null
                await waitForVideoReady(videoPlayer);
                videoPlayer.currentTime = progressData[videoId].currentTime;
                console.log('video restored');
                videoProgressRestored = true;
            }
        }
    }
}

function waitForVideoReady(videoPlayer) {
    return new Promise((resolve) => {
        if (videoPlayer.readyState >= 1) {
            resolve();
        } else {
            videoPlayer.addEventListener('loadedmetadata', () => {
                resolve();
            });
        }
    });
}

setInterval(checkUrlChange, 1000);
