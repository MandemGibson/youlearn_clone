/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  IoChevronBack,
  IoChevronForward,
  IoRefresh,
  IoEye,
  IoEyeOff,
} from "react-icons/io5";
import { BiShuffle } from "react-icons/bi";
import { useContent } from "../../../hooks/useContent";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";
import { apiUrl } from "../../../entity";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

const Flashcards = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const namespace = user?.id + filename;

  useEffect(() => {
    if (filename && user?.id && flashcards.length === 0) {
      generateFlashcards();
    }
  }, [filename, user?.id, flashcards.length]);

  const generateFlashcards = async () => {
    if (!filename || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/v1/inference/?model_name=llama-3.3-70b-versatile`,
        {
          query: `Based on the uploaded content, create comprehensive flashcards for study purposes. Generate 10-15 flashcards covering the key concepts, definitions, important facts, and main ideas. Format your response as a JSON array where each flashcard has a "question" and "answer" field. Make the questions clear and concise, and the answers detailed but not too lengthy. Focus on the most important and testable information. Return only valid JSON without any additional text or formatting.`,
          namespace: namespace,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Parse the response to extract flashcards
      let flashcardsData = [];
      try {
        // Try to parse as JSON first
        const cleanResponse = response.data.detail
          .replace(/```json|```/g, "")
          .trim();
        flashcardsData = JSON.parse(cleanResponse);
      } catch (parseError) {
        const responseText = response.data.detail;
        flashcardsData = extractFlashcardsFromText(responseText);
        console.warn(
          "Failed to parse JSON, falling back to text extraction",
          parseError
        );
      }

      if (Array.isArray(flashcardsData) && flashcardsData.length > 0) {
        const formattedFlashcards = flashcardsData.map((card, index) => ({
          id: index + 1,
          question: card.question || card.Q || card.front || "",
          answer: card.answer || card.A || card.back || "",
        }));
        setFlashcards(formattedFlashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setError("No flashcards could be generated from the content.");
      }
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to extract flashcards from text response
  const extractFlashcardsFromText = (text: string) => {
    const cards = [];
    const lines = text.split("\n");
    let currentCard = { question: "", answer: "" };
    let isAnswer = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.toLowerCase().includes("question") ||
        trimmed.startsWith("Q:")
      ) {
        if (currentCard.question && currentCard.answer) {
          cards.push({ ...currentCard });
        }
        currentCard = {
          question: trimmed.replace(/^(Question:|Q:)\s*/i, ""),
          answer: "",
        };
        isAnswer = false;
      } else if (
        trimmed.toLowerCase().includes("answer") ||
        trimmed.startsWith("A:")
      ) {
        currentCard.answer = trimmed.replace(/^(Answer:|A:)\s*/i, "");
        isAnswer = true;
      } else if (trimmed && isAnswer) {
        currentCard.answer += " " + trimmed;
      } else if (trimmed && !isAnswer && currentCard.question) {
        currentCard.question += " " + trimmed;
      }
    }

    if (currentCard.question && currentCard.answer) {
      cards.push(currentCard);
    }

    return cards.length > 0 ? cards : [];
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
    setIsFlipped(false);
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <CgSpinner size={48} className="animate-spin mb-4" />
        <h2 className="text-xl mb-2">Generating Flashcards...</h2>
        <p className="text-[#fafafa80]">
          Analyzing your content to create study cards
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <div className="text-red-400 mb-4 text-center">
          <p className="text-lg mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={generateFlashcards}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <p className="text-lg mb-4">No content available for flashcards</p>
        <button
          onClick={generateFlashcards}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Generate Flashcards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 text-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-[#fafafa80]">
            {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="p-2 rounded-lg hover:bg-[#fafafa1a] transition-colors"
            title={showAll ? "Hide all cards" : "Show all cards"}
          >
            {showAll ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </button>
          <button
            onClick={shuffleCards}
            className="p-2 rounded-lg hover:bg-[#fafafa1a] transition-colors"
            title="Shuffle cards"
          >
            <BiShuffle size={20} />
          </button>
          <button
            onClick={generateFlashcards}
            className="p-2 rounded-lg hover:bg-[#fafafa1a] transition-colors"
            title="Regenerate flashcards"
          >
            <IoRefresh size={20} />
          </button>
        </div>
      </div>

      {/* Flashcard Display */}
      {showAll ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 p-1">
          {flashcards.map((card, index) => (
            <div
              key={card.id}
              className="border border-[#fafafa1a] rounded-lg p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Question {index + 1}:
                </h3>
                <p className="text-[#fafafa90]">{card.question}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Answer:</h3>
                <p className="text-[#fafafa90]">{card.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Single Card View */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="flip-card-container relative w-full max-w-2xl h-80 cursor-pointer"
              onClick={flipCard}
            >
              <div
                className={`flip-card absolute inset-0 w-full h-full ${
                  isFlipped ? "flipped" : ""
                }`}
              >
                {/* Front of card (Question) */}
                <div className="flip-card-face absolute inset-0 w-full h-full bg-[#fafafa1a] border border-[#fafafa20] rounded-xl p-8 flex flex-col justify-center items-center">
                  <div className="text-sm text-[#fafafa60] mb-4">QUESTION</div>
                  <div className="text-xl text-center leading-relaxed">
                    {flashcards[currentIndex]?.question}
                  </div>
                  <div className="text-sm text-[#fafafa60] mt-8">
                    Click to reveal answer
                  </div>
                </div>

                {/* Back of card (Answer) */}
                <div className="flip-card-face flip-card-back absolute inset-0 w-full h-full bg-[#fafafa1a] border border-[#fafafa20] rounded-xl p-8 flex flex-col justify-center items-center">
                  <div className="text-sm text-[#fafafa60] mb-4">ANSWER</div>
                  <div className="text-lg text-center leading-relaxed">
                    {flashcards[currentIndex]?.answer}
                  </div>
                  <div className="text-sm text-[#fafafa60] mt-8">
                    Click to show question
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={prevCard}
              className="p-3 rounded-full bg-[#fafafa1a] hover:bg-[#fafafa20] transition-colors"
              disabled={flashcards.length <= 1}
            >
              <IoChevronBack size={24} />
            </button>

            <div className="text-center">
              <div className="text-sm text-[#fafafa80]">
                Card {currentIndex + 1} of {flashcards.length}
              </div>
              <div className="flex space-x-1 mt-2">
                {flashcards.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex ? "bg-[#fafafa]" : "bg-[#fafafa30]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={nextCard}
              className="p-3 rounded-full bg-[#fafafa1a] hover:bg-[#fafafa20] transition-colors"
              disabled={flashcards.length <= 1}
            >
              <IoChevronForward size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Flashcards;
