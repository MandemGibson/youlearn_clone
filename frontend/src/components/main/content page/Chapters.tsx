/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  IoRefresh,
  IoChevronDown,
  IoChevronForward,
  IoTime,
  IoText,
  IoList,
  IoSearch,
  IoFilter,
  IoDocument,
} from "react-icons/io5";
import {} from "react-icons/bi";
import { useContent } from "../../../hooks/useContent";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";
import { apiUrl } from "../../../entity";
import { PiBookOpenLight } from "react-icons/pi";

interface Chapter {
  id: number;
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  startPage?: number;
  endPage?: number;
  wordCount: number;
  readingTime: number;
  subsections?: {
    title: string;
    summary: string;
  }[];
}

interface ChapterData {
  chapters: Chapter[];
  totalChapters: number;
  documentStructure: string;
  navigationTips: string[];
}

const Chapters = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "short" | "medium" | "long"
  >("all");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "detailed">(
    "list"
  );

  const namespace = user?.id + filename;

  useEffect(() => {
    if (filename && user?.id) {
      generateChapters();
    }
  }, [filename, user?.id]);

  const generateChapters = async () => {
    if (!filename || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/v1/inference/?model_name=llama-3.3-70b-versatile`,
        {
          query: `Analyze the uploaded content and break it down into logical chapters or sections. Create a structured breakdown with the following JSON format: {
            "chapters": [
              {
                "id": 1,
                "title": "Chapter Title",
                "summary": "Brief chapter summary",
                "content": "Main content overview",
                "keyPoints": ["point1", "point2", ...],
                "startPage": 1,
                "endPage": 5,
                "wordCount": 500,
                "readingTime": 3,
                "subsections": [
                  {"title": "Subsection Title", "summary": "Subsection summary"}
                ]
              }
            ],
            "totalChapters": 5,
            "documentStructure": "Description of how the document is organized",
            "navigationTips": ["tip1", "tip2", ...]
          }. Identify natural breaks, themes, or existing chapter divisions. Return only valid JSON.`,
          namespace: namespace,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let parsedData = null;
      try {
        const cleanResponse = response.data.detail
          .replace(/```json|```/g, "")
          .trim();
        parsedData = JSON.parse(cleanResponse);
      } catch (parseError) {
        parsedData = extractChaptersFromText(response.data.detail);
        console.warn(
          "Failed to parse JSON, falling back to text extraction:",
          parseError
        );
      }

      if (parsedData && parsedData.chapters) {
        setChapterData({
          chapters: parsedData.chapters.map((chapter: any, index: number) => ({
            id: chapter.id || index + 1,
            title: chapter.title || `Chapter ${index + 1}`,
            summary: chapter.summary || "",
            content: chapter.content || "",
            keyPoints: Array.isArray(chapter.keyPoints)
              ? chapter.keyPoints
              : [],
            startPage: chapter.startPage,
            endPage: chapter.endPage,
            wordCount: chapter.wordCount || 0,
            readingTime:
              chapter.readingTime ||
              Math.ceil((chapter.wordCount || 500) / 200),
            subsections: chapter.subsections || [],
          })),
          totalChapters: parsedData.totalChapters || parsedData.chapters.length,
          documentStructure:
            parsedData.documentStructure || "Document structure analysis",
          navigationTips: Array.isArray(parsedData.navigationTips)
            ? parsedData.navigationTips
            : [],
        });

        // Auto-expand first chapter
        setExpandedChapters({ 0: true });
      } else {
        setError("Could not generate chapter breakdown from the content.");
      }
    } catch (err) {
      console.error("Error generating chapters:", err);
      setError("Failed to generate chapter breakdown. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extractChaptersFromText = (text: string) => {
    // Fallback text parsing
    const sections = text.split(/\n\s*\n/).filter((section) => section.trim());
    const chapters = sections.slice(0, 10).map((section, index) => ({
      id: index + 1,
      title: `Section ${index + 1}`,
      summary: section.substring(0, 200) + "...",
      content: section,
      keyPoints: [`Key point from section ${index + 1}`],
      wordCount: section.split(" ").length,
      readingTime: Math.ceil(section.split(" ").length / 200),
      subsections: [],
    }));

    return {
      chapters,
      totalChapters: chapters.length,
      documentStructure: "Auto-generated structure based on content breaks",
      navigationTips: [
        "Navigate through sections sequentially",
        "Use search to find specific topics",
      ],
    };
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const selectChapter = (chapterId: number) => {
    setSelectedChapter(selectedChapter === chapterId ? null : chapterId);
  };

  const getFilteredChapters = () => {
    if (!chapterData) return [];

    let filtered = chapterData.chapters;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chapter.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chapter.keyPoints.some((point) =>
            point.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply reading time filter
    if (filterType !== "all") {
      filtered = filtered.filter((chapter) => {
        if (filterType === "short") return chapter.readingTime <= 3;
        if (filterType === "medium")
          return chapter.readingTime > 3 && chapter.readingTime <= 8;
        if (filterType === "long") return chapter.readingTime > 8;
        return true;
      });
    }

    return filtered;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 1) return "< 1 min";
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <CgSpinner size={48} className="animate-spin mb-4" />
        <h2 className="text-xl mb-2">Analyzing Document Structure...</h2>
        <p className="text-[#fafafa80]">
          Breaking down content into chapters and sections
        </p>
        <div className="mt-4 w-48 bg-[#fafafa20] rounded-full h-2">
          <div
            className="bg-[#fafafa] h-2 rounded-full animate-pulse"
            style={{ width: "70%" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <div className="text-red-400 mb-4 text-center">
          <PiBookOpenLight size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-lg mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={generateChapters}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <PiBookOpenLight size={64} className="mb-4 text-[#fafafa60]" />
        <p className="text-lg mb-4">
          No content available for chapter analysis
        </p>
        <p className="text-sm text-[#fafafa80] mb-6">
          Upload content to generate chapter breakdown
        </p>
        <button
          onClick={generateChapters}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Generate Chapters</span>
        </button>
      </div>
    );
  }

  const filteredChapters = getFilteredChapters();

  return (
    <div className="flex flex-col h-full p-6 text-[#fafafa] overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <PiBookOpenLight size={28} />
            <span>Chapters</span>
          </h1>
          <p className="text-[#fafafa80]">
            Navigate through your document structure
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) =>
              setViewMode(e.target.value as "list" | "grid" | "detailed")
            }
            className="bg-[#fafafa20] border border-[#fafafa30] rounded-lg px-3 py-2 text-[#fafafa] text-sm"
          >
            <option value="list">List View</option>
            <option value="grid">Grid View</option>
            <option value="detailed">Detailed View</option>
          </select>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <PiBookOpenLight
            size={20}
            className="mx-auto mb-2 text-[#fafafa80]"
          />
          <div className="text-lg font-semibold">
            {chapterData.totalChapters}
          </div>
          <div className="text-sm text-[#fafafa80]">Chapters</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoText size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {chapterData.chapters
              .reduce((acc, ch) => acc + ch.wordCount, 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-[#fafafa80]">Total Words</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoTime size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {chapterData.chapters.reduce((acc, ch) => acc + ch.readingTime, 0)}
          </div>
          <div className="text-sm text-[#fafafa80]">Min Read</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoList size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">{filteredChapters.length}</div>
          <div className="text-sm text-[#fafafa80]">Showing</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <IoSearch
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#fafafa80]"
          />
          <input
            type="text"
            placeholder="Search chapters, summaries, or key points..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#fafafa20] border border-[#fafafa30] rounded-lg text-[#fafafa] placeholder-[#fafafa60] focus:outline-none focus:border-[#fafafa50]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <IoFilter size={18} className="text-[#fafafa80]" />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "all" | "short" | "medium" | "long"
              )
            }
            className="bg-[#fafafa20] border border-[#fafafa30] rounded-lg px-3 py-2 text-[#fafafa] text-sm"
          >
            <option value="all">All Lengths</option>
            <option value="short">Short (≤3 min)</option>
            <option value="medium">Medium (4-8 min)</option>
            <option value="long">{"Long (>8 min)"}</option>
          </select>
        </div>
      </div>

      {/* Document Structure Overview */}
      {chapterData.documentStructure && (
        <div className="bg-[#fafafa1a] rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
            <IoDocument size={20} />
            <span>Document Structure</span>
          </h3>
          <p className="text-[#fafafa80] text-sm">
            {chapterData.documentStructure}
          </p>
          {chapterData.navigationTips.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Navigation Tips:</h4>
              <ul className="text-xs text-[#fafafa70] space-y-1">
                {chapterData.navigationTips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-[#fafafa50]">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`bg-[#fafafa1a] rounded-lg p-4 cursor-pointer transition-all hover:bg-[#fafafa25] ${
                  selectedChapter === chapter.id
                    ? "ring-2 ring-[#fafafa50]"
                    : ""
                }`}
                onClick={() => selectChapter(chapter.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm truncate pr-2">
                    {chapter.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-[#fafafa80]">
                    <IoTime size={12} />
                    <span>{formatTime(chapter.readingTime)}</span>
                  </div>
                </div>
                <p className="text-xs text-[#fafafa80] line-clamp-3 mb-3">
                  {chapter.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-[#fafafa60]">
                  <span>{chapter.wordCount.toLocaleString()} words</span>
                  <span>{chapter.keyPoints.length} key points</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`bg-[#fafafa1a] rounded-lg transition-all ${
                  selectedChapter === chapter.id
                    ? "ring-2 ring-[#fafafa50]"
                    : ""
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-[#fafafa25] rounded-lg"
                  onClick={() => selectChapter(chapter.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChapter(chapter.id);
                        }}
                        className="text-[#fafafa80] hover:text-[#fafafa] transition-colors"
                      >
                        {expandedChapters[chapter.id] ? (
                          <IoChevronDown size={18} />
                        ) : (
                          <IoChevronForward size={18} />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {chapter.title}
                        </h3>
                        {viewMode === "detailed" && (
                          <p className="text-xs text-[#fafafa80] mt-1 line-clamp-2">
                            {chapter.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-[#fafafa80]">
                      {chapter.startPage && chapter.endPage && (
                        <span>
                          p. {chapter.startPage}-{chapter.endPage}
                        </span>
                      )}
                      <div className="flex items-center space-x-1">
                        <IoTime size={12} />
                        <span>{formatTime(chapter.readingTime)}</span>
                      </div>
                      <span>{chapter.wordCount.toLocaleString()} words</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedChapters[chapter.id] && (
                  <div className="px-4 pb-4 border-t border-[#fafafa20] pt-4">
                    {viewMode !== "detailed" && chapter.summary && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Summary</h4>
                        <p className="text-sm text-[#fafafa80]">
                          {chapter.summary}
                        </p>
                      </div>
                    )}

                    {chapter.keyPoints.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Key Points</h4>
                        <ul className="space-y-1">
                          {chapter.keyPoints.map((point, index) => (
                            <li
                              key={index}
                              className="text-sm text-[#fafafa80] flex items-start space-x-2"
                            >
                              <span className="text-[#fafafa50] mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {chapter.subsections && chapter.subsections.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Subsections
                        </h4>
                        <div className="space-y-2">
                          {chapter.subsections.map((subsection, index) => (
                            <div
                              key={index}
                              className="bg-[#fafafa10] rounded p-3"
                            >
                              <h5 className="text-sm font-medium mb-1">
                                {subsection.title}
                              </h5>
                              <p className="text-xs text-[#fafafa70]">
                                {subsection.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredChapters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#fafafa60]">
            <IoSearch size={48} className="mb-4" />
            <p className="text-lg mb-2">No chapters found</p>
            <p className="text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapters;
