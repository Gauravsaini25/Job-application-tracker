
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const jobForm = document.getElementById('jobForm');
    const companyInput = document.getElementById('company');
    const positionInput = document.getElementById('position');
    const urlInput = document.getElementById('url');
    const statusInput = document.getElementById('status');
    const appliedDateInput = document.getElementById('appliedDate');
    const followUpDateInput = document.getElementById('followUpDate');
    const salaryInput = document.getElementById('salary');
    const contactInput = document.getElementById('contact');
    const notesInput = document.getElementById('notes');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const statusFilter = document.getElementById('statusFilter');
    const jobList = document.getElementById('jobList');
    const formTitle = document.getElementById('formTitle');
    const themeToggle = document.getElementById('themeToggle');
    const totalCountEl = document.getElementById('totalCount');
    const followUpCountEl = document.getElementById('followUpCount');

    // State
    let editingJobId = null;
    let jobs = JSON.parse(localStorage.getItem('jobApplications')) || [];

    // Initialize
    function init() {
        renderJobList();
        setMinDate();
        loadTheme();
        
        // Event Listeners
        jobForm.addEventListener('submit', handleFormSubmit);
        cancelBtn.addEventListener('click', resetForm);
        statusFilter.addEventListener('change', renderJobList);
        themeToggle.addEventListener('click', toggleTheme);
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        appliedDateInput.value = today;
    }

    // Theme Management
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = `${savedTheme}-theme`;
        updateThemeButton(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.className = `${newTheme}-theme`;
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    }

    function updateThemeButton(theme) {
        const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
        const text = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        themeToggle.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
    }

    // Form Handling
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const job = {
            id: editingJobId || Date.now().toString(),
            company: companyInput.value.trim(),
            position: positionInput.value.trim(),
            url: urlInput.value.trim(),
            status: statusInput.value,
            appliedDate: appliedDateInput.value,
            followUpDate: followUpDateInput.value,
            salary: salaryInput.value.trim(),
            contact: contactInput.value.trim(),
            notes: notesInput.value.trim()
        };

        if (editingJobId) {
            // Update existing job
            jobs = jobs.map(j => j.id === editingJobId ? job : j);
            showToast('Job updated successfully!', 'success');
        } else {
            // Add new job
            jobs.push(job);
            showToast('Job added successfully!', 'success');
        }

        saveJobs();
        renderJobList();
        resetForm();
    }

    function resetForm() {
        jobForm.reset();
        editingJobId = null;
        formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Job';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        cancelBtn.style.display = 'none';
        
        // Reset to today's date
        const today = new Date().toISOString().split('T')[0];
        appliedDateInput.value = today;
    }

    // Job List Rendering
    function renderJobList() {
        const status = statusFilter.value;
        const filteredJobs = status === 'All' 
            ? jobs 
            : jobs.filter(job => job.status === status);

        // Update stats
        totalCountEl.textContent = jobs.length;
        followUpCountEl.textContent = jobs.filter(j => j.followUpDate).length;

        if (filteredJobs.length === 0) {
            jobList.innerHTML = `
                <div class="empty-state card">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No jobs found</h3>
                    <p>${status === 'All' ? 'Add your first job application!' : `No jobs with status "${status}"`}</p>
                </div>
            `;
            return;
        }

        jobList.innerHTML = '';
        filteredJobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card card';
            jobCard.innerHTML = `
                <div class="job-actions">
                    <button onclick="editJob('${job.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteJob('${job.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <h3>${job.company} - ${job.position}</h3>
                <p><span class="status status-${job.status}">${job.status}</span></p>
                <p><i class="fas fa-calendar-day"></i> Applied: ${formatDate(job.appliedDate)}</p>
                ${job.followUpDate ? `<p><i class="fas fa-calendar-check"></i> Follow-up: ${formatDate(job.followUpDate)}</p>` : ''}
                ${job.salary ? `<p><i class="fas fa-money-bill-wave"></i> Salary: ${job.salary}</p>` : ''}
                ${job.contact ? `<p><i class="fas fa-user"></i> Contact: ${job.contact}</p>` : ''}
                ${job.notes ? `<p><i class="fas fa-sticky-note"></i> Notes: ${job.notes}</p>` : ''}
                ${job.url ? `<p><a href="${job.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Job Posting</a></p>` : ''}
            `;
            jobList.appendChild(jobCard);
        });
    }

    // Helper Functions
    function setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        appliedDateInput.min = today;
        if (followUpDateInput) followUpDateInput.min = today;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Not set';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function saveJobs() {
        localStorage.setItem('jobApplications', JSON.stringify(jobs));
    }

    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    // Global functions for job actions
    window.editJob = function(id) {
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        editingJobId = job.id;
        companyInput.value = job.company;
        positionInput.value = job.position;
        urlInput.value = job.url || '';
        statusInput.value = job.status;
        appliedDateInput.value = job.appliedDate;
        followUpDateInput.value = job.followUpDate || '';
        salaryInput.value = job.salary || '';
        contactInput.value = job.contact || '';
        notesInput.value = job.notes || '';
        
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Job';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteJob = function(id) {
        if (confirm('Are you sure you want to delete this job application?')) {
            jobs = jobs.filter(job => job.id !== id);
            saveJobs();
            renderJobList();
            if (editingJobId === id) resetForm();
            showToast('Job deleted', 'warning');
        }
    };

    init();
    function checkReminders() {
        const today = new Date().toISOString().split('T')[0];
        const dueJobs = jobs.filter(job => job.followUpDate === today);
        const banner = document.getElementById('reminderBanner');
       
        if (dueJobs.length > 0) {
            let message = `🔔 You have ${dueJobs.length} follow-up${dueJobs.length > 1 ? 's' : ''} today: `;
            message += dueJobs.map(job => `${job.company} (${job.position})`).join(', ');
    
            banner.textContent = message;
            banner.classList.remove('hidden');
    
            // Auto-hide after 7 seconds
            setTimeout(() => banner.classList.add('hidden'), 7000);
        }
    }
    checkReminders();

   
});

