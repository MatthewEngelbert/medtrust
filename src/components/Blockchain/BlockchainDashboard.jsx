import React, { useState, useEffect, useRef } from 'react';
import NetworkNode from '../../lib/blockchain/NetworkNode';
import BlockCard from './BlockCard';
import './BlockchainDashboard.css'; // We will create this

const BlockchainDashboard = () => {
    const [nodes, setNodes] = useState([]);
    const [logs, setLogs] = useState([]);
    const [patientName, setPatientName] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [isMining, setIsMining] = useState(false);

    // Use ref to keep track of nodes without re-rendering on every internal change
    // But we need state to render the UI. 
    // Strategy: The 'nodes' state will hold the instances. We need to force update when they change.
    const [version, setVersion] = useState(0);

    useEffect(() => {
        initializeNetwork();
    }, []);

    const addLog = (msg) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

    const initializeNetwork = () => {
        const newNodes = [];
        const nodeCount = 5;

        // Define the network callback
        const handleBroadcast = (senderId, block) => {
            addLog(`Node ${senderId} broadcasting Block #${block.index}...`);

            // Simulate network delay
            setTimeout(() => {
                newNodes.forEach(node => {
                    if (node.id !== senderId) {
                        node.receiveBlock(block);
                    }
                });
                addLog(`Network synchronized.`);
                setVersion(v => v + 1); // Trigger re-render
            }, 500); // 500ms delay for visual effect
        };

        for (let i = 1; i <= nodeCount; i++) {
            newNodes.push(new NetworkNode(i, handleBroadcast));
        }

        setNodes(newNodes);
        addLog("Network initialized with 5 nodes.");
    };

    const handleMine = async () => {
        if (!patientName || !diagnosis) return alert("Please fill in patient data");

        setIsMining(true);
        addLog("Mining started on Node 1...");

        const data = {
            patient: patientName,
            diagnosis: diagnosis,
            doctor: "Dr. Simulation"
        };

        // Use setTimeout to allow UI to update (show loading) before blocking with heavy math
        setTimeout(() => {
            // Simulate Node 1 being the miner
            const minerNode = nodes[0];
            minerNode.mine(data); // This is synchronous and heavy-ish

            setIsMining(false);
            setPatientName("");
            setDiagnosis("");
            setVersion(v => v + 1);
        }, 100);
    };

    return (
        <div className="blockchain-dashboard p-6 bg-gray-100 min-h-screen">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-2">MedTrust Blockchain Network</h1>
                <p className="text-gray-600">Simulasi Jaringan 5-Node Proof-of-Work untuk Data Rekam Medis</p>
            </header>

            {/* Input Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto border-t-4 border-blue-500">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Medical Record (Mining)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Patient Name"
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                    />
                    <input
                        className="p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Diagnosis"
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleMine}
                    disabled={isMining}
                    className={`mt-4 w-full p-3 text-white font-bold rounded shadow transition-colors
            ${isMining ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isMining ? 'Mining Block (Calculating Hash)...' : 'Mine & Broadcast Block'}
                </button>
            </div>

            {/* Network Visualization */}
            <div className="overflow-x-auto pb-4">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Network Simulation Status</h3>
                <div className="flex flex-col space-y-8">
                    {nodes.map(node => (
                        <div key={node.id} className="bg-white p-4 rounded-lg shadow border-l-8 border-indigo-500">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                                    {node.id}
                                </div>
                                <h3 className="font-bold text-lg">Node {node.id} Chain</h3>
                                <span className="ml-auto text-sm bg-gray-200 px-2 py-1 rounded">Height: {node.getChain().chain.length}</span>
                            </div>
                            <div className="flex space-x-4 overflow-x-auto p-2 bg-gray-50 rounded inner-shadow">
                                {node.getChain().chain.map((block) => (
                                    <BlockCard key={block.hash} block={block} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logs */}
            <div className="mt-8 bg-black text-green-400 p-4 rounded shadow-lg font-mono text-sm h-64 overflow-y-auto">
                <h4 className="border-b border-gray-700 pb-2 mb-2">Network Traffic Logs</h4>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
};

export default BlockchainDashboard;
