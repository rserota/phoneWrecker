<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import { onMounted, ref, reactive } from 'vue'
import * as Tone from 'tone'
import { NoteType, Direction, type SpinProgress } from './types/index'
import { tiltThreshold, accuracyThreshold, timeToTarget, boundarySize} from './constants'
import { songData } from './songData'

onMounted(() => {
  console.log(`the component is now mounted.`)
  console.log(Tone.now(), Tone)
})




const alpha = ref(0)
const	beta = ref(0)
const gamma = ref(0)
let appStartTime = ref(0)
let up = ref<number|null>(null); // this is the initial reading on deviceorientation.alpha, that everything else is calibrated against
let gripOrientation = ref(0) // 0 = normal horizontal alpha between 315 - 45
let spinProgress: SpinProgress[] = reactive([])
let spinDirection: {value: Direction.Left | Direction.Right | null} = ref(null)
let totalTurns = ref(0)
let tiltDirection: {left: boolean, right: boolean, up: boolean, down: boolean} = reactive({
  left: false,
  right: false,
  up: false,
  down: false,
})
console.log('boundary size: ', boundarySize)
let appHasStarted = ref(false)
let gameColor = ref('red')
let totalScore = ref(0)

const player = new Tone.Player("/public/woman_on_the_moon.ogg").toDestination();

const gameTime = ()=>{ return (Tone.now() - appStartTime.value) }
function deviceOrientationListener(event: DeviceOrientationEvent){
  console.log('orientation event', event)
  let oldGripOrientation = gripOrientation
	alpha.value = event.alpha || alpha.value
  // @ts-ignore
	if ( up == null ) { up = event.alpha }
  if ( typeof event.beta != 'number' || typeof event.gamma != 'number' ) { return }
	if ( alpha.value < 45 ) { 
  // @ts-ignore
		gripOrientation = 0 
		beta.value = event.beta || beta.value
		gamma.value = event.gamma || gamma.value
	} // normal grip
	else if ( alpha.value < 135 ) {
  // @ts-ignore
		gripOrientation = 1;  
		beta.value = -event.gamma || beta.value
		gamma.value = event.beta || gamma.value
	}
	else if ( alpha.value < 225 ) {
  // @ts-ignore
		gripOrientation = 2 
		beta.value = -event.beta || beta.value
		gamma.value = -event.gamma || gamma.value
	}
	else if ( alpha.value < 315 ) { 
  // @ts-ignore
		gripOrientation = 3 
		beta.value = event.gamma || beta.value
		gamma.value = -event.beta || gamma.value
	}
	else if ( alpha.value >= 315 ) { 
  // @ts-ignore
		gripOrientation = 0 
		beta.value = event.beta || beta.value
		gamma.value = event.gamma || gamma.value
	}

  // @ts-ignore
  if ( gripOrientation !== oldGripOrientation ){
  // @ts-ignore
    if ( oldGripOrientation === gripOrientation - 1 || oldGripOrientation === 3 && gripOrientation === 0 ) {
      totalTurns.value++
      onTurn()
    }
  // @ts-ignore
    if ( oldGripOrientation === gripOrientation + 1 || oldGripOrientation === 0 && gripOrientation === 3 ) {
      totalTurns.value--
      onTurn()
    }
  }
}

function triangularOutput(x: number) {
  if (x >= 0 && x <= 25) {
    return x; // rising edge
  } else if (x > 25 && x <= 50) {
    return -x + 50; // falling edge
  } else {
    return 0; // outside defined range
  }
}
function onTilt(direction: Direction){
  navigator.vibrate?.(1) // doesn't seem to work, even on android
  console.log(direction)
  let gt = gameTime()

  // Tap notes and HoldDown notes are scored the same way. Don't tell the users. shhhh
  for ( let note of songData ) {
    let timeLeft = note.targetTime - gt
    const isCorrectNoteType = [NoteType.Tap, NoteType.HoldDown].includes(note.type)
    if ( timeLeft > 0 && timeLeft < .5 && direction === note.originDirection && isCorrectNoteType ) {
      const score = triangularOutput(timeLeft*100) + 25
      note.score = score
      totalScore.value += score
      break
    }
  }
}

// the opposite of a tilt event
function onRelease(direction: Direction){
  navigator.vibrate?.(1) // doesn't seem to work, even on android
  console.log(direction)
  let gt = gameTime()

  //onTilt should look for one note at a time, but the spin methods need to check multiple notes
  for ( let note of songData ) {
    let timeLeft = note.targetTime - gt
    if ( timeLeft > 0 && timeLeft < .5 && direction === note.originDirection && note.type === NoteType.HoldUp ) {
      const score = triangularOutput(timeLeft*100) + 25
      note.score = score
      totalScore.value += score
      break
    }
  }
}

function onTurn(){
  let gt = gameTime()

  //onTilt should look for one note at a time, but the spin methods need to check multiple notes
  for ( let note of songData ) {
    let timeLeft = note.targetTime - gt
    if ( timeLeft > 0 && timeLeft < .5 && [NoteType.Left90, NoteType.Right90].includes(note.type)) {
      const score = triangularOutput(timeLeft*100) + 25
      note.score = score
      totalScore.value += score
      break
    }
  }

}

function onSpin(){
  let gt = gameTime()

  //onTilt should look for one note at a time, but the spin methods need to check multiple notes
  // a 360 in either direction works. it's not reasonable to be ready for both.
  for ( let note of songData ) {
    let timeLeft = note.targetTime - gt
    if ( timeLeft > 0 && timeLeft < .5 && [NoteType.Left360, NoteType.Right360].includes(note.type) ) {
      const score = triangularOutput(timeLeft*100) + 25
      note.score = score
      totalScore.value += score
    }
  }
}

function update(){
  // @ts-ignore
	if ( window._alpha ) { alpha.value = window._alpha } //debug

	if ( alpha != null ) {
    // console.log('game time', performance.now(), gameTime(), Tone.now(), gameTime() - Tone.now())
    for ( let note of songData ) {
      let d = note.targetTime - gameTime()
      //xPos needs to be 50 when d is 0. xPos is in %, so 50% is the middle of the page

      if ( note.originDirection === Direction.Left ) {
        note.xPos = (-50 / timeToTarget) * (d) + 50;
        // note.xPos = -12.5 * d + 50
        note.yPos = 50
      }
      else if ( note.originDirection === Direction.Right ) {
        note.xPos = (50 / timeToTarget) * (d) + 50;
        // note.xPos = 12.5 * d + 50
        note.yPos = 50
      }
      else if ( note.originDirection === Direction.Down ) {
        note.yPos = (50 / timeToTarget) * (d) + 50;
        // note.yPos = 12.5 * d + 50
        note.xPos = 50
      }
      else if ( note.originDirection === Direction.Up ) {
        note.yPos = (-50 / timeToTarget) * (d) + 50;
        // note.yPos = -12.5 * d + 50
        note.xPos = 50
      }
    }
    // console.log('spin progress: ', spinProgress)
		// gameEl.style.transform = `translateX(-50%) translateY(-50%) rotate(${alpha - 90}deg)`
		// Overlay.wrapper.style.transform = `translateX(-50%) translateY(-50%) rotate(${alpha - 90}deg)`
    // @ts-ignore
		if ( spinProgress.length === 0 ) { spinProgress.unshift({gripOrientation, time: performance.now()}) }

		// spin progress resets if they take more than 500ms to complete a quarter turn
		else if ( performance.now() - spinProgress[0].time > 500 ) { spinProgress = [{gripOrientation, time: performance.now()}] }
		else if ( spinProgress[0].gripOrientation === gripOrientation ) {
			// do nothing
		}
    // @ts-ignore
		else if ( (spinDirection.value === null || spinDirection.value === 'left') && (spinProgress[0].gripOrientation === (gripOrientation - 1) || (spinProgress[0].gripOrientation === 3 && gripOrientation === 0 ) )) {
			spinDirection.value = Direction.Left
			spinProgress.unshift({gripOrientation, time: performance.now()})
		}
    // @ts-ignore
		else if ( (spinDirection.value === null || spinDirection.value === 'right') && (spinProgress[0].gripOrientation === (gripOrientation + 1) || (spinProgress[0].gripOrientation === 0 && gripOrientation === 3 ) )) {
			spinDirection.value = Direction.Right
			spinProgress.unshift({gripOrientation, time: performance.now()})
		}
		else {
			spinDirection.value = null
			spinProgress = []
		}

		// only track the last 5 positions, to know if they made a complete turn
		if ( spinProgress.length > 5 ) { spinProgress.length = 5 }
		if ( spinProgress.length === 1 ) {
			gameColor.value = 'skyblue' 
		}
		if ( spinProgress.length === 2 ) { 
      gameColor.value = 'orangered'
		}
		if ( spinProgress.length === 3 ) { 
      gameColor.value = 'yellow'
		}
		if ( spinProgress.length === 4 ) { 
      gameColor.value = 'green'
		}
		if ( spinProgress.length === 5 && spinDirection.value !== null ) {
      onSpin()
			spinDirection.value = null
			spinProgress = []
		}
	}

	if ( beta.value > tiltThreshold )  {
    if ( !tiltDirection.left ) {
      tiltDirection.left = true
      onTilt(Direction.Left)
    }
	}
	if ( beta.value < tiltThreshold )  {
    if ( tiltDirection.left ) {
      tiltDirection.left = false
      onRelease(Direction.Left)
    }
	}
	if ( beta.value > -tiltThreshold )  { 
    tiltDirection.right = false
	}
	if ( beta.value < -tiltThreshold )  { 
    if ( !tiltDirection.right ) {
      onTilt(Direction.Right)
      tiltDirection.right = true
    }
	}

	if ( gamma.value > tiltThreshold) {
    if ( !tiltDirection.down ){
      onTilt(Direction.Down)
      tiltDirection.down = true
    }
	}
	if ( gamma.value < tiltThreshold) {
    tiltDirection.down = false
	}
	if ( gamma.value > -tiltThreshold) {
    tiltDirection.up = false
	}
	if ( gamma.value < -tiltThreshold) {
    if ( !tiltDirection.up ){
      onTilt(Direction.Up)
      tiltDirection.up = true
    }
	}

  // you "miss" a note when it reaches the center
  for ( let note of songData ) {
    if ( note.score !== 0 && gameTime() > note.targetTime ) {
      note.score = 0
    }
  }

	
	requestAnimationFrame(update)
}

const startApp = async function(){
    // @ts-ignore
	if ( window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission ) {
    // @ts-ignore
		let response = await DeviceMotionEvent.requestPermission()
		if (response == 'granted') {
			window.addEventListener('deviceorientation', deviceOrientationListener)
		}
	}
	else {
		window.addEventListener('deviceorientation', deviceOrientationListener)
	}
  appHasStarted.value = true
  await Tone.start()
  appStartTime.value = Tone.now()
  player.start()

	update()
}

</script>

<template>
  <div id="game-container" :style="`transform: translate(-50%, -50%) rotate(${alpha - 90}deg)`">
    <div :class="{'hidden':appHasStarted}" class="how-to-play-container">
      <div class="how-to-play">

        <h1>
          How To Play
          <button class="start-button" style="float: right;"  @click="startApp()">Start</button>
        </h1>
        <p>Sit down in a comfortable place. Lock rotation on your phone, and disconnect your headphones. Hold your phone with a steady grip, so that it is parallel to the ground.</p>
        <p>In this game, colorful music notes will approach the center of the screen from all four sides of your phone.</p>
        <p><strong>At the moment the note crosses the <em>edge</em> of the box in the center of your screen,</strong> you must move your phone (tilt, turn, or spin) to earn points.</p>
        <p>Feel the rhythm and stay on the beat to get a high score!</p>
        <hr>
        <div class="tutorial-p">Tap is the most common note you'll see. Tilt your phone towards the note as it crosses the edge of the box. <br><div style="display:inline-block;"><div class="note tap" style="position: static; transform: initial;"> <i class="bi-disc spinning"></i></div></div></div>
        <hr>
        <div class="tutorial-p">Hold is similar to tap, but hold your phone tilted until you see a release note.<br>
          <div style="display:inline-block;">
            <div class="note holdDown" style="position: static; transform: initial;"> <i class="bi-box-arrow-in-down"></i></div>
          </div>
          <div style="display:inline-block; ">
            <div class="note holdUp" style="position: static; transform: initial;"> <i class="bi-box-arrow-up"></i></div>
          </div>
        </div>
        <hr>
        <div class="tutorial-p">Turn notes require you to turn your phone 90 degrees. For example, from landscape mode to portrait mode.<br> Turn notes always appear two at a time. It doesn't matter which direction they come from.<br><div style="display:inline-block;"><div class="note right90" style="position: static; transform: initial;"> <i class="bi-arrow-90deg-right spinning"></i></div></div></div>
        <hr>
        <div class="tutorial-p">Spin notes require you to throw your phone in the air so that it rotates 360 degrees. You must catch it just as the note passes the edge of the box. This is not a joke. I mean, this whole app is kind of a joke, but you will actually score points by following these instructions.<br> Spin notes always appear four at a time. It doesn't matter which direction they come from.<br><div style="display:inline-block;"><div class="note right360" style="position: static; transform: initial;"> <i class="bi-arrow-clockwise spinning"></i></div></div></div>
      </div>
    </div>
    <div
      v-for="note in songData" 
      v-show="note.targetTime > gameTime()" 
      :style="`top: ${note.yPos}%; left: ${note.xPos}%`" 
      class="note" 
      :class="{
        bordered: note.targetTime - gameTime() > accuracyThreshold,
        fadeToBlack: note.targetTime - gameTime() < accuracyThreshold && !(typeof note.score == 'number' && note.score > 0),
        scored: typeof note.score == 'number' && note.score > 0,
        tap: note.type === 'tap',
        holdUp: note.type === 'holdUp',
        holdDown: note.type === 'holdDown',
        left90: note.type === 'left90',
        right90: note.type === 'right90',
        right360: note.type === 'right360',
        left360: note.type === 'left360',
      }"
    >

      <i v-if="note.type === 'tap'" class="bi-disc spinning"></i>
      <i v-if="note.type === 'holdUp'" class="bi-box-arrow-up"></i>
      <i v-if="note.type === 'holdDown'" class="bi-box-arrow-in-down"></i>
      <i v-if="note.type === 'left90'" class="bi-arrow-90deg-left"></i>
      <i v-if="note.type === 'left180'" class="bi-arrow-90deg-left"></i>
      <i v-if="note.type === 'left360'" class="bi-arrow-counterclockwise spinning"></i>
      <i v-if="note.type === 'right90'" class="bi-arrow-90deg-right"></i>
      <i v-if="note.type === 'right180'" class="bi-arrow-90deg-right"></i>
      <i v-if="note.type === 'right360'" class="bi-arrow-clockwise spinning"></i>
      <!-- {{ (note.targetTime - gameTime()) }} -->
    </div>
    <div 
      id="game" 
      :class="{
        tiltedUp: tiltDirection.up,
        tiltedDown: tiltDirection.down, 
        tiltedLeft: tiltDirection.left, 
        tiltedRight: tiltDirection.right,
        hidden:!appHasStarted
      }"
      :style="{backgroundColor: gameColor, height: boundarySize, width: boundarySize}"
    >
      <div class="score">{{ Math.floor(totalScore) }}</div>
      <!-- <p>{{ totalTurns }}</p> -->
      <!-- <p>{{ tiltDirection.up }} {{ tiltDirection.down }} {{ tiltDirection.left }} {{ tiltDirection.right }}</p> -->
      <!-- <p>{{alpha}} {{beta}} {{gamma}}!</p> -->
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap');
  .note {
    height: 50px;
    width: 50px;
    border-radius: 999px;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    /* left: 50%;
    top: 50%; */
    transform: translate(-50%, -50%);
    z-index: 10;
    font-size: 36px;
    /* font-weight: bold; */
  }
  .note.tap {
    /* background-color: rgb(40,140,80) */
    background-color: rgb(35, 122, 70)
  }
  .note.holdDown {
    background-color: rgb(35, 122, 70)
  }
  .note.holdUp {
    background-color: rgb(148, 241, 185)
  }

  .note.left360, .note.right360 {
    background-color:yellow;
  }

  .note.left90, .note.right90 {
    background-color: rgb(215, 45, 45);
  }
  .fadeToBlack {
    background-color: black;
    /* opacity: 0.5; */
    transition: background-color .7s, opacity .7s;
  }

  .note.scored {
    background-color: white;
    opacity: 1;
    transition: background-color .05s;
  }
  .spinning {
    animation-name: spin;
    animation-duration: 2000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear; 
  }

  .tutorial-p {
    /* margin-top: 60px; */
    /* margin-bottom: 60px; */
  }
  @keyframes spin {
    from {
      transform:rotate(0deg);
    }
    to {
      transform:rotate(360deg);
    }
}
  .bordered {
    border: 2px solid black;
  }
  #game-container {
    height: 100vmax;
    width: 100vmax;
    position: fixed;
    z-index: 1;
    top: 50%;
    left: 50%;
    background: rgb(2,0,36);
    background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(32,32,172,1) 35%, rgba(0,212,255,1) 100%);
  }
  #game {
    /* height: 12.5%;
    width: 12.5%; */
    /* height: 70px; */
    /* width: 70px; */
    position: absolute;
    top: 50%;
    left: 50%;
    /* background-color:darkorange; */
    transform: translate(-50%, -50%);

  }

  .how-to-play-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height:100vh;
    width: 100%;
    position:absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
  }
  .how-to-play {
    max-width: 80vh;
    max-height: 80vw;
    border: 2px solid black;
    padding: 1vmax;
    background-color: rgba(255,255,255,.8);
    border-radius: 10px;
    font-family: "Comic Neue", sans-serif;
    margin: 2vmax;
    overflow: scroll;
  }
  .hidden {
    display: none !important;
  }
  .start-button {
    font-family: 'Courier New (monospace)';
  }
  .score {
    font-size: 2rem;
    height: 100%;
    display: flex;
    justify-content:center;
    align-items: center;
    font-family: 'Courier New (monospace)';
  }
  .tiltedUp { border-top: 3px solid black; }
  .tiltedDown { border-bottom: 3px solid black; }
  .tiltedLeft { border-left: 3px solid black; }
  .tiltedRight { border-right: 3px solid black; }
</style>
