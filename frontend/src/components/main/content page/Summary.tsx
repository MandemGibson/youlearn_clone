/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  IoDocumentText,
  IoRefresh,
  IoCopy,
  IoCheckmark,
  IoDownload,
  IoEye,
  IoContract,
  IoExpand,
  IoBookmarks,
  IoTime,
  IoText,
} from "react-icons/io5";
import { BiHighlight } from "react-icons/bi";
import { useContent } from "../../../hooks/useContent";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSummary,
  selectSummaryLoading,
  selectSummaryError,
  selectSummaryType,
  selectSummaryNamespace,
  setSummaryType,
  setSummaryLoading,
  setSummaryError,
  setSummaryData,
  setSummaryNamespace,
} from "../../../redux/slices/summarySlice";

interface SummaryData {
  executiveSummary: string;
  keyPoints: string[];
  mainTopics: string[];
  conclusions: string[];
  actionItems?: string[];
  wordCount: number;
  readingTime: number;
}

const Summary = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const dispatch = useDispatch();
  const summary = useSelector(selectSummary) as SummaryData | null;
  const loading = useSelector(selectSummaryLoading);
  const error = useSelector(selectSummaryError);
  const summaryType = useSelector(selectSummaryType);
  const generatedFor = useSelector(selectSummaryNamespace);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    executive: true,
    keyPoints: true,
    topics: false,
    conclusions: false,
    actions: false,
  });

  useEffect(() => {
    if (filename && user?.id) {
      const ns = `${user.id}:${filename}:${summaryType}`;
      if (generatedFor !== ns) {
        generateSummary(ns);
      }
    }
  }, [filename, user?.id, summaryType, generatedFor]);

  const generateSummary = async (nsOverride?: string) => {
    if (!filename || !user?.id) return;
    const ns = nsOverride || `${user.id}:${filename}:${summaryType}`;
    dispatch(setSummaryLoading(true));
    dispatch(setSummaryError(null));

    try {
      const response = await axios.post(
        `http://localhost:5000/v1/generate/summary`,
        { namespace: `${user.id}:${filename}`, type: summaryType },
        { headers: { "Content-Type": "application/json" } }
      );
      let summaryData = response.data.summary || null;
      const raw = response.data.raw || response.data.aiResponse || null;
      try {
        if (raw && typeof raw === "string") {
          const cleanResponse = raw.replace(/```json|```/g, "").trim();
          summaryData = JSON.parse(cleanResponse);
        }
      } catch (parseError) {
        if (raw && typeof raw === "string") {
          summaryData = extractSummaryFromText(raw);
        }
        console.error(
          "Failed to parse JSON response, using fallback:",
          parseError
        );
      }

      if (summaryData) {
        dispatch(
          setSummaryData({
            executiveSummary: summaryData.executiveSummary || "",
            keyPoints: Array.isArray(summaryData.keyPoints)
              ? summaryData.keyPoints
              : [],
            mainTopics: Array.isArray(summaryData.mainTopics)
              ? summaryData.mainTopics
              : [],
            conclusions: Array.isArray(summaryData.conclusions)
              ? summaryData.conclusions
              : [],
            actionItems: Array.isArray(summaryData.actionItems)
              ? summaryData.actionItems
              : [],
            wordCount: summaryData.wordCount || 0,
            readingTime: summaryData.readingTime || 0,
          })
        );
        dispatch(setSummaryNamespace(ns));
      } else {
        dispatch(
          setSummaryError("Could not generate summary from the content.")
        );
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      dispatch(
        setSummaryError("Failed to generate summary. Please try again.")
      );
    } finally {
      dispatch(setSummaryLoading(false));
    }
  };

  const extractSummaryFromText = (text: string) => {
    if (!text || typeof text !== "string")
      return {
        executiveSummary: "Summary not available",
        keyPoints: [],
        mainTopics: ["General Content"],
        conclusions: [],
        actionItems: [],
        wordCount: 0,
        readingTime: 0,
      };
    // Fallback text parsing
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    return {
      executiveSummary: lines[0] || "Summary not available",
      keyPoints: lines.slice(1, 6),
      mainTopics: ["General Content"],
      conclusions: lines.slice(-3),
      actionItems: [],
      wordCount: text.split(/\s+/).length,
      readingTime: Math.ceil(text.split(/\s+/).length / 200),
    };
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = async () => {
    if (!summary) return;

    const summaryText = `
SUMMARY

Executive Summary:
${summary.executiveSummary}

Key Points:
${summary.keyPoints.map((point) => `• ${point}`).join("\n")}

Main Topics:
${summary.mainTopics.map((topic) => `• ${topic}`).join("\n")}

Conclusions:
${summary.conclusions.map((conclusion) => `• ${conclusion}`).join("\n")}

${
  summary.actionItems && summary.actionItems.length > 0
    ? `
Action Items:
${summary.actionItems.map((item) => `• ${item}`).join("\n")}
`
    : ""
}

Document Stats:
• Word Count: ${summary.wordCount}
• Reading Time: ${summary.readingTime} minutes
    `.trim();

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const downloadSummary = () => {
    if (!summary) return;

    const summaryText = `
DOCUMENT SUMMARY
Generated on: ${new Date().toLocaleDateString()}

Executive Summary:
${summary.executiveSummary}

Key Points:
${summary.keyPoints.map((point) => `• ${point}`).join("\n")}

Main Topics:
${summary.mainTopics.map((topic) => `• ${topic}`).join("\n")}

Conclusions:
${summary.conclusions.map((conclusion) => `• ${conclusion}`).join("\n")}

${
  summary.actionItems && summary.actionItems.length > 0
    ? `
Action Items:
${summary.actionItems.map((item) => `• ${item}`).join("\n")}
`
    : ""
}

Document Statistics:
• Word Count: ${summary.wordCount}
• Estimated Reading Time: ${summary.readingTime} minutes
    `.trim();

    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${filename || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <CgSpinner size={48} className="animate-spin mb-4" />
        <h2 className="text-xl mb-2">Generating Summary...</h2>
        <p className="text-[#fafafa80]">
          Analyzing content and extracting key insights
        </p>
        <div className="mt-4 w-48 bg-[#fafafa20] rounded-full h-2">
          <div
            className="bg-[#fafafa] h-2 rounded-full animate-pulse"
            style={{ width: "40%" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <div className="text-red-400 mb-4 text-center">
          <IoDocumentText size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-lg mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => generateSummary()}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <IoDocumentText size={64} className="mb-4 text-[#fafafa60]" />
        <p className="text-lg mb-4">No content available for summary</p>
        <p className="text-sm text-[#fafafa80] mb-6">
          Upload content to generate a summary
        </p>
        <button
          onClick={() => generateSummary()}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Generate Summary</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto scrollbar-thin text-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <IoDocumentText size={28} />
            <span>Summary</span>
          </h1>
          <p className="text-[#fafafa80]">
            Key insights and takeaways from your content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={summaryType}
            onChange={(e) =>
              setSummaryType(
                e.target.value as "brief" | "detailed" | "executive"
              )
            }
            className="bg-[#fafafa20] border border-[#fafafa30] rounded-lg px-3 py-2 text-[#fafafa] text-sm"
          >
            <option value="brief">Brief Summary</option>
            <option value="detailed">Detailed Analysis</option>
            <option value="executive">Executive Summary</option>
          </select>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoText size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {summary.wordCount.toLocaleString()}
          </div>
          <div className="text-sm text-[#fafafa80]">Words</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoTime size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">{summary.readingTime}</div>
          <div className="text-sm text-[#fafafa80]">Min Read</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoBookmarks size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {summary.keyPoints.length}
          </div>
          <div className="text-sm text-[#fafafa80]">Key Points</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          {copied ? <IoCheckmark size={18} /> : <IoCopy size={18} />}
          <span>{copied ? "Copied!" : "Copy Summary"}</span>
        </button>
        <button
          onClick={downloadSummary}
          className="flex items-center space-x-2 border border-[#fafafa30] px-4 py-2 rounded-lg hover:bg-[#fafafa1a] transition-colors"
        >
          <IoDownload size={18} />
          <span>Download</span>
        </button>
        <button
          onClick={() => generateSummary()}
          className="flex items-center space-x-2 border border-[#fafafa30] px-4 py-2 rounded-lg hover:bg-[#fafafa1a] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Summary Content */}
      <div className="flex-1 space-y-6">
        {/* Executive Summary */}
        <div className="border border-[#fafafa1a] rounded-lg p-6">
          <button
            onClick={() => toggleSection("executive")}
            className="flex items-center justify-between w-full mb-4 text-left"
          >
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <BiHighlight size={20} />
              <span>Executive Summary</span>
            </h2>
            {expandedSections.executive ? (
              <IoContract size={18} />
            ) : (
              <IoExpand size={18} />
            )}
          </button>
          {expandedSections.executive && (
            <p className="text-[#fafafa] leading-relaxed">
              {summary.executiveSummary}
            </p>
          )}
        </div>

        {/* Key Points */}
        <div className="border border-[#fafafa1a] rounded-lg p-6">
          <button
            onClick={() => toggleSection("keyPoints")}
            className="flex items-center justify-between w-full mb-4 text-left"
          >
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <IoBookmarks size={20} />
              <span>Key Points</span>
            </h2>
            {expandedSections.keyPoints ? (
              <IoContract size={18} />
            ) : (
              <IoExpand size={18} />
            )}
          </button>
          {expandedSections.keyPoints && (
            <ul className="space-y-3">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#fafafa] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-[#fafafa]">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Topics */}
        <div className="border border-[#fafafa1a] rounded-lg p-6">
          <button
            onClick={() => toggleSection("topics")}
            className="flex items-center justify-between w-full mb-4 text-left"
          >
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <IoText size={20} />
              <span>Main Topics</span>
            </h2>
            {expandedSections.topics ? (
              <IoContract size={18} />
            ) : (
              <IoExpand size={18} />
            )}
          </button>
          {expandedSections.topics && (
            <div className="flex flex-wrap gap-2">
              {summary.mainTopics.map((topic, index) => (
                <span
                  key={index}
                  className="bg-[#fafafa2a] px-3 py-1 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Conclusions */}
        <div className="border border-[#fafafa1a] rounded-lg p-6">
          <button
            onClick={() => toggleSection("conclusions")}
            className="flex items-center justify-between w-full mb-4 text-left"
          >
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <IoEye size={20} />
              <span>Conclusions</span>
            </h2>
            {expandedSections.conclusions ? (
              <IoContract size={18} />
            ) : (
              <IoExpand size={18} />
            )}
          </button>
          {expandedSections.conclusions && (
            <ul className="space-y-3">
              {summary.conclusions.map((conclusion, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#fafafa80] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-[#fafafa]">{conclusion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Items */}
        {summary.actionItems && summary.actionItems.length > 0 && (
          <div className="border border-[#fafafa1a] rounded-lg p-6">
            <button
              onClick={() => toggleSection("actions")}
              className="flex items-center justify-between w-full mb-4 text-left"
            >
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <IoCheckmark size={20} />
                <span>Action Items</span>
              </h2>
              {expandedSections.actions ? (
                <IoContract size={18} />
              ) : (
                <IoExpand size={18} />
              )}
            </button>
            {expandedSections.actions && (
              <ul className="space-y-3">
                {summary.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-4 h-4 border-2 border-[#fafafa80] rounded mt-1 flex-shrink-0" />
                    <span className="text-[#fafafa]">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
