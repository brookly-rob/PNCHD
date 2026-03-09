import React, { useState } from "react";

// Trade Color Mapping
const tradeColors = {
  General: "bg-gray-100 border-gray-400 text-gray-800",
  Plumbing: "bg-blue-50 border-blue-400 text-blue-800",
  Electrical: "bg-amber-50 border-amber-400 text-amber-800",
  Framing: "bg-orange-50 border-orange-400 text-orange-800",
  Drywall: "bg-stone-100 border-stone-400 text-stone-800",
  Paint: "bg-purple-50 border-purple-400 text-purple-800",
  HVAC: "bg-cyan-50 border-cyan-400 text-cyan-800",
  Flooring: "bg-green-50 border-green-400 text-green-800",
};

const trades = Object.keys(tradeColors);

const App = () => {
  // --- STATE ---
  const [projects, setProjects] = useState([
    { id: 1, name: "Kitchen Remodel - Smith", tasks: [] },
  ]);
  const [currentProject, setCurrentProject] = useState(null);
  const [view, setView] = useState("menu");

  // Modals
  const [showProjModal, setShowProjModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(null);

  // Task Entry State
  const [selectedTrade, setSelectedTrade] = useState("General");
  const [taskNote, setTaskNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Search & Filter
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
    if (window.confirm("Delete this entire project and all tasks?")) {
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

    navigator.clipboard.writeText(log).then(() => alert("Log copied!"));
  };

  // --- FILTERING & SORTING ---
  const filteredTasks = currentProject?.tasks
    .filter((t) => tradeFilter === "All" || t.trade === tradeFilter)
    .filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const order = { attention: 0, outstanding: 1, completed: 2 };
      return order[a.status] - order[b.status];
    });

  // --- UI RENDER ---
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 text-gray-900 pb-20 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center z-40">
        {view === "project" ? (
          <>
            <button
              onClick={() => {
                setView("menu");
                setShowActionModal(null);
                setShowTaskModal(null);
              }}
              className="font-bold text-xs bg-blue-800 px-2 py-2 rounded"
            >
              ← MENU
            </button>
            <h2 className="font-black truncate px-2 text-sm uppercase flex-1 text-center">
              {currentProject.name}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setShowTaskModal(true);
                  setShowActionModal(null);
                }}
                className="bg-green-600 text-white px-3 py-2 rounded font-black text-xs"
              >
                +
              </button>
              <button
                onClick={exportLog}
                className="bg-blue-600 text-white px-3 py-2 rounded font-black text-xs uppercase"
              >
                Log
              </button>
            </div>
          </>
        ) : (
          <h1 className="text-xl font-black uppercase tracking-tighter">
            Punch List Pro
          </h1>
        )}
      </header>

      {/* MENU VIEW */}
      {view === "menu" && (
        <div className="p-4 space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="relative group">
              <button
                onClick={() => {
                  setCurrentProject(p);
                  setView("project");
                }}
                className="w-full text-left p-5 bg-white border-b-4 border-gray-300 rounded-xl font-black text-lg shadow-sm active:translate-y-1 active:border-b-0 transition-all"
              >
                {p.name}
              </button>
              <button
                onClick={(e) => deleteProject(p.id, e)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-600"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowProjModal(true)}
            className="w-full p-4 border-4 border-dashed border-gray-300 text-gray-400 font-black rounded-xl uppercase text-sm"
          >
            + New Project
          </button>
        </div>
      )}

      {/* PROJECT VIEW */}
      {view === "project" && (
        <div className="p-2">
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white p-3 rounded-xl shadow-sm mb-4 space-y-2">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full p-2 border rounded bg-gray-50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="w-full p-2 border rounded bg-gray-50 text-sm font-bold"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
            >
              <option value="All">All Trades</option>
              {trades.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* TASK LIST */}
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setShowActionModal(task)}
                className={`w-full text-left p-4 rounded-xl border-b-4 shadow-sm flex items-center justify-between transition-all active:scale-95 ${
                  tradeColors[task.trade]
                } ${
                  task.status === "completed"
                    ? "opacity-50 border-gray-200"
                    : ""
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-black text-lg leading-tight flex items-center gap-2">
                    {task.status === "completed" && "✅"}
                    {task.status === "attention" && "‼️"}
                    {task.text}
                  </span>
                  <span className="text-[10px] font-bold uppercase opacity-60">
                    {task.trade} {task.image ? "• 📸" : ""}{" "}
                    {task.note ? "• 📝" : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TASK DETAILS */}
      {showActionModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowActionModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 border-b pb-2">
              <h3 className="text-xl font-black uppercase text-blue-900">
                {showActionModal.text}
              </h3>
              <button
                onClick={() => deleteTask(showActionModal.id)}
                className="text-xl"
              >
                🗑️
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-[10px] font-black uppercase text-gray-500">
                  Assignee
                </p>
                <p className="font-bold">{showActionModal.trade}</p>
              </div>

              {showActionModal.note && (
                <div className="bg-blue-50 p-3 border-l-4 border-blue-500 rounded-r-lg">
                  <p className="text-[10px] font-black uppercase text-blue-700">
                    Instructions
                  </p>
                  <p className="text-sm italic">"{showActionModal.note}"</p>
                </div>
              )}

              {showActionModal.status === "attention" &&
                showActionModal.attentionNote && (
                  <div className="bg-red-50 p-3 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-[10px] font-black uppercase text-red-700">
                      🚨 Current Issue
                    </p>
                    <p className="text-sm font-bold">
                      "{showActionModal.attentionNote}"
                    </p>
                  </div>
                )}

              {showActionModal.image && (
                <img
                  src={showActionModal.image}
                  alt="Task"
                  className="w-full rounded-lg border shadow-inner max-h-64 object-contain bg-black"
                />
              )}
            </div>

            <div className="grid gap-2">
              <button
                onClick={() => updateStatus(showActionModal.id, "completed")}
                className="w-full bg-green-600 text-white font-black py-4 rounded-xl uppercase"
              >
                ✅ Mark Done
              </button>
              <button
                onClick={() => {
                  const n = prompt("What's stopping this?");
                  if (n) updateStatus(showActionModal.id, "attention", n);
                }}
                className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase"
              >
                ‼️ Needs Attention
              </button>
              <button
                onClick={() => setShowActionModal(null)}
                className="w-full py-2 font-bold text-gray-400 uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="font-black text-xl mb-6 uppercase text-blue-900">
              New Punch Item
            </h3>

            <div className="space-y-4">
              {/* 1. TASK */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">
                  Task Name
                </label>
                <input
                  id="taskText"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold mt-1"
                  placeholder="e.g. Paint Touch-up"
                />
              </div>

              {/* 2. ASSIGN TRADE */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">
                  Assign Trade
                </label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold bg-gray-50 mt-1"
                >
                  {trades.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. ADD NOTE TOGGLE */}
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className={`w-full py-3 rounded-xl border-2 font-black text-xs uppercase ${
                  taskNote
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
              >
                {taskNote ? "📝 Note Added" : "+ Add Detailed Note"}
              </button>

              {showNoteInput && (
                <textarea
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  className="w-full p-4 border-2 border-blue-200 rounded-xl h-24 text-sm bg-blue-50"
                  placeholder="Specific details..."
                  autoFocus
                />
              )}

              {/* 4. PHOTO BUTTON */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => document.getElementById("camIn").click()}
                  className={`w-full py-3 rounded-xl border-2 font-black text-xs uppercase ${
                    selectedImage
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  }`}
                >
                  {selectedImage
                    ? "📸 Photo Attached"
                    : "📷 Add Photo / Take Picture"}
                </button>
                <input
                  type="file"
                  id="camIn"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0])
                      setSelectedImage(URL.createObjectURL(e.target.files[0]));
                  }}
                />
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="preview"
                    className="h-32 w-full object-contain rounded border bg-gray-50"
                  />
                )}
              </div>

              {/* 5. FOOTER BUTTONS */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    const val = document.getElementById("taskText").value;
                    if (val)
                      addTask(val, selectedImage, taskNote, selectedTrade);
                  }}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg uppercase"
                >
                  Add to List
                </button>
                <button
                  onClick={resetTaskForm}
                  className="w-full py-2 font-bold text-gray-400 uppercase"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-black text-lg mb-4 uppercase">Project Name</h3>
            <input
              id="pName"
              type="text"
              className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold mb-4"
              placeholder="e.g. 123 Maple Ave"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  addProject(document.getElementById("pName").value)
                }
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowProjModal(false)}
                className="w-full py-2 font-bold text-gray-400 uppercase"
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
