export class Settings {
  constructor() {
    if (Settings._instance) {
      return Settings._instance
    }
    Settings._instance = this
    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight
    this.wallWidth = 2500
    this.wallHeight = 3330
  }
}
