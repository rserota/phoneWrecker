import { type NoteData, noteFactory, NoteType, Direction } from './types/index'
import { reactive } from 'vue'


export const songData: NoteData[] = reactive([

  noteFactory('0:3', Direction.Right, NoteType.Tap),
  noteFactory('1:3', Direction.Right, NoteType.Tap),
  noteFactory('2:3', Direction.Right, NoteType.Tap),

  noteFactory('3:1:2', Direction.Right, NoteType.HoldDown),
  noteFactory('3:2:0', Direction.Right, NoteType.HoldUp),
  noteFactory('3:2:2', Direction.Right, NoteType.HoldDown),
  noteFactory('3:3:0', Direction.Right, NoteType.HoldUp),
  noteFactory('3:3:2', Direction.Right, NoteType.HoldDown),
  noteFactory('4:0:0', Direction.Right, NoteType.HoldUp),

  noteFactory('4:1:2', Direction.Right, NoteType.Tap),
  noteFactory('4:2:0', Direction.Right, NoteType.Tap),
  noteFactory('4:2:2', Direction.Right, NoteType.Tap),
  noteFactory('4:3:0', Direction.Right, NoteType.Tap),
  noteFactory('4:3:2', Direction.Right, NoteType.Tap),
  noteFactory('5:0:0', Direction.Right, NoteType.Tap),

  noteFactory('5:1:0', Direction.Right, NoteType.Tap),
  noteFactory('5:1:2', Direction.Right, NoteType.Tap),
  noteFactory('5:2:0', Direction.Right, NoteType.Tap),
  noteFactory('5:2:2', Direction.Right, NoteType.Tap),
  noteFactory('5:3:0', Direction.Right, NoteType.Tap),
  noteFactory('5:3:2', Direction.Right, NoteType.Tap),
  noteFactory('6:0:0', Direction.Right, NoteType.Tap),

  noteFactory('7:1:2', Direction.Right, NoteType.Tap),
  noteFactory('7:2:0', Direction.Right, NoteType.Tap),
  noteFactory('7:2:2', Direction.Right, NoteType.Tap),
  noteFactory('7:3:0', Direction.Right, NoteType.Tap),
  noteFactory('7:3:2', Direction.Right, NoteType.Tap),
  noteFactory('8:0:0', Direction.Right, NoteType.Tap),

  noteFactory('8:1:2', Direction.Right, NoteType.Tap),
  noteFactory('8:2:0', Direction.Right, NoteType.Tap),
  noteFactory('8:2:2', Direction.Right, NoteType.Tap),
  noteFactory('8:3:0', Direction.Right, NoteType.Tap),
  noteFactory('8:3:2', Direction.Right, NoteType.Tap),
  noteFactory('9:0:0', Direction.Right, NoteType.Tap),
  
  // i'm a shot that you can miss
  noteFactory('9:1:0', Direction.Right, NoteType.Tap),
  noteFactory('9:1:2', Direction.Right, NoteType.Tap),
  noteFactory('9:2:0', Direction.Right, NoteType.Tap),
  noteFactory('9:2:2', Direction.Right, NoteType.Tap),
  noteFactory('9:3:0', Direction.Right, NoteType.Tap),
  noteFactory('9:3:2', Direction.Right, NoteType.Tap),
  noteFactory('10:0:0', Direction.Right, NoteType.Tap),


  //pickup the momentum
  noteFactory('11:1:2', Direction.Right, NoteType.Tap),
  noteFactory('11:1:3', Direction.Right, NoteType.Tap),
  noteFactory('11:2:2', Direction.Right, NoteType.Tap),
  noteFactory('11:3:0', Direction.Right, NoteType.Tap),
  noteFactory('11:3:2', Direction.Right, NoteType.Tap),

  noteFactory('12:1:2', Direction.Right, NoteType.Tap),
  noteFactory('12:1:3', Direction.Right, NoteType.Tap),
  noteFactory('12:2:2', Direction.Right, NoteType.Tap),
  noteFactory('12:3:0', Direction.Right, NoteType.Tap),
  noteFactory('12:3:2', Direction.Right, NoteType.Tap),

  noteFactory('13:1:2', Direction.Right, NoteType.Tap),
  noteFactory('13:1:3', Direction.Right, NoteType.Tap),
  noteFactory('13:2:2', Direction.Right, NoteType.Tap),
  noteFactory('13:3:0', Direction.Right, NoteType.Tap),
  noteFactory('13:3:2', Direction.Right, NoteType.Tap),

  noteFactory('14:2:2', Direction.Right, NoteType.Tap),
  noteFactory('14:3:0', Direction.Right, NoteType.Tap),

  //every
  noteFactory('15:0:0', Direction.Right, NoteType.Right360),
  noteFactory('15:0:0', Direction.Left, NoteType.Right360),
  noteFactory('15:0:0', Direction.Up, NoteType.Right360),
  noteFactory('15:0:0', Direction.Down, NoteType.Right360),


  //time we touch
  noteFactory('15:1:0', Direction.Right, NoteType.Tap),
  noteFactory('15:1:2', Direction.Right, NoteType.Tap),
  noteFactory('15:2:0', Direction.Right, NoteType.Tap),

  //body turn to dust
  noteFactory('16:0:0', Direction.Right, NoteType.Tap),
  noteFactory('16:0:2', Direction.Right, NoteType.Tap),
  noteFactory('16:1:0', Direction.Right, NoteType.Tap),
  noteFactory('16:1:2', Direction.Right, NoteType.Tap),
  noteFactory('16:2:0', Direction.Right, NoteType.Tap),

  // higher than a
  noteFactory('17:0:0', Direction.Right, NoteType.Tap),
  noteFactory('17:0:2', Direction.Right, NoteType.Tap),
  noteFactory('17:1:0', Direction.Right, NoteType.Tap),
  noteFactory('17:1:2', Direction.Right, NoteType.Tap),

  // woman on the
  noteFactory('17:2:0', Direction.Right, NoteType.Tap),
  noteFactory('17:2:2', Direction.Right, NoteType.Tap),
  noteFactory('17:3:0', Direction.Right, NoteType.Tap),
  noteFactory('17:3:2', Direction.Right, NoteType.Tap),
  // moon
  noteFactory('18:0:0', Direction.Right, NoteType.Tap),

  // woman on the
  noteFactory('18:2:0', Direction.Right, NoteType.Tap),
  noteFactory('18:2:2', Direction.Right, NoteType.Tap),
  noteFactory('18:3:0', Direction.Right, NoteType.Tap),
  noteFactory('18:3:2', Direction.Right, NoteType.Tap),
  // moon
  noteFactory('19:0:0', Direction.Right, NoteType.Tap),

  // woman on
  noteFactory('19:2:0', Direction.Right, NoteType.Tap),
  noteFactory('19:2:2', Direction.Right, NoteType.Tap),
  noteFactory('19:3:0', Direction.Right, NoteType.Tap),
  noteFactory('19:3:2', Direction.Right, NoteType.Tap),

  // moon
  noteFactory('20:0:0', Direction.Right, NoteType.Tap),

  //damn, you got me
  noteFactory('20:1:0', Direction.Right, NoteType.Tap),
  noteFactory('20:1:1', Direction.Down, NoteType.Tap),
  noteFactory('20:1:2', Direction.Left, NoteType.Tap),
  noteFactory('20:1:3', Direction.Up, NoteType.Tap),
  noteFactory('20:2:0', Direction.Right, NoteType.Tap),
  noteFactory('20:2:1', Direction.Down, NoteType.Tap),
  noteFactory('20:2:2', Direction.Left, NoteType.Tap),
  noteFactory('20:2:3', Direction.Up, NoteType.Tap),

  // higher than a
  noteFactory('21:0:0', Direction.Right, NoteType.Tap),
  noteFactory('21:0:2', Direction.Right, NoteType.Tap),
  noteFactory('21:1:0', Direction.Right, NoteType.Tap),
  noteFactory('21:1:2', Direction.Right, NoteType.Tap),

  // woman on the
  noteFactory('21:2:0', Direction.Right, NoteType.Tap),
  noteFactory('21:2:2', Direction.Right, NoteType.Tap),
  noteFactory('21:3:0', Direction.Right, NoteType.Tap),
  noteFactory('21:3:2', Direction.Right, NoteType.Tap),
  // moon
  noteFactory('22:0:0', Direction.Right, NoteType.Tap),


  // woman on the
  noteFactory('23:0:0', Direction.Right, NoteType.Tap),
  noteFactory('23:0:2', Direction.Right, NoteType.Tap),
  noteFactory('23:1:0', Direction.Right, NoteType.Tap),
  noteFactory('23:1:2', Direction.Right, NoteType.Tap),
  // moon
  noteFactory('23:2:0', Direction.Right, NoteType.Tap),

  // woman on the
  noteFactory('24:0:0', Direction.Right, NoteType.Tap),
  noteFactory('24:0:2', Direction.Right, NoteType.Tap),
  noteFactory('24:1:0', Direction.Right, NoteType.Tap),
  noteFactory('24:1:2', Direction.Right, NoteType.Tap),
  // moon
  noteFactory('24:2:0', Direction.Right, NoteType.Tap),
])