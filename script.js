// Initialize local storage
if (!localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify([]));
}

if (!localStorage.getItem('pendingJobs')) {
    localStorage.setItem('pendingJobs', JSON.stringify([]));
}

if (!localStorage.getItem('applications')) {
    localStorage.setItem('applications', JSON.stringify([]));
}
if (!localStorage.getItem('deletedApplications')) {
    localStorage.setItem('deletedApplications', JSON.stringify([]));
}


// Function to display approved job listings
function displayJobs() {
    const jobListings = document.getElementById('job-list');
    if (jobListings) {
        let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        jobs = jobs.reverse(); // Latest jobs first
        jobListings.innerHTML = jobs.map((job, index) => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p>${job.description}</p>
                <a href="apply.html?id=${index}" class="btn btn-apply">Apply Now</a>
            </div>
        `).join('');
    }
}

// Function to handle job submission
function submitJob(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const company = document.getElementById('company').value;
    const description = document.getElementById('description').value;
    
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs') || '[]');
    pendingJobs.push({ title, company, description });
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    
    alert('Job posting submitted for approval');
    event.target.reset();
}


// Function to display pending jobs in admin panel
function displayPendingJobs() {
    const pendingJobsDiv = document.getElementById('pending-jobs');
    if (pendingJobsDiv) {
        const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
        pendingJobsDiv.innerHTML = pendingJobs.map((job, index) => `
            <div class="pending-job">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p>${job.description}</p>
                <button onclick="approveJob(${index})">Approve</button>
                <button onclick="deleteJob(${index})">Delete</button>
            </div>
        `).join('');
    }
}



// Function to approve a job
function approveJob(index) {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
    const approvedJob = pendingJobs.splice(index, 1)[0];
    
    const jobs = JSON.parse(localStorage.getItem('jobs'));
    jobs.push(approvedJob);
    
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    displayPendingJobs();
}

// Function to delete a job
function deleteJob(index) {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
    pendingJobs.splice(index, 1);
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    displayPendingJobs();
}

// Function to display job details on application page
function displayJobDetails() {
    const jobDetails = document.getElementById('job-details');
    if (jobDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');
        const jobs = JSON.parse(localStorage.getItem('jobs'));
        const job = jobs[jobId];
        
        jobDetails.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p>${job.description}</p>
        `;
    }
}

// Function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Function to handle job application submission
async function submitApplication(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const resumeFile = document.getElementById('resume').files[0];
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!resumeFile) {
        alert('Please upload a resume');
        return;
    }

    try {
        // Convert resume file to Base64
        const resumeBase64 = await fileToBase64(resumeFile);

        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push({
            name,
            email,
            resume: resumeBase64,
            jobId,
            status: 'pending' // Initially, set the application status to 'pending'
        });
        localStorage.setItem('applications', JSON.stringify(applications));
        alert('Application submitted successfully');
        event.target.reset();
    } catch (error) {
        console.error('Error processing file:', error);
        alert('Error submitting application. Please try again.');
    }
}

// Function to display job applications in admin panel
function displayJobApplications() {
    const applicationsDiv = document.getElementById('job-applications');
    if (applicationsDiv) {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');

        applicationsDiv.innerHTML = applications.map((app, index) => {
            const job = jobs[app.jobId];
            return `
                <div class="application ${app.status || 'pending'}">
                    <h4>${job ? job.title : 'Unknown Job'} - ${job ? job.company : 'Unknown Company'}</h4>
                    <p><strong>Applicant:</strong> ${app.name}</p>
                    <p><strong>Email:</strong> ${app.email}</p>
                    <p><strong>Status:</strong> ${app.status || 'Pending'}</p>
                    <p><strong>Resume:</strong> 
                        <a href="${app.resume}" target="_blank" download="resume.pdf">View Resume</a>
                    </p>
                    ${app.status === 'pending' ? `
                        <button onclick="updateApplicationStatus(${index}, 'accepted')" class="btn btn-success">Accept</button>
                        <button onclick="deleteApplication(${index})" class="btn btn-danger">Delete</button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
}



// Function to update application status (Accepted/Declined)
function updateApplicationStatus(index, status) {
    const applications = JSON.parse(localStorage.getItem('applications'));
    applications[index].status = status;
    localStorage.setItem('applications', JSON.stringify(applications));
    displayJobApplications(); // Refresh the applications list
}



// Function to delete application and move it to deleted list
function deleteApplication(index) {
    const applications = JSON.parse(localStorage.getItem('applications'));
    const deletedApplications = JSON.parse(localStorage.getItem('deletedApplications')) || [];
    
    const deletedApp = applications.splice(index, 1)[0];  // Get the deleted application
    deletedApplications.push(deletedApp);  // Add to deleted applications list
    
    localStorage.setItem('applications', JSON.stringify(applications));
    localStorage.setItem('deletedApplications', JSON.stringify(deletedApplications));
    
    displayJobApplications();  // Refresh the applications
    displayDeletedApplications();  // Refresh the deleted applications list
}

// Function to display deleted job applications in the admin panel
function displayDeletedApplications() {
    const deletedAppsList = document.getElementById('deleted-applications-list');
    if (deletedAppsList) {
        const deletedApplications = JSON.parse(localStorage.getItem('deletedApplications')) || [];
        
        // Populate the deleted list
        deletedAppsList.innerHTML = deletedApplications.map((app, index) => `
            <div class="application">
                <h4>${app.title} - ${app.company}</h4>
                <p><strong>Applicant:</strong> ${app.name}</p>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>Status:</strong> ${app.status || 'Deleted'}</p>
                <p><strong>Resume:</strong> 
                    <a href="${app.resume}" target="_blank" download="resume.pdf">View Resume</a>
                </p>
            </div>
        `).join('');
        
        deletedAppsList.classList.toggle('show'); // Toggle visibility
    } else {
        console.warn("Deleted applications list element not found!");
    }
}




// Function to toggle deleted applications visibility
function toggleDeletedApplications() {
    displayDeletedApplications(); // Ensure the list is refreshed each time it's opened
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    displayJobs();
    displayPendingJobs();
    displayJobDetails();
    displayJobApplications();
    displayDeletedApplications();

    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', submitJob);
    }

    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', submitApplication);
    }
});
