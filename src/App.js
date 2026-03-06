import React, { useState } from "react";

const styles = {
  card: "border-b p-4 mb-2 flex flex-col transition-all duration-300",
  modalOverlay:
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
  modalContent: "bg-white rounded-xl p-6 w-full max-w-md shadow-2xl",
  statusAttention: "border-l-8 border-red-500 bg-red-50",
  statusCompleted: "bg-gray-100 opacity-60 line-through",
};

const App = () => {
  const [projects, setProjects] = useState([
    { id: 1, name: "Kitchen Remodel - Smith", tasks: [] },
  ]);
  const [currentProject, setCurrentProject] = useState(null);
  const [view, setView] = useState("menu");
  const [showProjModal, setShowProjModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(null);

  const addProject = (name) => {
    const newProj = { id: Date.now(), name, tasks: [] };
    setProjects([...projects, newProj]);
    setShowProjModal(false);
    alert(`New project '${name}' created!`);
  };

  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text,
      status: "outstanding",
      note: "",
      updatedAt: new Date(),
    };
    const updated = {
      ...currentProject,
      tasks: [...currentProject.tasks, newTask],
    };
    setCurrentProject(updated);
    setProjects(
      projects.map((p) => (p.id === currentProject.id ? updated : p))
    );
    setShowTaskModal(false);
  };

  const updateStatus = (taskId, status, note = "") => {
    const updatedTasks = currentProject.tasks.map((t) =>
      t.id === taskId ? { ...t, status, note, updatedAt: new Date() } : t
    );
    const updated = { ...currentProject, tasks: updatedTasks };
    setCurrentProject(updated);
    setProjects(
      projects.map((p) => (p.id === currentProject.id ? updated : p))
    );
    setShowActionModal(null);
  };

  const [selectedImage, setSelectedImage] = useState(null);

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

    let log = `DAILY PUNCH LIST LOG: ${currentProject.name}\nDate: ${todayStr}\n---\n`;
    log +=
      `✅ COMPLETED TODAY:\n` +
      (completedToday.map((t) => `• ${t.text}`).join("\n") || "(None)");
    log +=
      `\n\n🚨 ATTENTION REQUIRED:\n` +
      (attentionNeeded
        .map((t) => `• ${t.text.toUpperCase()}: ${t.note}`)
        .join("\n") || "(None)");

    navigator.clipboard
      .writeText(log)
      .then(() => alert("Log copied to clipboard!"));
  };

  const sortedTasks = currentProject?.tasks.sort((a, b) => {
    const order = { attention: 0, outstanding: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 text-gray-900 pb-20 font-sans">
      {/* MENU VIEW */}
      {view === "menu" && (
        <div className="p-6">
          <h1 className="text-3xl font-black mb-8 text-blue-900 uppercase">
            Punch List Pro
          </h1>
          <div className="space-y-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setCurrentProject(p);
                  setView("project");
                }}
                className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-xl font-bold shadow-sm"
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={() => setShowProjModal(true)}
              className="w-full p-4 border-2 border-dashed border-gray-400 text-gray-500 font-bold rounded-xl italic"
            >
              + Add Project
            </button>
          </div>
        </div>
      )}

      {/* PROJECT VIEW */}
      {view === "project" && (
        <div>
          <header className="sticky top-0 bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center z-10">
            <button
              onClick={() => setView("menu")}
              className="text-sm font-bold opacity-80"
            >
              ← MENU
            </button>
            <h2 className="font-bold truncate px-4">{currentProject.name}</h2>
            <button
              onClick={exportLog}
              className="bg-blue-700 text-xs py-1 px-3 rounded font-bold uppercase"
            >
              Log
            </button>
          </header>

          <div className="p-2">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setShowActionModal(task);
                }}
                className={`${styles.card} ${
                  task.status === "attention" ? styles.statusAttention : ""
                } ${
                  task.status === "completed"
                    ? styles.statusCompleted
                    : "bg-white shadow-sm rounded-lg"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg leading-tight">
                    {task.text}
                  </span>
                  {task.status === "attention" && (
                    <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-black uppercase">
                      ! Attention
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-6">
            <button
              onClick={() => setShowTaskModal(true)}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-full shadow-2xl uppercase tracking-widest"
            >
              + Add Punch Item
            </button>
          </div>
        </div>
      )}

      {/* ACTION MODAL (Right Click/Long Press) */}
      {showActionModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowActionModal(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black mb-4 uppercase text-blue-900">
              Task Options
            </h3>
            <p className="font-bold text-lg mb-4">"{showActionModal.text}"</p>
            {showActionModal.note && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm italic">
                "{showActionModal.note}"
              </div>
            )}
            <div className="grid gap-3">
              <button
                onClick={() => updateStatus(showActionModal.id, "completed")}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-lg uppercase"
              >
                ✅ Mark Completed
              </button>
              <button
                onClick={() => {
                  const n = prompt("Note for Attention:", showActionModal.note);
                  if (n !== null)
                    updateStatus(showActionModal.id, "attention", n);
                }}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-lg uppercase"
              >
                🚨 Needs Attention
              </button>
              <button
                onClick={() => setShowActionModal(null)}
                className="w-full py-2 font-bold text-gray-400 uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL (With Photo Placeholder) */}
      {showTaskModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className="font-black text-lg mb-2 uppercase text-blue-900">
              New Punch Item
            </h3>
            <textarea
              id="taskText"
              className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 h-24"
              placeholder="Describe the task..."
            />

            <div className="flex gap-2 mb-4 text-center">
              {/* The Visual Button */}
              <button
                onClick={() => document.getElementById("cameraInput").click()}
                className={`flex-1 border-2 py-3 rounded-lg flex flex-col items-center justify-center font-bold text-xs uppercase ${
                  selectedImage
                    ? "bg-green-50 border-green-500 text-green-700"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                }`}
              >
                <span className="text-xl mb-1">
                  {selectedImage ? "📸" : "📷"}
                </span>
                {selectedImage ? "Photo Attached" : "Take Picture"}
              </button>

              {/* The Hidden "Engine" that opens the Camera/Gallery */}
              <input
                type="file"
                id="cameraInput"
                accept="image/*"
                capture="environment" // This tells mobile devices to try and use the back camera
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setSelectedImage(URL.createObjectURL(e.target.files[0]));
                    alert("Photo linked to task!");
                  }
                }}
              />

              <button
                onClick={() => alert("Note editor placeholder")}
                className="flex-1 bg-gray-100 border-2 border-gray-300 py-3 rounded-lg flex flex-col items-center justify-center text-gray-600 font-bold text-xs uppercase"
              >
                <span className="text-xl mb-1">📝</span> Add Notes
              </button>
            </div>

            {/* Preview of the photo if one is taken */}
            {selectedImage && (
              <div className="mb-4 relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                >
                  X
                </button>
              </div>
            )}

            <div className="flex gap-2 border-t pt-4">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 font-bold text-gray-400"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById("taskText").value;
                  if (val) addTask(val);
                }}
                className="flex-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold"
              >
                ADD TO LIST
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {showProjModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className="font-black text-lg mb-4">NEW PROJECT NAME</h3>
            <input
              id="projName"
              type="text"
              className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4"
              placeholder="e.g. 123 Maple Ave"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowProjModal(false)}
                className="flex-1 font-bold text-gray-400"
              >
                CANCEL
              </button>
              <button
                onClick={() =>
                  addProject(document.getElementById("projName").value)
                }
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
