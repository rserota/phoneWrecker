import {Direction, NoteType} from './index'
import * as Tone from 'tone'
import { accuracyThreshold } from '../constants';

export interface NoteData { targetTime: number; originDirection: Direction, type: NoteType, score: number | null, yPos: number; xPos: number}

Tone.getTransport().bpm.value = 117
export const noteFactory = (targetTime: string, originDirection: Direction, noteType: NoteType)=>{
    return {
        targetTime: Tone.Time(targetTime).toSeconds() + accuracyThreshold,
        // targetTime: Tone.Time(targetTime).toSeconds() ,
        yPos: -50,
        xPos: -50,
        originDirection,
        score: null,
        type: noteType
    }
} 