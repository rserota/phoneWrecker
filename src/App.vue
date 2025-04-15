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

interface SpinProgress {gripOrientation: number; time: number}
interface NoteData { targetTime: number; originDirection: Direction, score: number | null, yPos: number; xPos: number}
const alpha = ref(0)
const	beta = ref(0)
const gamma = ref(0)
let appStartTime = ref(0)
let up: number = ref(null); // this is the initial reading on deviceorientation.alpha, that everything else is calibrated against
let gripOrientation = ref(0) // 0 = normal horizontal alpha between 315 - 45
let spinProgress: SpinProgress[] = reactive([])
let spinDirection: {value: Direction | null} = ref(null)
let tiltDirection: {left: boolean, right: boolean, up: boolean, down: boolean} = reactive({
  left: false,
  right: false,
  up: false,
  down: false,
})
let tiltThreshold = 20
let accuracyThreshold = .5
let appHasStarted = ref(false)
let noteData: NoteData[] = reactive([
  {
  targetTime: 2,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Left,
  score: null,
  },
  {
  targetTime: 4,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Up,
  score: null,
  },
  {
  targetTime: 5,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Down,
  score: null,
  },
  {
  targetTime: 5.5,
  yPos: -50,
  xPos: -50,
  originDirection: Direction.Right,
  score: null,
  },
])
const gameTime = ()=>{ return (performance.now() - appStartTime.value) / 1000 }
function deviceOrientationListener(event){
  console.log('orientation event', event)
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
}

function onTilt(direction: Direction){
  navigator.vibrate?.(1)
  console.log(direction)
  let gt = gameTime()
  for ( let note of noteData ) {
    let timeLeft = note.targetTime - gt
    if ( timeLeft > 0 && timeLeft < .5 ) {
      alert(timeLeft)
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
        note.xPos = -12.5 * d + 50
        note.yPos = 50
      }
      else if ( note.originDirection === Direction.Right ) {
        note.xPos = 12.5 * d + 50
        note.yPos = 50
      }
      else if ( note.originDirection === Direction.Down ) {
        note.yPos = 12.5 * d + 50
        note.xPos = 50
      }
      else if ( note.originDirection === Direction.Up ) {
        note.yPos = -12.5 * d + 50
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
			// p1.car.bodies[0].render.fillStyle = 'blue' 
		}
		if ( spinProgress.length === 2 ) { 
			// p1.car.bodies[0].render.fillStyle = 'red' 
		}
		if ( spinProgress.length === 3 ) { 
			// p1.car.bodies[0].render.fillStyle = 'yellow' 
		}
		if ( spinProgress.length === 4 ) { 
			// p1.car.bodies[0].render.fillStyle = 'green' 
		}
		if ( spinProgress.length === 5 ) {
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
    <div v-for="note in noteData" v-show="note.score !== 0" :style="`top: ${note.yPos}%; left: ${note.xPos}%`" class="note" :class="{bordered: note.targetTime - gameTime() > accuracyThreshold}">{{ (note.targetTime - gameTime()) }}</div>
    <div 
      id="game" 
      :class="{
        tiltedUp: tiltDirection.up,
        tiltedDown: tiltDirection.down, 
        tiltedLeft: tiltDirection.left, 
        tiltedRight: tiltDirection.right
      }"
    >
      <!-- <p>{{ tiltDirection.up }} {{ tiltDirection.down }} {{ tiltDirection.left }} {{ tiltDirection.right }}</p> -->
      <!-- <p>{{alpha}} {{beta}} {{gamma}}!</p> -->
      <button :class="{'started':appHasStarted}" @click="startApp()">Start</button>
    </div>
  </div>
</template>

<style scoped>
  .note {
    height: 20px;
    width: 20px;
    border-radius: 999px;
    position: fixed;
    /* left: 50%;
    top: 50%; */
    transform: translate(-50%, -50%);
    z-index: 10;
    background-color: seagreen;
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
    /* height: 100vmin;
    width: 100vmin; */
    height: 70px;
    width: 70px;
    position: absolute;
    top: 50%;
    left: 50%;
    background-color:darkorange;
    transform: translate(-50%, -50%);

  }

  .tiltedUp { border-top: 3px solid black; }
  .tiltedDown { border-bottom: 3px solid black; }
  .tiltedLeft { border-left: 3px solid black; }
  .tiltedRight { border-right: 3px solid black; }
</style>
