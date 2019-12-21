var budgetController = (function(){

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calcPercentage= function(totalIncome) {
		if(totalIncome>0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}
		else {
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

	var data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1,
	};


	var calculateTotals = function(type) {//type is going to be income/expsnese
		var sum = 0;
		data.allItems[type].forEach(function(currentValue) {
			sum = sum + currentValue.value; 
		});
		data.totals[type] = sum;
	};

	return {

		addItem: function(type, description, value) { 
			var newItem; //creating the new item
			var ID;

			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			}else {
				ID = 0;
			}

			if (type === 'inc') {
				newItem = new Income(ID, description, value);
			}
			else if (type === 'exp') {
				newItem = new Expense(ID, description, value);
			}
			data.allItems[type].push(newItem);

			return newItem;
		},


		calculateBudget: function(){
			//Calc total incomes and expenses
			calculateTotals('inc');
			calculateTotals('exp');
			//calculate budget: inc-exp
			data.budget = data.totals.inc - data.totals.exp;

			//calc % of income to expenses
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			}
		},


		deleteItem: function(type, id) {
			var ids = data.allItems[type].map(function(current){
				return current.id;
			});
			var index = ids.indexOf(id);

			if (index!== -1) {
				data.allItems[type].splice(index, 1);
			}
		},


		calculatePercentages: function() {
			data.allItems.exp.forEach(function(currentValue){
				currentValue.calcPercentage(data.totals.inc);
			});
		},


		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(currentValue){
				return currentValue.getPercentage();
			});
			return allPerc;
		},

	}
})();




var UIController = (function(){

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month',
	};



		var formatNumber = function(num, type) {
			var numSplit, int, dec, type;

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];
			if (int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
			}

			dec = numSplit[1];

			return (type === 'exp' ? '- $' : '+ $') + int + '.' + dec;
		};


	return {

		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //will either be inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value, //gets string value from input
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value), //gets $ value from input
			};
		},


		getDOMstrings: function() { //Expose DOMStrings to be able to use in other modules. 
			return DOMstrings;
		},


		addListItem: function(obj, type) { //Adds item to UI
			var html; //delcare a var for inc/exp html types we're going to use for both types
			var newHtml; //for the replacement HTML
			var element; //Putting the replacement HTML on the UI

			//First, create placeholders based on which type it is. 
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//Replace placeholder text with actual data we recieve from the object
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			//Insert newHTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},


		clearInputFields: function() {
			var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			var fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(function(current, index, array){
				current.value = "";
			});
			fieldsArray[0].focus();
		},


		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else {
				document.querySelector(DOMstrings.percentageLabel).textContent =  '---';
			}
		},


		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},


		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

			var nodeListForEach = function(list, callback) {
				for(var i =0; i<list.length; i++) {
					callback(list[i], i)
				}
			};

			nodeListForEach(fields, function(currentValue, index){
				if(percentages[index] > 0) {
					currentValue.textContent = percentages[index] + '%';
				}
				else {
					currentValue.textContent = '---';
				}
			});
		},

		displayMonth: function() {
			var now = new Date();
			
			var monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			var month = now.getMonth();

			var year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = monthsArray[month] + ' ' + year;
		},

	};

})();




var globalAppController = (function(budgetController, UIController) {
	var DOM = UIController.getDOMstrings(); //Call DOMSTRINGS to use here
	var setupEventListeners = function() {

		document.querySelector(DOM.inputBtn).addEventListener('click', function(){
			ctrlAddItem(); //on click
		});

		document.addEventListener('keypress', function(event){ //on keypress
			if (event.keycode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		
	};

	var updateBudget = function() {
		//Calculate budget
		budgetController.calculateBudget();
		//return budget
		var budget = budgetController.getBudget();
		//display budget on UI
		UIController.displayBudget(budget);
	};


	var updatePercentages = function() {

		//Calculate percentages
		budgetController.calculatePercentages();

		//Read percentages from the budget controller
		var percentages = budgetController.getPercentages();

		//update UI with new percentages
		UIController.displayPercentages(percentages);
	}



	var ctrlAddItem = function() { //Added to use for both of the functions above, so eithr on click or enter for the green checkmark button, what happens when pressed?
	
		//1: get the field input data
		var input = UIController.getInput();
		
		if (input.description !=="" && !isNaN(input.value) && input.value>0) {
			//2: Add the item to the budget controller
			var newItem = budgetController.addItem(input.type, input.description, input.value);

			//3: add the item to the UI
			UIController.addListItem(newItem, input.type);

			//4: clear the input fields
			UIController.clearInputFields();

			//5 calculate/update.display budget on UI
			updateBudget();

			//6: calc/update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var type;
		var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID) {
			var splitID = itemID.split('-');
		
			if (splitID[0] === "income") {
				type = 'inc'; 
			} else if (splitID[0] === "exp") {
				type = 'exp';
			}
			
			var ID = parseInt(splitID[1]);


			//delete item from data structure
			budgetController.deleteItem(type, ID);
			
			//delete item from user interfcae
			UIController.deleteListItem(itemID);

			//update and display the new budget
			updateBudget();

			//calc/update percentages
			updatePercentages();
		}
	};
	



	return {

		init: function() {
			UIController.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1,
			});
			setupEventListeners();
			UIController.displayMonth();
		},

	}

})(budgetController, UIController);



globalAppController.init(); //Sets up the whole app, without this, nothing will happen
