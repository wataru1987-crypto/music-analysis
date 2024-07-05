import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './App.css';

const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const angles = d3.range(0, 2 * Math.PI, 2 * Math.PI / notesSharp.length);

const CircleOfFifths = ({ melodyNotes, chordNotes, noteNames }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();  // 既存のSVGコンテンツをクリア

    const g = svg.append('g')
      .attr('transform', 'translate(200,200)');

    // 円環を描画
    g.append('circle')
      .attr('r', 150)
      .attr('fill', 'none')
      .attr('stroke', 'black');

    // 音名を描画
    noteNames.forEach((note, i) => {
      const angle = angles[i];
      const x = 150 * Math.cos(angle - Math.PI / 2);
      const y = 150 * Math.sin(angle - Math.PI / 2);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(note);
    });

    // コードノートの対角線を円環の中心まで赤く表示
    chordNotes.forEach((note) => {
      const i = noteNames.indexOf(note);
      const angle = angles[i];
      const x = 150 * Math.cos(angle - Math.PI / 2);
      const y = 150 * Math.sin(angle - Math.PI / 2);

      g.append('line')
        .attr('x1', x)
        .attr('y1', y)
        .attr('x2', 0)
        .attr('y2', 0)
        .attr('stroke', 'red')
        .attr('stroke-width', 2);
    });

    // 対角線を描画
    noteNames.forEach((note, i) => {
      const angle1 = angles[i];
      const angle2 = angles[(i + 6) % 12];  // 対角の音
      const x1 = 150 * Math.cos(angle1 - Math.PI / 2);
      const y1 = 150 * Math.sin(angle1 - Math.PI / 2);
      const x2 = 150 * Math.cos(angle2 - Math.PI / 2);
      const y2 = 150 * Math.sin(angle2 - Math.PI / 2);

      g.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', 'gray')
        .attr('stroke-dasharray', '2,2');  // 破線にする
    });

    const plotNotes = (noteArray, color, radius) => {
      noteArray.forEach((note, index) => {
        const angle = angles[noteNames.indexOf(note)];
        const x = radius * Math.cos(angle - Math.PI / 2);
        const y = radius * Math.sin(angle - Math.PI / 2);

        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 10)
          .attr('fill', color);

        // 順番を表示
        g.append('text')
          .attr('x', x)
          .attr('y', y + 5)  // 円の中心より少し下に表示
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('fill', 'white')
          .text(index + 1);  // 順番を表示
      });
    };

    plotNotes(melodyNotes, 'blue', 170);  // メロディ音を外側に表示
    plotNotes(chordNotes, 'red', 130);   // コード音を内側に表示
  }, [melodyNotes, chordNotes, noteNames]);

  return <svg ref={ref} width={400} height={400}></svg>;
};

const App = () => {
  const [progressions, setProgressions] = useState([]);
  const [currentMelodyNotes, setCurrentMelodyNotes] = useState([]);
  const [currentChordNotes, setCurrentChordNotes] = useState([]);
  const [useSharp, setUseSharp] = useState(true);
  const [selectedMelodyNote, setSelectedMelodyNote] = useState('');
  const [selectedChordNote, setSelectedChordNote] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const noteNames = useSharp ? notesSharp : notesFlat;

  useEffect(() => {
    const savedProgressions = localStorage.getItem('progressions');
    if (savedProgressions) setProgressions(JSON.parse(savedProgressions));
  }, []);

  const handleAddMelodyNote = () => {
    if (selectedMelodyNote) {
      const newMelodyNotes = [...currentMelodyNotes, selectedMelodyNote];
      setCurrentMelodyNotes(newMelodyNotes);
      setSelectedMelodyNote('');  // ノート追加後に選択をリセット
    }
  };

  const handleAddChordNote = () => {
    if (selectedChordNote) {
      const newChordNotes = [...currentChordNotes, selectedChordNote];
      setCurrentChordNotes(newChordNotes);
      setSelectedChordNote('');  // ノート追加後に選択をリセット
    }
  };

  const handleMelodyChange = (event) => {
    setSelectedMelodyNote(event.target.value);
  };

  const handleChordChange = (event) => {
    setSelectedChordNote(event.target.value);
  };

  const handleAddProgression = () => {
    if (editingIndex !== null) {
      const newProgressions = [...progressions];
      newProgressions[editingIndex] = { melodyNotes: currentMelodyNotes, chordNotes: currentChordNotes };
      setProgressions(newProgressions);
      localStorage.setItem('progressions', JSON.stringify(newProgressions));
      setEditingIndex(null);
    } else {
      if (currentMelodyNotes.length > 0 && currentChordNotes.length > 0) {
        const newProgression = { melodyNotes: currentMelodyNotes, chordNotes: currentChordNotes };
        const newProgressions = [...progressions, newProgression];
        setProgressions(newProgressions);
        localStorage.setItem('progressions', JSON.stringify(newProgressions));
      }
    }
    setCurrentMelodyNotes([]);
    setCurrentChordNotes([]);
  };

  const handleEditProgression = (index) => {
    if (progressions[index]) {
      setCurrentMelodyNotes(progressions[index].melodyNotes || []);
      setCurrentChordNotes(progressions[index].chordNotes || []);
      setEditingIndex(index);
    }
  };

  const handleDeleteProgression = (index) => {
    const newProgressions = progressions.filter((_, i) => i !== index);
    setProgressions(newProgressions);
    localStorage.setItem('progressions', JSON.stringify(newProgressions));
  };

  const clearData = () => {
    localStorage.removeItem('progressions');
    setProgressions([]);
    setCurrentMelodyNotes([]);
    setCurrentChordNotes([]);
  };

  return (
    <div className="App">
      <h1>Music Analysis Tool</h1>
      <div>
        <label>
          Add Melody Note:
          <select onChange={handleMelodyChange} value={selectedMelodyNote}>
            <option value="" disabled>Select a note</option>
            {noteNames.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
          <button onClick={handleAddMelodyNote}>Add</button>
        </label>
        <div>
          {currentMelodyNotes.map((note, index) => (
            <span key={index}>{note} </span>
          ))}
        </div>
      </div>
      <div>
        <label>
          Add Chord Note:
          <select onChange={handleChordChange} value={selectedChordNote}>
            <option value="" disabled>Select a note</option>
            {noteNames.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
          <button onClick={handleAddChordNote}>Add</button>
        </label>
        <div>
          {currentChordNotes.map((note, index) => (
            <span key={index}>{note} </span>
          ))}
        </div>
      </div>
      <div>
        <button onClick={handleAddProgression}>{editingIndex !== null ? 'Save Changes' : 'Add Progression'}</button>
      </div>
      <div>
        <label>
          Notation:
          <select onChange={(e) => setUseSharp(e.target.value === 'sharp')} value={useSharp ? 'sharp' : 'flat'}>
            <option value="sharp">Sharp (♯)</option>
            <option value="flat">Flat (♭)</option>
          </select>
        </label>
      </div>
      <button onClick={clearData}>Clear Data</button>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {progressions.filter(p => p).map((progression, index) => (
          <div key={index} style={{ margin: '20px' }}>
            <CircleOfFifths
              melodyNotes={progression.melodyNotes}
              chordNotes={progression.chordNotes}
              noteNames={noteNames}
            />
            <button onClick={() => handleEditProgression(index)}>Edit</button>
            <button onClick={() => handleDeleteProgression(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
