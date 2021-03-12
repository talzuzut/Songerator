const SILENCE_PROB = 0.2;
const notesOccurrences = [
    // C    C#   D   D#   E    F    F#   G    G#   A   A#    B  
    [1000, 77, 420, 70, 514, 116, 606, 232, 110, 554, 299, 649],        // C
    [86, 1750, 408, 156, 377, 152, 608, 157, 298, 277, 117, 700],       // C#
    [589, 545, 1200, 26, 607, 156, 866, 581, 125, 425, 419, 665],       // D
    [80, 141, 21, 400, 293, 74, 263, 78, 127, 158, 58, 185],            // D#
    [429, 372, 933, 308, 3203, 139, 1065, 741, 346, 591, 300, 850],     // E
    [120, 138, 137, 58, 207, 400, 263, 96, 113, 188, 88, 151],          // F
    [554, 386, 813, 340, 1275, 266, 4199, 931, 396, 1058, 823, 1474],   // F#
    [304, 185, 374, 82, 703, 97, 1200, 1500, 130, 633, 406, 820],       // G
    [124, 394, 130, 94, 333, 153, 352, 131, 600, 316, 165, 345],        // G#
    [603, 288, 563, 131, 449, 166, 976, 846, 386, 2000, 366, 1084],     // A
    [253, 101, 446, 45, 322, 96, 831, 394, 154, 398, 992, 544],         // A#
    [504, 709, 759, 168, 994, 144, 1286, 748, 352, 1260, 543, 1700]     // B
];

// C = 0, C# = 1, ..., B = 11
function generateNextNote(lastScaleDegreePlayed) {
    const currentScale = getCurrentScale();
    console.log("Current scale: " + currentScale);

    //scaleNotes gets the array of notes to choose from
    const scaleNotes = getNotesInMinorScale(currentScale); // Array of notes
    console.log("Scale notes: " + scaleNotes);

    // Assuming the user chose only a single note
    lastScaleDegreePlayed = lastScaleDegreePlayed % (scaleNotes.length - 1); // If we got an octave or above, normalize the value
    console.log("Scale degree chosen by user: " + lastScaleDegreePlayed);
    console.log("note occurence row " + scaleNotes[lastScaleDegreePlayed]);

    // Indexing the note occurrences table according to the scale degree
    const currentNotePosibillities = notesOccurrences[scaleNotes[lastScaleDegreePlayed]];
    console.log("currentNotePosibillities: " + currentNotePosibillities);

    let scaleDegreesToPosibillities = {};
    let currentScaleDegree = 0;
    for (let scaleNote of scaleNotes) {
        scaleDegreesToPosibillities[currentScaleDegree] = currentNotePosibillities[scaleNote % 12];
        currentScaleDegree++;
    }

    console.log(`scaleDegreesToPosibillities: ${JSON.stringify(scaleDegreesToPosibillities)}`);

    var totalPossibilitySpace = 0;
    for (const note in scaleDegreesToPosibillities) {
        totalPossibilitySpace += scaleDegreesToPosibillities[note];
    }
    console.log(`totalPossibilitySpace: ${totalPossibilitySpace}`);

    // Set silence probability, silence note will be represented by the value -1
    scaleDegreesToPosibillities[-1] = calculateSilenceNumOfOccurences(totalPossibilitySpace);
    console.log(`Silence number of occurences: ${scaleDegreesToPosibillities[-1]}`);
    totalPossibilitySpace += scaleDegreesToPosibillities[-1];
    console.log(`totalPossibilitySpace with silence: ${totalPossibilitySpace}`);

    const randomNumber = getRandomInt(totalPossibilitySpace);
    console.log(`Generated random number ${randomNumber}`);
    var sumOfOccurences = 0;
    for (let scaleNote in scaleDegreesToPosibillities) {
        const scaleNoteOccurences = scaleDegreesToPosibillities[scaleNote];
        console.log(`scaleNote ${scaleNote} occurences: ${scaleNoteOccurences}`);
        sumOfOccurences += scaleDegreesToPosibillities[scaleNote];
        if (randomNumber < sumOfOccurences) {
            if (parseInt(scaleNote) === 0) {
                // We got the root node, and it can be an octave above, so choosing randomaly between them
                console.log("generateNextNote:: Returning a root node, so choosing randomly if it should be octave above");
                if (Math.random() > 0.5) {
                    console.log("generateNextNote:: returning the root octave higher");
                    scaleNote = 7
                }
            }
            console.log(`Next note: ${scaleNote}`);
            return scaleNote;
        }
    };
    throw 'Could not generate next note!!';
}

function calculateSilenceNumOfOccurences(totalPossibilitySpace) {
    return Math.floor((SILENCE_PROB / (1 - SILENCE_PROB)) * totalPossibilitySpace);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getCurrentScale() {
    const nodeSelect = document.getElementById("note_select");
    return parseInt(nodeSelect.options[nodeSelect.selectedIndex].getAttribute("noteIndex"));
}

// function getMostRightNote() {
//     let last = window.NOTES_SELECTED_BY_USER.length -1;
//     // Assuming a single number which represent a note
//     return window.NOTES_SELECTED_BY_USER[last];
// }
//returns the far right note that had been played 
function getLastScaleDegreePlayedByUser() {
    return window.LAST_SCALE_DEGREE_PLAYED_BY_USER;
}

function getNotesInMajorScale(rootNote) {
    return [rootNote,
        getNoteByInterval(rootNote, 2)%12,
        getNoteByInterval(rootNote, 4)%12,
        getNoteByInterval(rootNote, 5)%12,
        getNoteByInterval(rootNote, 7)%12,
        getNoteByInterval(rootNote, 9)%12,
        getNoteByInterval(rootNote, 11)%12];
}

function getNotesInMinorScale(rootNote) {
    return [rootNote%12,
        getNoteByInterval(rootNote, 2)%12,
        getNoteByInterval(rootNote, 3)%12,
        getNoteByInterval(rootNote, 5)%12,
        getNoteByInterval(rootNote, 7)%12,
        getNoteByInterval(rootNote, 8)%12,
        getNoteByInterval(rootNote, 10)%12
       ];
}

function getNoteByInterval(originalNote, interval) {
    return (originalNote + interval);
}




export { generateNextNote, getLastScaleDegreePlayedByUser }; // a list of exported items