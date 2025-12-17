import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';

const StepsDisplay = ({ steps }) => {
  const [expandedSteps, setExpandedSteps] = useState([0]); // Expand first step by default

  if (!steps || steps.length === 0) {
    return null;
  }

  const toggleStep = (index) => {
    setExpandedSteps(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
      <div className="mb-4">
        <h3 className="font-bold text-xl text-gray-800 mb-1">🔍 Phân tích ý định của bạn</h3>
        <p className="text-sm text-gray-500">AI hiểu bạn muốn ăn gì từng bước</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.includes(index);
          const { intent, candidates } = step;

          return (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Step Header */}
              <button
                onClick={() => toggleStep(index)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800">{intent.keyword || 'Không xác định'}</p>
                    {intent.district && (
                      <p className="text-xs text-gray-500">📍 {intent.district}</p>
                    )}
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {/* Candidates */}
              {isExpanded && (
                <div className="p-4 space-y-2 bg-white">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    {candidates.length} gợi ý tìm thấy
                  </p>
                  {candidates.slice(0, 5).map((candidate, cIndex) => (
                    <div
                      key={cIndex}
                      className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={candidate.avatar_url || 'https://placehold.co/100x100/E0E0E0/999?text=No+Image'}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/100x100/E0E0E0/999?text=No+Image';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate">{candidate.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin size={10} />
                          {candidate.address}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {candidate.avg_rating > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{candidate.avg_rating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex gap-1 text-[10px]">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold">
                              Sem: {(candidate.semantic_score * 100).toFixed(0)}%
                            </span>
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-semibold">
                              TF: {(candidate.tfidf_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepsDisplay;
