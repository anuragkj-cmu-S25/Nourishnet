import { useState } from 'react';
import { X, Camera } from 'lucide-react';

interface CameraScannerScreenProps {
  onClose: () => void;
  onCapture: () => void;
}

export function CameraScannerScreen({ onClose, onCapture }: CameraScannerScreenProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate camera capture and analysis
    setTimeout(() => {
      setIsCapturing(false);
      onCapture();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera View Simulation */}
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Simulated camera feed with subtle animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 animate-pulse" />
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-white">Scan Item</h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Center Frame Guide */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="relative w-full max-w-sm aspect-square">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white rounded-br-lg" />
            
            {/* Instruction Text */}
            <div className="absolute -top-16 left-0 right-0 text-center">
              <p className="text-white bg-black/40 backdrop-blur-sm py-2 px-4 rounded-lg inline-block">
                Center the item in the frame
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Analyzing...</p>
            </div>
          </div>
        )}

        {/* Shutter Button */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex justify-center">
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-4 border-gray-300"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
