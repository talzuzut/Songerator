import * as Tone from "tone";
import * as NoteGenerator from './noteGenerator.js';
import * as Algorithm from './Algorithm.js';
import {changeSongPart} from './Demo.js';

let SYNTH_UPPER_LEFT = new Tone.PolySynth().toDestination();
let SYNTH_UPPER_RIGHT = new Tone.DuoSynth().toDestination();
let SYNTH_BOTTOM_LEFT = new Tone.MetalSynth().toDestination();
let SYNTH_BOTTOM_RIGHT = new Tone.MonoSynth().toDestination();

window.addEventListener('load', () => {

  SYNTH_UPPER_RIGHT.volume.value = -8; // Normalize DuoSynth volume, as it's very loud
  SYNTH_BOTTOM_LEFT.volume.value = -8; // Normalize MetalSynth volume, as it's very loud

  for (let i = 0; i < window.SCALE_JUMP.length; i++) {
    window.CURRENT_SCALE[i] = window.SONG.currentSongPart.startNote + window.SCALE_JUMP[i];
  }

  Algorithm.hookStepSequencerUpdateCell(window.SONG.currentSongPart.sequencer1);
  Algorithm.hookStepSequencerUpdateCell(window.SONG.currentSongPart.sequencer2);
  updateWithSelector();

  setupSynth("#up_left", SYNTH_UPPER_LEFT, window.C4);
  setupSynth("#up_right", SYNTH_UPPER_RIGHT, window.C4);
  setupSynth("#down_left", SYNTH_BOTTOM_LEFT, window.C4);
  setupSynth("#down_right", SYNTH_BOTTOM_RIGHT, window.C3);
});

//document.querySelector("tone-play-toggle").addEventListener("stop", () => Tone.Transport.stop());

//updating current scale, when the scale list is changed
document.getElementById("SCALE_SELECT").addEventListener("change", () => {
  window.newNote = parseInt(document.getElementById("note_select").value);
  updateWithSelector();
  console.log("Scale select: " + window.SONG.currentSongPart.startNote)
  renderSeq(window.SONG.currentSongPart.startNote);
  window.SONG.currentSongPart.SCALE_SELECT = document.getElementById("SCALE_SELECT").value;
  // TODO:PLACE HERE FUNC TO RENDER THE NEW SEQUENCER
});

//updating the root note of the step sequencer, when its dropdown list
// is being changed
document.getElementById("note_select").addEventListener("change", () => {
  // window.newNote = parseInt(document.getElementById("note_select").value);  
  window.SONG.currentSongPart.startNote = parseInt(document.getElementById("note_select").value);
  updateWithSelector();
  renderSeq(window.SONG.currentSongPart.startNote);
  //renderSeq(window.newNote)
});

document.getElementById("VERSE_SELECT").addEventListener("change", () => {
  changeSongPart();
});

function updateWithSelector() {
  window.SCALE_SELECT = parseInt(document.getElementById("SCALE_SELECT").value);
  switch (window.SCALE_SELECT) {
    case 1:
      window.SCALE_JUMP = window.MINOR_INTERVALS;
      break;
    case 2:
      window.SCALE_JUMP = window.MAJOR_INTERVALS;
      break;
  }
  for (let i = 0; i < window.SCALE_JUMP.length; i++) {
    let currNote = window.SONG.currentSongPart.startNote + window.SCALE_JUMP[i];
    console.log("currNote: " + currNote);
    window.CURRENT_SCALE[i] = currNote;
    //update the notes indexes near the sequencers
    let html_update = document.querySelectorAll(".note_" + i);
    html_update.forEach((element) => {
      element.innerHTML = midiToNote(currNote);
    })
    html_update.innerHTML = midiToNote(currNote);
  }
}

function midiToNote(currNote) {
  window.note_arr = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return window.note_arr[currNote % 12];
}

//when clicked on Auto Compwindow.e, fill the rest of the sequencer
function onAutoCompleteClicked(sequencer) {
  if (sequencer.lastNoteDegree == null) {
    console.log("No note was chosen by the user");
    return;
  }
  Algorithm.fillUp(sequencer);
}

//inst_1 refers to the upper left sequencer, inst_2 to the upper right sequencer
document.getElementById("inst_1").addEventListener("click", () => onAutoCompleteClicked(window.SONG.currentSongPart.sequencer1));
document.getElementById("inst_2").addEventListener("click", () => onAutoCompleteClicked(window.SONG.currentSongPart.sequencer2));

function renderSeq(startNote) {
  SYNTH_UPPER_LEFT = new Tone.PolySynth().toDestination();
  SYNTH_UPPER_RIGHT = new Tone.DuoSynth().toDestination();
  SYNTH_BOTTOM_LEFT = new Tone.MetalSynth().toDestination();
  SYNTH_BOTTOM_RIGHT = new Tone.MonoSynth().toDestination();
  SYNTH_UPPER_RIGHT.volume.value = -8; // Normalize DuoSynth volume, as it's very loud
  SYNTH_BOTTOM_LEFT.volume.value = -8; // Normalize MetalSynth volume, as it's very loud

  setupSynth("#up_left", SYNTH_UPPER_LEFT, startNote);
  setupSynth("#up_right", SYNTH_UPPER_RIGHT, startNote);
  setupSynth("#down_left", SYNTH_BOTTOM_LEFT, startNote);
  setupSynth("#down_right", SYNTH_BOTTOM_RIGHT, startNote);
}


function setupSynth(synthId, synthTone, startNote) {

  function _triggerListener({ detail }) {
    console.log("In trigger function");
    window.SCALE_SELECT = parseInt(document.getElementById("SCALE_SELECT").value);
    switch (window.SCALE_SELECT) {
      case 1:
        window.SCALE_JUMP = window.MINOR_INTERVALS;
        break;
      case 2:
        window.SCALE_JUMP = window.MAJOR_INTERVALS;
        break;
    }
    console.log("setupSynth: startNote: " + startNote);
    for (let i = 0; i < window.SCALE_JUMP.length; i++) {
      window.CURRENT_SCALE[i] = startNote + window.SCALE_JUMP[i];
    }

    console.log("Before switch in trigger function");

    console.log("detail.row: " + detail.row);
    console.log("detail.time: " + detail.time);

    detail.time = detail.time - 1; // Hack for correct timing in the sequencer

    switch (detail.row) {
      case 0: {
        console.log("trigger#1: " + window.CURRENT_SCALE[0]);
        console.log("trigger#2: " + Tone.Frequency(window.CURRENT_SCALE[0], "midi").toNote());
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[0], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[0]);
        break;
      }
      case 1: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[1], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[1]);
        break;
      }
      case 2: {
        console.log("trigger#3: " + window.CURRENT_SCALE[2]);
        console.log("trigger#4: " + Tone.Frequency(window.CURRENT_SCALE[2], "midi").toNote());
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[2], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[2]);
        break;
      }
      case 3: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[3], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[3]);
        break;
      }
      case 4: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[4], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[4]);
        break;
      }
      case 5: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[5], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[5]);
        break;
      }
      case 6: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[6], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[6]);
        break;
      }
      case 7: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[7], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[7]);
        break;
      }
      case 8: {
        synthTone.triggerAttackRelease(
          Tone.Frequency(window.CURRENT_SCALE[8], "midi").toNote(),
          "4n",
          detail.time
        );
        window.NOTES_SELECTED_BY_USER.push(window.CURRENT_SCALE[8]);
        break;
      }
    }
  };

  console.log("In setupSynth function: " + synthId);
  let synth = document.querySelector(synthId);
  // Remove the previous listener and set the new one, to avoid multiple listeners bug
  synth.removeEventListener("trigger", synth.fn, true);
  synth.fn = _triggerListener;
  synth.addEventListener("trigger", synth.fn, true);
}
