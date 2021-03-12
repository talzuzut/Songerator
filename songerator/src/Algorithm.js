import { generateNextNote, getLastScaleDegreePlayedByUser } from "./noteGenerator";
import { drawThisInSeq, updateLastNote, idToName } from "./globals"


function hookStepSequencerUpdateCell(sequencer) {
    var stepSeq = document.querySelector(sequencer.id);
    var originalUpdateCell = stepSeq._updateCell;
    var bindedOriginalUpdateCell = originalUpdateCell.bind(stepSeq);
    stepSeq._updateCell = (column, row) => {
        const noteNumber = column; // For better naming
        const scaleDegree = stepSeq.rows - (row + 1); // We want to count the scale from bottom to top in the sequencer
        //we refer to the bottom row as the first row (instead of the top row)
        let seqName = idToName(sequencer.id)
        if (stepSeq._matrix[column][row] === false) {
            console.log(`SequencerID: ${sequencer.id} - User clicked note number: ${noteNumber}, scale degree: ${scaleDegree}`);
            if (sequencer.lastNoteNumber == null || noteNumber > sequencer.lastNoteNumber) {
                console.log(`SequencerID: ${sequencer.id} - New latest note number ${noteNumber} was detected, updating last (note) scale degree: ${scaleDegree}`);
                // sequencer.lastNoteNumber = noteNumber;
                // sequencer.lastNoteDegree = scaleDegree;
                
            }
            
            window.SONG.currentSongPart[seqName].matrix[row][noteNumber] = true;
            updateLastNote(sequencer.id,noteNumber, row,true);
            
        }
        // TODO: Decide if it's necessary
        // else {
        //     //delete the note from the NOTES_SELECTED_BY_USER array
        //     const index = window.NOTES_SELECTED_BY_USER.indexOf(column);
        //     if (index > -1) {
        //         window.NOTES_SELECTED_BY_USER.splice(index, 1);
        //     }
        //     //if we removed the far right note,update MAX_NOTE_NUMBER_PLAYED
        //     if (column === window.MAX_NOTE_NUMBER_PLAYED) {
        //         console.log("chose the last one")
        //         for (let i in window.NOTES_SELECTED_BY_USER)
        //             window.MAX_NOTE_NUMBER_PLAYED = Math.max(window.MAX_NOTE_NUMBER_PLAYED, i);
        //     }
        // }
           else {
            window.SONG.currentSongPart[seqName].matrix[row][noteNumber] = false;
            console.log("a scale degree: + row " + scaleDegree+ "  " + row);
            updateLastNote(sequencer.id,noteNumber, row,false);
        }   
        bindedOriginalUpdateCell(column, row);
    };
}

// fills the rest of the sequencer
function fillUp(sequencer) {
    // var stepSeq = document.querySelector(sequencer.id);
    // const noteNumber = column; // For better naming
    // const scaleDegree = stepSeq.rows - (row + 1); // We want to count the scale from bottom to top in the sequencer

    console.log(`In fillUp function, sequencer id: ${sequencer.id}`);
    var stepSeq = document.querySelector(sequencer.id);
    const scaleDegreeChosenByUser = sequencer.lastNoteDegree;
    console.log(`fillUp::scaleDegreeChosenByUser: ${scaleDegreeChosenByUser}`);
    let lastScaleDegree = scaleDegreeChosenByUser;
    //lastNoteNumber is the far right played note 
    let lastNoteNumber = sequencer.lastNoteNumber + 1;
    while (lastNoteNumber < stepSeq.columns) {
        const nextNote = parseInt(generateNextNote(lastScaleDegree));
        console.log(`fillUp:: next note = ${nextNote}`);
        if (nextNote === -1) {
            console.log("fillUp:: Got a silence note, continuing");
            lastNoteNumber++;
            continue;
        }

        lastScaleDegree = nextNote;
        let seqName = idToName(sequencer.id);
        console.log(`fillUp: Setting note number ${lastNoteNumber}, lastScaleDegree: ${lastScaleDegree}`);
        drawThisInSeq(lastNoteNumber, lastScaleDegree, sequencer.id, true);
        window.SONG.currentSongPart[seqName].matrix[lastScaleDegree][lastNoteNumber] = true;
        updateLastNote(sequencer.id,lastNoteNumber, lastScaleDegree,true);
        lastNoteNumber++;
    }
    sequencer.lastNoteNumber = stepSeq.columns - 1; // Setting last note to last note of the matrix, so autocomplete would not be invoked again
}

export { hookStepSequencerUpdateCell, fillUp };