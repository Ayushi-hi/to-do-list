document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');

    // Set default date and time values
    const now = new Date();
    dateInput.valueAsDate = now;
    timeInput.value = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Function to save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to format date and time
    const formatDateTime = (date, time) => {
        const dateObj = new Date(date + 'T' + time);
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to render tasks
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        // Sort tasks by date and time
        tasks.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            if (task.hasAlarm) {
                li.classList.add('task-alarm-active');
            }
            li.innerHTML = `
                <div class="task-content">
                    ${task.text}
                    <div class="task-date">
                        ${formatDateTime(task.date, task.time)}
                        ${task.hasAlarm ? '<i class="fas fa-bell alarm-icon"></i>' : ''}
                    </div>
                </div>
                <button class="delete-btn">Delete</button>
            `;

            if (task.completed) {
                li.classList.add('completed');
            }

            // Toggle completion status
            li.addEventListener('click', (e) => {
                if (e.target !== li.querySelector('.delete-btn')) {
                    tasks[index].completed = !tasks[index].completed;
                    saveTasks();
                    renderTasks();
                }
            });

            // Delete task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            });

            taskList.appendChild(li);
        });
    };

    // Add new task
    const addTask = () => {
        const text = taskInput.value.trim();
        const date = dateInput.value;
        const time = timeInput.value;
        const hasAlarm = alarmToggle.checked;

        if (text && date && time) {
            tasks.push({
                text,
                date,
                time,
                completed: false,
                hasAlarm
            });
            taskInput.value = '';
            alarmToggle.checked = false;
            // Reset date and time to current
            const now = new Date();
            dateInput.valueAsDate = now;
            timeInput.value = now.getHours().toString().padStart(2, '0') + ':' + 
                             now.getMinutes().toString().padStart(2, '0');
            saveTasks();
            renderTasks();
        }
    };

    // Event listeners
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Add theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    const alarmToggle = document.getElementById('alarmToggle');
    const alarmSound = document.getElementById('alarmSound');
    
    // Check for alarms
    const checkAlarms = () => {
        const now = new Date();
        tasks.forEach((task, index) => {
            if (task.hasAlarm && !task.completed) {
                const taskDateTime = new Date(task.date + 'T' + task.time);
                if (now >= taskDateTime && now - taskDateTime < 60000) { // Within 1 minute
                    playAlarm(task);
                }
            }
        });
    };

    // Play alarm sound and show notification
    const playAlarm = (task) => {
        alarmSound.play();
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Task Reminder", {
                body: task.text,
                icon: "/favicon.ico"
            });
        }
        
        // Create alert dialog
        const alertDialog = document.createElement('div');
        alertDialog.style.position = 'fixed';
        alertDialog.style.top = '20px';
        alertDialog.style.right = '20px';
        alertDialog.style.padding = '20px';
        alertDialog.style.backgroundColor = '#ff4444';
        alertDialog.style.color = 'white';
        alertDialog.style.borderRadius = '5px';
        alertDialog.style.zIndex = '1000';
        alertDialog.innerHTML = `
            <p><strong>Task Reminder:</strong> ${task.text}</p>
            <button onclick="this.parentElement.remove(); alarmSound.pause();">Dismiss</button>
        `;
        document.body.appendChild(alertDialog);
    };

    // Request notification permission
    if ("Notification" in window) {
        Notification.requestPermission();
    }

    // Check for alarms every minute
    setInterval(checkAlarms, 60000);

    // Initial render
    renderTasks();
}); 