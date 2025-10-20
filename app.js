class TaskManager {
            constructor() {
                this.tasks = [];
                this.currentFilter = 'all';
                this.editingTaskId = null;
                this.init();
            }

            init() {
                this.loadTasks();
                this.bindEvents();
                this.render();
            }

            bindEvents(){
                document.getElementById('addBtn').addEventListener('click', () => this.addTask());
                document.getElementById('taskInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });

                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.setFilter(btn.dataset.filter, btn));
                });
                
                document.getElementById("logoutBtn").addEventListener("click", () => {
                    localStorage.removeItem("loggedIn");
                    window.location.replace("/");
                });
            }

            addTask() {
                const input = document.getElementById('taskInput');
                const priority = document.getElementById('prioritySelect').value;
                const text = input.value.trim();

                if (!text) {
                    input.focus();
                    return;
                }

                if (this.editingTaskId) {
                    this.updateTask(this.editingTaskId, text, priority);
                } else {
                    const task = {
                        id: Date.now(),
                        text,
                        priority,
                        completed: false,
                        rotation: (Math.random() * 3) - 1.5,
                        createdAt: new Date().toLocaleDateString()
                    };
                    this.tasks.push(task);
                }

                input.value = '';
                this.editingTaskId = null;
                document.getElementById('addBtn').textContent = 'Pin Note';
                this.saveTasks();
                this.render();
            }

            updateTask(id, text, priority) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.text = text;
                    task.priority = priority;
                }
            }

            toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    this.saveTasks();
                    this.render();
                }
            }

            editTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    document.getElementById('taskInput').value = task.text;
                    document.getElementById('prioritySelect').value = task.priority;
                    document.getElementById('addBtn').textContent = 'Update Note';
                    this.editingTaskId = id;
                    document.getElementById('taskInput').focus();
                }
            }

            deleteTask(id) {
                if (window.confirm('Are you sure you want to tear off this sticky note?')) {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.saveTasks();
                    this.render();
                }
            }

            setFilter(filter, btn) {
                this.currentFilter = filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.render();
            }

            getFilteredTasks() {
                switch (this.currentFilter) {
                    case 'pending':
                        return this.tasks.filter(t => !t.completed);
                    case 'completed':
                        return this.tasks.filter(t => t.completed);
                    case 'high':
                    case 'medium':
                    case 'low':
                        return this.tasks.filter(t => t.priority === this.currentFilter);
                    default:
                        return this.tasks;
                }
            }

            render() {
                const taskList = document.getElementById('taskList');
                const filteredTasks = this.getFilteredTasks();

                if (filteredTasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <h3>${this.currentFilter === 'all' ? 'No notes pinned yet.' : `No ${this.currentFilter} notes found.`}</h3>
                            <p>Pin your first note above!</p>
                        </div>
                    `;
                } else {
                    taskList.innerHTML = filteredTasks
                        .sort((a, b) => {
                            if (a.completed !== b.completed) {
                                return a.completed ? 1 : -1;
                            }
                            const priorityOrder = { high: 3, medium: 2, low: 1 };
                            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                                return priorityOrder[b.priority] - priorityOrder[a.priority];
                            }
                            return b.id - a.id;
                        })
                       .map((task, index) => `
                    <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" 
                         onclick="taskManager.toggleTask(${task.id})"
                         style="transform: rotate(${task.rotation}deg); --i: ${index};">
                        
                        <div class="task-content">
                            <div class="task-text">${this.escapeHtml(task.text)}</div>
                            <div class="task-meta">
                                <span>Pinned: ${task.createdAt}</span>
                            </div>
                        </div>
                        <div class="task-actions" onclick="event.stopPropagation()">
                            <button class="action-btn edit-btn" onclick="taskManager.editTask(${task.id})" title="Edit Note">✏️</button>
                            <button class="action-btn delete-btn" onclick="taskManager.deleteTask(${task.id})" title="Tear Off">🗑️</button>
                        </div>
                    </div>
                `).join('');
                }

                this.updateStats();
            }

            updateStats() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.completed).length;
                const pending = total - completed;

                document.getElementById('totalTasks').textContent = total;
                document.getElementById('completedTasks').textContent = completed;
                document.getElementById('pendingTasks').textContent = pending;
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            saveTasks() {
                localStorage.setItem('sticky_tasks', JSON.stringify(this.tasks));
            }

            loadTasks() {
                try {
                    const storedTasks = localStorage.getItem('sticky_tasks');
                    if (storedTasks) {
                        this.tasks = JSON.parse(storedTasks);
                    } else {
                        this.tasks = [
                            { id: 1, text: "Click on any note to mark it as Finished!", priority: "high", completed: false, rotation: -0.8, createdAt: new Date().toLocaleDateString() },
                            { id: 2, text: "Pin a new note using the input box above.", priority: "medium", completed: false, rotation: 1.2, createdAt: new Date().toLocaleDateString() },
                            { id: 3, text: "Change the note color by setting its priority.", priority: "low", completed: true, rotation: 0.5, createdAt: new Date().toLocaleDateString() }
                        ]
                    }
                } catch (error) {
                    console.error("Error loading tasks:", error);
                    this.tasks = [];
                }
            }
        }
        const taskManager = new TaskManager();