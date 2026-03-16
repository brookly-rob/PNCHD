import React, { useState } from "react";
import "./styles.css"; // Ensure your CSS file is imported

// Updated Trade Color Mapping for Dark Theme (Neon Accents)
const tradeColors = {
  General: "border-gray-500 text-gray-300 bg-gray-500/10",
  Plumbing: "border-cyan-400 text-cyan-400 bg-cyan-400/10",
  Electrical: "border-amber-400 text-amber-400 bg-amber-400/10",
  Framing: "border-orange-500 text-orange-400 bg-orange-500/10",
  Drywall: "border-stone-400 text-stone-300 bg-stone-400/10",
  Paint: "border-purple-400 text-purple-400 bg-purple-400/10",
  HVAC: "border-emerald-400 text-emerald-400 bg-emerald-400/10",
  Flooring: "border-green-400 text-green-400 bg-green-400/10",
};

const trades = Object.keys(tradeColors);

const App = () => {
  // --- STATE ---
  const [projects, setProjects] = useState([
    { id: 1, name: "Kitchen Remodel - Smith", tasks: [] },
  ]);
  const [currentProject, setCurrentProject] = useState(null);
  const [view, setView] = useState("menu");

  const [showProjModal, setShowProjModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(null);

  const [selectedTrade, setSelectedTrade] = useState("General");
  const [taskNote, setTaskNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");

  // --- ACTIONS ---
  const addProject = (name) => {
    if (!name) return;
    const newProj = { id: Date.now(), name, tasks: [] };
    setProjects([...projects, newProj]);
    setShowProjModal(false);
  };

  const deleteProject = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this entire project?")) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const addTask = (text, image, note, trade) => {
    const newTask = {
      id: Date.now(),
      text,
      status: "outstanding",
      note: note || "",
      attentionNote: "",
      image: image,
      trade: trade || "General",
      updatedAt: new Date(),
    };
    const updated = {
      ...currentProject,
      tasks: [...currentProject.tasks, newTask],
    };
    updateProject(updated);
    resetTaskForm();
  };

  const updateProject = (updatedProj) => {
    setCurrentProject(updatedProj);
    setProjects(
      projects.map((p) => (p.id === updatedProj.id ? updatedProj : p))
    );
  };

  const deleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) {
      const updatedTasks = currentProject.tasks.filter((t) => t.id !== taskId);
      updateProject({ ...currentProject, tasks: updatedTasks });
      setShowActionModal(null);
    }
  };

  const updateStatus = (taskId, status, attentionMsg = "") => {
    const updatedTasks = currentProject.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            attentionNote:
              status === "attention" ? attentionMsg : t.attentionNote,
            updatedAt: new Date(),
          }
        : t
    );
    updateProject({ ...currentProject, tasks: updatedTasks });
    setShowActionModal(null);
  };

  const resetTaskForm = () => {
    setSelectedImage(null);
    setTaskNote("");
    setShowNoteInput(false);
    setSelectedTrade("General");
    setShowTaskModal(false);
  };

  const exportLog = () => {
    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const completedToday = currentProject.tasks.filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.updatedAt).toLocaleDateString() === todayStr
    );
    const attentionNeeded = currentProject.tasks.filter(
      (t) => t.status === "attention"
    );

    let log = `DAILY LOG: ${currentProject.name} (${todayStr})\n---\n`;
    log +=
      `✅ DONE:\n` +
      (completedToday.map((t) => `• [${t.trade}] ${t.text}`).join("\n") ||
        "(None)");
    log +=
      `\n\n🚨 ATTENTION:\n` +
      (attentionNeeded
        .map(
          (t) =>
            `• [${t.trade}] ${t.text.toUpperCase()}: ${
              t.attentionNote || t.note
            }`
        )
        .join("\n") || "(None)");

    navigator.clipboard
      .writeText(log)
      .then(() => alert("Log copied to clipboard!"));
  };

  const filteredTasks = currentProject?.tasks
    .filter((t) => tradeFilter === "All" || t.trade === tradeFilter)
    .filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const order = { attention: 0, outstanding: 1, completed: 2 };
      return order[a.status] - order[b.status];
    });

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20">
      {/* HEADER */}
      <header className="sticky top-0 p-4 flex justify-between items-center z-40 border-b border-white/10 bg-black/20 backdrop-blur-md">
        {view === "project" ? (
          <>
            <button
              onClick={() => setView("menu")}
              className="punch-button-rich px-3 py-1 rounded text-xs font-bold"
            >
              ← MENU
            </button>
            <h2 className="font-black truncate px-2 text-sm uppercase flex-1 text-center tracking-widest text-[#ffda80]">
              {currentProject.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTaskModal(true)}
                className="punch-button-rich bg-cyan-500/20 px-3 py-1 rounded font-black"
              >
                +
              </button>
              <button
                onClick={exportLog}
                className="punch-button-rich px-3 py-1 rounded text-[10px]"
              >
                LOG
              </button>
            </div>
          </>
        ) : (
          <h1 className="text-xl font-black uppercase tracking-widest text-[#ffda80]">
            Punch List Pro
          </h1>
        )}
      </header>

      {/* MENU VIEW */}
      {view === "menu" && (
        <div className="p-4 flex flex-col space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="relative group w-full">
              <button
                onClick={() => {
                  setCurrentProject(p);
                  setView("project");
                }}
                className="w-full text-left p-6 punch-button-rich rounded-xl font-black text-lg shadow-lg"
              >
                {p.name}
              </button>
              <button
                onClick={(e) => deleteProject(p.id, e)}
                className="absolute top-6 right-4 opacity-30 hover:opacity-100"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowProjModal(true)}
            className="w-full p-6 border-2 border-dashed border-white/20 text-white/40 font-black rounded-xl uppercase text-sm hover:border-cyan-400/50 transition-colors"
          >
            + New Project
          </button>
        </div>
      )}

      {/* PROJECT VIEW */}
      {view === "project" && (
        <div className="p-4">
          <div className="flex flex-col gap-3 mb-6">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-cyan-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold outline-none"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
            >
              <option value="All">All Trades</option>
              {trades.map((t) => (
                <option key={t} value={t} className="bg-[#0a0a1a]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setShowActionModal(task)}
                className={`w-full text-left p-4 rounded-xl border-l-4 transition-transform active:scale-95 ${
                  tradeColors[task.trade]
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm tracking-wide">
                    {task.status === "completed" && "✅ "}
                    {task.status === "attention" && "‼️ "}
                    {task.text}
                  </span>
                  <div className="flex gap-2 opacity-60 text-xs">
                    {task.note && "📝"} {task.image && "📸"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TASK DETAILS */}
      {showActionModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowActionModal(null)}
        >
          <div
            className="rich-modal p-6 w-full max-w-md rounded-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-black uppercase text-[#ffda80]">
                {showActionModal.text}
              </h3>
              <button
                onClick={() => deleteTask(showActionModal.id)}
                className="opacity-20 hover:opacity-100"
              >
                🗑️
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="text-[10px] font-black uppercase text-cyan-400 mb-1">
                  Assignee
                </p>
                <p className="font-bold text-sm">{showActionModal.trade}</p>
              </div>

              {showActionModal.note && (
                <div className="bg-white/5 p-4 border-l-2 border-cyan-400 rounded-r-lg italic text-sm">
                  "{showActionModal.note}"
                </div>
              )}

              {showActionModal.status === "attention" && (
                <div className="bg-red-500/10 p-4 border-l-2 border-red-500 rounded-r-lg">
                  <p className="text-[10px] font-black uppercase text-red-500 mb-1">
                    🚨 Roadblock
                  </p>
                  <p className="text-sm font-bold">
                    "{showActionModal.attentionNote}"
                  </p>
                </div>
              )}

              {showActionModal.image && (
                <div className="bg-black rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={showActionModal.image}
                    alt="Task"
                    className="w-full h-48 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => updateStatus(showActionModal.id, "completed")}
                className="punch-button-rich bg-green-500/20 py-4 rounded-xl font-black"
              >
                ✅ MARK DONE
              </button>
              <button
                onClick={() => {
                  const n = prompt("What's stopping this?");
                  if (n) updateStatus(showActionModal.id, "attention", n);
                }}
                className="punch-button-rich bg-red-500/20 py-4 rounded-xl font-black"
              >
                ‼️ NEEDS ATTENTION
              </button>
              <button
                onClick={() => setShowActionModal(null)}
                className="py-2 text-xs font-bold text-white/30 uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK (Simplified for brevity, following the same pattern) */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rich-modal p-6 w-full max-w-md rounded-2xl">
            <h3 className="font-black text-xl mb-6 uppercase text-[#ffda80] text-center tracking-widest">
              New Punch Item
            </h3>
            <div className="space-y-4">
              <input
                id="taskText"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold"
                placeholder="What needs doing?"
              />
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold"
              >
                {trades.map((t) => (
                  <option key={t} value={t} className="bg-[#0a0a1a]">
                    {t}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="w-full py-3 punch-button-rich text-xs rounded-xl"
              >
                {taskNote ? "📝 Note Added" : "+ Add Detailed Note"}
              </button>
              {showNoteInput && (
                <textarea
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  className="w-full bg-white/5 border border-cyan-400/30 p-4 rounded-xl text-white text-sm h-24"
                  placeholder="Details..."
                />
              )}

              <button
                onClick={() => document.getElementById("camIn").click()}
                className="w-full py-3 punch-button-rich text-xs rounded-xl"
              >
                {selectedImage ? "📸 Photo Attached" : "📷 Add Photo"}
              </button>
              <input
                type="file"
                id="camIn"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files[0] &&
                  setSelectedImage(URL.createObjectURL(e.target.files[0]))
                }
              />

              <div className="flex flex-col gap-3 pt-4 border-t border-white/10 mt-4">
                <button
                  onClick={() => {
                    const val = document.getElementById("taskText").value;
                    if (val)
                      addTask(val, selectedImage, taskNote, selectedTrade);
                  }}
                  className="punch-button-rich bg-cyan-500/20 py-4 rounded-xl font-black"
                >
                  ADD TO LIST
                </button>
                <button
                  onClick={resetTaskForm}
                  className="text-xs font-bold text-white/30 uppercase pt-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showProjModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rich-modal p-8 w-full max-w-md rounded-2xl">
            <h3 className="font-black text-lg mb-4 uppercase text-[#ffda80] tracking-widest">
              Project Name
            </h3>
            <input
              id="pName"
              type="text"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold mb-6"
              placeholder="e.g. 123 Maple Ave"
            />
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  addProject(document.getElementById("pName").value)
                }
                className="punch-button-rich bg-cyan-500/20 py-4 rounded-xl font-black"
              >
                CREATE PROJECT
              </button>
              <button
                onClick={() => setShowProjModal(false)}
                className="text-xs font-bold text-white/30 uppercase pt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
