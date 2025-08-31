export let tiltThreshold = 20
export let accuracyThreshold = .25 // a 'perfect' tap is .25 before target time. a valid tap can be at the target time to .5 seconds before
export let timeToTarget: number = 1.5
export const boundarySize = `${(50/timeToTarget) * .25}%` // is the 50, 50%? is the .25 supposed to be the accuracyThreshold?