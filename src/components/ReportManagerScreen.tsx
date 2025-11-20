import { useState, useEffect } from 'react';
import { FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface ReportFile {
  id: string;
  filename: string;
  description: string;
}

export function ReportManagerScreen() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);

  const reportFiles: ReportFile[] = [
    { id: '1', filename: 'Oct-30-25-report.csv', description: 'Client Records' },
    { id: '2', filename: 'inventory-summary.csv', description: 'Monthly Inventory Summary' },
    { id: '3', filename: 'volunteer-hours.csv', description: 'Volunteer Hours Log' },
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsProcessing(false), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleOpenInSheets = () => {
    // Simulated action
    window.open('https://docs.google.com/spreadsheets/', '_blank');
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200">
          <h1 className="text-gray-900">Report Manager</h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            {/* Document Scanning Visual */}
            <div className="bg-white rounded-lg p-8 shadow-lg mb-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {/* Document icon with scanning animation */}
                  <div className="relative">
                    <FileText className="w-24 h-24 text-blue-600" />
                    {/* Scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="h-1 bg-blue-400 opacity-60 animate-pulse"
                        style={{
                          position: 'absolute',
                          top: `${progress}%`,
                          left: 0,
                          right: 0,
                          transition: 'top 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-gray-900 text-center mb-2">
                  Scanning documents to generate CSV file...
                </p>
                <p className="text-gray-500 text-center">
                  Processing your data
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-gray-900">{progress}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Report Manager</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Success Message */}
        <Card className="bg-green-50 border-green-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-green-900">Spreadsheets are ready!</h3>
              <p className="text-green-800 mt-1">
                Your reports have been generated successfully
              </p>
            </div>
          </div>
        </Card>

        {/* Report Files */}
        <div className="space-y-3">
          <h2 className="text-gray-700 mb-3">Generated Reports</h2>
          {reportFiles.map((file) => (
            <Card
              key={file.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900">{file.filename}</h3>
                  <p className="text-gray-600 mt-1">{file.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <Button
          onClick={handleOpenInSheets}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Open in Sheets
        </Button>
      </div>
    </div>
  );
}
