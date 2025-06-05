// script.js - Main functionality for Boss Mom Planner with Modern UI

// Wrap script in an Immediately Invoked Function Expression (IIFE)
(() => {
    // --- Constants ---
    const LOCAL_STORAGE_THEME_KEY = 'bossMomThemeDark';
    const LOCAL_STORAGE_REPO_KEY = 'bossMomPlannerRepo_v1';
    const SAVE_DEBOUNCE_DELAY = 1500;

    // --- State ---
    let currentPlannerKey = ""; // Tracks the key of the currently loaded planner
    let previousProgress = 0; // Track progress for confetti trigger

    // --- DOM Element References ---
    const html = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const dateInput = document.getElementById('dateInput');
    const byInput = document.getElementById('byInput');
    const plannerWrapper = document.getElementById('plannerWrapper');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusMsg = document.getElementById('statusMsg');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const okHelpBtn = document.getElementById('okHelpBtn');
    const plannerSelect = document.getElementById('plannerSelect');
    const saveAsNewBtn = document.getElementById('saveAsNewBtn');
    const deletePlannerBtn = document.getElementById('deletePlannerBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    const duplicatePlannerBtn = document.getElementById('duplicatePlannerBtn');
    const clearCurrentBtn = document.getElementById('clearCurrentBtn');
    const searchPlannerInput = document.getElementById('searchPlannerInput');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importJsonBtn = document.getElementById('importJsonBtn');
    const importFileInput = document.getElementById('importFileInput');
    const autoSaveIndicator = document.getElementById('autoSaveIndicator');

    // --- SVG Icons ---
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>`;

    // --- Default Data ---
    const defaultDays = [
        { day: 'Monday', activity: '', chore: '' },
        { day: 'Tuesday', activity: '', chore: '' },
        { day: 'Wednesday', activity: '', chore: '' },
        { day: 'Thursday', activity: '', chore: '' },
        { day: 'Friday', activity: '', chore: '' },
        { day: 'Saturday', activity: '', chore: '' },
        { day: 'Sunday', activity: '', chore: '' }
    ];

    const defaultOrganizeChaosItems = [
        { text: 'Shower night before', checked: false },
        { text: 'Lay out clothes', checked: false },
        { text: 'Prep meals/snacks', checked: false },
        { text: 'Set coffee timer', checked: false },
        { text: 'Check work bag & keys', checked: false },
        { text: 'Pack kids bags', checked: false },
        { text: 'Quick tidy-up', checked: false }
    ];

    // --- Common Tips & Tricks ---
    const commonTipsAndTricks = [
        { category: 'Time Management', tips: [
            'Use the 2-minute rule: If a task takes less than 2 minutes, do it immediately',
            'Batch similar tasks together (e.g., all phone calls, all errands)',
            'Prepare everything the night before to reduce morning stress',
            'Set timers for focused work sessions (Pomodoro technique)'
        ]},
        { category: 'Organization', tips: [
            'Keep a family command center with calendars, keys, and important papers',
            'Use clear containers and labels for easy identification',
            'Implement a "one touch" rule: handle papers and emails only once',
            'Create designated spots for everything and stick to them'
        ]},
        { category: 'Family Coordination', tips: [
            'Hold weekly family meetings to discuss schedules and priorities',
            'Use color-coding for each family member in calendars and chores',
            'Create backup plans for childcare and transportation',
            'Teach kids age-appropriate responsibility and independence'
        ]},
        { category: 'Self-Care', tips: [
            'Schedule time for yourself like any other important appointment',
            'Practice saying "no" to commitments that don\'t align with your priorities',
            'Build in buffer time between activities to reduce rushing',
            'Celebrate small wins and progress, not just major accomplishments'
        ]}
    ];

    // --- Modern UI Functions ---
    
    // Ripple Effect
    function createRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Toast Notification
    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = '✓';
                toast.style.borderLeftColor = 'var(--success)';
                break;
            case 'error':
                icon = '❌';
                toast.style.borderLeftColor = 'var(--error)';
                break;
            case 'warning':
                icon = '⚠️';
                toast.style.borderLeftColor = 'var(--warning)';
                break;
            default:
                icon = 'ℹ️';
                toast.style.borderLeftColor = 'var(--accent)';
        }
        
        toast.innerHTML = `<span style="margin-right: 0.5rem;">${icon}</span>${message}`;
        document.body.appendChild(toast);
        
        // Force reflow to trigger animation
        toast.offsetHeight;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Confetti Animation for 100% completion
    function createConfetti() {
        const confettiCount = 100;
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        const colors = ['#8B4B6B', '#E8C5D1', '#F4A261', '#7C9885', '#E8B86D'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const animationDelay = Math.random() * 3;
            const animationDuration = Math.random() * 3 + 2;
            
            confetti.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: -20px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${animationDuration}s linear ${animationDelay}s;
            `;
            
            confettiContainer.appendChild(confetti);
        }
        
        document.body.appendChild(confettiContainer);
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            confettiContainer.remove();
            style.remove();
        }, 6000);
    }

    // Smooth scroll to element
    function smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Add floating action button
    function createFloatingActionButton() {
        const fab = document.createElement('button');
        fab.className = 'fab';
        fab.innerHTML = plusIcon;
        fab.title = 'Quick Add Task';
        
        fab.addEventListener('click', () => {
            const weeklyTasksSection = document.getElementById('section4');
            if (weeklyTasksSection) {
                weeklyTasksSection.open = true;
                smoothScrollTo(weeklyTasksSection);
                setTimeout(() => {
                    const addTaskBtn = weeklyTasksSection.querySelector('button[onclick*="weeklyTasksTable"]');
                    if (addTaskBtn) addTaskBtn.click();
                }, 300);
            }
        });
        
        document.body.appendChild(fab);
    }

    // --- Planner Section Definitions ---
    const sections = [
        // Section 1: Vision Board
        {
            title: 'Vision Board',
            id: '1',
            tips: ['Write out your vision for your life and what you want to achieve.',
                   'Be specific about your goals and aspirations.',
                   'Review regularly to stay motivated and focused.'],
            implementationNotes: 'Use this space to articulate your life vision and long-term goals. Consider what success looks like to you personally and professionally. Update this regularly as your priorities evolve.',
            build: (body) => {
                const inputGroup = createElement('div', 'input-group');
                const label = createElement('label', '', 'Your Vision');
                const textarea = createElement('textarea', 'w-full border border-gray-300 rounded p-2 track dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50 focus:border-transparent outline-none resize-y');
                textarea.placeholder = ' '; // Required for floating label
                textarea.id = 'vision';
                textarea.setAttribute('aria-label', 'Your Vision');
                textarea.rows = 6;
                
                inputGroup.appendChild(textarea);
                inputGroup.appendChild(label);
                body.appendChild(inputGroup);
            }
        },
        
        // Section 2: Organizing Chaos
        {
            title: 'Organizing Chaos', 
            id: '2',
            tips: ['Check off items to prepare for your day the night before.',
                  'Consistency in preparation leads to smoother mornings.',
                  'Add your own custom preparation steps.'],
            implementationNotes: 'Create a checklist of tasks to complete the night before to ensure smooth mornings. This reduces decision fatigue and morning stress. Customize this list based on your family\'s needs and routines.',
            build: (body) => {
                body.appendChild(createElement('p', 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-2', 'Night Before Preparation:'));
                const itemsContainer = createElement('div', 'space-y-2 mb-4');
                itemsContainer.id = 'chaosItemsContainer';
                body.appendChild(itemsContainer);
                const addButton = createElement('button', 'cmdBtn gradient-accent', '+ Add Preparation Item');
                addButton.type = "button";
                addButton.addEventListener('click', addChaosItem);
                body.appendChild(addButton);
            }
        },
        
        // Section 3: Kids Schedule
        {
            title: 'Kids Schedule', 
            id: '3',
            tableId: 'scheduleTable',
            tips: ['Organize your kids\' weekly activities.',
                  'Include sports practices, lessons, appointments, etc.',
                  'Color-code or add notes for different children if needed.'],
            implementationNotes: 'Track all children\'s activities, appointments, and commitments in one central location. Include pick-up/drop-off times, locations, and any special requirements. Consider adding contact information for coaches, teachers, or activity coordinators.',
            showCommonTips: ['Family Coordination'],
            build: (body) => {
                body.appendChild(createElement('h3', 'text-lg font-semibold border-b border-gray-300 dark:border-gray-600 pb-1 mb-2', 'Weekly Schedule'));
                const tableWrapper = createElement('div', 'table-wrapper');
                const table = createElement('table', 'min-w-full');
                table.id = 'scheduleTable';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Activities</th>
                            <th class="w-12 text-center">Del</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                tableWrapper.appendChild(table);
                body.appendChild(tableWrapper);
                const addButton = createElement('button', 'cmdBtn gradient-primary mt-2', 'Add Schedule Row');
                addButton.type = "button";
                addButton.onclick = () => addTableRow('scheduleTable', [
                    '<input type="text" placeholder="Day" aria-label="Day of the week" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">',
                    '<input type="text" placeholder="Activity" aria-label="Activity description" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">'
                ]);
                body.appendChild(addButton);
            }
        },
        
        // Section 4: Weekly Tasks
        {
            title: 'Weekly Tasks',
            id: '4', 
            tableId: 'weeklyTasksTable',
            tips: ['Break down your goals into manageable weekly tasks.',
                  'Check off tasks as you complete them.',
                  'Set realistic expectations for what you can accomplish.'],
            implementationNotes: 'Break down larger goals into specific, actionable weekly tasks. Focus on 3-7 key tasks to avoid overwhelm. Review and adjust weekly based on what was accomplished and what needs priority.',
            showCommonTips: ['Time Management'],
            build: (body) => {
                body.appendChild(createElement('h3', 'text-lg font-semibold border-b border-gray-300 dark:border-gray-600 pb-1 mb-2', 'Tasks For This Week'));
                const tableWrapper = createElement('div', 'table-wrapper');
                const table = createElement('table', 'min-w-full');
                table.id = 'weeklyTasksTable';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th class="w-24 text-center">Done</th>
                            <th class="w-12 text-center">Del</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                tableWrapper.appendChild(table);
                body.appendChild(tableWrapper);
                const addButton = createElement('button', 'cmdBtn gradient-primary mt-2', 'Add Task');
                addButton.type = "button";
                addButton.onclick = () => addTableRow('weeklyTasksTable', [
                    '<input type="text" placeholder="Task description" aria-label="Task description" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">',
                    createCheckbox('', '<span class="sr-only">Mark as completed</span>')
                ]);
                body.appendChild(addButton);
            }
        },
        
        // Section 5: Action Plan & Budget
        {
            title: 'Action Plan & Budget',
            id: '5',
            tableId: 'expenseTable',
            groceryTableId: 'groceryListTable',
            tips: ['Plan your weekly menu and grocery budget.',
                  'Track expenses to stay within your budget.',
                  'Update as you make purchases throughout the week.'],
            implementationNotes: 'Plan your weekly meals in advance to reduce food waste and impulse purchases. Set a realistic grocery budget and track all expenses. Use your grocery list to stay focused while shopping and avoid unnecessary items.',
            showCommonTips: ['Organization'],
            build: (body) => {
                const menuBudgetDiv = createElement('div', 'bg-white dark:bg-gray-700 p-4 rounded shadow mb-4');
                menuBudgetDiv.innerHTML = `
                    <h3 class="font-medium mb-2">Weekly Menu & Budget</h3>
                    <div class="input-group">
                        <input type="text" id="menuPlan" class="w-full border rounded p-2 track dark:bg-gray-700 dark:border-gray-600 border-gray-300" placeholder=" ">
                        <label for="menuPlan">Menu plan for the week</label>
                    </div>
                    <div class="input-group">
                        <input type="text" id="budgetAmount" inputMode="decimal" class="w-full border rounded p-2 track dark:bg-gray-700 dark:border-gray-600 border-gray-300" placeholder=" ">
                        <label for="budgetAmount">Budget Amount ($)</label>
                    </div>
                `;
                body.appendChild(menuBudgetDiv);
                
                body.appendChild(createElement('h3', 'text-lg font-semibold border-b border-gray-300 dark:border-gray-600 pb-1 mb-2', 'Grocery List'));
                const groceryTableWrapper = createElement('div', 'table-wrapper mb-4');
                const groceryTable = createElement('table', 'min-w-full');
                groceryTable.id = 'groceryListTable';
                groceryTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="w-12 text-center">Del</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                groceryTableWrapper.appendChild(groceryTable);
                body.appendChild(groceryTableWrapper);
                const addGroceryButton = createElement('button', 'cmdBtn gradient-accent mb-4', 'Add Grocery Item');
                addGroceryButton.type = "button";
                addGroceryButton.onclick = () => addTableRow('groceryListTable', [
                    '<input type="text" placeholder="Grocery item..." aria-label="Grocery item" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">'
                ]);
                body.appendChild(addGroceryButton);
                
                body.appendChild(createElement('h3', 'text-lg font-semibold border-b border-gray-300 dark:border-gray-600 pb-1 mb-2', 'Expense Tracker'));
                const expenseTableWrapper = createElement('div', 'table-wrapper');
                const expenseTable = createElement('table', 'min-w-full');
                expenseTable.id = 'expenseTable';
                expenseTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Expense</th>
                            <th class="w-24">Amount</th>
                            <th class="w-12 text-center">Del</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                expenseTableWrapper.appendChild(expenseTable);
                body.appendChild(expenseTableWrapper);
                const addExpenseButton = createElement('button', 'cmdBtn gradient-accent mt-2', 'Add Expense');
                addExpenseButton.type = "button";
                addExpenseButton.onclick = () => addTableRow('expenseTable', [
                    '<input type="text" placeholder="Expense item" aria-label="Expense item" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">',
                    '<div class="flex items-center"><span class="text-gray-500 mr-1">$</span><input type="text" inputMode="decimal" placeholder="0.00" aria-label="Amount" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track"></div>'
                ]);
                body.appendChild(addExpenseButton);
            }
        },
        
        // Section 6: Daily Chores Planning
        {
            title: 'Daily Chores Planning',
            id: '6',
            tableId: 'choresTable',
            tips: ['Assign daily chores to family members.',
                  'Rotate responsibilities weekly for fairness.',
                  'Include all household members in age-appropriate tasks.'],
            implementationNotes: 'Assign age-appropriate chores to family members and rotate responsibilities to keep things fair. Use the planning notes to track special considerations and the personal day section to focus on your own priorities and self-care.',
            showCommonTips: ['Family Coordination', 'Self-Care'],
            build: (body) => {
                body.appendChild(createElement('h3', 'text-lg font-semibold border-b border-gray-300 dark:border-gray-600 pb-1 mb-2', 'Daily Chores'));
                const tableWrapper = createElement('div', 'table-wrapper mb-4');
                const table = createElement('table', 'min-w-full');
                table.id = 'choresTable';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Chores</th>
                            <th class="w-12 text-center">Del</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;
                tableWrapper.appendChild(table);
                body.appendChild(tableWrapper);
                const addButton = createElement('button', 'cmdBtn gradient-primary mb-4', 'Add Chore Day');
                addButton.type = "button";
                addButton.onclick = () => addTableRow('choresTable', [
                    '<input type="text" placeholder="Day" aria-label="Day of the week" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">',
                    '<input type="text" placeholder="Chores" aria-label="Chore description" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">'
                ]);
                body.appendChild(addButton);
                
                body.appendChild(createElement('label', 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1', 'Planning Notes'));
                const planningTextarea = body.appendChild(createElement('textarea', 'w-full border border-gray-300 rounded p-2 mb-4 track dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50 focus:border-transparent outline-none resize-y'));
                planningTextarea.placeholder = 'Additional planning notes...';
                planningTextarea.id = 'planningNotes';
                planningTextarea.setAttribute('aria-label', 'Planning Notes');
                planningTextarea.rows = 3;
                
                body.appendChild(createElement('label', 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1', 'My Day Planning'));
                const myDayTextarea = body.appendChild(createElement('textarea', 'w-full border border-gray-300 rounded p-2 track dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50 focus:border-transparent outline-none resize-y'));
                myDayTextarea.placeholder = 'Plan your personal day...';
                myDayTextarea.id = 'myDay';
                myDayTextarea.setAttribute('aria-label', 'My Day Planning');
                myDayTextarea.rows = 3;
            }
        }
    ];

    // --- Theme Management ---
    function setTheme(isDark) {
        html.classList.toggle('dark', isDark);
        html.classList.toggle('light', !isDark);
        themeToggleBtn.innerHTML = `${isDark ? sunIcon : moonIcon} <span id="themeLabel">${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>`;
        try {
            localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDark);
        } catch (e) {
            console.error("Failed to save theme preference:", e);
            showToast("Could not save theme preference.", 'error');
        }
    }
    
    function initializeTheme() {
        let storedPref = null;
        try {
            storedPref = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
        } catch (e) {
            console.error("Failed to read theme preference:", e);
        }
        const isDark = storedPref !== null ?
            storedPref === 'true' :
            window.matchMedia('(prefers-color-scheme: dark)').matches;

        setTheme(isDark);

        if (storedPref === null) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener('change', (e) => setTheme(e.matches));
        }
    }

    // --- Utility Functions ---
    const createElement = (tag, className, innerHTML) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML !== undefined) element.innerHTML = innerHTML;
        return element;
    };
    
    function createCheckbox(id, labelText, isChecked = false) {
        const uniqueId = id || `checkbox_${Math.random().toString(36).substring(2, 9)}`;
        return `<label for="${uniqueId}" class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="${uniqueId}" class="track rounded text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-opacity-50 dark:bg-gray-600 dark:border-gray-500 border-gray-300" ${isChecked ? 'checked' : ''}>${labelText}</label>`;
    }
    
    function addTableRow(tableId, columns) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const row = tbody.insertRow();
        
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerHTML = col;
        });
        
        // Add delete button
        const deleteCell = row.insertCell();
        deleteCell.innerHTML = `<button type="button" class="delete-row-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Delete row">×</button>`;
        deleteCell.querySelector('button').addEventListener('click', function() {
            if (confirm('Delete this row?')) {
                row.remove();
                debounceAutoSave();
            }
        });
        
        // Add event listeners for tracking changes
        row.querySelectorAll('.track').forEach(el => {
            el.addEventListener('input', debounceAutoSave);
            el.addEventListener('change', debounceAutoSave);
        });
    }
    
    function addChaosItem() {
        const container = document.getElementById('chaosItemsContainer');
        const itemDiv = createElement('div', 'flex gap-2 items-center');
        const uniqueId = `chaos_${Math.random().toString(36).substring(2, 9)}`;
        
        itemDiv.innerHTML = `
            ${createCheckbox(uniqueId, '<input type="text" placeholder="New preparation item..." class="w-full border rounded p-1 track dark:bg-gray-700 dark:border-gray-600 border-gray-300" aria-label="Preparation item description">')}
            <button type="button" class="delete-row-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Delete item">×</button>
        `;
        
        container.appendChild(itemDiv);
        
        // Add event listeners
        itemDiv.querySelector('.delete-row-btn').addEventListener('click', () => {
            if (confirm('Delete this item?')) {
                itemDiv.remove();
                debounceAutoSave();
            }
        });
        
        itemDiv.querySelectorAll('.track').forEach(el => {
            el.addEventListener('input', debounceAutoSave);
            el.addEventListener('change', debounceAutoSave);
        });
        
        // Focus on the new input
        const newInput = itemDiv.querySelector('input[type="text"]');
        if (newInput) newInput.focus();
    }
    
    // --- Progress Calculation ---
    function calculateProgress() {
        const allInputs = plannerWrapper.querySelectorAll('input, textarea, select');
        const filledInputs = Array.from(allInputs).filter(input => {
            if (input.type === 'checkbox') return input.checked;
            return input.value && input.value.trim() !== '';
        });
        
        const percentage = allInputs.length > 0 ? Math.round((filledInputs.length / allInputs.length) * 100) : 0;
        
        // Update progress bar with animation
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Progress: ${percentage}%`;
        
        // Update header status badge
        updateStatusBadge(percentage);
        
        // Trigger confetti at 100% (only once)
        if (percentage === 100 && previousProgress < 100) {
            createConfetti();
            showToast('Congratulations! You\'ve completed your planner! 🎉', 'success');
        }
        
        previousProgress = percentage;
        return percentage;
    }
    
    function updateStatusBadge(percentage) {
        const badge = document.querySelector('.status-badge');
        if (!badge) return;
        
        badge.classList.remove('status-red', 'status-amber', 'status-green');
        
        if (percentage < 33) {
            badge.classList.add('status-red');
        } else if (percentage < 66) {
            badge.classList.add('status-amber');
        } else {
            badge.classList.add('status-green');
        }
    }
    
    // --- Local Storage Functions ---
    function loadFromLocalStorage() {
        try {
            const repo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_REPO_KEY) || '{}');
            return repo;
        } catch (e) {
            console.error("Failed to load from localStorage:", e);
            showToast("Failed to load saved data.", 'error');
            return {};
        }
    }
    
    function saveToLocalStorage(data) {
        try {
            localStorage.setItem(LOCAL_STORAGE_REPO_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Failed to save to localStorage:", e);
            showToast("Failed to save data. Storage might be full.", 'error');
            return false;
        }
    }
    
    // --- Data Collection & Persistence ---
    function collectData() {
        const data = {
            date: dateInput.value,
            by: byInput.value,
            sections: {}
        };
        
        // Collect data from each section
        sections.forEach(section => {
            const sectionData = {};
            const sectionEl = document.getElementById(`section${section.id}`);
            if (!sectionEl) return;
            
            // Collect text inputs and textareas
            sectionEl.querySelectorAll('input[type="text"], textarea').forEach(input => {
                if (input.id) {
                    sectionData[input.id] = input.value;
                }
            });
            
            // Collect checkboxes
            sectionEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.id) {
                    sectionData[checkbox.id] = checkbox.checked;
                }
            });
            
            // Collect table data
            if (section.tableId) {
                const table = document.getElementById(section.tableId);
                if (table) {
                    const rows = [];
                    table.querySelectorAll('tbody tr').forEach(row => {
                        const rowData = [];
                        row.querySelectorAll('input, textarea').forEach(input => {
                            if (input.type === 'checkbox') {
                                rowData.push({ type: 'checkbox', value: input.checked });
                            } else {
                                rowData.push({ type: 'text', value: input.value });
                            }
                        });
                        rows.push(rowData);
                    });
                    sectionData[`${section.tableId}Data`] = rows;
                }
            }
            
            // Special handling for Organizing Chaos items
            if (section.id === '2') {
                const chaosItems = [];
                document.querySelectorAll('#chaosItemsContainer > div').forEach(itemDiv => {
                    const checkbox = itemDiv.querySelector('input[type="checkbox"]');
                    const textInput = itemDiv.querySelector('input[type="text"]');
                    if (checkbox && textInput) {
                        chaosItems.push({
                            checked: checkbox.checked,
                            text: textInput.value
                        });
                    }
                });
                sectionData.chaosItems = chaosItems;
            }
            
            data.sections[section.id] = sectionData;
        });
        
        return data;
    }
    
    function restoreData(data) {
        if (!data) return;
        
        // Restore header data
        if (data.date) dateInput.value = data.date;
        if (data.by) byInput.value = data.by;
        
        // Restore sections
        if (data.sections) {
            sections.forEach(section => {
                const sectionData = data.sections[section.id];
                if (!sectionData) return;
                
                const sectionEl = document.getElementById(`section${section.id}`);
                if (!sectionEl) return;
                
                // Restore text inputs and textareas
                Object.keys(sectionData).forEach(key => {
                    if (key.endsWith('Data') || key === 'chaosItems') return;
                    
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = sectionData[key];
                        } else {
                            element.value = sectionData[key];
                        }
                    }
                });
                
                // Restore table data
                if (section.tableId && sectionData[`${section.tableId}Data`]) {
                    const tableData = sectionData[`${section.tableId}Data`];
                    tableData.forEach(rowData => {
                        const columns = rowData.map(cell => {
                            if (cell.type === 'checkbox') {
                                return createCheckbox('', '<span class="sr-only">Checkbox</span>', cell.value);
                            } else {
                                return `<input type="text" value="${cell.value || ''}" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">`;
                            }
                        });
                        addTableRow(section.tableId, columns);
                    });
                }
                
                // Special handling for Organizing Chaos items
                if (section.id === '2' && sectionData.chaosItems) {
                    const container = document.getElementById('chaosItemsContainer');
                    container.innerHTML = ''; // Clear default items
                    
                    sectionData.chaosItems.forEach(item => {
                        const itemDiv = createElement('div', 'flex gap-2 items-center');
                        const uniqueId = `chaos_${Math.random().toString(36).substring(2, 9)}`;
                        
                        itemDiv.innerHTML = `
                            ${createCheckbox(uniqueId, `<input type="text" value="${item.text || ''}" class="w-full border rounded p-1 track dark:bg-gray-700 dark:border-gray-600 border-gray-300" aria-label="Preparation item description">`, item.checked)}
                            <button type="button" class="delete-row-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Delete item">×</button>
                        `;
                        
                        container.appendChild(itemDiv);
                        
                        // Add event listeners
                        itemDiv.querySelector('.delete-row-btn').addEventListener('click', () => {
                            if (confirm('Delete this item?')) {
                                itemDiv.remove();
                                debounceAutoSave();
                            }
                        });
                        
                        itemDiv.querySelectorAll('.track').forEach(el => {
                            el.addEventListener('input', debounceAutoSave);
                            el.addEventListener('change', debounceAutoSave);
                        });
                    });
                }
            });
        }
        
        // Calculate progress after restoring
        calculateProgress();
    }
    
    // --- Save Functions ---
    let saveTimeout;
    function debounceAutoSave() {
        // Show auto-save indicator
        if (autoSaveIndicator) {
            autoSaveIndicator.classList.remove('opacity-0');
            autoSaveIndicator.textContent = 'Saving...';
        }
        
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveCurrentPlanner();
            if (autoSaveIndicator) {
                autoSaveIndicator.textContent = 'Saved';
                setTimeout(() => {
                    autoSaveIndicator.classList.add('opacity-0');
                }, 2000);
            }
        }, SAVE_DEBOUNCE_DELAY);
    }
    
    function saveCurrentPlanner() {
        if (!currentPlannerKey) {
            currentPlannerKey = generatePlannerKey();
        }
        
        const data = collectData();
        const repo = loadFromLocalStorage();
        repo[currentPlannerKey] = {
            ...data,
            lastModified: new Date().toISOString()
        };
        
        if (saveToLocalStorage(repo)) {
            updatePlannerSelect();
            return true;
        }
        return false;
    }
    
    function generatePlannerKey() {
        const date = dateInput.value || new Date().toISOString().split('T')[0];
        const by = byInput.value || 'Unknown';
        return `planner_${date}_${by}_${Date.now()}`;
    }
    
    // --- Planner Management Functions ---
    function updatePlannerSelect() {
        const repo = loadFromLocalStorage();
        const keys = Object.keys(repo).sort((a, b) => {
            const dateA = repo[a].lastModified || '';
            const dateB = repo[b].lastModified || '';
            return dateB.localeCompare(dateA);
        });
        
        plannerSelect.innerHTML = '<option value="">-- Select a Planner --</option>';
        
        keys.forEach(key => {
            const planner = repo[key];
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${planner.date || 'No date'} - ${planner.by || 'Unknown'}`;
            if (key === currentPlannerKey) {
                option.selected = true;
            }
            plannerSelect.appendChild(option);
        });
    }
    
    function loadPlanner(key) {
        if (!key) return;
        
        const repo = loadFromLocalStorage();
        const plannerData = repo[key];
        
        if (plannerData) {
            clearAll(false); // Don't confirm
            currentPlannerKey = key;
            restoreData(plannerData);
            updatePlannerSelect();
            showToast('Planner loaded successfully!', 'success');
        }
    }
    
    function deletePlanner(key) {
        if (!key) return;
        
        if (confirm('Are you sure you want to delete this planner? This cannot be undone.')) {
            const repo = loadFromLocalStorage();
            delete repo[key];
            
            if (saveToLocalStorage(repo)) {
                if (key === currentPlannerKey) {
                    currentPlannerKey = '';
                    clearAll(false);
                }
                updatePlannerSelect();
                showToast('Planner deleted successfully.', 'success');
            }
        }
    }
    
    function duplicatePlanner() {
        const data = collectData();
        const newKey = generatePlannerKey();
        const repo = loadFromLocalStorage();
        
        repo[newKey] = {
            ...data,
            lastModified: new Date().toISOString()
        };
        
        if (saveToLocalStorage(repo)) {
            currentPlannerKey = newKey;
            updatePlannerSelect();
            showToast('Planner duplicated successfully!', 'success');
        }
    }
    
    // --- Export/Import Functions ---
    function exportToPDF() {
        window.print();
    }
    
    function exportToJSON() {
        const data = collectData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boss-mom-planner-${data.date || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Add success animation to button
        exportJsonBtn.classList.add('success');
        setTimeout(() => exportJsonBtn.classList.remove('success'), 2000);
        
        showToast('Planner exported successfully!', 'success');
    }
    
    function importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                clearAll(false);
                restoreData(data);
                currentPlannerKey = generatePlannerKey();
                saveCurrentPlanner();
                showToast('Planner imported successfully!', 'success');
            } catch (error) {
                console.error('Import error:', error);
                showToast('Failed to import file. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // --- Clear Functions ---
    function clearAll(confirm = true) {
        if (confirm && !window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            return;
        }
        
        // Clear all inputs
        plannerWrapper.querySelectorAll('input[type="text"], textarea').forEach(input => {
            input.value = '';
        });
        
        plannerWrapper.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear all table rows
        plannerWrapper.querySelectorAll('tbody').forEach(tbody => {
            tbody.innerHTML = '';
        });
        
        // Reset chaos items to default
        const chaosContainer = document.getElementById('chaosItemsContainer');
        if (chaosContainer) {
            chaosContainer.innerHTML = '';
            defaultOrganizeChaosItems.forEach(item => {
                const itemDiv = createElement('div', 'flex gap-2 items-center');
                const uniqueId = `chaos_${Math.random().toString(36).substring(2, 9)}`;
                
                itemDiv.innerHTML = `
                    ${createCheckbox(uniqueId, `<input type="text" value="${item.text}" class="w-full border rounded p-1 track dark:bg-gray-700 dark:border-gray-600 border-gray-300" aria-label="Preparation item description">`, item.checked)}
                    <button type="button" class="delete-row-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Delete item">×</button>
                `;
                
                chaosContainer.appendChild(itemDiv);
                
                // Add event listeners
                itemDiv.querySelector('.delete-row-btn').addEventListener('click', () => {
                    if (window.confirm('Delete this item?')) {
                        itemDiv.remove();
                        debounceAutoSave();
                    }
                });
                
                itemDiv.querySelectorAll('.track').forEach(el => {
                    el.addEventListener('input', debounceAutoSave);
                    el.addEventListener('change', debounceAutoSave);
                });
            });
        }
        
        // Add default rows to tables
        defaultDays.forEach(dayData => {
            addTableRow('scheduleTable', [
                `<input type="text" value="${dayData.day}" placeholder="Day" aria-label="Day of the week" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">`,
                `<input type="text" value="${dayData.activity}" placeholder="Activity" aria-label="Activity description" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">`
            ]);
            
            addTableRow('choresTable', [
                `<input type="text" value="${dayData.day}" placeholder="Day" aria-label="Day of the week" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">`,
                `<input type="text" value="${dayData.chore}" placeholder="Chores" aria-label="Chore description" class="w-full border p-1 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded track">`
            ]);
        });
        
        calculateProgress();
        if (confirm) {
            showToast('Planner cleared successfully.', 'info');
        }
    }
    
    // --- Initialization ---
    function buildPlanner() {
        plannerWrapper.innerHTML = '';
        
        sections.forEach(section => {
            const details = createElement('details', 'p-4 bg-white dark:bg-gray-800 shadow rounded-lg');
            details.id = `section${section.id}`;
            details.open = true;
            
            const summary = createElement('summary', 'font-bold text-lg cursor-pointer select-none hover:text-[var(--accent)] transition-colors');
            summary.textContent = section.title;
            details.appendChild(summary);
            
            // Add implementation notes if available
            if (section.implementationNotes) {
                const notesBox = createElement('div', 'implementation-notes bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-3 mt-3 mb-4');
                const notesTitle = createElement('p', 'font-semibold text-blue-800 dark:text-blue-200 mb-1', '📋 Implementation Notes:');
                notesBox.appendChild(notesTitle);
                const notesText = createElement('p', 'text-sm text-blue-700 dark:text-blue-300', section.implementationNotes);
                notesBox.appendChild(notesText);
                details.appendChild(notesBox);
            }
            
            // Add tips if available
            if (section.tips && section.tips.length > 0) {
                const tipsBox = createElement('div', 'tips-box bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-3 mt-3 mb-4');
                const tipsTitle = createElement('p', 'font-semibold text-yellow-800 dark:text-yellow-200 mb-1', '💡 Tips:');
                tipsBox.appendChild(tipsTitle);
                const tipsList = createElement('ul', 'text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside');
                section.tips.forEach(tip => {
                    const li = createElement('li', '', tip);
                    tipsList.appendChild(li);
                });
                tipsBox.appendChild(tipsList);
                details.appendChild(tipsBox);
            }
            
            // Add common tips if specified
            if (section.showCommonTips && section.showCommonTips.length > 0) {
                const commonTipsBox = createElement('div', 'common-tips-box bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-3 mt-3 mb-4');
                const commonTipsTitle = createElement('p', 'font-semibold text-green-800 dark:text-green-200 mb-2', '🌟 Expert Tips & Tricks:');
                commonTipsBox.appendChild(commonTipsTitle);
                
                section.showCommonTips.forEach(categoryName => {
                    const category = commonTipsAndTricks.find(cat => cat.category === categoryName);
                    if (category) {
                        const categoryDiv = createElement('div', 'mb-3 last:mb-0');
                        const categoryTitle = createElement('p', 'font-medium text-green-700 dark:text-green-300 mb-1', `${categoryName}:`);
                        categoryDiv.appendChild(categoryTitle);
                        const categoryList = createElement('ul', 'text-sm text-green-600 dark:text-green-400 space-y-1 list-disc list-inside ml-2');
                        category.tips.forEach(tip => {
                            const li = createElement('li', '', tip);
                            categoryList.appendChild(li);
                        });
                        categoryDiv.appendChild(categoryList);
                        commonTipsBox.appendChild(categoryDiv);
                    }
                });
                details.appendChild(commonTipsBox);
            }
            
            const body = createElement('div', 'mt-4');
            section.build(body);
            details.appendChild(body);
            
            plannerWrapper.appendChild(details);
        });
        
        // Add event listeners to all trackable elements
        document.querySelectorAll('.track').forEach(element => {
            element.addEventListener('input', () => {
                calculateProgress();
                debounceAutoSave();
            });
            element.addEventListener('change', () => {
                calculateProgress();
                debounceAutoSave();
            });
        });
        
        calculateProgress();
    }
    
    function initializeEventListeners() {
        // Theme toggle
        themeToggleBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            const isDark = html.classList.contains('dark');
            setTheme(!isDark);
        });
        
        // Date input - set to today
        dateInput.valueAsDate = new Date();
        dateInput.addEventListener('change', debounceAutoSave);
        byInput.addEventListener('input', debounceAutoSave);
        
        // Save button
        saveBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            if (saveCurrentPlanner()) {
                saveBtn.classList.add('success');
                setTimeout(() => saveBtn.classList.remove('success'), 2000);
                showToast('Planner saved successfully!', 'success');
            }
        });
        
        // Export buttons
        exportBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            exportToPDF();
        });
        
        exportJsonBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            exportToJSON();
        });
        
        // Import button
        importJsonBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            importFileInput.click();
        });
        
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importFromJSON(file);
                e.target.value = ''; // Reset input
            }
        });
        
        // Print button
        printBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            window.print();
        });
        
        // Clear buttons
        clearBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            clearAll(true);
        });
        
        clearCurrentBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            clearAll(true);
        });
        
        // Help modal
        helpBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            helpModal.showModal();
        });
        
        closeHelpBtn.addEventListener('click', () => helpModal.close());
        okHelpBtn.addEventListener('click', () => helpModal.close());
        
        // Planner management
        plannerSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                loadPlanner(e.target.value);
            }
        });
        
        saveAsNewBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            currentPlannerKey = generatePlannerKey();
            if (saveCurrentPlanner()) {
                showToast('Saved as new planner!', 'success');
            }
        });
        
        deletePlannerBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            if (currentPlannerKey) {
                deletePlanner(currentPlannerKey);
            }
        });
        
        duplicatePlannerBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            duplicatePlanner();
        });
        
        // Expand/Collapse all
        expandAllBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            document.querySelectorAll('#plannerWrapper details').forEach(details => {
                details.open = true;
            });
        });
        
        collapseAllBtn.addEventListener('click', (e) => {
            createRippleEffect(e);
            document.querySelectorAll('#plannerWrapper details').forEach(details => {
                details.open = false;
            });
        });
        
        // Search functionality
        searchPlannerInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = plannerSelect.querySelectorAll('option');
            
            options.forEach(option => {
                if (option.value === '') return; // Skip placeholder
                
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
        
        // Add ripple effect to all buttons
        document.querySelectorAll('.cmdBtn, button').forEach(button => {
            button.addEventListener('click', createRippleEffect);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveBtn.click();
            }
            
            // Ctrl/Cmd + P to print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                printBtn.click();
            }
            
            // Escape to close modal
            if (e.key === 'Escape' && helpModal.open) {
                helpModal.close();
            }
        });
    }
    
    // --- Main Initialization ---
    function init() {
        initializeTheme();
        buildPlanner();
        initializeEventListeners();
        updatePlannerSelect();
        createFloatingActionButton();
        initGoogleSheetsIntegration();
        initCalendar();
        
        // Load the most recent planner or create default content
        const repo = loadFromLocalStorage();
        const keys = Object.keys(repo).sort((a, b) => {
            const dateA = repo[a].lastModified || '';
            const dateB = repo[b].lastModified || '';
            return dateB.localeCompare(dateA);
        });
        
        if (keys.length > 0) {
            // Load the most recent planner
            loadPlanner(keys[0]);
        } else {
            // Initialize with default data
            clearAll(false);
        }
        
        // Show welcome message
        setTimeout(() => {
            showToast('Welcome to Boss Mom Planner! 💪', 'info');
        }, 500);
    }
    
    // --- Google Sheets Integration ---
    function initGoogleSheetsIntegration() {
        // Initialize Google API when it's loaded
        if (typeof gapi !== 'undefined') {
            gapi.load('client:auth2', () => {
                if (window.googleSheets && window.googleSheets.initGoogleApi) {
                    window.googleSheets.initGoogleApi();
                }
            });
        }
        
        // Connect sync button
        const syncGoogleSheetsBtn = document.getElementById('syncGoogleSheetsBtn');
        if (syncGoogleSheetsBtn) {
            syncGoogleSheetsBtn.addEventListener('click', (e) => {
                createRippleEffect(e);
                exportToGoogleSheets();
            });
        }
    }
    
    function exportToGoogleSheets() {
        if (!window.googleSheets || !window.googleSheets.isAuthorized()) {
            showToast('Please connect to Google Sheets first', 'warning');
            const authModal = document.getElementById('authModal');
            if (authModal) authModal.showModal();
            return;
        }
        
        const data = collectData();
        
        // Convert data format for Google Sheets
        const sheetsData = {
            metadata: {
                date: data.date || new Date().toISOString().split('T')[0],
                completedBy: data.by || 'Unknown',
                savedAt: new Date().toISOString()
            },
            sections: data.sections
        };
        
        const title = `Boss Mom Planner - ${sheetsData.metadata.date}`;
        
        // Show loading state
        const syncBtn = document.getElementById('syncGoogleSheetsBtn');
        const originalText = syncBtn.innerHTML;
        syncBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Exporting...';
        syncBtn.disabled = true;
        
        window.googleSheets.createPlannerSpreadsheet(title, sheetsData)
            .then(result => {
                showToast('Successfully exported to Google Sheets!', 'success');
                
                // Open the spreadsheet in a new tab
                if (result.spreadsheetUrl) {
                    window.open(result.spreadsheetUrl, '_blank');
                }
            })
            .catch(error => {
                console.error('Export error:', error);
                showToast('Failed to export to Google Sheets', 'error');
            })
            .finally(() => {
                // Restore button state
                syncBtn.innerHTML = originalText;
                syncBtn.disabled = false;
            });
    }
    
    // --- Calendar Integration ---
    function initCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;
        
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            themeSystem: 'standard',
            height: 'auto',
            events: getCalendarEvents(),
            eventClick: function(info) {
                // Scroll to the relevant section when an event is clicked
                const sectionId = info.event.extendedProps.sectionId;
                if (sectionId) {
                    const section = document.getElementById(`section${sectionId}`);
                    if (section) {
                        section.open = true;
                        smoothScrollTo(section);
                    }
                }
            },
            eventColor: 'var(--primary-dark)',
            eventTextColor: 'white'
        });
        
        calendar.render();
        
        // Update calendar when data changes
        document.addEventListener('plannerDataChanged', () => {
            calendar.removeAllEvents();
            calendar.addEventSource(getCalendarEvents());
        });
    }
    
    function getCalendarEvents() {
        const events = [];
        const data = collectData();
        
        // Add events from Kids Schedule
        if (data.sections && data.sections['3']) {
            const scheduleData = data.sections['3'].scheduleTableData;
            if (scheduleData) {
                scheduleData.forEach(row => {
                    if (row[0] && row[0].value && row[1] && row[1].value) {
                        events.push({
                            title: `Kids: ${row[1].value}`,
                            daysOfWeek: [getDayOfWeek(row[0].value)],
                            extendedProps: { sectionId: '3' }
                        });
                    }
                });
            }
        }
        
        // Add events from Weekly Tasks
        if (data.sections && data.sections['4']) {
            const tasksData = data.sections['4'].weeklyTasksTableData;
            if (tasksData) {
                tasksData.forEach(row => {
                    if (row[0] && row[0].value && !row[1].value) { // Only show uncompleted tasks
                        events.push({
                            title: `Task: ${row[0].value}`,
                            start: data.date || new Date().toISOString().split('T')[0],
                            extendedProps: { sectionId: '4' }
                        });
                    }
                });
            }
        }
        
        // Add events from Daily Chores
        if (data.sections && data.sections['6']) {
            const choresData = data.sections['6'].choresTableData;
            if (choresData) {
                choresData.forEach(row => {
                    if (row[0] && row[0].value && row[1] && row[1].value) {
                        events.push({
                            title: `Chore: ${row[1].value}`,
                            daysOfWeek: [getDayOfWeek(row[0].value)],
                            extendedProps: { sectionId: '6' }
                        });
                    }
                });
            }
        }
        
        return events;
    }
    
    function getDayOfWeek(dayName) {
        const days = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        };
        return days[dayName.toLowerCase()] || 0;
    }
    
    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
