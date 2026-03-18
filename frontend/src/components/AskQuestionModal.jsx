import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function AskQuestionModal({ onClose }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post("http://localhost:5000/api/ask-question", {
        name,
        email,
        question
      });

      alert("Question sent to admin");
      onClose();

    } catch (err) {
      alert("Failed to send question");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">

      <div className="bg-white w-full max-w-xl p-10 rounded-xl relative">

        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <h2 className="text-2xl font-bold text-cyan-600 mb-6">
          Ask a Question
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Name"
            className="w-full border rounded-xl px-4 py-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <textarea
            rows="4"
            placeholder="Your inquiry"
            className="w-full border rounded-xl px-4 py-3"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-black text-white px-10 py-3 rounded-lg"
          >
            SUBMIT
          </button>

        </form>
      </div>
    </div>
  );
}