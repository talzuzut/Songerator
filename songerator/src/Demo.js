import { arrayToMatrix, updateLastNote } from "./globals";
import * as Globals from './globals.js';

/*var demo1 = {
    START_NOTE : 60,
    SCALE_SELECT : "major",
    bpm : 120,
    sequencer1 : arrayToMatrix([[4,0], [6,1], [6,2], [5,4], [7,5], [7,6], [8,8], [7,9], 
    [6,10], [5,11], [4,12], [4,13], [4,14]]),
    sequencer2 : arrayToMatrix([]),
    sequencer3 : arrayToMatrix([]),
    sequencer4 : arrayToMatrix([])
}*/
export function changeSongPart(){
    let selectedVerseName = document.getElementById("VERSE_SELECT").value;
    //stepSeq represents all 4 sequencers
    let stepSeq = document.querySelectorAll("#up_left, #up_right, #down_left, #down_right");

    let seq_ul = document.getElementById("up_left");
    let seq_ur = document.getElementById("up_right");
    let seq_dl = document.getElementById("down_left");
    let seq_dr = document.getElementById("down_right");

    //save the data of the current verse in the song object
    Globals.updateCurrentSongPartSeq(window.SONG.currentSongPart.sequencer1.id, seq_ul._matrix); 
    Globals.updateCurrentSongPartSeq(window.SONG.currentSongPart.sequencer2.id, seq_ur._matrix); 
    Globals.updateCurrentSongPartSeq(window.SONG.currentSongPart.sequencer3.id, seq_dl._matrix); 
    Globals.updateCurrentSongPartSeq(window.SONG.currentSongPart.sequencer4.id, seq_dr._matrix);
    //setting the selected verse as the current verse 
    window.SONG.currentSongPart = window.SONG[selectedVerseName];
    
    //load the existing data of the chosen verse
    writeToSeq(window.SONG.currentSongPart.sequencer1, "#up_left");
    writeToSeq(window.SONG.currentSongPart.sequencer2, "#up_right");
    writeToSeq(window.SONG.currentSongPart.sequencer3, "#down_left");
    writeToSeq(window.SONG.currentSongPart.sequencer4, "#down_right");
    //updates the chosen root note and scale
    var scaleSelect = document.getElementById("SCALE_SELECT");
    scaleSelect.value = window.SONG.currentSongPart.SCALE_SELECT;
    var noteSelect = document.getElementById("note_select");
    noteSelect.value = window.SONG.currentSongPart.START_NOTE;
}
//write data into given sequencer
function writeToSeq(seq, seqID){
    for(let i =0; i<8; i++){
        for(let j=0; j<16; j++){
            Globals.drawThisInSeq(j,i,seqID,seq.matrix[i][j]);
        }
    }
}
//reset all 4 sequencrs
function resetAllSeq(){
    let stepSeq = document.querySelectorAll("#up_left, #up_right, #down_left, #down_right");
    stepSeq.forEach((element) => {
        for(let i=0; i<8; i++){
            for(let j=0; j<16; j++){
                element._matrix[i][j] = false
            }
        }  
    })
}

