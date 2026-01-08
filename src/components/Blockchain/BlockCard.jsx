import React, { useState } from 'react';

const BlockCard = ({ block }) => {
    const [expanded, setExpanded] = useState(false);

    // Simple check for valid hash (assuming difficulty 2)
    const isValid = block.hash.startsWith("00");
    const borderColor = isValid ? "border-green-500" : "border-red-500";
    const bgColor = isValid ? "bg-green-50" : "bg-red-50";

    return (
        <div className={`p-4 m-2 border-2 rounded-lg shadow-md ${borderColor} ${bgColor} w-64 transition-all`}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg">Block #{block.index}</h4>
                <span className="text-xs text-gray-500">{new Date(block.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="space-y-1 text-sm font-mono break-all">
                <div><span className="font-semibold">Hash:</span> {block.hash.substring(0, 10)}...</div>
                <div><span className="font-semibold">Prev:</span> {block.previousHash.substring(0, 10)}...</div>
                <div><span className="font-semibold">Nonce:</span> {block.nonce}</div>
            </div>

            <div className="mt-2 text-xs">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    {expanded ? "Hide Data" : "Show Data"}
                </button>

                {expanded && (
                    <div className="mt-1 p-2 bg-white rounded border overflow-auto max-h-32">
                        <pre className="text-xs">{JSON.stringify(block.data, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockCard;
