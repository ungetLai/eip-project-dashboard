// 全域變數存放專案資料
let projectData = null;

// 頁面載入時初始化
// 存放專案任務資料
let projectTasks = [];

document.addEventListener('DOMContentLoaded', () => {
  // 從 URL 獲取專案 ID
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  if (!projectId) {
    alert('未指定專案 ID，將返回專案列表');
    window.location.href = 'index.html';
    return;
  }
  
  // 載入專案資料
  loadProjectDetail(projectId);
  
  // 綁定留言提交事件
  document.querySelector('.comment-submit').addEventListener('click', addComment);
  
  // 綁定新增任務按鈕事件
  document.getElementById('add-task-btn').addEventListener('click', openAddTaskModal);
  
  // 綁定取消按鈕事件
  document.getElementById('cancel-task-btn').addEventListener('click', closeAddTaskModal);
  
  // 綁定表單提交事件
  document.getElementById('add-task-form').addEventListener('submit', handleTaskFormSubmit);
});

// 載入專案詳細資料
async function loadProjectDetail(projectId) {
  try {
    // 從 localStorage 載入專案資料
    const localData = localStorage.getItem('projectsData');
    if (localData) {
      const projects = JSON.parse(localData);
      // 使用專案 ID 查找專案
      projectData = projects.find(project => project.id === parseInt(projectId));
      
      if (projectData) {
        updateProjectInfo();
        loadProjectTasks();
        return;
      }
    }
    
    // 如果 localStorage 沒有資料，使用預設專案資料
    const projects = getDefaultProjects();
    
    // 使用專案 ID 查找專案
    projectData = projects.find(project => project.id === parseInt(projectId));
    
    if (!projectData) {
      alert('找不到指定專案，將返回專案列表');
      window.location.href = 'index.html';
      return;
    }
    
    // 更新頁面資訊
    updateProjectInfo();
    
    // 載入專案任務
    loadProjectTasks();
    
  } catch (error) {
    console.error('載入專案詳細資料失敗:', error);
    alert('載入專案詳細資料失敗，請稍後再試。');
  }
}

// 更新專案基本資訊
function updateProjectInfo() {
  // 更新標題
  document.title = `${projectData.name} - 專案詳細資訊`;
  document.getElementById('project-title').textContent = projectData.name;
  
  // 更新基本資訊
  document.getElementById('project-owner').textContent = projectData.owner;
  
  // 更新狀態
  const statusElement = document.getElementById('project-status');
  const statusClass = getStatusClass(projectData.status);
  statusElement.innerHTML = `<span class="status-badge ${statusClass}">${projectData.status}</span>`;
  
  // 更新進度
  document.getElementById('project-progress-bar').style.width = `${projectData.progress}%`;
  document.getElementById('project-progress').textContent = `${projectData.progress}%`;
  
  // 更新截止日期
  const dueDate = new Date(projectData.due);
  document.getElementById('project-due').textContent = formatDate(dueDate, 'long');
  
  // 計算剩餘天數
  const today = new Date();
  const timeDiff = dueDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  const remainingElement = document.getElementById('project-remaining');
  if (daysDiff < 0) {
    remainingElement.textContent = `已逾期 ${Math.abs(daysDiff)} 天`;
    remainingElement.style.color = '#d7263d';
  } else if (daysDiff === 0) {
    remainingElement.textContent = '今日截止';
    remainingElement.style.color = '#ff6f3c';
  } else {
    remainingElement.textContent = `剩餘 ${daysDiff} 天`;
    remainingElement.style.color = daysDiff <= 7 ? '#ff6f3c' : '#333';
  }
}

// 載入專案任務
function loadProjectTasks() {
  const tasksContainer = document.getElementById('tasks-container');
  
  // 從 localStorage 載入任務資料
  const localTasks = localStorage.getItem(`projectTasks_${projectData.id}`);
  if (localTasks) {
    projectTasks = JSON.parse(localTasks);
  } else {
    // 如果沒有儲存的任務資料，使用預設任務
    projectTasks = [
      {
        id: 1,
        title: '需求文件撰寫',
        assignee: 'Jane Doe',
        dueDate: '2025-04-10',
        completed: true
      },
      {
        id: 2,
        title: '系統架構設計',
        assignee: 'Michael Brown',
        dueDate: '2025-04-20',
        completed: true
      },
      {
        id: 3,
        title: '前端介面開發',
        assignee: 'Emily Wilson',
        dueDate: '2025-05-15',
        completed: false
      },
      {
        id: 4,
        title: '後端 API 開發',
        assignee: 'David Chen',
        dueDate: '2025-05-20',
        completed: false
      },
      {
        id: 5,
        title: '系統整合測試',
        assignee: 'Sophia Lee',
        dueDate: '2025-06-10',
        completed: false
      }
    ];
  }
  
  // 更新任務數量
  document.getElementById('task-count').textContent = projectTasks.length;
  
  // 清空容器
  tasksContainer.innerHTML = '';
  
  // 如果有任務，渲染任務列表
  if (projectTasks.length > 0) {
    projectTasks.forEach(task => {
      const taskClass = task.completed ? 'task-item task-completed' : 'task-item';
      const checked = task.completed ? 'checked' : '';
      
      const taskElement = document.createElement('div');
      taskElement.className = taskClass;
      taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${checked} data-task-id="${task.id}">
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <div class="task-assignee">負責人: ${task.assignee}</div>
            <div class="task-due">截止日: ${formatDate(new Date(task.dueDate))}</div>
          </div>
        </div>
      `;
      
      tasksContainer.appendChild(taskElement);
    });
    
    // 綁定任務勾選事件
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', toggleTaskStatus);
    });
  } else {
    // 如果沒有任務，顯示空狀態
    tasksContainer.innerHTML = '<div class="empty-state">尚無任務資料</div>';
  }
}

// 處理任務表單提交
function handleTaskFormSubmit(e) {
  e.preventDefault();
  
  // 取得表單資料
  const title = document.getElementById('task-title').value;
  const assignee = document.getElementById('task-assignee').value;
  const dueDate = document.getElementById('task-due').value;
  
  // 找出目前最大的 ID，然後 +1
  const maxId = projectTasks.reduce((max, task) => {
    return task.id > max ? task.id : max;
  }, 0);
  
  // 建立新任務物件
  const newTask = {
    id: maxId + 1,
    title,
    assignee,
    dueDate,
    completed: false
  };
  
  // 新增到任務資料
  projectTasks.push(newTask);
  
  // 儲存到 localStorage
  localStorage.setItem(`projectTasks_${projectData.id}`, JSON.stringify(projectTasks));
  
  // 重新渲染任務列表
  loadProjectTasks();
  
  // 關閉彈窗
  closeAddTaskModal();
}

// 切換任務狀態
function toggleTaskStatus(e) {
  const taskId = parseInt(e.target.getAttribute('data-task-id'));
  const taskItem = e.target.closest('.task-item');
  
  if (e.target.checked) {
    taskItem.classList.add('task-completed');
  } else {
    taskItem.classList.remove('task-completed');
  }
  
  // 更新任務狀態
  const taskIndex = projectTasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    projectTasks[taskIndex].completed = e.target.checked;
    
    // 儲存到 localStorage
    localStorage.setItem(`projectTasks_${projectData.id}`, JSON.stringify(projectTasks));
    
    console.log(`任務 ${taskId} 狀態已更新為: ${e.target.checked ? '已完成' : '未完成'}`);
  }
}

// 新增留言
function addComment() {
  const commentInput = document.querySelector('.comment-input');
  const commentText = commentInput.value.trim();
  
  if (!commentText) {
    alert('請輸入留言內容');
    return;
  }
  
  // 取得目前時間
  const now = new Date();
  const timeString = formatDate(now, 'datetime');
  
  // 建立留言元素
  const commentItem = document.createElement('div');
  commentItem.className = 'comment-item';
  commentItem.innerHTML = `
    <div class="comment-avatar">ME</div>
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author">目前使用者</span>
        <span class="comment-time">${timeString}</span>
      </div>
      <div class="comment-text">
        ${commentText}
      </div>
    </div>
  `;
  
  // 插入留言
  const discussionContainer = document.querySelector('.discussion-container');
  discussionContainer.insertBefore(commentItem, document.querySelector('.add-comment'));
  
  // 清空輸入框
  commentInput.value = '';
  
  // 在實際應用中，這裡應該發送 API 請求儲存留言
  console.log('新增留言:', commentText);
}

// 取得狀態類別
function getStatusClass(status) {
  switch(status) {
    case 'In Progress':
      return 'in-progress';
    case 'Delayed':
      return 'delayed';
    case 'Completed':
      return 'completed';
    default:
      return 'in-progress';
  }
}

// 格式化日期
function formatDate(date, format = 'short') {
  if (format === 'short') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else if (format === 'long') {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  } else if (format === 'datetime') {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

// 取得預設專案資料
function getDefaultProjects() {
  return [
    {
      "id": 1,
      "name": "專案 Alpha",
      "owner": "John Smith",
      "progress": 70,
      "status": "In Progress",
      "due": "2025-05-31"
    }
  ];
}

// 開啟新增任務彈窗
function openAddTaskModal() {
  const modal = document.getElementById('add-task-modal');
  modal.style.display = 'flex';
  
  // 設定今天日期為最小日期
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('task-due').min = today;
  
  // 預設日期為兩週後
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  document.getElementById('task-due').value = twoWeeksLater.toISOString().split('T')[0];
}

// 關閉新增任務彈窗
function closeAddTaskModal() {
  const modal = document.getElementById('add-task-modal');
  modal.style.display = 'none';
  document.getElementById('add-task-form').reset();
}
