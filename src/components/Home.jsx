import React, { useEffect, useState } from "react";
import api from "../api/axios";
import NoteModal from "./NoteModal";
import { useLocation } from "react-router-dom";

const Home = () => {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState("");
    const [editNote, setEditNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No authentication token found. Please log in");
                return;
            }

            const searchParams = new URLSearchParams(location.search);
            const search = searchParams.get("search") || "";

            const { data } = await api.get("/api/notes", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const notesArray = Array.isArray(data) ? data : data.notes || [];

            const filteredNotes = search
                ? notesArray.filter(note =>
                    note.title?.toLowerCase().includes(search.toLowerCase()) ||
                    note.description?.toLowerCase().includes(search.toLowerCase())
                )
                : notesArray;

            setNotes(filteredNotes);
        } catch {
            setError("Failed to fetch notes");
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [location.search]);

    const handleEdit = note => {
        setEditNote(note);
        setIsModalOpen(true);
    };

    const handleSaveNote = async () => {
        setEditNote(null);
        setIsModalOpen(false);
        await fetchNotes();
    };

    const handleDelete = async id => {
        try {
            const token = localStorage.getItem("token");
            await api.delete(`/api/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(prev => prev.filter(n => n._id !== id));
        } catch {
            setError("Failed to delete note");
        }
    };

    const handlePin = async id => {
        try {
            const token = localStorage.getItem("token");
            await api.put(`/api/notes/pin/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotes();
        } catch {
            setError("Pin failed");
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-violet-100 to-blue-100">
            <div className="max-w-7xl mx-auto p-9 sm:p-6 lg:p-8">


                {error && (
                    <p className="text-red-500 mb-4">{error}</p>
                )}

                <NoteModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditNote(null);
                    }}
                    note={editNote}
                    onSave={handleSaveNote}
                />

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="
          fixed bottom-6 right-6 z-9
          w-14 h-14 rounded-full
          flex items-center justify-center
          text-white
          bg-linear-to-br from-violet-500 to-indigo-500
          shadow-[0_6px_20px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.15)]
          backdrop-blur
          transition-all duration-200
          hover:-translate-y-0.5 hover:scale-[1.03] hover:brightness-110
          active:translate-y-0.5 active:scale-95
          hover:cursor-pointer

        "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>

                <div
                    className="
        grid pt-5 mt-6 gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
         "
                >
                    {notes.map(note => (
                        <div
                            key={note._id}
                            className="
        relative p-4 sm:p-5.5 rounded-[22px]
        bg-white/20
        backdrop-blur-[18px] backdrop-saturate-150
        border border-white/40
        shadow-[0_10px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.15)]
        transition-all duration-200
        hover:shadow-[0_25px_60px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.5)]
      "
                        >
                            <div
                                className="
          pointer-events-none absolute inset-0 rounded-[22px]
          bg-linear-to-br from-white/50 via-white/10 to-transparent
          opacity-30
        "
                            />

                            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
                                {note.title}
                            </h3>

                            <p className="text-gray-700 line-clamp-4">
                                {note.description}
                            </p>

                            <p className="text-xs text-gray-500 mt-3 mb-4">
                                {note.updatedAt
                                    ? new Date(note.updatedAt).toLocaleString()
                                    : ""}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleEdit(note)}
                                    className="
            px-4 py-1.5 rounded-xl text-white font-medium
            bg-linear-to-r from-yellow-400 to-yellow-700
            hover:from-yellow-500 hover:to-yellow-800
            hover:cursor-pointer
          "
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(note._id)}
                                    className="
            px-4 py-1.5 rounded-xl text-white font-medium
            bg-linear-to-r from-red-400 to-red-600
            hover:from-red-500 hover:to-red-700
            hover:cursor-pointer
          "
                                >
                                    Delete
                                </button>

                                <button
                                    onClick={() => handlePin(note._id)}
                                    className="
            px-4 py-1.5 rounded-xl text-white font-medium
            bg-linear-to-r from-purple-400 to-purple-700
            hover:from-purple-500 hover:to-purple-800
            hover:cursor-pointer
          "
                                >
                                    {note.isPinned ? "Unpin" : "Pin"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>


            <footer className="mt-16 pb-7 text-center text-sm text-gray-500">
                <p>
                    © {new Date().getFullYear()} <span className="font-medium">NoteAI</span> · AI-Powered Notes App
                </p>
            </footer>

        </div>

    );



};

export default Home;