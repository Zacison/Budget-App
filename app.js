//Module, encapulates data from functions so it isnt anywhere else
//uses IIFE, instantly initialized funtion expressions
var budgetController = (function() {
	
	//create function constructor bc we will need lots of objects for each expense income.
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	//Each object wil inhereit properties from it's prototype. 
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function (cur) {
			sum = sum + cur.value;
		});
		data.totals[type] = sum;
	};
	

	//Budget controller keeps track of all the income and expenses
	//Can store all inc/exp in arrays
	//create objects to store all this data, rather than having it all over the place
	var data = {
		allItems: {
			exp: [],
			inc: []
		},

		totals: {
		 exp: 0,
		 inc: 0
		},

		budget:0,
		percentage: -1,

	};


	return {
		addItem: function(type, des, val) {
			var newItem;
			

			// Create new ID
			if (data.allItems[type].length>0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
				} else {
					ID=0;
				}
	
			//Create new item based on inc or exp
			if (type === 'exp') {
			newItem = new Expense(ID, des, val);
			} 
			else if (type === 'inc') {
			newItem = new Income(ID, des, val);
			}
			//push it into our data structure and return the new element.
			data.allItems[type].push(newItem);
			return newItem;
		},

		calculateBudget: function () {

				// calculate total income and expense
				calculateTotal('exp');
				calculateTotal('inc');

				//calculate budget: income - expenses
				data.budget = data.totals.inc - data.totals.exp;

				//calculate percentage of income that we spent
				if (data.totals.inc>0) {
					data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
				} else {
					data.percentage = -1;
				}
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			}
		},

		testing: function() {
				console.log(data);
		}
	};



})();




//UI module
var UIController = (function () {
	

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer:'.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',

	}


	//returns 2 functions, the values of userinput, and an object containing them
	return {
		getinput: function() {
			//returns as an object with all the respective user input
			return {
				type: document.querySelector(DOMstrings.inputType).value, 
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),

				//instead of returning all 3 vars, make 1 object containing them
			};
		},

		addListItem: function(obj, type) {
			

			var html, newHTML, element;
			//Create HTML string with placeholder text
			 if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };
            

			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', obj.value);


			////insert html into the dom
			 document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		},

		clearFields: function() {
			var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			var fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function (current, index, array) {
				current.value = "";
			});


			fieldsArray[0].focus();
		},

		displayBudget: function(obj) {
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
			
			if (obj.percentage>0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		getDOMstrings: function() {
				return DOMstrings;
				//for use outside the function
		},
	};

})();


//Global app controller
//central place where everything happens
var controller = (function (budgetCtrl, UICtrl) {

	// 
	var setupEventListeners = function() {
		//gives the controller module access to the DOM strings in the UI controller module
		//Only need the dom strings for event listeners
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		//Keypress "return key" thingy
		document.addEventListener('keypress', function(event) {
			//console.log(event);
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
	};



	var updateBudget = function () {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget); 

	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get input data from the getinput function in the UI controller module
		input = UIController.getinput();
		console.log(input);	

			if (input.description !== "" && !isNaN(input.value) && input.value>0) {

		// 2. Add the item to the budget controller
		newItem = budgetCtrl.addItem(input.type, input.description, input.value);

		// 3. Add the item to the UI
		UICtrl.addListItem(newItem, input.type);

		// 4. Clear the fields
		UICtrl.clearFields();

		// 5. Calculate and update budget
		updateBudget();
	}
		
};

	//Initialize the application
	return {
		init: function () {
			console.log("Application started");
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
				}); 
			setupEventListeners();
		}
	}

	
})(budgetController, UIController);


//Only line of code outside of the modules
//Calls the event listeners, which gets the data, etc...
//We have to initialize the whole thing
//Event listeners only work once we call the init function
controller.init();












