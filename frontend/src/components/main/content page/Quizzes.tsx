/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  IoCheckmark,
  IoClose,
  IoRefresh,
  IoPlay,
  IoStop,
  IoBookmark,
  IoTime,
  IoTrophy,
} from "react-icons/io5";
import { BiTargetLock } from "react-icons/bi";
import { useContent } from "../../../hooks/useContent";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
}

const Quizzes = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<{ [key: number]: number }>(
    {}
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizType, setQuizType] = useState<"practice" | "timed" | "challenge">(
    "practice"
  );
  const [difficulty, setDifficulty] = useState<
    "mixed" | "easy" | "medium" | "hard"
  >("mixed");

  const namespace = `${user?.id}:${filename}`;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Auto-generate quiz when content is available
  useEffect(() => {
    if (filename && user?.id) {
      generateQuiz();
    }
  }, [filename, user?.id]);

  const generateQuiz = async () => {
    if (!filename || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const difficultyPrompt =
        difficulty === "mixed"
          ? "Mix of easy, medium, and hard questions"
          : `Focus on ${difficulty} difficulty questions`;

      const response = await axios.post(
        `http://localhost:5000/v1/search`,
        {
          query: `Based on the uploaded content, create a comprehensive quiz with 10-12 multiple choice questions. ${difficultyPrompt}. Each question should test understanding of key concepts, facts, and important details from the content. Format your response as a JSON array where each question has: "question" (the question text), "options" (array of 4 possible answers), "correctAnswer" (index 0-3 of the correct option), "explanation" (brief explanation of why the answer is correct), "difficulty" (easy/medium/hard), and "category" (topic area). Make questions challenging but fair, covering different topics from the content. Return only valid JSON without any additional text.`,
          namespace: namespace,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      let quizData = [];
      try {
        const cleanResponse = response.data.aiResponse;
        quizData = JSON.parse(cleanResponse);
      } catch (parseError) {
        quizData = extractQuizFromText(response.data.aiResponse);
        console.warn(
          "Failed to parse JSON, falling back to text extraction",
          parseError
        );
      }

      if (Array.isArray(quizData) && quizData.length > 0) {
        const formattedQuestions = quizData
          .map((q, index) => ({
            id: index + 1,
            question: q.question || "",
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer:
              typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            explanation: q.explanation || "",
            difficulty: q.difficulty || "medium",
            category: q.category || "General",
          }))
          .filter((q) => q.question && q.options.length >= 4);

        setQuestions(formattedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setQuestionTimes({});
      } else {
        setError("No quiz questions could be generated from the content.");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extractQuizFromText = (text: string) => {
    const questions = [];
    const lines = text.split("\n");
    let currentQuestion = null;

    for (const line of lines) {
      if (line.includes("?")) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line.trim(),
          options: [] as string[],
          correctAnswer: 0,
          explanation: "",
          difficulty: "medium",
          category: "General",
        };
      } else if (line.trim().match(/^[A-D]\)/) && currentQuestion) {
        currentQuestion.options.push(line.trim().substring(2));
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimerActive(true);
    setTimeElapsed(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuestionStartTime(Date.now());
    setQuestionTimes({});
    setShowExplanation(false);
  };

  const selectAnswer = (answerIndex: number) => {
    if (showResults) return;

    const timeSpent = Date.now() - questionStartTime;
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestionIndex]: timeSpent,
    }));

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));

    // Show explanation immediately for practice mode
    if (quizType === "practice") {
      setShowExplanation(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now());
      setShowExplanation(false);
    }
  };

  const finishQuiz = () => {
    setTimerActive(false);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setShowResults(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeElapsed(0);
    setTimerActive(false);
    setQuestionTimes({});
    setShowExplanation(false);
  };

  const calculateScore = () => {
    let correct = 0;
    let totalTime = 0;

    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
      totalTime += questionTimes[index] || 0;
    });

    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      averageTimePerQuestion: Math.round(totalTime / questions.length / 1000),
      totalTime: Math.round(totalTime / 1000),
    };
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🥇";
    if (percentage >= 70) return "🥈";
    if (percentage >= 60) return "🥉";
    return "📚";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-[#fafafa80]";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <CgSpinner size={48} className="animate-spin mb-4" />
        <h2 className="text-xl mb-2">Generating Quiz...</h2>
        <p className="text-[#fafafa80]">Creating questions from your content</p>
        <div className="mt-4 w-48 bg-[#fafafa20] rounded-full h-2">
          <div
            className="bg-[#fafafa] h-2 rounded-full animate-pulse"
            style={{ width: "60%" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <div className="text-red-400 mb-4 text-center">
          <IoClose size={48} className="mx-auto mb-2" />
          <p className="text-lg mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={generateQuiz}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <BiTargetLock size={64} className="mb-4 text-[#fafafa60]" />
        <p className="text-lg mb-4">No content available for quiz</p>
        <p className="text-sm text-[#fafafa80] mb-6">
          Upload content to generate a quiz
        </p>
        <button
          onClick={generateQuiz}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Generate Quiz</span>
        </button>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa] p-6">
        <BiTargetLock size={64} className="mb-6 text-[#fafafa]" />
        <h1 className="text-3xl font-bold mb-4">Quiz Ready!</h1>
        <div className="text-center mb-8">
          <p className="text-lg mb-2">{questions.length} Questions Available</p>
          <p className="text-[#fafafa80]">Test your knowledge of the content</p>
        </div>

        {/* Quiz Settings */}
        <div className="bg-[#fafafa1a] rounded-lg p-6 mb-8 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Quiz Type</label>
            <select
              value={quizType}
              onChange={(e) =>
                setQuizType(
                  e.target.value as "practice" | "timed" | "challenge"
                )
              }
              className="w-full bg-[#fafafa20] border border-[#fafafa30] 
              rounded-lg px-3 py-2 text-[#fafafa]"
            >
              <option value="practice">Practice (with explanations)</option>
              <option value="timed">Timed Challenge</option>
              <option value="challenge">Final Test</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(
                  e.target.value as "mixed" | "easy" | "medium" | "hard"
                )
              }
              className="w-full bg-[#fafafa20] border border-[#fafafa30]
               rounded-lg px-3 py-2 text-[#fafafa]"
            >
              <option value="mixed">Mixed Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={startQuiz}
            className="flex items-center space-x-2 bg-[#fafafa] text-black px-6 py-3 rounded-lg hover:bg-[#fafafa90] transition-colors font-semibold"
          >
            <IoPlay size={20} />
            <span>Start Quiz</span>
          </button>
          <button
            onClick={generateQuiz}
            className="flex items-center space-x-2 border border-[#fafafa30] px-6 py-3 rounded-lg hover:bg-[#fafafa1a] transition-colors"
          >
            <IoRefresh size={20} />
            <span>New Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const scoreEmoji = getScoreEmoji(score.percentage);

    return (
      <div
        className="flex flex-col h-full p-6 text-[#fafafa] overflow-y-auto
      scrollbar-thin"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{scoreEmoji}</div>
          <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>
          <div className="text-6xl font-bold mb-4 text-[#fafafa]">
            {score.percentage}%
          </div>
          <p className="text-xl mb-2">
            {score.correct} out of {score.total} correct
          </p>
          <div className="flex justify-center space-x-6 text-[#fafafa80]">
            <div className="flex items-center space-x-1">
              <IoTime size={16} />
              <span>Time: {formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <IoTrophy size={16} />
              <span>Avg: {score.averageTimePerQuestion}s/question</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 mb-6">
          {questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const timeSpent = questionTimes[index]
              ? Math.round(questionTimes[index] / 1000)
              : 0;

            return (
              <div
                key={question.id}
                className="border border-[#fafafa1a] rounded-lg p-6"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div
                    className={`p-1 rounded-full ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isCorrect ? (
                      <IoCheckmark size={16} />
                    ) : (
                      <IoClose size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        Question {index + 1}: {question.question}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span
                          className={getDifficultyColor(
                            question.difficulty as string
                          )}
                        >
                          {question.difficulty}
                        </span>
                        <span className="text-[#fafafa60]">•</span>
                        <span className="text-[#fafafa80]">{timeSpent}s</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? "border-green-500 bg-green-500/10"
                              : optionIndex === userAnswer && !isCorrect
                              ? "border-red-500 bg-red-500/10"
                              : "border-[#fafafa20]"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {optionIndex === question.correctAnswer && (
                              <IoCheckmark
                                size={16}
                                className="text-green-500"
                              />
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <IoClose size={16} className="text-red-500" />
                            )}
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-[#fafafa1a] rounded-lg">
                        <div className="flex items-start space-x-2">
                          <IoBookmark
                            size={16}
                            className="text-[#fafafa80] mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Explanation:
                            </p>
                            <p className="text-sm text-[#fafafa80]">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={resetQuiz}
            className="flex items-center space-x-2 bg-[#fafafa] text-black px-6 py-3 rounded-lg hover:bg-[#fafafa90] transition-colors"
          >
            <IoRefresh size={20} />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={generateQuiz}
            className="flex items-center space-x-2 border border-[#fafafa30] px-6 py-3 rounded-lg hover:bg-[#fafafa1a] transition-colors"
          >
            <IoRefresh size={20} />
            <span>New Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full p-6 text-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <div className="flex items-center space-x-4 text-[#fafafa80]">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span
              className={getDifficultyColor(
                currentQuestion.difficulty as string
              )}
            >
              {currentQuestion.difficulty}
            </span>
            <span>{currentQuestion.category}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono">{formatTime(timeElapsed)}</div>
          <button
            onClick={resetQuiz}
            className="text-sm text-[#fafafa80] hover:text-[#fafafa] flex items-center space-x-1"
          >
            <IoStop size={14} />
            <span>Stop Quiz</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#fafafa20] rounded-full h-2 mb-8">
        <div
          className="bg-[#fafafa] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div
        className="flex-1 flex flex-col max-w-4xl mx-auto w-full
        overflow-y-auto scrollbar-thin p-1"
      >
        <h2 className="text-2xl font-semibold mb-8 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(index)}
              disabled={
                selectedAnswers[currentQuestionIndex] !== undefined &&
                quizType !== "practice"
              }
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswers[currentQuestionIndex] === index
                  ? "border-[#fafafa] bg-[#fafafa1a]"
                  : "border-[#fafafa20] hover:border-[#fafafa40] hover:bg-[#fafafa05]"
              } ${
                selectedAnswers[currentQuestionIndex] !== undefined &&
                quizType !== "practice"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? "border-[#fafafa] bg-[#fafafa] text-black"
                      : "border-[#fafafa40]"
                  } flex-shrink-0`}
                >
                  {selectedAnswers[currentQuestionIndex] === index && (
                    <IoCheckmark size={14} />
                  )}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation for practice mode */}
        {showExplanation &&
          currentQuestion.explanation &&
          quizType === "practice" && (
            <div className="mb-6 p-4 bg-[#fafafa1a] rounded-lg border border-[#fafafa20]">
              <div className="flex items-start space-x-2">
                <IoBookmark size={16} className="text-[#fafafa80] mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Explanation:</p>
                  <p className="text-sm text-[#fafafa80]">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 rounded-lg border border-[#fafafa30] hover:bg-[#fafafa1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? "bg-[#fafafa]"
                    : selectedAnswers[index] !== undefined
                    ? "bg-[#fafafa60]"
                    : "bg-[#fafafa20]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="px-6 py-2 rounded-lg bg-[#fafafa] text-black hover:bg-[#fafafa90] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
