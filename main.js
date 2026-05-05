const API_URL = "http://localhost:5005";

// Make functions globally available for inline event handlers
window.login = async function() {
    const user = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;
    const err = document.getElementById("login-error");
    
    if (!user || !pass) return;
    err.innerText = "Authenticating...";
    
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (data.status === "success") {
            // Store session
            localStorage.setItem("userSession", JSON.stringify({ username: user }));
            enterDashboard();
        } else {
            err.innerText = "Invalid credentials";
        }
    } catch (e) {
        err.innerText = "Error connecting to server";
    }
};

window.signup = async function() {
    const user = document.getElementById("signup-email").value;
    const pass = document.getElementById("signup-password").value;
    const err = document.getElementById("signup-error");
    
    if (!user || !pass) return;
    err.innerText = "Creating account...";
    
    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (data.status === "success") {
            localStorage.setItem("userSession", JSON.stringify({ username: user }));
            enterDashboard();
        } else {
            err.innerText = data.message || "Signup failed";
        }
    } catch (e) {
        err.innerText = "Error connecting to server";
    }
};

window.toggleAuth = function(mode) {
    if (mode === 'signup') {
        document.getElementById("signin-box").classList.add("hidden");
        document.getElementById("signup-box").classList.remove("hidden");
    } else {
        document.getElementById("signup-box").classList.add("hidden");
        document.getElementById("signin-box").classList.remove("hidden");
    }
};

function enterDashboard() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    lucide.createIcons();
}

window.signOut = function() {
    localStorage.removeItem("userSession");
    window.location.href = 'index.html';
};

window.analyzeDeal = async function() {
    const company = document.getElementById("company-input").value;
    const dealType = document.getElementById("deal-type-input").value;
    
    if (!company) {
        alert("Please enter a company name or ticker");
        return;
    }
    
    document.getElementById("results-panel").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");
    
    try {
        const res = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ company, deal_type: dealType })
        });
        
        const data = await res.json();
        window.latestData = data; // Store for PPT download
        
        // Populate text results
        document.getElementById("deal-title").innerText = `${data.company} - ${data.deal_type} Analysis`;
        document.getElementById("res-overview").innerText = data.analysis.overview || "N/A";
        document.getElementById("res-industry").innerText = data.analysis.industry || "N/A";
        document.getElementById("res-valuation").innerText = data.analysis.valuation || "N/A";
        document.getElementById("res-rationale").innerText = data.analysis.rationale || "N/A";
        document.getElementById("res-risks").innerText = data.analysis.risks || "N/A";
        
        // Populate Bank Matrix
        let bankTable = "<table><tr><th>Bank</th><th>ECM Score</th><th>Probability</th></tr>";
        if (data.banks) {
            data.banks.forEach(b => {
                bankTable += `<tr>
                    <td>${b.bank}</td>
                    <td>${b.score}</td>
                    <td style="color: ${b.probability === 'High' ? '#10b981' : (b.probability === 'Medium' ? '#f59e0b' : '#ef4444')}">${b.probability}</td>
                </tr>`;
            });
        }
        bankTable += "</table>";
        document.getElementById("bank-matrix-container").innerHTML = bankTable;
        
        // Populate Comps
        let compsTable = "<table>";
        if (data.comps && data.comps.length > 0) {
            // Header
            compsTable += "<tr>";
            data.comps[0].forEach(h => { compsTable += `<th>${h}</th>`; });
            compsTable += "</tr>";
            // Rows
            for (let i = 1; i < data.comps.length; i++) {
                compsTable += "<tr>";
                data.comps[i].forEach(c => { compsTable += `<td>${c}</td>`; });
                compsTable += "</tr>";
            }
        }
        compsTable += "</table>";
        document.getElementById("comps-container").innerHTML = compsTable;
        
        document.getElementById("loading").classList.add("hidden");
        document.getElementById("results-panel").classList.remove("hidden");
        lucide.createIcons();
    } catch (e) {
        alert("Failed to analyze deal. Make sure backend is running.");
        document.getElementById("loading").classList.add("hidden");
    }
};

window.downloadPitchbook = async function() {
    if (!window.latestData) return;
    
    try {
        const res = await fetch(`${API_URL}/download_ppt`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(window.latestData)
        });
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${window.latestData.company}_Pitchbook.pptx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (e) {
        alert("Failed to download Pitchbook");
    }
};

window.showView = function(view) {
    const analyzerView = document.getElementById("analyzer-view");
    const historyView = document.getElementById("history-view");
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => item.classList.remove("active"));
    
    if (view === 'analyzer') {
        analyzerView.classList.remove("hidden");
        historyView.classList.add("hidden");
        event.currentTarget.classList.add("active");
    } else if (view === 'history') {
        analyzerView.classList.add("hidden");
        historyView.classList.remove("hidden");
        event.currentTarget.classList.add("active");
        loadHistory();
    }
    lucide.createIcons();
};

window.loadHistory = async function() {
    const container = document.getElementById("history-container");
    container.innerHTML = "<p>Loading history...</p>";
    
    try {
        const res = await fetch(`${API_URL}/history`);
        const data = await res.json();
        
        if (data.length === 0) {
            container.innerHTML = "<p>No past searches found.</p>";
            return;
        }
        
        let html = "<table><tr><th>Company</th><th>Type</th><th>Industry</th><th>Date</th></tr>";
        data.reverse().forEach(item => {
            html += `<tr>
                <td><strong>${item.company}</strong></td>
                <td>${item.deal_type}</td>
                <td>${item.analysis.industry || "N/A"}</td>
                <td>Recent</td>
            </tr>`;
        });
        html += "</table>";
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = "<p class='error-msg'>Failed to load history.</p>";
    }
};

// Auto initialize icons on load
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    
    // Check for existing session
    const session = localStorage.getItem("userSession");
    if (session && document.getElementById("login-screen")) {
        enterDashboard();
    }
});
