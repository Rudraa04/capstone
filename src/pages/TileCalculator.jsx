import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const TileCalculator = ({ onClose }) => {
  const [tileSize, setTileSize] = useState('48x24');
  const [roomLength, setRoomLength] = useState('');
  const [roomWidth, setRoomWidth] = useState('');
  const [boxesNeeded, setBoxesNeeded] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const tileSizes = {
    '48x24': 2,
    '12x12': 9,
    '32x32': 2,
    '12x18': 6
  };

  // ✅ Check Firebase auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe(); // Clean up listener
  }, []);

  const calculateBoxes = (e) => {
    e.preventDefault();

    // ✅ Block if user not logged in
    if (!isLoggedIn) {
      alert("You have to signup/login to use this feature.");
      return;
    }

    const length = parseFloat(roomLength);
    const width = parseFloat(roomWidth);
    const tilesPerBox = tileSizes[tileSize];

    if (length <= 0 || width <= 0 || isNaN(length) || isNaN(width)) {
      alert('Please enter valid room dimensions.');
      return;
    }

    const roomAreaSqFt = length * width;
    const [tileLength, tileWidth] = tileSize.split('x').map(Number);
    const tileAreaSqFt = (tileLength * tileWidth) / 144;
    const tilesNeeded = Math.ceil(roomAreaSqFt / tileAreaSqFt);
    const boxes = Math.ceil(tilesNeeded / tilesPerBox);

    setBoxesNeeded(boxes);
  };

  const resetForm = () => {
    setRoomLength('');
    setRoomWidth('');
    setBoxesNeeded(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Tile Calculator</h1>
      <form onSubmit={calculateBoxes} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Tile Size</label>
          <select
            value={tileSize}
            onChange={(e) => setTileSize(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="48x24">48x24 inches (2 tiles per box)</option>
            <option value="12x12">12x12 inches (9 tiles per box)</option>
            <option value="32x32">32x32 inches (2 tiles per box)</option>
            <option value="12x18">12x18 inches (6 tiles per box)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Length (ft)</label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              min="0"
              step="0.1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Width (ft)</label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              min="0"
              step="0.1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 20"
              required
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Calculate Boxes
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="w-full bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </form>

      {boxesNeeded !== null && (
        <div className="mt-6 text-center text-lg font-semibold text-gray-800">
          You need {boxesNeeded} boxes (excluding wastage).
        </div>
      )}

      {/* Optional Close Button */}
      {/* <button
        onClick={onClose}
        className="mt-6 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Close
      </button> */}
    </div>
  );
};

export default TileCalculator;
