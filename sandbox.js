console.log('Sandbox running...');
const baseNotes = {
	'note-c': 261.6,
	'note-c-sharp': 277.2,
	'note-d': 293.7,
	'note-d-sharp': 311.1,
	'note-e': 329.6,
	'note-f': 349.2,
	'note-f-sharp': 370.0,
	'note-g': 392.0,
	'note-g-sharp': 415.3,
	'note-a': 440.0,
	'note-a-sharp': 466.2,
	'note-b': 493.9,
};
function notesToFrequency(note, octave) {
	return baseNotes[note] * Math.pow(2, octave - 4);
}
const pianoState = (function () {
	return {
		currentOctaves: [4, 5],
		isOctavesInSync: true,
		waveType: 'sine',
		preferablePastNKeys: [
			'note-a-1',
			'note-a-1',
			'note-b-1',
			'note-a-1',
			'note-d-2',
			'note-c-2',
		],
		pastNKeys: [],
		activeNotes: [],
		keyPressDuration: 250, //ms
		keySoundDampDuration: 1000, //ms
		changeKeySoundDampDuration(newDampDuration) {
			this.keySoundDampDuration = newDampDuration;
		},
		updatePastNKeys(noteID) {
			if (this.pastNKeys.length === this.preferablePastNKeys.length) {
				this.pastNKeys.shift();
			}
			this.pastNKeys.push(noteID);
			return (
				JSON.stringify(this.pastNKeys) ===
				JSON.stringify(this.preferablePastNKeys)
			);
		},
	};
})();

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
		tapNoteOnScreen(note, duration) {
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
		holdNoteOnScreen(note) {
			const noteKeyElement = document.getElementById(note);
			noteKeyElement.classList.add('active');
		},
		releaseNoteOnScreen(note) {
			const noteKeyElement = document.getElementById(note);
			noteKeyElement.classList.remove('active');
		},
	};
})();

// const OctaveSelectorElement2 = document.getElementById('octave-2-selector');

// secondOctaveSelectorElement.addEventListener('input', (event) => {
// 	console.log(event);
// });

const ToneGenerator = (function () {
	AudioContext = window.AudioContext || window.webkitAudioContext;
	const audCntx = new AudioContext();
	return {
		frequencies: [],
		oscillators: [],
		oscillator: audCntx.createOscillator(),
		gainNode: audCntx.createGain(),

		// Methods
		setup() {
			this.oscillator.connect(this.gainNode);
			this.gainNode.connect(audCntx.destination);
			this.setOsccilatorType('sine');
			this.setOsccilatorFreq(220);
			this.oscillator.start(0);
		},
		setOsccilatorType(type = 'sine') {
			type = type.toLowerCase();
			if (['sine', 'triangle', 'square', 'sawtooth'].includes(type)) {
				this.oscillator.type = type;
			}
		},
		setOsccilatorFreq(freq = 220) {
			this.oscillator.frequency.value = freq; // Hz
		},
		setOsccilatorGain(gain = 0.1) {
			this.gainNode.gain.value = gain;
		},
		pauseOscillator() {},
		bringDownOscillators(duration = 50, finalBringDownDuration = 1000) {
			if (this.oscillators.length === 1) {
				this.oscillators[0].gainNode.gain.exponentialRampToValueAtTime(
					0.00001,
					audCntx.currentTime + finalBringDownDuration / 1000
				);
				this.oscillators = [];
				return;
			}
			this.oscillators.forEach((oscillator) => {
				oscillator.gainNode.gain.exponentialRampToValueAtTime(
					0.00001,
					audCntx.currentTime + duration / 1000
				);
			});
			this.oscillators = [];
		},
		fireOscillators(
			waveType = 'sine',
			bringDownDuration = 50,
			finalBringDownDuration = 1000
		) {
			// Bring down the current running oscillators
			this.bringDownOscillators(
				bringDownDuration,
				finalBringDownDuration
			);
			this.frequencies.forEach((frequency) => {
				const oscillator = audCntx.createOscillator();
				const gainNode = audCntx.createGain();
				oscillator.connect(gainNode);
				gainNode.connect(audCntx.destination);
				oscillator.type = waveType;
				oscillator.frequency.value = frequency;
				this.oscillators.push({ oscillator, gainNode, frequency });
				oscillator.start();
			});
		},
		addOscillatorFreq(freq) {
			this.frequencies.push(freq);
		},
		removeOscillatorFreq(freq) {
			// this.frequencies.push(frequency)
			this.frequencies = this.frequencies.filter(
				(frequency) => frequency !== freq
			);
		},
		makeSound(
			freq,
			waveType = 'sine',
			bringDownDuration = 50,
			finalBringDownDuration = 1000
		) {
			this.addOscillatorFreq(freq);
			this.fireOscillators(
				waveType,
				bringDownDuration,
				finalBringDownDuration
			);
		},
		stopSound(freq, waveType, bringDownDuration, finalBringDownDuration) {
			this.removeOscillatorFreq(freq);
			// this.bringDownOscillators(
			// 	bringDownDuration,
			// 	finalBringDownDuration
			// );
			this.fireOscillators(
				waveType,
				bringDownDuration,
				finalBringDownDuration
			);
		},
	};
})();

const Logic = (function () {
	return {
		playSound(noteID) {
			if (pianoState.updatePastNKeys(noteID)) {
				UI.toggleWaveSelector();
			}
			const octaveNumber = +noteID[noteID.length - 1];
			// console.log(octaveNumber);
			const o = context.createOscillator();
			o.type = pianoState.waveType;
			const g = context.createGain();
			o.connect(g);
			g.connect(context.destination);
			o.frequency.value =
				notesToFrequencyMap[noteID.slice(0, noteID.length - 1)][
					pianoState.currentOctaves[octaveNumber - 1]
				];
			o.start(0);
			g.gain.exponentialRampToValueAtTime(
				0.00001,
				context.currentTime + pianoState.keySoundDampDuration / 1000
			);
		},
	};
})();

const activeKeys = {};
document.addEventListener('keydown', (event) => {
	const character = event.key;
	if (activeKeys[character]) {
		// return console.log('Already pressed');
		return;
	} else {
		activeKeys[character] = true;
	}
	const noteID = keyMap[character];
	if (!noteID) {
		return console.log('Invalid key!!');
	}
	console.log(noteID + ' fired');
	const note = noteID.slice(0, noteID.length - 2);
	const octaveNumber =
		pianoState.currentOctaves[+noteID.slice(noteID.length - 1) - 1];
	const freq = notesToFrequency(note, octaveNumber);
	ToneGenerator.makeSound(
		freq,
		pianoState.waveType,
		pianoState.bringDownDuration,
		pianoState.keySoundDampDuration
	);
	UIMethods.holdNoteOnScreen(noteID);
});

document.addEventListener('keyup', (event) => {
	const character = event.key;
	delete activeKeys[character];
	const noteID = keyMap[character];
	if (!noteID) {
		return console.log('Invalid key!!');
	}
	console.log(noteID + ' cooled');
	const note = noteID.slice(0, noteID.length - 2);
	const octaveNumber =
		pianoState.currentOctaves[+noteID.slice(noteID.length - 1) - 1];
	const freq = notesToFrequency(note, octaveNumber);
	ToneGenerator.stopSound(
		freq,
		pianoState.waveType,
		pianoState.bringDownDuration,
		pianoState.keySoundDampDuration
	);
	UIMethods.releaseNoteOnScreen(noteID);
});
