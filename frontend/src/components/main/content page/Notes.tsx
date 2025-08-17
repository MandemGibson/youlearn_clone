/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  IoAdd,
  IoSearch,
  IoBookmark,
  IoBookmarkOutline,
  IoTrash,
  IoPencil,
  IoSave,
  IoClose,
  IoDocument,
  IoList,
  IoGrid,
  IoRefresh,
  IoText,
  IoCheckbox,
  IoFlag,
} from "react-icons/io5";
import { BiNote } from "react-icons/bi";
import { useContent } from "../../../hooks/useContent";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";
import { CiEdit } from "react-icons/ci";

interface Note {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  color: string;
  tags: string[];
  isPinned: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  sourceRef?: {
    page?: number;
    chapter?: string;
    section?: string;
  };
  type: "manual" | "highlight" | "summary" | "question" | "todo";
  priority: "low" | "medium" | "high";
}

interface NotesData {
  notes: Note[];
  totalNotes: number;
  categories: string[];
  autoSummary: string;
}

const Notes = () => {
  const { user } = useAuth();
  const { filename } = useContent();
  const [notesData, setNotesData] = useState<NotesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "manual" | "highlight" | "summary" | "question" | "todo"
  >("all");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "updated" | "created" | "title" | "priority"
  >("updated");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: "#fbbf24",
    tags: [] as string[],
    type: "manual" as Note["type"],
    priority: "medium" as Note["priority"],
  });

  const namespace = `${user?.id}:${filename}`;

  const colors = [
    "#fbbf24", // yellow
    "#f87171", // red
    "#34d399", // green
    "#60a5fa", // blue
    "#a78bfa", // purple
    "#fb7185", // pink
    "#fbbf24", // amber
    "#10b981", // emerald
  ];

  const noteTypes = [
    { value: "manual", label: "Manual Note", icon: IoPencil },
    { value: "highlight", label: "Highlight", icon: IoBookmark },
    { value: "summary", label: "Summary", icon: IoDocument },
    { value: "question", label: "Question", icon: IoText },
    { value: "todo", label: "To-Do", icon: IoCheckbox },
  ];

  useEffect(() => {
    if (filename && user?.id) {
      loadNotes();
    }
  }, [filename, user?.id]);

  const loadNotes = async () => {
    if (!filename || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5000/v1/generate/notes`,
        { namespace },
        { headers: { "Content-Type": "application/json" } }
      );

      const parsedData = response.data;
      console.log("Response data:", parsedData); // Log the entire response data

      if (parsedData && parsedData.notes) {
        setNotesData({
          notes: parsedData.notes.map((note: any, index: number) => ({
            id: note.id || `note_${index + 1}`,
            title: note.title || `Note ${index + 1}`,
            content: note.content || "",
            excerpt:
              note.excerpt || note.content?.substring(0, 50) + "..." || "",
            color: note.color || colors[index % colors.length],
            tags: Array.isArray(note.tags) ? note.tags : [],
            isPinned: note.isPinned || false,
            isBookmarked: note.isBookmarked || false,
            createdAt: note.createdAt || new Date().toISOString(),
            updatedAt: note.updatedAt || new Date().toISOString(),
            sourceRef: note.sourceRef || null,
            type: note.type || "highlight",
            priority: note.priority || "medium",
          })),
          totalNotes: parsedData.total || parsedData.notes.length,
          categories: Array.isArray(parsedData.categories)
            ? parsedData.categories
            : [],
          autoSummary:
            parsedData.autoSummary ||
            "Auto-extracted notes from document content",
        });
      } else {
        setNotesData(createDefaultNotes());
      }
    } catch (err) {
      console.error("Error loading notes:", err);
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createDefaultNotes = () => ({
    notes: [],
    totalNotes: 0,
    categories: [],
    autoSummary: "No notes found. Create your first note to get started.",
  });

  const createNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: `note_${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      excerpt:
        newNote.content.substring(0, 50) +
        (newNote.content.length > 50 ? "..." : ""),
      color: newNote.color,
      tags: newNote.tags,
      isPinned: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: newNote.type,
      priority: newNote.priority,
    };

    setNotesData((prev) =>
      prev
        ? {
            ...prev,
            notes: [note, ...prev.notes],
            totalNotes: prev.totalNotes + 1,
          }
        : {
            notes: [note],
            totalNotes: 1,
            categories: [],
            autoSummary: "Created your first note!",
          }
    );

    setNewNote({
      title: "",
      content: "",
      color: "#fbbf24",
      tags: [],
      type: "manual",
      priority: "medium",
    });
    setIsCreating(false);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotesData((prev) =>
      prev
        ? {
            ...prev,
            notes: prev.notes.map((note) =>
              note.id === noteId
                ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                : note
            ),
          }
        : null
    );
  };

  const editNote = (noteId: string) => {
    const noteToEdit = notesData?.notes.find((note) => note.id === noteId);
    if (noteToEdit) {
      setNewNote({
        title: noteToEdit.title,
        content: noteToEdit.content,
        color: noteToEdit.color,
        tags: noteToEdit.tags,
        type: noteToEdit.type,
        priority: noteToEdit.priority,
      });
      setIsCreating(true);
    }
  };

  const deleteNote = (noteId: string) => {
    setNotesData((prev) =>
      prev
        ? {
            ...prev,
            notes: prev.notes.filter((note) => note.id !== noteId),
            totalNotes: prev.totalNotes - 1,
          }
        : null
    );
  };

  const togglePin = (noteId: string) => {
    updateNote(noteId, {
      isPinned: !notesData?.notes.find((n) => n.id === noteId)?.isPinned,
    });
  };

  const toggleBookmark = (noteId: string) => {
    updateNote(noteId, {
      isBookmarked: !notesData?.notes.find((n) => n.id === noteId)
        ?.isBookmarked,
    });
  };

  const getFilteredNotes = () => {
    if (!notesData) return [];

    let filtered = notesData.notes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((note) => note.type === filterType);
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((note) => note.priority === filterPriority);
    }

    // Sort notes
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;

      switch (sortBy) {
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    return filtered;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    const noteType = noteTypes.find((t) => t.value === type);
    const IconComponent = noteType?.icon || IoPencil;
    return <IconComponent size={16} />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#fafafa]">
        <CgSpinner size={48} className="animate-spin mb-4" />
        <h2 className="text-xl mb-2">Loading Notes...</h2>
        <p className="text-[#fafafa80]">
          Extracting highlights and insights from your content
        </p>
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
          <BiNote size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-lg mb-2">Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={loadNotes}
          className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
        >
          <IoRefresh size={18} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const filteredNotes = getFilteredNotes();

  return (
    <div className="flex flex-col h-full p-6 text-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <BiNote size={28} />
            <span>Notes</span>
          </h1>
          <p className="text-[#fafafa80]">
            Capture and organize your thoughts and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="bg-[#fafafa20] hover:bg-[#fafafa30] p-2 rounded-lg transition-colors"
          >
            {viewMode === "grid" ? (
              <IoList title="List View" size={18} />
            ) : (
              <IoGrid title="Grid View" size={18} />
            )}
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
          >
            <IoAdd size={18} />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <BiNote size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {notesData?.totalNotes || 0}
          </div>
          <div className="text-sm text-[#fafafa80]">Total Notes</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoBookmark size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {notesData?.notes.filter((n) => n.isBookmarked).length || 0}
          </div>
          <div className="text-sm text-[#fafafa80]">Bookmarked</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoFlag size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">
            {notesData?.notes.filter((n) => n.isPinned).length || 0}
          </div>
          <div className="text-sm text-[#fafafa80]">Pinned</div>
        </div>
        <div className="bg-[#fafafa1a] rounded-lg p-4 text-center">
          <IoList size={20} className="mx-auto mb-2 text-[#fafafa80]" />
          <div className="text-lg font-semibold">{filteredNotes.length}</div>
          <div className="text-sm text-[#fafafa80]">Showing</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <IoSearch
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#fafafa80]"
          />
          <input
            type="text"
            placeholder="Search notes, tags, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#fafafa20] border border-[#fafafa30] rounded-lg text-[#fafafa] placeholder-[#fafafa60] focus:outline-none focus:border-[#fafafa50]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="bg-[#fafafa20] border border-[#fafafa30] rounded-lg px-3 py-2 text-[#fafafa] text-sm"
        >
          <option value="all">All Types</option>
          {noteTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="bg-[#fafafa20] border border-[#fafafa30] rounded-lg px-3 py-2 text-[#fafafa] text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-[#fafafa20] border border-[#fafafa30] rounded-lg px-3 py-2 text-[#fafafa] text-sm"
        >
          <option value="updated">Last Updated</option>
          <option value="created">Date Created</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Create Note Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Note</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-[#fafafa80] hover:text-[#fafafa] transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) =>
                  setNewNote((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 bg-[#fafafa20] border border-[#fafafa30] 
                rounded-lg text-[#fafafa] placeholder-[#fafafa60] focus:outline-none
                focus:border-[#fafafa50]"
              />

              <textarea
                placeholder="Write your note content..."
                value={newNote.content}
                onChange={(e) =>
                  setNewNote((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full px-4 py-3 bg-[#fafafa20] border border-[#fafafa30] 
                rounded-lg text-[#fafafa] placeholder-[#fafafa60] focus:outline-none 
                focus:border-[#fafafa50] h-32 resize-none"
              />

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#fafafa80]">Type:</span>
                  <select
                    value={newNote.type}
                    onChange={(e) =>
                      setNewNote((prev) => ({
                        ...prev,
                        type: e.target.value as Note["type"],
                      }))
                    }
                    className="bg-[#fafafa20] border border-[#fafafa30] 
                    rounded px-2 py-1 text-sm text-[#fafafa]"
                  >
                    {noteTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#fafafa80]">Priority:</span>
                  <select
                    value={newNote.priority}
                    onChange={(e) =>
                      setNewNote((prev) => ({
                        ...prev,
                        priority: e.target.value as Note["priority"],
                      }))
                    }
                    className="bg-[#fafafa20] border border-[#fafafa30] rounded
                     px-2 py-1 text-sm text-[#fafafa]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#fafafa80]">Color:</span>
                  <div className="flex space-x-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setNewNote((prev) => ({ ...prev, color }))
                        }
                        className={`w-6 h-6 rounded-full border-2 ${
                          newNote.color === color
                            ? "border-[#fafafa]"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-[#fafafa80] hover:text-[#fafafa] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                disabled={!newNote.title.trim() || !newNote.content.trim()}
                className="flex items-center space-x-2 bg-[#fafafa] text-black px-4 py-2
                rounded-lg hover:bg-[#fafafa90] transition-colors disabled:opacity-50 
                disabled:cursor-not-allowed"
              >
                <IoSave size={18} />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid/List */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="relative group"
                style={{ backgroundColor: note.color + "20" }}
              >
                <div
                  className="bg-[#fafafa1a] backdrop-blur-sm rounded-lg p-4 h-full 
                border border-[#fafafa20] hover:border-[#fafafa30] transition-all"
                >
                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {note.isPinned && (
                        <IoFlag size={14} className="text-yellow-400" />
                      )}
                      <div className="flex items-center space-x-1 text-xs text-[#fafafa80]">
                        {getTypeIcon(note.type)}
                        <span className={getPriorityColor(note.priority)}>
                          ●
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 
                    transition-opacity"
                    >
                      <button
                        onClick={() => toggleBookmark(note.id)}
                        className="text-[#fafafa80] hover:text-yellow-400 transition-colors"
                      >
                        {note.isBookmarked ? (
                          <IoBookmark size={14} />
                        ) : (
                          <IoBookmarkOutline size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => togglePin(note.id)}
                        className="text-[#fafafa80] hover:text-blue-400 transition-colors"
                      >
                        <IoFlag size={14} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-[#fafafa80] hover:text-red-400 transition-colors"
                      >
                        <IoTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {note.title}
                  </h3>
                  <p className="text-xs text-[#fafafa80] line-clamp-4 mb-3">
                    {note.content}
                  </p>

                  {/* Note Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[#fafafa20] text-[#fafafa80] px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-[#fafafa60]">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Note Footer */}
                  <div className="flex items-center justify-between text-xs text-[#fafafa60]">
                    <span>{formatDate(note.updatedAt)}</span>
                    {note.sourceRef?.page && (
                      <span>p. {note.sourceRef.page}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-[#fafafa1a] rounded-lg p-4 border border-[#fafafa20] 
                hover:border-[#fafafa30] transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: note.color }}
                      />
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(note.type)}
                        <h3 className="font-semibold text-sm">{note.title}</h3>
                        {note.isPinned && (
                          <IoFlag size={14} className="text-yellow-400" />
                        )}
                        <span
                          className={`text-xs ${getPriorityColor(
                            note.priority
                          )}`}
                        >
                          {note.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#fafafa80] line-clamp-2 mb-2">
                      {note.content}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-[#fafafa20] text-[#fafafa80] px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-[#fafafa60]">
                      <span>{formatDate(note.updatedAt)}</span>
                      {note.sourceRef?.chapter && (
                        <span>{note.sourceRef.chapter}</span>
                      )}
                      {note.sourceRef?.page && (
                        <span>Page {note.sourceRef.page}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleBookmark(note.id)}
                      className="text-[#fafafa80] hover:text-yellow-400 transition-colors p-1"
                    >
                      {note.isBookmarked ? (
                        <IoBookmark size={16} />
                      ) : (
                        <IoBookmarkOutline size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => editNote(note.id)}
                      className="text-[#fafafa80] hover:text-blue-400 transition-colors p-1"
                    >
                      <CiEdit size={16} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-[#fafafa80] hover:text-red-400 transition-colors p-1"
                    >
                      <IoTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[#fafafa60]">
            <BiNote size={48} className="mb-4" />
            <p className="text-lg mb-2">No notes found</p>
            <p className="text-sm mb-4">
              {searchTerm || filterType !== "all" || filterPriority !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first note to get started"}
            </p>
            {!searchTerm &&
              filterType === "all" &&
              filterPriority === "all" && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center space-x-2 bg-[#fafafa] text-black px-4
                  py-2 rounded-lg hover:bg-[#fafafa90] transition-colors"
                >
                  <IoAdd size={18} />
                  <span>Create Note</span>
                </button>
              )}
          </div>
        )}
      </div>

      {/* Auto Summary */}
      {notesData?.autoSummary && (
        <div className="mt-6 bg-[#fafafa1a] rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center space-x-2">
            <IoDocument size={16} />
            <span>Notes Summary</span>
          </h3>
          <p className="text-sm text-[#fafafa80]">{notesData.autoSummary}</p>
        </div>
      )}
    </div>
  );
};

export default Notes;
