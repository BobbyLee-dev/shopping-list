/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			// To set up shopping list array in localStorage.
			this.shoppingList = util.store('shoppingList');
			// to set up template compile functions.
			this.listTemplate = Handlebars.compile($('.list-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());

			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			console.log();
			$('.new-item').on('keyup', this.create.bind(this));
			// $('#toggle-all').on('change', this.toggleAll.bind(this));
			// $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
			// $('#shopping-list')
			// 	.on('change', '.toggle', this.toggle.bind(this))
			// 	.on('dblclick', 'label', this.editingMode.bind(this))
			// 	.on('keyup', '.edit', this.editKeyup.bind(this))
			// 	.on('focusout', '.edit', this.update.bind(this))
			// 	.on('click', '.destroy', this.destroy.bind(this));
		},
		render: function () {
			var stickyItems = this.stickyItems;
			var sproutsList = this.sproutsList;
			var tjsList = this.getFilteredTjsList();
			var walmartList = this.getFilteredWalmartList();
			var miscList = this.getFilteredMiscList();
			$('#sticky-ul').html(this.listTemplate(stickyItems.filter));
			$('#sprouts-ul').html(this.listTemplate(sproutsList.filter));
			$('#traderJoes-ul').html(this.listTemplate(this.shoppingList));
			$('#walmart-ul').html(this.listTemplate(this.shoppingList));
			$('#misc-ul').html(this.listTemplate(this.shoppingList));
			// $('.main').toggle(todos.length > 0);
			// $('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			// $('.new-item').focus();

			util.store('shoppingList', this.shoppingList);
		},
		renderFooter: function () {
			var shoppingList = this.shoppingList.length;
			// var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				// activeTodoCount: activeTodoCount,
				// activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				// completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('#footer').toggle(shoppingList > 0).html(template);
		},
		// toggleAll: function (e) {
		// 	var isChecked = $(e.target).prop('checked');

		// 	this.todos.forEach(function (todo) {
		// 		todo.completed = isChecked;
		// 	});

		// 	this.render();
		// },
		// getActiveTodos: function () {
		// 	return this.todos.filter(function (todo) {
		// 		return !todo.completed;
		// 	});
		// },
		// getCompletedTodos: function () {
		// 	return this.todos.filter(function (todo) {
		// 		return todo.completed;
		// 	});
		// },

		
		stickyItems: {
			filter: function () {
				if (this.filter === 'items-left') {
					
				}

				if (this.filter === 'completed') {
					return;
				}

				return {title: 'test123'};
			}

			
		},
		sproutsList: {
			filter: function () {

				if (App.filter === 'sprouts-items-left') {
					return App.sproutsList.itemsLeft();
				}

				if (App.filter === 'sprouts-items-acquired') {
					return App.sproutsList.itemsAcquired;
				}

				return {title: 'sproutsList test'};
			},
			itemsLeft: function () {
				return App.shoppingList.filter(function (item) {
					return item.list === 'sprouts-list';
				});
			},
			itemsAcquired: function () {
				return App.shoppingList.itmesLeft.filter(function (item) {
					return item.completed;
				});
			}
		},
		getFilteredTjsList: function () {
			if (this.filter === 'active') {
				return
			}

			if (this.filter === 'completed') {
				return;
			}

			return this.todos;
		},
		getFilteredWalmartList: function () {
			if (this.filter === 'active') {
				return;
			}

			if (this.filter === 'completed') {
				return;
			}

			return this.todos;
		},
		getFilteredMiscList: function () {
			if (this.filter === 'active') {
				return;
			}

			if (this.filter === 'completed') {
				return;
			}

			return this.todos;
		}, 


		// destroyCompleted: function () {
		// 	this.todos = this.getActiveTodos();
		// 	this.filter = 'all';
		// 	this.render();
		// },
		// // accepts an element from inside the `.item` div and
		// // returns the corresponding index in the `todos` array
		// getIndexFromEl: function (el) {
		// 	var id = $(el).closest('li').data('id');
		// 	var todos = this.todos;
		// 	var i = todos.length;

		// 	while (i--) {
		// 		if (todos[i].id === id) {
		// 			return i;
		// 		}
		// 	}
		// },
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();
			var whatList = e.target.offsetParent.id;

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.shoppingList.push({
				id: util.uuid(),
		        list: whatList,
				title: val,
				completed: false
			});

			$input.val('');

			this.render();
		}
		// toggle: function (e) {
		// 	var i = this.getIndexFromEl(e.target);
		// 	this.todos[i].completed = !this.todos[i].completed;
		// 	this.render();
		// },
		// editingMode: function (e) {
		// 	var $input = $(e.target).closest('li').addClass('editing').find('.edit');
		// 	$input.val($input.val()).focus();
		// },
		// editKeyup: function (e) {
		// 	if (e.which === ENTER_KEY) {
		// 		e.target.blur();
		// 	}

		// 	if (e.which === ESCAPE_KEY) {
		// 		$(e.target).data('abort', true).blur();
		// 	}
		// },
		// update: function (e) {
		// 	var el = e.target;
		// 	var $el = $(el);
		// 	var val = $el.val().trim();

		// 	if (!val) {
		// 		this.destroy(e);
		// 		return;
		// 	}

		// 	if ($el.data('abort')) {
		// 		$el.data('abort', false);
		// 	} else {
		// 		this.todos[this.getIndexFromEl(el)].title = val;
		// 	}

		// 	this.render();
		// },
		// destroy: function (e) {
		// 	this.todos.splice(this.getIndexFromEl(e.target), 1);
		// 	this.render();
		// }
	};

	App.init();
});


// Notes;
// - Working on sproutsList > itemsAcquired method, I think it works
// but I have not updated App.bind so you cannot set the completed property to true.

// - update bind so that it works with new App
// - create sprouts footer
// - update/create rest of sprouts object.
// - explore this