import React, { useState } from 'react';

const MatrixEvaluation = ({
    type = 'score',  // 'score' or 'yesno'
    questions = [],
    attempts = [],
    onAddAttempt,
    onUpdateCell,
    readOnly = false // Default to false
}) => {

    // Helper helper to get color for score
    const getScoreColor = (val) => {
        if (!val && val !== 0) return 'bg-white border-surface-200';
        if (val < 3) return 'bg-red-50 text-red-600 border-red-200 font-bold';
        if (val === 5) return 'bg-green-50 text-green-700 border-green-200 font-bold';
        return 'bg-white text-surface-800 border-surface-200';
    };

    const getYNColor = (val) => {
        if (val === 'Y') return 'bg-green-50 text-green-700 border-green-200 font-bold';
        if (val === 'N') return 'bg-red-50 text-red-600 border-red-200 font-bold';
        return 'bg-white border-surface-200';
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-card border border-surface-100 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-surface-100 bg-surface-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                        {type === 'score' ? 'Numeric Evaluation (0-5)' : 'Competency Check (Yes/No)'}
                    </span>
                </div>
                {!readOnly && (
                    <button
                        onClick={onAddAttempt}
                        className="btn-primary text-sm py-2 shadow-glow"
                    >
                        + New Evaluation
                    </button>
                )}
            </div>

            {/* Scrollable Matrix */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-surface-50 shadow-sm">
                        <tr>
                            <th className="p-4 min-w-[300px] font-bold text-surface-600 text-sm border-b border-surface-200">
                                Competency / Parameter
                            </th>
                            {attempts.map((attempt, idx) => (
                                <th key={idx} className="p-3 min-w-[140px] text-center border-b border-surface-200 group relative">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs font-semibold text-surface-500 uppercase">Attempt {attempt.attemptNumber}</span>
                                        <span className="text-[10px] text-surface-400 font-normal">
                                            {new Date(attempt.attemptDate).toLocaleDateString()}
                                        </span>

                                        {/* Display Extra Metadata if available (Surgery specifics) */}
                                        {attempt.patientName && (
                                            <div className="text-[10px] text-surface-600 bg-surface-100 px-1 rounded">
                                                Pt: {attempt.patientName}
                                            </div>
                                        )}
                                        {attempt.grade && (
                                            <div className="text-[10px] font-bold text-primary-600">
                                                Grade: {attempt.grade}
                                            </div>
                                        )}

                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${attempt.status === 'ACKNOWLEDGED'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : attempt.status === 'TEMPORARY'
                                                ? 'bg-red-100 text-red-700 border-red-200'
                                                : 'bg-orange-100 text-orange-700 border-orange-200'
                                            }`}>
                                            {attempt.status === 'PENDING_ACK' ? 'Pending' : attempt.status}
                                        </div>
                                    </div>
                                    {/* Vertical Divider Logic could go here */}
                                    <div className="absolute right-0 top-2 bottom-2 w-px bg-surface-100" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                        {questions.map((q) => (
                            <tr key={q.key} className="hover:bg-surface-50/50 transition-colors">
                                <td className="p-4 text-sm font-medium text-surface-700 border-r border-surface-100 bg-surface-50/30">
                                    {q.label}
                                </td>
                                {attempts.map((attempt, idx) => {
                                    const answer = attempt.answers.find(a => a.itemKey === q.key) || {};
                                    const val = type === 'score' ? answer.scoreValue : answer.ynValue; // normalize field use 'value' eventually
                                    const remark = answer.remark || '';

                                    // Highlight if needs remark (Low score)
                                    const needsRemark = type === 'score' ? (val && val < 3) : (val === 'N');

                                    return (
                                        <td key={`${idx}-${q.key}`} className="p-2 border-r border-surface-100 relative group">
                                            <div className="flex flex-col gap-2">
                                                {/* Input Area */}
                                                <div className="flex justify-center">
                                                    {type === 'score' ? (
                                                        <input
                                                            type="number"
                                                            min="0" max="5"
                                                            disabled={readOnly}
                                                            className={`w-12 h-10 text-center rounded-lg border focus:ring-2 focus:ring-primary-200 outline-none transition-all ${getScoreColor(val)} ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                            value={val !== undefined ? val : ''}
                                                            onChange={(e) => onUpdateCell(idx, q.key, 'scoreValue', e.target.value)}
                                                        />
                                                    ) : (

                                                        <div className="flex gap-2 justify-center">
                                                            <label className={`cursor-pointer px-3 py-1.5 rounded-md border text-xs font-bold transition-all ${val === 'Y' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white border-surface-200 hover:bg-surface-50'} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`${idx}-${q.key}`}
                                                                    value="Y"
                                                                    checked={val === 'Y'}
                                                                    onChange={() => !readOnly && onUpdateCell(idx, q.key, 'ynValue', 'Y')}
                                                                    className="hidden"
                                                                />
                                                                YES
                                                            </label>
                                                            <label className={`cursor-pointer px-3 py-1.5 rounded-md border text-xs font-bold transition-all ${val === 'N' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white border-surface-200 hover:bg-surface-50'} ${readOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                                                                <input
                                                                    type="radio"
                                                                    name={`${idx}-${q.key}`}
                                                                    value="N"
                                                                    checked={val === 'N'}
                                                                    onChange={() => !readOnly && onUpdateCell(idx, q.key, 'ynValue', 'N')}
                                                                    className="hidden"
                                                                />
                                                                NO
                                                            </label>
                                                        </div>
                                                    )}

                                                </div>

                                                {/* Remark Area - Conditional or Always visible on hover? */}
                                                {/* Show if value exists */}
                                                {
                                                    (val !== undefined && val !== '') && (
                                                        <input
                                                            type="text"
                                                            disabled={readOnly}
                                                            placeholder={needsRemark ? "Remark Required*" : "Remark..."}
                                                            className={`w-full text-xs p-1.5 rounded border outline-none focus:border-primary-400 transition-colors ${needsRemark && !remark
                                                                ? 'border-red-300 bg-red-50 placeholder-red-400'
                                                                : 'border-transparent bg-transparent hover:bg-white hover:border-surface-200'
                                                                } ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                            value={remark}
                                                            onChange={(e) => onUpdateCell(idx, q.key, 'remark', e.target.value)}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    {/* Overall Remarks Footer */}
                    <tfoot className="bg-surface-50 border-t border-surface-200 sticky bottom-0 z-10 shadow-lg shadow-surface-900/5">
                        <tr>
                            <td className="p-4 font-bold text-surface-600 text-sm border-r border-surface-200">
                                Overall Feedback
                            </td>
                            {attempts.map((attempt, idx) => (
                                <td key={`foot-${idx}`} className="p-2 border-r border-surface-200">
                                    <textarea
                                        rows="2"
                                        disabled={readOnly}
                                        placeholder="Overall summary..."
                                        className={`w-full text-xs p-2 rounded border border-surface-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none resize-none bg-white ${readOnly ? 'opacity-70 cursor-not-allowed bg-gray-50' : ''}`}
                                        value={attempt.remarksOverall || ''}
                                        onChange={(e) => onUpdateCell(idx, 'OVERALL', 'remarksOverall', e.target.value)}
                                    />
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div >
        </div >
    );
};

export default MatrixEvaluation;
