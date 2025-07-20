import { NoteType } from '../types/NoteType'

export function onSpin(noteType: NoteType){
    let gt = gameTime()
  
    //onTilt should look for one note at a time, but the spin methods need to check multiple notes
    // a 360 in either direction works. it's not reasonable to be ready for both.
    for ( let note of noteData ) {
      let timeLeft = note.targetTime - gt
      if ( timeLeft > 0 && timeLeft < .5 && [NoteType.Left360, NoteType.Right360].includes(note.type) ) {
        const score = triangularOutput(timeLeft*100) + 25
        note.score = score
        totalScore.value += score
      }
    }
}