import throttle from "lodash/throttle"
import debounce from "lodash/debounce"

class RevealOnScroll {
  constructor(els, thresholdPercent) {
    this.thresholdPercent = thresholdPercent
    this.itemsToReveal = els
    this.browserHeight = window.innerHeight
    this.hideInitially()
    this.scrollThrottle = throttle(this.calcCaller, 200).bind(this)
    this.events()
  }

  events() {
    window.addEventListener("scroll", this.scrollThrottle)
    window.addEventListener(
      "resize",
      debounce(() => {
        console.log("Resize just ran")
        this.browserHeight = window.innerHeight
      }, 333)
    )
  }

  calcCaller() {
    console.log("scroll func ran")
    this.itemsToReveal.forEach(el => {
      if (el.isRevealed === false) {
        /* condition for removing the function called after revealed the item (every item is revealed) */
        this.calculateIfScrolled(el)
      }
    })
  }

  calculateIfScrolled(el) {
    if (window.scrollY + this.browserHeight > el.offsetTop) {
      console.log("element was calculated")
      let scrollPercent = (el.getBoundingClientRect().top / this.browserHeight) * 100

      if (scrollPercent < this.thresholdPercent) {
        el.classList.add("reveal-item--is-visible")
        el.isRevealed = true /* manking true after adding class elem --is visibel */
        if (el.isLastItem) {
          /* condition for removing the main scroll function calling after every element is revealed in the DOM */
          window.removeEventListener("scroll", this.scrollThrottle)
        }
      }
    }
  }
  hideInitially() {
    this.itemsToReveal.forEach(el => {
      el.classList.add("reveal-item")
      el.isRevealed = false /*  initially making flase inorder to get controll of invoking function after ('.reveal-item--is-visible") is addded we will make it true */
    })
    this.itemsToReveal[this.itemsToReveal.length - 1].isLastItem = true
  }
}
export default RevealOnScroll
