/* 
   THE LAUNDRY LAB - Main Script
   Handles: Calculator Logic, Form Validation, WhatsApp Integration, UI interactions
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const PRICING = {
        wash: 15,       // Per Kg
        dryclean: 25,   // Per Item
        iron: 5,        // Per Item
        delivery: 20,   // Flat Fee
        expressMultiplier: 0.5 // 50% surcharge
    };

    const BUSINESS_PHONE = "233500864534"; // Placeholder Ghana Number

    // --- UI INTERACTIONS ---

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- CALCULATOR LOGIC ---

    const serviceSelect = document.getElementById('calc-service');
    const quantityInput = document.getElementById('calc-quantity');
    const quantityLabel = document.getElementById('quantity-label');
    const expressToggle = document.getElementById('calc-express');
    const deliveryToggle = document.getElementById('calc-delivery');
    const totalDisplay = document.getElementById('calc-total');
    const orderBtn = document.getElementById('btn-calc-whatsapp');

    function updateCalculator() {
        const serviceType = serviceSelect.value;
        const quantity = parseFloat(quantityInput.value) || 0;
        const isExpress = expressToggle.checked;
        const isDelivery = deliveryToggle.checked;

        // Update Label based on service
        if (serviceType === 'wash') {
            quantityLabel.textContent = 'Weight (Kg)';
        } else {
            quantityLabel.textContent = 'Number of Items';
        }

        let basePrice = 0;

        switch (serviceType) {
            case 'wash':
                basePrice = quantity * PRICING.wash;
                break;
            case 'dryclean':
                basePrice = quantity * PRICING.dryclean;
                break;
            case 'iron':
                basePrice = quantity * PRICING.iron;
                break;
        }

        let surcharge = 0;
        if (isExpress) {
            surcharge = basePrice * PRICING.expressMultiplier;
        }

        let deliveryFee = 0;
        if (isDelivery) {
            deliveryFee = PRICING.delivery;
        }

        const total = basePrice + surcharge + deliveryFee;

        // Animate Price
        totalDisplay.textContent = `₵${total.toFixed(2)}`;

        return {
            serviceType,
            quantity,
            isExpress,
            isDelivery,
            total
        };
    }

    // Attach Listeners
    if (serviceSelect && quantityInput && expressToggle && deliveryToggle) {
        const inputs = [serviceSelect, quantityInput, expressToggle, deliveryToggle];
        inputs.forEach(input => input.addEventListener('input', updateCalculator));

        // Initial Calculation
        updateCalculator();
    }

    // Calculator WhatsApp Order
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            const data = updateCalculator();

            let serviceName = "";
            if (data.serviceType === 'wash') serviceName = "Wash & Fold";
            else if (data.serviceType === 'dryclean') serviceName = "Dry Cleaning";
            else serviceName = "Ironing";

            const message = `Hello Laundry Lab, I would like to place an order based on the estimate:%0A%0A` +
                `🧺 *Service:* ${serviceName}%0A` +
                `⚖️ *Quantity:* ${data.quantity} ${data.serviceType === 'wash' ? 'kg' : 'items'}%0A` +
                `⚡ *Express:* ${data.isExpress ? 'Yes' : 'No'}%0A` +
                `🚚 *Pickup & Delivery:* ${data.isDelivery ? 'Yes' : 'No'}%0A` +
                `💰 *Estimated Total:* ₵${data.total.toFixed(2)}%0A%0A` +
                `Please confirm availability.`;

            window.open(`https://wa.me/${BUSINESS_PHONE}?text=${message}`, '_blank');
        });
    }

    // --- BOOKING FORM LOGIC ---

    const bookingForm = document.getElementById('booking-form');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('bf-name').value;
            const phone = document.getElementById('bf-phone').value;
            const area = document.getElementById('bf-area').value;
            const city = document.getElementById('bf-city').value;
            const region = document.getElementById('bf-region').value;
            const service = document.getElementById('bf-service').value;
            const date = document.getElementById('bf-date').value;

            // Simple validation feedback (Visual only for now)
            const submitBtn = bookingForm.querySelector('button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Processing...";

            // Create Order Object
            const newOrder = {
                id: Date.now(),
                name,
                phone,
                location: `${area}, ${city} (${region})`,
                service,
                date,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Save to LocalStorage
            const orders = JSON.parse(localStorage.getItem('laundryOrders') || '[]');
            orders.unshift(newOrder);
            localStorage.setItem('laundryOrders', JSON.stringify(orders));

            setTimeout(() => {
                const message = `New Pickup Request:%0A%0A` +
                    `👤 *Name:* ${name}%0A` +
                    `📞 *Phone:* ${phone}%0A` +
                    `📍 *Location:* ${area}, ${city} (${region})%0A` +
                    `and more...`; // Shortened for URL length, full details in dashboard

                const fullMessage = `New Pickup Request:%0A%0A` +
                    `👤 *Name:* ${name}%0A` +
                    `📞 *Phone:* ${phone}%0A` +
                    `📍 *Location:* ${area}, ${city}, ${region}%0A` +
                    `🧺 *Service:* ${service}%0A` +
                    `📅 *Pickup Date:* ${date}`;

                window.open(`https://wa.me/${BUSINESS_PHONE}?text=${fullMessage}`, '_blank');

                submitBtn.textContent = "Sent to WhatsApp!";
                submitBtn.classList.add('btn-whatsapp'); // Change color to green

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.classList.remove('btn-whatsapp');
                    bookingForm.reset();
                }, 3000);
            }, 800);
        });
    }

    // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileToggle.querySelector('i').classList.remove('fa-times');
                    mobileToggle.querySelector('i').classList.add('fa-bars');
                }

                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

});
