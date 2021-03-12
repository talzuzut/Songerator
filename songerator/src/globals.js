//import * as Tone from "tone";

window.C4 = 60;
window.C3 = 48;
window.NOTES_SELECTED_BY_USER = [];
window.MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];
window.MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
window.MAX_NOTE_NUMBER_PLAYED = -1;
window.LAST_SCALE_DEGREE_PLAYED_BY_USER = -2;
window.CURRENT_SCALE = [];
window.SCALE_JUMP = [0, 2, 3, 5, 7, 8, 10, 12];

//window.SYNTH_UPPER_LEFT = new Tone.PolySynth().toDestination();
//window.SYNTH_UPPER_RIGHT = new Tone.DuoSynth().toDestination();
//window.SYNTH_UPPER_RIGHT.volume.value = -8; // Normalize DuoSynth volume, as it's very loud

//window.SYNTH_BOTTOM_LEFT = new Tone.MetalSynth().toDestination();
//window.SYNTH_BOTTOM_LEFT.volume.value = -8; // Normalize MetalSynth volume, as it's very loud
//window.SYNTH_BOTTOM_RIGHT = new Tone.MonoSynth().toDestination();

 // The rightmost note played by the user, -2 means no note was chosen (-1 is silence)
//gets an list of tuples representing the chosen notes in the current verse,
//returns a sequencer with the chosen notes 
function arrayToMatrix(arr) {
    var sequencer = [];
    for (let i = 0; i < 8; i++) {
        var row = [];
        for (let j = 0; j < 16; j++) {
            row.push(false);
        }
        sequencer.push([row]);
    }

    for (let i = 0; i < arr.length; i++) {
        sequencer[arr[i][0]][arr[i][1]] = true;
    }
    return sequencer;
}

//creates new verse in the current window.SONG 
//  (by default we have verse1, verse2 and chorus)
function createSongPart(givenBPM, startNote, scaleSelect) {
    let songPart = {
        startNote: startNote,
        SCALE_SELECT: scaleSelect,
        bpm: givenBPM,
        sequencer1: { id: "#up_left", matrix: arrayToMatrix([]), lastNoteNumber: null, lastNoteDegree: null },
        sequencer2: { id: "#up_right", matrix: arrayToMatrix([]), lastNoteNumber: null, lastNoteDegree: null },
        sequencer3: { id: "#down_left", matrix: arrayToMatrix([]), lastNoteNumber: null, lastNoteDegree: null },
        sequencer4: { id: "#down_right", matrix: arrayToMatrix([]), lastNoteNumber: null, lastNoteDegree: null }
    }
    return songPart;
}
//Song represents a variable containing data of the whole program
// (it includes verses, in each verse we have the data of the sequencers, 
// and chosen root note and scale)
window.SONG = {
    verse1: createSongPart(120, 60, "1"),
    verse2: createSongPart(120, 60, "1"),
    chorus1: createSongPart(120, 60, "1")
}
// currentSongPart refers to the verse/chorus the user is currently viewing
window.SONG.currentSongPart = window.SONG.verse1;

//updates the data of the current part of the window.SONG
function updateCurrentSongPart(givenBPM, startNote, scaleSelect) {
    window.SONG[window.SONG.currentSongPart].startNote = startNote;
    window.SONG[window.SONG.currentSongPart].SCALE_SELECT = scaleSelect;
    window.SONG[window.SONG.currentSongPart].bpm = givenBPM;
}

function changeSongPart(songPart) {
    // TODO
}

//gets an ID of a sequencer, updates its last note
function updateLastNote(seqID, noteNumber, noteDegree, val) {
    console.log(seqID);
    let seqName = idToName(seqID)
    if (val === true && window.SONG.currentSongPart[seqName].lastNoteNumber < noteNumber) {
        window.SONG.currentSongPart[seqName].lastNoteNumber = noteNumber;
        window.SONG.currentSongPart[seqName].lastNoteDegree = noteDegree;
    }
    if (val === false) {
        window.SONG.currentSongPart[seqName].lastNoteNumber = null;
        window.SONG.currentSongPart[seqName].lastNoteDegree = null;
        for (let j = 0; j < 16; j++) {
            for (let i = 0; i < 8; i++) {
                if (window.SONG.currentSongPart[seqName].matrix[i][j] === true) {
                    window.SONG.currentSongPart[seqName].lastNoteNumber = j;
                    window.SONG.currentSongPart[seqName].lastNoteDegree = i;
                    console.log("i j  " + i + ";"+j);
                }
            }
        }
    }
    console.log("last note is : " + window.SONG.currentSongPart[seqName].lastNoteNumber);
    for(let i = 0; i< window.SONG.currentSongPart[seqName].matrix.length; i++){
        console.log("row "+i+": " + window.SONG.currentSongPart[seqName].matrix[i]);
    }
    
}

//
function updateCurrentSongPartSeq(seqID, seqMatrix) {
    let seqName = idToName(seqID);
    window.SONG.currentSongPart[seqName].matrix = seqMatrix;
    updateLastNote(seqID, 0, 0, false);
}

//
function updateNoteInCurrentSongPartSeq(seqID, noteNumber, noteDegree, val) {
    window.SONG[window.SONG.currentSongPart][seqID].matrix[noteDegree][noteNumber] = val;
    updateLastNote(seqID, noteNumber, noteDegree, val);
}

//gets a key representing a part of the window.SONG, then loads it
//as the current part
function loadSongPart(songPart) {
    let sequencers = [window.SONG[songPart].sequencer1, window.SONG[songPart].sequencer2,
    window.SONG[songPart].sequencer3, window.SONG[songPart].sequencer4];
    for (let s = 0; s < 4; s++) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 16; j++) {
                drawThisInSeq(i, j, sequencers[s].seqID, sequencers[s].matrix[i][j]);
            }
        }
    }
}

//turns on/off(val) a note at row(from bottom) scaleDegree and column note number, at seq with name id to
function drawThisInSeq(noteNumber, scaleDegree, id, val) {
    console.log(`drawThisInSeq:: id = ${id}`);
    let stepSeq = document.querySelector(id);
    //console.log(`drawInSeq::scaleDegree = ${scaleDegree}`);
    const rowInSequencer = parseInt(scaleDegree);//stepSeq.rows - (parseInt(scaleDegree) + 1);
    console.log(`drawThisInSeq::rowInSequencer = ${rowInSequencer}, noteNumber = ${noteNumber}`);
    stepSeq._matrix[noteNumber][rowInSequencer] = val;
    stepSeq.requestUpdate()
}
function idToName(id){
    switch(id){
        case "#up_left": return "sequencer1";
        case "#up_right": return "sequencer2";
        case "#down_left": return "sequencer3";
        case "#down_right": return "sequencer4";
    }
    return "sequencer1"
}


export {drawThisInSeq, updateLastNote, idToName,arrayToMatrix, updateCurrentSongPartSeq}