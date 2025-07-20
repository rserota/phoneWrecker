export enum NoteType {
  Tap = 'tap', // simple tap in one direction
  HoldDown = 'holdDown', // hold the direction until the hold up. must be paired.
  HoldUp = 'holdUp', // release a previous holdDown
  Left90 = 'left90', // turn left 90 degrees
  // Left180 = 'left180',
  Left360 = 'left360',
  Right90 = 'right90',
  // Right180 = 'right180',
  Right360 = 'right360',
}