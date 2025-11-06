export function playVideo() {
  const videoElement = document.getElementById('videoElement')
  videoElement.src = 'warmupeagle.mp4'
  videoElement.play()
  videoElement.addEventListener('click', () => {
    if (videoElement.paused) {
      videoElement.play()
    } else {
      videoElement.pause()
    }
  })
}
