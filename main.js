// 全域變數存放專案資料
let projectsData = [];

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
  // 載入專案資料
  loadProjects();
  
  // 綁定新增專案按鈕事件
  document.querySelector('.add-project-btn').addEventListener('click', openAddProjectModal);
  
  // 綁定取消按鈕事件
  document.getElementById('cancel-btn').addEventListener('click', closeAddProjectModal);
  
  // 綁定表單提交事件
  document.getElementById('add-project-form').addEventListener('submit', handleFormSubmit);
});

// 載入專案資料
async function loadProjects() {
  try {
    // 檢查 localStorage 是否有資料
    const localData = localStorage.getItem('projectsData');
    if (localData) {
      projectsData = JSON.parse(localData);
      renderProjects();
      return;
    }
    
    // 若無本地資料，從檔案載入
    const response = await fetch('data/project.data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    projectsData = await response.json();
    
    // 儲存到 localStorage
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    
    // 渲染專案卡片
    renderProjects();
  } catch (error) {
    console.error('載入專案資料失敗:', error);
    // 若載入失敗，使用預設資料
    projectsData = getDefaultProjects();
    renderProjects();
  }
}

// 渲染專案卡片
function renderProjects() {
  const projectsGrid = document.querySelector('.projects-grid');
  projectsGrid.innerHTML = '';
  
  projectsData.forEach((project) => {
    // 建立專案卡片
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-project-id', project.id); // 設置專案 ID
    
    // 添加點擊事件
    card.addEventListener('click', () => {
      window.location.href = `project-detail.html?id=${project.id}`;
    });
    
    // 取得狀態類別
    const statusClass = getStatusClass(project.status);
    
    // 格式化日期
    const dueDate = formatDate(project.due);
    
    // 設定卡片內容
    card.innerHTML = `
      <h2 class="project-name">${project.name}</h2>
      <div class="project-owner">${project.owner}</div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fg" style="width: ${project.progress}%"></div>
        <span class="progress-percent">${project.progress}%</span>
      </div>
      <div class="project-status">Status: <span class="${statusClass}">${project.status}</span></div>
      <div class="project-due">Due: ${dueDate}</div>
      <div class="project-id">Id: ${project.id}</div>
    `;
    
    // 添加滑鼠懸停效果，增強可點擊感
    card.style.cursor = 'pointer';
    
    projectsGrid.appendChild(card);
  });
}

// 開啟新增專案彈窗
function openAddProjectModal() {
  const modal = document.getElementById('add-project-modal');
  modal.style.display = 'flex';
  
  // 設定今天日期為最小日期
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('project-due').min = today;
  
  // 預設日期為一個月後
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  document.getElementById('project-due').value = nextMonth.toISOString().split('T')[0];
}

// 關閉新增專案彈窗
function closeAddProjectModal() {
  const modal = document.getElementById('add-project-modal');
  modal.style.display = 'none';
  document.getElementById('add-project-form').reset();
}

// 處理表單提交
function handleFormSubmit(e) {
  e.preventDefault();
  
  // 取得表單資料
  const name = document.getElementById('project-name').value;
  const owner = document.getElementById('project-owner').value;
  const due = document.getElementById('project-due').value;
  
  // 建立新專案物件
  // 找出目前最大的 ID，然後 +1
  const maxId = projectsData.reduce((max, project) => {
    return project.id > max ? project.id : max;
  }, 0);
  
  const newProject = {
    id: maxId + 1, // 自增 ID
    name,
    owner,
    progress: 0,
    status: 'In Progress',
    due
  };
  
  // 新增到專案資料
  projectsData.push(newProject);
  
  // 儲存到 localStorage
  localStorage.setItem('projectsData', JSON.stringify(projectsData));
  
  // 重新渲染專案卡片
  renderProjects();
  
  // 關閉彈窗
  closeAddProjectModal();
}

// 取得狀態類別
function getStatusClass(status) {
  switch(status) {
    case 'In Progress':
      return 'status-inprogress';
    case 'Delayed':
      return 'status-delayed';
    case 'Completed':
      return 'status-completed';
    default:
      return 'status-inprogress';
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// 取得預設專案資料
function getDefaultProjects() {
  return [
    {
      id: 1,
      name: "專案 Alpha",
      owner: "John Smith",
      progress: 70,
      status: "In Progress",
      due: "2025-05-31"
    }
  ];
}

// 新增專案按鈕事件（為了保持原有的 onclick 相容性）
function addProject() {
  openAddProjectModal();
}

// 清除本地資料
function clearLocalData() {
  if (confirm('確定要清除所有專案資料嗎？此操作無法復原。')) {
    localStorage.removeItem('projectsData');
    projectsData = [];
    renderProjects();
    alert('專案資料已清除！');
  }
}
