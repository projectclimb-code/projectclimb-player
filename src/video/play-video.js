import { websocketService } from '@/services/ws.service'

const videoElement = document.getElementById('videoElement')
const videos = [69, 75, 76, 77, 78, 79, 80]
let curentVideoIndex = 0
videoElement.autoplay = true
videoElement.controls = false
videoElement.muted = true
let lastPose = new Date()
let videoPlaying = false

export function playVideo() {
  videoElement.addEventListener('ended', () => {
    videoElement.style.display = 'none'
  })
  loadInfoVideo()

  videoElement.addEventListener('click', () => {
    console.log('click')
    if (videoElement.paused) {
      videoElement.style.display = 'block'
      videoElement.play()
    } else {
      videoElement.pause()
    }
  })

  websocketService.subscribe((data) => {
    stopVideo()
    lastPose = new Date()
    if (data.type === 'video') {
      if (data.action === 'play') {
        videoElement.play()
      } else if (data.action === 'pause') {
        videoElement.pause()
      } else if (data.action === 'next') {
        loadNextVideo()
      } else if (data.action === 'previous') {
        loadPreviousVideo()
      } else if (data.action === 'replay') {
        replayVideo(data.video)
      } else if (data.action === 'info') {
        loadInfoVideo()
      }
    } else if (data.type === 'preview') {
      console.log(data)
      if (data.route.id && videos.includes(data.route.id)) {
        replayVideo(data.route.id)
      } else {
        stopVideo()
      }
    } else {
      stopVideo()
    }
  })
  websocketService.subscribe(() => {
    stopVideo()
    lastPose = new Date()
  }, 'session')

  setInterval(() => {
    if (new Date() - lastPose > 4000 && !videoPlaying) {
      videoPlaying = true
      loadInfoVideo()
    }
  }, 1000)
}

function loadNextVideo() {
  const videoId = videos[curentVideoIndex]
  videoElement.src = `/videos/${videoId}.mp4`
  videoElement.load()
  curentVideoIndex = (curentVideoIndex + 1) % videos.length
  videoElement.style.display = 'block'
  videoElement.play()
}

function loadInfoVideo() {
  videoElement.src = `/videos/anim2.mp4`
  videoElement.load()
  videoElement.style.display = 'block'
  videoElement.loop = true
  videoElement.play()
}

function loadPreviousVideo() {
  curentVideoIndex = (curentVideoIndex - 2 + videos.length) % videos.length
  const videoId = videos[curentVideoIndex]
  videoElement.src = `/videos/${videoId}.mp4`
  videoElement.load()
  curentVideoIndex = (curentVideoIndex + 1) % videos.length
  videoElement.style.display = 'block'
  videoElement.play()
}

function replayVideo(videoId) {
  videoElement.src = `/videos/${videoId}.mp4`
  videoElement.load()
  videoElement.style.display = 'block'
  videoElement.play()
}

function stopVideo() {
  videoElement.src = null
  videoElement.pause()
  videoElement.currentTime = 0
  videoElement.style.display = 'none'
  videoPlaying = false
}
