import React, { useEffect, useState } from "react";
import api from "../api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const NoteModal = ({ isOpen, onClose, note, onSave }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    // AI functions

    const handleSummarize = async () => {
        try {
            if (!description.trim()) return setError("Write something to summarize");

            setLoadingAI(true);
            const token = localStorage.getItem("token");

            const { data } = await api.post(
                "/api/ai/summarize",
                { text: description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setDescription(data.summary.trim());
        } catch {
            setError("AI summarize failed");
        } finally {
            setLoadingAI(false);
        }
    };

    const handleGenerateTitle = async () => {
        if (!description.trim()) return setError("Write note first");

        setLoadingAI(true);
        const token = localStorage.getItem("token");

        const { data } = await api.post(
            "/api/ai/generate-title",
            { text: description },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setTitle(data.title.trim());
        setLoadingAI(false);
    };

    const handleGrammar = async () => {
        setLoadingAI(true);
        const token = localStorage.getItem("token");

        const { data } = await api.post(
            "/api/ai/grammar",
            { text: description },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setDescription(data.text.trim());
        setLoadingAI(false);
    };

    const handleTranslate = async () => {
        const language = prompt("Translate to which language?");
        if (!language) return;

        setLoadingAI(true);
        const token = localStorage.getItem("token");

        const { data } = await api.post(
            "/api/ai/translate",
            { text: description, language },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setDescription(data.text.trim());

        setLoadingAI(false);
    };

    // export pdf

    const handleExportPDF = async () => {
        try {
            const element = document.getElementById("note-content");

            if (!element) {
                alert("Nothing to export");
                return;
            }

            await document.fonts.ready;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
            pdf.save(`${title || "note"}.pdf`);
        } catch (err) {
            console.log(err);
            alert("Export failed – check console");
        }
    };

    // load data 

    useEffect(() => {
        setTitle(note ? note.title : "");
        setDescription(note ? note.description : "");
        setError("");
    }, [note]);

    // auto save

    useEffect(() => {
        if (!note?._id) return;

        const delay = setTimeout(async () => {
            try {
                const token = localStorage.getItem("token");
                await api.put(
                    `/api/notes/${note._id}`,
                    { title, description },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch {
                console.log("Auto save failed");
            }
        }, 1500);

        return () => clearTimeout(delay);
    }, [title, description]);

    // submit

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const payload = { title, description };
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (note) {
                const { data } = await api.put(
                    `/api/notes/${note._id}`,
                    payload,
                    config
                );
            } else {
                const { data } = await api.post("/api/notes", payload, config);
            }
            onSave();
            onClose();
        } catch {
            setError("Failed to save note");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-linear-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">

            <div className="w-full max-w-2xl sm:max-w-2xl rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-5 sm:p-5 transition-all duration-500">

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5 sm:mb-6 tracking-wide">
                    {note ? "Edit Note" : "Create Note"}
                </h2>

                {error && <p className="text-red-400 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title..."
                        className="w-full px-3 py-2 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-cyan-400 outline-none transition-all duration-300 text-sm sm:text-base"
                        required
                    />

                    {/* content export */}
                    <div id="note-content" style={{ position: "fixed", left: "-9999px", top: "0", width: "800px", background: "#ffffff", padding: "20px", borderRadius: "8px" }} > <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}> {title} </h2> <p style={{ whiteSpace: "pre-wrap" }}>{description}</p> </div>


                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write your note here..."
                        rows={8}
                        className="w-full px-4 py-4.5 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-pink-400 outline-none transition-all duration-300 text-sm sm:text-base"
                        required
                    />

                    <div className="flex flex-wrap gap-2 sm:gap-3">

                        {[
                            ["AI Title", handleGenerateTitle, "from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700"],
                            ["AI Fix Grammar", handleGrammar, "from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700"],
                            ["AI Translate", handleTranslate, "from-pink-400 to-rose-600 hover:from-pink-500 hover:to-rose-700"],
                            ["AI Summarize", handleSummarize, "from-purple-400 to-violet-600 hover:from-purple-500 hover:to-violet-700"],
                            ["Export PDF", handleExportPDF, "from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"]
                        ].map(([text, action, colors]) => (
                            <button
                                key={text}
                                type="button"
                                onClick={action}
                                className={`px-3 sm:px-4 py-2 sm:py-2 rounded-full text-xs sm:text-sm text-white font-medium bg-linear-to-r ${colors} hover:shadow-none hover:cursor-pointer transition-all duration-200`}
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 flex-wrap">

                        <button
                            type="submit"
                            className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white text-sm sm:text-base font-semibold hover:shadow-none hover:cursor-pointer transition-all duration-200"
                        >
                            {note ? "Update" : "Create"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-white/20 text-white border border-white/20 hover:bg-white/30 text-sm sm:text-base transition-all duration-200 hover:cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NoteModal;


