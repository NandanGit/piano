console.log('Sandbox running...');
const context = new AudioContext();
const keyPressDuration = 250; // Milliseconds
const keySoundDuration = 2000;

// Mapping keys to notes
const keyMap = {
	// Natural notes of first octave
	z: 'note-c-1',
	x: 'note-d-1',
	c: 'note-e-1',
	v: 'note-f-1',
	b: 'note-g-1',
	n: 'note-a-1',
	m: 'note-b-1',
	// Sharp/Flats of first octave
	s: 'note-c-sharp-1',
	d: 'note-d-sharp-1',
	g: 'note-f-sharp-1',
	h: 'note-g-sharp-1',
	j: 'note-a-sharp-1',

	// Natural notes of second octave
	Z: 'note-c-2',
	X: 'note-d-2',
	C: 'note-e-2',
	V: 'note-f-2',
	B: 'note-g-2',
	N: 'note-a-2',
	M: 'note-b-2',
	// Sharp/Flats of second octave
	S: 'note-c-sharp-2',
	D: 'note-d-sharp-2',
	G: 'note-f-sharp-2',
	H: 'note-g-sharp-2',
	J: 'note-a-sharp-2',
};

const frequencyMap = {
	// Note --> Frequency
	'note-c-1': 261.6,
	'note-c-sharp-1': 277.2,
	'note-d-1': 293.7,
	'note-d-sharp-1': 311.1,
	'note-e-1': 329.6,
	'note-f-1': 349.2,
	'note-f-sharp-1': 370.0,
	'note-g-1': 392.0,
	'note-g-sharp-1': 415.3,
	'note-a-1': 440.0,
	'note-a-sharp-1': 466.2,
	'note-b-1': 493.9,
};

function pressNoteOnScreen(note, duration) {
	// duration should be in milliseconds
	const noteKeyElement = document.getElementById(note);
	// console.log(noteKeyElement);
	// Add active class to the key
	noteKeyElement.classList.add('active');

	if (duration) {
		setTimeout(() => {
			noteKeyElement.classList.remove('active');
			// o.stop();
		}, duration);
	}
	// return noteKeyElement;
}

document.addEventListener('keypress', (event) => {
	const character = event.key;
	const noteID = keyMap[character];
	if (!noteID) {
		return console.log('Invalid key!!');
	}
	pressNoteOnScreen(noteID, keyPressDuration);
	// console.log(frequencyMap[noteID]);
	// Oscillator
	const o = context.createOscillator();
	const g = context.createGain();
	o.connect(g);
	g.connect(context.destination);
	o.frequency.value = frequencyMap[noteID] * 2;
	o.start(0);
	g.gain.exponentialRampToValueAtTime(
		0.00001,
		context.currentTime + keySoundDuration / 1000
	);
});

// D E F E D C D
const notesToKeyMap = {
	c: 'z',
	'c#': 's',
	d: 'x',
	'd#': 'd',
	e: 'c',
	f: 'v',
	'f#': 'g',
	g: 'b',
	'g#': 'h',
	a: 'n',
	'a#': 'j',
	b: 'm',
};
function notesToKeys(notesSequence, isSheet = true) {
	res = '';
	if (!isSheet) {
		for (note of notesSequence.split(' ')) {
			res += notesToKeyMap[note.toLowerCase()].toUpperCase() + ' ';
		}
		return res;
	}
	for (line of notesSequence.trim().split('\n')) {
		res += notesToKeys(line.trim(), false) + '\n';
	}
	return res;
}

// Testing
const notes = `
D E F E D C D
D E F E D C D
D E D E D C C
C D C D C A# A
`;
console.log(notesToKeys(notes));
