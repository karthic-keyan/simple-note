import React from 'react';

interface WordCounterProps {
  text: string;
}

function countWords(str: string): number {
  let count = 0;
  let inWord = false;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Non-whitespace character
    if (code > 32) {
      if (!inWord) {
        count++;
        inWord = true;
      }
    } else {
      inWord = false;
    }
  }
  return count;
}

export const WordCounter: React.FC<WordCounterProps> = React.memo(({ text }) => {
  const words = countWords(text);
  const chars = text.length;
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="flex items-center space-x-3 px-6 py-1.5 border-t border-editor-borderLight dark:border-editor-borderDark text-[11px] text-slate-400 dark:text-slate-500 bg-white dark:bg-editor-dark select-none flex-shrink-0">
      <span>{words} {words === 1 ? 'word' : 'words'}</span>
      <span>•</span>
      <span>{chars} characters</span>
      <span>•</span>
      <span>{readMinutes} min read</span>
    </div>
  );
});
