console.log('Sandbox running...');

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
// console.log(notesToKeys(notes));

const UIMethods = (function () {
	return {
		temp: 1000,
		toggleMarkings() {
			pianoElement.classList.toggle('show-notes');
			// Also change the button text
			const buttonInnerHTML = toggleButtonElement.innerHTML.trim();
			if (buttonInnerHTML === 'C#') {
				toggleButtonElement.innerHTML = '<s>C#</s>';
			} else {
				toggleButtonElement.innerHTML = 'C#';
			}
		},
		pressNoteOnScreen(note, duration) {
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
		},
		incTemp() {
			this.temp += 1;
		},
	};
})();

// const OctaveSelectorElement2 = document.getElementById('octave-2-selector');

// secondOctaveSelectorElement.addEventListener('input', (event) => {
// 	console.log(event);
// });
