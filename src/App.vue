<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import { onMounted, ref, reactive, computed} from 'vue'

onMounted(() => {
  console.log(`the component is now mounted.`)
})

enum Direction {
  Left = 'left',
  Up = 'up',
  Right = 'right',
  Down = 'down',
}

enum NoteType {
  Tap = 'tap', // simple tap in one direction
  HoldDown = 'holdDown', // hold the direction until the hold up. must be paired.
  HoldUp = 'holdUp', // release a previous holdDown
  Left90 = 'left90', // turn left 90 degrees
  Left180 = 'left180',
  Left360 = 'left360',
  Right90 = 'right90',
  Right180 = 'right180',
  Right360 = 'right360',
}

interface SpinProgress {gripOrientation: number; time: number}
interface NoteData { targetTime: number; originDirection: Direction, type: NoteType, score: number | null, yPos: number; xPos: number}
const alpha = ref(0)
const	beta = ref(0)
const gamma = ref(0)
let appStartTime = ref(0)
let up: number = ref(null); // this is the initial reading on deviceorientation.alpha, that everything else is calibrated against
let gripOrientation = ref(0) // 0 = normal horizontal alpha between 315 - 45
let spinProgress: SpinProgress[] = reactive([])
let spinDirection: {value: Direction | null} = ref(null)
let totalTurns = ref(0)
let tiltDirection: {left: boolean, right: boolean, up: boolean, down: boolean} = reactive({
  left: false,
  right: false,
  up: false,
  down: false,
})
let tiltThreshold = 20
let accuracyThreshold = .5
let timeToTarget: number = 2
let appHasStarted = ref(false)
let gameColor = ref('red')
let totalScore = ref(0)
let noteData: NoteData[] = reactive([
  {
  targetTime: 2,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Left,
  score: null,
  type: NoteType.Left90,
  },
  {
  targetTime: 4,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Up,
  score: null,
  type: NoteType.Right90,
  },
  {
  targetTime: 5,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Down,
  score: null,
  type: NoteType.Right90,
  },
  {
  targetTime: 5.5,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Right,
  score: null,
  type: NoteType.Left90,
  },
])

const gameTime = ()=>{ return (performance.now() - appStartTime.value) / 1000 }
function deviceOrientationListener(event){
  console.log('orientation event', event)
  let oldGripOrientation: number = gripOrientation
	alpha.value = event.alpha || alpha.value
	if ( up == null ) { up = event.alpha }
	if ( alpha.value < 45 ) { 
		gripOrientation = 0 
		beta.value = event.beta || beta.value
		gamma.value = event.gamma || gamma.value
	} // normal grip
	else if ( alpha.value < 135 ) {
		gripOrientation = 1;  
		beta.value = -event.gamma || beta.value
		gamma.value = event.beta || gamma.value
	}
	else if ( alpha.value < 225 ) {
		gripOrientation = 2 
		beta.value = -event.beta || beta.value
		gamma.value = -event.gamma || gamma.value
	}
	else if ( alpha.value < 315 ) { 
		gripOrientation = 3 
		beta.value = event.gamma || beta.value
		gamma.value = -event.beta || gamma.value
	}
	else if ( alpha.value >= 315 ) { 
		gripOrientation = 0 
		beta.value = event.beta || beta.value
		gamma.value = event.gamma || gamma.value
	}

  if ( gripOrientation !== oldGripOrientation ){
    if ( oldGripOrientation === gripOrientation - 1 || oldGripOrientation === 3 && gripOrientation === 0 ) {
      totalTurns.value++
      onTurn(NoteType.Left90)
    }
    if ( oldGripOrientation === gripOrientation + 1 || oldGripOrientation === 0 && gripOrientation === 3 ) {
      totalTurns.value--
      onTurn(NoteType.Right90)
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

  //onTilt should look for one note at a time, but the spin methods need to check multiple notes
  for ( let note of noteData ) {
    let timeLeft = note.targetTime - gt
    if ( timeLeft > 0 && timeLeft < .5 && direction === note.originDirection && note.type === NoteType.Tap ) {
      const score = triangularOutput(timeLeft*100) + 25
      note.score = score
      totalScore.value += score
      break
    }
  }
}

function onTurn(noteType: NoteType){
  let gt = gameTime()

  //onTilt should look for one note at a time, but the spin methods need to check multiple notes
  for ( let note of noteData ) {
    let timeLeft = note.targetTime - gt
    if ( timeLeft > 0 && timeLeft < .5 && note.type === noteType ) {
      const score = triangularOutput(timeLeft*100) + 25
      note.score = score
      totalScore.value += score
      break
    }
  }

}

function update(){
	if ( window._alpha ) { alpha.value = window._alpha } //debug

	if ( alpha != null ) {
    console.log('game time', performance.now(), appStartTime.value, gameTime())
    for ( let note of noteData ) {
      let d = note.targetTime - gameTime()
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
		if ( spinProgress.length === 0 ) { spinProgress.unshift({gripOrientation, time: performance.now()}) }

		// spin progress resets if they take more than 500ms to complete a quarter turn
		else if ( performance.now() - spinProgress[0].time > 500 ) { spinProgress = [{gripOrientation, time: performance.now()}] }
		else if ( spinProgress[0].gripOrientation === gripOrientation ) {
			// do nothing
		}
		else if ( (spinDirection.value === null || spinDirection.value === 'left') && (spinProgress[0].gripOrientation === (gripOrientation - 1) || (spinProgress[0].gripOrientation === 3 && gripOrientation === 0 ) )) {
			spinDirection.value = Direction.Left
			spinProgress.unshift({gripOrientation, time: performance.now()})
		}
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
		if ( spinProgress.length === 5 ) {
      alert('360')
			// p1.jump()
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
    tiltDirection.left = false
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
  for ( let note of noteData ) {
    if ( note.score !== 0 && gameTime() > note.targetTime ) {
      note.score = 0
    }
  }

	
	requestAnimationFrame(update)
}

const startApp = async function(event: Event){
  console.log('starting app', event)
  appHasStarted.value = true
  appStartTime.value = performance.now()
	if ( window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission ) {
		let response = await DeviceMotionEvent.requestPermission()
		if (response == 'granted') {
			window.addEventListener('deviceorientation', deviceOrientationListener)
		}
	}
	else {
		window.addEventListener('deviceorientation', deviceOrientationListener)
	}
	// goEl.style.display = 'none'
	update()
}

</script>

<template>
  <div id="game-container" :style="`transform: translate(-50%, -50%) rotate(${alpha - 90}deg)`">
    <div
      v-for="note in noteData" 
      v-show="note.score === null" 
      :style="`top: ${note.yPos}%; left: ${note.xPos}%`" 
      class="note" 
      :class="{bordered: note.targetTime - gameTime() > accuracyThreshold}"
    >

      <i v-if="note.type === 'tap'" class="bi-disc spinning"></i>
      <i v-if="note.type === 'left90'" class="bi-arrow-90deg-left"></i>
      <i v-if="note.type === 'left180'" class="bi-arrow-90deg-left"></i>
      <i v-if="note.type === 'left360'" class="bi-arrow-counterclockwise"></i>
      <i v-if="note.type === 'right90'" class="bi-arrow-90deg-right"></i>
      <i v-if="note.type === 'right180'" class="bi-arrow-90deg-right"></i>
      <i v-if="note.type === 'right360'" class="bi-arrow-countercounterclockwise"></i>
      <!-- {{ (note.targetTime - gameTime()) }} -->
    </div>
    <div 
      id="game" 
      :class="{
        tiltedUp: tiltDirection.up,
        tiltedDown: tiltDirection.down, 
        tiltedLeft: tiltDirection.left, 
        tiltedRight: tiltDirection.right
      }"
      :style="{backgroundColor: gameColor}"
    >
      <!-- <i class="bi-alarm"></i> -->
      <!-- <p>{{ totalScore }}</p> -->
      <p>{{ totalTurns }}</p>
      <!-- <p>{{ tiltDirection.up }} {{ tiltDirection.down }} {{ tiltDirection.left }} {{ tiltDirection.right }}</p> -->
      <!-- <p>{{alpha}} {{beta}} {{gamma}}!</p> -->
      <button :class="{'started':appHasStarted}" @click="startApp()">Start</button>
    </div>
  </div>
</template>

<style scoped>
  .note {
    height: 35px;
    width: 35px;
    border-radius: 999px;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    /* left: 50%;
    top: 50%; */
    transform: translate(-50%, -50%);
    z-index: 10;
    background-color: seagreen;
  }
  .spinning {
    animation-name: spin;
    animation-duration: 2000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear; 
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
    height: 20vmax;
    width: 20vmax;
    /* height: 70px; */
    /* width: 70px; */
    position: absolute;
    top: 50%;
    left: 50%;
    /* background-color:darkorange; */
    transform: translate(-50%, -50%);

  }

  .started {
    display: none;
  }

  .tiltedUp { border-top: 3px solid black; }
  .tiltedDown { border-bottom: 3px solid black; }
  .tiltedLeft { border-left: 3px solid black; }
  .tiltedRight { border-right: 3px solid black; }
</style>
