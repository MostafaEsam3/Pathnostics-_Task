import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

interface LetterFrequency {
  letter: string;
  count: number;
  percentage: string;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  action?: () => void;
}

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const excludeSpacesRef = useRef<HTMLInputElement>(null);
  const charLimitRef = useRef<HTMLInputElement>(null);
  const charLimitInputRef = useRef<HTMLInputElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const clearBtnRef = useRef<HTMLButtonElement>(null);
  const keyboardShortcutsBtnRef = useRef<HTMLButtonElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const showAllLettersBtnRef = useRef<HTMLButtonElement>(null);
  const seeMoreBtnRef = useRef<HTMLButtonElement>(null);
  const closeModalBtnRef = useRef<HTMLButtonElement>(null);

  const [text, setText] = useState<string>('Design is the silent ambassador of your brand. Simplicity is key to effective communication, creating clarity in every interaction. A great design transforms complex ideas into elegant solutions, making them easy to understand. It blends aesthetics and functionality seamlessly.');
  const [excludeSpaces, setExcludeSpaces] = useState<boolean>(false);
  const [charLimit, setCharLimit] = useState<number | null>(null);
  const [hasCharLimit, setHasCharLimit] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

  const [charCount, setCharCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [sentenceCount, setSentenceCount] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<string>('');
  const [letterFrequency, setLetterFrequency] = useState<LetterFrequency[]>([]);
  const [exceedsLimit, setExceedsLimit] = useState<boolean>(false);
  const [showAllLetters, setShowAllLetters] = useState<boolean>(false);
  const [focusTraps, setFocusTraps] = useState<{
    trapModal: boolean;
  }>({
    trapModal: false
  });

  useEffect(() => {
    // ----- Character count calculation ------------------------------
    const chars = excludeSpaces ? text.replace(/\s/g, '').length : text.length;
    setCharCount(chars);

    // Word count calculation ---------------------------
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);

    // Sentence count calculation---------------------------
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    setSentenceCount(sentences);

    //  time calculation--
    const minutes = words / 225;
    if (minutes < 1) {
      setReadingTime(`${Math.ceil(minutes * 60)} seconds`);
    } else {
      setReadingTime(`${Math.ceil(minutes)} minute${Math.ceil(minutes) !== 1 ? 's' : ''}`);
    }

    const letterCount: Record<string, number> = {};
    const lettersOnly = text.toLowerCase().replace(/[^a-z]/g, '');


    for (const char of lettersOnly) {
      letterCount[char] = (letterCount[char] || 0) + 1;
    }

    // calculate percentages
    const totalLetters = lettersOnly.length;
    const frequencies: LetterFrequency[] = Object.entries(letterCount)
      .map(([letter, count]) => ({
        letter,
        count,
        percentage: ((count / totalLetters) * 100).toFixed(2) + '%'
      }))
      .sort((a, b) => b.count - a.count);

    setLetterFrequency(frequencies);

    // character limit
    if (hasCharLimit && charLimit !== null) {
      setExceedsLimit(chars > charLimit);
    } else {
      setExceedsLimit(false);
    }
  }, [text, excludeSpaces, charLimit, hasCharLimit]);

  // text change
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  const handleCharLimitToggle = useCallback(() => {
    setHasCharLimit(prev => {
      const newValue = !prev;

      if (newValue && charLimit === null) {
        setCharLimit(280); 
      }

      if (newValue) {
        setTimeout(() => {
          charLimitInputRef.current?.focus();
        }, 10);
      }

      return newValue;
    });
  }, [charLimit]);

  // changing
  const handleCharLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCharLimit(isNaN(value) ? null : value);
  };

  // Clear text
  const clearText = useCallback(() => {
    setText('');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 10);
  }, []);

  const toggleAllLetters = useCallback(() => {
    setShowAllLetters(prev => !prev);
  }, []);

  const copyTextToClipboard = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';

        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }
    });
  }, [text]);

  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(prev => {
      const newState = !prev;
      setFocusTraps({ trapModal: newState });

      if (newState) {
        setTimeout(() => {
          closeModalBtnRef.current?.focus();
        }, 50);
      } else {
        setTimeout(() => {
          keyboardShortcutsBtnRef.current?.focus();
        }, 50);
      }

      return newState;
    });
  }, []);

  // Handle tab key press 
  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      return;
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'l':
          e.preventDefault();
          toggleTheme();
          break;
        case 'e':
          e.preventDefault();
          setExcludeSpaces(prev => !prev);
          break;
        case 'c':
          if (window.getSelection()?.toString() === '') {
            e.preventDefault();
            copyTextToClipboard();
          }
          break;
        case 'x':
          if (window.getSelection()?.toString() === '') {
            e.preventDefault();
            clearText();
          }
          break;
        case 'k':
          e.preventDefault();
          toggleKeyboardShortcuts();
          break;
        case 'm':
          e.preventDefault();
          toggleAllLetters();
          break;
        case ';':
          e.preventDefault();
          handleCharLimitToggle();
          break;
        default:
          break;
      }
    } else if (e.key === '?' && e.shiftKey) {
      e.preventDefault();
      toggleKeyboardShortcuts();
    } else if (e.key === 'Escape') {
      if (showKeyboardShortcuts) {
        e.preventDefault();
        toggleKeyboardShortcuts();
      }
    } else if (e.key === 'Tab' && showKeyboardShortcuts) {
      if (focusTraps.trapModal) {
        const modal = document.querySelector('.keyboard-shortcuts-content');
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  }, [
    toggleTheme,
    copyTextToClipboard,
    clearText,
    toggleKeyboardShortcuts,
    toggleAllLetters,
    handleCharLimitToggle,
    showKeyboardShortcuts,
    focusTraps.trapModal
  ]);

  useEffect(() => {
 
  }, [handleKeyDown]);

// /--------------------------------------------------`-----------------------------------
  //  i make it for u to expalin navigating by keyboard 
  //  but u can using tabs only to can navigate through
  // const keyboardShortcuts: KeyboardShortcut[] = [
  //   { key: 'Tab / Shift+Tab', description: 'Navigate between interactive elements' },
  //   { key: 'Enter / Space', description: 'Activate buttons or toggle checkboxes' },
  //   { key: 'Ctrl/Cmd + L', description: 'Toggle Light/Dark Mode', action: toggleTheme },
  //   { key: 'Ctrl/Cmd + E', description: 'Toggle Exclude Spaces', action: () => setExcludeSpaces(prev => !prev) },
  //   { key: 'Ctrl/Cmd + C', description: 'Copy Text', action: copyTextToClipboard },
  //   { key: 'Ctrl/Cmd + X', description: 'Clear Text', action: clearText },
  //   { key: 'Ctrl/Cmd + K', description: 'Show/Hide Keyboard Shortcuts', action: toggleKeyboardShortcuts },
  //   { key: 'Ctrl/Cmd + M', description: 'Show/Hide All Letters', action: toggleAllLetters },
  //   { key: 'Ctrl/Cmd + ;', description: 'Toggle Character Limit', action: handleCharLimitToggle },
  //   { key: 'Shift + ?', description: 'Show/Hide Keyboard Shortcuts', action: toggleKeyboardShortcuts },
  //   { key: 'Escape', description: 'Close Keyboard Shortcuts', action: () => setShowKeyboardShortcuts(false) },
  // ];
// /--------------------------------------------------`-----------------------------------

  const displayedLetterFrequency = showAllLetters ? letterFrequency : letterFrequency.slice(0, 5);

  return (
    <div className={`app ${theme}`} onKeyDown={handleKeyDown}>

      <div className="container py-4">
        <header className="d-flex justify-content-between align-items-center mb-4" role="banner">
          <div className="d-flex align-items-center">
            <div className="logo me-2" role="img" aria-label="Character Counter Logo">📊</div>
            <h1 className="mb-0" tabIndex={0}>Character Counter</h1>
          </div>
          <nav aria-label="Application Controls">
            <button
              className="btn btn-outline-secondary me-2"
              id="copyBtn"
              ref={copyBtnRef}
              onClick={copyTextToClipboard}
              aria-label="Copy text"
              title="Copy text (Ctrl/Cmd + C)"
              tabIndex={0}
            >
              <span role="img" aria-hidden="true">📋</span>
            </button>
            <button
              className="btn btn-outline-secondary me-2"
              ref={clearBtnRef}
              onClick={clearText}
              aria-label="Clear text"
              title="Clear text (Ctrl/Cmd + X)"
              tabIndex={0}
            >
              <span role="img" aria-hidden="true">🧹</span>
            </button>
            {/* <button
              className="btn btn-outline-secondary me-2"
              ref={keyboardShortcutsBtnRef}
              onClick={toggleKeyboardShortcuts}
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (Shift + ?)"
              tabIndex={0}
            >
              <span role="img" aria-hidden="true">⌨️</span>
            </button> */}
            <button
              className="btn btn-outline-secondary"
              ref={themeBtnRef}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme (Ctrl/Cmd + L)"
              tabIndex={0}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </nav>
        </header>

        <main id="main-content">
          <h1  className="text-center mb-4 head" tabIndex={0}>Analyze your text<br />in real-time.</h1>

          <div className="card mb-4">
            <div className="card-body">
              <label htmlFor="textInput" className="visually-hidden">Enter your text</label>
              <textarea
                id="textInput"
                className="form-control mb-3"
                rows={5}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Enter your text here..."
                aria-label="Text input for analysis"
                tabIndex={0}
                ref={textareaRef}
                autoFocus
              ></textarea>

              {exceedsLimit && (
                <div className="alert alert-warning" role="alert" tabIndex={0}>
                  Your text exceeds the character limit of {charLimit}!
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center mb-2">
                <div className="form-check me-3 mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="excludeSpaces"
                    checked={excludeSpaces}
                    onChange={() => setExcludeSpaces(prev => !prev)}
                    title="Ctrl/Cmd + E"
                    tabIndex={0}
                    ref={excludeSpacesRef}
                    aria-label="Exclude spaces from character count"
                  />
                  <label className="form-check-label" htmlFor="excludeSpaces">
                    Exclude Spaces
                  </label>
                </div>

                <div className="form-check me-3 mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="setCharLimit"
                    checked={hasCharLimit}
                    onChange={handleCharLimitToggle}
                    title="Ctrl/Cmd + ;"
                    tabIndex={0}
                    ref={charLimitRef}
                    aria-label="Set character limit"
                  />
                  <label className="form-check-label" htmlFor="setCharLimit">
                    Set Character Limit
                  </label>
                </div>

                {hasCharLimit && (
                  <div className="input-group mb-2" style={{ maxWidth: '200px' }}>
                    <label htmlFor="charLimitInput" className="visually-hidden">Character limit</label>
                    <input
                      id="charLimitInput"
                      type="number"
                      className="form-control"
                      value={charLimit || ''}
                      onChange={handleCharLimitChange}
                      placeholder="Limit"
                      aria-label="Character limit"
                      min="1"
                      tabIndex={0}
                      ref={charLimitInputRef}
                    />
                    <span className="input-group-text">chars</span>
                  </div>
                )}

                <div className="ms-auto mb-2">
                  <small tabIndex={0} aria-live="polite">Approx. reading time: {readingTime}</small>
                </div>
              </div>
            </div>
          </div>

          <section aria-label="Text statistics">
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="card h-100 bg-primary text-white">
                  <div className="card-body text-center">
                    <h2 className="display-4" tabIndex={0} aria-live="polite">{charCount}</h2>
                    <p className="card-text" tabIndex={0}>Total Characters</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 bg-warning">
                  <div className="card-body text-center">
                    <h2 className="display-4" tabIndex={0} aria-live="polite">{wordCount}</h2>
                    <p className="card-text" tabIndex={0}>Word Count</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 bg-danger text-white">
                  <div className="card-body text-center">
                    <h2 className="display-4" tabIndex={0} aria-live="polite">{sentenceCount}</h2>
                    <p className="card-text" tabIndex={0}>Sentence Count</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="letter-density-heading">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="mb-0 h5" tabIndex={0} id="letter-density-heading"style={{color:"darkgrey"}}>Letter Density</h2>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={toggleAllLetters}
                  title="Ctrl/Cmd + M"
                  tabIndex={0}
                  ref={showAllLettersBtnRef}
                  aria-label={showAllLetters ? "Show less letters" : "Show all letters"}
                >
                  {showAllLetters ? 'Show Less' : 'Show All'}
                </button>
              </div>
              <div className="card-body">
                {displayedLetterFrequency.map((item, index) => (
                  <div key={item.letter} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-uppercase" tabIndex={0}>{item.letter}</span>
                      <span tabIndex={0}>{item.count} ({item.percentage})</span>
                    </div>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-valuenow={parseFloat(item.percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Letter ${item.letter}: ${item.count} occurrences, ${item.percentage} of text`}
                      tabIndex={0}
                    >
                      <div
                        className="progress-bar"
                        style={{ width: item.percentage }}
                      ></div>
                    </div>
                  </div>
                ))}
                {!showAllLetters && letterFrequency.length > 5 && (
                  <button
                    className="btn btn-link p-0"
                    onClick={toggleAllLetters}
                    tabIndex={0}
                    ref={seeMoreBtnRef}
                    aria-label="See more letters"
                  >
                    See more
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <div
            className="keyboard-shortcuts-modal"
            role="dialog"
            aria-labelledby="keyboardShortcutsTitle"
            aria-modal="true"
          >
            <div className="keyboard-shortcuts-content card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="mb-0 h5" id="keyboardShortcutsTitle" tabIndex={0}>Keyboard Shortcuts</h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close keyboard shortcuts"
                  onClick={toggleKeyboardShortcuts}
                  tabIndex={0}
                  ref={closeModalBtnRef}
                ></button>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col" tabIndex={0}>Shortcut</th>
                      <th scope="col" tabIndex={0}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {keyboardShortcuts.map((shortcut, index) => (
                      <tr key={index}>
                        <td><kbd tabIndex={0}>{shortcut.key}</kbd></td>
                        <td tabIndex={0}>{shortcut.description}</td>
                      </tr>
                    ))} */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
