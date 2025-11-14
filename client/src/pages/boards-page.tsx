import React, { useEffect, useState } from "react";
import { FiPlus, FiMoreVertical, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StorageKey from "../common/constants/StorageKey";

interface Board {
  id: string;
  name: string;
  desc: string;
  url: string;
  prefs: {
    background: string;
    backgroundColor: string;
    backgroundImage: string;
  };
  shortLink: string;
}

// Shimmer Loading Component
const BoardCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-32 bg-gray-200 rounded mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Board Card Component
const BoardCard: React.FC<{
  board: Board;
  onUpdate: (board: Board) => void;
  onDelete: (boardId: string) => void;
}> = ({ board, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getBackgroundStyle = () => {
    if (board.prefs.backgroundImage) {
      return {
        backgroundImage: `url(${board.prefs.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      backgroundColor: board.prefs.backgroundColor || "#0079BF",
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div
        className="h-32 flex items-center justify-center text-white font-bold text-xl relative"
        style={getBackgroundStyle()}
      >
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
          >
            <FiMoreVertical className="text-white" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onUpdate(board);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <FiEdit2 /> Update Board
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(board.id);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <FiTrash2 /> Delete Board
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
          {board.name}
        </h3>
        <a
          href={board.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          View Board →
        </a>
      </div>
    </div>
  );
};

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000054] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main Boards Page Component
const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<{ boards: Board[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boardName, setBoardName] = useState("");
  console.log(boards);

  useEffect(() => {
    document.title = "Trello Dashboard";
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/trello/boards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            StorageKey.ACCESS_TOKEN
          )}`,
        },
      });
      const data = await response.json();
      setBoards(data);
      toast.success("Boards loaded successfully!");
    } catch (error) {
      toast.error("Failed to load boards");
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) {
      toast.warning("Please enter a board name");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch("http://localhost:3000/api/trello/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            StorageKey.ACCESS_TOKEN
          )}`,
        },
        body: JSON.stringify({ name: boardName }),
      });

      if (response.ok) {
        toast.success("Board created successfully!");
        setShowCreateModal(false);
        setBoardName("");
        fetchBoards();
      } else {
        toast.error("Failed to create board");
      }
    } catch (error) {
      toast.error("Error creating board");
      console.error("Error creating board:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim() || !selectedBoard) {
      toast.warning("Please enter a board name");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/trello/boards/${selectedBoard.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              StorageKey.ACCESS_TOKEN
            )}`,
          },
          body: JSON.stringify({ name: boardName }),
        }
      );

      if (response.ok) {
        toast.success("Board updated successfully!");
        setShowUpdateModal(false);
        setBoardName("");
        setSelectedBoard(null);
        fetchBoards();
      } else {
        toast.error("Failed to update board");
      }
    } catch (error) {
      toast.error("Error updating board");
      console.error("Error updating board:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!window.confirm("Are you sure you want to delete this board?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/trello/boards/${boardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              StorageKey.ACCESS_TOKEN
            )}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Board deleted successfully!");
        fetchBoards();
      } else {
        toast.error("Failed to delete board");
      }
    } catch (error) {
      toast.error("Error deleting board");
      console.error("Error deleting board:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openUpdateModal = (board: Board) => {
    setSelectedBoard(board);
    setBoardName(board.name);
    setShowUpdateModal(true);
  };

  if (!boards) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">All Boards</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
            disabled={actionLoading}
          >
            <FiPlus size={20} />
            Create New Board
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards && boards?.boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.boards?.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onUpdate={openUpdateModal}
                onDelete={handleDeleteBoard}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No boards found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <FiPlus size={20} />
              Create Your First Board
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setBoardName("");
        }}
        title="Create New Board"
      >
        <form onSubmit={handleCreateBoard}>
          <div className="mb-4">
            <label
              htmlFor="boardName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Board Name
            </label>
            <input
              type="text"
              id="boardName"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter board name"
              disabled={actionLoading}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading}
            >
              {actionLoading ? "Creating..." : "Create Board"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setBoardName("");
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
              disabled={actionLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Board Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setBoardName("");
          setSelectedBoard(null);
        }}
        title="Update Board"
      >
        <form onSubmit={handleUpdateBoard}>
          <div className="mb-4">
            <label
              htmlFor="updateBoardName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Board Name
            </label>
            <input
              type="text"
              id="updateBoardName"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new board name"
              disabled={actionLoading}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "Update Board"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUpdateModal(false);
                setBoardName("");
                setSelectedBoard(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
              disabled={actionLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardsPage;
