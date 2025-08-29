
import React, { useMemo } from 'react';
import type { BeatData } from '../types';

interface BeatVisualizerProps {
  beatData: BeatData;
}

export const BeatVisualizer: React.FC<BeatVisualizerProps> = ({ beatData }) => {
  const srcDocContent = useMemo(() => {
    const dataString = JSON.stringify(beatData);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
            
            :root {
              --accent-color: #ff4a00; /* Orange accent */
              --off-white: #fcfcfc;
              --light-gray: #f3f4f6;
              --medium-gray: #e5e7eb;
              --dark-gray: #374151;
              --text-gray: #6b7280;
              --black: #111827;
              --white: #ffffff;
            }

            body, html { 
              margin: 0; 
              padding: 0; 
              background-color: transparent; 
              font-family: 'Inter', sans-serif;
              color: var(--dark-gray);
            }
            
            /* --- Custom Theme --- */

            /* Main container of the DAW */
            .daw-container {
              background-color: var(--white);
              border-radius: 1rem !important;
              border: none !important;
              overflow: hidden;
            }

            /* Header Controls Area */
            .controls-container {
              background-color: var(--white);
              border-bottom: 1px solid var(--light-gray);
              padding: 0.5rem 1rem !important;
              display: grid !important;
              grid-template-columns: auto minmax(0,1fr) auto auto;
              gap: 1rem;
              align-items: center;
            }

            /* Play Button */
            .play-pause-button {
              background-color: transparent !important;
              color: var(--accent-color) !important; /* SVG color */
              width: 32px;
              height: 32px;
              padding: 0 !important;
              border-radius: 9999px;
            }
            .play-pause-button:hover {
              background-color: var(--light-gray) !important;
            }
            .play-pause-button svg {
              width: 20px;
              height: 20px;
              color: var(--accent-color);
            }

            /* Black pill for time, scrubber, and BPM */
            .scrubber-container {
              background: var(--black);
              border-radius: 9999px;
              padding: 0.5rem 1.25rem;
              display: grid;
              grid-template-columns: auto 1fr auto;
              align-items: center;
              gap: 1rem;
              min-width: 240px;
            }

            .time-display, .bpm-display {
              color: var(--white);
              font-family: monospace;
              font-size: 1rem;
              font-weight: 500;
              white-space: nowrap;
            }
            
            .bpm-display .label {
                display: none;
            }

            .scrubber-track {
              background-image: linear-gradient(to right, #6b7280 2px, transparent 2px);
              background-size: 6px 1px;
              height: 1px;
              width: 100%;
            }
            .playhead-handle {
                display: none;
            }

            /* Undo/Redo buttons */
            .undo-button, .redo-button {
              background: transparent !important;
              color: var(--text-gray) !important;
              border-radius: 9999px;
              padding: 0.5rem !important;
            }
            .undo-button:hover, .redo-button:hover {
              background-color: var(--light-gray) !important;
            }

            /* Track Headers */
            .track-header {
              background-color: var(--off-white);
              border-right: 1px solid var(--accent-color);
              font-weight: 500;
              color: var(--dark-gray);
            }

            /* Grid & Steps */
            .steps-grid {
              background-color: var(--white);
            }
            .step .dot {
              background-color: var(--white) !important;
              border: 1px solid var(--light-gray) !important;
              box-shadow: none !important;
            }
            .step:hover .dot {
              border-color: var(--medium-gray) !important;
              background-color: var(--light-gray) !important;
            }
            .step--on .dot {
              background-color: var(--white) !important;
              border: 1px solid var(--medium-gray) !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.07);
            }

            /* Playhead */
            .playhead {
              background-color: var(--accent-color) !important;
              width: 2px !important;
            }

            /* Grid Lines */
            .bar-line { background-color: var(--medium-gray) !important; }
            .beat-line { background-color: var(--light-gray) !important; }

          </style>
          <link rel='stylesheet' href='https://persistent.oaistatic.com/ecosystem-built-assets/daw-602c.css'>
        </head>
        <body>
          <div id='daw-root'></div>
          <script>
            window.dawData = ${dataString};
          </script>
          <script type='module' src='https://persistent.oaistatic.com/ecosystem-built-assets/daw-602c.js'></script>
        </body>
      </html>
    `;
  }, [beatData]);
  
  const trackCount = beatData.tracks.length;
  const headerHeight = 60; // Approx height for controls
  const trackRowHeight = 45; // Approx height for each track row
  const calculatedHeight = Math.max(250, Math.min(400, headerHeight + trackCount * trackRowHeight));

  return (
      <iframe
        srcDoc={srcDocContent}
        sandbox="allow-scripts allow-same-origin"
        className="w-full border-none"
        style={{ height: `${calculatedHeight}px` }}
        title="Beat Visualizer"
      ></iframe>
  );
};
