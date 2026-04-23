// src/components/survey/QuestionStep.jsx
import { useState } from 'react';

const SCALE_OPTIONS = [
  { value: 1, label: 'Tidak Ada / Tidak Pernah', color: 'bg-red-500' },
  { value: 2, label: 'Ada tapi belum optimal / Kadang', color: 'bg-orange-500' },
  { value: 3, label: 'Ada dan cukup baik / Sering', color: 'bg-yellow-500' },
  { value: 4, label: 'Ada dan sangat baik / Sangat Sering', color: 'bg-green-500' }
];

export default function QuestionStep({ 
  question, 
  currentStep, 
  totalSteps, 
  value, 
  onChange,
  onNext,
  onPrev 
}) {
  const [selectedValue, setSelectedValue] = useState(value || null);

  const handleSelect = (val) => {
    setSelectedValue(val);
    onChange(val);
  };

  const handleNext = () => {
    if (selectedValue !== null) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Pertanyaan {currentStep} dari {totalSteps}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Question Kode */}
          <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {question.kode}
          </div>

          {/* Variabel Name */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {question.variabel}
          </h2>

          {/* Question Text */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {question.indikator}
          </p>

          {/* Scale Type Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-700 font-medium">
              {question.tipe_skala}
            </p>
          </div>

          {/* Scale Options */}
          <div className="space-y-3">
            {SCALE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-200
                  ${selectedValue === option.value
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center">
                  {/* Radio Circle */}
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${selectedValue === option.value
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedValue === option.value && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="ml-4 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">{option.value}</span>
                      <span className="text-gray-600">-</span>
                      <span className="text-gray-700">{option.label}</span>
                    </div>
                  </div>

                  {/* Color Indicator */}
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Scale Info (Collapsible) */}
          {question.skala_detail && (
            <details className="mt-6">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Lihat penjelasan detail skala
              </summary>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
                {question.skala_detail}
              </div>
            </details>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onPrev}
            disabled={currentStep === 1}
            className={`
              flex-1 py-4 rounded-xl font-semibold transition-all
              ${currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }
            `}
          >
            ← Kembali
          </button>

          <button
            onClick={handleNext}
            disabled={selectedValue === null}
            className={`
              flex-1 py-4 rounded-xl font-semibold transition-all
              ${selectedValue === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {currentStep === totalSteps ? 'Review →' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>
  );
}
