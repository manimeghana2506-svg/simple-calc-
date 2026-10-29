/**
 * PeachCalc - Simple, Sweet Calculator
 * Vanilla JavaScript Implementation
 * 
 * This script manages the state and logic for PeachCalc, including:
 * - Entering numbers and decimal points
 * - Selecting math operators (+, -, ×, ÷)
 * - Computing results without using eval()
 * - Handling division by zero gracefully
 * - Keyboard support for accessibility and speed
 */

// --- DOM Elements ---
const currentDisplay = document.getElementById('currentDisplay');
const previousDisplay = document.getElementById('previousDisplay');
const buttonsGrid = document.querySelector('.buttons-grid');

// --- Calculator State Variables ---
// currentValue: The number or message currently shown on the main display
let currentValue = '0';

// previousValue: The first operand stored before an operator was selected
let previousValue = '';

// selectedOperator: The math operator currently chosen (+, -, ×, ÷)
let selectedOperator = null;

// shouldResetCurrent: Flag to start fresh input on next digit click (e.g., after an operator or equals)
let shouldResetCurrent = false;

// hasError: Flag indicating if an error state (like division by zero) is active
let hasError = false;

/**
 * Updates the calculator screen with current state values.
 * Automatically scales down font size for long numbers to prevent overflow.
 */
function updateDisplay() {
  currentDisplay.textContent = currentValue;

  // Show previous operand and operator if one is selected
  if (selectedOperator !== null && previousValue !== '') {
    previousDisplay.textContent = `${previousValue} ${selectedOperator}`;
  } else {
    previousDisplay.textContent = '';
  }

  // Adjust font size dynamically if the number gets long
  if (currentValue.length > 12) {
    currentDisplay.style.fontSize = '1.35rem';
  } else if (currentValue.length > 8) {
    currentDisplay.style.fontSize = '1.75rem';
  } else {
    currentDisplay.style.fontSize = '2.25rem';
  }

  // Highlight active operator button for better visual feedback
  highlightActiveOperator();
}

/**
 * Adds visual highlight to the currently active operator button.
 */
function highlightActiveOperator() {
  const operatorButtons = document.querySelectorAll('.btn-operator');
  operatorButtons.forEach((btn) => {
    if (selectedOperator && btn.dataset.operator === selectedOperator && shouldResetCurrent) {
      btn.classList.add('active-operator');
    } else {
      btn.classList.remove('active-operator');
    }
  });
}

/**
 * Appends a digit (0-9) to the current input.
 * @param {string} digit - The number digit clicked by the user
 */
function inputDigit(digit) {
  // If an error occurred, reset everything first
  if (hasError) {
    resetCalculator();
  }

  // If we just clicked an operator or equals, start fresh with the new digit
  if (shouldResetCurrent) {
    currentValue = digit;
    shouldResetCurrent = false;
  } else {
    // If the current value is just '0', replace it; otherwise append the digit
    if (currentValue === '0') {
      currentValue = digit;
    } else {
      // Limit total digits to 15 to keep precision reasonable
      if (currentValue.replace('.', '').length < 15) {
        currentValue += digit;
      }
    }
  }

  updateDisplay();
}

/**
 * Handles adding a decimal point (.).
 * Prevents multiple decimals from being entered.
 */
function inputDecimal() {
  if (hasError) {
    resetCalculator();
  }

  if (shouldResetCurrent) {
    currentValue = '0.';
    shouldResetCurrent = false;
  } else if (!currentValue.includes('.')) {
    currentValue += '.';
  }

  updateDisplay();
}

/**
 * Handles operator selection (+, -, ×, ÷).
 * If an operation is already pending, it calculates the intermediate result first.
 * @param {string} operator - The symbol of the operator clicked
 */
function handleOperator(operator) {
  if (hasError) return;

  // If user clicks an operator consecutively without typing a new number, just change operator
  if (selectedOperator !== null && shouldResetCurrent) {
    selectedOperator = operator;
    updateDisplay();
    return;
  }

  // If we already have a previous value and an operator, compute first
  if (previousValue !== '' && selectedOperator !== null) {
    calculateResult();
    if (hasError) return;
  }

  previousValue = currentValue;
  selectedOperator = operator;
  shouldResetCurrent = true;
  updateDisplay();
}

/**
 * Executes the arithmetic calculation between two numbers without using eval().
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @param {string} op - Operator string (+, -, ×, ÷)
 * @returns {number|string} - The result of the operation or error message
 */
function executeOperation(a, b, op) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      if (b === 0) {
        return 'Cannot divide by 0';
      }
      return a / b;
    default:
      return b;
  }
}

/**
 * Calculates and displays the final or intermediate result.
 */
function calculateResult() {
  // Can only calculate if an operator and a previous operand exist
  if (selectedOperator === null || previousValue === '' || hasError) {
    return;
  }

  const prev = parseFloat(previousValue);
  const curr = parseFloat(currentValue);

  // Guard against invalid numbers
  if (isNaN(prev) || isNaN(curr)) {
    return;
  }

  const result = executeOperation(prev, curr, selectedOperator);

  // Handle division by zero error
  if (typeof result === 'string') {
    currentValue = result;
    previousValue = '';
    selectedOperator = null;
    hasError = true;
    shouldResetCurrent = true;
    updateDisplay();
    return;
  }

  // Round results to 10 decimal places to fix floating-point quirks (like 0.1 + 0.2)
  const sanitizedResult = Math.round(result * 1e10) / 1e10;

  // Show the completed equation in the previous display
  previousDisplay.textContent = `${previousValue} ${selectedOperator} ${currentValue} =`;

  currentValue = String(sanitizedResult);
  previousValue = '';
  selectedOperator = null;
  shouldResetCurrent = true;

  // Update current display without overwriting the completed equation above
  currentDisplay.textContent = currentValue;
  if (currentValue.length > 12) {
    currentDisplay.style.fontSize = '1.35rem';
  } else if (currentValue.length > 8) {
    currentDisplay.style.fontSize = '1.75rem';
  } else {
    currentDisplay.style.fontSize = '2.25rem';
  }
  highlightActiveOperator();
}

/**
 * Resets the calculator back to its initial state.
 */
function resetCalculator() {
  currentValue = '0';
  previousValue = '';
  selectedOperator = null;
  shouldResetCurrent = false;
  hasError = false;
  updateDisplay();
}

/**
 * Removes the last character from current input (Backspace functionality).
 */
function deleteLastDigit() {
  if (hasError || shouldResetCurrent) return;

  if (currentValue.length > 1) {
    currentValue = currentValue.slice(0, -1);
  } else {
    currentValue = '0';
  }
  updateDisplay();
}

// --- Event Listeners ---

// Button click handling using event delegation on the grid
buttonsGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const action = button.dataset.action;

  if (action === 'number') {
    inputDigit(button.dataset.value);
  } else if (action === 'decimal') {
    inputDecimal();
  } else if (action === 'operator') {
    handleOperator(button.dataset.operator);
  } else if (action === 'equals') {
    calculateResult();
  } else if (action === 'clear') {
    resetCalculator();
  }
});

// Keyboard support for enhanced user experience
window.addEventListener('keydown', (event) => {
  // Numbers 0-9
  if (event.key >= '0' && event.key <= '9') {
    inputDigit(event.key);
  } else if (event.key === '.' || event.key === ',') {
    inputDecimal();
  } else if (event.key === '+' || event.key === '-') {
    handleOperator(event.key);
  } else if (event.key === '*') {
    handleOperator('×');
  } else if (event.key === '/') {
    event.preventDefault(); // Prevent Firefox quick-find shortcut
    handleOperator('÷');
  } else if (event.key === 'Enter' || event.key === '=') {
    event.preventDefault();
    calculateResult();
  } else if (event.key === 'Escape' || event.key.toLowerCase() === 'c') {
    resetCalculator();
  } else if (event.key === 'Backspace') {
    deleteLastDigit();
  }
});

// Initial display setup
updateDisplay();
