import { websocketService } from '@/services/ws.service'

const videoElement = document.getElementById('videoElement')
const videos = [69, 75, 76, 77, 78, 79, 80]
let curentVideoIndex = 0
videoElement.autoplay = true
videoElement.controls = false
videoElement.muted = true

export function playVideo() {
  videoElement.addEventListener('ended', () => {
    videoElement.style.display = 'none'
    //   loadNextVideo()
  })

  loadNextVideo()

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
    console.log(data)
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
      }
    }
    if (data.type === 'preview') {
      console.log(data)
      if (data.route.id && videos.includes(data.route.id)) {
        replayVideo(data.route.id)
      } else {
        stopVideo()
      }
    }
  })
}

function loadNextVideo() {
  const videoId = videos[curentVideoIndex]
  videoElement.src = `/videos/${videoId}.mp4`
  videoElement.load()
  curentVideoIndex = (curentVideoIndex + 1) % videos.length
  videoElement.style.display = 'block'
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
}
