document.addEventListener('DOMContentLoaded', function() {
  // Constants
  const DELIVERY_FEE = 50;
  
  // DOM Elements
  const bookingForm = document.getElementById('bookingForm');
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressBar = document.querySelector('.progress-bar');
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');
  const wineCards = document.querySelectorAll('.wine-card');
  const quantityInputs = document.querySelectorAll('.wine-selector input');
  const subtotalEl = document.getElementById('subtotal');
  const grandTotalEl = document.getElementById('grand-total');
  const summaryItemsEl = document.querySelector('.summary-items');
  const orderDetailsEl = document.getElementById('orderDetails');
  const modal = document.getElementById('confirmationModal');
  const closeModalBtn = document.querySelector('.btn-close-modal');
  
  // Form State
  let currentStep = 1;
  let selectedWines = [];
  
  // Initialize
  updateProgressBar();
  initWineSelection();
  
  // Event Listeners
  nextButtons.forEach(button => {
    button.addEventListener('click', nextStep);
  });
  
  prevButtons.forEach(button => {
    button.addEventListener('click', prevStep);
  });
  
  bookingForm.addEventListener('submit', submitForm);
  closeModalBtn.addEventListener('click', closeModal);
  
  // Quantity Selectors
  quantityInputs.forEach(input => {
    input.addEventListener('change', updateOrderSummary);
  });
  
  // Functions
  function nextStep() {
    if (validateStep(currentStep)) {
      if (currentStep < formSteps.length) {
        // Update current step
        formSteps[currentStep - 1].classList.remove('active');
        progressSteps[currentStep - 1].classList.remove('active');
        
        currentStep++;
        
        formSteps[currentStep - 1].classList.add('active');
        progressSteps[currentStep - 1].classList.add('active');
        
        // Update progress bar
        updateProgressBar();
        
        // If moving to step 3, update order summary
        if (currentStep === 3) {
          updateOrderSummary();
        }
      }
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      // Update current step
      formSteps[currentStep - 1].classList.remove('active');
      progressSteps[currentStep - 1].classList.remove('active');
      
      currentStep--;
      
      formSteps[currentStep - 1].classList.add('active');
      progressSteps[currentStep - 1].classList.add('active');
      
      // Update progress bar
      updateProgressBar();
    }
  }
  
  function updateProgressBar() {
    const progressPercentage = ((currentStep - 1) / (formSteps.length - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    
    // Mark previous steps as completed
    progressSteps.forEach((step, index) => {
      if (index < currentStep - 1) {
        step.classList.add('completed');
      } else {
        step.classList.remove('completed');
      }
    });
  }
  
  function validateStep(step) {
    let isValid = true;
    const currentStepEl = formSteps[step - 1];
    const inputs = currentStepEl.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('invalid');
        isValid = false;
        
        // Add shake animation
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
          input.style.animation = '';
        }, 500);
      } else {
        input.classList.remove('invalid');
      }
    });
    
    return isValid;
  }
  
  function initWineSelection() {
    wineCards.forEach(card => {
      card.addEventListener('click', function() {
        // Toggle selection
        this.classList.toggle('selected');
        
        // If selected, set quantity to 1 if it's 0
        if (this.classList.contains('selected')) {
          const input = this.querySelector('input');
          if (parseInt(input.value) === 0) {
            input.value = 1;
          }
        }
        
        updateOrderSummary();
      });
    });
    
    // Prevent card click when clicking on quantity selector
    document.querySelectorAll('.wine-selector').forEach(selector => {
      selector.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });
  }
  
  function updateOrderSummary() {
    let subtotal = 0;
    selectedWines = [];
    
    // Clear summary items
    summaryItemsEl.innerHTML = '';
    
    // Calculate subtotal and build selected wines array
    wineCards.forEach(card => {
      const input = card.querySelector('input');
      const quantity = parseInt(input.value);
      
      if (quantity > 0) {
        const wineName = card.querySelector('h3').textContent;
        const winePrice = parseInt(card.dataset.price);
        const wineTotal = winePrice * quantity;
        
        subtotal += wineTotal;
        
        selectedWines.push({
          name: wineName,
          quantity: quantity,
          price: winePrice,
          total: wineTotal
        });
        
        // Add to summary
        const itemEl = document.createElement('div');
        itemEl.classList.add('summary-item');
        itemEl.innerHTML = `
          <span>${wineName} × ${quantity}</span>
          <span>R${wineTotal}</span>
        `;
        summaryItemsEl.appendChild(itemEl);
      }
    });
    
    // Update totals
    subtotalEl.textContent = `R${subtotal}`;
    const grandTotal = subtotal + DELIVERY_FEE;
    grandTotalEl.textContent = `R${grandTotal}`;
  }
  
  function submitForm(e) {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      // Get form values
      const formData = {
        name: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        wines: selectedWines,
        deliveryFee: DELIVERY_FEE,
        subtotal: parseInt(subtotalEl.textContent.replace('R', '')),
        total: parseInt(grandTotalEl.textContent.replace('R', '')),
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        date: new Date().toLocaleString()
      };
      
      // Show loading state
      const submitBtn = document.querySelector('.btn-submit');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        // Populate order details in modal
        let orderDetailsHTML = `
          <li>
            <strong>Order #</strong>
            <span>${Math.floor(Math.random() * 1000000)}</span>
          </li>
          <li>
            <strong>Date</strong>
            <span>${new Date().toLocaleDateString()}</span>
          </li>
          <li>
            <strong>Customer</strong>
            <span>${formData.name}</span>
          </li>
          <li>
            <strong>Delivery Address</strong>
            <span>${formData.address}</span>
          </li>
          <li class="divider"></li>
        `;
        
        formData.wines.forEach(wine => {
          orderDetailsHTML += `
            <li>
              <strong>${wine.name} × ${wine.quantity}</strong>
              <span>R${wine.total}</span>
            </li>
          `;
        });
        
        orderDetailsHTML += `
          <li class="divider"></li>
          <li>
            <strong>Subtotal</strong>
            <span>R${formData.subtotal}</span>
          </li>
          <li>
            <strong>Delivery Fee</strong>
            <span>R${formData.deliveryFee}</span>
          </li>
          <li class="total">
            <strong>Total</strong>
            <span>R${formData.total}</span>
          </li>
          <li class="divider"></li>
          <li>
            <strong>Payment Method</strong>
            <span>${formData.paymentMethod}</span>
          </li>
        `;
        
        orderDetailsEl.innerHTML = orderDetailsHTML;
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset form
        submitBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Order';
        submitBtn.disabled = false;
        bookingForm.reset();
        
        // Reset to first step
        formSteps[currentStep - 1].classList.remove('active');
        progressSteps[currentStep - 1].classList.remove('active');
        currentStep = 1;
        formSteps[0].classList.add('active');
        progressSteps[0].classList.add('active');
        updateProgressBar();
        
        // Reset wine selection
        wineCards.forEach(card => {
          card.classList.remove('selected');
          card.querySelector('input').value = 0;
        });
        selectedWines = [];
        updateOrderSummary();
      }, 1500);
    }
  }
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Add shake animation for invalid fields
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .invalid {
      border-color: #ff4444 !important;
    }
    .invalid ~ label {
      color: #ff4444 !important;
    }
    .invalid ~ .underline {
      background-color: #ff4444 !important;
    }
  `;
  document.head.appendChild(style);
});
