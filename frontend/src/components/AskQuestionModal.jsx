import React from "react";
import { X } from "lucide-react";

export default function AskQuestionModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl p-10 rounded-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-cyan-600 mb-6">
          Ask a Question
        </h2>

        <form className="space-y-6">
          <div>
            <label className="font-semibold">
              Name <span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full border rounded-xl px-4 py-3" />
          </div>

          <div>
            <label className="font-semibold">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full border rounded-xl px-4 py-3"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your email address will not be published.
            </p>
          </div>

          <div>
            <label className="font-semibold">
              Your inquiry <span className="text-red-500">*</span>
            </label>
            <textarea rows="4" className="w-full border rounded-xl px-4 py-3" />
          </div>

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
