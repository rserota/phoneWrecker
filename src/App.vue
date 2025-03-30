<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { onMounted, ref, reactive} from 'vue'

onMounted(() => {
  console.log(`the component is now mounted.`)
})
interface SpinProgress {gripOrientation: number; time: number}
let alpha = ref(0)
let	beta = ref(0)
let gamma = ref(0)
let up: number = ref(null); // this is the initial reading on deviceorientation.alpha, that everything else is calibrated against
let gripOrientation = ref(0) // 0 = normal horizontal alpha between 315 - 45
let spinProgress: SpinProgress[] = reactive([])
let spinDirection = ref(null)
let appHasStarted = ref(false)

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

function update(){
	if ( window._alpha ) { alpha = window._alpha } //debug
	if ( alpha != null ) {
    console.log('spin progress: ', spinProgress)
		// gameEl.style.transform = `translateX(-50%) translateY(-50%) rotate(${alpha - 90}deg)`
		// Overlay.wrapper.style.transform = `translateX(-50%) translateY(-50%) rotate(${alpha - 90}deg)`
		if ( spinProgress.length === 0 ) { spinProgress.unshift({gripOrientation, time: performance.now()}) }

		// spin progress resets if they take more than 500ms to complete a quarter turn
		else if ( performance.now() - spinProgress[0].time > 500 ) { spinProgress = [{gripOrientation, time: performance.now()}] }
		else if ( spinProgress[0].gripOrientation === gripOrientation ) {
			// do nothing
		}
		else if ( (spinDirection === null || spinDirection === 'left') && (spinProgress[0].gripOrientation === (gripOrientation - 1) || (spinProgress[0].gripOrientation === 3 && gripOrientation === 0 ) )) {
			spinDirection = 'left'
			spinProgress.unshift({gripOrientation, time: performance.now()})
		}
		else if ( (spinDirection === null || spinDirection === 'right') && (spinProgress[0].gripOrientation === (gripOrientation + 1) || (spinProgress[0].gripOrientation === 0 && gripOrientation === 3 ) )) {
			spinDirection = 'right'
			spinProgress.unshift({gripOrientation, time: performance.now()})
		}
		else {
			spinDirection = null
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
			spinDirection = null
			spinProgress = []
		}
	}

	if ( beta >= -40 && beta <= 40 )  { 
		// p1.car.bodies[1].torque = -(beta / 80)
		// p1.car.bodies[2].torque = -(beta / 80)
		// //console.log(beta, window.game.myCar.bodies[1].torque)
		// Matter.Body.applyForce(p1.car.bodies[3], p1.car.bodies[3].position, {x:(-beta/10000),y:-0.005})
	}

	if ( gamma >= -30 && gamma <= 30 ) {
		// p1.neck.length = ((-gamma + 30) / 1.1 ) + 32
	}

	
	requestAnimationFrame(update)
}

const startApp = async function(event: any){
  console.log('starting app')
  appHasStarted.value = true
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
  <div id="game" :style="`transform: translateX(-50%) translateY(-50%) rotate(${alpha - 90}deg)`">
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <p>{{alpha}} {{beta}} {{gamma}}</p>
    <button :class="{'started':appHasStarted}" @click="startApp()">Start</button>
  </div>
</template>

<style scoped>
  #game {
    position: fixed;
    top: 50%;
    left: 50%
  }
</style>
