/* 
   THE LAUNDRY LAB - Admin Dashboard Script
   Handles: Login, Data Retrieval, Status Updates, Notification Simulation
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIN LOGIC ---
    const loginOverlay = document.getElementById('login-overlay');
    const pinInput = document.getElementById('admin-pin');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Simple PIN check (In real world, this would be server-side)
    loginBtn.addEventListener('click', () => {
        if (pinInput.value === '1234') {
            loginOverlay.style.display = 'none';
            loadDashboard();
        } else {
            alert('Invalid PIN. Try 1234');
            pinInput.value = '';
        }
    });

    logoutBtn.addEventListener('click', () => {
        loginOverlay.style.display = 'flex';
        pinInput.value = '';
    });

    // --- DASHBOARD LOGIC ---

    window.renderTable = function (filter = 'all') {
        const orders = JSON.parse(localStorage.getItem('laundryOrders') || '[]');
        const tbody = document.getElementById('bookings-body');
        tbody.innerHTML = '';

        let totalRevenue = 0;
        let pendingCount = 0;

        // Calculate Stats
        orders.forEach(order => {
            // Rough estimate for revenue since we don't save exact cost in booking obj yet
            // In a full version, we'd pass total cost from calculator to booking form
            totalRevenue += estimateRevenue(order.service);
            if (order.status === 'pending') pendingCount++;
        });

        // Filter for Table
        const filteredOrders = orders.filter(order => {
            if (filter === 'all') return true;
            if (filter === 'pending') return order.status === 'pending';
            if (filter === 'progress') return order.status === 'progress';
            return true;
        });

        if (filteredOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found</td></tr>';
        }

        filteredOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(order.date)}</td>
                <td>
                    <div style="font-weight:600">${order.name}</div>
                    <div style="font-size:0.85rem; color:#666">${order.phone}</div>
                </td>
                <td>${order.location}</td>
                <td>${order.service}</td>
                <td><span style="font-size:0.85rem; color:#888">${order.notes || '-'}</span></td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>
                    ${getActionButtons(order)}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update Stats UI
        document.getElementById('stat-total').textContent = orders.length;
        document.getElementById('stat-pending').textContent = pendingCount;
        document.getElementById('stat-revenue').textContent = `₵${totalRevenue}`;
    };

    window.updateStatus = function (id, newStatus) {
        let orders = JSON.parse(localStorage.getItem('laundryOrders') || '[]');
        const orderIndex = orders.findIndex(o => o.id === id);

        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('laundryOrders', JSON.stringify(orders));

            // Re-render
            renderTable(); // Keep current filter? For simplicity resetting to default or we could track state

            // Notify Client Simulation
            if (newStatus === 'done') {
                notifyClient(orders[orderIndex]);
            }
        }
    };

    function notifyClient(order) {
        const message = `Hello ${order.name}, your laundry (${order.service}) is ready for delivery! 🚚%0A%0A` +
            `We are dispatching it to: ${order.location}.%0A` +
            `Thank you for choosing The Laundry Lab!`;

        const confirmMsg = confirm(`Status updated to DONE. Simulating Client Notification...\n\nSend WhatsApp Message to ${order.name}?`);

        if (confirmMsg) {
            window.open(`https://wa.me/${order.phone.replace(/\s+/g, '')}?text=${message}`, '_blank');
        }
    }

    function getActionButtons(order) {
        let buttons = `<button class="btn btn-secondary action-btn" onclick="viewOrder(${order.id})" style="padding: 6px 12px; font-size: 0.85rem; margin-right:5px; background:#e2e6ea; border:none; color:#333;">View</button>`;

        if (order.status === 'pending') {
            buttons += `<button class="btn btn-outline-dark action-btn" onclick="updateStatus(${order.id}, 'progress')">Start</button>`;
        } else if (order.status === 'progress') {
            buttons += `<button class="btn btn-primary action-btn" style="padding: 6px 12px; font-size: 0.85rem;" onclick="updateStatus(${order.id}, 'done')">Complete</button>`;
        } else {
            buttons += `<span style="color: green; font-size: 0.9rem"><i class="fas fa-check"></i> Notified</span>`;
        }
        return buttons;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }

    function estimateRevenue(service) {
        // Mock revenue estimation based on service type
        if (service.includes('Wash')) return 75; // Avg 5kg
        if (service.includes('Dry')) return 40; // Avg item
        if (service.includes('Express')) return 100;
        return 50;
    }

    // Helper function to mock load
    function loadDashboard() {
        renderTable();
    }

    // --- MODAL LOGIC ---
    const modal = document.getElementById('order-modal');
    const closeBtn = document.querySelector('.close-modal');
    const modalDetails = document.getElementById('modal-details');

    window.viewOrder = (id) => {
        const orders = JSON.parse(localStorage.getItem('laundryOrders') || '[]');
        const order = orders.find(o => o.id === id);
        if (!order) return;

        // Format Preferences
        let prefHtml = '<p>No specific preferences.</p>';
        if (order.preferences) {
            let specialCareHtml = '';
            if (order.preferences.specialCare && order.preferences.specialCare.length > 0) {
                specialCareHtml = `
                    <div class="pref-item">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>
                            <strong>Special Care:</strong><br>
                            ${order.preferences.specialCare.join(', ')}
                        </div>
                    </div>`;
            }

            let notesHtml = '';
            if (order.preferences.notes) {
                notesHtml = `
                    <div class="pref-item">
                        <i class="fas fa-comment"></i>
                        <div>
                            <strong>Notes:</strong><br>
                            "${order.preferences.notes}"
                        </div>
                    </div>`;
            }

            prefHtml = `
                <div class="pref-summary">
                    <div class="pref-item">
                        <i class="fas fa-flask"></i>
                        <div><strong>Detergent:</strong> ${order.preferences.detergent}</div>
                    </div>
                    <div class="pref-item">
                        <i class="fas fa-wind"></i>
                        <div><strong>Fragrance:</strong> ${order.preferences.fragrance}</div>
                    </div>
                    ${specialCareHtml}
                    ${notesHtml}
                </div>
            `;
        }

        modalDetails.innerHTML = `
            <h3>Order Details #${order.id}</h3>
            <div class="detail-row">
                <h4>Customer</h4>
                <p>${order.name} (${order.phone})</p>
            </div>
            <div class="detail-row">
                <h4>Location</h4>
                <p>${order.location}</p>
            </div>
             <div class="detail-row">
                <h4>Service & Date</h4>
                <p>${order.service} - ${order.date}</p>
            </div>
            <div class="detail-row" style="border:none;">
                <h4>Fabric Care & Preferences</h4>
                ${prefHtml}
            </div>
        `;

        modal.style.display = "flex";
    };

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});
